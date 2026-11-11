# Modelo de amenazas STRIDE — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 37 ("riesgos de seguridad por componente"), sección 18 y Tabla 28.
**Versión:** 1.7, 11 de noviembre de 2026 (sub-batch 12.2): agrega pagos, caja, trámites y reportes, cierra las filas que esperaban al Batch 12 y suma el cumplimiento de la Tabla 38 y de 18.2. Se actualiza en cada batch que agrega un componente. **Apartado de controles ISO/IEC 27001 y OWASP:** 10 de noviembre de 2026 (sub-batch 11.3). **Cruce con RK-11 a RK-14:** sub-batch 12.6.

Cubre todo lo que existe: portal, gateway, identidad y acceso, expediente, inscripción, oferta, calificaciones, pagos, caja, trámites, reportes, catálogos, bitácora, persistencia, imágenes y staging. **S**uplantación, **T**ampering (alteración), **R**epudio, **I**nformación expuesta, **D**enegación de servicio, **E**levación de privilegios.

| Componente | Tipo | Amenaza | Control | Evidencia | Riesgo que queda |
|---|---|---|---|---|---|
| Portal | I | Robo del token desde el navegador (XSS) | Cookie `httpOnly`; el navegador nunca recibe el token, porque Next.js llama a la API desde el servidor (CC-014). React escapa lo que muestra. **Desde 12.2, CSP con un nonce por petición** (`web/proxy.ts`): `script-src 'self' 'nonce-…' 'strict-dynamic'`, estilos solo propios o con el nonce, sin `'unsafe-inline'` | `autenticacion.cy.ts` comprueba cookie, almacenamiento y HTML. `proxy.test.ts` comprueba la política y que el nonce cambia. Playwright falla ante cualquier violación de la CSP en cada página que visita (`fixtures.ts`). ZAP del portal con cada rol, con la regla de DOM XSS (`zap-portal.sh`) | `next dev` agrega `'unsafe-eval'` y estilos en línea; la imagen nunca corre en ese modo |
| Portal | I | Interceptar la cookie | `Secure` por omisión; solo se apaga en Compose, que no tiene HTTPS. Staging tiene HTTPS con TLS 1.2+ y HSTS | `cookie-sesion.test.ts`; `verificar-staging.sh` | — |
| Portal | T | Peticiones falsificadas desde otro sitio (CSRF) | `SameSite=Lax`, y Next.js compara el origen de cada acción de servidor con el host | `autenticacion.cy.ts` comprueba el atributo. **Desde 12.2, `sesion.spec.ts` (Playwright)** envía el formulario de ingreso con un `Origin` ajeno: no se ejecuta ni deja cookie, y desde el origen propio sí | ZAP marca la falta de token anti-CSRF en los formularios (10202): se acepta, porque el control es el origen (`informe-zap.md`) |
| Portal | E | Entrar a una página de otro rol | La API autoriza cada lectura; el portal lleva a "sin permiso". Ocultar el menú es solo presentación | `demostracion-por-rol.cy.ts` | — |
| Portal | S | Incrustar el portal en otro sitio (clickjacking) | `frame-ancestors 'none'`, ahora en la CSP del proxy | `proxy.test.ts`; ZAP del portal | — |
| Portal | I | La página pública `/privacidad` expone datos (12.6) | Es estática: no llama a la API ni lee la cookie. El proxy la deja pasar sin sesión, como `/ingresar` | `paginas.test.tsx`, `proxy.test.ts`, `privacidad.cy.ts` | — |
| Imágenes | T | Desplegar una imagen alterada | Firma de cosign atada a este repositorio y este workflow; la etapa 7 la verifica antes de desplegar | Etapas 6 y 7 | La firma deja un registro público en Rekor, con repositorio y commit, sin datos personales |
| Imágenes | I | Cuentas sintéticas con contraseña pública en piloto | La imagen no ejecuta el seed; solo lo pide `docker-compose.yml` | `api/Dockerfile`, `docker-compose.yml` | Hay que crear al primer administrador real sin seed (Batch 13) |
| Identidad | S | Fuerza bruta de contraseñas | Bloqueo tras 5 fallos en 15 minutos, contado desde la bitácora; bcrypt | `sesiones.spec.ts` | Ver D de identidad |
| Identidad | S | Descubrir qué cuentas existen | Mismo mensaje y misma comparación de bcrypt exista o no la cuenta, esté o no bloqueada | `sesiones.spec.ts` compara las respuestas. **El tiempo no se mide con una prueba** | La medición de tiempos queda sin prueba automatizada |
| Identidad | S | Token robado o reutilizado | Expiración de 60 minutos (15 para el administrador), sesión máxima de 8 horas, revocación con `sesion_version` | CS-SEG-07 | Un token robado vale hasta que expire o se cierre la sesión. En el portal va en cookie `httpOnly` |
| Identidad | S | Token forjado o sin firma | HS256 fijo y secreto de al menos 32 caracteres, verificado al arrancar | `sesiones.spec.ts` | — |
| Identidad | S | Sesión de administrador secuestrada | Sesión corta y confirmación de contraseña para operar sobre cuentas | `usuarios.spec.ts` | **No hay segundo factor** (ver abajo) |
| Identidad | D | Bloquear a propósito la cuenta de otro | La ventana es de 15 minutos y se libera sola | `sesiones.spec.ts` | Un atacante que conozca un correo puede mantenerla bloqueada. Límite por origen en nginx (Batch 13) |
| Identidad | E | Un rol opera lo de otro | Guard global con denegación por omisión; roles leídos de la base en cada petición | CF-ROL-01, CI-AUTH-01 con la matriz completa | — |
| Identidad | E | El administrador se eleva o deja al sistema sin administradores | No puede cambiar su propio acceso; lleva bitácora | `usuarios.spec.ts` | Un administrador sí puede crear otro. Queda en bitácora para la revisión de Seguridad |
| Identidad | E | Usar el usuario técnico | Inactivo, sin roles, hash imposible, fuera de la lista y no modificable por la API | `sesiones.spec.ts`, `usuarios.spec.ts` | Acceso directo a la base (Batch 13) |
| Gateway | T | Entrada malformada o inyección | DTO con lista blanca, sin caracteres de control; Prisma parametriza | CS-SEG-05 con ZAP, `gateway.spec.ts`. Desde 12.2, ZAP escanea con cada uno de los siete roles solo lo que la matriz le permite: las 60 operaciones llegan a su validación, ninguna se queda en 401 o 403, y la calidad de datos completa sigue en verde después | Ninguno nuevo: `zap.sh` lee la matriz rol × endpoint, así que un endpoint nuevo entra solo al escaneo |
| Gateway | I | Trazas o secretos en errores | Filtro global: código de negocio y mensaje fijo, sin eco de la entrada | CS-SEG-05, `gateway.spec.ts` | — |
| Gateway | I | Datos sensibles en registros | Solo método, plantilla de ruta, estado, duración, id de usuario y código; en errores, nombre y pila sin mensaje | CS-SEG-08, `gateway.spec.ts` y comprobación tras el escaneo de ZAP. Revisión v2 (12.2): también el portal | El id de usuario es un identificador interno, no un dato personal directo |
| Gateway | D | Cuerpos enormes | Límite del lector del cuerpo, que responde 413, y largo máximo por campo | `gateway.spec.ts` | Sin límite de peticiones por origen hasta nginx (Batch 13). También permitiría llenar la bitácora con accesos fallidos |
| Expediente | I | Un alumno lee el expediente de otro cambiando la matrícula (18.2) | Ninguna ruta acepta matrícula del rol alumno: `/alumnos/actual` la toma de la sesión | CS-SEG-03 con Supertest y Cypress. Desde 12.2, con ZAP: el alumno B ataca cada ruta con la matrícula de A y recibe 403 (`zap-acceso-cruzado.sh`, en cada pull request) | — |
| Expediente | T | Duplicar o perder un expediente al cambiar de plantel (RK-01) | Matrícula como clave primaria; el cambio modifica el mismo registro | CF-EXP-01, CD-DAT-01, Great Expectations | — |
| Expediente | R | Negar un cambio de plantel o de estatus | Bitácora con autor y valor anterior en la misma transacción | CF-EXP-01, CS-SEG-06 en plantel | Un cambio directo en la base no deja asiento: pgAudit (Batch 6) |
| Expediente | I | Exposición excesiva en búsquedas | La búsqueda devuelve solo matrícula, nombre, facultad y estatus, hasta 50 | `expediente.spec.ts` | — |
| Inscripción | E | Un alumno inscribe o ajusta la carga de otro (18.2) | La matrícula sale de la sesión; la petición no acepta matrícula; un folio ajeno responde 404 igual que uno inexistente | CS-SEG-03 con Supertest y Newman. Desde 12.2, con ZAP sobre el folio de A: 400 o 404, nunca 2xx, y la carga de A igual (AMFE, modo 9) | — |
| Inscripción | T | Saltarse una validación o su orden para confirmar | El dominio no confirma sin las tres validaciones de la Fig. 4, en su orden; la API no recibe estado ni motivo | Jest (tabla de decisión), Supertest | — |
| Inscripción | T | Sobrecupo por inscripciones simultáneas | Bloqueo de la fila del grupo dentro de la transacción y `CHECK ck_grupo_cupo`; ocupación conciliada con inscritos | CI-API-01 con cinco alumnos simultáneos; consulta de ocupación con Great Expectations | La concurrencia real de la semana de inscripción se mide en el Batch 13 |
| Inscripción | T | Dos envíos del mismo alumno que se pisan | Bloqueo de la fila de la inscripción y comprobación de que no cambió desde que se leyó | CI-API-01 | — |
| Inscripción | R | Negar una inscripción, un rechazo o un ajuste | Bitácora con autor y estado anterior en la misma transacción, también del rechazo (CC-013) | CI-API-01 | Un ajuste rechazado deja asiento, pero no su motivo, porque la inscripción no cambia |
| Inscripción | D | Llenar la bitácora con envíos rechazados | Cada envío exige sesión de alumno con expediente activo y periodo abierto | — | Sin límite de peticiones hasta nginx (Batch 13) |
| Oferta | I | Exponer datos del profesor | Al alumno, la oferta le devuelve materia, grupo, cupo, ocupación y horarios, sin el profesor. Solo coordinación ve el correo del profesor de cada grupo, y ninguna respuesta lleva el identificador interno de la cuenta | `oferta.spec.ts`, `inscripcion.spec.ts` | — |
| Oferta | I | Ver la oferta antes de que se publique | El alumno recibe una lista vacía y la inscripción responde `OFERTA_NO_PUBLICADA` hasta la publicación (CC-012) | `oferta.spec.ts` | — |
| Oferta | E | Asignar un grupo a una cuenta que no es de profesor, que en el Batch 8 podría capturar calificaciones (RF-004) | Identidad confirma que el correo es de una cuenta activa con rol de profesor; si no, 409 | `oferta.spec.ts` | La captura del Batch 8 vuelve a exigir el rol y el grupo asignado |
| Oferta | T | Fijar la ocupación o el identificador del grupo desde la petición | La entrada rechaza cualquier campo de más; el grupo nace con ocupación cero | `oferta.spec.ts` (CS-SEG-05) | — |
| Oferta | T | Dos definiciones simultáneas que dejan el mismo traslape (D-13) | Bloqueo de la fila del periodo en la transacción: la segunda definición espera y ve el grupo de la primera | `oferta.spec.ts`, con mutante | — |
| Oferta | R | Negar quién abrió el periodo, definió un grupo o publicó la oferta | Bitácora en la misma transacción: `abrir_periodo`, `alta_grupo`, `publicar_oferta` | `oferta.spec.ts` | La bitácora guarda la acción, no el contenido del grupo |
| Calificaciones | E | Un profesor captura en un grupo ajeno, o un alumno captura (RF-004) | La captura exige rol de profesor y que el grupo sea suyo; si no, 403 antes de cualquier otra validación | `calificaciones.spec.ts` (CF-CAL-01, CS-SEG-01); Cypress | — |
| Calificaciones | I | Averiguar quién está inscrito en un grupo ajeno | La propiedad del grupo se comprueba antes que los folios: el mismo 403 aunque el folio no exista | `calificaciones.spec.ts` | — |
| Calificaciones | T | Alterar una calificación después del cierre | Fuera de la ventana de captura, 409. Después del cierre solo corrige coordinación, con motivo y evidencia (D-17), y el historial se recalcula | `calificaciones.spec.ts` | El motivo y la evidencia viven en la bitácora, no en una entidad propia |
| Calificaciones | T | Cerrar con una captura a medias | La captura comparte el periodo y el cierre lo toma en exclusiva antes de leer: espera y ve lo que se confirmó | Prueba con mutante, detectado 3 de 3 veces | — |
| Calificaciones | R | Negar una captura, un cierre o una corrección | Bitácora en la misma transacción, con valor anterior y el profesor de origen; CS-SEG-06 verifica que cada calificación tenga su asiento | `cs-seg-06-calificacion.sql` en Great Expectations | Un cambio directo en la base lo registra pgAudit en staging (CC-005) |
| Historial | T | Un historial que no corresponde a las calificaciones | Se recalcula completo en cada cierre o corrección, con una sola función de redondeo; CD-DAT-02 lo recalcula en SQL, de forma independiente | `cd-dat-02.sql` en Great Expectations; 30 expedientes | — |
| Pagos | S | El alumno aprueba su propio pago sin pagar | La pasarela es simulada por decisión (CC-020): el propio alumno aprueba o rechaza en una pantalla de prueba y no se mueve dinero. Solo con datos sintéticos | CC-020; `pagos.spec.ts` | **El piloto no puede cobrar así.** Una pasarela real necesita su aviso firmado (Fig. 5) y su fila en esta tabla |
| Pagos | T | Aplicar dos veces un pago, o pagar más que el adeudo (R-14) | Importe hasta el saldo. El pago se aplica una sola vez, con su estado y el saldo en la misma transacción; un segundo intento por el mismo adeudo se rechaza con 409 | CI-PAG-01 con Supertest y Newman, con avisos empalmados; CD-DAT-03 | — |
| Pagos | T | Un pago aplicado a medias (R-15) | Abono, saldo, recibo y bitácora en una transacción: si la bitácora falla, el pago sigue pendiente | `pagos.spec.ts` | — |
| Pagos | I | Un alumno ve el pago o el recibo de otro (R-23) | El pago de otro alumno responde 404, igual que uno inexistente. Solo caja ve cualquier recibo | CS-SEG-03 con Supertest. Desde 12.2, con ZAP: B pide el pago aplicado de A y simula el pendiente, y recibe 400 o 404 | — |
| Pagos | R | Negar un pago aplicado o rechazado | Un asiento del usuario técnico con el valor anterior, en la misma transacción (R-21, CC-015) | CS-SEG-06 en pago, con SQL y Great Expectations | — |
| Caja | E | Caja modifica el historial académico o un trámite (R-24, 18.2) | Ninguna ruta de caja escribe calificaciones, historial ni trámites; lo demás se deniega por omisión | CS-SEG-02: `pagos.spec.ts` compara el kárdex y el historial antes y después de cargos, beca, pago y corte. CF-ROL-01. ZAP con la cuenta de caja | — |
| Caja | T | Cargos duplicados o una beca que deja saldo a favor | El cargo del periodo se genera una vez por alumno y concepto aunque caja lo repita (D-7); la beca no puede rebasar el saldo | `pagos.spec.ts`; CD-DAT-03 | — |
| Caja | R | Negar un cargo o una beca | Asiento `cargo` o `beca` con autor, en la misma transacción | `pagos.spec.ts` | — |
| Caja | I | Consultar la cuenta de cualquier alumno | Caja la necesita para cobrar (Tabla 5). Consulta por matrícula, sin búsqueda | CF-ROL-01 | La consulta no deja rastro de lectura (documento de seguridad, acción 8) |
| Trámites | I | Un alumno descarga el documento de otro (R-23) | El trámite y su documento se buscan con la matrícula de la sesión: un folio ajeno responde 404 | CS-SEG-03 con Supertest. Desde 12.2, con ZAP: B pide el documento de A y recibe 404 | — |
| Trámites | T | Un documento alterado después de emitirse | Hash del contenido al emitir; control escolar lo verifica con `GET /documentos/{folio}` | `tramites.spec.ts` detecta un contenido alterado | El hash vive en la misma base que el contenido: quien cambie ambos en la base solo queda en pgAudit (staging) |
| Trámites | E | Saltarse un paso de la Fig. 6, o emitir sin historial (R-17) | Cada paso sale solo del estado anterior; solo control escolar toma, emite o rechaza | CF-TRA-01 y 02; CF-ROL-01; ZAP: B recibe 403 al intentar los pasos de control escolar sobre el trámite de A | — |
| Trámites | R | Negar una solicitud, una emisión, un rechazo o una entrega | Asiento por paso con autor y estado anterior (R-21) | CS-SEG-06 en constancia, con SQL y Great Expectations | — |
| Trámites | I | Datos sensibles en el motivo de rechazo | Texto libre que escribe control escolar y lee el alumno | — | Documento de seguridad, acción 13 |
| Reportes | I | Dirección reidentifica alumnos | Solo agregados por facultad y de la universidad, sin matrícula ni nombre (Tabla 16) | `reportes.spec.ts` lo comprueba | Una fila con muy pocos alumnos permite inferir: umbral mínimo por fila, documento de seguridad, acción 12 |
| Reportes | E | Otro rol consulta el reporte | Solo dirección | CF-ROL-01; ZAP con la cuenta de dirección | — |
| Reportes | D | Consultas pesadas sobre periodos grandes | Agregación en SQL por periodo | — | Se mide en carga (Batch 13) |
| Catálogos | T | Altas fuera de rol | Solo administrador (facultades y planes) o coordinación (materias y periodos) | CF-ROL-01 | — |
| Bitácora | T | Alterar o borrar asientos | Disparadores que rechazan UPDATE, DELETE y TRUNCATE | Control de RK-03 | Un superusuario de la base puede desactivarlos. pgAudit en staging (Batch 6) |
| Bitácora | R | Negar una operación | Autor, acción, valor anterior y fecha, en la misma transacción que la operación: si la bitácora falla, la operación se revierte | `seguridad.spec.ts`, `usuarios.spec.ts` | — |
| Bitácora | I | Secretos en el valor anterior | Solo id, correo, estado y roles; nunca el hash | `usuarios.spec.ts` | Correos en bitácora: retención a definir (Batch 13) |
| Persistencia | I | Conexión o credenciales expuestas | Secretos fuera del código; Gitleaks y Trivy. En staging, la base solo admite al servidor de aplicación, solo por TLS verificado y con SCRAM; el superusuario no entra por red | CS-SEG-08; `staging.sh` prueba los cuatro rechazos | El rol `sce_app` también migra: no hay rol separado de solo datos |
| Proxy de staging | I | Degradar el cifrado o espiar el tráfico | Solo TLS 1.2 y 1.3 con secreto perfecto hacia adelante; HTTP solo redirige; HSTS | testssl.sh y ZAP pasivo en cada despliegue; mutante con TLS 1.1 detectado | Staging usa certificado autofirmado (CC-018); la emisión y renovación del certificado público se prueban en el piloto |
| Base de staging | R | Cambiar datos o esquema sin rastro, por cualquier vía | pgAudit registra DDL, cambios de rol y escrituras sobre las tablas de registro oficial, con usuario, base y aplicación | `staging.sh`: DDL de las migraciones registrado | Retención de esos registros: Batch 13 |
| Despliegue a staging | E | Desplegar sin autorización o una imagen ajena | Solo etiqueta SemVer integrada y acta; aprobación de PO y QA en el ambiente, sin autoaprobación; firma cosign del workflow de CI verificada antes de desplegar. **Desde el 10 de noviembre de 2026, la aprobación sin autoaprobación no se cumple (NC-012)** | `staging.yml` | SJOM aceptó la invitación el 10 de noviembre de 2026, pero no revisa ni aprueba. Hoy no existe ningún environment. El `staging` se crea en 11.4 con FJMP como revisor y con la autoaprobación permitida (NC-012) |
| Despliegue a staging | I | Fuga de secretos del ambiente | Staging no guarda secretos (CC-018): las claves de la base, la firma de tokens y la contraseña sintética se generan en cada corrida y mueren con ella. El registro se lee con el token de la corrida, que caduca al terminar | `staging.sh`, `staging.yml` | El piloto sí tendrá secretos y acceso SSH: se modelan en el Batch 13 |
| Persistencia | D | Saturar conexiones | Pool de Prisma por omisión | — | Se mide en carga (Batch 13) |

