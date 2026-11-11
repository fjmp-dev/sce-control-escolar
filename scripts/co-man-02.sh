#!/usr/bin/env bash
# CO-MAN-02 (Tabla 15, Modularidad; Fig. 2): prueba que la regla no-restricted-imports de api/eslint.config.mjs detecta
# cada clase de violacion de las fronteras. Escribe un archivo temporal por caso dentro de api/src (el lint con tipos
# solo analiza archivos del proyecto), lo pasa por ESLint y lo borra. Falla si algun caso no se detecta.
# Uso: scripts/co-man-02.sh
set -euo pipefail
cd "$(dirname "$0")/../api"
CASOS=(
  "src/pagos/dominio/co-man-02.ts|import { Injectable } from '@nestjs/common';"
  "src/pagos/dominio/co-man-02.ts|import { Prisma } from '@prisma/client';"
  "src/expediente/dominio/co-man-02.ts|import { PagosService } from '../../pagos/pagos.service';"
  "src/expediente/co-man-02.service.ts|import { CuentaRepository } from '../pagos/cuenta.repository';"
  "src/pagos/co-man-02.controller.ts|import { PrismaService } from '../persistencia/prisma.service';"
  "src/reportes/co-man-02.ts|import { PagosService } from '../pagos/pagos.service';"
  "src/reportes/co-man-02.controller.ts|import { PrismaService } from '../persistencia/prisma.service';"
  "src/bitacora/co-man-02.ts|import { UsuariosService } from '../identidad/usuarios.service';"
)
archivo=""
trap '[ -z "$archivo" ] || rm -f "$archivo"' EXIT
fallas=0
for caso in "${CASOS[@]}"; do
  archivo="${caso%%|*}"
  printf '%s\nexport const coMan02 = 1;\n' "${caso#*|}" > "$archivo"
  n="$(npx eslint -f json "$archivo" | jq '[.[].messages[] | select(.ruleId != null and (.ruleId | endswith("no-restricted-imports")))] | length' || true)"
  rm -f "$archivo"
  if [ "${n:-0}" -ge 1 ]; then echo "detectada: $caso"; else echo "::error::CO-MAN-02 no detecto: $caso" >&2; fallas=$((fallas + 1)); fi
done
[ "$fallas" -eq 0 ] && echo "CO-MAN-02: ${#CASOS[@]} de ${#CASOS[@]} violaciones detectadas"
