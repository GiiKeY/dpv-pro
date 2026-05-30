# 06 - Borrador de Declaración Jurada para Software DNDA (TAD)

Al registrar tu software inédito en la **DNDA** (Dirección Nacional del Derecho de Autor) de Argentina a través de la plataforma nacional de **Trámites a Distancia (TAD)**, deberás completar un formulario técnico electrónico y una Declaración Jurada descriptiva de la obra.

Aquí tienes el texto técnico exacto listo para **copiar y pegar** en los campos correspondientes de tu trámite digital.

---

## 📝 Campo 1: Descripción de la Obra y Memoria Técnica

*(Copiar y pegar en el campo de "Descripción", "Síntesis" o "Memoria Descriptiva del Software")*

> **Denominación del Software**: DPV-PRO / Desafío del Cultivador (Versión 1.1.0)
> 
> **Descripción Técnica General**:
> Se trata de una plataforma web interactiva y modular desarrollada en arquitectura de componentes declarativos (utilizando la librería React 19, JavaScript ES6+ y estilos en cascada CSS3). 
> 
> La aplicación se divide en dos entornos de software estrechamente acoplados:
> 1. **Suite de Cálculo (DPV-PRO)**: Un motor computacional diseñado para la estimación físico-matemática del microclima agrícola. Permite al usuario ingresar variables de entrada (temperatura en °C y Humedad Relativa en %) para calcular de forma precisa y dinámica el Déficit de Presión de Vapor (DPV) a nivel foliar y ambiental, determinando las zonas de transpiración vegetal óptimas y zonas críticas (estomas cerrados, riesgo de hongos).
> 2. **Simulador y Cubiflor Biológico ("Desafío del Cultivador")**: Un motor de juego educativo e interactivo basado en una cuadrícula lógica de 11x11 celdas y 40 casillas de recorrido. El sistema implementa un motor de Inteligencia Artificial local (con 4 arquetipos de bots con diferentes curvas de probabilidad de acierto) y una base de datos indexada de preguntas científicas con lógica de retroalimentación inmediata, orientada a evaluar y enseñar conceptos avanzados de biología, manejo climatológico y DPV en cultivos.
> 
> **Lenguajes y Tecnologías de Programación Utilizados**:
> * Front-End: JavaScript (ES6+), JSX (React.js v19), HTML5, CSS3 (Glassmorphic design).
> * Dependencias del Entorno: Lucide React (paquete de iconografía vectorial), Canvas Confetti (efectos visuales de partículas de alto rendimiento).
> * Entorno de empaquetado y Bundling: Vite.js, Node.js y módulos ES.
> 
> **Firma Digital Criptográfica de la Versión**:
> Para garantizar la integridad inalterable del código fuente depositado, se ha empaquetado la totalidad de los archivos fuente en un archivo comprimido único (`codigo_fuente_dpv_pro.zip`), cuyo hash de firma criptográfica calculado con el algoritmo SHA-256 es:
> **672F9399EEC462BCCF98BB23F0FBFB7379C1428C658BF2433F6A499F0D3B527F**

---

## 📝 Campo 2: Datos de Autores y Titulares

*(Completar según te solicite la plataforma TAD)*

* **Autor de la Obra**: Jon Braian Castro Maldonado (100% de autoría del diseño, guión del juego educativo, parámetros y estructuración de la suite).
* **Titular de los Derechos Patrimoniales**: Jon Braian Castro Maldonado.
* **Porcentaje de Participación**: 100%.
* **Carácter del Depósito**: Obra Inédita (Software - Código Fuente).

---

## 📂 Archivos a Adjuntar en el Trámite de TAD
Durante el flujo de la solicitud en TAD, te pedirán que adjuntes archivos obligatorios. Deberás subir únicamente:

1. El archivo **`codigo_fuente_dpv_pro.zip`** (que tu script `npm run legal:pack` creó automáticamente y guardó en tu carpeta `legal/deposito/`).
2. El archivo **`certificado_dnda_hash.txt`** (firmado digitalmente con los metadatos y el hash SHA-256).

---

## 🔒 Beneficio de esta Declaración Criptográfica
Al ingresar formalmente el **Hash SHA-256** dentro del expediente público electrónico de la DNDA:
* Creas una prueba científica y legal **indiscutible** de que en esta fecha exacta, tú poseías el código fuente con ese contenido exacto y exclusivo.
* Aunque en el futuro modifiques el código, este registro inédito resguarda las bases lógicas, diseños y arquitectura clave de tu modelo de negocio DPV-PRO contra cualquier copia o plagio de competidores.
* Es tu "seguro de vida" tecnológico.
