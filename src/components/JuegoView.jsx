import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Gamepad2, Dices, AlertTriangle, 
  HelpCircle, CheckCircle, Trophy, Crown, ArrowRight
} from 'lucide-react';
import './JuegoView.css';
import confetti from 'canvas-confetti';


// Pool de preguntas científicas adaptadas a las 4 etapas biológicas
const PREGUNTAS_POOL = {
  germinacion: [
    {
      q: "¿Cuál es el rango de temperatura óptimo para la germinación de semillas?",
      opts: ["A. 15-18°C", "B. 20-25°C", "C. 28-32°C"],
      ans: 1,
      why: "La temperatura cálida moderada (20-25°C) estimula las enzimas de la semilla para romper la latencia e iniciar la germinación sin pudrirla."
    },
    {
      q: "¿Qué nivel de Humedad Relativa (HR) es ideal durante la germinación?",
      opts: ["A. 40-50% (seco)", "B. 60-70% (medio)", "C. 80-90% (muy alta)"],
      ans: 2,
      why: "Se requiere alta humedad (80-90%) para suavizar la cáscara seminal y mantener hidratada la radícula emergente en su primera fase."
    },
    {
      q: "¿Por qué no se debe abonar con alta conductividad eléctrica (EC) en germinación?",
      opts: ["A. Quema la radícula tierna", "B. Pone las hojas amarillas", "C. Hace crecer hongos"],
      ans: 0,
      why: "Las raíces primarias recién nacidas carecen de cutícula protectora y un nivel alto de sales (alta EC) causa ósmosis inversa, deshidratando y quemando la raíz."
    },
    {
      q: "¿Qué tipo de iluminación se recomienda para las semillas recién brotadas?",
      opts: ["A. Luz de alta potencia a 1200 PPFD", "B. Luz suave y difusa (PPFD ~150-200)", "C. Oscuridad absoluta continua"],
      ans: 1,
      why: "Los cotiledones y primeros brotes son muy sensibles. Una luz excesiva causará fototoxidad. Una luz suave es ideal para iniciar fotosíntesis."
    },
    {
      q: "¿Qué estimula fisiológicamente la ruptura de latencia seminal?",
      opts: ["A. Inundación salina y frío polar", "B. Absorción pasiva de agua y temperatura templada", "C. Estimulación mecánica por luz infrarroja"],
      ans: 1,
      why: "La imbibición (absorción de agua) expande las células y activa las giberelinas bajo calor moderado, empujando la radícula al exterior."
    }
  ],
  clon: [
    {
      q: "¿Cuál es el DPV ideal recomendado para esquejes o clones sin raíz?",
      opts: ["A. DPV muy bajo (0.4-0.6 kPa)", "B. DPV óptimo (1.0 kPa)", "C. DPV seco (1.6 kPa)"],
      ans: 0,
      why: "Al no tener raíces, el clon no puede absorber agua. Un DPV bajo (0.4-0.6 kPa) minimiza la transpiración foliar, evitando que el esqueje se deshidrate mientras enraíza."
    },
    {
      q: "¿Por qué los esquejes requieren un propagador o domo cerrado?",
      opts: ["A. Para evitar que entre aire contaminado", "B. Para mantener la humedad relativa altísima y frenar la transpiración foliar", "C. Para concentrar el CO2"],
      ans: 1,
      why: "El domo saturado de humedad detiene la demanda evaporativa del aire. Fisiológicamente, reduce la transpiración al mínimo para que la planta concentre su energía en crear raíces."
    },
    {
      q: "¿Qué espectro de iluminación promueve un enraizamiento más veloz?",
      opts: ["A. Espectro rojo lejano continuo", "B. Luz azul sutil a baja intensidad", "C. Espectro infrarrojo de calor"],
      ans: 1,
      why: "La luz azul de baja intensidad (~100 PPFD) promueve estomas sanos y frena el estiramiento del tallo, redirigiendo las auxinas hacia la base para enraizar."
    },
    {
      q: "¿Qué hormona endógena promueve directamente el enraizamiento?",
      opts: ["A. Giberelinas", "B. Citocininas", "C. Auxinas"],
      ans: 2,
      why: "Las auxinas son fitohormonas reguladoras del crecimiento que se acumulan en la base del tallo y estimulan la diferenciación de células hacia raíces adventicias."
    },
    {
      q: "¿Cuándo se debe realizar el primer riego de abono ligero en clones?",
      opts: ["A. El primer día de corte", "B. Al ver aparecer las primeras raíces blancas en el medio de enraizamiento", "C. Al cabo de un mes"],
      ans: 1,
      why: "Antes de ver raíces, la planta no tiene cómo absorber abono y las sales pueden retrasar el enraizamiento. Una vez brotan raíces, se inicia fertilización suave."
    }
  ],
  vegetativo: [
    {
      q: "¿Cuál es el rango de DPV óptimo para la fase vegetativa?",
      opts: ["A. 0.4 - 0.7 kPa", "B. 0.8 - 1.2 kPa", "C. 1.4 - 1.8 kPa"],
      ans: 1,
      why: "Un DPV de 0.8 a 1.2 kPa balancea perfectamente la transpiración. Los estomas se abren al máximo para captar CO2 y los nutrientes suben de forma fluida."
    },
    {
      q: "¿Qué macroelemento es el más demandado por la planta en vegetativo?",
      opts: ["A. Nitrógeno", "B. Fósforo", "C. Potasio"],
      ans: 0,
      why: "El nitrógeno es esencial para formar aminoácidos, proteínas y clorofila, impulsando el crecimiento explosivo de tallos y hojas."
    },
    {
      q: "Si el DPV sube a 1.9 kPa (muy seco) en vegetativo, ¿cómo reacciona la planta?",
      opts: ["A. Abre más los estomas para absorber agua", "B. Cierra los estomas para retener agua, deteniendo la fotosíntesis", "C. Transpira el doble de CO2"],
      ans: 1,
      why: "Ante el aire muy seco, las células oclusivas cierran los estomas para evitar la deshidratación. Esto frena el intercambio gaseoso y detiene la fotosíntesis."
    },
    {
      q: "¿Cuál es el fotoperíodo de luz estándar para mantener plantas en vegetación activa?",
      opts: ["A. 12 horas de luz / 12 horas de oscuridad", "B. 18 horas de luz / 6 horas de oscuridad", "C. 24 horas de oscuridad"],
      ans: 1,
      why: "El ciclo 18/6 imita el sol de verano, estimulando la producción de hormonas de crecimiento vegetativo y previniendo la floración inducida."
    },
    {
      q: "¿Qué indica un DPV óptimo (~1.0 kPa) sobre la salud del sustrato?",
      opts: ["A. Que la raíz absorberá agua y nutrientes a ritmo constante sin acumular sales dañinas", "B. Que el sustrato se secará en una hora", "C. Que el pH del suelo bajará a 4.0"],
      ans: 0,
      why: "Un DPV equilibrado asegura una corriente de transpiración sana. La planta absorbe agua y iones minerales proporcionalmente, evitando sequías o acumulaciones salinas."
    }
  ],
  floracion: [
    {
      q: "¿Cuál es el rango de DPV recomendado para floración avanzada?",
      opts: ["A. 0.5 - 0.8 kPa", "B. 0.9 - 1.1 kPa", "C. 1.2 - 1.6 kPa"],
      ans: 2,
      why: "Un DPV mayor (1.2-1.6 kPa, ambiente más seco) favorece la transpiración de flores densas, previene hongos patógenos y estimula la síntesis de resina protectora."
    },
    {
      q: "¿Por qué es crítico evitar el Punto de Rocío en las horas de oscuridad?",
      opts: ["A. Porque las plantas no pueden dormir", "B. Porque el vapor se condensa en gotas líquidas sobre flores densas, gatillando Botrytis", "C. Porque los estomas se queman"],
      ans: 1,
      why: "Si la temperatura baja al punto de rocío, el vapor de agua libre se condensa en gotas de agua líquida. En cogollos densos a oscuras, esto crea el hábitat ideal para hongos."
    },
    {
      q: "¿Qué macronutrientes esenciales son los más demandados en floración?",
      opts: ["A. Calcio y Nitrógeno", "B. Fósforo y Potasio", "C. Hierro y Azufre"],
      ans: 1,
      why: "El Fósforo es clave para la transferencia energética celular (ATP) y formación de flores, y el Potasio regula la apertura estomática y acumulación de azúcares/resinas."
    },
    {
      q: "Si los estomas se cierran por estrés térmico en floración, ¿qué pasa si mantienes luces muy potentes?",
      opts: ["A. Las flores producen el doble de terpenos", "B. Fotorrespiración destructiva, clorosis y desperdicio de energía", "C. La fotosíntesis aumenta de manera indirecta"],
      ans: 1,
      why: "Sin CO2 (estomas cerrados), la luz intensa no se puede canalizar en el ciclo de Calvin. Los fotones excitan al oxígeno celular, provocando radicales libres dañinos y quemaduras foliares."
    },
    {
      q: "¿Qué ventaja adaptativa ofrece un DPV seco (~1.5 kPa) al final de la floración?",
      opts: ["A. Estimula la producción de tricomas y resina como mecanismo de defensa contra la deshidratación", "B. Hace brotar más hojas verdes", "C. Reduce la demanda de fósforo"],
      ans: 0,
      why: "La resina actúa como barrera física contra la pérdida de agua. Un ambiente con DPV seco estimula a la planta a cubrirse de tricomas resinosos para resguardarse."
    }
  ]
};

