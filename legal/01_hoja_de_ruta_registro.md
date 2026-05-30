# 01 - Hoja de Ruta de Registro: INPI, DNDA y Dominios

Esta guía detalla el procedimiento operativo paso a paso para formalizar la propiedad legal de tus marcas comerciales, registrar el código de software del proyecto ante las autoridades nacionales y asegurar el control exclusivo de tus dominios en la web.

---

## 🏷️ Fase 1: Registro de Marca (INPI - Instituto Nacional de la Propiedad Industrial)

El registro de la marca te otorga el derecho de propiedad sobre el nombre y logo, impidiendo que competidores utilicen denominaciones idénticas o similares que confundan a tu público.

### 1. Búsqueda de Antecedentes (Obligatorio)
Antes de pagar cualquier trámite, debes verificar que el nombre no esté registrado por otra persona.
* **Acción**: Ingresa al portal de marcas del INPI de tu país (ej. `portaldetramites.inpi.gob.ar` en Argentina).
* **Búsqueda**: Utiliza el buscador fonético y de denominación para rastrear nombres similares.
* **Búsqueda de Logo**: Rastrear marcas mixtas o figurativas similares.

### 2. Clasificación del Nomenclador de Niza
Las marcas se registran por "Clases" internacionales según el rubro. Para **DPV-PRO** y el juego **"Desafío del Cultivador"**, las clases clave a registrar son:
* **Clase 9**: Software, aplicaciones móviles, simuladores virtuales y calculadoras digitales (esencial para la suite DPV-PRO y el motor del juego).
* **Clase 41**: Educación, academia en línea, formación agronómica y servicios de entretenimiento (juegos de tablero educativos).
* **Clase 42**: Servicios tecnológicos de software como servicio (SaaS), consultoría técnica en climatología agrícola y análisis de datos.

### 3. Presentación de la Solicitud
* **Modalidad**: Completar el trámite en línea en la web del INPI mediante firma digital/cuenta fiscal.
* **Requisitos**:
  * Datos del titular (puedes registrarla a tu nombre personal y luego transferirla a una sociedad comercial/S.R.L./S.A.S. en el futuro).
  * Tipo de Marca: **Mixta** (Nombre + Logotipo gráfico). Deberás subir el archivo del logo en alta resolución.
  * Detalle de productos/servicios según las clases elegidas.
* **Proceso de Oposición**: Una vez presentada, la marca se publica en el boletín oficial durante 30 días para que terceros opinen. Si no hay oposiciones y pasa el examen de fondo de los inspectores, la marca se concede por **10 años** (renovable infinitamente).

---

## 🫙 Fase 2: Registro de Software y Derecho de Autor (DNDA)

El código fuente y objeto del software se protege bajo la **Ley de Propiedad Intelectual** (Ley 11.723 en Argentina). Otorga presunción legal de autoría con fecha cierta.

### 1. Preparación del Depósito de Software Inédito
Para registrar tu desarrollo en la DNDA, debes depositar una muestra del código para que quede sellada y lacrada en custodia segura.
* **Acción**: Comprimir en un archivo ZIP:
  * El código fuente principal de la aplicación (`src/`, `App.jsx`, `components/`, etc.).
  * Capturas de pantalla de la interfaz de usuario (UI) y diagramas del flujo lógico.
  * Un archivo de texto `LEEME.txt` con la descripción del programa, lenguajes utilizados (React, CSS, JavaScript) e instrucciones de uso.
* **Seguridad**: Para mayor protección, puedes calcular el hash SHA-256 del archivo ZIP del código y adjuntarlo en la descripción.

### 2. Trámite Digital (TAD - Trámites a Distancia)
Actualmente, el registro se realiza de manera 100% digital:
* **Paso A**: Ingresa al portal de **Trámites a Distancia (TAD)** con tu clave fiscal.
* **Paso B**: Busca el trámite: **"DNDA - Registro de Obra Inédita - Software"**.
* **Paso C**: Completa el formulario con los datos de los autores y titulares (100% a tu nombre).
* **Paso D**: Sube el archivo ZIP del código fuente como documento adjunto. El sistema lo encriptará y sellará automáticamente.
* **Paso E**: Abonar la tasa de registro (es sumamente económica, un pago único de muy bajo costo).
* **Paso F**: El sistema emitirá una **Carátula de Expediente Electrónico** que sirve como tu certificado oficial de depósito de software inédito ante la nación.

---

## 🌐 Fase 3: Protección y Control de Dominios Web

Los nombres de dominio no son marcas, pero representan tus activos digitales críticos en la red. Debes controlarlos exclusivamente para evitar la ciberocupación, extorsiones o suplantaciones de identidad.

### 🇦🇷 1. Registro de Dominio Local (.com.ar) en NIC Argentina (Paso a Paso)
NIC Argentina es el organismo gubernamental que administra la zona `.ar`. El trámite se vincula directamente a tu CUIT/CUIL a través de la AFIP por seguridad.

*   **Paso A: Ingreso a la plataforma**
    *   Ingresa a la web oficial: [nic.ar](https://nic.ar).
    *   Haz clic en el botón superior **"Registrar"**.
    *   El sistema te redirigirá automáticamente a la plataforma de **Trámites a Distancia (TAD)**.
    *   Inicia sesión seleccionando la opción **"AFIP"** e ingresando con tu **CUIT/CUIL** y **Clave Fiscal** (Nivel 2 o superior).
*   **Paso B: Búsqueda de disponibilidad**
    *   Una vez dentro de TAD, verás el panel de NIC Argentina.
    *   Escribe en el buscador: `dpv-pro` y en la extensión selecciona `.com.ar`.
    *   Presiona **"Consultar"**. El sistema verificará de forma instantánea si el nombre está libre.
*   **Paso C: Solicitud de registro**
    *   Si el nombre está disponible, el sistema habilitará el botón **"Registrar"**. Haz clic en él.
    *   Confirma tus datos personales (los cuales deben coincidir con tus registros de AFIP).
    *   Presiona **"Confirmar Trámite"**.
*   **Paso D: Pago de la tasa anual**
    *   TAD generará una liquidación de pago.
    *   Puedes abonar la tasa anual (que en Argentina es de costo sumamente accesible) utilizando **tarjeta de crédito**, **PagoMisCuentas**, **Link Pagos** o generando un **VEP** (Volante Electrónico de Pago) para pagar desde tu Home Banking.
    *   Una vez acreditado el pago (tarjeta de crédito es instantáneo; VEP o PagoMisCuentas puede demorar 24-48 horas), recibirás un correo electrónico de confirmación de registro y el dominio figurará activo a tu nombre en tu panel de control de NIC.ar.

---

### 🌐 2. Registro de Dominio Global (.com) en Cloudflare Registrar (Paso a Paso)
Para tu proyección internacional y la suite en la nube de DPV-PRO, debes poseer el dominio `.com`. Te recomendamos utilizar **Cloudflare Registrar** ya que vende los dominios a "precio de costo mayorista" sin cargos sorpresas anuales ni tarifas de intermediarios, y cuenta con la infraestructura de DNS más rápida del planeta.

*   **Paso A: Crear tu cuenta en Cloudflare**
    *   Ingresa a [cloudflare.com](https://cloudflare.com) y regístrate con tu correo electrónico principal y una contraseña segura.
    *   Activa la verificación de dos factores (2FA) en la configuración de seguridad para evitar que nadie pueda acceder a tus dominios.
*   **Paso B: Buscar y adquirir el dominio**
    *   En el panel lateral izquierdo, haz clic en **"Domain Registration"** y luego en **"Register Domains"**.
    *   Escribe `dpv-pro.com` en la barra de búsqueda y presiona Enter.
    *   El sistema te mostrará que está disponible y su costo anual exacto de costo mayorista.
    *   Haz clic en **"Yes, Register"** para agregarlo al carrito de compras.
*   **Paso C: Configuración de Privacidad de WHOIS (Crucial)**
    *   Cloudflare incluye la **Privacidad de WHOIS de forma 100% gratuita** por defecto.
    *   Completa el formulario de datos de contacto del titular del dominio (Nombre completo, Dirección, Teléfono).
    *   *Nota de seguridad:* Gracias a la privacidad activa, Cloudflare enmascarará estos datos con información genérica. Nadie que busque quién es el dueño de `dpv-pro.com` podrá ver tu dirección o tu teléfono personal en internet, evitando correos de spam, intentos de phishing o estafas.
*   **Paso D: Confirmación y Pago**
    *   Ingresa tu método de pago (soporta tarjeta de crédito/débito internacional o cuenta de PayPal).
    *   Confirma la transacción. ¡Listo! El dominio se configurará automáticamente.
*   **Paso E: Bloqueo de Transferencia (Transfer Lock)**
    *   En el panel de control del dominio en Cloudflare, asegúrate de que la opción **"Registrar Lock / Transfer Lock"** figure como **Enabled (Activo)**. Esto impide que cualquier entidad intente transferir o robar tu dominio a otra cuenta sin tu consentimiento explícito.

---

### 📧 3. Integración de Google Workspace (Tu Correo Corporativo Premium)
Tener contratado **Google Workspace** es una excelente inversión estratégica y es ideal para integrarlo con tu nuevo dominio `.com`.

*   **¿Para qué sirve?**
    Una vez que compres el dominio `dpv-pro.com`, puedes configurar Google Workspace para crear cuentas de correo corporativas con tu propia marca (ej: `contacto@dpv-pro.com` o `soporte@dpv-pro.com`).
*   **Cómo se vincula:**
    1. En tu panel de Google Workspace, ve a la sección de "Dominios" y agrega `dpv-pro.com`.
    2. Google te dará unos registros de texto llamados **registros MX (Mail Exchange)** y un código de verificación **TXT**.
    3. Vas al panel de control de tu dominio en Cloudflare, entras a la sección **"DNS"** y agregas esos registros tal como te los dio Google.
    4. En 10 minutos, tus correos corporativos estarán activos utilizando la plataforma de Gmail pero bajo la marca profesional de tu empresa. Esto es vital para transmitir confianza y profesionalismo a Grow Shops y patrocinadores cuando salgamos a vender.

---

## 📋 Checklist Definitivo de Estado Legal (DPV-PRO)

Este tablero te permite controlar en qué estado se encuentra cada trámite de tu blindaje legal en Argentina y el mundo:

| Pilar Legal | Acción / Trámite | Estado Técnico | Estado Administrativo | Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **Código Fuente** | Licencia Comercial `LICENSE` | 🟢 Completado | 🟢 Activo en Repositorio | Monarca / Antigravity |
| **Código Fuente** | Empaquetado y Firma Criptográfica SHA-256 | 🟢 Completado | 🟢 Generado por Script | Monarca / Antigravity |
| **Código Fuente** | Inscripción Obra Inédita (DNDA) en TAD | 🟢 Completado | 🟢 Expediente: EX-2026-53709377-APN-DNDA#MJ ✅ | Monarca / Antigravity |
| **Marca Comercial**| Registro de Marca DPV-PRO (INPI Clases 9, 41, 42)| 🟢 Borradores Listos| 🔴 Pendiente de presentación | Monarca (Manual con Clave Fiscal) |
| **Activos Web** | Compra de Dominio Local `dpv-pro.com.ar` | 🟢 Completado | 🟢 Dominio Registrado ✅ | Monarca |
| **Activos Web** | Compra de Dominio Global `dpv-pro.com` | 🟢 Tutorial Listo | 🔴 Pendiente de compra | Monarca (Manual en Cloudflare) |
| **Colaboradores** | Contrato de Desarrollo y NDA (Futuro) | 🟢 Plantilla Lista | 🟢 Listo para firmar | Monarca |
| **Usuarios Web** | Términos de Servicio y Privacidad | 🟢 Plantilla Lista | 🔴 Pendiente de subir a Web | Monarca |

---

## 📅 Resumen del Plan de Acción Legal Operativo

1.  **Paso 1**: Correr `npm run legal:pack` para empaquetar el código fuente actualizado y copiar la firma SHA-256 en tu portapapeles.
2.  **Paso 2**: Entrar a **TAD** e inscribir la obra de software en la **DNDA** pegando la DDJJ técnica y subiendo el ZIP firmado.
3.  **Paso 3**: Dominio `dpv-pro.com.ar` registrado y publicado con éxito en NIC Argentina el 30/05/2026. ✅
4.  **Paso 4**: Registrar `dpv-pro.com` en **Cloudflare** y configurar tu correo corporativo en **Google Workspace**.
5.  **Paso 5**: Presentar tu solicitud de marca en las 3 clases clave en el **INPI**.

