import { useState, useMemo } from 'react';
import { 
  calculateVPD, 
  getVPDStatus, 
  getSmartAdvice, 
  generateTableData, 
  calculateIdealHumidity, 
  calculateDewPoint, 
  predictNightRH, 
  calculateEvapotranspiration, 
  calculateWateringFrequency,
  calculateStomatalConductance,
  calculateTranspirationRate
} from './utils/calculations';
import { Thermometer, Droplets, Leaf, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle, Heart, Target, Coffee, Copy, Check, X, Sparkles, AlertTriangle, Award, Activity, Compass, Flame } from 'lucide-react';
import './App.css';

const BOTANICAL_ARCHETYPES = [
  { id: 'hybrid_standard', name: 'Híbrida Estándar 🧬', type: 'hybrid', desc: 'Híbridos modernos balanceados para cultivo en interior (indoor). Poseen una tasa de transpiración estomática equilibrada y excelente estabilidad climática general.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.2, 1.6], stomatalDensity: 180, maxConductance: 380, sensitivity: 0.6, baseKc: 1.0 },
  { id: 'indica_pure', name: 'Índica de Clima Seco 🏔️', type: 'indica', desc: 'Originaria de valles montañosos semiáridos de Asia Central. Desarrolla hojas muy anchas y cogollos ultra-densos. Es altamente propensa a condensaciones de rocío nocturnas en floración tardía, pero tolera DPVs secos y cálidos en el día.', early: [0.5, 0.9], veg: [0.9, 1.3], flower: [1.3, 1.7], stomatalDensity: 230, maxConductance: 320, sensitivity: 0.8, baseKc: 0.9 },
  { id: 'sativa_pure', name: 'Sativa Tropical 🌴', type: 'sativa', desc: 'Nativa de zonas ecuatoriales hiper-húmedas. Sus folíolos ultra-delgados disipan calor rápidamente mediante una transpiración foliar masiva. Es muy sensible al cierre estomático en aire seco, prefiriendo DPVs suaves y humedades relativas más altas en floración.', early: [0.3, 0.7], veg: [0.7, 1.1], flower: [1.1, 1.5], stomatalDensity: 140, maxConductance: 450, sensitivity: 0.4, baseKc: 1.15 },
  { id: 'ruderalis_auto', name: 'Ruderalis / Automática ⚡', type: 'ruderalis', desc: 'Originaria del frío siberiano, adaptada a fotoperíodos continuos e independiente de cambios lumínicos. Posees estomas compactos y muy activos, aunque su bajo volumen radicular la hace sensible a sequías en el sustrato.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.1, 1.5], stomatalDensity: 160, maxConductance: 350, sensitivity: 0.5, baseKc: 0.85 }
];

function App() {
  const [view, setView] = useState('calc'); 
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [leafOffset, setLeafOffset] = useState(-2);
  const [stage, setStage] = useState('veg');
  const [mode, setMode] = useState('manual'); // 'manual' o 'smart'
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Estados para Herramientas Pro
  const [activeStrain, setActiveStrain] = useState('hybrid_standard');
  const [activeProTool, setActiveProTool] = useState('nocturno');
  
  // Módulo 1: Nocturno
  const [nightTempDrop, setNightTempDrop] = useState(5);
  
  // Módulo 2 (Genética Avanzada): PAR y LAI (v0.7)
  const [lightIntensity, setLightIntensity] = useState(600); 
  const [leafAreaIndex, setLeafAreaIndex] = useState(2.0);
  
  // Módulo 3: Riego/Evaporación
  const [plantsCount, setPlantsCount] = useState(4);
  const [potSize, setPotSize] = useState(10);
  const [substrate, setSubstrate] = useState('soil'); // 'soil', 'coco', 'hydro'
  
  // Módulo 4: Costo Eléctrico (Soporta múltiples dispositivos a la vez)
  const [kwhCost, setKwhCost] = useState(0.15);
  const [activeDevices, setActiveDevices] = useState({
    lights: true,
    humidifier: false,
    dehumidifier: false,
    extractor: true,
    heater: false,
    ac: false
  });
  const [deviceWattsMap, setDeviceWattsMap] = useState({
    lights: 240,
    humidifier: 40,
    dehumidifier: 320,
    extractor: 60,
    heater: 1500,
    ac: 1200
  });
  const [deviceHoursMap, setDeviceHoursMap] = useState({
    lights: 18,
    humidifier: 12,
    dehumidifier: 8,
    extractor: 24,
    heater: 6,
    ac: 8
  });

  
  // Módulo 5: Academia DPV (5 Preguntas de precisión)
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [hasBadge, setHasBadge] = useState(() => {
    try {
      return localStorage.getItem('dpv_pro_badge') === 'true';
    } catch {
      return false;
    }
  });

  const selectedStrain = useMemo(() => {
    return BOTANICAL_ARCHETYPES.find(s => s.id === activeStrain) || BOTANICAL_ARCHETYPES[0];
  }, [activeStrain]);

  const genetics = selectedStrain.type;

  const targets = useMemo(() => {
    return {
      early: { min: selectedStrain.early[0], max: selectedStrain.early[1], name: `Clones (${selectedStrain.name})` },
      veg: { min: selectedStrain.veg[0], max: selectedStrain.veg[1], name: `Vegetativo (${selectedStrain.name})` },
      flower: { min: selectedStrain.flower[0], max: selectedStrain.flower[1], name: `Floración (${selectedStrain.name})` }
    };
  }, [selectedStrain]);

  const targetVpd = useMemo(() => {
    const currentTarget = targets[stage];
    return (currentTarget.min + currentTarget.max) / 2;
  }, [stage, targets]);

  const idealHumidity = useMemo(() => {
    return Math.round(calculateIdealHumidity(temp, leafOffset, targetVpd));
  }, [temp, leafOffset, targetVpd]);

  const activeHumidity = useMemo(() => {
    return mode === 'smart' ? idealHumidity : humidity;
  }, [mode, idealHumidity, humidity]);

  const vpd = useMemo(() => calculateVPD(temp, activeHumidity, leafOffset), [temp, activeHumidity, leafOffset]);
  const status = useMemo(() => getVPDStatus(vpd), [vpd]);
  const advice = useMemo(() => getSmartAdvice(vpd, temp, activeHumidity, targets[stage].min, targets[stage].max), [vpd, temp, activeHumidity, stage, targets]);

  const tableData = useMemo(() => generateTableData({ min: 15, max: 35 }, leafOffset), [leafOffset]);
  const humidities = Array.from({ length: 21 }, (_, i) => 100 - i * 5);

  const handleCellClick = (t, h) => {
    setTemp(t);
    setHumidity(h);
    setMode('manual');
    setView('calc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const stomaPaths = useMemo(() => {
    if (genetics === 'sativa') {
      return {
        left: "M 47,10 Q 34,30 47,50 Q 42,30 47,10",
        right: "M 53,10 Q 66,30 53,50 Q 58,30 53,10",
        ry: 18
      };
    } else if (genetics === 'indica') {
      return {
        left: "M 42,10 Q 15,30 42,50 Q 30,30 42,10",
        right: "M 58,10 Q 85,30 58,50 Q 70,30 58,10",
        ry: 18
      };
    } else if (genetics === 'ruderalis') {
      return {
        left: "M 44,12 Q 28,30 44,48 Q 38,30 44,12",
        right: "M 56,12 Q 72,30 56,48 Q 62,30 56,12",
        ry: 18
      };
    }
    // Híbrida
    return {
      left: "M 45,10 Q 22,30 45,50 Q 36,30 45,10",
      right: "M 55,10 Q 78,30 55,50 Q 64,30 55,10",
      ry: 18
    };
  }, [genetics]);

  const stomaState = useMemo(() => {
    const currentTarget = targets[stage];
    if (vpd < currentTarget.min) {
      return {
        gap: 6,
        color: '#00F0FF',
        label: 'Saturado (Exceso H)',
        class: 'stoma-saturated',
        particles: Array.from({ length: 1 }, (_, i) => i)
      };
    } else if (vpd > currentTarget.max) {
      return {
        gap: 0.5,
        color: '#FF4D4D',
        label: 'Cerrado (Estrés)',
        class: 'stoma-closed',
        particles: []
      };
    } else {
      return {
        gap: genetics === 'indica' ? 3 : genetics === 'sativa' ? 5 : genetics === 'ruderalis' ? 4.5 : 4,
        color: genetics === 'indica' ? '#00D060' : genetics === 'sativa' ? '#00DFFF' : genetics === 'ruderalis' ? '#D000FF' : '#00FF88',
        label: `Transpiración Óptima (${selectedStrain.name})`,
        class: 'stoma-optimal',
        particles: Array.from({ length: genetics === 'sativa' ? 5 : genetics === 'indica' ? 2 : genetics === 'ruderalis' ? 4 : 3 }, (_, i) => i)
      };
    }
  }, [vpd, stage, targets, genetics, selectedStrain]);


  return (
    <div className="app-container">
      <header>
        <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <h1 className="glow-text" style={{ margin: 0 }}>DPV <span className="highlight">PRO</span></h1>
          {hasBadge && (
            <div className="maestro-badge-glow" title="¡Felicidades Maestro de las Sombras! Certificado en Fisiología de Vapor y DPV.">
              <Award size={16} color="#FFD600" className="icon-pulse" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD600', letterSpacing: '0.5px' }}>MAESTRO SHADOW</span>
            </div>
          )}
        </div>
        <p className="subtitle">Herramienta de Precisión Científica para Cultivadores</p>
      </header>

      {/* Publicidad Superior */}
      <div className="ad-slot-top glass">
        <span className="ad-placeholder">PUBLICIDAD - ESPACIO DISPONIBLE (ADSENSE)</span>
      </div>

      <nav className="view-switcher glass">
        <button className={`view-btn ${view === 'calc' ? 'active' : ''}`} onClick={() => setView('calc')}>
          <LayoutGrid size={18} /> Calculadora
        </button>
        <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>
          <TableIcon size={18} /> Tabla Completa
        </button>
        <button className={`view-btn ${view === 'pro' ? 'active' : ''}`} onClick={() => setView('pro')}>
          <Zap size={18} /> Herramientas Pro
        </button>
      </nav>

      <main>
        {view === 'calc' && (
          <>
            <section className="stage-selector-container">
              <div className="stage-selector glass">
                {Object.keys(targets).map((s) => (
                  <button key={s} className={`stage-btn ${stage === s ? 'active' : ''}`} onClick={() => setStage(s)}>
                    {targets[s].name}
                  </button>
                ))}
              </div>
              
              <div className="genetics-selector-badge glass" style={{
                borderColor: genetics === 'indica' ? 'rgba(255, 77, 77, 0.3)' : genetics === 'sativa' ? 'rgba(0, 223, 255, 0.3)' : genetics === 'ruderalis' ? 'rgba(208, 0, 255, 0.3)' : 'rgba(0, 255, 136, 0.15)',
                boxShadow: genetics === 'indica' ? '0 0 12px rgba(255, 77, 77, 0.05)' : genetics === 'sativa' ? '0 0 12px rgba(0, 223, 255, 0.05)' : genetics === 'ruderalis' ? '0 0 12px rgba(208, 0, 255, 0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}>
                <span style={{ whiteSpace: 'nowrap' }}>🧬 Perfil Genético:</span>
                <select 
                  value={activeStrain} 
                  onChange={(e) => setActiveStrain(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: genetics === 'indica' ? '#FF4D4D' : genetics === 'sativa' ? '#00DFFF' : genetics === 'ruderalis' ? '#D000FF' : '#00FF88',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    paddingRight: '5px'
                  }}
                >
                  {BOTANICAL_ARCHETYPES.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#0a0a0a', color: '#fff', textTransform: 'none' }}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mode-selector glass">
                <button className={`mode-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                  🎛️ Manual
                </button>
                <button className={`mode-btn ${mode === 'smart' ? 'active' : ''}`} onClick={() => setMode('smart')}>
                  <Sparkles size={14} className="sparkle-icon" /> Smart (Auto)
                </button>
              </div>
            </section>

            <section className="main-display glass">
              <div className="main-display-content">
                <div className="vpd-value-container">
                  <span className="vpd-label">DÉFICIT DE PRESIÓN DE VAPOR</span>
                  <div className="vpd-value glow-text" style={{ color: status.color }}>
                    {vpd.toFixed(2)} <span className="unit">kPa</span>
                  </div>
                  <div className="vpd-status" style={{ backgroundColor: status.color + '33', color: status.color, border: `1px solid ${status.color}` }}>
                    {status.label}
                  </div>
                </div>

                <div className="stoma-visualizer">
                  <span className="visualizer-label">COMPORTAMIENTO ESTOMÁTICO</span>
                  <div className="stoma-svg-wrapper glass">
                    {/* Partículas animadas de transpiración */}
                    <div className="transpiration-particles">
                      {stomaState.particles.map(i => (
                        <span 
                          key={i} 
                          className="steam-particle" 
                          style={{ 
                            left: `${35 + i * 15}%`, 
                            animationDelay: `${i * 0.4}s`,
                            backgroundColor: stomaState.color
                          }}
                        />
                      ))}
                    </div>
                    <svg width="100" height="60" viewBox="0 0 100 60" className={`stoma-svg ${stomaState.class}`}>
                      {/* Fondo del poro (apertura estomática) */}
                      <ellipse 
                        cx="50" 
                        cy="30" 
                        rx={Math.max(0, stomaState.gap)} 
                        ry="18" 
                        fill="#050e05" 
                        style={{ transition: 'rx 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      />
                      {/* Célula Oclusiva Izquierda */}
                      <path 
                        d={stomaPaths.left} 
                        fill={stomaState.color} 
                        opacity="0.9"
                        transform={`translate(${-stomaState.gap}, 0)`}
                        style={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), fill 0.4s, d 0.4s' }}
                      />
                      {/* Célula Oclusiva Derecha */}
                      <path 
                        d={stomaPaths.right} 
                        fill={stomaState.color} 
                        opacity="0.9"
                        transform={`translate(${stomaState.gap}, 0)`}
                        style={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), fill 0.4s, d 0.4s' }}
                      />
                    </svg>
                  </div>
                  <div className="stoma-legend" style={{ color: stomaState.color }}>
                    <span className="legend-dot" style={{ backgroundColor: stomaState.color }} />
                    {stomaState.label}
                  </div>
                </div>
              </div>
              
              <div className="advice-box glow-border">
                <Zap size={24} className="icon-pulse" />
                <div className="advice-content">
                  <h4>Sugerencia de Ajuste</h4>
                  <p>{advice}</p>
                </div>
              </div>
            </section>

            <section className="controls-grid">
              <div className="control-card glass">
                <div className="control-header">
                  <div className="title-with-help">
                    <Thermometer size={20} color="#FF4D4D" />
                    <h3>Temp. Aire</h3>
                    <div className="tooltip">
                      <HelpCircle size={16} className="help-icon" />
                      <span className="tooltip-text">La temperatura ambiental de tu sala de cultivo. Afecta directamente la capacidad del aire para retener humedad.</span>
                    </div>
                  </div>
                  <span className="value-badge">{temp.toFixed(1)}°C</span>
                </div>
                <input type="range" min="10" max="40" step="0.5" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} />
              </div>

              <div className={`control-card glass ${mode === 'smart' ? 'smart-locked' : ''}`}>
                <div className="control-header">
                  <div className="title-with-help">
                    <Droplets size={20} color="#00FF88" />
                    <h3>Hum. Relativa</h3>
                    {mode === 'smart' && <span className="smart-badge-indicator">Smart</span>}
                    <div className="tooltip">
                      <HelpCircle size={16} className="help-icon" />
                      <span className="tooltip-text">
                        {mode === 'smart' 
                          ? `Regulado automáticamente al ${idealHumidity}% para la etapa ${targets[stage].name}.` 
                          : 'Porcentaje de agua en el aire respecto al máximo posible.'}
                      </span>
                    </div>
                  </div>
                  <span className="value-badge">{activeHumidity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={activeHumidity} 
                  onChange={(e) => setHumidity(parseFloat(e.target.value))}
                  disabled={mode === 'smart'} 
                />
                {mode === 'smart' && (
                  <p className="smart-lock-notice">SNAPPED: Automatizado para DPV óptimo ({targetVpd.toFixed(1)} kPa)</p>
                )}
              </div>

              <div className="control-card glass">
                <div className="control-header">
                  <div className="title-with-help">
                    <Leaf size={20} color="#A0B0A0" />
                    <h3>Offset Hoja</h3>
                    <div className="tooltip">
                      <HelpCircle size={16} className="help-icon" />
                      <span className="tooltip-text">Diferencia entre la temp. de la hoja y el aire. Bajo luces LED suele ser -2°C o -3°C porque la planta se enfría al transpirar.</span>
                    </div>
                  </div>
                  <span className="value-badge">{leafOffset}°C</span>
                </div>
                <input type="range" min="-5" max="2" step="0.5" value={leafOffset} onChange={(e) => setLeafOffset(parseFloat(e.target.value))} />
              </div>
            </section>
          </>
        )}

        {view === 'table' && (
          <section className="table-view glass">
            <div className="table-header">
              <h3>Gráfico Científico de DPV</h3>
              <p>Valores calculados con un offset de hoja de {leafOffset}°C.</p>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sticky-col">T\H</th>
                    {humidities.map(h => <th key={h}>{h}%</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.temp}>
                      <td className="temp-cell sticky-col">{row.temp.toFixed(1)}°C</td>
                      {row.values.map((v, idx) => (
                        <td 
                          key={idx} 
                          className={`vpd-cell ${Math.abs(temp - row.temp) < 0.1 && Math.abs(activeHumidity - v.humidity) < 0.1 ? 'selected' : ''}`}
                          style={{ backgroundColor: v.status.color + '22', color: v.status.color }}
                          onClick={() => handleCellClick(row.temp, v.humidity)}
                        >
                          {v.vpd}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === 'pro' && (
          <section className="pro-tools-view glass">
            <div className="pro-layout">
              {/* Menú lateral Pro */}
              <aside className="pro-sidebar">
                <h3>Módulos Avanzados</h3>
                <nav className="pro-nav">
                  <button className={`pro-nav-btn ${activeProTool === 'nocturno' ? 'active' : ''}`} onClick={() => setActiveProTool('nocturno')}>
                    🌙 Predictor Nocturno
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'genetica' ? 'active' : ''}`} onClick={() => setActiveProTool('genetica')}>
                    🧬 Fisiología Genética
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'riego' ? 'active' : ''}`} onClick={() => setActiveProTool('riego')}>
                    💧 Demanda de Riego
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'costo' ? 'active' : ''}`} onClick={() => setActiveProTool('costo')}>
                    ⚡ Consumo Eléctrico
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'academia' ? 'active' : ''}`} onClick={() => setActiveProTool('academia')}>
                    🎓 Academia DPV
                  </button>
                </nav>
              </aside>

              {/* Panel de Visualización del Módulo Activo */}
              <div className="pro-panel">
                {activeProTool === 'nocturno' && (
                  <div className="pro-module-card">
                    <div className="module-header">
                      <Thermometer size={24} color="#FFD600" />
                      <h3>Módulo 1: Simulador de Transición Nocturna ("Lights-Off" Crash Test)</h3>
                    </div>
                    <p className="module-desc">Predice la Humedad Relativa y evalúa el riesgo de condensación de agua sobre las hojas y flores al apagar las luces en tu sala de cultivo.</p>
                    
                    <div className="module-form-grid">
                      <div className="form-group">
                        <label>Temperatura Diurna de tu Sala: <strong>{temp.toFixed(1)}°C</strong></label>
                        <p className="field-desc">Tomado de la calculadora principal.</p>
                      </div>
                      <div className="form-group">
                        <label>Humedad Diurna de tu Sala: <strong>{activeHumidity}%</strong></label>
                        <p className="field-desc">Tomado de la calculadora principal.</p>
                      </div>
                      <div className="form-group">
                        <label>Caída de Temperatura Esperada al apagar focos (°C): <strong>{nightTempDrop}°C</strong></label>
                        <input 
                          type="range" 
                          min="1" 
                          max="12" 
                          step="0.5" 
                          value={nightTempDrop} 
                          onChange={(e) => setNightTempDrop(parseFloat(e.target.value))} 
                        />
                        <span className="slider-limits">Mín: 1°C | Máx: 12°C</span>
                      </div>
                    </div>

                    {(() => {
                      const tNight = temp - nightTempDrop;
                      const predictedRH = Math.round(predictNightRH(temp, activeHumidity, nightTempDrop));
                      const leafTempNight = tNight - 0.5; // Offset nocturno menor ya que transpiran poco
                      const dpNight = calculateDewPoint(tNight, predictedRH);
                      const difference = leafTempNight - dpNight;
                      
                      let nightRisk = { label: 'SEGURO', color: '#00FF88', desc: 'No hay riesgo de rocío ni picos críticos de humedad. Las hojas permanecerán secas.' };
                      if (predictedRH >= 85 || difference <= 1.5) {
                        nightRisk = { label: 'RIESGO DE HONGOS', color: '#FFD600', desc: 'La humedad nocturna será del ' + predictedRH + '%. Riesgo alto de propagación de Oídio/Mildiu.' };
                      }
                      if (predictedRH >= 96 || difference <= 0.3) {
                        nightRisk = { 
                          label: 'PELIGRO DE CONDENSACIÓN', 
                          color: '#FF4D4D', 
                          desc: 'El aire se saturará. Se formará agua líquida condensada dentro de tus cogollos al apagar las luces, provocando Botrytis.' 
                        };
                      }

                      // Cálculo de brecha de seguridad para barra de progreso (0°C a 6°C de brecha)
                      const safetyGapPercent = Math.min(100, Math.max(0, (difference / 6.0) * 100));
                      const safetyTempMin = dpNight + 1.5;
                      const tempDeficit = safetyTempMin - tNight;

                      return (
                        <div className="module-results glow-border">
                          <h4>Resultados del Análisis Nocturno Proyectado:</h4>
                          <div className="metrics-grid">
                            <div className="metric-box">
                              <span className="metric-label">Temp. Nocturna</span>
                              <span className="metric-val">{tNight.toFixed(1)}°C</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Humedad Nocturna</span>
                              <span className="metric-val" style={{ color: nightRisk.color }}>{predictedRH}%</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Temp. Punto Rocío</span>
                              <span className="metric-val">{dpNight.toFixed(1)}°C</span>
                            </div>
                          </div>

                          {/* Barra de Margen Termodinámico */}
                          <div className="thermo-gap-container" style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            marginBottom: '20px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 700 }}>
                              <span>Punto de Rocío: {dpNight.toFixed(1)}°C</span>
                              <span>Temp. Hoja: {leafTempNight.toFixed(1)}°C</span>
                            </div>
                            <div style={{ 
                              height: '10px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                              borderRadius: '5px', 
                              overflow: 'hidden',
                              display: 'flex'
                            }}>
                              <div style={{ 
                                width: `${safetyGapPercent}%`, 
                                backgroundColor: nightRisk.color, 
                                boxShadow: `0 0 10px ${nightRisk.color}`,
                                borderRadius: '5px',
                                transition: 'all 0.5s ease-out'
                              }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Diferencia Térmica: <strong style={{ color: nightRisk.color }}>{difference.toFixed(1)}°C</strong></span>
                              <span>Objetivo Seguro: <strong>&gt;1.5°C</strong></span>
                            </div>
                          </div>

                          <div className="night-alarm-card" style={{ backgroundColor: nightRisk.color + '15', border: `1px solid ${nightRisk.color}` }}>
                            <div className="alarm-header" style={{ color: nightRisk.color }}>
                              <AlertTriangle size={20} className={nightRisk.label !== 'SEGURO' ? 'icon-pulse' : ''} />
                              <strong>ESTADO: {nightRisk.label}</strong>
                            </div>
                            <p>{nightRisk.desc}</p>
                            {nightRisk.label !== 'SEGURO' && (
                              <div className="pro-advice-tip" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  💡 <strong>Sugerencia de Ventilación:</strong> Programa tu extractor para que funcione al 100% durante los 30 minutos antes y después del apagado de luces para evacuar el aire cargado de transpiración, o programa un deshumidificador nocturno.
                                </div>
                                {tempDeficit > 0 && (
                                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', color: '#FFD600' }}>
                                    🔥 <strong>Sugerencia de Calefacción:</strong> Para evitar la condensación térmica sin deshumidificador, mantén la temperatura nocturna por encima de <strong>{safetyTempMin.toFixed(1)}°C</strong> (calienta la sala al menos <strong>{tempDeficit.toFixed(1)}°C</strong> de noche).
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeProTool === 'genetica' && (
                  <div className="pro-module-card">
                    <div className="module-header">
                      <Target size={24} color="#00FF88" />
                      <h3>Módulo 2: Configuración Específica por Genética Fisiológica</h3>
                    </div>
                    <p className="module-desc">Selecciona el arquetipo botánico de tus plantas para adaptar con precisión científica los rangos ideales de DPV, estudiar la dinámica estomática y evaluar vulnerabilidades de cultivo libres de copyright.</p>
                    
                    <div className="genetics-grid-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                      {BOTANICAL_ARCHETYPES.map((arch) => {
                        const isSelected = activeStrain === arch.id;
                        let borderClass = '';
                        if (arch.type === 'indica') borderClass = 'indica-border';
                        else if (arch.type === 'sativa') borderClass = 'sativa-border';
                        else if (arch.type === 'ruderalis') borderClass = 'ruderalis-border';

                        return (
                          <button 
                            key={arch.id}
                            className={`genetic-card ${borderClass} ${isSelected ? 'active' : ''}`} 
                            onClick={() => setActiveStrain(arch.id)}
                            style={{
                              padding: '16px',
                              borderRadius: '16px',
                              textAlign: 'left',
                              background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                              border: isSelected 
                                ? `2px solid ${arch.type === 'indica' ? '#FF4D4D' : arch.type === 'sativa' ? '#00DFFF' : arch.type === 'ruderalis' ? '#D000FF' : '#00FF88'}` 
                                : '1px solid rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                          >
                            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#fff' }}>{arch.name}</h4>
                            <span className="genetic-badge" style={{ 
                              fontSize: '0.65rem', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              display: 'inline-block',
                              marginBottom: '8px',
                              backgroundColor: arch.type === 'indica' ? 'rgba(255, 77, 77, 0.15)' : arch.type === 'sativa' ? 'rgba(0, 223, 255, 0.15)' : arch.type === 'ruderalis' ? 'rgba(208, 0, 255, 0.15)' : 'rgba(0, 255, 136, 0.15)',
                              color: arch.type === 'indica' ? '#FF4D4D' : arch.type === 'sativa' ? '#00DFFF' : arch.type === 'ruderalis' ? '#D000FF' : '#00FF88'
                            }}>
                              {arch.type === 'indica' ? 'Clima Seco' : arch.type === 'sativa' ? 'Tropical' : arch.type === 'ruderalis' ? 'Automática' : 'Estándar'}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                              {arch.desc.substring(0, 100)}...
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Ficha técnica detallada */}
                    <div className="glass" style={{ 
                      padding: '20px', 
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid rgba(255, 255, 255, 0.03)',
                      marginBottom: '25px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Compass size={18} color="#00FF88" /> Ficha Científica: {selectedStrain.name}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kc Base: <strong>{selectedStrain.baseKc}</strong></span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {selectedStrain.desc}
                      </p>
                    </div>

                    {/* NUEVO MÓDULO A: SIMULADOR DE CONDUCTANCIA ESTOMÁTICA */}
                    <div className="glow-border" style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      marginBottom: '25px',
                      borderLeft: `4px solid ${genetics === 'indica' ? '#FF4D4D' : genetics === 'sativa' ? '#00DFFF' : genetics === 'ruderalis' ? '#D000FF' : '#00FF88'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Activity size={20} color="#00FF88" className="icon-pulse" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
                          Módulo A: Simulador de Conductancia Estomática (g_s) y Tasa de Transpiración
                        </h4>
                      </div>
                      
                      <div className="module-form-grid" style={{ marginBottom: '15px' }}>
                        <div className="form-group">
                          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Intensidad Lumínica PAR:</span>
                            <strong style={{ color: '#fff' }}>{lightIntensity} µmol/m²/s</strong>
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="1500" 
                            step="50" 
                            value={lightIntensity} 
                            onChange={(e) => setLightIntensity(parseInt(e.target.value))} 
                          />
                          <span className="slider-limits">Noche: 0 | Floración LED: 800 - 1200+</span>
                        </div>
                        
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parámetros Fisiológicos para {selectedStrain.name}:</span>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '6px', fontSize: '0.75rem' }}>
                            <span>Densidad: <strong>{selectedStrain.stomatalDensity} estomas/mm²</strong></span>
                            <span>g_max: <strong>{selectedStrain.maxConductance} mmol/m²/s</strong></span>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const gs = calculateStomatalConductance(vpd, lightIntensity, genetics);
                        const E = calculateTranspirationRate(gs, vpd);
                        const percentGs = (gs / selectedStrain.maxConductance) * 100;
                        
                        let gsStatus = { label: 'Optimizada', color: '#00FF88' };
                        if (percentGs < 25) gsStatus = { label: 'Estrés Severo (Estomas Cerrados)', color: '#FF4D4D' };
                        else if (percentGs >= 25 && percentGs < 60) gsStatus = { label: 'Ajuste Parcial / Transpiración Moderada', color: '#FFD600' };
                        
                        return (
                          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Conductancia Estomática (g_s)</span>
                                <strong style={{ fontSize: '1.2rem', color: gsStatus.color }}>{gs.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>mmol/m²/s</span></strong>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tasa de Transpiración de la Hoja (E)</span>
                                <strong style={{ fontSize: '1.2rem', color: '#00F0FF' }}>{E.toFixed(3)} <span style={{ fontSize: '0.75rem' }}>mmol/m²/s</span></strong>
                              </div>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>Apertura Estomática: <strong>{gsStatus.label}</strong></span>
                                <span>{percentGs.toFixed(0)}% de capacidad</span>
                              </div>
                              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${percentGs}%`, 
                                  height: '100%', 
                                  backgroundColor: gsStatus.color, 
                                  boxShadow: `0 0 8px ${gsStatus.color}`,
                                  transition: 'width 0.4s ease-out' 
                                }} />
                              </div>
                            </div>
                            
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                              {lightIntensity === 0 
                                ? '🌙 Foco Apagado: Conductancia mínima nocturna regulada para evitar la deshidratación y desbalance osmótico.'
                                : percentGs < 25 
                                  ? '⚠️ El DPV actual es demasiado hostil para esta genética. Las células oclusivas se cerraron herméticamente para evitar la embolia tisular.'
                                  : '🟢 Los estomas están operando en una zona fotosintéticamente óptima, permitiendo una excelente absorción de CO2 y refrigeración foliar.'
                              }
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* NUEVO MÓDULO B: ÍNDICE DE ÁREA FOLIAR (LAI) */}
                    <div className="glow-border" style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      marginBottom: '25px',
                      borderLeft: '4px solid #00F0FF'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Leaf size={20} color="#00F0FF" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
                          Módulo B: Índice de Área Foliar (LAI) y Sombreado de Canopia
                        </h4>
                      </div>

                      <div className="module-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="form-group" style={{ maxWidth: '400px' }}>
                          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Índice de Área Foliar (LAI):</span>
                            <strong style={{ color: '#00F0FF' }}>{leafAreaIndex.toFixed(1)} m²/m²</strong>
                          </label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="5.0" 
                            step="0.1" 
                            value={leafAreaIndex} 
                            onChange={(e) => setLeafAreaIndex(parseFloat(e.target.value))} 
                          />
                          <span className="slider-limits">Clones sueltos: 0.5 | Canopia cerrada en floración: 4.0+</span>
                        </div>
                      </div>

                      <div style={{ 
                        marginTop: '15px', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        background: 'rgba(255, 255, 255, 0.01)', 
                        border: '1px solid rgba(255,255,255,0.03)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4
                      }}>
                        💡 <strong>Efecto en la Evapotranspiración:</strong> Un LAI de <strong>{leafAreaIndex.toFixed(1)}</strong> significa que posees {leafAreaIndex.toFixed(1)} metros cuadrados de hoja por cada metro cuadrado de suelo. Esto se ha enlazado automáticamente con el <strong>Módulo 3 (Demanda de Riego)</strong>, ajustando los litros requeridos en tiempo real.
                      </div>
                    </div>

                    {/* NUEVO MÓDULO C: SEMÁFORO BIOLÓGICO INTERACTIVO */}
                    <div className="glow-border" style={{ 
                      padding: '20px', 
                      borderRadius: '16px', 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      borderLeft: '4px solid #FF4D4D',
                      marginBottom: '25px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Flame size={20} color="#FF4D4D" className="icon-pulse" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
                          Módulo C: Semáforo de Riesgo Biológico Específico de {selectedStrain.name}
                        </h4>
                      </div>

                      {(() => {
                        let fungiRisk = { label: 'Bajo', color: '#00FF88', desc: 'Ambiente seguro para los cogollos.' };
                        let stressRisk = { label: 'Bajo', color: '#00FF88', desc: 'Transpiración estomática fluida.' };

                        // Lógica de Riesgos Biológicos dinámicos
                        // 1. Riesgo de Hongos (Botrytis/Oidio) por DPV bajo
                        if (vpd < 0.8) {
                          if (genetics === 'indica') {
                            fungiRisk = { 
                              label: 'ALTO (Sensibilidad Índica)', 
                              color: '#FFD600', 
                              desc: 'El DPV es muy bajo. Las Índicas tienen flores ultra-densas y cerradas que atrapan micro-humedad interna con extrema facilidad.' 
                            };
                            if (vpd < 0.5) {
                              fungiRisk = { 
                                label: 'CRÍTICO (Botrytis / Oídio)', 
                                color: '#FF4D4D', 
                                desc: 'Peligro inmediato. Humedad estancada dentro del cogollo. Es indispensable encarecidamente aumentar la ventilación interna.' 
                              };
                            }
                          } else if (genetics === 'sativa') {
                            fungiRisk = { 
                              label: 'Moderado-Bajo (Hojas Tropicales)', 
                              color: '#00FF88', 
                              desc: 'Estructura aireada y espigada. Mayor resistencia natural al estancamiento de vapor en floración.' 
                            };
                            if (vpd < 0.4) {
                              fungiRisk = { 
                                label: 'Moderado', 
                                color: '#FFD600', 
                                desc: 'DPV sumamente bajo. Estancamiento de flujo de savia, riesgo leve de Oídio en hojas bajas.' 
                              };
                            }
                          } else {
                            fungiRisk = { 
                              label: 'Moderado', 
                              color: '#FFD600', 
                              desc: 'Monitorear puntas altas. Humedad general por encima de lo deseado para una floración segura.' 
                            };
                            if (vpd < 0.4) {
                              fungiRisk = { 
                                label: 'Alto', 
                                color: '#FF4D4D', 
                                desc: 'Fuerte riesgo de formación de hongos patógenos.' 
                              };
                            }
                          }
                        }

                        // 2. Riesgo de Cierre Estomático por DPV Alto
                        if (vpd > 1.4) {
                          if (genetics === 'sativa') {
                            stressRisk = { 
                              label: 'ALTO (Sensibilidad Sativa)', 
                              color: '#FFD600', 
                              desc: 'Las Sativas tropicales poseen folíolos delgados con alta conductancia que cierran estomas rápidamente para evitar embolias en el tallo si el aire se seca.' 
                            };
                            if (vpd > 1.6) {
                              stressRisk = { 
                                label: 'CRÍTICO (Estrés Hídrico)', 
                                color: '#FF4D4D', 
                                desc: 'Estomas completamente clausurados. La fotosíntesis se ha detenido. Hojas susceptibles a quemaduras térmicas bajo luz intensa.' 
                              };
                            }
                          } else if (genetics === 'indica') {
                            stressRisk = { 
                              label: 'Bajo-Tolerante (Origen Seco)', 
                              color: '#00FF88', 
                              desc: 'Genética adaptada a estepas áridas. Tolera DPVs altos y aire seco promoviendo una producción densa de resina.' 
                            };
                            if (vpd > 1.7) {
                              stressRisk = { 
                                label: 'Moderado', 
                                color: '#FFD600', 
                                desc: 'Comienzo de fatiga estomática. Aumentar ligeramente la humedad relativa de la sala.' 
                              };
                            }
                          } else {
                            stressRisk = { 
                              label: 'Moderado', 
                              color: '#FFD600', 
                              desc: 'El DPV elevado estimula un secado rápido del sustrato. Asegurar riegos constantes.' 
                            };
                            if (vpd > 1.6) {
                              stressRisk = { 
                                label: 'Alto (Cierre Estomático)', 
                                color: '#FF4D4D', 
                                desc: 'Estrés por calor seco. Planta a la defensiva hídrica.' 
                              };
                            }
                          }
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                              <div style={{ background: fungiRisk.color + '0a', border: `1px solid ${fungiRisk.color}33`, padding: '15px', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: fungiRisk.color, marginBottom: '6px' }}>
                                  <span>Riesgo de Hongos (Botrytis)</span>
                                  <span>{fungiRisk.label}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{fungiRisk.desc}</p>
                              </div>
                              <div style={{ background: stressRisk.color + '0a', border: `1px solid ${stressRisk.color}33`, padding: '15px', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: stressRisk.color, marginBottom: '6px' }}>
                                  <span>Estrés Estomático por DPV Seco</span>
                                  <span>{stressRisk.label}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{stressRisk.desc}</p>
                              </div>
                            </div>
                            
                            <div className="pro-advice-tip" style={{ marginTop: '5px', borderLeftColor: genetics === 'indica' ? '#FF4D4D' : genetics === 'sativa' ? '#00DFFF' : '#00FF88' }}>
                              🧬 <strong>Fisiología de Adaptación Genética:</strong><br />
                              Al cultivar <strong>{selectedStrain.name}</strong>, el DPV ideal recomendado para fotosíntesis óptima en la fase de {targets[stage].name} es de <strong>{targets[stage].min} - {targets[stage].max} kPa</strong>. Asegúrate de regular tus ventiladores y extractores para seguir este rango personalizado.
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="genetics-applied-targets glow-border">
                      <h4>Rangos de DPV Optimizados para <span className="highlight" style={{ textTransform: 'uppercase' }}>{selectedStrain.name}</span>:</h4>
                      <p className="applied-label-notice">✅ Aplicados reactivamente en tu calculadora principal y tabla de datos completa.</p>
                      
                      <div className="applied-ranges-display">
                        <div className="range-display-box">
                          <span className="stage-name">Esquejes / Clones</span>
                          <span className="range-val">{targets.early.min.toFixed(1)} - {targets.early.max.toFixed(1)} kPa</span>
                        </div>
                        <div className="range-display-box">
                          <span className="stage-name">Vegetativo</span>
                          <span className="range-val">{targets.veg.min.toFixed(1)} - {targets.veg.max.toFixed(1)} kPa</span>
                        </div>
                        <div className="range-display-box">
                          <span className="stage-name">Floración</span>
                          <span className="range-val">{targets.flower.min.toFixed(1)} - {targets.flower.max.toFixed(1)} kPa</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeProTool === 'riego' && (
                  <div className="pro-module-card">
                    <div className="module-header">
                      <Droplets size={24} color="#00F0FF" />
                      <h3>Módulo 3: Calculadora de Evapotranspiración en Litros (Riego)</h3>
                    </div>
                    <p className="module-desc">Estima cuántos litros de agua transpiran tus plantas por día según el DPV y volumen total del sustrato. Te ayuda a calcular intervalos de riego científicos.</p>
                    
                    <div className="module-form-grid">
                      <div className="form-group">
                        <label>Cantidad de Plantas en la Sala: <strong>{plantsCount}</strong></label>
                        <input 
                          type="range" 
                          min="1" 
                          max="40" 
                          step="1" 
                          value={plantsCount} 
                          onChange={(e) => setPlantsCount(parseInt(e.target.value))} 
                        />
                        <span className="slider-limits">Mín: 1 | Máx: 40</span>
                      </div>
                      <div className="form-group">
                        <label>Tamaño de las Macetas (Litros): <strong>{potSize} L</strong></label>
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          step="1" 
                          value={potSize} 
                          onChange={(e) => setPotSize(parseInt(e.target.value))} 
                        />
                        <span className="slider-limits">Mín: 1L | Máx: 50L</span>
                      </div>
                      <div className="form-group">
                        <label>Sustrato Activo:</label>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button className={`mode-btn ${substrate === 'soil' ? 'active' : ''}`} onClick={() => setSubstrate('soil')} style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1, whiteSpace: 'nowrap' }}>🟫 Suelo</button>
                          <button className={`mode-btn ${substrate === 'coco' ? 'active' : ''}`} onClick={() => setSubstrate('coco')} style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1, whiteSpace: 'nowrap' }}>🥥 Coco</button>
                          <button className={`mode-btn ${substrate === 'hydro' ? 'active' : ''}`} onClick={() => setSubstrate('hydro')} style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1, whiteSpace: 'nowrap' }}>🌊 Hidro</button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>DPV de Referencia: <strong>{vpd.toFixed(2)} kPa</strong></label>
                        <p className="field-desc">Vinculado a la calculadora principal.</p>
                      </div>
                    </div>

                    {(() => {
                      const stageMultiplier = stage === 'early' ? 0.25 : stage === 'veg' ? 0.75 : 1.20;
                      const substrateMultiplier = substrate === 'soil' ? 1.0 : substrate === 'coco' ? 1.25 : 1.50;
                      const totalLiters = calculateEvapotranspiration(plantsCount, potSize, vpd, stageMultiplier, substrateMultiplier);
                      const litersPerPlant = totalLiters / plantsCount;
                      const frequencyInfo = calculateWateringFrequency(potSize, litersPerPlant, substrate);

                      return (
                        <div className="module-results glow-border">
                          <h4>Consumo de Agua y Frecuencia de Riego Estimada:</h4>
                          <div className="metrics-grid">
                            <div className="metric-box water-bg">
                              <span className="metric-label">Total Sala</span>
                              <span className="metric-val">{totalLiters.toFixed(2)} L/Día</span>
                            </div>
                            <div className="metric-box water-bg">
                              <span className="metric-label">Por Planta</span>
                              <span className="metric-val">{litersPerPlant.toFixed(2)} L/Día</span>
                            </div>
                            <div className="metric-box water-bg">
                              <span className="metric-label">Riego Recomendado</span>
                              <span className="metric-val" style={{ color: '#00F0FF', fontSize: frequencyInfo.text.length > 15 ? '1.05rem' : '1.25rem' }}>{frequencyInfo.text}</span>
                            </div>
                          </div>

                          <div className="pro-advice-tip water-tip-border" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              📢 <strong>Fisiología de Riego (Etapa: {targets[stage].name}):</strong><br />
                              El factor de transpiración está ajustado al <strong>{(stageMultiplier * 100).toFixed(0)}%</strong> por la etapa y al <strong>{(substrateMultiplier * 100).toFixed(0)}%</strong> por el sustrato.
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                              {vpd < 0.6 && "⚠️ DPV MUY BAJO: Tus plantas transpiran muy lento. El sustrato se secará despacio. Riega con volúmenes moderados y espacia más los riegos para evitar asfixia radicular y pudrición."}
                              {vpd >= 0.6 && vpd <= 1.2 && "🟢 DPV ÓPTIMO: Las plantas transpiran de forma fluida y sana. Los riegos pueden seguir la frecuencia sugerida de forma natural y segura."}
                              {vpd > 1.2 && "⚠️ DPV ALTO: Alta demanda hídrica. Las plantas pierden agua rápidamente para no quemarse. Necesitarás regar con mayor frecuencia o aumentar el volumen diario para evitar marchitamiento estresante."}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeProTool === 'costo' && (
                  <div className="pro-module-card">
                    <div className="module-header">
                      <Coffee size={24} color="#00FF88" />
                      <h3>Módulo 4: Estimador de Costo Energético de Climatización</h3>
                    </div>
                    <p className="module-desc">Calcula el consumo eléctrico y el costo monetario mensual estimado de tus equipos de climatización (extractores, calefactores o deshumidificadores) utilizados para corregir el DPV.</p>
                    
                    <div className="module-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                      <div className="form-group" style={{ maxWidth: '300px', marginBottom: '15px' }}>
                        <label>Costo del kWh (moneda local): <strong>${kwhCost.toFixed(2)}</strong></label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={kwhCost} 
                          onChange={(e) => setKwhCost(parseFloat(e.target.value) || 0)} 
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Equipamiento de tu Sala (Activa los que utilices):</h4>
                        {(() => {
                          const deviceLabels = {
                            lights: { name: 'Iluminación de Cultivo 💡', desc: 'Lámparas LED, Sodio (HPS) o LEC indispensables para la fotosíntesis' },
                            humidifier: { name: 'Humidificador 💧', desc: 'Aumenta la humedad relativa para bajar el DPV' },
                            dehumidifier: { name: 'Deshumidificador ❄️', desc: 'Reduce la humedad ambiental para subir el DPV' },
                            extractor: { name: 'Extractor / Turbina 🌪️', desc: 'Evacua calor y humedad de los focos' },
                            heater: { name: 'Calefactor / Estufa 🔥', desc: 'Calienta de noche para alejar el punto de rocío' },
                            ac: { name: 'Aire Acondicionado ❄️', desc: 'Climatiza y deshumidifica la sala' }
                          };

                          return Object.keys(deviceLabels).map(key => (
                            <div key={key} className="device-row glass" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              padding: '16px',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              background: activeDevices[key] ? 'rgba(0, 255, 136, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                              borderColor: activeDevices[key] ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              transition: 'all 0.3s'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={activeDevices[key]} 
                                    onChange={(e) => setActiveDevices({ ...activeDevices, [key]: e.target.checked })} 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00FF88' }}
                                  />
                                  <div>
                                    <strong style={{ color: activeDevices[key] ? '#fff' : 'var(--text-secondary)', fontSize: '0.9rem' }}>{deviceLabels[key].name}</strong>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6 }}>{deviceLabels[key].desc}</div>
                                  </div>
                                </div>
                                {activeDevices[key] && (
                                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00FF88', backgroundColor: 'rgba(0, 255, 136, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                    {((deviceWattsMap[key] * deviceHoursMap[key]) / 1000).toFixed(2)} kWh/Día
                                  </span>
                                )}
                              </div>
                              
                              {activeDevices[key] && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                      <span>Potencia Watts:</span>
                                      <strong style={{ color: '#fff' }}>{deviceWattsMap[key]} W</strong>
                                    </label>
                                    <input 
                                      type="range" 
                                      min="10" 
                                      max="2500" 
                                      step="10" 
                                      value={deviceWattsMap[key]} 
                                      onChange={(e) => setDeviceWattsMap({ ...deviceWattsMap, [key]: parseInt(e.target.value) || 0 })} 
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                      <span>Uso Diario:</span>
                                      <strong style={{ color: '#fff' }}>{deviceHoursMap[key]} Horas</strong>
                                    </label>
                                    <input 
                                      type="range" 
                                      min="1" 
                                      max="24" 
                                      step="1" 
                                      value={deviceHoursMap[key]} 
                                      onChange={(e) => setDeviceHoursMap({ ...deviceHoursMap, [key]: parseInt(e.target.value) || 0 })} 
                                    />
                                    {key === 'lights' && (
                                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                        <button className={`mode-btn ${deviceHoursMap.lights === 12 ? 'active' : ''}`} onClick={() => setDeviceHoursMap({ ...deviceHoursMap, lights: 12 })} style={{ padding: '4px 8px', fontSize: '0.7rem', flex: 1, whiteSpace: 'nowrap' }}>12/12 🌸</button>
                                        <button className={`mode-btn ${deviceHoursMap.lights === 18 ? 'active' : ''}`} onClick={() => setDeviceHoursMap({ ...deviceHoursMap, lights: 18 })} style={{ padding: '4px 8px', fontSize: '0.7rem', flex: 1, whiteSpace: 'nowrap' }}>18/6 🌿</button>
                                        <button className={`mode-btn ${deviceHoursMap.lights === 20 ? 'active' : ''}`} onClick={() => setDeviceHoursMap({ ...deviceHoursMap, lights: 20 })} style={{ padding: '4px 8px', fontSize: '0.7rem', flex: 1, whiteSpace: 'nowrap' }}>20/4 ⚡</button>
                                        <button className={`mode-btn ${deviceHoursMap.lights === 24 ? 'active' : ''}`} onClick={() => setDeviceHoursMap({ ...deviceHoursMap, lights: 24 })} style={{ padding: '4px 8px', fontSize: '0.7rem', flex: 1, whiteSpace: 'nowrap' }}>24h ♾️</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {(() => {
                      let totalDailyKwh = 0;
                      Object.keys(activeDevices).forEach(key => {
                        if (activeDevices[key]) {
                          totalDailyKwh += (deviceWattsMap[key] * deviceHoursMap[key]) / 1000;
                        }
                      });

                      const dailyCost = totalDailyKwh * kwhCost;
                      const monthlyCost = dailyCost * 30;
                      const co2Footprint = totalDailyKwh * 0.4 * 30; // 0.4kg CO2 por kWh promedio
                      const smartSavings = monthlyCost * 0.22; // 22% ahorro estimado por automatizar DPV

                      return (
                        <div className="module-results glow-border">
                          <h4>Consumo y Costo Eléctrico Total Proyectado:</h4>
                          <div className="metrics-grid">
                            <div className="metric-box cost-bg">
                              <span className="metric-label">Costo Mensual</span>
                              <span className="metric-val">${monthlyCost.toFixed(2)}</span>
                            </div>
                            <div className="metric-box cost-bg">
                              <span className="metric-label">Consumo Diario</span>
                              <span className="metric-val">{totalDailyKwh.toFixed(2)} kWh</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Huella CO2</span>
                              <span className="metric-val">{co2Footprint.toFixed(1)} kg/Mes</span>
                            </div>
                          </div>

                          {monthlyCost > 0 && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 0, 0, 0.4))',
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              borderRadius: '12px',
                              padding: '16px',
                              marginBottom: '20px',
                              animation: 'pulseGold 3s infinite ease-in-out'
                            }}>
                              <div>
                                <strong style={{ color: '#00FF88', fontSize: '0.9rem', display: 'block' }}>💡 Ahorro Estimado con Automatización Smart:</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Al encender extractores/humidificadores solo cuando el DPV lo demanda.</span>
                              </div>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00FF88', whiteSpace: 'nowrap' }}>
                                -${smartSavings.toFixed(2)}/Mes
                              </span>
                            </div>
                          )}

                          <div className="pro-advice-tip cost-tip-border">
                            💡 <strong>Consejo de Eficiencia Energética:</strong><br />
                            Los deshumidificadores y calefactores consumen hasta un 95% más energía que los extractores estándar. Utilizar el <strong>Modo Smart (Auto)</strong> o perfiles genéticos específicos te ayuda a evitar sobre-climatizar la sala al apagar los equipos de alto consumo apenas se estabiliza la transpiración vegetal.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {activeProTool === 'academia' && (
                  <div className="pro-module-card">
                    <div className="module-header">
                      <Sparkles size={24} color="#FFD600" />
                      <h3>Módulo 5: Academia DPV (Trivia Científica de Precisión)</h3>
                    </div>
                    <p className="module-desc">Ponte a prueba, Maestro del Vapor. Responde correctamente estas 5 preguntas científicas avanzadas de fisiología vegetal para demostrar tus conocimientos y desbloquear tu medalla virtual permanente de cultivador de élite.</p>

                    <div className="quiz-container">
                      {/* Pregunta 1 */}
                      <div className="quiz-question-box">
                        <h5>1. ¿Dónde ocurre de manera fisiológica el DPV real de tu cultivo?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'A' })}>
                            A. En el sensor de humedad que cuelga en la pared de la sala.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'B' })}>
                            B. En la superficie y cavidad subestomática de la hoja, regulado por los estomas. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'C' })}>
                            C. Directamente en los diodos de los focos LED de la sala.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 2 */}
                      <div className="quiz-question-box">
                        <h5>2. ¿Qué acción realizan los estomas de las hojas ante un DPV críticamente alto (ej: 2.2 kPa)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'A' })}>
                            A. Se abren al 100% para liberar la máxima cantidad de agua posible y enfriar el aire.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'B' })}>
                            B. Explotan debido a la excesiva tensión superficial interna del agua celular.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'C' })}>
                            C. Se cierran herméticamente para evitar que la planta muera deshidratada (cierre estomático por estrés). (Correcto)
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 3 */}
                      <div className="quiz-question-box">
                        <h5>3. ¿Por qué la transición de luces encendidas a apagadas (Lights-Off) es el momento de mayor riesgo de moho?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'A' })}>
                            A. Porque la temperatura del aire cae rápido y las hojas/cogollos descienden por debajo del Punto de Rocío, condensando agua líquida libre. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'B' })}>
                            B. Porque las plantas transpiran de forma acelerada durante las primeras horas de oscuridad absoluta.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'C' })}>
                            C. Porque la presión barométrica de la sala se eleva de golpe al apagarse los focos de cultivo.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 4 */}
                      <div className="quiz-question-box">
                        <h5>4. ¿Cómo afecta un DPV crónicamente bajo (ej: 0.3 kPa) a la absorción de nutrientes inmóviles como el Calcio (Ca)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'A' })}>
                            A. Incrementa la absorción radicular de Calcio ya que no hay evaporación foliar que frene el flujo.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'B' })}>
                            B. Detiene el transporte de Calcio hacia los brotes nuevos, causando necrosis apical porque el Calcio se mueve solo de forma pasiva por la corriente de transpiración. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'C' })}>
                            C. Hace que el Calcio cristalice en las raíces y bloquee la absorción de Nitrógeno y Potasio.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 5 */}
                      <div className="quiz-question-box">
                        <h5>5. ¿Qué nos indica científicamente un Offset de Hoja positivo (ej: hoja a 26.0°C y aire a 24.0°C)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'A' })}>
                            A. Que la planta está en su punto máximo de fotosíntesis y transpiración fluida.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'B' })}>
                            B. Que la planta ha cerrado estomas por estrés térmico, hídrico o radicular, deteniendo la transpiración y acumulando calor bajo la luz. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'C' })}>
                            C. Que el suelo tiene temperaturas óptimas que aceleran el metabolismo respiratorio de las flores.
                          </button>
                        </div>
                      </div>

                      {!quizSubmitted ? (
                        <button 
                          className="quiz-submit-btn" 
                          onClick={() => {
                            if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5) return;
                            let score = 0;
                            if (quizAnswers.q1 === 'B') score++;
                            if (quizAnswers.q2 === 'C') score++;
                            if (quizAnswers.q3 === 'A') score++;
                            if (quizAnswers.q4 === 'B') score++;
                            if (quizAnswers.q5 === 'B') score++;
                            setQuizScore(score);
                            setQuizSubmitted(true);
                            if (score === 5) {
                              setHasBadge(true);
                              try {
                                localStorage.setItem('dpv_pro_badge', 'true');
                              } catch (err) {
                                console.warn('Storage blocked:', err);
                              }
                            }
                          }}
                          disabled={!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5}
                        >
                          Enviar Respuestas e Inspeccionar Resultados
                        </button>
                      ) : (
                        <div className="quiz-submitted-box glow-border" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {quizScore === 5 ? (
                            <div className="quiz-success">
                              <span className="medal-emoji">🏆</span>
                              <h4>¡FELICIDADES MAESTRO SHADOW DEL DPV!</h4>
                              <p>Has respondido las 5 preguntas correctamente de manera perfecta. Tu comprensión de la física del vapor y la fisiología vegetal está en el percentil superior del cultivo científico.</p>
                              <div className="virtual-badge-card" style={{ cursor: 'pointer' }} onClick={() => handleCopy('https://dpv-pro.vercel.app', 'badge_link')}>
                                <strong>🥇 MEDALLA: MAESTRO SHADOW DEL DPV</strong>
                                <span>DPV PRO ACADEMY &copy; 2026</span>
                                <span style={{ fontSize: '0.65rem', color: '#00FF88', marginTop: '8px' }}>
                                  {copiedText === 'badge_link' ? '¡Enlace de la herramienta copiado! 🟢' : '🔗 Haz clic para copiar enlace y compartir logro'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="quiz-fail">
                              <h4>Resultado: {quizScore}/5 correctas</h4>
                              <p>¡Tienes potencial de cultivador experto! Has acertado varias, pero para desbloquear la prestigiosa Medalla dorada necesitas una calificación perfecta (5/5). Revisa la guía de respuestas abajo e intenta nuevamente.</p>
                              <button className="quiz-reset-btn" onClick={() => {
                                setQuizAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' });
                                setQuizSubmitted(false);
                                setQuizScore(0);
                              }}>
                                Intentar Trivia Nuevamente 🔄
                              </button>
                            </div>
                          )}

                          {/* Hoja de Respuestas Científica */}
                          <div style={{
                            textAlign: 'left',
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '15px' }}>📖 Hoja de Respuestas & Explicación Botánica:</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem', lineHeight: '1.4' }}>
                              <div>
                                <span style={{ color: quizAnswers.q1 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 1: {quizAnswers.q1 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  El DPV real ocurre en el mesófilo foliar. La humedad interna de la planta es siempre del 100% (saturación). El DPV es la fuerza secante neta que aspira el agua hacia afuera y depende de la diferencia entre esa presión subestomática de vapor interna y la del ambiente.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q2 === 'C' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 2: {quizAnswers.q2 === 'C' ? 'Correcto (C)' : 'Incorrecto (C)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Cierre Estomático. Bajo un aire críticamente seco (DPV alto), la planta previene la deshidratación letal cerrando las células oclusivas estomáticas. Esto frena la pérdida de agua, pero también detiene la absorción de CO2, frenando por completo el crecimiento fotosintético.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q3 === 'A' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 3: {quizAnswers.q3 === 'A' ? 'Correcto (A)' : 'Incorrecto (A)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Punto de Rocío y Condensación. Al apagar luces, la temperatura cae velozmente. Como las hojas y flores densas disipan calor aún más rápido por radiación, se enfrían por debajo del Punto de Rocío del aire húmedo remanente, formando gotas microscópicas internas de agua líquida (Botrytis).
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q4 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 4: {quizAnswers.q4 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Deficiencias por DPV Bajo. El Calcio es un elemento estructural no móvil. Las raíces no lo bombean activamente; se absorbe pasivamente disuelto en el agua que asciende por capilaridad a través del xilema gracias a la tensión generada por la transpiración. Si el DPV es muy bajo, no hay transpiración y se desata pudrición y necrosis apical foliar.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q5 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 5: {quizAnswers.q5 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Falla Transpirativa. Una planta sana evapotranspira agua continuamente, lo que refrigera las hojas por calor latente de evaporación (haciéndolas estar 1.5°C a 3.0°C *por debajo* del aire, offset negativo). Si la hoja está más caliente que el aire, sus "motores" estomáticos están apagados por completo por estrés.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="education-section glass">
          <div className="info-header">
            <Leaf size={24} color="#00FF88" />
            <h3>Guía Maestra: El Offset de Hoja</h3>
          </div>
          <div className="education-grid">
            <div className="edu-card">
              <h4>1. ¿Qué es el Offset?</h4>
              <p>Es la diferencia térmica entre tus plantas y el aire. El DPV real ocurre en la hoja, no en el ambiente.</p>
            </div>
            <div className="edu-card">
              <h4>2. Configuración</h4>
              <ul>
                <li><strong>LED:</strong> Setea en <strong>-2.0°C</strong>.</li>
                <li><strong>Sodio:</strong> Setea en <strong>+1.0°C</strong>.</li>
              </ul>
            </div>
            <div className="edu-card">
              <h4>3. El Truco Pro</h4>
              <p>Usa un láser IR: Hoja 22°C - Aire 24°C = <strong>Offset de -2°C</strong>.</p>
            </div>
          </div>
        </section>

        <section className="education-section glass warning-gradient" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03), rgba(0, 0, 0, 0.4))', borderColor: 'rgba(0, 255, 136, 0.25)' }}>
          <div className="info-header">
            <Sparkles size={24} color="#00FF88" className="icon-pulse" />
            <h3>Guía Científica: El Modo Smart (Auto)</h3>
          </div>
          <div className="education-grid">
            <div className="edu-card">
              <h4>1. ¿Qué hace bajo el capó?</h4>
              <p>Fórmula a la inversa. En lugar de estimar el DPV desde tus mediciones manuales, el motor despeja la ecuación fáctica de Magnus-Tetens para calcular el valor exacto de Humedad Relativa a configurar.</p>
            </div>
            <div className="edu-card">
              <h4>2. Fisiología de Objetivos</h4>
              <p>Cada etapa de crecimiento tiene un objetivo de DPV óptimo central ya establecido: <strong>0.6 kPa</strong> para esquejes, <strong>1.0 kPa</strong> en vegetativo (fotosíntesis explosiva) y <strong>1.4 kPa</strong> en floración (máximo resguardo estomático y prevención de hongos).</p>
            </div>
            <div className="edu-card">
              <h4>3. Automatización Real</h4>
              <p>El modo Smart te da el número ideal. Si lo aplicas con controladores inteligentes o Home Assistant, tus extractores y humidificadores se autorregulan de forma activa para seguir la curva perfecta en tiempo real.</p>
            </div>
          </div>
        </section>

        <section className="education-section glass warning-gradient">
          <div className="info-header">
            <Thermometer size={24} color="#FFD600" />
            <h3>Guía Científica: El Punto de Rocío</h3>
          </div>
          <div className="education-grid">
            <div className="edu-card">
              <h4>1. ¿Qué es el Punto de Rocío?</h4>
              <p>Es la temperatura exacta a la cual el aire de tu sala se satura por completo de humedad. Si la temperatura cae por debajo de este punto, el vapor invisible se transforma físicamente en gotas de agua líquida.</p>
            </div>
            <div className="edu-card">
              <h4>2. El Peligro Nocturno</h4>
              <p>Al apagar las luces, la temperatura del aire cae rápido, pero las hojas y flores se enfrían aún más rápido. Si la temperatura de tu cogollo desciende por debajo de la del punto de rocío, se condensará agua en su interior.</p>
            </div>
            <div className="edu-card">
              <h4>3. El Riesgo de Botrytis</h4>
              <p>El agua líquida atrapada en cogollos densos y a oscuras es el hábitat perfecto para que las esporas de Botrytis (moho gris) germinen en pocas horas, arruinando por completo tu cosecha.</p>
            </div>
          </div>
        </section>

        <section className="education-section glass biological-gradient">
          <div className="info-header">
            <Target size={24} color="#00FF88" />
            <h3>Semáforo de Riesgo Biológico</h3>
          </div>
          <div className="education-grid">
            <div className="edu-card pest-card dry-risk">
              <h4>🔥 DPV Alto (Calor Seco)</h4>
              <p>Un DPV excesivo genera estrés hídrico. Este ambiente caliente y de aire sumamente seco favorece la reproducción rápida y exponencial de la <strong>Araña Roja</strong> y trips.</p>
            </div>
            <div className="edu-card pest-card ideal-risk">
              <h4>🟢 DPV Ideal (Punto Dulce)</h4>
              <p>Máxima fotosíntesis y transpiración fluida. Las plantas son fuertes y el ambiente no otorga ventajas adaptativas a plagas ni a hongos.</p>
            </div>
            <div className="edu-card pest-card wet-risk">
              <h4>❄️ DPV Bajo (Humedad Fría)</h4>
              <p>La transpiración se detiene por completo. El ambiente excesivamente húmedo y frío es el caldo de cultivo ideal para esporas de <strong>Oídio y Botrytis</strong>.</p>
            </div>
          </div>
        </section>

        <section className="info-section glass">
          <div className="info-header">
            <Target size={24} color="#00FF88" />
            <h3>Rangos Ideales de DPV</h3>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <ChevronRight size={18} className="chevron" />
              <span><strong>0.4 - 0.8 kPa:</strong> Etapa de clones y esquejes. Humedad alta para proteger la planta.</span>
            </div>
            <div className="info-item">
              <ChevronRight size={18} className="chevron" />
              <span><strong>0.8 - 1.2 kPa:</strong> Vegetativo y Floración temprana. Máximo crecimiento fotosintético.</span>
            </div>
            <div className="info-item">
              <ChevronRight size={18} className="chevron" />
              <span><strong>1.2 - 1.6 kPa:</strong> Floración avanzada. Ayuda a prevenir hongos y mejorar la resina.</span>
            </div>
          </div>
        </section>

        <section className="support-section glass">
          <Heart size={20} color="#FF4D4D" className="heart-beat" />
          <p>¿Te sirve esta herramienta? Apóyanos para seguir mejorando el proyecto.</p>
          <button className="support-btn" onClick={() => setIsSupportModalOpen(true)}>Invítanos un café ☕</button>
        </section>

        <div className="ad-slot-bottom glass">
          <span className="ad-placeholder">PUBLICIDAD - BANNER INFERIOR</span>
        </div>
      </main>

      <footer>
        <p>DPV PRO &copy; 2026 - Master Precision Tools</p>
      </footer>

      {/* Modal de Soporte Glassmorphic */}
      {isSupportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSupportModalOpen(false)}>
          <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsSupportModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <Coffee size={36} color="#00FF88" className="icon-pulse" />
              <h2 className="glow-text">Apoya a DPV PRO</h2>
              <p>Tu contribución nos ayuda a mantener los servidores activos y seguir desarrollando herramientas de precisión científica para cultivadores.</p>
            </div>

            <div className="payment-options">
              {/* Cafecito AR */}
              <a href="https://cafecito.app/gikey" target="_blank" rel="noopener noreferrer" className="payment-card glass">
                <div className="payment-card-header">
                  <h4>Cafecito.app</h4>
                  <span className="payment-badge ar">Argentina 🇦🇷</span>
                </div>
                <p>Apóyanos con pesos argentinos de forma rápida.</p>
                <span className="payment-action-btn">Invitar Café ☕</span>
              </a>

              {/* BuyMeACoffee Global */}
              <a href="https://buymeacoffee.com/gikey" target="_blank" rel="noopener noreferrer" className="payment-card glass">
                <div className="payment-card-header">
                  <h4>Buy Me A Coffee</h4>
                  <span className="payment-badge global">Global 🌎</span>
                </div>
                <p>Support us with credit/debit card from anywhere.</p>
                <span className="payment-action-btn">Support ☕</span>
              </a>

              {/* Transferencia Alias */}
              <div className="payment-card glass" onClick={() => handleCopy('gikey.mp', 'alias')}>
                <div className="payment-card-header">
                  <h4>Alias Bancario</h4>
                  <span className="payment-badge ar">MercadoPago 🇦🇷</span>
                </div>
                <div className="copy-field">
                  <code>gikey.mp</code>
                  <button className="copy-btn">
                    {copiedText === 'alias' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar el alias de Mercado Pago.</p>
              </div>

              {/* Binance Smart Chain BEP-20 */}
              <div className="payment-card glass" onClick={() => handleCopy('0x33bE63D963d95318e2657A401Df1F0aC6Ef6a410', 'bep20')}>
                <div className="payment-card-header">
                  <h4>USDT (BEP-20)</h4>
                  <span className="payment-badge crypto">BSC 🪙</span>
                </div>
                <div className="copy-field">
                  <code className="crypto-address">0x33bE63D9...</code>
                  <button className="copy-btn">
                    {copiedText === 'bep20' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar la dirección BEP-20.</p>
              </div>

              {/* Solana Network */}
              <div className="payment-card glass" onClick={() => handleCopy('3YS3F9DWvzrKv6PpgAL26wwpiZYoWRtWmWwBGBXG9Jbo', 'solana')}>
                <div className="payment-card-header">
                  <h4>Cripto (Solana)</h4>
                  <span className="payment-badge crypto">SOL 🪙</span>
                </div>
                <div className="copy-field">
                  <code className="crypto-address">3YS3F9DW...</code>
                  <button className="copy-btn">
                    {copiedText === 'solana' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar la dirección de Solana.</p>
              </div>
            </div>

            <div className="modal-footer">
              <p>¡Muchísimas gracias por apoyar el software independiente de alta calidad! 💚</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
