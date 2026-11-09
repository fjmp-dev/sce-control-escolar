# Inventario de ambientes — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 3.5, 13.7, 20 y 31; Tablas 30, 38 y 55; Fig. 9.
**Actualizado:** 8 de noviembre de 2026 (Batch 6, [#46](https://github.com/fjmp-dev/sce-control-escolar/issues/46)).

Es la referencia operativa de la sección 20. Cada despliegue a staging o piloto actualiza la tabla 1 y agrega una fila al registro de la sección 8.

---

## 1. Inventario (20.1, condición 6)

| Ambiente | Dónde | Etiqueta desplegada | Datos | Responsable de DevOps | Dirección |
|---|---|---|---|---|---|
| Desarrollo | Docker Compose local, sobre Colima | Rama de trabajo | Seed sintético, con la contraseña del README | FJMP | `http://localhost:3000` |
| Pruebas / integración | GitHub Actions, base efímera (etapas 4, 5 y 7) | Commit de cada corrida | Seed sintético | FJMP | Existe mientras dura la corrida |
| Staging | **Pendiente del proveedor** (sección 33, `fichas-de-proveedores.md`). Configuración en `infra/staging/`, ensayada en cada corrida de la etapa 7 | Ninguna todavía | Seed sintético, con contraseña propia del ambiente | FJMP | Pendiente del dominio |
| Piloto | Batches 13 y 14 | — | Reales | — | — |

## 2. Staging: topología (Fig. 9, Tabla 30)

| Servidor | Corre | Expuesto | Configuración |
|---|---|---|---|
| Aplicación (`sce-app`) | `sce-proxy` (nginx 1.28), `sce-portal` y `sce-api`, por digest | 80 (solo redirige a HTTPS y atiende el reto de Let's Encrypt) y 443; SSH con llave | `infra/staging/app/` |
| Base de datos (`sce-db`) | PostgreSQL 16 con pgAudit (CC-005) | Solo 5432 en la red privada; SSH solo a través del servidor de aplicación | `infra/staging/db/` |

- **TLS (Tabla 38):** nginx ofrece solo TLS 1.2 y 1.3, con cifrados de secreto perfecto hacia adelante y HSTS. La API llega a la base por TLS y verifica su certificado (`sslaccept=strict`).
- **Acceso a la base restringido (Tabla 38):** `pg_hba.conf` admite solo al rol `sce_app`, solo desde el servidor de aplicación, solo por TLS y con SCRAM. El superusuario `postgres` no entra por red; solo por el socket local del contenedor.
- **Rutas del proxy:** `/` va al portal y `/api/` a la API, como dibuja la Fig. 9. La API queda expuesta para el humo, Newman y el webhook de Mercado Pago (Batch 9). Salvo `/salud` y el inicio de sesión, toda ruta pide sesión.
- **Registros:** cada contenedor guarda hasta 10 archivos de 50 MB. pgAudit escribe en el registro de PostgreSQL. La retención de la bitácora es del Batch 13.

## 3. Secretos y variables

Cada ambiente tiene los suyos y no se reutilizan entre ambientes (20.2). Ninguno se versiona (14.1-5).

**Ambiente `staging` de GitHub** (Settings → Environments):

| Nombre | Tipo | Qué es | Cómo se genera |
|---|---|---|---|
| `STAGING_SSH_KEY` | Secreto | Llave privada del usuario `sce` en los dos servidores | `ssh-keygen -t ed25519 -N '' -C sce-staging` |
| `STAGING_SSH_KNOWN_HOSTS` | Secreto | Huellas de los dos servidores; el despliegue no acepta otras | `ssh-keyscan` desde la red privada, comprobadas en la consola del proveedor |
| `DATABASE_URL` | Secreto | `postgresql://sce_app:<clave>@<ip privada de la base>:5432/sce?schema=public&sslmode=require&sslcert=/certs/db.crt&sslaccept=strict` | La clave es la de `SCE_APP_PASSWORD` |
| `JWT_SECRET` | Secreto | Firma de los tokens | `openssl rand -hex 32` |
| `CONTRASENA_SEMILLA` | Secreto | Contraseña de las cuentas sintéticas de staging, distinta de la del README | `openssl rand -base64 18` |
| `DOMINIO` | Variable | Nombre del servidor de aplicación | DNS del dominio elegido |
| `STAGING_APP_IP` | Variable | IP pública del servidor de aplicación | Consola del proveedor |
| `STAGING_DB_IP` | Variable | IP privada del servidor de base | Consola del proveedor |

**Regla de protección del ambiente:** revisores requeridos PO y QA, que hoy son SJOM (`roles-y-raci.md`), con "impedir la autoaprobación" activado. Solo se despliega desde `develop` y `main`. Quien lanza el despliegue no puede aprobarlo (31.2).

**`.env` del servidor de base** (`/opt/sce-db/.env`, permisos 600): `POSTGRES_PASSWORD` y `SCE_APP_PASSWORD` con `openssl rand -hex 32`; `RED_APP` es la IP privada del servidor de aplicación con `/32`; `NOMBRE_DB` y `ESCUCHA` son la IP privada de la base. Las claves en hexadecimal no necesitan escaparse en la URL.

## 4. Alta de los servidores

Se hace una vez, con el proveedor elegido. Los dos servidores llevan Ubuntu 24.04 LTS, Docker Engine con el plugin de Compose, el usuario `sce` en el grupo `docker`, SSH solo con llave y sin acceso de `root`.

1. **Red y cortafuegos.** Una red privada para los dos. Servidor de aplicación: entrada 22, 80 y 443. Servidor de base: ninguna entrada pública.
2. **Base.** Copiar `infra/staging/db/` a `/opt/sce-db`, escribir su `.env` y correr `docker compose up -d --build`. El certificado de la base se genera en el primer arranque.
3. **Dominio.** Registro A del dominio a la IP pública del servidor de aplicación.
4. **Certificado de Let's Encrypt:**
   ```sh
   docker run --rm -p 80:80 -v /opt/sce/certificados:/etc/letsencrypt certbot/certbot:v4.2.0 \
     certonly --standalone -d "$DOMINIO" -m <correo del responsable> --agree-tos -n
   ```
5. **Renovación diaria** (cron del usuario `sce`):
   ```sh
   docker run --rm -v /opt/sce/certificados:/etc/letsencrypt -v /opt/sce/acme:/var/www/acme certbot/certbot:v4.2.0 \
     renew --webroot -w /var/www/acme --quiet && docker exec sce-proxy nginx -s reload
   ```
6. **GitHub.** Las variables y secretos de la sección 3, y la regla de protección.
7. **Primer despliegue** (sección 5) y registro en la sección 8.

## 5. Despliegue (etapa 8 de la Tabla 53)

1. **Etiqueta** SemVer sobre un commit ya integrado en `develop`, `main` o `release/*`, con imágenes firmadas por la etapa 6: `git tag -a v0.2.0-rc.1 -m "..." <commit>` y `git push origin v0.2.0-rc.1`.
2. **Acta de promoción** en `docs/gobierno/actas/` que nombre la etiqueta, con el Anexo D.
3. **Lanzar** "8 Despliegue a staging" en Actions, desde `develop`, con la etiqueta y la ruta del acta.
4. **PO y QA aprueban** el despliegue en el ambiente `staging`.
5. **El workflow:**
   - comprueba la etiqueta y el acta;
   - verifica la firma de las imágenes del commit y les agrega la etiqueta SemVer;
   - despliega por digest con `scripts/desplegar-staging.sh`: respaldo previo, migraciones con registro, pgAudit antes y después de migrar, y datos sintéticos;
   - corre el humo del Anexo D con `scripts/verificar-staging.sh`.
   - Ningún paso se hace desde una máquina local (31.2).

**Lo que verifica el humo y su correspondencia con el Anexo D:**

| Anexo D | Comprobación | Estado |
|---|---|---|
| Inicio de sesión por cada rol | `scripts/humo.sh` a través del proxy, en la API y en el portal | Automática |
| Inscripción: una confirmada y un rechazo de cada motivo | Newman, carpeta Contratos | Automática |
| Consulta de horario y calificaciones | Newman: oferta y choques. Calificaciones desde el Batch 8 | Parcial |
| Pago en sandbox, con doble notificación sin duplicar | — | Batch 9 |
| `/salud` de API y de web | `scripts/humo.sh` | Automática |
| HTTPS con TLS 1.2 o superior | testssl.sh: ningún protocolo anterior a TLS 1.2. Además, HTTP redirige a HTTPS, HSTS presente y ZAP pasivo sin alertas altas | Automática |
| Sin matrículas reales del piloto | `api/prisma/verificacion/sin-datos-reales.sql`, cero filas | Automática |
| Accesos revisados, sin cuentas obsoletas | `api/prisma/verificacion/accesos.sql` va al registro; Seguridad lo revisa y firma el acta | Manual con apoyo |
| (CC-005, Tabla 38) | Todas las contraseñas con SCRAM, conexiones de la aplicación solo con TLS y pgAudit activo | Automática |

**Repetir el humo:** Newman prueba a propósito una confirmación de contraseña equivocada con la cuenta de administrador. Cinco corridas en menos de 15 minutos la bloquean, que es el control de la Tabla 15 (`MAX_FALLOS`). Si hace falta repetir, hay que esperar 15 minutos.

## 6. Rollback (20.2)

1. Volver a lanzar la etapa 8 con la etiqueta anterior y un acta que la nombre.
2. Si las migraciones de la etiqueta nueva no son compatibles hacia atrás, hay que restaurar antes el respaldo previo del despliegue fallido, que el registro nombra. En el servidor de base:
   ```sh
   docker exec -u postgres sce-db pg_restore --clean --if-exists -d sce /respaldos/antes-de-<etiqueta>-<fecha>.dump
   ```

**Pendiente:** la sección 20.1 pide un rollback verificado antes de promover a piloto. Se ensaya en el Batch 13, junto con la restauración cronometrada (RTO).

## 7. Respaldos

- **Antes de cada despliegue,** `pg_dump` en formato personalizado al volumen `respaldos` del servidor de base.
- **Respaldo diario cifrado y prueba de restauración por periodo:** la Tabla 30 y la sección 20.2 los piden en piloto. Se montan en el Batch 13.

## 8. Registro de despliegues (31.2)

Cada corrida deja el artefacto `despliegue-staging-<etiqueta>` (90 días). Al cerrar la fase, se copia a `docs/evidencias/` (Tabla 62).

| Fecha | Etiqueta | Digest de la API | Digest del portal | Responsable | Resultado | Corrida |
|---|---|---|---|---|---|---|
| | | | | | | |

## 9. Ensayo sin servidores

`scripts/ensayo-staging.sh` levanta los dos "servidores" en una red de Docker con direcciones fijas, con un certificado autofirmado, y corre el mismo despliegue y el mismo humo. Además prueba lo que la base debe rechazar:
- otra dirección;
- una conexión sin TLS;
- TLS 1.1;
- el superusuario por red.

También comprueba que pgAudit registró el DDL de las migraciones. La etapa 7 lo corre en cada pull request y en cada integración, con las mismas imágenes.
