# Matriz de trazabilidad — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 12.3 (Tabla 27) y tablas 39, 43, 45, 47 y 49.
**Versión:** 2.5, 10 de noviembre de 2026 (Batch 8).

La matriz se actualiza en cada sprint siguiendo la cadena requisito, diseño, código, caso de prueba, resultado y acta (manual, sección 12.3). El orden de construcción y los batches están en `docs/gobierno/plan-de-sistema.md`.

---

## 1. Por qué tiene veinte filas

La Tabla 27 del manual v2.0 contiene **diez** filas y cubre RF-001 a RF-008, RNF-DAT-001 y RNF-REN-001. El catálogo de la sección 9 declara **veinte** requisitos. Quedaban sin fila: RF-009, RF-010, RNF-REN-002, RNF-FIA-001, RNF-FIA-002, RNF-SEG-001, RNF-SEG-002, RNF-USU-001, RNF-MAN-001 y RNF-FLE-001.

Las filas nuevas no inventan requisitos: toman el criterio de verificación que el propio manual fija en las tablas 19 y 20 (CC-001). La columna **Origen** distingue lo que ya estaba de lo que se añade.

---

## 2. Matriz

| Requisito | Módulo | Caso de prueba | Fase | Batch | Origen |
|---|---|---|---|---|---|
| RF-001 | Expediente | CF-EXP-01 | 2 | 4 | Tabla 27 |
| RF-002 | Inscripción | CF-INS-01, CF-INS-02, CI-API-01 | 2 | 5 | Tabla 27 |
| RF-003 | Horarios | CF-HOR-01 | 3 | 5 y 7 | Tabla 27 |
| RF-004 | Calificaciones | CF-CAL-01, CI-CAL-01 | 3 | 8 | Tabla 27 |
| RF-005 | Historial | CD-DAT-02 | 3 y 5 | 8 y 14 | Tabla 27 |
| RF-006 | Pagos | CF-PAG-01, CI-PAG-01 | 4 | 9 | Tabla 27 |
| RF-007 | Trámites | CF-TRA-01 | 4 | 10 | Tabla 27 |
| RF-008 | Seguridad y acceso | CS-SEG-01 a CS-SEG-04, CF-ROL-01, CI-AUTH-01 | 1 a 4 | 2, 3 y cada módulo | Tabla 27 |
| RF-009 | Reportes | CF-REP-01 | 4 | 11 | Añadida. Fase 4 por AU-28 de PA-SCE-001 |
| RF-010 | Trámites | CF-TRA-02 | 4 | 10 | Añadida |
| RNF-REN-001 | Desempeño | CR-REN-01 | 5 | 13 y 14 | Tabla 27 |
| RNF-REN-002 | Desempeño | CR-REN-02 | 5 | 13 y 14 | Añadida |
| RNF-FIA-001 | Operación y monitoreo | CO-FIA-01 | 5 | 13 y 14 | Añadida |
| RNF-FIA-002 | Continuidad | CO-FIA-02 | 5 | 13 y 14 | Añadida |
| RNF-SEG-001 | Seguridad y bitácora | CS-SEG-01 a CS-SEG-06 | 1 a 5 | 2, 4 a 10 | Añadida, rango de la Tabla 20 |
| RNF-SEG-002 | Seguridad y datos | CS-SEG-03, CS-SEG-05, CS-SEG-08 | 2 a 5 | 2, 4 y 12 | Añadida, criterio de la Tabla 20 |
| RNF-DAT-001 | Datos y expediente | CD-DAT-01 a CD-DAT-06 | 2 y 5 | 1, 4, 8, 12 y 14 | Tabla 27 y Anexo A |
| RNF-USU-001 | Inscripción | CF-INS-02 | 2 | 5 | Añadida |
| RNF-MAN-001 | Pipeline y dominio | CO-MAN-01 | 1 a 5 | 1 y cada módulo | Añadida |
| RNF-FLE-001 | Catálogos institucionales | CO-FLE-01 | 5 | 11 y 13 | Añadida |

**Cobertura: 20 de 20 requisitos.** CS-SEG-07 (sesión) cubre el control de sesiones de la Tabla 38 y se traza a RF-008 y a RNF-SEG-001 mediante el Anexo A.

---

## 3. Catálogo de casos de prueba

La definición y la herramienta de cada caso son las del manual. El **Batch** es donde el caso nace; los casos de rol y de identificadores se repiten en cada módulo nuevo.

### 3.1 Funcionales (Tabla 43)

| Caso | Requisito | Resultado esperado | Herramienta | Batch |
|---|---|---|---|---|
| CF-EXP-01 | RF-001 | Un alumno tiene un solo expediente activo; el cambio de plantel no lo duplica. | Jest y Supertest | 4 |
| CF-INS-01 | RF-002 | Una inscripción con adeudo o prerrequisito faltante queda en estado explícito y no confirma la carga. | Cypress | 5 |
| CF-INS-02 | RNF-USU-001 | Los tres motivos de rechazo se distinguen con mensaje y estado propios. | Cypress | 5 |
| CF-HOR-01 | RF-003 | El choque de horario se detecta y se comunica antes de confirmar. | Jest y Cypress | 5 y 7 |
| CF-CAL-01 | RF-004 | El profesor captura solo en sus grupos y el alumno consulta al momento. | Cypress | 8 |
| CF-PAG-01 | RF-006 | El pago confirmado se refleja una sola vez en el estado de cuenta. | Newman y Cypress | 9 |
| CF-TRA-01 | RF-007 | La solicitud de constancia muestra estado y fecha. | Cypress | 10 |
| CF-TRA-02 | RF-010 | El alumno consulta el estado de cada trámite con marca de tiempo. | Cypress | 10 |
| CF-ROL-01 | RF-008 | Cada rol ve solo su parte; el alumno no edita calificaciones. | Supertest; en el portal, también Cypress | 2 y siguientes |
| CF-REP-01 | RF-009 | Dirección obtiene reportes agregados y no puede escribir en el historial. | Supertest | 11 |

### 3.2 Integración (Tabla 45)

| Caso | Resultado esperado | Herramienta | Batch |
|---|---|---|---|
| CI-API-01 | La inscripción confirmada persiste la carga y deja traza; si falla la validación se revierte la transacción completa. | Supertest y Testcontainers | 5 |
| CI-PAG-01 | Una doble notificación de pago no duplica el movimiento en el estado de cuenta. | Newman | 9 |
| CI-CAL-01 | La captura y la consulta de calificaciones leen el mismo registro después del commit. | Supertest | 8 |
| CI-AUTH-01 | El token de un rol no autoriza un endpoint de otro rol. | Supertest | 2 |
| CI-MIG-01 | Las migraciones se aplican sobre una base limpia y sobre una base con datos sin pérdida de información. | Prisma y Testcontainers | 1 |

### 3.3 Seguridad (Tabla 49)

| Caso | Resultado esperado | Herramienta | Batch |
|---|---|---|---|
| CS-SEG-01 | El rol alumno no captura ni altera calificaciones. | Supertest | 8 |
| CS-SEG-02 | El rol caja no modifica el historial académico. | Supertest | 4, 8 y 9 |
| CS-SEG-03 | El token de un alumno no accede al expediente de otro alumno. | OWASP ZAP y Supertest | 4 y siguientes |
| CS-SEG-04 | Un endpoint Must sin token responde con código 401. | Newman | 2 y siguientes |
| CS-SEG-05 | Una entrada malformada no corrompe la base ni expone trazas con secretos. | OWASP ZAP | 2 y 12 |
| CS-SEG-06 | Todo cambio de calificación, pago o constancia deja registro en bitácora. | Consulta SQL de verificación | 4, 8, 9, 10 y 11 |
| CS-SEG-07 | La sesión expira en el tiempo configurado y el token revocado no se reutiliza. | Supertest | 2 |
| CS-SEG-08 | No existen secretos en el repositorio, en los registros ni en las respuestas de la API. | Gitleaks y revisión manual | 1, 2 y 12 |

### 3.4 Calidad de datos (Tabla 39)

| Caso | Verificación | Frecuencia | Meta | Batch |
|---|---|---|---|---|
| CD-DAT-01 | Detección de matrículas duplicadas en la tabla alumno. | Cada ejecución del pipeline | Cero duplicados | 1 |
| CD-DAT-02 | Recálculo de promedio y créditos sobre muestra de 30 expedientes al cierre de periodo. | Cierre de cada periodo | 100 % de coincidencia con la regla publicada | 8 y 14 |
| CD-DAT-03 | Conciliación entre estado de cuenta del alumno y corte de caja. Con la pasarela simulada es interna (CC-020): saldo contra movimientos, un solo abono por pago aplicado, ningún movimiento de un pago no aplicado y corte del día contra sus abonos (`cd-dat-03.sql`, suite `conciliacion`, `integracion/datos.spec.ts` y `pagos.spec.ts`; sub-batch 12.1). | Diaria en piloto; aquí, en cada pull request | Cero diferencias no explicadas | 9, 12 y 14 |
| CD-DAT-04 | Integridad referencial: ausencia de calificaciones sin grupo, periodo o profesor. | Cada ejecución del pipeline | Cero registros huérfanos | 1 |
| CD-DAT-05 | Completitud: inscripciones sin matrícula, periodo o carga. | Semanal en inscripción | Cero registros incompletos | 5 y 14 |
| CD-DAT-06 | Actualidad: diferencia entre confirmación de pago y reflejo en estado de cuenta, con `pago.fecha_confirmacion` (CC-011; `cd-dat-06.sql`, suite `actualidad`, `integracion/datos.spec.ts` y `pagos.spec.ts`; sub-batch 12.1). Con la pasarela simulada se cumple por construcción (`plan-de-sistema.md`, 6.2). | Continua en piloto; aquí, en cada pull request | Menor a un minuto en el 95 % de los casos | 9, 12 y 14 |

