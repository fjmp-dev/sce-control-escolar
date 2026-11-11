# Acta de aceptación de fase — Fase 3

**Acta número:** ACT-F3-001
**Objeto:** fase 3, Académico · release `v0.3.0`
**Fecha real de la decisión:** pendiente; no se antedata
**Etiqueta o commit:** pendiente (`v0.3.0-rc.N` en staging, luego `v0.3.0`)
**Participantes:** Francisco Javier Martínez Peñas (Product Owner, QA y autor; desviación, NC-012), con asistente de IA declarado. SJOM figuraba como Product Owner y QA; no revisó ningún entregable

> **Estado: borrador del autor al terminar el Batch 8, revisado el 10 de noviembre de 2026 (sub-batch 11.3).** La evidencia técnica corresponde a las ramas de los PR #62 y #63, no a una etiqueta. La fase abrió sin las actas de las fases 1 y 2 firmadas (NC-009, NC-010). La firma FJMP como Product Owner y QA (NC-012), después de ACT-F2-001 y antes de ACT-F4-001. Antes de firmar debe cumplirse lo que el apartado 9 marca como previo.

---

## 1. Condición mínima de la Tabla 23

"Horarios con detección de choques, captura y consulta de calificaciones e historial actualizable."

| Condición evaluada | Resultado propuesto | Evidencia |
|---|---|---|
| Horarios con detección de choques | Cumple con regla provisional | CF-HOR-01: el choque se avisa antes de enviar la carga (Batch 5) y el aula o el profesor no se traslapan al definir la oferta (D-13, Batch 7) |
| Captura de calificaciones | Cumple | CF-CAL-01: el profesor captura solo en sus grupos y solo en la ventana de captura (D-6, CC-019), con el valor anterior en bitácora (Batch 8) |
| Consulta de calificaciones | Cumple | CI-CAL-01: el alumno consulta la calificación en cuanto se confirma la captura (Batch 8) |
| Historial actualizable | Cumple con reglas provisionales | RF-005: el cierre recalcula promedio, créditos y avance con una sola función de redondeo; CD-DAT-02 coincide al 100 % sobre 30 expedientes. D-5, D-8 y D-16 sin ratificar |

## 2. Condiciones generales (sección 10.1)

| Condición | Resultado propuesto | Evidencia |
|---|---|---|
| Todo requisito Must del incremento tiene al menos un caso con resultado satisfactorio | Cumple: RF-003, RF-004 y RF-005 | Apartado 3 |
| No existen defectos críticos abiertos | Cumple: ningún issue con etiqueta `defecto` | GitHub Issues |
| La bitácora registra las operaciones sensibles del incremento | Cumple: abrir periodo, alta de grupo, publicar oferta, iniciar curso, captura con valor anterior, cierre, recálculo de historial y corrección con motivo y evidencia | `oferta.spec.ts`, `calificaciones.spec.ts`; CS-SEG-06 en calificación |
| El incremento es desplegable en pruebas o staging | Cumple en pruebas y en staging efímero (CC-018) en cada pull request; falta la corrida de la etapa 8 con la etiqueta | Etapa 7 de cada PR |
| El alcance no incluye funcionalidades fuera de la primera versión, salvo cambio aprobado | **Sujeto a aprobar CC-012, CC-014 y CC-019 (Mayor)** | `registro-de-cambios.md` |

## 3. Resultados de pruebas (sección 10.4)

Se llena con la corrida de la etiqueta. Ambientes: pruebas (GitHub Actions con base efímera) y staging (Tabla 30).

| Caso | Requisito | Herramienta | Resultado en la rama | Evidencia en la etiqueta |
|---|---|---|---|---|
| CF-HOR-01 | RF-003 | Jest y Cypress | Satisfactorio, en la inscripción y al definir la oferta | |
| CF-CAL-01 | RF-004 | Cypress y Supertest | Satisfactorio: un profesor ajeno recibe 403 y no averigua quién está inscrito | |
| CI-CAL-01 | RF-004 | Supertest | Satisfactorio: la consulta lee el registro recién confirmado | |
| CD-DAT-02 | RF-005, RNF-DAT-001 | SQL y Great Expectations | Satisfactorio: 30 expedientes, con reprobadas y recursadas; detecta un historial alterado | |
| CS-SEG-01 | RF-008 | Supertest y Newman | Satisfactorio: el alumno recibe 403 al capturar | |
| CS-SEG-02 | RNF-SEG-001 | Supertest | Satisfactorio en calificaciones: caja y dirección no cierran ni corrigen. Pagos llega en el Batch 9 | |
| CS-SEG-06 en calificación | RNF-SEG-001 | SQL y Great Expectations | Satisfactorio: detecta una calificación sin asiento y una captura firmada por otro | |
| CF-ROL-01 y CS-SEG-04 | RF-008 | Supertest y Newman | Satisfactorio sobre 41 operaciones protegidas | |

## 4. Subcaracterísticas de prioridad Alta cubiertas (sección 8.4)

| Subcaracterística | Casos de aceptación | Resultado propuesto |
|---|---|---|
| Completitud y corrección funcional | CF-HOR-01, CF-CAL-01, CI-CAL-01 | Cumple |
| Exactitud y precisión (Tabla 16) | CD-DAT-02; una sola función de redondeo, con valores límite | Cumple con reglas provisionales |
| Confidencialidad | CS-SEG-01, CF-ROL-01 | Cumple |
| Integridad | CS-SEG-02, CS-SEG-06; cierre y captura serializados por periodo | Cumple sobre lo que existe |
| Responsabilidad y trazabilidad | Bitácora de captura, cierre y corrección | Cumple |
| Credibilidad (Tabla 16) | El profesor de origen se conserva en la corrección; CS-SEG-06 lo verifica | Cumple |
| Capacidad de ser probado | Etapas 3 y 4, con el umbral del dominio | Cumple |

## 5. Defectos abiertos

Ninguno registrado. Los fallos encontrados se corrigieron antes de abrir cada PR y están en su cuerpo. Entre ellos, que la captura revelaba si un folio estaba inscrito en un grupo ajeno, y que el seed tenía a un profesor en dos grupos a la misma hora.

## 6. Riesgos

Matriz revisada: `docs/calidad/matriz-riesgos.md`. RK-05 queda mitigado también al definir la oferta. RK-04 sigue aceptado con plan: la carga se mide en el Batch 13.

## 7. Línea base (sección 15.3)

- **Etiqueta:** `v0.3.0`.
- **Requisitos:** RF-003, RF-004 y RF-005.
- **Migraciones:** las de `v0.2.0` más `20261110120000_oferta_publicada`.
- **Configuración:** `infra/staging/`.
- **Imágenes:** digests de `sce-api` y `sce-portal` en el registro de despliegues del inventario.

## 8. Decisión

**Aceptada · Aceptada con condiciones · Rechazada.** Observaciones:

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Acepta: Product Owner y QA (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
| Produjo | Francisco Javier Martínez Peñas | | |

> SJOM no firma: no revisó ningún entregable de la fase. Se declara en lugar de dejar la fila vacía sin explicación. El asistente de IA es coautor y no firma.

## 9. Lo que falta antes de firmar

> **Nota del 10 de noviembre de 2026 (retoma, `plan-de-sistema.md`, 6.2):** lo que este apartado asigna a SJOM pasa a FJMP (NC-012). Los PR de la fase ya se fusionaron en `develop` el 10 de noviembre, sin revisión ni aprobación (NC-001 y NC-012). El cierre de versión es una etiqueta retroactiva sobre `develop`, sin `release/0.x.0` ni fusión a `main` (NC-015). El apartado se reescribe al firmar el acta, en el sub-batch 11.3.

| # | Qué | Responsable | Estado al 10 de noviembre de 2026 |
|---|---|---|---|
| 1 | **Previo a la firma:** firmar ACT-F1-001 y ACT-F2-001 y cerrar las fases 1 y 2 (NC-009, NC-010) | FJMP | Pendiente. Fecha comprometida: 20 de noviembre de 2026 |
| 2 | Aprobar CC-012, CC-014, CC-018 y CC-019 | FJMP | Aprobados el 10 de noviembre, después de fusionarse (NC-008) |
| 3 | Ratificar D-5, D-6, D-8, D-13, D-16 y D-17 con las reglas reales de la UAEM | Product Owner (FJMP) | Pendiente; rigen como provisionales |
| 4 | Fusionar a `develop`, en orden, los PR de los batches 7 y 8 | FJMP | #62 y #63, fusionados el 10 de noviembre, sin revisión (NC-001 y NC-012) |
| 5 | Etiquetar `v0.3.0-rc.1` y lanzar la etapa 8 con su acta de promoción | FJMP | Cambia: `v0.3.0` no tiene candidata. La etapa 8 llega en 11.4, solo con `v0.4.0-rc.1` |
| 6 | **Previo a la firma:** etiqueta `v0.3.0` | FJMP | Cambia: retroactiva sobre `develop` en 11.4, sin `release/0.3.0` ni fusión a `main` (NC-015) |
| 7 | Copiar reportes a `docs/evidencias/fase-3/` con su corrida y SHA-256 (Tabla 62) | FJMP | Pendiente; sin sub-batch en el plan |
| 8 | Informe de fase con el tablero de la Tabla 59 actualizado a la etiqueta | FJMP como QA | Dominio, densidad y vulnerabilidades actualizados en 11.3. Falta la lista de QA sobre la etiqueta (11.4) |

**Orden de firma:** ACT-F0-001, ACT-F1-001, ACT-F2-001, ACT-F3-001 y ACT-F4-001, cada una con su fecha real. Antes de firmar esta acta: los puntos marcados como previos. Lo demás queda como condición si se acepta con condiciones.

La Tabla 60 no fija auditoría interna al cierre de la fase 3; la siguiente es al cierre de la fase 4.
