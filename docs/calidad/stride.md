# Modelo de amenazas STRIDE — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 37 ("riesgos de seguridad por componente"), sección 18 y Tabla 28.
**Versión:** 1.3, 8 de noviembre de 2026 (Batch 5). Se actualiza en cada batch que agrega un componente: inscripción (5), académico (7 y 8), pagos (9), trámites (10) y reportes (11).

Cubre lo que ya existe: portal, gateway, identidad y acceso, expediente, inscripción, oferta, catálogos, bitácora, persistencia e imágenes. **S**uplantación, **T**ampering (alteración), **R**epudio, **I**nformación expuesta, **D**enegación de servicio, **E**levación de privilegios.

| Componente | Tipo | Amenaza | Control | Evidencia | Riesgo que queda |
|---|---|---|---|---|---|
| Portal | I | Robo del token desde el navegador (XSS) | Cookie `httpOnly`; el navegador nunca recibe el token, porque Next.js llama a la API desde el servidor (CC-014). React escapa lo que muestra | `autenticacion.cy.ts` comprueba cookie, almacenamiento y HTML | La política de contenido admite `'unsafe-inline'` por los scripts de arranque de Next.js. Se endurece con nonces en el Batch 12 |
| Portal | I | Interceptar la cookie | `Secure` por omisión; solo se apaga en Compose, que no tiene HTTPS | `cookie-sesion.test.ts` | HTTPS obligatorio desde staging (Batch 6) |
| Portal | T | Peticiones falsificadas desde otro sitio (CSRF) | `SameSite=Lax`, y Next.js compara el origen de cada acción de servidor | `autenticacion.cy.ts` comprueba el atributo. **La comparación de origen es de Next.js y no tiene prueba propia** | Se revisa con ZAP sobre el portal en el Batch 12 |
| Portal | E | Entrar a una página de otro rol | La API autoriza cada lectura; el portal lleva a "sin permiso". Ocultar el menú es solo presentación | `demostracion-por-rol.cy.ts` | — |
| Portal | S | Incrustar el portal en otro sitio (clickjacking) | `frame-ancestors 'none'` | Revisión de cabeceras | — |
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
| Gateway | T | Entrada malformada o inyección | DTO con lista blanca, sin caracteres de control; Prisma parametriza | CS-SEG-05 con ZAP, `gateway.spec.ts` | Se repite con cada endpoint nuevo |
| Gateway | I | Trazas o secretos en errores | Filtro global: código de negocio y mensaje fijo, sin eco de la entrada | CS-SEG-05, `gateway.spec.ts` | — |
| Gateway | I | Datos sensibles en registros | Solo método, plantilla de ruta, estado, duración, id de usuario y código; en errores, nombre y pila sin mensaje | CS-SEG-08, `gateway.spec.ts` y comprobación tras el escaneo de ZAP | El id de usuario es un identificador interno, no un dato personal directo |
| Gateway | D | Cuerpos enormes | Límite del lector del cuerpo, que responde 413, y largo máximo por campo | `gateway.spec.ts` | Sin límite de peticiones por origen hasta nginx (Batch 13). También permitiría llenar la bitácora con accesos fallidos |
| Expediente | I | Un alumno lee el expediente de otro cambiando la matrícula (18.2) | Ninguna ruta acepta matrícula del rol alumno: `/alumnos/actual` la toma de la sesión | CS-SEG-03 con Supertest y Cypress | ZAP no prueba acceso cruzado; Batch 12 |
| Expediente | T | Duplicar o perder un expediente al cambiar de plantel (RK-01) | Matrícula como clave primaria; el cambio modifica el mismo registro | CF-EXP-01, CD-DAT-01, Great Expectations | — |
| Expediente | R | Negar un cambio de plantel o de estatus | Bitácora con autor y valor anterior en la misma transacción | CF-EXP-01, CS-SEG-06 en plantel | Un cambio directo en la base no deja asiento: pgAudit (Batch 6) |
| Expediente | I | Exposición excesiva en búsquedas | La búsqueda devuelve solo matrícula, nombre, facultad y estatus, hasta 50 | `expediente.spec.ts` | — |
| Inscripción | E | Un alumno inscribe o ajusta la carga de otro (18.2) | La matrícula sale de la sesión; la petición no acepta matrícula; un folio ajeno responde 404 igual que uno inexistente | CS-SEG-03 con Supertest y Newman | ZAP no prueba acceso cruzado; Batch 12 |
| Inscripción | T | Saltarse una validación o su orden para confirmar | El dominio no confirma sin las tres validaciones de la Fig. 4, en su orden; la API no recibe estado ni motivo | Jest (tabla de decisión), Supertest | — |
| Inscripción | T | Sobrecupo por inscripciones simultáneas | Bloqueo de la fila del grupo dentro de la transacción y `CHECK ck_grupo_cupo`; ocupación conciliada con inscritos | CI-API-01 con cinco alumnos simultáneos; consulta de ocupación con Great Expectations | La concurrencia real de la semana de inscripción se mide en el Batch 13 |
| Inscripción | T | Dos envíos del mismo alumno que se pisan | Bloqueo de la fila de la inscripción y comprobación de que no cambió desde que se leyó | CI-API-01 | — |
| Inscripción | R | Negar una inscripción, un rechazo o un ajuste | Bitácora con autor y estado anterior en la misma transacción, también del rechazo (CC-013) | CI-API-01 | Un ajuste rechazado deja asiento, pero no su motivo, porque la inscripción no cambia |
| Inscripción | D | Llenar la bitácora con envíos rechazados | Cada envío exige sesión de alumno con expediente activo y periodo abierto | — | Sin límite de peticiones hasta nginx (Batch 13) |
| Oferta | I | Exponer datos del profesor | La oferta devuelve materia, grupo, cupo, ocupación y horarios; no el profesor | `inscripcion.spec.ts` | La consulta diferenciada por rol es del Batch 7 |
| Catálogos | T | Altas fuera de rol | Solo administrador (facultades y planes) o coordinación (materias y periodos) | CF-ROL-01 | — |
| Bitácora | T | Alterar o borrar asientos | Disparadores que rechazan UPDATE, DELETE y TRUNCATE | Control de RK-03 | Un superusuario de la base puede desactivarlos. pgAudit en staging (Batch 6) |
| Bitácora | R | Negar una operación | Autor, acción, valor anterior y fecha, en la misma transacción que la operación: si la bitácora falla, la operación se revierte | `seguridad.spec.ts`, `usuarios.spec.ts` | — |
| Bitácora | I | Secretos en el valor anterior | Solo id, correo, estado y roles; nunca el hash | `usuarios.spec.ts` | Correos en bitácora: retención a definir (Batch 13) |
| Persistencia | I | Conexión o credenciales expuestas | Secretos fuera del código; Gitleaks y Trivy | CS-SEG-08 | Acceso a la base por ambiente (Batch 6) |
| Persistencia | D | Saturar conexiones | Pool de Prisma por omisión | — | Se mide en carga (Batch 13) |

## Decisiones abiertas

- **Segundo factor para el administrador.** PA-SCE-001, Parte B, pide "control adicional para roles privilegiados". Se implementó sesión corta y confirmación de contraseña, sin dependencia ni columna nueva. Un segundo factor (TOTP) sería más fuerte y requeriría un CC. Lo decide Seguridad.
- **Recuperación de contraseña.** No existe: el manual no la pide. Hoy, quien olvida su contraseña depende de otra alta. El administrador conoce la contraseña inicial que asigna, y el usuario puede cambiarla, pero nada lo obliga. Exigir el cambio en el primer acceso requeriría una columna y un CC.
- **Qué roles son privilegiados.** Solo `administrador`. Control escolar y caja manejan datos sensibles; Seguridad decide si se suman (una línea en `identidad/dominio/usuario.ts`).
