import React, { useState, useMemo, useEffect } from 'react';
import { calculateVPD, getVPDStatus, getSmartAdvice, generateTableData, calculateIdealHumidity } from './utils/calculations';
import { Thermometer, Droplets, Leaf, Info, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle, Heart, Target, Coffee, Copy, Check, X, Sparkles } from 'lucide-react';
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

  const targets = {
    early: { min: 0.4, max: 0.8, name: 'Esquejes' },
    veg: { min: 0.8, max: 1.2, name: 'Vegetativo' },
    flower: { min: 1.2, max: 1.6, name: 'Floración' }
  };

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
      </nav>

      <main>
        {view === 'calc' ? (
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
        ) : (
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

              {/* USDT Cripto */}
              <div className="payment-card glass" onClick={() => handleCopy('TXj3vJd1f8N9SgK5kRqp4L8vWjQ8xYt7mD', 'usdt')}>
                <div className="payment-card-header">
                  <h4>USDT (TRC-20)</h4>
                  <span className="payment-badge crypto">Cripto 🪙</span>
                </div>
                <div className="copy-field">
                  <code className="crypto-address">TXj3vJd1f8N9...</code>
                  <button className="copy-btn">
                    {copiedText === 'usdt' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar la dirección TRC-20.</p>
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
