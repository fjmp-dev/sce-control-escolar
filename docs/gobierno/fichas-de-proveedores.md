# Fichas de proveedores — SCE

**Fuente:** SCE-MC-001 v2.0, sección 33 (Tabla 55). **Actualizado:** 5 de noviembre de 2026.

Los proveedores se evalúan antes de emplearse en el piloto. El cambio de un proveedor crítico es un cambio mayor y exige análisis de impacto.

## GitHub

| Campo | Valor |
|---|---|
| Uso | Repositorio, pull requests, issues, tablero y automatización con GitHub Actions |
| Riesgo asociado | RK-07 |
| Controles aplicados | Protección de `main` y de la rama de integración (pull request, checks de CI y una aprobación, también para administradores); secret scanning con push protection; Gitleaks en CI; gestor de secretos de Actions |
| Acceso | `fjmp-dev` como propietario; `samuel0rtiz` con invitación pendiente |
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

**Pendiente de elegir.** Se llena antes del Batch 6. Controles exigidos por la Tabla 55: inventario, respaldos, HTTPS y responsables identificados. Riesgo: RK-04.

## Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | |
