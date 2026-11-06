# Modelo de amenazas STRIDE — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 37 ("riesgos de seguridad por componente"), sección 18 y Tabla 28.
**Versión:** 1.0, 6 de noviembre de 2026 (Batch 2). Se actualiza en cada batch que agrega un componente: expediente (4), inscripción (5), académico (7 y 8), pagos (9), trámites (10), reportes (11) y portal (3).

Cubre lo que ya existe: gateway, identidad y acceso, catálogos, bitácora y persistencia. **S**uplantación, **T**ampering (alteración), **R**epudio, **I**nformación expuesta, **D**enegación de servicio, **E**levación de privilegios.

| Componente | Tipo | Amenaza | Control | Evidencia | Riesgo que queda |
|---|---|---|---|---|---|
| Identidad | S | Fuerza bruta de contraseñas | Bloqueo tras 5 fallos en 15 minutos, contado desde la bitácora; bcrypt | `sesiones.spec.ts` | Ver D de identidad |
| Identidad | S | Descubrir qué cuentas existen | Mismo mensaje y misma comparación de bcrypt exista o no la cuenta, esté o no bloqueada | `sesiones.spec.ts` compara las respuestas. **El tiempo no se mide con una prueba** | La medición de tiempos queda sin prueba automatizada |
| Identidad | S | Token robado o reutilizado | Expiración de 60 minutos (15 para el administrador), sesión máxima de 8 horas, revocación con `sesion_version` | CS-SEG-07 | Un token robado vale hasta que expire o se cierre la sesión. El portal lo guardará en cookie `httpOnly` (Batch 3) |
| Identidad | S | Token forjado o sin firma | HS256 fijo y secreto de al menos 32 caracteres, verificado al arrancar | `sesiones.spec.ts` | — |
| Identidad | S | Sesión de administrador secuestrada | Sesión corta y confirmación de contraseña para operar sobre cuentas | `usuarios.spec.ts` | **No hay segundo factor** (ver abajo) |
| Identidad | D | Bloquear a propósito la cuenta de otro | La ventana es de 15 minutos y se libera sola | `sesiones.spec.ts` | Un atacante que conozca un correo puede mantenerla bloqueada. Límite por origen en nginx (Batch 13) |
| Identidad | E | Un rol opera lo de otro | Guard global con denegación por omisión; roles leídos de la base en cada petición | CF-ROL-01, CI-AUTH-01 con la matriz completa | — |
| Identidad | E | El administrador se eleva o deja al sistema sin administradores | No puede cambiar su propio acceso; lleva bitácora | `usuarios.spec.ts` | Un administrador sí puede crear otro. Queda en bitácora para la revisión de Seguridad |
| Identidad | E | Usar el usuario técnico | Inactivo, sin roles, hash imposible, fuera de la lista y no modificable por la API | `sesiones.spec.ts`, `usuarios.spec.ts` | Acceso directo a la base (Batch 13) |
| Gateway | T | Entrada malformada o inyección | DTO con lista blanca, sin caracteres de control; Prisma parametriza | CS-SEG-05 con ZAP, `gateway.spec.ts` | Se repite con cada endpoint nuevo |
| Gateway | I | Trazas o secretos en errores | Filtro global: código de negocio y mensaje fijo, sin eco de la entrada | CS-SEG-05, `gateway.spec.ts` | — |
| Gateway | I | Datos sensibles en registros | Solo método, plantilla de ruta, estado, duración, id de usuario y código; en errores, nombre y pila sin mensaje | CS-SEG-08, `gateway.spec.ts` y comprobación tras el escaneo de ZAP | El id de usuario es un identificador interno, no un dato personal directo |
| Gateway | D | Cuerpos enormes | Límite del lector del cuerpo, que responde 413, y largo máximo por campo | `gateway.spec.ts` | Sin límite de peticiones por origen hasta nginx (Batch 13). También permitiría llenar la bitácora con accesos fallidos |
| Catálogos | T | Altas fuera de rol | Solo administrador (facultades y planes) o coordinación (materias y periodos) | CF-ROL-01 | — |
| Bitácora | T | Alterar o borrar asientos | Disparadores que rechazan UPDATE, DELETE y TRUNCATE | Control de RK-03 | Un superusuario de la base puede desactivarlos. pgAudit en staging (Batch 6) |
| Bitácora | R | Negar una operación | Autor, acción, valor anterior y fecha, en la misma transacción que la operación: si la bitácora falla, la operación se revierte | `seguridad.spec.ts`, `usuarios.spec.ts` | — |
| Bitácora | I | Secretos en el valor anterior | Solo id, correo, estado y roles; nunca el hash | `usuarios.spec.ts` | Correos en bitácora: retención a definir (Batch 13) |
| Persistencia | I | Conexión o credenciales expuestas | Secretos fuera del código; Gitleaks y Trivy | CS-SEG-08 | Acceso a la base por ambiente (Batch 6) |
| Persistencia | D | Saturar conexiones | Pool de Prisma por omisión | — | Se mide en carga (Batch 13) |

## Decisiones abiertas

- **Segundo factor para el administrador.** PA-SCE-001, Parte B, pide "control adicional para roles privilegiados". Se implementó sesión corta y confirmación de contraseña, sin dependencia ni columna nueva. Un segundo factor (TOTP) sería más fuerte y requeriría un CC. Lo decide Seguridad.
- **Recuperación de contraseña.** No existe: el manual no la pide. Hoy, quien olvida su contraseña depende de otra alta. El administrador conoce la contraseña inicial que asigna, y el usuario puede cambiarla, pero nada lo obliga. Exigir el cambio en el primer acceso requeriría una columna y un CC.
- **Qué roles son privilegiados.** Solo `administrador`. Control escolar y caja manejan datos sensibles; Seguridad decide si se suman (una línea en `identidad/dominio/usuario.ts`).
