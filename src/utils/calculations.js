/**
 * Calculates the Saturated Vapor Pressure (VPsat) in kPa
 * Standard Tetens Formula
 */
export const calculateVPsat = (temp) => {
  return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
};

/**
 * Calculates the Vapor Pressure Deficit (VPD) in kPa
 */
export const calculateVPD = (airTemp, humidity, leafTempOffset = -2) => {
  const leafTemp = airTemp + leafTempOffset;
  const vpsatLeaf = calculateVPsat(leafTemp);
  const vpsatAir = calculateVPsat(airTemp);
  const vpair = vpsatAir * (humidity / 100);
  
  const vpd = vpsatLeaf - vpair;
  return Math.max(0, vpd); 
};

/**
 * Returns smart advice based on standard cannabis ranges
 */
export const getSmartAdvice = (currentVpd, temp, humidity, targetMin = 0.8, targetMax = 1.2) => {
  if (currentVpd >= targetMin && currentVpd <= targetMax) {
    return "¡Perfecto! Tu cultivo está en el rango ideal. Las plantas están transpirando de forma óptima.";
  }

  if (currentVpd < targetMin) {
    const diff = targetMin - currentVpd;
    return `DPV Bajo (${currentVpd.toFixed(2)}). Riesgo de estancamiento y hongos. Para subirlo: Aumenta la temperatura o baja la humedad (${Math.abs(diff * 10).toFixed(0)}% aprox).`;
  }

  if (currentVpd > targetMax) {
    const diff = currentVpd - targetMax;
    return `DPV Alto (${currentVpd.toFixed(2)}). Estrés hídrico detectado. Para bajarlo: Baja la temperatura o aumenta la humedad (${Math.abs(diff * 10).toFixed(0)}% aprox).`;
  }
};

/**
 * Categorizes the VPD value
 */
export const getVPDStatus = (vpd) => {
  if (vpd <= 0.1) return { label: 'Peligro (Rocío)', color: '#FF4D4D' };
  if (vpd > 0.1 && vpd < 0.4) return { label: 'Humedad Excesiva', color: '#FFD600' };
  if (vpd >= 0.4 && vpd < 0.8) return { label: 'Esquejes/Plantines', color: '#00FF88' };
  if (vpd >= 0.8 && vpd < 1.2) return { label: 'Vegetativo', color: '#00FF88' };
  if (vpd >= 1.2 && vpd < 1.6) return { label: 'Floración', color: '#00FF88' };
  if (vpd >= 1.6 && vpd < 2.0) return { label: 'Estrés Hídrico', color: '#FFD600' };
  return { label: 'Peligro (Seco)', color: '#FF4D4D' };
};

/**
 * Generates full data for the interactive table (100% to 0%)
 */
export const generateTableData = (tempRange, leafOffset) => {
  const data = [];
  // Humedades de 100 a 0 en pasos de 5
  const hums = Array.from({ length: 21 }, (_, i) => 100 - i * 5);
  
  for (let t = tempRange.max; t >= tempRange.min; t -= 0.5) {
    const row = { temp: t, values: [] };
    for (const h of hums) {
      const vpd = calculateVPD(t, h, leafOffset);
      row.values.push({ humidity: h, vpd: vpd.toFixed(2), status: getVPDStatus(vpd) });
    }
    data.push(row);
  }
  return data;
};

/**
 * Calculates the ideal relative humidity (%) to achieve a target VPD (kPa)
 * given the air temperature and leaf offset.
 */
export const calculateIdealHumidity = (airTemp, leafOffset, targetVpd) => {
  const leafTemp = airTemp + leafOffset;
  const vpsatLeaf = calculateVPsat(leafTemp);
  const vpsatAir = calculateVPsat(airTemp);
  
  // VPD = vpsatLeaf - vpsatAir * (RH / 100)
  // vpsatAir * (RH / 100) = vpsatLeaf - VPD
  // RH = 100 * (vpsatLeaf - VPD) / vpsatAir
  const idealRH = (100 * (vpsatLeaf - targetVpd)) / vpsatAir;
  
  // Restringir a valores realistas entre 20% y 95%
  return Math.min(95, Math.max(20, idealRH));
};

/**
 * Calculates the Dew Point temperature (°C) using the Magnus-Tetens formula.
 */
export const calculateDewPoint = (temp, humidity) => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
};

