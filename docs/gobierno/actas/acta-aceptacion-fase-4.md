# Acta de aceptación de fase — Fase 4

**Acta número:** ACT-F4-001
**Objeto:** fase 4, Pagos y trámites · release `v0.4.0`
**Manual de referencia:** SCE-MC-001 v2.0, secciones 10.1, 10.3 (Tabla 23, fila 4) y 10.4; Anexo B. Manual v3.0 en borrador para CC-020 y la fase sin piloto.
**Fecha real de la decisión:** pendiente; no se antedata
**Etiqueta o commit:** evidencia sobre `d4cce7d` (cabeza del PR #78, en `develop`). La etiqueta `v0.4.0` se crea en el sub-batch 11.4
**Participantes:** Francisco Javier Martínez Peñas (Product Owner, QA y autor; desviación, NC-012), con asistente de IA declarado

> **Estado: lista para firma, preparada el 10 de noviembre de 2026 (sub-batch 11.3).** FJMP firma como Product Owner y QA aunque produjo la fase (NC-012). SJOM no participa: no revisó ningún entregable de la fase. La fase abrió sin el acta de la fase 3 firmada (NC-011). Las actas se firman en orden: F0, F1, F2, F3 y esta.

---

## 1. Condición mínima de la Tabla 23

"Estado de cuenta, pago reflejado, constancias con estado y bitácora de operaciones sensibles."

| Condición evaluada | Resultado | Evidencia |
|---|---|---|
| Estado de cuenta | Cumple | Cargos de caja (D-7), beca, pago y saldo en `/mi-cuenta`. `pagos.spec.ts` ("genera el cargo a cada inscrito una sola vez, aunque caja lo repita"); Cypress `pagos-tramites.cy.ts` |
| Pago reflejado | Cumple con pasarela simulada (CC-020) | CF-PAG-01 y CI-PAG-01: el pago se refleja una sola vez, con aviso repetido, empalmado y dos intentos. **Sin medición del reflejo en menos de un minuto (CD-DAT-06) ni conciliación (CD-DAT-03):** NC-018 |
| Constancias con estado | Cumple | CF-TRA-01 y 02: constancia, no adeudo e historial, con estados y fecha; rechazo con motivo visible; documento con hash verificable |
| Bitácora de operaciones sensibles | Cumple | CS-SEG-06 en calificación, plantel, pago y constancia: 0 filas sin asiento. Bitácora inmutable (R-22) |

## 2. Condiciones generales (sección 10.1)

| Condición | Resultado | Evidencia |
|---|---|---|
| Todo requisito Must del incremento tiene al menos un caso satisfactorio | Cumple: RF-006, RF-007 y RNF-SEG-001. RF-009 y RF-010 (Should) también | Apartado 3 |
| No existen defectos críticos abiertos | Cumple. #69 (`sev-critica`, cobro doble) se corrigió con #71 y se cerró el 10 de noviembre. Lo cerró quien lo corrigió (NC-012) | `gh issue list --label defecto --state open`: vacío |
| La bitácora registra las operaciones sensibles del incremento | Cumple: cargos, beca, pago aplicado y rechazado (usuario técnico, CC-015), cada paso del trámite y la emisión del documento | `cs-seg-06-pago.sql`, `cs-seg-06-constancia.sql`; Great Expectations |
| El incremento es desplegable en pruebas o staging | Cumple en staging efímero (CC-018): humo de los 7 roles en verde. Falta la corrida con la etiqueta (11.4) | Corrida 42966111975, artefacto de staging |
| El alcance no incluye funcionalidades fuera de la primera versión, salvo cambio aprobado | **Con reservas.** CC-020 (pasarela simulada) aprobado después de fusionarse (NC-008). **CC-008 y CC-009 (Mayor, trámites) siguen sin decisión** | `registro-de-cambios.md` |

## 3. Resultados de pruebas (sección 10.4)

Ambientes (Tabla 30): **pruebas** es GitHub Actions o Testcontainers con base efímera; **staging** es el staging efímero de CC-018. "Local" es la reejecución del 10 de noviembre sobre `d4cce7d`.

| Caso | Requisito | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| CF-PAG-01 | RF-006 | Pruebas | Satisfactorio con pasarela simulada | Cypress `pagos-tramites.cy.ts`, 2 de 2; Newman, 0 fallas en 368 aserciones (corrida 42966111975) |
| CI-PAG-01 | RF-006 | Pruebas | Satisfactorio: aviso repetido y empalmado; dos intentos seguidos, simultáneos y tras una beca | `pagos.spec.ts` (local); Newman "la pasarela repite el aviso" y "el segundo intento ya no cabe en el saldo" (corrida 42966111975) |
| R-15 | RF-006, RK-08 | Pruebas | Satisfactorio: ante fallo, el pago queda pendiente | `pagos.spec.ts` (local) |
| Corte de caja | RF-006 | Pruebas | Satisfactorio: día de la Ciudad de México | `pagos.spec.ts` (local); Cypress "caja lo ve en el corte" |
| CD-DAT-03 y CD-DAT-06 | RF-006, RNF-DAT-001 | — | **Sin ejecutar: no existen** | NC-018; llegan en 12.1 |
| CF-TRA-01 | RF-007 | Pruebas | Satisfactorio: tres tipos, estados con fecha, hash verificado y alteración detectada | `tramites.spec.ts` (local); Newman "RF-007 solicitar constancia" |
| CF-TRA-02 | RF-010 | Pruebas | Satisfactorio: el rechazo lleva motivo y el alumno lo ve | Cypress `pagos-tramites.cy.ts`; `tramites.spec.ts` (local) |
| CF-REP-01 | RF-009 | Pruebas | Satisfactorio: coincide con el cálculo a mano; sin matrículas ni nombres; otro rol no lo ve | `reportes.spec.ts`, 4 pruebas (local); Cypress `reportes.cy.ts`, 2 de 2; Newman "caja no consulta el reporte de direccion" |
| CS-SEG-06 en pago y constancia | RNF-SEG-001 | Pruebas | Satisfactorio: 0 filas | SQL (local); Great Expectations, 22 de 22 (corrida 42966111975) |
| R-22, bitácora inmutable | RNF-SEG-001 | Pruebas | Satisfactorio | `seguridad.spec.ts` (local) |
| CS-SEG-02 (R-24) | RNF-SEG-001 | Pruebas | Satisfactorio: caja no cambia el historial | `pagos.spec.ts` (local) |
| CS-SEG-03 en pago y documento | RNF-SEG-002 | Pruebas | Satisfactorio con Supertest: lo ajeno responde 404. **ZAP no prueba acceso cruzado** (12.2) | `pagos.spec.ts`, `tramites.spec.ts` (local) |
| Accesibilidad de las páginas de la fase | Tabla 13 | Pruebas | Satisfactorio: 0 violaciones de axe en 8 páginas (mi cuenta, pasarela, recibo, mis trámites, trámites, documento, caja y reportes) | Cypress, 41 de 41 (corrida 42966111975) |
| Humo en staging (Anexo D) | Tabla 30 | Staging | Satisfactorio: salud y sesión de los 7 roles | Corrida 42966111975 |
| ZAP en staging | RNF-SEG-002 | Staging | Satisfactorio: 0 fallas. 6 avisos, entre ellos CSP con `'unsafe-inline'` (12.2) | Corrida 42966111975 |

## 4. Subcaracterísticas de prioridad Alta cubiertas (sección 8.4)

Fuente: `catalogo-requisitos.md`, apartado 5.

| Requisito | Subcaracterística o atributo | Casos | Resultado |
|---|---|---|---|
| RF-006 | Corrección funcional | CF-PAG-01, CI-PAG-01 | Cumple |
| RF-006 | Interoperabilidad | — | **No verificable:** la pasarela es simulada (CC-020) |
| RF-006 | Tolerancia a fallos | R-15 | Cumple |
| RF-006 | Actualidad (dato) | CD-DAT-06 | **No verificada** (NC-018) |
| RF-006 | Consistencia (dato) | CI-PAG-01; cargos una sola vez | Parcial: sin CD-DAT-03 (NC-018) |
| RF-007 | Completitud funcional | CF-TRA-01, tres tipos | Cumple |
| RF-007 | No repudio | Bitácora del trámite con autor; hash del documento | Cumple |
| RF-007 | Completitud y trazabilidad (dato) | R-17; CS-SEG-06 en constancia | Cumple |
| RF-009 | Pertinencia funcional; accesibilidad (dato) | CF-REP-01 | Cumple |
| RF-010 | Pertinencia funcional, operabilidad; comprensibilidad (dato) | CF-TRA-02; axe en mis trámites | Cumple |
| RNF-SEG-001 | Integridad, no repudio, responsabilidad, autenticidad; trazabilidad (dato) | CS-SEG-06, R-22, CS-SEG-04 | Cumple |

## 5. Defectos abiertos

Ninguno. El único registrado en la fase es #69 (cobro doble, `sev-critica`, `RF-006`). Lo encontró una revisión de código en 11.1, no una prueba. Se corrigió con #71 y se cerró el 10 de noviembre de 2026, de 21:51 a 23:01, hora de México (NC-012).

## 6. Riesgos

Matriz revisada el 10 de noviembre de 2026: `docs/calidad/matriz-riesgos.md`. AMFE de pagos: `docs/calidad/amfe-pagos.md`, hecho después de construir (NC-017).

| Riesgo | Estado |
|---|---|
| RK-02, cobro duplicado | Mitigado con #71. Falta CD-DAT-03 (NC-018) |
| RK-03, bitácora alterable | Mitigado en lo aplicable: inmutable y con CS-SEG-06 en pago y constancia |
| RK-08, fallo de la pasarela | Bajo, mitigado con R-15 (replanteado por CC-020) |
| RK-15, el alumno aprueba su propio pago en la pasarela simulada | **Alto, aceptado** en CC-020 por el Product Owner. Solo datos sintéticos |
| RK-04, carga | Aceptado con plan: se ensaya en el Batch 13 |

## 7. Línea base (sección 15.3)

- **Etiqueta:** `v0.4.0`, retroactiva sobre `develop` en el sub-batch 11.4, sin `release/0.4.0` ni fusión a `main` (NC-015). Debe incluir `d4cce7d`.
- **Requisitos:** RF-006, RF-007, RF-009 y RF-010; RNF-SEG-001 en las cuatro operaciones.
- **Migraciones:** las de `v0.3.0` más `20261110140000_tramites`.
- **Configuración:** `infra/staging/`.
- **Imágenes:** digests de `sce-api` y `sce-portal` firmados con cosign. Los últimos son de la corrida 42963020677 sobre `fdaae09`; los de `v0.4.0` y su `cosign verify` se registran en 11.4.

## 8. Decisión

**Aceptada · Aceptada con condiciones · Rechazada.** Observaciones:

Propuesta del autor: **aceptada con condiciones**. Las condiciones son las del apartado 9.

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Acepta: Product Owner y QA (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
| Produjo | Francisco Javier Martínez Peñas | | |

> SJOM no firma: no revisó ningún entregable de la fase. Se declara en lugar de dejar la fila vacía sin explicación. El asistente de IA es coautor y no firma.

## 9. Condiciones y pendientes

| # | Qué | Responsable | Fecha |
|---|---|---|---|
| 1 | Firmar antes ACT-F0-001 a ACT-F3-001, en ese orden | FJMP | 20 de noviembre de 2026 (NC-002, NC-009 a NC-011) |
| 2 | Etiquetar `v0.4.0`, verificar sus imágenes con cosign y anotar los digests | FJMP | Sub-batch 11.4 |
| 3 | Decidir CC-008 y CC-009, y firmar el acta de cambios mayores | FJMP | 20 de noviembre de 2026 (NC-008) |
| 4 | CD-DAT-03 y CD-DAT-06, con CC-011 | FJMP | Sub-batch 12.1 (NC-018) |
| 5 | STRIDE v1.7 con pagos, caja, trámites y reportes; ZAP con acceso cruzado; CSP sin `'unsafe-inline'` | FJMP | Sub-batch 12.2 (NC-017) |
| 6 | Ratificar D-7, D-9, D-10 y D-12 con las reglas reales de la universidad | Product Owner (FJMP) | Sin fecha en el plan; rigen como provisionales |
| 7 | Pedir por escrito un auditor independiente para la autoauditoría de esta fase (`auditoria-fase-4.md`) | FJMP | 20 de noviembre de 2026 (NC-013) |

La auditoría interna de cierre de la fase 4 (Tabla 60) se hizo como autoauditoría por reejecución: `docs/calidad/auditoria-fase-4.md`. El tablero de la Tabla 59 está en `docs/calidad/informe-fase-4.md`.
