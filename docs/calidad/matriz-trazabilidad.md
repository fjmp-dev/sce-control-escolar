# Matriz de trazabilidad — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 12.3 (Tabla 27) y tablas 39, 43, 45, 47 y 49.
**Versión:** 2.6, 11 de noviembre de 2026 (sub-batches 12.2 y 12.5: ZAP con los siete roles, CC-021 y Parte B).

La matriz se actualiza en cada sprint siguiendo la cadena requisito, diseño, código, caso de prueba, resultado y acta (manual, sección 12.3). El orden de construcción y los batches están en `docs/gobierno/plan-de-sistema.md`.

---

## 1. Por qué tiene veintidós filas

La Tabla 27 del manual v2.0 contiene **diez** filas y cubre RF-001 a RF-008, RNF-DAT-001 y RNF-REN-001. El catálogo de la sección 9 declara **veinte** requisitos. Quedaban sin fila: RF-009, RF-010, RNF-REN-002, RNF-FIA-001, RNF-FIA-002, RNF-SEG-001, RNF-SEG-002, RNF-USU-001, RNF-MAN-001 y RNF-FLE-001.

Las filas nuevas no inventan requisitos: toman el criterio de verificación que el propio manual fija en las tablas 19 y 20 (CC-001). La columna **Origen** distingue lo que ya estaba de lo que se añade.

Desde el 11 de noviembre de 2026 son veintidós: CC-021 añade RNF-USU-002 (accesibilidad, sección 28) y RNF-FLE-002 (compatibilidad, Tabla 50), que el manual exige sin requisito en la sección 9.

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
| RNF-USU-002 | Portal, flujos críticos | CO-ACC-01, CO-ACC-02, CO-ACC-03 | 1 a 5 | 3, 12 y cada interfaz | CC-021, sección 28 |
| RNF-FLE-002 | Portal, Tabla 50 | CO-COM-01 | 1 a 5 | 12 y cada interfaz | CC-021, sección 27 |

**Cobertura: 22 de 22 requisitos.** CS-SEG-07 (sesión) cubre el control de sesiones de la Tabla 38 y se traza a RF-008 y a RNF-SEG-001 mediante el Anexo A.

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
| CS-SEG-03 | El token de un alumno no accede al expediente de otro alumno. | Supertest y, desde 12.2, OWASP ZAP (`zap-acceso-cruzado.sh`, etapa 5) | 4 y siguientes; 12 |
| CS-SEG-04 | Un endpoint Must sin token responde con código 401. | Newman | 2 y siguientes |
| CS-SEG-05 | Una entrada malformada no corrompe la base ni expone trazas con secretos. | OWASP ZAP con los siete roles y Great Expectations después (`zap.sh`); el portal, con `zap-portal.sh` cada semana | 2 y 12 |
| CS-SEG-06 | Todo cambio de calificación, pago o constancia deja registro en bitácora. | Consulta SQL de verificación | 4, 8, 9, 10 y 11 |
| CS-SEG-07 | La sesión expira en el tiempo configurado y el token revocado no se reutiliza. | Supertest | 2 |
| CS-SEG-08 | No existen secretos en el repositorio, en los registros ni en las respuestas de la API. | Gitleaks y revisión manual (v2 en 12.2, con el portal) | 1, 2 y 12 |

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

### 3.6 Operación, accesibilidad, compatibilidad y modularidad (familia `CO-`)

La Tabla 20 fija el criterio de verificación de estos requisitos, pero no les asigna caso. El prefijo `CO` entra en la Tabla 31 con la corrección #11 del manual v3.0; CO-ACC, CO-COM y CO-MAN-02 los aprueba CC-021.