## Cumplimiento de la Tabla 38 y de 18.2

Sub-batch 12.2. La brecha detallada de cada control está en `docs/gobierno/datos-personales/documento-de-seguridad.md`, apartado 4; aquí, la prueba que lo sostiene en esta versión.

| Control (Tabla 38) | Cómo se cumple | Prueba | Pendiente |
|---|---|---|---|
| Autenticación | JWT con expiración; solo `/salud` y `POST /sesiones` son anónimos | CS-SEG-04 con Newman; CS-SEG-07 | Segundo factor del administrador (decisión abierta) |
| Autorización | Guard global con denegación por omisión y matriz ejecutable | CF-ROL-01 y CI-AUTH-01; ZAP con los siete roles; CS-SEG-03 con ZAP | — |
| Gestión de sesiones | Expiración, sesión máxima, revocación con `sesion_version`, cookie `httpOnly` y `SameSite=Lax` | CS-SEG-07; `sesion.spec.ts`, también contra CSRF | — |
| Cifrado en tránsito | TLS 1.2 y 1.3 con HSTS en staging; CSP con `upgrade-insecure-requests` fuera de Compose | testssl.sh y ZAP pasivo en staging; `proxy.test.ts` | Certificado público en el piloto |
| Protección en reposo | Secretos fuera del código; base solo para el servidor de aplicación | `staging.sh` | Cifrado de base y respaldos (13.2) |
| Bitácora | Autor, acción, valor anterior y fecha; inmutable | CS-SEG-06 en calificación, pago y constancia; control de RK-03 | Lecturas y retención |
| Gestión de secretos | Secretos de GitHub y por ambiente; staging sin secretos | Gitleaks; CS-SEG-08 v2 | El piloto |
| Vulnerabilidades | Trivy, `npm audit`, Gitleaks y ZAP en cada pull request; ZAP completo cada semana y en cada candidata (`zap-completo.yml`) | `informe-zap.md`: cero altas | — |
| Datos personales | Minimización por rol; datos sintéticos fuera del piloto | `reportes.spec.ts`; CS-SEG-08 v2 sin datos personales en registros | Aviso emitido por la universidad |
| Respuesta a incidentes | `respuesta-a-incidentes.md`, con notificación de vulneraciones | Ensayo de mesa del 10 de noviembre | Ensayo técnico en staging (13) |

