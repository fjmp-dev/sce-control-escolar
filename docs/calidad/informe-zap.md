# Informe de OWASP ZAP — SCE

**Fuente:** SCE-MC-001 v2.0, Tablas 30, 42, 49 y 51; PA-SCE-001, AU-20. **Casos:** CS-SEG-03 y CS-SEG-05.
**Versión:** 1.0, 11 de noviembre de 2026 (sub-batch 12.2). **Elaboró:** FJMP con asistente de IA. Sin revisión independiente (NC-012).

Cada alerta de ZAP tiene aquí su decisión y su evidencia. Se actualiza cuando un escaneo trae una alerta nueva; una alerta alta detiene la etapa (Tabla 51).

## 1. Corrida

- **Ambiente:** Compose propio en el equipo de desarrollo, con la semilla sintética (Tabla 30) y las imágenes construidas desde la rama `feature/75-seguridad`, con los cambios de este sub-batch.
- **ZAP:** imagen `ghcr.io/zaproxy/zaproxy:2.17.0`, con `zap-api-scan.py` para la API y `zap-full-scan.py` para el portal.
- **Fecha:** 11 de noviembre de 2026, de 00:19 a 01:52 (hora de la Ciudad de México). La API y el acceso cruzado, de 00:19 a 00:23; el portal, de 00:58 a 01:52.
- **Orden:** acceso cruzado, la API con los siete roles y después el portal. Es el de la etapa 5 de `ci.yml`, más el portal de `zap-completo.yml`. Control escolar se volvió a escanear después de corregir la alerta 30002 (2.3), con el portal reconstruido.

| Escaneo | Script | Dónde corre | Resultado |
|---|---|---|---|
| API con los siete roles (CS-SEG-05) | `scripts/zap.sh` | Etapa 5 de cada pull request y `zap-completo.yml` | 9 escaneos activos: uno por rol, más dos de las operaciones que revocan la sesión, con una cuenta desechable. 8661 peticiones, 7691 con sesión. **Las 60 operaciones del OpenAPI llegaron más allá de 401 y 403.** Ningún 5xx. Registros sin secretos. Great Expectations después: 33 expectativas, 0 incumplidas |
| Acceso cruzado (CS-SEG-03) | `scripts/zap-acceso-cruzado.sh` | Etapa 5 de cada pull request y `zap-completo.yml` | 1345 peticiones del alumno B sobre las 17 operaciones con identificadores del alumno A. **Ningún 2xx**, y lo de A quedó igual |
| Portal con cada rol | `scripts/zap-portal.sh` | `zap-completo.yml`: a mano, cada lunes y con cada etiqueta `v*` | 7 escaneos completos, uno por rol, de 26 a 51 URL cada uno. El portal llamó a la API con la sesión de cada rol (de 442 a 10956 peticiones), y la sesión seguía viva al terminar. **Ningún 5xx de la API.** La primera corrida de control escolar encontró un 500 del propio portal (30002): se corrigió y el segundo escaneo salió limpio |

**Por riesgo, sumando los tres:**
- **Alta:** ninguna.
- **Media:** una regla en el portal, 10202, que se acepta. En la primera corrida hubo otra, 30002, y se corrigió.
- **Baja:** dos reglas. 10096 en la API y en el portal, falso positivo. 90004 en el portal, que se acepta.
- **Informativas:** siete reglas. Ninguna pide un cambio.

## 2. Alertas y decisiones

ZAP clasifica cada alerta por riesgo y por confianza: "Media (Baja)" es riesgo medio con confianza baja. Las instancias son las que reporta ZAP; en el portal, a lo más cinco por regla y escaneo.

### 2.1 API

