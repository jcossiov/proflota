# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Actualización:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice General de Tareas Resueltas (14 Tareas)

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
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

### Bloque 1: Cerrar la Puerta (Reglas y Control de Acceso)

#### 1. [BE-06] Invertir a Fail-Closed en Webhook `botNavira`
* **Problema:** En `functions/index.js`, la condición original `if (process.env.TELEGRAM_SECRET && secretRecibido !== process.env.TELEGRAM_SECRET)` operaba en modo *fail-open*: si la variable de entorno no estaba inyectada o estaba vacía, la condición evaluaba en falso y cualquier atacante podía enviar peticiones HTTP no autenticadas ejecutando lógica sobre la base de datos. Adicionalmente, `cors: true` habilitaba innecesariamente llamadas cross-origin desde navegadores, y no se filtraba el método HTTP.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:**
  * Se configuró `cors: false` en las opciones de `onRequest`.
  * Se añadió filtro estricto de método HTTP: peticiones no `POST` retornan inmediatamente `405 Method Not Allowed`.
  * Se implementó lógica estricta fail-closed:
    ```javascript
    const expectedSecret = process.env.TELEGRAM_SECRET;
    const secretRecibido = req.get("X-Telegram-Bot-Api-Secret-Token");
    if (!expectedSecret || !secretRecibido || secretRecibido !== expectedSecret) {
      return res.status(403).send("Forbidden");
    }
    ```
    Si el secreto no está configurado en el servidor, si la petición no incluye la cabecera o si el token no coincide, se rechaza de inmediato con `403 Forbidden`.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 2. [BE-05] Montar Secretos en Cloud Run (`botNavira`) y Test de Despliegue
* **Problema:** En Firebase Functions v2, las variables gestionadas con Google Cloud Secret Manager no se cargan automáticamente a menos que se declaren en el manifiesto de la función. Además, leer `const TOKEN = process.env.TELEGRAM_TOKEN` de manera estática al importar el archivo provocaba que el token quedara como `undefined` si el contenedor montaba el secreto en tiempo de ejecución.
* **Archivos Modificados:** `functions/index.js`, `functions/package.json`, `functions/test/botNavira.test.js`.
* **Solución Técnica:**
  * Se agregó `secrets: ["TELEGRAM_SECRET", "TELEGRAM_TOKEN"]` a las opciones de `onRequest`. En el manifiesto de Cloud Functions v2 esto genera `secretEnvironmentVariables` garantizando la vinculación en Cloud Run.
  * Se refactorizó la lectura del token a funciones dinámicas (`getTelegramToken()`, `getTelegramApiUrl()`).
  * En `enviar(chatId, texto)` se agregaron validaciones de existencia del token y captura de fallos de red y estados HTTP no exitosos (`res.ok`).
  * Se creó una suite de pruebas automatizadas con el runner nativo de Node.js (`node:test`) en `functions/test/botNavira.test.js` que valida el manifiesto de Cloud Run y todos los casos de autorización fail-closed. Se integró el comando `npm test`.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 3. [BE-04] `allow get` en vez de `read` para `codigos_beta`
* **Problema:** En las reglas de Firestore de producción, `codigos_beta` tenía configurado `allow read: if true;`. Dado que `read` en Firestore equivale a `get + list`, cualquier usuario anónimo en internet podía realizar una petición REST a la API de Firestore (`GET /v1/projects/.../documents/codigos_beta`) sin credenciales y enumerar la lista completa de códigos, extrayendo el código `BETA2026V1`.
* **Archivos Modificados:** `firestore.rules`, `firebase.json`.
* **Solución Técnica:**
  * Se creó y versionó el archivo oficial [`firestore.rules`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firestore.rules) y se vinculó en [`firebase.json`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firebase.json).
  * Se fijó la regla para códigos beta a:
    ```javascript
    match /codigos_beta/{codigoId} {
      allow get: if true;   // Permite getDoc puntual para validar en registro
      allow list: if false;  // Prohíbe enumerar o escanear la colección completa
      allow write: if false; // Solo modificable por administradores
    }
    ```
  * Se incluyeron las reglas fail-closed para el aislamiento de datos por usuario (`usuarios/{uid}/**`) y la protección total de colecciones internas del bot (`telegram_sesiones` y `telegram_updates`).
* **Commit:** `71ee5d6` | **Notion:** `Done`

---

### Bloque 6, 8 y 9: Infraestructura, Estabilidad y CDN

#### 4. [BE-25] Runtime Node.js 20 LTS en Cloud Functions
* **Problema:** `functions/package.json` declaraba `"engines": { "node": "24" }`. Google Cloud Functions para Firebase no soporta Node 24, arrojando error fatal en Google Cloud Build.
* **Archivos Modificados:** `functions/package.json`.
* **Solución Técnica:** Se fijó a `"engines": { "node": "20" }`, versión oficial LTS soportada por Firebase Cloud Functions v2.
* **Commit:** `f74ca3d` | **Notion:** `Done`

#### 5. [BE-31] Límites de Escalado, Memoria y Timeout en `botNavira`
* **Problema:** La función `botNavira` no tenía límites de concurrencia. Podía escalar cientos de contenedores desbordando costos en GCP ante picos o ataques.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Se añadieron parámetros defensivos: `maxInstances: 10`, `memory: "256MiB"`, `timeoutSeconds: 30`.
* **Commit:** `6678c69` | **Notion:** `Done`

#### 6. [BE-32] Control de Idempotencia en Webhook de Telegram
* **Problema:** Telegram reintenta el webhook si la red fluctúa, generando viajes duplicados o fletes dobles.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Guarda atómica con `db.doc("telegram_updates/${update.update_id}").create(...)`. Si ya existe (`ALREADY_EXISTS`), se responde `200 OK` de inmediato sin re-ejecutar.
* **Commit:** `45cd505` | **Notion:** `Done`