| Caso | Requisito | Qué verifica | Batch |
|---|---|---|---|
| CO-FIA-01 | RNF-FIA-001 | Registro de healthchecks y cálculo mensual de disponibilidad frente a la meta. | 13 y 14 |
| CO-FIA-02 | RNF-FIA-002 | Restauración cronometrada del expediente, con acta de fecha, etiqueta, base restaurada y resultado. | 13 y 14 |
| CO-MAN-01 | RNF-MAN-001 | Reporte de cobertura del pipeline: 100 % de reglas Must y 80 % en el dominio. Desde el sub-batch 11.2, `scripts/reglas-must.sh` cuenta en la etapa 2 las reglas Must que tienen prueba con su ID en el título, publica el reporte `reglas-must` y falla por debajo de 100 %. | 1, 11 y cada módulo |
| CO-FLE-01 | RNF-FLE-001 | Alta de una facultad adicional en staging sin migración estructural. | 11 y 13 |
| CO-ACC-01 | RNF-USU-002 | Revisión automatizada de 28.2: axe en el inicio de los siete roles y en los errores de inscripción y pago (Cypress); Lighthouse en 21 páginas, donde la accesibilidad bloquea. Etapa 7. | 3 y 12 |
| CO-ACC-02 | RNF-USU-002 | Criterios 28.1 en cada plataforma de la Tabla 50 con Playwright: teclado, objetivo táctil de 24 px, zoom al 200 % y axe inyectado. Etapas 7 y 8. | 12 |
| CO-ACC-03 | RNF-USU-002 | Revisión manual de 28.2: lista de WCAG 2.2 AA con zoom real, lector de pantalla (VoiceOver en lugar de NVDA, manual v3.0) y registro HA-NN en `accesibilidad.md`. Firmada en cada cierre de fase. | 12 y cierres |
| CO-COM-01 | RNF-FLE-002 | Matriz de la Tabla 50 con Playwright: flujos Must en Chrome, Safari en iOS, Chrome en Android y zoom al 200 %; Firefox y Edge como Should. Con fecha, etiqueta y resultado por combinación. Etapas 7 y 8. | 12 |
| CO-MAN-02 | RNF-MAN-001 | Fronteras de la Fig. 2 con ESLint `no-restricted-imports`: dominio sin Nest ni Prisma, ningún módulo lee el repositorio de otro, controladores sin acceso a la base, y reportes y bitácora sin depender de otros dominios. `scripts/co-man-02.sh` prueba que cada violación se detecta. Etapa 2. | 12 |

---

## 3.7 Documentos que acompañan a esta matriz

- `docs/calidad/matriz-rol-endpoint.md`: rol por endpoint (AU-15), ejecutada por CF-ROL-01 y CI-AUTH-01.
- `docs/calidad/stride.md`: amenazas y controles por componente (Tabla 37).
- `docs/calidad/revision-cs-seg-08.md`: revisión manual de CS-SEG-08.
- `docs/calidad/informe-zap.md`: alertas de ZAP con su decisión y evidencia (CS-SEG-03 y 05).
- `docs/calidad/amfe-inscripcion.md`: modos de fallo de la inscripción (Tabla 37).
- `docs/calidad/accesibilidad.md`: lista de 28.1, hallazgos y compatibilidad (AU-32).
- `docs/calidad/anexo-a.md`: Anexo A con resultado, evidencia y estado por característica (AU-42).
- `docs/calidad/matriz-25010.md` y `docs/calidad/matriz-25012.md`: modelo de calidad, con la cobertura de las subcaracterísticas Alta en aceptación (8.4, AU-42).
- `docs/calidad/informe-fase-1.md`: tablero de la Tabla 59 y lista de QA.
- `docs/gobierno/respuesta-a-incidentes.md`: procedimiento de la Tabla 38 (AU-18).
- `docs/api/openapi.json`: contrato de la API, generado desde los decoradores (14.4).

---

## 3.8 Parte B de PA-SCE-001: controles de suficiencia

El plan de auditoría revisa como observación doce áreas que el manual no exige (Parte B de su matriz). Esta tabla liga cada una con su control, su prueba o documento y su estado. Se actualiza con cada batch.

