# sce-control-escolar

Sistema de Control Escolar Universitario (SCE). Centro Universitario UAEM Tianguistenco, Ingeniería de Software.

| Campo | Valor |
|---|---|
| Manual de calidad | SCE-MC-001 v2.0, 16 de septiembre de 2026 |
| Fase actual | **1 — Núcleo institucional** (en desarrollo) |
| Autores | Francisco Javier Martínez Peñas · Samuel Jezoar Ortiz Martínez |
| Auditoría en curso | PA-SCE-001 v1.0, equipo Aerial Forge |

---

## Estado del repositorio

La fase 0 (alcance validado) cerró con la línea base documental. La fase 1 arrancó con:

- Base de datos PostgreSQL con las veintiuna entidades de la sección 13.6, migradas con Prisma, y sus restricciones de integridad.
- Auditoría de base de datos con pgAudit (`db/pgaudit.sql`).
- API NestJS con autenticación JWT, autorización por los seis roles (RF-008) y catálogos institucionales.
- Pruebas automatizadas (CS-SEG-04, CS-SEG-06, CI-AUTH-01, CD-DAT-01 y 04) e integración continua con GitHub Actions en cada pull request.

Pendiente de fase 1: presentación en Next.js, alta de usuarios, Docker Compose y análisis estático (ESLint, SonarQube).

