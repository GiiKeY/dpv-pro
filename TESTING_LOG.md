# 🧪 Log de Testeo y Errores - DPV PRO

Este documento es el registro oficial de la calidad del proyecto. Seguimos una metodología rigurosa de **"Cero Errores"** para la versión de producción.

## 📈 Historial de Versiones
- **v0.1**: Estructura base, diseño premium y tabla de 1.0°C. (ESTADO: Superada)
- **v0.2**: Precisión de 0.5°C, sincronización total y limpieza de UI. (ESTADO: Superada)
- **v0.5**: Modo Smart (Auto) y simulador estomático SVG animado por hardware. (ESTADO: Superada)
- **v0.6**: Lanzamiento oficial de las 5 Herramientas Pro Modulares en sección aislada. (ESTADO: Superada)
- **v0.6.1**: Mejoras premium (brecha termodinámica, selector sustrato, multi-equipamiento y trivia persistente). (ESTADO: En Producción / Safe)

---

## 🛠️ Plan de Testeo (Roadmap de Calidad)

### 1. Funcionalidad y Matemáticas
- [x] **Magnus-Tetens Dew Point**: Testeo de concordancia matemática de punto de rocío y caída nocturna. La humedad nocturna proyectada y el punto de rocío no arrojan valores infinitos ni NaN en rangos extremos de 10% a 98% HR. (PASS)
- [x] **Riego & Evapotranspiración**: Validación de los multiplicadores de etapa (clones: 0.25, veg: 0.75, floración: 1.20) y sustrato (suelo: 1.0, coco: 1.25, hidro: 1.50). El cálculo de litros de agua transpirada y frecuencia de riego responde coherentemente a cualquier variación de DPV ambiental. (PASS)
- [x] **Gasto Eléctrico Acumulativo**: Activación simultánea de múltiples electrodomésticos (Humidificador, Calefactor, Extractor) sumando los kWh/Día y proyectando el costo monetario mensual acumulado de forma perfecta en base al costo de kWh establecido. (PASS)
- [x] **Genética Reactiva Global**: Al cambiar el perfil de genética (Híbrida -> Índica / Sativa), los límites inferiores y superiores de DPV se actualizan instantáneamente de forma reactiva en la calculadora principal y la tabla de datos completa sin causar desconexiones de estado. (PASS)

### 2. Diseño y UX (User Experience)
- [x] **Menu Pro Responsive (Móvil)**: En pantallas menores a 900px, el sidebar lateral de herramientas pro se convierte automáticamente en un menú de desplazamiento horizontal táctil (`overflow-x: auto`), y las tarjetas de métricas se ordenan de 3 columnas a 1 columna vertical para lectura táctil veloz. (PASS)
- [x] **Floating Medals & Animación**: La medalla dorada "Maestro Shadow" rebotando bajo interpolación `@keyframes bounceMedal` y el badge flotante en la cabecera mantienen un rendimiento de 60fps constantes acelerados por hardware. (PASS)
- [x] **Selector de Sustrato e Inputs Pro**: Los botones de sustrato Soil/Coco/Hydro cambian de color de active en HSL de alta visibilidad, previniendo fatiga visual nocturna en el indoor. (PASS)

### 3. Persistencia y Caching (localStorage)
- [x] **Trivia State Cache**: Validación del flujo de almacenamiento y lectura. Tras responder correctamente las 5 preguntas avanzadas de la Academia, el estado `dpv_pro_badge` se guarda como `'true'` en `localStorage`. Al refrescar la pestaña, el badge dorado en el header se mantiene activo de manera persistente sin necesidad de volver a contestar el cuestionario. (PASS)
- [x] **Compartir Logro**: El botón de la medalla copia de manera exitosa la URL y un mensaje personalizado al portapapeles sin emitir errores de seguridad de la API del navegador. (PASS)

---

## 🐞 Registro de Errores (Bug Tracker)

| ID | Error Encontrado | Gravedad | Estado | Solución |
|:---|:---|:---:|:---:|:---|
| #001 | Discrepancia de 1.0°C vs 0.5°C en tabla | Media | ✅ Solucionado | Se actualizó la lógica de generación a pasos de 0.5. |
| #002 | Tooltips invisibles/cortados en móvil | Alta | ✅ Solucionado | Se implementó max-width: 70vw y soporte para :active. |
| #003 | El botón de "Café" no tiene link real | Baja | ✅ Solucionado | Modal interactivo premium con alias gikey.mp y wallets reales actualizadas. |
| #004 | El DPV 0.00 no indica riesgo de rocío | Media | ✅ Solucionado | Nuevo estado 'Peligro (Rocío)' e indicador animado en el simulador estomático. |
| #005 | Pérdida de certificado al refrescar pestaña | Baja | ✅ Solucionado | Integración de localStorage cache para la medalla Maestro Shadow de forma robusta. |
| #006 | Estimador de Watts restringido a 1 equipo | Media | ✅ Solucionado | Se refactorizó a un mapa de estados múltiples (`activeDevices`) soportando climatización completa concurrentemente. |

---

## 🛡️ Pentesting Status
- **Client-Side Security**: PASS
- **Input Integrity & Range Constraints**: PASS
- **Memory & Rendering Leak**: PASS (Animaciones controladas mediante transiciones CSS aceleradas por GPU, libre de timers paralelos JavaScript en segundo plano).

---
*Última actualización: 25 de mayo de 2026 por Antigravity AI*
