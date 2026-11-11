# Acta de aceptación de fase — Fase 1

**Acta número:** ACT-F1-001
**Objeto:** fase 1, Núcleo institucional · release `v0.1.0`
**Fecha real de la decisión:** pendiente; no se antedata
**Etiqueta o commit:** pendiente
**Participantes:** Francisco Javier Martínez Peñas (Product Owner, QA y autor; desviación, NC-012), con asistente de IA declarado. SJOM figuraba como Product Owner y QA; no revisó ningún entregable

> **Estado: borrador del autor al terminar el Batch 3, revisado el 10 de noviembre de 2026 (sub-batch 11.3).** La evidencia técnica corresponde a la rama del PR, no a una etiqueta. La firma FJMP como Product Owner y QA (NC-012), después de ACT-F0-001 y antes de ACT-F2-001. Antes de firmar debe cumplirse lo que el apartado 9 marca como previo.

---

## 1. Condición mínima de la Tabla 23

| Condición evaluada | Resultado propuesto | Evidencia |
|---|---|---|
| Catálogo de facultades | Cumple | `facultades` en API y portal; `catalogos.cy.ts` |
| Catálogo de periodos | Cumple | `periodos` en API y portal; `catalogos.cy.ts` |
| Catálogo de planes | Cumple | `planes` en API y portal; `catalogos.cy.ts` |
| Catálogo de materias | Cumple | `materias` y prerrequisitos en API y portal; `catalogos.cy.ts` |
| Catálogo de usuarios | Cumple | `usuarios` en API y portal; `usuarios.cy.ts` |
| Autenticación de los seis roles | Cumple | `demostracion-por-rol.cy.ts`, con video y capturas por rol; `scripts/humo.sh` |

## 2. Condiciones generales (sección 10.1)

| Condición | Resultado propuesto | Evidencia |
|---|---|---|
| Todo requisito Must del incremento tiene al menos un caso con resultado satisfactorio | Cumple en lo que toca a la fase: RF-008, RNF-SEG-001, RNF-SEG-002 y RNF-MAN-001 | Apartado 3 |
| No existen defectos críticos abiertos | Cumple: ningún issue con etiqueta `defecto` | GitHub Issues |
| La bitácora registra cambios de calificación, pago y emisión de constancia en el alcance del incremento | No aplica: esas operaciones no existen. Sí registra accesos fallidos, cambios de rol y acciones del administrador | `seguridad.spec.ts`, `usuarios.spec.ts`, `sesiones.spec.ts` |
| El incremento es desplegable en pruebas o staging, y su promoción a piloto cumple la sección 20 | **Por comprobar sobre `develop`.** Solo se ensayó desde la rama | Etapas 6 y 7 |
| El alcance no incluye funcionalidades fuera de la primera versión, salvo cambio aprobado | **Sujeto a aprobar CC-007, CC-010 y CC-015** | `registro-de-cambios.md` |

## 3. Resultados de pruebas (sección 10.4)

Se llena con la corrida de la etiqueta. Ambiente: pruebas, GitHub Actions con base efímera (Tabla 30).

| Caso | Requisito | Herramienta | Resultado en la rama | Evidencia en la etiqueta |
|---|---|---|---|---|
| CS-SEG-04 | RF-008, RNF-SEG-001 | Newman | Satisfactorio | |
| CS-SEG-05 | RNF-SEG-002 | OWASP ZAP | Satisfactorio | |
| CS-SEG-07 | RF-008, RNF-SEG-001 | Supertest | Satisfactorio | |
| CS-SEG-08 | RNF-SEG-002 | Gitleaks y revisión manual | **Falta la revisión de Seguridad** | |
| CI-AUTH-01 | RF-008 | Supertest | Satisfactorio | |
| CF-ROL-01 | RF-008 | Supertest y Cypress | Satisfactorio sobre lo que existe | |
| CI-MIG-01 | RNF-MAN-001 | Prisma y Testcontainers | Satisfactorio | |
| CD-DAT-01 y CD-DAT-04 | RNF-DAT-001 | Consulta SQL | Satisfactorio. Great Expectations llega en el Batch 4 | |
| Interfaz Next.js y NestJS (Tabla 44) | RF-008 | Cypress, y tipos generados del OpenAPI | Satisfactorio | |
| Accesibilidad (28.2) | Tabla 15, Inclusividad | axe y Lighthouse | Satisfactorio. **Falta la revisión manual de QA** | |

CS-SEG-01, 02, 03 y 06 no aplican: sus endpoints llegan en los batches 4 y 8.

## 4. Subcaracterísticas de prioridad Alta cubiertas (sección 8.4)

