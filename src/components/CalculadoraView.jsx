import { Thermometer, Droplets, Leaf, Zap, HelpCircle, Sparkles } from 'lucide-react';

function CalculadoraView({
  stage,
  setStage,
  activeStrain,
  setActiveStrain,
  mode,
  setMode,
  temp,
  setTemp,
  setHumidity,
  leafOffset,
  setLeafOffset,
  activeHumidity,
  vpd,
  status,
  advice,
  stomaState,
  stomaPaths,
  targets,
  targetVpd,
  genetics,
  BOTANICAL_ARCHETYPES,
  renderAdSenseBanner
}) {
  return (
    <>
      <section className="stage-selector-container">
        <div className="stage-selector glass" role="tablist" aria-label="Etapa de cultivo">
          {Object.keys(targets).map((s) => (
            <button 
              key={s} 
              className={`stage-btn ${stage === s ? 'active' : ''}`} 
              onClick={() => setStage(s)}
              role="tab"
              aria-selected={stage === s}
              aria-controls="calc-controls"
              id={`stage-tab-${s}`}
            >
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
          <label htmlFor="genetics-select" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}>🧬 Perfil Genético:</label>
          <select 
            id="genetics-select"
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
        
        <div className="mode-selector glass" role="tablist" aria-label="Modo de cálculo">
          <button 
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`} 
            onClick={() => setMode('manual')}
            role="tab"
            aria-selected={mode === 'manual'}
            id="mode-tab-manual"
          >
            🎛️ Manual
          </button>
          <button 
            className={`mode-btn ${mode === 'smart' ? 'active' : ''}`} 
            onClick={() => setMode('smart')}
            role="tab"
            aria-selected={mode === 'smart'}
            id="mode-tab-smart"
          >
            <Sparkles size={14} className="sparkle-icon" /> Smart (Auto)
          </button>
        </div>
      </section>

      <section className="main-display glass" id="calc-controls">
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
              <label htmlFor="temp-slider" style={{ cursor: 'pointer', fontWeight: 'bold' }}><h3>Temp. Aire</h3></label>
              <div className="tooltip">
                <HelpCircle size={16} className="help-icon" />
                <span className="tooltip-text">La temperatura ambiental de tu sala de cultivo. Afecta directamente la capacidad del aire para retener humedad.</span>
              </div>
            </div>
            <span className="value-badge">{temp.toFixed(1)}°C</span>
          </div>
          <input 
            type="range" 
            id="temp-slider"
            min="10" 
            max="40" 
            step="0.5" 
            value={temp} 
            onChange={(e) => setTemp(parseFloat(e.target.value))} 
            aria-label="Temperatura del aire"
            aria-valuemin={10}
            aria-valuemax={40}
            aria-valuenow={temp}
          />
        </div>

        <div className={`control-card glass ${mode === 'smart' ? 'smart-locked' : ''}`}>
          <div className="control-header">
            <div className="title-with-help">
              <Droplets size={20} color="#00FF88" />
              <label htmlFor="humidity-slider" style={{ cursor: 'pointer', fontWeight: 'bold' }}><h3>Hum. Relativa</h3></label>
              <div className="tooltip">
                <HelpCircle size={16} className="help-icon" />
                <span className="tooltip-text">
                  {mode === 'smart' 
                    ? "Bloqueado en Modo Smart. La humedad ideal se auto-calcula continuamente para ti." 
                    : "Humedad relativa del aire. Mide la cantidad de agua presente en relación con el máximo posible."
                  }
                </span>
              </div>
            </div>
            <span className="value-badge">{activeHumidity}%</span>
          </div>
          <input 
            type="range" 
            id="humidity-slider"
            min="30" 
            max="90" 
            step="1" 
            value={activeHumidity} 
            onChange={(e) => setHumidity(parseFloat(e.target.value))}
            disabled={mode === 'smart'} 
            aria-label="Humedad relativa"
            aria-valuemin={30}
            aria-valuemax={90}
            aria-valuenow={activeHumidity}
          />
          {mode === 'smart' && (
            <p className="smart-lock-notice">SNAPPED: Automatizado para DPV óptimo ({targetVpd.toFixed(1)} kPa)</p>
          )}
        </div>

        <div className="control-card glass">
          <div className="control-header">
            <div className="title-with-help">
              <Leaf size={20} color="#A0B0A0" />
              <label htmlFor="leaf-offset-slider" style={{ cursor: 'pointer', fontWeight: 'bold' }}><h3>Offset Hoja</h3></label>
              <div className="tooltip">
                <HelpCircle size={16} className="help-icon" />
                <span className="tooltip-text">Diferencia entre la temp. de la hoja y el aire. Bajo luces LED suele ser -2°C o -3°C porque la planta se enfría al transpirar.</span>
              </div>
            </div>
            <span className="value-badge">{leafOffset}°C</span>
          </div>
          <input 
            type="range" 
            id="leaf-offset-slider"
            min="-5" 
            max="2" 
            step="0.5" 
            value={leafOffset} 
            onChange={(e) => setLeafOffset(parseFloat(e.target.value))} 
            aria-label="Offset térmico de la hoja"
            aria-valuemin={-5}
            aria-valuemax={2}
            aria-valuenow={leafOffset}
          />
        </div>
      </section>
      {renderAdSenseBanner && renderAdSenseBanner("Dashboard Calculadora Horizontal")}
    </>
  );
}

export default CalculadoraView;
