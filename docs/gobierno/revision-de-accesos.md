# Revisión periódica de accesos — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tabla 38 (mínimo privilegio y revisión de accesos), Tabla 57 y Tabla 62; PA-SCE-001, Parte B (control de accesos y bitácora). **Sub-batch:** 13.3, issue #76. **Vigente desde:** 11 de noviembre de 2026. **Responsable:** Seguridad (hoy FJMP; NC-012).

## 1. Qué se revisa y cuándo

| Acceso | Fuente de la revisión | Cuándo |
|---|---|---|
| Colaboradores del repositorio y su permiso, invitaciones y llaves de despliegue | `seguridad-operativa.yml`, paso 1; o `gh api` a mano (`gh` del propietario) | Día 1 de cada mes, y en el día hábil siguiente a una alta, baja o cambio de rol |
| Environments `staging` y `piloto`: revisores, ramas y etiquetas permitidas, secretos | Igual | Igual, y antes de cada promoción a piloto |
| Protección de `develop` y `main`; _rulesets_ de `release/**` y `v*` | Igual | Igual |
| Roles con `LOGIN` en la base | `api/prisma/verificacion/roles-login.sql`: cero filas | En cada corrida de staging (`scripts/staging.sh`) y cada mes |
| Cuentas del SCE por rol | `api/prisma/verificacion/accesos.sql` | Cada mes |
| Muestreo de la bitácora | `api/prisma/verificacion/muestreo-bitacora.sql` | Cada mes, sobre el staging efímero del flujo |
| Paquetes de GHCR (`sce-api`, `sce-portal`) | Configuración del paquete en GitHub; el `GITHUB_TOKEN` no los lista | Cada mes, a mano |

El flujo `seguridad-operativa.yml` abre un issue "Revisión de accesos AAAA-MM" con lo que encontró. Seguridad confirma cada acceso, revisa el muestreo y cierra el issue con su decisión. Un acceso que nadie justifica se retira el mismo día. El issue y su artefacto se conservan como dice `matriz-retencion.md`.

El acceso directo a la base y la cuenta de emergencia están en `acceso-directo-a-la-base.md`.

## 2. Primera revisión, 11 de noviembre de 2026

Hecha a mano con `gh api`, en solo lectura, y con `roles-login.sql` sobre el staging local. La del flujo empieza el 1 de diciembre.

| Acceso | Encontrado | Decisión |
|---|---|---|
| `fjmp-dev` | Propietario (_admin_) | Se mantiene: DevOps y aprobador de ambientes |
| `samuel0rtiz` | _write_ desde el 10 de noviembre. No ha revisado ni aprobado ningún pull request (NC-012) | **Pendiente de FJMP.** Se recomienda bajarlo a _read_ mientras no revise: _write_ le deja empujar a ramas sin protección y crear etiquetas fuera de los _rulesets_. Si va a revisar, se queda en _write_ y se anota aquí |
| Invitaciones pendientes | Ninguna | — |
| Llaves de despliegue | Ninguna | — |
| Environment `staging` | Revisor `fjmp-dev`; sin secretos | Correcto: el staging efímero genera sus secretos en cada corrida |
| Environment `piloto` | Revisor `fjmp-dev`; solo etiquetas `v*.*.*`; **sin secretos** | Falta dar de alta los secretos del piloto con `scripts/alta-piloto.sh` (lo corre FJMP) |
| Secretos del repositorio | Ninguno | Falta `AGE_IDENTIDAD`, la llave de los respaldos (`cifrado-y-claves.md`). Sin ella, `continuidad.yml` respalda pero no restaura el respaldo anterior |
| `develop` y `main` | Siete checks obligatorios, también para administradores; cero aprobaciones (NC-012) | Se mantiene hasta que haya un revisor independiente |
| Roles con `LOGIN` en la base | `postgres`, `sce_app` y `sce_monitor`, sin atributos de más; `roles-login.sql`: cero filas | Correcto |
| Paquetes de GHCR | No se pudieron listar: el token de `gh` no tiene el permiso `read:packages` | FJMP los revisa con `gh auth refresh -s read:packages` |

## 3. Registro

| Fecha | Quién revisó | Hallazgos | Issue |
|---|---|---|---|
| 11-nov-2026 | FJMP con asistente de IA | `samuel0rtiz` con _write_ sin revisar; faltan `AGE_IDENTIDAD` y los secretos del piloto; paquetes sin revisar | Este documento |
