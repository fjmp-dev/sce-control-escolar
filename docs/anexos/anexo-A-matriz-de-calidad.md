# Anexo A. Matriz de calidad y criterios de evaluación

**Fuente:** SCE-MC-001 v2.0, sección 43.1 (Tabla 63). **Estado:** línea base; se completa con resultados en el Batch 12.

| Característica | Requisitos | Casos de prueba | Herramienta | Criterio Must |
|---|---|---|---|---|
| Adecuación funcional | RF-001 a RF-010 | CF-EXP, CF-INS, CF-HOR, CF-CAL, CF-PAG, CF-TRA | Cypress y Jest | Casos en verde y sin defecto crítico |
| Eficiencia de desempeño | RNF-REN-001 y 002 | CR-REN-01 a CR-REN-05 | JMeter y k6 | Percentil 95 dentro de la meta |
| Compatibilidad | RF-006 | CI-PAG-01 y matriz de navegadores | Newman y Playwright | Sin duplicidad de pago y flujos Must en verde |
| Capacidad de interacción | RNF-USU-001 | CF-INS-02 y sesiones de usabilidad | Cypress y cuestionario SUS | Estados explícitos y SUS mayor o igual a 70 |
| Fiabilidad | RNF-FIA-001 y 002 | Monitoreo y prueba de restauración | Grafana y pg_restore | Disponibilidad en meta y restauración satisfactoria |
| Seguridad | RNF-SEG-001 y 002 | CS-SEG-01 a CS-SEG-08 | OWASP ZAP, Supertest y Gitleaks | Roles y bitácora verificados, sin hallazgos altos |
| Mantenibilidad | RNF-MAN-001 | Pipeline de pruebas | SonarQube y Jest | Cobertura y puerta de calidad aprobadas |
| Flexibilidad | RNF-FLE-001 | Prueba de alta de facultad adicional | Prisma y Supertest | Sin migración estructural |
| Calidad de datos | RNF-DAT-001 | CD-DAT-01 a CD-DAT-06 | SQL y Great Expectations | Cero duplicados y conciliación correcta |

La clasificación de cada requisito por subcaracterística está en `docs/calidad/catalogo-requisitos.md`, sección 5.
