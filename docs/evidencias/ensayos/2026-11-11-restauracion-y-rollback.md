# Acta de restauración y de rollback ensayado — 11 de noviembre de 2026

**Fuente:** SCE-MC-001 v2.0, sección 34 (Tabla 56: "Acta de restauración con resultado" y "Ensayo de rollback antes de cada promoción a piloto"), sección 20.2, RNF-FIA-002 y CO-FIA-02.
**Modalidad:** ejecutado. Staging efímero local con la topología de la Fig. 9 (`scripts/staging.sh`), en el Mac de FJMP sobre Colima. **Sub-batch:** 13.2, issue #76.
**Participantes:** FJMP (DevOps). El asistente de IA declarado en `roles-y-raci.md` corrió los scripts y redactó el acta. No hubo observador independiente (NC-012).
**Estado:** para firma de FJMP.

Las etiquetas `v9.9.9-rc.1` y `v9.9.9-rc.2` son de ensayo y no existen en el repositorio. La primera corrida en GitHub Actions con etiquetas reales es `v1.0.0-rc.2` (13.6), y su resultado se agrega a la tabla del apartado 3.

## 1. Rollback ensayado (20.2)

| Campo | Valor |
|---|---|
| Commit de los scripts | `c32a2e352972` (rama `feature/76-candidato-release`) |
| Etiqueta anterior | `v9.9.9-rc.1`: imágenes `sce-api:local` (`sha256:0cffe22a00bd…`) y `sce-portal:local` |
| Etiqueta nueva | `v9.9.9-rc.2`: imágenes `sce-api:b13` (`sha256:798813e49317…`) y `sce-portal:b13`, con una migración más que la anterior |
| Secuencia | Despliegue de rc.1 → despliegue de rc.2 (respaldo previo y migración) → `scripts/rollback.sh` a rc.1 → despliegue de rc.2 otra vez |
| Respaldo usado | `/respaldos/antes-de-v9.9.9-rc.2-20261111T064643Z.dump`, el que dejó el despliegue de rc.2 |
| Humo de rc.1 tras el rollback | Salud de API y web, e inicio de sesión de los siete roles en API y portal |
| **RTO del rollback** | **25 s** (meta: menos de 4 h) |
| Después | rc.2 se volvió a desplegar y pasó la verificación completa: humo del Anexo D, Newman (177 peticiones, 384 aserciones, 0 fallas), TLS, ZAP pasivo, rechazos de la base, pgAudit y Great Expectations (33 expectativas, 0 incumplidas) |
| Resultado | **Aprobado** |

## 2. Restauración cronometrada (CO-FIA-02)

| Campo | Valor |
|---|---|
| Respaldo | `sce-20261111T065001Z.dump.age`, 59 374 bytes, SHA-256 `a4567a5fd040…`, 265 filas, etiqueta `v9.9.9-rc.2` (`scripts/respaldo.sh`) |
| Prueba negativa | El archivo no empieza con `PGDMP`, y una llave recién generada no lo descifra |
| Base restaurada | `sce` del servidor de base `sce-db`: se borró y se recreó, y se restauró con `pg_restore` tras descifrar con la llave de `~/keys/sce-respaldos.agekey` |
| Conteos | 22 tablas, 265 filas, **iguales** a los del respaldo |
| Después | pgAudit reactivado, migraciones sin cambios, API y portal arriba, salud ok y CD-DAT en verde |
| **RTO** | **12 s** (meta: menos de 4 h) |
| Cadena | Newman otra vez sobre la base restaurada (177 peticiones, 0 fallas); segundo respaldo `sce-20261111T065136Z.dump.age` con 359 filas; Great Expectations: 33 expectativas, 0 incumplidas. **RPO de la cadena: 95 s** entre los dos respaldos (meta: menos de 24 h) |
| Resultado | **Aprobado** |

**Defectos que encontró el ensayo y se corrigieron antes de este acta:**

- `respaldo.sh`: `age-keygen -o` no escribe sobre un archivo que ya existe; la prueba negativa ahora usa una llave en memoria.
- `restauracion.sh`: la comparación de conteos no pasaba las opciones a `psql` y comparaba la salida con formato.

## 3. Ensayos siguientes

| Fecha | Dónde | Etiqueta | RTO del rollback | RTO de la restauración | Resultado |
|---|---|---|---|---|---|
| 11-nov-2026 | Local | `v9.9.9-rc.2` | 25 s | 12 s | Aprobado |
| Pendiente (13.6) | Etapa 8, GitHub Actions | `v1.0.0-rc.2` | | | |
| Cada 12 h | `continuidad.yml` | commit de `main` | No aplica | En el resumen de la corrida | Requiere el secreto `AGE_IDENTIDAD` |

## 4. Firma

| Rol | Persona | Firma | Fecha |
|---|---|---|---|
| DevOps | Francisco Javier Martínez Peñas | | |
