import React, { useState, useMemo } from 'react';
import { calculateVPD, getVPDStatus, getSmartAdvice, generateTableData } from './utils/calculations';
import { Thermometer, Droplets, Leaf, Info, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle, Heart, Target } from 'lucide-react';
import './App.css';

function App() {
  const [view, setView] = useState('calc'); 
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [leafOffset, setLeafOffset] = useState(-2);
  const [stage, setStage] = useState('veg');

  const targets = {
    early: { min: 0.4, max: 0.8, name: 'Esquejes' },
    veg: { min: 0.8, max: 1.2, name: 'Vegetativo' },
    flower: { min: 1.2, max: 1.6, name: 'Floración' }
  };

  const vpd = useMemo(() => calculateVPD(temp, humidity, leafOffset), [temp, humidity, leafOffset]);
  const status = useMemo(() => getVPDStatus(vpd), [vpd]);
  const advice = useMemo(() => getSmartAdvice(vpd, temp, humidity, targets[stage].min, targets[stage].max), [vpd, temp, humidity, stage]);

  const tableData = useMemo(() => generateTableData({ min: 15, max: 35 }, leafOffset), [leafOffset]);
  const humidities = Array.from({ length: 21 }, (_, i) => 100 - i * 5);

  const handleCellClick = (t, h) => {
    setTemp(t);
    setHumidity(h);
    setView('calc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <section className="stage-selector glass">
              {Object.keys(targets).map((s) => (
                <button key={s} className={`stage-btn ${stage === s ? 'active' : ''}`} onClick={() => setStage(s)}>
                  {targets[s].name}
                </button>
              ))}
            </section>

            <section className="main-display glass">
              <div className="vpd-value-container">
                <span className="vpd-label">DÉFICIT DE PRESIÓN DE VAPOR</span>
                <div className="vpd-value glow-text" style={{ color: status.color }}>
                  {vpd.toFixed(2)} <span className="unit">kPa</span>
                </div>
                <div className="vpd-status" style={{ backgroundColor: status.color + '33', color: status.color, border: `1px solid ${status.color}` }}>
                  {status.label}
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

              <div className="control-card glass">
                <div className="control-header">
                  <div className="title-with-help">
                    <Droplets size={20} color="#00FF88" />
                    <h3>Hum. Relativa</h3>
                    <div className="tooltip">
                      <HelpCircle size={16} className="help-icon" />
                      <span className="tooltip-text">Porcentaje de agua en el aire respecto al máximo posible. Humedades altas bajan el DPV y viceversa.</span>
                    </div>
                  </div>
                  <span className="value-badge">{humidity}%</span>
                </div>
                <input type="range" min="0" max="100" step="1" value={humidity} onChange={(e) => setHumidity(parseFloat(e.target.value))} />
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
                          className={`vpd-cell ${Math.abs(temp - row.temp) < 0.1 && Math.abs(humidity - v.humidity) < 0.1 ? 'selected' : ''}`}
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
          <Heart size={20} color="#FF4D4D" />
          <p>¿Te sirve esta herramienta? Apóyanos para seguir mejorando el proyecto.</p>
          <button className="support-btn">Invítanos un café ☕</button>
        </section>

        <div className="ad-slot-bottom glass">
          <span className="ad-placeholder">PUBLICIDAD - BANNER INFERIOR</span>
        </div>
      </main>

      <footer>
        <p>DPV PRO &copy; 2026 - Master Precision Tools</p>
      </footer>
    </div>
  );
}

export default App;
