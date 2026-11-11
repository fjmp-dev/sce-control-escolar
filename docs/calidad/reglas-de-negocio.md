# Reglas de negocio — SCE

**Documento de referencia:** SCE-MC-001 v2.0, secciones 8.3, 9, 12.1 y 38 (Tablas 16 y 59).
**Versión:** 1.2, 10 de noviembre de 2026 (sub-batch 11.2; v1.1: 8 de noviembre de 2026; v1.0: 5 de noviembre de 2026).
**Estado:** provisional hasta que el Product Owner lo ratifique.

El manual exige que promedio, créditos y montos coincidan con las "reglas publicadas del periodo" (Tabla 16), pero no publica esas reglas. Este documento las reúne, separa lo que el manual fija de lo que el equipo propone, y sirve de inventario para medir la cobertura de reglas Must (Tabla 59).

---

## 1. Reglas que el manual no fija

Son propuestas del equipo, no reglas de la UAEM. **El Product Owner debe contrastarlas con las reglas reales de la institución antes de que el batch que bloquean se acepte.**

| ID | Regla provisional | Por qué hace falta | Bloquea | Estado |
|---|---|---|---|---|
| D-5 | Mínima aprobatoria 6.00. Final de materia = promedio de sus parciales. Promedio general = promedio de las finales. Si una materia se recursa, cuenta el último intento. Redondeo half-up a dos decimales, en una sola función del dominio | RF-005 y CD-DAT-02 no se pueden verificar sin regla publicada. La Tabla 16 solo fija "dos decimales y una sola función" | Batches 5 y 8 | Por ratificar |
| D-6 | Plazo de ajuste (Fig. 6, "alta o baja dentro del plazo") = mientras el periodo esté `abierto`. Ventana de captura (Tabla 15) = mientras el periodo esté `en_curso` | El modelo de datos no tiene campos de plazo | Batches 5 y 8 | Por ratificar. Desde el Batch 7, además, la oferta debe estar publicada (CC-012) |
| D-7 | Caja indica el importe al generar los cargos del periodo (Fig. 7). No hay tarifa en código ni catálogo de cuotas | El modelo de 21 entidades no tiene catálogo de cuotas | Batch 9 | Por ratificar |
| D-8 | Los créditos del plan son los del plan de las materias que el alumno cursa. Si cursó materias de más de un plan, cuenta el de la materia más reciente. Avance = créditos acreditados entre créditos del plan, en porcentaje con dos decimales y tope de 100 | La Fig. 8 no liga alumno con plan de estudios | Batch 8 | Aplicada como provisional en el Batch 8. Por ratificar |
| D-9 | `evento.id` de la Fig. 5 se interpreta como `external_reference` = `clave_idempotencia`, generada al crear el intento | Mercado Pago identifica el pago con otro id; el webhook consulta el pago y lee esa referencia | Batch 9 | Por ratificar |
| D-10 | Adeudo vigente = saldo mayor que cero. Máximo 4 parciales por materia | La Fig. 6 dice "adeudo vigente" sin definirlo; la restricción de la base ya limita los parciales de 1 a 4 | Batches 5 y 8 | Por ratificar |
| D-11 | Formatos: matrícula de 7 a 10 dígitos; clave de materia alfanumérica con guion (`ISW-101`); periodo con año de cuatro dígitos más A o B (`2027A`) | La Tabla 16 pide seguir "el catálogo institucional", que el equipo no tiene | Batch 3 | Aplicada de forma provisional en claves de catálogo, periodo y matrícula, y verificada por Great Expectations. Por ratificar con el catálogo real |
| D-12 | El intento de pago "sobre un movimiento" (Fig. 5) se liga al cargo mediante `referencia`, sin columna nueva | El modelo no liga pago con cargo; `movimiento.pago_id` solo liga el abono | Batch 9 | Por ratificar |
| D-13 | Al definir grupos, aula y profesor no pueden traslaparse en el mismo periodo | La Tabla 29 solo dice "restricciones de cupo y traslape" | Batch 7 | Aplicada como provisional en el Batch 7: el aula se compara sin mayúsculas, acentos ni espacios de más; también se rechazan sesiones del mismo grupo que se traslapan. Por ratificar |
| D-14 | Control escolar consulta inscripciones. La Tabla 5 dice que las "administra", y la Figura 1 no le da caso de uso de inscripción. El PO define si además puede ajustarlas | Hay que fijar el alcance antes de construir la pantalla | Batch 5 | Aplicada como provisional en el Batch 5: solo consulta. Por ratificar |
| D-15 | Un ajuste de la carga (Fig. 6, Ajustada → Confirmada) revalida las tres reglas de la Fig. 4, también el adeudo, y el cupo de los grupos nuevos. Si no pasa, el ajuste se descarta y la inscripción conserva la carga confirmada, porque la Fig. 6 no da a Ajustada otra salida | 13.1: "ninguna inscripción se confirma sin verificar requisitos, adeudos y choques". Consecuencia: un alumno con adeudo no puede ajustar hasta liquidarlo | Batch 5 | Por ratificar |
| D-16 | El periodo se cierra solo si cada alumno inscrito en cada grupo tiene capturados los mismos parciales que el que más tiene en su grupo, y al menos uno. Si falta alguno, el cierre se rechaza y dice qué grupos faltan | Tabla 16, Exactitud: un promedio con parciales faltantes no coincide con la regla del periodo. El manual no fija cuántos parciales hay (D-10: hasta 4) | Batch 8 | Aplicada como provisional. Por ratificar |
| D-17 | Después del cierre, una calificación solo se corrige por coordinación, que la autoriza, con motivo y evidencia (por ejemplo, el oficio del profesor). Queda en bitácora con el valor anterior, el motivo y la evidencia, y el historial del alumno se recalcula en la misma transacción | 6.2-6: el dato académico no se edita sin bitácora ni autorización. PA-SCE-001, Parte B: corrección posterior al cierre con autorizador y evidencia | Batch 8 | Aplicada como provisional. Por ratificar |
| D-18 | Conservación del expediente. Mientras el alumno esté activo se conserva todo. Tras la baja o el egreso: expediente, historial, inscripciones, calificaciones, trámites y documentos emitidos, sin supresión; estado de cuenta, movimientos y pagos, cinco años desde el último movimiento; la cuenta de usuario se da de baja y su fila se conserva mientras la bitácora la referencie; la bitácora, como el dato que respalda. Lo que vence se seudonimiza en lugar de borrarse, porque la bitácora es inmutable. El plazo real lo fija el catálogo de disposición documental de la universidad | La Tabla 62 solo cubre documentos del proyecto (PA-SCE-001, Parte B, AU-40). Sin plazo no se puede responder una cancelación (`docs/gobierno/datos-personales/arco.md`) ni fijar la retención de los respaldos. Los cinco años de cobranza toman como referencia el plazo de conservación de la contabilidad del Código Fiscal de la Federación. La Tabla 62 da "semestre más uno" a la bitácora del piloto, pero la bitácora no se puede borrar sin desactivar sus disparadores | Batch 13 (13.2, respaldos) y la versión integral del aviso de privacidad | Por ratificar. Sin código: el SCE no borra nada. La seudonimización necesita un CC |

