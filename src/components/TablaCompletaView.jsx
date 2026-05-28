function TablaCompletaView({
  leafOffset,
  humidities,
  tableData,
  temp,
  activeHumidity,
  handleCellClick,
  renderAdSenseBanner
}) {
  return (
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
      {renderAdSenseBanner && renderAdSenseBanner("Tabla Científica Inferior")}
    </section>
  );
}

export default TablaCompletaView;
