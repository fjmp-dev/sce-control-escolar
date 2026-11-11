# Inventario de ambientes — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 3.5, 13.7, 20 y 31; Tablas 30, 38 y 55; Fig. 9.
**Actualizado:** 11 de noviembre de 2026 (sub-batch 13.1, [#76](https://github.com/fjmp-dev/sce-control-escolar/issues/76); CC-018 y CC-022).

Es la referencia operativa de la sección 20. Cada despliegue a staging o al piloto de ensayo actualiza la tabla 1 y agrega una fila al registro de la sección 8.

---

## 1. Inventario (20.1, condición 6)

| Ambiente | Dónde | Etiqueta desplegada | Datos | Responsable de DevOps | Dirección |
|---|---|---|---|---|---|
| Desarrollo | Docker Compose local, sobre Colima | Rama de trabajo | Seed sintético, con la contraseña del README | FJMP | `http://localhost:3000` |
| Pruebas / integración | GitHub Actions, base efímera (etapas 4, 5 y 7) | Commit de cada corrida | Seed sintético | FJMP | Existe mientras dura la corrida |
| Staging | **Efímero, en GitHub Actions (CC-018):** `scripts/staging.sh` lo arma con la configuración de `infra/staging/`, lo verifica y lo destruye. La etapa 8 lo corre con una etiqueta candidata `vX.Y.Z-rc.N`; la 7, en cada pull request | Ver sección 8 | Seed sintético, con contraseña generada en cada corrida | FJMP | `https://localhost` dentro del runner, mientras dura la corrida |
| Piloto de ensayo | **Efímero, en GitHub Actions (CC-022):** el mismo `scripts/staging.sh` con `AMBIENTE=piloto`, en el environment `piloto`, con la etiqueta final `vX.Y.Z` | Ninguna todavía (`v1.0.0` en 14.1) | **Ninguno:** `SEMILLA=0`; solo los roles y el usuario técnico de CC-015 | FJMP | `https://localhost` dentro del runner, mientras dura la corrida |
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
| Secretos del environment `piloto` | `bash scripts/alta-piloto.sh` | Pendiente: el clasificador de permisos del asistente bloquea escribir secretos; lo corre FJMP |
| _Rulesets_ de `release/**` y `v*` | `infra/github/` | Después de publicar `v0.4.0` (11.4), para no bloquear su acta en `release/0.4.0` |

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

Staging no conserva estado entre corridas: volver a una etiqueta anterior es lanzar la etapa 8 con ella y un acta que la nombre. La sección 20.1 pide un rollback verificado antes de promover a piloto. En el Batch 13 se ensaya dentro de una corrida: desplegar una etiqueta, migrar con la siguiente, restaurar el respaldo previo con `pg_restore` y volver a la anterior, con el tiempo medido (RTO).

## 7. Respaldos

- **Antes de cada despliegue,** `pg_dump` en formato personalizado al volumen `respaldos` del servidor de base. El rollback del Batch 13 lo usa.
- **Respaldo diario cifrado y restauración por periodo:** la Tabla 30 y la sección 20.2 los piden en piloto, que es persistente. En el Batch 13 se ensayan el cifrado y la restauración cronometrada.

## 8. Registro de despliegues (31.2)

Cada corrida deja el artefacto `despliegue-staging-<etiqueta>` o `despliegue-piloto-<etiqueta>` (90 días): registro del despliegue y de las migraciones, rechazos de la base, humo, Newman, testssl, ZAP y consultas de la base. Al cerrar la fase, se copia a `docs/evidencias/` (Tabla 62).

| Fecha | Etiqueta | Digest de la API | Digest del portal | Responsable | Resultado | Corrida |
|---|---|---|---|---|---|---|
| | | | | | | |

## 9. Staging en cada pull request

La etapa 7 corre `scripts/staging.sh` en cada pull request y en cada integración, con las imágenes de la corrida y sin etiqueta. Es el mismo ambiente y la misma verificación que la etapa 8, así que un cambio que rompa staging no llega a la etiqueta.
