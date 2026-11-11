# Cifrado en reposo y custodia de claves — SCE

**Fuente:** SCE-MC-001 v2.0, secciones 18 y 20.2, Tablas 38 y 56; PA-SCE-001, Parte B (cifrado en reposo, claves y respaldo fuera del sitio). **Sub-batch:** 13.2, issue #76. **Vigente desde:** 11 de noviembre de 2026. **Responsable:** DevOps (FJMP); revisa Seguridad (FJMP, NC-012).

## 1. Qué se cifra en reposo

| Dato | Dónde | Cómo | Verificación |
|---|---|---|---|
| Respaldos de la base (`*.dump.age`) | Artefacto `respaldo` de `continuidad.yml` y release `respaldos` | age 1.x, X25519 y ChaCha20-Poly1305, para el destinatario de `infra/respaldos/destinatario.txt` | Prueba negativa en cada respaldo (apartado 3) |
| Registros de contenedores y pgAudit (`*.registros.gz.age`) | Junto a cada respaldo | El mismo destinatario | La misma |
| Contraseña de la semilla de la cadena de continuidad (`contrasena-semilla.age`) | Artefacto `respaldo` | El mismo destinatario | Solo se descifra con `AGE_IDENTIDAD` |
| Equipo de desarrollo y custodia de la llave privada | Mac de FJMP | FileVault | `fdesetup status`: "FileVault is On" (11 de noviembre de 2026) |
| Base de staging y del piloto de ensayo | Disco del runner de GitHub Actions | Ambiente efímero: se destruye al terminar el job (CC-018, CC-022) | No hay datos en reposo después de la corrida |
| Base del piloto institucional | Servidor de la universidad | **Pendiente:** cifrado de disco del proveedor; se pide en el alta del ambiente | Fuera de alcance (CC-022) |

Los volcados previos a cada despliegue (`antes-de-<etiqueta>-<fecha>.dump`) quedan **en claro** en el volumen `respaldos` del servidor de base, que solo ve quien entra a ese servidor. Sirven al rollback inmediato y en staging se destruyen con la corrida. En un servidor persistente, el volumen debe estar en un disco cifrado (apartado 4).

## 2. Inventario de claves y secretos

| Clave o secreto | Dónde vive | Quién la tiene | Rotación | Si se compromete |
|---|---|---|---|---|
| Llave privada age de respaldos | `~/keys/sce-respaldos.agekey` (permisos 600, disco con FileVault) y secreto `AGE_IDENTIDAD` del repositorio (pendiente de alta, `inventario-de-ambientes.md` apartado 7) | FJMP | Anual o al compromiso. La llave anterior se conserva hasta que venza el último respaldo que cifró (un año) | Generar otra con `age-keygen`, cambiar `destinatario.txt` y el secreto, y volver a cifrar o borrar los respaldos vigentes |
| Destinatario age (llave pública) | `infra/respaldos/destinatario.txt` | Público | Con la privada | No es secreta |
| `JWT_SECRET` de staging | Memoria del runner | Nadie | En cada corrida | Muere con la corrida |
| `JWT_SECRET` del piloto | Secreto del environment `piloto` | FJMP (`scripts/alta-piloto.sh`) | Al volver a correr el alta | Correr el alta otra vez: invalida todas las sesiones |
| `CONTRASENA_SEMILLA` | Staging: por corrida. Continuidad: cifrada con age en la cadena. Piloto: environment `piloto` | FJMP | Igual que `JWT_SECRET` | Igual que `JWT_SECRET` |
| CA del piloto (`CA_CRT`, `CA_KEY`) | Environment `piloto`. La llave solo toca el disco el tiempo de firmar (`staging.sh`) | FJMP | 400 días | Correr el alta otra vez y registrar la huella nueva en el acta |
| Contraseñas de PostgreSQL (`postgres`, `sce_app`) | Generadas en cada corrida (`staging.sh`) | Nadie | En cada corrida | Mueren con la corrida |
| Certificado TLS de la base | Generado al iniciar el contenedor | Nadie | En cada corrida | Muere con la corrida |
| Firma de imágenes | cosign sin llaves, con el OIDC de GitHub (Sigstore) | Nadie | No aplica | Revocar en GitHub el flujo que firma |
| `GITHUB_TOKEN` | Cada job | GitHub | Por job | Expira con el job |

**Reglas:**

- Ningún secreto va en el repositorio. Gitleaks lo revisa en la etapa 2 (CS-SEG-08).
- La etapa 8 del piloto rechaza un secreto que aparezca en el repositorio y solo registra su huella (CC-022).
- Ningún secreto pasa por el chat del asistente de IA: los de GitHub los da de alta FJMP con `gh secret set` (memoria del proyecto, 11 de noviembre de 2026).

## 3. Prueba negativa

`scripts/respaldo.sh` la corre en cada respaldo y falla si no se cumple:

1. El archivo no empieza con `PGDMP`, la firma de un volcado en claro de `pg_dump`.
2. Una llave age recién generada no lo descifra.

La restauración (`scripts/restauracion.sh`) es la prueba positiva: solo descifra con `AGE_IDENTIDAD`, y compara los conteos por tabla con los del respaldo. Resultado del 11 de noviembre de 2026 en `docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md`.

## 4. Para un servidor persistente

Si el piloto institucional llega a existir:

- disco cifrado en los dos servidores, incluido el volumen `respaldos`;
- la llave privada age fuera de ellos;
- `scripts/respaldo.sh` diario por `cron` hacia un almacenamiento fuera del sitio con acceso restringido.

Hasta entonces, `continuidad.yml` lo ensaya cada 12 horas (CC-022).
