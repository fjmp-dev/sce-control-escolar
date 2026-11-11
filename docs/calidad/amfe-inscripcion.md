# AMFE de la inscripción — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 37 ("Análisis modal de fallos y efectos: módulos críticos, inscripción y pagos; tabla de modos de fallo con número de prioridad de riesgo"), sección 13.4 (Fig. 4), 13.5 (Fig. 6) y Tabla 29.
**Versión:** 1.0, 8 de noviembre de 2026, al inicio del Batch 5 y antes del código. Se revisa al cierre de la fase 2 y en el Batch 12. El AMFE de pagos se hace al inicio del Batch 9.
**Elabora:** FJMP. **Revisa:** SJOM como QA (regla 3 del plan de sistema).

## 1. Escalas

Cada modo de fallo recibe tres calificaciones de 1 a 10. El número de prioridad de riesgo (NPR) es su producto.

| Calificación | 1 | 4 | 7 | 10 |
|---|---|---|---|---|
| **Severidad (S)** | Sin efecto para el alumno | Molestia; el alumno corrige y repite | Carga o expediente incorrectos; requiere corrección manual | Daño al expediente o a la cobranza que nadie detecta |
| **Ocurrencia (O)** | Casi imposible con los controles | Ocasional en la semana de inscripción | Frecuente con concurrencia o datos reales | Casi seguro |
| **Detección (D)** | La prueba automatizada lo detecta en cada PR | Lo detecta una prueba o consulta periódica | Solo lo ve una revisión manual | Nadie lo detecta antes del alumno |

**Umbral:** un NPR de 100 o más exige una acción con responsable y batch. Una severidad de 9 o más exige un control preventivo aunque el NPR sea bajo.

## 2. Modos de fallo

Ordenados por NPR. Los controles se implementan en el Batch 5, salvo donde se indica otro.

