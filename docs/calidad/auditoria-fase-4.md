# Auditoría interna de cierre de fase 4 — Autoauditoría por reejecución

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F; ISO 19011:2018. Exigibilidad de criterios: PA-SCE-001, apartado 3.
**Fecha:** 10 de noviembre de 2026 (sub-batch 11.3). **Evidencia:** `auditoria-fase-4-evidencia.md`.

> **No es una auditoría independiente (NC-013).** La hace FJMP, que desarrolla y opera el producto, con un asistente de IA que es coautor. La sección 39.1 pide un auditor que no desarrolle ni opere el producto. Esta autoauditoría no cierra NC-013: deja la reejecución lista para que un auditor la repita.

## 1. Programa

| Momento | Alcance | Criterios | Batch | Auditor | Fecha real |
|---|---|---|---|---|---|
| Cierre de fase 4 | Pagos, trámites y bitácora | RF-006, RF-007, RNF-SEG-001 y controles de ISO/IEC 27001:2022 | 11 (sub-batch 11.3) | FJMP, autoauditoría (NC-013) | 10 de noviembre de 2026 |

El cierre de la fase 2 se audita en `auditoria-fase-2.md`. La auditoría "antes de la liberación" es del sub-batch 13.6. La del semestre piloto no se hace: no hay piloto.

## 2. Plan previo

- **Objetivo y alcance:** verificar que pagos, trámites, reportes y bitácora cumplen el manual al cierre de la fase 4, sobre `d4cce7d`.
- **Criterios:**
  - Tabla 60: RF-006, RF-007, RNF-SEG-001 y los controles de ISO/IEC 27001:2022.
  - PA-SCE-001, apartado 3: AU-16, AU-24, AU-27 y AU-28, exigibles desde la fase 4.
  - Los criterios de fases anteriores que tocan este alcance: AU-04, 06, 07, 11, 13, 15, 20, 29, 30, 36, 37, 39, 40 y 42.
  - Los demás criterios exigibles desde las fases 0 a 3 quedan para la auditoría de 13.6.
- **Auditor y declaración de imparcialidad:** FJMP. **No es imparcial:** audita su propio trabajo (NC-012 y NC-013). El asistente de IA tampoco es independiente.
- **Fechas y duración:** 10 de noviembre de 2026, una jornada.
- **Métodos:** revisión documental, inspección técnica y reejecución. No hay entrevista ni observación: no hay a quién entrevistar ni usuarios que observar.
- **Muestra:**
  - Todos los casos de pagos, trámites y reportes de las suites de integración.
  - Las 10 consultas de `api/prisma/verificacion/` con meta de cero filas.
  - Las 22 expectativas de Great Expectations de la corrida 42966111975.
  - Los PR de la fase: #64, #65, #71, #72 y #78.
  - El único defecto registrado, #69.

## 3. Lista de verificación

Resultados con la escala de PA-SCE-001. "Local" es la reejecución del 10 de noviembre sobre `d4cce7d` (`informe-fase-4.md`, apartado 5).

