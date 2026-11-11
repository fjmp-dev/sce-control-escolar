# Matriz de riesgos — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 17 (tablas 35, 36 y 37).
**Proceso:** ISO 31000:2018 — establecer el contexto, identificar, analizar, evaluar, tratar, monitorear y comunicar.
**Alcance:** las amenazas que puedan impedir el piloto, corromper el expediente o incumplir requisitos Must.
**Estado:** revisada el 10 de noviembre de 2026, al cierre de la fase 4 (sub-batch 11.3). Revisión al cierre de cada fase y antes de la promoción a piloto.
**Revisión del 10 de noviembre de 2026:** RK-02 mitigado con #71; RK-03 revisado con la bitácora de pago y constancia (11.2); RK-08 replanteado para la pasarela simulada (CC-020); RK-10 actualizado; RK-15 nuevo, el riesgo que CC-020 acepta. La revisa y la aprueba FJMP solo (NC-012).

---

## 1. Criterios de evaluación del nivel

| Probabilidad \ Impacto | Bajo | Medio | Alto |
|---|---|---|---|
| **Alta** | Medio | Alto | Alto |
| **Media** | Bajo | Medio | Alto |
| **Baja** | Bajo | Bajo | Medio |

---

## 2. Matriz

| ID | Riesgo | Nivel | Tratamiento | Responsable | Estado al 10 de noviembre de 2026 |
|---|---|---|---|---|---|
| RK-01 | Duplicación o pérdida de expediente al cambiar de plantel. | **Alto** | Mitigar: restricción de unicidad en matrícula, pruebas RNF-DAT-001 y revisión de migraciones. | Desarrollo | **Mitigado en lo aplicable.** `matricula` es clave primaria; el cambio de plantel modifica el mismo expediente, con bitácora en la misma transacción; CF-EXP-01 lo prueba con historial e inscripciones, y CD-DAT-01 corre con SQL y Great Expectations en cada pull request (Batch 4). Falta la revisión de migraciones en staging (Batch 6). |
| RK-02 | Pago cobrado que no se refleja o cargo duplicado. | **Alto** | Mitigar: clave de idempotencia, conciliación diaria y pruebas de integración con doble aviso de la pasarela. | Desarrollo y Caja | **Mitigado con pago simulado (CC-020).** Clave de idempotencia por intento, `movimiento.pago_id` único y `Pago.aplicarUnaVez()`: el pago se aplica una sola vez aunque la pasarela repita o empalme el aviso (Batch 9). **Materializado y corregido el 10 de noviembre de 2026 (#69, Crítica; PR #71):** dos intentos por el mismo adeudo, aprobados los dos, dejaban el saldo negativo. Ahora el importe se compara con el saldo vigente con la cuenta bloqueada, y el intento que lo rebasa se rechaza sin cobrarse (409 `PAGO_NO_APLICABLE`). CI-PAG-01 lo prueba con Supertest (`pagos.spec.ts`, en verde el 10-nov) y con Newman (corrida 42966111975). **Queda:** la conciliación interna CD-DAT-03 y el reflejo CD-DAT-06 llegan en 12.1 (NC-018); la base no impide un saldo negativo (`amfe-pagos.md`, acción 1). |
| RK-03 | Acceso cruzado entre roles, por ejemplo un alumno que altera calificaciones. | **Alto** | Mitigar: guards por rol, pruebas CS-SEG y bitácora obligatoria. | Seguridad | **Mitigado en lo aplicable; revisado el 10 de noviembre de 2026.** Guard global con denegación por omisión, matriz rol × endpoint ejecutable (CF-ROL-01, CI-AUTH-01) y bitácora inmutable en la misma transacción (Batch 2); el 10-nov se reejecutó: UPDATE, DELETE y TRUNCATE rechazados. CS-SEG-03 desde el Batch 4. CS-SEG-01, 02 y 06 en calificaciones desde el Batch 8. **Fase 4:** un pago, recibo o documento ajeno responde 404 (CS-SEG-03); caja no toca el historial (R-24); dirección solo lee agregados, sin matrículas ni nombres (CF-REP-01). **Desde 11.2, CS-SEG-06 en pago y constancia:** cada pago aplicado o rechazado tiene un solo asiento del usuario técnico, y cada paso de un trámite su asiento en cadena, con autor (`cs-seg-06-pago.sql`, `cs-seg-06-constancia.sql`; Great Expectations sin fallas en la corrida 42966111975). **Queda:** ZAP no prueba acceso cruzado (Batch 12), y nadie distinto del autor revisó los guards (NC-012). |
| RK-04 | Caída o lentitud durante la semana de inscripción. | **Alto** | Mitigar: pruebas de carga previas, monitoreo de percentil 95 y ventana de mantenimiento fuera de inscripción. | DevOps | **Abierto, aceptado con plan** en ACT-F0-001, pendiente de firma. Staging configurado en el Batch 6 con la topología de la Fig. 9 y despliegue manual con humo; desde CC-018 es efímero, en GitHub Actions y sin costo. La carga del Batch 13 corre en el runner, no en el hardware del piloto: la sección 24.2 la repite en el servidor del piloto. Rendimiento y monitoreo en el Batch 13. |
| RK-05 | Choques de horario no detectados. | Medio | Mitigar: regla en el dominio y pruebas automatizadas CF-HOR. | Desarrollo | **Mitigado en la inscripción (Batch 5).** `Horario.traslapaCon` en el dominio, con valores límite en Jest; la inscripción rechaza el choque y el portal lo avisa antes de enviar (CF-HOR-01 con Cypress). La ocupación de cada grupo se concilia con sus inscritos en cada pull request. AMFE de inscripción en `amfe-inscripcion.md`. **Desde el Batch 7, también al definir la oferta:** el aula y el profesor no se traslapan en el periodo (D-13), con la definición serializada por periodo para que dos coordinadores no dejen el mismo traslape a la vez; la prueba de concurrencia detecta un mutante sin el bloqueo. El alumno no ve ni inscribe la oferta antes de publicarse (CC-012). |
| RK-06 | Ampliación no controlada del alcance hacia aula virtual o aplicación nativa. | Medio | Evitar: control de cambios y política de alcance. | Product Owner | **Vigente.** La sección 3 del manual excluye esos módulos; `plan-de-sistema.md`, regla 10. |
| RK-07 | Secretos expuestos en el repositorio o en registros. | **Alto** | Mitigar: gitleaks en el pipeline, secretos en el gestor y rotación tras incidente. | DevOps | **Mitigado en lo aplicable.** Gitleaks sobre todas las ramas y todo el historial, y Trivy, en CI; secret scanning con push protection; `.env` fuera del repositorio; registros JSON sin datos sensibles, con búsqueda automática tras cada escaneo (Batch 2). Falta la revisión de Seguridad de CS-SEG-08 y el procedimiento de rotación tras incidente (Batch 4). |
| RK-08 | Indisponibilidad de la pasarela de pagos. **Replanteado el 10 de noviembre de 2026 (CC-020):** sin proveedor externo, el riesgo es que la aprobación simulada no llegue o que la aplicación falle a mitad. | Bajo | Mitigar: el pago queda pendiente y el reintento lo aplica una sola vez. El acuerdo de servicio no aplica: no hay proveedor. | Desarrollo | **Mitigado.** Probabilidad baja: no hay tercero; solo falla la base. Impacto medio: el alumno ve su pago pendiente y repite. R-15 lo prueba: si la bitácora falla, el pago sigue pendiente, sin recibo ni abono, y el reintento lo aplica (`pagos.spec.ts`). **Se reabre** si un piloto usa cobro real: entonces vuelve el proveedor, con CC Mayor nuevo (RK-15). |
| RK-09 | Uso de datos personales reales en ambientes no productivos. | **Alto** | Mitigar: datos sintéticos o anonimizados y revisión previa a cada despliegue. | Seguridad | **Vigente sin exposición.** El seed solo tiene datos sintéticos y, desde el Batch 3, la imagen no lo ejecuta: solo lo pide `docker-compose.yml`. El seed amplía a diez expedientes, todos sintéticos, y Great Expectations valida el formato de matrícula. **Desde el Batch 6, cada despliegue a staging lo verifica:** `sin-datos-reales.sql` exige cero filas fuera de la convención sintética (dominio `.test`, nombres "Alumno" o "Alumna"), y el despliegue falla si no. Staging corre el seed con su propia contraseña. |
| RK-10 | Ausencia de actas de aceptación por fase. | Medio | Mitigar: puerta de aceptación con Product Owner y QA antes de cerrar la fase. | QA | **Materializado.** Ninguna acta de fase está firmada al 10 de noviembre de 2026 (NC-002, NC-009 a NC-011) y falta el acta de levantamiento (NC-006). Las actas de las fases 1 a 4 quedan listas para que FJMP las firme en orden, sin SJOM (NC-012). |
| RK-15 | Con la pasarela simulada, el alumno da por pagado su propio adeudo (CC-020, "riesgo aceptado"). | **Alto** | Aceptar mientras solo haya datos sintéticos. Evitar en todo ambiente con usuarios reales: un piloto con cobro real exige un CC Mayor nuevo y la ficha del proveedor llena antes. | Product Owner (FJMP) | **Aceptado** en CC-020, que FJMP aprobó el 10 de noviembre de 2026 (`registro-de-cambios.md`). Probabilidad alta: cualquier alumno puede hacerlo, por diseño. Impacto alto si hubiera usuarios reales: cobranza falsa. Hoy no hay daño: todos los ambientes usan datos sintéticos, y staging lo verifica en cada despliegue (RK-09). La liberación `v1.0.0` es sin piloto (`plan-de-sistema.md`, 6.2). |

> Los riesgos de nivel Alto que permanezcan abiertos bloquean el paso a piloto hasta que se verifique la mitigación o el Product Owner acepte formalmente el riesgo con un plan fechado (manual, sección 17.2).

---

## 3. Resumen

| Nivel | Cantidad | IDs |
|---|---|---|
| Alto | 7 | RK-01, RK-02, RK-03, RK-04, RK-07, RK-09, RK-15 |
| Medio | 3 | RK-05, RK-06, RK-10 |
| Bajo | 1 | RK-08 |

RK-11 a RK-14 quedan reservados para los riesgos de privacidad y autenticación de la Parte B (`plan-de-sistema.md`, 6.2, sub-batch 12.6). Por eso el riesgo de CC-020 es RK-15.

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

Esta matriz se revisa al cierre de cada fase y antes de la promoción a piloto (sección 17.1). Los análisis AMFE de inscripción y pagos se hacen al inicio de los batches 5 y 9, y el modelado STRIDE por componente empieza en el Batch 2. El AMFE de pagos no se hizo al inicio del Batch 9: se hizo el 10 de noviembre de 2026, después de construir (`amfe-pagos.md`, NC-017). Los riesgos de privacidad y de autenticación que señala la Parte B de PA-SCE-001 se evalúan en el Batch 12.
