# Informe de la fase 4 — Pagos, trámites y reportes

**Fuente:** SCE-MC-001 v2.0, secciones 7, 10, 38 (Tabla 59) y Tabla 13; manual v3.0, apartado 2.3. **Criterio de auditoría:** AU-39.
**Estado:** datos al 10 de noviembre de 2026, medidos en la rama `feature/51-cierre-fase-4` sobre el commit `d4cce7d` (cabeza del PR #78). Se repite sobre la etiqueta `v0.4.0` en el sub-batch 11.4.
**Elabora y verifica:** FJMP, con asistente de IA declarado en el commit. No hay verificación independiente (NC-012).

## 1. Qué se entregó

| Issue | Alcance | PR |
|---|---|---|
| #49, Batch 9 | RF-006 con pasarela simulada (CC-020) | #64 |
| #50, Batch 10 | RF-007 y RF-010: trámites, constancia, no adeudo e historial | #64 |
| #51, Batch 11 | RF-009, reportes de dirección | #65 |
| #69, defecto | Cobro doble con dos intentos por el mismo adeudo | #71 |
| #51, retoma | 11.0 (#72), 11.2 reglas Must y CS-SEG-06 en pago y constancia (#78, con #74) | #72, #78 |

Todo está fusionado en `develop` desde el 10 de noviembre de 2026. Falta la etiqueta `v0.4.0` (11.4, PR #79 abierto).

## 2. Puntos de historia

Los issues de batch no tenían puntos, aunque `.github/ISSUE_TEMPLATE/historia.yml` los pide como "Base de la densidad de defectos (Tabla 59)". Se estimaron el 10 de noviembre de 2026, **después de construir**. Por eso la densidad no se pudo calcular al cerrar las fases 1 a 3 (NC-016).

### 2.1 Criterio

Escala de Fibonacci. Referencia: #47 (oferta y horarios) vale 8. Se toma la fila más alta que aplique.

| Puntos | Qué cabe |
|---|---|
| 1 | Un ajuste de configuración o de un documento |
| 2 | Un cambio pequeño en una capa, sin regla de negocio nueva |
| 3 | Un componente o documento nuevo sin regla de negocio, o trabajo de pipeline sin herramienta nueva |
| 5 | Herramientas nuevas sin regla de negocio; un paquete documental con decisiones; o una regla Must en una sola capa |
| 8 | Un requisito funcional Must de punta a punta, con sus casos; o un ambiente nuevo con su despliegue |
| 13 | Lo de 8 más un factor de riesgo alto: dos o más RF Must, concurrencia sobre cupos o dinero, seguridad transversal, o una capa completa nueva con su ambiente |
| 21 | Demasiado grande: varias filas de 8 o más en un solo issue. Se registra así si se construyó sin dividir; la próxima vez se divide |

### 2.2 Asignación

| Issue | Fase | Puntos | Fila que aplica |
|---|---|---|---|
| #31 Batch 0 | 1 | 5 | Paquete documental con decisiones |
| #41 Batch 1 | 1 | 5 | Herramientas nuevas sin regla de negocio |
| #42 Batch 2 | 1 | 13 | Seguridad transversal: identidad, guard y bitácora |
| #43 Batch 3 | 1 | 13 | Capa completa nueva (portal) con su ambiente de pruebas |
| #44 Batch 4 | 2 | 8 | Un RF Must (RF-001) de punta a punta |
| #45 Batch 5 | 2 | 13 | Concurrencia sobre cupos (RF-002) |
| #46 Batch 6 | 2 | 8 | Ambiente nuevo (staging) con su despliegue |
| #47 Batch 7 | 3 | 8 | Un RF Must (RF-003). Referencia |
| #48 Batch 8 | 3 | 13 | Dos RF Must (RF-004 y RF-005) |
| #49 Batch 9 | 4 | 13 | Concurrencia sobre dinero (RF-006) |
| #50 Batch 10 | 4 | 8 | Un RF Must (RF-007); RF-010 es Should |
| #51 Batch 11 | 4 | 21 | Reportes, cierre de fase y retoma 11.0 a 11.4 en un solo issue |

**Totales por fase:** F1 = 36, F2 = 29, F3 = 21, F4 = 42. Cada issue lleva la línea "Puntos de historia: N (estimado el 10-nov-2026, después de construir; …)".

## 3. Fallos encontrados en la construcción

Un fallo corregido antes de abrir el PR no se registró como defecto. Desde la primera aceptación, todo fallo se registra como issue `defecto` (30.2).

| Fase | Fallo | Cómo se encontró | ¿Registrado como defecto? |
|---|---|---|---|
| 2 | Dos DTO con el mismo nombre que Swagger fusionaba (#59) | Construcción | No (`informe-fase-2.md`) |
| 2 | Dos cargas simultáneas del mismo alumno se pisaban (#60) | Prueba | No |
| 2 | Un id desbordaba la base (#60) | Prueba | No |
| 2 | El portal elegía mal el periodo con dos abiertos (#60) | Prueba | No |
| 2 | `db/pgaudit.sql` no corría en PostgreSQL 16 (Batch 6) | Ensayo de staging | No |
| 2 | Una verificación del ensayo no detectaba un rechazo (Batch 6) | Revisión | No |
| 3 | La captura revelaba si un folio estaba inscrito en un grupo ajeno | Revisión | No (acta F3, apartado 5) |
| 3 | El seed tenía a un profesor en dos grupos a la misma hora | Prueba | No |
| 4 | **Cobro doble:** dos intentos por el mismo adeudo, aprobados los dos, dejaban el saldo negativo | **Revisión de código, no una prueba** | **Sí: #69, `sev-critica`** |
| 4 | Puerta de SonarQube en rojo en #64 y #65 (corridas 42920457759 y 42927819582) | CI, etapa 5 | No: es la puerta de calidad, no un fallo del producto |
| 4 | El pipeline de `develop` falló por commitlint en el commit "Merge #30" (corrida 42952266697) | CI, etapa 2 | No: es del pipeline. Se corrigió con #68 (corrida 42954928046, verde) |

La fase 1 no documentó sus fallos individuales; sus 8 corridas rojas están en el apartado 7.

## 4. Tablero de indicadores (Tabla 59)

Los comandos están en el apartado 5. "No se mide" sigue al manual v3.0, apartado 2.3.

| # | Métrica | Meta | F1 | F2 | F3 | F4, hoy | ¿Cumple? |
|---|---|---|---|---|---|---|---|
| 1 | Densidad de defectos | Tendencia decreciente | 0/36 = 0 | 0/29 = 0 | 0/21 = 0 | 1/42 = 0.024 | **No.** Sube. F1 a F3 no son comparables: sus fallos no se registraron |
| 2 | Defectos críticos abiertos | 0 en piloto | 0 | 0 | 0 | 0 (#69 cerrado el mismo día) | Sí |
| 3 | Cobertura del dominio | ≥ 80 % | 100 % (48/48) | 100 % (171/171) | 100 % (245/245) | 100 % (289/289) | Sí |
| 4 | Cobertura de reglas Must | 100 % antes del piloto | 4/24 y 1 parcial | 13/24 | 18/24 y 2 parciales | 24/24 (100 %) | Sí |
| 5 | Disponibilidad mensual | ≥ 99.0 % en inscripción | — | — | — | No se mide (manual v3.0 §2.3) | — |
| 6 | Percentil 95 | ≤ 3 s en inscripción y pago | — | — | — | No se mide (manual v3.0 §2.3) | — |
| 7 | Vulnerabilidades altas abiertas | 0 antes de cada promoción | 0 | 0 | 0 | 0 | Sí |
| 8 | Inconsistencias de datos | 0 no explicadas en la conciliación diaria | 0 (CD-DAT-01 y 04) | 0 (y CD-DAT-05 y ocupación) | 0 (y CD-DAT-02 y CS-SEG-06) | **Sin dato de la fórmula:** no hay conciliación (CD-DAT-03 llega en 12.1). Consultas sustitutas: 0 | **Parcial** (NC-018) |
| 9 | Tasa de conclusión de inscripción | ≥ 90 % | No aplica | No se midió | No se midió | 100 % (5/5 en el seed); en CI, 0 inscripciones sin estado | Sí, con datos sintéticos |
| 10 | Tiempo medio de corrección de altos | ≤ 5 días hábiles | Sin dato | Sin dato | Sin dato | Sin dato: no hay defectos altos. El crítico #69 tardó 1 h 10 min | — |

**Lectura de la densidad.** Si #51 no cuenta hasta cerrar 11.4, F4 queda en 1/21 = 0.048. La tendencia no baja porque el único defecto registrado es de la fase 4. En las fases 1 a 3 hubo fallos, pero no se registraron (apartado 3). La meta no se puede juzgar hasta la fase siguiente.

**Fuentes por fila:**
- **Fila 1:** Issues con `defecto` y `fase-N`; puntos del cuerpo de cada issue de batch.
- **Fila 2:** `gh issue list --label defecto`. #69: creado el 10-nov a las 21:51 y cerrado a las 23:01, hora de la Ciudad de México.
- **Fila 3:** F1: `informe-fase-1.md`. F2: artefacto `cobertura-unitarias` de la corrida 42533743035. F3: el mismo artefacto de la corrida 42908827649 (cabeza del PR #63). F4: corrida local de hoy, 187 de 187 pruebas.
- **Fila 4:** F1 a F3: sus informes. F4: `scripts/reglas-must.sh` local y artefacto `reglas-must` de la corrida 42966111975 (`sin_prueba: []`).
- **Fila 7:** F1 y F2: sus informes. F3: artefactos `trivy` y `calidad` de la corrida 42908827649. F4: npm audit local y artefactos `trivy` y `calidad` de la corrida 42966111975; ZAP de la misma corrida, sin alertas altas.
- **Fila 8:** F1: acta F1, apartado 3 (CD-DAT-01 y 04 satisfactorios). F2 y F3: sus informes. F4: las 10 consultas de `api/prisma/verificacion/` con meta de cero filas, y 22 expectativas de Great Expectations sin fallas (corrida 42966111975).
- **Fila 9:** `tasa-conclusion.sql` sobre el seed; expectativa "Tabla 59 y R-08" sobre 8 inscripciones en CI.

## 5. Cómo recalcular

Desde la raíz del repositorio. La base efímera es PostgreSQL 16 en Colima, en el puerto 55433, con el seed sintético.

| # | Comando | Resultado del 10-nov |
|---|---|---|
| 1 | `for f in 1 2 3 4; do p=$(gh issue list --label batch --label fase-$f --state all --json body -q '[.[].body \| capture("Puntos de historia: (?<n>[0-9]+)").n \| tonumber] \| add'); d=$(gh issue list --label defecto --label fase-$f --state all --json number -q length); echo "F$f: $d / $p"; done` | F1 0/36, F2 0/29, F3 0/21, F4 1/42 |
| 2 | `gh issue list --label defecto --label sev-critica --state open --json number -q length` | 0 |
| 3 | `cd api && npm run test:unitarias -- --coverage && awk -F: '/^SF:/{d=($2 ~ /\/dominio\//)} d&&/^LF:/{lf+=$2} d&&/^LH:/{lh+=$2} END{print lh "/" lf}' coverage/unitarias/lcov.info` | 289/289, en 13 archivos |
| 4 | `scripts/reglas-must.sh` | 24 de 24 (100 %) |
| 7 | `npm audit --audit-level=high` en la raíz, `api` y `web`; `gh run download 42966111975 -n trivy -n zap` | 0 altas o críticas; Trivy sin HIGH ni CRITICAL en imagen, portal y repositorio |
| 8 | `for f in cd-dat-01 cd-dat-02 cd-dat-04 cd-dat-05 ocupacion-de-grupos cs-seg-06-calificacion cs-seg-06-plantel cs-seg-06-pago cs-seg-06-constancia sin-datos-reales; do psql "$DATABASE_URL" -At -f api/prisma/verificacion/$f.sql \| wc -l; done` | 0 filas en cada una |
| 9 | `psql "$DATABASE_URL" -f api/prisma/verificacion/tasa-conclusion.sql` | 5 iniciadas, 5 concluidas, 0 sin estado, 100.00 |
| 10 | `gh issue list --label defecto --label sev-alta --state all --json createdAt,closedAt` | Lista vacía |

Base efímera: `docker run -d --rm --name sce113-metricas -e POSTGRES_USER=sce_app -e POSTGRES_PASSWORD=sce_dev -e POSTGRES_DB=sce -p 127.0.0.1:55433:5432 postgres:16`, y luego `npx prisma migrate deploy` y `node prisma/seed.mts` en `api`, con `DATABASE_URL=postgresql://sce_app:sce_dev@127.0.0.1:55433/sce`.

**Corridas del 10 de noviembre sobre `d4cce7d`:**

| Corrida | Resultado |
|---|---|
| Jest, `unitarias` (local) | 10 suites, 187 de 187, en 10.4 s |
| Jest, `integracion` con Testcontainers (local) | 15 suites, 560 de 560, en 61.8 s. Líneas 99.16 % (1791/1806), ramas 89.87 % |
| Vitest del portal (local) | 13 archivos, 181 de 181. Líneas 98.25 % (733/746) |
| CI 42966111975 (PR #78) | Etapas 1 a 5 y 7 en verde. Newman: 163 peticiones, 368 aserciones, 0 fallas. Cypress: 41 de 41. Puerta de SonarQube: OK |

## 6. Objetivos de la Tabla 13

| Dimensión | Indicador | Meta del piloto | Valor al 10-nov | Fuente |
|---|---|---|---|---|
| Disponibilidad | Disponibilidad mensual | ≥ 99.0 % en inscripción | No se mide (manual v3.0 §2.3) | — |
| Rendimiento | Percentil 95 | ≤ 3 s en inscripción y pago | No se mide (manual v3.0 §2.3) | — |
| Capacidad | Usuarios concurrentes sin error | 300 sin pérdida ni duplicación | No se mide (manual v3.0 §2.3) | — |
| Defectos | Abiertos por severidad | 0 críticos; 90 % de altos en 5 días hábiles | 0 críticos abiertos; ningún alto registrado | Fila 2 y 10 de la Tabla 59 |
| Seguridad | Accesos no autorizados y cobertura de bitácora | 0 accesos confirmados; 100 % de operaciones sensibles con bitácora | 0 incidentes registrados. Cero filas sin asiento en calificación, plantel, pago y constancia | CS-SEG-06 con Great Expectations (corrida 42966111975); `gh issue list --label incidente` vacío |
| Calidad de datos | Inconsistencias | 0 duplicados de matrícula; 100 % de cierres con recálculo correcto | 0 duplicados; 0 diferencias en CD-DAT-02 | CD-DAT-01 y 02, local y en CI |
| Capacidad de interacción | Tasa de conclusión | ≥ 90 % | 100 % | Fila 9 de la Tabla 59 |
| Mantenibilidad | Cobertura | ≥ 80 % en el dominio y 100 % de reglas Must | 100 % y 100 % | Filas 3 y 4 de la Tabla 59 |
| Recuperación | Restauración de respaldo | Una por periodo, pérdida menor a 24 h | No se mide (manual v3.0 §2.3) | — |
| Accesibilidad | Criterios WCAG 2.2 AA | 0 hallazgos bloqueantes en inscripción, pago y consulta | 0 incumplimientos de axe (A y AA) en inscripción, mi cuenta, pasarela, recibo, trámites y calificaciones. Lighthouse: 100 en 8 páginas | Cypress, corrida 42966111975. La revisión manual con teclado sigue pendiente (`accesibilidad.md`) |

## 7. Pipeline por fase

Comando: `gh run list --workflow CI --limit 300 --json conclusion,status,headBranch,createdAt,databaseId`. La fase sale de la rama: `feature/<issue>` va a la fase del issue; `develop` y las ramas de la retoma, a la fase 4.

| Fase | Corridas | Verdes / terminadas | Tasa |
|---|---|---|---|
| F1 | 24 | 16/24 | 66.7 % |
| F2 | 11 | 8/11 | 72.7 % |
| F3 | 7 | 5/7 | 71.4 % |
| F4 | 22 | 15/18, y 4 en curso al contar | 83.3 % |

Ningún PR tiene revisión de otra persona (NC-001 y NC-012).

## 8. Desviaciones

- **Separación de funciones:** FJMP produce, verifica y cierra, incluido el defecto #69 (NC-012).
- **AMFE de pagos:** se hizo en 11.3, después de construir. El plan lo pedía al inicio del Batch 9 (NC-017).
- **Conciliación:** CD-DAT-03 y CD-DAT-06 no existen al cierre (NC-018); llegan en 12.1.
- **Auditoría interna:** autoauditoría por reejecución, sin independencia (NC-013). Ver `auditoria-fase-4.md`.
- **Pasarela simulada (CC-020):** RF-006 no cobra. El riesgo aceptado es RK-15.

## 9. Lista de verificación de QA

La llena FJMP como QA (NC-012).

| Verificación | Resultado | Evidencia |
|---|---|---|
| Condición de la Tabla 23, fila 4, demostrada por rol en pruebas | Cumple | `pagos-tramites.cy.ts` y `demostracion-por-rol.cy.ts`, corrida 42966111975 |
| Casos Must de la fase en verde | Cumple sobre `d4cce7d`. Sobre `v0.4.0`: pendiente (11.4) | Apartado 5 |
| Reglas Must con prueba | 24 de 24 | `scripts/reglas-must.sh` |
| Bitácora inmutable, reejecutada | Cumple: UPDATE, DELETE y TRUNCATE rechazados por `fn_bitacora_inmutable()` | `psql` sobre la base efímera, 10-nov |
| Muestreo de bitácora, 25 por tipo (`muestreo-bitacora.sql`) | No alcanzable con datos sintéticos: el seed no tiene pagos ni trámites. La verificación exhaustiva CS-SEG-06 da 0 filas | Fila 8 del apartado 5 |
| Matriz rol por endpoint repetida | Cumple | CF-ROL-01 en la corrida local; Newman "caja no consulta el reporte de dirección" |
| Vulnerabilidades altas | 0 | Fila 7 |
| Imágenes firmadas: `cosign verify` sobre los digests de la etiqueta | Pendiente (11.4). La etapa 6 firmó las imágenes de `fdaae09` (corrida 42963020677) | Artefacto `imagenes` |
| Lo desplegado corresponde a la etiqueta (15.3) | Pendiente (11.4) | — |
| Sin datos reales en pruebas y staging (RK-09) | Cumple | `sin-datos-reales.sql`, 0 filas local; "sin datos reales: ok" en la corrida 42966111975 |
| Matriz de riesgos revisada | Cumple, 10-nov | `matriz-riesgos.md` |
| AMFE de pagos | Hecho después de construir (NC-017) | `amfe-pagos.md` |
| Auditoría de la Tabla 60 | Autoauditoría (NC-013) | `auditoria-fase-4.md` |
| Defectos críticos abiertos | 0 | Fila 2 |
| Existen los CD-DAT de la fase (`matriz-trazabilidad.md`) | No: faltan CD-DAT-03 y 06 (NC-018) | `ls api/prisma/verificacion/` |
