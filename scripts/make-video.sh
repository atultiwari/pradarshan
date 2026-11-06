#!/usr/bin/env bash
# Frames -> MP4 with a soft music bed made in code (nothing to license).
# make-video.sh <framesDir> <out.mp4> [--key N] [--seed N] [--lufs -20] [--silent]
#   --key   transpose the music by N semitones (use a different key per video in a set)
#   --seed  vary the voicing; --lufs  loudness: -20 for laptop/YouTube, -18 for phone shorts
# Needs ffmpeg, and python3 with numpy for the music (pip install numpy, in a venv if needed).
set -euo pipefail
FRAMES=$1; OUT=$2; shift 2
KEY=0; SEED=7; LUFS=-20; SILENT=0
while [ $# -gt 0 ]; do case "$1" in
  --key) KEY=$2; shift 2;; --seed) SEED=$2; shift 2;; --lufs) LUFS=$2; shift 2;; --silent) SILENT=1; shift;;
  *) echo "unknown option $1"; exit 2;; esac; done
HERE=$(cd "$(dirname "$0")" && pwd)
N=$(ls "$FRAMES"/f_*.png | wc -l | tr -d ' ')
DUR=$(python3 -c "print(round($N/30, 3))")
W=$(python3 -c "import struct; f=open('$FRAMES/f_00000.png','rb'); f.read(16); print(struct.unpack('>I', f.read(4))[0])")
TMP=$(mktemp -d)
VIDEO=(-framerate 30 -i "$FRAMES/f_%05d.png")
ENC=(-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart)
# keep even dimensions for H.264
SCALE=(-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos")
if [ "$SILENT" = 1 ]; then
  ffmpeg -y -loglevel error "${VIDEO[@]}" "${SCALE[@]}" "${ENC[@]}" "$OUT"
else
  python3 "$HERE/music.py" "$DUR" "$TMP/bed.wav" "$KEY" "$SEED" >/dev/null
  ffmpeg -y -loglevel error -i "$TMP/bed.wav" -af "loudnorm=I=$LUFS:TP=-2:LRA=7" -ar 44100 "$TMP/bed-n.wav"
  ffmpeg -y -loglevel error "${VIDEO[@]}" -i "$TMP/bed-n.wav" -map 0:v -map 1:a "${SCALE[@]}" "${ENC[@]}" -c:a aac -b:a 192k -shortest "$OUT"
fi
rm -rf "$TMP"
echo "wrote $OUT (${DUR} s, ${W} px wide, $N frames)"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height -of compact "$OUT"
