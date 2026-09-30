#!/usr/bin/env bash
# QA extraction: exact 1 fps frames + every scene seam + hit frames, contact sheets, loudness, freeze check.
#   bash build/qa.sh <video.mp4> <outdir>
# Frame sampling uses select on frame numbers (fps=1 samples at k+0.4 s in this ffmpeg build; never trust it for timing).
set -e
V="$1"; O="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$O/frames" "$O/seams"
rm -f "$O"/frames/*.jpg "$O"/seams/*.jpg
ffprobe -v error -show_entries format=duration:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,bit_rate -of default=nw=1 "$V" > "$O/probe.txt"

# exact integer-second frames at full resolution: f_00 = t 0.0 s ... f_27 = t 27.0 s (plus the last frame)
ffmpeg -v error -y -i "$V" -vf "select='not(mod(n\,30))',scale=1920:-2" -vsync vfr -q:v 3 -start_number 0 "$O/frames/f_%02d.jpg"
ffmpeg -v error -y -sseof -0.05 -i "$V" -frames:v 1 -q:v 3 "$O/frames/f_last.jpg"

# seam frames: for each wipe/dissolve, start / quarter / mid / three-quarter / end, plus the frame after (times from build/clock.json)
node -e '
const c=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
const out=[0.0];
for(const s of Object.values(c.hosts)){ if(s.lead>0){ const d=s.lead; [0,0.25,0.5,0.75,1].forEach(f=>out.push(+(s.start+d*f).toFixed(3))); out.push(+(s.boundary+0.1).toFixed(3)); } }
console.log(out.join(" "));
' "$HERE/clock.json" > "$O/seam-times.txt"
for t in $(cat "$O/seam-times.txt"); do
  ffmpeg -v error -y -ss "$t" -i "$V" -frames:v 1 -q:v 3 "$O/seams/s_${t}.jpg"
done

# contact sheets (labelled with timecode): 1 per second (exact), 6 x 5
FONT="C\\:/Windows/Fonts/arial.ttf"
ffmpeg -v error -y -i "$V" -vf "select='not(mod(n\,30))',scale=480:-1,drawtext=fontfile='$FONT':text='%{pts\:hms}':x=8:y=8:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x5" -vsync vfr -frames:v 1 "$O/sheet-1fps.png"
# half-second sheet of the busy stretches
ffmpeg -v error -y -i "$V" -vf "select='not(mod(n\,15))',scale=480:-1,drawtext=fontfile='$FONT':text='%{pts\:hms}':x=8:y=8:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.6,tile=8x7" -vsync vfr -frames:v 1 "$O/sheet-half.png"

# the film is silent: assert that there is no audio stream
NA=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$V" | wc -l)
echo "audio streams: $NA (must be 0)" > "$O/audio-check.txt"
# frozen-frame detection (identical frames for >0.4 s)
ffmpeg -hide_banner -nostats -i "$V" -vf "freezedetect=n=-60dB:d=0.4" -f null - 2>&1 | grep -E "freeze_(start|end|duration)" > "$O/freeze.txt" || true
cat "$O/probe.txt" "$O/audio-check.txt"
echo "freeze events:"; cat "$O/freeze.txt" || true