| Área de la Parte B | Criterio | Control en el SCE | Prueba o evidencia | Batch | Estado |
|---|---|---|---|---|---|
| Datos personales: aviso, consentimiento, ARCO, inventario, documento de seguridad, vulneraciones y ley estatal | AU-18 | `docs/gobierno/datos-personales/` (inventario, aviso **modelo**, ARCO y documento de seguridad); `respuesta-a-incidentes.md` §4.1; página `/privacidad` | Ensayo de mesa `docs/evidencias/ensayos/2026-11-10-vulneracion-datos-personales.md`; axe en `/privacidad` | 12 (12.6) | Documentado. El aviso es un modelo: lo emite la universidad |
| Autenticación: contraseñas, almacenamiento, control para roles privilegiados y bloqueo | AU-14 | Hash bcrypt; política de contraseñas; bloqueo tras 5 fallos en 15 min; confirmación de contraseña del administrador | `sesiones.spec.ts`, `usuarios.spec.ts` y `plan-de-pruebas.md` §6 | 2 | Automatizado, en verde |
| Pagos: firma del webhook y datos de tarjeta | AU-24 | Pasarela simulada (CC-020): no hay webhook que firmar ni datos de tarjeta | `pagos.spec.ts` (R-14, R-15, R-21) | 9 y 11 | No aplica con CC-020; se reabre con un proveedor real |
| Bitácora: accesos fallidos, cambios de rol, acciones del administrador, inalterabilidad y retención | AU-16 | `BitacoraService` en cada operación sensible; tabla inmutable; pgAudit en staging; retención en `matriz-retencion.md` | `muestreo-bitacora.sql`; CS-SEG-06; pgAudit en cada staging | 2, 6 y 12 | Automatizado, en verde |
| Accesos privilegiados: acceso directo a la base, revisión periódica y bajas | AU-14 y AU-15 | Roles `sce_app` y `sce_monitor` sin privilegios de más; revisión mensual de accesos | `roles-login.sql` en cada staging; `seguridad-operativa.yml`; `acceso-directo-a-la-base.md` y `revision-de-accesos.md` | 13 (13.3) | Pendiente en esta rama; llega con el Batch 13 |
| Documentos oficiales: autenticidad de las constancias | AU-27 | Folio y SHA-256 del contenido emitido, inmutable; verificación de folio con sesión de control escolar | CS-SEG-06 en constancia; `tramites.spec.ts` | 10 | Automatizado, en verde |
| Calificaciones: corrección posterior al cierre | AU-26 | Solo coordinación, con motivo y evidencia, y bitácora con valor anterior (D-17) | `calificaciones.spec.ts`; CS-SEG-06 en calificación | 8 | Automatizado, en verde |
| Cifrado en reposo y claves | AU-17 | Respaldos y registros cifrados con age; inventario de claves | `cifrado-y-claves.md` con prueba negativa | 13 (13.2) | Pendiente en esta rama; llega con el Batch 13 |
| Continuidad: respaldo fuera del sitio y ventanilla | AU-34 | Copia semanal fuera del sitio; contingencia de ventanilla sin controles paralelos (Tabla 10) | `continuidad.yml`; `contingencias.md` con ensayo de mesa | 13 (13.2) | Pendiente en esta rama; llega con el Batch 13 |
| Retención del expediente | AU-40 | Propuesta D-18 por ratificar; el SCE no borra | `matriz-retencion.md` | 12 (12.6) | Documentado, por ratificar con la universidad |
| Accesibilidad y compatibilidad: requisito, casos e Anexo A | AU-32 | RNF-USU-002 y RNF-FLE-002 (CC-021) | CO-ACC-01 a 03 y CO-COM-01; fila en `anexo-a.md` | 12 (12.3 a 12.5) | Automatizado; VoiceOver pendiente (CO-ACC-03) |
| Riesgos de privacidad y autenticación | AU-37 | RK-11 a RK-14 en `matriz-riesgos.md` | Revisión de la matriz al cierre de cada fase | 12 (12.6) | Documentado |

---

## 4. Nota sobre los casos de seguridad

El manual menciona el conjunto CS-SEG con tres rangos, pero **define cada caso una sola vez: en la Tabla 49**. Esa es la definición que rige, y es la que usa el plan de auditoría PA-SCE-001 (AU-14 cita CS-SEG-04 y 07; AU-15, CS-SEG-01 a 03; AU-16, CS-SEG-06).

| Dónde | Rango mencionado |
|---|---|
| Tabla 27, sección 12.3 (para RF-008) | CS-SEG-01 a CS-SEG-04 |
| Tabla 20, sección 9.3 (para RNF-SEG-001) | CS-SEG-01 a CS-SEG-06 |
| Anexo A, sección 43.1 (para Seguridad) | CS-SEG-01 a CS-SEG-08 |

La versión anterior de este catálogo redefinió CS-SEG-02 a 08 con significados propios. Fue un error, registrado como NC-007 y corregido el 5 de noviembre de 2026. La inmutabilidad de la bitácora, que antes se llamaba CS-SEG-06, se conserva como prueba automatizada y como control de RK-03, sin identificador CS-SEG.
