# Fichas de proveedores — SCE

**Fuente:** SCE-MC-001 v2.0, sección 33 (Tabla 55). **Actualizado:** 11 de noviembre de 2026 (sub-batch 13.1: CC-022, GHCR, Sigstore y Docker Hub).

Los proveedores se evalúan antes de emplearse en el piloto. El cambio de un proveedor crítico es un cambio mayor y exige análisis de impacto.

## GitHub

| Campo | Valor |
|---|---|
| Uso | Repositorio, pull requests, issues, tablero y automatización con GitHub Actions. Desde CC-018, también **staging**, y desde CC-022 el **piloto de ensayo**: la etapa 8 los arma en un runner, los verifica y los destruye. Environments `staging` y `piloto` con revisor y, el de piloto, con secretos propios |
| Riesgo asociado | RK-07 |
| Controles aplicados | Protección de `main` y de `develop`: pull request y checks de CI de las etapas 1 a 5 y 7, también para administradores. Desde el 10 de noviembre de 2026 se exigen cero aprobaciones (NC-012). _Rulesets_ de `release/**` y de etiquetas `v*` (`infra/github/`). Secret scanning con push protection; Gitleaks en CI; secretos por environment (20.2) |
| Acceso | `fjmp-dev` como propietario. La invitación a `samuel0rtiz` del 23 de octubre caducó sin aceptarse (GitHub las vence a los 7 días). Se reenvió el 10 de noviembre y `samuel0rtiz` la aceptó ese mismo día: es colaborador con permiso _write_. No ha revisado ni aprobado ningún pull request (NC-012) |
| Visibilidad | Repositorio público, con acceso de lectura para el equipo auditor |
| Evaluación | Adecuado para desarrollo, pruebas y staging. Los runners de repositorios públicos tienen 4 CPU y 16 GB, sin costo. Los artefactos de Actions se conservan 90 días, menos que la Tabla 62: se atiende con `docs/evidencias/` |
| Decisión | Aprobar, pendiente de firma del Product Owner |

## Bibliotecas de npm

| Campo | Valor |
|---|---|
| Uso | Dependencias del stack |
| Riesgo asociado | Vulnerabilidades de cadena de suministro |
| Controles aplicados | Archivo de bloqueo; `npm ci`; `npm audit --audit-level=high` en CI; alertas y actualizaciones de Dependabot; Trivy sobre el repositorio y la imagen |
| Excepción vigente | `overrides` de `deepmerge-ts` a la versión 8, dentro de Prisma 6, para corregir una vulnerabilidad alta sin migrar a Prisma 7 |
| Evaluación | Adecuado, con revisión de vulnerabilidades altas en cada pull request |
| Decisión | Aprobar, pendiente de firma del Product Owner |

## Mercado Pago

**No se contrata; pasarela simulada (CC-020, 10 de noviembre de 2026).** El alumno aprueba o rechaza el cobro en una pantalla de prueba y no se mueve dinero. No hay cuenta, credenciales, sandbox, convenio ni webhook.

| Campo | Valor |
|---|---|
| Uso | Ninguno. Lo sustituye la pasarela simulada del módulo de pagos (`api/src/pagos/`) |
| Riesgo asociado | RK-02 y RK-08, que se tratan sobre la pasarela simulada (CC-020) |
| Controles de la Tabla 55 | **Sandbox, convenio y credenciales:** no aplican. **Idempotencia:** `Pago.aplicarUnaVez()` y una clave de idempotencia por intento. **Conciliación diaria:** el corte del día de caja (manual v3.0, Tabla 4) |
| Costo | Ninguno |
| Decisión | No se contrata. Un cobro real, en un piloto futuro, entra con un CC Mayor nuevo, y esta ficha se llena antes de usarlo |

## Proveedor de infraestructura para staging

**Decisión del 10 de noviembre de 2026 (CC-018): no se renta infraestructura.** FJMP decidió no pagar servidores para un proyecto académico. La Tabla 30 pide para staging la etiqueta candidata, datos anonimizados, HTTPS, humo y carga, y nada de eso exige un servidor persistente. Staging corre en GitHub Actions (ficha de GitHub), con la topología de la Fig. 9, y se destruye al terminar.

| Campo | Valor |
|---|---|
| Uso | Staging (Tabla 30). El piloto lo aloja la institución (Batch 14) |
| Riesgo asociado | RK-04 |
| Controles de la Tabla 55 | **Inventario:** `inventario-de-ambientes.md`. **Respaldos:** previo a cada despliegue; cifrado y restauración se ensayan en el Batch 13. **HTTPS:** TLS 1.2+ comprobado en cada despliegue, con certificado autofirmado. **Responsables:** FJMP como DevOps; SJOM aprueba cada despliegue. _(Corregido el 10 de noviembre de 2026: SJOM no aprueba; desde ese día aprueba FJMP (NC-012). El environment `staging` existe desde el 10 de noviembre de 2026 (11.4), y el `piloto`, desde el 11 (13.1).)_ |
| Datos | Solo sintéticos (RK-09) |
| Costo | Ninguno |