**Tablero y backlog:** [issues del repositorio](https://github.com/fjmp-dev/sce-control-escolar/issues), agrupados por sprint en [hitos](https://github.com/fjmp-dev/sce-control-escolar/milestones). Los issues #1 a #22 corresponden uno a uno con el backlog de `docs/gobierno/plan-de-trabajo.md`; los cambios al manual se registran con la etiqueta `cambio` (#23 a #28).

---

## Estructura

```
api/                NestJS + Prisma (sección 3.6)
  prisma/
    schema.prisma         Veintiuna entidades (sección 13.6, Tabla 29)
    migrations/           init + restricciones que Prisma no expresa de forma nativa
    seed.mts              Datos sintéticos de desarrollo
  src/
    auth/                 Login JWT y guard por rol (RF-008)
    catalogos/            Facultades, planes, materias y periodos
  test/seguridad.spec.ts  Casos CS-SEG automatizados
.github/workflows/ci.yml  Build, migraciones, pruebas y Gitleaks (sección 31)
db/
  pgaudit.sql         Configuración de auditoría de PostgreSQL (sección 18)
docs/
  arquitectura/     Las diez figuras de la sección 13 del manual, en PlantUML
    fig01-casos-de-uso.puml
    fig02-componentes.puml
    fig03-clases-dominio.puml
    fig04-secuencia-inscripcion.puml
    fig05-secuencia-pago.puml
    fig06-estados.puml
    fig07-actividad-semestre.puml
    fig08-entidad-relacion.puml
    fig09-despliegue.puml
    fig10-infraestructura-ambientes.puml
  calidad/
    catalogo-requisitos.md    Los 20 requisitos RF y RNF (sección 9)
    matriz-trazabilidad.md    Trazabilidad completa y catálogo de casos (sección 12.3)
    matriz-riesgos.md         Los 10 riesgos RK (sección 17.2)
    plan-de-pruebas.md        Plan de pruebas PP-SCE-001 (sección 21 y Anexo H)
  gobierno/
    metodologia-de-trabajo.md Cómo trabajamos: cadencia, roles y definición de terminado
    plan-de-trabajo.md        Calendario por fases y backlog priorizado
    roles-y-raci.md           Los seis roles con personas asignadas
    registro-de-cambios.md    Solicitudes de cambio CC (sección 16)
    actas/                    Actas de aceptación de fase y de sprint
```

---

## Levantar el ambiente de desarrollo

Requisitos: Node 24 y PostgreSQL (el manual fija 16; se probó con 18). En macOS: `brew install node postgresql@18`.

```bash
# 1. Base de datos y usuario de la aplicación (una sola vez, como superusuario)
psql -d postgres -c "CREATE ROLE sce_app LOGIN PASSWORD 'sce_dev' CREATEDB"
psql -d postgres -c "CREATE DATABASE sce OWNER sce_app"

# 2. API
cd api
cp .env.example .env          # ajustar JWT_SECRET
npm install
npx prisma migrate dev        # crea las 21 tablas y las restricciones
npm run db:seed               # usuarios <rol>@sce.test, contraseña sce-dev-2026
npm test                      # casos de seguridad
npm run dev                   # API en http://localhost:3000

# 3. Auditoría con pgAudit (opcional en desarrollo; ver comentarios del script)
psql -d sce -f ../db/pgaudit.sql
```

Endpoints: `POST /auth/login`, `GET /auth/yo`, y `GET`/`POST` sobre `/facultades`, `/planes`, `/materias` y `/periodos` (alta solo para coordinación).

---

## Cómo leer los diagramas

Los archivos `.puml` son la **fuente** de las figuras 1 a 10 del manual, en texto plano y versionable. Se renderizan con cualquiera de estas vías:

```bash
# Local, con PlantUML instalado
plantuml -tsvg docs/arquitectura/*.puml

# Sin instalar nada: pegar el contenido en
# https://www.plantuml.com/plantuml
```

En Visual Studio Code, la extensión *PlantUML* los previsualiza con `Alt+D`.

---

## Trazabilidad con el manual

| Carpeta o archivo | Sección del manual | Evidencia auditable que satisface |
|---|---|---|
| `docs/arquitectura/*.puml` | 13.1 a 13.7 | Documentos de arquitectura: diagramas UML y de datos, tablas de componentes, entidades e infraestructura. |
| `api/prisma/schema.prisma` | 13.6 | Modelo lógico de datos de veintiuna entidades. |
| `api/prisma/migrations/` | 13.6, 15.1, 17.2 | Migraciones versionadas; reglas de integridad: expediente único, movimiento neto único, bitácora inmutable. |
| `docs/calidad/plan-de-pruebas.md` | 21 a 28, Anexo H | Plan de pruebas con casos, requisito, ambiente, resultado y evidencia. |
| `docs/gobierno/registro-de-cambios.md` | 12.4, 16 | Registro de solicitudes de cambio con análisis de impacto y aprobación. |
| `.github/workflows/ci.yml` | 29.1, 31 | Ejecuciones de CI vinculadas a cada pull request. |
| `db/pgaudit.sql` | 18, RNF-SEG-001 | Registro en el log de PostgreSQL de DDL, cambios de roles y escrituras sobre registros oficiales. |
| `docs/calidad/catalogo-requisitos.md` | 9 | Especificación de requisitos: catálogos RF y RNF. |
| `docs/calidad/matriz-trazabilidad.md` | 12.3 | Matriz de trazabilidad y resultados de prueba asociados. |
| `docs/calidad/matriz-riesgos.md` | 17.2 | Matriz de riesgos actualizada por fase y registro de tratamiento. |
| `docs/gobierno/metodologia-de-trabajo.md` | 11, 15, 16, 29 | Ciclo de vida, rituales y artefactos por fase. |
| `docs/gobierno/plan-de-trabajo.md` | 11.2, 39.1 | Plan de desarrollo por fase con calendario. |
| `docs/gobierno/roles-y-raci.md` | 1.2, 5.1, 5.3 | Organigrama funcional y matriz RACI con personas. |
| `docs/gobierno/actas/` | 10.4 | Actas de aceptación por fase, firmadas por Product Owner y QA. |

---

## Diferencias respecto del manual v2.0

Tres puntos en los que este repositorio va más allá del manual publicado. Ninguno cambia un requisito; los tres quedan sujetos al control de cambios de la sección 12.4 y pendientes de aprobación por Product Owner y QA.

1. **La matriz de trazabilidad se completó de 10 a 20 filas.** La Tabla 27 del manual cubre la mitad de los requisitos del catálogo. Las filas añadidas usan el criterio de verificación que el propio manual ya fija en las tablas 19 y 20.
2. **Se reconcilió el conjunto CS-SEG**, que el manual nombra con tres alcances distintos (01 a 04, 01 a 06 y 01 a 08). La reconciliación está explicada en `matriz-trazabilidad.md`, sección 4.
3. **Se incorporó la entidad `periodo`** al modelo de datos. La sección 13.6 declara veintiuna entidades y la Tabla 29 enumera veinte; `periodo` es la que falta, y es necesaria porque grupo, horario, inscripción y calificación dependen de ella.

---

## Convenciones

- Ramas según la sección 15.2: `feature/*` y `fix/*` se integran por pull request a `Desarrollo` (la rama `develop` del manual); `main` solo recibe desde `release/x.y.z`. `main` y `Desarrollo` están protegidas: pull request obligatorio, CI en verde y aprobación de otro integrante (sección 29).
- Commits con mensaje descriptivo; etiquetas SemVer por línea base de fase (secciones 15 y 32).
- Ningún secreto en el repositorio (sección 14.1 y riesgo RK-07).
- Ningún dato personal real fuera del ambiente piloto (sección 20.2 y riesgo RK-09).