---

## 2. Inventario de reglas Must

Base de la métrica "Cobertura de reglas Must" (Tabla 59): reglas Must con prueba automatizada entre reglas Must totales. Meta: 100 % antes del piloto.

Una regla cuenta cuando una prueba automatizada que la verifica lleva su ID (R-xx) en el título del `describe` o del `it`. `scripts/reglas-must.sh` busca los ID de esta tabla en `api/test`, `web/test` y `web/cypress`, publica el reporte `reglas-must` en la etapa 2 del pipeline y falla por debajo de 100 % (CO-MAN-01). No cuentan las pruebas que no corren o que se espera que fallen (`.skip`, `.todo`, `.failing`, `xit`, `xdescribe`) ni las líneas comentadas. El script solo comprueba que el ID esté en el título. Que la prueba de verdad verifique la regla lo revisa quien aprueba el PR. Se cuenta solo lo integrado en la rama de integración.

Rutas de las pruebas bajo `api/test/`, salvo las que empiezan con `web/`.

| ID | Regla | Fuente | Caso | Batch | Archivo de prueba | Estado |
|---|---|---|---|---|---|---|
| R-01 | Un solo expediente por matrícula | RF-001, Fig. 8 | CF-EXP-01, CD-DAT-01 | 1 y 4 | `integracion/expediente.spec.ts`, `integracion/datos.spec.ts` | Con prueba |
| R-02 | El cambio de plantel no duplica el expediente ni pierde historial | RF-001, RK-01 | CF-EXP-01 | 4 | `integracion/expediente.spec.ts` | Con prueba |
| R-03 | Sin prerrequisitos obligatorios no se confirma la carga | RF-002, Fig. 4 | CF-INS-01 | 5 | `integracion/inscripcion.spec.ts`, `unitarias/calificacion.spec.ts` | Con prueba |
| R-04 | Con adeudo vigente no se confirma la carga | RF-002, Fig. 4 | CF-INS-01 | 5 | `integracion/inscripcion.spec.ts` | Con prueba |
| R-05 | Con choque de horario no se confirma la carga, y se avisa antes | RF-003, Fig. 4 | CF-HOR-01 | 5 y 7 | `integracion/inscripcion.spec.ts` | Con prueba; desde el Batch 7, también al definir la oferta (D-13) |
| R-06 | Sin cupo la transacción revierte y la inscripción termina rechazada | Fig. 4, Tabla 29 | CF-INS-02, CI-API-01 | 5 | `integracion/inscripcion.spec.ts` | Con prueba, también con cinco alumnos a la vez por dos lugares |
| R-07 | Las validaciones van en orden fijo: prerrequisitos, adeudos y choques | Fig. 4 | CF-INS-01 | 5 | `integracion/inscripcion.spec.ts`, `unitarias/inscripcion.spec.ts` | Con prueba |
| R-08 | Toda inscripción inválida termina en estado explícito con su causa | RNF-USU-001, Fig. 6 | CF-INS-02 | 5 y 11 | `integracion/inscripcion.spec.ts`, `unitarias/inscripcion.spec.ts`, `integracion/datos.spec.ts` | Con prueba. Desde el sub-batch 11.2, además, `api/prisma/verificacion/tasa-conclusion.sql` mide la tasa de conclusión de la Tabla 59 y exige cero inscripciones sin estado, en Jest y en Great Expectations |
| R-09 | El profesor captura solo en sus grupos asignados | RF-004 | CF-CAL-01 | 8 | `integracion/calificaciones.spec.ts` | Con prueba |
| R-10 | El alumno consulta la calificación al momento de la captura | RF-004 | CF-CAL-01, CI-CAL-01 | 8 | `integracion/calificaciones.spec.ts` | Con prueba |
| R-11 | Promedio con dos decimales y redondeo en una sola función | Tabla 16, RF-005 | CD-DAT-02 | 8 | `unitarias/calificacion.spec.ts`, `unitarias/historial.spec.ts` | Con prueba |
| R-12 | Los créditos acumulados coinciden con la regla publicada tras el cierre | RF-005, RNF-DAT-001 | CD-DAT-02 | 8 | `integracion/calificaciones.spec.ts`, `unitarias/historial.spec.ts` | Con prueba |
| R-13 | El avance de carrera se recalcula al cierre | RF-005 | CD-DAT-02 | 8 | `integracion/calificaciones.spec.ts`, `unitarias/historial.spec.ts` | Con prueba |
| R-14 | Un pago se refleja una sola vez, aunque la pasarela notifique varias | RF-006, Fig. 5 | CF-PAG-01, CI-PAG-01 | 9 | `integracion/pagos.spec.ts`, `unitarias/pagos-tramites.spec.ts`; Newman | Con prueba (#69, integrado con #71). Aviso repetido o empalmado, un abono; dos intentos por el mismo adeudo, el segundo se rechaza con 409 `PAGO_NO_APLICABLE` y el saldo no queda negativo |
| R-15 | Ante fallo de pasarela o de base, el estado queda pendiente y nunca confirmado | Tabla 15, RK-08 | CI-PAG-01 | 9 | `integracion/pagos.spec.ts` | Con prueba. La bitácora falla a mitad de la aplicación o del rechazo, y el pago sigue pendiente, sin abono ni recibo y con el saldo intacto |
| R-16 | El trámite solo sigue las transiciones de la Fig. 6, con fecha visible | RF-007, RF-010 | CF-TRA-01, CF-TRA-02 | 10 | `integracion/tramites.spec.ts`, `unitarias/pagos-tramites.spec.ts`, `web/test/pagos-tramites.test.tsx` | Con prueba. La v1.1 decía "No" porque las pruebas del Batch 10 no se habían registrado aquí. El portal muestra la fecha de solicitud y la del último cambio |
| R-17 | No hay constancia sin historial | Tabla 16 | CF-TRA-01 | 10 | `integracion/tramites.spec.ts` | Con prueba desde el sub-batch 11.2: ningún documento se emite para un expediente sin su fila de historial (409 `SIN_HISTORIAL`), y Great Expectations exige que todo expediente tenga historial (Tabla 16, Completitud). Hasta entonces la constancia se emitía igual, con promedio cero. Interpretación que el PO debe ratificar: "historial" es el registro de la Fig. 8, que todo expediente tiene desde el alta (R-01), no los periodos cerrados; una constancia de primer semestre sí procede. El documento "historial" sin periodos cerrados tampoco se emite |
| R-18 | La autorización se comprueba por rol y se deniega por omisión | RF-008, 14.1-7 | CI-AUTH-01, CF-ROL-01 | 2 | `integracion/roles.spec.ts` | Con prueba, con la matriz completa sobre lo que existe |
| R-19 | Toda operación requiere autenticación; ningún endpoint Must es anónimo | RNF-SEG-001, Tabla 38 | CS-SEG-04 | 2 | `integracion/openapi.spec.ts`; Newman | Con prueba |
| R-20 | La sesión expira y un token revocado no se reutiliza | Tabla 38 | CS-SEG-07 | 2 | `integracion/sesiones.spec.ts` | Con prueba |
| R-21 | Todo cambio de calificación, pago, constancia o plantel deja autor, acción, valor anterior y fecha | RNF-SEG-001, Tabla 38 | CS-SEG-06 | 4, 8, 9, 10 y 11 | `integracion/expediente.spec.ts`, `integracion/calificaciones.spec.ts`, `integracion/pagos.spec.ts`, `integracion/tramites.spec.ts`, `integracion/datos.spec.ts` | Con prueba desde el sub-batch 11.2. Cubre el plantel y la calificación, el pago aplicado y el rechazado, y los cinco pasos del trámite. El rechazo de la pasarela no dejaba asiento y ahora lo firma el usuario técnico (CC-015). CS-SEG-06 tiene una consulta SQL por entidad (`api/prisma/verificacion/cs-seg-06-*.sql`), que corre en Jest y en Great Expectations y que detecta un cambio sin asiento |
| R-22 | La bitácora es inmutable | Tabla 29, RK-03 | Control de RK-03 | 1 | `integracion/seguridad.spec.ts` | Con prueba |
| R-23 | Un alumno no accede a datos de otro alumno | RNF-SEG-002, 18.2 | CS-SEG-03 | 4, 5, 9 y 10 | `integracion/expediente.spec.ts`, `integracion/inscripcion.spec.ts`, `integracion/pagos.spec.ts`, `integracion/tramites.spec.ts` | Con prueba sobre el expediente, la inscripción, el pago y el documento. Las dos últimas se llamaban CS-SEG-02 (NC-007) |
| R-24 | Caja no modifica el historial académico | 18.2, Tabla 10 | CS-SEG-02 | 4, 8 y 9 | `integracion/expediente.spec.ts`, `integracion/calificaciones.spec.ts`, `integracion/pagos.spec.ts` | Con prueba. En pagos, `pagos.spec.ts` compara el kárdex y el historial antes y después de los cargos, la beca, el pago, el recibo y el corte |

**Situación al 10 de noviembre de 2026, en la rama del sub-batch 11.2 sobre develop, que ya integra #71: 24 de 24 reglas Must con prueba automatizada (100 %), según el reporte de `scripts/reglas-must.sh`.** Develop las cuenta cuando se integre este PR. Hasta entonces, develop tiene 22 reglas con prueba, R-21 parcial, porque el rechazo de la pasarela no dejaba asiento, y R-17 sin prueba que la verifique, porque la constancia se emitía sin historial; además, sus pruebas no llevan los ID en el título. La métrica se reporta en cada corrida del pipeline y en cada cierre de fase.

---

## 3. Formato de historia

Sección 12.1 del manual. Se usa en los issues del backlog.

> **Como** `<rol>`, **quiero** `<acción>`, **para** `<beneficio>`.
>
> **Criterios de aceptación:** lista verificable.
> **Requisito:** RF o RNF. **Subcaracterística:** de la Tabla 15 (sección 8.4). **Prioridad:** Must, Should o Could. **Puntos de historia:** para la densidad de defectos de la Tabla 59.

---

## 4. Ratificación

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | | |
