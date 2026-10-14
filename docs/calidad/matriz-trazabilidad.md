# Matriz de trazabilidad — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 12.3 (Tabla 27).
**Estado:** línea base de fase 0, completada al 100 % de los requisitos.

---

## 1. Por qué se completó

La Tabla 27 del manual v2.0 contiene **diez** filas y cubre RF-001 a RF-008, RNF-DAT-001 y RNF-REN-001. El catálogo de la sección 9 declara **veinte** requisitos. Quedaban sin fila: RF-009, RF-010, RNF-REN-002, RNF-FIA-001, RNF-FIA-002, RNF-SEG-001, RNF-SEG-002, RNF-USU-001, RNF-MAN-001 y RNF-FLE-001.

Las filas nuevas no inventan requisitos ni pruebas: toman el criterio de verificación que el propio manual ya fija para cada requisito en las tablas 19 y 20, y le asignan identificador de caso siguiendo la convención existente. La columna **Origen** distingue lo que ya estaba de lo que se añade.

Esta matriz se actualiza en cada sprint siguiendo la cadena requisito, diseño, código, caso de prueba, resultado y acta (manual, sección 12.3).

---

## 2. Matriz

| Requisito | Módulo | Caso de prueba | Fase | Origen |
|---|---|---|---|---|
| RF-001 | Expediente | CF-EXP-01 | 2 | Tabla 27 v2.0 |
| RF-002 | Inscripción | CF-INS-01, CF-INS-02 | 2 | Tabla 27 v2.0 |
| RF-003 | Horarios | CF-HOR-01 | 3 | Tabla 27 v2.0 |
| RF-004 | Calificaciones | CF-CAL-01 | 3 | Tabla 27 v2.0 |
| RF-005 | Historial | CD-DAT-02 | 3 y 5 | Tabla 27 v2.0 |
| RF-006 | Pagos | CF-PAG-01, CI-PAG-01 | 4 | Tabla 27 v2.0 |
| RF-007 | Trámites | CF-TRA-01 | 4 | Tabla 27 v2.0 |
| RF-008 | Seguridad y acceso | CS-SEG-01 a CS-SEG-04 | 1 a 4 | Tabla 27 v2.0 |
| RF-009 | Reportes | CF-REP-01 | 5 | Añadida |
| RF-010 | Trámites | CF-TRA-02 | 4 | Añadida |
| RNF-REN-001 | Desempeño | CR-REN-01 | 5 | Tabla 27 v2.0 |
| RNF-REN-002 | Desempeño | CR-REN-02 | 5 | Añadida |
| RNF-FIA-001 | Operación y monitoreo | CO-FIA-01 | 5 | Añadida |
| RNF-FIA-002 | Continuidad | CO-FIA-02 | 5 | Añadida |
| RNF-SEG-001 | Seguridad y bitácora | CS-SEG-01 a CS-SEG-06 | 1 a 5 | Añadida |
| RNF-SEG-002 | Seguridad y datos | CS-SEG-07, CS-SEG-08 | 2 a 5 | Añadida |
| RNF-DAT-001 | Datos y expediente | CD-DAT-01 | 2 y 5 | Tabla 27 v2.0 |
| RNF-USU-001 | Inscripción | CF-INS-02 | 2 | Añadida |
| RNF-MAN-001 | Pipeline y dominio | CO-MAN-01 | 1 a 5 | Añadida |
| RNF-FLE-001 | Catálogos institucionales | CO-FLE-01 | 5 | Añadida |

**Cobertura: 20 de 20 requisitos.**

---

## 3. Catálogo de casos de prueba

Las familias **CF**, **CI**, **CS**, **CD** y **CR** son las que el manual ya usa. Se propone una familia **CO** (caso de operación) para los requisitos que se verifican operando el ambiente o el pipeline, no ejecutando un flujo de negocio.

