# Corridas de CI de la fase 4 (v0.4.0)

Se copiaron el 10 de noviembre de 2026. Las fases 1 a 4 se entregan juntas en la pila de pull requests #30 y #55 a #66, por la compactación del plan (`docs/gobierno/plan-de-sistema.md`, 6.1), así que esta carpeta cubre las cuatro fases.

## Última corrida en verde de cada pull request

Todas son del flujo `ci.yml` con el evento `pull_request`, y todas terminaron en `success`. Las fechas están en UTC.

| PR | Rama | Commit | Corrida | Fecha |
|---|---|---|---|---|
| #30 | `feature/fase1-usuarios-cobertura` | `05ca9e5` | [42106331427](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42106331427) | 2026-11-05 20:45 |
| #55 | `feature/31-base-documental` | `2927533` | [42164615903](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42164615903) | 2026-11-06 04:47 |
| #56 | `feature/41-estandares-pipeline` | `bdc8360` | [42252819835](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42252819835) | 2026-11-06 16:29 |
| #57 | `feature/42-arquitectura-identidad-bitacora` | `a8b6740` | [42308245235](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42308245235) | 2026-11-06 22:55 |
| #58 | `feature/43-portal-base` | `57b87b8` | [42440355347](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42440355347) | 2026-11-08 02:52 |
| #59 | `feature/44-expediente` | `e6bdb36` | [42443090034](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42443090034) | 2026-11-08 03:31 |
| #60 | `feature/45-inscripcion` | `4b75741` | [42533743035](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42533743035) | 2026-11-08 23:08 |
| #61 | `feature/46-staging` | `c2522eb` | [42899026804](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42899026804) | 2026-11-10 20:49 |
| #62 | `feature/47-oferta-horarios` | `330520c` | [42899092660](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42899092660) | 2026-11-10 20:49 |
| #63 | `feature/48-calificaciones` | `309cbfd` | [42908827649](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42908827649) | 2026-11-10 21:49 |
| #64 | `feature/49-pagos-tramites` | `bb4dd76` | [42922777538](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42922777538) | 2026-11-10 23:22 |
| #65 | `feature/51-reportes` | `29c119f` | [42929856056](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42929856056) | 2026-11-11 00:15 |
| #66 | `feature/15-manual-v3` | `92a077a` | [42942319590](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42942319590) | 2026-11-11 01:54 |

## Corrida de referencia: 42942319590, commit `92a077a`

Es la cima de la pila: contiene todo el código entregado. El commit que agrega esta carpeta solo suma documentos.

| Etapa | Resultado |
|---|---|
| 1 Construcción | success |
| 2 Análisis estático | success |
| 3 Pruebas unitarias | success |
| 4 Pruebas de integración | success |
| 5 Calidad - SonarQube y npm audit | success. Puerta de la Tabla 51: OK, con 0 errores bloqueantes y 0 críticos. La cobertura de código nuevo sale "sin dato" porque ese commit solo cambió documentos; la de cada cambio de código está en la corrida de su PR |
| 5 Seguridad - Trivy y humo del ambiente | success |
| 6 Empaquetado | omitida: solo corre al fusionar en `develop` o `main` |
| 7 Despliegue a pruebas | success |

## Reportes guardados (`reportes/`)

Son los artefactos de esa corrida, tal como los entregó GitHub y sin descomprimir.

| Archivo | Contenido | SHA-256 |
|---|---|---|
| `calidad.zip` | SonarQube, puerta de calidad y `npm audit` | `b0444312f30a31560f445a75032d7eec4dec2a5bf1553ba2a1846f32197f8dda` |
| `calidad-datos.zip` | Great Expectations, CD-DAT | `8b3e79c562dd79e9b5022d04db6e37275416bcebf74bfbf80ec7f89c0431323c` |
| `cobertura-unitarias.zip` | Cobertura de Jest, unitarias | `ac0960ac56fb56cbdb34ef3f4f38637059b31edd6a784c244bd540a6a5179ba2` |
| `cobertura-integracion.zip` | Cobertura de Jest, integración con Testcontainers | `6e437330ea5746e0f9b470da82b4b678f44b3c4eb8d5fdd01c76c541e1376be0` |
| `cobertura-portal.zip` | Cobertura de Vitest, portal | `2c39762b679555f93d09adaef92f06974cda41486c752ff6528fc06f937aa817` |
| `newman.zip` | Contratos y matriz rol × endpoint con Newman | `415de3d35b1018fcd94551ad1bad526f55daa623ca246efb191a0572714b2cd0` |
| `zap.zip` | ZAP API scan | `23f4e1497f7127ed42ecc9ac9282da383e9c1b626a750c520f143bc669b25d71` |
| `trivy.zip` | Trivy sobre las imágenes | `d777de88edc324894157fff6bee0f9f1b51ccfe0d51cba04c22de009b0032662` |
| `gitleaks.zip` | Gitleaks: `[]`, sin hallazgos | `45f770fa87972620040968d0ec451f5f36b3188b086d5d7b6bb370d4fe15ea2b` |

`newman.zip` trae los JWT que usó la corrida. Son de un ambiente efímero de CI, firmados con la clave de prueba pública de `docker-compose.yml` y ya caducados, así que no dan acceso a nada.

## Fuera del repositorio, por tamaño

`despliegue-pruebas.zip` pesa 29.7 MB. Trae los videos y las capturas de Cypress, 40 reportes de axe y los JUnit. Se adjunta a la release `v0.4.0` de GitHub. (Corrección del 10-nov-2026: antes decía `v1.0.0`, que no existe; ver `notas-version/v0.4.0.md`.)

SHA-256: `af1ff0609f12bdbc617a4ceebdb66e3933727df86217570cde72d9b4287b796d`.
