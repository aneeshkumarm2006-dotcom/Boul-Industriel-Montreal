# /brag baseline run — Boul-Industriel-Montreal

Run: 2026-09-30, 20:47 → 21:35 local (about 48 min wall-clock; render 1 m 38 s). Agent: Claude (Sonnet 5.5), invoked through the Skill tool as `brag` with no args.
Environment: Windows 11, Node v24.14.1, ffmpeg/ffprobe 8.1.2, HyperFrames CLI 0.8.97, Chrome headless shell 152 (hardware GPU), Python 3.14 + uv available.

## 0. Verdict in six lines

1. The skill produced a complete, brand-faithful, technically valid 22.0 s 1080p video with music + SFX, poster, share copy and plan. Every gate in the skill passed.
2. Quality is competent but flat: I rate it **6/10 overall**. It reads as a website walkthrough more than as a property film (77 % of runtime is recreated UI on flat slate; real photography is on screen for 5 s).
3. Every gate the skill defines passes while real defects ship: `check` reported "Check passed" on a build whose signature outline animation did not draw progressively, and it passes the final render's text-overlap at the lockup. The skill never requires anyone to *watch* the render.
4. Three defects are baked into the skill's own instructions rather than into this project: the frame-0 poster bake creates a full-frame flash (mean frame difference 46.8 vs 0.41 typical), the audio guidance yields a **-25.9 LUFS** mix (about 10 LU too quiet for social), and the bundled cue presets snap visuals to weak or phantom beats.
5. The workflow contradicts itself in ways that stop or mislead an unattended agent: audio prep vs `hyperframes init` (init refuses; verified), step order vs skill freshness (all 10 HyperFrames skills were outdated when read; `init` silently refreshed them mid-run), and the scaffolded `AGENTS.md`/`CLAUDE.md` telling agents to route through `/hyperframes` and `/product-launch-video`, which brag forbids.
6. I do not think this run is a floor. I looked at frames, found and fixed a bug the gate missed, and cross-checked audio numerically. A run that stops when `check` passes, as the skill's Step 3/4 allows, ships worse than this.

## 1. Deliverables (absolute paths)

