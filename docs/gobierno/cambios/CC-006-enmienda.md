**Enmienda a CC-006** — 5 de noviembre de 2026 (decisiones D-1 y D-3 de `docs/gobierno/plan-de-sistema.md`)

**Se amplía:** la presentación usa Next.js 16 y React 19, en lugar de Next.js 14 y React 18 (Tabla 7). Las demás herramientas de la Tabla 42 se adoptan en su versión vigente al integrarlas: esas versiones son "de referencia".

**Se retira:**
- La sustitución de Testcontainers por el servicio PostgreSQL de GitHub Actions. Se usa Testcontainers, como dicen las Tablas 42, 45 y 53 (Batch 1).
- PostgreSQL 18 en el ambiente local. Docker Compose usa PostgreSQL 16, como la Tabla 7.

**Se conserva:** Node.js 24, NestJS 12, Prisma 6, Jest 30 y Supertest 7.

**Análisis de impacto:** no afecta a los objetivos de calidad de la sección 7; reduce vulnerabilidades (sección 14.5). Requiere actualizar las Tablas 7 y 42 en la siguiente versión del manual, emitida antes de cerrar la fase 1. El tipo sigue siendo Normal.
