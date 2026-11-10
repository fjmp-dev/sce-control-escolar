# Reglas de negocio — SCE

**Documento de referencia:** SCE-MC-001 v2.0, secciones 8.3, 9, 12.1 y 38 (Tablas 16 y 59).
**Versión:** 1.1, 8 de noviembre de 2026 (Batch 5; v1.0: 5 de noviembre de 2026).
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
| D-8 | Los créditos del plan son los del plan de las materias que el alumno cursa | La Fig. 8 no liga alumno con plan de estudios | Batch 8 | Por ratificar |
| D-9 | `evento.id` de la Fig. 5 se interpreta como `external_reference` = `clave_idempotencia`, generada al crear el intento | Mercado Pago identifica el pago con otro id; el webhook consulta el pago y lee esa referencia | Batch 9 | Por ratificar |
| D-10 | Adeudo vigente = saldo mayor que cero. Máximo 4 parciales por materia | La Fig. 6 dice "adeudo vigente" sin definirlo; la restricción de la base ya limita los parciales de 1 a 4 | Batches 5 y 8 | Por ratificar |
| D-11 | Formatos: matrícula de 7 a 10 dígitos; clave de materia alfanumérica con guion (`ISW-101`); periodo con año de cuatro dígitos más A o B (`2027A`) | La Tabla 16 pide seguir "el catálogo institucional", que el equipo no tiene | Batch 3 | Aplicada de forma provisional en claves de catálogo, periodo y matrícula, y verificada por Great Expectations. Por ratificar con el catálogo real |
| D-12 | El intento de pago "sobre un movimiento" (Fig. 5) se liga al cargo mediante `referencia`, sin columna nueva | El modelo no liga pago con cargo; `movimiento.pago_id` solo liga el abono | Batch 9 | Por ratificar |
| D-13 | Al definir grupos, aula y profesor no pueden traslaparse en el mismo periodo | La Tabla 29 solo dice "restricciones de cupo y traslape" | Batch 7 | Aplicada como provisional en el Batch 7: el aula se compara sin mayúsculas, acentos ni espacios de más; también se rechazan sesiones del mismo grupo que se traslapan. Por ratificar |
| D-14 | Control escolar consulta inscripciones. La Tabla 5 dice que las "administra", y la Figura 1 no le da caso de uso de inscripción. El PO define si además puede ajustarlas | Hay que fijar el alcance antes de construir la pantalla | Batch 5 | Aplicada como provisional en el Batch 5: solo consulta. Por ratificar |
| D-15 | Un ajuste de la carga (Fig. 6, Ajustada → Confirmada) revalida las tres reglas de la Fig. 4, también el adeudo, y el cupo de los grupos nuevos. Si no pasa, el ajuste se descarta y la inscripción conserva la carga confirmada, porque la Fig. 6 no da a Ajustada otra salida | 13.1: "ninguna inscripción se confirma sin verificar requisitos, adeudos y choques". Consecuencia: un alumno con adeudo no puede ajustar hasta liquidarlo | Batch 5 | Por ratificar |

---

## 2. Inventario de reglas Must

Base de la métrica "Cobertura de reglas Must" (Tabla 59): reglas Must con prueba automatizada entre reglas Must totales. Meta: 100 % antes del piloto.

Se cuenta solo lo integrado en la rama de integración. El código de la rama local `feature/sce-modulos` no cuenta.

