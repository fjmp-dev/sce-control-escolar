# Acta de aceptación de fase — Fase 2

**Acta número:** ACT-F2-001
**Objeto:** fase 2, Alumnos · release `v0.2.0`
**Fecha real de la decisión:** pendiente; no se antedata
**Etiqueta o commit:** pendiente (`v0.2.0-rc.N` en staging, luego `v0.2.0`)
**Participantes:** Francisco Javier Martínez Peñas (Product Owner, QA y autor; desviación, NC-012), con asistente de IA declarado. SJOM figuraba como Product Owner y QA; no revisó ningún entregable

> **Estado: borrador del autor al terminar el Batch 6, revisado el 10 de noviembre de 2026 (sub-batch 11.3).** La evidencia técnica corresponde a las ramas de los PR #59, #60 y #61, no a una etiqueta. La fase abrió sin el acta de la fase 1 firmada (NC-009). La firma FJMP como Product Owner y QA (NC-012), después de ACT-F1-001 y antes de ACT-F3-001. Antes de firmar debe cumplirse lo que el apartado 9 marca como previo.

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
| Acepta: Product Owner y QA (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
| Produjo | Francisco Javier Martínez Peñas | | |

> SJOM no firma: no revisó ningún entregable de la fase. Se declara en lugar de dejar la fila vacía sin explicación. El asistente de IA es coautor y no firma.

## 9. Lo que falta antes de firmar

> **Nota del 10 de noviembre de 2026 (retoma, `plan-de-sistema.md`, 6.2):** lo que este apartado asigna a SJOM pasa a FJMP (NC-012). Los PR de la fase ya se fusionaron en `develop` el 10 de noviembre, sin revisión ni aprobación (NC-001 y NC-012). El cierre de versión es una etiqueta retroactiva sobre `develop`, sin `release/0.x.0` ni fusión a `main` (NC-015). El apartado se reescribe al firmar el acta, en el sub-batch 11.3.

| # | Qué | Responsable | Estado al 10 de noviembre de 2026 |
|---|---|---|---|
| 1 | Aceptar la invitación al repositorio | SJOM | Hecho el 10 de noviembre, con permiso _write_. No revisó ni aprobó ningún entregable (NC-012) |
| 2 | **Previo a la firma:** firmar ACT-F1-001 y cerrar la fase 1 (NC-009) | FJMP | Pendiente. Fecha comprometida: 20 de noviembre de 2026 |
| 3 | Aprobar CC-013, CC-016, CC-017, CC-005 para staging y CC-018 | FJMP | CC-013, CC-016, CC-017 y CC-018, aprobados el 10 de noviembre, después de fusionarse (NC-008). **CC-005, sin decisión** |
| 4 | Ratificar D-5, D-6, D-10, D-14 y D-15 | Product Owner (FJMP) | Pendiente; rigen como provisionales |
| 5 | Fusionar a `develop`, en orden, #59, #60 y #61 | FJMP | Fusionados el 10 de noviembre, sin revisión (NC-001 y NC-012) |
| 6 | Regla de revisores del ambiente `staging`, `v0.2.0-rc.1` y etapa 8 | FJMP | Cambia: el ambiente y la etapa 8 llegan en 11.4, solo con `v0.4.0-rc.1`. `v0.2.0` no tiene candidata. El humo corrió en el staging efímero de cada PR (CC-018) |
| 7 | Auditoría interna de cierre de fase 2 (Tabla 60) | FJMP, autoauditoría (NC-013) | Hecha el 10 de noviembre por reejecución: `docs/calidad/auditoria-fase-2.md`. Falta pedir un auditor independiente (20 de noviembre de 2026) |
| 8 | Revisión programada del manual (Tabla 1) | FJMP | Hecha tarde, como manual v3.0 del 10 de noviembre; sin firma |
| 9 | **Previo a la firma:** etiqueta `v0.2.0` | FJMP | Cambia: retroactiva sobre `develop` en 11.4, sin `release/0.2.0` ni fusión a `main` (NC-015) |
| 10 | Copiar reportes a `docs/evidencias/fase-2/` con su corrida y SHA-256 (Tabla 62) | FJMP | Pendiente; sin sub-batch en el plan |
| 11 | Informe de fase con el tablero de la Tabla 59 actualizado a la etiqueta | FJMP como QA | Densidad y dominio actualizados en 11.3. Falta la lista de QA sobre la etiqueta (11.4) |

**Orden de firma:** ACT-F0-001, ACT-F1-001, ACT-F2-001, ACT-F3-001 y ACT-F4-001, cada una con su fecha real. Antes de firmar esta acta: los puntos marcados como previos. Lo demás queda como condición si se acepta con condiciones.