// Mapeo espacial de casillas en una cuadrícula de 11x11 (tablero tipo Cubiflor/recorrido cerrado)
const MAPA_CASILLAS = {};
// Fila superior (0 a 10)
for (let i = 0; i <= 10; i++) {
  MAPA_CASILLAS[i] = { x: i, y: 0, stage: 'germinacion', color: '#00FF88', label: '🫘 SEMILLA' };
}
// Columna derecha (11 a 20)
for (let i = 1; i <= 10; i++) {
  MAPA_CASILLAS[10 + i] = { x: 10, y: i, stage: 'clon', color: '#00F0FF', label: '🪴 CLON' };
}
// Fila inferior (21 a 30, de derecha a izquierda)
for (let i = 1; i <= 10; i++) {
  MAPA_CASILLAS[20 + i] = { x: 10 - i, y: 10, stage: 'vegetativo', color: '#FFD600', label: '🌿 VEGETATIVO' };
}
// Columna izquierda (31 a 39, de abajo hacia arriba)
for (let i = 1; i <= 9; i++) {
  MAPA_CASILLAS[30 + i] = { x: 0, y: 10 - i, stage: 'floracion', color: '#A855F7', label: '🌸 FLORA' };
}

// Casillas especiales
const CASILLAS_ESPECIALES = {
  5: { type: 'penalty', label: '💧 Exceso Riego', val: -2, desc: 'Falta oxígeno. Retrocede 2 casillas.' },
  15: { type: 'lose_turn', label: '🕷️ Araña Roja', val: 1, desc: 'Clima muy seco. Pierdes 1 turno.' },
  25: { type: 'penalty', label: '❄️ Hongo Oídio', val: -3, desc: 'DPV muy bajo. Retrocede 3 casillas.' },
  35: { type: 'lose_turn', label: '🍄 Botrytis', val: 1, desc: 'Agua condensada. Pierdes 1 turno.' },
  8: { type: 'bonus', label: '🚀 Modo Smart', val: 3, desc: 'Clima automatizado perfecto. ¡Avanza 3 casillas!' },
  18: { type: 'bonus', label: '🚀 Modo Smart', val: 3, desc: 'Clima automatizado perfecto. ¡Avanza 3 casillas!' },
  28: { type: 'bonus', label: '🚀 Modo Smart', val: 3, desc: 'Clima automatizado perfecto. ¡Avanza 3 casillas!' }
};

const COLORES_JUGADORES = [
  { hex: '#FF4D4D', text: 'Rojo Neón', name: '🔴 J1' },
  { hex: '#00F0FF', text: 'Azul Eléctrico', name: '🔵 J2' },
  { hex: '#00FF88', text: 'Verde Esmeralda', name: '🟢 J3' },
  { hex: '#FFD600', text: 'Amarillo Sol', name: '🟡 J4' }
];

const BOT_ARCHETYPES = [
  { name: "Bot Fisiólogo 🔬", rate: 0.85, desc: "Experto en estomas. Acierta el 85% de las preguntas." },
  { name: "Bot Cultivador 🌿", rate: 0.70, desc: "Cultivador experimentado. Acierta el 70%." },
  { name: "Bot Humedad 💧", rate: 0.60, desc: "Acierta el 60%." },
  { name: "Bot Novato 🪴", rate: 0.45, desc: "Estudiante de la academia. Acierta el 45%." }
];

// Funciones puras de números aleatorios definidas fuera del cuerpo del componente React
// Esto satisface la regla de react-hooks/purity del linter
const getRandIndex = (length) => Math.floor(Math.random() * length);
const getRandDie = () => Math.floor(Math.random() * 6) + 1;

