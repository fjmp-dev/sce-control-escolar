#!/usr/bin/env bash
# Etapa 6 de la Tabla 53: construye, registra y firma sce-api y sce-portal. La firma es sin llaves (cosign con el OIDC de
# GitHub Actions): no hay secreto que custodiar y queda atada a este repositorio y a este workflow.
# Falla si la firma no se verifica. Escribe los digests en GITHUB_OUTPUT y en reportes/imagenes.md.
set -euo pipefail

REGISTRO="ghcr.io/${GITHUB_REPOSITORY_OWNER}"
ETIQUETA="sha-${GITHUB_SHA:0:12}"
IDENTIDAD="^https://github.com/${GITHUB_REPOSITORY}/.github/workflows/ci.yml@refs/.*$"
EMISOR="https://token.actions.githubusercontent.com"

mkdir -p reportes
{
  echo "| Imagen | Etiqueta | Digest | Commit |"
  echo "|---|---|---|---|"
} > reportes/imagenes.md

publicar() { # nombre contexto salida
  local imagen="$REGISTRO/$1"
  docker build -t "$imagen:$ETIQUETA" -t "$imagen:${GITHUB_REF_NAME//\//-}" "$2"
  docker push --all-tags "$imagen"
  local digest
  digest="$(docker inspect --format '{{index .RepoDigests 0}}' "$imagen:$ETIQUETA")"
  cosign sign --yes "$digest"
  cosign verify "$digest" --certificate-identity-regexp "$IDENTIDAD" --certificate-oidc-issuer "$EMISOR" >/dev/null
  echo "| $1 | $ETIQUETA | ${digest#*@} | $GITHUB_SHA |" >> reportes/imagenes.md
  echo "$3=$digest" >> "$GITHUB_OUTPUT"
}

publicar sce-api api imagen_api
publicar sce-portal web imagen_portal
cat reportes/imagenes.md
