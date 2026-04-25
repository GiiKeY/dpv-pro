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
  if (vpd < 0.4) return { label: 'Peligro (Bajo)', color: '#FF4D4D' };
  if (vpd >= 0.4 && vpd < 0.8) return { label: 'Esquejes/Plantines', color: '#00FF88' };
  if (vpd >= 0.8 && vpd < 1.2) return { label: 'Vegetativo', color: '#00FF88' };
  if (vpd >= 1.2 && vpd < 1.6) return { label: 'Floración', color: '#00FF88' };
  if (vpd >= 1.6 && vpd < 2.0) return { label: 'Estrés Hídrico', color: '#FFD600' };
  return { label: 'Peligro (Alto)', color: '#FF4D4D' };
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