**18.2.** R-23, un alumno no accede a datos de otro: expediente, inscripción, pago y documento, con Supertest y, desde 12.2, con ZAP en cada pull request. R-24, caja no modifica el historial: CS-SEG-02 en `pagos.spec.ts` y `calificaciones.spec.ts`. Sin datos reales fuera del piloto (Tabla 30): todos los escaneos usan la semilla sintética y una cuenta desechable `@sce.test`.

## Decisiones abiertas

- **Segundo factor para el administrador.** PA-SCE-001, Parte B, pide "control adicional para roles privilegiados". Se implementó sesión corta y confirmación de contraseña, sin dependencia ni columna nueva. Un segundo factor (TOTP) sería más fuerte y requeriría un CC. Lo decide Seguridad.
- **Recuperación de contraseña.** No existe: el manual no la pide. Hoy, quien olvida su contraseña depende de otra alta. El administrador conoce la contraseña inicial que asigna, y el usuario puede cambiarla, pero nada lo obliga. Exigir el cambio en el primer acceso requeriría una columna y un CC.
- **Qué roles son privilegiados.** Solo `administrador`. Control escolar y caja manejan datos sensibles; Seguridad decide si se suman (una línea en `identidad/dominio/usuario.ts`).

## Cruce con la matriz de riesgos: RK-11 a RK-14

