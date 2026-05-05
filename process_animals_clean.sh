#!/bin/bash
# SBS WebM Generator - Final working version
# Left=RGB (original colors), Right=Grayscale alpha mask (white=cat, black=bg)
# similarity=0.15 only removes pure green, preserving ALL animal pixels

set -e
SRC="/home/shivam/Downloads/all animals"
OUT="/home/shivam/Pawzy/app_build/pawzy-ui/public/characters"

GREEN="0x00B657"
SIMILARITY="0.15"  # LOW - only removes the pure green bg, NOT animal edges
BLEND="0.05"       # Small feather for smooth edges

process() {
  local INPUT="$1"
  local OUTPUT="$2"
  local LABEL="$3"
  echo "=== $LABEL ==="
  ffmpeg -y -i "$INPUT" \
    -filter_complex "
      [0:v]scale=960:540:flags=lanczos[s];
      [s]split=2[raw][tokey];
      [tokey]chromakey=${GREEN}:${SIMILARITY}:${BLEND},format=yuva420p,alphaextract,format=yuv420p[mask];
      [raw]format=yuv420p[left];
      [left][mask]hstack=inputs=2
    " \
    -c:v libvpx-vp9 -b:v 0 -crf 20 -cpu-used 4 -auto-alt-ref 0 -an \
    "$OUTPUT"
  echo "  ✅ $(du -sh "$OUTPUT" | cut -f1)"
}

process "$SRC/Cat_GreenScreen.mp4"       "$OUT/cat_sbs.webm"      "Cat"
process "$SRC/ShibuInu_GreenScreen.mp4"  "$OUT/shiba_sbs.webm"    "Shiba Inu"
process "$SRC/Monkey_GreenScreen.mp4"    "$OUT/monkey_sbs.webm"   "Monkey"
process "$SRC/Capybara_GreenScreen.mp4"  "$OUT/capybara_sbs.webm" "Capybara"

echo "🎉 Done!"
