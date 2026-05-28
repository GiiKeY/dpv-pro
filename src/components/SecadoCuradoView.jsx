import { Package, Leaf, AlertTriangle, Sparkles, Activity } from 'lucide-react';

function SecadoCuradoView({
  dryTemp,
  setDryTemp,
  dryHumidity,
  setDryHumidity,
  dryAirflow,
  setDryAirflow,
  dryingWetWeight,
  setDryingWetWeight,
  dryingLog,
  dryingWeightInput,
  setDryingWeightInput,
  handleAddDryingLog,
  handleLoadDemoDryingLog,
  handleResetDryingLog,
  handleDeleteDryingLog,
  isPremium,
  calculateDryingVPD,
  calculateDryingDays
}) {
  const dryingVpd = calculateDryingVPD(dryTemp, dryHumidity);
  const dryingDaysData = calculateDryingDays(dryingVpd, dryAirflow);
  
  // Kinetic decay calculations
  const lastLog = dryingLog.length > 0 ? dryingLog[dryingLog.length - 1] : null;
  const currentWeight = lastLog ? lastLog.weight : dryingWetWeight;
  const drySolids = dryingWetWeight * 0.20;
  const targetWeight = drySolids / 0.89; // Weight at 11% moisture
  const remainingMoisturePercent = Math.max(0, Math.min(80, currentWeight > drySolids ? ((currentWeight - drySolids) / currentWeight) * 100 : 0));
  
  // Progress of water decay (80% moisture is 0% progress, 11% moisture is 100% progress)
  const progressPercent = Math.max(0, Math.min(100, ((80 - remainingMoisturePercent) / (80 - 11)) * 100));

  // Loss speed calculation (average grams per day)
  let dailyLossRate = 0;
  if (dryingLog.length > 0) {
    let previousWeight = dryingWetWeight;
    let sumLoss = 0;
    dryingLog.forEach((log) => {
      sumLoss += (previousWeight - log.weight);
      previousWeight = log.weight;
    });
    dailyLossRate = sumLoss / dryingLog.length;
  }

  let daysLeft = null;
  if (dailyLossRate > 0 && currentWeight > targetWeight) {
    daysLeft = Math.ceil((currentWeight - targetWeight) / dailyLossRate);
  }

  let dryingStatus;
  if (dryingVpd < 0.60) {
    dryingStatus = { label: 'Riesgo Crítico (Condensación / Moho)', color: '#FF4D4D' };
  } else if (dryingVpd >= 0.60 && dryingVpd < 0.85) {
    dryingStatus = { label: 'Secado Lento (Riesgo de Humedad)', color: '#FFD600' };
  } else if (dryingVpd >= 0.85 && dryingVpd <= 0.95) {
    dryingStatus = { label: 'Secado Óptimo (Preservación Perfecta)', color: '#00FF88' };
  } else if (dryingVpd > 0.95 && dryingVpd <= 1.20) {
    dryingStatus = { label: 'Secado Acelerado (Pérdida de Aromas)', color: '#FFA500' };
  } else {
    dryingStatus = { label: 'Secado Crítico (Flores Crujientes / Amargas)', color: '#FF4D4D' };
  }

  // Kinetic alert conditions
  const showMoldAlert = dryingVpd < 0.60 || (dryingLog.length > 12 && remainingMoisturePercent > 20);
  const showFastAlert = dryingLog.length < 6 && remainingMoisturePercent <= 14;
  const showOptimalAlert = dryingVpd >= 0.85 && dryingVpd <= 0.95 && !showFastAlert && !showMoldAlert;

  // Calculate average moisture loss percent per day
  let averageDailyLossPercent = 0;
  if (dryingLog.length > 0) {
    const firstMoisture = 80;
    averageDailyLossPercent = (firstMoisture - remainingMoisturePercent) / dryingLog.length;
  }

  // Synergy Advice Engine
  let synergyAdvice;
  if (dryingLog.length === 0) {
    if (dryingVpd < 0.60) {
      synergyAdvice = {
        title: '⚠️ DPV Ambiental Críticamente Bajo (Estancamiento)',
        desc: 'El DPV de la sala está por debajo de 0.60 kPa. El aire no tiene capacidad física para absorber más vapor de agua. Si cuelgas las plantas en estas condiciones, se estancará la transpiración tisular, promoviendo la germinación de mohos.',
        action: 'Aumenta la temperatura +2.0°C o reduce la Humedad Relativa -10% de inmediato para sacar la sala del rango de peligro.'
      };
    } else if (dryingVpd > 1.10) {
      synergyAdvice = {
        title: '⚠️ DPV Ambiental Críticamente Alto (Evaporación Excesiva)',
        desc: 'El aire está demasiado seco. Extraerá el agua superficial de los cogollos tan rápido que causará el sellado capilar exterior (secado de cáscara), atrapando el agua en el centro.',
        action: 'Reduce la temperatura o incrementa la Humedad Relativa +5% para amortiguar el gradiente osmótico.'
      };
    } else {
      synergyAdvice = {
        title: '📈 Parámetros Ambientales Iniciales Óptimos',
        desc: 'Tu sala mantiene un DPV inicial adecuado para la post-cosecha. Registra tu primer peso de muestra diario para activar el motor de sinergia cinética interactiva.',
        action: 'Mantén los parámetros estables y cuelga la rama muestra en la zona media de la sala.'
      };
    }
  } else {
    if (averageDailyLossPercent > 9 && dryingVpd > 0.95) {
      synergyAdvice = {
        title: '🔥 ALERTA DE SINERGIA: Evaporación Cinética Acelerada',
        desc: `Tus cogollos están perdiendo humedad de forma muy acelerada (promedio de ${averageDailyLossPercent.toFixed(1)}% diario). Esto causa el colapso celular y volatiliza los aceites esenciales más delicados del tricoma de forma irreversible.`,
        action: '🌡️ Reduce la temperatura -2.0°C en tu climatizador y 💧 sube la Humedad Relativa +5% para desacelerar la transpiración celular.'
      };
    } else if (averageDailyLossPercent < 3.5 && dryingVpd < 0.75) {
      synergyAdvice = {
        title: '❄️ ALERTA DE SINERGIA: Transpiración Celular Estancada',
        desc: `La tasa de secado es demasiado lenta (promedio de ${averageDailyLossPercent.toFixed(1)}% de humedad diario) debido a la baja energía térmica de la sala. Esto favorece la germinación interna de Botrytis por acumulación de agua libre en los cálices.`,
        action: '🌡️ Eleva la temperatura +1.5°C (máximo 20°C) o 💧 reduce la Humedad Relativa -5% para infundir energía térmica al aire y estimular la ósmosis vegetal.'
      };
    } else if (averageDailyLossPercent < 2 && dryingVpd > 1.10) {
      synergyAdvice = {
        title: '⚠️ ALERTA DE SINERGIA: Secado de Cáscara (Case Hardening) Detectado',
        desc: '¡Riesgo Fisiológico Mayor! La tasa de pérdida hídrica se ha estancado casi por completo (menos del 2% diario), a pesar de que el DPV de la sala es muy alto. El tejido exterior de las flores se ha resecado abruptamente debido al aire cálido o seco, sellando los capilares estomáticos y atrapando el agua en el centro del cogollo, lo que causará fermentación ácida interna.',
        action: '🌬️ Reduce la ventilación a Flujo Suave y 💧 sube la Humedad Relativa a 60% por 24-48 horas. Esto rehidratará la cáscara del cogollo, permitiendo que la humedad central vuelva a transpirar equilibradamente.'
      };
    } else {
      synergyAdvice = {
        title: '✨ SINERGIA TERMODINÁMICA ÓPTIMA (Equilibrio Post-Cosecha)',
        desc: `¡Felicidades! La velocidad de deshidratación molecular de tus cogollos (pérdida de ${averageDailyLossPercent.toFixed(1)}% diaria) se encuentra en perfecta sintonía termodinámica con el DPV de tu sala (${dryingVpd.toFixed(2)} kPa).`,
        action: 'Conserva los sliders actuales sin modificaciones. La descarboxilación de clorofila y la retención terpénica se están ejecutando con precisión biológica ideal.'
      };
    }
  }

  return (
    <section className="pro-tools-view glass" style={{ padding: '30px', animation: 'fadeIn 0.5s ease', marginBottom: '25px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 className="glow-text" style={{ fontSize: '2rem', color: '#00FF88', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Package size={28} className="icon-pulse" /> Estimador de Secado Cinético & Curado DPV
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.5' }}>
          Monitoreo de deshidratación en post-cosecha basado en termodinámica avanzada. La pérdida diaria de masa de agua predice de forma exacta el umbral óptimo del 10-12% de humedad interna para el enfrascado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        {/* COLUMNA 1: VARIABLES Y CONFIGURACIÓN */}
        <div className="glow-border" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
            ⚙️ Control Ambiental de la Sala
          </h3>

          {/* Slider de Temperatura */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span>Temperatura de Secado:</span>
              <strong style={{ color: '#FF4D4D', fontSize: '1rem' }}>{dryTemp.toFixed(1)}°C</strong>
            </label>
            <input 
              type="range" 
              min="10" 
              max="28" 
              step="0.5" 
              value={dryTemp} 
              onChange={(e) => setDryTemp(parseFloat(e.target.value))} 
            />
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>Frío (Terpenos OK): 15°C</span>
              <span>Riesgo Evaporación: &gt;20°C</span>
            </span>
          </div>

          {/* Slider de Humedad */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span>Humedad Relativa (HR):</span>
              <strong style={{ color: '#00FF88', fontSize: '1rem' }}>{dryHumidity}%</strong>
            </label>
            <input 
              type="range" 
              min="30" 
              max="85" 
              step="1" 
              value={dryHumidity} 
              onChange={(e) => setDryHumidity(parseInt(e.target.value))} 
            />
            <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>Secado Acelerado: &lt;45%</span>
              <span>Peligro de Moho: &gt;65%</span>
            </span>
          </div>

          {/* Flujo de aire */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
              Ventilación / Movimiento de Aire:
            </label>
            <select 
              value={dryAirflow} 
              onChange={(e) => setDryAirflow(e.target.value)} 
              style={{ 
                width: '100%', 
                background: 'rgba(0,0,0,0.5)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#fff', 
                padding: '10px 14px', 
                borderRadius: '10px', 
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="low">Flujo Suave / Extracción Mínima (Máxima retención aromática)</option>
              <option value="optimal">Flujo Óptimo / Circulación Indirecta (Recomendado)</option>
              <option value="high">Flujo Fuerte / Renovación Activa (Secado rápido)</option>
            </select>
          </div>

          {/* Configuración Lote de Secado Cinético (Peso Húmedo) */}
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: '#00FF88' }}>
              <span>⚖️ Lote Secado (Rama Test):</span>
              <span>{dryingWetWeight} g (Fresco)</span>
            </label>
            <input 
              type="range" 
              min="50" 
              max="1500" 
              step="10" 
              value={dryingWetWeight} 
              onChange={(e) => setDryingWetWeight(parseInt(e.target.value))}
              disabled={dryingLog.length > 0}
              style={{ opacity: dryingLog.length > 0 ? 0.5 : 1 }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>
              {dryingLog.length > 0 ? (
                <span style={{ color: '#FFA500' }}>🔒 Bloqueado mientras el diario tenga registros.</span>
              ) : (
                "Ajusta el peso en fresco inicial de la rama muestra."
              )}
            </span>
          </div>

          {/* MONITOR ACTIVO DE VOLATILIZACIÓN DE TERPENOS */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 Monitor Activo de Terpenos
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Mirceno */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Mirceno</strong> 
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', marginLeft: '4px' }}>(Floral / Herbal - Sensible a &gt;18°C)</span>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  background: dryTemp <= 18 ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 214, 0, 0.08)',
                  color: dryTemp <= 18 ? '#00FF88' : '#FFD600',
                  border: dryTemp <= 18 ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 214, 0, 0.15)'
                }}>
                  {dryTemp <= 18 ? '🛡️ Conservado' : '⚠️ Evaporándose'}
                </span>
              </div>
              
              {/* Limoneno */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Limoneno</strong> 
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', marginLeft: '4px' }}>(Cítrico / Fresco - Sensible a &gt;21°C)</span>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  background: dryTemp <= 21 ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 165, 0, 0.08)',
                  color: dryTemp <= 21 ? '#00FF88' : '#FFA500',
                  border: dryTemp <= 21 ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 165, 0, 0.15)'
                }}>
                  {dryTemp <= 21 ? '🛡️ Conservado' : '⚠️ Pérdida Leve'}
                </span>
              </div>

              {/* Linalool */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Linalool</strong> 
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', marginLeft: '4px' }}>(Floral / Lavanda - Sensible a &gt;23°C)</span>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  background: dryTemp <= 23 ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 77, 77, 0.08)',
                  color: dryTemp <= 23 ? '#00FF88' : '#FF4D4D',
                  border: dryTemp <= 23 ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 77, 77, 0.15)'
                }}>
                  {dryTemp <= 23 ? '🛡️ Conservado' : '⚠️ Degradación'}
                </span>
              </div>

              {/* Beta-Cariofileno */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Cariofileno</strong> 
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', marginLeft: '4px' }}>(Pimienta / Herbal - Sensible a &gt;25°C)</span>
                </div>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '0.6rem',
                  background: dryTemp <= 25 ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 77, 77, 0.15)',
                  color: dryTemp <= 25 ? '#00FF88' : '#FF4D4D',
                  border: dryTemp <= 25 ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 77, 77, 0.3)'
                }}>
                  {dryTemp <= 25 ? '🛡️ Conservado' : '⚠️ Pérdida Crítica'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: PANTALLA NEÓN Y OPTIMIZADOR CINÉTICO */}
        <div className="glow-border" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
            📊 Diagnóstico Termodinámico & Humedad Tisular
          </h3>

          {/* Gran Display de DPV y Humedad en rejilla */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                DPV SECADO
              </span>
              <strong style={{ fontSize: '2rem', color: dryingStatus.color, textShadow: `0 0 15px ${dryingStatus.color}22`, fontFamily: 'monospace' }}>
                {dryingVpd.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>kPa</span>
              </strong>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                HUMEDAD CELULAR
              </span>
              <strong style={{ fontSize: '2rem', color: remainingMoisturePercent < 12 ? '#FF4D4D' : remainingMoisturePercent <= 20 ? '#00FF88' : '#00DFFF', textShadow: '0 0 15px rgba(0,255,136,0.1)', fontFamily: 'monospace' }}>
                {remainingMoisturePercent.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Neón Gauge de Pérdida de Masa Hídrica (Decay Bar) */}
          <div className="drying-gauge-container">
            <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📉 Curva Cinética del Contenido Hídrico
            </span>
            
            <div className="drying-gauge-track">
              <div 
                className="drying-gauge-marker" 
                style={{ left: `${progressPercent}%` }}
                title={`Humedad: ${remainingMoisturePercent.toFixed(1)}%`}
              />
            </div>

            <div className="drying-gauge-labels">
              <div className="drying-gauge-label-item">
                <span>80%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Fresco</span>
              </div>
              <div className="drying-gauge-label-item">
                <span>40%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Fase Media</span>
              </div>
              <div className="drying-gauge-label-item optimal">
                <span>11%</span>
                <span style={{ fontSize: '0.65rem', color: '#00ff88', fontWeight: 'bold' }}>CURADO</span>
              </div>
              <div className="drying-gauge-label-item">
                <span>0%</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Seco</span>
              </div>
            </div>
          </div>

          {/* Formulario del Historial Diario */}
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fff', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
              ✍️ Registrar Peso Total Absoluto de la Muestra
            </span>
            <span style={{ fontSize: '0.7rem', color: '#ff9f43', display: 'block', marginBottom: '10px', lineHeight: '1.3' }}>
              ⚠️ <strong>Instrucción:</strong> Ingresa el peso TOTAL absoluto de la rama hoy (ej. 580 g). <strong>NO</strong> ingreses la pérdida de gramos (ej. 20 g).
            </span>
            
            {/* Fila 1: Caja de texto (Ancho Completo) */}
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="number" 
                placeholder={`Ej: ${Math.round(currentWeight * 0.96)} g (Peso Absoluto)`}
                value={dryingWeightInput}
                onChange={(e) => setDryingWeightInput(e.target.value)}
                style={{ 
                  width: '100%', 
                  boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.5)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Fila 2: Botones de Acción */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button 
                onClick={handleAddDryingLog}
                className="console-btn-glow"
                style={{ 
                  flex: '2 1 180px', 
                  background: '#00FF88', 
                  color: '#050805', 
                  padding: '12px 20px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📥 Guardar Peso Diario
              </button>
              <button 
                onClick={handleLoadDemoDryingLog}
                style={{ 
                  flex: '1 1 120px',
                  background: 'rgba(255, 214, 0, 0.05)', 
                  border: '1px solid rgba(255, 214, 0, 0.2)',
                  color: '#FFD600', 
                  padding: '12px 15px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🧬 Cargar Demo
              </button>
            </div>
            
            {/* Fila 3: Botón de Reset */}
            {dryingLog.length > 0 && (
              <button 
                onClick={handleResetDryingLog}
                style={{ 
                  width: '100%',
                  background: 'rgba(255, 77, 77, 0.05)', 
                  border: '1px solid rgba(255, 77, 77, 0.2)',
                  color: '#FF4D4D', 
                  padding: '8px 15px', 
                  borderRadius: '10px', 
                  fontSize: '0.78rem', 
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 Reiniciar Diario de Secado
              </button>
            )}
          </div>

          {/* Estado Proyectado */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Secado Total Estimado:</span>
              <strong style={{ fontSize: '1.2rem', color: '#00F0FF', fontFamily: 'monospace' }}>
                ~{Math.round(dryingDaysData.days)} días
              </strong>
            </div>

            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ 
                width: `${Math.min(100, (dryingDaysData.days / 20) * 100)}%`, 
                height: '100%', 
                backgroundColor: '#00F0FF',
                boxShadow: '0 0 8px #00F0FF',
                transition: 'width 0.4s ease-out' 
              }} />
            </div>
            
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {dryingDaysData.text}
              {daysLeft !== null && (
                <span style={{ display: 'block', color: '#00FF88', marginTop: '6px', fontWeight: 'bold' }}>
                  ⚡ Sinergia Estimada: Faltan aproximadamente {daysLeft} días a este ritmo para enfrascar.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE ADVERTENCIAS Y BIOLOGÍA */}
      <div style={{ marginTop: '30px' }}>
        {dryTemp > 20 && (
          <div style={{ background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <AlertTriangle color="#FF4D4D" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <strong style={{ color: '#FF4D4D', fontSize: '0.85rem' }}>⚠️ ALERTA DE VOLATILIZACIÓN DE TERPENOS:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                La temperatura de tu sala de secado es de <strong>{dryTemp.toFixed(1)}°C</strong>. Por encima de los 20°C, los terpenos más volátiles y valiosos (como el mirceno y el limoneno) se evaporan rápidamente en el aire, mermando permanentemente la fragancia, el sabor y la potencia de tu cosecha. Se recomienda enfriar el ambiente.
              </p>
            </div>
          </div>
        )}

        {showMoldAlert && (
          <div style={{ background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <AlertTriangle color="#FF4D4D" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <strong style={{ color: '#FF4D4D', fontSize: '0.85rem' }}>⚠️ ALERTA DE RIESGO DE MOHOS Y BOTRYTIS (EVAPORACIÓN ESTANCADA):</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                La sala de secado tiene un DPV de <strong>{dryingVpd.toFixed(2)} kPa</strong> o el secado se ha prolongado por más de 12 días sin alcanzar la humedad de curado. Bajo estas condiciones de estancamiento de vapor, la actividad de agua tisular permanece peligrosamente alta en las flores compactas, permitiendo que las esporas fúngicas de la *Botrytis cinerea* germinen y devoren los cogollos desde su interior. Se recomienda reducir la Humedad Relativa al 55%, aumentar la extracción de aire indirecta y enfríar el ambiente si supera los 20°C.
              </p>
            </div>
          </div>
        )}

        {showFastAlert && (
          <div style={{ background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <AlertTriangle color="#FFD600" style={{ flexShrink: 0, marginTop: '2px' }} size={22} />
            <div>
              <strong style={{ color: '#FFD600', fontSize: '0.85rem' }}>⚠️ ALERTA DE SECADO ARREBATADO (SABOR A PASTO & VOLATILIZACIÓN CRÍTICA):</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Tus flores han alcanzado el rango de curado ({remainingMoisturePercent.toFixed(1)}% de humedad) en menos de 6 días. Este secado ultra-rápido colapsa las membranas celulares, atrapando la **clorofila ácida** en el interior del tejido e impidiendo que las enzimas la descompongan naturalmente. Asimismo, este proceso volatiliza por completo monoterpenos valiosos y ligeros (como el mirceno y el limoneno), resultando en cogollos secos con fuerte aroma a césped y un humo áspero e irritante al paladar.
              </p>
            </div>
          </div>
        )}

        {showOptimalAlert && (
          <div style={{ background: 'rgba(0, 255, 136, 0.06)', border: '1px solid rgba(0, 255, 136, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <Sparkles color="#00FF88" style={{ flexShrink: 0, marginTop: '2px' }} size={22} className="icon-pulse" />
            <div>
              <strong style={{ color: '#00FF88', fontSize: '0.85rem' }}>✨ CURVA CINÉTICA ÓPTIMA (SECADO CIENTÍFICO DE ALTA GAMA):</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Tu sala opera en el rango dorado de DPV: <strong>{dryingVpd.toFixed(2)} kPa</strong>. La presión de vapor de agua permite una transpiración vegetal progresiva y balanceada de adentro hacia afuera de los cogollos. Esto proporciona la humedad celular y el tiempo exactos para que los procesos catabólicos celulares desintegren la clorofila por completo, logrando flores curadas con ceniza blanca purísima, terpenos intactos a su máximo esplendor aromático y una experiencia al fumar sumamente tersa y limpia.
              </p>
            </div>
          </div>
        )}

        {/* Explicación de Fisiología Vegetal */}
        <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.05)', padding: '20px', borderRadius: '14px' }}>
          <strong style={{ color: '#00FF88', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Leaf size={16} /> Dinámica Celular: Equilibrio Osmótico de Post-Cosecha
          </strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Durante el secado, el tallo central actúa como un acumulador de agua que recarga las flores a medida que estas evaporan humedad de sus capas más superficiales. El control termodinámico evita el secado de cáscara (donde el exterior está crujiente pero el interior permanece húmedo). Mantener un DPV constante de <strong>0.9 kPa</strong> asegura que la velocidad de evaporación externa coincida exactamente con la velocidad de migración osmótica capilar del tallo a los cálices, preservando la resina y evitando la pudrición fúngica.
          </p>
        </div>
      </div>

      {/* ASESORÍA DE SINERGIA TERMODINÁMICA */}
      <div style={{ marginTop: '30px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,223,255,0.15)', background: 'linear-gradient(135deg, rgba(0, 223, 255, 0.03), rgba(0,0,0,0.5))', boxShadow: '0 8px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(0, 223, 255, 0.01)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#00DFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧠 Asesoría de Sinergia Termodinámica (Clima x Cinética)
        </h3>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
            {synergyAdvice.title}
          </strong>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            {synergyAdvice.desc}
          </p>
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(0, 223, 255, 0.05)', borderLeft: '3px solid #00DFFF', fontSize: '0.78rem', color: '#00DFFF', fontWeight: 'bold' }}>
            💡 Acción Recomendada: {synergyAdvice.action}
          </div>
        </div>

        {/* Explicación Técnica para Cultivadores */}
        <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0, 223, 255, 0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', marginTop: '20px' }}>
          <strong style={{ color: '#00DFFF', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} style={{ color: '#00DFFF' }} /> 📖 Compendio de Fisiología Post-Cosecha (Ciencia del Curado)
          </strong>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            El secado no es un simple descarte de agua; es una <strong>fase metabólica activa</strong>. Las células vegetales de tus cogollos continúan vivas e intentan respirar durante las primeras 96 a 120 horas tras el corte. A continuación, se detalla la dinámica celular y por qué la sinergia climática es determinante para el éxito de la cosecha:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            
            {/* Batería Hídrica */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(0, 255, 136, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ color: '#00FF88', fontWeight: 'bold', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔋 1. Tallo como Regulador Osmótico
              </span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                El tallo central actúa como una "reserva hídrica activa". A medida que los cálices exteriores pierden agua por evaporación, la tensión capilar arrastra agua del tallo hacia las flores por osmosis. Si el DPV ambiental coincide con este flujo tisular interno (secado lento), las flores se deshidratan de adentro hacia afuera, garantizando un secado homogéneo y la conservación de la densidad floral.
              </p>
            </div>

            {/* Catabolismo de Clorofila */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 214, 0, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ color: '#FFD600', fontWeight: 'bold', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🧪 2. Metabolismo de la Clorofila
              </span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Las enzimas que degradan la clorofila (que da sabor a césped e irrita la garganta) requieren agua líquida intracelular libre para funcionar. Si el secado se apresura (pérdida diaria &gt; 10%), las células mueren por deshidratación extrema antes de que estas enzimas terminen de catabolizar la clorofila. Esto la atrapa en el tejido de forma ácida, arruinando el perfil terpénico de las flores.
              </p>
            </div>

            {/* Colapso Capilar / Case Hardening */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 77, 77, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ color: '#FF4D4D', fontWeight: 'bold', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚧 3. Case Hardening (Sello Capilar)
              </span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Si el DPV ambiental supera los 1.15 kPa o hay flujo de aire directo fuerte, el agua superficial se evapora más rápido de lo que el tallo puede suministrarla. Esto causa que los poros exteriores colapsen y se encojan, formando una costra impermeable ("secado de cáscara"). El agua residual queda atrapada en el núcleo, fermentándose y propiciando la pudrición fúngica interna.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* HISTORIAL DIARIO DETALLADO */}
      {dryingLog.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
            📅 Historial de Deshidratación Diaria Registrada
          </span>
          
          <table className="drying-log-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Fecha de Control</th>
                <th>Peso (g)</th>
                <th>Pérdida Diaria (g)</th>
                <th>Humedad Tisular</th>
                <th>Agua Perdida Acumulada</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dryingLog.map((log, index) => {
                const prevWeight = index === 0 ? dryingWetWeight : dryingLog[index - 1].weight;
                const loss = prevWeight - log.weight;
                const rowMoisture = log.weight > drySolids ? ((log.weight - drySolids) / log.weight) * 100 : 0;
                const accumWaterLost = dryingWetWeight - log.weight;
                const accumWaterLostPct = (accumWaterLost / dryingWetWeight) * 100;
                
                const lossPercentOfPrev = prevWeight > 0 ? (loss / prevWeight) * 100 : 0;
                let lossBadge = { text: 'Estable', color: '#00FF88', bg: 'rgba(0, 255, 136, 0.1)' };
                if (lossPercentOfPrev > 12) {
                  lossBadge = { text: 'Acelerado', color: '#FFD600', bg: 'rgba(255, 214, 0, 0.1)' };
                } else if (lossPercentOfPrev > 0 && lossPercentOfPrev < 3.5) {
                  lossBadge = { text: 'Lento', color: '#00DFFF', bg: 'rgba(0, 223, 255, 0.1)' };
                }
                
                return (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>Día {log.day}</td>
                    <td>{log.date}</td>
                    <td style={{ fontFamily: 'monospace' }}>{log.weight.toFixed(1)} g</td>
                    <td style={{ fontFamily: 'monospace' }}>
                      <span style={{ color: loss > 0 ? '#fff' : '#888' }}>
                        {loss > 0 ? `-${loss.toFixed(1)} g` : '0.0 g'}
                      </span>
                      {loss > 0 && (
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '0.6rem', 
                          fontWeight: 'bold', 
                          background: lossBadge.bg, 
                          color: lossBadge.color, 
                          marginLeft: '8px', 
                          textTransform: 'uppercase'
                        }}>
                          {lossBadge.text}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', color: rowMoisture < 12 ? '#00FF88' : '#00DFFF', fontWeight: 'bold' }}>
                      {rowMoisture.toFixed(1)}% HR
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      -{accumWaterLost.toFixed(1)} g ({accumWaterLostPct.toFixed(1)}%)
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteDryingLog(log.id)}
                        style={{ 
                          background: 'rgba(255,77,77,0.1)', 
                          color: '#FF4D4D', 
                          border: '1px solid rgba(255,77,77,0.2)', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.72rem', 
                          fontWeight: 'bold',
                          cursor: 'pointer' 
                        }}
                      >
                        Eliminar 🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MONETIZACIÓN PREMIUM Y SPONSORS */}
      <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
        {isPremium ? (
          /* EXPLICACIONES EXCLUSIVAS PREMIUM (Eje 3 Suite) */
          <div>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#FFD600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ Curado Controlado por DPV & Sinergia (Premium Member)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <strong style={{ color: '#00FF88', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                  🧪 Curado Anaeróbico vs Purga Dinámica
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                  <strong>Semana 1:</strong> Intercambio gaseoso (burping) de 10 minutos cada 24 horas para evacuar el CO₂ liberado por descarboxilación residual. <br />
                  <strong>Semana 2:</strong> Burping cada 72 horas. <br />
                  <strong>Semana 3+:</strong> Curado anaeróbico hermético estable a 16°C. El almacenamiento prolongado en atmósfera inerte de nitrógeno previene la degradación de THC a CBN.
                </span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <strong style={{ color: '#FFD600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                  🌡️ Preservación Molecular de Terpenos
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                  Los monoterpenos ligeros (como el pineno y limoneno) poseen un punto de volatilización muy bajo (empieza a los 16-18°C). Mantén tus frascos de curado en total oscuridad y por debajo de 16°C. Los sesquiterpenos (como el beta-cariofileno y el humuleno) son termoestables hasta los 22°C pero sumamente sensibles a la fotooxidación ultravioleta.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* SPONSORS - VERSIÓN FREE */
          <div>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#FFD600" /> Soluciones Científicas de Curado Recomendadas
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* SPONSOR 1: BOVEDA */}
              <div className="glow-border" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0,255,136,0.1)', background: 'rgba(0, 255, 136, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '1rem', color: '#00FF88' }}>Bóveda® 62% / 58%</strong>
                    <span style={{ fontSize: '0.65rem', background: '#00FF8822', color: '#00FF88', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>PATROCINADOR OFICIAL</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 15px 0' }}>
                    El estándar mundial en control bidireccional de humedad. Sus membranas de sal osmótica natural absorben o liberan vapor de agua de forma constante para clavar la humedad en el frasco a 62% o 58%, sellando los terpenos y evitando moho.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>CÓDIGO DE DESCUENTO:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#FFD600', letterSpacing: '0.5px' }}>BOVEDASHADOW</strong>
                  </div>
                  <a 
                    href="https://bovedainc.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="console-btn-glow"
                    style={{ 
                      background: '#00FF88', 
                      color: '#050805', 
                      padding: '6px 14px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Comprar Ahora ↗
                  </a>
                </div>
              </div>

              {/* SPONSOR 2: GROVE BAGS */}
              <div className="glow-border" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0,223,255,0.1)', background: 'rgba(0, 223, 255, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '1rem', color: '#00DFFF' }}>Grove Bags TerpLoc®</strong>
                    <span style={{ fontSize: '0.65rem', background: '#00DFFF22', color: '#00DFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>PATROCINADOR OFICIAL</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 15px 0' }}>
                    Tecnología de empaque inteligente diseñada específicamente para flores. Su película multicapa TerpLoc® crea un microclima de DPV perfecto en el interior, purgando automáticamente el exceso de gas y reteniendo el 99% de los aromas originales sin sobre-secar.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>CÓDIGO DE DESCUENTO:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#FFD600', letterSpacing: '0.5px' }}>GROVESHADOW</strong>
                  </div>
                  <a 
                    href="https://grovebags.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="console-btn-glow"
                    style={{ 
                      background: '#00DFFF', 
                      color: '#050805', 
                      padding: '6px 14px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Comprar Ahora ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SecadoCuradoView;