/**
 * Predicts the night relative humidity (%) after lights off.
 * Assumes absolute moisture remains relatively constant.
 */
export const predictNightRH = (dayTemp, dayRH, tempDrop) => {
  const nightTemp = dayTemp - tempDrop;
  const vpsatDay = calculateVPsat(dayTemp);
  const vpDay = vpsatDay * (dayRH / 100);
  const vpsatNight = calculateVPsat(nightTemp);
  
  // RH_night = 100 * vpDay / vpsatNight
  const predictedRH = (vpDay / vpsatNight) * 100;
  return Math.min(100, Math.max(0, predictedRH));
};

/**
 * Estimates daily transpirative water demand in liters based on DPV, plants count, pot size, stage factor, substrate factor, LAI, and Kc.
 */
export const calculateEvapotranspiration = (
  plantsCount, 
  potSize, 
  vpd, 
  stageMultiplier = 1.0, 
  substrateMultiplier = 1.0,
  lai = 2.0,
  kc = 1.0
) => {
  // Base física: 0.04L por litro de maceta por 1.0 kPa de DPV, escalado dinámicamente por LAI y Kc
  const liters = plantsCount * potSize * 0.04 * vpd * stageMultiplier * substrateMultiplier * (lai / 2.0) * kc;
  return Math.max(0, liters);
};

/**
 * Estimates the watering frequency in days based on pot size, substrate, and daily transpiration per plant.
 */
export const calculateWateringFrequency = (potSize, dailyTranspirationPerPlant, substrateType) => {
  if (dailyTranspirationPerPlant <= 0) return { days: 0, text: 'N/A' };
  
  let retentionFactor = 0.30; // Suelo / Turba por defecto (30% retención de agua)
  let usableThreshold = 0.50;  // 50% de la capacidad de campo utilizable antes del riego
  
  if (substrateType === 'coco') {
    retentionFactor = 0.40; // El coco retiene un 40% de agua pero es muy aireado
    usableThreshold = 0.35;  // Se seca un 35% de la capacidad de agua retenida
  } else if (substrateType === 'hydro') {
    return { days: 0, text: 'Circulación Continua' };
  }
  
  const totalWaterCapacity = potSize * retentionFactor; // Litros totales de agua retenidos
  const usableWater = totalWaterCapacity * usableThreshold; // Litros que la planta puede absorber de forma segura
  
  const frequencyDays = usableWater / dailyTranspirationPerPlant;
  
  if (frequencyDays < 1) {
    const dailyRiegos = 1 / frequencyDays;
    return { 
      days: frequencyDays, 
      text: `${dailyRiegos.toFixed(1)} riegos por día` 
    };
  }
  
  return { 
    days: frequencyDays, 
    text: `Cada ${frequencyDays.toFixed(1)} días` 
  };
};

/**
 * Calculates the Stomatal Conductance (gs) in mmol/m²/s using an empirical physiological model.
 * Model: gs = g0 + [gmax / (1 + sensitivity * VPD)] * [PAR / (PAR + 150)]
 */
export const calculateStomatalConductance = (vpd, lightIntensity, archetypeType) => {
  const g0 = 15; // Conductancia mínima residual nocturna
  let gmax = 380;
  let sensitivity = 0.6;

  if (archetypeType === 'sativa') {
    gmax = 450;
    sensitivity = 0.4; // Menos sensibles a DPV moderados, alta transpiración
  } else if (archetypeType === 'indica') {
    gmax = 320;
    sensitivity = 0.8; // Muy sensibles, cierran estomas rápido para conservar agua
  } else if (archetypeType === 'ruderalis') {
    gmax = 350;
    sensitivity = 0.5;
  }

  // Factor de luz (efecto de la radiación PAR sobre la fotosíntesis y apertura estomática)
  const lightFactor = lightIntensity / (lightIntensity + 150);

  // Conductancia
  const gs = g0 + (gmax / (1 + sensitivity * Math.max(0, vpd))) * lightFactor;
  return Math.min(gmax, Math.max(g0, gs));
};

/**
 * Calculates the Transpiration Rate (E) in mmol/m²/s based on Stomatal Conductance and VPD.
 * Equation: E = gs * (VPD / Patm) where Patm is atmospheric pressure (101.3 kPa).
 */
export const calculateTranspirationRate = (gs, vpd) => {
  const Patm = 101.325; // kPa
  const E = gs * (Math.max(0, vpd) / Patm);
  return E;
};


