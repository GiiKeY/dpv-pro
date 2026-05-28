import { 
  Thermometer, Droplets, Leaf, Zap, Target, Coffee, Sparkles, 
  AlertTriangle, Award, Activity, Compass, Shield, Lock, FileText 
} from 'lucide-react';

function HerramientasProView({
  activeProTool, setActiveProTool, isPremium, setIsPremium, isPaymentProcessing, setIsPaymentProcessing,
  billingCycle, setBillingCycle, checkoutCardName, setCheckoutCardName, checkoutCardNumber, setCheckoutCardNumber,
  checkoutCardExpiry, setCheckoutCardExpiry, checkoutCardCvc, setCheckoutCardCvc, paymentHistory, setPaymentHistory,
  setSelectedInvoice, showCancelConfirm, setShowCancelConfirm, nightTempDrop, setNightTempDrop, temp, activeHumidity,
  predictNightRH, calculateDewPoint, roomWidth, setRoomWidth, roomLength, setRoomLength, roomHeight, setRoomHeight,
  adminConfig, activeStrain, setActiveStrain, BOTANICAL_ARCHETYPES, selectedStrain, ppfdInput, setPpfdInput,
  lightType, setLightType, lightDistance, setLightDistance, airflowQuality, setAirflowQuality, vpd, genetics,
  calculateStomatalConductance, calculateTranspirationRate, calculateEstimatedLeafTemp, calculateOsmoticStress,
  calculatePhotosyntheticEfficiency, soilEc, setSoilEc, plantsCount, setPlantsCount, potSize, setPotSize,
  substrate, setSubstrate, calculateEvapotranspiration, calculateWateringFrequency, kwhCost, setKwhCost,
  activeDevices, setActiveDevices, deviceWattsMap, setDeviceWattsMap, deviceHoursMap, setDeviceHoursMap,
  profiles, setProfiles, profileNameInput, setProfileNameInput, handleSaveProfile, handleLoadProfile,
  handleDeleteProfile, profileError, setProfileError, profileSuccess, setProfileSuccess, showLimitWarning,
  setShowLimitWarning, selectedSensor, setSelectedSensor, copiedText, setCopiedText, setIsPrinting,
  triggerSponsorContact, setShowLedSavingsModal, adSlots, setAdSlots, toggleAdSlot, triggerInterstitial,
  lightIntensity, setLightIntensity, leafAreaIndex, setLeafAreaIndex, sporeTimer, targets, stage,
  leafOffset, setLeafOffset, auditSections
}) {
  return (

  <section className="pro-tools-view glass">
    <div className="pro-layout">
      {/* Menú lateral Pro */}
      <aside className="pro-sidebar">
        <h3>Módulos Avanzados</h3>
        <nav className="pro-nav">
          {/* CATEGORÍA 1: CLIMA DE PRECISIÓN */}
          <div className="sidebar-category">
            <div className="sidebar-category-header clima">
              🌡️ Clima de Precisión
            </div>
            <button className={`pro-nav-btn premium-nav-btn ${activeProTool === 'premium' ? 'active' : ''}`} onClick={() => setActiveProTool('premium')} style={{ border: '1px solid #FFD600', boxShadow: activeProTool === 'premium' ? '0 0 10px rgba(255, 214, 0, 0.4)' : '0 0 5px rgba(255, 214, 0, 0.1)', background: activeProTool === 'premium' ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(0, 0, 0, 0.4))' : 'rgba(255, 214, 0, 0.02)' }}>
              ⭐ Perfiles & DPV Premium
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'nocturno' ? 'active' : ''}`} onClick={() => setActiveProTool('nocturno')}>
              🌙 Predictor Nocturno
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'extraccion' ? 'active' : ''}`} onClick={() => setActiveProTool('extraccion')}>
              🌬️ Extracción de Aire
            </button>
          </div>

          {/* CATEGORÍA 2: FISIOLOGÍA & LUZ */}
          <div className="sidebar-category">
            <div className="sidebar-category-header fisiologia">
              🌿 Fisiología & Luz
            </div>
            <button className={`pro-nav-btn ${activeProTool === 'genetica' ? 'active' : ''}`} onClick={() => setActiveProTool('genetica')}>
              🧬 Fisiología Genética
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'riego' ? 'active' : ''}`} onClick={() => setActiveProTool('riego')}>
              💧 Demanda de Riego
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'costo' ? 'active' : ''}`} onClick={() => setActiveProTool('costo')}>
              ⚡ Consumo Eléctrico
            </button>
          </div>

          {/* CATEGORÍA 3: GESTIÓN & SOCIOS */}
          <div className="sidebar-category">
            <div className="sidebar-category-header admin">
              ⚙️ Gestión & Socios
            </div>
            <button className={`pro-nav-btn ${activeProTool === 'directorio' ? 'active' : ''}`} onClick={() => setActiveProTool('directorio')}>
              🗺️ Locales Aliados
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'reporte' ? 'active' : ''}`} onClick={() => setActiveProTool('reporte')}>
              📊 Ficha y Reporte
            </button>
            <button className={`pro-nav-btn ${activeProTool === 'anuncios' ? 'active' : ''}`} onClick={() => setActiveProTool('anuncios')}>
              ⚙️ Panel de Anuncios
            </button>
          </div>
        </nav>
      </aside>

      {/* Panel de Visualización del Módulo Activo */}
      <div className="pro-panel">
         {activeProTool === 'premium' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {!isPremium ? (
              <div className="premium-card glow-border" style={{ 
                padding: '30px', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.04), rgba(5, 8, 5, 0.75))', 
                border: '1px solid rgba(255, 214, 0, 0.35)',
                marginBottom: '30px',
                textAlign: 'center',
                position: 'relative'
              }}>
                {/* SIMULADOR DE PROCESAMIENTO SEGURO OVERLAY */}
                {isPaymentProcessing && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(5, 8, 5, 0.95)',
                    borderRadius: '16px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px'
                  }}>
                    <div className="quantum-loader" style={{ width: '70px', height: '70px', marginBottom: '20px' }}>
                      <div className="quantum-ring" style={{ borderTopColor: '#FFD600' }}></div>
                      <div className="quantum-ring" style={{ borderRightColor: '#00FF88', width: '80%', height: '80%', top: '10%', left: '10%' }}></div>
                      <div className="quantum-core" style={{ top: '27px', left: '27px', background: '#FFD600', boxShadow: '0 0 15px #FFD600' }}></div>
                    </div>
                    <Lock size={28} color="#FFD600" className="icon-pulse" style={{ marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 8px 0', color: '#FFD600', fontSize: '1.1rem', letterSpacing: '0.5px' }}>Procesando Pago Seguro...</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, maxWidth: '380px', lineHeight: '1.4' }}>
                      Estableciendo conexión TLS 1.3 cifrada de 256 bits y verificando credenciales bancarias de forma segura con Stripe Gateway...
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <Sparkles size={36} color="#FFD600" className="icon-pulse" style={{ marginBottom: '10px' }} />
                  <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#FFD600', textShadow: '0 0 15px rgba(255, 214, 0, 0.35)', fontWeight: '800' }}>
                    Suscripción DPV PRO Premium ⭐
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '600px', margin: '10px auto 0 auto', lineHeight: '1.45' }}>
                    Desbloquea el máximo potencial científico para tu cultivo. Elimina anuncios, guarda perfiles ilimitados y optimiza tus tiempos sin esperas comerciales.
                  </p>
                </div>

                {/* Premium Features Checklist */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '15px', 
                  textAlign: 'left', 
                  margin: '20px auto 25px auto',
                  maxWidth: '800px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 214, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', alignItems: 'center' }}>
                    <span style={{ color: '#FFD600', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Perfiles Ilimitados:</strong> Guarda infinitas salas de cultivo (Free: 1 slot).</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', alignItems: 'center' }}>
                    <span style={{ color: '#FFD600', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Carga Instantánea:</strong> Sin delay de 2.5s en reportes ni simuladores.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', alignItems: 'center' }}>
                    <span style={{ color: '#FFD600', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Interfaz Sin Anuncios:</strong> Banners patrocinados reemplazados por consejos biológicos.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.82rem', alignItems: 'center' }}>
                    <span style={{ color: '#FFD600', fontWeight: 'bold' }}>✓</span>
                    <span><strong>Insignia Dorada:</strong> Sello Premium en tu app e informes de auditoría PDF.</span>
                  </div>
                </div>

                {/* Interactive Checkout Area */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  maxWidth: '900px',
                  margin: '0 auto',
                  textAlign: 'left'
                }}>
                  {/* Col 1: Plan Selector & Payment Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      1. Selecciona tu Plan:
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Plan Anual */}
                      <div 
                        onClick={() => setBillingCycle('annual')}
                        style={{ 
                          border: billingCycle === 'annual' ? '2px solid #FFD600' : '1px solid rgba(255,255,255,0.08)', 
                          background: billingCycle === 'annual' ? 'rgba(255, 214, 0, 0.05)' : 'rgba(255,255,255,0.01)', 
                          padding: '14px', 
                          borderRadius: '10px', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        <span style={{ 
                          position: 'absolute',
                          top: '-8px',
                          right: '12px',
                          background: '#FFD600',
                          color: '#050805',
                          fontSize: '0.6rem',
                          fontWeight: '900',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          textTransform: 'uppercase',
                          boxShadow: '0 0 10px rgba(255,214,0,0.4)'
                        }}>
                          Mejor Opción - Ahorra 33% 🌟
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: billingCycle === 'annual' ? '#FFD600' : '#fff' }}>DPV PRO Premium Anual</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Facturado una vez al año. Soporte premium incluido.</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#00FF88' }}>$39.99 USD</span>
                            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)' }}>equivale a $3.33/mes</span>
                          </div>
                        </div>
                      </div>

                      {/* Plan Mensual */}
                      <div 
                        onClick={() => setBillingCycle('monthly')}
                        style={{ 
                          border: billingCycle === 'monthly' ? '2px solid #FFD600' : '1px solid rgba(255,255,255,0.08)', 
                          background: billingCycle === 'monthly' ? 'rgba(255, 214, 0, 0.05)' : 'rgba(255,255,255,0.01)', 
                          padding: '14px', 
                          borderRadius: '10px', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: billingCycle === 'monthly' ? '#FFD600' : '#fff' }}>DPV PRO Premium Mensual</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cancela en cualquier momento de forma simple.</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>$4.99 USD</span>
                            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)' }}>facturado mensualmente</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Pago */}
                    <div className="glass" style={{ padding: '15px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)', marginTop: '5px' }}>
                      <strong style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Resumen del Pago:</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span>DPV PRO Premium ({billingCycle === 'annual' ? '1 Año' : '1 Mes'}):</span>
                        <span>{billingCycle === 'annual' ? '$39.99 USD' : '$4.99 USD'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span>Cifrado SSL 256 bits:</span>
                        <span style={{ color: '#00FF88' }}>GRATIS</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        <span>Impuestos aplicados (IVA):</span>
                        <span>$0.00 USD</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '6px', color: '#fff' }}>
                        <span>Total a pagar hoy:</span>
                        <span style={{ color: '#FFD600' }}>{billingCycle === 'annual' ? '$39.99 USD' : '$4.99 USD'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Secure Payment Form */}
                  <div className="glass" style={{ 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={15} color="#FFD600" /> Tarjeta de Crédito o Débito
                      </h4>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {/* Miniatures of card types */}
                        <Shield size={14} color="#00FF88" />
                        <span style={{ fontSize: '0.6rem', color: '#00FF88', fontWeight: 'bold', letterSpacing: '0.5px' }}>SSL SECURE</span>
                      </div>
                    </div>

                    {/* Titular */}
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>NOMBRE DEL TITULAR:</label>
                      <input 
                        type="text" 
                        value={checkoutCardName}
                        onChange={(e) => setCheckoutCardName(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        style={{ 
                          width: '100%', 
                          background: 'rgba(0,0,0,0.5)', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          color: '#fff', 
                          padding: '8px 12px', 
                          borderRadius: '6px', 
                          fontSize: '0.8rem',
                          outline: 'none'
                        }} 
                      />
                    </div>

                    {/* Número de Tarjeta con Detección Dinámica */}
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>NÚMERO DE TARJETA:</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={checkoutCardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setCheckoutCardNumber(formatted.substring(0, 19));
                          }}
                          placeholder="4000 1234 5678 9010" 
                          style={{ 
                            width: '100%', 
                            background: 'rgba(0,0,0,0.5)', 
                            border: checkoutCardNumber.replace(/\s/g, '').length === 16 ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.08)', 
                            color: '#fff', 
                            padding: '8px 45px 8px 12px', 
                            borderRadius: '6px', 
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            outline: 'none',
                            letterSpacing: '1px'
                          }} 
                        />
                        {/* Dinámicas de Logos de Franquicias */}
                        <div style={{ position: 'absolute', right: '10px', display: 'flex', gap: '4px' }}>
                          {/* Visa */}
                          <svg width="24" height="15" viewBox="0 0 24 15" style={{ opacity: checkoutCardNumber.startsWith('4') ? 1 : 0.25, transition: 'opacity 0.2s' }}>
                            <rect width="24" height="15" rx="2" fill="#1A1F71"/>
                            <path d="M5.1 11.2l.9-4.2h1.6l-.9 4.2H5.1zm5.9-4.2c-.4-.2-.9-.4-1.4-.4-.8 0-1.6.4-1.6 1.2 0 1 .9 1.1 1.5 1.4.3.1.5.3.5.6 0 .5-.6.7-1.1.7-.8 0-1.2-.2-1.5-.4L7 11.1c.3.2.9.4 1.5.4 1.2 0 1.9-.6 1.9-1.5 0-1-.8-1.2-1.5-1.5-.4-.2-.6-.3-.6-.6 0-.3.3-.5.9-.5.6 0 1 .2 1.2.3l.6-1.1zm6-1c-.3 0-.6.2-.8.5l-2.6 6.1h1.7l.3-.9h2.1l.2.9H19l-1.5-6.6h-.5zm-1 3.9l.7-2 .4 2h-1.1zM2.8 6l-.3 1.3C2.3 8 2.1 8.5 2 9.1L1.2 6H0l1.9 8.2h1.6l2.4-8.2H2.8z" fill="#FFF"/>
                          </svg>
                          {/* Mastercard */}
                          <svg width="24" height="15" viewBox="0 0 24 15" style={{ opacity: checkoutCardNumber.startsWith('5') ? 1 : 0.25, transition: 'opacity 0.2s' }}>
                            <rect width="24" height="15" rx="2" fill="#0A0909"/>
                            <circle cx="9.5" cy="7.5" r="5" fill="#EB001B" opacity="0.9"/>
                            <circle cx="14.5" cy="7.5" r="5" fill="#F79E1B" opacity="0.9"/>
                            <path d="M12 4.1c1-.8 2-.8 3 0-1 .8-2 .8-3 0z" fill="#FF5F00"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Vencimiento y CVC */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>VENCIMIENTO:</label>
                        <input 
                          type="text" 
                          value={checkoutCardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
                            let formatted = val;
                            if (val.length > 2) {
                              formatted = val.substring(0, 2) + '/' + val.substring(2, 4);
                            }
                            setCheckoutCardExpiry(formatted.substring(0, 5));
                          }}
                          placeholder="MM/YY" 
                          style={{ 
                            width: '100%', 
                            background: 'rgba(0,0,0,0.5)', 
                            border: checkoutCardExpiry.length === 5 ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.08)', 
                            color: '#fff', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            outline: 'none',
                            textAlign: 'center'
                          }} 
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>CVC (SEGURIDAD):</label>
                        <input 
                          type="password" 
                          value={checkoutCardCvc}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/gi, '');
                            setCheckoutCardCvc(val.substring(0, 4));
                          }}
                          placeholder="***" 
                          style={{ 
                            width: '100%', 
                            background: 'rgba(0,0,0,0.5)', 
                            border: checkoutCardCvc.length >= 3 ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.08)', 
                            color: '#fff', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            outline: 'none',
                            textAlign: 'center',
                            letterSpacing: '2px'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Pagar Button */}
                    <button 
                      onClick={() => {
                        // Validaciones mínimas
                        if (checkoutCardNumber.replace(/\s/g, '').length < 15) {
                          setProfileError("Por favor ingresa un número de tarjeta válido.");
                          setTimeout(() => setProfileError(''), 4000);
                          return;
                        }
                        if (checkoutCardExpiry.length < 5) {
                          setProfileError("Por favor ingresa una fecha de expiración válida MM/YY.");
                          setTimeout(() => setProfileError(''), 4000);
                          return;
                        }
                        if (checkoutCardCvc.length < 3) {
                          setProfileError("Por favor ingresa el código CVC.");
                          setTimeout(() => setProfileError(''), 4000);
                          return;
                        }

                        setProfileError('');
                        setIsPaymentProcessing(true);
                        
                        // Simular cobro SSL encriptado con PCI-DSS
                        setTimeout(() => {
                          setIsPremium(true);
                          localStorage.setItem('dpv_pro_is_premium', 'true');
                          
                          const txId = 'DPV-TX-' + Math.floor(Math.random() * 900000 + 100000);
                          const cardBrand = checkoutCardNumber.startsWith('4') ? 'Visa' : checkoutCardNumber.startsWith('5') ? 'Mastercard' : 'Card';
                          const lastFour = checkoutCardNumber.replace(/\s/g, '').slice(-4) || '9010';
                          
                          const newInvoice = {
                            id: txId,
                            date: new Date().toLocaleDateString('es-ES'),
                            concept: billingCycle === 'annual' ? 'DPV PRO Premium - Plan Anual ⚡' : 'DPV PRO Premium - Plan Mensual ⚡',
                            amount: billingCycle === 'annual' ? '$39.99 USD' : '$4.99 USD',
                            method: `${cardBrand} **** ${lastFour}`,
                            status: 'Pagado'
                          };

                          setPaymentHistory(prev => [newInvoice, ...prev]);
                          setIsPaymentProcessing(false);
                          
                          // Limpiar datos sensibles
                          setCheckoutCardNumber('');
                          setCheckoutCardExpiry('');
                          setCheckoutCardCvc('');
                          
                          setProfileSuccess("¡Suscripción DPV PRO Premium Activada con éxito! ⭐ Gracias por apoyar el software científico.");
                          setTimeout(() => setProfileSuccess(''), 5000);
                        }, 1500);
                      }}
                      className="premium-btn"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #FFE066, #F5B041)',
                        color: '#050805',
                        fontWeight: 'bold',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '10px',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(255, 214, 0, 0.25)'
                      }}
                    >
                      <Lock size={15} /> Pagar {billingCycle === 'annual' ? '$39.99' : '$4.99'} USD de Forma Segura ⚡
                    </button>

                    {/* Trust seals footer inside checkout card */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      alignItems: 'center', 
                      borderTop: '1px solid rgba(255,255,255,0.05)', 
                      paddingTop: '10px',
                      marginTop: '5px'
                    }}>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        🛡️ PCI-DSS Nivel 1 Compliant
                      </span>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        🔒 Conexión Cifrada SSL
                      </span>
                      <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        💳 Powered by Stripe
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="premium-card glow-border" style={{ 
                padding: '30px', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03), rgba(0, 0, 0, 0.5))', 
                border: '1px solid #00FF88',
                marginBottom: '30px',
                position: 'relative'
              }}>
                {/* PANEL DE BIENVENIDA PREMIUM Y AUTOGESTIÓN */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#00FF88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={24} color="#FFD600" className="icon-pulse" /> 
                      DPV PRO Premium Activo ⭐
                    </h3>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Bienvenido al círculo científico de precisión. Tu cuenta disfruta de perfiles de sala ilimitados, velocidad cuántica en transiciones y navegación libre de anuncios.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    style={{
                      background: 'rgba(255, 77, 77, 0.05)',
                      border: '1px solid rgba(255, 77, 77, 0.25)',
                      color: '#FF4D4D',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancelar Suscripción 🔄
                  </button>
                </div>

                {/* DETALLES DE SUSCRIPCIÓN ACTIVA */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '15px', 
                  textAlign: 'left', 
                  marginBottom: '30px'
                }}>
                  <div className="glass" style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan de Suscripción:</span>
                    <strong style={{ fontSize: '1rem', color: '#fff', display: 'block', marginTop: '4px' }}>
                      {paymentHistory[0]?.concept || 'DPV PRO Premium Anual ⚡'}
                    </strong>
                  </div>
                  <div className="glass" style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Método de Pago:</span>
                    <strong style={{ fontSize: '1rem', color: '#fff', display: 'block', marginTop: '4px', fontFamily: 'monospace' }}>
                      💳 {paymentHistory[0]?.method || 'Visa **** 9010'}
                    </strong>
                  </div>
                  <div className="glass" style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima Renovación:</span>
                    <strong style={{ fontSize: '1rem', color: '#00FF88', display: 'block', marginTop: '4px' }}>
                      {(() => {
                        const current = new Date();
                        const isAnnual = paymentHistory[0]?.concept?.includes('Anual');
                        if (isAnnual) {
                          current.setFullYear(current.getFullYear() + 1);
                        } else {
                          current.setMonth(current.getMonth() + 1);
                        }
                        return current.toLocaleDateString('es-ES');
                      })()}
                    </strong>
                  </div>
                </div>

                {/* HISTORIAL DE FACTURAS (PCI-COMPLIANT INVOICES TABLE) */}
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#00FF88" /> Historial de Facturas y Recibos
                  </h4>
                  
                  {paymentHistory.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, border: '1px dashed rgba(255,255,255,0.08)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                      No hay transacciones registradas en este dispositivo.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold' }}>ID Transacción</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>Fecha</th>
                            <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 'bold' }}>Concepto</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>Método</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>Importe</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>Recibo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map(invoice => (
                            <tr key={invoice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="invoice-row-hover">
                              <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{invoice.id}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>{invoice.date}</td>
                              <td style={{ padding: '10px', fontWeight: 'bold' }}>{invoice.concept}</td>
                              <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)' }}>{invoice.method}</td>
                              <td style={{ padding: '10px', textAlign: 'right', color: '#00FF88', fontWeight: 'bold' }}>{invoice.amount}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <button 
                                  onClick={() => setSelectedInvoice(invoice)}
                                  style={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    border: '1px solid rgba(0, 255, 136, 0.25)',
                                    color: '#00FF88',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  📄 Ver Recibo
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* DIALOGO DE CONFIRMACIÓN DE CANCELACIÓN */}
                {showCancelConfirm && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(5, 5, 5, 0.96)',
                    borderRadius: '16px',
                    zIndex: 11,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px',
                    textAlign: 'center',
                    border: '1px solid #FF4D4D',
                    boxShadow: '0 0 30px rgba(255, 77, 77, 0.1)'
                  }}>
                    <AlertTriangle size={36} color="#FF4D4D" className="icon-pulse" style={{ marginBottom: '15px' }} />
                    <h4 style={{ color: '#FF4D4D', fontSize: '1.2rem', margin: '0 0 10px 0', fontWeight: 'bold' }}>¿Confirmas la Cancelación de tu Suscripción?</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 25px 0', maxWidth: '480px', lineHeight: '1.45' }}>
                      Al cancelar, tu cuenta volverá instantáneamente al **Plan Gratuito**. Se reactivará el bloque de publicidad comercial, volverá el delay de 2.5s y **se eliminarán los perfiles guardados excedentes** (solo podrás conservar 1 perfil en tu biblioteca local).
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        onClick={() => setShowCancelConfirm(false)}
                        style={{
                          background: 'linear-gradient(135deg, #00FF88, #00D060)',
                          color: '#050e05',
                          padding: '10px 22px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Mantener Premium ⭐
                      </button>
                      <button 
                        onClick={() => {
                          setIsPremium(false);
                          localStorage.setItem('dpv_pro_is_premium', 'false');
                          setShowCancelConfirm(false);
                          
                          // Adaptar perfiles al límite de 1 del plan free
                          if (profiles.length > 1) {
                            const reduced = profiles.slice(0, 1);
                            setProfiles(reduced);
                          }
                          
                          setProfileSuccess("Tu suscripción ha sido revertida al plan gratuito. Límite de 1 perfil reactivado.");
                          setTimeout(() => setProfileSuccess(''), 4000);
                        }}
                        style={{
                          background: 'rgba(255, 77, 77, 0.1)',
                          border: '1px solid rgba(255, 77, 77, 0.3)',
                          color: '#FF4D4D',
                          padding: '10px 22px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Sí, Cancelar Suscripción
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Manager Section */}

            {/* Profile Manager Section */}
            <div className="glow-border glass" style={{ 
              padding: '24px', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📂 Gestor Avanzado de Perfiles de Sala
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Guarda todas las variables de tu sala actual en un perfil de base de datos local y recárgalas en la calculadora al instante.
                  </p>
                </div>
                
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: isPremium ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 214, 0, 0.1)', 
                  color: isPremium ? '#00FF88' : '#FFD600', 
                  border: isPremium ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 214, 0, 0.2)',
                  padding: '4px 10px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold' 
                }}>
                  {isPremium ? `Slots Utilizados: ${profiles.length}` : `Plan Gratuito: ${profiles.length} / 1 Perfil`}
                </span>
              </div>

              {/* Save Profile Form */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '25px', textAlign: 'left' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💾 Guardar Estado Actual de la Sala</h5>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                   <div style={{ flex: 1, minWidth: '250px' }}>
                    <input 
                      type="text" 
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      placeholder="Ej: Vegetativo Rápido - Canopia 1.2m"
                      style={{ 
                        width: '100%', 
                        background: 'rgba(0,0,0,0.5)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem',
                        outline: 'none'
                      }} 
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveProfile}
                    className="console-btn-glow"
                    style={{
                      background: 'linear-gradient(135deg, #00FF88, #00D060)',
                      color: '#050e05',
                      fontWeight: 'bold',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Guardar Configuración Actual
                  </button>
                </div>

                {profileSuccess && (
                  <div style={{ color: '#00FF88', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold' }}>
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div style={{ color: '#FF4D4D', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold' }}>
                    {profileError}
                  </div>
                )}

                <p style={{ margin: '10px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  * Se guardarán 20+ variables activas: Temp ({temp}°C), Hum ({activeHumidity}%), Offset ({leafOffset}°C), Genética ({selectedStrain.name.split(' ')[0]}), Equipos, Dimensiones, Secado, etc.
                </p>
              </div>

              {/* List of Profiles */}
              <div>
                <h5 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>📂 Perfiles Guardados en Dispositivo</h5>
                
                {profiles.length === 0 ? (
                  <div style={{ border: '1px dashed rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No tienes perfiles de sala guardados en este navegador. Configura la calculadora y haz clic en Guardar arriba.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {profiles.map(prof => {
                      const strainObj = BOTANICAL_ARCHETYPES.find(s => s.id === prof.activeStrain) || { name: 'Desconocido' };
                      return (
                        <div key={prof.id} style={{ 
                          background: 'rgba(255,255,255,0.01)', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          padding: '16px', 
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '15px',
                          textAlign: 'left'
                        }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>{prof.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              📅 Guardado: {prof.date} | Genética: <strong style={{ color: '#00FF88' }}>{strainObj.name}</strong>
                            </span>
                            
                            {/* Badges de parámetros clave guardados */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(255, 77, 77, 0.1)', color: '#FF4D4D', padding: '2px 6px', borderRadius: '4px' }}>
                                {prof.temp}°C
                              </span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF', padding: '2px 6px', borderRadius: '4px' }}>
                                {prof.humidity}% HR
                              </span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(160, 176, 160, 0.1)', color: '#A0B0A0', padding: '2px 6px', borderRadius: '4px' }}>
                                Offset: {prof.leafOffset}°C
                              </span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(255, 214, 0, 0.1)', color: '#FFD600', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                                Etapa: {prof.stage}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleLoadProfile(prof)}
                              className="console-btn-glow"
                              style={{
                                background: '#00FF88',
                                color: '#050e05',
                                fontWeight: 'bold',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              Cargar en App ⚡
                            </button>
                            <button 
                              onClick={() => {
                                handleDeleteProfile(prof.id);
                              }}
                              style={{
                                background: 'rgba(255, 77, 77, 0.1)',
                                border: '1px solid rgba(255, 77, 77, 0.2)',
                                color: '#FF4D4D',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
            <p className="module-desc">Ajusta los parámetros biológicos de tu arquetipo foliar para calibrar la evapotranspiración, conductancia estomática, nutrición osmótica y vulnerabilidades ante patógenos.</p>
            
            {/* Selector de Arquetipo Genético */}
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
                      {arch.desc.substring(0, 85)}...
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 15px 0', lineHeight: 1.45 }}>
                {selectedStrain.desc}
              </p>
              
              {/* BANCO DE SEMILLAS PATROCINADO (Dinámico desde adminConfig / adSlots) */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#00FF88', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  🌱 VARIEDADES COMERCIALES RECOMENDADAS:
                </span>
                {(() => {
                  const seedsSlot = adSlots.find(s => s.id === 'sponsor_seeds');
                  if (seedsSlot.partnerActive) {
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {adminConfig.seedBanks.filter(sb => sb.archetype === genetics).map(sb => (
                          <div key={sb.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block' }}>{sb.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Banco: <strong>{sb.bank}</strong></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px' }}>
                              <span style={{ fontSize: '0.65rem', color: '#FFD600' }}>Cupón: <strong>{sb.coupon}</strong></span>
                              <a href="#" onClick={(e) => { e.preventDefault(); triggerSponsorContact('sponsor_seeds'); }} style={{ fontSize: '0.7rem', color: '#00FF88', textDecoration: 'none', fontWeight: 'bold' }}>Ver Genética ↗</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div onClick={() => triggerSponsorContact('sponsor_seeds')} style={{ background: 'rgba(0,255,136,0.02)', border: '1px dashed rgba(0,255,136,0.2)', padding: '15px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📢 Espacio para Banco de Semillas Disponible</span>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        ¡Anuncia tus genéticas aquí! Este panel dinámico se segmenta según la fisiología foliar seleccionada por el cultivador. Haz clic para contactarnos.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* SUB-MÓDULO A: ESTIMADOR DE OFFSET TERMODINÁMICO Y CONDUCTANCIA */}
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
                  Módulo A: Estimador de Offset de Hoja y Conductancia Estomática
                </h4>
              </div>

              {/* Estimador de Offset Termodinámico */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🌡️ Estimador de Temperatura de Hoja (Reemplazo Láser IR)</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Tipo de Foco:</label>
                    <select value={lightType} onChange={(e) => setLightType(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <option value="led">LED Frío (PAR)</option>
                      <option value="hps">Sodio HPS (Radiante)</option>
                      <option value="sun">Luz Solar Directa</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Distancia Foco ({lightDistance} cm):</label>
                    <input type="range" min="20" max="100" step="5" value={lightDistance} onChange={(e) => setLightDistance(parseInt(e.target.value))} style={{ marginTop: '6px' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Ventilación Sala:</label>
                    <select value={airflowQuality} onChange={(e) => setAirflowQuality(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <option value="low">Flujo Suave / Bajo</option>
                      <option value="optimal">Flujo Óptimo / Ventilador</option>
                      <option value="high">Flujo Alto / Extractor Máx</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>Sensor Clima:</label>
                    <select value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <option value="">-- Autocalibrar Sensor --</option>
                      {adminConfig.sensorPartners.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(() => {
                  const estimatedOffset = calculateEstimatedLeafTemp(temp, activeHumidity, lightType, lightDistance, airflowQuality);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Offset Fisiológico Estimado:</span>
                          <strong style={{ fontSize: '1rem', color: '#00FF88', marginLeft: '6px' }}>{estimatedOffset.toFixed(1)}°C</strong>
                        </div>
                        <button 
                          onClick={() => {
                            triggerInterstitial(
                              "Calibrando coeficiente de offset y regulando evapotranspiración foliar...",
                              `${adminConfig.sponsors.led.brand} ${adminConfig.sponsors.led.model}`,
                              adminConfig.sponsors.led.coupon,
                              () => {
                                setLeafOffset(parseFloat(estimatedOffset.toFixed(1)));
                                setCopiedText('offset_injected'); setTimeout(() => setCopiedText(''), 2000);
                              }
                            );
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #00FF88, #00D060)',
                            border: 'none',
                            color: '#050e05',
                            fontWeight: 'bold',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {copiedText === 'offset_injected' ? '¡Aplicado con éxito! ✓' : '🌡️ Aplicar Offset a Calculadora'}
                        </button>
                      </div>
                      
                      {(() => {
                        if (!selectedSensor) return null;
                        const sens = adminConfig.sensorPartners.find(s => s.id === selectedSensor);
                        if (!sens) return null;
                        return (
                          <div style={{ background: 'rgba(0,223,255,0.03)', border: '1px solid rgba(0,223,255,0.1)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%', animation: 'fadeIn 0.3s ease' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#00DFFF', fontWeight: 'bold', display: 'block' }}>📡 CALIBRACIÓN {sens.name.toUpperCase()}:</span>
                              <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Offset oficial recomendado: <strong>{sens.offset}°C</strong></p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                onClick={() => {
                                  triggerInterstitial(
                                    `Compensando lecturas microclimáticas mediante sensor original ${sens.name}...`,
                                    sens.name,
                                    sens.coupon,
                                    () => {
                                      setLeafOffset(sens.offset);
                                      setCopiedText('offset_sensor_applied'); setTimeout(() => setCopiedText(''), 2000);
                                    }
                                  );
                                }}
                                style={{
                                  background: 'rgba(0, 223, 255, 0.1)',
                                  border: '1px solid rgba(0, 223, 255, 0.3)',
                                  color: '#00DFFF',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                {copiedText === 'offset_sensor_applied' ? '¡Aplicado! ✓' : 'Ajustar Offset'}
                              </button>
                              <a href={sens.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#FFD600', textDecoration: 'none', fontWeight: 'bold' }}>Comprar Sonda Original (Cupón: {sens.coupon}) ↗</a>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>

              {/* Simulador de Conductancia y Transpiración */}
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parámetros Fisiológicos Activos:</span>
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

            {/* SUB-MÓDULO B: PRESIÓN OSMÓTICA RADICULAR E ÍNDICE LAI */}
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
                  Módulo B: Presión Osmótica Radicular e Índice LAI
                </h4>
              </div>

              {/* Entrada de EC de Nutrientes */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔬 Simulación de Absorción Mineral y Osmosis</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>EC del Agua de Riego:</span>
                      <strong style={{ color: '#fff' }}>{soilEc.toFixed(1)} mS/cm</strong>
                    </label>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3.0" 
                      step="0.1" 
                      value={soilEc} 
                      onChange={(e) => setSoilEc(parseFloat(e.target.value))} 
                    />
                    <span className="slider-limits">Clones: 0.8 | Floración: 1.6 - 2.2</span>
                  </div>
                  
                  {(() => {
                    const osmoticData = calculateOsmoticStress(soilEc, vpd, genetics);
                    let colorEc = '#00FF88';
                    if (osmoticData.status === 'warning') colorEc = '#FFD600';
                    if (osmoticData.status === 'danger') colorEc = '#FF4D4D';
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Potencial Osmótico de Raíz (Ψ osm):</span>
                        <strong style={{ fontSize: '1rem', color: '#00F0FF', marginTop: '2px' }}>{osmoticData.osmoticPotential.toFixed(3)} MPa</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Índice de Acumulación: <strong style={{ color: colorEc }}>{osmoticData.accumulationIndex.toFixed(0)}%</strong>
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const osmoticData = calculateOsmoticStress(soilEc, vpd, genetics);
                  const isHigh = soilEc > 1.8;
                  const fert = isHigh ? adminConfig.fertilizers.highEc : adminConfig.fertilizers.lowEc;
                  return (
                    <>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        {osmoticData.advice}
                      </p>
                      
                      <div style={{ marginTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: isHigh ? '#FF4D4D' : '#00FF88', fontWeight: 'bold' }}>
                            💡 TRATAMIENTO DE NUTRICIÓN RECOMENDADO:
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Patrocinado por: <strong>{fert.brand}</strong></span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ flex: '1', minWidth: '200px' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{fert.product}</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{fert.advice}</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', color: '#FFD600' }}>Cupón: <strong>{fert.coupon}</strong></span>
                            <a href={fert.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#00FF88', textDecoration: 'none', fontWeight: 'bold' }}>Ver Producto ↗</a>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Deslizador del Índice LAI */}
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

            {/* SUB-MÓDULO C: RELOJ DE PRESIÓN DE ESPORAS (GERMINACIÓN) */}
            <div className="glow-border" style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderLeft: '4px solid #FFD600',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Compass size={20} color="#FFD600" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
                  Módulo C: Reloj de Presión de Esporas y Germinación de Patógenos
                </h4>
              </div>

              {(() => {
                const hours = Math.floor(sporeTimer / 60);
                const mins = sporeTimer % 60;
                const formattedTime = `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
                
                let timerColor = '#00FF88';
                let timerLabel = 'SEGURO (Sin Condensación)';
                let timerDesc = 'Las hojas y cogollos están secos. No hay peligro de germinación fúngica activa.';
                
                if (vpd < 0.3) {
                  if (sporeTimer > 180) {
                    timerColor = '#00FF88';
                    timerLabel = 'HIDRATACIÓN INICIAL (Fase 1)';
                    timerDesc = 'Punto de rocío cruzado. Humedad microscópica condensándose sobre la espora. Corrige el clima antes de que inicie la activación celular.';
                  } else if (sporeTimer > 0) {
                    timerColor = '#FFD600';
                    timerLabel = 'ACTIVACIÓN DE ESPORAS (Fase 2)';
                    timerDesc = `Esporas absorbiendo agua continuamente. Activación biológica al ${Math.round((300 - sporeTimer)/3)}%. Enciende extractores al 100% de inmediato.`;
                  } else {
                    timerColor = '#FF4D4D';
                    timerLabel = 'GERMINACIÓN COMPLETADA (Fase 3)';
                    timerDesc = 'Infección latente probable. El hongo ha roto la cutícula vegetal y penetrado el cogollo. Monitorea brotes y ventila al extremo.';
                  }
                } else {
                  if (sporeTimer < 300) {
                    timerColor = '#00F0FF';
                    timerLabel = 'SECADO DE HOJAS / EVAPORACIÓN';
                    timerDesc = 'El DPV ha vuelto a zona segura. Las gotas se están secando lentamente, reduciendo el riesgo progresivamente.';
                  }
                }

                return (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>ESTADO SANITARIO:</span>
                        <strong style={{ fontSize: '1rem', color: timerColor, textTransform: 'uppercase' }}>{timerLabel}</strong>
                      </div>
                      
                      {/* Cronómetro digital neón */}
                      <div style={{
                        background: 'rgba(0,0,0,0.6)',
                        border: `1px solid ${timerColor}55`,
                        boxShadow: `0 0 10px ${timerColor}22`,
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontFamily: 'monospace',
                        fontSize: '1.25rem',
                        color: timerColor,
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}>
                        ⏱️ {formattedTime}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {timerDesc}
                    </p>

                    {/* Botón Fungicida Express (v0.9 Phase 3) */}
                    {isPremium ? (
                      sporeTimer < 300 && (
                        <div style={{
                          background: 'rgba(255, 214, 0, 0.03)',
                          border: '1px solid #FFD600',
                          padding: '12px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          textAlign: 'left'
                        }}>
                          <span style={{ fontSize: '0.65rem', color: '#FFD600', fontWeight: 'bold', display: 'block' }}>⭐ RECOMENDACIÓN DE BIOCONTROL DE MICROCLIMA:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            Cuando la humedad foliar aumenta (timer a {formattedTime}), la cutícula se debilita. Para proteger la canopia de forma preventiva sin fitotoxinas químicas, eleva la recirculación de aire interno usando ventiladores oscilantes directos a media altura para romper la capa límite estancada de vapor.
                          </p>
                        </div>
                      )
                    ) : (
                      sporeTimer < 300 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255, 77, 77, 0.05)',
                          border: '1px solid rgba(255, 77, 77, 0.15)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          animation: 'pulseGlow 2s infinite ease-in-out',
                          textAlign: 'left'
                        }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.65rem', color: '#FF4D4D', fontWeight: 'bold', display: 'block' }}>🛡️ PROTECCIÓN SANITARIA:</span>
                            <strong style={{ fontSize: '0.75rem', color: '#fff' }}>{adminConfig.sponsors.fungicide.brand} - {adminConfig.sponsors.fungicide.product}</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginLeft: '10px' }}>
                            <span style={{ fontSize: '0.6rem', color: '#FFD600' }}>Cupón: <strong>{adminConfig.sponsors.fungicide.coupon}</strong></span>
                            <a 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); triggerSponsorContact('sponsor_seeds'); }}
                              className="console-btn-glow"
                              style={{ 
                                background: '#FFD600', 
                                color: '#050805', 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold', 
                                textDecoration: 'none',
                                marginTop: '2px'
                              }}
                            >
                              Ver Preventivo ↗
                            </a>
                          </div>
                        </div>
                      )
                    )}

                    {/* Botón Extractor Express (v1.0 Ads Optimizer) */}
                    {isPremium ? (
                      vpd < 0.3 && (
                        <div style={{
                          background: 'rgba(255, 214, 0, 0.03)',
                          border: '1px solid #FFD600',
                          padding: '12px',
                          borderRadius: '10px',
                          marginBottom: '12px',
                          textAlign: 'left'
                        }}>
                          <span style={{ fontSize: '0.65rem', color: '#FFD600', fontWeight: 'bold', display: 'block' }}>⭐ PROTOCOLO ANTE DEPRESIÓN DE VAPOR EXTREMA:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            El DPV está críticamente bajo ({vpd.toFixed(2)} kPa). Con estomas bloqueados por saturación hídrica, la planta no asimila calcio. Inicia un barrido de renovación de aire programado: extrae de forma continua durante 15 minutos para descender la humedad relativa al menos un 10% y reactivar la transpiración.
                          </p>
                        </div>
                      )
                    ) : (
                      vpd < 0.3 && (() => {
                        const esporasSlot = adSlots.find(s => s.id === 'sponsor_esporas');
                        if (esporasSlot.partnerActive) {
                          return (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(0, 240, 255, 0.05)',
                              border: '1px solid rgba(0, 240, 255, 0.15)',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              marginBottom: '12px',
                              animation: 'pulseGlow 2.5s infinite ease-in-out',
                              textAlign: 'left'
                            }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.65rem', color: '#00F0FF', fontWeight: 'bold', display: 'block' }}>🌪️ MITIGACIÓN DE HUMEDAD URGENTE:</span>
                                <strong style={{ fontSize: '0.75rem', color: '#fff' }}>{adminConfig.sponsors.ventilation.brand} - {adminConfig.sponsors.ventilation.model}</strong>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.62rem', color: 'var(--text-secondary)' }}>El DPV es críticamente bajo. Renueva el aire de la sala cada 60s para evacuar el agua líquida libre.</p>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginLeft: '10px' }}>
                                <span style={{ fontSize: '0.6rem', color: '#FFD600' }}>Cupón: <strong>{adminConfig.sponsors.ventilation.coupon}</strong></span>
                                <a 
                                  href="#" 
                                  onClick={(e) => { e.preventDefault(); triggerSponsorContact('sponsor_esporas'); }}
                                  className="console-btn-glow"
                                  style={{ 
                                    background: '#00F0FF', 
                                    color: '#050805', 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold', 
                                    textDecoration: 'none',
                                    marginTop: '2px'
                                  }}
                                >
                                  Ver Extractor ↗
                                </a>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div 
                            onClick={() => triggerSponsorContact('sponsor_esporas')}
                            style={{
                              background: 'rgba(255, 214, 0, 0.03)',
                              border: '1px dashed rgba(255, 214, 0, 0.2)',
                              padding: '12px',
                              borderRadius: '10px',
                              marginBottom: '12px',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', color: '#ffd600', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>📢 Espacio para Extracción / Humedad Disponible</span>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                              ¡Anuncia tus extractores o deshumidificadores aquí! Se activa automáticamente ante niveles de humedad críticos. Haz clic para contactarnos.
                            </p>
                          </div>
                        );
                      })()
                    )}

                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(sporeTimer / 300) * 100}%`,
                        height: '100%',
                        backgroundColor: timerColor,
                        boxShadow: `0 0 8px ${timerColor}`,
                        transition: 'all 1s linear'
                      }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SUB-MÓDULO D: OPTIMIZADOR DE EFICIENCIA LUMÍNICA (PPFD VS DPV) */}
            <div className="glow-border" style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderLeft: '4px solid #FF4D4D',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Zap size={20} color="#FF4D4D" className="icon-pulse" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>
                  Módulo D: Optimizador de Eficiencia Lumínica (DLI / PPFD vs DPV)
                </h4>
              </div>

              <div className="module-form-grid" style={{ marginBottom: '15px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Intensidad de Foco PPFD:</span>
                    <strong style={{ color: '#fff' }}>{ppfdInput} µmol/m²/s</strong>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1500" 
                    step="50" 
                    value={ppfdInput} 
                    onChange={(e) => setPpfdInput(parseInt(e.target.value))} 
                  />
                  <span className="slider-limits">Vegetativo: 400 - 600 | Floración LED: 800 - 1000+</span>
                </div>
                
                {(() => {
                  const gs = calculateStomatalConductance(vpd, lightIntensity, genetics);
                  const efficiencyData = calculatePhotosyntheticEfficiency(gs, ppfdInput);
                  let colorEff = '#00FF88';
                  if (efficiencyData.status === 'warning') colorEff = '#FFD600';
                  if (efficiencyData.status === 'danger') colorEff = '#FF4D4D';
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Eficiencia de Asimilación Cuántica:</span>
                      <strong style={{ fontSize: '1.25rem', color: colorEff }}>{efficiencyData.efficiency.toFixed(0)}%</strong>
                      {efficiencyData.wastedWattsPercent > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#FF4D4D', marginTop: '4px', fontWeight: 'bold' }}>
                            💡 Energía Desperdiciada / Calor: {efficiencyData.wastedWattsPercent}%
                          </span>
                          {efficiencyData.efficiency < 75 && (
                            <button 
                              onClick={() => setShowLedSavingsModal(true)}
                              style={{
                                background: 'rgba(255, 77, 77, 0.1)',
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                color: '#FF4D4D',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                transition: 'all 0.2s',
                                width: 'fit-content'
                              }}
                              className="console-btn-glow"
                            >
                              ⚡ Calcular Ahorro Lumínico
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {(() => {
                const gs = calculateStomatalConductance(vpd, lightIntensity, genetics);
                const efficiencyData = calculatePhotosyntheticEfficiency(gs, ppfdInput);
                return (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {efficiencyData.text}
                    </p>
                  </div>
                );
              })()}

              {/* PUBLICIDAD CONTEXTUAL DIRECTA DE ILUMINACIÓN LED (v1.0 Ads Optimizer) */}
              {isPremium ? (
                <div className="advertisement-card-premium premium-scientific-card optimal-ec" style={{ marginTop: '20px', border: '1px solid #FFD600', background: 'rgba(255, 214, 0, 0.02)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#FFD600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⭐ Fisiología de Eficiencia Fotosintética y DLI
                      </strong>
                      <span style={{ fontSize: '0.6rem', border: '1px solid #FFD600', padding: '2px 6px', borderRadius: '4px', color: '#FFD600', fontWeight: 'bold' }}>SOPORTE CIENTÍFICO</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                      Con los estomas abiertos a un <strong>{calculatePhotosyntheticEfficiency(calculateStomatalConductance(vpd, lightIntensity, genetics), ppfdInput).efficiency.toFixed(0)}%</strong>, la asimilación cuántica es óptima. Mantener el balance entre fotones incidentes y el DPV asegura que la fotorrespiración sea nula, acelerando la formation de aceites esenciales sin estrés fotosintético.
                    </p>
                  </div>
                </div>
              ) : (() => {
                const ledSlot = adSlots.find(s => s.id === 'sponsor_led') || { partnerActive: true, partnerName: 'Mars Hydro LED', coupon: 'LEDSHADOW' };
                if (ledSlot.partnerActive) {
                  return (
                    <div className="advertisement-card-premium optimal-ec" style={{ marginTop: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#00f0ff' }}>
                            💡 ¿Quieres maximizar la fotosíntesis sin aumentar el estrés térmico?
                          </strong>
                          <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                            ILUMINACIÓN EFICIENTE
                          </span>
                        </div>
                        <p style={{ margin: '0 0 15px 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Bajo iluminación tradicional de Sodio (HPS) o LED ineficiente, el calor disipado cierra los estomas foliares en un <strong>{((1 - calculatePhotosyntheticEfficiency(calculateStomatalConductance(vpd, lightIntensity, genetics), ppfdInput).efficiency / 100) * 100).toFixed(0)}%</strong>. Cambia al panel {ledSlot.partnerName} con dimmer de alta precisión y espectro fotosintético puro para cosechar flores resinosas sin elevar la temperatura ambiental.
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>RECOMENDADO POR DPV PRO:</span>
                          <strong style={{ fontSize: '0.8rem', color: '#fff' }}>{ledSlot.partnerName}</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          {ledSlot.coupon && (
                            <span style={{ fontSize: '0.6rem', color: '#FFD600' }}>Cupón: <strong>{ledSlot.coupon}</strong></span>
                          )}
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); triggerSponsorContact('sponsor_led'); }}
                            className="console-btn-glow"
                            style={{ 
                              background: '#00f0ff', 
                              color: '#050805', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.7rem', 
                              fontWeight: 'bold', 
                              textDecoration: 'none'
                            }}
                          >
                            Ver Panel LED ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div 
                    onClick={() => triggerSponsorContact('sponsor_led')} 
                    style={{ 
                      background: 'rgba(0, 240, 255, 0.02)', 
                      border: '1px dashed rgba(0, 240, 255, 0.2)', 
                      padding: '15px', 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      textAlign: 'center',
                      marginTop: '20px'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#00f0ff', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>💡 Espacio para Sponsor de Iluminación LED Disponible</span>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      ¡Anuncia tus paneles de iluminación aquí! Este panel se activa contextualmente basándose en la eficiencia fotosintética y el DPV diurno del cultivo. Haz clic para contactarnos.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* RANGOS DE DPV OPTIMIZADOS APLICADOS */}
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

                  {/* PUBLICIDAD CONTEXTUAL DIRECTA DE NUTRIENTES (v1.0 Ads Optimizer) */}
                  {isPremium ? (() => {
                    let adviceTitle = 'Optimización Nutricional Basada en Transpiración 🧬';
                    let adviceDesc = 'Tu electroconductividad está en la zona ideal de absorción estomática. Con el DPV y PPFD actuales, la planta tiene una tasa de transpiración óptima, permitiendo que la savia transporte calcio y silicio de forma constante a los brotes nuevos. Mantén la nutrición en esta fase.';
                    let adviceClass = 'optimal-ec';
                    
                    if (soilEc < 1.2) {
                      adviceTitle = '⚠️ Recomendación Biológica: Déficit de Presión Osmótica';
                      adviceDesc = 'Humedad y nutrición deficientes detectadas. Un sustrato con baja EC restringe la succión pasiva vegetal. La conductancia estomática es elevada, pero el flujo del xilema transporta pocos iones minerales. Considera incrementar la carga orgánica de nitrógeno y micronutrientes quelados.';
                      adviceClass = 'low-ec';
                    } else if (soilEc > 2.0) {
                      adviceTitle = '🔥 Alerta Científica: Plasmólisis e Inversión Osmótica';
                      adviceDesc = 'Peligro osmótico en el sustrato. Con una EC de ' + soilEc.toFixed(1) + ' mS/cm, el potencial osmótico del sustrato es mayor que el celular radical, provocando deshidratación por ósmosis inversa. Lixivia el sustrato con una fracción de escurrimiento (leaching fraction) del 20-30% con agua pura corregida a pH 6.2.';
                      adviceClass = 'high-ec';
                    }
                    
                    return (
                      <div className={`advertisement-card-premium premium-scientific-card ${adviceClass}`} style={{ marginTop: '20px', border: '1px solid #FFD600', background: 'rgba(255, 214, 0, 0.02)' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#FFD600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ⭐ {adviceTitle}
                            </strong>
                            <span style={{ fontSize: '0.6rem', border: '1px solid #FFD600', padding: '2px 6px', borderRadius: '4px', color: '#FFD600', fontWeight: 'bold' }}>CONSEJO DE PRECISIÓN</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                            {adviceDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })() : (() => {
                    const riegoSlot = adSlots.find(s => s.id === 'sponsor_riego');
                    if (!riegoSlot.partnerActive) {
                      return (
                        <div 
                          onClick={() => triggerSponsorContact('sponsor_riego')}
                          style={{
                            background: 'rgba(0, 240, 255, 0.03)',
                            border: '1px dashed rgba(0, 240, 255, 0.2)',
                            padding: '16px',
                            borderRadius: '12px',
                            marginTop: '20px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', color: '#00f0ff', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📢 Espacio para Sponsor de Nutrientes Disponible</span>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            ¡Anuncia tus fertilizantes y medidores aquí! Se segmenta de forma inteligente según la electroconductividad del riego. Haz clic para contactarnos.
                          </p>
                        </div>
                      );
                    }

                    let adClass = 'optimal-ec';
                    let adTitle = 'Nutrición Orgánica en Rango Óptimo 🟢';
                    let adBrand = adminConfig.fertilizers.lowEc.brand;
                    let adProduct = adminConfig.fertilizers.lowEc.product;
                    let adDesc = 'Tu sustrato está en el rango de conductividad de precisión. Para mantener el crecimiento explosivo y la asimilación estomática perfecta, añade Bio-Grow de forma 100% orgánica.';
                    let adCoupon = adminConfig.fertilizers.lowEc.coupon;

                    if (soilEc < 1.2) {
                      adClass = 'low-ec';
                      adTitle = '⚠️ CONDUCTIVIDAD BAJA: Crecimiento Lento';
                      adDesc = `Tu electroconductividad está baja (${soilEc.toFixed(1)} mS/cm). La planta tiene hambre y el DPV ideal no se aprovechará por falta de nutrientes. Añade ${adProduct} de forma inmediata.`;
                    } else if (soilEc > 2.0) {
                      adClass = 'high-ec';
                      adTitle = '🔥 ALERTA DE EXCESO DE SALES / SOBREFERTILIZACIÓN';
                      adBrand = adminConfig.fertilizers.highEc.brand;
                      adProduct = adminConfig.fertilizers.highEc.product;
                      adDesc = `¡Conductividad crítica de ${soilEc.toFixed(1)} mS/cm! Las raíces experimentan estrés osmótico extremo. Riega con agua sola y aplica Sensi Flush urgentemente para lavar el medio de cultivo.`;
                      adCoupon = adminConfig.fertilizers.highEc.coupon;
                    }

                    return (
                      <div className={`advertisement-card-premium ${adClass}`} style={{ marginTop: '20px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.85rem', color: adClass === 'high-ec' ? '#ff4d4d' : adClass === 'low-ec' ? '#00ff88' : '#00f0ff' }}>
                              {adTitle}
                            </strong>
                            <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              SOLUCIÓN CONTEXTUAL
                            </span>
                          </div>
                          <p style={{ margin: '0 0 15px 0', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {adDesc}
                          </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>RECOMENDADO POR DPV PRO:</span>
                            <strong style={{ fontSize: '0.8rem', color: '#fff' }}>{adBrand} - {adProduct}</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '0.6rem', color: '#FFD600' }}>Cupón: <strong>{adCoupon}</strong></span>
                            <a 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); triggerSponsorContact('sponsor_riego'); }}
                              className="console-btn-glow"
                              style={{ 
                                background: adClass === 'high-ec' ? '#ff4d4d' : '#00f0ff', 
                                color: '#050805', 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold', 
                                textDecoration: 'none'
                              }}
                            >
                              Ver Producto ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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

        {activeProTool === 'extraccion' && (
          <div className="pro-module-card">
            <div className="module-header">
              <Compass size={24} color="#00FF88" className="icon-pulse" />
              <h3>Módulo Extra: Dimensionador del Caudal de Extracción de Aire</h3>
            </div>
            <p className="module-desc">Calcula el volumen físico exacto de tu cuarto de cultivo y el caudal de extracción necesario (en m³/h) para renovar el aire completamente cada minuto, mitigando el calor de las luces y evitando focos de humedad estancada.</p>
            
            <div className="module-form-grid">
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ancho del Cuarto:</span>
                  <strong style={{ color: '#00FF88' }}>{roomWidth.toFixed(2)} m</strong>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4.0" 
                  step="0.1" 
                  value={roomWidth} 
                  onChange={(e) => setRoomWidth(parseFloat(e.target.value))} 
                />
                <span className="slider-limits">Min: 0.5m | Max: 4.0m</span>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Largo del Cuarto:</span>
                  <strong style={{ color: '#00FF88' }}>{roomLength.toFixed(2)} m</strong>
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4.0" 
                  step="0.1" 
                  value={roomLength} 
                  onChange={(e) => setRoomLength(parseFloat(e.target.value))} 
                />
                <span className="slider-limits">Min: 0.5m | Max: 4.0m</span>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Alto del Cuarto:</span>
                  <strong style={{ color: '#00FF88' }}>{roomHeight.toFixed(2)} m</strong>
                </label>
                <input 
                  type="range" 
                  min="1.0" 
                  max="3.0" 
                  step="0.1" 
                  value={roomHeight} 
                  onChange={(e) => setRoomHeight(parseFloat(e.target.value))} 
                />
                <span className="slider-limits">Min: 1.0m | Max: 3.0m</span>
              </div>
            </div>

            {(() => {
              const volume = roomWidth * roomLength * roomHeight;
              const baseRenewalPerHour = 60; // 1 renovación por minuto
              const filterLossFactor = 1.2; // 20% pérdida por resistencia de filtro de carbón
              const requiredFlow = volume * baseRenewalPerHour * filterLossFactor;
              
              const extractorSponsor = adminConfig.sponsors.ventilation;

              return (
                <div className="module-results glow-border">
                  <h4>Cálculo de Flujo e Insumo de Ventilación Requerido:</h4>
                  <div className="metrics-grid">
                    <div className="metric-box water-bg">
                      <span className="metric-label">Volumen del Cuarto</span>
                      <span className="metric-val">{volume.toFixed(2)} m³</span>
                    </div>
                    <div className="metric-box water-bg">
                      <span className="metric-label">Caudal Requerido</span>
                      <span className="metric-val" style={{ color: '#00FF88' }}>{requiredFlow.toFixed(0)} m³/h</span>
                    </div>
                    <div className="metric-box water-bg">
                      <span className="metric-label">Ciclo de Renovación</span>
                      <span className="metric-val" style={{ fontSize: '1.1rem', color: '#00F0FF' }}>1 vez por minuto</span>
                    </div>
                  </div>

                  <div className="pro-advice-tip water-tip-border" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      🌬️ <strong>¿Por qué es vital renovar el aire?</strong><br />
                      Las hojas transpiran vapor de agua constantemente, creando una <strong>capa límite de aire húmedo saturado</strong> alrededor de ellas. Si no hay una corriente de aire que desplace esta capa, los estomas se cierran por asfixia local de vapor, deteniendo el DPV real y frenando el crecimiento fotosintético.
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                      💡 <em>Nota de Filtro de Carbón: El cálculo incluye un multiplicador de resistencia física de <strong>x1.2 (20% de fricción)</strong> para asegurar que tu extractor rinda la potencia indicada incluso teniendo un filtro anti-olor conectado en serie.</em>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#00FF88', fontWeight: 'bold' }}>🌬️ EXTRACTOR RECOMENDADO PARA TU SALA:</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Patrocinado por: <strong>{extractorSponsor.brand}</strong></span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,136,0.15)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{extractorSponsor.model}</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Motor de alta velocidad centrífugo con dos velocidades conmutables. Ideal para salas de hasta {(requiredFlow * 1.5).toFixed(0)} m³/h de flujo máximo.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#FFD600' }}>Cupón: <strong>{extractorSponsor.coupon}</strong></span>
                        <a 
                          href={extractorSponsor.link} 
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
                            textDecoration: 'none'
                          }}
                        >
                          Ver Extractor ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}


        {activeProTool === 'directorio' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#00FF88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🗺️ Directorio de Grow Shops y Locales Aliados
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Encuentra los comercios de cultivo más confiables en tu zona, capacitados en el uso científico del DPV, y consigue descuentos exclusivos con tus cupones de cultivador.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {adminConfig.growShops.map(gs => (
                <div key={gs.id} className="glow-border glass" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0,255,136,0.1)', background: 'rgba(0,255,136,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{gs.name}</strong>
                      <span style={{ fontSize: '0.65rem', background: '#00FF8822', color: '#00FF88', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>SOCIO OFICIAL</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>📍 {gs.address}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>📞 Tel: {gs.phone}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>CUPÓN DE DESCUENTO:</span>
                      <strong style={{ fontSize: '0.85rem', color: '#FFD600', letterSpacing: '0.5px' }}>{gs.coupon}</strong>
                    </div>
                    <a 
                      href={gs.link} 
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
                      WhatsApp 💬
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '25px', 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.01)', 
              border: '1px solid rgba(255,255,255,0.03)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              📢 <strong>¿Tienes un Grow Shop o Comercio de Cultivo?</strong> Forma parte de nuestra red de aliados, promociona DPV PRO en tu vidriera física con un código QR exclusivo y capta cientos de clientes científicos locales. Escríbenos a nuestro Instagram oficial para sumarte al mapa.
            </div>
          </div>
        )}

        {activeProTool === 'reporte' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#00FF88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📋 Auditoría Integral de Cultivo (Ficha Técnica)
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Inspecciona y valida cada una de las variables físicas y biológicas configuradas en tu sala de cultivo. Este diagnóstico provee un historial científico fiable offline del estado exacto del cultivo.
              </p>
            </div>

            {/* Duplicated Top Print Button */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <button 
                onClick={() => {
                  triggerInterstitial(
                    "Compilando Auditoría Integral de Cultivo y calibraciones térmicas...",
                    `${adminConfig.sensorPartners[1].name} (Sonda WiFi Ruuvi de Alta Precisión)`,
                    adminConfig.sensorPartners[1].coupon,
                    () => {
                      setIsPrinting(true);
                      setTimeout(() => {
                        window.print();
                        setIsPrinting(false);
                      }, 300);
                    }
                  );
                }}
                className="console-btn-glow"
                style={{ 
                  background: 'linear-gradient(135deg, #00FF88, #00D060)', 
                  color: '#050805', 
                  padding: '12px 24px', 
                  borderRadius: '10px', 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none'
                }}
              >
                📊 Descargar Auditoría Completa (Guardar PDF / Imprimir)
              </button>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                * Genera una copia física u offline del estado completo de tu cultivo para tu historial de sala.
              </p>
            </div>

            {/* Pre-visualización de Ficha de Auditoría en Pantalla (v1.0) */}
            <div className="glow-border glass" style={{ padding: '25px', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.15)', background: 'rgba(0,0,0,0.4)', marginBottom: '25px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#00FF88', display: 'block' }}>DPV PRO - AUDITORÍA INTEGRAL DE SALA</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Diagnóstico de Precisión Científica para Cultivadores</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>PUNTO DE ASESORÍA OFICIAL:</span>
                  <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{adminConfig.growShops[0].name}</strong>
                </div>
              </div>

              {/* Recorrer las 7 secciones de auditoría */}
              {Object.keys(auditSections).map((key) => {
                const sec = auditSections[key];
                return (
                  <div key={key} style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#00F0FF', margin: 0, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {sec.title}
                      </h4>
                      <span className={`badge-audit ${sec.isSet ? 'badge-audit-set' : 'badge-audit-unset'}`}>
                        {sec.badge}
                      </span>
                    </div>

                    {/* Cartel / Alerta en Pantalla */}
                    <div className={`audit-alert-card ${sec.isSet ? 'set' : 'unset'}`}>
                      {sec.alertText}
                    </div>

                    {/* Tabla Estructurada */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255,255,255,0.02)' }}>
                          <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>Parámetro / Variable</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}>Valor Configurado</th>
                          <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>Rango / Referencia Científica</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.data.map((row, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>{row.name}</td>
                            <td style={{ padding: '8px', color: '#00FF88', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.05)' }}>{row.value}</td>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>{row.target}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {/* Equipamientos Activos (Sección de Carga Eléctrica) */}
              <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>🔌 CARGA CLIMÁTICA Y DISPOSITIVOS ACTIVADOS:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.keys(activeDevices).map(key => (
                    <span 
                      key={key} 
                      className={`badge-audit ${activeDevices[key] ? 'badge-audit-set' : 'badge-audit-unset'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {key === 'lights' ? '💡 Luces' : key === 'humidifier' ? '💧 Humidificador' : key === 'dehumidifier' ? '❄️ Deshum.' : key === 'extractor' ? '🌪️ Extractor' : key === 'heater' ? '🔥 Calefactor' : '❄️ AC'}
                      : {activeDevices[key] ? 'Activo' : 'Inactivo'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cupones de descuento activos */}
              <div style={{ marginBottom: '25px', background: 'rgba(255, 214, 0, 0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255, 214, 0, 0.15)', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFD600', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>🎫 CUPONES DE DESCUENTO Y SOCIOS ACTIVADOS EN SESIÓN:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🛍️ Grow Shop: <strong>{adminConfig.growShops[0].coupon}</strong> (10% OFF en {adminConfig.growShops[0].name})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>💡 Panel LED: <strong>{adminConfig.sponsors.led.coupon}</strong> (Mars Hydro FC)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🌪️ Turbina Extracción: <strong>{adminConfig.sponsors.ventilation.coupon}</strong> (Garden Highpro)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🛡️ Preventivo Oídio: <strong>{adminConfig.sponsors.fungicide.coupon}</strong> (BioGreen Fungi)</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                  onClick={() => {
                    triggerInterstitial(
                      "Compilando Auditoría Integral de Cultivo y calibraciones térmicas...",
                      `${adminConfig.sensorPartners[1].name} (Sonda WiFi Ruuvi de Alta Precisión)`,
                      adminConfig.sensorPartners[1].coupon,
                      () => {
                        setIsPrinting(true);
                        setTimeout(() => {
                          window.print();
                          setIsPrinting(false);
                        }, 300);
                      }
                    );
                  }}
                  className="console-btn-glow"
                  style={{ 
                    background: 'linear-gradient(135deg, #00FF88, #00D060)', 
                    color: '#050805', 
                    padding: '12px 24px', 
                    borderRadius: '10px', 
                    fontSize: '0.9rem', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none'
                  }}
                >
                  📊 Descargar Auditoría Completa (Guardar PDF / Imprimir)
                </button>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  * Genera una copia física u offline del estado completo de tu cultivo para tu historial de sala.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeProTool === 'anuncios' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#00FF88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚙️ Consola de Administración de Publicidades
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Controla en tiempo real los 7 espacios publicitarios de DPV PRO. Modifica los códigos de cupón, nombres de marca y enlaces para tus socios comerciales.
                </p>
              </div>
              
              <a 
                href="mailto:administracion@dpvpro.com?subject=Consulta%20de%20Patrocinio%20en%20DPV%20PRO&body=Hola!%20Deseo%20obtener%20más%20información%20sobre%20los%20planes%20y%20tarifas%20de%20patrocinio%20para%20los%20espacios%20publicitarios%20de%20DPV%20PRO."
                className="console-btn-glow"
                style={{ 
                  background: 'rgba(0, 255, 136, 0.1)', 
                  border: '1px solid #00FF88', 
                  color: '#00FF88',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📧 Solicitar Información de Patrocinio
              </a>
            </div>

            {/* Métricas de Publicidad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div className="glow-border glass" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>TOTAL ESPACIOS</span>
                <strong style={{ fontSize: '1.75rem', color: '#00f0ff', fontFamily: 'monospace' }}>{adSlots.length}</strong>
              </div>
              <div className="glow-border glass" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>PARTNERS ACTIVOS</span>
                <strong style={{ fontSize: '1.75rem', color: '#00FF88', fontFamily: 'monospace' }}>{adSlots.filter(s => s.partnerActive).length}</strong>
              </div>
              <div className="glow-border glass" style={{ padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ESPACIOS DISPONIBLES</span>
                <strong style={{ fontSize: '1.75rem', color: '#FFD600', fontFamily: 'monospace' }}>{adSlots.filter(s => !s.partnerActive).length}</strong>
              </div>
            </div>

            {/* Listado de Espacios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {adSlots.map(slot => (
                <div key={slot.id} className="glow-border glass" style={{ 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: slot.partnerActive ? '1px solid rgba(0, 255, 136, 0.15)' : '1px solid rgba(255, 214, 0, 0.15)',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  {/* Fila 1: Cabecera del Slot */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#fff', display: 'block' }}>{slot.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        📍 Ubicación: <strong>{slot.location}</strong> | 🏷️ Tipo: <strong>{slot.type}</strong>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: 'bold',
                        background: slot.partnerActive ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 214, 0, 0.1)',
                        color: slot.partnerActive ? '#00FF88' : '#FFD600',
                        border: slot.partnerActive ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 214, 0, 0.2)'
                      }}>
                        {slot.partnerActive ? '🟢 Partner Oficial Activo' : '🟡 Sandbox (Espacio Disponible)'}
                      </span>
                      
                      {/* Botón de Toggle */}
                      <button 
                        onClick={() => toggleAdSlot(slot.id)}
                        className="console-btn-glow"
                        style={{
                          background: slot.partnerActive ? '#FF4D4D' : '#00FF88',
                          color: '#050805',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {slot.partnerActive ? 'Desactivar Partner' : 'Activar Partner'}
                      </button>
                    </div>
                  </div>

                  {/* Fila 2: Configuración Form */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    padding: '15px', 
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>NOMBRE DEL SOCIO COMERCIAL:</label>
                      <input 
                        type="text"
                        value={slot.partnerName}
                        onChange={(e) => {
                          setAdSlots(prev => prev.map(s => 
                            s.id === slot.id ? { ...s, partnerName: e.target.value } : s
                          ));
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          outline: 'none'
                        }}
                        placeholder="Ej: Mars Hydro LED"
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>CÓDIGO DE CUPÓN:</label>
                      <input 
                        type="text"
                        value={slot.coupon}
                        onChange={(e) => {
                          setAdSlots(prev => prev.map(s => 
                            s.id === slot.id ? { ...s, coupon: e.target.value } : s
                          ));
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          outline: 'none'
                        }}
                        placeholder="Ej: LEDSHADOW"
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>REDIRECCIÓN (SEGURO/INTERNO):</label>
                      <select
                        value={slot.link ? 'custom' : 'modal'}
                        onChange={(e) => {
                          const val = e.target.value === 'modal' ? '' : 'https://';
                          setAdSlots(prev => prev.map(s => 
                            s.id === slot.id ? { ...s, link: val } : s
                          ));
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="modal">Redirección Interna DPV PRO (Seguro - Recomendado)</option>
                        <option value="custom">URL Externa Customizada (Administrador)</option>
                      </select>
                    </div>
                  </div>

                  {/* Fila 3: Acciones */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {slot.partnerActive 
                        ? `🔗 Redirección activa: ${slot.link ? slot.link : 'Modal Seguro de Lead Capture'}` 
                        : `🔗 Sandbox: Clic redirige a 'Futura Publicidad' + mailto de consulta`
                      }
                    </span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => triggerSponsorContact(slot.id)}
                        className="console-btn-glow"
                        style={{
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00f0ff',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🔍 Probar Vista (Modal)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    
    {showLimitWarning && (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(5, 8, 5, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="glass glow-border" style={{
          maxWidth: '480px',
          width: '100%',
          padding: '30px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid rgba(255, 214, 0, 0.4)',
          boxShadow: '0 0 30px rgba(255, 214, 0, 0.15)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⭐</div>
          <h3 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '1.4rem' }}>Límite de Perfiles Alcanzado</h3>
          <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            En el plan gratuito de DPV PRO solo puedes almacenar **1 perfil de sala** local. 
            Para guardar perfiles ilimitados y desbloquear todas las herramientas avanzadas de precisión, suscríbete a DPV PRO Premium.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setShowLimitWarning(false);
                setActiveProTool('premium');
              }}
              className="premium-btn"
              style={{
                background: 'linear-gradient(135deg, #FFE066, #F5B041)',
                color: '#050e05',
                fontWeight: 'bold',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Ver Planes Premium ⭐
            </button>
            <button 
              onClick={() => setShowLimitWarning(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
  );
}

export default HerramientasProView;
