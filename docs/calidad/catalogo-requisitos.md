# Catálogo de requisitos — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 9 (tablas 18, 19 y 20).
**Estado:** línea base de fase 0.
**Convención de identificadores:** sección 9.1 del manual.

La prioridad se expresa como **Must**, que bloquea la aceptación; **Should**, que exige plan de corrección antes de ampliar facultades; y **Could**, que se documenta como mejora.

---

## 1. Prefijos

| Prefijo | Tipo | Uso |
|---|---|---|
| RF | Funcional | Comportamiento de negocio visible al usuario. |
| RNF-REN | No funcional | Rendimiento: tiempos, concurrencia y capacidad. |
| RNF-USU | No funcional | Capacidad de interacción: claridad de flujos, estados y protección ante error. |
| RNF-FIA | No funcional | Fiabilidad: disponibilidad, recuperación y tolerancia a fallos. |
| RNF-SEG | No funcional | Seguridad: acceso, integridad, bitácora y no repudio. |
| RNF-DAT | No funcional | Datos: exactitud, consistencia y unicidad del expediente. |
| RNF-MAN | No funcional | Mantenibilidad: modularidad, pruebas y modificabilidad. |
| RNF-FLE | No funcional | Flexibilidad: adaptabilidad, escalabilidad e instalabilidad. |

---

## 2. Requisitos funcionales

| ID | Prioridad | Requisito verificable | Criterio de verificación |
|---|---|---|---|
| RF-001 | Must | El sistema mantiene un expediente único por alumno, identificado por matrícula, desde el ingreso hasta el egreso, incluso tras un cambio de plantel. | Caso CF-EXP-01: tras un cambio de facultad la consulta devuelve un solo expediente activo y el historial completo. |
| RF-002 | Must | El alumno puede iniciar y concluir su inscripción por semestre; el sistema verifica prerrequisitos académicos y adeudos antes de confirmar la carga. | Caso CF-INS-01: una carga con prerrequisito faltante o adeudo no se confirma y queda en estado explícito. |
| RF-003 | Must | La coordinación define materias, grupos, profesores y aulas del periodo, y el sistema detecta choques de horario antes de confirmar la inscripción. | Caso CF-HOR-01: dos grupos con traslape en el mismo día y hora generan un aviso de choque. |
| RF-004 | Must | El profesor captura calificaciones parciales únicamente de los grupos que tiene asignados, y el alumno las consulta al momento de la captura. | Caso CF-CAL-01: un profesor no puede capturar en un grupo ajeno; el alumno ve la calificación tras el commit. |
| RF-005 | Must | Al cierre del periodo el sistema recalcula promedio, créditos acumulados y avance de carrera, y actualiza el historial. | Caso CD-DAT-02: recálculo sobre una muestra de 30 expedientes con 100 % de coincidencia. |
| RF-006 | Must | El sistema genera cargos en el estado de cuenta y refleja el pago en línea una sola vez, sin depender de un comprobante en papel. | Caso CF-PAG-01: una doble notificación de la pasarela no duplica el movimiento. |
| RF-007 | Must | Control escolar emite constancia de estudios, no adeudo e historial académico, con estado y fecha visibles para el solicitante. | Caso CF-TRA-01: la solicitud muestra los estados recibida, en proceso, lista o rechazada con fecha. |
| RF-008 | Must | Cada uno de los seis roles accede únicamente a las funciones y datos autorizados para su perfil. | Caso CS-SEG-01: un token de alumno recibe 403 en endpoints de captura de calificaciones. |
| RF-009 | Should | Dirección consulta reportes agregados de inscripción, avance académico y cobranza de la facultad, sin capacidad de edición del historial. | Caso CF-REP-01: el rol dirección obtiene agregados y recibe 403 en cualquier operación de escritura. |
| RF-010 | Should | El alumno consulta en línea el estado de cada solicitud de trámite con la fecha de su última actualización. | Caso CF-TRA-02: la vista de trámites muestra estado y marca de tiempo por solicitud. |

---

## 3. Requisitos no funcionales

| ID | Prioridad | Requisito verificable | Criterio de verificación |
|---|---|---|---|
| RNF-REN-001 | Must | El percentil 95 del tiempo de respuesta es menor o igual a 3 segundos en inscripción y pago, y menor o igual a 2 segundos en consulta de horario y calificaciones, medido en el ambiente piloto. | Prueba de carga con Apache JMeter sobre el tag candidato; informe de percentiles. |
| RNF-REN-002 | Must | El ambiente piloto soporta 300 usuarios concurrentes en la semana de inscripción sin pérdida de solicitudes ni duplicación de grupos o pagos. | Prueba de carga y de concurrencia con k6; conteo de solicitudes enviadas frente a persistidas. |
| RNF-FIA-001 | Must | La disponibilidad del ambiente piloto es mayor o igual a 99,0 % en semana de inscripción y cortes de evaluación, y mayor o igual a 98,0 % el resto del semestre. | Registro de healthchecks y cálculo mensual de disponibilidad. |
| RNF-FIA-002 | Must | Existe procedimiento de respaldo diario y restauración del expediente con pérdida máxima de datos menor a 24 horas, demostrado al menos una vez por periodo. | Acta de restauración con fecha, tag, base restaurada y resultado. |
| RNF-SEG-001 | Must | Toda operación requiere autenticación y autorización por rol. Cada cambio de calificación, pago o constancia queda registrado en bitácora con usuario, acción, valor anterior y fecha. | Casos CS-SEG-01 a CS-SEG-06 y revisión de la tabla de bitácora. |
| RNF-SEG-002 | Must | Los datos personales, académicos y de pago no se exponen entre alumnos ni a roles no autorizados, incluidas las respuestas de la API y los registros de aplicación. | Prueba de manipulación de identificadores con OWASP ZAP y revisión de logs. |
| RNF-DAT-001 | Must | No existen matrículas duplicadas en el piloto, y promedio y créditos coinciden con las reglas publicadas del periodo tras el cierre. | Consulta de duplicados con resultado cero y conciliación de la muestra de cierre. |
| RNF-USU-001 | Must | Toda inscripción inválida termina en un estado explícito que indica la causa: adeudo, prerrequisito o choque de horario. | Caso CF-INS-02: los tres escenarios de rechazo muestran mensaje y estado distinguibles. |
| RNF-MAN-001 | Must | Las reglas de prerrequisitos, adeudos, choques, promedio y créditos cuentan con pruebas automatizadas ejecutables en el pipeline antes del despliegue a piloto. | Reporte de cobertura con 100 % de reglas Must cubiertas y 80 % de cobertura en el dominio. |
| RNF-FLE-001 | Should | La incorporación de una segunda facultad no requiere modificar el esquema de la base de datos ni duplicar catálogos institucionales. | Prueba de alta de una facultad adicional en staging sin migración estructural. |

---

## 4. Resumen

| Concepto | Cantidad |
|---|---|
| Requisitos funcionales | 10 |
| Requisitos no funcionales | 10 |
| **Total** | **20** |
| De prioridad Must | 17 |
| De prioridad Should | 3 (RF-009, RF-010, RNF-FLE-001) |

> Ningún incremento de las fases 1 a 5 se acepta si queda abierto un requisito Must sin evidencia de prueba o con resultado fallido (manual, sección 9.4).
