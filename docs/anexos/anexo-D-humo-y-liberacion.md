# Anexo D. Lista de verificación de humo en staging y de liberación a piloto

**Fuente:** SCE-MC-001 v2.0, secciones 18.2, 20, 31.2 y 36.

**Etiqueta:** `vX.Y.Z` · **Ambiente:** `<...>` · **Fecha:** `<...>` · **Responsable de DevOps:** `<...>`

---

## 1. Humo en staging (puerta 2 de la sección 20.1)

| Verificación | Resultado | Evidencia |
|---|---|---|
| Inicio de sesión por cada rol: alumno, profesor, control escolar, coordinación, caja, dirección y administrador | | |
| Inscripción: una confirmada y un rechazo de cada motivo | | |
| Consulta de horario y calificaciones | | |
| Pago en sandbox, con doble notificación sin duplicar | | |
| `/salud` de API y de web responde | | |
| HTTPS con TLS 1.2 o superior | | |
| Sin matrículas reales del piloto en el ambiente (18.2, RK-09) | | |
| Accesos revisados; sin cuentas obsoletas (sección 18) | | |

## 2. Puertas de promoción a piloto (sección 20.1), en orden

| # | Condición | Resultado | Evidencia |
|---|---|---|---|
| 1 | Integración continua en verde sobre el tag candidato, con pruebas unitarias, de integración y de seguridad básica | | |
| 2 | Despliegue y prueba de humo en staging | | |
| 3 | Prueba de rendimiento sobre el tag candidato con resultado dentro de las metas de RNF-REN | | |
| 4 | Acta de aceptación de la fase firmada por Product Owner y QA | | |
| 5 | Riesgos de nivel Alto mitigados o aceptados por escrito | | |
| 6 | Inventario actualizado con tag, fecha, responsable de DevOps y dirección del piloto, y rollback verificado | | |

## 3. Criterios de liberación (sección 36.1)

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | Etiqueta SemVer creada y notas de versión publicadas | | |
| 2 | Pruebas Must en verde y prueba de humo en staging satisfactoria | | |
| 3 | Prueba de rendimiento dentro de las metas de RNF-REN | | |
| 4 | Cero defectos críticos y riesgos de nivel Alto mitigados o aceptados por escrito | | |
| 5 | Acta de aceptación de la fase firmada por Product Owner y QA | | |
| 6 | Inventario de ambiente actualizado y procedimiento de rollback verificado | | |
| 7 | Credenciales de pago del piloto configuradas y verificadas, distintas de las de sandbox | | |

No se despliega a piloto desde una máquina local (sección 31.2).

## 4. Decisión

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Product Owner | | | | |
| QA | | | | |
| DevOps | | | | |
