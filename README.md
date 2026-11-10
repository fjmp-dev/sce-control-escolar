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
- Auditoría de base de datos con pgAudit (`db/pgaudit.sql`), activa en staging junto con SCRAM y TLS (CC-005).
- API NestJS por capas (Fig. 2, Tabla 28): gateway con códigos de error de negocio y `/salud`, identidad con sesiones revocables y bloqueo por intentos, autorización por los seis roles y el administrador, bitácora y catálogos institucionales.
- Pruebas automatizadas: dominio sin base de datos; Supertest sobre PostgreSQL 16 efímero (CI-MIG-01, CI-AUTH-01, CF-ROL-01, CS-SEG-07, CD-DAT-01 y 04); Newman (contratos y CS-SEG-04) y OWASP ZAP (CS-SEG-05) contra Compose.
- Portal Next.js (Fig. 9): inicio y cierre de sesión, navegación por rol y pantallas de usuarios, catálogos, expedientes, inscripción, oferta y horario de cada rol, con pruebas de Vitest, Cypress, axe y Lighthouse.
- Pipeline de GitHub Actions con las etapas 1 a 8 de la Tabla 53, incluida la puerta de calidad de SonarQube (Tabla 51) y las imágenes firmadas. La 8 despliega a staging solo con etiqueta SemVer, acta y aprobación de PO y QA.
- Oferta y horarios (RF-003, Batch 7): coordinación abre el periodo, define grupos sin traslape de aula ni de profesor y publica la oferta; el alumno solo ve la oferta publicada y su horario, y el profesor sus grupos.
- Staging con la topología de la Fig. 9 (`infra/staging/`, `docs/gobierno/inventario-de-ambientes.md`), ensayado en cada corrida; los servidores esperan la decisión del proveedor.

Pendiente de fase 1, para cerrarla: revisión y fusión de los pull requests, manual v2.1 y etiqueta `v0.1.0`. Ver `docs/gobierno/actas/acta-aceptacion-fase-1.md`, apartado 9.

