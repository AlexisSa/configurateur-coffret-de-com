#!/usr/bin/env bash
# Télécharge les visuels gammes depuis le CDN Xeilom (catalogue Oxatis).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/gammes"
UA="Mozilla/5.0 (compatible; Xeilom-configurateur/1.0)"
mkdir -p "$OUT"

declare -A IMAGES=(
  ["xh-p-300.png"]="https://www.xeilom.fr/Files/126457/Img/12/XHG3T-1z.png"
  ["xh-m-250.jpg"]="https://www.xeilom.fr/Files/126457/Img/02/XHG2M-4RJ_1x1200.jpg"
  ["xh-mx-350.png"]="https://www.xeilom.fr/Files/126457/Img/23/XHG2MX-4RJ_1.png"
  ["xh-ml-500.jpg"]="https://www.xeilom.fr/Files/126457/Img/14/XHGxML-xRJ_1x1200.jpg"
  ["xh-mxl-615.jpg"]="https://www.xeilom.fr/Files/126457/Img/21/XHGxMXL_V2_1x1200.jpg"
  ["xh-s-250.png"]="https://www.xeilom.fr/Files/126457/Img/12/XHGxS-xRJ-1.png"
  ["xh-sx-350.png"]="https://www.xeilom.fr/Files/126457/Img/09/XHGxSX-xRJ-2.png"
  ["xh-l-500.png"]="https://www.xeilom.fr/Files/126457/Img/19/XHGxL-xRJTVP-4Z.png"
  ["xh-xl-625.png"]="https://www.xeilom.fr/Files/126457/Img/01/XHGxXL-xRJTVP-4z.png"
  ["xh-m2-250.jpg"]="https://www.xeilom.fr/Files/126457/Img/16/XHG2M2-4RJTV_1x1200.jpg"
  ["xh-m2l-500.jpg"]="https://www.xeilom.fr/Files/126457/Img/23/XHG2M2L-4RJTVP_1x1200.jpg"
)

for file in "${!IMAGES[@]}"; do
  echo "→ $file"
  curl -fsSL -A "$UA" -o "$OUT/$file" "${IMAGES[$file]}"
done

echo "OK — $(ls "$OUT" | wc -l | tr -d ' ') images dans public/gammes/"
