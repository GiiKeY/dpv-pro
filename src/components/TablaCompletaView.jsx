function TablaCompletaView({
  leafOffset,
  humidities,
  tableData,
  temp,
  activeHumidity,
  handleCellClick,
  renderAdSenseBanner,
  stage,
  setStage,
  targets
}) {
  return (
    <section className="table-view glass">
      <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
          <h3>Gráfico Científico de DPV</h3>
          <p style={{ margin: '4px 0 0 0' }}>Valores calculados con un offset de hoja de {leafOffset}°C.</p>
        </div>

        {/* Selector de Etapa Dinámico */}
        <div className="stage-selector glass" role="tablist" aria-label="Etapa de cultivo en tabla" style={{ margin: 0, padding: '4px', borderRadius: '10px' }}>
          {Object.keys(targets).map((s) => (
            <button 
              key={s} 
              className={`stage-btn ${stage === s ? 'active' : ''}`} 
              onClick={() => setStage(s)}
              role="tab"
              aria-selected={stage === s}
              id={`table-stage-tab-${s}`}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {targets[s].name.split(' ')[0]} {/* Ej: Esquejes, Vegetativo, Floración */}
            </button>
          ))}
        </div>
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
      {renderAdSenseBanner && renderAdSenseBanner("Tabla Científica Inferior")}
    </section>
  );
}

export default TablaCompletaView;
