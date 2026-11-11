# Informe de rendimiento — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 24 (Tablas 46, 47 y 48); RNF-REN-001 y RNF-REN-002; riesgo RK-04.
**Versión:** 0.1, 11 de noviembre de 2026 (sub-batch 13.4): plantilla, ambiente y procedimiento. Los resultados del candidato se llenan en 13.6.

## 1. Alcance y ambiente

Se mide sobre una **etiqueta candidata** (`vX.Y.Z-rc.N`) ya promovida a staging por la etapa 8. Se usan sus imágenes firmadas (por digest) y su código, en un staging efímero con la topología de la Fig. 9 y la pasarela simulada (CC-020). No hay servidor de piloto (manual v3.0, 2.2), así que esta es la medición "en staging" de 24.2. La medición en el servidor del piloto queda para la fase 5 (Batch 14).

**Dimensionamiento de referencia** (se declara en cada registro):

- Runner `ubuntu-latest` de 4 vCPU.
- Servidor de aplicación (API, portal y proxy) en los núcleos 0 y 1, con `docker update --cpuset-cpus`.
- Servidor de base en el núcleo 2.
- Generador (JMeter o k6) y monitoreo en el núcleo 3.
- La corrida es **inválida** si el generador pasa de 80 % de CPU: lo medido sería el generador.

**La máquina de desarrollo no es referencia.** Las corridas locales solo comprueban que los guiones funcionan. Ninguna cifra local entra en este informe.

**Limitaciones declaradas:**

- Un solo anfitrión. El cpuset reparte CPU, pero no memoria, disco ni red.
- Red local, sin la latencia de una red real.
- El runner es compartido y su desempeño varía. Por eso CR-REN-01 y 02 se corren tres veces y se informa la mediana.
- El pago es simulado. Se mide el sistema, no la pasarela (PA-SCE-001 excluye el estrés contra terceros).

## 2. Cómo se corre

```
gh workflow run rendimiento.yml --ref release/1.0.0 -f etiqueta=v1.0.0-rc.N -f caso=CR-REN-0N
```

`.github/workflows/rendimiento.yml` hace, en orden:

1. Verifica la firma de las imágenes de la etiqueta.
2. Levanta staging (`scripts/staging.sh`) y monitoreo (`scripts/monitoreo.sh arriba`).
3. Carga `infra/rendimiento/datos-carga.sql`: 1 000 alumnos sintéticos y el grupo CARGA-5, de 5 lugares.
4. Aplica el cpuset y corre el generador.
5. Evalúa las metas (`infra/rendimiento/metas.sh`).
6. Corre pgBadger y calidad de datos después de la carga.
7. Escribe el registro de la Tabla 48 (`infra/rendimiento/registro.sh`) en el resumen del job y en el artefacto `rendimiento-<caso>-<etiqueta>-<id de la corrida>`, que se conserva 90 días. Su copia con SHA-256 va al repositorio de evidencias (Tabla 62).

| Caso | Tipo (Tabla 47) | Herramienta | Perfil en `rendimiento.yml` |
|---|---|---|---|
| CR-REN-01 | Carga | JMeter 5.6.3 (`sce.jmx`) | 300 usuarios que llegan en 5 min y 15 min de meseta. Lectura intensiva: cada usuario entra una vez, inscribe o paga, y luego consulta oferta, inscripciones, calificaciones y cuenta, con 1 a 3 s de pausa. Lighthouse corre durante la meseta |
| CR-REN-02 | Concurrencia | k6 1.6.0 (`cr-ren-02.js` y `cr-ren-02.sql`) | 300 alumnos envían su inscripción a la vez; 100 compiten por los 5 lugares de CARGA-5 |
| CR-REN-03 | Estrés | JMeter | De 0 a 800 usuarios en 25 min, y 5 min con 800 |
| CR-REN-04 | Pico | JMeter | 50 usuarios durante 5 min, de 50 a 400 en 1 min y 9 min con 400 |
| CR-REN-05 | Resistencia | JMeter | 150 usuarios, la mitad de la carga, durante 4 h |

## 3. Metas (Tabla 46) y cómo se juzgan