**Tablero y backlog:** [issues del repositorio](https://github.com/fjmp-dev/sce-control-escolar/issues), agrupados por sprint en [hitos](https://github.com/fjmp-dev/sce-control-escolar/milestones). Los issues #1 a #22 corresponden uno a uno con el backlog de `docs/gobierno/plan-de-trabajo.md`; los cambios al manual se registran con la etiqueta `cambio` (#23 a #28).

---

## Estructura

```
web/                Portal Next.js (Fig. 9): nunca toca la base de datos ni expone el token al navegador
  app/                    Páginas por rol, /salud y estilos
  componentes/            Formularios, tabla, avisos y navegación accesibles (28.1)
  lib/                    Llamadas a la API, acciones de servidor y tipos generados del OpenAPI
  proxy.ts                Sesión: redirige sin token y renueva el que está por vencer
  test/                   Vitest y React Testing Library
  cypress/                Extremo a extremo, axe y demostración por rol
api/                NestJS + Prisma (sección 3.6)
  prisma/
    schema.prisma         Veintiuna entidades (sección 13.6, Tabla 29)
    migrations/           init + restricciones que Prisma no expresa de forma nativa
    seed.mts              Datos sintéticos de desarrollo, pruebas y staging (en staging, con contraseña propia)
  src/
    gateway/              Validación, errores con código de negocio, registros JSON y /salud
    identidad/            Sesiones, usuarios y guard por rol (RF-008); dominio puro en dominio/
    expediente/           Expediente único, cambio de plantel y estatus (RF-001); inscripción de las Fig. 4 y 6 (RF-002)
    academico/            Catálogos; periodo y oferta (RF-003): grupos sin traslape, publicación y consulta por rol;
                          prerrequisitos, choques y cupo para la inscripción
    pagos/                Adeudo de la cuenta del alumno (Fig. 4); el resto llega en el Batch 9
    bitacora/             Servicio de bitácora (Tabla 28)
    persistencia/         Prisma y transacción compartida entre repositorios
  prisma/verificacion/    Consultas SQL de calidad de datos y muestreo de bitácora, junto a las migraciones (19.1)
  test/unitarias/         Dominio, sin base de datos; umbral de 80 %
  test/integracion/       CI-MIG, CI-AUTH, CF-ROL, CS-SEG y CD-DAT, sobre PostgreSQL efímero
  test/contratos/         Colección de Postman: contratos y CS-SEG-04
.github/workflows/ci.yml  Etapas 1 a 7 de la Tabla 53 (sección 31)
.github/workflows/staging.yml  Etapa 8: despliegue manual a staging con etiqueta SemVer y acta
infra/staging/            Servidores de staging (Fig. 9): nginx con TLS 1.2+, y PostgreSQL 16 con pgAudit, SCRAM y TLS
scripts/                  Puerta de calidad, Gitleaks, Newman, OWASP ZAP, humo, Cypress, Lighthouse, publicación de imágenes, y despliegue, humo y ensayo de staging
docker-compose.yml        Ambiente de pruebas: PostgreSQL 16, API y portal, con datos sintéticos
db/
  pgaudit.sql         Configuración de auditoría de PostgreSQL (sección 18)
docs/
  anexos/          Plantillas A a H del manual (sección 43)
  api/openapi.json  Contrato de la API, generado desde los decoradores (14.4)
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
    matriz-rol-endpoint.md    Rol por endpoint; la ejecutan CF-ROL-01 y CI-AUTH-01 (AU-15)
    stride.md                 Amenazas y controles por componente (Tabla 37)
    revision-cs-seg-08.md     Revisión manual de secretos en repositorio, registros y respuestas
    accesibilidad.md          Lista de 28.1, hallazgos y compatibilidad (AU-32)
    informe-fase-1.md         Tablero de la Tabla 59 y lista de QA de la fase
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
    respuesta-a-incidentes.md Procedimiento de la Tabla 38
    registro-aprobacion-manual-v2.0.md  Revisión y aprobación del manual (sección 1.2)
    actas/                    Actas de aceptación de fase y de sprint
    notas-version/            Notas de cada etiqueta vX.Y.Z (14.4)
```

---

## Ambiente de pruebas en un comando

Con Docker instalado:

```bash
docker compose up --build    # Portal en http://localhost:3000 y API en http://localhost:3001, migrada y con seed
```

Hay una cuenta sintética por rol: `alumno@`, `profesor@`, `control.escolar@`, `coordinacion@`, `caja@`, `direccion@` y `administrador@sce.test`, más `alumno.dos@sce.test`, todas con la contraseña `sce-dev-2026`. Hay diez expedientes sintéticos, de `2420001` a `2420010`; los dos alumnos con cuenta tienen los dos primeros. Para la inscripción, el periodo `2027A` está abierto con siete grupos: `2420001` acreditó Programación I en `2026B`, `2420002` tiene un adeudo sintético y el grupo `ISW-702-A` ya no tiene lugares. CI levanta este mismo ambiente en cada pull request, inicia sesión con los siete roles, ejecuta Newman, OWASP ZAP, Cypress, axe y Lighthouse, y escanea las imágenes con Trivy.

## Staging

Dos servidores, como la Fig. 9: nginx con TLS 1.2+ delante del portal y la API, y PostgreSQL 16 aparte, al que solo entra el servidor de aplicación, por TLS y con SCRAM. Se despliega desde Actions ("8 Despliegue a staging"), nunca desde una máquina local. Alta, secretos, despliegue y rollback: `docs/gobierno/inventario-de-ambientes.md`. Para ensayarlo sin servidores, después de `docker compose build`:

```bash
scripts/ensayo-staging.sh     # dos "servidores" en Docker, certificado autofirmado, mismo despliegue y mismo humo
```

## Levantar el ambiente de desarrollo

Requisitos: Node 24 y Docker. En macOS: `brew install node colima docker docker-compose` y `colima start`.

```bash
npm install                   # raíz: Prettier, Husky, lint-staged y Commitlint; activa los hooks de git
docker compose up --build     # PostgreSQL 16, API en :3001 y portal en :3000

cd api
npm install
npx prisma generate
cp .env.example .env          # con Colima, descomentar DOCKER_HOST y TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE
npm test                      # unitarias e integración; levanta su propio PostgreSQL 16 con Testcontainers

cd ../web
npm install                   # no descarga Cypress: corre en su imagen de Docker
npm run test:unitarias        # Vitest con cobertura
npm run dev                   # portal en :3000, contra API_URL (ver .env.example)
```

| Comando | Qué hace |
|---|---|
| `npm run format:check` (raíz) | Prettier |
| `npm run lint` (en `api/`) | ESLint con el plugin de TypeScript |
| `npm run test:unitarias` y `npm run test:integracion` (en `api/`) | Etapas 3 y 4, con cobertura lcov en `api/coverage/` |
| `ACTUALIZAR_OPENAPI=1 npm run test:integracion -- openapi` (en `api/`) | Regenera `docs/api/openapi.json` tras cambiar una ruta; CI falla si difiere |
| `npm run lint`, `npm run tipos` y `npm run test:unitarias` (en `web/`) | ESLint, TypeScript y Vitest del portal |
| `npm run tipos:api` (en `web/`) | Regenera los tipos del portal desde el OpenAPI |
| `scripts/humo.sh` | Salud e inicio de sesión de cada rol, contra Compose |
| `scripts/cypress.sh` | Extremo a extremo y axe, contra Compose; video y capturas en `reportes/cypress/` |
| `scripts/lighthouse.sh` | Lighthouse contra Compose; requiere Chrome. Informe en `reportes/lighthouse/` |
| `scripts/calidad-datos.sh` | Great Expectations contra la base de Compose; Data Docs en `reportes/calidad-datos/` |
| `scripts/newman.sh` | Contratos de API y CS-SEG-04, contra Compose; reporte HTML en `reportes/newman/` |
| `scripts/zap.sh` | OWASP ZAP (CS-SEG-05) contra Compose; informe en `reportes/zap/`. Tarda unos minutos |
| `scripts/gitleaks-historial.sh` | Gitleaks sobre todas las ramas y todo el historial |
| `scripts/sonar-puerta.sh <commit-base>` | Puerta de calidad de la Tabla 51 sobre el código nuevo. Antes, correr la etapa 4 para tener cobertura |
| `psql "$DATABASE_URL" -f api/prisma/verificacion/cd-dat-01.sql` | Consultas de calidad de datos; meta: cero filas |

Las etapas del pipeline y su evidencia están en `docs/calidad/plan-de-pruebas.md`, sección 4.1.

**Contrato de la API:** `docs/api/openapi.json`. **Quién usa cada ruta:** `docs/calidad/matriz-rol-endpoint.md`. Todo error responde `{ codigo, mensaje, campos? }`.

| Variable | Para qué | Por omisión |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | Obligatoria |
| `JWT_SECRET` | Firma de los tokens; al menos 32 caracteres, distinto por ambiente | Obligatoria; sin ella, la API no arranca |
| `SESION_MINUTOS` | Duración de un token | 60 |
| `SESION_PRIVILEGIADA_MINUTOS` | Duración de un token del administrador | 15 |
| `SESION_MAXIMA_MINUTOS` | Duración máxima de una sesión, con renovaciones | 480 |
| `PORT` | Puerto de la API (Fig. 9) | 3001 |
| `API_URL` (portal) | URL de la API, usada solo desde el servidor de Next.js | `http://localhost:3001` |
| `COOKIE_SEGURA` (portal) | `false` apaga `Secure` en la cookie de sesión; solo sin HTTPS | Encendida |


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