Herramienta: consultas SQL de verificación (`api/prisma/verificacion/`) y Great Expectations (Tabla 42, `scripts/calidad-datos.py`).

### 3.5 Rendimiento (Anexo A y Tabla 47)

El manual nombra CR-REN-01 a 05 y define cinco tipos de prueba, pero no asigna un identificador a cada tipo. Esta correspondencia es **propuesta** y se aprueba en la siguiente versión del manual (#8).

| Caso | Tipo (Tabla 47) | Escenario | Herramienta |
|---|---|---|---|
| CR-REN-01 | Carga | 300 usuarios virtuales durante 15 minutos; perfil de lectura intensiva | JMeter |
| CR-REN-02 | Concurrencia | 300 usuarios sin pérdida ni duplicación; 100 alumnos por los últimos 5 lugares | k6 |
| CR-REN-03 | Estrés | Incremento progresivo hasta 800 usuarios | JMeter |
| CR-REN-04 | Pico | Salto de 50 a 400 usuarios en un minuto | JMeter |
| CR-REN-05 | Resistencia | Carga media durante cuatro horas continuas | JMeter |

### 3.6 Operación (propuestos)

La Tabla 20 fija el criterio de verificación de estos requisitos, pero no les asigna caso. La Tabla 31 no incluye el prefijo `CO`. Se proponen y se aprueban en la siguiente versión del manual.

| Caso | Requisito | Qué verifica | Batch |
|---|---|---|---|
| CO-FIA-01 | RNF-FIA-001 | Registro de healthchecks y cálculo mensual de disponibilidad frente a la meta. | 13 y 14 |
| CO-FIA-02 | RNF-FIA-002 | Restauración cronometrada del expediente, con acta de fecha, etiqueta, base restaurada y resultado. | 13 y 14 |
| CO-MAN-01 | RNF-MAN-001 | Reporte de cobertura del pipeline: 100 % de reglas Must y 80 % en el dominio. Desde el sub-batch 11.2, `scripts/reglas-must.sh` cuenta en la etapa 2 las reglas Must que tienen prueba con su ID en el título, publica el reporte `reglas-must` y falla por debajo de 100 %. | 1, 11 y cada módulo |
| CO-FLE-01 | RNF-FLE-001 | Alta de una facultad adicional en staging sin migración estructural. | 11 y 13 |

---

## 3.7 Documentos que acompañan a esta matriz

- `docs/calidad/matriz-rol-endpoint.md`: rol por endpoint (AU-15), ejecutada por CF-ROL-01 y CI-AUTH-01.
- `docs/calidad/stride.md`: amenazas y controles por componente (Tabla 37).
- `docs/calidad/revision-cs-seg-08.md`: revisión manual de CS-SEG-08.
- `docs/calidad/accesibilidad.md`: lista de 28.1, hallazgos y compatibilidad (AU-32).
- `docs/calidad/informe-fase-1.md`: tablero de la Tabla 59 y lista de QA.
- `docs/gobierno/respuesta-a-incidentes.md`: procedimiento de la Tabla 38 (AU-18).
- `docs/api/openapi.json`: contrato de la API, generado desde los decoradores (14.4).

---

## 4. Nota sobre los casos de seguridad

El manual menciona el conjunto CS-SEG con tres rangos, pero **define cada caso una sola vez: en la Tabla 49**. Esa es la definición que rige, y es la que usa el plan de auditoría PA-SCE-001 (AU-14 cita CS-SEG-04 y 07; AU-15, CS-SEG-01 a 03; AU-16, CS-SEG-06).

| Dónde | Rango mencionado |
|---|---|
| Tabla 27, sección 12.3 (para RF-008) | CS-SEG-01 a CS-SEG-04 |
| Tabla 20, sección 9.3 (para RNF-SEG-001) | CS-SEG-01 a CS-SEG-06 |
| Anexo A, sección 43.1 (para Seguridad) | CS-SEG-01 a CS-SEG-08 |

La versión anterior de este catálogo redefinió CS-SEG-02 a 08 con significados propios. Fue un error, registrado como NC-007 y corregido el 5 de noviembre de 2026. La inmutabilidad de la bitácora, que antes se llamaba CS-SEG-06, se conserva como prueba automatizada y como control de RK-03, sin identificador CS-SEG.
