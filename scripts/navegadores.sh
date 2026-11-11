#!/usr/bin/env bash
# Navegadores de Playwright y sus dependencias del sistema (Tabla 50, CO-COM-01), en un runner de GitHub Actions.
# El 11-nov-2026 el DNS del runner fallaba a ratos: primero no resolvia azure.archive.ubuntu.com y luego tampoco
# archive.ubuntu.com. La instalacion se colgo tres veces sin tiempo de espera y, ya con tiempos, apt-get update fallo, se
# quedo con el indice viejo y pidio paquetes que el archivo ya no tenia (404). GitHub no reportaba incidente.
# Por eso: resolvedores publicos ademas de los del runner, el archivo de Ubuntu en lugar del espejo de Azure, tiempos de
# espera y reintentos de apt, y un segundo intento completo.
# Uso: scripts/navegadores.sh   (con DEBUG=pw:install, cada descarga queda en el registro)
set -euo pipefail

sudo mkdir -p /etc/systemd/resolved.conf.d
printf '[Resolve]\nDNS=1.1.1.1 8.8.8.8\n' | sudo tee /etc/systemd/resolved.conf.d/sce.conf >/dev/null
sudo systemctl restart systemd-resolved || true
printf 'Acquire::http::Timeout "30";\nAcquire::https::Timeout "30";\nAcquire::Retries "3";\n' |
  sudo tee /etc/apt/apt.conf.d/99tiempos >/dev/null
sudo sed -i 's#http://azure.archive.ubuntu.com#http://archive.ubuntu.com#' /etc/apt/apt-mirrors.txt 2>/dev/null || true

cd "$(dirname "$0")/../web"
for intento in 1 2; do
  npx playwright install --with-deps chromium firefox webkit && exit 0
  echo "::warning::Navegadores de Playwright: el intento $intento fallo"
done
exit 1