**Alternativas descartadas:**

| Opción | Por qué no |
|---|---|
| Hetzner Cloud, dos servidores | Unos 12 € al mes más el dominio. Cumplía la Fig. 9, pero el manual no exige servidores persistentes para staging |
| Oracle Cloud Always Free | Gratis, pero en 2026 se redujo a 2 OCPU y 12 GB ARM, con poca capacidad disponible. Recupera las instancias que pasan una semana sin uso, y staging pasa mucho tiempo así (RK-04). Exigía imágenes ARM |
| PaaS (Render, Railway y similares) | Sin control de nginx ni de PostgreSQL: ni TLS configurable, ni pgAudit, ni servidores separados |
| Cloudflare Workers o Containers | No corre PostgreSQL con pgAudit como servidor aparte. Los contenedores exigen el plan de pago |
| Azure for Students | 100 USD al año sin tarjeta; dos máquinas virtuales lo agotan en unos tres meses |
| DigitalOcean con el GitHub Student Pack | El crédito terminó en julio de 2026 |

## GitHub Container Registry (GHCR)

| Campo | Valor |
|---|---|
| Uso | Registro de las imágenes `sce-api` y `sce-portal` que construye la etapa 6. La etapa 8 las despliega por digest, sin reconstruirlas (Tabla 53, AU-12) |
| Riesgo asociado | RK-07 (cadena de suministro) y RK-04 (que staging y piloto no corran lo mismo) |
| Controles aplicados | Publica solo la etapa 6, con el `GITHUB_TOKEN` de la corrida (`packages: write`), en ramas `develop`, `main` y `release/**`. Cada imagen va firmada con Sigstore. La etapa 8 verifica la firma y la identidad del flujo antes de usar el digest. Paquetes ligados al repositorio, que es público |
| Retención | Las imágenes no caducan solas. Las etiquetas SemVer marcan las que se promovieron |
| Costo | Ninguno para paquetes públicos |
| Decisión | Aprobar (FJMP como PO, 11 de noviembre de 2026; NC-012) |

## Sigstore (cosign, Fulcio y Rekor)

| Campo | Valor |
|---|---|
| Uso | Firma sin llave de las imágenes en la etapa 6 y verificación en la etapa 8 (AU-12) |
| Riesgo asociado | RK-07 |
| Controles aplicados | La firma usa la identidad OIDC del flujo `ci.yml` en `develop`, `main` o `release/**`. La etapa 8 exige ese emisor y esa identidad (`--certificate-identity-regexp`). Las firmas quedan en el registro público de transparencia (Rekor) |
| Dependencia | Servicio público de la Open Source Security Foundation. Si no responde, la etapa 8 falla cerrada: no despliega una imagen sin verificar |
| Costo | Ninguno |
| Decisión | Aprobar (FJMP como PO, 11 de noviembre de 2026; NC-012) |

## Docker Hub (imágenes base)

| Campo | Valor |
|---|---|
| Uso | Imágenes base de terceros: `node` (construcción), `postgres:16` (base de staging y pruebas), `nginx:1.28` (proxy), y las herramientas de CI (`plantuml`, ZAP y testssl vienen de GHCR) |
| Riesgo asociado | RK-07: una imagen base con vulnerabilidades o alterada |
| Controles aplicados | Versiones fijadas por etiqueta mayor y menor; Trivy sobre las imágenes del SCE en la etapa 5 con cero altas; Dependabot para los `Dockerfile` |
| Límite | Las descargas anónimas tienen tope por hora. Los runners de GitHub tienen caché y no se ha alcanzado |
| Costo | Ninguno |
| Decisión | Aprobar (FJMP como PO, 11 de noviembre de 2026; NC-012) |

## Cloudflare (túnel)

| Campo | Valor |
|---|---|
| Uso | URL pública temporal hacia el ambiente, solo mientras dura una prueba que la necesita: sesiones de usabilidad, si hay participantes (6.2, 13.5). CC-018. Ya no hay webhook de Mercado Pago (CC-020) |
| Riesgo asociado | Exponer un ambiente con datos sintéticos mientras el túnel está abierto |
| Controles | Solo datos sintéticos; el túnel se cierra al terminar la prueba; toda ruta, salvo `/salud` y el inicio de sesión, pide sesión |
| Costo | Ninguno (`cloudflared` con túnel rápido o cuenta gratuita) |
| Decisión | Se evalúa a fondo antes de usarlo. Sin participantes no se usa |

## Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | |
