# Inventario de datos personales — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tabla 38 (fila "Datos personales"); PA-SCE-001, Parte B (AU-18).
**Versión:** 1.0, 10 de noviembre de 2026 (sub-batch 12.6, issue #75). **Elaboró y aprobó:** FJMP (NC-012).
**Base:** `api/prisma/schema.prisma` y `docs/calidad/matriz-rol-endpoint.md` v1.7, en esta rama.

Todo dato del SCE es sintético (RK-09). Este inventario describe lo que el sistema trataría con datos reales.

Hay una fila por columna con datos personales. Una columna es dato personal si dice algo de una persona identificada o identificable, aunque sola no la nombre: un folio que lleva la matrícula, una fecha de captura o un saldo. Las columnas sin datos personales están al final.

## Claves

**Finalidades.** Son las del aviso de privacidad (`aviso-de-privacidad.md`, apartado 3).

| Clave | Finalidad |
|---|---|
| F1 | Integrar y administrar el expediente: alta, plantel y estatus |
| F2 | Inscripción: oferta, carga y horario |
| F3 | Evaluación: calificaciones e historial |
| F4 | Cobranza: cargos, becas, pagos y recibos |
| F5 | Trámites: constancias y su verificación |
| F6 | Acceso y seguridad: cuentas, sesiones y bitácora |
| F7 | Estadística: reportes agregados para dirección, sin nombres ni matrículas |

**Roles que la ven.** Sale de la matriz rol × endpoint y de los esquemas de respuesta de `docs/api/openapi.json`. Al: alumno, solo lo propio, por su sesión. Pr: profesor, solo sus grupos. CE: control escolar. Co: coordinación. Ca: caja. Di: dirección. Ad: administrador. "Nadie" quiere decir que ninguna respuesta de la API la incluye.

**Copias secundarias.**

| Clave | Copia | Dónde vive | Retención |
|---|---|---|---|
| R | Respaldos de la base | `pg_dump` cifrado con age; se construye en 13.2 | Semestre en curso más uno (Tabla 56) |
| B | Bitácora | Tabla `bitacora`: `entidad` y `valor_anterior` | Inmutable; D-18 propone conservarla como el expediente |
| D | Documento emitido | `documento.contenido`; el alumno lo descarga o imprime | Como el expediente (D-18) |
| X | Exportaciones del portal | CSV del historial (`historial-<matrícula>.csv`), comprobante de inscripción y recibo impresos | Fuera del SCE: en el equipo de quien descarga |
| K | Corte de caja | Respuesta de `GET /pagos`: matrícula, referencia, importe y estado de cada pago del día | Fuera del SCE si caja lo imprime |
| E | Reporte de dirección | `GET /periodos/{clave}/reporte`: indicadores por facultad, sin matrícula ni nombre | Fuera del SCE si se exporta |
| L | Registros JSON de la API | Salida del contenedor | Semestre más uno (Tabla 62) |
| T | Token de sesión | Cookie `httpOnly` del portal: `sub` (id de la cuenta) y `sv` | 60 minutos (15 el administrador), 8 horas como máximo |

Los registros JSON (L) solo llevan método, plantilla de ruta, estado, duración, id de la cuenta y código (CS-SEG-08). pgAudit, en staging, registra qué tabla se escribió y con qué usuario de base, sin los valores (`pgaudit.log_parameter = off`). Por eso ninguno de los dos aparece como copia de un valor.

## Inventario

### Identidad y acceso

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `usuario.id` | Identificación indirecta | F6 | Todos, la propia (`/sesiones/actual`); Ad | B (autor y entidad `usuario:`), L, T, R |
| `usuario.correo` | Identificación y contacto | F6; F1 (vínculo con el expediente); F2 (profesor de un grupo) | Todos, el propio; Ad; CE, el del alumno; Co, el del profesor de cada grupo | B (`cambio_usuario`, `vinculo_cuenta`), R |
| `usuario.hash_contrasena` | Autenticación | F6 | Nadie: nunca sale de la API ni va a la bitácora | R |
| `usuario.activo` | Identificación: estado de la cuenta | F6 | Ad | B (`cambio_usuario`), R |
| `usuario.sesion_version` | Autenticación | F6 | Nadie | T (`sv`), R |
| `usuario.creado_en` | Identificación | F6 | Nadie | R |
| `usuario_rol.usuario_id` | Identificación indirecta | F6 | Como `usuario.id` | R |
| `usuario_rol.rol_id` | Académicos o laborales: perfil en la institución | F6 | Todos, los propios; Ad | B (roles en `cambio_usuario`), R |
| `usuario_rol.asignado_en` | Laborales | F6 | Nadie | R |

### Expediente e historial

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `alumno.matricula` | Identificación | F1 a F5 | Al; Pr; CE; Co; Ca | B (entidades `alumno:`, `historial:`, `cuenta:` y los folios), D, X, K, R |
| `alumno.nombre` | Identificación | F1, F3, F5 | Al; Pr; CE | D, R |
| `alumno.facultad_clave` | Académicos | F1, F7 | Al; CE | B (`cambio_plantel`; de ahí sale la trayectoria), D, E (agregado), R |
| `alumno.usuario_id` | Identificación indirecta: vínculo con la cuenta | F1, F6 | Nadie: CE ve el correo vinculado | B (correo anterior en `vinculo_cuenta`), R |
| `alumno.fecha_ingreso` | Académicos | F1 | Al; CE | R |
| `alumno.estatus` | Académicos | F1, F2, F7 | Al; CE | B (`cambio_estatus`), D (constancia), E (alumnos activos), R |
| `historial.matricula` | Identificación | F3 | Como `alumno.matricula` | R |
| `historial.promedio` | Académicos | F3, F5, F7 | Al; CE; Co | B (`recalcular_historial`), D, X, E (promedio por facultad), R |
| `historial.creditos_acumulados` | Académicos | F3, F5 | Al; CE; Co | B, D, X, R |
| `historial.avance` | Académicos | F3, F5, F7 | Al; CE; Co | B, D, X, E (avance promedio), R |
| `historial.actualizado_en` | Académicos | F3 | Nadie | R |

### Inscripción y oferta

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `inscripcion.folio` | Identificación: lleva la matrícula (`INS-2027A-2420001`) | F2, F3 | Al; Pr; CE | B (entidad), X (comprobante), R |
| `inscripcion.matricula` | Identificación | F2 | Al; CE | X, R |
| `inscripcion.periodo_clave` | Académicos | F2 | Al; CE | X, R |
| `inscripcion.estado` | Académicos | F2 | Al; CE | B (estado anterior), X, R |
| `inscripcion.motivo_rechazo` | Académicos; `adeudo` revela un dato patrimonial | F2 | Al; CE | B (motivo anterior), R |
| `inscripcion.fecha` | Académicos | F2 | Al; CE | X, R |
| `inscripcion_grupo.folio` | Identificación: lleva la matrícula | F2 | Al; CE | R |
| `inscripcion_grupo.grupo_id` | Académicos: la carga; con el horario dice dónde y cuándo está la persona | F2, F3 | Al (horario); CE; Pr (lista de su grupo) | B (grupos anteriores), X, R |
| `inscripcion_grupo.fecha_alta` | Académicos | F2 | Nadie | R |
| `grupo.profesor_id` | Laborales: asignación docente | F2, F3 | Co (como correo); Pr (sus grupos, por su sesión) | R |

### Calificaciones

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `calificacion.folio` | Identificación: lleva la matrícula | F3 | Al; Pr; CE; Co | R |
| `calificacion.grupo_id` | Académicos | F3 | Al; Pr; CE; Co | R |
| `calificacion.profesor_id` | Laborales: quién capturó | F3 | Nadie | B (`profesorId` del valor anterior), R |
| `calificacion.periodo_clave` | Académicos | F3 | Al; Pr; CE; Co | X, R |
| `calificacion.parcial` | Académicos | F3 | Al; Pr; CE; Co | X, R |
| `calificacion.valor` | Académicos | F3, F5 | Al; Pr; CE; Co | B (valor anterior; en la corrección, con motivo y evidencia), D (final), X, R |
| `calificacion.fecha_captura` | Académicos | F3 | Al; Pr; CE; Co | B, R |

### Cobranza

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `cuenta_alumno.matricula` | Identificación | F4 | Al; Ca | B (entidad `cuenta:`), R |
| `cuenta_alumno.saldo` | Patrimoniales | F4; F2 y F5 (adeudo y no adeudo); F7 | Al; Ca; CE, en el mensaje que rechaza un no adeudo | B (`cargo`, `beca`, `pago_aplicado`, `pago_rechazado`), E (agregado), R |
| `cuenta_alumno.actualizado_en` | Patrimoniales | F4 | Nadie | R |
| `movimiento.matricula` | Identificación | F4 | Al; Ca | R |
| `movimiento.pago_id` | Patrimoniales | F4 | Nadie: liga el abono con su pago | R |
| `movimiento.concepto` | Patrimoniales | F4 | Al; Ca | R |
| `movimiento.importe` | Patrimoniales | F4, F7 | Al; Ca | E (cargos, pagado y becas, agregados), R |
| `movimiento.tipo` | Patrimoniales; `beca` puede revelar la situación económica | F4, F7 | Al; Ca | E, R |
| `movimiento.fecha` | Patrimoniales | F4 | Al; Ca | R |
| `pago.matricula` | Identificación | F4 | Al; Ca | K, X (recibo), R |
| `pago.clave_idempotencia` | Patrimoniales | F4 | Nadie | R |
| `pago.referencia` | Patrimoniales | F4 | Al; Ca | K, X, R |
| `pago.importe` | Patrimoniales | F4 | Al; Ca | K, X, R |
| `pago.estado` | Patrimoniales | F4 | Al; Ca | B (`pago_rechazado`), K, X, R |
| `pago.fecha` | Patrimoniales | F4 | Al; Ca | K, X, R |

El SCE no guarda datos de tarjeta ni de cuenta bancaria: la pasarela es simulada (CC-020).

### Trámites y documentos

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `tramite.folio` | Identificación: lleva la matrícula (`TRA-<matrícula>-…`) | F5 | Al; CE | B (entidad), R |
| `tramite.matricula` | Identificación | F5 | Al; CE | R |
| `tramite.tipo` | Académicos | F5 | Al; CE | R |
| `tramite.estado` | Académicos | F5 | Al; CE | B (estado anterior), R |
| `tramite.motivo_rechazo` | Académicos o patrimoniales; es texto libre de control escolar | F5 | Al; CE | R |
| `tramite.fecha_solicitud` | Académicos | F5 | Al; CE | R |
| `tramite.fecha_actualizacion` | Académicos | F5 | Al; CE | R |
| `documento.folio` | Identificación: lleva la matrícula (`DOC-<matrícula>-…`) | F5 | Al; CE | D, X, R |
| `documento.tramite_folio` | Identificación: lleva la matrícula | F5 | Al; CE | R |
| `documento.tipo` | Académicos | F5 | Al; CE | R |
| `documento.hash` | Huella SHA-256 del contenido; sola no revela datos | F5 | Al; CE | R |
| `documento.contenido` | Identificación, académicos y patrimoniales: nombre, matrícula, facultad, estatus, promedio, créditos, avance, materias o no adeudo | F5 | Al, al descargarlo; CE, al verificarlo | X, R |
| `documento.fecha_emision` | Académicos | F5 | Al; CE | X, R |

### Bitácora

| Columna | Categoría | Finalidad | Roles que la ven | Copias |
|---|---|---|---|---|
| `bitacora.autor` | Identificación indirecta: la cuenta que operó | F6 | Nadie por la API; Seguridad por SQL (`muestreo-bitacora.sql`) | R |
| `bitacora.accion` | Actividad de la persona | F6 | Nadie por la API; CE ve la trayectoria de planteles, que sale de aquí | R |
| `bitacora.entidad` | Identificación: matrícula, folio o id de cuenta | F6 | Nadie por la API; Seguridad por SQL | R |
| `bitacora.valor_anterior` | Según la acción: correo, roles, estado, estatus, facultad, saldo, calificación, motivo y evidencia. Nunca el hash | F6 | Nadie por la API; CE ve la facultad anterior en la trayectoria | R |
| `bitacora.fecha` | Actividad de la persona | F6 | Como `bitacora.accion` | R |

## Columnas sin datos personales

- **Catálogos:** `rol`, `facultad`, `plan_estudios`, `materia`, `prerequisito` y `periodo`, completas.
- **Oferta:** `grupo`, salvo `profesor_id`, y `horario`, completa. El horario se vuelve dato personal solo al cruzarlo con una inscripción (`inscripcion_grupo.grupo_id`).
- **Llaves sustitutas:** `grupo.id`, `calificacion.id`, `movimiento.id`, `pago.id` y `bitacora.id`. Numeran filas y no describen a nadie; la fila a la que apuntan sí está en el inventario.

## Datos sensibles

El SCE no trata datos sensibles: salud, origen étnico, creencias, opiniones políticas, preferencia sexual ni datos biométricos. Ninguna columna los pide. `tramite.motivo_rechazo` es texto libre: control escolar no debe escribir en él datos de ese tipo. Hoy nada lo impide (ver `documento-de-seguridad.md`, plan de trabajo).

## Observaciones del inventario

1. **El folio lleva la matrícula.** Inscripción, trámite y documento la llevan en su folio. Un folio en una bitácora, un correo o una captura identifica al alumno. Los registros JSON no lo llevan, porque guardan la plantilla de la ruta.
2. **El reporte de dirección puede identificar en grupos pequeños.** Si una facultad tiene un solo alumno activo, su promedio y su saldo son los de esa persona. Hoy no hay umbral mínimo.
3. **Control escolar ve un saldo.** El mensaje que rechaza un no adeudo dice el importe del adeudo. Control escolar no consulta cuentas por la API (CS-SEG-02).
4. **La bitácora es copia de casi todo.** Es inmutable y no tiene ruta en la API. Su retención es la del expediente mientras no se ratifique D-18.

## Revisión

El inventario se actualiza en el mismo pull request que agregue una columna o una respuesta con datos personales. La matriz rol × endpoint ya obliga a decidir quién usa cada endpoint nuevo; esta tabla no tiene prueba automática. Se revisa al cierre de cada fase con `documento-de-seguridad.md`.
