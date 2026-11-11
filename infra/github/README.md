# Reglas del repositorio en GitHub

Configuración versionada de los _rulesets_ (13.1, AU-09). Se aplican con `gh api`, y el apartado 4 de
`docs/gobierno/inventario-de-ambientes.md` registra la fecha.

| Archivo | Qué protege | Por qué |
|---|---|---|
| `ruleset-release.json` | `release/**`: sin borrar ni reescribir, solo por pull request con fusión y con los checks de las etapas 1 a 5 y 7, como `develop` y `main` | La rama de release solo recibe correcciones, cada una en su `feature/` (15.2, Tabla 31; NC-015) |
| `ruleset-etiquetas.json` | `v*`: una etiqueta no se borra, no se mueve ni se reescribe | La etiqueta es lo que despliega la etapa 8 y lo que cita el acta (15.3, 31.2) |

Alta, o actualización con el id que devuelve `gh api repos/fjmp-dev/sce-control-escolar/rulesets`:

```bash
gh api -X POST repos/fjmp-dev/sce-control-escolar/rulesets --input infra/github/ruleset-release.json
gh api -X POST repos/fjmp-dev/sce-control-escolar/rulesets --input infra/github/ruleset-etiquetas.json
```

Sin actores con excepción: tampoco el administrador se las salta.
