# Informe de cierre del semestre piloto — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 7 (Tabla 13 y 7.2) y 38 (Tabla 59). **Sub-batch:** 14.2, issue #77.
**Estado: plantilla preparada, sin datos.** No hay semestre piloto (`plan-de-evaluacion-piloto.md`). Lo llena QA al cierre del semestre; sin este informe, el Product Owner no autoriza el paso a otra facultad (7.2).

**Facultad:** ___ · **Semestre:** ___ · **Versión en operación:** `v___` · **Periodo observado:** del ___ al ___ · **Elaboró (QA):** ___

## 1. Resumen

- **Decisión que se propone:** continuar, ampliar a otra facultad o detener, con su motivo.
- **Objetivos de la Tabla 13 cumplidos:** ___ de 10.
- **No conformidades abiertas al cierre:** ___ (Mayor: ___).

## 2. Objetivos de la Tabla 13

| Dimensión | Meta en piloto | Resultado | ¿Cumple? | Evidencia |
|---|---|---|---|---|
| Disponibilidad | ≥ 99.0 % en inscripción y cortes; ≥ 98.0 % el resto | | | Grafana, monitor externo, avisos de mantenimiento |
| Rendimiento | p95 ≤ 3 s en inscripción y pago; ≤ 2 s en consulta | | | Histograma del servidor del piloto; CR-REN del semestre |
| Capacidad | 300 concurrentes sin pérdida ni duplicación | | | CR-REN-02 en el servidor del piloto |
| Defectos | 0 críticos abiertos; 90 % de altos en 5 días hábiles | | | Issues `defecto` |
| Seguridad | 0 accesos no autorizados; 100 % de operaciones sensibles con bitácora | | | Issues `incidente`; CS-SEG-06; muestreo mensual |
| Calidad de datos | 0 duplicados; 100 % de cierres con recálculo correcto | | | CD-DAT-01 y CD-DAT-02 |
| Capacidad de interacción | ≥ 90 % de inscripciones concluidas o en estado explícito | | | `tasa-conclusion.sql`; SUS |
| Mantenibilidad | ≥ 80 % del dominio; 100 % de reglas Must | | | Etapa 3; `reglas-must.sh` |
| Recuperación | Una restauración por periodo; pérdida menor a 24 h | | | Actas de restauración |
| Accesibilidad | 0 hallazgos bloqueantes en inscripción, pago y consulta | | | CO-ACC-01 a 03; `hallazgo-usabilidad.yml` |

## 3. Tablero de la Tabla 59

Las fórmulas son las de `informe-fase-4.md`, apartado 4. Los comandos se corren desde la raíz del repositorio, con `DATABASE_URL` apuntando a una **copia restaurada** de la base del piloto, nunca a la base en operación (`acceso-directo-a-la-base.md`).

| # | Métrica | Meta | Comando | Resultado |
|---|---|---|---|---|
| 1 | Densidad de defectos | Tendencia decreciente | `gh issue list --label defecto --label fase-5 --state all --json number -q length`, entre los puntos de los issues del semestre. Solo es comparable con la fase 4 (MJ-010) | |
| 2 | Defectos críticos abiertos | 0 | `gh issue list --label defecto --label sev-critica --state open --json number -q length` | |
| 3 | Cobertura del dominio | ≥ 80 % | `cd api && npm run test:unitarias -- --coverage && awk -F: '/^SF:/{d=($2 ~ /\/dominio\//)} d&&/^LF:/{lf+=$2} d&&/^LH:/{lh+=$2} END{print lh "/" lf}' coverage/unitarias/lcov.info` | |
| 4 | Cobertura de reglas Must | 100 % | `scripts/reglas-must.sh` | |
| 5 | Disponibilidad mensual | ≥ 99.0 % en inscripción | `avg_over_time(probe_success{job="salud"}[30d])` en Prometheus, por mes, sin las ventanas anunciadas | |
| 6 | Percentil 95 | ≤ 3 s en inscripción y pago | `histogram_quantile(0.95, sum by (le, ruta) (rate(sce_http_duracion_segundos_bucket[5m])))` en Prometheus, por semana | |
| 7 | Vulnerabilidades altas abiertas | 0 antes de cada promoción | `npm audit --audit-level=high` en la raíz, `api` y `web`; artefactos `trivy` y `zap` del último candidato | |
| 8 | Inconsistencias de datos | 0 no explicadas en la conciliación diaria | `for f in cd-dat-01 cd-dat-02 cd-dat-03 cd-dat-04 cd-dat-05 cd-dat-06; do psql "$DATABASE_URL" -At -f api/prisma/verificacion/$f.sql \| wc -l; done`, y el historial diario de CD-DAT-03 | |
| 9 | Tasa de conclusión de inscripción | ≥ 90 % | `psql "$DATABASE_URL" -f api/prisma/verificacion/tasa-conclusion.sql` | |
| 10 | Tiempo medio de corrección de altos | ≤ 5 días hábiles | `gh issue list --label defecto --label sev-alta --state all --json createdAt,closedAt` | |

Las series son las de `api/src/gateway/metricas.ts` y los trabajos de `infra/monitoreo/prometheus.yml` (`salud` es el healthcheck por el proxy, como el monitor externo). Si el piloto cambia la configuración, se ajustan aquí antes de calcular.

## 4. Operación del semestre

| Actividad | Esperado | Realizado | Desviaciones |
|---|---|---|---|
| Conciliación diaria (CD-DAT-03) | Un día hábil, una corrida | | |
| Restauraciones de prueba | Una por periodo | | |
| Revisiones de accesos | Una por mes | | |
| Mantenimientos con 48 h de aviso | Todos | | |
| Cambios de emergencia documentados en 24 h | Todos | | |
| Incidentes y problemas | Con causa raíz si se repiten | | |
| Controles paralelos encontrados | 0 (Tabla 10) | | |

## 5. No conformidades y mejoras

Abiertas, cerradas y nuevas del semestre, con su verificación de eficacia (`registro-no-conformidades.md`), y acciones de mejora (`mejora-continua.md`).

## 6. Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| QA | | | |
| Product Owner | | | |