| Criterio | Pregunta o verificación | Evidencia esperada | Resultado | Evidencia encontrada |
|---|---|---|---|---|
| AU-16 | ¿Hay autor, acción, valor anterior y fecha en calificación, pago, constancia y plantel? ¿La bitácora es inmutable? | CS-SEG-06, consultas SQL, muestra de 25 por tipo | Conforme, con observación OB-01 | CS-SEG-06 en los cuatro tipos: 0 filas sin asiento en Great Expectations (corrida 42966111975). Reejecutado en local: UPDATE, DELETE y TRUNCATE sobre `bitacora` rechazados por `fn_bitacora_inmutable()`. R-22 en `seguridad.spec.ts`, en verde. La muestra de 25 por tipo no se alcanza (OB-01) |
| AU-24 | ¿El pago es único, no se duplica con doble aviso, queda pendiente ante fallo, se concilia a diario y se refleja en menos de un minuto? | CF-PAG-01, CI-PAG-01, código de la aprobación, corte | **NC menor (H-03)** | Pago único y doble aviso: 5 pruebas de CI-PAG-01 en `pagos.spec.ts` (local) y Newman, 0 fallas (corrida 42966111975). Pendiente ante fallo: R-15, dos pruebas. CF-PAG-01: `pagos-tramites.cy.ts`, en verde. Corte: prueba "Corte de caja". **No hay conciliación (CD-DAT-03) ni medición del reflejo (CD-DAT-06).** Con CC-020 no hay sandbox: se reejecutó contra la pasarela simulada |
| AU-27 | ¿El solicitante ve estados y fecha? ¿Se emiten los 3 tipos? | CF-TRA-01 y 02; muestra de documentos | Conforme | CF-TRA-01: recibida, en proceso, lista y entregada, cada paso con fecha y asiento. CF-TRA-02: rechazo con motivo visible. Constancia, no adeudo e historial en `tramites.spec.ts` y en Jest ("cada tipo dice lo suyo"). Hash verificado y alteración detectada. Los documentos solo existen en pruebas |
| AU-28 | ¿Dirección solo lee, sin editar el historial? | CF-REP-01; permisos del rol | Conforme | CF-REP-01: 4 pruebas en `reportes.spec.ts`, incluida "no expone matriculas ni nombres". Dirección solo tiene GET, salvo su sesión y su contraseña (`matriz-rol-endpoint.md`). Newman: "caja no consulta el reporte de direccion". Cypress `reportes.cy.ts`, 2 de 2 |
| AU-04 y AU-11 | ¿Revisó y aprobó cada PR alguien distinto del autor? | Historial de PR | NC mayor, ya registrada | #64, #65, #71, #72 y #78 sin revisiones. NC-001 y NC-012 |
| AU-06 | ¿Se aprobaron los cambios antes de fusionar? | Registro de cambios | NC mayor, ya registrada | CC-020 aprobado después de fusionar; CC-008 y CC-009, de trámites, sin decisión. NC-008 |
| AU-07 | ¿Hay acta de la fase con la Tabla 23? | Acta firmada | NC mayor, ya registrada | `acta-aceptacion-fase-4.md` preparada, sin firma. Ninguna acta de fase está firmada (NC-002, NC-009 a NC-011) |
| AU-13 | ¿Hay secretos en el historial? | Gitleaks | Conforme | Gitleaks sobre todo el historial: `[]` (corrida 42966111975) |
| AU-15 | ¿Cada endpoint de pagos, trámites y reportes autoriza por rol? | Matriz y casos | Conforme | CF-ROL-01 en `roles.spec.ts` (local); CS-SEG-03 en pagos y trámites; un pago o documento ajeno responde 404 |
| AU-20 | ¿Hay vulnerabilidades altas o críticas? | npm audit, Trivy, ZAP | Conforme | 0 en npm audit (raíz, `api` y `web`) y en Trivy (imagen, portal y repositorio); ZAP sin alertas altas (corrida 42966111975) |
| AU-29 | ¿Cada caso tiene requisito, ambiente, resultado y evidencia? | Acta, plan y matriz de trazabilidad | Conforme, con observación OB-08 | Requisito y herramienta de CF-PAG-01, CI-PAG-01, CF-TRA-01 y 02 y CF-REP-01 en `matriz-trazabilidad.md`, apartado 3. Ambiente, resultado y corrida en `acta-aceptacion-fase-4.md`, apartado 3. `plan-de-pruebas.md`, apartado 6, no tiene filas para esos casos (OB-08) |
| AU-30 | ¿Dominio con 80 % o más y reglas Must al 100 %? | lcov, SonarQube | Conforme, con observación OB-02 | Dominio 289/289 (100 %); reglas Must 24/24; puerta de SonarQube OK. La pirámide no se verifica (OB-02) |
| AU-36 | ¿El defecto tiene severidad y plazo, y lo cierra alguien distinto de quien lo corrigió? | Issues `defecto` | NC mayor, ya registrada | #69: `sev-critica`, corregido y cerrado el mismo día por FJMP, que también lo corrigió (NC-012) |
| AU-37 | ¿La matriz está al día y los riesgos Alto están mitigados o aceptados por escrito? ¿Se hizo el AMFE de pagos? | Matriz, AMFE, STRIDE | **NC menor (H-02)** | Matriz revisada el 10-nov. RK-15 aceptado en CC-020; RK-04 aceptado en ACT-F0-001, sin firma. **El AMFE de pagos se hizo después de construir, y STRIDE no tiene pagos, trámites ni reportes** |
| AU-39 | ¿Hay tablero por fase con su recálculo? | Informes de fase | **NC menor (H-01)** | `informe-fase-4.md` con las 10 métricas. **La densidad no se pudo calcular al cerrar las fases 1 a 3:** los issues no tenían puntos. La métrica 8 queda sin dato (H-03) |
| AU-40 | ¿Hay auditor independiente? | Programa | NC mayor, ya registrada | NC-013 |
| AU-42 | ¿Las pruebas de aceptación cubren las subcaracterísticas de prioridad Alta? | Acta, catálogo | Conforme, con observación OB-03 | `acta-aceptacion-fase-4.md`, apartado 4. Interoperabilidad de RF-006 no verificable con pasarela simulada (OB-03) |
| ISO/IEC 27001:2022 | ¿Están implementados los controles de la Tabla 38? | `stride.md` | Conforme en 7 de 10, con observación OB-04 | Parciales: protección en reposo, datos personales y respuesta a incidentes (sin ensayo) |

