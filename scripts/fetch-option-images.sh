#!/usr/bin/env bash
# Télécharge les visuels options / composants depuis le CDN Xeilom.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/options"
UA="Mozilla/5.0 (compatible; Xeilom-configurateur/1.0)"
mkdir -p "$OUT"

download() {
  echo "→ $1"
  curl -fsSL -A "$UA" -o "$OUT/$1" "$2"
}

download kj6afsef1.png "https://www.xeilom.fr/Files/126457/Img/21/KJ6AFSEF1.png"
download dtimp4rj45.jpg "https://www.xeilom.fr/Files/126457/Img/09/DTIMP4RJ45_1.jpg"
download dtio-2.jpg "https://www.xeilom.fr/Files/126457/Img/23/DTIO-4_1.jpg"
download dtio-4.jpg "https://www.xeilom.fr/Files/126457/Img/23/DTIO-4_1.jpg"
download splitf-2.jpg "https://www.xeilom.fr/Files/126457/Img/17/SPLIT-F2-1-big.jpg"
download splitf-3.png "https://www.xeilom.fr/Files/126457/Img/22/SPLITF-3-1-big.png"
download splitf-4.jpg "https://www.xeilom.fr/Files/126457/Img/11/SPLIT-F4-1-big.jpg"
download splitf-6.jpg "https://www.xeilom.fr/Files/126457/Img/05/SPLIT-F6-1-big.jpg"
download splitf-8.jpg "https://www.xeilom.fr/Files/126457/Img/15/SPLIT-F8-1-big.jpg"
download bmt-prd.png "https://www.xeilom.fr/Files/126457/Img/11/BMT-PRD-1.png"
download pc45x45.png "https://www.xeilom.fr/Files/126457/Img/24/PC45X45_1.png"
download xh-s-capot.png "https://www.xeilom.fr/Files/126457/Img/25/XH-S-CAPOT-3.png"
download xh-sx-capot.png "https://www.xeilom.fr/Files/126457/Img/17/XH-SX-CAPOT-3.png"
download xh-et-lxl.png "https://www.xeilom.fr/Files/126457/Img/20/XH-ET-LXL-1-small.png"

echo "OK — $(ls "$OUT" | wc -l | tr -d ' ') images dans public/options/"
