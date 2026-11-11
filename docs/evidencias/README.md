# Repositorio de evidencias

**Fuente:** SCE-MC-001 v2.0, secciones 15.3, 31.2, 42 y Tabla 62.

La evidencia de prueba vive primero en GitHub Actions, pero sus artefactos caducan a los 90 días y la Tabla 62 exige conservar los informes de prueba dos años. Por eso, **en cada cierre de fase se copia aquí lo que sustenta el acta**.

## Estructura

```
docs/evidencias/
  fase-<n>/
    corridas.md         Identificador de corrida, commit, etiqueta y resultado
    reportes/           Cobertura, Trivy, Newman, ZAP, axe, Lighthouse y demás
    capturas/           Video y capturas de Cypress que sustentan los casos
  ensayos/              Actas de ensayos de mesa, con fecha en el nombre
```

## Reglas

- No se guardan datos personales reales, secretos ni credenciales (sección 18, RK-09).
- La evidencia se guarda sin modificar. Lo importante lleva SHA-256 en `corridas.md`.
- Los archivos binarios grandes se resumen en `corridas.md` y se conservan como artefacto de una etiqueta de release.
- La evidencia del auditor, y su expediente, no vive aquí: es del equipo auditor (Tabla 62).
