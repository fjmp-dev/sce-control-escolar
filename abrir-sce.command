#!/bin/bash
# Doble clic en macOS: levanta el SCE completo en Docker (base de datos, API y portal) y abre el portal en el navegador.
# Cuentas de demostración e instrucciones: ACCESO-Y-AUDITORIA.txt, en esta misma carpeta.
set -euo pipefail
trap 'echo; echo "No se pudo levantar el sistema; el motivo está arriba."; read -r -p "Enter para cerrar esta ventana. "' ERR
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if command -v colima >/dev/null && ! colima status >/dev/null 2>&1; then
  echo "Encendiendo Docker (Colima)..."
  colima start
fi
docker info >/dev/null 2>&1 || { echo "Docker no está encendido. Abre Docker Desktop o Colima y vuelve a intentarlo."; false; }

echo "Levantando el SCE. La primera vez tarda varios minutos; después, segundos."
docker compose up -d --build --wait --wait-timeout 600

open http://localhost:3000
open ACCESO-Y-AUDITORIA.txt
echo
echo "Listo: el portal está en http://localhost:3000 (cuentas en ACCESO-Y-AUDITORIA.txt)."
echo "Puedes cerrar esta ventana; el sistema sigue encendido. Para apagarlo: docker compose stop, en esta carpeta."
