import { Activity } from 'lucide-react';

function ConsoleView({
  vpd,
  temp,
  activeHumidity,
  leafOffset,
  selectedStrain,
  status,
  setConsoleModeActive
}) {
  return (
    <div className="console-mode-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      {/* Glow de estado ambiental de fondo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: vpd < 0.2 
          ? 'radial-gradient(circle, rgba(255, 77, 77, 0.12) 0%, rgba(0,0,0,0) 70%)'
          : vpd > 1.6
            ? 'radial-gradient(circle, rgba(208, 0, 255, 0.12) 0%, rgba(0,0,0,0) 70%)'
            : 'radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        transition: 'all 1s ease'
      }} />

      <div style={{ position: 'absolute', top: '20px', display: 'flex', justifyContent: 'space-between', width: '90%', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="#00FF88" className="icon-pulse" />
          <strong style={{ fontSize: '1.2rem', letterSpacing: '2px', color: '#00FF88' }}>DPV CONSOLE <span style={{ color: '#fff', fontSize: '0.8rem', verticalAlign: 'super' }}>v0.8</span></strong>
        </div>
        <button 
          onClick={() => setConsoleModeActive(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            fontFamily: 'inherit'
          }}
        >
          ❌ SALIR DE CONSOLA
        </button>
      </div>

      {/* Gran Display de DPV */}
      <div style={{ textAlign: 'center', margin: '40px 0', zIndex: 1 }}>
        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', letterSpacing: '4px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
          DÉFICIT DE PRESIÓN DE VAPOR
        </span>
        <div style={{
          fontSize: 'min(18vw, 150px)',
          fontWeight: 900,
          lineHeight: 1,
          color: status.color,
          textShadow: `0 0 40px ${status.color}33`,
          letterSpacing: '-2px',
          fontFamily: 'sans-serif',
          transition: 'color 0.4s'
        }}>
          {vpd.toFixed(2)} <span style={{ fontSize: 'min(5vw, 40px)', fontWeight: 500 }}>kPa</span>
        </div>
        
        <div style={{
          display: 'inline-block',
          marginTop: '20px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: status.color,
          backgroundColor: status.color + '22',
          border: `1px solid ${status.color}55`,
          padding: '6px 20px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {status.label}
        </div>
      </div>

      {/* Métricas secundarias gigantes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        width: '90%', 
        maxWidth: '1000px', 
        zIndex: 1,
        marginTop: '20px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>TEMP. AIRE</span>
          <strong style={{ fontSize: '2.2rem', color: '#FF4D4D' }}>{temp.toFixed(1)}°C</strong>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>HUM. RELATIVA</span>
          <strong style={{ fontSize: '2.2rem', color: '#00FF88' }}>{activeHumidity}%</strong>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>OFFSET HOJA</span>
          <strong style={{ fontSize: '2.2rem', color: '#A0B0A0' }}>{leafOffset}°C</strong>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', display: 'block' }}>PERFIL ACTIVO</span>
          <strong style={{ fontSize: '1rem', color: selectedStrain.type === 'indica' ? '#FF4D4D' : selectedStrain.type === 'sativa' ? '#00DFFF' : selectedStrain.type === 'ruderalis' ? '#D000FF' : '#00FF88', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>
            {selectedStrain.name}
          </strong>
        </div>
      </div>

      {/* Barra inferior de estado audible */}
      <div style={{ 
        position: 'absolute', 
        bottom: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '0.8rem', 
        color: 'var(--text-secondary)',
        background: 'rgba(255,255,255,0.01)',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00FF88', display: 'inline-block', boxShadow: '0 0 8px #00FF88' }} className="icon-pulse" />
        <span>SISTEMA DE ASISTENCIA POR VOZ ACTIVO (ALERTA AUTOMÁTICA DETECTADA)</span>
      </div>
    </div>
  );
}

export default ConsoleView;
