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
| CR-REN-01 | Carga | JMeter 5.6.3 (`sce.jmx`) | 300 usuarios que llegan en 5 min y 15 min de meseta. Lectura intensiva: cada usuario entra una vez, inscribe o paga, y luego consulta oferta, inscripciones, calificaciones y cuenta, con 1 a 3 s de pausa. Lighthouse corre al terminar la carga, en el núcleo del generador (apartado 4.2) |
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

Se llenó en 13.6, el 11 de noviembre de 2026. Cada fila enlaza su corrida de Actions; el detalle es el `registro.md` del artefacto.

### 4.1 `v1.0.0-rc.1` — commit `8e26059`

Imágenes por digest: `sce-api@sha256:44963d08…` y `sce-portal@sha256:3a1f2c3f…`. Las cifras son del `metas.md` de cada artefacto. Las medianas son por columna. "p95 pago" es el peor de `pago-intento` y `pago-simulacion`. "p95 consultas" es la peor de las cuatro `consulta-*`.

| Caso | Corrida | Fecha (UTC) | p95 inscripción (ms) | p95 pago (ms) | p95 consultas, la peor (ms) | 5xx | CPU aplicación | CPU base | Conexiones activas | CPU generador | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CR-REN-01 | [1](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43034376604) | 11-nov 14:04–14:24 | 32 | 21 | 12 | 0 % | 42.4 % | 42.6 % | 2 | 42.4 % | Cumple |
| CR-REN-01 | [2](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43034382156) | 11-nov 14:06–14:26 | 68 | 44 | 30 | 0 % | 48.7 % | 41.9 % | 1 | 42.3 % | Cumple |
| CR-REN-01 | [3](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43034388666) | 11-nov 14:05–14:25 | 66 | 46 | 26 | 0 % | 46.5 % | 40.2 % | 2 | 39.7 % | Cumple |
| **CR-REN-01** | **Mediana** | | **66** | **44** | **26** | **0 %** | **46.5 %** | **41.9 %** | **2** | **42.3 %** | **Cumple** |
| CR-REN-02 | [1](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027941665) | 11-nov 13:22 | 2 277 | — | — | 0 inesperadas | 58.5 % | 58.5 % | 1 | 58.0 % | Cumple |
| CR-REN-02 | [2](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027952315) | 11-nov 13:22 | 2 924 | — | — | 0 inesperadas | 45.4 % | 45.3 % | 1 | 45.8 % | Cumple |
| CR-REN-02 | [3](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027963171) | 11-nov 13:22 | 2 163 | — | — | 0 inesperadas | 55.4 % | 56.4 % | 1 | 53.8 % | Cumple |
| **CR-REN-02** | **Mediana** | | **2 277** | — | — | **0** | **55.4 %** | **56.4 %** | **1** | **53.8 %** | **Cumple:** en las tres, 300 enviadas, 5 confirmadas en CARGA-5, 95 rechazadas por cupo y cero filas en `cr-ren-02.sql` |
| CR-REN-03 | [1](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43034639983) | 11-nov 14:06–14:36 | 788 | 564 | 1 022 | 0 % | **99.5 %** | 58.9 % | 2 | 42.6 % | Informativo; quiebre: CPU de la aplicación sobre 80 %, sin latencias fuera de meta ni errores hasta 800 usuarios (apartado 4.2, hallazgo 3) |
| CR-REN-04 | [1](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43034644974) | 11-nov 14:06–14:21 | 446 | 340 | 57 | 0 % | 68.3 % | 37.6 % | 1 | 36.5 % | Informativo; reacción: en el minuto de la subida (de 50 a 400), p95 de 250 ms en transacciones y 246 ms en consultas; desde el minuto siguiente, consultas de 25 a 30 ms. Sin quiebre |
| CR-REN-05 | [1](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027876968) | 11-nov 13:21–17:27 | 33 | 16 | 7 | 0 % | 50.6 % | 50.8 % | 2 | 50.9 % | Cumple: p95 de consultas de 8 ms en los minutos 15 a 45 y de 2 ms en la última media hora; memoria de la API de 334 MiB en el minuto 15 y de 198 MiB al final (apartado 4.2, hallazgo 6) |

**Lighthouse al terminar CR-REN-01** (`lighthouse.txt` de cada artefacto, 21 páginas): accesibilidad 100 en todas las páginas de las tres corridas. Rendimiento de 90 o más en 20 de 21 páginas en las corridas 1 y 2, y en 18 de 21 en la 3. `administrador-usuarios` dio 68 o 69 en las tres (defecto #107). En la corrida 3 también bajaron `alumno-inscripcion` (86) e `ingresar` (78); en las otras dos dieron 92 o 93, y 95 o 100.

### 4.2 Hallazgos

Cada meta incumplida abre un defecto con la severidad de la Tabla 52 o una NC en `registro-no-conformidades.md`, y se anota aquí con su enlace. **Sobre `v1.0.0-rc.1`, ninguna meta de la Tabla 46 se incumplió** en CR-REN-01, 02 y 05. CR-REN-03 y 04 son informativos.

1. **Primera tanda de CR-REN-01, inválida.** Las corridas [43027909199](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027909199), [43027919870](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027919870) y [43027930071](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027930071) salieron de `feature/76-rendimiento-digest` (`27c3233`), de 13:21 a 13:45 UTC. El generador llegó a 92.7 %, 98.4 % y 98.2 % de CPU, porque Lighthouse corría en su núcleo durante la meseta. Sus metas daban en verde, pero `metas.sh` invalida la corrida desde 80 %, y no se usan. Con el arreglo `7a175ba`, Lighthouse corre al terminar la carga, fuera de la ventana de metas. En la segunda tanda, la de la tabla, el generador quedó entre 39.7 % y 42.4 %.
2. **El instrumento sale de la etiqueta medida.** `rendimiento.yml` hace checkout de la etiqueta, así que `metas.sh`, `sce.jmx` y `scripts/` son los de `8e26059`. De la rama elegida al lanzar solo sale el workflow, y ninguna fue `release/1.0.0` (auditoría "Antes del piloto", OB-08):
   - `feature/76-rendimiento-digest`: la primera tanda, CR-REN-02 y CR-REN-05;
   - `feature/76-lighthouse-generador`: la segunda tanda.

   Por eso el arreglo `e006abc` de `metas.sh` no aplicó a ninguna corrida de rc.1. En la serie por minuto de CR-REN-03 a 05 hay dos efectos:
   - **Usuarios:** la columna dice el total (800, 400 o 150) desde el minuto 0. Los usuarios que han llegado se recalcularon del `resultados.jtl` de cada artefacto, contando cada ingreso una vez. En CR-REN-03 llegan 32 por minuto, de 33 en el minuto 0 a 800 en el 24. En CR-REN-04 hay 50 hasta el minuto 4 y 400 desde el 5.
   - **Punto de quiebre:** solo considera latencia y errores, y dice "no se alcanzó" en CR-REN-03 con la CPU de la aplicación en 99.5 %.

   CR-REN-03 y 04 se repitieron (corridas [43027888173](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027888173) y [43027898692](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027898692) de la primera tanda) creyendo que tomarían `e006abc`. Dieron cifras parecidas, por ejemplo una CPU de la aplicación de 98.6 % y de 68.1 %. Se informan las segundas. El arreglo entra con la siguiente candidata. Así debe ser: una etiqueta se mide con el instrumento de esa etiqueta.
3. **CR-REN-03, forma de degradar.** La aplicación tiene dos núcleos (registro, "Dimensionamiento"), y su CPU es el cuello de botella: llegó a 99.5 %, mientras la base quedó en 58.9 % con dos conexiones activas.
   - **Cómo degrada:** sube la latencia, sin errores. Desde el minuto 20, con 673 usuarios llegados, las peticiones por minuto dejan de crecer y se quedan entre 17 600 y 19 400. El p95 de consultas sube desde el minuto 16 (545 usuarios) y llega a 1 246 ms en el minuto 28, con 800 usuarios. Ninguna latencia pasó su meta y no hubo 5xx.
   - **Minuto del quiebre:** el minuto en que la CPU pasó de 80 % no se puede fijar con el instrumento de rc.1 (hallazgo 2). Por la serie, la saturación empieza entre los minutos 16 y 20, es decir, entre 545 y 673 usuarios. Es una lectura de la serie, no una medición de la CPU por minuto.
   - **Margen:** con 300 usuarios (CR-REN-01) la aplicación queda en 46.5 % de CPU (mediana). La Tabla 46 pide 300, y el margen se acaba entre 550 y 650 usuarios con este dimensionamiento. CR-REN-03 es informativo y no abre defecto. Se anota en RK-04.
4. **CR-REN-04.** La subida de 50 a 400 usuarios en un minuto no rompió ninguna meta: el p95 subió en ese minuto y volvió al siguiente. La memoria de la API pasó de 131 MiB a 345 MiB y no bajó, igual que en CR-REN-01 (343 a 347 MiB); CR-REN-05 dice si es una fuga o un techo.
5. **Lighthouse al terminar CR-REN-01.** `administrador-usuarios` dio 68 o 69 en las tres corridas, con un TBT de 5.4 s a 9.8 s. La página lista a todos los usuarios sin paginar y arma un formulario por fila, y la carga deja más de 300 usuarios. Se abrió el defecto [#107](https://github.com/fjmp-dev/sce-control-escolar/issues/107), de severidad Media. En la etapa 7, con la semilla corta, esa página da 98 o más. La caída de `alumno-inscripcion` e `ingresar` en la corrida 3 no se repitió en las otras dos, y no abre defecto: el umbral de 90 es criterio del equipo y no bloquea. Hubo dos `NO_NAVSTART` que pasaron al reintentar.
6. **CR-REN-05.** Cumple. En 4 h con 150 usuarios hubo 1 090 874 peticiones, sin un 5xx.
   - **Degradación:** el p95 de consultas fue de 8 ms en los minutos 15 a 45 y de 2 ms en la última media hora. Bajó en lugar de subir.
   - **Fugas:** la memoria de la API llegó a 342 MiB, estaba en 334 MiB en el minuto 15 y terminó en 198 MiB. Los 345 MiB de CR-REN-01 y 04 son un techo del proceso, no una fuga (hallazgo 4).
   - **Lectura del criterio:** las transacciones (ingreso, inscripción y pago) ocurren una vez por usuario, en los primeros 5 minutos, y el criterio de degradación se lee en las consultas. La columna Usuarios dice 150 desde el minuto 0 por el instrumento de rc.1 (hallazgo 2).

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
