# Acta de sprint S3

**Sprint:** S3, del 2 al 13 de noviembre de 2026 · **Meta:** atender la auditoría en campo y construir las fases 1 a 4 (batches 0 a 10)
**Elaborada:** 10 de noviembre de 2026, con corte en la fusión del PR #68 (21:46, hora de México). El sprint cierra el 13 de noviembre: lo que se entregue del 11 al 13 se agrega en el apartado 5 antes de firmar.

| Acepta, según el plan | Produce, según el plan | Lo que ocurrió |
|---|---|---|
| SJOM | FJMP | FJMP produjo, revisó y fusionó todo. SJOM aceptó la invitación al repositorio el 10 de noviembre a las 20:24, con permiso _write_, pero no revisó ni aprobó ningún PR (NC-012) |

**Desviación declarada:** FJMP firma esta acta como Product Owner y QA, aunque produjo lo que se acepta. Desde el 10 de noviembre de 2026 ocupa todos los roles (`roles-y-raci.md`, apartado 6; NC-012), con asistente de IA declarado.

## 1. Batches entregados

Fechas de `gh pr list --state merged`, en hora de México (GitHub registra UTC). La pila se fusionó de arriba hacia abajo: cada PR sobre la rama del anterior y, al final, el #30 en `develop`.

| PR | Batch (issue) | Entregable | Abierto | Fusionado |
|---|---|---|---|---|
| #30 | Fase 1 | Alta de usuarios, CI ampliado y respuesta a F-01 | 5 nov, 14:24 | 10 nov, 21:21, en `develop` (`1d2b48d`) |
| #55 | 0 (#31) | Base documental y reconciliación con el manual | 5 nov, 22:47 | 10 nov, 20:39 |
| #56 | 1 (#41) | Estándares y etapas 1 a 5 de la Tabla 53 | 6 nov, 10:16 | 10 nov, 20:39 |
| #57 | 2 (#42) | Arquitectura por capas, identidad y bitácora | 6 nov, 16:44 | 10 nov, 20:39 |
| #58 | 3 (#43) | Portal Next.js, despliegue a pruebas y cierre de fase 1 en borrador | 7 nov, 20:50 | 10 nov, 20:39 |
| #59 | 4 (#44) | Expediente único (RF-001) | 7 nov, 21:31 | 10 nov, 20:39 |
| #60 | 5 (#45) | Inscripción (RF-002, RNF-USU-001) | 8 nov, 16:44 | 10 nov, 20:39 |
| #61 | 6 (#46) | Staging de la Fig. 9 y etapa 8 (CC-018) | 8 nov, 19:28 | 10 nov, 20:39 |
| #62 | 7 (#47) | Oferta y horarios (RF-003) | 10 nov, 14:20 | 10 nov, 20:39 |
| #63 | 8 (#48) | Calificaciones e historial (RF-004, RF-005) | 10 nov, 15:49 | 10 nov, 20:38 |
| #64 | 9 (#49, #50) | Pagos simulados y trámites (RF-006, RF-007, RF-010) | 10 nov, 17:05 | 10 nov, 20:38 |
| #65 | 10 (#51) | Reportes de dirección (RF-009) | 10 nov, 17:59 | 10 nov, 20:38 |
| #66 | Manual (#15) | Manual v3.0 y entrega al auditor | 10 nov, 19:40 | 10 nov, 20:38 |
| #68 | #30 | Commitlint sin los commits de fusión | 10 nov, 21:25 | 10 nov, 21:46, en `develop` (`f3434cf`) |

En total, 80 commits sin contar fusiones, del 5 al 10 de noviembre. Ningún PR tiene revisiones, y todos los fusionó `fjmp-dev`.

**Fuera de lo entregado:**

- **Auditoría PA-SCE-001 (Trabajo paralelo B del plan):** en el repositorio solo está la respuesta F-01 v1.2 (`docs/auditoria/`). No hay registro del informe preliminar, de la réplica, de la reunión de cierre ni del plan de acciones correctivas.
- **Tablero:** los issues de batch #31 y #41 a #51 siguen abiertos y sin hito. Los PR se fusionaron en ramas distintas de `main`, que es la rama por omisión, así que GitHub no cerró sus issues. El hito S3 solo tiene #17, #19 y #20, que se cerraron el 22 de octubre con el PR #29. Los issues #18, #21 y #22 se entregaron en este sprint, pero siguen abiertos en los hitos S4 y S5.

## 2. Revisión

La hizo FJMP el 10 de noviembre de 2026, sin otro revisor (NC-012), con `gh` y `git`:

- **Integración:** `develop` está en `f3434cf`, con las fases 1 a 4. `main` sigue en `12feb3a` (fase 0). No hay etiquetas, releases ni environments.
- **CI de la cascada:** #55 y #56 se fusionaron cuando apenas arrancaba la corrida de su nueva cabeza (`4116785`). Esas corridas (42947523663 y 42947515929) fallaron después en la puerta de calidad de SonarQube, por una violación bloqueante S2699. La del #30 sobre la misma cabeza (42947533386) falló en Commitlint. FJMP lo corrigió con el commit `69e1318` (20:58), sin revisión, y el #30 se fusionó a las 21:21, con su corrida (42949577646) en verde.
- **Pipeline:** la primera corrida de `develop` tras el #30 (run 42952266697) falló en Commitlint por el mensaje "Merge #30". La corrida tras el #68 es la 42954928046: terminó en verde a las 22:11, con las etapas 1 a 7. La etapa 6 corrió por primera vez sobre `develop` y verificó con cosign las firmas de `sce-api` (`sha256:cbcfacfefcf762bc564bdc01367a14af5908f81642d51ab89609db8152674095`) y `sce-portal` (`sha256:9f57b3f33a05394d90662c79ba7cc6cd3122940f923d16d12c762c2ebb3ef1db`). La etapa 7 desplegó a pruebas esas imágenes y pasó el humo, Cypress con axe, Lighthouse y el staging efímero (CC-018).
- **Defecto crítico:** cobro doble con dos intentos de pago por el saldo completo, abierto como issue #69 (`defecto`, `sev-critica`). Por la regla 1 del plan, bloquea funcionalidad nueva hasta que se corrija (sub-batch 11.1).
- **Actas y cambios:** las actas de las fases 0 a 3 siguen sin firmar, y la fase 4 se abrió sin la de la fase 3 (NC-011). Los CC Mayor se fusionaron antes de aprobarse (NC-008). FJMP aprobó CC-010 y CC-012 a CC-020 después de la fusión, y CC-011 antes de implementarse. Falta firmar el acta de cambios mayores. Las figuras de CC-020 siguen pendientes (NC-014).
- **Documentos falsos:** `notas-version/v1.0.0.md` y `evidencias/fase-4/corridas.md` dicen que existen una etiqueta y una release v1.0.0. No existen. Se corrige en el sub-batch 11.4.

**Decisión:** la meta de construcción se cumplió: las fases 1 a 4 están integradas en `develop`. La de aceptación no: ninguna fase tiene acta firmada. El 10 de noviembre FJMP decidió la retoma de los batches 11 a 14 (`plan-de-sistema.md`, 6.2) y la entrega de la fase 4 como v0.4.0.

## 3. Retrospectiva

La hizo FJMP solo, sin el resto del equipo.

**Qué funcionó:**

- Once batches y el manual v3.0 se construyeron en seis días, con CI en verde en cada PR antes de la cascada.
- La fusión con merge commit conservó los commits de cada batch.

**Qué no funcionó:**

- La pila de 13 PR esperó una revisión que no llegó. `develop` no recibió nada del 22 de octubre al 10 de noviembre. Al fusionar todo de golpe, el pipeline de `develop` falló por una regla que ningún PR había probado: el mensaje del merge commit. La etapa 6 nunca había corrido sobre `develop`.
- #55 y #56 se fusionaron con sus checks pendientes, y esos checks fallaron después (S2699 bloqueante en SonarQube). El CI del #30 falló en Commitlint. Al medir la pila completa aparecieron dos fallas que ningún PR mostró solo, y su corrección (`69e1318`) entró sin revisión.
- Tres fases se abrieron sin el acta de la anterior (NC-009, NC-010 y NC-011), y los CC Mayor se fusionaron sin aprobar (NC-008).
- El mismo día se decidió compactar el plan sin papeleo nuevo (6.1) y después retomarlo con documentación completa (6.2). Las acciones preventivas de las NC abiertas quedaron sin efecto entre ambas decisiones.
- Las notas de v1.0.0 se escribieron antes de crear la etiqueta, y describen como hecho algo que no ocurrió.
- El tablero no refleja el trabajo: hay issues entregados que siguen abiertos (AU-43).

## 4. Acciones de mejora (sección 41)

Registradas en `docs/gobierno/mejora-continua.md`:

| ID | Acción | Responsable | Fecha objetivo |
|---|---|---|---|
| MJ-003 | Integrar cada sub-batch a `develop` en cuanto su CI está en verde, sin apilar más de una fase. Después de cada fusión, comprobar que el pipeline de `develop` termina en verde, con las etapas 6 y 7 | FJMP | 20 de noviembre de 2026 (fin de los sub-batches 11.x) |
| MJ-004 | Al cerrar cada sprint, cerrar los issues entregados y mover los pendientes al hito siguiente. Cada issue de batch lleva hito | FJMP | 13 de noviembre de 2026 (cierre de S3) |

## 5. Entregado del 11 al 13 de noviembre

Se completa al cierre del sprint, antes de firmar.

## 6. Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Acepta: Product Owner y QA (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
| Produjo | Francisco Javier Martínez Peñas | | |

> SJOM no firma: no revisó el sprint. Se declara en lugar de dejar la fila vacía sin explicación.
