# Fichas de proveedores — SCE

**Fuente:** SCE-MC-001 v2.0, sección 33 (Tabla 55). **Actualizado:** 8 de noviembre de 2026.

Los proveedores se evalúan antes de emplearse en el piloto. El cambio de un proveedor crítico es un cambio mayor y exige análisis de impacto.

## GitHub

| Campo | Valor |
|---|---|
| Uso | Repositorio, pull requests, issues, tablero y automatización con GitHub Actions |
| Riesgo asociado | RK-07 |
| Controles aplicados | Protección de `main` y de la rama de integración (pull request, checks de CI y una aprobación, también para administradores); secret scanning con push protection; Gitleaks en CI; gestor de secretos de Actions |
| Acceso | `fjmp-dev` como propietario. La invitación a `samuel0rtiz` del 23 de octubre **caducó** sin aceptarse (GitHub las vence a los 7 días): hay que reenviarla |
| Visibilidad | Repositorio público, con acceso de lectura para el equipo auditor |
| Evaluación | Adecuado para desarrollo y pruebas. Los artefactos de Actions se conservan 90 días, menos que la Tabla 62: se atiende con `docs/evidencias/` |
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

**Pendiente.** Se llena antes del Batch 9. Controles exigidos por la Tabla 55: sandbox en ambientes no productivos, convenio y credenciales solo en piloto, idempotencia y conciliación diaria. Riesgos: RK-02 y RK-08.

## Proveedor de infraestructura

**Evaluado el 8 de noviembre de 2026 (Batch 6). Decisión pendiente de FJMP y firma del Product Owner.**

| Campo | Valor |
|---|---|
| Uso | Staging (Tabla 30), y piloto si la institución no aporta servidores |
| Riesgo asociado | RK-04 |
| Requisitos del manual | Dos servidores con red privada (Fig. 9). nginx con TLS 1.2+. PostgreSQL 16 con pgAudit y SCRAM (CC-005). Dimensionamiento equivalente al piloto para la carga (sec. 26 y 24). URL pública para el webhook de Mercado Pago (Fig. 5) |
| Propuesto | **Hetzner Cloud**, dos servidores CX23 (2 vCPU, 4 GB) en Alemania o Finlandia, que suben a CX33 (4 vCPU, 8 GB) para el Batch 13. Red privada, y cortafuegos sin costo |
| Costo | Entre 5.99 € y 8.99 € por servidor al mes, sin IVA. Respaldos automáticos desde 1.20 € por servidor. Dominio, entre 10 y 15 USD al año. Precios del sitio de Hetzner al 8 de noviembre de 2026. La página marca los planes CX como no disponibles por ahora; la alternativa es CPX22, a 19.99 € |
| Controles de la Tabla 55 | **Inventario:** `inventario-de-ambientes.md`. **Respaldos:** previo a cada despliegue; el diario cifrado es del Batch 13. **HTTPS:** Let's Encrypt, TLS 1.2+ comprobado en cada despliegue. **Responsables:** FJMP como DevOps; SJOM aprueba cada despliegue |
| Datos | Solo sintéticos (RK-09). La ubicación en la Unión Europea no afecta a staging. Para el piloto, con datos reales, la institución decide dónde se alojan (Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, sección 18) |
| Salida | Todo corre en Docker Compose sobre Linux: cambiar de proveedor es repetir la sección 4 del inventario. Aun así, la sección 33 lo trata como cambio mayor |

**Alternativas descartadas:**

| Opción | Por qué no |
|---|---|
| PaaS (Render, Railway y similares) | Sin control de nginx ni de PostgreSQL: ni TLS configurable, ni pgAudit, ni servidores separados. Staging dejaría de ser un ensayo del piloto |
| Oracle Cloud Always Free (Querétaro) | En 2026 se redujo a 2 OCPU y 12 GB ARM, con poca capacidad disponible. Recupera las instancias que pasan una semana sin uso, y staging pasa mucho tiempo así (RK-04) |
| Azure for Students | 100 USD al año sin tarjeta; dos máquinas virtuales lo agotan en unos tres meses |
| DigitalOcean con el GitHub Student Pack | El crédito terminó en julio de 2026 |

## Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | |
