# Matriz de riesgos — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 17 (tablas 35, 36 y 37).
**Proceso:** ISO 31000:2018 — establecer el contexto, identificar, analizar, evaluar, tratar, monitorear y comunicar.
**Alcance:** las amenazas que puedan impedir el piloto, corromper el expediente o incumplir requisitos Must.
**Estado:** actualizada el 5 de noviembre de 2026. Revisión al cierre de cada fase y antes de la promoción a piloto.

---

## 1. Criterios de evaluación del nivel

| Probabilidad \ Impacto | Bajo | Medio | Alto |
|---|---|---|---|
| **Alta** | Medio | Alto | Alto |
| **Media** | Bajo | Medio | Alto |
| **Baja** | Bajo | Bajo | Medio |

---

## 2. Matriz

| ID | Riesgo | Nivel | Tratamiento | Responsable | Estado al 5 de noviembre de 2026 |
|---|---|---|---|---|---|
| RK-01 | Duplicación o pérdida de expediente al cambiar de plantel. | **Alto** | Mitigar: restricción de unicidad en matrícula, pruebas RNF-DAT-001 y revisión de migraciones. | Desarrollo | **Mitigado en lo aplicable.** `matricula` es clave primaria; el cambio de plantel modifica el mismo expediente, con bitácora en la misma transacción; CF-EXP-01 lo prueba con historial e inscripciones, y CD-DAT-01 corre con SQL y Great Expectations en cada pull request (Batch 4). Falta la revisión de migraciones en staging (Batch 6). |
| RK-02 | Pago cobrado que no se refleja o cargo duplicado. | **Alto** | Mitigar: clave de idempotencia, conciliación diaria y pruebas de integración con doble webhook. | Desarrollo y Caja | **Diseñado.** Clave de idempotencia y movimiento único en el esquema. Sin implementar (Batch 9). |
| RK-03 | Acceso cruzado entre roles, por ejemplo un alumno que altera calificaciones. | **Alto** | Mitigar: guards por rol, pruebas CS-SEG y bitácora obligatoria. | Seguridad | **En mitigación.** Guard global con denegación por omisión, matriz rol × endpoint ejecutable (CF-ROL-01, CI-AUTH-01), servicio de bitácora en la misma transacción y bitácora inmutable, con prueba (Batch 2). Faltan CS-SEG-01 a 03, pues sus endpoints no existen (batches 4 y 8). |
| RK-04 | Caída o lentitud durante la semana de inscripción. | **Alto** | Mitigar: pruebas de carga previas, monitoreo de percentil 95 y ventana de mantenimiento fuera de inscripción. | DevOps | **Abierto, aceptado con plan** en ACT-F0-001, pendiente de firma. Staging configurado en el Batch 6, con dos servidores como la Fig. 9 y despliegue manual con humo; los servidores esperan la decisión del proveedor (`fichas-de-proveedores.md`). Rendimiento y monitoreo en el Batch 13. |
| RK-05 | Choques de horario no detectados. | Medio | Mitigar: regla en el dominio y pruebas automatizadas CF-HOR. | Desarrollo | **Mitigado en la inscripción (Batch 5).** `Horario.traslapaCon` en el dominio, con valores límite en Jest; la inscripción rechaza el choque y el portal lo avisa antes de enviar (CF-HOR-01 con Cypress). La ocupación de cada grupo se concilia con sus inscritos en cada pull request. AMFE de inscripción en `amfe-inscripcion.md`. **Desde el Batch 7, también al definir la oferta:** el aula y el profesor no se traslapan en el periodo (D-13), con la definición serializada por periodo para que dos coordinadores no dejen el mismo traslape a la vez; la prueba de concurrencia detecta un mutante sin el bloqueo. El alumno no ve ni inscribe la oferta antes de publicarse (CC-012). |
| RK-06 | Ampliación no controlada del alcance hacia aula virtual o aplicación nativa. | Medio | Evitar: control de cambios y política de alcance. | Product Owner | **Vigente.** La sección 3 del manual excluye esos módulos; `plan-de-sistema.md`, regla 10. |
| RK-07 | Secretos expuestos en el repositorio o en registros. | **Alto** | Mitigar: gitleaks en el pipeline, secretos en el gestor y rotación tras incidente. | DevOps | **Mitigado en lo aplicable.** Gitleaks sobre todas las ramas y todo el historial, y Trivy, en CI; secret scanning con push protection; `.env` fuera del repositorio; registros JSON sin datos sensibles, con búsqueda automática tras cada escaneo (Batch 2). Falta la revisión de Seguridad de CS-SEG-08 y el procedimiento de rotación tras incidente (Batch 4). |
| RK-08 | Indisponibilidad de la pasarela de pagos. | Medio | Transferir y mitigar: estado pendiente, reintentos controlados y acuerdo de servicio con el proveedor. | Desarrollo | **Diseñado.** Batch 9. |
| RK-09 | Uso de datos personales reales en ambientes no productivos. | **Alto** | Mitigar: datos sintéticos o anonimizados y revisión previa a cada despliegue. | Seguridad | **Vigente sin exposición.** El seed solo tiene datos sintéticos y, desde el Batch 3, la imagen no lo ejecuta: solo lo pide `docker-compose.yml`. El seed amplía a diez expedientes, todos sintéticos, y Great Expectations valida el formato de matrícula. **Desde el Batch 6, cada despliegue a staging lo verifica:** `sin-datos-reales.sql` exige cero filas fuera de la convención sintética (dominio `.test`, nombres "Alumno" o "Alumna"), y el despliegue falla si no. Staging corre el seed con su propia contraseña. |
| RK-10 | Ausencia de actas de aceptación por fase. | Medio | Mitigar: puerta de aceptación con Product Owner y QA antes de cerrar la fase. | QA | **Materializado.** El acta de fase 0 sigue sin firma (NC-002) y falta el acta de levantamiento (NC-006). Plan fechado en el registro de no conformidades. |

