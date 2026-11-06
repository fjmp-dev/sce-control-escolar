# Anexo C. Plantilla de solicitud de cambio

**Fuente:** SCE-MC-001 v2.0, secciones 12.4 y 16 (Tabla 34). Se usa en el issue con etiqueta `cambio` y, para cambios de arquitectura o de datos, se copia a `docs/gobierno/cambios/`.

| Campo | Valor |
|---|---|
| Identificador | CC-`<NNN>` |
| Título | |
| Tipo (Tabla 34) | Menor · Normal · Mayor o Must · Emergencia · Documental |
| Solicitante | |
| Fecha de solicitud | |
| Módulo afectado | |
| Aprobación mínima | Según la Tabla 34 |

### Descripción y motivo

### Análisis de impacto

- Alcance:
- Esfuerzo:
- Riesgos de datos:
- Seguridad:
- Rendimiento:
- Requisitos tocados:
- Ambiente destino:

### Decisión

Aprobado o rechazado, con fecha y responsable según la RACI. Quien aprueba no es quien solicitó el cambio.

### Implementación

Rama `feature/` o `fix/`, pull request, integración continua en verde y pruebas Must del área afectada. Si cambia la arquitectura o el modelo de datos, primero se actualizan las figuras (Tabla 54).

### Cierre

Despliegue al ambiente acordado, verificación, trazabilidad actualizada y, si aplica, nueva etiqueta y línea base.

**Tipos y aprobación mínima (Tabla 34):**

| Tipo | Ejemplo | Aprobación mínima |
|---|---|---|
| Menor | Texto de interfaz o corrección cosmética sin regla de negocio | Desarrollo con revisión de pull request |
| Normal | Nueva historia Should, ajuste de oferta semestral o mejora de reporte | Product Owner y QA |
| Mayor o Must | Cambio en inscripción, promedio, pagos, roles o bitácora | Product Owner, QA y Seguridad cuando toca RNF-SEG |
| Emergencia | Defecto crítico en piloto que afecta expediente, pago o acceso | Product Owner y DevOps, con documentación posterior en 24 horas |
| Documental | Actualización del manual SCE-MC-001 | Según el control del documento de la sección 1 |