| Regla | Alerta | Riesgo | Instancias | Decisión | Evidencia |
|---|---|---|---|---|---|
| 10096 | Timestamp Disclosure - Unix | Baja (Baja) | 1, en `GET /usuarios` del administrador | **Falso positivo.** El número es la marca de época del correo de la cuenta desechable `zap-<época>@sce.test`, que el propio escaneo da de alta, y que la lista de usuarios devuelve | La evidencia de ZAP es `1794378061`: el 11 de noviembre de 2026 a las 00:21:01, la hora del alta |
| 10049 | Non-Storable Content | Informativa (Media) | 37 | **Se acepta: es el control.** La API responde con `Cache-Control: no-store`, así que ni el navegador ni un proxy guardan datos personales ni tokens | Cabecera de cada respuesta |
| 10112 | Session Management Response Identified | Informativa (Media) | 7, en `POST /sesiones/actual/renovacion` | **Se acepta: es el diseño.** La renovación devuelve el token nuevo en JSON al portal, que lo guarda en la cookie `httpOnly` (CC-010, CC-014). El navegador nunca lo recibe | `autenticacion.cy.ts` |
| 100000 | A Client Error response code was returned by the server | Informativa (Alta) | 304 | **Se acepta: es lo esperado.** Son los 400, 404 y 409 con que la API rechaza las entradas de ZAP. El criterio que importa es otro: ningún 5xx y ninguna operación detenida en 401 o 403 | `resumen-peticiones.json`: 6744 respuestas 400, 792 404, 146 409, 402 403 y un 401 |

En los nueve escaneos pasaron 119 o 120 reglas, Entre ellas están:
- inyección SQL, también la de tiempo para PostgreSQL;
- inyección de comandos, de código, de plantillas y CRLF;
- XSS reflejado y persistente;
- recorrido de rutas y XXE;
- divulgación de errores (90022).

### 2.2 Acceso cruzado

| Regla | Alerta | Riesgo | Instancias | Decisión | Evidencia |
|---|---|---|---|---|---|
| 100000 | A Client Error response code was returned by the server | Informativa (Alta) | 75 | **Se acepta: es el control.** B recibe 403 en las rutas de otros roles, y 400 o 404 en las de un alumno con identificadores de A. El 404 de un pago, un folio o un documento ajeno es igual al de uno inexistente | `resumen-b.json` |
| 10049 | Non-Storable Content | Informativa (Media) | 5 | Igual que en la API | — |

**Respuestas que recibió B, por operación** (`resumen-b.json`):

| Operación con el identificador de A | Respuestas |
|---|---|
| `GET`, `PUT` sobre `/alumnos/{matrícula}`, sus inscripciones, calificaciones, cuenta, facultad y estatus; `POST /alumnos/{matrícula}/becas` | Solo 403 |
| `PATCH /usuarios/{id de A}` | Solo 403 |
| `PUT /inscripciones/{folio de A}/grupos` | 119 con 400 y 6 con 404 |
| `GET /pagos/{pago aplicado de A}` | 22 con 404 y 1 con 400 |
| `POST /pagos/{pago pendiente de A}/simulacion` | 117 con 400 y 6 con 404 |
| `POST /tramites/{folio de A}/proceso`, `emision` y `rechazo`; `GET /documentos/{folio}` | Solo 403 |
| `GET /tramites/{folio de A}/documento` | Solo 404 |

ZAP también prueba las rutas padre (`GET /alumnos`, `/pagos`, `/tramites`, `/usuarios`), y B recibe 403 en todas.

### 2.3 Portal

**Por rol** (`<rol>.txt` y `<rol>-api.json`):

| Rol | URL | Peticiones a la API con su sesión | 5xx de la API | Reglas con aviso | Reglas que pasaron | Duración |
|---|---|---|---|---|---|---|
| Alumno | 45 | 442 | 0 | 2 | 141 | 13 min |
| Profesor | 42 | 6661 | 0 | 2 | 141 | 4 min |
| Control escolar | 51 | 10956 | 0 | 2 (3 en la primera corrida) | 141 | 7 min |
| Coordinación | 29 | 3933 | 0 | 2 | 141 | 3 min |
| Caja | 27 | 4018 | 0 | 2 | 141 | 3 min |
| Dirección | 27 | 2494 | 0 | 2 | 141 | 2 min |
| Administrador | 26 | 1166 | 0 | 3 | 140 | 3 min |

Pasaron, entre otras, las reglas de XSS reflejado, persistente y de DOM (40012, 40014 y 40026), inyección SQL (40018, 40019 y 40022), inyección de comandos (90020), CRLF (40003) y fijación de sesión (40013).