> Los riesgos de nivel Alto que permanezcan abiertos bloquean el paso a piloto hasta que se verifique la mitigación o el Product Owner acepte formalmente el riesgo con un plan fechado (manual, sección 17.2).

---

## 3. Resumen

| Nivel | Cantidad | IDs |
|---|---|---|
| Alto | 6 | RK-01, RK-02, RK-03, RK-04, RK-07, RK-09 |
| Medio | 4 | RK-05, RK-06, RK-08, RK-10 |
| Bajo | 0 | — |

---

## 4. Herramientas de apoyo

| Herramienta o técnica | Uso | Producto que genera |
|---|---|---|
| Matriz de probabilidad e impacto (ISO 31000) | Clasificación y priorización de riesgos. | Registro de riesgos con nivel y tratamiento. |
| Análisis de causa raíz con cinco porqués | Riesgos materializados y no conformidades. | Ficha de causa y acción correctiva. |
| Análisis modal de fallos y efectos (AMFE) | Módulos críticos: inscripción y pagos. | Tabla de modos de fallo con número de prioridad de riesgo. |
| Modelado de amenazas STRIDE | Riesgos de seguridad por componente. | Lista de amenazas y controles asociados. |
| GitHub Projects con etiqueta de riesgo | Seguimiento operativo de acciones de mitigación. | Tablero con responsable y fecha objetivo. |
| Hoja de cálculo de registro de riesgos | Histórico y evolución del nivel por fase. | Registro versionado en el repositorio de evidencias. |

---

## 5. Revisión

Esta matriz se revisa al cierre de cada fase y antes de la promoción a piloto (sección 17.1). Los análisis AMFE de inscripción y pagos se hacen al inicio de los batches 5 y 9, y el modelado STRIDE por componente empieza en el Batch 2. Los riesgos de privacidad y de autenticación que señala la Parte B de PA-SCE-001 se evalúan en el Batch 12.