| Meta | Cómo la mide `metas.sh` |
|---|---|
| p95 de inscripción y pago ≤ 3 s | Percentil 95 por operación (rango más cercano, como JMeter). El ingreso también se juzga contra 3 s |
| p95 de consultas ≤ 2 s | Igual, sobre las etiquetas `consulta-*` |
| 300 usuarios concurrentes sin pérdida ni duplicación | CR-REN-02: umbrales de k6 (300 enviadas, 5 confirmadas en CARGA-5, 95 rechazadas por cupo, 0 respuestas inesperadas) y cero filas en `cr-ren-02.sql` (enviadas contra persistidas, ocupación contra inscritos, cupo, motivo de rechazo) |
| Errores 5xx < 1 % | 5xx y peticiones sin respuesta, sobre el total |
| CPU < 80 % | Máximo en Prometheus, cada 15 s, del promedio de los núcleos de cada servidor (ventana de 1 min) |
| Conexiones bajo el límite del pool | Conexiones activas de la base por debajo de `connection_limit=20`, y ningún 503, que es como responde la API cuando el pool se agota. Las conexiones abiertas (incluidas las ociosas) se informan aparte |

CR-REN-03 y 04 son **informativos** (Tabla 47: punto de quiebre y reacción): se informa la serie por minuto y el primer minuto que rompe una meta. CR-REN-05 cumple si el p95 de la última media hora y la memoria de la API no crecen más de 20 % frente a los minutos 15 a 45. Ese umbral es criterio del equipo para "sin fugas ni degradación".

## 4. Resultados por candidato

Se llena en 13.6. Cada fila enlaza su corrida de Actions; el detalle es el `registro.md` del artefacto.

### 4.1 `v1.0.0-rc.N` — commit `…`

| Caso | Corrida | Fecha (UTC) | p95 inscripción (ms) | p95 pago (ms) | p95 consultas, la peor (ms) | 5xx | CPU aplicación | CPU base | Conexiones activas | CPU generador | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CR-REN-01 | 1 | | | | | | | | | | |
| CR-REN-01 | 2 | | | | | | | | | | |
| CR-REN-01 | 3 | | | | | | | | | | |
| **CR-REN-01** | **Mediana** | | | | | | | | | | |
| CR-REN-02 | 1 | | | — | — | | | | | | |
| CR-REN-02 | 2 | | | — | — | | | | | | |
| CR-REN-02 | 3 | | | — | — | | | | | | |
| **CR-REN-02** | **Mediana** | | | — | — | | | | | | |
| CR-REN-03 | 1 | | | | | | | | | | Informativo; quiebre: |
| CR-REN-04 | 1 | | | | | | | | | | Informativo; reacción: |
| CR-REN-05 | 1 | | | | | | | | | | |

**Lighthouse durante la meseta de CR-REN-01:** rendimiento percibido de las páginas Must (`lighthouse.txt` del artefacto).

### 4.2 Hallazgos

Cada meta incumplida abre un defecto con la severidad de la Tabla 52 o una NC en `registro-no-conformidades.md`, y se anota aquí con su enlace.

## 5. Humo de rendimiento en el pipeline (Tabla 48)

`infra/rendimiento/humo.js` corre con k6 y los umbrales de la Tabla 46 en dos lugares:

- **Etapa 7:** después de cada fusión en `develop`.
- **Etapa 8:** sobre cada etiqueta, contra el proxy con HTTPS.

Usa 20 usuarios virtuales durante 1 min sobre las consultas del alumno. El umbral es p95 < 2 s, menos de 1 % de fallos y más de 99 % de verificaciones en verde. En el piloto de ensayo (`SEMILLA=0`, sin usuarios) solo pide la salud de la API y la página de ingreso (`SOLO_LECTURA=1`).

No sustituye a CR-REN-01 a 05: detecta una regresión grande en cada despliegue, nada más.

## 6. Verificación de los guiones

Cada pull request que toca `infra/rendimiento/` corre el job "Guiones de rendimiento" de `rendimiento.yml`, que comprueba:

- el XML de `sce.jmx`;
- la sintaxis de los guiones de shell;
- `k6 inspect` de `humo.js` y `cr-ren-02.js`.

Antes de cada corrida, los guiones se comprobaron contra el staging local. Esas cifras no son de referencia (apartado 1).