Las demás subcaracterísticas de prioridad Alta de la Tabla 15 dependen de módulos de fases posteriores y no se evalúan en esta fase.

| Subcaracterística | Casos de aceptación | Resultado propuesto |
|---|---|---|
| Pertinencia funcional | CF-ROL-01 | Cumple sobre lo que existe |
| Autenticidad | CS-SEG-04, CS-SEG-07 | Cumple |
| Confidencialidad | CI-AUTH-01, CF-ROL-01. CS-SEG-03 en el Batch 4 | Parcial |
| Responsabilidad | Bitácora de usuarios y catálogos | Parcial: faltan inscripción, calificación, pago y constancia |
| Integridad | Control de RK-03, bitácora inmutable | Parcial, por la misma razón |
| Modularidad | Módulos de la Fig. 2 | Cumple sobre lo que existe |
| Capacidad de ser probado | CO-MAN-01: etapas 3 y 4 con cobertura | Cumple |
| Protección contra errores de usuario | Validación y mensajes en los formularios, `catalogos.cy.ts` | Cumple sobre lo que existe |

## 5. Defectos abiertos

Ninguno registrado. Los hallazgos corregidos durante los batches están en sus pull requests y en `docs/calidad/accesibilidad.md`.

## 6. Riesgos

Matriz revisada: `docs/calidad/matriz-riesgos.md`. RK-03 y RK-07 siguen en mitigación por lo que falta en los batches 4 y 8; RK-04 sigue aceptado con plan fechado (ACT-F0-001).

## 7. Línea base (sección 15.3)

Etiqueta `v0.1.0`; requisitos RF-008, RNF-SEG-001, RNF-SEG-002 y RNF-MAN-001, en lo aplicable a la fase; las tres migraciones de `docs/gobierno/notas-version/v0.1.0.md`; configuración de `docker-compose.yml` y digests de `sce-api` y `sce-portal` en el artefacto `imagenes`. QA verifica que lo desplegado corresponde a la etiqueta.

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
| 1 | Aceptar la invitación al repositorio | SJOM | Hecho el 10 de noviembre, con permiso _write_. No revisó ni aprobó ningún entregable (NC-012) |
| 2 | **Previo a la firma:** firmar el acta de la fase 0 (NC-002) | FJMP | Pendiente. Fecha comprometida: 20 de noviembre de 2026 |
| 3 | Aprobar CC-001 a CC-015 con fecha y responsable | FJMP | CC-010 y CC-012 a CC-015, aprobados el 10 de noviembre, después de fusionarse; CC-011, antes de implementarse. **CC-001 a CC-009, sin decisión** (NC-008, 20 de noviembre de 2026) |
| 4 | Revisar y fusionar a `develop`, en orden, los PR #30, #55, #56, #57 y #58 | FJMP | Fusionados el 10 de noviembre, sin revisión (NC-001 y NC-012) |
| 5 | Ratificar la regla D-11 con el catálogo institucional | Product Owner (FJMP) | Pendiente; rige como provisional |
| 6 | Revisión de Seguridad de CS-SEG-08 | FJMP como Seguridad | Pendiente; sin sub-batch en el plan |
| 7 | Revisión manual de accesibilidad | FJMP | Pendiente; sub-batch 12.4 |
| 8 | Emitir el manual v2.1 con su registro de aprobación (D-1, NC-004) | FJMP | Lo reemplaza el manual v3.0 (`manual-v3.0.md`), emitido el 10 de noviembre; sin firma |
| 9 | Comprobar las etapas 6 y 7 sobre `develop` | FJMP | Hecho: corrida 42963020677 sobre `fdaae09`, etapas 1 a 7 en verde |
| 10 | **Previo a la firma:** etiqueta `v0.1.0` | FJMP | Cambia: retroactiva sobre `develop` en 11.4, sin `release/0.1.0` ni fusión a `main` (NC-015) |
| 11 | Copiar reportes a `docs/evidencias/fase-1/` con su corrida y SHA-256 (Tabla 62) | FJMP | Pendiente; sin sub-batch en el plan. Solo existe `docs/evidencias/fase-4/` |
| 12 | Informe de fase con el tablero de la Tabla 59 actualizado a la etiqueta | FJMP como QA | Densidad actualizada en 11.3. Falta la lista de QA sobre la etiqueta (11.4) |

**Orden de firma:** ACT-F0-001, ACT-F1-001, ACT-F2-001, ACT-F3-001 y ACT-F4-001, cada una con su fecha real. Antes de firmar esta acta: los puntos marcados como previos. Lo demás queda como condición si se acepta con condiciones.
