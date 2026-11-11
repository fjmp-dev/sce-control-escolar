# Contingencias de pasarela y de ventanilla — SCE

**Fuente:** SCE-MC-001 v2.0, sección 34 (Tabla 56, "Contingencia de pasarela"), Tabla 10 ("Prohibición de controles paralelos"), Tabla 15 (RK-08) y Tabla 38; PA-SCE-001, Parte B (contingencia de ventanilla). **Sub-batch:** 13.2, issue #76. **Vigente desde:** 11 de noviembre de 2026. **Responsable:** DevOps y Product Owner (FJMP).

Estos procedimientos complementan `respuesta-a-incidentes.md`, que clasifica y registra el incidente, y `inventario-de-ambientes.md`, apartados 6 y 7, que cubren el rollback y la restauración.

## 1. Contingencia de pasarela (Tabla 56: "estado pendiente sin doble cargo")

La pasarela es simulada (CC-020). Lo que la Tabla 56 pide verificar en sandbox se verifica contra la simulada, con la misma regla: **ante un fallo, el pago queda pendiente y nunca confirmado, y un aviso repetido no cobra dos veces** (R-14 y R-15 de `docs/calidad/reglas-de-negocio.md`).

| Situación | Qué hace el SCE | Prueba (reintento controlado) |
|---|---|---|
| La pasarela no responde o rechaza | El intento queda `pendiente` o `rechazado`. El saldo no cambia, no hay recibo y el alumno lo ve en su estado de cuenta | `integracion/pagos.spec.ts`, R-21 |
| Falla la base o la bitácora a mitad de la aplicación | La transacción se revierte. El pago sigue `pendiente`, sin abono ni recibo. El reintento lo aplica una vez | R-15: "si la bitacora falla, el pago sigue pendiente…; el reintento lo aplica" |
| La pasarela avisa dos veces, o a la vez | Un solo abono; el segundo aviso responde sin efecto y queda en bitácora | R-14: "el segundo aviso no hace nada" y "avisos empalmados… una sola vez" |
| Dos intentos por el mismo adeudo | Uno se aplica; el otro responde 409 `PAGO_NO_APLICABLE` y queda rechazado | R-14 |

**Procedimiento en operación:**

1. Caja ve los pagos `pendiente` en Pagos del día.
2. Si la pasarela sigue caída más de una hora, DevOps abre incidente (`respuesta-a-incidentes.md`, severidad Mayor) y el Product Owner avisa a los alumnos por el medio institucional.
3. El alumno vuelve a intentar cuando la pasarela regrese. Un intento pendiente no se cobra dos veces (R-14).
4. Si el corte de pagos vence durante la caída, Dirección decide si lo extiende. La decisión queda en el acta del incidente.
5. Caja no recibe pagos fuera del SCE: no hay registro manual de pagos (Tabla 10).

## 2. Contingencia de ventanilla (PA-SCE-001, Parte B)

Cubre que el SCE no esté disponible para control escolar o caja: caída de la API, de la base o del proxy, o una restauración en curso.

**Regla de la Tabla 10:** no se abre un control paralelo. Ni en papel ni en hoja de cálculo se registra una inscripción, calificación, pago o trámite que el SCE deba registrar.

**Procedimiento:**

1. **Detectar.** Lo detecta el monitoreo (13.3) o el aviso de un usuario. DevOps confirma con `/api/salud` y `/salud`.
2. **Clasificar** según `respuesta-a-incidentes.md`. Una caída en periodo de inscripción o de pagos es Mayor; fuera de periodo, Menor.
3. **Recuperar.** Si se puede, se reinicia el servicio. Si no, se hace rollback o restauración (`inventario-de-ambientes.md`, apartados 6 y 7), con meta RTO de 4 horas.
4. **Atender en ventanilla mientras tanto.** Se da un turno de regreso con fecha y hora. La lista de turnos lleva solo matrícula, trámite pedido, fecha y hora; no lleva calificaciones, importes ni datos del expediente. Se destruye en cuanto se atiende el último turno (`datos-personales/inventario.md`).
5. **Plazos.** Si la caída alcanza el cierre de inscripción, de captura de calificaciones o de pagos, Coordinación y Dirección deciden si extienden el plazo. La decisión queda en el acta del incidente y en la bitácora del periodo.
6. **Cerrar.** Se verifica con el humo del Anexo D y CD-DAT (`scripts/calidad-datos.sh`). Se registra el tiempo fuera de servicio para la disponibilidad mensual (CO-FIA-01, 13.3).

## 3. Ensayos

| Fecha | Ensayo | Resultado |
|---|---|---|
| 11 de noviembre de 2026 | Simulación de mesa de las dos contingencias | `docs/evidencias/ensayos/2026-11-11-contingencias-mesa.md` |
| En cada corrida de CI | Reintento controlado de la pasarela simulada (R-14, R-15 y R-21) | Etapa 4, `integracion/pagos.spec.ts` |
| Cada 12 horas | Restauración cronometrada (`continuidad.yml`) | Resumen de la corrida y artefacto `continuidad-<n>` |