#### 7. [BE-28] Política de TTL Nativo en Firestore para `telegram_sesiones`
* **Problema:** Sesiones incompletas quedaban retenidas indefinidamente en Firestore.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** Campo `expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000)` en `setSesion` y `resetViaje` para purga automática en Cloud Firestore.
* **Commit:** `50cdaa8` | **Notion:** `Done`

#### 8. [BE-30] Optimización de Empaquetado Vite con `manualChunks`
* **Problema:** Paquetes externos pesados se compilaban en un solo bundle monolítico, invalidando la caché completa en cada release.
* **Archivos Modificados:** `vite.config.js`.
* **Solución Técnica:** División de vendors con `manualChunks`: `vendor-firebase`, `vendor-lucide`, `vendor-react`.
* **Commit:** `a3d8434` | **Notion:** `Done`

#### 9. [BE-34] Cabeceras de Cache Inmutable y Compresión en CDN
* **Problema:** `vercel.json` forzaba `no-cache, no-store` en assets versionados por hash.
* **Archivos Modificados:** `vercel.json`, `firebase.json`.
* **Solución Técnica:** `/assets/**` con `Cache-Control: public, max-age=31536000, immutable`; revalidación estricta solo para `/index.html`.
* **Commit:** `58c04f3` | **Notion:** `Done`

---

### Bloque 7: Integridad de Base de Datos y Finanzas

#### 10. [BE-29] y [CR-20] Consecutivos Atómicos Transaccionales de Cuentas de Cobro
* **Problema:** En `Cobros.jsx`, el número de factura se calculaba en memoria con `cuentasCobro.reduce(...) + 1`. Dos despachadores facturando al tiempo recibían el mismo número de factura (colisión contable y fiscal).
* **Archivos Modificados:** `src/hooks/useFirestore.js`, `src/pages/Cobros.jsx`.
* **Solución Técnica:**
  * Se implementó `agregarCuenta` usando `runTransaction(db, ...)`.
  * La transacción lee atómicamente el documento `usuarios/{uid}/config_contable/consecutivos`, incrementa `ultimoCobro`, guarda la nueva cuenta en `cuentas_cobro` y garantiza unicidad absoluta serializada en servidor.
  * `Cobros.jsx` captura el número oficial devuelto por la transacción sin suposiciones locales.
* **Commit:** `a6f1ea8` | **Notion:** `Done`

#### 11. [BE-33] Escrituras Atómicas (`writeBatch`) en Mantenimiento y Vehículo
* **Problema:** En `Aceite.jsx` y `Llantas.jsx`, el registro de mantenimiento y la actualización del estado del vehículo se realizaban mediante dos escrituras independientes no transaccionales con `.catch(()=>{})`. Si la red caía entre ambas, la base de datos quedaba permanentemente desincronizada.
* **Archivos Modificados:** `src/hooks/useFirestore.js`, `src/App.jsx`, `src/pages/mantenimiento/Aceite.jsx`, `src/pages/mantenimiento/Llantas.jsx`.
* **Solución Técnica:**
  * Se implementó `registrarMantenimientoConVehiculo` usando `writeBatch(db)`.
  * Inserta el registro de mantenimiento y actualiza el estado del vehículo en un **único commit atómico**. Si uno falla, ambos se revierten.
* **Commit:** `a6f1ea8` | **Notion:** `Done`

#### 12. [CR-17] Actualización Centralizada del Odómetro con Trigger Cloud Function
* **Problema:** En `DetalleViaje.jsx`, el kilometraje del vehículo se sumaba/restaba leyendo el dato en cliente y haciendo `updateDoc`. Esto generaba pérdida de kilometraje acumulado por condiciones de carrera entre usuarios o con el bot de Telegram.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:**
  * Se creó el trigger `exports.actualizarOdometroViaje = onDocumentWritten("usuarios/{uid}/viajes/{viajeId}", ...)`.
  * Calcula automáticamente el delta de kilómetros:
    * Creación de viaje: suma `kmT`.
    * Eliminación de viaje: resta `kmT`.
    * Edición de viaje: aplica la diferencia `kmNuevo - kmAnterior`.
  * Aplica `FieldValue.increment(deltaKm)` en el documento del vehículo de forma atómica en Google Cloud, desacoplando totalmente al cliente.
* **Commit:** `0541415` | **Notion:** `Done`

#### 13. [CR-16] Migración de Arrays Embebidos hacia Subcolecciones
* **Problema:** Los documentos de vehículos (`usuarios/{uid}/vehiculos/{id}`) almacenaban `tanqueosHistorial`, `aceiteHistorial` y `llantasData` como arrays directos. Con meses de operación, el documento se inflaba aproximándose al límite duro de **1 MiB de Firestore**, elevando la latencia y costo de lecturas.
* **Archivos Modificados:** `src/scripts/migrarHistorialesVehiculos.js`.
* **Solución Técnica:**
  * Se creó el motor de migración `migrarHistorialesDeVehiculos(uid)` que traslada los registros hacia subcolecciones dedicadas:
    * `vehiculos/{id}/tanqueos/{tanqueoId}`
    * `vehiculos/{id}/aceite/{aceiteId}`
    * `vehiculos/{id}/llantas/{posicion}`
  * Limpia los campos pesados del documento padre mediante `deleteField()`, manteniendo resúmenes livianos para listados ultra-rápidos.
* **Commit:** `0541415` | **Notion:** `Done`

---

### Verificación de Repositorio
* **Rama de trabajo:** `Cambios-Dev-Caliche`
* **Rama de producción:** `main` (intacta, 0 commits fusionados)
* **Verificación remota:** Todos los commits respaldados en GitHub:  
  👉 https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche
