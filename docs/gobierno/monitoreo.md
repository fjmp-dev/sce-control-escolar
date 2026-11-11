# Monitoreo y disponibilidad — SCE

**Fuente:** SCE-MC-001 v2.0, sección 35 y Tabla 57 (señales, destinatarios), Tabla 46 (metas de rendimiento), RNF-FIA-001 y RNF-REN-001; caso CO-FIA-01. **Sub-batch:** 13.3, issue #76. **Vigente desde:** 11 de noviembre de 2026. **Responsable:** DevOps (FJMP).

## 1. Componentes

Todo está en `infra/monitoreo/` y lo levanta `scripts/monitoreo.sh arriba` junto a un ambiente de `scripts/staging.sh` (con `CONSERVAR=1`). Corre en el nodo de aplicación de la Fig. 9 y solo escucha en `127.0.0.1`.

| Componente | Versión | Qué mide o hace |
|---|---|---|
| Prometheus | 3.5.0 | Lee cada 15 s y evalúa las alertas. Guarda 40 días: alcanza para cerrar el mes |
| Métricas de la API | `prom-client` 15 | `GET /metricas` en la red privada: duración por ruta y estado (`sce_http_duracion_segundos`), errores por código de negocio (`sce_errores_negocio_total`), memoria y _event loop_. El proxy no la publica |
| blackbox-exporter | 0.27.0 | Sondea `https://sce-proxy/api/salud` y `https://sce-proxy/salud` desde la red de frontera, como un usuario: TLS 1.2+ con la CA del proxy |
| postgres-exporter | 0.17.1 | Conexiones y estadísticas de la base, con el rol `sce_monitor` (solo `pg_monitor`, tres conexiones; `acceso-directo-a-la-base.md`) |
| node-exporter y cAdvisor | 1.9.1 y 0.52.1 | CPU, memoria y disco del nodo y de cada contenedor |
| Alertmanager | 0.28.1 | Correo a los destinatarios del apartado 2 |
| Grafana | 12.1.1 | Tablero "SCE — Tabla 57", con 12 paneles. Sin acceso anónimo |
| mailpit | 1.27 | Solo en staging: recibe los correos de las alertas |
| pgBadger | el de Debian 12 | `scripts/pgbadger.sh`: sentencias de más de 250 ms del registro de `sce-db`, anonimizadas |

## 2. Señales, alertas y destinatarios

Destinatarios de la sección 35: **DevOps siempre**; el **Product Owner el mismo día** si la alerta afecta inscripción o pagos (`area="inscripcion-y-pagos"`). Cada alerta manda también su resolución.

| Señal (Tabla 57) | Alerta | Umbral | Destinatarios |
|---|---|---|---|
| Salud de API y web | `SaludCaida` | Un sondeo fallido durante 1 min | DevOps y PO |
| p95 de inscripción y pago | `Percentil95AltoEnInscripcionOPago` | Más de 3 s durante 5 min (Tabla 46) | DevOps y PO |
| p95 de consultas | `Percentil95AltoEnConsultas` | Más de 2 s durante 5 min | DevOps |
| Errores 5xx | `Errores5xx` | Más de 1 % durante 5 min | DevOps y PO |
| Errores de negocio | `ErroresDeNegocioAltos` | Más de 50 de un mismo código en 10 min, sin contar 401 ni 404 | DevOps |
| CPU | `CPUAlta` | Más de 80 % durante 10 min | DevOps |
| Disco | `DiscoCasiLleno` | Más de 85 % (hallazgo C-2 de `contingencias-mesa`) | DevOps |
| Conexiones a la base | `ConexionesCercaDelLimite` | Más de 16, el 80 % del _pool_ de 20 | DevOps y PO |
| Certificado | `CertificadoPorVencer` | Menos de 14 días | DevOps |
| Un destino sin datos | `DestinoSinDatos` | 2 min sin lectura | DevOps |

En staging las direcciones son de prueba (`@sce.test`). En el piloto se cambian por las institucionales en `infra/monitoreo/alertmanager.yml`, con el servidor de correo de la universidad.

## 3. Disponibilidad mensual (CO-FIA-01)

1. El primer día hábil del mes, DevOps exporta las muestras del mes anterior: `scripts/monitoreo.sh salud 2678400 300 > salud.csv`. Son 31 días, cada 5 minutos.
2. Arma el calendario del mes, con las semanas de inscripción, los cortes y los avisos de mantenimiento enviados (`plantilla-mantenimiento.md`, apartado 2).
3. Corre `scripts/disponibilidad.py salud.csv calendario.csv`. La tabla separa inscripción y cortes, con meta de 99,0 %, del resto, con meta de 98,0 %. Un mantenimiento sin 48 h de aviso o en inscripción cuenta como caída.
4. La tabla va al tablero de indicadores del mes. Si un periodo no cumple, se abre un incidente con causa raíz (`respuesta-a-incidentes.md`).

La autoprueba del cálculo, con valores límite de 99,0 % y 98,9 %, corre en la etapa 3 de cada pull request.

## 4. Dónde corre

| Ambiente | Cómo | Estado |
|---|---|---|
| Staging local | `scripts/staging.sh` con `CONSERVAR=1` y luego `scripts/monitoreo.sh arriba` | Ensayado el 11 de noviembre de 2026 (`docs/evidencias/ensayos/2026-11-11-monitoreo-y-alertas.md`) |
| Pruebas de rendimiento | `rendimiento.yml` levanta el mismo monitoreo y toma de Prometheus la CPU, la memoria y las conexiones de cada caso CR-REN | 13.4 |
| Piloto | El mismo `compose.yml` en el servidor de aplicación. El monitor externo debe sondear desde fuera del servidor | **Pendiente:** depende de la infraestructura de la institución (Batch 14) |
