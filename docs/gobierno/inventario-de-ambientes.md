# Inventario de ambientes — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 3.5, 13.7, 20 y 31; Tablas 30, 38 y 55; Fig. 9.
**Actualizado:** 11 de noviembre de 2026 (sub-batch 13.1, [#76](https://github.com/fjmp-dev/sce-control-escolar/issues/76); CC-018 y CC-022. Sub-batch 14.1, [#77](https://github.com/fjmp-dev/sce-control-escolar/issues/77): despliegue de `v1.0.0` al piloto de ensayo).

Es la referencia operativa de la sección 20. Cada despliegue a staging o al piloto de ensayo actualiza la tabla 1 y agrega una fila al registro de la sección 8.

---

## 1. Inventario (20.1, condición 6)

| Ambiente | Dónde | Etiqueta desplegada | Datos | Responsable de DevOps | Dirección |
|---|---|---|---|---|---|
| Desarrollo | Docker Compose local, sobre Colima | Rama de trabajo | Seed sintético, con la contraseña del README | FJMP | `http://localhost:3000` |
| Pruebas / integración | GitHub Actions, base efímera (etapas 4, 5 y 7) | Commit de cada corrida | Seed sintético | FJMP | Existe mientras dura la corrida |
| Staging | **Efímero, en GitHub Actions (CC-018):** `scripts/staging.sh` lo arma con la configuración de `infra/staging/`, lo verifica y lo destruye. La etapa 8 lo corre con una etiqueta candidata `vX.Y.Z-rc.N`; la 7, en cada pull request | Ver sección 8 | Seed sintético, con contraseña generada en cada corrida | FJMP | `https://localhost` dentro del runner, mientras dura la corrida |
| Piloto de ensayo | **Efímero, en GitHub Actions (CC-022):** el mismo `scripts/staging.sh` con `AMBIENTE=piloto`, en el environment `piloto`, con la etiqueta final `vX.Y.Z` | `v1.0.0`, el 11 de noviembre de 2026 (sección 8) | **Ninguno:** `SEMILLA=0`; solo los roles y el usuario técnico de CC-015 | FJMP | `https://localhost` dentro del runner, mientras dura la corrida |
| Piloto institucional | No existe: sin facultad, usuarios ni servidores. La fase 5 queda preparada, no ejecutada (14.2) | — | — | — | — |

## 2. Staging: topología (Fig. 9, Tabla 30)

La Tabla 30 pide para staging la misma etiqueta que irá a piloto, datos anonimizados, HTTPS, humo y carga; los servidores separados, el respaldo diario y el monitoreo son de la fila Piloto. Staging y el piloto de ensayo se arman en el runner con la topología de la Fig. 9: base y aplicación en una red privada de Docker con direcciones fijas, y el proxy en su propio proyecto, en la red de frontera (CC-022).

| Servidor | Corre | Expuesto | Configuración |
|---|---|---|---|
| Proxy (`sce-proxy`) | nginx 1.28, en la red de frontera `sce-frontera` | 80 (solo redirige a HTTPS) y 443. En staging, certificado autofirmado; en el piloto de ensayo, firmado por la CA del ambiente | `infra/staging/proxy/` |
| Aplicación (`sce-app`) | `sce-portal` y `sce-api`, por digest, en la red de frontera y en la privada | Nada: solo los alcanza el proxy | `infra/staging/app/` |
| Base de datos (`sce-db`) | PostgreSQL 16 con pgAudit (CC-005) | Solo 5432 en la red privada | `infra/staging/db/` |

- **TLS (Tabla 38):** nginx ofrece solo TLS 1.2 y 1.3, con cifrados de secreto perfecto hacia adelante y HSTS. La API llega a la base por TLS y verifica su certificado (`sslaccept=strict`).
- **Acceso a la base restringido (Tabla 38):** `pg_hba.conf` admite solo al rol `sce_app`, solo desde el servidor de aplicación, solo por TLS y con SCRAM. El superusuario `postgres` no entra por red; solo por el socket local del contenedor.
- **Rutas del proxy:** `/` va al portal y `/api/` a la API, como dibuja la Fig. 9. Salvo `/salud` y el inicio de sesión, toda ruta pide sesión. `/api/metricas` responde 404 desde fuera: solo lo lee Prometheus por la red privada (13.3).
- **Plantillas:** cada directorio de `infra/staging/` trae su `.env.example`; el `.env` real lo escribe el script de despliegue, con permisos 600, y nunca se versiona.
- **URL pública temporal (CC-018):** las sesiones de usabilidad (13.5) necesitan llegar desde fuera. Se abre un túnel gratuito de Cloudflare (`cloudflared`) hacia el proxy, solo mientras dura la prueba. Ya no hay webhook de Mercado Pago (CC-020).
- **Registros:** pgAudit escribe en el registro de PostgreSQL. Lo que sirve de evidencia queda en el artefacto de la corrida (sección 8).

## 3. Secretos

Cada ambiente tiene los suyos y no se reutilizan entre ambientes (20.2). Ninguno se versiona (14.1-5).

**Staging no guarda secretos (CC-018):** `scripts/staging.sh` genera en cada corrida, con `openssl rand`, la clave del superusuario de la base, la del rol `sce_app`, la firma de los tokens y la contraseña de las cuentas sintéticas. Mueren con el ambiente y no se escriben en el registro.

**Regla de protección del ambiente `staging` de GitHub** (Settings → Environments), configurada el 10 de noviembre de 2026 en el sub-batch 11.4:
- revisor requerido: FJMP, que ocupa PO y QA desde que SJOM dejó el proyecto (`roles-y-raci.md` §6);
- autoaprobación permitida (`prevent_self_review: false`), porque no hay una segunda persona;
- sin variables ni secretos.

**Environment `piloto` de GitHub (CC-022),** creado el 11 de noviembre de 2026 en el sub-batch 13.1:
- misma regla de revisor que `staging` (FJMP, autoaprobación permitida; NC-012);
- solo despliega etiquetas `v[0-9]*.[0-9]*.[0-9]*` (política de despliegue por etiqueta);
- secretos propios: `JWT_SECRET`, `CONTRASENA_SEMILLA`, `CA_CRT` y `CA_KEY`. Los genera `scripts/alta-piloto.sh` sin mostrarlos. El flujo de la etapa 8 rechaza un secreto corto o que aparezca en el repositorio y deja solo su huella SHA-256 en el resumen de la corrida (36.1, criterio 7). La clave de la base del piloto de ensayo se genera en cada corrida, porque la base nace y muere con ella.

El manual pide que quien lanza el despliegue no lo apruebe (31.2) y que el revisor sea otra persona. Con una sola persona no se cumple, y la desviación está declarada en NC-012. Cuando haya un segundo revisor, se agrega y se activa "impedir la autoaprobación".

> **Corrección del 10 de noviembre de 2026.** Antes este apartado describía como configurada una regla que no existía: el repositorio no tenía environments. Ahora describe la regla real.

## 4. Alta

No hay servidores que dar de alta (CC-018 y CC-022). Lo que se configura una vez, y su fecha:

| Qué | Cómo | Fecha |
|---|---|---|
| Environment `staging` con revisor | Settings → Environments (sección 3) | 10 de noviembre de 2026 |
| Environment `piloto` con revisor y política de etiquetas | `gh api -X PUT .../environments/piloto` (sección 3) | 11 de noviembre de 2026 |
| Secretos del environment `piloto` | `bash scripts/alta-piloto.sh` | Dados de alta por FJMP el 11 de noviembre de 2026 a las 11:39 UTC: `JWT_SECRET`, `CONTRASENA_SEMILLA`, `CA_CRT` y `CA_KEY`. Huella SHA-256 de la CA: `FE:FC:95:A7:…:62:E0:95:CE`. El asistente no puede escribir secretos |
| _Rulesets_ de `release/**` y `v*` | `infra/github/` | Aplicados por FJMP el 11 de noviembre de 2026, a las 05:38 (UTC-6): ramas `release/**` (id 27027338) y etiquetas `v*` (id 27027346), sin excepciones. El asistente no puede cambiar la configuración del repositorio. `release/1.0.0` se cortó minutos antes, en `5385940`, sin cambios directos |
| Workflows programados: `continuidad.yml` (12 h), `seguridad-operativa.yml` (mensual) y el cron de `zap-completo.yml` | GitHub solo programa los workflows de la rama por defecto (`main`) | Desde que `release/1.0.0` se fusione a `main` (14.1). Mientras, se lanzan a mano sobre `release/1.0.0`: un disparador de pull request que solo toca el propio archivo los registra, con el job saltado |

Si algún día hay servidores reales, `scripts/desplegar-staging.sh` ya admite `EN_APP`, `EN_DB` y `EN_PROXY` por SSH; su alta y su certificado se documentarían aquí.

## 5. Despliegue (etapa 8 de la Tabla 53)

1. **Acta de promoción** en `docs/gobierno/actas/acta-promocion-<etiqueta>.md`, con el Anexo D. Se versiona antes de etiquetar, porque el workflow la lee del commit etiquetado.
2. **Etiqueta** SemVer anotada sobre un commit de `release/*`, `develop` o `main` cuyas imágenes ya firmó la etapa 6: `git tag -a v0.4.0-rc.1 -m "..." <commit>` y `git push origin v0.4.0-rc.1`.
3. **El push de la etiqueta lanza** "8 Despliegue a staging y piloto de ensayo" (`on: push: tags: ['v*']`). GitHub usa el `staging.yml` del commit etiquetado. Para repetir una corrida o desplegar una etiqueta anterior, se lanza a mano con `workflow_dispatch`, con la etiqueta y la ruta del acta.
   - `vX.Y.Z-rc.N` va a `staging`, con `acta-promocion-<etiqueta>.md`.
   - `vX.Y.Z` va al environment `piloto` (CC-022), con `acta-liberacion-<etiqueta>.md`. Antes, el flujo comprueba por API la puerta 1 (las etapas 1 a 5 y 7 en verde sobre el commit) y la 2 (el mismo commit pasó la etapa 8 en staging con una etiqueta candidata), y los secretos del piloto. La etiqueta final va sobre el commit del último candidato. Las etiquetas anteriores a 13.1 (hasta `v0.4.0`) traen el `staging.yml` viejo, que solo reacciona a `-rc.N`.
4. **El revisor aprueba** el despliegue en el ambiente `staging` o `piloto` (hoy FJMP; NC-012).
5. **El workflow:**
   - comprueba la etiqueta y el acta;
   - verifica la firma de las imágenes del commit y les agrega la etiqueta SemVer;
   - arma staging con `scripts/staging.sh`, que despliega por digest con `scripts/desplegar-staging.sh`: respaldo previo, migraciones con registro, pgAudit antes y después de migrar, y datos sintéticos;
   - prueba los rechazos de la base y que pgAudit registró el DDL;
   - corre el humo del Anexo D con `scripts/verificar-staging.sh`, que deja la tabla del apartado 1 con su evidencia en `anexo-d.md`; en el piloto de ensayo, en vez de sesiones y Newman, comprueba la salud y que el ambiente quedó vacío (`piloto-vacio.sql`);
   - guarda la evidencia y destruye el ambiente.
   - Ningún paso se hace desde una máquina local (31.2).

**Lo que verifica el humo y su correspondencia con el Anexo D:**

| Anexo D | Comprobación | Estado |
|---|---|---|
| Inicio de sesión por cada rol | `scripts/humo.sh` a través del proxy, en la API y en el portal | Automática |
| Inscripción: una confirmada y un rechazo de cada motivo | Newman, carpeta Contratos | Automática |
| Consulta de horario y calificaciones | Newman: Mis inscripciones con su horario y CI-CAL-01 | Automática |
| Pago con doble notificación sin duplicar (en sandbox antes de CC-020) | Newman: CI-PAG-01 con el aviso repetido de la pasarela simulada | Automática |
| `/salud` de API y de web | `scripts/humo.sh` | Automática |
| HTTPS con TLS 1.2 o superior | testssl.sh: ningún protocolo anterior a TLS 1.2. Además, HTTP redirige a HTTPS, HSTS presente y ZAP pasivo sin alertas altas | Automática |
| Sin matrículas reales del piloto | `api/prisma/verificacion/sin-datos-reales.sql`, cero filas | Automática |
| Accesos revisados, sin cuentas obsoletas | `api/prisma/verificacion/accesos.sql` va al registro; Seguridad lo revisa y firma el acta | Manual con apoyo |
| (CC-005, Tabla 38) | Todas las contraseñas con SCRAM, conexiones de la aplicación solo con TLS y pgAudit activo. La base rechaza otra dirección, conexiones sin TLS, TLS 1.1 y al superusuario por red, y pgAudit registra el DDL de las migraciones | Automática |

**Repetir el humo:** cada corrida arma una base nueva, así que el bloqueo por intentos de la Tabla 15, que Newman provoca a propósito con la cuenta de administrador, no se arrastra de una corrida a otra.

## 6. Rollback (20.2)

Staging no conserva estado entre corridas. Desde `vX.Y.Z-rc.2`, la etapa 8 ensaya el rollback dentro de la misma corrida, y falla si no existe la candidata anterior (`staging.yml`):

1. Despliega la candidata anterior (`rc.N-1`), con sus imágenes firmadas por digest.
2. Despliega la nueva. `desplegar-staging.sh` deja antes el respaldo `antes-de-<nueva>-<fecha>.dump`.
3. `scripts/rollback.sh` detiene la API y el portal, restaura ese respaldo con `pg_restore`, despliega la anterior y corre el humo.
4. Vuelve a desplegar la nueva y sigue la verificación completa.

El tiempo del paso 3 es el RTO del rollback (meta: menos de 4 h). Queda en `reportes/staging/rollback.md` y en el resumen de la corrida.

En un servidor real, el procedimiento es el mismo paso 3: `AMBIENTE_ENV` con `EN_DB`, `EN_APP`, `EN_PROXY`, `DIR` y `URL` del ambiente, y `scripts/rollback.sh <etiqueta-anterior> <imagen-api> <imagen-portal>`.

## 7. Respaldos y restauración (20.2, Tabla 56; CO-FIA-02)

| Qué | Cuándo | Dónde | Retención |
|---|---|---|---|
| `pg_dump` previo al despliegue, en claro | Antes de cada despliegue | Volumen `respaldos` del servidor de base | La del volumen; en staging, la corrida |
| `scripts/respaldo.sh`: `pg_dump -Fc` cifrado con age, conteos por tabla y registros de los contenedores cifrados | Cada 12 h (`continuidad.yml`) | Artefacto `respaldo` de la corrida | 35 días |
| Copia fuera del sitio | Los domingos, o a mano con `fuera_del_sitio` | Release `respaldos` del repositorio, solo archivos `.age` e `inventario.csv` | Un año: semestre en curso más uno anterior (`matriz-retencion.md`) |

**`continuidad.yml` es la operación recurrente ensayada** (CC-022). Cada corrida hace lo siguiente:

1. Levanta un staging efímero con las imágenes del commit.
2. Restaura el respaldo de la corrida anterior con `scripts/restauracion.sh`. Mide el RTO, compara los conteos por tabla y corre CD-DAT.
3. Genera actividad con Newman.
4. Respalda de nuevo y mide el RPO contra el respaldo anterior (meta: menos de 24 h; con la programación, unas 12 h).

La contraseña de la semilla viaja cifrada junto al respaldo, porque la base restaurada guarda sus hashes.

El secreto `AGE_IDENTIDAD` del repositorio lo dio de alta FJMP el 11 de noviembre de 2026 a las 11:40 UTC, desde `~/keys/sce-respaldos.agekey`. Sin él, el flujo respalda pero no restaura, y lo avisa.

Las claves y la prueba negativa están en `cifrado-y-claves.md`. Las contingencias de pasarela y ventanilla, en `contingencias.md`.

El monitoreo, las alertas y la disponibilidad mensual están en `monitoreo.md`. La revisión de accesos, en `revision-de-accesos.md`, y el acceso directo a la base, en `acceso-directo-a-la-base.md`.

## 8. Registro de despliegues (31.2)

Cada corrida deja el artefacto `despliegue-staging-<etiqueta>` o `despliegue-piloto-<etiqueta>` (90 días): registro del despliegue y de las migraciones, rechazos de la base, humo, Newman, testssl, ZAP y consultas de la base. Al cerrar la fase, se copia a `docs/evidencias/` (Tabla 62).

| Fecha | Etiqueta | Digest de la API | Digest del portal | Responsable | Resultado | Corrida |
|---|---|---|---|---|---|---|
| 11-nov-2026 01:31 (CST) | `v0.4.0-rc.1` | `sha256:d188e5be2716f8268264ea3ef27edd0938ab38a4bcaef1b08c032ae1c35353ae` | `sha256:7a67e67bf6dfdfcacf31ebff6c6acacdb12d74aeb9e2ff3d8c84bc326b30fcf0` | FJMP | Aprobado: humo, Newman, TLS, ZAP pasivo y base en verde; 5 migraciones aplicadas | [42979816446](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42979816446) |
| 11-nov-2026 07:15 (CST) | `v1.0.0-rc.1` | `sha256:44963d08de9ceb28a584b8ae1a794f0b9fc434515fb42bf70671bda9898574ba` | `sha256:3a1f2c3fe40411260076c2f9a19f92a1760c9f6a3cb08623b5a01450a305f200` | FJMP | Aprobado: humo del Anexo D, Newman, CO-FLE-01, TLS, ZAP pasivo, base, matriz Must y humo k6 en verde; 6 migraciones aplicadas | [43027397938](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027397938) |
| 11-nov-2026 11:52 (CST) | `v1.0.0`, piloto de ensayo en `https://localhost` (efímero, dentro del runner) | `sha256:44963d08de9ceb28a584b8ae1a794f0b9fc434515fb42bf70671bda9898574ba` | `sha256:3a1f2c3fe40411260076c2f9a19f92a1760c9f6a3cb08623b5a01450a305f200` | FJMP | Liberado: puertas 1 y 2, secretos del piloto, humo del Anexo D sin usuarios, TLS, base, ZAP pasivo y humo k6 en verde; 6 migraciones, `SEMILLA=0`. Rollback sin ensayo en staging (NC-022) | [43071987661](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43071987661) |

## 9. Staging en cada pull request

La etapa 7 corre `scripts/staging.sh` en cada pull request y en cada integración, con las imágenes de la corrida y sin etiqueta. Es el mismo ambiente y la misma verificación que la etapa 8, así que un cambio que rompa staging no llega a la etiqueta.