| Caso | Requisito | Qué verifica | Origen |
|---|---|---|---|
| CF-EXP-01 | RF-001 | Tras un cambio de facultad la consulta devuelve un solo expediente activo y el historial completo. | Manual, Tabla 19 |
| CF-INS-01 | RF-002 | Una carga con prerrequisito faltante o adeudo no se confirma y queda en estado explícito. | Manual, Tabla 19 |
| CF-INS-02 | RF-002, RNF-USU-001 | Los tres escenarios de rechazo muestran mensaje y estado distinguibles. | Manual, Tabla 20 |
| CF-HOR-01 | RF-003 | Dos grupos con traslape en el mismo día y hora generan aviso de choque. | Manual, Tabla 19 |
| CF-CAL-01 | RF-004 | Un profesor no captura en grupo ajeno; el alumno ve la calificación tras el commit. | Manual, Tabla 19 |
| CF-PAG-01 | RF-006 | Una doble notificación de la pasarela no duplica el movimiento. | Manual, Tabla 19 |
| CF-TRA-01 | RF-007 | La solicitud muestra los estados recibida, en proceso, lista o rechazada con fecha. | Manual, Tabla 19 |
| CF-TRA-02 | RF-010 | La vista de trámites muestra estado y marca de tiempo por solicitud. | Manual, Tabla 19 |
| CF-REP-01 | RF-009 | El rol dirección obtiene agregados y recibe 403 en cualquier operación de escritura. | Manual, Tabla 19 |
| CI-PAG-01 | RF-006 | Integración con el sandbox de la pasarela, incluido el reintento. | Manual, Tabla 27 y Anexo A |
| CS-SEG-01 | RF-008, RNF-SEG-001 | Un token de alumno recibe 403 en endpoints de captura de calificaciones. | Manual, Tabla 19 |
| CS-SEG-02 | RF-008, RNF-SEG-001 | Un token de profesor recibe 403 en operaciones de caja y de control escolar. | Propuesto |
| CS-SEG-03 | RF-008, RNF-SEG-001 | Un token de dirección recibe 403 en cualquier escritura sobre el historial. | Propuesto |
| CS-SEG-04 | RF-008, RNF-SEG-001 | Un token expirado o revocado recibe 401 en todo endpoint. | Propuesto |
| CS-SEG-05 | RNF-SEG-001 | Todo cambio de calificación, pago o constancia deja fila en bitácora con autor, acción, valor anterior y fecha. | Propuesto |
| CS-SEG-06 | RNF-SEG-001 | La bitácora rechaza UPDATE y DELETE, incluso con rol de administrador de base de datos. | Propuesto |
| CS-SEG-07 | RNF-SEG-002 | La manipulación del identificador en la API no devuelve datos de otro alumno (prueba con OWASP ZAP). | Propuesto |
| CS-SEG-08 | RNF-SEG-002 | Los registros de aplicación no contienen datos personales, académicos ni de pago. | Propuesto |
| CD-DAT-01 | RNF-DAT-001 | Consulta de matrículas duplicadas con resultado cero. | Manual, Tabla 27 |
| CD-DAT-02 | RF-005 | Recálculo de promedio, créditos y avance sobre 30 expedientes con 100 % de coincidencia. | Manual, Tabla 19 |
| CR-REN-01 | RNF-REN-001 | Prueba de carga con JMeter sobre el tag candidato; percentil 95 dentro de la meta. | Manual, Tabla 27 |
| CR-REN-02 | RNF-REN-002 | Prueba de concurrencia con k6: 300 usuarios, sin pérdida de solicitudes ni duplicación. | Propuesto |
| CR-REN-03 | RNF-REN-001 y 002 | Prueba de estrés: punto de quiebre y comportamiento de degradación. | Propuesto |
| CR-REN-04 | RNF-REN-001 y 002 | Prueba de pico: ráfaga de inicio de inscripción. | Propuesto |
| CR-REN-05 | RNF-REN-001 y 002 | Prueba de resistencia de varias horas: fugas de memoria y degradación progresiva. | Propuesto |
| CO-FIA-01 | RNF-FIA-001 | Registro de healthchecks y cálculo mensual de disponibilidad frente a la meta. | Propuesto |
| CO-FIA-02 | RNF-FIA-002 | Restauración cronometrada del expediente, con acta de fecha, tag, base restaurada y resultado. | Propuesto |
| CO-MAN-01 | RNF-MAN-001 | Reporte de cobertura del pipeline: 100 % de reglas Must y 80 % en el dominio. | Propuesto |
| CO-FLE-01 | RNF-FLE-001 | Alta de una facultad adicional en staging sin migración estructural. | Propuesto |

---

## 4. Nota sobre los casos de seguridad

El manual v2.0 nombra el conjunto CS-SEG con tres alcances distintos:

| Dónde | Rango declarado |
|---|---|
| Tabla 27, sección 12.3 (para RF-008) | CS-SEG-01 a CS-SEG-04 |
| Tabla 20, sección 9.3 (para RNF-SEG-001) | CS-SEG-01 a CS-SEG-06 |
| Anexo A, sección 43.1 (para Seguridad) | CS-SEG-01 a CS-SEG-08 |

Este catálogo los reconcilia sin contradecir ninguno de los tres: **CS-SEG-01 a 04** cubren el acceso por rol de RF-008; **CS-SEG-01 a 06** cubren además la bitácora de RNF-SEG-001; y **CS-SEG-07 y 08** cubren la no exposición de datos de RNF-SEG-002, con lo que el conjunto completo llega a ocho, como declara el Anexo A.

La corrección de las tres referencias en el manual requiere una nueva versión y queda sujeta al control de cambios de la sección 12.4.