function JuegoView({ setView }) {
  // Estados de configuración de jugadores
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Cultivador 1', 'Cultivador 2', 'Cultivador 3', 'Cultivador 4']);
  const [playerTypes, setPlayerTypes] = useState(['human', 'human', 'human', 'human']); // 'human' o 'bot'
  const [gameState, setGameState] = useState('setup'); // 'setup', 'sorteo', 'sorteo_empate', 'playing', 'finished'
  
  // Estados de la fase de sorteo de turnos
  const [sorteoRolls, setSorteoRolls] = useState({}); // { playerId: number }
  const [orderTieBreakers, setOrderTieBreakers] = useState({}); // { playerId: number } (para empates)
  const [tiedPlayers, setTiedPlayers] = useState([]); // Array de ids de jugadores empatados
  const [turnOrder, setTurnOrder] = useState([]); // Array ordenado de playerIds
  const [sorteoStep, setSorteoStep] = useState(0); // Jugador actual tirando en sorteo
  
  // Estados de la partida activa
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [playerPositions, setPlayerPositions] = useState({}); // { playerId: number (0-39) }
  const [playerTurnsBlocked, setPlayerTurnsBlocked] = useState({}); // { playerId: number (turnos bloqueados) }
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionState, setQuestionState] = useState('pending'); // 'pending', 'correct', 'incorrect'
  const [alertText, setAlertText] = useState(null);
  
  // Dado digital
  const [dieVal, setDieVal] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [diceLogs, setDiceLogs] = useState([]);
  const [winner, setWinner] = useState(null);

  // Automatización de Bots de IA mediante useEffect
  useEffect(() => {
    // 1. Fase Sorteo de Turnos Inicial
    if (gameState === 'sorteo') {
      const isCurrentBot = playerTypes[sorteoStep] === 'bot';
      const alreadyRolled = sorteoRolls[sorteoStep] !== undefined;
      if (isCurrentBot && !alreadyRolled) {
        const timer = setTimeout(() => {
          rollSorteo(sorteoStep);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // 2. Fase Sorteo Desempate
    if (gameState === 'sorteo_empate') {
      const activePlayerId = tiedPlayers[sorteoStep];
      const isCurrentBot = playerTypes[activePlayerId] === 'bot';
      const alreadyRolled = orderTieBreakers[activePlayerId] !== undefined;
      if (isCurrentBot && !alreadyRolled) {
        const timer = setTimeout(() => {
          rollEmpate(activePlayerId);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // 3. Fase de Partida Activa
    if (gameState === 'playing') {
      const activePlayerId = turnOrder[currentPlayerIdx];
      const isActiveBot = playerTypes[activePlayerId] === 'bot';

      if (isActiveBot) {
        // A. Responder la Trivia
        if (questionState === 'pending' && activeQuestion) {
          const timer = setTimeout(() => {
            const archetypeIdx = activePlayerId % BOT_ARCHETYPES.length;
            const archetype = BOT_ARCHETYPES[archetypeIdx];
            const isCorrect = Math.random() < archetype.rate;
            const chosenAns = isCorrect ? activeQuestion.ans : (activeQuestion.ans + 1) % activeQuestion.opts.length;
            handleAnswerSubmit(chosenAns);
          }, 3000); // 3 segundos de simulación de pensamiento
          return () => clearTimeout(timer);
        }

        // B. Lanzar Dado de Movimiento
        if (questionState === 'correct' && !hasRolled && !isRolling) {
          const timer = setTimeout(() => {
            rollGameDice();
          }, 2000); // 2 segundos antes de tirar el dado
          return () => clearTimeout(timer);
        }

        // C. Pasar el Turno automáticamente
        if (questionState === 'incorrect' || (questionState === 'correct' && hasRolled && !isRolling)) {
          const delayTime = alertText ? 5500 : 4000;
          const timer = setTimeout(() => {
            nextTurn();
          }, delayTime);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState, sorteoStep, sorteoRolls, orderTieBreakers, currentPlayerIdx, questionState, hasRolled, isRolling, activeQuestion, alertText, playerTypes, tiedPlayers, turnOrder]);


  // Inicializar posiciones de jugadores
  const initGame = (finalOrder) => {
    const initPositions = {};
    const initBlocked = {};
    finalOrder.forEach(pId => {
      initPositions[pId] = 0;
      initBlocked[pId] = 0;
    });
    setPlayerPositions(initPositions);
    setPlayerTurnsBlocked(initBlocked);
    setTurnOrder(finalOrder);
    setCurrentPlayerIdx(0);
    setDiceLogs([`¡Orden establecido! Empieza ${playerNames[finalOrder[0]]}`]);
    setGameState('playing');
    loadQuestion(0); // Carga pregunta para etapa germinación
  };

  // Cargar una pregunta aleatoria basada en la etapa actual del peón
  const loadQuestion = (playerPos) => {
    const stage = MAPA_CASILLAS[playerPos]?.stage || 'germinacion';
    const pool = PREGUNTAS_POOL[stage];
    const randQ = pool[getRandIndex(pool.length)];
    setActiveQuestion(randQ);
    setQuestionState('pending');
    setHasRolled(false);
  };

  // Manejar el sorteo inicial de dados
  const rollSorteo = (pId) => {
    const roll = getRandDie();
    const newRolls = { ...sorteoRolls, [pId]: roll };
    setSorteoRolls(newRolls);
    
    if (sorteoStep < numPlayers - 1) {
      setSorteoStep(sorteoStep + 1);
    } else {
      // Analizar empates o decidir orden
      resolveSorteoOrder(newRolls);
    }
  };

  const resolveSorteoOrder = (rolls) => {
    // Agrupar jugadores por sus dados sacados
    const sorted = Object.keys(rolls)
      .map(id => ({ id: parseInt(id), roll: rolls[id] }))
      .sort((a, b) => b.roll - a.roll);

    // Comprobar si hay empates
    const rollsCount = {};
    sorted.forEach(item => {
      rollsCount[item.roll] = (rollsCount[item.roll] || 0) + 1;
    });

    const hasTies = Object.values(rollsCount).some(c => c > 1);

    if (!hasTies) {
      // Orden perfecto sin empates
      const finalOrder = sorted.map(item => item.id);
      initGame(finalOrder);
    } else {
      // Hay empates, entrar a fase de desempate
      const ties = [];
      const highestTieValue = Math.max(...Object.keys(rollsCount).filter(roll => rollsCount[roll] > 1).map(Number));
      
      sorted.forEach(item => {
        if (item.roll === highestTieValue) {
          ties.push(item.id);
        }
      });

      setTiedPlayers(ties);
      setOrderTieBreakers({});
      setSorteoStep(0);
      setGameState('sorteo_empate');
    }
  };

  const rollEmpate = (pId) => {
    const roll = getRandDie();
    const newBreakers = { ...orderTieBreakers, [pId]: roll };
    setOrderTieBreakers(newBreakers);

    if (sorteoStep < tiedPlayers.length - 1) {
      setSorteoStep(sorteoStep + 1);
    } else {
      // Resolver desempate
      const sortedBreakers = Object.keys(newBreakers)
        .map(id => ({ id: parseInt(id), roll: newBreakers[id] }))
        .sort((a, b) => b.roll - a.roll);

      const breakerCount = {};
      sortedBreakers.forEach(item => {
        breakerCount[item.roll] = (breakerCount[item.roll] || 0) + 1;
      });

      const stillTied = Object.values(breakerCount).some(c => c > 1);

      if (!stillTied) {
        // Desempate exitoso. Reordenar combinando rolls iniciales y breakers
        // Clasificamos todos los participantes
        const allFinal = Object.keys(sorteoRolls)
          .map(id => {
            const playerIdx = parseInt(id);
            // Peso = roll inicial * 100 + (breaker si existió, o 0)
            const isTied = tiedPlayers.includes(playerIdx);
            const weight = sorteoRolls[playerIdx] * 100 + (isTied ? newBreakers[playerIdx] : 0);
            return { id: playerIdx, weight };
          })
          .sort((a, b) => b.weight - a.weight)
          .map(item => item.id);

        initGame(allFinal);
      } else {
        // Siguen empatados, volver a tirar
        setOrderTieBreakers({});
        setSorteoStep(0);
      }
    }
  };

  // Contestar la trivia
  const handleAnswerSubmit = (optIdx) => {
    if (questionState !== 'pending') return;

    if (optIdx === activeQuestion.ans) {
      setQuestionState('correct');
      setDiceLogs(prev => [`[CORRECTO] ${playerNames[turnOrder[currentPlayerIdx]]} respondió bien. ¡Listo para tirar!`, ...prev]);
    } else {
      setQuestionState('incorrect');
      setDiceLogs(prev => [`[INCORRECTO] ${playerNames[turnOrder[currentPlayerIdx]]} falló. Fin de turno.`, ...prev]);
      // Forzar avance al siguiente jugador tras breve retraso
      setTimeout(() => {
        nextTurn();
      }, 5000);
    }
  };

  // Lanzar dado de juego
  const rollGameDice = () => {
    if (isRolling || hasRolled || questionState !== 'correct') return;
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      setDieVal(getRandDie());
      counter++;
      if (counter > 10) {
        clearInterval(interval);
        const finalRoll = getRandDie();
        setDieVal(finalRoll);
        setIsRolling(false);
        setHasRolled(true);
        executeMovement(finalRoll);
      }
    }, 80);
  };

  // Ejecutar movimiento y comprobar casillas especiales
  const executeMovement = (steps) => {
    const pId = turnOrder[currentPlayerIdx];
    const currentPos = playerPositions[pId];
    let newPos = currentPos + steps;

    // Control de meta / victoria
    if (newPos >= 39) {
      newPos = 39;
      setPlayerPositions(prev => ({ ...prev, [pId]: 39 }));
      setWinner(pId);
      setGameState('finished');
      setDiceLogs(prev => [`🏆 ¡COSECHA EXITOSA! ${playerNames[pId]} ha ganado el juego!`, ...prev]);

      // Lanzar ráfaga de confeti de victoria masiva
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 }
      });

      // Disparar ráfagas continuas desde los laterales durante 3 segundos
      const duration = 3000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00FF88', '#A855F7', '#FFD600', '#00F0FF']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00FF88', '#A855F7', '#FFD600', '#00F0FF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      return;
    }

    setPlayerPositions(prev => ({ ...prev, [pId]: newPos }));
    setDiceLogs(prev => [`🎲 ${playerNames[pId]} sacó ${steps} y avanzó a casilla ${newPos}`, ...prev]);

    // Comprobar casilla especial
    const special = CASILLAS_ESPECIALES[newPos];
    if (special) {
      setTimeout(() => {
        if (special.type === 'penalty') {
          let penaltyPos = newPos + special.val;
          if (penaltyPos < 0) penaltyPos = 0;
          setPlayerPositions(prev => ({ ...prev, [pId]: penaltyPos }));
          setAlertText(`⚠️ ${special.label}: ${special.desc}`);
          setDiceLogs(prev => [`🚨 PRENDA: ${playerNames[pId]} cayó en ${special.label}. Retrocede a casilla ${penaltyPos}`, ...prev]);
        } else if (special.type === 'bonus') {
          const bonusPos = newPos + special.val;
          setPlayerPositions(prev => ({ ...prev, [pId]: bonusPos }));
          setAlertText(`🚀 ${special.label}: ${special.desc}`);
          setDiceLogs(prev => [`🌟 BONO: ${playerNames[pId]} cayó en ${special.label}. Avanza a casilla ${bonusPos}`, ...prev]);

          // Lanzar ráfaga corta de estrellas neón verdes, azules y blancas
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#00FF88', '#00F0FF', '#FFFFFF']
          });
        } else if (special.type === 'lose_turn') {
          setPlayerTurnsBlocked(prev => ({ ...prev, [pId]: prev[pId] + 1 }));
          setAlertText(`🦟 ${special.label}: ${special.desc}`);
          setDiceLogs(prev => [`🛑 INFECCIÓN: ${playerNames[pId]} cayó en ${special.label}. Pierde 1 turno.`, ...prev]);
        }
      }, 1500);
    }
  };

  // Pasar al siguiente turno
  const nextTurn = () => {
    setAlertText(null);
    let nextIdx = (currentPlayerIdx + 1) % numPlayers;
    const nextPlayerId = turnOrder[nextIdx];

    // Verificar si el siguiente jugador tiene turnos bloqueados (prenda)
    if (playerTurnsBlocked[nextPlayerId] > 0) {
      setDiceLogs(prev => [`🛑 ${playerNames[nextPlayerId]} tiene un turno bloqueado. Pasa turno.`, ...prev]);
      setPlayerTurnsBlocked(prev => ({ ...prev, [nextPlayerId]: prev[nextPlayerId] - 1 }));
      
      // Pasar al siguiente recursivamente
      nextIdx = (nextIdx + 1) % numPlayers;
    }

    setCurrentPlayerIdx(nextIdx);
    const nextPos = playerPositions[turnOrder[nextIdx]];
    loadQuestion(nextPos);
  };

  // Renderizar el avatar evolutivo del jugador correspondiente con su accesorio teñido
  const renderPlantAvatar = (pId, pos) => {
    const color = COLORES_JUGADORES[pId]?.hex || '#fff';

    // Normalizar pos a número
    let position = 0;
    if (typeof pos === 'number') {
      position = pos;
    } else if (typeof pos === 'string') {
      if (pos === 'germinacion') position = 0;
      else if (pos === 'clon') position = 11;
      else if (pos === 'vegetativo') position = 21;
      else if (pos === 'floracion') position = 31;
      else position = 0;
    } else {
      position = 0;
    }

    // IDs únicos para gradientes y filtros para cada peón y nivel de crecimiento
    const glowFilter = `glow-${pId}-${position}`;
    const stemGrad = `stem-grad-${pId}-${position}`;
    const leafGrad1 = `leaf-grad-1-${pId}-${position}`;
    const leafGrad2 = `leaf-grad-2-${pId}-${position}`;
    const potGrad = `pot-grad-${pId}-${position}`;
    const budGrad = `bud-grad-${pId}-${position}`;

    const renderSvgDefs = () => (
      <defs>
        {/* Filtro de Resplandor Neón */}
        <filter id={glowFilter} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Degradado de Tallo Leñoso */}
        <linearGradient id={stemGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#795548" />
          <stop offset="50%" stopColor="#9C786C" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>
        {/* Degradados de Hojas Foliáceas */}
        <linearGradient id={leafGrad1} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#004D40" />
        </linearGradient>
        <linearGradient id={leafGrad2} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEFF41" />
          <stop offset="100%" stopColor="#00C853" />
        </linearGradient>
        {/* Degradado de Maceta de Color */}
        <linearGradient id={potGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="35%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#121214" />
        </linearGradient>
        {/* Degradado de Cogollos */}
        <linearGradient id={budGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3E8FF" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4A044E" />
        </linearGradient>
      </defs>
    );

    // ==========================================================================
    // FASE A: GERMINACIÓN (Casillas 0 a 10) - Semilla, Grieta y Radícula
    // ==========================================================================
    if (position >= 0 && position <= 10) {
      // A.1: Semilla Entera (Casillas 0 a 2)
      if (position <= 2) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
            {renderSvgDefs()}
            {/* Semilla Base */}
            <ellipse cx="20" cy="22" rx="9" ry="11.5" fill="#5C4033" stroke="#8D6E63" strokeWidth="1" transform="rotate(-15, 20, 22)" />
            {/* Brillo 3D */}
            <ellipse cx="17" cy="18" rx="2.5" ry="5.5" fill="#fff" opacity="0.18" transform="rotate(-15, 20, 22)" />
            {/* Lazo del Jugador */}
            <rect x="11" y="20" width="18" height="2.5" rx="1.2" fill={color} stroke="#000" strokeWidth="0.5" transform="rotate(-15, 20, 22)" />
            <circle cx="20" cy="21.2" r="1.5" fill={color} stroke="#000" strokeWidth="0.5" transform="rotate(-15, 20, 22)" />
          </svg>
        );
      }
      // A.2: Semilla Agrietada con brillo verde interno (Casillas 3 a 5)
      if (position <= 5) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
            {renderSvgDefs()}
            {/* Grieta Neón que brilla en el centro */}
            <path d="M20 10 L19 22 L21 32" stroke="#00FF88" strokeWidth="2.5" strokeLinecap="round" fill="none" filter={`url(#${glowFilter})`} />
            {/* Cáscara Izquierda Abierta */}
            <path d="M19.5 10 C14 11, 9 16, 9 22 C9 28, 14 33, 19.5 34 C18.3 27, 18.3 17, 19.5 10 Z" fill="#5C4033" stroke="#3E2723" strokeWidth="0.8" />
            {/* Cáscara Derecha Abierta */}
            <path d="M20.5 10 C26 11, 31 16, 31 22 C31 28, 26 33, 20.5 34 C21.7 27, 21.7 17, 20.5 10 Z" fill="#4E342E" stroke="#3E2723" strokeWidth="0.8" />
            {/* Vincha de Color del Jugador en la Cáscara Izquierda */}
            <rect x="9" y="19" width="9" height="2.2" rx="1" fill={color} stroke="#000" strokeWidth="0.4" />
          </svg>
        );
      }
      // A.3: Raíz Emergente Blanca-Lavanda (Casillas 6 a 8)
      if (position <= 8) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
            {renderSvgDefs()}
            {/* Radícula/Raíz Emergente de la Base */}
            <path d="M20 28 Q22.5 33, 18.5 36 T19.5 41" stroke="#FFF" strokeWidth="2.8" strokeLinecap="round" fill="none" filter={`url(#${glowFilter})`} />
            {/* Brote Verde Minúsculo Empujando por Arriba */}
            <path d="M20 12 Q20.5 8, 18.5 6" stroke="#00FF88" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Cáscaras de la semilla abriéndose */}
            <path d="M19.5 11 C13.5 12, 8.5 17, 8.5 23 C8.5 28.5, 13.5 32, 19.5 33 C18 26, 18 18, 19.5 11 Z" fill="#5C4033" stroke="#3E2723" strokeWidth="0.8" />
            <path d="M20.5 11 C26.5 12, 31.5 17, 31.5 23 C31.5 28.5, 26.5 32, 20.5 33 C22 26, 22 18, 20.5 11 Z" fill="#4E342E" stroke="#3E2723" strokeWidth="0.8" />
            {/* Lazo del Jugador para Identificación */}
            <rect x="8.5" y="19" width="9" height="2.2" rx="1" fill={color} stroke="#000" strokeWidth="0.4" />
          </svg>
        );
      }
      // A.4: Raíz Pivotante Robusta con Pelos y Brote Superior (Casillas 9 a 10)
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
          {renderSvgDefs()}
          {/* Raíz Principal Robusta */}
          <path d="M20 24 C23.5 29, 14.5 34, 18 41" stroke="#F5F5F5" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          {/* Pelos Radiculares Finitos */}
          <line x1="19" y1="28" x2="15.2" y2="28" stroke="#FFF" strokeWidth="0.6" opacity="0.8" />
          <line x1="21.2" y1="32" x2="25.2" y2="33" stroke="#FFF" strokeWidth="0.6" opacity="0.8" />
          <line x1="17.2" y1="36" x2="13.2" y2="37" stroke="#FFF" strokeWidth="0.6" opacity="0.8" />
          {/* Cáscaras de semilla desprendiéndose a los lados */}
          <ellipse cx="10" cy="24" rx="3" ry="8.5" fill="#3E2723" stroke="#2D1A10" strokeWidth="0.5" transform="rotate(-30, 10, 24)" />
          <ellipse cx="30" cy="24" rx="3" ry="8.5" fill="#3E2723" stroke="#2D1A10" strokeWidth="0.5" transform="rotate(30, 30, 24)" />
          {/* Tallo del brote empujando arriba */}
          <line x1="20" y1="24" x2="20" y2="12" stroke="#81C784" strokeWidth="2.5" />
          {/* Primeros Cotiledones minúsculos abriéndose */}
          <path d="M20 12 C18 9, 14.5 9, 12 10 Q16.5 12, 20 12" fill="#00FF88" />
          <path d="M20 12 C22 9, 25.5 9, 28 10 Q23.5 12, 20 12" fill="#00FF88" />
          {/* Banda identificativa del Jugador en el Tallo */}
          <rect x="18" y="17" width="4" height="2" fill={color} stroke="#000" strokeWidth="0.3" />
        </svg>
      );
    }

    // ==========================================================================
    // FASE B: CLON / PLÁNTULA (Casillas 11 a 20) - Maceta de Color y Hojas
    // ==========================================================================
    if (position >= 11 && position <= 20) {
      const renderPot = () => (
        <polygon points="12,28 28,28 24,39 16,39" fill={`url(#${potGrad})`} stroke="#fff" strokeWidth="0.8" />
      );

      // B.1: Dos Cotiledones Redondos verde lima (Casillas 11 a 13)
      if (position <= 13) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
            {renderSvgDefs()}
            {/* Tallo */}
            <line x1="20" y1="28" x2="20" y2="17" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" />
            {/* Hojas Cotiledones (Redondeadas como mariposa) */}
            <ellipse cx="14.5" cy="16.5" rx="5.5" ry="3.5" fill="#AEEA00" stroke="#558B2F" strokeWidth="0.5" transform="rotate(-12, 14.5, 16.5)" />
            <ellipse cx="25.5" cy="16.5" rx="5.5" ry="3.5" fill="#AEEA00" stroke="#558B2F" strokeWidth="0.5" transform="rotate(12, 25.5, 16.5)" />
            {/* Maceta de Color */}
            {renderPot()}
          </svg>
        );
      }
      // B.2: Segundo Nudo - Primeras Hojas Verdaderas Aserradas (Casillas 14 a 16)
      if (position <= 16) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
            {renderSvgDefs()}
            {/* Tallo */}
            <line x1="20" y1="28" x2="20" y2="13.5" stroke="#4CAF50" strokeWidth="2.8" strokeLinecap="round" />
            {/* Cotiledones inferiores (más grandes y horizontales) */}
            <ellipse cx="13" cy="20.5" rx="6.2" ry="3.8" fill="#81C784" stroke="#2E7D32" strokeWidth="0.5" />
            <ellipse cx="27" cy="20.5" rx="6.2" ry="3.8" fill="#81C784" stroke="#2E7D32" strokeWidth="0.5" />
            {/* Nuevas Hojas verdaderas del segundo nudo (ligeramente aserradas) */}
            <path d="M20 13.5 Q12 7.5, 9 11.5 Q15 14.5, 20 13.5" fill="#00E676" stroke="#1B5E20" strokeWidth="0.5" />
            <path d="M20 13.5 Q28 7.5, 31 11.5 Q25 14.5, 20 13.5" fill="#00E676" stroke="#1B5E20" strokeWidth="0.5" />
            {/* Maceta de Color */}
            {renderPot()}
          </svg>
        );
      }
      // B.3: Tercer Nudo - Hojas Aserradas de 3 Puntas (Casillas 17 a 20)
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg">
          {renderSvgDefs()}
          {/* Tallo principal */}
          <line x1="20" y1="28" x2="20" y2="10" stroke="#388E3C" strokeWidth="3.2" strokeLinecap="round" />
          {/* Hojas laterales del segundo nudo */}
          <path d="M20 17.5 Q11 14.5, 8 17.5 Q15.5 20.5, 20 17.5 Z" fill="#4CAF50" stroke="#1B5E20" strokeWidth="0.5" />
          <path d="M20 17.5 Q29 14.5, 32 17.5 Q24.5 20.5, 20 17.5 Z" fill="#4CAF50" stroke="#1B5E20" strokeWidth="0.5" />
          {/* Hojas tridimensionales en la copa (3 puntas) */}
          {/* Lado Izquierdo */}
          <path d="M20 10 Q11 4, 8 7 Q15 10, 20 10 Z" fill={`url(#${leafGrad1})`} />
          <path d="M20 10 Q14.5 1.5, 12.5 4.5 Q16.5 8, 20 10 Z" fill={`url(#${leafGrad2})`} />
          <path d="M20 10 Q11.5 8, 9.5 11 Q16.5 11, 20 10 Z" fill={`url(#${leafGrad2})`} />
          {/* Lado Derecho */}
          <path d="M20 10 Q29 4, 32 7 Q25 10, 20 10 Z" fill={`url(#${leafGrad1})`} />
          <path d="M20 10 Q25.5 1.5, 27.5 4.5 Q23.5 8, 20 10 Z" fill={`url(#${leafGrad2})`} />
          <path d="M20 10 Q28.5 8, 30.5 11 Q23.5 11, 20 10 Z" fill={`url(#${leafGrad2})`} />
          {/* Maceta de Color */}
          {renderPot()}
        </svg>
      );
    }

    // ==========================================================================
    // FASE C: VEGETATIVO (Casillas 21 a 30) - Planta Robusta y Hojas de 5 y 7 Puntas
    // ==========================================================================
    if (position >= 21 && position <= 30) {
      // C.1: Cuarto Nudo - Hojas en Abanico de 5 Puntas (Casillas 21 a 24)
      if (position <= 24) {
        return (
          <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
            {renderSvgDefs()}
            {/* Tallo central */}
            <line x1="20" y1="30" x2="20" y2="8" stroke={`url(#${stemGrad})`} strokeWidth="3.5" strokeLinecap="round" />
            {/* Hojas del nudo inferior */}
            <path d="M20 20 Q12 17, 9 20 Q16 23, 20 20 Z" fill="#388E3C" />
            <path d="M20 20 Q28 17, 31 20 Q24 23, 20 20 Z" fill="#388E3C" />
            {/* Hojas de la copa superior (5 puntas) */}
            {/* Corona Izquierda */}
            <path d="M20 8 Q11.5 1, 7.5 4 Q14.5 8, 20 8 Z" fill={`url(#${leafGrad1})`} />
            <path d="M20 8 Q13.5 -1, 10.5 2 Q16.5 6, 20 8 Z" fill={`url(#${leafGrad2})`} />
            <path d="M20 8 Q10.5 4, 7.5 7 Q14.5 9, 20 8 Z" fill={`url(#${leafGrad2})`} />
            <path d="M20 8 Q9.5 8, 6.5 11 Q13.5 11, 20 8 Z" fill={`url(#${leafGrad1})`} />
            <path d="M20 8 Q16.5 -3, 14.5 0 Q17.5 4, 20 8 Z" fill={`url(#${leafGrad2})`} />
            {/* Corona Derecha */}
            <path d="M20 8 Q28.5 1, 32.5 4 Q25.5 8, 20 8 Z" fill={`url(#${leafGrad1})`} />
            <path d="M20 8 Q26.5 -1, 29.5 2 Q23.5 6, 20 8 Z" fill={`url(#${leafGrad2})`} />
            <path d="M20 8 Q29.5 4, 32.5 7 Q25.5 9, 20 8 Z" fill={`url(#${leafGrad2})`} />
            <path d="M20 8 Q30.5 8, 33.5 11 Q26.5 11, 20 8 Z" fill={`url(#${leafGrad1})`} />
            <path d="M20 8 Q23.5 -3, 25.5 0 Q22.5 4, 20 8 Z" fill={`url(#${leafGrad2})`} />
            {/* Maceta Premium con hebilla del Jugador */}
            <polygon points="10,30 30,30 26,40 14,40" fill="#18181B" stroke={color} strokeWidth="1.2" />
            <rect x="17" y="32" width="6" height="3" rx="0.8" fill={color} stroke="#000" strokeWidth="0.5" />
            <circle cx="20" cy="33.5" r="0.8" fill="#FFF" />
          </svg>
        );
      }
      // C.2: Arbusto Vegetativo Frondoso - Hojas de 7 Puntas y Venas (Casillas 25 a 30)
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
          {renderSvgDefs()}
          {/* Tallo central fuerte */}
          <line x1="20" y1="30" x2="20" y2="4" stroke={`url(#${stemGrad})`} strokeWidth="4" />
          {/* Ramificación Lateral */}
          <path d="M20 22 C13 20.5, 9 16.5, 5 16.5" stroke="#5D4037" strokeWidth="2.2" fill="none" />
          <path d="M20 22 C27 20.5, 31 16.5, 35 16.5" stroke="#5D4037" strokeWidth="2.2" fill="none" />
          <path d="M20 14 C12 12.5, 8 8.5, 4 8.5" stroke="#5D4037" strokeWidth="2" fill="none" />
          <path d="M20 14 C28 12.5, 32 8.5, 36 8.5" stroke="#5D4037" strokeWidth="2" fill="none" />
          {/* Hojas de 7 puntas (Corona superior) */}
          <g>
            {/* Corona Izquierda */}
            <path d="M20 6 Q11 -1, 6 2 Q13 6, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q12 -3, 9 0 Q15 4, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q11 2, 7 5 Q14 7, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q11 6, 6 9 Q13 9, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q14 -5, 12 -2 Q16 2, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q12 9, 8 12 Q14 11, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q16 -7, 15 -4 Q17 0, 20 6" fill={`url(#${leafGrad2})`} />
            {/* Corona Derecha */}
            <path d="M20 6 Q29 -1, 34 2 Q27 6, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q28 -3, 31 0 Q25 4, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q29 2, 33 5 Q26 7, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q29 6, 34 9 Q27 9, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q26 -5, 28 -2 Q24 2, 20 6" fill={`url(#${leafGrad2})`} />
            <path d="M20 6 Q28 9, 32 12 Q26 11, 20 6" fill={`url(#${leafGrad1})`} />
            <path d="M20 6 Q24 -7, 25 -4 Q23 0, 20 6" fill={`url(#${leafGrad2})`} />
            {/* Líneas de nervaduras en las hojas principales */}
            <line x1="20" y1="6" x2="7" y2="2.5" stroke="#FFF" strokeWidth="0.4" opacity="0.3" />
            <line x1="20" y1="6" x2="33" y2="2.5" stroke="#FFF" strokeWidth="0.4" opacity="0.3" />
          </g>
          {/* Ramas cubiertas de hojas aserradas */}
          <path d="M5 16.5 Q0 12.5, 2 15.5 Z" fill="#00E676" />
          <path d="M35 16.5 Q40 12.5, 38 15.5 Z" fill="#00E676" />
          {/* Maceta Premium con doble franja Neón del Jugador */}
          <polygon points="10,30 30,30 26,40 14,40" fill="#111" stroke={color} strokeWidth="1.5" />
          <line x1="12.2" y1="33" x2="27.8" y2="33" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    }

    // ==========================================================================
    // FASE D: FLORACIÓN (Casillas 31 a 39) - Pistilos, Cogollos y Resina Destellante
    // ==========================================================================
    // D.1: Pre-Floración con abundantes pistilos blancos (Casillas 31 a 33)
    if (position <= 33) {
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
          {renderSvgDefs()}
          {/* Follaje base oscuro con toques violetas */}
          <circle cx="20" cy="14" r="9" fill="#1B5E20" opacity="0.6" />
          <circle cx="14" cy="20" r="7" fill="#1B5E20" opacity="0.6" />
          <circle cx="26" cy="20" r="7" fill="#1B5E20" opacity="0.6" />
          {/* Tallo principal */}
          <line x1="20" y1="30" x2="20" y2="5" stroke={`url(#${stemGrad})`} strokeWidth="4" />
          {/* Hojas de 7 puntas más oscuras y místicas */}
          <g opacity="0.8">
            <path d="M20 6 Q11 -1, 6 2 Q13 6, 20 6" fill="#1B5E20" stroke="#7E22CE" strokeWidth="0.5" />
            <path d="M20 6 Q29 -1, 34 2 Q27 6, 20 6" fill="#1B5E20" stroke="#7E22CE" strokeWidth="0.5" />
          </g>
          {/* Decenas de pistilos (pelitos blancos) que brillan con neón */}
          <g stroke="#FFF" strokeWidth="1" fill="none" filter={`url(#${glowFilter})`}>
            {/* Nudo Copa Superior */}
            <path d="M20 6 Q16 1.5, 13.5 -1.5" opacity="0.95" />
            <path d="M20 6 Q24 1.5, 26.5 -1.5" opacity="0.95" />
            <path d="M20 6 Q19 0.5, 20 -3.5" opacity="0.95" />
            <path d="M20 6 Q14.5 4.5, 11.5 2.5" opacity="0.9" />
            <path d="M20 6 Q25.5 4.5, 28.5 2.5" opacity="0.9" />
            {/* Nudo Intermedio Izquierdo */}
            <path d="M14 20 Q9.5 17, 7 14.5" />
            <path d="M14 20 Q12 15.5, 11.5 12" />
            {/* Nudo Intermedio Derecho */}
            <path d="M26 20 Q30.5 17, 33 14.5" />
            <path d="M26 20 Q28 15.5, 28.5 12" />
          </g>
          {/* Maceta Premium del Jugador */}
          <polygon points="10,30 30,30 26,40 14,40" fill="#111" stroke={color} strokeWidth="1.5" />
          <line x1="12.2" y1="33" x2="27.8" y2="33" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    }
    // D.2: Cogollos Chicos - Floración Temprana (Casillas 34 a 36)
    if (position <= 36) {
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
          {renderSvgDefs()}
          {/* Tallo principal */}
          <line x1="20" y1="32" x2="20" y2="8" stroke={`url(#${stemGrad})`} strokeWidth="4" />
          {/* Cogollos púrpuras hinchándose en los nudos */}
          <g fill={`url(#${budGrad})`}>
            {/* Cogollo Central Superior */}
            <circle cx="20" cy="9.5" r="5.5" />
            <circle cx="16.5" cy="12.5" r="4.2" />
            <circle cx="23.5" cy="12.5" r="4.2" />
            {/* Cogollo nudo izquierdo */}
            <circle cx="13.5" cy="19.5" r="4.5" />
            <circle cx="10" cy="22" r="3.5" />
            {/* Cogollo nudo derecho */}
            <circle cx="26.5" cy="19.5" r="4.5" />
            <circle cx="30" cy="22" r="3.5" />
          </g>
          {/* Mezcla de pistilos blancos y naranjas en floración */}
          <g fill="none" strokeWidth="0.9">
            {/* Pistilos Blancos */}
            <path d="M20 9.5 Q15 5.5, 12.5 2" stroke="#FFF" />
            <path d="M13.5 19.5 Q8.5 16.5, 6 13" stroke="#FFF" />
            {/* Pistilos Naranjas de Floración */}
            <path d="M20 9.5 Q25 5.5, 27.5 2" stroke="#FF5722" />
            <path d="M26.5 19.5 Q31.5 16.5, 34 13" stroke="#FF5722" />
          </g>
          {/* Hojas protectoras en la copa */}
          <path d="M20 9.5 Q12 12, 10 15 Z" fill="#1B5E20" opacity="0.6" />
          <path d="M20 9.5 Q28 12, 30 15 Z" fill="#1B5E20" opacity="0.6" />
          {/* ACCESORIO del Jugador: Visera estilizada en la copa */}
          <path d="M14 7 Q20 4.5, 26 7 L28.5 10 L11.5 10 Z" fill={color} stroke="#000" strokeWidth="0.5" />
          {/* Maceta Premium */}
          <polygon points="10,32 30,32 26,40 14,40" fill="#111" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    }
    // D.3: Cogollos Grandes y Pesados - Floración Avanzada (Casillas 37 a 38)
    if (position <= 38) {
      return (
        <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
          {renderSvgDefs()}
          {/* Tallo central */}
          <line x1="20" y1="34" x2="20" y2="8" stroke={`url(#${stemGrad})`} strokeWidth="4.5" />
          {/* Cogollos gigantes y densos (Colas) */}
          <g fill={`url(#${budGrad})`}>
            {/* Central superior masiva */}
            <ellipse cx="20" cy="11" rx="8.5" ry="11" />
            <circle cx="14" cy="13.5" r="6.8" />
            <circle cx="26" cy="13.5" r="6.8" />
            <ellipse cx="20" cy="18.5" rx="9.5" ry="7.5" />
            {/* Colas laterales hinchadas */}
            <circle cx="12" cy="22.5" r="6" />
            <circle cx="28" cy="22.5" r="6" />
          </g>
          {/* Bosque denso de pelos naranjas de fuego y pistilos */}
          <g fill="none" strokeWidth="1.1" filter={`url(#${glowFilter})`}>
            <path d="M13.5 13.5 Q9 9.5, 5.5 8.5" stroke="#FF5722" />
            <path d="M26.5 13.5 Q31 9.5, 34.5 8.5" stroke="#FF5722" />
            <path d="M20 3.5 Q20 -0.5, 22.5 -3.5" stroke="#FF5722" />
            <path d="M20 3.5 Q16.5 -0.5, 14.5 -3.5" stroke="#FF5722" />
            <path d="M12 22.5 Q6.5 22.5, 3.5 23.5" stroke="#FF7043" />
            <path d="M28 22.5 Q33.5 22.5, 36.5 23.5" stroke="#FF7043" />
            <path d="M13.5 13.5 Q9 15.5, 7.5 18" stroke="#FFF" opacity="0.8" />
            <path d="M26.5 13.5 Q31 15.5, 32.5 18" stroke="#FFF" opacity="0.8" />
          </g>
          {/* ACCESORIO del Jugador: Visera premium y Chalina de neón */}
          <path d="M14 8 Q20 5.2, 26 8 L28.5 10.8 L11.5 10.8 Z" fill={color} stroke="#000" strokeWidth="0.5" />
          <rect x="14" y="27" width="12" height="3" rx="1.5" fill={color} />
          <rect x="22" y="27" width="3.2" height="7.2" rx="1" fill={color} />
          {/* Maceta Premium */}
          <polygon points="10,34 30,34 26,40 14,40" fill="#111" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    }

    // D.4: Cogollo Maestro Ultra-Resinoso y Destellante (Casilla 39 - Cosecha Final!)
    return (
      <svg viewBox="0 0 40 40" width="30" height="30" className="pawn-avatar-svg plant-sway">
        {renderSvgDefs()}
        {/* Tallo central */}
        <line x1="20" y1="34" x2="20" y2="8" stroke={`url(#${stemGrad})`} strokeWidth="4.8" />
        
        {/* Cúpula floral gigante (Cola de campeonato) */}
        <g fill={`url(#${budGrad})`}>
          <ellipse cx="20" cy="11.5" rx="10" ry="13.5" />
          <circle cx="13" cy="13.5" r="7.8" />
          <circle cx="27" cy="13.5" r="7.8" />
          <circle cx="20" cy="21.5" r="9.8" />
          {/* Colas laterales superpuestas */}
          <circle cx="11.5" cy="22.5" r="6.8" />
          <circle cx="28.5" cy="22.5" r="6.8" />
        </g>

        {/* Pelos naranjas incandescentes por doquier */}
        <g fill="none" stroke="#FF5722" strokeWidth="1.2" filter={`url(#${glowFilter})`}>
          <path d="M13 13.5 Q7.5 9, 3.5 8" />
          <path d="M27 13.5 Q32.5 9, 36.5 8" />
          <path d="M20 3 Q20 -1.5, 23 -4.5" />
          <path d="M20 3 Q16 -1.5, 13.5 -4.5" />
          <path d="M11.5 22.5 Q5.5 22.5, 2 23.5" />
          <path d="M28.5 22.5 Q34.5 22.5, 38 23.5" />
        </g>

        {/* ================= TRICOMAS DE RESINA DESTELLANTES (GLOW & PULSE) ================= */}
        {/* Cabezas de tricomas sobre pedúnculos */}
        <g stroke="#FFF" strokeWidth="0.8" fill="none">
          <line x1="20" y1="12" x2="20" y2="2.5" />
          <line x1="14" y1="9" x2="9.5" y2="3.5" />
          <line x1="26" y1="9" x2="30.5" y2="3.5" />
          <line x1="11" y1="22.5" x2="6" y2="22.5" />
          <line x1="29" y1="22.5" x2="34" y2="22.5" />
        </g>
        {/* Cabezas de resina pulsantes (Clase shimmer-trichome) */}
        <g fill="#FFF" className="shimmer-trichome" style={{ '--color': color }}>
          <circle cx="20" cy="2.5" r="1.5" />
          <circle cx="9.5" cy="3.5" r="1.5" />
          <circle cx="30.5" cy="3.5" r="1.5" />
          <circle cx="6" cy="22.5" r="1.3" />
          <circle cx="34" cy="22.5" r="1.3" />
          <circle cx="20" cy="11.5" r="0.8" />
          <circle cx="15" cy="15" r="0.8" />
          <circle cx="25" cy="15" r="0.8" />
        </g>

        {/* Estrellas destellantes de 4 puntas girando (Clase trichome-sparkle) */}
        <g fill="#FFF" className="trichome-sparkle">
          {/* Copa superior */}
          <path d="M20 3 L20.8 5.2 L23 6 L20.8 6.8 L20 9 L19.2 6.8 L17 6 L19.2 5.2 Z" />
          {/* Nudo Izquierdo */}
          <path d="M13 14 L13.6 15.6 L15.2 16.2 L13.6 16.8 L13 18.4 L12.4 16.8 L10.8 16.2 L12.4 15.6 Z" opacity="0.9" />
          {/* Nudo Derecho */}
          <path d="M27 14 L27.6 15.6 L29.2 16.2 L27.6 16.8 L27 18.4 L26.4 16.8 L24.8 16.2 L26.4 15.6 Z" opacity="0.9" />
        </g>

        {/* ACCESORIO del Jugador: Visera premium y Chalina de neón */}
        <path d="M14 8 Q20 5.2, 26 8 L28.5 10.8 L11.5 10.8 Z" fill={color} stroke="#000" strokeWidth="0.5" />
        <rect x="14" y="27" width="12" height="3" rx="1.5" fill={color} />
        <rect x="22" y="27" width="3.2" height="7.2" rx="1" fill={color} />

        {/* Maceta Premium con doble anillo de neón */}
        <polygon points="10,34 30,34 26,40 14,40" fill="#111" stroke={color} strokeWidth="1.8" />
        <ellipse cx="20" cy="36.5" rx="5" ry="1.5" fill="none" stroke={color} strokeWidth="1" opacity="0.8" />
      </svg>
    );
  };


  // Renderizar peones dentro de una casilla usando la cruz invisible (4 cuadrantes)
  const renderPawnOnCasilla = (casillaIdx) => {
    // Encontrar qué jugadores están en esta casilla
    const playersInCasilla = [];
    if (gameState !== 'playing' && gameState !== 'finished') return null;
    
    turnOrder.forEach((pId) => {
      if (playerPositions[pId] === casillaIdx) {
        playersInCasilla.push(pId);
      }
    });

    if (playersInCasilla.length === 0) return null;

    return (
      <div className="cruz-invisible-grid">
        <div className="cuadrante q1">
          {playersInCasilla.includes(0) && (
            <div className="peon-container shadow-glow" style={{ '--color': '#FF4D4D' }} title={playerNames[0]}>
              {renderPlantAvatar(0, casillaIdx)}
            </div>
          )}
        </div>
        <div className="cuadrante q2">
          {playersInCasilla.includes(1) && (
            <div className="peon-container shadow-glow" style={{ '--color': '#00F0FF' }} title={playerNames[1]}>
              {renderPlantAvatar(1, casillaIdx)}
            </div>
          )}
        </div>
        <div className="cuadrante q3">
          {playersInCasilla.includes(2) && (
            <div className="peon-container shadow-glow" style={{ '--color': '#00FF88' }} title={playerNames[2]}>
              {renderPlantAvatar(2, casillaIdx)}
            </div>
          )}
        </div>
        <div className="cuadrante q4">
          {playersInCasilla.includes(3) && (
            <div className="peon-container shadow-glow" style={{ '--color': '#FFD600' }} title={playerNames[3]}>
              {renderPlantAvatar(3, casillaIdx)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Volver a configurar el juego
  const resetSetup = () => {
    setSorteoRolls({});
    setOrderTieBreakers({});
    setTiedPlayers([]);
    setTurnOrder([]);
    setSorteoStep(0);
    setGameState('setup');
    setWinner(null);
  };

  return (
    <div className="game-wrapper" style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* HEADER DE CONTROL SUPERIOR */}
      <div className="game-header-top glass">
        <button className="back-to-app-btn" onClick={() => setView('academy')}>
          <ArrowLeft size={16} /> Volver a DPV PRO
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gamepad2 size={20} color="#A855F7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Desafío del Cultivador v0.2</h2>
        </div>
        <div className="game-status-indicator">
          {gameState === 'playing' ? (
            <span style={{ color: '#00FF88', fontSize: '0.8rem', fontWeight: 'bold' }}>🟢 PARTIDA EN VIVO</span>
          ) : (
            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>🔧 PREPRODUCCIÓN</span>
          )}
        </div>
      </div>

      {/* 1. MÓDULO DE CONFIGURACIÓN (SETUP) */}
      {gameState === 'setup' && (
        <div className="setup-container glow-border glass">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.5rem' }}>🎲</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0 5px 0' }}>Desafío del Cultivador</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Un Cubiflor biológico de 4 etapas para competir con tus amigos y certificar tus conocimientos climáticos.
            </p>
          </div>

          <div className="setup-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                ¿Cuántos cultivadores participan?
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4].map(num => (
                  <button 
                    key={num}
                    className={`stage-btn ${numPlayers === num ? 'active' : ''}`}
                    onClick={() => setNumPlayers(num)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                  >
                    {num} {num === 1 ? 'Jugador' : 'Jugadores'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Ingresa los nombres de los cultivadores y selecciona su tipo:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array.from({ length: numPlayers }).map((_, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: COLORES_JUGADORES[idx].hex, fontWeight: 'bold' }}>
                          {COLORES_JUGADORES[idx].name}
                        </span>
                        <strong style={{ fontSize: '0.78rem', color: '#888' }}>
                          {playerTypes[idx] === 'bot' ? '🤖 Oponente de IA' : '👤 Humano'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newTypes = [...playerTypes];
                            newTypes[idx] = 'human';
                            setPlayerTypes(newTypes);
                            const newNames = [...playerNames];
                            newNames[idx] = `Cultivador ${idx + 1}`;
                            setPlayerNames(newNames);
                          }}
                          className={`stage-btn ${playerTypes[idx] === 'human' ? 'active' : ''}`}
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          👤 Humano
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newTypes = [...playerTypes];
                            newTypes[idx] = 'bot';
                            setPlayerTypes(newTypes);
                            const newNames = [...playerNames];
                            newNames[idx] = BOT_ARCHETYPES[idx % BOT_ARCHETYPES.length].name;
                            setPlayerNames(newNames);
                          }}
                          className={`stage-btn ${playerTypes[idx] === 'bot' ? 'active' : ''}`}
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          🤖 Bot (IA)
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                      <input 
                        type="text"
                        className="game-input"
                        value={playerNames[idx]}
                        disabled={playerTypes[idx] === 'bot'}
                        onChange={(e) => {
                          const copy = [...playerNames];
                          copy[idx] = e.target.value;
                          setPlayerNames(copy);
                        }}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          color: playerTypes[idx] === 'bot' ? '#ccc' : '#fff',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    {playerTypes[idx] === 'bot' && (
                      <span style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>
                        {BOT_ARCHETYPES[idx % BOT_ARCHETYPES.length].desc}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="support-btn"
              onClick={() => {
                setGameState('sorteo');
                setSorteoStep(0);
                setSorteoRolls({});
              }}
              style={{
                background: 'linear-gradient(90deg, #A855F7, #6366F1)',
                borderColor: '#A855F7',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                marginTop: '10px',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
              }}
            >
              Pasar al Sorteo de Turnos 🎲
            </button>
          </div>
        </div>
      )}

      {/* 2. MÓDULO DE SORTEO DE TURNOS (DADOS INICIALES) */}
      {gameState === 'sorteo' && (
        <div className="setup-container glow-border glass" style={{ maxWidth: '500px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Dices size={32} color="#A855F7" className="icon-pulse" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '10px 0 5px 0' }}>Sorteo de Turnos Inicial</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Cada jugador tira el dado para definir su orden de juego. ¡El número mayor inicia el cultivo!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Array.from({ length: numPlayers }).map((_, idx) => {
              const hasRolled = sorteoRolls[idx] !== undefined;
              const isCurrent = sorteoStep === idx;
              return (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    background: isCurrent ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isCurrent ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: COLORES_JUGADORES[idx].hex, fontWeight: 'bold' }}>
                      {COLORES_JUGADORES[idx].name}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{playerNames[idx]}</strong>
                  </div>

                  <div>
                    {hasRolled ? (
                      <span className="die-box shadow-glow" style={{ '--color': COLORES_JUGADORES[idx].hex }}>
                        {sorteoRolls[idx]}
                      </span>
                    ) : isCurrent ? (
                      <button 
                        className="support-btn animate-pulse"
                        onClick={() => rollSorteo(idx)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#A855F7', borderColor: '#A855F7' }}
                      >
                        Lanzar Dado 🎲
                      </button>
                    ) : (
                      <span style={{ color: '#444', fontSize: '0.8rem' }}>Esperando...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MÓDULO DE DESEMPATE DE SORTEO (EMPATADOS) */}
      {gameState === 'sorteo_empate' && (
        <div className="setup-container glow-border glass" style={{ maxWidth: '500px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <AlertTriangle size={32} color="#FFD600" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '10px 0 5px 0' }}>¡Empate detectado!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Varios cultivadores empataron con el dado máximo. Vuelvan a tirar de desempate para decidir el primer turno.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tiedPlayers.map((pId, idx) => {
              const hasRolled = orderTieBreakers[pId] !== undefined;
              const isCurrent = sorteoStep === idx;
              return (
                <div 
                  key={pId} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    background: isCurrent ? 'rgba(255, 214, 0, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isCurrent ? '1px solid rgba(255, 214, 0, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: COLORES_JUGADORES[pId].hex, fontWeight: 'bold' }}>
                      {COLORES_JUGADORES[pId].name}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{playerNames[pId]}</strong>
                  </div>

                  <div>
                    {hasRolled ? (
                      <span className="die-box shadow-glow" style={{ '--color': COLORES_JUGADORES[pId].hex }}>
                        {orderTieBreakers[pId]}
                      </span>
                    ) : isCurrent ? (
                      <button 
                        className="support-btn animate-pulse"
                        onClick={() => rollEmpate(pId)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#FFD600', borderColor: '#FFD600', color: '#000' }}
                      >
                        Tirar Desempate 🎲
                      </button>
                    ) : (
                      <span style={{ color: '#444', fontSize: '0.8rem' }}>Esperando...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PANTALLA PRINCIPAL DEL JUEGO (Tablero y Panel) */}
      {(gameState === 'playing' || gameState === 'finished') && (
        <div className="game-board-container">
          
          {/* TABLERO SVG / GRID INTERACTIVO EN 11x11 */}
          <div className="board-outer-container glass glow-border">
            <div className="board-grid">
              
              {/* Renderizado de las 40 Casillas */}
              {Array.from({ length: 40 }).map((_, idx) => {
                const casilla = MAPA_CASILLAS[idx];
                const special = CASILLAS_ESPECIALES[idx];
                
                // Estilo dinámico de la casilla
                const isSpecial = !!special;
                const baseColor = casilla.color;
                
                return (
                  <div 
                    key={idx}
                    className={`board-casilla ${isSpecial ? 'special-' + special.type : ''}`}
                    style={{
                      gridColumnStart: casilla.x + 1,
                      gridRowStart: casilla.y + 1,
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isSpecial ? `inset 0 0 10px ${baseColor}50` : 'none',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '4px',
                      boxSizing: 'border-box',
                      minWidth: 0,
                      minHeight: 0
                    }}
                  >
                    {/* Título/Info de la Casilla */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '0.55rem', fontWeight: 'bold' }}>
                      <span style={{ color: baseColor }}>{idx}</span>
                      {isSpecial && (
                        <span style={{ color: '#fff', fontSize: '0.45rem', padding: '1px 3px', borderRadius: '3px', background: special.type === 'bonus' ? '#00FF88' : '#FF4D4D', opacity: 0.8 }}>
                          {special.type === 'bonus' ? '🚀' : '⚠️'}
                        </span>
                      )}
                    </div>

                    {/* Espacio reservado para los Quadrants (Peones en la cruz invisible) */}
                    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                      {renderPawnOnCasilla(idx)}
                    </div>

                    {/* Nombre del Lote / Casilla Especial */}
                    <div style={{ 
                      fontSize: '0.45rem', 
                      textAlign: 'center', 
                      color: isSpecial ? '#fff' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: isSpecial ? 'bold' : 'normal'
                    }}>
                      {isSpecial ? special.label : casilla.label.split(' ')[1]}
                    </div>
                  </div>
                );
              })}

              {/* PANEL CENTRAL DEL TABLERO (Control del Juego, Dados, Preguntas) */}
              <div className="board-center-area">
                
                {gameState === 'playing' && (
                  <div className="center-dashboard glass" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    
                    {/* ENCABEZADO: Jugador Activo */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '8px 15px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      borderTopLeftRadius: '14px',
                      borderTopRightRadius: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: COLORES_JUGADORES[turnOrder[currentPlayerIdx]].hex, 
                          boxShadow: `0 0 10px ${COLORES_JUGADORES[turnOrder[currentPlayerIdx]].hex}` 
                        }} />
                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>
                          Turno de: {playerNames[turnOrder[currentPlayerIdx]]}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Casilla: {playerPositions[turnOrder[currentPlayerIdx]]}
                      </span>
                    </div>

                    {/* ALERTA DE PRENDA O BONO EMERGENTE */}
                    {alertText && (
                      <div className="alert-banner animate-bounce" style={{
                        background: alertText.includes('⚠️') || alertText.includes('🦟') ? 'rgba(255, 77, 77, 0.15)' : 'rgba(0, 255, 136, 0.15)',
                        border: alertText.includes('⚠️') || alertText.includes('🦟') ? '1px solid rgba(255, 77, 77, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#fff',
                        margin: '10px 15px 0 15px',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {alertText}
                      </div>
                    )}

                    {/* PANEL CENTRAL PRINCIPAL: Trivia o Lanzamiento de Dado */}
                    <div style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {questionState === 'pending' && activeQuestion && (
                        <div className="question-play-box animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle size={18} color="#FFD600" />
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#FFD600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Pregunta de Etapa ({MAPA_CASILLAS[playerPositions[turnOrder[currentPlayerIdx]]].label})
                            </h4>
                          </div>

                          {playerTypes[turnOrder[currentPlayerIdx]] === 'bot' && (
                            <div className="bot-thinking-notice" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'rgba(168, 85, 247, 0.1)',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              fontSize: '0.8rem',
                              color: '#d8b4fe',
                              animation: 'pulseGold 2s infinite ease-in-out',
                              margin: '4px 0'
                            }}>
                              <div className="quantum-ring" style={{ width: '14px', height: '14px', borderWidth: '2px', position: 'static', animationDuration: '1.5s' }}></div>
                              <span>🤖 {playerNames[turnOrder[currentPlayerIdx]]} está analizando la biofísica del cultivo...</span>
                            </div>
                          )}

                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', lineHeight: 1.4 }}>
                            {activeQuestion.q}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                            {activeQuestion.opts.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSubmit(idx)}
                                disabled={questionState !== 'pending'}
                                className={`quiz-opt-btn ${questionState !== 'pending' ? 'disabled' : ''}`}
                                style={{
                                  padding: '10px 14px',
                                  fontSize: '0.82rem',
                                  textAlign: 'left',
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  borderRadius: '8px',
                                  color: '#ccc',
                                  cursor: questionState === 'pending' ? 'pointer' : 'default',
                                  opacity: questionState !== 'pending' ? 0.6 : 1
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {(questionState === 'correct' || questionState === 'incorrect') && activeQuestion && (
                        <div className="feedback-play-box animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
                          <div>
                            {questionState === 'correct' ? (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#00FF88' }}>
                                <CheckCircle size={22} />
                                <strong style={{ fontSize: '1rem' }}>¡RESPUESTA CORRECTA!</strong>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#FF4D4D' }}>
                                <AlertTriangle size={22} />
                                <strong style={{ fontSize: '1rem' }}>RESPUESTA INCORRECTA</strong>
                              </div>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#ccc', lineHeight: 1.4 }}>
                            <strong>Explicación:</strong> {activeQuestion.why}
                          </p>

                          {questionState === 'correct' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                              {!hasRolled ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  <button 
                                    onClick={rollGameDice}
                                    disabled={isRolling}
                                    className="support-btn animate-pulse"
                                    style={{
                                      background: 'linear-gradient(90deg, #00FF88, #00D676)',
                                      borderColor: '#00FF88',
                                      color: '#000',
                                      padding: '10px 24px',
                                      fontSize: '0.9rem',
                                      fontWeight: 'bold',
                                      borderRadius: '8px',
                                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)'
                                    }}
                                  >
                                    {isRolling ? 'Girando...' : 'Lanzar Dado de Avance 🎲'}
                                  </button>
                                  <div className={`die-display shadow-glow ${isRolling ? 'die-rolling' : ''}`} style={{ '--color': COLORES_JUGADORES[turnOrder[currentPlayerIdx]].hex }}>
                                    {dieVal}
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={nextTurn}
                                  className="support-btn"
                                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                                >
                                  Terminar Turno <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                              <span style={{ fontSize: '0.78rem', color: '#FF4D4D', display: 'block', marginBottom: '8px' }}>
                                Pasando turno automáticamente en unos segundos...
                              </span>
                              <button 
                                onClick={nextTurn}
                                className="support-btn"
                                style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#FF4D4D', borderColor: '#FF4D4D' }}
                              >
                                Pasar Turno Ahora <ArrowRight size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* PIE DE PÁGINA: Historial de lanzamientos */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '8px 15px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottomLeftRadius: '14px',
                      borderBottomRightRadius: '14px'
                    }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        📜 Registro: {diceLogs[0] || 'Iniciando cultivo...'}
                      </span>
                      {diceLogs.length > 1 && (
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          +{diceLogs.length - 1} logs
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* PANTALLA DE VICTORIA (FINISHED) */}
                {gameState === 'finished' && (
                  <div className="center-dashboard glass" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px', textAlign: 'center', boxSizing: 'border-box' }}>
                    <div className="trophy-victory animate-bounce" style={{ 
                      background: 'rgba(255, 214, 0, 0.1)', 
                      padding: '20px', 
                      borderRadius: '50%',
                      border: '2px solid #FFD600',
                      boxShadow: '0 0 25px rgba(255, 214, 0, 0.4)',
                      marginBottom: '15px'
                    }}>
                      <Trophy size={48} color="#FFD600" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD600', marginBottom: '8px' }}>
                      <Crown size={22} />
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>¡COSECHA EXITOSA!</h3>
                    </div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#fff' }}>
                      ¡Felicidades, {playerNames[winner]}!
                    </h4>
                     <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#ccc', maxWidth: '350px', lineHeight: 1.4 }}>
                      Has completado de forma perfecta todo el tablero científico. Tu planta ha evolucionado a una flor densa y resinosa. Has demostrado ser el **Master Shadow del Vapor**.
                    </p>

                    <div className="virtual-badge-card" style={{ cursor: 'pointer', margin: '0 0 25px 0', padding: '15px 30px' }} onClick={() => {
                      navigator.clipboard.writeText('SHADOWACADEMY');
                      alert('¡Código de cupón SHADOWACADEMY copiado al portapapeles! 🎫');
                    }}>
                      <strong style={{ color: '#FFD600', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>🎫 CUPÓN DE BECA: SHADOWACADEMY</strong>
                      <span style={{ fontSize: '0.75rem', color: '#aaa' }}>¡Haz clic aquí para copiar tu 10% de descuento de Growers Academy!</span>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        onClick={resetSetup}
                        className="support-btn"
                        style={{
                          background: 'linear-gradient(90deg, #A855F7, #6366F1)',
                          borderColor: '#A855F7',
                          padding: '10px 20px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          borderRadius: '8px'
                        }}
                      >
                        Jugar de Nuevo 🔄
                      </button>
                      <button 
                        onClick={() => setView('academy')}
                        className="support-btn"
                        style={{ padding: '10px 20px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        Salir a la Academia
                      </button>
                    </div>
                  </div>
                )}
                
              </div>

            </div>
          </div>

          {/* DERECHA / PANEL LATERAL: Estados de Jugadores y Log de Mensajes */}
          <div className="game-sidebar">
            
            <div className="glass glow-border" style={{ borderRadius: '14px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                👥 Tabla de Posiciones
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {turnOrder.map((pId, idx) => {
                  const isCurrent = turnOrder[currentPlayerIdx] === pId;
                  const pos = playerPositions[pId];
                  const stageLabel = MAPA_CASILLAS[pos]?.label || 'Germinación';
                  return (
                    <div 
                      key={pId}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: isCurrent ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                        border: isCurrent ? `1px solid ${COLORES_JUGADORES[pId].hex}50` : '1px solid rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: COLORES_JUGADORES[pId].hex, fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {idx + 1}°
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                            {playerNames[pId]}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                            {stageLabel}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                          Casilla {pos}
                        </span>
                        {renderPlantAvatar(pId, pos)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass glow-border" style={{ borderRadius: '14px', padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '150px' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                📜 Bitácora de Partida
              </h4>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#ccc', maxHeight: '180px', paddingRight: '5px' }}>
                {diceLogs.map((log, index) => (
                  <div key={index} style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: log.includes('CORRECTO') || log.includes('COSECHA') ? 'rgba(0, 255, 136, 0.05)' : log.includes('INCORRECTO') || log.includes('PRENDA') ? 'rgba(255, 77, 77, 0.05)' : 'rgba(255,255,255,0.02)',
                    borderLeft: `2px solid ${log.includes('CORRECTO') || log.includes('COSECHA') ? '#00FF88' : log.includes('INCORRECTO') || log.includes('PRENDA') ? '#FF4D4D' : '#64748b'}`,
                    lineHeight: 1.3
                  }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default JuegoView;
