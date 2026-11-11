# Acceso directo a la base de datos — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tabla 38 ("acceso a la base restringido"); PA-SCE-001, Parte B (seguridad operativa). **Sub-batch:** 13.3, issue #76. **Vigente desde:** 11 de noviembre de 2026. **Responsable:** Seguridad (FJMP); ejecuta DevOps (FJMP, NC-012).

## 1. Quién entra y cómo

| Rol de PostgreSQL | Para qué | Cómo entra | Qué puede |
|---|---|---|---|
| `sce_app` | La API y las migraciones | Por red, solo desde el rango del servidor de aplicación, solo TLS y SCRAM (`pg_hba.conf`, `entrada.sh`) | Dueña de la base `sce`. No es superusuario |
| `sce_monitor` | postgres-exporter (`infra/monitoreo`) | Igual que `sce_app`, máximo 3 conexiones | Solo `pg_monitor`: estadísticas, sin leer tablas del SCE |
| `postgres` | Respaldos, restauración, pgAudit y acceso de emergencia | **Solo por el socket local** del servidor de base (`peer`); por red se rechaza (`staging.sh` lo comprueba en cada corrida) | Superusuario |

Ninguna persona tiene un rol propio en la base. Para consultar datos se usa la API con el rol del SCE que corresponde.

## 2. Acceso de emergencia (DBA)

Solo para incidentes (`respuesta-a-incidentes.md`) o restauraciones (`inventario-de-ambientes.md`, apartado 7):

1. Se abre o se cita el incidente o el cambio que lo justifica.
2. DevOps entra al servidor de base y usa `docker exec -it -u postgres sce-db psql -d sce`. No hay otra vía.
3. Toda sentencia DDL y de roles queda en el registro de pgAudit (`db/pgaudit.sql`). Las escrituras sobre las tablas de registro oficial quedan como auditoría de objeto.
4. Al terminar, se anota en el incidente qué se consultó o cambió, y se adjunta el extracto del registro de `sce-db` de esa ventana.
5. Una corrección de datos académicos o de pagos **no se hace por SQL**. Pasa por la API, con su bitácora, o por un cambio aprobado (Anexo C) con su prueba.

## 3. Verificación

| Qué | Cómo | Cuándo |
|---|---|---|
| Solo hay los tres roles con LOGIN, sin atributos de más | `api/prisma/verificacion/roles-login.sql` (cero filas) | Cada mes en `seguridad-operativa.yml` y en cada corrida de staging |
| El superusuario no entra por red; otra dirección, sin TLS y TLS 1.1 se rechazan | `scripts/staging.sh`, "rechazos" | Cada corrida de staging (etapas 7 y 8) |
| pgAudit registra el DDL | `scripts/staging.sh`, "pgAudit" | Cada corrida de staging |
| Muestreo de la bitácora del SCE | `api/prisma/verificacion/muestreo-bitacora.sql` | Cada mes en `seguridad-operativa.yml`; lo revisa Seguridad |

## 4. Retención de los registros

Los registros de `sce-db`, incluido pgAudit, se guardan cifrados con cada respaldo (`matriz-retencion.md`, fila "Registros y bitácora del piloto").