**Alertas:**

| Regla | Alerta | Riesgo | Instancias | Decisión | Evidencia |
|---|---|---|---|---|---|
| 30002 | Format String Error | Media (Media) | 1, solo en la primera corrida de control escolar, en `/expedientes?buscar=` | **Corregido.** No era una cadena de formato. La búsqueda de ZAP medía más de 100 caracteres, la API la rechazó con 400, la página no manejaba ese rechazo y el portal respondió 500. El CSV del historial (`/expedientes/<matrícula>/historial.csv`) tenía el mismo defecto con una matrícula malformada o inexistente. En esa corrida, el registro del portal tiene 30 de los primeros y 60 de los segundos. Ahora la búsqueda muestra un aviso y el CSV responde 404. Además, `zap-portal.sh` falla si el portal deja sin manejar un rechazo de la API | `expediente.test.tsx`. El segundo escaneo de control escolar salió sin la alerta y sin ningún `⨯ ErrorApi` en el registro del portal; uno de caja con el script nuevo, con `portal_sin_manejar: 0` |
| 10202 | Absence of Anti-CSRF Tokens | Media (Baja) | 35, cinco por rol. En su salida, ZAP cuenta 11 por rol | **Se acepta: el control es otro.** Los formularios del portal son acciones de servidor de Next.js, que no usan token. Next.js no ejecuta una acción cuyo `Origin` no coincide con el host, y la cookie `sce_sesion` es `httpOnly` y `SameSite=Lax`, así que otro sitio no la manda en un POST | `web/playwright/sesion.spec.ts`: una acción con `Origin` ajeno no se ejecuta, en los seis proyectos |
| 90004 | Cross-Origin-Embedder-Policy Header Missing or Invalid | Baja (Media) | 35 | **COOP y CORP se corrigieron, y COEP se acepta.** La primera corrida también pedía `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy`, y desde 12.2 `next.config.ts` las manda con `same-origin`. COEP solo hace falta para aislar el proceso cuando una página usa `SharedArrayBuffer` o temporizadores de alta resolución, y el portal no los usa | `next.config.ts`; cabeceras de cualquier página |
| 10096 | Timestamp Disclosure - Unix | Baja (Baja) | 1, en `/usuarios` del administrador | **Falso positivo**, el mismo de la API: es la marca de época del correo de la cuenta desechable | `1794378061` |
| 10049 | Non-Storable Content | Informativa (Media) | 60 | **Se acepta: es el control.** Las páginas con sesión no se guardan en caché | Cabecera de cada respuesta |
| 10109 | Modern Web Application | Informativa (Media) | 35 | **Informativa.** ZAP encontró la etiqueta `<noscript>` que muestra el menú sin JavaScript (28.1) | — |
| 10104 | User Agent Fuzzer | Informativa (Media) | 30 | **Se acepta.** ZAP pide la raíz con otros agentes de usuario, como Internet Explorer 7, y la respuesta cambia. También cambia con el mismo agente: el nonce de la CSP es distinto en cada petición y va en el HTML. El tamaño es igual, y el portal no decide nada por agente de usuario | `curl` con dos agentes |
| 90027 | Cookie Slack Detector | Informativa (Baja) | 30 | **Falso positivo del escaneo.** ZAP quita la cookie para ver si cambia la respuesta, y la regla de reemplazo de `zap-portal.sh` la vuelve a poner en cada petición. Sin `sce_sesion`, el portal manda a `/ingresar` | `web/test/proxy.test.ts` |
| 10031 | User Controllable HTML Element Attribute (Potential XSS) | Informativa (Baja) | 5: `periodo` en `/oferta` y `/reportes`, `filtro` en `/tramites` y `fecha` en `/caja` | **Se acepta.** El valor vuelve en un atributo, como el `value` de un campo. React escapa los atributos, la CSP con nonce no deja correr un script inyectado, y las reglas activas de XSS pasaron | La salida de cada rol |

**Fuera de las alertas.** El registro del portal tiene otros dos 500, de Next.js y no del código del SCE:
- 352 peticiones `TRACE`, un método que Next.js no admite. No hay eco de la petición. En staging no llega al portal: nginx rechaza `TRACE` con 405 sin configuración extra.
- 12 acciones de servidor con el cuerpo malformado ("Invalid Server Actions request").

