# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Actualización:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice General de Tareas Resueltas (20 Tareas)

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
| **BE-27** | Bloque 8 | `P1 - Alta` | Back / Telegram Bot | Búsquedas indexadas con claves normalizadas (`placaNorm`, `rutaNorm`, `razonSocialNorm`) | `d27db99` | `Done` |
| **BE-26** | Bloque 8 | `P1 - Alta` | Hosting / DB | Declaración y versionado de índices compuestos y TTL en `firestore.indexes.json` | `d27db99` | `Done` |
| **CR-01** | Bloque 2 | `P1 - Alta` | Cruces / Auth | Escalonar alta de cuenta centralizada con Cloud Function (unificación Email y Google) | `cbd206b` | `Done` |
| **BE-01** | Bloque 2 | `P1 - Alta` | Back / Auth | Cloud Function callable `validarAltaUsuario` con Admin SDK, Custom Claims y términos | `cbd206b` | `Done` |
| **BE-03** | Bloque 2 | `P1 - Alta` | Reglas / Seguridad | Validación simétrica de esquema y límites en `update` y `create` en `firestore.rules` | `cbd206b` | `Done` |
| **BE-16** | Bloque 2 | `P0 - Bloqueante` | Hosting / CDN | CSP en modo reporte (`Content-Security-Policy-Report-Only`) y fix COOP en Vercel/Firebase | `cbd206b` | `Done` |
| **BE-06** | Bloque 1 | `P0 - Bloqueante` | Back / Seguridad | Invertir a fail-closed en webhook `botNavira` (403 si falta secret, 405 en no-POST, `cors: false`) | `71ee5d6` | `Done` |
| **BE-05** | Bloque 1 | `P0 - Bloqueante` | Back / Infra | Montaje explícito de secretos en Cloud Run (`botNavira`), manejo dinámico y tests unitarios | `71ee5d6` | `Done` |
| **BE-04** | Bloque 1 | `P0 - Bloqueante` | Reglas / Seguridad | `allow get` en vez de `read` para `codigos_beta` en `firestore.rules` (evita filtración REST) | `71ee5d6` | `Done` |
| **BE-25** | Bloque 6 | `P0 - Bloqueante` | Back / Infra | Corrección de runtime Node.js 20 LTS en `functions/package.json` | `f74ca3d` | `Done` |
| **BE-31** | Bloque 6 | `P2 - Media` | Back / Infra | Contención y límites de recursos en `botNavira` (`maxInstances`, memoria, timeout) | `6678c69` | `Done` |
| **BE-32** | Bloque 6 | `P1 - Alta` | Back / Telegram | Control de idempotencia atómico con `update_id` en webhook | `45cd505` | `Done` |
| **BE-28** | Bloque 8 | `P2 - Media` | Back / DB | Campo `expiraEn` con política de TTL nativo de Cloud Firestore para sesiones | `50cdaa8` | `Done` |
| **BE-30** | Bloque 9 | `P2 - Media` | Front / Infra | Optimización de empaquetado Vite con `manualChunks` (división de vendors) | `a3d8434` | `Done` |
| **BE-34** | Bloque 9 | `P3 - Baja` | Back / CDN | Cabeceras de cache inmutable y compresión en CDN (Vercel y Firebase Hosting) | `58c04f3` | `Done` |
| **BE-29** | Bloque 7 | `P1 - Alta` | Back / DB | Generación atómica transaccional de consecutivos de cobro en servidor | `a6f1ea8` | `Done` |
| **CR-20** | Bloque 7 | `P1 - Alta` | Cruces / Cobros | Emisión atómica de cuentas de cobro coordinada con transacción de Firestore | `a6f1ea8` | `Done` |
| **BE-33** | Bloque 7 | `P1 - Alta` | Back / DB | Escrituras atómicas (`writeBatch`) en sincronización de mantenimiento y vehículo | `a6f1ea8` | `Done` |
| **CR-17** | Bloque 7 | `P1 - Alta` | Cruces / Back | Actualización centralizada de odómetro mediante Cloud Function Trigger | `0541415` | `Done` |
| **CR-16** | Bloque 7 | `P0 - Bloqueante` | Cruces / DB | Desacople y migración de arrays embebidos a subcolecciones (evita tope de 1 MiB) | `0541415` | `Done` |

---

## Detalle Técnico de Soluciones Implementadas

### Bloque 8: Optimización de Red y Consultas

#### 1. [BE-27] Búsquedas Indexadas por Clave Normalizada en Telegram Bot y Frontend
* **Problema:** En `functions/index.js`, las funciones `buscarVehiculo`, `buscarMemoriaRuta` y `buscarEmpresa` descargaban colecciones enteras con `.get()` (e incluso hasta 200 viajes ordenados por fecha) e iteraban linealmente en JavaScript en cada mensaje de Telegram. Esto consumía cientos de lecturas de Firestore por interacción elevando costos y latencia.
* **Archivos Modificados:** `functions/index.js`, `src/hooks/useFirestore.js`.
* **Solución Técnica:**
  * Se implementaron claves normalizadas (`placaNorm`, `rutaNorm`, `razonSocialNorm`) al guardar registros tanto desde la web como desde Telegram.
  * Se refactorizaron las búsquedas para consultar directamente contra índices de Firestore con `.limit(1)`:
    * `buscarVehiculo`: `.where("placaNorm", "==", placa).limit(1)`.
    * `buscarMemoriaRuta`: consulta indexada a rutas frecuentes y viajes históricos por `rutaNorm`.
    * `buscarEmpresa`: `.where("razonSocialNorm", "==", norm).limit(1)`.
  * Se mantuvieron fallbacks acotados con auto-reparación en segundo plano para registros legacy. El consumo de lecturas se redujo de más de 200 a solo 1 lectura por búsqueda.