| # | Función | Modo de fallo | Efecto | Causa posible | Control preventivo | Control de detección | S | O | D | NPR |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Atender la semana de inscripción | Caída o lentitud con toda la facultad | Alumnos sin inscribirse en plazo (RK-04) | Concurrencia, consultas lentas, un solo servidor | Índices de la Fig. 8 y transacción corta | Rendimiento CR-REN-01 y 02 y monitoreo del percentil 95 (**Batch 13**) | 8 | 5 | 5 | **200** |
| 2 | Reservar cupo | Dos alumnos obtienen el último lugar (sobrecupo) | Grupo con más alumnos que cupo | Lectura del cupo fuera de la transacción | `UPDATE grupo SET ocupacion = ocupacion + 1 WHERE ocupacion < cupo` dentro de la transacción (Fig. 4) y `CHECK ck_grupo_cupo` en la base | CI-API-01 con inscripciones simultáneas sobre el último lugar; k6 en el Batch 13 | 8 | 5 | 3 | **120** |
| 3 | Detectar choques | Un choque de horario pasa sin detectarse | Alumno inscrito en dos clases a la vez (RK-05) | Comparación de límites, grupos con varios horarios, días distintos | `Horario.traslapaCon` en el dominio, con extremos abiertos | CF-HOR-01 con Jest (valores límite) y Cypress | 7 | 4 | 2 | 56 |
| 4 | Ajustar la carga | Una baja de grupo no libera su lugar | Grupo que aparece lleno sin estarlo | Liberar fuera de la transacción o solo en algunos caminos | Alta y baja de lugares en la misma transacción del ajuste | Consulta de ocupación contra inscritos, con SQL y Great Expectations en cada PR | 6 | 3 | 3 | 54 |
| 5 | Validar prerrequisitos | Se confirma una carga sin un prerrequisito obligatorio | Historial inválido (R-03) | Contar un periodo no cerrado, ignorar el último intento, comparar sin redondear | Solo periodos cerrados; último intento y redondeo half-up de D-5 en una sola función | CF-INS-01 con Cypress; Jest con valores límite de 5.99 y 6.00 | 8 | 3 | 2 | 48 |
| 6 | Registrar la inscripción | Dos inscripciones del mismo alumno en un periodo (doble envío) | Carga duplicada y cupo doble | Doble clic o reintento de red | Clave única `(matricula, periodo_clave)` y folio determinista | Supertest con envíos simultáneos del mismo alumno | 6 | 4 | 2 | 48 |
| 7 | Mantener la carga íntegra | Inscripción sin carga o cupo reservado sin inscripción | Datos incompletos (CD-DAT-05) | Escrituras fuera de una sola transacción | Una transacción con reserva, inscripción, carga y bitácora (14.1-6) | CD-DAT-05 con SQL y Great Expectations; CI-API-01 | 7 | 2 | 3 | 42 |
| 8 | Validar adeudos | Se confirma con adeudo vigente | Cobranza perdida (R-04) | Saldo no leído o cuenta inexistente tomada como sin adeudo | `CuentaAlumno.tieneAdeudo()` con D-10; todo expediente nace con cuenta | CF-INS-01 con Cypress; Supertest | 6 | 3 | 2 | 36 |
| 9 | Proteger la carga ajena | Un alumno inscribe o ajusta la carga de otro | Carga alterada por un tercero (CS-SEG-03) | Matrícula o folio tomados de la petición | La matrícula sale de la sesión; un folio ajeno responde 404 | CS-SEG-03 con Supertest | 9 | 2 | 2 | 36 |
| 10 | Informar el rechazo | Rechazo sin causa o con mensaje genérico | El alumno no sabe qué corregir (RNF-USU-001) | Motivo no guardado o error genérico | `CHECK ck_inscripcion_motivo`; estado y mensaje por motivo (Fig. 6) | CF-INS-02 con Cypress | 5 | 3 | 2 | 30 |
| 11 | Respetar el plazo | Inscripción o ajuste fuera de plazo | Carga cambiada en periodo en curso | Estado del periodo no revisado | Solo con el periodo `abierto` (D-6) | Supertest | 5 | 3 | 2 | 30 |
| 12 | Respetar el estatus | Un alumno en baja o egresado se inscribe | Carga de un expediente inactivo | Estatus no revisado | La inscripción exige expediente activo (Fig. 4) | Supertest | 6 | 2 | 2 | 24 |
| 13 | Dejar traza del rechazo | Rechazo sin persistir o sin bitácora | La tasa de conclusión no se puede calcular (CC-013) | El rechazo revierte junto con la confirmación | Rechazo en una transacción aparte, con bitácora | CI-API-01 | 4 | 2 | 3 | 24 |
| 14 | Aplicar el orden fijo | Se informa un motivo distinto al de la Fig. 4 | Mensaje equivocado (R-07) | Validaciones en otro orden | `Inscripcion.validar` en el orden prerrequisitos, adeudos y choques | Tabla de decisión con Jest | 4 | 2 | 2 | 16 |

## 3. Acciones

| Modo | Acción | Responsable | Batch | Estado |
|---|---|---|---|---|
| 1 | Pruebas de carga y concurrencia en staging, monitoreo del percentil 95 | DevOps | 13 | Abierta |
| 2 | Prueba de concurrencia sobre el último lugar en CI-API-01 | Desarrollo | 5 | Ver informe del Batch 5 |
| 2 | Concurrencia de 100 alumnos por 5 lugares, CR-REN-02 | DevOps | 13 | Abierta |
| 9 | Escaneo de acceso cruzado con ZAP | Seguridad | 12 | Abierta |

Los modos 6 y 9 tienen severidad de 6 y 9: el 9 tiene control preventivo en el diseño. Tras el Batch 5 se recalculan O y D con la evidencia del pipeline.

## 4. Revisión

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| QA | Samuel Jezoar Ortiz Martínez | | | |
