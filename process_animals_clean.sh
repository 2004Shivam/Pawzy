#!/bin/bash
# SBS WebM Generator - splits each source into entry (0-5s) + idle (5s-end)
# Entry: plays once when character walks in
# Idle:  loops continuously while break is active

set -e
SRC="/home/shivam/Downloads/all animals"
OUT="/home/shivam/Pawzy/app_build/pawzy-ui/public/characters"

GREEN="0x00B657"
SIMILARITY="0.15"
BLEND="0.05"
IDLE_START="5.0"  # seconds where the idle/looping section begins

make_sbs() {
  local INPUT="$1"
  local OUTPUT="$2"
  local SS="$3"   # start time (empty = from beginning)
  local TO="$4"   # end time   (empty = to end)
  local LABEL="$5"

  local TIME_ARGS=""
  [ -n "$SS" ] && TIME_ARGS="$TIME_ARGS -ss $SS"
  [ -n "$TO" ] && TIME_ARGS="$TIME_ARGS -to $TO"

  echo "  → $LABEL"
  ffmpeg -y $TIME_ARGS -i "$INPUT" \
    -filter_complex "
      [0:v]scale=960:540:flags=lanczos[s];
      [s]split=2[raw][tokey];
      [tokey]chromakey=${GREEN}:${SIMILARITY}:${BLEND},format=yuva420p,alphaextract,format=yuv420p[mask];
      [raw]format=yuv420p[left];
      [left][mask]hstack=inputs=2
    " \
    -c:v libvpx-vp9 -b:v 0 -crf 20 -cpu-used 4 -auto-alt-ref 0 -an \
    "$OUTPUT"
  echo "     ✅ $(du -sh "$OUTPUT" | cut -f1)"
}

process() {
  local INPUT="$1"
  local SLUG="$2"
  local LABEL="$3"
  echo ""
  echo "=== $LABEL ==="
  make_sbs "$INPUT" "$OUT/${SLUG}_entry_sbs.webm" "" "$IDLE_START" "entry (0s → ${IDLE_START}s)"
  make_sbs "$INPUT" "$OUT/${SLUG}_idle_sbs.webm"  "$IDLE_START" ""  "idle  (${IDLE_START}s → end, will loop)"
}

echo "🐾 Generating entry + idle SBS pairs for all animals"
echo "   Split point: ${IDLE_START}s | Green: ${GREEN} | Similarity: ${SIMILARITY}"

process "$SRC/Cat_GreenScreen.mp4"       "cat"      "Cat"
process "$SRC/ShibuInu_GreenScreen.mp4"  "shiba"    "Shiba Inu"
process "$SRC/Monkey_GreenScreen.mp4"    "monkey"   "Monkey"
process "$SRC/Capybara_GreenScreen.mp4"  "capybara" "Capybara"

echo ""
echo "🎉 All entry + idle pairs generated!"
ls -lh "$OUT"/*_entry_sbs.webm "$OUT"/*_idle_sbs.webm 2>/dev/null