Next.js responde antes de llegar a una página y no devuelve datos.

## 3. Decisiones de diseño de los escaneos

- **Un escaneo por rol, guiado por la matriz.** Con una sola cuenta, todo lo de otros roles se queda en el 403 y la validación nunca se prueba. `zap.sh` lee `matriz-rol-endpoint.md` y a cada rol le deja solo lo suyo.
- **Identificadores reales.** El profesor ataca la captura de uno de sus grupos. El acceso cruzado fija en la ruta la matrícula, la cuenta, la inscripción, los pagos, el trámite y el documento de A. Si ZAP los inventara, recibiría un 404 que no prueba nada.
- **`number` como `integer` en el acceso cruzado.** Para un `number`, ZAP genera 1.2, y la validación lo rechaza con 400 antes de comprobar de quién es el recurso. Como entero, la petición llega a esa comprobación: `PUT /inscripciones/{folio}/grupos` pasó de 400 en todas a 6 con 404.
- **Operaciones que revocan la sesión.** El cierre de sesión y el cambio de contraseña van al final, cada una con su token, sobre una cuenta desechable que se crea en cada corrida.
- **Bloqueo del administrador.** ZAP falla a propósito la confirmación de contraseña del administrador, y su cuenta queda bloqueada 15 minutos (Tabla 38): el control funciona. Por eso el administrador va al último y `zap-completo.yml` escanea la API sobre una semilla nueva.
- **El portal sin formularios del spider.** El spider no envía formularios POST, porque en Next.js son acciones de servidor, y su API ya la ataca `zap.sh`. La regla de DOM XSS sí los opera, porque abre un navegador y pulsa botones. En la primera corrida pulsó "Cerrar sesión" a los 46 segundos, y el resto del escaneo solo vio `/ingresar`. Desde entonces, `zap-portal.sh` le cambia a esa acción el identificador en cada petición, Next.js responde 400 y la sesión sigue viva.
- **Dos hilos en el portal.** La regla de DOM XSS abre un Firefox por hilo. Con los hilos de omisión, ZAP se quedó dos veces sin memoria en la máquina virtual de Docker de 8 GiB, y el sistema lo terminó a media corrida. `zap-portal.sh` usa dos.
- **Duración.** El escaneo del portal dura de 2 a 13 minutos por rol, 35 en total, y no cabe en cada pull request.

## 4. Evidencia

Los reportes de esta corrida están en `docs/evidencias/seguridad/zap-2026-11-11.zip`. Este informe, sin cambios, está en `docs/evidencias/seguridad/informe-zap-2026-11-11.md`. Ninguno lleva tokens ni contraseñas: se buscaron con los patrones de `revision-cs-seg-08.md`.

| Archivo | SHA-256 |
|---|---|
| `zap-2026-11-11.zip` | `beb92c89a5d0fb48073b68e5bc3b1966415a100aa2f8fdf0b9fbde02b62f17e5` |

Contenido del `.zip`:
- `zap/`: el reporte Markdown, el JSON de alertas y la salida de cada escaneo, más `alertas.json`, `resumen-peticiones.json`, `operaciones.txt`, `solo-401-403.txt` (vacío) y `calidad-datos/resumen.json`.
- `zap-acceso-cruzado/`: los mismos reportes, más `resumen-b.json`, `operaciones.txt`, `sin-probar.txt` (vacío), las peticiones de B (`peticiones-b.jsonl`), el OpenAPI con los identificadores de A (`openapi-a.json`) y lo que A veía de sí mismo antes y después (`a-antes.txt` y `a-despues.txt`, iguales).
- `zap-portal/`: los mismos reportes de los siete roles, con el resumen de lo que el portal pidió a la API (`<rol>-api.json`) y `alertas.json` de los siete. En `antes-de-corregir/` está la primera corrida de control escolar, la de la alerta 30002.

En CI, los mismos reportes quedan como artefacto `zap` de la etapa 5 y `zap-completo` del flujo semanal, por 90 días.