Sub-batch 12.6, 10 de noviembre de 2026. Son los riesgos de privacidad y autenticación de la Parte B de PA-SCE-001 (`matriz-riesgos.md`).

| Riesgo | Filas de esta tabla que lo controlan | Lo que esta tabla no cubre |
|---|---|---|
| RK-11 Vulneración no detectada o no notificada | Expediente I (otro alumno, búsquedas); Gateway I (registros); Bitácora I (correos); Persistencia I | Una lectura indebida con una cuenta legítima no deja rastro de qué se leyó (ensayo de mesa, H-1). Los respaldos todavía no existen (13.2) |
| RK-12 Sin aviso, licitud o ARCO | Ninguna: es cumplimiento, no amenaza | `docs/gobierno/datos-personales/` |
| RK-13 Conservación sin plazo | Bitácora T: los disparadores que impiden alterarla también impiden suprimir | D-18, por ratificar |
| RK-14 Toma de cuenta | Identidad S (fuerza bruta, descubrir cuentas, token robado o forjado, sesión de administrador); Identidad D (bloqueo a propósito); decisiones abiertas de arriba | La contraseña robada fuera del SCE, por ejemplo con un correo falso: solo la detendría un segundo factor |

## Controles de ISO/IEC 27001:2022 y OWASP Top 10 2021