## 4. Registro de hallazgos

| ID | Tipo | Criterio | Evidencia | Descripción | NC trasladada |
|---|---|---|---|---|---|
| H-01 | Menor | AU-39, AU-43 | Issues #31 y #41 a #51 antes de 11.3; `historia.yml` | Issues de batch sin puntos de historia; la densidad no se calculó en las fases 1 a 3 | NC-016 |
| H-02 | Menor | AU-37 | `amfe-pagos.md`; `stride.md` v1.6; #69 | AMFE de pagos después de construir; STRIDE sin pagos, caja, trámites ni reportes | NC-017 |
| H-03 | Menor | AU-24, AU-39 | `api/prisma/verificacion/` sin `cd-dat-03.sql` ni `cd-dat-06.sql` | Sin conciliación ni medición del reflejo al cierre | NC-018 |
| OB-01 | Observación | AU-16 | Seed sin pagos ni trámites; CI con pocos | La muestra de 25 asientos por tipo no se alcanza con datos sintéticos. `muestreo-bitacora.sql` pasa a la etapa 4 en 12.1 | — |
| OB-02 | Observación | AU-30 | Conteo de pruebas del apartado 5 del informe | Por número de pruebas: 368 unitarias (187 Jest y 181 Vitest), 560 de integración y 41 extremo a extremo; 38 %, 58 % y 4 %, contra 70/20/10. La regla de conteo y `scripts/piramide.sh` llegan en 12.1 | — |
| OB-03 | Observación | AU-42 | CC-020 | La interoperabilidad de RF-006 con un proveedor real no se verifica: no hay proveedor | — |
| OB-04 | Observación | ISO/IEC 27001:2022 | `stride.md` | Sin cifrado en reposo ni respaldo cifrado (13.2); Parte B de datos personales en 12.6; incidentes sin ensayo; CSP con `'unsafe-inline'` (12.2) | — |
| OB-05 | Observación | AU-39 | `informe-fase-4.md`, Tabla 59, fila 1 | La densidad sube de 0 a 0.024, pero F1 a F3 no son comparables: sus fallos no se registraron | MJ-010 |
| OB-06 | Observación | AU-43 | #51, 21 puntos | #51 junta reportes, cierre de fase y la retoma 11.0 a 11.4. Es demasiado grande para un issue | MJ-007 |
| OB-07 | Observación | AU-24 | `amfe-pagos.md`, acción 1 | La base no impide un saldo negativo; solo la aplicación lo hace | Acción 1 de `amfe-pagos.md` |
| OB-08 | Observación | AU-29 | `plan-de-pruebas.md`, apartado 6 | El apartado se llama "Casos de la fase 1". Solo CS-SEG-02, 03 y 06 dicen algo de pagos. Faltan las filas de los casos de la fase 4 con su estado | MJ-008 |

Las NC mayores vigentes que este alcance confirma (NC-001, NC-002, NC-008, NC-009 a NC-013) no se duplican. Tampoco NC-014, que trata las figuras de CC-020.

## 5. Dictamen y seguimiento

- **Conclusión y dictamen:** **conforme con reservas, y no independiente.** La reejecución confirma la condición de la Tabla 23 para la fase 4 y los criterios RF-006, RF-007 y RNF-SEG-001 en pruebas: 560 de 560 en integración, Newman sin fallas, Cypress 41 de 41 y CS-SEG-06 sin filas. Hay tres NC menores nuevas (NC-016 a NC-018) y ocho observaciones. Las NC mayores vigentes siguen abiertas, aceptadas con plan fechado por FJMP como Product Owner. Según la Tabla 61, bloquean la liberación a piloto, que no se hará.
- **Plan de seguimiento:**

| Qué | Responsable | Fecha |
|---|---|---|
| Pedir por escrito un auditor independiente para este cierre y el de la fase 2 (NC-013, acción 1) | FJMP | 20 de noviembre de 2026 |
| NC-016: puntos en #75 a #77 antes de su trabajo | FJMP | Antes de 12.1 |
| NC-018 y OB-01, OB-02 y OB-07: CD-DAT-03, CD-DAT-06, muestreo de bitácora, pirámide y `CHECK (saldo >= 0)` | FJMP | 12.1 |
| NC-017 y OB-04: STRIDE v1.7 y CSP con nonce | FJMP | 12.2 |
| Repetir esta lista sobre `release/1.0.0` | Auditor, o FJMP como autoauditoría | 13.6 |

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Auditor (autoauditoría, NC-013) | Francisco Javier Martínez Peñas | | |
| Product Owner (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