| ID | Regla | Fuente | Caso | Batch | Prueba integrada |
|---|---|---|---|---|---|
| R-01 | Un solo expediente por matrícula | RF-001, Fig. 8 | CF-EXP-01, CD-DAT-01 | 1 y 4 | Sí |
| R-02 | El cambio de plantel no duplica el expediente ni pierde historial | RF-001, RK-01 | CF-EXP-01 | 4 | Sí |
| R-03 | Sin prerrequisitos obligatorios no se confirma la carga | RF-002, Fig. 4 | CF-INS-01 | 5 | Sí |
| R-04 | Con adeudo vigente no se confirma la carga | RF-002, Fig. 4 | CF-INS-01 | 5 | Sí |
| R-05 | Con choque de horario no se confirma la carga, y se avisa antes | RF-003, Fig. 4 | CF-HOR-01 | 5 y 7 | Sí; desde el Batch 7, también al definir la oferta (D-13) |
| R-06 | Sin cupo la transacción revierte y la inscripción termina rechazada | Fig. 4, Tabla 29 | CF-INS-02, CI-API-01 | 5 | Sí |
| R-07 | Las validaciones van en orden fijo: prerrequisitos, adeudos y choques | Fig. 4 | CF-INS-01 | 5 | Sí |
| R-08 | Toda inscripción inválida termina en estado explícito con su causa | RNF-USU-001, Fig. 6 | CF-INS-02 | 5 | Sí |
| R-09 | El profesor captura solo en sus grupos asignados | RF-004 | CF-CAL-01 | 8 | No |
| R-10 | El alumno consulta la calificación al momento de la captura | RF-004 | CF-CAL-01, CI-CAL-01 | 8 | No |
| R-11 | Promedio con dos decimales y redondeo en una sola función | Tabla 16, RF-005 | CD-DAT-02 | 8 | No |
| R-12 | Los créditos acumulados coinciden con la regla publicada tras el cierre | RF-005, RNF-DAT-001 | CD-DAT-02 | 8 | No |
| R-13 | El avance de carrera se recalcula al cierre | RF-005 | CD-DAT-02 | 8 | No |
| R-14 | Un pago se refleja una sola vez, aunque la pasarela notifique varias | RF-006, Fig. 5 | CF-PAG-01, CI-PAG-01 | 9 | No |
| R-15 | Ante fallo de pasarela o de base, el estado queda pendiente y nunca confirmado | Tabla 15, RK-08 | CI-PAG-01 | 9 | No |
| R-16 | El trámite solo sigue las transiciones de la Fig. 6, con fecha visible | RF-007, RF-010 | CF-TRA-01, CF-TRA-02 | 10 | No |
| R-17 | No hay constancia sin historial | Tabla 16 | CF-TRA-01 | 10 | No |
| R-18 | La autorización se comprueba por rol y se deniega por omisión | RF-008, 14.1-7 | CI-AUTH-01, CF-ROL-01 | 2 | Sí, matriz completa sobre lo que existe |
| R-19 | Toda operación requiere autenticación; ningún endpoint Must es anónimo | RNF-SEG-001, Tabla 38 | CS-SEG-04 | 2 | Sí, con Newman |
| R-20 | La sesión expira y un token revocado no se reutiliza | Tabla 38 | CS-SEG-07 | 2 | Sí |
| R-21 | Todo cambio de calificación, pago, constancia o plantel deja autor, acción, valor anterior y fecha | RNF-SEG-001, Tabla 38 | CS-SEG-06 | 4, 8, 9 y 10 | Parcial: cambio de plantel |
| R-22 | La bitácora es inmutable | Tabla 29, RK-03 | Control de RK-03 | 1 | Sí |
| R-23 | Un alumno no accede a datos de otro alumno | RNF-SEG-002, 18.2 | CS-SEG-03 | 4 | Sí, sobre el expediente |
| R-24 | Caja no modifica el historial académico | 18.2, Tabla 10 | CS-SEG-02 | 4 | Parcial: hasta que existan calificaciones y pagos |

**Situación al 8 de noviembre de 2026, en la rama del Batch 5: 13 de 24 con prueba completa (R-01 a R-08, R-18, R-19, R-20, R-22 y R-23) y 2 parciales (R-21 y R-24).** R-05 se repitió con la interfaz de oferta en el Batch 7, que además aplica D-13 al definir grupos. Todavía no están integradas en la rama de integración, porque los PR esperan aprobación; la métrica se reporta en cada cierre de fase.

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
