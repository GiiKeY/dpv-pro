/**
 * GENERAR_DEPOSITO_DNDA.JS - Script de Automatización Legal para DPV-PRO
 * ----------------------------------------------------------------------
 * Este script automatiza el empaquetado del código fuente de la aplicación,
 * excluyendo dependencias pesadas, calcula el Hash SHA-256 criptográfico para
 * el depósito en la DNDA (Dirección Nacional del Derecho de Autor) y genera
 * un certificado digital de autenticidad para el portal TAD (Trámites a Distancia).
 * 
 * Uso: node legal/generar_deposito_dnda.js
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Obtener rutas relativas compatibles con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const DEPOSITO_DIR = path.join(__dirname, 'deposito');
const ZIP_PATH = path.join(DEPOSITO_DIR, 'codigo_fuente_dpv_pro.zip');
const TEMP_ZIP_PATH = path.join(WORKSPACE_DIR, 'codigo_fuente_dpv_pro_temp.zip');
const CERT_PATH = path.join(DEPOSITO_DIR, 'certificado_dnda_hash.txt');

console.log('🤖 Inicializando empaquetado legal automatizado para DPV-PRO...');

// 1. Asegurar que la carpeta de depósito existe
if (!fs.existsSync(DEPOSITO_DIR)) {
  fs.mkdirSync(DEPOSITO_DIR, { recursive: true });
  console.log('📂 Creado directorio de salida: /legal/deposito/');
}

// Limpiar archivos previos en /legal/deposito antes de comprimir para evitar recursividad
if (fs.existsSync(ZIP_PATH)) {
  fs.unlinkSync(ZIP_PATH);
}
if (fs.existsSync(TEMP_ZIP_PATH)) {
  fs.unlinkSync(TEMP_ZIP_PATH);
}

// 2. Ejecutar la compresión nativa utilizando PowerShell de Windows (libre de dependencias)
try {
  console.log('📦 Comprimiendo archivos fuente (src, legal, package.json, index.html)...');

  // Compresión en archivo temporal externo en la raíz del espacio de trabajo
  const cmd = `powershell -Command "Compress-Archive -Path '${path.join(WORKSPACE_DIR, 'src')}', '${path.join(WORKSPACE_DIR, 'legal')}', '${path.join(WORKSPACE_DIR, 'package.json')}', '${path.join(WORKSPACE_DIR, 'index.html')}' -DestinationPath '${TEMP_ZIP_PATH}' -Force"`;
  
  execSync(cmd, { stdio: 'inherit' });
  
  // Mover el archivo ZIP temporal al destino final dentro de /legal/deposito/
  fs.renameSync(TEMP_ZIP_PATH, ZIP_PATH);
  console.log('✅ Archivo ZIP creado y reubicado con éxito.');

} catch (err) {
  // Asegurar limpieza de temp en caso de fallo
  if (fs.existsSync(TEMP_ZIP_PATH)) {
    fs.unlinkSync(TEMP_ZIP_PATH);
  }
  console.error('❌ Error al comprimir los archivos fuente:', err.message);
  process.exit(1);
}

// 3. Calcular el Hash SHA-256 del archivo ZIP
try {
  console.log('🔒 Calculando firma criptográfica SHA-256 del código fuente...');
  
  const fileBuffer = fs.readFileSync(ZIP_PATH);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  
  const sha256Hash = hashSum.digest('hex').toUpperCase();
  const fileSizeMb = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  
  console.log(`🔑 HASH SHA-256: ${sha256Hash}`);
  console.log(`📊 Tamaño del archivo: ${fileSizeMb} MB`);

  // 4. Generar el certificado de depósito legal
  const now = new Date();
  const fechaFormateada = now.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const certContent = `==========================================================================
CERTIFICADO DE HASH CRIPTOGRÁFICO - REGISTRO DE SOFTWARE INÉDITO (DNDA)
Proyecto: DPV-PRO / Desafío del Cultivador
Fecha de Emisión: ${fechaFormateada}
==========================================================================

Por medio del presente documento se certifica la huella digital criptográfica
del código fuente de la suite DPV-PRO y el simulador "Desafío del Cultivador",
empaquetado y firmado de forma automática para su depósito en custodia ante la
Dirección Nacional del Derecho de Autor (DNDA) bajo la Ley 11.723 de Propiedad Intelectual.

--------------------------------------------------------------------------
DETALLES DEL DEPÓSITO DIGITAL:
--------------------------------------------------------------------------
• Nombre del Archivo: codigo_fuente_dpv_pro.zip
• Ruta Física: ${ZIP_PATH}
• Tamaño de Obra: ${fileSizeMb} MB (${fileBuffer.length} bytes)
• Algoritmo de Firma: SHA-256
• HASH CRIPTOGRÁFICO (Huella Digital):
  👉 ${sha256Hash} 👈
--------------------------------------------------------------------------

INSTRUCCIONES PARA LA PRESENTACIÓN ANTE EL PORTAL TAD:
1. Ingrese a la plataforma Trámites a Distancia (TAD) con Clave Fiscal.
2. Inicie el trámite: "DNDA - Registro de Obra Inédita - Software".
3. En el campo 'Título de la Obra', ingrese: "DPV-PRO - Software de Simulación y Climatología".
4. En el campo 'Autor / Solicitante', ingrese sus datos personales completos.
5. Adjunte el archivo comprimido 'codigo_fuente_dpv_pro.zip' que se encuentra en su carpeta legal.
6. Copie e ingrese el HASH SHA-256 anterior en el campo de descripción/declaración jurada.
7. Guarde y conserve este archivo certificado de hash firmado como su acuse legal y técnico.

==========================================================================
FIRMA DIGITAL DEL CÓDIGO - AUTOGESTIÓN LEGAL DPV-PRO
Generado automáticamente por Antigravity AI
==========================================================================
`;

  fs.writeFileSync(CERT_PATH, certContent);
  console.log(`📄 Certificado de autenticidad escrito en: /legal/deposito/certificado_dnda_hash.txt`);
  
  // 4.5 Escribir el hash de forma dinámica para el dashboard de la Sombra 14 MaxMilton
  try {
    const shadowHashPath = path.join(__dirname, 'Sombra_14_MaxMilton', 'hash.js');
    const shadowHashContent = `// Archivo generado dinámicamente por el script legal:pack
window.CURRENT_HASH = "${sha256Hash}";
window.LAST_UPDATE = "${fechaFormateada.split(',')[0]}";
`;
    fs.writeFileSync(shadowHashPath, shadowHashContent);
    console.log(`🌑 Hash dinámico de la Sombra 14 MaxMilton actualizado en: /legal/Sombra_14_MaxMilton/hash.js`);
  } catch (shadowErr) {
    console.log('⚠️ Nota: No se pudo actualizar el hash dinámico en el dashboard de la Sombra 14 MaxMilton.');
  }

  // 5. Automatización Premium para Windows: Copiado automático al portapapeles
  try {
    const clipCmd = `powershell -Command "Set-Clipboard -Value '${sha256Hash}'"`;
    execSync(clipCmd);
    console.log('📋 ¡HASH SHA-256 copiado automáticamente al portapapeles! Listo para pegar (Ctrl+V) en tu declaración jurada en TAD.');
  } catch (clipErr) {
    console.log('⚠️ Nota: No se pudo copiar el Hash al portapapeles automáticamente. Cópialo de forma manual.');
  }

  // 6. Automatización Premium para Windows: Abrir la carpeta del depósito y el Dashboard en el Navegador
  try {
    console.log('📂 Abriendo la carpeta de depósito en el Explorador de Archivos...');
    execSync(`explorer.exe "${DEPOSITO_DIR}"`);
    
    console.log('🌑 Abriendo el Panel de Control Sombra 14 MaxMilton en tu Navegador Web...');
    const dashboardPath = path.join(__dirname, 'Sombra_14_MaxMilton', 'dashboard.html');
    execSync(`start "" "${dashboardPath}"`);
  } catch (expErr) {
    // Fallo silencioso si no se puede abrir el explorador o el navegador
  }

  console.log('\n🎉 ¡Proceso completado con éxito! Tu código está blindado, firmado y listo para registrar.');

} catch (err) {
  console.error('❌ Error al calcular el Hash o escribir el certificado:', err.message);
  process.exit(1);
}
