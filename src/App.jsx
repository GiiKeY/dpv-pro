import React, { useState, useMemo } from 'react';
import { calculateVPD, getVPDStatus, getSmartAdvice, generateTableData } from './utils/calculations';
import { Thermometer, Droplets, Leaf, Info, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle } from 'lucide-react';
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
        <p className="subtitle">Herramienta de Precisión para Cultivadores de Elite</p>
      </header>

      <nav className="view-switcher glass">
        <button className={`view-btn ${view === 'calc' ? 'active' : ''}`} onClick={() => setView('calc')}>
          <LayoutGrid size={18} /> Calculadora
        </button>
        <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>
          <TableIcon size={18} /> Tabla DPV
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
                      <span className="tooltip-text">La temperatura ambiental de tu sala de cultivo.</span>
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
                      <span className="tooltip-text">Humedad en el aire.</span>
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
                      <span className="tooltip-text">Diferencia Temp Hoja/Aire. LED: -2°C | Sodio: +1°C.</span>
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
              <h3>Tabla Interactiva DPV</h3>
              <p>Basado en offset de hoja de {leafOffset}°C.</p>
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
                      <td className="temp-cell sticky-col">{row.temp}°C</td>
                      {row.values.map((v, idx) => (
                        <td 
                          key={idx} 
                          className={`vpd-cell ${temp === row.temp && humidity === v.humidity ? 'selected' : ''}`}
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

        <section className="info-section glass">
          <h3><Info size={18} /> ¿Qué es el DPV y por qué importa?</h3>
          <p>El Déficit de Presión de Vapor (DPV) mide cuánta agua "succiona" el aire de tus plantas. Mantenerlo en el rango ideal garantiza una fotosíntesis máxima y evita moho.</p>
          <div className="info-grid">
            <div className="info-item">
              <ChevronRight size={16} className="chevron" />
              <span><strong>Clones:</strong> 0.4 - 0.8 kPa</span>
            </div>
            <div className="info-item">
              <ChevronRight size={16} className="chevron" />
              <span><strong>Veg:</strong> 0.8 - 1.2 kPa</span>
            </div>
            <div className="info-item">
              <ChevronRight size={16} className="chevron" />
              <span><strong>Flor:</strong> 1.2 - 1.6 kPa</span>
            </div>
          </div>
        </section>

        {/* Único espacio publicitario (Integrado) */}
        <div className="ad-box glass">
          <div className="ad-tag">ANUNCIO</div>
          <p>Contenido patrocinado - Espacio para AdSense</p>
        </div>
      </main>

      <footer>
        <p>DPV PRO &copy; 2026 - Herramienta Profesional de Precisión</p>
      </footer>
    </div>
  );
}

export default App;