**Fuente:** Tabla 38 del manual, Tabla 60 (criterios de la auditoría de cierre de la fase 4) y sección 18.2. Los controles son los del Anexo A de ISO/IEC 27001:2022; ISO/IEC 27002:2022 da su guía con la misma numeración. Estado al 10 de noviembre de 2026, sobre `d4cce7d`. La corrida citada es la 42966111975 (PR #78) y la verificación local del mismo día (`informe-fase-4.md`, apartado 5).

| Control de la Tabla 38 | ISO/IEC 27001:2022, Anexo A | OWASP Top 10 2021 | Evidencia en el repositorio | Estado |
|---|---|---|---|---|
| Autenticación | 5.17 Información de autenticación; 8.5 Autenticación segura | A07 Fallas de identificación y autenticación | `api/src/identidad/autenticacion.service.ts` (bcrypt, bloqueo tras 5 fallos); `sesiones.spec.ts`; CS-SEG-04 en Newman ("Endpoint sin token responde 401") | Cumple. Sin segundo factor (decisiones abiertas) |
| Autorización | 5.15 Control de acceso; 5.18 Derechos de acceso; 8.3 Restricción del acceso a la información | A01 Control de acceso roto | `APP_GUARD` en `api/src/identidad/identidad.module.ts`; `roles.spec.ts` (CF-ROL-01, CI-AUTH-01) y `matriz-rol-endpoint.md`; CS-SEG-01 a 03 en `calificaciones.spec.ts`, `pagos.spec.ts` y `tramites.spec.ts` | Cumple en pruebas. ZAP de acceso cruzado en 12.2 |
| Gestión de sesiones | 8.5 Autenticación segura | A07 | `sesion_version` (CC-010) en `usuario.repository.ts`; CS-SEG-07 en `sesiones.spec.ts`; cookie `httpOnly` en `web/test/cookie-sesion.test.ts` | Cumple |
| Cifrado en tránsito | 8.20 Seguridad de redes; 8.24 Uso de criptografía | A02 Fallas criptográficas | `infra/staging/app/nginx.conf.template` (`ssl_protocols TLSv1.2 TLSv1.3`, HSTS); testssl en `scripts/verificar-staging.sh` | Cumple en staging: TLS 1.2 y 1.3 ofrecidos, en la corrida 42966111975. No hay piloto |
| Protección en reposo | 8.24 Uso de criptografía; 8.13 Respaldo de la información | A02 | `.env` fuera del repositorio; `infra/staging/db/` (solo el servidor de aplicación, SCRAM y TLS, sin superusuario por red); contraseñas con bcrypt | Parcial: la base no se cifra en reposo y no hay respaldo cifrado (13.2). Staging es efímero (CC-018) |
| Bitácora | 8.15 Registro de eventos; 8.16 Actividades de seguimiento | A09 Fallas de registro y monitoreo | `api/src/bitacora/bitacora.service.ts`; disparador `fn_bitacora_inmutable` (migración `20261023001700_restricciones`); `cs-seg-06-calificacion.sql`, `-plantel`, `-pago` y `-constancia`; `seguridad.spec.ts` (R-22) | Cumple: 0 filas sin asiento en Great Expectations. Inmutabilidad reejecutada el 10-nov. Monitoreo y alertas: 13.x |
| Gestión de secretos | 5.17 Información de autenticación; 8.12 Prevención de fuga de datos | A07 (credenciales en el código) | `scripts/gitleaks-historial.sh` en la etapa 2; `.gitleaksignore`; staging genera sus secretos en cada corrida (`scripts/staging.sh`, CC-018); rotación en `respuesta-a-incidentes.md` | Cumple: Gitleaks sin hallazgos (`[]`). La rotación no se ha ensayado (13.x) |
| Vulnerabilidades | 8.8 Gestión de vulnerabilidades técnicas; 8.28 Codificación segura; 8.29 Pruebas de seguridad | A06 Componentes vulnerables; A03 Inyección | `package-lock.json`; `.github/dependabot.yml`; npm audit, Trivy y ZAP en `ci.yml`; lista blanca en `api/src/gateway/validacion.ts`; Prisma parametriza (CS-SEG-05); `revision-cs-seg-08.md` | Cumple: 0 altas o críticas en npm audit y Trivy; ZAP sin alertas altas |
| Datos personales | 5.34 Privacidad y protección de datos personales; 8.11 Enmascaramiento de datos; 8.33 Información de prueba | A01 Control de acceso roto | CS-SEG-03 en expediente, pagos y trámites; `sin-datos-reales.sql` en cada despliegue; `reportes.spec.ts` ("el reporte no expone matriculas ni nombres de alumnos") | Parcial: aviso de privacidad, ARCO e inventario en 12.6 |
| Respuesta a incidentes | 5.24 Planificación de la gestión de incidentes; 5.26 Respuesta a incidentes | A09 | `docs/gobierno/respuesta-a-incidentes.md` | Documentado, sin ensayo (12.6 y 13.x) |

**OWASP Top 10 2021 que la Tabla 38 no nombra:**

| Riesgo de OWASP | ISO/IEC 27001:2022, Anexo A | Evidencia en el repositorio | Estado |
|---|---|---|---|
| A04 Diseño inseguro | 8.25 Ciclo de vida de desarrollo seguro; 8.27 Arquitectura y principios de ingeniería seguros | Este archivo; `amfe-inscripcion.md`; `amfe-pagos.md` | Cumple desde 12.2: v1.7 con pagos, caja, trámites y reportes, y la plantilla de PR pide el modo del AMFE y la fila de esta tabla (MJ-006). El AMFE de pagos llegó después del código (NC-017, corregida) |
| A05 Configuración de seguridad incorrecta | 8.9 Gestión de la configuración | `web/next.config.ts` (CSP con `frame-ancestors 'none'`, `nosniff`); filtro global de errores en `api/src/gateway/errores.filter.ts` | Parcial: la CSP admite `'unsafe-inline'`; nonce en 12.2 |
| A08 Fallas de integridad de software y datos | 8.32 Gestión de cambios | `cosign sign` en `scripts/publicar-imagenes.sh`; `cosign verify` en `ci.yml` (etapa 7) y `staging.yml`; hash SHA-256 del documento emitido (`tramites.spec.ts`) | Cumple. La firma de `v0.4.0` se verifica en 11.4 |
| A10 Falsificación de peticiones del lado del servidor | 8.20 Seguridad de redes | La API no hace peticiones salientes: sin `fetch`, `axios` ni `HttpService` en `api/src` desde CC-020 | No aplica |

La revisión es del autor (NC-012). Ningún auditor independiente ha verificado estos controles (NC-013).