| Deliverable | Path | Status |
|---|---|---|
| Video | `C:\Users\anees\Desktop\realestate website clone\brag-output\brag.mp4` | 22.000 s, 1920x1080, 30 fps, 660 frames, H.264 High yuv420p + AAC-LC 48 kHz stereo, 8.98 MB (after poster re-encode; original render 15.2 MB kept as `qa\brag-original-render-before-poster.mp4`) |
| Poster | `...\brag-output\brag.jpg` | 1920x1080, taken at 3.4 s; baked as frame 0 (SSIM vs frame 0 = 0.98; vs frame 1 = 0.58) |
| Plan | `...\brag-output\brag-plan.md` | 4 scenes, 4.4+7.1+4.4+5.1 = 21.0 s planned |
| Brief | `...\brag-output\composition-brief.md` | per template |
| Share copy | `...\brag-output\share-copy.txt` (+ optional `share-copy-variants.md`, EN) | FR, 2 sentences |
| Composition | `...\brag-output\composition\` | single-file `index.html` (67.7 KB after Studio ID stamping), local GSAP, local fonts, `assets/{music,sfx,fonts,img,vendor}`, `audio-rms.js`, plus scaffold files (`AGENTS.md`, `CLAUDE.md`, `hyperframes.json`, `meta.json`, `package.json`, `.hyperframes/`) |
| QA | `...\brag-output\qa\` | `sheet.png` (contact sheet), `sec\` (22 frames at t=0..21 + 21.90), `boundaries\` (12 frames at each scene boundary ±0.2 s), `check-snapshots\`, `evidence\` (skills-check before/after JSON, audio-sync.py, gen-plan.mjs) |
| This report | `...\brag-output\AGENT-REPORT.md` | |

Planned 21.0 s, delivered 22.0 s: I moved the lockup from the planned cue 18.56 s to 19.66 s (also a strong cue) to keep the 8-word closing line on screen longer. The plan/brief/composition trio has no reconciliation step in the skill, so this drift is unflagged.

## 2. Decision log

### Step 0 / dispatch
- Invocation `/brag`, no flags: voice off, format landscape, duration auto, music on, SFX on. `brag-output/` did not exist, so the default directory was used (no timestamp variant).
- Baseline state recorded: git clean; installed HyperFrames skills snapshotted (sha1 + mtimes) before any CLI call.

### Step 1: inspect (rubric gate passed)
Project is Next.js 16 App Router, not the `index.html` site the skill assumes. Mapped `index.html` → `app/[lang]/page.tsx` + `components/*` + `content/{project.ts,fr.ts,en.ts,hero.json}`; `styles.css` → `app/globals.css`; no README exists. Read all sections/components, `lib/*`, and viewed the 6 source images plus the client's plan graphic. Also read the user's auto-memory for the project (not required by the skill): it flags unconfirmed phone, missing form endpoint and CoStar-watermarked aerials.

Rubric answers:
1. **App**: bilingual (FR default / EN) one-page listing for 5 industrial condo units (1 252–2 509 pi²) in a 24-unit, 32 850 pi², 1989 building at 12650–12702 boul. Industriel, Pointe-aux-Trembles; each with 10'x12' garage door, own electrical entrance, washroom; 3 min from Hwy 40.
2. **Best claim**: "Arrêtez de payer le loyer de quelqu'un d'autre." (runner-up: cube van straight into the shop).
3. **Visual hook**: the hero's white building outline drawing itself on the aerial (site's own animation), and the slate plan where only for-sale units switch on in mint ("mint marks what can be bought, nothing else").
4. **UI to show**: hero + outline + pin card; plan; directory rows with "Demander le prix".
5. **Shortest satisfying**: about 20 s.
6. **Tone**: preset `polished` (the skill's own example: earnest product → polished); direction "quiet premium property film: the building draws itself, the plan lights up unit by unit".
7. **Audio**: warm bed vol-12 ("Steady and clean"), a few soft accents, subtle audio-reactive glow, fade to silence.
8. **Caption**: FR one-liner about 5 units, sizes, garage door, 3 min to A40.
9. **Flow**: entry (plates/plan) → pick unit 12656 → "Demander le prix" → form pre-filled (`lib/unit-events.ts requestUnit()`).

Defaults taken where the skill is silent (all recorded):
- **Language = French** (site `defaultLocale = "fr"`, Québec client). The skill has no language rule. EN variant in `share-copy-variants.md`.
- No phone/CTA number on screen (unconfirmed in memory). Only un-watermarked imagery (`hero-aerial.jpg`); the 3 CoStar-watermarked aerials unused.
- 1.5x Lanczos upscale of the 1730x660 hero crop (source is 2.6:1, not 16:9); layout puts a paper band with the h1 above the photo.
- GSAP vendored locally (scaffold pulls it from a CDN; brag says local dependencies "when possible").

### Step 2: plan
`brag-plan.md`: scenes 1 "Le bâtiment se dessine" (hook), 2 "Choisissez votre unité" (plan + cursor pick), 3 "Recevez les prix" (form pre-filled), 4 "Arrêtez de payer le loyer de quelqu'un d'autre" (line then lockup). Music vol-12 (109.96 BPM), cue locks 8.74 / 13.11 / 18.56, beat-grid 6.56–8.74 for the five units. SFX sparse. Gate: durations sum 21.0 s (pass).

### Step 3: compose
Read the 5 listed domain skills plus every reference they mark mandatory (25 more files); total instruction text read for the run: **~411 KB in 44 files (~105k tokens)**, of which the brag skill itself is 88 KB.
Fonts: Archivo (variable width) + Overpass Mono via `fetch_google_fonts.sh` with a hand-built URL. Colors from `globals.css`: slate `#1D3A3C`, paper `#F3F5F2`, ink `#0F1D1E`, mint `#D4F0C9`, steel `#56666A`.
Executed timeline (s): S1 0–4.39 (crossfade to 5.0) · S2 4.39–11.5 (vertical "scroll" push 11.5–12.2) · S3 11.46–15.84 (crossfade) · S4 15.84–22.0 (line 16.4–19.7, lockup 19.66–22.0). Outline draws 0.56–2.26; units light at 6.56/7.09/7.64/8.19/8.74; unit field fills at 13.11; music fade 20.4–22.0.
Audio: vol-12 at lane gain 0.30 (fade in 0.5 s, out 1.6 s), SFX: `bong_001`, `drop_001`, `impactSoft_medium_001`, `ui/click2`, `select_008`, `impactBell_heavy_000` at volumes 0.5–0.7. Audio-reactive: RMS (smoothed at build time) drives outline glow, background glow, lockup halo.

### Step 4: deliver
`check` (0 errors, 4 advisory `nested_structure_needs_subcomposition` warnings, 114/114 contrast checks, 0 layout issues) → preview on port 4123 (HTTP 200, `--no-open`, then stopped) → no human to approve, default taken → `render --quality high` → poster → bake → share copy.

Deviations from a literal reading (all deliberate): read all references up front rather than step by step; staged `composition/assets` aside so `init` would run; did **not** run `hyperframes feedback` (caller's hard rule; the domain skill tells agents to); did not re-render after finding V5/V6/V7 below (kept as the honest baseline).

## 3. Commands run (exact, in order)

```
git status --short                                             # clean (later: ?? motion-lab/ from the other agent)
npx --yes hyperframes --version                                # 0.8.97
npx --yes hyperframes skills check --json                      # BEFORE: 0 current / 10 outdated / 11 missing
mkdir -p brag-output
npx --yes hyperframes doctor --json                            # ok:false only for optional whisper / MusicGen / Docker; Chrome + ffmpeg OK
mkdir -p brag-output/composition/assets/music
cp ~/.claude/skills/brag/assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3 brag-output/composition/assets/music/
bash ~/.claude/skills/brag/scripts/fetch_google_fonts.sh 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Overpass+Mono:wght@300..700&display=swap' brag-output/composition/assets/fonts
npx --yes hyperframes init brag-output/composition --non-interactive   # REFUSED: "Directory already exists and is not empty"
mv brag-output/composition/assets brag-output/.assets-staging && rmdir brag-output/composition
npx --yes hyperframes init brag-output/composition --non-interactive   # OK, and auto-refreshed 10 skills
mv brag-output/.assets-staging brag-output/composition/assets
curl -fsSL https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js -o composition/assets/vendor/gsap.min.js
ffmpeg -y -i assets-src/hero-aerial.jpg -vf scale=2595:990:flags=lanczos -q:v 2 composition/assets/img/hero-aerial-1.5x.jpg
cp <6 SFX> composition/assets/sfx/{interface,impact,ui}/
ffmpeg -t 22.5 -i music.mp3 -ar 44100 -ac 1 music-22s.wav
python ~/.claude/skills/hyperframes-creative/scripts/extract-audio-data.py music-22s.wav --fps 30 --bands 16 -o audio-data.json   # reduced to assets/audio-rms.js
npx --yes hyperframes lint --verbose
npx --yes hyperframes check --snapshots                        # "Check passed" (outline bug present)
npx --yes hyperframes snapshot --at 0.4,1.2,1.8,2.4,3.2,4.2 --no-end --describe false
npx --yes hyperframes keyframes . --selector "#draw-poly" --json
npx --yes hyperframes snapshot --at 0.6,1.2,2.0,3.0,4.2,5.5,6.8,7.9,8.9,10.2,11.2,11.8,12.6,13.4,14.6,16.3,17.8,19.0,19.9,21.0 --no-end --describe false
npx --yes hyperframes check                                    # after fixes: 0 errors
npx --yes hyperframes preview --background --port 4123 --no-open   # HTTP 200
npx --yes hyperframes preview --stop
npx --yes hyperframes render --quality high --output ../brag.mp4   # 1m38s, screenshot capture, hardware gpu
ffmpeg -ss 3.4 -i ../brag.mp4 -frames:v 1 -q:v 2 ../brag.jpg
ffmpeg -y -i brag.mp4 -i brag.jpg -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart brag.poster.mp4 && mv brag.poster.mp4 brag.mp4
# QA: ffprobe; ffmpeg -ss T frames; tile sheet; ebur128; volumedetect; librosa beat/onset analysis; frame-diff analysis
npx --yes hyperframes skills check --json                      # AFTER: 10 current / 0 outdated / 11 missing
```

## 4. Objective measurements

| Metric | Value | Note |
|---|---|---|
| Container | 22.000 s, 660 frames @30, H.264 High, AAC-LC 48 kHz stereo | matches root `data-duration` |
| Integrated loudness | **-25.9 LUFS**, LRA 4.7 LU, sample peak -4.4 dBFS | source track is -15.5 LUFS; lane gain 0.30 = exactly -10.5 dB (measured delta -10.5 dB per second) |
| Bed level by section | 0–8 s about -31 to -33 dBFS RMS; 9–19 s about -27 dBFS; last 0.5 s -40 dB | track has a quiet intro and a "drop" at 8.74 s |
| Music offset in render | 0.0 ms | cross-correlation vs original |
| SFX onset vs scheduled | +3 to +32 ms | HF-peak detection (bong not measurable this way) |
| Beat presence at planned unit hits | 6.56 (-32 ms), 7.09 (-2), **7.64 and 8.19 (no onset within ±120 ms)**, 8.74 (+1) | 7.64 has preset intensity 0.131 |
| Frame 0 → 1 mean abs diff | **46.8** (median adjacent-frame diff 0.41) | largest change in the film |
| Duplicate/stalled frames | none | render is smooth |
| Near-static time | 12 of 22 s have mean frame diff < 0.5 | 5–11 s, 13–16 s, 17–19 s, 21–22 s |
| Real photography on screen | 0–5.0 s = 22.7 % of runtime | remaining 77 % recreated UI/type on slate |
| Audio-reactive glow | 5.4 / 255 gray levels peak-to-peak (2 %), correlation with RMS 1.00 | driven, but imperceptible |
| `check` | 0 errors, 4 warnings (advisory), contrast 114/114, layout 0 | |

I cannot listen. Music/SFX "fit" is judged from metadata, spectra and levels, not by ear.

## 5. Critique (senior motion designer view)

| Criterion | Score | Why |
|---|---|---|
| Hook (first 2 s) | 6 | Message lands by 1.0 s and the outline draw is a real payoff (0.56–2.26 s). But frame 0 is the poster flash, the band is empty for the first 0.3 s, the look is "site hero", and the bed underneath is the track's quiet intro (about -31 dBFS). |
| Readability / hold times | 7 | Headlines are huge and held 3 s. Misses: pin card settled only 1.2 s; closing line settled 1.9–2.2 s vs the plan's own 2.4 s floor for 8 words; the S2 plan and S3 form lean on tiny text. |
| Typography | 7 | Real Archivo wide + Overpass Mono, strong scale at 100–136 px. Many labels below 24 px (non-sale codes 16 px, plan area 19 px, legend 21 px, note 20 px, consent 19 px, form labels 22 px). |
| Hierarchy / layout / safe areas | 6 | Inverted hierarchy in S3: the whole point (unit prefilled) is a 27 px field in a 944 px card while the h2 is 88 px. S4 line frame is left-heavy with 40 % empty. Margins fine (96 px), last directory row 58 px from bottom. |
| Color / contrast | 8 | Brand-exact palette, mint used only for buyable things, 114/114 contrast pass. Decorative glow is too subtle to matter. |
| Easing / motion quality | 5 | Competent but one vocabulary (fade + rise, expo.out); cursor moves in straight lines with no arc/overshoot; 55 % of runtime near-static; overlap glitch at 19.66 s. |
| Transitions | 5 | Crossfades between a light and a dark scene produce gray mush (4.59 s, 16.04 s). The vertical scroll push (11.5–12.2 s) is motivated and clean, but the fixed cursor lands on a different row while the page moves. |
| Use of real property / UI imagery | 5 | UI recreation is faithful, but it replaces the property: one aerial for 5 s, no second photo, no ground-level view, nothing about the garage doors/drive time except a row of small text. |
| Fit for a commercial industrial-RE client | 6 | Sober, brand-true, no jokes, no phone or watermark risk. Weak on selling: no drive-time, no unit feature beat, no CTA, availability date only in a 20 px note. |
| Music / SFX fit and sync | 5 | Sync is accurate (0 ms music, ≤32 ms SFX). But the mix is -25.9 LUFS, the hook sits on a near-silent intro, an upbeat "Happy Beats" corporate bed under a "quiet premium" tone (by metadata; unverified by ear), and two of five unit hits land where the bed has no onset. |
| Overall polish | 6 | Clean and consistent; not premium. |

### Defects

| ID | Sev | Time / frames | Defect | Cause |
|---|---|---|---|---|
| V1 | High | 0.00→0.03 s; `qa\frame0.png` vs `qa\frame1.png` | Baked poster makes frame 0 a full-state frame, then frame 1 is nearly blank (diff 46.8). Visible pop on loop/replay. | (a) |
| V2 | High | whole film | Mix at -25.9 LUFS, peaks -4.4 dBFS: about 10–12 LU below the common -14 to -16 LUFS social target, so viewers must turn the phone up. | (a) |
| V3 | Med | 0–8.7 s | Hook and reveal play over the track's intro (about 5 dB quieter than the rest); first strong cue is at 8.74 s. | (a) |
| V4 | Med | 7.64 s, 8.19 s | Beat-grid snaps land on beats with no audible onset (preset lists 1.09/3.27/7.64 at intensity < 0.2; 8.19 has intensity 0.79 but no onset). | (a) |
| V5 | Med | 19.55–19.9 s; `qa\boundaries\t-19.66.jpg`, `t-19.86.jpg` | Outgoing closing line is ghosted over the incoming wordmark at the strong-cue moment. | (d) + (a) gate |
| V6 | Med | 4.39–5.0 s, 15.84–16.44 s; `t-4.59.jpg`, `t-16.04.jpg` | Dip-to-gray crossfades (paper/photo → slate). | (a) |
| V7 | Med | 9.4–11.0 s, 13.4–15.8 s | Dead time: near-zero motion for 1.6 s and 2.4 s in the two "flow" scenes. | (a) |
| V8 | Med | 12.2–16.0 s; `t-15.00.jpg` | Story beat (prefilled unit) is tiny relative to the headline; result is barely legible in a feed. | (d) + (a) |
| V9 | Med | S2 5–11.5 s | Many labels < 24 px; `check` does not test type size. | (b) + (a) |
| V10 | Med | 5.0–22.0 s | 77 % of runtime is recreated UI; film reads as a website walkthrough. | (a) + (c) |
| V11 | Low | 11.5–12.2 s; `t-11.66.jpg` | Cursor is a fixed overlay while the page scrolls, so it appears to jump to another row. | (d) |
| V12 | Low | 17.0–19.4 s; `t-17.00.jpg` | Closing line settled 1.9–2.2 s (plan floor 2.4 s); left-heavy frame. | (d) |
| V13 | Low | 21.0–22.0 s; `t-21.90.png` | Ends on a hard cut at full opacity after a static 1.5 s; "silence" is audio only. | (a) |
| V14 | Low | S1/S4 | Audio-reactive treatment satisfies the checklist but is imperceptible (2 %). | (a) |
| V15 | Low | build time | First build shipped an outline that did not draw progressively while `check` said "Check passed" (site's `pathLength=1` trick did not work in Chrome). Fixed after viewing frames. | (d) + (a) gate |

Categories: (a) brag skill text, (b) HyperFrames skills/runtime, (c) project inputs, (d) my execution.

## 6. Root causes

### (a) The brag skill's own text

**A1. Poster baked as frame 0 (V1).**
`references/step-4-deliver.md` L59–L63 "Bake the poster as frame 0 … At 30fps the poster shows for 1/30s before the intro rolls, so it's imperceptible on playback"; `SKILL.md` L126–L128 makes it a gate. It is not imperceptible: frame 0 is the fully built hook state, frame 1 is the empty start (mean difference 46.8 of 255, 100x the normal frame-to-frame change). It also forces a second lossy H.264 encode. The stated goal (control the idle thumbnail) is real, but this method trades a permanent glitch for it.

**A2. Loudness guidance produces a quiet film (V2).**
`references/audio.md` L244: "Volume: 0.3-0.4 for normal music beds … Never above 0.5. SFX at 0.55-0.85". These are gains for a bed under a voice (the voice section of `step-3-compose.md` L132 uses 0.12–0.15). With no voice they give -10.5 dB on a -15.5 LUFS track = -25.9 LUFS. No file states a loudness target, and Step 4 never measures the render.

**A3. Track choice and cue metadata (V3, V4).**
`audio.md` L224–L234: all five tracks are "Happy Beats / Business Moves … Upbeat, clean, corporate-adjacent"; vol-12 is recommended for `polished`/`cinematic`/`deadpan` (L232, L234) with no mention that its first 8.7 s are a quiet intro (orig -21.8 dBFS vs -17 after). `assets/music/cues/…vol-12….music-cues.md` L8+ lists its "Useful Beat Grid" including weak beats; the JSON (`scoring.normalization`: 98th percentile then clamped) saturates: **22 of 45 beats ≤25 s score ≥0.9, 14 are "strong cues", the first strong cue is 8.74 s**, three beats are < 0.2 (1.09, 3.27, 7.64). `step-3-compose.md` L168 and L174 tell the agent to snap to any beat within ±0.10 s regardless of intensity, and the plan template (`step-2-plan.md` L66) asks for "1-3 strongCue timestamps for major moments" although none exists before 8.74 s. `music/README.md` L20 admits the licence terms are unverified: a risk for a client deliverable.

**A4. Imagery-vs-UI bias (V10, V7).**
`step-2-plan.md` L140 "Recreate a working-app moment … the most compelling option whenever the product has a flow" and L147–L160 "Bias the storyboard toward the user flow … the centerpiece scenes must show that flow". For a listing whose only "flow" is a contact form this turns 77 % of the film into interface mock-ups. There is no product-type routing (app vs listing/portfolio/hospitality) and no imagery quota.

**A5. Tone system is built for jokes; `polished` is thin and self-limiting (V6, V7, V8).**
`references/tones.md` L48 "3-4 scenes. Each scene 4-6 seconds", L52 "One feature per scene. No bullets. No lists.", L60 "Slow crossfade (0.6-0.8s)"; `step-2-plan.md` L107, L228. All examples are absurd consumer parodies; the only serious tone offers slow holds and crossfades with no motion-density floor, and forbids lists on a product that is a list of units. Crossfading a light scene into a dark one is what creates the gray mush.

**A6. One gate, no viewing (V5, V15).**
`SKILL.md` L118 "**Gate:** `npx hyperframes check` passes with zero errors"; Step 4 makes it "brag's single pre-render gate" (`step-4-deliver.md` L7/L10). The only visual step is `step-3-compose.md` L210 "Always snapshot before render … `--at <one settled time per scene>`", which by construction cannot see motion bugs (the broken outline was fully drawn at any settled time) or transition overlaps. Transient findings are demoted to info by design (`hyperframes-cli/references/lint-validate-inspect.md` L53). There is no post-render frame review, no audio measurement and no type-size/motion-density checklist.

**A7. Order-of-operations conflicts.**
- `step-3-compose.md` L94–L105 and `audio.md` L58–L72 say to copy audio into `composition/assets/` *before* building; `hyperframes init` then refuses ("Directory already exists and is not empty"). Verified.
- `SKILL.md` L110 reads the domain skills but never checks freshness; the `init` that follows re-installs all ten (0 current / 10 outdated before, 10 current after), and the CLI says to restart the session to load them.
- `step-2-plan.md` L3 and `step-3-compose.md` L5 hard-code `brag-output/`, while `SKILL.md` L70–L80 defines a timestamped variant.
- `step-4-deliver.md` L24–L26 ("Invite them to check it before rendering. If the user approves…") is a human gate with no unattended path; the domain skill adds "Never render merely because checks pass. Pause at the final preview".
- `step-4-deliver.md` L41 recommends `--quality high`; the current CLI names are `draft/looks/delivery` (`high` still works as an alias).

**A8. Web-only Step 1 and missing rules.**
`step-1-inspect.md` L9–L13 (`index.html`, `styles.css`, `README.md`) and L119 ("copy its `<link>` href") assume a static site; a Next.js project uses `next/font` and has neither. There is no rule for **language** on a bilingual site, and no **claims/rights check** (watermarked images, unconfirmed contact, dated availability), which is the norm for real-estate work.

**A9. Share-copy template targets developers.** `step-4-deliver.md` L104 `Built with [stack if notable].` is meaningless for a commercial-property audience.

### (b) HyperFrames skills / runtime

- **Stale skills, silent refresh.** `skills check --json` before: `current 0, outdated 10, missing 11`; `init` re-installed all ten and asked for a session restart, so the session keeps the stale text. This run's delta in the five domain SKILL.md files was small, but nothing in brag protects against a larger one.
- **Scaffold contradicts brag.** `composition/AGENTS.md` and `CLAUDE.md` (identical, 8.2 KB) say "Start at `/hyperframes`" (L7) and list `/product-launch-video` for "any website URL" (L9). Claude Code auto-loads the file when anything in that folder is read (it appeared in this session's context). Brag says "do not enter the `hyperframes` entry-point intent interview" (`SKILL.md` L110). An agent that obeys the nearer instruction leaves the brag workflow.
- **Scaffold defaults conflict with the creative skill.** `index.html` uses Inter (banned in `hyperframes-creative/references/typography.md`) and GSAP from a CDN (network dependency at render); nothing flags it.
- **Cross-skill contradictions.** `transitions/catalog.md` says no `class="clip"` on scene divs and "just write the `font-family`"; `hyperframes-core` says use `class="clip"` and lint requires `@font-face` for un-bundled fonts (`font_family_without_font_face`). `video-composition.md`: "err toward more movement than feels safe", "6–10 visual roles"; brag `polished`: few scenes, long holds.
- **`check` is blind to the things that hurt here**: it passed a non-animating signature move, tiny type, near-static seconds and a 0.35 s text overlap; motion assertions exist only as an opt-in `*.motion.json` sidecar that brag never mentions.
- **Side effects**: starting `preview` stamped 448 `data-hf-id` attributes into `index.html` (57.8 → 67.7 KB); `check --snapshots` writes into the project; `hyperframes-cli` tells agents to run `hyperframes feedback` after render (public channel), which brag does not override.

### (c) Project inputs

- Only aerial photography (no ground-level, interior or video), the hero is a 2.6:1 crop; 3 of 6 aerials carry the CoStar/LoopNet watermark (usage rights an open item in memory); phone number is an unconfirmed broker line; availability is "as of 2026-09-08" so any "5 units for sale" claim dates fast; facts were inferred from LoopNet. Bilingual site with FR default. None of this is handled by the skill, so a run that ignores it ships risk.

### (d) My execution

- V15: reused the site's `pathLength=1` dash trick instead of the documented `getTotalLength()` recipe (`hyperframes-animation/rules/svg-path-draw.md`); found only by viewing frames, fixed before render.
- V5: I overlapped the closing line's exit with the lockup's entrance in the same place; my dev snapshots sampled 19.0 and 19.9 s and missed the overlap.
- V8, V12: gave the key result small type and let the closing line settle under my own plan floor; V11: cursor as a fixed overlay across the scroll.
- Plan drift (21 → 22 s, cue 18.56 → 19.66) not reconciled back into the plan.

## 7. Proposed edits to the skill (not applied; no skill file was modified by hand)

1. **`references/step-4-deliver.md` L59–L73 (poster).** Replace the bake with: "Do not overwrite frame 0. Design the composition so frame 0 is already a postable hook frame (start with the h1 settled and the outline 30–50 % drawn, or start on the final hook state and animate secondary elements in). Export `brag.jpg` as a separate cover. Only if a bake is unavoidable, run `ffmpeg … signalstats` on frames 0 and 1 and refuse to bake when the mean difference exceeds 10." Update `SKILL.md` L126–L128 to match.
2. **`references/audio.md` L244.** Replace the volume line with: "Target -16 ±1.5 LUFS integrated for the finished mix and true peak ≤ -1.5 dBTP. Bundled beds measure about -15.5 LUFS at gain 1.0, so use bed gain 0.85–1.0 with no voiceover and 0.12–0.20 under a voiceover. After render run `ffmpeg -i brag.mp4 -af ebur128=peak=true -f null -`; if outside range, change the bed lane gain (or add a limiter via `data-fx-chain`) and re-render." Add the same check to `step-4-deliver.md` after Render.
3. **`references/audio.md` L224–L234 and cue files.** Add columns "intro length before first strong cue" and "LUFS at gain 1.0" (vol-12: about 8.7 s, -15.5). Add the rule: "If the first strong cue is later than 3 s, set `data-media-start` so a strong cue lands at the first reveal (t ≤ 3 s), or pick another track." Add at least one calm/no-drums bed for `polished`/`deadpan`/`cinematic`, or point to `media-use` BGM resolve. Resolve the licence note in `music/README.md` L20 before shipping the library.
4. **Cue presets + `step-3-compose.md` L168–L176.** Regenerate presets with rank-based strong cues (top 15 %), an `onsetVerified` flag per beat, and a `firstStrongCue` field; drop beats below 0.6 from "Useful Beat Grid". Change the rule to: "Snap sequential items only to beats with intensity ≥ 0.6; if a slot falls on a weaker beat, move to the next strong beat or leave that item off-grid."
5. **`references/step-2-plan.md` L136–L162.** Insert product-type routing before "Choosing what to show": "(A) interactive app/tool: recreate the working moment. (B) listing, portfolio, hospitality, e-commerce, brand site: imagery-first. At least 60 % of runtime must be real photography/footage of the subject; recreated UI may annotate it and may not exceed 40 % of runtime or 4 s per moment." Rewrite L147–L160 so the flow bias applies only to type (A).
6. **`references/tones.md` L40–L62 and `step-2-plan.md` L104–L112, L221–L233.** Add a motion-density floor ("something changes every 1.5 s; no static hold over 2 s except the closing line"), replace "Slow crossfade" with "push/slide or hard cut between light and dark scenes; crossfade only between scenes of similar luminance", change "No bullets. No lists." to "Lists are allowed when the list is the product (units, rooms, menu items)", and add a `showcase` tone for property, hospitality and product photography.
7. **`SKILL.md` L118 and `step-4-deliver.md` L3–L18.** Replace the single gate with three: (i) `check` 0 errors; (ii) frame review: `snapshot` at start/mid/end of every animated element and at every scene boundary ±0.2 s, then view the contact sheets and write one line per scene (no overlapping text, key text ≥ 32 px, labels ≥ 24 px, first text readable by 1.0 s); (iii) post-render `ffprobe` + LUFS + frame-0-vs-1 difference. Make (ii) and (iii) blocking.
8. **Type floors in the brief.** Add to the `step-3-compose.md` L7–L88 template: "Type floors at 1080p: headline ≥ 96 px, body ≥ 32 px, label ≥ 24 px; anything smaller is decoration and must not carry meaning."
9. **`step-3-compose.md` L94–L105, `audio.md` L58–L72.** Reorder: run `npx hyperframes init` first, then copy assets. After init, overwrite `composition/AGENTS.md` and `CLAUDE.md` with a three-line stub: "This is a /brag composition. Do not route through /hyperframes or /product-launch-video. Follow brag's brief and plan."
10. **`SKILL.md` L110.** Prepend: "Run `npx hyperframes skills check --json`; if `updateAvailable`, run `npx hyperframes skills update` before reading the domain skills, and read them from the refreshed directory."
11. **`step-4-deliver.md` L18–L26, L41.** Add an unattended path ("no human in the loop: start preview only to verify HTTP 200, stop it, continue") and state that `hyperframes feedback` is out of scope for /brag. Replace `--quality high` with `--quality delivery`.
12. **`step-1-inspect.md` L7–L30, L108–L119.** Add framework mapping ("Next/Vite/Astro: `app/**/page.tsx`, `components/`, `content/`, `messages/`, Tailwind `@theme` in `globals.css`, `next/font` usage; if there is no `<link>`, build the Google Fonts URL from the `next/font` call"). Make the README optional.
13. **New rubric question 10 in `step-1-inspect.md`, plus a "Language" creative law in `SKILL.md`.** Q10: "Which images are watermarked/unlicensed? Which contacts or claims are unconfirmed or dated? Put a dated disclaimer on screen when availability is shown." Language: "Detect locales; use the site's default locale for on-screen copy and share-copy; write the other locale into `share-copy-variants.md`; never mix languages on screen."
14. **`step-3-compose.md` L222 (checklist).** Change to "an audio-reactive element moves by at least 8 % (opacity/scale/luminance) and this is confirmed in frames, or extraction failure is documented."
15. **`step-4-deliver.md` L95–L136.** Drop `Built with [stack if notable]` for non-developer audiences; add a bilingual-caption rule.

## 8. HyperFrames skills staleness (`npx hyperframes skills check --json`, read-only)

| | current | outdated | missing |
|---|---|---|---|
| Before any CLI use (20:49) | 0 | **10** (hyperframes, -animation, -audio, -cli, -core, -creative, -keyframes, -registry, -studio, media-use) | 11 (embedded-captions, faceless-explainer, figma, general-video, motion-graphics, music-to-video, pr-to-video, product-launch-video, remotion-to-hyperframes, slideshow, talking-head-recut) |
| After the run (21:2x) | 10 | 0 | 11 |

Answer: **yes, the installed skills were stale** (all 10, hashes differing from latest). The refresh happened as a side effect of `init` (files under `~\.claude\skills` and `~\.agents\skills`, plus links into 6 other agent directories), not through any brag step. JSON saved in `qa\evidence\`. The 11 "missing" workflow skills are installed on demand and are not required by brag.

## 9. Steps that failed, were blocked, or were bypassed

- `hyperframes init brag-output/composition`: **failed** on the first attempt (non-empty directory) because of the skill's own ordering; worked around by staging assets aside.
- Preview approval gate: no human available; took the default (proceed), preview verified HTTP 200 on port 4123 and stopped.
- Final poster extraction with ffmpeg's mjpeg encoder failed once on a limited-range frame at 21.97 s (QA only); re-done as PNG.
- `hyperframes feedback` not run (caller's hard rule).
- Nothing was published, deployed or uploaded.

## 10. Repo hygiene / side effects

- `git status --short`: `?? brag-output/` and `?? motion-lab/` (the other agent's). No tracked file modified (`git diff --stat` empty). No file outside `brag-output/` in the repo changed.
- `.gitignore` does not cover `brag-output/` (44 MB, with MP4s); `git add -A` would sweep it in. `tsconfig.json` includes `**/*.ts(x)` but the output holds no TypeScript; Tailwind 4 auto-scan may read `brag-output/**/*.html` when building the site, so keep the folder out of the site build or ignore it.
- Outside the repo: `~\.claude\skills` and `~\.agents\skills` were refreshed by the CLI (`init`); `$HOME\.cache\hyperframes` Chrome cache reused; scratch files in the session scratchpad.
- `composition/.hyperframes/` and the 448 stamped `data-hf-id` attributes are CLI artifacts left in place.

## 11. Limits of this evaluation

- No listening: audio fit and mix balance are inferred from spectra, levels and metadata. A human listening pass could change the music/SFX scores by a point either way.
- One project, one tone, French copy; no playback on real platforms (LinkedIn/Instagram/X). Loudness comparisons use the common -14 to -16 LUFS social target, not platform-specific measurements.
- Ratings are mine; the defect timestamps and frame paths above are verifiable in `qa\`.
