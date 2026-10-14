# Matriz de riesgos — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 17 (tablas 35, 36 y 37).
**Proceso:** ISO 31000:2018 — establecer el contexto, identificar, analizar, evaluar, tratar, monitorear y comunicar.
**Alcance:** las amenazas que puedan impedir el piloto, corromper el expediente o incumplir requisitos Must.
**Estado:** línea base de fase 0. Revisión al cierre de cada fase y antes de la promoción a piloto.

---

## 1. Criterios de evaluación del nivel

| Probabilidad \ Impacto | Bajo | Medio | Alto |
|---|---|---|---|
| **Alta** | Medio | Alto | Alto |
| **Media** | Bajo | Medio | Alto |
| **Baja** | Bajo | Bajo | Medio |

---

## 2. Matriz

| ID | Riesgo | Nivel | Tratamiento | Responsable | Estado en fase 0 |
|---|---|---|---|---|---|
| RK-01 | Duplicación o pérdida de expediente al cambiar de plantel. | **Alto** | Mitigar: restricción de unicidad en matrícula, pruebas RNF-DAT-001 y revisión de migraciones. | Desarrollo | Diseñado. Índice único parcial declarado en `docs/datos/restricciones.sql`; sin implementación hasta la fase 2. |
| RK-02 | Pago cobrado que no se refleja o cargo duplicado. | **Alto** | Mitigar: clave de idempotencia, conciliación diaria y pruebas de integración con doble webhook. | Desarrollo y Caja | Diseñado. Clave de idempotencia única y movimiento neto único en el esquema; control documentado en la Figura 5. |
| RK-03 | Acceso cruzado entre roles, por ejemplo un alumno que altera calificaciones. | **Alto** | Mitigar: guards por rol, pruebas CS-SEG y bitácora obligatoria. | Seguridad | Diseñado. Casos CS-SEG-01 a 06 definidos en la matriz de trazabilidad; bitácora inmutable declarada. |
| RK-04 | Caída o lentitud durante la semana de inscripción. | **Alto** | Mitigar: pruebas de carga previas, monitoreo de percentil 95 y ventana de mantenimiento fuera de inscripción. | DevOps | Abierto. Sin ambiente piloto; casos CR-REN-01 a 05 definidos, no ejecutables en fase 0. |
| RK-05 | Choques de horario no detectados. | Medio | Mitigar: regla en el dominio y pruebas automatizadas CF-HOR. | Desarrollo | Diseñado. Regla ubicada en el dominio académico (Figura 2) y restricción de rango en la base. |
| RK-06 | Ampliación no controlada del alcance hacia aula virtual o aplicación nativa. | Medio | Evitar: control de cambios y política de alcance. | Product Owner | Vigente. La sección 3 del manual excluye esos módulos de la primera versión. |
| RK-07 | Secretos expuestos en el repositorio o en registros. | **Alto** | Mitigar: gitleaks en el pipeline, secretos en el gestor y rotación tras incidente. | DevOps | Abierto. El repositorio existe desde el 14 de octubre de 2026; gitleaks pendiente de configurar en el pipeline. |
| RK-08 | Indisponibilidad de la pasarela de pagos. | Medio | Transferir y mitigar: estado pendiente, reintentos controlados y acuerdo de servicio con el proveedor. | Desarrollo | Diseñado. Estado `pendiente` y reintento documentados en la Figura 5. |
| RK-09 | Uso de datos personales reales en ambientes no productivos. | **Alto** | Mitigar: datos sintéticos o anonimizados y revisión previa a cada despliegue. | Seguridad | Vigente sin exposición. No existen ambientes ni datos reales en fase 0. |
| RK-10 | Ausencia de actas de aceptación por fase. | Medio | Mitigar: puerta de aceptación con Product Owner y QA antes de cerrar la fase. | QA | **Abierto.** No existe acta de cierre de fase 0. Es el riesgo más próximo a materializarse. |

> Los riesgos de nivel Alto que permanezcan abiertos bloquean el paso a piloto hasta que se verifique la mitigación o el Product Owner acepte formalmente el riesgo con un plan fechado (manual, sección 17.2).

---

## 3. Resumen

| Nivel | Cantidad | IDs |
|---|---|---|
| Alto | 6 | RK-01, RK-02, RK-03, RK-04, RK-07, RK-09 |
| Medio | 4 | RK-05, RK-06, RK-08, RK-10 |
| Bajo | 0 | — |

---

## 4. Herramientas de apoyo

| Herramienta o técnica | Uso | Producto que genera |
|---|---|---|
| Matriz de probabilidad e impacto (ISO 31000) | Clasificación y priorización de riesgos. | Registro de riesgos con nivel y tratamiento. |
| Análisis de causa raíz con cinco porqués | Riesgos materializados y no conformidades. | Ficha de causa y acción correctiva. |
| Análisis modal de fallos y efectos (AMFE) | Módulos críticos: inscripción y pagos. | Tabla de modos de fallo con número de prioridad de riesgo. |
| Modelado de amenazas STRIDE | Riesgos de seguridad por componente. | Lista de amenazas y controles asociados. |
| GitHub Projects con etiqueta de riesgo | Seguimiento operativo de acciones de mitigación. | Tablero con responsable y fecha objetivo. |
| Hoja de cálculo de registro de riesgos | Histórico y evolución del nivel por fase. | Registro versionado en el repositorio de evidencias. |

---

## 5. Pendientes antes del cierre de fase 0

1. Levantar el acta de aceptación de fase 0 firmada por Product Owner y QA — cierra **RK-10**.
2. Configurar gitleaks y la protección de la rama `main` en el repositorio — reduce **RK-07**.
3. Asignar nombre de persona a los roles de QA, Seguridad y DevOps, que el manual deja como instancia — condición para que los responsables de esta matriz sean verificables.
