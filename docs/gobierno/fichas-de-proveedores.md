# Fichas de proveedores — SCE

**Fuente:** SCE-MC-001 v2.0, sección 33 (Tabla 55). **Actualizado:** 10 de noviembre de 2026 (CC-018 y CC-020).

Los proveedores se evalúan antes de emplearse en el piloto. El cambio de un proveedor crítico es un cambio mayor y exige análisis de impacto.

## GitHub

| Campo | Valor |
|---|---|
| Uso | Repositorio, pull requests, issues, tablero y automatización con GitHub Actions. Desde CC-018, también **staging**: la etapa 8 lo arma en un runner, lo verifica y lo destruye |
| Riesgo asociado | RK-07 |
| Controles aplicados | Protección de `main` y de `develop`: pull request y checks de CI de las etapas 1 a 5 y 7, también para administradores. Desde el 10 de noviembre de 2026 se exigen cero aprobaciones (NC-012); secret scanning con push protection; Gitleaks en CI; gestor de secretos de Actions |
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
| Controles de la Tabla 55 | **Inventario:** `inventario-de-ambientes.md`. **Respaldos:** previo a cada despliegue; cifrado y restauración se ensayan en el Batch 13. **HTTPS:** TLS 1.2+ comprobado en cada despliegue, con certificado autofirmado. **Responsables:** FJMP como DevOps; SJOM aprueba cada despliegue. _(Corregido el 10 de noviembre de 2026: SJOM no aprueba; desde ese día aprueba FJMP (NC-012). El environment `staging` aún no existe y se crea en 11.4.)_ |
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
