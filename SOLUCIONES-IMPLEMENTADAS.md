# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Inicio:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice de Tareas Implementadas

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
| **BE-25** | Bloque 6 | `P0 - Bloqueante` | Back / Infra | Corrección de runtime Node.js 20 LTS en `functions/package.json` | `f74ca3d` | `Done` |
| **BE-31** | Bloque 6 | `P2 - Media` | Back / Infra | Contención y límites de recursos en `botNavira` (`maxInstances`, memoria, timeout) | `6678c69` | `Done` |
| **BE-32** | Bloque 6 | `P1 - Alta` | Back / Telegram | Control de idempotencia atómico con `update_id` en webhook | `45cd505` | `Done` |
| **BE-28** | Bloque 8 | `P2 - Media` | Back / DB | Campo `expiraEn` con política de TTL nativo de Cloud Firestore para sesiones | `50cdaa8` | `Done` |
| **BE-30** | Bloque 9 | `P2 - Media` | Front / Infra | Optimización de empaquetado Vite con `manualChunks` (división de vendors) | `a3d8434` | `Done` |
| **BE-34** | Bloque 9 | `P3 - Baja` | Back / CDN | Cabeceras de cache inmutable y compresión en CDN (Vercel y Firebase Hosting) | `58c04f3` | `Done` |

---

## Detalle Técnico de Soluciones (Bloque 6, 8 y 9)

### 1. [BE-25] Runtime Node.js 20 LTS en Cloud Functions
* **Problema:** `functions/package.json` declaraba `"engines": { "node": "24" }`. Google Cloud Functions para Firebase no soporta Node 24, lo que provocaba que cualquier build o despliegue fallara inmediatamente con error fatal.
* **Archivos Modificados:** `functions/package.json`.
* **Solución Técnica:** Se fijó a `"engines": { "node": "20" }`, versión oficial LTS soportada por Firebase Cloud Functions v2 y compatible con `firebase-admin ^13.6.0` y `firebase-functions ^7.0.0`.
* **Commit:** `f74ca3d` | **Notion:** `Done`

### 2. [BE-31] Límites de Escalado, Memoria y Timeout en `botNavira`
* **Problema:** La función Cloud `botNavira` carecía de restricciones de escalado y recursos. En picos de tráfico de Telegram o ataques de denegación de servicio, podía escalar cientos de contenedores desbordando la facturación en Google Cloud.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Se especificaron parámetros defensivos en `onRequest`:
  * `maxInstances: 10`: Techo máximo de concurrencia de contenedores.
  * `memory: "256MiB"`: Memoria ajustada al consumo real del parser de texto.
  * `timeoutSeconds: 30`: Cierre forzoso de sockets colgados.
* **Commit:** `6678c69` | **Notion:** `Done`

### 3. [BE-32] Control de Idempotencia en Webhook de Telegram
* **Problema:** Ante latencias de red, Telegram reintenta el webhook enviando el mismo `update_id`. El bot procesaba el mensaje múltiples veces, generando viajes duplicados y fletes dobles en Firestore.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Se implementó una guarda atómica previa al procesamiento:
  ```javascript
  const updateRef = db.doc(`telegram_updates/${update.update_id}`);
  await updateRef.create({
    procesadoEn: new Date().toISOString(),
    chatId: update.message?.chat?.id || null,
    expiraEn: new Date(Date.now() + 2 * 60 * 60 * 1000)
  });
  ```
  Si el documento ya existe (`err.code === 6 / ALREADY_EXISTS`), se aborta el flujo respondiendo `200 OK` de inmediato sin re-ejecutar lógica de negocio.
* **Commit:** `45cd505` | **Notion:** `Done`

### 4. [BE-28] Política de TTL Nativo en Firestore para `telegram_sesiones`
* **Problema:** Las sesiones conversacionales incompletas o abandonadas quedaban retenidas indefinidamente en la base de datos de producción.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Se añadió `expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000)` en `setSesion` y `resetViaje`. Con esto, la política TTL nativa de Cloud Firestore purga automáticamente documentos vencidos sin costos de Cloud Functions.
* **Commit:** `50cdaa8` | **Notion:** `Done`

### 5. [BE-30] Optimización de Empaquetado Vite con `manualChunks`
* **Problema:** Todas las librerías externas (`firebase`, `lucide-react`, `react-router`) se empaquetaban en un solo bundle monolítico. Cualquier corrección mínima en el código forzaba al usuario móvil a volver a descargar todo el framework.
* **Archivos Modificados:** `vite.config.js`.
* **Solución Técnica:** Se configuró Rollup para división inteligente de vendors en `manualChunks`:
  * `vendor-firebase`: SDK de Firebase.
  * `vendor-lucide`: Iconografía.
  * `vendor-react`: React, React-DOM y React-Router.
  * `chunkSizeWarningLimit: 650`.
* **Commit:** `a3d8434` | **Notion:** `Done`

### 6. [BE-34] Cabeceras de Cache Inmutable y Compresión en CDN
* **Problema:** `vercel.json` forzaba `no-cache, no-store, must-revalidate` en `/assets/(.*)`, destruyendo la caché del navegador para archivos versionados por hash.
* **Archivos Modificados:** `vercel.json`, `firebase.json`.
* **Solución Técnica:**
  * `/assets/**`: `Cache-Control: public, max-age=31536000, immutable`.
  * Fuentes tipográficas y SVGs: `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`.
  * `/index.html`: `no-cache, must-revalidate` para forzar refresco inmediato del punto de entrada ante nuevos releases.
* **Commit:** `58c04f3` | **Notion:** `Done`

---

*(Este documento se actualizará continuamente a medida que se completen las tareas del Bloque 7 de Integridad de Base de Datos).*
