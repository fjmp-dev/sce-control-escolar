# Anexo H. Plan de pruebas y plantilla de caso según ISO/IEC/IEEE 29119-3

**Fuente:** SCE-MC-001 v2.0, secciones 21 y 43.2.

El plan vigente es `docs/calidad/plan-de-pruebas.md` (PP-SCE-001). El catálogo de casos está en `docs/calidad/matriz-trazabilidad.md`, sección 3.

## Plantilla de caso

También disponible como plantilla de issue en GitHub.

| Campo | Contenido |
|---|---|
| Identificador | El del manual: CF, CI, CS, CR o CD, más módulo y número |
| Requisito | RF o RNF vinculado |
| Objetivo | Qué se demuestra |
| Técnica | Particiones, valores límite, tabla de decisión, transición de estados o basada en riesgo (Tabla 40) |
| Precondiciones | Estado de la base y usuario con el que se ejecuta |
| Datos | Entradas, incluidas las de borde |
| Pasos | Acciones numeradas |
| Resultado esperado | Código HTTP, estado o fila esperada |
| Resultado obtenido | Pasa o falla, con el valor observado |
| Ambiente y etiqueta | Local, pruebas, staging o piloto, y el commit o etiqueta |
| Herramienta | La que fija el manual para ese caso |
| Evidencia | Enlace a la ejecución o captura |
| Ejecutó y fecha | Persona y fecha |
