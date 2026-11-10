# Acta de aceptación de fase — Fase 2

**Acta número:** ACT-F2-001
**Objeto:** fase 2, Alumnos · release `v0.2.0`
**Fecha real de la decisión:** pendiente; no se antedata
**Etiqueta o commit:** pendiente (`v0.2.0-rc.N` en staging, luego `v0.2.0`)
**Participantes:** Samuel Jezoar Ortiz Martínez (Product Owner y QA de este entregable); Francisco Javier Martínez Peñas (autor)

> **Estado: borrador preparado por el autor al terminar el Batch 6. No está lista para firma.** La evidencia técnica corresponde a las ramas de los PR #59, #60 y el del Batch 6, no a una etiqueta. La fase abrió sin el acta de la fase 1 firmada (NC-009). Antes de firmar debe cumplirse el apartado 9.

---

## 1. Condición mínima de la Tabla 23

"Expediente único, inscripción por semestre con requisitos y adeudos, y portales básicos."

| Condición evaluada | Resultado propuesto | Evidencia |
|---|---|---|
| Expediente único | Cumple | CF-EXP-01: el cambio de plantel conserva el mismo expediente, con historial, inscripciones y trayectoria (PR #59) |
| Inscripción por semestre con requisitos | Cumple | CF-INS-01 y 02; orden fijo de la Fig. 4 con tabla de decisión (PR #60) |
| Inscripción por semestre con adeudos | Cumple con regla provisional | D-10, adeudo = saldo mayor que cero, sin ratificar; los cargos reales llegan en el Batch 9 |
| Portales básicos | Cumple | Control escolar (búsqueda, alta, expediente, cambio de plantel, inscripciones) y alumno (mi expediente, inscripción y comprobante); `demostracion-por-rol.cy.ts` |

## 2. Condiciones generales (sección 10.1)

| Condición | Resultado propuesto | Evidencia |
|---|---|---|
| Todo requisito Must del incremento tiene al menos un caso con resultado satisfactorio | Cumple: RF-001, RF-002, RNF-DAT-001 y RNF-USU-001 | Apartado 3 |
| No existen defectos críticos abiertos | Cumple: ningún issue con etiqueta `defecto` | GitHub Issues |
| La bitácora registra las operaciones sensibles del incremento | Cumple: cambio de plantel y de estatus con valor anterior; inscripción confirmada, rechazada, ajustada y ajuste rechazado | `expediente.spec.ts`, `inscripcion.spec.ts`. El motivo del ajuste rechazado no queda en la bitácora (PR #60) |
| El incremento es desplegable en pruebas o staging | **Por comprobar.** Staging está configurado y ensayado, pero no tiene servidores | `inventario-de-ambientes.md`; ensayo de la etapa 7 |
| El alcance no incluye funcionalidades fuera de la primera versión, salvo cambio aprobado | **Sujeto a aprobar CC-013 (Mayor), CC-016 y CC-017** | `registro-de-cambios.md` |

## 3. Resultados de pruebas (sección 10.4)

Se llena con la corrida de la etiqueta. Ambientes: pruebas (GitHub Actions con base efímera) y staging (Tabla 30).

| Caso | Requisito | Herramienta | Resultado en la rama | Evidencia en la etiqueta |
|---|---|---|---|---|
| CF-EXP-01 | RF-001 | Jest, Supertest y Cypress | Satisfactorio | |
| CF-INS-01 y 02 | RF-002, RNF-USU-001 | Cypress, Supertest y Newman | Satisfactorio, con los cuatro motivos de rechazo | |
| CF-HOR-01 | RF-003 | Jest y Cypress (aviso de choque) | Satisfactorio. Con Cypress sobre la oferta, en el Batch 7 | |
| CI-API-01 | RF-002 | Supertest y Testcontainers | Satisfactorio, con concurrencia de cinco alumnos por dos lugares | |
| CD-DAT-01, 04 y 05 | RNF-DAT-001 | SQL y Great Expectations | Satisfactorio: 17 expectativas; fallan con datos alterados, comprobado | |
| CS-SEG-02 | RNF-SEG-001 | Supertest | **Parcial:** ninguna ruta escribe el historial; la captura llega en el Batch 8 | |
| CS-SEG-03 | RNF-SEG-001 | Supertest y ZAP | Satisfactorio con Supertest. **ZAP no prueba acceso cruzado** (Batch 12) | |
| CS-SEG-06 en plantel | RNF-SEG-001 | SQL | Satisfactorio | |
| CF-ROL-01 y CS-SEG-04 | RF-008 | Supertest y Newman | Satisfactorio sobre 32 operaciones | |
| Humo en staging (Anexo D) | Tabla 30 | `verificar-staging.sh` | **Sobre staging efímero de cada pull request** (CC-018); falta la corrida de la etapa 8 con `v0.2.0-rc.1` | |
| ZAP en staging | RNF-SEG-002 | OWASP ZAP | **Pasivo, sobre staging efímero de cada pull request;** falta la corrida con `v0.2.0-rc.1` | |

## 4. Subcaracterísticas de prioridad Alta cubiertas (sección 8.4)

| Subcaracterística | Casos de aceptación | Resultado propuesto |
|---|---|---|
| Completitud y corrección funcional | CF-EXP-01, CF-INS-01 y 02, CI-API-01 | Cumple |
| Confidencialidad | CS-SEG-03, CF-ROL-01 | Cumple con Supertest; ZAP parcial |
| Integridad | CS-SEG-06, CD-DAT-05, conciliación de ocupación | Cumple sobre lo que existe |
| Responsabilidad | Bitácora del expediente y de la inscripción | Cumple, salvo el motivo del ajuste rechazado |
| Protección contra errores de usuario | Aviso de choque antes de enviar, estado y corrección por motivo (RNF-USU-001) | Cumple |
| Capacidad | CI-API-01: cinco alumnos por dos lugares, sin sobrecupo. La concurrencia de la semana 1 (CR-REN-02) se mide en staging en el Batch 13 | Parcial |
| Capacidad de ser probado | Etapas 3 y 4, con 100 % del dominio | Cumple |

## 5. Defectos abiertos

Ninguno registrado. Los fallos encontrados se corrigieron antes de abrir cada PR y están en su cuerpo. Entre ellos, la carrera entre dos cargas simultáneas del mismo alumno (#60) y `db/pgaudit.sql`, que no corría en PostgreSQL 16 (Batch 6).

## 6. Riesgos

Matriz revisada: `docs/calidad/matriz-riesgos.md`. RK-05 queda mitigado en la inscripción. RK-09 se verifica en cada despliegue a staging. RK-04 sigue aceptado con plan: la carga se mide en el Batch 13.

## 7. Línea base (sección 15.3)

- **Etiqueta:** `v0.2.0`.
- **Requisitos:** RF-001, RF-002, RNF-DAT-001 y RNF-USU-001.
- **Migraciones:** las tres de `v0.1.0`. La fase no agrega migraciones.
- **Configuración:** `infra/staging/`.
- **Imágenes:** digests de `sce-api` y `sce-portal` en el registro de despliegues del inventario.

QA verifica que lo desplegado en staging corresponde a la etiqueta.

## 8. Decisión

**Aceptada · Aceptada con condiciones · Rechazada.** Observaciones:

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner (rinde cuentas de la aceptación) | Samuel Jezoar Ortiz Martínez | | |
| QA (declara si la evidencia es suficiente) | Samuel Jezoar Ortiz Martínez | | |
| Autor del entregable (no decide) | Francisco Javier Martínez Peñas | | |

## 9. Lo que falta antes de firmar

| # | Qué | Responsable |
|---|---|---|
| 1 | Aceptar la invitación al repositorio, reenviada el 10 de noviembre; vence el 17 | SJOM |
| 2 | Firmar ACT-F1-001 y cerrar la fase 1 (NC-009) | SJOM |
| 3 | Aprobar CC-013, CC-016 y CC-017, CC-005 para staging y CC-018 (staging efímero) | SJOM |
| 4 | Ratificar D-5, D-6, D-10, D-14 y D-15 | PO |
| 5 | Fusionar a `develop`, en orden, #59, #60 y el del Batch 6 | SJOM |
| 6 | Configurar la regla de revisores del ambiente `staging` (inventario, sección 3), etiquetar `v0.2.0-rc.1` y lanzar la etapa 8, que corre el humo del Anexo D. Sin servidores que montar (CC-018) | FJMP; aprueban PO y QA |
| 7 | **Auditoría interna de cierre de fase 2** (Tabla 60), con auditor externo al equipo: alcance, expediente e inscripción; criterios, SCE-MC-001 vigente, RF-001, RF-002 y RNF-DAT-001. Índice de evidencia en `docs/calidad/auditoria-fase-2-evidencia.md` | Auditor por designar |
| 8 | **Revisión programada del manual** (Tabla 1: "al cierre de la Fase 2"), con la lista de contradicciones y los CC aprobados | Ambos |
| 9 | Crear `release/0.2.0`, fusionar a `main`, etiquetar `v0.2.0` y publicar las notas de versión | FJMP, autoriza SJOM |
| 10 | Copiar reportes a `docs/evidencias/fase-2/` con su corrida y SHA-256 (Tabla 62) | FJMP |
| 11 | Informe de fase con el tablero de la Tabla 59 actualizado a la etiqueta | QA |
