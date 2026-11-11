# Inventario de ambientes — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 3.5, 13.7, 20 y 31; Tablas 30, 38 y 55; Fig. 9.
**Actualizado:** 10 de noviembre de 2026 (Batch 6, [#46](https://github.com/fjmp-dev/sce-control-escolar/issues/46); CC-018).

Es la referencia operativa de la sección 20. Cada despliegue a staging o piloto actualiza la tabla 1 y agrega una fila al registro de la sección 8.

---

## 1. Inventario (20.1, condición 6)

| Ambiente | Dónde | Etiqueta desplegada | Datos | Responsable de DevOps | Dirección |
|---|---|---|---|---|---|
| Desarrollo | Docker Compose local, sobre Colima | Rama de trabajo | Seed sintético, con la contraseña del README | FJMP | `http://localhost:3000` |
| Pruebas / integración | GitHub Actions, base efímera (etapas 4, 5 y 7) | Commit de cada corrida | Seed sintético | FJMP | Existe mientras dura la corrida |
| Staging | **Efímero, en GitHub Actions (CC-018):** `scripts/staging.sh` lo arma con la configuración de `infra/staging/`, lo verifica y lo destruye. La etapa 8 lo corre con una etiqueta; la 7, en cada pull request | Ninguna todavía | Seed sintético, con contraseña generada en cada corrida | FJMP | `https://localhost` dentro del runner, mientras dura la corrida |
| Piloto | Batches 13 y 14 | — | Reales | — | — |

## 2. Staging: topología (Fig. 9, Tabla 30)

La Tabla 30 pide para staging la misma etiqueta que irá a piloto, datos anonimizados, HTTPS, humo y carga; los servidores separados, el respaldo diario y el monitoreo son de la fila Piloto. Staging se arma en el runner con la topología de la Fig. 9: dos "servidores" en una red privada de Docker con direcciones fijas.

| Servidor | Corre | Expuesto | Configuración |
|---|---|---|---|
| Aplicación (`sce-app`) | `sce-proxy` (nginx 1.28), `sce-portal` y `sce-api`, por digest | 80 (solo redirige a HTTPS) y 443, con certificado autofirmado | `infra/staging/app/` |
| Base de datos (`sce-db`) | PostgreSQL 16 con pgAudit (CC-005) | Solo 5432 en la red privada | `infra/staging/db/` |

- **TLS (Tabla 38):** nginx ofrece solo TLS 1.2 y 1.3, con cifrados de secreto perfecto hacia adelante y HSTS. La API llega a la base por TLS y verifica su certificado (`sslaccept=strict`).
- **Acceso a la base restringido (Tabla 38):** `pg_hba.conf` admite solo al rol `sce_app`, solo desde el servidor de aplicación, solo por TLS y con SCRAM. El superusuario `postgres` no entra por red; solo por el socket local del contenedor.
- **Rutas del proxy:** `/` va al portal y `/api/` a la API, como dibuja la Fig. 9. Salvo `/salud` y el inicio de sesión, toda ruta pide sesión.
- **URL pública temporal (CC-018):** el webhook de Mercado Pago (Batch 9) y las sesiones de usabilidad (Batch 13) necesitan llegar desde fuera. Se abre un túnel gratuito de Cloudflare (`cloudflared`) hacia el proxy, solo mientras dura la prueba; el procedimiento se escribe en el batch que lo usa.
- **Registros:** pgAudit escribe en el registro de PostgreSQL. Lo que sirve de evidencia queda en el artefacto de la corrida (sección 8).

## 3. Secretos

Cada ambiente tiene los suyos y no se reutilizan entre ambientes (20.2). Ninguno se versiona (14.1-5).

**Staging no guarda secretos (CC-018):** `scripts/staging.sh` genera en cada corrida, con `openssl rand`, la clave del superusuario de la base, la del rol `sce_app`, la firma de los tokens y la contraseña de las cuentas sintéticas. Mueren con el ambiente y no se escriben en el registro.

**Regla de protección del ambiente `staging` de GitHub** (Settings → Environments):
- revisores requeridos PO y QA, que hoy son SJOM (`roles-y-raci.md`);
- "impedir la autoaprobación" activado;
- solo se despliega desde `develop` y `main`.

Quien lanza el despliegue no puede aprobarlo (31.2). El ambiente no necesita variables ni secretos.

> **Nota del 10 de noviembre de 2026:** esta regla no está configurada. El repositorio no tiene ningún environment (`gh api repos/fjmp-dev/sce-control-escolar/environments`: 0), y SJOM no revisa ni aprueba. El environment `staging` se crea en el sub-batch 11.4 con FJMP como revisor y con la autoaprobación permitida (NC-012). Este apartado se reescribe ahí.

## 4. Alta

No hay servidores que dar de alta. Lo único que se configura, una vez, es la regla de protección de la sección 3. El piloto sí tendrá servidores (Batches 13 y 14). Ahí `scripts/desplegar-staging.sh` se usa con `EN_APP` y `EN_DB` por SSH, y se documentan su alta y su certificado.

## 5. Despliegue (etapa 8 de la Tabla 53)

1. **Etiqueta** SemVer sobre un commit ya integrado en `develop`, `main` o `release/*`, con imágenes firmadas por la etapa 6: `git tag -a v0.2.0-rc.1 -m "..." <commit>` y `git push origin v0.2.0-rc.1`.
2. **Acta de promoción** en `docs/gobierno/actas/` que nombre la etiqueta, con el Anexo D.
3. **Lanzar** "8 Despliegue a staging" en Actions, desde `develop`, con la etiqueta y la ruta del acta.
4. **PO y QA aprueban** el despliegue en el ambiente `staging`.
5. **El workflow:**
   - comprueba la etiqueta y el acta;
   - verifica la firma de las imágenes del commit y les agrega la etiqueta SemVer;
   - arma staging con `scripts/staging.sh`, que despliega por digest con `scripts/desplegar-staging.sh`: respaldo previo, migraciones con registro, pgAudit antes y después de migrar, y datos sintéticos;
   - prueba los rechazos de la base y que pgAudit registró el DDL;
   - corre el humo del Anexo D con `scripts/verificar-staging.sh`;
   - guarda la evidencia y destruye el ambiente.
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
| (CC-005, Tabla 38) | Todas las contraseñas con SCRAM, conexiones de la aplicación solo con TLS y pgAudit activo. La base rechaza otra dirección, conexiones sin TLS, TLS 1.1 y al superusuario por red, y pgAudit registra el DDL de las migraciones | Automática |

**Repetir el humo:** cada corrida arma una base nueva, así que el bloqueo por intentos de la Tabla 15, que Newman provoca a propósito con la cuenta de administrador, no se arrastra de una corrida a otra.

## 6. Rollback (20.2)

Staging no conserva estado entre corridas: volver a una etiqueta anterior es lanzar la etapa 8 con ella y un acta que la nombre. La sección 20.1 pide un rollback verificado antes de promover a piloto. En el Batch 13 se ensaya dentro de una corrida: desplegar una etiqueta, migrar con la siguiente, restaurar el respaldo previo con `pg_restore` y volver a la anterior, con el tiempo medido (RTO).

## 7. Respaldos

- **Antes de cada despliegue,** `pg_dump` en formato personalizado al volumen `respaldos` del servidor de base. El rollback del Batch 13 lo usa.
- **Respaldo diario cifrado y restauración por periodo:** la Tabla 30 y la sección 20.2 los piden en piloto, que es persistente. En el Batch 13 se ensayan el cifrado y la restauración cronometrada.

## 8. Registro de despliegues (31.2)

Cada corrida deja el artefacto `despliegue-staging-<etiqueta>` (90 días): registro del despliegue y de las migraciones, rechazos de la base, humo, Newman, testssl, ZAP y consultas de la base. Al cerrar la fase, se copia a `docs/evidencias/` (Tabla 62).

| Fecha | Etiqueta | Digest de la API | Digest del portal | Responsable | Resultado | Corrida |
|---|---|---|---|---|---|---|
| | | | | | | |

## 9. Staging en cada pull request

La etapa 7 corre `scripts/staging.sh` en cada pull request y en cada integración, con las imágenes de la corrida y sin etiqueta. Es el mismo ambiente y la misma verificación que la etapa 8, así que un cambio que rompa staging no llega a la etiqueta.
