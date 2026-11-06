# sce-control-escolar

Sistema de Control Escolar Universitario (SCE). Centro Universitario UAEM Tianguistenco, Ingeniería de Software.

| Campo | Valor |
|---|---|
| Manual de calidad | SCE-MC-001 v2.0, 16 de septiembre de 2026 |
| Fase actual | **1 — Núcleo institucional** (en desarrollo) |
| Autores | Francisco Javier Martínez Peñas · Samuel Jezoar Ortiz Martínez |
| Auditoría en curso | PA-SCE-001 v1.1, equipo Aerial Forge |
| Plan de construcción | [`docs/gobierno/plan-de-sistema.md`](docs/gobierno/plan-de-sistema.md), batches 0 a 14 |

---

## Estado del repositorio

La fase 0 (alcance validado) cerró con la línea base documental. La fase 1 arrancó con:

- Base de datos PostgreSQL con las veintiuna entidades de la sección 13.6, migradas con Prisma, y sus restricciones de integridad.
- Auditoría de base de datos con pgAudit (`db/pgaudit.sql`).
- API NestJS con autenticación JWT, autorización por los seis roles (RF-008) y catálogos institucionales.
- Pruebas automatizadas (CS-SEG-04, CS-SEG-06, CI-AUTH-01, CD-DAT-01 y 04) e integración continua con GitHub Actions en cada pull request.

Pendiente de fase 1: presentación en Next.js (incluido el panel de alta de usuarios) y SonarQube.

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
    usuarios/             Alta, baja y cambio de rol con bitácora (#22)
  test/                   Casos CS-SEG, CI-AUTH y CD-DAT automatizados
.github/workflows/ci.yml  Lint, build, migraciones, pruebas con cobertura, npm audit, Docker Compose, Trivy y Gitleaks (sección 31)
docker-compose.yml        Ambiente de pruebas: PostgreSQL 16 + API con datos sintéticos
db/
  pgaudit.sql         Configuración de auditoría de PostgreSQL (sección 18)
docs/
  anexos/          Plantillas A a H del manual (sección 43)
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
    registro-no-conformidades.md  No conformidades y acciones correctivas (sección 40)
    reglas-de-negocio.md      Reglas provisionales e inventario de reglas Must
    contradicciones-manual-v2.0.md  Contradicciones y vacíos del manual
  auditoria/        Respuestas del auditado a las solicitudes de PA-SCE-001
  evidencias/       Reportes que sustentan cada cierre de fase (Tabla 62)
  gobierno/
    plan-de-sistema.md        Orden de construcción por batches
    cambios/                  Solicitudes de cambio desde CC-007
    matriz-retencion.md       Retención documental (Tabla 62)
    fichas-de-proveedores.md  Proveedores (Tabla 55)
    mejora-continua.md        Lecciones y acciones de mejora (sección 41)
    metodologia-de-trabajo.md Cómo trabajamos: cadencia, roles y definición de terminado
    plan-de-trabajo.md        Calendario por fases y backlog priorizado
    roles-y-raci.md           Los seis roles con personas asignadas
    registro-de-cambios.md    Solicitudes de cambio CC (sección 16)
    registro-aprobacion-manual-v2.0.md  Revisión y aprobación del manual (sección 1.2)
    actas/                    Actas de aceptación de fase y de sprint
```

---

## Ambiente de pruebas en un comando

Con Docker instalado:

```bash
docker compose up --build    # PostgreSQL 16 + API en http://localhost:3000, migrada y con seed
```

Hay una cuenta sintética por rol: `alumno@`, `profesor@`, `control.escolar@`, `coordinacion@`, `caja@` y `direccion@sce.test`, todas con la contraseña `sce-dev-2026`. CI levanta este mismo ambiente en cada pull request, hace login con los seis roles y escanea la imagen con Trivy.

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

Endpoints: `POST /auth/login`, `GET /auth/yo`, y `GET`/`POST` sobre `/facultades`, `/planes`, `/materias` y `/periodos` (alta solo para coordinación); `GET`/`POST /usuarios` y `PATCH /usuarios/:id` para alta, baja y cambio de rol, solo para control escolar, con registro en bitácora.

`npm run test:cov` genera el reporte de cobertura lcov en `api/coverage/`; CI lo publica como artefacto `cobertura-lcov` en cada ejecución.

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

Las desviaciones aprobadas están en `docs/gobierno/plan-de-sistema.md`, sección 3, y sus solicitudes de cambio en `docs/gobierno/registro-de-cambios.md`. Las contradicciones del propio manual están en `docs/calidad/contradicciones-manual-v2.0.md`. Todas pasan a la siguiente versión del manual (issue #15).

Los render PNG de `docs/arquitectura/render/` de las Figuras 1, 2, 3, 4, 8 y 9 **están desactualizados** respecto a sus fuentes `.puml` del 5 de noviembre de 2026. Se regeneran en el Batch 1, con Docker.

---

## Convenciones

- Ramas según la sección 15.2 y la Tabla 31: `feature/<issue>-<descripcion>` y `fix/<issue>` se integran por pull request a `develop`; `main` solo recibe desde `release/x.y.z`. `main` y `develop` están protegidas: pull request obligatorio, CI en verde y aprobación de otro integrante (sección 29).
- Commits convencionales con identificador de requisito cuando aplique, por ejemplo `feat(expediente): RF-001 cambio de plantel` (Tabla 31); etiquetas SemVer por línea base de fase (secciones 15 y 32).
- Ningún secreto en el repositorio (sección 14.1 y riesgo RK-07).
- Ningún dato personal real fuera del ambiente piloto (sección 20.2 y riesgo RK-09).
