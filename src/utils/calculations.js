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

/**
 * Estimates the leaf temperature Offset (°C) based on a thermodynamic energy balance.
 */
export const calculateEstimatedLeafTemp = (airTemp, humidity, lightType, distance = 50, airflow = 'optimal') => {
  // Enfriamiento latente por transpiración foliar (alta HR frena la evaporación)
  const rhFactor = 1 - (humidity / 100);
  const baseOffset = -3.2 * rhFactor; // Enfriamiento máximo de -3.2°C con aire seco
  
  // Calentamiento térmico radiante directo por la lámpara
  let radiantHeating = 0;
  if (lightType === 'hps') {
    radiantHeating = Math.max(0.5, 4.2 * (50 / distance));
  } else if (lightType === 'led') {
    radiantHeating = Math.max(0.1, 0.8 * (50 / distance));
  } else if (lightType === 'sun') {
    radiantHeating = Math.max(0.3, 2.5 * (50 / distance));
  }
  
  // Factor del movimiento del aire disipando la capa límite térmica
  let airflowFactor = 1.0;
  if (airflow === 'low') airflowFactor = 0.6;
  if (airflow === 'high') airflowFactor = 1.4;
  
  const calculatedOffset = (baseOffset + radiantHeating) * airflowFactor;
  return Math.min(3, Math.max(-5, calculatedOffset));
};

/**
 * Calculates the Osmotic Root Stress based on EC, DPV, and genetics.
 */
export const calculateOsmoticStress = (ec, vpd, geneticsType) => {
  const osmoticPotential = -0.036 * ec; // Potencial osmótico en MPa
  
  let accumulationMultiplier = 1.0;
  if (geneticsType === 'sativa') accumulationMultiplier = 1.15;
  if (geneticsType === 'indica') accumulationMultiplier = 0.85;
  
  // Índice de acumulación mineral en las puntas (0 a 100)
  const accumulationIndex = Math.min(100, Math.max(0, ec * vpd * 35 * accumulationMultiplier));
  
  let status = 'safe';
  let advice = 'Balance óptimo entre absorción de agua y asimilación de nutrientes.';
  
  if (accumulationIndex > 75) {
    status = 'danger';
    advice = `⚠️ PELIGRO: DPV alto (${vpd.toFixed(2)} kPa) y EC elevada (${ec.toFixed(1)} mS/cm). Evaporación masiva de agua. ¡Diluye el riego con agua pura reduciendo la EC en un 0.4 mS/cm de inmediato para evitar necrosis marginal y puntas quemadas!`;
  } else if (accumulationIndex > 50) {
    status = 'warning';
    advice = `⚠️ PRECAUCIÓN: Zona de acumulación mineral moderada. Reduce levemente la EC en tu próximo riego o eleva la humedad ambiental para suavizar la transpiración foliar.`;
  } else if (vpd < 0.5) {
    status = 'warning';
    advice = `⚠️ BAJO FLUJO: El DPV es críticamente bajo (${vpd.toFixed(2)} kPa). La corriente capilar de agua se ha detenido. Riesgo alto de deficiencias de Calcio y pudriciones apicales. Incrementa la extracción o calienta la sala.`;
  }
  
  return {
    osmoticPotential,
    accumulationIndex,
    status,
    advice
  };
};

/**
 * Calculates Photosynthetic efficiency and energy wasted based on PPFD and active stomatal conductance.
 */
export const calculatePhotosyntheticEfficiency = (gs, ppfd) => {
  if (ppfd <= 0) {
    return {
      efficiency: 0,
      wastedWattsPercent: 0,
      status: 'dark',
      text: 'Foco apagado (Fase oscura). Cero actividad fotosintética vegetal.'
    };
  }
  
  const gsOptimalRef = 380;
  const stomatalOpeningRatio = Math.min(1.0, gs / gsOptimalRef);
  
  // Eficiencia fotosintética directa
  let efficiency = stomatalOpeningRatio * 100;
  let wastedWattsPercent = 0;
  let status = 'optimal';
  let text = 'Fotosíntesis fluida: Estomas abiertos absorbiendo CO₂ de forma eficiente y constante.';
  
  if (stomatalOpeningRatio < 0.4) {
    wastedWattsPercent = Math.round((1 - stomatalOpeningRatio) * 80);
    status = 'danger';
    text = `⚠️ FOTORRESPIRACIÓN CRÍTICA: Estomas cerrados por estrés. La planta recibe fotones intensos pero no tiene CO₂ para procesar el ciclo de Calvin. ¡Baja la intensidad del panel LED al ${Math.round(stomatalOpeningRatio * 100)}% o estabiliza el DPV de inmediato!`;
  } else if (stomatalOpeningRatio < 0.75) {
    wastedWattsPercent = Math.round((1 - stomatalOpeningRatio) * 40);
    status = 'warning';
    text = `⚠️ FOTOSÍNTESIS LIMITADA: Estomas parcialmente restringidos. La absorción de CO₂ está ralentizada. Reducir levemente la potencia lumínica te ahorrará energía sin mermar la tasa de crecimiento actual.`;
  }
  
  efficiency = Math.max(10, Math.min(100, efficiency));
  
  return {
    efficiency,
    wastedWattsPercent,
    status,
    text
  };
};

/**
 * Calculates the Drying VPD (kPa) assuming leaf temperature offset is 0.
 * In dry rooms, cut flowers do not transpire actively or self-refrigerate.
 */
export const calculateDryingVPD = (temp, humidity) => {
  const vpsat = calculateVPsat(temp);
  const vpd = vpsat * (1 - humidity / 100);
  return Math.max(0, vpd);
};

/**
 * Estimates the drying rate in days based on DPV and airflow.
 * Formula: Days = 10 / VPD_dry adjusted by airflow.
 */
export const calculateDryingDays = (vpd, airflow = 'optimal') => {
  if (vpd <= 0.05) return { days: 30, status: 'danger_slow', text: '🚨 RIESGO CRÍTICO DE MOHO: Secado detenido por humedad del 100%. Riesgo inminente de Botrytis.' };
  
  let baseDays = 10 / vpd;
  
  let airflowFactor = 1.0;
  if (airflow === 'low') airflowFactor = 1.25; 
  if (airflow === 'high') airflowFactor = 0.8;  
  
  const finalDays = baseDays * airflowFactor;
  const daysVal = Math.min(30, Math.max(3, finalDays));
  
  let status = 'optimal';
  let text = 'Velocidad óptima. Proceso de secado lento y controlado (10-14 días), ideal para descomponer la clorofila sin perder terpenos.';
  
  if (daysVal < 7) {
    status = 'danger_fast';
    text = '⚡ SECADO DEMASIADO ACELERADO: Las flores se secarán muy rápido (menos de 7 días). La clorofila quedará atrapada (sabor amargo a pasto) y perderás terpenos valiosos.';
  } else if (daysVal >= 7 && daysVal < 10) {
    status = 'warning_fast';
    text = '⚠️ SECADO RÁPIDO: Velocidad al límite aceptable. Si es posible, aumenta levemente la humedad o baja el flujo de aire para prolongar el curado.';
  } else if (daysVal > 16 && daysVal <= 20) {
    status = 'warning_slow';
    text = '⚠️ SECADO LENTO: Humedad alta. Las flores tardarán más de 16 días en secarse. Monitorea brotes y ventila para evitar bolsas de aire estancado.';
  } else if (daysVal > 20) {
    status = 'danger_slow';
    text = '🚨 RIESGO CRÍTICO DE MOHO: Secado extremadamente lento. Mayor a 20 días. Riesgo severo de Botrytis y pudrición de cogollos. Sube la temperatura o enciende un deshumidificador.';
  }
  
  return {
    days: daysVal,
    status,
    text
  };
};