* **Commit:** `d27db99` | **Notion:** `Done`

#### 2. [BE-26] Archivo Oficial de Índices Compuestos y TTL (`firestore.indexes.json`)
* **Problema:** `firebase.json` no declaraba archivo de índices de Firestore. Consultas compuestas indispensables (como viajes filtrados por placa/vehículo y ordenados por fecha descendente, o cartera por estado de pago) corrían el riesgo de fallar en producción con errores `FAILED_PRECONDITION` por falta de índice compuesto.
* **Archivos Modificados:** `firestore.indexes.json`, `firebase.json`.
* **Solución Técnica:**
  * Se creó y versionó [`firestore.indexes.json`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firestore.indexes.json) definiendo 10 índices compuestos esenciales para `viajes`, `cuentas_cobro`, `mantenimiento` y `gastos_vehiculo`.
  * Se vincularon las políticas de TTL para purga automática en `telegram_sesiones` y `telegram_updates` sobre el campo `expiraEn`.
  * Se vinculó en `firebase.json` bajo la clave `"indexes": "firestore.indexes.json"`.
* **Commit:** `d27db99` | **Notion:** `Done`

---

### Bloque 2: Eliminar Superficie de Ataque

#### 3. [BE-01] y [CR-01] Cloud Function Callable para Alta Segura de Cuenta y Escalonamiento
* **Problema:** Validación de código beta en cliente y riesgo de cuentas huérfanas en Google Sign-In.
* **Archivos Modificados:** `functions/index.js`, `src/firebase.js`, `src/hooks/useAuth.js`, `functions/test/auth.test.js`.
* **Solución Técnica:** Cloud Function callable `validarAltaUsuario` con Admin SDK, Custom Claims y purga atómica de usuarios no autorizados.
* **Commit:** `cbd206b` | **Notion:** `Done`

#### 4. [BE-03] Validación Simétrica de Esquema y Tamaño en `Update`
* **Problema:** Subcolecciones de usuarios sin validación en operaciones de edición (`update`).
* **Archivos Modificados:** `firestore.rules`.
* **Solución Técnica:** Validadores estrictos por colección aplicados en `allow create, update`.
* **Commit:** `cbd206b` | **Notion:** `Done`

#### 5. [BE-16] CSP en Modo Reporte y Corrección COOP en Hosting/CDN
* **Problema:** Sin Content Security Policy y errores de bloqueo COOP en Google Sign-in.
* **Archivos Modificados:** `vercel.json`, `firebase.json`.
* **Solución Técnica:** Cabeceras `Content-Security-Policy-Report-Only` y `Cross-Origin-Opener-Policy: same-origin-allow-popups`.
* **Commit:** `cbd206b` | **Notion:** `Done`

---

### Bloque 1: Cerrar la Puerta (Reglas y Control de Acceso)

#### 6. [BE-06] Invertir a Fail-Closed en Webhook `botNavira`
* **Problema:** Condición fail-open permitía llamadas anónimas si `TELEGRAM_SECRET` no estaba definido.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** `cors: false`, filtro estricto POST (405) y validación fail-closed con 403 Forbidden.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 7. [BE-05] Montar Secretos en Cloud Run (`botNavira`) y Test de Despliegue
* **Problema:** Variables de Secret Manager no montadas en Cloud Run.
* **Archivos Modificados:** `functions/index.js`, `functions/package.json`, `functions/test/botNavira.test.js`.
* **Solución Técnica:** `secrets: ["TELEGRAM_SECRET", "TELEGRAM_TOKEN"]`, getters dinámicos y tests unitarios.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 8. [BE-04] `allow get` en vez de `read` para `codigos_beta`
* **Problema:** `allow read` permitía enumerar la colección vía REST anónimo y extraer el código beta.
* **Archivos Modificados:** `firestore.rules`, `firebase.json`.
* **Solución Técnica:** `allow get: if true; allow list, write: if false;` en `firestore.rules`.
* **Commit:** `71ee5d6` | **Notion:** `Done`

---

### Bloques 6, 7, 8 y 9: Infraestructura, DB, CDN y Rendimiento
*(Ver historial completo de commits `f74ca3d`, `6678c69`, `45cd505`, `50cdaa8`, `a3d8434`, `58c04f3`, `a6f1ea8`, `0541415` con odómetro atómico, consecutivos transaccionales, writeBatch, TTL en sesiones y migración de subcolecciones).*

---

### Verificación de Repositorio
* **Rama de trabajo:** `Cambios-Dev-Caliche`
* **Rama de producción:** `main` (intacta, 0 commits fusionados)
* **Verificación remota:** Todos los commits respaldados en GitHub:  
  👉 https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche
