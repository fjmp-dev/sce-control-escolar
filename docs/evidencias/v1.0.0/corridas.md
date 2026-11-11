# Corridas de los candidatos de v1.0.0 (13.6 y Batch 14)

Copiadas el 11 de noviembre de 2026 (Tabla 62: los artefactos de Actions caducan a los 90 días). Las fechas están en UTC.

## CI de `release/1.0.0`

| Commit | Qué es | Corrida | Resultado |
|---|---|---|---|
| `5385940` | Corte de `release/1.0.0` (fusión del PR #102) | [43009794851](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43009794851) | Etapas 1 a 6 en verde. La etapa 5 de seguridad falló una vez por un `502` de Docker Hub. La 7 falló dos veces en Lighthouse con `NO_NAVSTART`. **No se etiquetó** |
| `8e26059` | Fusión del PR #105: actas, reintento de Lighthouse y registro de flujos | [43022020442](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43022020442) | Etapas 1 a 7 en verde, al primer intento. **Es `v1.0.0-rc.1`** |

## Etapa 8: promoción a staging

| Etiqueta | Corrida | Resultado | Acta |
|---|---|---|---|
| `v1.0.0-rc.1` | [43027397938](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027397938), de 13:15 a 13:25 | Verde: humo del Anexo D, Newman (177 peticiones y 384 aserciones), CO-FLE-01, TLS, matriz Must y humo k6 | `acta-promocion-v1.0.0-rc.1.md` |

## Continuidad y seguridad operativa sobre `release/1.0.0` (`5385940`)

| Flujo | Corrida | Resultado |
|---|---|---|
| Continuidad, primera corrida | [43014009079](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43014009079) | Respaldo cifrado. Inicia la cadena: no había respaldo anterior |
| Continuidad, segunda corrida | [43014050248](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43014050248) | Restauró el respaldo de la primera en **20 s** (RTO, meta: menos de 4 h). Conteos iguales (359 filas), CD-DAT en verde y salud de la API correcta. RPO medido contra el respaldo anterior (meta: menos de 24 h) |
| Seguridad operativa | [43014013011](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43014013011) | Colaboradores: `fjmp-dev` (admin) y `samuel0rtiz` (write). Revisores de `staging` y `piloto`: `fjmp-dev`. Base: rechaza conexiones sin TLS, con TLS 1.1 y de superusuario por red. 51 asientos de bitácora muestreados. Un profesor inactivo, de la semilla |

**Revisión de accesos, parte que el `GITHUB_TOKEN` no puede leer.** FJMP la completó con `gh` el 11 de noviembre de 2026:

- 0 invitaciones pendientes y 0 llaves de despliegue.
- `develop` y `main` piden los 7 checks con rama al día, incluyen a los administradores y no permiten forzar ni borrar.
- Rulesets activos: `release/**` (27027338) y `v*` (27027346).

## Reportes guardados (`reportes/`)

Son los artefactos tal como los entregó GitHub, sin descomprimir. Los de CI son de la corrida 43022020442, sobre `8e26059`.

| Archivo | Contenido | SHA-256 |
|---|---|---|
| `despliegue-staging-v1.0.0-rc.1.zip` | Etapa 8 de rc.1: despliegue, Anexo D, Newman, TLS, ZAP pasivo, Playwright, k6 y calidad de datos | `c57f0bcac4074bf3e4dbcd2d43b1b0c7073a6cecb90ec21dcd829b3bb6e69cd0` |
| `seguridad-operativa.zip` | Revisión mensual de accesos y muestreo de bitácora | `8aee2317b9a8e9b6549d1fb4966a39f237a9a28f0ac455e10e8663f32551438a` |
| `calidad.zip` | SonarQube, puerta de calidad y `npm audit` | `992475c84ef7a2428103cb2ea77940ff73c1a066048b001ec75c9ad5b40360cd` |
| `calidad-datos.zip` | Great Expectations, CD-DAT | `20119485d76e5e8418f98e20fc6b682454401bae7fe41d3ae3c4c6521923874d` |
| `cobertura-unitarias.zip` | Cobertura de Jest, unitarias | `61816e3752e730139d50dfa1e7b181422ca03d83063c7caab6caf1f42ba7865d` |
| `cobertura-integracion.zip` | Cobertura de Jest, integración con Testcontainers | `4b100ff5f4f8df3d45d943e2b16973ccd514ccd18224a3e916819aa002e82ff7` |
| `cobertura-portal.zip` | Cobertura de Vitest, portal | `354432d104889a13c7e66c22fedfd8032a4f6981111594bd88154a9103f0f3eb` |
| `newman.zip` | Contratos y matriz rol × endpoint | `18a95cdb2a03785b1406275a87a46de069a07f493b636a0eb0290fade46e8c4e` |
| `zap.zip` | ZAP API scan | `90db654eef8700ee9ec563a797247d49e8a44f046f51e312df0cea0cccc22661` |
| `trivy.zip` | Trivy sobre las imágenes | `b2f70644f72ea533c4e246111b032c4cbd13320b1e40943d40e71fe3c66261f5` |
| `gitleaks.zip` | Gitleaks | `adb154f4b25da0b18281ddab18e48da0f7ee9b40aba04a8da6479f5c6d80ece7` |
| `reglas-must.zip` | Reglas Must con prueba (CO-MAN-01) | `2f51d75134be2640db947c61daca241fedbcbc765f95f95a27d1adc1e0cf228d` |

Los `newman` traen JWT y la contraseña de la semilla de su corrida. Son de ambientes efímeros que ya no existen, generados al azar en cada corrida (la de staging) o con la clave de prueba pública de `docker-compose.yml` (la de CI), así que no dan acceso a nada. Los secretos del piloto no aparecen en ningún artefacto: la etapa 8 solo publica su huella.

## Fuera del repositorio, por tamaño

Se adjuntan a la release `v1.0.0` de GitHub:

| Archivo | Tamaño | SHA-256 |
|---|---|---|
| `despliegue-pruebas.zip` (etapa 7 de `8e26059`: Cypress, axe, Lighthouse y Playwright) | 83.9 MB | `1539fb552a064e2c80c92d61babec8b2f3a22b8f876819cddf4076c8272e4246` |
| `continuidad-3.zip` (restauración, respaldo y humo de la segunda corrida de continuidad) | 12.3 MB | `251a15972f50bee05f2082d172e2ae3054df2d5647a321662fa30bfa1ffd1f39` |

Los respaldos cifrados (`respaldo`) no se copian: son la cadena de continuidad y caducan con su retención (`matriz-retencion.md`).
