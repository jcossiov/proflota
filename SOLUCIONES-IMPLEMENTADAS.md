# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Actualización:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice General de Tareas Resueltas (18 Tareas)

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
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

### Bloque 2: Eliminar Superficie de Ataque

#### 1. [BE-01] y [CR-01] Cloud Function Callable para Alta Segura de Cuenta y Escalonamiento
* **Problema:** En `useAuth.js`, el registro por correo y el flujo de Google leían directamente el documento `codigos_beta/principal` desde el cliente y comparaban el código en memoria de JavaScript. En el flujo de Google, si el código era inválido, la cuenta de usuario ya había sido creada en Firebase Auth y dependía de una llamada frágil a `deleteUser` en el cliente.
* **Archivos Modificados:** `functions/index.js`, `src/firebase.js`, `src/hooks/useAuth.js`, `functions/test/auth.test.js`.
* **Solución Técnica:**
  * Se implementó la Cloud Function callable `exports.validarAltaUsuario = onCall(...)` en el backend.
  * Valida obligatoriamente:
    1. Que el usuario esté autenticado en Firebase Auth (`context.auth`).
    2. Que haya aceptado los términos (`aceptoTerminos: true`).
    3. Que el código de invitación coincida con el documento confidencial `codigos_beta/principal` consultado vía Admin SDK.
  * Asigna atómicamente el Custom Claim `betaValido: true` en Firebase Auth y crea el documento en `usuarios/{uid}` con marcas de tiempo confiables (`serverTimestamp()`). Si la validación falla, purga inmediatamente al usuario no autorizado de Firebase Auth con `getAuth().deleteUser(uid)`.
  * Se conectó `useAuth.js` mediante `httpsCallable(functions, "validarAltaUsuario")`, eliminando cualquier consulta a `codigos_beta` desde el navegador.
* **Commit:** `cbd206b` | **Notion:** `Done`

#### 2. [BE-03] Validación Simétrica de Esquema y Tamaño en `Update`
* **Problema:** Las subcolecciones de usuarios (`vehiculos`, `viajes`, `mantenimiento`, `gastos_vehiculo`, `gastos_fijos`, `cuentas_cobro`) no tenían validaciones en operaciones de edición (`update`). Un atacante con sesión podía enviar strings de 50.000 caracteres o inyectar propiedades arbitrarias inflando los documentos de Firestore.
* **Archivos Modificados:** `firestore.rules`.
* **Solución Técnica:**
  * Se declararon funciones auxiliares en Firestore Rules: `esStringValido`, `esStringOpcional`, `esNumeroOpcional`.
  * Se crearon validadores estrictos por colección (`validarVehiculo`, `validarViaje`, `validarCuentaCobro`, `validarMantenimiento`, `validarGasto`, `validarEntidadGeneral`).
  * Se aplicó la regla simétrica:
    ```javascript
    allow create, update: if isOwner(uid) && validar<Coleccion>(request.resource.data);
    ```
    Garantizando que las restricciones de campos, tipos y longitud máxima se cumplan rigurosamente tanto en altas como en modificaciones.
* **Commit:** `cbd206b` | **Notion:** `Done`

#### 3. [BE-16] CSP en Modo Reporte y Corrección COOP en Hosting/CDN
* **Problema:** El sitio operaba sin ninguna cabecera de Content Security Policy (CSP), exponiendo la aplicación a riesgos de XSS. Adicionalmente, el popup de login con Google arrojaba errores en consola por la política `Cross-Origin-Opener-Policy` (COOP), bloqueando el cierre limpio de la ventana de autenticación.
* **Archivos Modificados:** `vercel.json`, `firebase.json`.
* **Solución Técnica:**
  * Se configuró la cabecera `Content-Security-Policy-Report-Only` restringiendo orígenes legítimos (`'self'`, APIs de Google/Firebase, fuentes de Google, Storage de Firebase y WebSockets de Firebase).
  * Se configuró `Cross-Origin-Opener-Policy: same-origin-allow-popups` resolviendo el bloqueo del popup de Google Sign-in.
  * Se añadieron defensas complementarias: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
* **Commit:** `cbd206b` | **Notion:** `Done`

---

### Bloque 1: Cerrar la Puerta (Reglas y Control de Acceso)

#### 4. [BE-06] Invertir a Fail-Closed en Webhook `botNavira`
* **Problema:** Condición fail-open permitía llamadas anónimas si `TELEGRAM_SECRET` no estaba definido, admitía peticiones cross-origin (`cors: true`) y no filtraba método HTTP.
* **Archivos Modificados:** `functions/index.js`.
* **Solución Técnica:** `cors: false`, filtro estricto POST (405) y validación fail-closed con 403 Forbidden.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 5. [BE-05] Montar Secretos en Cloud Run (`botNavira`) y Test de Despliegue
* **Problema:** Variables de Secret Manager no montadas explícitamente en Cloud Run y lectura de token estática.
* **Archivos Modificados:** `functions/index.js`, `functions/package.json`, `functions/test/botNavira.test.js`.
* **Solución Técnica:** `secrets: ["TELEGRAM_SECRET", "TELEGRAM_TOKEN"]`, getters dinámicos y tests unitarios.
* **Commit:** `71ee5d6` | **Notion:** `Done`

#### 6. [BE-04] `allow get` en vez de `read` para `codigos_beta`
* **Problema:** `allow read` permitía enumerar la colección vía REST anónimo y extraer el código beta.
* **Archivos Modificados:** `firestore.rules`, `firebase.json`.
* **Solución Técnica:** `allow get: if true; allow list, write: if false;` en `firestore.rules`.
* **Commit:** `71ee5d6` | **Notion:** `Done`

---

### Bloques 6, 7, 8 y 9: Infraestructura, DB, CDN y Rendimiento
*(Ver historial completo de commits `f74ca3d`, `6678c69`, `45cd505`, `50cdaa8`, `a3d8434`, `58c04f3`, `a6f1ea8`, `0541415` con odómetro atómico, consecutivos transaccionales, writeBatch y migración de subcolecciones).*

---

### Verificación de Repositorio
* **Rama de trabajo:** `Cambios-Dev-Caliche`
* **Rama de producción:** `main` (intacta, 0 commits fusionados)
* **Verificación remota:** Todos los commits respaldados en GitHub:  
  👉 https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche
