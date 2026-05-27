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
import { Thermometer, Droplets, Leaf, Zap, ChevronRight, LayoutGrid, Table as TableIcon, HelpCircle, Heart, Target, Coffee, Copy, Check, X, Sparkles, AlertTriangle, Award, Activity, Compass, Flame, Package } from 'lucide-react';
import './App.css';

const BOTANICAL_ARCHETYPES = [
  { id: 'hybrid_standard', name: 'Híbrida Estándar 🧬', type: 'hybrid', desc: 'Híbridos modernos balanceados para cultivo en interior (indoor). Poseen una tasa de transpiración estomática equilibrada y excelente estabilidad climática general.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.2, 1.6], stomatalDensity: 180, maxConductance: 380, sensitivity: 0.6, baseKc: 1.0 },
  { id: 'indica_pure', name: 'Índica de Clima Seco 🏔️', type: 'indica', desc: 'Originaria de valles montañosos semiáridos de Asia Central. Desarrolla hojas muy anchas y cogollos ultra-densos. Es altamente propensa a condensaciones de rocío nocturnas en floración tardía, pero tolera DPVs secos y cálidos en el día.', early: [0.5, 0.9], veg: [0.9, 1.3], flower: [1.3, 1.7], stomatalDensity: 230, maxConductance: 320, sensitivity: 0.8, baseKc: 0.9 },
  { id: 'sativa_pure', name: 'Sativa Tropical 🌴', type: 'sativa', desc: 'Nativa de zonas ecuatoriales hiper-húmedas. Sus folíolos ultra-delgados disipan calor rápidamente mediante una transpiración foliar masiva. Es muy sensible al cierre estomático en aire seco, prefiriendo DPVs suaves y humedades relativas más altas en floración.', early: [0.3, 0.7], veg: [0.7, 1.1], flower: [1.1, 1.5], stomatalDensity: 140, maxConductance: 450, sensitivity: 0.4, baseKc: 1.15 },
  { id: 'ruderalis_auto', name: 'Ruderalis / Automática ⚡', type: 'ruderalis', desc: 'Originaria del frío siberiano, adaptada a fotoperíodos continuos e independiente de cambios lumínicos. Posees estomas compactos y muy activos, aunque su bajo volumen radicular la hace sensible a sequías en el sustrato.', early: [0.4, 0.8], veg: [0.8, 1.2], flower: [1.1, 1.5], stomatalDensity: 160, maxConductance: 350, sensitivity: 0.5, baseKc: 0.85 }
];

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
    } catch (e) {
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

  const [adminConfig, setAdminConfig] = useState({
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
    sensorPartners: [
      { id: 'sensor_1', name: 'Pulse One WiFi Pro', offset: -2.2, link: 'https://pulsegrow.com/', coupon: 'PULSESHADOW' },
      { id: 'sensor_2', name: 'RuuviTag Pro Sensor', offset: -1.8, link: 'https://ruuvi.com/', coupon: 'RUUVISHADOW' },
      { id: 'sensor_3', name: 'Inkbird Smart Thermo', offset: -2.0, link: 'https://inkbird.com/', coupon: 'INKSHADOW' }
    ],
    growShops: [
      { id: 'grow_1', name: 'Shadow Grow Shop - Central', address: 'Av. Cabildo 2400, Buenos Aires', phone: '+5491122334455', coupon: 'SHADOWGROW10', link: 'https://wa.me/5491122334455' },
      { id: 'grow_2', name: 'El Maestro del Vapor', address: 'Calle Gran Vía 45, Madrid', phone: '+34600112233', coupon: 'VAPORMASTER', link: 'https://wa.me/34600112233' },
      { id: 'grow_3', name: 'Hiper-Hidroponia Chile', address: 'Av. Providencia 1200, Santiago', phone: '+56988776655', coupon: 'HIDROSHADOW', link: 'https://wa.me/56988776655' }
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
  const [hasBadge, setHasBadge] = useState(() => {
    try {
      return localStorage.getItem('dpv_pro_badge') === 'true';
    } catch {
      return false;
    }
  });

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
    } catch (e) {
      return false;
    }
  });

  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('dpv_pro_saved_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);

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
    setTimeout(() => setProfileSuccess(''), 4000);
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
    setTimeout(() => setProfileSuccess(''), 4000);
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

  // Estado de Intersticial Científico (Ads Optimizer)
  const [interstitial, setInterstitial] = useState({ 
    active: false, 
    message: '', 
    sponsor: '', 
    coupon: '',
    progress: 0, 
    onComplete: null 
  });

  // Temporizador para simular carga científica intersticial
  useEffect(() => {
    let timer;
    if (interstitial.active) {
      timer = setInterval(() => {
        setInterstitial(prev => {
          if (prev.progress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              if (prev.onComplete) prev.onComplete();
              setInterstitial(i => ({ ...i, active: false, progress: 0 }));
            }, 100);
            return prev;
          }
          return { ...prev, progress: prev.progress + 4 }; // Carga en ~2.5 segundos
        });
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
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

  const tableData = useMemo(() => generateTableData({ min: 15, max: 35 }, leafOffset), [leafOffset]);
  const humidities = Array.from({ length: 21 }, (_, i) => 100 - i * 5);

  // Módulo C (Reloj de Esporas) - Efecto de cuenta regresiva simulada (1 segundo = 1 minuto de reloj)
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
    }, 1000);
    return () => clearInterval(timer);
  }, [vpd]);

  // Auditoría por voz para el Modo Consola / Quiosco (FIX v1.0)
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
    setTimeout(() => setCopiedText(''), 2000);
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
        left: "M 44,12 Q 28,30 44,48 Q 38,30 44,12",
        right: "M 56,12 Q 72,30 56,48 Q 62,30 56,12",
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


  const auditSections = useMemo(() => {
    const isDaySet = temp !== 24 || humidity !== 60 || leafOffset !== -2;
    const isNightSet = nightTempDrop !== 5;
    const isLightSet = ppfdInput !== 600 || lightIntensity !== 600;
    const isWateringSet = plantsCount !== 4 || potSize !== 10 || soilEc !== 1.4 || substrate !== 'soil';
    const isVentilationSet = roomWidth !== 1.2 || roomLength !== 1.2 || roomHeight !== 2.0;
    const isDryingSet = dryTemp !== 18 || dryHumidity !== 60 || dryAirflow !== 'optimal';
    const isSensorSet = selectedSensor !== '';

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
          { name: "Consumo Hídrico Proyectado", value: `${calculateEvapotranspiration(plantsCount, potSize, vpd, stage === 'early' ? 0.25 : stage === 'veg' ? 0.75 : 1.20, substrate === 'soil' ? 1.0 : substrate === 'coco' ? 1.25 : 1.50).toFixed(2)} L/Día`, target: `Riego: ${calculateWateringFrequency(potSize, calculateEvapotranspiration(plantsCount, potSize, vpd, stage === 'early' ? 0.25 : stage === 'veg' ? 0.75 : 1.20, substrate === 'soil' ? 1.0 : substrate === 'coco' ? 1.25 : 1.50) / plantsCount, substrate).text}` }
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
          ? `Sala de secado configurada a ${dryTemp.toFixed(1)}°C y ${dryHumidity}% HR.`
          : "⚠️ ALERTA: No has calibrado los controles de secado y curado. Usando clima base de 18°C y 60% HR (riesgo si tu sala real es diferente).",
        data: [
          { name: "Temperatura de Secado", value: `${dryTemp.toFixed(1)}°C`, target: "Óptimo: 15°C - 18°C" },
          { name: "Humedad Relativa Secado", value: `${dryHumidity}%`, target: "Óptimo: 55% - 60%" },
          { name: "DPV de Secado Proyectado", value: `${calculateDryingVPD(dryTemp, dryHumidity).toFixed(2)} kPa`, target: "Objetivo: 0.90 kPa" },
          { name: "Tiempo Estimado de Secado", value: `~${Math.round(calculateDryingDays(calculateDryingVPD(dryTemp, dryHumidity), dryAirflow).days)} días`, target: calculateDryingDays(calculateDryingVPD(dryTemp, dryHumidity), dryAirflow).text.substring(0, 40) + "..." }
        ]
      },
      sensor: {
        isSet: isSensorSet,
        title: "Sondas & Calibración de Precisión",
        badge: isSensorSet ? "Calibrado 🟢" : "No Calibrado 🔴",
        alertText: isSensorSet
          ? `Sonda oficial ${adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.name} calibrada con un offset de ${adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.offset}°C.`
          : "⚠️ ALERTA: Sensor de clima original sin calibrar. Se utiliza un offset manual genérico. Para mediciones exactas, calibra con sondas Pulse, Ruuvi o Inkbird.",
        data: [
          { name: "Sensor / Sonda", value: isSensorSet ? adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.name : "Offset Manual Genérico", target: "Calibración automática" },
          { name: "Offset Oficial Compensado", value: isSensorSet ? `${adminConfig.sensorPartners.find(s => s.id === selectedSensor)?.offset}°C` : `${leafOffset}°C`, target: "Desviación hoja vs aire" }
        ]
      }
    };
  }, [temp, humidity, leafOffset, activeHumidity, idealHumidity, vpd, targetVpd, status, nightTempDrop, ppfdInput, lightIntensity, lightType, lightDistance, soilEc, plantsCount, potSize, substrate, roomWidth, roomLength, roomHeight, dryTemp, dryHumidity, dryAirflow, selectedSensor, adminConfig]);


  if (consoleModeActive) {
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
            <strong style={{ fontSize: '1rem', color: genetics === 'indica' ? '#FF4D4D' : genetics === 'sativa' ? '#00DFFF' : genetics === 'ruderalis' ? '#D000FF' : '#00FF88', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>
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

  const renderPrintReport = () => {
    const serialId = `DPV-PRO-AUDIT-${new Date().getFullYear()}-${selectedStrain.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return (
      <div className="print-report-only" style={{ display: 'block', background: '#ffffff', color: '#000000', padding: '30px', minHeight: '100vh', width: '100%' }}>
        {/* Header Block with Accent bar and custom serial ID */}
        <div style={{ paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #cbd5e1' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#0f172a', fontFamily: 'sans-serif', fontWeight: '800', letterSpacing: '-0.5px' }}>
              DPV <span style={{ color: '#00CC6A' }}>PRO</span>
              {isPremium && <span style={{ fontSize: '1rem', color: '#B8860B', background: '#FFD700', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px', verticalAlign: 'middle', fontWeight: 'bold' }}>⭐ PREMIUM</span>}
            </h1>
            <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>AUDITORÍA INTEGRAL DE CULTIVO</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>Reporte de Precisión y Calibración Fisiológica Vegetal (Offline Físico)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ fontSize: '1.25rem', display: 'block', color: '#0f172a', fontWeight: '700' }}>{adminConfig.growShops[0].name}</strong>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Punto de Calibración DPV Autorizado</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>ID: {serialId}</div>
          </div>
        </div>
        
        {/* Accent green bar */}
        <div style={{ height: '5px', background: '#00CC6A', borderRadius: '2px', marginBottom: '20px' }} />

        {/* Executive 4-column summary metric grid */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px', background: '#f8fafc', marginBottom: '25px', fontSize: '0.9rem', color: '#0f172a' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>📅 Fecha del Reporte</span>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>{new Date().toLocaleDateString('es-ES')}</strong>
            </div>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px', paddingLeft: '5px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>🧬 Genética / Perfil</span>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>{selectedStrain.name}</strong>
            </div>
            <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px', paddingLeft: '5px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>🌱 Etapa</span>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>{targets[stage].name}</strong>
            </div>
            <div style={{ paddingLeft: '5px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>📊 DPV Diurno Promedio</span>
              <strong style={{ fontSize: '0.95rem', display: 'block', color: '#0f172a' }}>{vpd.toFixed(2)} kPa</strong>
            </div>
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

              {/* Tabla Estructurada de Alto Contraste (Borderless columns, clean zebra style) */}
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

        {/* Dotted Stamp and Signature placeholder box for grow shop signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px', marginTop: '40px', marginBottom: '35px', pageBreakInside: 'avoid' }}>
          {/* Sello / Stamp Square Box */}
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

          {/* Signature and Verification lines */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px dotted #64748b', marginBottom: '8px', height: '80px' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 'bold', display: 'block' }}>Firma del Técnico Calibrador</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Responsable de Cultivo DPV PRO</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1.5px dotted #64748b', marginBottom: '8px', height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', marginBottom: '4px' }}>CODE: {Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 'bold', display: 'block' }}>Código de Validación Física</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Punto de Calibración DPV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div style={{ borderTop: '2px solid #000000', paddingTop: '15px', textAlign: 'center', fontSize: '0.8rem', color: '#475569', pageBreakInside: 'avoid' }}>
          <p style={{ margin: '0 0 5px 0' }}>Reporte oficial de auditoría emitido de forma fiable y segura por <strong>DPV PRO v1.0</strong> en colaboración con <strong>{adminConfig.growShops[0].name}</strong>.</p>
          <p style={{ margin: 0 }}>Presenta este reporte en formato impreso o digital en tu Grow Shop aliado para validar tus cupones y la calibración del cultivo.</p>
        </div>
      </div>
    );
  };

  if (isPrinting) {
    return renderPrintReport();
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <h1 className="glow-text" style={{ margin: 0 }}>DPV <span className="highlight">PRO</span></h1>
          {isPremium && (
            <div className="premium-badge-glow" title="Suscripción Premium DPV PRO Activa">
              <Award size={16} color="#FFD600" className="icon-pulse" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD600', letterSpacing: '0.5px' }}>⭐ PREMIUM MEMBER</span>
            </div>
          )}
          {hasBadge && (
            <div className="maestro-badge-glow" title="¡Felicidades Maestro de las Sombras! Certificado en Fisiología de Vapor y DPV.">
              <Award size={16} color="#FFD600" className="icon-pulse" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FFD600', letterSpacing: '0.5px' }}>MAESTRO SHADOW</span>
            </div>
          )}
        </div>
        <p className="subtitle">Herramienta de Precisión Científica para Cultivadores</p>
      </header>

      {/* Publicidad Superior */}
      {!isPremium && (
        <div className="ad-slot-top glass">
          <span className="ad-placeholder">PUBLICIDAD - ESPACIO DISPONIBLE (ADSENSE)</span>
        </div>
      )}

      <nav className="view-switcher glass">
        <button className={`view-btn ${view === 'calc' ? 'active' : ''}`} onClick={() => setView('calc')}>
          <LayoutGrid size={18} /> Calculadora
        </button>
        <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>
          <TableIcon size={18} /> Tabla Completa
        </button>
        <button className={`view-btn ${view === 'dry' ? 'active' : ''}`} onClick={() => setView('dry')}>
          <Package size={18} /> Secado & Curado
        </button>
        <button className={`view-btn ${view === 'pro' ? 'active' : ''}`} onClick={() => setView('pro')}>
          <Zap size={18} /> Herramientas Pro
        </button>
        <button className="view-btn console-btn-glow" onClick={() => setConsoleModeActive(true)} style={{ color: '#D000FF', border: '1px solid rgba(208, 0, 255, 0.15)', background: 'rgba(208, 0, 255, 0.02)' }}>
          <Activity size={18} className="icon-pulse" /> Consola 📺
        </button>
      </nav>

      <main>
        {view === 'calc' && (
          <>
            <section className="stage-selector-container">
              <div className="stage-selector glass">
                {Object.keys(targets).map((s) => (
                  <button key={s} className={`stage-btn ${stage === s ? 'active' : ''}`} onClick={() => setStage(s)}>
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
                <span style={{ whiteSpace: 'nowrap' }}>🧬 Perfil Genético:</span>
                <select 
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
              
              <div className="mode-selector glass">
                <button className={`mode-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                  🎛️ Manual
                </button>
                <button className={`mode-btn ${mode === 'smart' ? 'active' : ''}`} onClick={() => setMode('smart')}>
                  <Sparkles size={14} className="sparkle-icon" /> Smart (Auto)
                </button>
              </div>
            </section>

            <section className="main-display glass">
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

              <div className={`control-card glass ${mode === 'smart' ? 'smart-locked' : ''}`}>
                <div className="control-header">
                  <div className="title-with-help">
                    <Droplets size={20} color="#00FF88" />
                    <h3>Hum. Relativa</h3>
                    {mode === 'smart' && <span className="smart-badge-indicator">Smart</span>}
                    <div className="tooltip">
                      <HelpCircle size={16} className="help-icon" />
                      <span className="tooltip-text">
                        {mode === 'smart' 
                          ? `Regulado automáticamente al ${idealHumidity}% para la etapa ${targets[stage].name}.` 
                          : 'Porcentaje de agua en el aire respecto al máximo posible.'}
                      </span>
                    </div>
                  </div>
                  <span className="value-badge">{activeHumidity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={activeHumidity} 
                  onChange={(e) => setHumidity(parseFloat(e.target.value))}
                  disabled={mode === 'smart'} 
                />
                {mode === 'smart' && (
                  <p className="smart-lock-notice">SNAPPED: Automatizado para DPV óptimo ({targetVpd.toFixed(1)} kPa)</p>
                )}
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
            {renderAdSenseBanner("Dashboard Calculadora Horizontal")}
          </>
        )}

        {view === 'table' && (
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
            {renderAdSenseBanner("Tabla Científica Inferior")}
          </section>
        )}

        {view === 'dry' && (() => {
          const dryingVpd = calculateDryingVPD(dryTemp, dryHumidity);
          const dryingDaysData = calculateDryingDays(dryingVpd, dryAirflow);
          
          let dryingStatus = { label: 'Óptimo (Secado Perfecto)', color: '#00FF88' };
          if (dryingVpd < 0.60) {
            dryingStatus = { label: 'Riesgo Crítico (Condensación / Moho)', color: '#FF4D4D' };
          } else if (dryingVpd >= 0.60 && dryingVpd < 0.85) {
            dryingStatus = { label: 'Secado Lento (Riesgo de Humedad)', color: '#FFD600' };
          } else if (dryingVpd >= 0.85 && dryingVpd <= 0.95) {
            dryingStatus = { label: 'Secado Óptimo (Preservación Perfecta)', color: '#00FF88' };
          } else if (dryingVpd > 0.95 && dryingVpd <= 1.20) {
            dryingStatus = { label: 'Secado Acelerado (Pérdida de Aromas)', color: '#FFA500' };
          } else {
            dryingStatus = { label: 'Secado Crítico (Flores Crujientes / Amargas)', color: '#FF4D4D' };
          }

          return (
            <section className="pro-tools-view glass" style={{ padding: '30px', animation: 'fadeIn 0.5s ease', marginBottom: '25px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 className="glow-text" style={{ fontSize: '2rem', color: '#00FF88', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Package size={28} className="icon-pulse" /> Sala de Secado & Curado de Precisión
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.5' }}>
                  Control ambiental termodinámico enfocado en el momento más crítico en post-cosecha. Un DPV óptimo asegura la degradación completa de la clorofila y la retención intacta de terpenos y cannabinoides.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                {/* COLUMNA 1: AJUSTES Y PARÁMETROS */}
                <div className="glow-border" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                    ⚙️ Variables del Cuarto de Secado
                  </h3>

                  {/* Slider de Temperatura */}
                  <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <span>Temperatura de Secado:</span>
                      <strong style={{ color: '#FF4D4D', fontSize: '1rem' }}>{dryTemp.toFixed(1)}°C</strong>
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="28" 
                      step="0.5" 
                      value={dryTemp} 
                      onChange={(e) => setDryTemp(parseFloat(e.target.value))} 
                    />
                    <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>Frío (Mirceno OK): 15°C</span>
                      <span>Evaporación: &gt;20°C</span>
                    </span>
                  </div>

                  {/* Slider de Humedad */}
                  <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <span>Humedad Relativa:</span>
                      <strong style={{ color: '#00FF88', fontSize: '1rem' }}>{dryHumidity}%</strong>
                    </label>
                    <input 
                      type="range" 
                      min="30" 
                      max="85" 
                      step="1" 
                      value={dryHumidity} 
                      onChange={(e) => setDryHumidity(parseInt(e.target.value))} 
                    />
                    <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>Secado Crujiente: &lt;45%</span>
                      <span>Peligro Moho: &gt;65%</span>
                    </span>
                  </div>

                  {/* Flujo de aire */}
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
                      Ventilación / Movimiento de Aire:
                    </label>
                    <select 
                      value={dryAirflow} 
                      onChange={(e) => setDryAirflow(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        background: 'rgba(0,0,0,0.5)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value="low">Flujo Suave / Extracción Mínima (Retención de aromas)</option>
                      <option value="optimal">Flujo Óptimo / Circulación Indirecta (Recomendado)</option>
                      <option value="high">Flujo Fuerte / Renovación Activa (Acelera secado)</option>
                    </select>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', lineHeight: '1.3' }}>
                      💡 <em>Evita que el aire apunte directo a los cogollos colgando para no resecar las capas externas prematuramente.</em>
                    </span>
                  </div>
                </div>

                {/* COLUMNA 2: PANTALLA NEÓN Y VELOCIDAD DE SECADO */}
                <div className="glow-border" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                      📊 Diagnóstico Termodinámico de Secado
                    </h3>

                    {/* Gran Display de DPV de Secado */}
                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        DPV DE SECADO ACTUAL
                      </span>
                      <strong style={{ fontSize: '3rem', color: dryingStatus.color, textShadow: `0 0 20px ${dryingStatus.color}22`, fontFamily: 'monospace' }}>
                        {dryingVpd.toFixed(2)} <span style={{ fontSize: '1.2rem' }}>kPa</span>
                      </strong>

                      <div style={{
                        marginTop: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: dryingStatus.color,
                        backgroundColor: dryingStatus.color + '15',
                        border: `1px solid ${dryingStatus.color}33`,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {dryingStatus.label}
                      </div>
                    </div>

                    {/* Indicador de Velocidad de Secado */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Secado Total Estimado:</span>
                        <strong style={{ fontSize: '1.2rem', color: '#00F0FF', fontFamily: 'monospace' }}>
                          ~{Math.round(dryingDaysData.days)} días
                        </strong>
                      </div>

                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                        <div style={{ 
                          width: `${(dryingDaysData.days / 30) * 100}%`, 
                          height: '100%', 
                          backgroundColor: '#00F0FF',
                          boxShadow: '0 0 8px #00F0FF',
                          transition: 'width 0.4s ease-out' 
                        }} />
                      </div>
                      
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {dryingDaysData.text}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '10px 14px', 
                    borderRadius: '10px', 
                    background: 'rgba(0,255,136,0.02)', 
                    border: '1px solid rgba(0,255,136,0.05)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.3'
                  }}>
                    💡 <strong>Fórmula de Equilibrio:</strong> El DPV objetivo para el secado es de <strong>0.90 kPa</strong>. El desvío actual de tu sala es de <strong>{(dryingVpd - 0.90).toFixed(2)} kPa</strong>. Intenta calibrar tus controles para acercar el desvío a 0.00 kPa y lograr un curado óptimo.
                  </div>
                </div>
              </div>

              {/* CONTENEDOR DE ADVERTENCIAS Y BIOLOGÍA */}
              <div style={{ marginTop: '30px' }}>
                {dryTemp > 20 && (
                  <div style={{ background: 'rgba(255, 77, 77, 0.08)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <AlertTriangle color="#FF4D4D" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div>
                      <strong style={{ color: '#FF4D4D', fontSize: '0.85rem' }}>⚠️ ALERTA DE VOLATILIZACIÓN DE TERPENOS:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        La temperatura de tu sala de secado es de <strong>{dryTemp.toFixed(1)}°C</strong>. Por encima de los 20°C, los terpenos más volátiles y valiosos (como el mirceno y el limoneno) se evaporan rápidamente en el aire, mermando permanentemente la fragancia, el sabor y la potencia de tu cosecha. Se recomienda enfriar el ambiente.
                      </p>
                    </div>
                  </div>
                )}

                {(dryHumidity > 65 || dryingVpd < 0.70) && (
                  <div style={{ background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.2)', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <AlertTriangle color="#FFD600" style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
                    <div>
                      <strong style={{ color: '#FFD600', fontSize: '0.85rem' }}>⚠️ RIESGO ELEVADO DE PATÓGENOS Y MOHO GRIS (BOTRYTIS):</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        Humedad excesivamente alta ({dryHumidity}%) o DPV demasiado bajo ({dryingVpd.toFixed(2)} kPa) detectados. En un cuarto de secado, las flores cargadas de savia vegetal son extremadamente vulnerables. Con una humedad mayor al 65%, las esporas fúngicas de la Botrytis pueden germinar en el interior de los cogollos en cuestión de horas. Enciende extractores para renovar el aire o instala un deshumidificador.
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.05)', padding: '20px', borderRadius: '14px' }}>
                  <strong style={{ color: '#00FF88', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={16} /> Fisiología Vegetal Avanzada: La Degradación de la Clorofila
                  </strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Durante las primeras dos semanas tras el corte, las enzimas dentro de la planta agonizan lentamente y continúan activas, alimentándose de los azúcares almacenados y descomponiendo la <strong>clorofila</strong> (el pigmento verde que le da sabor "áspero a pasto" y picor en la garganta a la flor). Un secado lento y equilibrado a un DPV de <strong>0.9 kPa</strong> le otorga a estas enzimas el tiempo y la humedad tisular exactos para desintegrar la clorofila por completo, logrando cogollos de ceniza blanca, sabor increíblemente suave y terpenos conservados a su máxima capacidad.
                  </p>
                </div>
              </div>

              {/* MONETIZACIÓN PREMIUM Y SPONSORS */}
              <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#FFD600" /> Soluciones Científicas de Curado Recomendadas
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* SPONSOR 1: BOVEDA */}
                  <div className="glow-border" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0,255,136,0.1)', background: 'rgba(0, 255, 136, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '1rem', color: '#00FF88' }}>Bóveda® 62% / 58%</strong>
                        <span style={{ fontSize: '0.65rem', background: '#00FF8822', color: '#00FF88', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>PATROCINADOR OFICIAL</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 15px 0' }}>
                        El estándar mundial en control bidireccional de humedad. Sus membranas de sal osmótica natural absorben o liberan vapor de agua de forma constante para clavar la humedad en el frasco a 62% o 58%, sellando los terpenos y evitando moho.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>CÓDIGO DE DESCUENTO:</span>
                        <strong style={{ fontSize: '0.85rem', color: '#FFD600', letterSpacing: '0.5px' }}>BOVEDASHADOW</strong>
                      </div>
                      <a 
                        href="https://bovedainc.com/" 
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
                        Comprar Ahora ↗
                      </a>
                    </div>
                  </div>

                  {/* SPONSOR 2: GROVE BAGS */}
                  <div className="glow-border" style={{ padding: '20px', borderRadius: '14px', border: '1px solid rgba(0,223,255,0.1)', background: 'rgba(0, 223, 255, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '1rem', color: '#00DFFF' }}>Grove Bags TerpLoc®</strong>
                        <span style={{ fontSize: '0.65rem', background: '#00DFFF22', color: '#00DFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>PATROCINADOR OFICIAL</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 15px 0' }}>
                        Tecnología de empaque inteligente diseñada específicamente para flores. Su película multicapa TerpLoc® crea un microclima de DPV perfecto en el interior, purgando automáticamente el exceso de gas y reteniendo el 99% de los aromas originales sin sobre-secar.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>CÓDIGO DE DESCUENTO:</span>
                        <strong style={{ fontSize: '0.85rem', color: '#FFD600', letterSpacing: '0.5px' }}>GROVESHADOW</strong>
                      </div>
                      <a 
                        href="https://grovebags.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="console-btn-glow"
                        style={{ 
                          background: '#00DFFF', 
                          color: '#050805', 
                          padding: '6px 14px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          textDecoration: 'none',
                          textAlign: 'center'
                        }}
                      >
                        Comprar Ahora ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {view === 'pro' && (
          <section className="pro-tools-view glass">
            <div className="pro-layout">
              {/* Menú lateral Pro */}
              <aside className="pro-sidebar">
                <h3>Módulos Avanzados</h3>
                <nav className="pro-nav">
                  <button className={`pro-nav-btn premium-nav-btn ${activeProTool === 'premium' ? 'active' : ''}`} onClick={() => setActiveProTool('premium')} style={{ border: '1px solid #FFD600', boxShadow: activeProTool === 'premium' ? '0 0 10px rgba(255, 214, 0, 0.4)' : '0 0 5px rgba(255, 214, 0, 0.1)', background: activeProTool === 'premium' ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(0, 0, 0, 0.4))' : 'rgba(255, 214, 0, 0.02)' }}>
                    ⭐ Perfiles & DPV Premium
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'nocturno' ? 'active' : ''}`} onClick={() => setActiveProTool('nocturno')}>
                    🌙 Predictor Nocturno
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'genetica' ? 'active' : ''}`} onClick={() => setActiveProTool('genetica')}>
                    🧬 Fisiología Genética
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'riego' ? 'active' : ''}`} onClick={() => setActiveProTool('riego')}>
                    💧 Demanda de Riego
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'costo' ? 'active' : ''}`} onClick={() => setActiveProTool('costo')}>
                    ⚡ Consumo Eléctrico
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'extraccion' ? 'active' : ''}`} onClick={() => setActiveProTool('extraccion')}>
                    🌬️ Extracción de Aire
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'academia' ? 'active' : ''}`} onClick={() => setActiveProTool('academia')}>
                    🎓 Academia DPV
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'directorio' ? 'active' : ''}`} onClick={() => setActiveProTool('directorio')}>
                    🗺️ Locales Aliados
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'reporte' ? 'active' : ''}`} onClick={() => setActiveProTool('reporte')}>
                    📊 Ficha y Reporte
                  </button>
                  <button className={`pro-nav-btn ${activeProTool === 'anuncios' ? 'active' : ''}`} onClick={() => setActiveProTool('anuncios')}>
                    ⚙️ Panel de Anuncios
                  </button>
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
                        background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.05), rgba(0, 0, 0, 0.4))', 
                        border: '1px solid #FFD600',
                        marginBottom: '30px',
                        textAlign: 'center'
                      }}>
                        <div style={{ marginBottom: '20px' }}>
                          <Sparkles size={36} color="#FFD600" className="icon-pulse" style={{ marginBottom: '10px' }} />
                          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#FFD600', textShadow: '0 0 15px rgba(255, 214, 0, 0.3)' }}>
                            Suscripción DPV PRO Premium ⭐
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '10px auto 0 auto', lineHeight: '1.45' }}>
                            Desbloquea el máximo potencial científico para tu cultivo. Elimina anuncios, guarda perfiles ilimitados y optimiza tus tiempos sin esperas comerciales.
                          </p>
                        </div>

                        {/* Premium Features Checklist */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                          gap: '15px', 
                          textAlign: 'left', 
                          margin: '20px auto 30px auto',
                          maxWidth: '800px',
                          background: 'rgba(0,0,0,0.2)',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 214, 0, 0.1)'
                        }}>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#FFD600' }}>✓</span>
                            <span><strong>Perfiles Ilimitados:</strong> Guarda infinitas salas de cultivo (Free: 1 slot).</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#FFD600' }}>✓</span>
                            <span><strong>Carga Instantánea:</strong> Sin delay de 2.5s en reportes ni simuladores.</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#FFD600' }}>✓</span>
                            <span><strong>Interfaz Sin Anuncios:</strong> Banners patrocinados reemplazados por consejos biológicos.</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#FFD600' }}>✓</span>
                            <span><strong>Insignia Dorada:</strong> Sello Premium en tu app e informes de auditoría PDF.</span>
                          </div>
                        </div>

                        {/* Simulated Checkout Form */}
                        <div className="glass" style={{ 
                          padding: '24px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          maxWidth: '500px',
                          margin: '0 auto',
                          textAlign: 'left'
                        }}>
                          <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            💳 Pasarela de Pago Segura (Simulación)
                          </h4>
                          
                          {/* Plan Selection */}
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ 
                              flex: 1, 
                              border: '1px solid #FFD600', 
                              background: 'rgba(255, 214, 0, 0.03)', 
                              padding: '10px', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}>
                              <strong style={{ fontSize: '0.85rem', color: '#FFD600', display: 'block' }}>Mensual</strong>
                              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>$4.99 USD</span>
                            </div>
                            <div style={{ 
                              flex: 1, 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              background: 'rgba(255,255,255,0.02)', 
                              padding: '10px', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Anual (Ahorra 33%)</strong>
                              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#00FF88' }}>$39.99 USD</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>NÚMERO DE TARJETA:</label>
                              <input 
                                type="text" 
                                value="4000 1234 5678 9010" 
                                disabled
                                style={{ 
                                  width: '100%', 
                                  background: 'rgba(0,0,0,0.5)', 
                                  border: '1px solid rgba(255,255,255,0.1)', 
                                  color: '#fff', 
                                  padding: '8px 12px', 
                                  borderRadius: '6px', 
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace'
                                }} 
                              />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>VENCIMIENTO:</label>
                                <input 
                                  type="text" 
                                  value="12/28" 
                                  disabled
                                  style={{ 
                                    width: '100%', 
                                    background: 'rgba(0,0,0,0.5)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff', 
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace'
                                  }} 
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CVC:</label>
                                <input 
                                  type="text" 
                                  value="321" 
                                  disabled
                                  style={{ 
                                    width: '100%', 
                                    background: 'rgba(0,0,0,0.5)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: '#fff', 
                                    padding: '8px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace'
                                  }} 
                                />
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                setIsPremium(true);
                                localStorage.setItem('dpv_pro_is_premium', 'true');
                                setProfileSuccess("¡Suscripción DPV PRO Premium Activada con éxito! ⭐ Gracias por tu apoyo.");
                                setTimeout(() => setProfileSuccess(''), 5000);
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
                                marginTop: '15px',
                                textAlign: 'center',
                                boxShadow: '0 0 15px rgba(255, 214, 0, 0.3)'
                              }}
                            >
                              Activar Suscripción Premium (Simulado) ⚡
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="premium-card glow-border" style={{ 
                        padding: '24px', 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03), rgba(0, 0, 0, 0.4))', 
                        border: '1px solid #00FF88',
                        marginBottom: '30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px'
                      }}>
                        <div style={{ textAlign: 'left' }}>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#00FF88', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Award size={22} color="#FFD600" className="icon-pulse" /> 
                            Cuenta Premium Activa ⭐
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Disfrutas de perfiles de sala ilimitados, cargas instantáneas y una interfaz libre de publicidad comercial.
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setIsPremium(false);
                            localStorage.setItem('dpv_pro_is_premium', 'false');
                            setProfileSuccess("Suscripción premium revertida a plan gratuito.");
                            setTimeout(() => setProfileSuccess(''), 4000);
                          }}
                          style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            color: '#FF4D4D',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Desactivar Premium (Simulación) 🔄
                        </button>
                      </div>
                    )}

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
                                        setProfiles(prev => prev.filter(p => p.id !== prof.id));
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
                                        handleCopy('', 'offset_injected');
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
                                              handleCopy('', 'offset_sensor_applied');
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

                {activeProTool === 'academia' && (
                  <div className="pro-module-card">
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
                        <h5>2. ¿Qué acción realizan los estomas de las hojas ante un DPV críticamente alto (ej: 2.2 kPa)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'A' })}>
                            A. Se abren al 100% para liberar la máxima cantidad de agua posible y enfriar el aire.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'B' })}>
                            B. Explotan debido a la excesiva tensión superficial interna del agua celular.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q2 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q2: 'C' })}>
                            C. Se cierran herméticamente para evitar que la planta muera deshidratada (cierre estomático por estrés). (Correcto)
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 3 */}
                      <div className="quiz-question-box">
                        <h5>3. ¿Por qué la transición de luces encendidas a apagadas (Lights-Off) es el momento de mayor riesgo de moho?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'A' })}>
                            A. Porque la temperatura del aire cae rápido y las hojas/cogollos descienden por debajo del Punto de Rocío, condensando agua líquida libre. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'B' })}>
                            B. Porque las plantas transpiran de forma acelerada durante las primeras horas de oscuridad absoluta.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q3 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q3: 'C' })}>
                            C. Porque la presión barométrica de la sala se eleva de golpe al apagarse los focos de cultivo.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 4 */}
                      <div className="quiz-question-box">
                        <h5>4. ¿Cómo afecta un DPV crónicamente bajo (ej: 0.3 kPa) a la absorción de nutrientes inmóviles como el Calcio (Ca)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'A' })}>
                            A. Incrementa la absorción radicular de Calcio ya que no hay evaporación foliar que frene el flujo.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'B' })}>
                            B. Detiene el transporte de Calcio hacia los brotes nuevos, causando necrosis apical porque el Calcio se mueve solo de forma pasiva por la corriente de transpiración. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q4 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q4: 'C' })}>
                            C. Hace que el Calcio cristalice en las raíces y bloquee la absorción de Nitrógeno y Potasio.
                          </button>
                        </div>
                      </div>

                      {/* Pregunta 5 */}
                      <div className="quiz-question-box">
                        <h5>5. ¿Qué nos indica científicamente un Offset de Hoja positivo (ej: hoja a 26.0°C y aire a 24.0°C)?</h5>
                        <div className="quiz-options">
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'A' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'A' })}>
                            A. Que la planta está en su punto máximo de fotosíntesis y transpiración fluida.
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'B' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'B' })}>
                            B. Que la planta ha cerrado estomas por estrés térmico, hídrico o radicular, deteniendo la transpiración y acumulando calor bajo la luz. (Correcto)
                          </button>
                          <button className={`quiz-opt-btn ${quizAnswers.q5 === 'C' ? 'selected' : ''}`} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, q5: 'C' })}>
                            C. Que el suelo tiene temperaturas óptimas que aceleran el metabolismo respiratorio de las flores.
                          </button>
                        </div>
                      </div>
 
                      {renderAdSenseBanner("Trivia Native Ad")}
 
                      {!quizSubmitted ? (
                        <button 
                          className="quiz-submit-btn" 
                          onClick={() => {
                            if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5) return;
                            triggerInterstitial(
                              "Analizando respuestas y compilando diagnóstico fitológico...",
                              `${adminConfig.sponsors.academy.name} - ${adminConfig.sponsors.academy.course}`,
                              adminConfig.sponsors.academy.coupon,
                              () => {
                                let score = 0;
                                if (quizAnswers.q1 === 'B') score++;
                                if (quizAnswers.q2 === 'C') score++;
                                if (quizAnswers.q3 === 'A') score++;
                                if (quizAnswers.q4 === 'B') score++;
                                if (quizAnswers.q5 === 'B') score++;
                                setQuizScore(score);
                                setQuizSubmitted(true);
                                if (score === 5) {
                                  setHasBadge(true);
                                  try {
                                    localStorage.setItem('dpv_pro_badge', 'true');
                                  } catch (err) {
                                    console.warn('Storage blocked:', err);
                                  }
                                }
                              }
                            );
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

                          {/* Tarjeta de Conversión Cursos Academia (v0.9 Phase 3) */}
                          <div className="glow-border" style={{
                            background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.05), rgba(0, 0, 0, 0.6))',
                            border: '1px solid rgba(255, 214, 0, 0.2)',
                            padding: '20px',
                            borderRadius: '14px',
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            textAlign: 'left'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Award size={20} color="#FFD600" className="icon-pulse" />
                                <strong style={{ fontSize: '0.95rem', color: '#FFD600', letterSpacing: '0.5px' }}>
                                  {adminConfig.sponsors.academy.name}
                                </strong>
                              </div>
                              <span style={{ fontSize: '0.65rem', background: '#FFD60022', color: '#FFD600', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>CURSO COMPLEMENTARIO</span>
                            </div>
                            
                            <div>
                              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#fff' }}>
                                {adminConfig.sponsors.academy.course}
                              </h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                Lleva tus conocimientos botánicos al siguiente nivel profesional. Aprende a fondo sobre transporte xilemático, regulación de auxinas, asimilación cuántica y termodinámica del vapor con los mayores científicos del sector.
                              </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                              <div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>MATRÍCULA CON DESCUENTO:</span>
                                <strong style={{ fontSize: '0.9rem', color: '#FFD600' }}>
                                  ${adminConfig.sponsors.academy.price} USD <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>$199 USD</span>
                                </strong>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <span style={{ fontSize: '0.6rem', color: '#FFD600' }}>Cupón: <strong>{adminConfig.sponsors.academy.coupon}</strong></span>
                                <a 
                                  href={adminConfig.sponsors.academy.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="console-btn-glow"
                                  style={{
                                    background: '#FFD600',
                                    color: '#050805',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textDecoration: 'none'
                                  }}
                                >
                                  Inscribirse Ahora ↗
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Hoja de Respuestas Científica */}
                          <div style={{
                            textAlign: 'left',
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '15px' }}>📖 Hoja de Respuestas & Explicación Botánica:</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem', lineHeight: '1.4' }}>
                              <div>
                                <span style={{ color: quizAnswers.q1 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 1: {quizAnswers.q1 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  El DPV real ocurre en el mesófilo foliar. La humedad interna de la planta es siempre del 100% (saturación). El DPV es la fuerza secante neta que aspira el agua hacia afuera y depende de la diferencia entre esa presión subestomática de vapor interna y la del ambiente.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q2 === 'C' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 2: {quizAnswers.q2 === 'C' ? 'Correcto (C)' : 'Incorrecto (C)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Cierre Estomático. Bajo un aire críticamente seco (DPV alto), la planta previene la deshidratación letal cerrando las células oclusivas estomáticas. Esto frena la pérdida de agua, pero también detiene la absorción de CO2, frenando por completo el crecimiento fotosintético.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q3 === 'A' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 3: {quizAnswers.q3 === 'A' ? 'Correcto (A)' : 'Incorrecto (A)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Punto de Rocío y Condensación. Al apagar luces, la temperatura cae velozmente. Como las hojas y flores densas disipan calor aún más rápido por radiación, se enfrían por debajo del Punto de Rocío del aire húmedo remanente, formando gotas microscópicas internas de agua líquida (Botrytis).
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q4 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 4: {quizAnswers.q4 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Deficiencias por DPV Bajo. El Calcio es un elemento estructural no móvil. Las raíces no lo bombean activamente; se absorbe pasivamente disuelto en el agua que asciende por capilaridad a través del xilema gracias a la tensión generada por la transpiración. Si el DPV es muy bajo, no hay transpiración y se desata pudrición y necrosis apical foliar.
                                </p>
                              </div>
                              <div>
                                <span style={{ color: quizAnswers.q5 === 'B' ? '#00FF88' : '#FF4D4D', fontWeight: 800 }}>Pregunta 5: {quizAnswers.q5 === 'B' ? 'Correcto (B)' : 'Incorrecto (B)'}</span>
                                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                                  Falla Transpirativa. Una planta sana evapotranspira agua continuamente, lo que refrigera las hojas por calor latente de evaporación (haciéndolas estar 1.5°C a 3.0°C *por debajo* del aire, offset negativo). Si la hoja está más caliente que el aire, sus "motores" estomáticos están apagados por completo por estrés.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

        <section className="education-section glass warning-gradient" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.03), rgba(0, 0, 0, 0.4))', borderColor: 'rgba(0, 255, 136, 0.25)' }}>
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

        <section className="support-section glass">
          <Heart size={20} color="#FF4D4D" className="heart-beat" />
          <p>¿Te sirve esta herramienta? Apóyanos para seguir mejorando el proyecto.</p>
          <button className="support-btn" onClick={() => setIsSupportModalOpen(true)}>Invítanos un café ☕</button>
        </section>

        {!isPremium && (
          <div className="ad-slot-bottom glass">
            <span className="ad-placeholder">PUBLICIDAD - BANNER INFERIOR</span>
          </div>
        )}
      </main>

      <footer style={{
        marginTop: '60px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 20px 20px 20px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <strong style={{ fontSize: '1.25rem', color: '#00FF88', letterSpacing: '2px' }}>DPV <span style={{ color: '#fff' }}>PRO</span></strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.45 }}>
              Herramienta de precisión para el control y análisis ambiental en cultivos de alta gama. Optimizando el rendimiento vegetal con rigor científico.
            </p>
          </div>

          {/* Iconos de Redes Sociales del Proyecto (Hub de Redes v0.9) */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '10px 0' }}>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" title="Siguenos en Instagram" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', textDecoration: 'none' }} className="glow-text-hover">
              📸 <span style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Instagram</span>
            </a>
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" title="Mira nuestros Tutoriales en Youtube" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', textDecoration: 'none' }} className="glow-text-hover">
              🎥 <span style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>YouTube</span>
            </a>
            <a href="https://telegram.org/" target="_blank" rel="noopener noreferrer" title="Unete a nuestra comunidad de Telegram" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', textDecoration: 'none' }} className="glow-text-hover">
              💬 <span style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Telegram</span>
            </a>
            <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" title="Servidor de Discord Oficial" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', textDecoration: 'none' }} className="glow-text-hover">
              👾 <span style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Discord</span>
            </a>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '15px', width: '100%' }}>
            <p>DPV PRO &copy; 2026 - Master Precision Tools. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Soporte Glassmorphic */}
      {isSupportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSupportModalOpen(false)}>
          <div className="modal-content glass glow-border" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsSupportModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className="modal-header">
              <Coffee size={36} color="#00FF88" className="icon-pulse" />
              <h2 className="glow-text">Apoya a DPV PRO</h2>
              <p>Tu contribución nos ayuda a mantener los servidores activos y seguir desarrollando herramientas de precisión científica para cultivadores.</p>
            </div>

            <div className="payment-options">
              {/* Cafecito AR */}
              <a href="https://cafecito.app/gikey" target="_blank" rel="noopener noreferrer" className="payment-card glass">
                <div className="payment-card-header">
                  <h4>Cafecito.app</h4>
                  <span className="payment-badge ar">Argentina 🇦🇷</span>
                </div>
                <p>Apóyanos con pesos argentinos de forma rápida.</p>
                <span className="payment-action-btn">Invitar Café ☕</span>
              </a>

              {/* BuyMeACoffee Global */}
              <a href="https://buymeacoffee.com/gikey" target="_blank" rel="noopener noreferrer" className="payment-card glass">
                <div className="payment-card-header">
                  <h4>Buy Me A Coffee</h4>
                  <span className="payment-badge global">Global 🌎</span>
                </div>
                <p>Support us with credit/debit card from anywhere.</p>
                <span className="payment-action-btn">Support ☕</span>
              </a>

              {/* Transferencia Alias */}
              <div className="payment-card glass" onClick={() => handleCopy('gikey.mp', 'alias')}>
                <div className="payment-card-header">
                  <h4>Alias Bancario</h4>
                  <span className="payment-badge ar">MercadoPago 🇦🇷</span>
                </div>
                <div className="copy-field">
                  <code>gikey.mp</code>
                  <button className="copy-btn">
                    {copiedText === 'alias' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar el alias de Mercado Pago.</p>
              </div>

              {/* Binance Smart Chain BEP-20 */}
              <div className="payment-card glass" onClick={() => handleCopy('0x33bE63D963d95318e2657A401Df1F0aC6Ef6a410', 'bep20')}>
                <div className="payment-card-header">
                  <h4>USDT (BEP-20)</h4>
                  <span className="payment-badge crypto">BSC 🪙</span>
                </div>
                <div className="copy-field">
                  <code className="crypto-address">0x33bE63D9...</code>
                  <button className="copy-btn">
                    {copiedText === 'bep20' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar la dirección BEP-20.</p>
              </div>

              {/* Solana Network */}
              <div className="payment-card glass" onClick={() => handleCopy('3YS3F9DWvzrKv6PpgAL26wwpiZYoWRtWmWwBGBXG9Jbo', 'solana')}>
                <div className="payment-card-header">
                  <h4>Cripto (Solana)</h4>
                  <span className="payment-badge crypto">SOL 🪙</span>
                </div>
                <div className="copy-field">
                  <code className="crypto-address">3YS3F9DW...</code>
                  <button className="copy-btn">
                    {copiedText === 'solana' ? <Check size={16} color="#00FF88" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="copy-instruction">Haz clic para copiar la dirección de Solana.</p>
              </div>
            </div>

            <div className="modal-footer">
              <p>¡Muchísimas gracias por apoyar el software independiente de alta calidad! 💚</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ahorro Lumínico LED (v0.9 Phase 3) */}
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

      {/* Modal de Contacto para Espacios Publicitarios (Sponsor Lead Capture Modal) */}
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
                  <h2 className="glow-text" style={{ color: '#00f0ff' }}>Futuro Espacio Publicitario</h2>
                  <p>Espacio de nutrición y dosificación de EC en riego.</p>
                </>
              ) : selectedAdSlotForContact.id === 'sponsor_esporas' ? (
                <>
                  <span style={{ fontSize: '3rem' }}>🌪️</span>
                  <h2 className="glow-text" style={{ color: '#FFD600' }}>Futuro Espacio Publicitario</h2>
                  <p>Espacio de climatización y control higrométrico en sala.</p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '3rem' }}>📢</span>
                  <h2 className="glow-text" style={{ color: '#00FF88' }}>{selectedAdSlotForContact.name}</h2>
                  <p>Espacio publicitario disponible para marcas del sector.</p>
                </>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '0.85rem' }}>
                <div>📍 <strong>Ubicación en App:</strong> <span style={{ color: '#00FF88' }}>{selectedAdSlotForContact.location}</span></div>
                <div>🏷️ <strong>Categoría del Espacio:</strong> {selectedAdSlotForContact.type}</div>
                <div>👤 <strong>Estado Comercial:</strong> {selectedAdSlotForContact.partnerActive ? 'Partner Demo Configurado' : 'Disponible para Patrocinio Directo'}</div>
                {selectedAdSlotForContact.partnerActive && (
                  <div>🏢 <strong>Marca Sugerida:</strong> {selectedAdSlotForContact.partnerName}</div>
                )}
              </div>
              <p style={{ margin: '15px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Este espacio publicitario está optimizado contextualmente. Aparece ante métricas específicas del cultivo del usuario (temperatura, DPV, conductividad del riego o estomas de la hoja), garantizando un impacto del 100% en la canopia decisoria de los cultivadores.
              </p>
            </div>

            <div style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
              <strong style={{ color: '#00FF88', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>📢 ¿Quieres publicitar tu marca aquí?</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Envíanos tu propuesta. Ofrecemos segmentación por geolocalización, estadísticas de clicks y cupones de descuento directos.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              <button 
                onClick={() => setIsSponsorModalOpen(false)}
                className="console-btn-glow"
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                Cerrar
              </button>
              
              <a 
                href={`mailto:administracion@dpvpro.com?subject=Consulta%20Publicidad%20DPV%20PRO%20-%20Slot%20${selectedAdSlotForContact.id}&body=Hola%20Administraci%C3%B3n%20de%20DPV%20PRO,%0A%0AEstoy%20interesado%20en%20patrocinar%20el%20espacio%20publicitario%20"${selectedAdSlotForContact.name}"%20en%20la%20secci%C3%B3n%20"${selectedAdSlotForContact.location}".%0A%0APor%20favor,%20env%C3%ADenme%20los%20detalles%20de%20tarifas%20y%20formatos.%0A%0ASaludos!`} 
                className="console-btn-glow"
                style={{ 
                  background: 'linear-gradient(135deg, #00FF88, #00D060)', 
                  color: '#050805', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📧 Enviar Correo de Consulta
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Límite de Perfiles Alcanzado (Plan Freemium) */}
      {showLimitWarning && (
        <div className="modal-overlay" onClick={() => setShowLimitWarning(false)}>
          <div className="modal-content glass glow-border premium-upgrade-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', border: '1px solid #FFD600' }}>
            <button className="close-modal-btn" onClick={() => setShowLimitWarning(false)}>
              <X size={20} />
            </button>
            <div className="modal-header" style={{ textAlign: 'center' }}>
              <Sparkles size={36} color="#FFD600" className="icon-pulse" style={{ marginBottom: '10px' }} />
              <h2 className="glow-text" style={{ color: '#FFD600', fontSize: '1.5rem' }}>¡Límite de Perfiles Alcanzado! ⭐</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Has alcanzado el límite de <strong>1 perfil</strong> permitido en la cuenta gratuita de DPV PRO.</p>
            </div>
            <div style={{ background: 'rgba(255, 214, 0, 0.05)', border: '1px solid rgba(255, 214, 0, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', lineHeight: 1.4 }}>
                Los cultivadores profesionales guardan docenas de configuraciones de sala para clonación, vegetación rápida, prefloración, engorde tardío y secado de precisión.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'left' }}>
              <strong style={{ color: '#FFD600' }}>Beneficios de DPV PRO Premium:</strong>
              <div>✨ Perfiles de sala <strong>ILIMITADOS</strong> en tu dispositivo.</div>
              <div>✨ Navegación <strong>INSTANTÁNEA</strong> (sin los 2.5s de carga termodinámica).</div>
              <div>✨ <strong>BLOQUEADOR DE ANUNCIOS</strong>: Interfaz 100% limpia de banners comerciales.</div>
              <div>✨ <strong>INSIGNIA DE PRECISIÓN</strong> dorada en tu header y reportes impresos.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              <button onClick={() => setShowLimitWarning(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
              <button onClick={() => { setShowLimitWarning(false); setActiveProTool('premium'); setView('pro'); }} style={{ background: 'linear-gradient(135deg, #FFE066, #F5B041)', border: 'none', color: '#050805', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Suscribirse Premium ⚡</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF Report Layout (v1.0 Enriched Grow Audit) */}
      {renderPrintReport()}

      {/* Overlay Intersticial Científico (Ads Optimizer) */}
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
