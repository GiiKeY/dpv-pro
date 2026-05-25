import React, { useState, useMemo, useEffect } from 'react';
import { calculateVPD, getVPDStatus, getSmartAdvice, generateTableData, calculateIdealHumidity, calculateDewPoint, predictNightRH, calculateEvapotranspiration } from './utils/calculations';
import { Thermometer, Droplets, Leaf, Info, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle, Heart, Target, Coffee, Copy, Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import './App.css';

function App() {
  const [view, setView] = useState('calc'); 
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [leafOffset, setLeafOffset] = useState(-2);
  const [stage, setStage] = useState('veg');
  const [mode, setMode] = useState('manual'); // 'manual' o 'smart'
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Estados para Herramientas Pro (v0.6)
  const [genetics, setGenetics] = useState('hybrid'); // 'hybrid', 'indica', 'sativa'
  const [activeProTool, setActiveProTool] = useState('nocturno');
  
  // Módulo 1: Nocturno
  const [nightTempDrop, setNightTempDrop] = useState(5);
  
  // Módulo 3: Riego/Evaporación
  const [plantsCount, setPlantsCount] = useState(4);
  const [potSize, setPotSize] = useState(10);
  
  // Módulo 4: Costo Eléctrico
  const [kwhCost, setKwhCost] = useState(0.15);
  const [deviceWatts, setDeviceWatts] = useState(250);
  const [deviceHours, setDeviceHours] = useState(12);
  
  // Módulo 5: Academia DPV
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const targets = useMemo(() => {
    const baseTargets = {
      early: { min: 0.4, max: 0.8, name: 'Esquejes' },
      veg: { min: 0.8, max: 1.2, name: 'Vegetativo' },
      flower: { min: 1.2, max: 1.6, name: 'Floración' }
    };
    
    if (genetics === 'indica') {
      return {
        early: { min: 0.5, max: 0.9, name: 'Esquejes (Índica)' },
        veg: { min: 0.9, max: 1.3, name: 'Vegetativo (Índica)' },
        flower: { min: 1.3, max: 1.7, name: 'Floración (Índica)' }
      };
    } else if (genetics === 'sativa') {
      return {
        early: { min: 0.3, max: 0.7, name: 'Esquejes (Sativa)' },
        veg: { min: 0.7, max: 1.1, name: 'Vegetativo (Sativa)' },
        flower: { min: 1.1, max: 1.5, name: 'Floración (Sativa)' }
      };
    }
    return baseTargets;
  }, [genetics]);


  const targetVpd = useMemo(() => {
    const currentTarget = targets[stage];
    return (currentTarget.min + currentTarget.max) / 2;
  }, [stage]);

  const idealHumidity = useMemo(() => {
    return Math.round(calculateIdealHumidity(temp, leafOffset, targetVpd));
  }, [temp, leafOffset, targetVpd]);

  const activeHumidity = useMemo(() => {
    return mode === 'smart' ? idealHumidity : humidity;
  }, [mode, idealHumidity, humidity]);

  const vpd = useMemo(() => calculateVPD(temp, activeHumidity, leafOffset), [temp, activeHumidity, leafOffset]);
  const status = useMemo(() => getVPDStatus(vpd), [vpd]);
  const advice = useMemo(() => getSmartAdvice(vpd, temp, activeHumidity, targets[stage].min, targets[stage].max), [vpd, temp, activeHumidity, stage]);

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
        gap: 4,
        color: '#00FF88',
        label: 'Transpiración Ideal',
        class: 'stoma-optimal',
        particles: Array.from({ length: 3 }, (_, i) => i)
      };
    }
  }, [vpd, stage]);


  return (
    <div className="app-container">
      <header>
        <h1 className="glow-text">DPV <span className="highlight">PRO</span></h1>
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
                        d="M 45,10 Q 22,30 45,50 Q 36,30 45,10" 
                        fill={stomaState.color} 
                        opacity="0.9"
                        transform={`translate(${-stomaState.gap}, 0)`}
                        style={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), fill 0.4s' }}
                      />
                      {/* Célula Oclusiva Derecha */}
                      <path 
                        d="M 55,10 Q 78,30 55,50 Q 64,30 55,10" 
                        fill={stomaState.color} 
                        opacity="0.9"
                        transform={`translate(${stomaState.gap}, 0)`}
                        style={{ transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), fill 0.4s' }}
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
                      if (predictedRH >= 85 || difference <= 1.0) {
                        nightRisk = { label: 'RIESGO DE HONGOS', color: '#FFD600', desc: 'La humedad nocturna será del ' + predictedRH + '%. Riesgo alto de propagación de Oídio.' };
                      }
                      if (predictedRH >= 98 || difference <= 0.1) {
                        nightRisk = { 
                          label: 'PELIGRO DE CONDENSACIÓN', 
                          color: '#FF4D4D', 
                          desc: 'El aire se saturará. Se formará agua líquida dentro de tus flores al apagar las luces, generando Botrytis.' 
                        };
                      }

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

                          <div className="night-alarm-card" style={{ backgroundColor: nightRisk.color + '15', border: `1px solid ${nightRisk.color}` }}>
                            <div className="alarm-header" style={{ color: nightRisk.color }}>
                              <AlertTriangle size={20} className={nightRisk.label !== 'SEGURO' ? 'icon-pulse' : ''} />
                              <strong>ESTADO: {nightRisk.label}</strong>
                            </div>
                            <p>{nightRisk.desc}</p>
                            {nightRisk.label !== 'SEGURO' && (
                              <div className="pro-advice-tip">
                                💡 <strong>Sugerencia Técnica:</strong> Programa tu extractor para que funcione al 100% durante los 30 minutos antes y después del apagado de luces para evacuar el aire cargado de humedad, o instala un deshumidificador programado de noche.
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
                    <p className="module-desc">Selecciona la predominancia genética de tus plantas para ajustar con precisión científica los rangos ideales de DPV óptimos en base a su origen evolutivo.</p>
                    
                    <div className="genetics-grid-selector">
                      <button className={`genetic-card ${genetics === 'hybrid' ? 'active' : ''}`} onClick={() => setGenetics('hybrid')}>
                        <h4>Híbrida / Automática</h4>
                        <span className="genetic-badge">Estándar</span>
                        <p>Genéticas equilibradas. Rangos clásicos óptimos (Clones: 0.6 | Veg: 1.0 | Floración: 1.4 kPa).</p>
                      </button>

                      <button className={`genetic-card indica-border ${genetics === 'indica' ? 'active' : ''}`} onClick={() => setGenetics('indica')}>
                        <h4>100% Índica</h4>
                        <span className="genetic-badge ind">Seco / Montaña</span>
                        <p>Originarias de regiones secas y montañosas. Toleran DPVs más altos y prefieren aire ligeramente más seco en floración avanzada.</p>
                      </button>

                      <button className={`genetic-card sativa-border ${genetics === 'sativa' ? 'active' : ''}`} onClick={() => setGenetics('sativa')}>
                        <h4>100% Sativa</h4>
                        <span className="genetic-badge sat">Tropical / Húmedo</span>
                        <p>Evolucionaron en climas tropicales muy húmedos. Toleran humedades relativas más altas y prefieren DPVs más suaves.</p>
                      </button>
                    </div>

                    <div className="genetics-applied-targets glow-border">
                      <h4>Rangos de DPV Optimizados para Genética <span className="highlight" style={{ textTransform: 'uppercase' }}>{genetics}</span>:</h4>
                      <p className="applied-label-notice">✅ Aplicados dinámicamente en tu calculadora principal y tabla de datos completa.</p>
                      
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
                        <label>Tamaño Promedio de las Macetas (Litros): <strong>{potSize} L</strong></label>
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
                        <label>DPV de Referencia: <strong>{vpd.toFixed(2)} kPa</strong></label>
                        <p className="field-desc">Tomado de la calculadora principal en tiempo real.</p>
                      </div>
                    </div>

                    {(() => {
                      const totalLiters = calculateEvapotranspiration(plantsCount, potSize, vpd);
                      const litersPerPlant = totalLiters / plantsCount;

                      return (
                        <div className="module-results glow-border">
                          <h4>Consumo de Agua Diario Estimado de tu Cultivo:</h4>
                          <div className="metrics-grid">
                            <div className="metric-box water-bg">
                              <span className="metric-label">Total Sala</span>
                              <span className="metric-val">{totalLiters.toFixed(2)} L/Día</span>
                            </div>
                            <div className="metric-box water-bg">
                              <span className="metric-label">Por Planta</span>
                              <span className="metric-val">{litersPerPlant.toFixed(2)} L/Día</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Demanda Transpirativa</span>
                              <span className="metric-val" style={{ color: vpd > 1.2 ? '#FF4D4D' : vpd < 0.6 ? '#00DFFF' : '#00FF88' }}>
                                {vpd > 1.2 ? 'Alta (Seco)' : vpd < 0.6 ? 'Baja (Muy Húmedo)' : 'Óptima'}
                              </span>
                            </div>
                          </div>

                          <div className="pro-advice-tip water-tip-border">
                            📢 <strong>Guía de Riego Basada en DPV:</strong><br />
                            {vpd < 0.6 && "⚠️ DPV MUY BAJO: Tus plantas transpiran muy lento. El sustrato se secará despacio. Riega con volúmenes moderados y espacia más los riegos para evitar asfixia radicular y hongos en las raíces."}
                            {vpd >= 0.6 && vpd <= 1.2 && "🟢 DPV ÓPTIMO: Las plantas transpiran de forma fluida y sana. Los riegos pueden seguir el patrón estándar, ya que el ciclo húmedo/seco del sustrato se completa de forma natural y óptima."}
                            {vpd > 1.2 && "⚠️ DPV ALTO: Alta demanda hídrica. Las plantas pierden agua rápidamente para no quemarse. Necesitarás regar con mayor frecuencia o aumentar el volumen de riego diario para evitar marchitamiento por estrés hídrico."}
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
                    
                    <div className="module-form-grid">
                      <div className="form-group">
                        <label>Costo del kWh (en tu moneda local): <strong>${kwhCost.toFixed(2)}</strong></label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={kwhCost} 
                          onChange={(e) => setKwhCost(parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Potencia Eléctrica del Equipo (en Watts): <strong>{deviceWatts} W</strong></label>
                        <input 
                          type="range" 
                          min="10" 
                          max="2000" 
                          step="10" 
                          value={deviceWatts} 
                          onChange={(e) => setDeviceWatts(parseInt(e.target.value))} 
                        />
                        <span className="slider-limits">Clones/LED: 20W | Deshum/Sodio: 1000W+</span>
                      </div>
                      <div className="form-group">
                        <label>Horas de Funcionamiento Diario: <strong>{deviceHours} hs</strong></label>
                        <input 
                          type="range" 
                          min="1" 
                          max="24" 
                          step="1" 
                          value={deviceHours} 
                          onChange={(e) => setDeviceHours(parseInt(e.target.value))} 
                        />
                        <span className="slider-limits">Mín: 1h | Máx: 24h</span>
                      </div>
                    </div>

                    {(() => {
                      const dailyKwh = (deviceWatts * deviceHours) / 1000;
                      const dailyCost = dailyKwh * kwhCost;
                      const monthlyCost = dailyCost * 30;
                      const co2Footprint = dailyKwh * 0.4 * 30; // 0.4kg CO2 por kWh promedio

                      return (
                        <div className="module-results glow-border">
                          <h4>Consumo y Costo Proyectado del Equipo:</h4>
                          <div className="metrics-grid">
                            <div className="metric-box cost-bg">
                              <span className="metric-label">Costo Mensual</span>
                              <span className="metric-val">${monthlyCost.toFixed(2)}</span>
                            </div>
                            <div className="metric-box cost-bg">
                              <span className="metric-label">Consumo Diario</span>
                              <span className="metric-val">{dailyKwh.toFixed(2)} kWh</span>
                            </div>
                            <div className="metric-box">
                              <span className="metric-label">Huella CO2</span>
                              <span className="metric-val">{co2Footprint.toFixed(1)} kg/Mes</span>
                            </div>
                          </div>

                          <div className="pro-advice-tip cost-tip-border">
                            💡 <strong>Consejo de Eficiencia Energética:</strong><br />
                            Ajustar el DPV usando **Modo Smart (Auto)** te permite apagar o reducir la potencia de tus extractores y humidificadores en los momentos óptimos, reduciendo tu consumo eléctrico mensual entre un 15% y un 30%.
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
                    <p className="module-desc">Ponte a prueba, Maestro de las Sombras. Responde correctamente estas tres preguntas científicas de precisión para demostrar tus conocimientos y desbloquear tu medalla virtual.</p>

                    <div className="quiz-container">
                      {/* Pregunta 1 */}
                      <div className="quiz-question-box">
                        <h5>1. ¿Dónde ocurre de manera fisiológica el DPV real de tu cultivo?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'A' })}>
                            A. En el sensor de humedad que cuelga de la pared.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'B' })}>
                            B. En la superficie de la hoja, regulado por los estomas. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q1 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q1: 'C' })}>
                            C. Directamente en los focos LED de la sala.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 2 */}
                      <div className="quiz-question-box">
                        <h5>2. ¿Qué acción realizan los estomas de las hojas ante un DPV críticamente alto (ej: 2.2 kPa)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'A' })}>
                            A. Se abren de par en par para liberar la máxima cantidad de agua posible.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'B' })}>
                            B. Explotan debido a la presión interna acumulada del agua.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'C' })}>
                            C. Se cierran herméticamente para evitar que la planta muera deshidratada. (Correcto)
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 3 */}
                      <div className="quiz-question-box">
                        <h5>3. ¿Por qué la transición de luces encendidas a apagadas (Lights-Off) es el momento de mayor riesgo de moho?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'A' })}>
                            A. Porque la temperatura de la hoja cae por debajo del punto de rocío y condensa agua. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'B' })}>
                            B. Porque las plantas necesitan oscuridad absoluta para transpirar a su máximo nivel.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'C' })}>
                            C. Porque el DPV del aire se vuelve infinito al apagarse las luces.
                          </button>
                        </div>
                      </div>

                      {!quizSubmitted ? (
                        <button 
                          className="quiz-submit-btn" 
                          onClick={() => {
                            if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3) return;
                            let score = 0;
                            if (quizAnswers.q1 === 'B') score++;
                            if (quizAnswers.q2 === 'C') score++;
                            if (quizAnswers.q3 === 'A') score++;
                            setQuizScore(score);
                            setQuizSubmitted(true);
                          }}
                          disabled={!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3}
                        >
                          Enviar Respuestas e Inspeccionar Resultados
                        </button>
                      ) : (
                        <div className="quiz-submitted-box glow-border">
                          {quizScore === 3 ? (
                            <div className="quiz-success">
                              <span className="medal-emoji">🏆</span>
                              <h4>¡FELICIDADES MAESTRO DEL DPV!</h4>
                              <p>Has respondido las 3 preguntas correctamente de manera perfecta. Tu nivel de comprensión fisiológica vegetal es de élite.</p>
                              <div className="virtual-badge-card">
                                <strong>🥇 MEDALLA: MAESTRO SHADOW DEL DPV</strong>
                                <span>DPV PRO ACADEMY &copy; 2026</span>
                              </div>
                            </div>
                          ) : (
                            <div className="quiz-fail">
                              <h4>Resultado: {quizScore}/3 correctas</h4>
                              <p>Tienes potencial de cultivador experto, pero aún quedan algunos conceptos por afinar para no arriesgar tus flores.</p>
                              <button className="quiz-reset-btn" onClick={() => {
                                setQuizAnswers({ q1: '', q2: '', q3: '' });
                                setQuizSubmitted(false);
                                setQuizScore(0);
                              }}>
                                Intentar Nuevamente la Trivia
                              </button>
                            </div>
                          )}
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
