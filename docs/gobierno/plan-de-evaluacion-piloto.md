# Plan de evaluación del piloto — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 3.5 (Tabla 6), 7 (Tabla 13 y 7.2), 8, 24.2, 37, 38 (Tabla 59) y 39 (Tabla 60); Tabla 10. **Sub-batch:** 14.2, issue #77.
**Estado: preparado, no ejecutado.** El piloto de la Tabla 6 ("una facultad durante un semestre completo, con datos reales y aceptación operativa") no existe. `v1.0.0` va a un piloto de ensayo sin usuarios ni datos (CC-022). Este plan se ejecuta cuando haya facultad, semestre e infraestructura. **Responsable:** QA, con el Product Owner.

## 1. Condiciones para empezar

El piloto empieza solo si se cumplen todas. Las cuatro primeras son no conformidades Mayor abiertas al 11 de noviembre de 2026; para un piloto con usuarios tienen que estar cerradas, no solo aceptadas.

| # | Condición | Estado al 11 de noviembre de 2026 |
|---|---|---|
| 1 | Pasarela real con convenio y credenciales del piloto, distintas de las de sandbox (36.1-7) | No: pago simulado (CC-020, NC-019, RK-15) |
| 2 | SUS mayor o igual a 70 y revisión con lector de pantalla firmada (RNF-USU-001 y 002) | No (NC-020) |
| 3 | Actas de las fases 0 a 4 y acta de liberación firmadas (20.1, puerta 4) | No (NC-021, NC-002, NC-009 a NC-011) |
| 4 | Auditor independiente para el cierre del semestre (39.1) | No (NC-013) |
| 5 | Servidor de aplicación y servidor de base separados, con TLS y secretos propios (Fig. 9) | No: el piloto de ensayo es efímero, en GitHub Actions (CC-022) |
| 6 | Facultad piloto designada por la Dirección, con su calendario de inscripción y cortes | No |
| 7 | Aviso de privacidad, base de licitud y documento de seguridad emitidos por la institución (Parte B) | No: modelos sin emitir (RK-12) |
| 8 | RK-11 y RK-14 mitigados, no solo aceptados | No: aceptados solo para el piloto de ensayo |

## 2. Prohibición de controles paralelos

La Tabla 10 pide la "prohibición de controles paralelos en el piloto", para no fragmentar el expediente por facultad. Durante el semestre piloto:

- **El SCE es el único registro** de expediente, inscripción, calificaciones, pagos y trámites de la facultad piloto. No se llevan hojas de cálculo, libretas ni sistemas anteriores con los mismos datos.
- **Si el SCE no está disponible,** se aplica `contingencias.md`. Lo capturado en papel durante una contingencia se registra en el SCE al restablecerse, con su bitácora, y el papel se archiva como evidencia de la contingencia, no como registro paralelo.
- **Encontrar un control paralelo es una no conformidad Mayor** (AU-21): duplica el expediente que RNF-DAT-001 protege.
- **QA lo verifica** en cada auditoría del piloto, con una pregunta a cada rol y una muestra de expedientes contra el archivo físico de la facultad.

La facultad firma esta cláusula antes del primer día del semestre (apartado 7).

## 3. Indicadores y metas (Tabla 13 y reglas de 7.2)

| Dimensión | Indicador | Meta en piloto | Cómo se mide en el piloto |
|---|---|---|---|
| Disponibilidad | Disponibilidad mensual del ambiente piloto | ≥ 99.0 % en semana de inscripción y cortes; ≥ 98.0 % el resto | CO-FIA-01 con el monitor externo (blackbox) y Grafana. Excluye ventanas anunciadas con 48 h, fuera de inscripción (`plantilla-mantenimiento.md`) |
| Rendimiento | Percentil 95 | Inscripción y pago ≤ 3 s; consulta ≤ 2 s | En el servidor de aplicación del piloto, nunca en una máquina de desarrollo (7.2): histograma de `prom-client` y CR-REN-01 a 05 repetidos tras la puerta de promoción (24.2) |
| Capacidad | Usuarios concurrentes sin error de negocio | 300 sin pérdida ni duplicación | CR-REN-02 en el servidor del piloto, antes de la semana de inscripción |
| Defectos | Defectos abiertos por severidad | 0 críticos abiertos; 90 % de altos resueltos en 5 días hábiles | Issues con `defecto`, `sev-critica` y `sev-alta` |
| Seguridad | Accesos no autorizados y bitácora | 0 accesos no autorizados confirmados; 100 % de operaciones sensibles con bitácora | Incidentes (`incidente.yml`); CS-SEG-06 y `muestreo-bitacora.sql` |
| Calidad de datos | Inconsistencias entre expediente, historial y caja | 0 duplicados de matrícula; 100 % de cierres con recálculo correcto | CD-DAT-01, CD-DAT-02 por periodo y CD-DAT-03 diario |
| Capacidad de interacción | Tasa de conclusión | ≥ 90 % de inscripciones concluidas o en estado explícito | `tasa-conclusion.sql` sobre datos reales; SUS al inicio y al cierre |
| Mantenibilidad | Cobertura | ≥ 80 % del dominio; 100 % de reglas Must | Etapa 3 y `scripts/reglas-must.sh` en cada cambio |
| Recuperación | Restauración de prueba | Al menos una por periodo, con pérdida menor a 24 h | `continuidad.yml` y acta de restauración del periodo |
| Accesibilidad | Hallazgos WCAG 2.2 AA | 0 bloqueantes en inscripción, pago y consulta | CO-ACC-01 a 03 en cada candidato; hallazgos de usuarios con `hallazgo-usabilidad.yml` |

Las métricas de la Tabla 59 se recalculan con `informe-cierre-piloto.md`, apartado 3.

## 4. Operación recurrente durante el semestre

| Actividad | Frecuencia | Herramienta | Registro |
|---|---|---|---|
| Conciliación (CD-DAT-03) | Diaria | `cd-dat-03.sql` y Great Expectations | Diferencias en el tablero; cada una no explicada abre un incidente |
| Inscripciones completas (CD-DAT-05) | Semanal durante la inscripción | `cd-dat-05.sql` | Tablero |
| Reflejo del pago (CD-DAT-06) | Continua | `cd-dat-06.sql` y alerta de Grafana | Tablero y alertas |
| Recálculo del historial (CD-DAT-02) | Por periodo, al cierre | `cd-dat-02.sql` sobre 30 expedientes | Acta de cierre del periodo |
| Respaldo cifrado | Cada 12 h | `continuidad.yml` | `inventario.csv` |
| Restauración de prueba | Una por periodo | `restauracion.sh` | Acta en `docs/evidencias/ensayos/` |
| Revisión de accesos y muestreo de bitácora | Mensual | `seguridad-operativa.yml` | Artefacto `seguridad-operativa` |
| Disponibilidad (CO-FIA-01) | Mensual | Grafana y monitor externo | Tablero |
| Mantenimiento | Con aviso de 48 h, fuera de inscripción y de cortes | `plantilla-mantenimiento.md` | Aviso enviado |
| Cambio de emergencia | Documentado en 24 h (Tabla 34) | `cambio.yml`, tipo Emergencia | Issue y registro de cambios |
| Incidentes | Al detectarse | `incidente.yml` y `respuesta-a-incidentes.md` | Issue con `incidente` |
| Problemas | Cuando un incidente se repite | `respuesta-a-incidentes.md`, apartado 6 | NC con causa raíz |

## 5. Evaluación

- **Calidad en uso (ISO/IEC 25019):** SUS al inicio y al cierre, tasa de conclusión, errores de usuario y quejas por rol.
- **Conformidad del producto (ISO/IEC 25040):** el dictamen de `v1.0.0` (`dictamen-25040.md`) se repite al cierre con los datos del semestre. Agrega la idoneidad, que sin usuarios no se pudo evaluar.
- **Auditoría de cierre del semestre (Tabla 60):** con la lista preparada en `docs/calidad/auditoria-cierre-semestre.md`, por un auditor independiente.

## 6. Criterio de salida

Al cierre del semestre, QA publica `informe-cierre-piloto.md`. Sin ese informe, el Product Owner no autoriza el paso a otra facultad (7.2). El acta de la fase 5 (`acta-aceptacion-fase-5.md`) registra la decisión con el informe, el dictamen y la auditoría de cierre.

## 7. Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | | | |
| QA | | | |
| Responsable de la facultad piloto (cláusula del apartado 2) | | | |
