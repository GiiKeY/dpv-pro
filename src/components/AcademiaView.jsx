import { Sparkles, ChevronRight, Heart, Target, Thermometer, Activity, GraduationCap } from 'lucide-react';

function AcademiaView({
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  quizScore,
  setQuizScore,
  copiedText,
  handleCopy,
  setIsSupportModalOpen,
  renderAdSenseBanner,
  adminConfig
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'fadeIn 0.5s ease', marginBottom: '25px' }}>
      <div className="pro-module-card" style={{ width: '100%', boxSizing: 'border-box' }}>
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
            <h5>2. Si tu DPV diurno cae de forma continua por debajo de 0.4 kPa en floración, ¿cuál es el peligro inmediato?</h5>
            <div className="quiz-options">
              <button className={`quiz-opt-btn ${quizAnswers.q2 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'A' })}>
                A. Que las plantas transpiren demasiado rápido y sufran necrosis salina.
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q2 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'B' })}>
                B. Que la fotosíntesis se detenga porque las hojas se calientan mucho.
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q2 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'C' })}>
                C. Que la transpiración y succión capilar de nutrientes se detenga por completo, arriesgando deficiencias y hongos. (Correcto)
              </button>
            </div>
          </div>

          {/* Pregunta 3 */}
          <div className="quiz-question-box">
            <h5>3. ¿Qué representa físicamente el "Punto de Rocío" en tu cuarto de cultivo?</h5>
            <div className="quiz-options">
              <button className={`quiz-opt-btn ${quizAnswers.q3 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'A' })}>
                A. La temperatura a la cual el vapor de agua en el aire se satura y se condensa en gotas líquidas sobre tus flores. (Correcto)
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q3 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'B' })}>
                B. La humedad máxima permitida por el sustrato de fibra de coco.
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q3 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'C' })}>
                C. El nivel óptimo de electroconductividad (EC) para esquejes.
              </button>
            </div>
          </div>

          {/* Pregunta 4 */}
          <div className="quiz-question-box">
            <h5>4. ¿Por qué las luminarias LED tradicionales requieren un DPV diferente o mayor temperatura ambiente que el Sodio HPS?</h5>
            <div className="quiz-options">
              <button className={`quiz-opt-btn ${quizAnswers.q4 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'A' })}>
                A. Porque los paneles LED consumen un 80% más de agua en su enfriamiento.
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q4 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'B' })}>
                B. Porque el LED no emite radiación infrarroja térmica directa, haciendo que las hojas estén hasta 3°C más frías que el aire. (Correcto)
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q4 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'C' })}>
                C. Porque el espectro de luz azul inhibe naturalmente la transpiración.
              </button>
            </div>
          </div>

          {/* Pregunta 5 */}
          <div className="quiz-question-box">
            <h5>5. Si los estomas se cierran debido a un DPV seco extremo (ej: 2.1 kPa), ¿cuál es la consecuencia directa de mantener focos de alta potencia encendidos?</h5>
            <div className="quiz-options">
              <button className={`quiz-opt-btn ${quizAnswers.q5 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'A' })}>
                A. Un aumento del 50% en la asimilación del CO₂ ambiental.
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q5 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'B' })}>
                B. Fotorrespiración dañina, desperdicio masivo de energía eléctrica y quemaduras tisulares. (Correcto)
              </button>
              <button className={`quiz-opt-btn ${quizAnswers.q5 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'C' })}>
                C. Que los cogollos maduren en la mitad del tiempo establecido.
              </button>
            </div>
          </div>
        </div>

        {!quizSubmitted ? (
          <button 
            className="quiz-submit-btn"
            onClick={() => {
              if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5) {
                alert("Por favor responde las 5 preguntas antes de enviar.");
                return;
              }
              let score = 0;
              if (quizAnswers.q1 === 'B') score++;
              if (quizAnswers.q2 === 'C') score++;
              if (quizAnswers.q3 === 'A') score++;
              if (quizAnswers.q4 === 'B') score++;
              if (quizAnswers.q5 === 'B') score++;
              setQuizScore(score);
              setQuizSubmitted(true);
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
                <button className="quiz-reset-btn" onClick={() => {
                  setQuizAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '' });
                  setQuizSubmitted(false);
                  setQuizScore(0);
                }} style={{ marginTop: '15px' }}>
                  Reiniciar Trivia 🔄
                </button>
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

            {/* Tarjeta de Conversión Cursos Academia */}
            <div className="glow-border" style={{
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.05), rgba(0, 0, 0, 0.6))',
              border: '1px solid rgba(255, 214, 0, 0.2)',
              padding: '20px',
              borderRadius: '14px',
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={20} color="#FFD600" />
                <strong style={{ color: '#FFD600', fontSize: '1rem', letterSpacing: '0.5px' }}>Growers Academy Online</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#ccc', margin: 0, lineHeight: 1.4 }}>
                Lleva tus habilidades al siguiente nivel con el <strong>{adminConfig.sponsors.academy.course}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>Solo {adminConfig.sponsors.academy.price} USD</span>
                <a 
                  href={adminConfig.sponsors.academy.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-btn" 
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.8rem', 
                    background: 'var(--accent-glow)', 
                    borderColor: '#00FF88',
                    color: '#fff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    borderRadius: '8px'
                  }}
                >
                  Matricularme 🎓
                </a>
              </div>
            </div>

            {/* Tabla de Retroalimentación de Respuestas */}
            <div className="feedback-section" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <h5 style={{ color: '#fff', marginBottom: '15px' }}>Análisis de Respuestas:</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <strong>Q1: ¿Dónde ocurre el DPV real?</strong><br />
                  Tu respuesta: <span style={{ color: quizAnswers.q1 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 'bold' }}>{quizAnswers.q1}</span> | Correcta: B.<br />
                  <span style={{ color: '#888' }}>Fisiología: El DPV mide la diferencia de presión entre el interior saturado de la hoja (100% HR en la cavidad subestomática) y el aire de la sala.</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <strong>Q2: Peligro de DPV por debajo de 0.4 kPa:</strong><br />
                  Tu respuesta: <span style={{ color: quizAnswers.q2 === 'C' ? '#00FF88' : '#FF4D4D', fontWeight: 'bold' }}>{quizAnswers.q2}</span> | Correcta: C.<br />
                  <span style={{ color: '#888' }}>Fisiología: Al no haber diferencial de presión, la planta no puede transpirar agua. El transporte pasivo de Calcio y Magnesio se detiene, y se acumula humedad foliar que invita a patógenos.</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <strong>Q3: Significado del Punto de Rocío:</strong><br />
                  Tu respuesta: <span style={{ color: quizAnswers.q3 === 'A' ? '#00FF88' : '#FF4D4D', fontWeight: 'bold' }}>{quizAnswers.q3}</span> | Correcta: A.<br />
                  <span style={{ color: '#888' }}>Termodinámica: Al caer la temperatura del aire al punto de rocío, el gas se condensa a líquido. Si la hoja está fría, se forma agua líquida en ella (caldo de cultivo para oídio/botrytis).</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <strong>Q4: Diferencia térmica de LED vs Sodio (HPS):</strong><br />
                  Tu respuesta: <span style={{ color: quizAnswers.q4 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 'bold' }}>{quizAnswers.q4}</span> | Correcta: B.<br />
                  <span style={{ color: '#888' }}>Termofísica: El Sodio emite radiación infrarroja masiva directa que calienta los tejidos foliares. Los LEDs son luz fría, por lo que la transpiración enfría activamente las hojas por debajo de la temperatura ambiental.</span>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <strong>Q5: Consecuencia de estomas cerrados por DPV seco:</strong><br />
                  Tu respuesta: <span style={{ color: quizAnswers.q5 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 'bold' }}>{quizAnswers.q5}</span> | Correcta: B.<br />
                  <span style={{ color: '#888' }}>Fisiología Cuántica: Si los estomas se cierran por defensa, no entra CO₂. La clorofila no puede canalizar los fotones entrantes a la fase oscura, reaccionando el oxígeno excitado celularmente (fotorrespiración y fototoxidad).</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {renderAdSenseBanner && renderAdSenseBanner("Trivia Native Ad")}

      {/* Guías Científicas Exclusivas de la Academia DPV */}
      <section className="education-section glass">
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

      <section className="education-section glass" style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.03), rgba(0, 0, 0, 0.4))', borderColor: 'rgba(0, 240, 255, 0.25)' }}>
        <div className="info-header">
          <Activity size={24} color="#00F0FF" className="icon-pulse" />
          <h3>Guía Científica: Simuladores Biofísicos Avanzados (v0.8)</h3>
        </div>
        <div className="education-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="edu-card">
            <h4>🔬 Osmosis y Succión de Nutrientes</h4>
            <p>La absorción mineral no es solo cuestión de EC. El DPV actúa como la bomba de succión pasiva de la planta. Si el DPV es muy alto, la planta absorbe agua aceleradamente y acumula sales en la raíz (necrosis o "puntas quemadas"). Si el DPV es muy bajo, la corriente se detiene, causando deficiencias estructurales de Calcio y Magnesio aunque midas bien tu EC/pH.</p>
          </div>
          <div className="edu-card">
            <h4>🌡️ Estimación Térmica (Láser IR)</h4>
            <p>El balance convectivo calcula la temperatura real de las hojas sin termómetro láser. Las luminarias LED emiten poco calor infrarrojo radiante directo, haciendo que las hojas transpiren y se enfríen hasta 3°C por debajo del aire. El Sodio (HPS) emite radiación infrarroja masiva directa que calienta las hojas hasta 1.5°C por encima del ambiente.</p>
          </div>
          <div className="edu-card">
            <h4>⏱️ Reloj de Presión de Esporas</h4>
            <p>Los patógenos fúngicos (Oídio, Botrytis) no atacan al azar. Requieren una película microscópica de agua condensada continua durante 4 a 6 horas sobre la cutícula vegetal. El reloj calcula este período en tiempo real cuando entras a la zona de rocío (DPV &lt; 0.3 kPa), permitiendo actuar antes de que la espora complete su germinación celular.</p>
          </div>
          <div className="edu-card">
            <h4>💡 Eficiencia Cuántica (PPFD)</h4>
            <p>La fotosíntesis efectiva requiere que los estomas estén abiertos para absorber CO₂. Si el DPV es seco o estresante, los estomas se cierran para no deshidratarse. Enviar luz intensa (PPFD elevado) a una canopia con estomas cerrados provoca fotorrespiración, quemaduras tisulares y un desperdicio absoluto de energía eléctrica. ¡Alinea siempre tu Dimer al DPV!</p>
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

      <section className="support-section glass" style={{ marginBottom: '40px' }}>
        <Heart size={20} color="#FF4D4D" className="heart-beat" />
        <p>¿Te sirve esta herramienta? Apóyanos para seguir mejorando el proyecto.</p>
        <button className="support-btn" onClick={() => setIsSupportModalOpen(true)}>Invítanos un café ☕</button>
      </section>
    </div>
  );
}

export default AcademiaView;
