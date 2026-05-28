import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  calculateVPD, 
  getVPDStatus, 
  getSmartAdvice, 
  generateTableData, 
  calculateIdealHumidity, 
  calculateDewPoint, 
  predictNightRH, 
  calculateEvapotranspiration, 
  calculateWateringFrequency,
  calculateStomatalConductance,
  calculateTranspirationRate,
  calculateEstimatedLeafTemp,
  calculateOsmoticStress,
  calculatePhotosyntheticEfficiency,
  calculateDryingVPD,
  calculateDryingDays
} from './utils/calculations';
import { 
  Zap, LayoutGrid, Coffee, Copy, Check, X, Activity, Package, GraduationCap, Table as TableIcon 
} from 'lucide-react';
import './App.css';

// Import modular components
import CalculadoraView from './components/CalculadoraView';
import TablaCompletaView from './components/TablaCompletaView';
import SecadoCuradoView from './components/SecadoCuradoView';
import AcademiaView from './components/AcademiaView';
import HerramientasProView from './components/HerramientasProView';
import ConsoleView from './components/ConsoleView';

const BOTANICAL_ARCHETYPES = [
  { id: 'hybrid_standard', name: 'Híbrida Estándar 🧬', type: 'hybrid', desc: 'Híbridos modernos balanceados para cultivo en interior (indoor). Poseen una tasa de transpiración estomática equilibrada y excelente estabilidad climática general.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.2, 1.6], stomatalDensity: 180, maxConductance: 380, sensitivity: 0.6, baseKc: 1.0 },
  { id: 'indica_pure', name: 'Índica de Clima Seco 🏔️', type: 'indica', desc: 'Originaria de valles montañosos semiáridos de Asia Central. Desarrolla hojas muy anchas y cogollos ultra-densos. Es altamente propensa a condensaciones de rocío nocturnas en floración tardía, pero tolera DPVs secos y cálidos en el día.', early: [0.5, 0.9], veg: [0.9, 1.3], flower: [1.3, 1.7], stomatalDensity: 230, maxConductance: 320, sensitivity: 0.8, baseKc: 0.9 },
  { id: 'sativa_pure', name: 'Sativa Tropical 🌴', type: 'sativa', desc: 'Nativa de zonas ecuatoriales hiper-húmedas. Sus folíolos ultra-delgados disipan calor rápidamente mediante una transpiración foliar masiva. Es muy sensible al cierre estomático en aire seco, prefiriendo DPVs suaves y humedades relativas más altas en floración.', early: [0.3, 0.7], veg: [0.7, 1.1], flower: [1.1, 1.5], stomatalDensity: 140, maxConductance: 450, sensitivity: 0.4, baseKc: 1.15 },
  { id: 'ruderalis_auto', name: 'Ruderalis / Automática ⚡', type: 'ruderalis', desc: 'Originaria del frío siberiano, adaptada a fotoperíodos continuos e independiente de cambios lumínicos. Posees estomas compactos y muy activos, aunque su bajo volumen radicular la hace sensible a sequías en el sustrato.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.1, 1.5], stomatalDensity: 160, maxConductance: 350, sensitivity: 0.5, baseKc: 0.85 }
];

const HUMIDITIES = Array.from({ length: 21 }, (_, i) => 100 - i * 5);

function App() {
  const [view, setView] = useState('calc'); 
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [leafOffset, setLeafOffset] = useState(-2);
  const [stage, setStage] = useState('veg');
  const [mode, setMode] = useState('manual'); // 'manual' o 'smart'
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Estados para Herramientas Pro
  const [activeStrain, setActiveStrain] = useState('hybrid_standard');
  const [activeProTool, setActiveProTool] = useState('nocturno');
  
  // Módulo 1: Nocturno
  const [nightTempDrop, setNightTempDrop] = useState(5);
  
  // Módulo 2 (Genética Avanzada): PAR y LAI (v0.7)
  const [lightIntensity, setLightIntensity] = useState(600); 
  const [leafAreaIndex, setLeafAreaIndex] = useState(2.0);
  
  // Nuevos estados para v0.8
  const [lightType, setLightType] = useState('led'); // 'led', 'hps', 'sun'
  const [lightDistance, setLightDistance] = useState(50); // cm
  const [airflowQuality, setAirflowQuality] = useState('optimal'); // 'low', 'optimal', 'high'
  const [soilEc, setSoilEc] = useState(1.4); // mS/cm
  const [ppfdInput, setPpfdInput] = useState(600); // PPFD
  const [sporeTimer, setSporeTimer] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_spore_timer');
      return saved ? parseInt(saved) : 300; // 300 minutos = 5 horas
    } catch {
      return 300;
    }
  });
  const [consoleModeActive, setConsoleModeActive] = useState(false);
  
  // Módulo de Secado y Curado (v0.9)
  const [dryTemp, setDryTemp] = useState(18);
  const [dryHumidity, setDryHumidity] = useState(60);
  const [dryAirflow, setDryAirflow] = useState('optimal');
  
  // Estado de Administración Dinámico (v0.9 - Fase 2 & 3)
  const [selectedSensor, setSelectedSensor] = useState('');
  const [roomWidth, setRoomWidth] = useState(1.2);
  const [roomLength, setRoomLength] = useState(1.2);
  const [roomHeight, setRoomHeight] = useState(2.0);
  const [showLedSavingsModal, setShowLedSavingsModal] = useState(false);
  const lastSpokenAlertRef = useRef('');

  // Refs for tracking setTimeout IDs for clean unmounting
  const timeoutsRef = useRef([]);

  const safeSetTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const [adminConfig] = useState({
    seedBanks: [
      { id: 'sb_1', archetype: 'hybrid', name: 'Gorilla Glue Shadow 🧬', bank: 'Shadow Seeds', link: 'https://sweetseeds.es/', coupon: 'SHADOWGG' },
      { id: 'sb_2', archetype: 'indica', name: 'Afghan Mountain 🏔️', bank: 'Kush Genetics', link: 'https://www.barneysfarm.es/', coupon: 'SHADOWKUSH' },
      { id: 'sb_3', archetype: 'sativa', name: 'Haze Tropical 🌴', bank: 'Ecuatoriana Seeds', link: 'https://royalqueenseeds.es/', coupon: 'SHADOWHAZE' },
      { id: 'sb_4', archetype: 'ruderalis', name: 'Auto Siberian Thunder ⚡', bank: 'Tundra Breeders', link: 'https://www.fastbudsgene.com/', coupon: 'SHADOWAUTO' }
    ],
    fertilizers: {
      lowEc: { brand: 'Biobizz Organic', product: 'Bio-Grow Booster', advice: 'Sube tu EC agregando 1.5 ml/L de Bio-Grow de forma 100% orgánica.', link: 'https://www.biobizz.com/', coupon: 'BIOBISHADOW' },
      highEc: { brand: 'Advanced Nutrients', product: 'Sensi Flush Professional', advice: 'Riesgo alto de sobrefertilización. Lava las raíces con Sensi Flush de inmediato.', link: 'https://www.advancednutrients.com/', coupon: 'ADVSHADOW' }
    },
    growShops: [
      { id: 'grow_1', name: 'Shadow Grow Shop - Central', address: 'Av. Cabildo 2400, Buenos Aires', phone: '+5491122334455', coupon: 'SHADOWGROW10', link: 'https://wa.me/5491122334455' },
      { id: 'grow_2', name: 'El Maestro del Vapor', address: 'Calle Gran Vía 45, Madrid', phone: '+34600112233', coupon: 'VAPORMASTER', link: 'https://wa.me/34600112233' },
      { id: 'grow_3', name: 'Hiper-Hidroponia Chile', address: 'Av. Providencia 1200, Santiago', phone: '+56988776655', coupon: 'HIDROSHADOW', link: 'https://wa.me/56988776655' }
    ],
    sensorPartners: [
      { id: 'sensor_1', name: 'Pulse One WiFi Pro', offset: -2.2, link: 'https://pulsegrow.com/', coupon: 'PULSESHADOW' },
      { id: 'sensor_2', name: 'RuuviTag Pro Sensor', offset: -1.8, link: 'https://ruuvi.com/', coupon: 'RUUVISHADOW' },
      { id: 'sensor_3', name: 'Inkbird Smart Thermo', offset: -2.0, link: 'https://inkbird.com/', coupon: 'INKSHADOW' }
    ],
    sponsors: {
      led: { brand: 'Mars Hydro', model: 'FC-3000 Full Spectrum LED', price: 299, link: 'https://www.mars-hydro.com/', coupon: 'LEDSHADOW', savingsPercent: 35 },
      fungicide: { brand: 'BioGreen Fungi', product: 'Trichoderma Harzianum Pro', link: 'https://biogreen.nl/', coupon: 'SHADOWFUNGI' },
      ventilation: { brand: 'Garden Highpro', model: 'Proline Extractor Centrífugo 125', link: 'https://www.gardenhighpro.com/', coupon: 'SHADOWAIR' },
      academy: { name: 'Growers Academy Online', course: 'Máster de Fisiología y Nutrición Vegetal', price: 99, link: 'https://growersacademy.com/', coupon: 'SHADOWACADEMY' }
    }
  });

  // Módulo 3: Riego/Evaporación
  const [plantsCount, setPlantsCount] = useState(4);
  const [potSize, setPotSize] = useState(10);
  const [substrate, setSubstrate] = useState('soil'); // 'soil', 'coco', 'hydro'
  
  // Módulo 4: Costo Eléctrico (Soporta múltiples dispositivos a la vez)
  const [kwhCost, setKwhCost] = useState(0.15);
  const [activeDevices, setActiveDevices] = useState({
    lights: true,
    humidifier: false,
    dehumidifier: false,
    extractor: true,
    heater: false,
    ac: false
  });
  const [deviceWattsMap, setDeviceWattsMap] = useState({
    lights: 240,
    humidifier: 40,
    dehumidifier: 320,
    extractor: 60,
    heater: 1500,
    ac: 1200
  });
  const [deviceHoursMap, setDeviceHoursMap] = useState({
    lights: 18,
    humidifier: 12,
    dehumidifier: 8,
    extractor: 24,
    heater: 6,
    ac: 8
  });

  // Módulo 5: Academia DPV (5 Preguntas de precisión)
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '' });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);


  // Consola de Administración de Publicidades (v1.0 Ads Optimizer)
  const [adSlots, setAdSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_ad_slots');
      return saved ? JSON.parse(saved) : [
        { id: 'adsense_calc', name: 'AdSense - Calculadora', location: 'Pie de Calculadora', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'adsense_table', name: 'AdSense - Tabla DPV', location: 'Pie de Tabla Completa', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'adsense_quiz', name: 'AdSense - Trivia Native', location: 'Native Ad en Trivia', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'sponsor_riego', name: 'Sponsor - Nutrientes EC', location: 'Módulo de Riego', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Biobizz Organic', coupon: 'BIOBISHADOW', link: '' },
        { id: 'sponsor_esporas', name: 'Sponsor - Extractor Rocío', location: 'Reloj de Esporas', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Garden Highpro', coupon: 'SHADOWAIR', link: '' },
        { id: 'sponsor_led', name: 'Sponsor - Iluminación LED', location: 'Optimizador PPFD', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Mars Hydro LED', coupon: 'LEDSHADOW', link: '' },
        { id: 'sponsor_seeds', name: 'Sponsor - Semillas Dosel', location: 'Ficha de Genética', type: 'Banco de Semillas', partnerActive: true, partnerName: 'Shadow Seeds', coupon: 'SHADOWGG', link: '' }
      ];
    } catch {
      return [
        { id: 'adsense_calc', name: 'AdSense - Calculadora', location: 'Pie de Calculadora', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'adsense_table', name: 'AdSense - Tabla DPV', location: 'Pie de Tabla Completa', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'adsense_quiz', name: 'AdSense - Trivia Native', location: 'Native Ad en Trivia', type: 'Programática AdSense', partnerActive: false, partnerName: 'Google AdSense', coupon: '', link: '' },
        { id: 'sponsor_riego', name: 'Sponsor - Nutrientes EC', location: 'Módulo de Riego', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Biobizz Organic', coupon: 'BIOBISHADOW', link: '' },
        { id: 'sponsor_esporas', name: 'Sponsor - Extractor Rocío', location: 'Reloj de Esporas', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Garden Highpro', coupon: 'SHADOWAIR', link: '' },
        { id: 'sponsor_led', name: 'Sponsor - Iluminación LED', location: 'Optimizador PPFD', type: 'Patrocinio Directo', partnerActive: true, partnerName: 'Mars Hydro LED', coupon: 'LEDSHADOW', link: '' },
        { id: 'sponsor_seeds', name: 'Sponsor - Semillas Dosel', location: 'Ficha de Genética', type: 'Banco de Semillas', partnerActive: true, partnerName: 'Shadow Seeds', coupon: 'SHADOWGG', link: '' }
      ];
    }
  });

  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [selectedAdSlotForContact, setSelectedAdSlotForContact] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const [isPremium, setIsPremium] = useState(() => {
    try {
      return localStorage.getItem('dpv_pro_is_premium') === 'true';
    } catch {
      return false;
    }
  });

  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_saved_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' o 'annual'
  const [checkoutCardName, setCheckoutCardName] = useState('Cultivador de Precisión');
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('');
  const [checkoutCardExpiry, setCheckoutCardExpiry] = useState('');
  const [checkoutCardCvc, setCheckoutCardCvc] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_payment_history');
      if (saved) return JSON.parse(saved);
      const wasPremium = localStorage.getItem('dpv_pro_is_premium') === 'true';
      if (wasPremium) {
        return [{
          id: 'DPV-TX-' + Math.floor(Math.random() * 900000 + 100000),
          date: new Date().toLocaleDateString('es-ES'),
          concept: 'DPV PRO Premium - Plan Anual ⚡',
          amount: '$39.99 USD',
          method: 'Visa **** 9010',
          status: 'Pagado'
        }];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dpv_pro_payment_history', JSON.stringify(paymentHistory));
    } catch (e) {
      console.warn("Could not save payment history:", e);
    }
  }, [paymentHistory]);

  const [dryingWetWeight, setDryingWetWeight] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_drying_wet_weight');
      return saved ? parseFloat(saved) : 500;
    } catch {
      return 500;
    }
  });
  
  const [dryingWeightInput, setDryingWeightInput] = useState('');
  
  const [dryingLog, setDryingLog] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_drying_log');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dpv_pro_drying_wet_weight', dryingWetWeight.toString());
    } catch (e) {
      console.warn("Could not save wet weight:", e);
    }
  }, [dryingWetWeight]);

  useEffect(() => {
    try {
      localStorage.setItem('dpv_pro_drying_log', JSON.stringify(dryingLog));
    } catch (e) {
      console.warn("Could not save drying log:", e);
    }
  }, [dryingLog]);

  const handleAddDryingLog = () => {
    const wt = parseFloat(dryingWeightInput);
    if (isNaN(wt) || wt <= 0) {
      setProfileError('Por favor ingresa un peso de rama válido.');
      safeSetTimeout(() => setProfileError(''), 4000);
      return;
    }
    if (wt > dryingWetWeight) {
      setProfileError('El peso diario no puede superar el peso húmedo inicial.');
      safeSetTimeout(() => setProfileError(''), 4000);
      return;
    }
    
    // Smart Typos Detection: entering weight lost instead of total absolute weight
    if (wt < dryingWetWeight * 0.15) {
      setProfileError(`El peso ingresado (${wt} g) es demasiado bajo para un lote inicial de ${dryingWetWeight} g. Por favor ingresa el PESO TOTAL actual de la rama (ej. 580 g), no los gramos que ha perdido.`);
      safeSetTimeout(() => setProfileError(''), 8000);
      return;
    }

    // Smart Typos Detection: progressive weight loss check
    if (dryingLog.length > 0) {
      const lastWt = dryingLog[dryingLog.length - 1].weight;
      if (wt > lastWt) {
        setProfileError(`El peso ingresado (${wt} g) supera al del control anterior (${lastWt} g). La rama no puede ganar masa hídrica espontáneamente durante el secado ambiental.`);
        safeSetTimeout(() => setProfileError(''), 6000);
        return;
      }
    }

    const newLog = {
      id: Date.now().toString(),
      day: dryingLog.length + 1,
      weight: wt,
      date: new Date().toLocaleDateString('es-ES')
    };
    
    setDryingLog(prev => [...prev, newLog]);
    setDryingWeightInput('');
    setProfileError('');
  };

  const handleDeleteDryingLog = (id) => {
    setDryingLog(prev => {
      const filtered = prev.filter(log => log.id !== id);
      return filtered.map((log, index) => ({
        ...log,
        day: index + 1
      }));
    });
  };

  const handleResetDryingLog = () => {
    if (window.confirm("¿Seguro que deseas restablecer el diario de secado de este lote? Se eliminará todo el historial diario.")) {
      setDryingLog([]);
      setDryingWeightInput('');
    }
  };

  const handleLoadDemoDryingLog = () => {
    if (window.confirm("¿Deseas cargar un lote de simulación demo de 7 días? Esto reemplazará los registros actuales.")) {
      setDryingWetWeight(500);
      const demoLog = [
        { id: '1', day: 1, weight: 452.0, date: '21/05/2026' },
        { id: '2', day: 2, weight: 411.0, date: '22/05/2026' },
        { id: '3', day: 3, weight: 372.0, date: '23/05/2026' },
        { id: '4', day: 4, weight: 335.0, date: '24/05/2026' },
        { id: '5', day: 5, weight: 298.0, date: '25/05/2026' },
        { id: '6', day: 6, weight: 255.0, date: '26/05/2026' },
        { id: '7', day: 7, weight: 210.0, date: '27/05/2026' }
      ];
      setDryingLog(demoLog);
      setDryingWeightInput('');
      setProfileError('');
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('dpv_pro_saved_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.warn("Could not save profiles:", e);
    }
  }, [profiles]);

  const handleSaveProfile = () => {
    if (!profileNameInput.trim()) {
      setProfileError('Por favor ingresa un nombre para el perfil.');
      return;
    }
    
    // Check limit for free plan
    if (!isPremium && profiles.length >= 1) {
      setShowLimitWarning(true);
      return;
    }
    
    const newProfile = {
      id: Date.now().toString(),
      name: profileNameInput.trim(),
      date: new Date().toLocaleDateString('es-ES'),
      temp,
      humidity,
      leafOffset,
      activeStrain,
      stage,
      plantsCount,
      potSize,
      soilEc,
      substrate,
      ppfdInput,
      lightType,
      lightDistance,
      roomWidth,
      roomLength,
      roomHeight,
      dryTemp,
      dryHumidity,
      dryAirflow,
      selectedSensor
    };
    
    setProfiles(prev => [...prev, newProfile]);
    setProfileNameInput('');
    setProfileError('');
    setProfileSuccess('¡Perfil de sala guardado correctamente!');
    safeSetTimeout(() => setProfileSuccess(''), 4000);
  };

  const handleLoadProfile = (prof) => {
    if (prof.temp !== undefined) setTemp(prof.temp);
    if (prof.humidity !== undefined) setHumidity(prof.humidity);
    if (prof.leafOffset !== undefined) setLeafOffset(prof.leafOffset);
    if (prof.activeStrain !== undefined) setActiveStrain(prof.activeStrain);
    if (prof.stage !== undefined) setStage(prof.stage);
    if (prof.plantsCount !== undefined) setPlantsCount(prof.plantsCount);
    if (prof.potSize !== undefined) setPotSize(prof.potSize);
    if (prof.soilEc !== undefined) setSoilEc(prof.soilEc);
    if (prof.substrate !== undefined) setSubstrate(prof.substrate);
    if (prof.ppfdInput !== undefined) setPpfdInput(prof.ppfdInput);
    if (prof.lightType !== undefined) setLightType(prof.lightType);
    if (prof.lightDistance !== undefined) setLightDistance(prof.lightDistance);
    if (prof.roomWidth !== undefined) setRoomWidth(prof.roomWidth);
    if (prof.roomLength !== undefined) setRoomLength(prof.roomLength);
    if (prof.roomHeight !== undefined) setRoomHeight(prof.roomHeight);
    if (prof.dryTemp !== undefined) setDryTemp(prof.dryTemp);
    if (prof.dryHumidity !== undefined) setDryHumidity(prof.dryHumidity);
    if (prof.dryAirflow !== undefined) setDryAirflow(prof.dryAirflow);
    if (prof.selectedSensor !== undefined) setSelectedSensor(prof.selectedSensor);
    
    setProfileSuccess(`¡Perfil "${prof.name}" cargado correctamente en la calculadora!`);
    safeSetTimeout(() => setProfileSuccess(''), 4000);
  };

  const handleDeleteProfile = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este perfil guardado?")) {
      setProfiles(prev => prev.filter(p => p.id !== id));
      setProfileSuccess('¡Perfil eliminado con éxito!');
      safeSetTimeout(() => setProfileSuccess(''), 4000);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('dpv_pro_ad_slots', JSON.stringify(adSlots));
    } catch (err) {
      console.warn("Storage blocked:", err);
    }
  }, [adSlots]);

  const toggleAdSlot = (slotId) => {
    setAdSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, partnerActive: !slot.partnerActive } : slot
    ));
  };

  const triggerSponsorContact = (slotId) => {
    const slot = adSlots.find(s => s.id === slotId);
    setSelectedAdSlotForContact(slot);
    setIsSponsorModalOpen(true);
  };

  const [interstitial, setInterstitial] = useState({
    active: false,
    message: '',
    sponsor: '',
    coupon: '',
    progress: 0
  });

  // Efecto para la simulación del progreso interstitial
  useEffect(() => {
    let interval;
    if (interstitial.active) {
      interval = setInterval(() => {
        setInterstitial(prev => {
          if (prev.progress >= 100) {
            clearInterval(interval);
            // Ejecutar callback si existe
            if (prev.onComplete) {
              prev.onComplete();
            }
            safeSetTimeout(() => {
              setInterstitial(i => ({ ...i, active: false, progress: 0 }));
            }, 300);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [interstitial.active]);

  const triggerInterstitial = (message, sponsor, coupon, onComplete) => {
    if (isPremium) {
      if (onComplete) onComplete();
      return;
    }
    setInterstitial({
      active: true,
      message,
      sponsor,
      coupon,
      progress: 0,
      onComplete
    });
  };

  const handleBuyPremiumSimulated = () => {
    setIsPaymentProcessing(true);
    safeSetTimeout(() => {
      setIsPaymentProcessing(false);
      setIsPremium(true);
      localStorage.setItem('dpv_pro_is_premium', 'true');
      
      // Añadir al historial de transacciones simulado
      const newTx = {
        id: 'DPV-TX-' + Math.floor(Math.random() * 900000 + 100000),
        date: new Date().toLocaleDateString('es-ES'),
        concept: billingCycle === 'annual' ? 'DPV PRO Premium - Plan Anual ⚡' : 'DPV PRO Premium - Plan Mensual ⚡',
        amount: billingCycle === 'annual' ? '$39.99 USD' : '$4.99 USD',
        method: `Visa **** ${checkoutCardNumber ? checkoutCardNumber.slice(-4) : '4002'}`,
        status: 'Pagado'
      };
      setPaymentHistory(prev => [newTx, ...prev]);
      setProfileSuccess("¡Suscripción DPV PRO Premium Activada con éxito! 🏆 Gracias por tu apoyo.");
      safeSetTimeout(() => setProfileSuccess(''), 5000);
    }, 3500);
  };

  const handleCancelPremiumSimulated = () => {
    setIsPremium(false);
    localStorage.removeItem('dpv_pro_is_premium');
    setShowCancelConfirm(false);
    setProfileSuccess('Suscripción Premium cancelada. Tu cuenta volverá al plan gratuito.');
    safeSetTimeout(() => setProfileSuccess(''), 5000);
  };

  // Helper para Banners de Publicidad Programática AdSense (Ads Optimizer)
  const renderAdSenseBanner = (slotName) => {
    if (isPremium) return null;
    const getSlotId = (name) => {
      if (name.includes("Calculadora")) return "adsense_calc";
      if (name.includes("Tabla")) return "adsense_table";
      return "adsense_quiz";
    };
    const slotId = getSlotId(slotName);
    const slot = adSlots.find(s => s.id === slotId) || { partnerActive: false, name: slotName };

    if (slot.partnerActive) {
      return (
        <div className="adsense-sandbox-banner" style={{ border: '1px solid rgba(0, 255, 136, 0.3)', background: 'rgba(0, 255, 136, 0.02)' }}>
          <span className="adsense-label" style={{ background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }}>Google AdSense - Partner Activo</span>
          <div className="adsense-content">
            🔥 <span className="adsense-sponsor-name" style={{ color: '#00ff88' }}>{slot.partnerName}</span>: Optimización programática activa en tu sala. Visita a nuestros grow shops asociados de DPV PRO para validar tus cupones de cultivo de precisión.
          </div>
        </div>
      );
    }

    return (
      <div className="adsense-sandbox-banner" onClick={() => triggerSponsorContact(slotId)} style={{ cursor: 'pointer' }}>
        <span className="adsense-label">Publicidad Programática - Disponible</span>
        <div className="adsense-content">
          📢 <span className="adsense-sponsor-name" style={{ color: '#ffd600' }}>¡Tu Marca Aquí!</span>: Este espacio en <strong>{slot.location}</strong> recibe miles de impresiones diarias de cultivadores. Haz clic aquí para anunciar tu grow shop o producto.
        </div>
      </div>
    );
  };

  const selectedStrain = useMemo(() => {
    return BOTANICAL_ARCHETYPES.find(s => s.id === activeStrain) || BOTANICAL_ARCHETYPES[0];
  }, [activeStrain]);

  const genetics = selectedStrain.type;

  const targets = useMemo(() => {
    return {
      early: { min: selectedStrain.early[0], max: selectedStrain.early[1], name: `Clones (${selectedStrain.name})` },
      veg: { min: selectedStrain.veg[0], max: selectedStrain.veg[1], name: `Vegetativo (${selectedStrain.name})` },
      flower: { min: selectedStrain.flower[0], max: selectedStrain.flower[1], name: `Floración (${selectedStrain.name})` }
    };
  }, [selectedStrain]);

  const targetVpd = useMemo(() => {
    const currentTarget = targets[stage];
    return (currentTarget.min + currentTarget.max) / 2;
  }, [stage, targets]);

  const idealHumidity = useMemo(() => {
    return Math.round(calculateIdealHumidity(temp, leafOffset, targetVpd));
  }, [temp, leafOffset, targetVpd]);

  const activeHumidity = useMemo(() => {
    return mode === 'smart' ? idealHumidity : humidity;
  }, [mode, idealHumidity, humidity]);

  const vpd = useMemo(() => calculateVPD(temp, activeHumidity, leafOffset), [temp, activeHumidity, leafOffset]);
  const status = useMemo(() => getVPDStatus(vpd), [vpd]);
  const advice = useMemo(() => getSmartAdvice(vpd, temp, activeHumidity, targets[stage].min, targets[stage].max), [vpd, temp, activeHumidity, stage, targets]);

  const tableData = useMemo(() => generateTableData({ min: 15, max: 35 }, leafOffset, stage, targets), [leafOffset, stage, targets]);

  // Módulo C (Reloj de Esporas) - Desacelerado a 60s reales para máxima optimización del render y CPU
  useEffect(() => {
    const timer = setInterval(() => {
      if (vpd < 0.3) {
        setSporeTimer(prev => {
          const next = Math.max(0, prev - 1);
          try {
            localStorage.setItem('dpv_pro_spore_timer', next.toString());
          } catch (e) {
            console.warn("Error saving spore timer:", e);
          }
          return next;
        });
      } else {
        setSporeTimer(prev => {
          const next = Math.min(300, prev + 1);
          try {
            localStorage.setItem('dpv_pro_spore_timer', next.toString());
          } catch (e) {
            console.warn("Error saving spore timer:", e);
          }
          return next;
        });
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [vpd]);

  // Auditoría por voz para el Modo Consola / Quiosco - Retorno de cancelación para evitar fugas de memoria
  useEffect(() => {
    if (!consoleModeActive) {
      lastSpokenAlertRef.current = '';
      return;
    }
    
    const speak = (message, alertKey) => {
      if (lastSpokenAlertRef.current === alertKey) return;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        lastSpokenAlertRef.current = alertKey;
        window.speechSynthesis.speak(utterance);
      }
    };

    if (vpd < 0.2) {
      speak("Peligro termodinámico. Riesgo extremo de condensación en tu sala. Sube la temperatura de inmediato.", 'dewpoint');
    } else if (vpd > 1.6) {
      speak("Peligro de estrés hídrico. El aire está críticamente seco para esta genética. Sube la humedad.", 'dry');
    } else if (sporeTimer === 0) {
      speak("Infección de hongos latente. El reloj de germinación ha llegado a cero. Peligro de botrytis.", 'fungus');
    } else {
      lastSpokenAlertRef.current = '';
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [vpd, sporeTimer, consoleModeActive]);

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
    safeSetTimeout(() => setCopiedText(''), 2000);
  };

  const stomaPaths = useMemo(() => {
    if (genetics === 'sativa') {
      return {
        left: "M 47,10 Q 34,30 47,50 Q 42,30 47,10",
        right: "M 53,10 Q 66,30 53,50 Q 58,30 53,10",
        ry: 18
      };
    } else if (genetics === 'indica') {
      return {
        left: "M 42,10 Q 15,30 42,50 Q 30,30 42,10",
        right: "M 58,10 Q 85,30 58,50 Q 70,30 58,10",
        ry: 18
      };
    } else if (genetics === 'ruderalis') {
      return {
        left: "M 44,10 Q 25,30 44,50 Q 35,30 44,10",
        right: "M 56,10 Q 75,30 56,50 Q 65,30 56,10",
        ry: 18
      };
    }
    // Híbrida
    return {
      left: "M 45,10 Q 22,30 45,50 Q 36,30 45,10",
      right: "M 55,10 Q 78,30 55,50 Q 64,30 55,10",
      ry: 18
    };
  }, [genetics]);

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
        gap: genetics === 'indica' ? 3 : genetics === 'sativa' ? 5 : genetics === 'ruderalis' ? 4.5 : 4,
        color: genetics === 'indica' ? '#00D060' : genetics === 'sativa' ? '#00DFFF' : genetics === 'ruderalis' ? '#D000FF' : '#00FF88',
        label: `Transpiración Óptima (${selectedStrain.name})`,
        class: 'stoma-optimal',
        particles: Array.from({ length: genetics === 'sativa' ? 5 : genetics === 'indica' ? 2 : genetics === 'ruderalis' ? 4 : 3 }, (_, i) => i)
      };
    }
  }, [vpd, stage, targets, genetics, selectedStrain]);

  // Auditoría central memoizada - Corregido y optimizado evapotranspiration redundant calculation
  const auditSections = useMemo(() => {
    const isDaySet = temp !== 24 || humidity !== 60 || leafOffset !== -2;
    const isNightSet = nightTempDrop !== 5;
    const isLightSet = ppfdInput !== 600 || lightIntensity !== 600;
    const isWateringSet = plantsCount !== 4 || potSize !== 10 || soilEc !== 1.4 || substrate !== 'soil';
    const isVentilationSet = roomWidth !== 1.2 || roomLength !== 1.2 || roomHeight !== 2.0;
    const isDryingSet = dryTemp !== 18 || dryHumidity !== 60 || dryAirflow !== 'optimal';
    const isSensorSet = selectedSensor !== '';

    const evapoVal = calculateEvapotranspiration(
      plantsCount, 
      potSize, 
      vpd, 
      stage === 'early' ? 0.25 : stage === 'veg' ? 0.75 : 1.20, 
      substrate === 'soil' ? 1.0 : substrate === 'coco' ? 1.25 : 1.50
    );

    return {
      day: {
        isSet: isDaySet,
        title: "Variables Diurnas (Clima de Día)",
        badge: isDaySet ? "Configurado 🟢" : "No Configurado 🔴",
        alertText: isDaySet 
          ? "Variables diurnas calibradas con las condiciones reales del cultivo."
          : "⚠️ ALERTA: Estás utilizando los parámetros diurnos predeterminados (24°C, 60% HR, Offset -2°C). Esto puede alterar la precisión del DPV calculado.",
        data: [
          { name: "Temperatura del Aire", value: `${temp.toFixed(1)}°C`, target: "18°C - 30°C" },
          { name: "Humedad Relativa (HR)", value: `${activeHumidity}%`, target: `Smart: ${idealHumidity}% | Manual: ${humidity}%` },
          { name: "Offset Térmico de Hoja", value: `${leafOffset}°C`, target: "LED: -2°C a -3°C | Sodio: +1°C" },
          { name: "Déficit Presión Vapor (DPV)", value: `${vpd.toFixed(2)} kPa`, target: `Objetivo: ${targetVpd.toFixed(1)} kPa (${status.label})` }
        ]
      },
      night: {
        isSet: isNightSet,
        title: "Transición Nocturna (Lights-Off)",
        badge: isNightSet ? "Personalizado 🟢" : "Predeterminado 🔴",
        alertText: isNightSet
          ? `Transición de apagado calibrada con una caída de ${nightTempDrop}°C.`
          : "⚠️ ALERTA: Caída de temperatura nocturna sin configurar (por defecto 5°C). Puede haber riesgo oculto de condensación o botrytis al apagar luces.",
        data: [
          { name: "Caída de Temp. Nocturna", value: `${nightTempDrop}°C`, target: "Recomendado: 4°C - 6°C" },
          { name: "Temp. Nocturna Proyectada", value: `${(temp - nightTempDrop).toFixed(1)}°C`, target: "Límite seguro: >15°C" },
          { name: "HR Nocturna Proyectada", value: `${Math.round(predictNightRH(temp, activeHumidity, nightTempDrop))}%`, target: "Límite seguro: <85%" },
          { name: "Punto de Rocío Proyectado", value: `${calculateDewPoint(temp - nightTempDrop, predictNightRH(temp, activeHumidity, nightTempDrop)).toFixed(1)}°C`, target: "Temp. Hoja debe estar por encima" }
        ]
      },
      light: {
        isSet: isLightSet,
        title: "Iluminación PAR & PPFD/DLI",
        badge: isLightSet ? "Ajustado 🟢" : "Predeterminado 🔴",
        alertText: isLightSet
          ? `Luz calibrada a ${ppfdInput} µmol/m²/s con el DPV.`
          : "⚠️ ALERTA: Potencia PAR e iluminación sin calibrar (valor base de 600 µmol/m²/s). Ajusta el dimmer del panel LED para evitar fotorrespiración o fitoestrés.",
        data: [
          { name: "Tipo de Iluminación", value: lightType.toUpperCase(), target: "LED, HPS o Sol" },
          { name: "Distancia al Dosel", value: `${lightDistance} cm`, target: "Recomendado: 30cm - 60cm" },
          { name: "Intensidad PAR / PPFD", value: `${ppfdInput} µmol/m²/s`, target: "Veg: 400-600 | Flora: 800-1200" },
          { name: "Eficiencia de Asimilación", value: `${calculatePhotosyntheticEfficiency(calculateStomatalConductance(vpd, lightIntensity, genetics), ppfdInput).efficiency.toFixed(0)}%`, target: "Objetivo cuántico: >80%" }
        ]
      },
      watering: {
        isSet: isWateringSet,
        title: "Demanda de Riego & EC Osmótica",
        badge: isWateringSet ? "Personalizado 🟢" : "Predeterminado 🔴",
        alertText: isWateringSet
          ? `Sales (EC: ${soilEc.toFixed(1)} mS/cm) y macetas configuradas. Consumo hídrico proyectado.`
          : "⚠️ ALERTA: Nutrición EC y riego sin personalizar (4 plantas, maceta 10L, suelo, EC 1.4). Calibra para calcular la evaporación y evitar asfixia radicular.",
        data: [
          { name: "Electroconductividad (EC)", value: `${soilEc.toFixed(1)} mS/cm`, target: "Óptimo: 1.2 - 2.0 mS/cm" },
          { name: "Cantidad de Plantas", value: `${plantsCount} macetas`, target: "Densidad de canopia" },
          { name: "Volumen de Maceta", value: `${potSize} Litros`, target: "Capacidad de retención" },
          { name: "Consumo Hídrico Proyectado", value: `${evapoVal.toFixed(2)} L/Día`, target: `Riego: ${calculateWateringFrequency(potSize, evapoVal / plantsCount, substrate).text}` }
        ]
      },
      ventilation: {
        isSet: isVentilationSet,
        title: "Caudal de Extracción y Aire",
        badge: isVentilationSet ? "Configurado 🟢" : "Predeterminado 🔴",
        alertText: isVentilationSet
          ? `Dimensiones del cuarto configuradas. Caudal necesario: ${(roomWidth * roomLength * roomHeight * 60 * 1.2).toFixed(0)} m³/h.`
          : "⚠️ ALERTA: Usando dimensiones de sala por defecto (1.2m x 1.2m x 2.0m). El caudal de renovación calculado podría no ser válido para renovar el CO2.",
        data: [
          { name: "Volumen del Cuarto", value: `${(roomWidth * roomLength * roomHeight).toFixed(2)} m³`, target: `${roomWidth.toFixed(1)}m x ${roomLength.toFixed(1)}m x ${roomHeight.toFixed(1)}m` },
          { name: "Caudal Mínimo (Carbon Filt.)", value: `${(roomWidth * roomLength * roomHeight * 60 * 1.2).toFixed(0)} m³/h`, target: "Renovación 1 vez por minuto" },
          { name: "Sugerencia Extractor", value: adminConfig.sponsors.ventilation.model, target: adminConfig.sponsors.ventilation.brand }
        ]
      },
      drying: {
        isSet: isDryingSet,
        title: "Secado & Curado Post-Cosecha",
        badge: isDryingSet ? "Calibrado 🟢" : "Predeterminado 🔴",
        alertText: isDryingSet
          ? `Parámetros ambientales de secado configurados. Secado cinético activo.`
          : "⚠️ ALERTA: Usando parámetros de secado por defecto (18°C, 60% HR, flujo óptimo). Puede comprometer la degradación celular de la clorofila de tu cosecha.",
        data: [
          { name: "Temperatura Sala Secado", value: `${dryTemp.toFixed(1)}°C`, target: "Ideal: 15°C - 18°C" },
          { name: "Humedad Sala Secado", value: `${dryHumidity}% HR`, target: "Ideal: 55% - 60%" },
          { name: "Secado Estimado Rama", value: `~${calculateDryingDays(calculateDryingVPD(dryTemp, dryHumidity), dryAirflow).days.toFixed(0)} días`, target: "Ideal: 10 a 14 días" }
        ]
      },
      sensor: {
        isSet: isSensorSet,
        title: "Integración de Sensores WiFi",
        badge: isSensorSet ? "Viculado 🟢" : "No Vinculado 🔴",
        alertText: isSensorSet
          ? `Sensor vinculado: ${adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.name}. Offset compensado automáticamente.`
          : "⚠️ ALERTA: No has vinculado ningún sensor WiFi de precisión. El offset se calcula de forma teórica en base a tu tipo de panel lumínico.",
        data: [
          { name: "Sensor Vinculado", value: isSensorSet ? adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.name : "Ninguno", target: "Calibración automática" },
          { name: "Offset Oficial Compensado", value: isSensorSet ? `${adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.offset}°C` : `${leafOffset}°C`, target: "Desviación hoja vs aire" }
        ]
      }
    };
  }, [temp, humidity, leafOffset, activeHumidity, idealHumidity, vpd, targetVpd, status, nightTempDrop, ppfdInput, lightIntensity, lightType, lightDistance, soilEc, plantsCount, potSize, substrate, roomWidth, roomLength, roomHeight, dryTemp, dryHumidity, dryAirflow, selectedSensor, adminConfig, genetics, stage]);

  if (consoleModeActive) {
    return (
      <ConsoleView
        vpd={vpd}
        temp={temp}
        activeHumidity={activeHumidity}
        leafOffset={leafOffset}
        selectedStrain={selectedStrain}
        status={status}
        sporeTimer={sporeTimer}
        setConsoleModeActive={setConsoleModeActive}
      />
    );
  }

  const renderPrintReport = () => {
    const strainCode = selectedStrain.name.substring(0, 3).toUpperCase();
    const seedNum = Math.floor(((temp * 73) + (humidity * 17) + (Math.abs(leafOffset) * 23)) % 9000 + 1000);
    const serialId = `DPV-PRO-AUDIT-2026-${strainCode}-${seedNum}`;

    return (
      <div className="print-report-only" style={{ display: isPrinting ? 'block' : 'none', background: '#ffffff', color: '#000000', padding: '30px', minHeight: '100vh', width: '100%' }}>
        {/* Header Block with Accent bar and custom serial ID */}
        <div style={{ paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #cbd5e1' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>DPV PRO</h1>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', letterSpacing: '0.5px' }}>Grow Audit & Precision Cultivation Suite</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontFamily: 'monospace' }}>REPORTE OFICIAL CERTIFICADO</span>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a', fontFamily: 'monospace' }}>{serialId}</strong>
          </div>
        </div>

        {/* Info Block (Zebra table style) */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Fecha de Emisión:</span>
            <strong style={{ color: '#0f172a' }}>{new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES')}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Genotipo / Strain:</span>
            <strong style={{ color: '#0f172a' }}>{selectedStrain.name}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Etapa de Análisis:</span>
            <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{stage === 'early' ? 'Esquejes/Plantines' : stage === 'veg' ? 'Vegetativo' : 'Floración'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Desviación (Offset):</span>
            <strong style={{ color: '#0f172a' }}>{leafOffset.toFixed(1)}°C</strong>
          </div>
        </div>

        {/* Recorrer las 7 secciones de auditoría para la versión impresa */}
        {Object.keys(auditSections).map((key) => {
          const sec = auditSections[key];
          return (
            <div key={key} style={{ marginBottom: '25px', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', textAlign: 'left', color: '#000000', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  {sec.title}
                </h3>
                <span className={`badge-audit ${sec.isSet ? 'badge-audit-set' : 'badge-audit-unset'}`} style={{ border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: sec.isSet ? '#d4edda' : '#f8d7da', color: sec.isSet ? '#155724' : '#721c24' }}>
                  {sec.badge}
                </span>
              </div>

              {/* Cartel / Alerta Impreso */}
              <div className={`audit-alert-card ${sec.isSet ? 'set' : 'unset'}`} style={{ padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '600', background: sec.isSet ? '#d4edda' : '#f8d7da', color: sec.isSet ? '#155724' : '#721c24', border: sec.isSet ? '1px solid #c3e6cb' : '1px solid #f5c6cb' }}>
                {sec.alertText}
              </div>

              {/* Tabla Estructurada de Alto Contraste */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#000000' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #64748b' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Parámetro / Variable</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Valor Configurado</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Rango / Referencia Científica</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.data.map((row, index) => (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', color: '#334155', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{row.name}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{row.value}</td>
                      <td style={{ padding: '10px 12px', color: '#475569', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Equipamientos Activos */}
        <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'left', color: '#000000', pageBreakInside: 'avoid' }}>
          <h3 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>🔌 Carga y Simulación de Dispositivos Eléctricos</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(activeDevices).map(key => (
              <span 
                key={key} 
                className={`badge-audit ${activeDevices[key] ? 'badge-audit-set' : 'badge-audit-unset'}`}
                style={{ fontSize: '0.8rem', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', background: activeDevices[key] ? '#d4edda' : '#f8d7da', color: activeDevices[key] ? '#155724' : '#721c24' }}
              >
                {key === 'lights' ? '💡 Luces' : key === 'humidifier' ? '💧 Humidificador' : key === 'dehumidifier' ? '❄️ Deshum.' : key === 'extractor' ? '🌪️ Extractor' : key === 'heater' ? '🔥 Calefactor' : '❄️ AC'}
                : {activeDevices[key] ? 'Activo' : 'Inactivo'}
              </span>
            ))}
          </div>
        </div>

        {/* Cupones de descuento activos */}
        <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left', color: '#000000', pageBreakInside: 'avoid' }}>
          <h3 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>🎫 Cupones Activos y Beneficios en Tiendas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#000000' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #64748b' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Socio Comercial / Marca</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Código de Cupón</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 'bold', color: '#0f172a', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid #64748b' }}>Beneficio Aplicado</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>🛍️ {adminConfig.growShops[0].name} (Socio Físico)</td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#00CC6A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{adminConfig.growShops[0].coupon}</td>
                <td style={{ padding: '10px 12px', color: '#334155', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>10% de Descuento en compra de fertilizantes y sustratos</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>💡 {adSlots.find(s => s.id === 'sponsor_led')?.partnerName || 'Mars Hydro'} (Paneles LED)</td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#00CC6A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{adSlots.find(s => s.id === 'sponsor_led')?.coupon || 'LEDSHADOW'}</td>
                <td style={{ padding: '10px 12px', color: '#334155', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Envío gratis + Dimer de calibración inteligente bonificado</td>
              </tr>
              <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>🌪️ {adSlots.find(s => s.id === 'sponsor_esporas')?.partnerName || 'Garden Highpro'} (Ventilación)</td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#00CC6A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>{adSlots.find(s => s.id === 'sponsor_esporas')?.coupon || 'SHADOWAIR'}</td>
                <td style={{ padding: '10px 12px', color: '#334155', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>5% OFF en extractores Proline de alto caudal</td>
              </tr>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>🛡️ BioGreen Fungi (Preventivo)</td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#00CC6A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>SHADOWFUNGI</td>
                <td style={{ padding: '10px 12px', color: '#334155', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>15% OFF en preventivo orgánico de botrytis</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sello y Firmas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px', marginTop: '40px', marginBottom: '35px', pageBreakInside: 'avoid' }}>
          <div style={{ 
            width: '180px', 
            height: '180px', 
            border: '2px dotted #94a3b8', 
            borderRadius: '12px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center',
            padding: '10px',
            background: '#fafafa',
            color: '#475569'
          }}>
            <span style={{ fontSize: '1.8rem', marginBottom: '5px' }}>💮</span>
            <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#334155', letterSpacing: '0.5px' }}>SELLO AUTORIZADO</strong>
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>{adminConfig.growShops[0].name}</span>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '8px', fontFamily: 'monospace' }}>PUNTO VALIDADO</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '10px' }}>
            <div style={{ borderBottom: '2px solid #64748b', width: '80%', margin: '0 auto 8px auto', height: '50px' }}></div>
            <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase', display: 'block', textAlign: 'center' }}>Firma del Master Grow / Asesor Técnico</strong>
            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textAlign: 'center', marginTop: '4px' }}>Autorización de Planificación Ambiental del Cultivo</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <div className="logo-section">
            <div className="pulsing-glow-dot" />
            <h1 className="logo-title glow-text" onClick={() => { setView('calc'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
              DPV PRO <span className="version-tag">v1.0</span>
            </h1>
          </div>
          
          <div className="premium-status-area">
            {isPremium ? (
              <div className="premium-badge-glow" title="Suscripción Premium DPV PRO Activa">
                <span className="star-premium">⭐</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD600', letterSpacing: '0.5px' }}>PREMIUM SUITE</span>
              </div>
            ) : (
              <button className="upgrade-badge-btn" onClick={() => { setView('pro'); setActiveProTool('premium'); }}>
                <Zap size={14} fill="#FFD600" color="#FFD600" />
                <span>MEJORAR A PRO</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Publicidad Superior */}
      {!isPremium && (
        <div className="ad-slot-top glass">
          <span className="ad-placeholder">PUBLICIDAD - ESPACIO DISPONIBLE (ADSENSE)</span>
        </div>
      )}

      <nav className="view-switcher glass" role="tablist" aria-label="Navegación principal">
        <button 
          className={`view-btn ${view === 'calc' ? 'active' : ''}`} 
          onClick={() => setView('calc')}
          role="tab"
          aria-selected={view === 'calc'}
          aria-controls="main-content"
          id="tab-calc"
        >
          <LayoutGrid size={18} /> Calculadora
        </button>
        <button 
          className={`view-btn ${view === 'table' ? 'active' : ''}`} 
          onClick={() => setView('table')}
          role="tab"
          aria-selected={view === 'table'}
          aria-controls="main-content"
          id="tab-table"
        >
          <TableIcon size={18} /> Tabla Completa
        </button>
        <button 
          className={`view-btn ${view === 'dry' ? 'active' : ''}`} 
          onClick={() => setView('dry')}
          role="tab"
          aria-selected={view === 'dry'}
          aria-controls="main-content"
          id="tab-dry"
        >
          <Package size={18} /> Secado & Curado
        </button>
        <button 
          className={`view-btn ${view === 'academy' ? 'active' : ''}`} 
          onClick={() => setView('academy')}
          role="tab"
          aria-selected={view === 'academy'}
          aria-controls="main-content"
          id="tab-academy"
        >
          <GraduationCap size={18} /> Academia DPV
        </button>
        <button 
          className={`view-btn ${view === 'pro' ? 'active' : ''}`} 
          onClick={() => setView('pro')}
          role="tab"
          aria-selected={view === 'pro'}
          aria-controls="main-content"
          id="tab-pro"
        >
          <Zap size={18} /> Herramientas Pro
        </button>
        <button 
          className="view-btn console-btn-glow" 
          onClick={() => setConsoleModeActive(true)} 
          style={{ color: '#D000FF', border: '1px solid rgba(208, 0, 255, 0.15)', background: 'rgba(208, 0, 255, 0.02)' }}
          role="tab"
          aria-selected={consoleModeActive}
          aria-controls="main-content"
          id="tab-console"
        >
          <Activity size={18} className="icon-pulse" /> Consola 📺
        </button>
      </nav>

      <main id="main-content">
        {view === 'calc' && (
          <CalculadoraView
            stage={stage}
            setStage={setStage}
            activeStrain={activeStrain}
            setActiveStrain={setActiveStrain}
            mode={mode}
            setMode={setMode}
            temp={temp}
            setTemp={setTemp}
            humidity={humidity}
            setHumidity={setHumidity}
            leafOffset={leafOffset}
            setLeafOffset={setLeafOffset}
            activeHumidity={activeHumidity}
            vpd={vpd}
            status={status}
            advice={advice}
            stomaState={stomaState}
            stomaPaths={stomaPaths}
            targets={targets}
            targetVpd={targetVpd}
            selectedStrain={selectedStrain}
            genetics={genetics}
            BOTANICAL_ARCHETYPES={BOTANICAL_ARCHETYPES}
            renderAdSenseBanner={renderAdSenseBanner}
          />
        )}

        {view === 'table' && (
          <TablaCompletaView
            leafOffset={leafOffset}
            humidities={HUMIDITIES}
            tableData={tableData}
            temp={temp}
            activeHumidity={activeHumidity}
            handleCellClick={handleCellClick}
            renderAdSenseBanner={renderAdSenseBanner}
            stage={stage}
            setStage={setStage}
            targets={targets}
          />
        )}

        {view === 'dry' && (
          <SecadoCuradoView
            dryTemp={dryTemp}
            setDryTemp={setDryTemp}
            dryHumidity={dryHumidity}
            setDryHumidity={setDryHumidity}
            dryAirflow={dryAirflow}
            setDryAirflow={setDryAirflow}
            dryingWetWeight={dryingWetWeight}
            setDryingWetWeight={setDryingWetWeight}
            dryingLog={dryingLog}
            dryingWeightInput={dryingWeightInput}
            setDryingWeightInput={setDryingWeightInput}
            handleAddDryingLog={handleAddDryingLog}
            handleLoadDemoDryingLog={handleLoadDemoDryingLog}
            handleResetDryingLog={handleResetDryingLog}
            handleDeleteDryingLog={handleDeleteDryingLog}
            isPremium={isPremium}
            calculateDryingVPD={calculateDryingVPD}
            calculateDryingDays={calculateDryingDays}
          />
        )}

        {view === 'academy' && (
          <AcademiaView
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            quizSubmitted={quizSubmitted}
            setQuizSubmitted={setQuizSubmitted}
            quizScore={quizScore}
            setQuizScore={setQuizScore}
            copiedText={copiedText}
            setCopiedText={setCopiedText}
            handleCopy={handleCopy}
            setIsSupportModalOpen={setIsSupportModalOpen}
            renderAdSenseBanner={renderAdSenseBanner}
            adminConfig={adminConfig}
          />
        )}

        {view === 'pro' && (
          <HerramientasProView
            activeProTool={activeProTool}
            setActiveProTool={setActiveProTool}
            isPremium={isPremium}
            setIsPremium={setIsPremium}
            isPaymentProcessing={isPaymentProcessing}
            setIsPaymentProcessing={setIsPaymentProcessing}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            checkoutCardName={checkoutCardName}
            setCheckoutCardName={setCheckoutCardName}
            checkoutCardNumber={checkoutCardNumber}
            setCheckoutCardNumber={setCheckoutCardNumber}
            checkoutCardExpiry={checkoutCardExpiry}
            setCheckoutCardExpiry={setCheckoutCardExpiry}
            checkoutCardCvc={checkoutCardCvc}
            setCheckoutCardCvc={setCheckoutCardCvc}
            handleBuyPremiumSimulated={handleBuyPremiumSimulated}
            paymentHistory={paymentHistory}
            setPaymentHistory={setPaymentHistory}
            setSelectedInvoice={setSelectedInvoice}
            handleCancelPremiumSimulated={handleCancelPremiumSimulated}
            showCancelConfirm={showCancelConfirm}
            setShowCancelConfirm={setShowCancelConfirm}
            nightTempDrop={nightTempDrop}
            setNightTempDrop={setNightTempDrop}
            temp={temp}
            setTemp={setTemp}
            activeHumidity={activeHumidity}
            predictNightRH={predictNightRH}
            calculateDewPoint={calculateDewPoint}
            roomWidth={roomWidth}
            setRoomWidth={setRoomWidth}
            roomLength={roomLength}
            setRoomLength={setRoomLength}
            roomHeight={roomHeight}
            setRoomHeight={setRoomHeight}
            adminConfig={adminConfig}
            activeStrain={activeStrain}
            setActiveStrain={setActiveStrain}
            BOTANICAL_ARCHETYPES={BOTANICAL_ARCHETYPES}
            selectedStrain={selectedStrain}
            ppfdInput={ppfdInput}
            setPpfdInput={setPpfdInput}
            lightType={lightType}
            setLightType={setLightType}
            lightDistance={lightDistance}
            setLightDistance={setLightDistance}
            airflowQuality={airflowQuality}
            setAirflowQuality={setAirflowQuality}
            vpd={vpd}
            genetics={genetics}
            calculateStomatalConductance={calculateStomatalConductance}
            calculateTranspirationRate={calculateTranspirationRate}
            calculateEstimatedLeafTemp={calculateEstimatedLeafTemp}
            calculateOsmoticStress={calculateOsmoticStress}
            calculatePhotosyntheticEfficiency={calculatePhotosyntheticEfficiency}
            soilEc={soilEc}
            setSoilEc={setSoilEc}
            plantsCount={plantsCount}
            setPlantsCount={setPlantsCount}
            potSize={potSize}
            setPotSize={setPotSize}
            substrate={substrate}
            setSubstrate={setSubstrate}
            calculateEvapotranspiration={calculateEvapotranspiration}
            calculateWateringFrequency={calculateWateringFrequency}
            kwhCost={kwhCost}
            setKwhCost={setKwhCost}
            activeDevices={activeDevices}
            setActiveDevices={setActiveDevices}
            deviceWattsMap={deviceWattsMap}
            setDeviceWattsMap={setDeviceWattsMap}
            deviceHoursMap={deviceHoursMap}
            setDeviceHoursMap={setDeviceHoursMap}
            profiles={profiles}
            setProfiles={setProfiles}
            profileNameInput={profileNameInput}
            setProfileNameInput={setProfileNameInput}
            handleSaveProfile={handleSaveProfile}
            handleLoadProfile={handleLoadProfile}
            handleDeleteProfile={handleDeleteProfile}
            profileError={profileError}
            setProfileError={setProfileError}
            profileSuccess={profileSuccess}
            setProfileSuccess={setProfileSuccess}
            showLimitWarning={showLimitWarning}
            setShowLimitWarning={setShowLimitWarning}
            selectedAdSlotForContact={selectedAdSlotForContact}
            setSelectedAdSlotForContact={setSelectedAdSlotForContact}
            isSponsorModalOpen={isSponsorModalOpen}
            setIsSponsorModalOpen={setIsSponsorModalOpen}
            selectedSensor={selectedSensor}
            setSelectedSensor={setSelectedSensor}
            copiedText={copiedText}
            setCopiedText={setCopiedText}
            handleCopy={handleCopy}
            isPrinting={isPrinting}
            setIsPrinting={setIsPrinting}
            view={view}
            setView={setView}
            interstitial={interstitial}
            triggerSponsorContact={triggerSponsorContact}
            showLedSavingsModal={showLedSavingsModal}
            setShowLedSavingsModal={setShowLedSavingsModal}
            adSlots={adSlots}
            setAdSlots={setAdSlots}
            toggleAdSlot={toggleAdSlot}
            triggerInterstitial={triggerInterstitial}
            lightIntensity={lightIntensity}
            setLightIntensity={setLightIntensity}
            leafAreaIndex={leafAreaIndex}
            setLeafAreaIndex={setLeafAreaIndex}
            sporeTimer={sporeTimer}
            targets={targets}
            stage={stage}
            leafOffset={leafOffset}
            setLeafOffset={setLeafOffset}
            auditSections={auditSections}
          />
        )}
      </main>

      {/* Publicidad Inferior */}
      {!isPremium && (
        <div className="ad-slot-bottom glass">
          <span className="ad-placeholder">PUBLICIDAD - ESPACIO DISPONIBLE (ADSENSE)</span>
        </div>
      )}

      {/* Modal de Soporte / Café */}
      {isSupportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSupportModalOpen(false)}>
          <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="close-modal-btn" onClick={() => setIsSupportModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <Coffee size={36} color="#00FF88" className="icon-pulse" />
              <h2 className="glow-text">Apoya al Desarrollador</h2>
              <p>Si esta herramienta científica te ha ayudado a mejorar la salud de tu canopia o a prevenir mohos, considera invitarnos un café para mantener el hosting y el desarrollo activo.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0' }}>
              <div className="payment-card glass" onClick={() => handleCopy('gikey.mp', 'alias')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🇦🇷</span>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Mercado Pago (Alias)</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>gikey.mp</span>
                  </div>
                </div>
                {copiedText === 'alias' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
              </div>

              <div className="payment-card glass" onClick={() => handleCopy('0x33bE63D963d95318e2657A401D1e89F438aD660D', 'bep20')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🪙</span>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>USDT (BSC - BEP20)</strong>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>0x33bE63D963...8aD660D</span>
                  </div>
                </div>
                {copiedText === 'bep20' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
              </div>

              <div className="payment-card glass" onClick={() => handleCopy('3YS3F9DWvzrKv6PpgAL26wwpiZYoD6b2wK19g3Uf', 'solana')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>☀️</span>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>SOL / USDT (Solana)</strong>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>3YS3F9DWvz...g3Uf</span>
                  </div>
                </div>
                {copiedText === 'solana' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
              </div>
            </div>
            
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 15px 0' }}>Haz clic en cualquiera de las opciones para copiar los datos al portapapeles de forma segura.</p>
            <button className="support-btn" onClick={() => setIsSupportModalOpen(false)} style={{ width: '100%' }}>Cerrar Modal</button>
          </div>
        </div>
      )}

      {/* Modal de Ahorro Lumínico LED */}
      {showLedSavingsModal && (() => {
        const gs = calculateStomatalConductance(vpd, lightIntensity, genetics);
        const efficiencyData = calculatePhotosyntheticEfficiency(gs, ppfdInput);
        const dailyWastedKwh = (deviceWattsMap.lights * deviceHoursMap.lights / 1000) * (efficiencyData.wastedWattsPercent / 100);
        const monthlyWastedCash = dailyWastedKwh * 30 * kwhCost;
        const ledSponsor = adminConfig.sponsors.led;

        return (
          <div className="modal-overlay" onClick={() => setShowLedSavingsModal(false)}>
            <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left' }}>
              <button className="close-modal-btn" onClick={() => setShowLedSavingsModal(false)}>
                <X size={20} />
              </button>
              
              <div className="modal-header" style={{ textAlign: 'center' }}>
                <Zap size={36} color="#FF4D4D" className="icon-pulse" />
                <h2 className="glow-text" style={{ color: '#FF4D4D' }}>Calculadora de Fuga de Dinero Lumínico</h2>
                <p>Tu planta está sufriendo estrés y tiene sus estomas cerrados. Está recibiendo luz intensa pero no puede procesarla.</p>
              </div>

              <div style={{ background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '20px', borderRadius: '14px', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>PÉRDIDA MENSUAL EFECTIVA</span>
                <strong style={{ fontSize: '2.5rem', color: '#FF4D4D', textShadow: '0 0 20px rgba(255, 77, 77, 0.3)', fontFamily: 'monospace' }}>
                  ${monthlyWastedCash.toFixed(2)} <span style={{ fontSize: '1rem' }}>/ Mes</span>
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '8px' }}>
                  Calculado sobre {deviceWattsMap.lights}W a {deviceHoursMap.lights}hs diarias (${kwhCost.toFixed(2)}/kWh)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '20px' }}>
                <p>
                  Al tener los estomas cerrados en un <strong>{100 - efficiencyData.efficiency.toFixed(0)}%</strong>, la planta frena la absorción de CO₂. La energía eléctrica consumida por tus focos no se transforma en flores, sino que se disipa como <strong>calor estresante</strong> sobre el follaje.
                </p>
                <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.1)', padding: '15px', borderRadius: '12px' }}>
                  <strong style={{ color: '#00FF88', display: 'block', marginBottom: '4px' }}>💡 Solución Inteligente:</strong>
                  Cambia a un panel LED de alta eficiencia espectral con regulación fina. Te sugerimos el **{ledSponsor.brand} {ledSponsor.model}**. Con tecnología avanzada, reduce el estrés térmico en canopia y permite ahorrar hasta un **{ledSponsor.savingsPercent}%** en la factura eléctrica.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>CÓDIGO DE DESCUENTO:</span>
                  <strong style={{ fontSize: '0.9rem', color: '#FFD600', letterSpacing: '0.5px' }}>{ledSponsor.coupon}</strong>
                </div>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setShowLedSavingsModal(false); 
                    triggerSponsorContact('sponsor_led'); 
                  }} 
                  className="console-btn-glow"
                  style={{
                    background: '#00FF88',
                    color: '#050805',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}
                >
                  Comprar Panel LED ↗
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Contacto para Espacios Publicitarios */}
      {isSponsorModalOpen && selectedAdSlotForContact && (
        <div className="modal-overlay" onClick={() => setIsSponsorModalOpen(false)}>
          <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'left' }}>
            <button className="close-modal-btn" onClick={() => setIsSponsorModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header" style={{ textAlign: 'center' }}>
              {selectedAdSlotForContact.id === 'sponsor_seeds' ? (
                <>
                  <span style={{ fontSize: '3rem' }}>🌱</span>
                  <h2 className="glow-text" style={{ color: '#00FF88' }}>Futura Publicidad de Semillas</h2>
                  <p>Espacio reservado para bancos de semillas y criadores oficiales.</p>
                </>
              ) : selectedAdSlotForContact.id === 'sponsor_led' ? (
                <>
                  <span style={{ fontSize: '3rem' }}>💡</span>
                  <h2 className="glow-text" style={{ color: '#00f0ff' }}>Futura Publicidad - Iluminación LED</h2>
                  <p>Espacio de iluminación LED de alta eficiencia y espectro completo.</p>
                </>
              ) : selectedAdSlotForContact.id === 'sponsor_riego' ? (
                <>
                  <span style={{ fontSize: '3rem' }}>🧪</span>
                  <h2 className="glow-text" style={{ color: '#ffd600' }}>Futura Publicidad - Suplementos EC</h2>
                  <p>Espacio reservado para marcas de bioestimulantes y fertilización.</p>
                </>
              ) : selectedAdSlotForContact.id === 'sponsor_esporas' ? (
                <>
                  <span style={{ fontSize: '3rem' }}>🌪️</span>
                  <h2 className="glow-text" style={{ color: '#d000ff' }}>Futura Publicidad - Extracción</h2>
                  <p>Espacio para marcas de extractores dinámicos e inteligente.</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '3rem' }}>📢</span>
                  <h2 className="glow-text" style={{ color: '#00FF88' }}>Publicitar en DPV PRO</h2>
                  <p>Llega a miles de cultivadores científicos en tu zona geográfica.</p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '20px 0' }}>
              <p>Estás solicitando contacto para patrocinar el espacio en: <strong>{selectedAdSlotForContact.location}</strong>.</p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong>Estadísticas Estimadas de Visualización:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#ccc' }}>
                  <li>Impresiones mensuales: +45,000 cultivadores</li>
                  <li>Click-Through Rate promedio (CTR): 6.8%</li>
                  <li>Segmentación: Cultivo interior e hidroponía avanzada</li>
                </ul>
              </div>
              <p>Envíanos tu propuesta por WhatsApp o Correo electrónico para coordinar las creatividades y la integración.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href="https://wa.me/5491122334455?text=Hola,%20quiero%20publicitar%20en%20DPV%20PRO%20en%20el%20slot%20de%20" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="console-btn-glow" 
                style={{ 
                  flex: 1, 
                  background: '#00CC6A', 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  textDecoration: 'none', 
                  textAlign: 'center' 
                }}
              >
                💬 WhatsApp Oficial
              </a>
              <button 
                onClick={() => setIsSponsorModalOpen(false)} 
                style={{ 
                  flex: 1, 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer' 
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Recibo de Pago (Premium Invoice Modal) */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', textAlign: 'left', color: '#0f172a', background: '#ffffff' }}>
            <button className="close-modal-btn" onClick={() => setSelectedInvoice(null)} style={{ color: '#475569', background: 'rgba(0,0,0,0.05)' }}>
              <X size={20} />
            </button>
            
            <div id="printable-invoice" style={{ padding: '10px' }}>
              {/* Header del Recibo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>DPV PRO</h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Precision Cannabis VPD Calculator</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a' }}>RECIBO OFICIAL</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{selectedInvoice.id}</span>
                </div>
              </div>

              {/* Grid de Información del Pago */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.8rem', color: '#475569', marginBottom: '25px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Fecha de Emisión:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedInvoice.date}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Comprador / Cliente:</span>
                  <strong style={{ color: '#0f172a' }}>{checkoutCardName || 'Cultivador de Precisión'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Método de Pago:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedInvoice.method}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Estado de Transacción:</span>
                  <strong style={{ color: '#16a34a', textTransform: 'uppercase' }}>✅ {selectedInvoice.status}</strong>
                </div>
              </div>

              {/* Detalles del Ítem comprado */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '25px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ textAlign: 'left', padding: '10px', fontWeight: 'bold', color: '#0f172a' }}>Concepto / Licencia</th>
                    <th style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', color: '#0f172a', width: '80px' }}>Cant.</th>
                    <th style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', color: '#0f172a', width: '120px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 10px', color: '#334155' }}>
                      <strong>{selectedInvoice.concept}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Acceso ilimitado a biblioteca de perfiles de sala, eliminación completa de publicidad, carga inmediata y soporte premium al desarrollo independiente.</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 10px', color: '#0f172a', fontWeight: 'bold' }}>1</td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 'bold' }}>{selectedInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total final */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px', fontSize: '0.9rem', borderTop: '2px solid #cbd5e1', paddingTop: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Monto Total Pagado:</span>
                  <strong style={{ fontSize: '1.4rem', color: '#0f172a', display: 'block', marginTop: '4px' }}>{selectedInvoice.amount}</strong>
                  <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Impuestos y tasas de pasarela de pago incluidos</span>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  border: '1px solid #cbd5e1'
                }}
              >
                Cerrar
              </button>
              
              <button 
                onClick={() => {
                  const printContent = document.getElementById('printable-invoice').innerHTML;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Recibo DPV PRO - ${selectedInvoice.id}</title>
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; }
                          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                          th, td { padding: 10px; border-bottom: 1px solid #cbd5e1; }
                          th { text-align: left; }
                        </style>
                      </head>
                      <body onload="window.print(); window.close();">
                        <div style="max-width: 600px; margin: 0 auto;">
                          ${printContent}
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  color: '#ffffff', 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🖨️ Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF Report Layout */}
      {renderPrintReport()}

      {/* Overlay Intersticial Científico */}
      {interstitial.active && (
        <div className="interstitial-overlay">
          <div className="interstitial-card glow-border">
            <div className="quantum-loader">
              <div className="quantum-ring"></div>
              <div className="quantum-ring"></div>
              <div className="quantum-ring"></div>
              <div className="quantum-core"></div>
            </div>
            
            <h3 className="interstitial-msg">{interstitial.message}</h3>
            <p className="interstitial-submsg">Calculando coeficientes termodinámicos de alta precisión...</p>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${interstitial.progress}%` }}></div>
            </div>
            
            <div className="interstitial-sponsor-tag">
              <span>PROCESADO Y OPTIMIZADO GRACIAS A:</span>
              <strong>{interstitial.sponsor}</strong>
              {interstitial.coupon && (
                <span style={{ fontSize: '0.65rem', color: '#00FF88', marginTop: '2px' }}>
                  Cupón Activo: <strong>{interstitial.coupon}</strong> (Ahorro validado)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
