# Motion lab: research notes

Project: Boul-Industriel-Montreal launch film (Davnoot).
Author of these notes: the "learn, then do" agent. Everything below was checked against real files or real output, not recalled from memory.

> **Status note, added late in the run: the delivered film is SILENT, by the user's explicit request.** I had researched sound properly (rules R26-R30, section 6 "Audio") and had drafted an original synthesized score plus about twenty SFX with a frame-exact sync table (round 1 of QA was audio-enabled and measured -15.6 LUFS). All of it was removed from the composition and from the folder when the instruction arrived; no `<audio>` element and no audio asset remains, and the MP4 has no audio stream (ffprobe-verified). The audio rules are kept below as research for future films and are marked "not applied". What survived and still mattered: the 20-frame **visual pulse grid** (lessons 6-7 read as pacing rules, not sync rules) and the discipline that every motion must carry its own emphasis, because no sound cue can carry it.

## 0. What was read, and the state of the tooling

| Item | Finding |
| --- | --- |
| HyperFrames CLI | `npx hyperframes --version` = **0.8.97**. `doctor`: Node 24.14, FFmpeg 8.1.2, headless Chrome 152 present; Docker absent (only needed for `render --docker`); whisper.cpp and MusicGen absent (not needed). |
| Local skills read | `hyperframes` (entry, routes, brief/storyboard/production/review/frame-worker contracts), `hyperframes-core` (all 11 references), `hyperframes-animation` (SKILL, rules-index, blueprints-index, techniques, transitions overview+catalog, motion-blur, all four GSAP adapters, and the rules/blueprints I plan to use), `hyperframes-creative` (house-style, video-composition, motion-principles, typography, beat-direction, story-spine, storyboard-recipe, design-spec, data-in-motion, composition-patterns, visual-styles, audio-reactive, palettes), `hyperframes-keyframes`, `hyperframes-registry`, `hyperframes-cli` (+ init/lint/beats/doctor/misc references), `hyperframes-studio`, `hyperframes-audio`, `media-use` (SKILL, media-treatments, audio), and the whole `brag` skill (SKILL, 6 references, bundled music + cue files + SFX analysis). |
| `skills check --json` (read-only) | First run (20:5x): `updateAvailable: true`, **10 installed skills outdated, 11 workflow skills missing** (`product-launch-video`, `general-video`, `motion-graphics`, `music-to-video`, `faceless-explainer`, `pr-to-video`, `slideshow`, `talking-head-recut`, `embedded-captions`, `figma`, `remotion-to-hyperframes`). Installed hashes differed from the CLI's bundle for every core skill. |
| Skill files changed underneath me | Second run a few minutes later: `current=10 outdated=0 missing=11`. Every `hyperframes*` skill and `media-use` had been rewritten at **20:55** (directory mtimes), `hyperframes-studio/SKILL.md` grew from 3.6 KB to 12 KB and gained a "plan, storyboard, build" section, `media-use` shrank from 158 to 104 files. **I did not do this**: every CLI call I made carried `HYPERFRAMES_SKIP_SKILLS=1` and `HYPERFRAMES_NO_TELEMETRY=1`, and I only ran `skills check`. Most likely the other agent's `hyperframes` invocation auto-refreshed the global skills. Consequence: my first reads are of the Sep 19-20 versions; I re-read the pieces that matter (studio, cli, versions) after the refresh and found no contradiction with the rules below. The 11 workflow skills (including the `/product-launch-video` genre lens) are still **not installed**, so the genre-specific `motion-language.md` / `cut-catalog.md` / `visual-design.md` were not available; I relied on `hyperframes-animation` + `hyperframes-creative` + upstream docs instead. |
| Upstream | Repo `heygen-com/hyperframes` (docs, examples, registry, skills, themes) and the prompting docs (`docs/prompting/motion.mdx`, `storyboards.mdx`, overview) were fetched. Four upstream examples (`product-promo`, `kinetic-type`, `swiss-grid`, `vignelli`) were scaffolded into the scratchpad and read for idiom. |
| Registry | 386 items (164 blocks, 222 components) listed and searched. 10 intent queries run (see section 4). `hyperframes feedback --search-miss` was **not** run (forbidden by the task; it is the only path that sends a query anywhere). |
| Site | `out/` exists; served with `npx serve out -l 4210`; captured with `npx hyperframes capture http://localhost:4210/fr/ -o capture-fr --skip-vision` (11 screenshots at 1920x1080, tokens, computed styles, visible text). `git status --short` afterwards shows only the two untracked folders (`brag-output/`, `motion-lab/`); no tracked file modified. Next.js was not run (AGENTS.md warns `next dev` rewrites files). |

## 1. The ten lessons that matter most

1. **Design the read, then the motion.** Every text has a reading floor (about 0.3 s per word, 0.83 s minimum for a label). Fast motion is fine; a line that leaves before it is read is a defect. Scenes are sized by the words they carry, not by a target runtime.
2. **A hook is an outcome, not a title.** Value claim inside the first 2 s of visible text and in the second beat. For this client the site's own line ("Arrêtez de payer le loyer de quelqu'un d'autre.") is a truer hook than the product name.
3. **Show the real thing, in the client's own visual language.** The site already has a signature (the building draws itself, mint marks what can be bought, a draftsman's plan, a highway-sign panel). Rebuilding those from the source beats inventing motion graphics.
4. **One motion language.** Three easing characters from one smooth family (settle = `power3.out`/`expo.out`, draw and wipe = `power3.inOut` = the site's own `cubic-bezier(.65,0,.35,1)`, camera drift = `sine.inOut`/linear). No back/elastic/bounce: overshoot reads cheap on a premium industrial subject.
5. **Nothing stops, except once.** Every hold has a visible ambient drift or a 4-8 % camera push; exactly one deliberate held frame (the end address) carries none. "Visible" matters: a 1.2 % drift over 6 s (0.04 px per frame) still tripped `freezedetect`; linear drift of 1-3.5 % fixed it.
6. **Every seam reveals something already alive.** Round 1 had an empty reveal at all three wipes because each scene's choreography began when the wipe ended. Start the next scene's entrances under the wipe (local time 0 = wipe start).
7. **Emphasis needs a visible cause and effect on the same frame.** When the user removed all sound, the swap, the five unit hits and the CTA still landed because each pairs a text event with a fill pulse or an outline closing; the pulse grid (20 frames = 0.667 s) kept the cadence consistent.
8. **Outgoing text is completely gone before incoming text starts**, and it finishes on the frame before the swap. Otherwise two headlines cross for 3-4 frames, or a sliver of the old line is visible on the hit frame.
9. **Photos are limited by pixels and by rights.** Sources are 1730 px and 2048 px wide; above about 1.15 x native looks soft, so the 1730 px hero is a panorama band, resampled once with Lanczos (+ light unsharp) and displayed downscaled, with light grain. Three of six aerials carry a CoStar watermark; cropping it out is what LoopNet's terms forbid and CoStar litigated, so they are excluded and flagged.
10. **Verify with your eyes and with numbers.** `hyperframes check` is necessary, not sufficient: contact sheets of the rendered MP4 sampled by frame number (not `fps=1`), every seam at 0/25/50/75/100 %, `freezedetect`, `ffprobe` stream check, font glyph coverage (U+2011 silently fell back to another font), typographic apostrophes and prime marks, and GSAP traps (initial hidden states in CSS, `immediateRender:false` for non-start states, dash pattern `L, L+4` with offset `L+2`).

(The first draft of this list had "sync is a number" and "build the beat grid first" as lessons 6-7; they survive as rules R26-R27 in the audio section, **not applied** because the delivered film is silent. The 20-frame pulse grid was kept as a pacing grid.)

## 2. Rules (testable, sourced)

"Test" says how a reviewer or script can check the rule. Source keys are listed in section 8.

### Story and copy
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R01 | Hook: the first frame is composed (real image + brand), the first readable text is visible by 1.0 s, the value claim is fully settled by 2.0 s, the message ("what and why") lands by beat 2 (<= 8 s). | Frames at 0.5 s, 1.0 s, 2.0 s, 8.0 s. | S-NAR, S-SPINE, S-BRAG (creative law "hook is everything") |
| R02 | Reverse iceberg: lead with the outcome ("stop paying someone else's rent"), then the product, then evidence (units, specs, location). Deleting every evidence beat must leave the value stated. | Read the beat list without scenes 3-5. | S-SPINE |
| R03 | Length: 20-30 s for site/social use (commercial-property social clips run 15-30 s, site/email up to about 90 s). This film: 28 s. | ffprobe duration. | S-SHARP, S-HFROUTE |
| R04 | Every scene needs a job traceable to the message; a beat whose "why" cannot be traced is cut. | Each storyboard row has a Why. | S-SPINE, S-STORYBOARD |
| R05 | Exactly one breather (calm, low-motion beat) and one callback motif that returns denser: mint "for sale" cell = hook count, plan cells, CTA button. | Storyboard lists both. | S-UPSTREAM-STORY |
| R06 | Two-colour discipline: slate ground + mint ink. Emphasis by inversion, scale, weight, density, never a third hue (photos and white outlines excepted). | Palette audit of the composition CSS. | S-UPSTREAM-STORY, S-SITE (mint "marks what can be bought") |
| R07 | Language: French first (Québec commercial advertising must be in French; another language may accompany it if French is clearly predominant). English appears only as smaller glosses. | Every FR headline visually larger than its EN gloss. | S-OQLF |

### Text and type (1080p, 30 fps)
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R08 | Reading floor: settled time >= 0.30 s per word for sentences (BBC 160-180 wpm = 0.33-0.375 s/word), >= 0.83 s for any label of 1-3 words (Netflix minimum event 5/6 s), max about 7 s. | From the GSAP timeline: (fully visible time) >= words x 0.30, min 0.83 s. | S-BBC, S-NETFLIX |
| R09 | Sizes: display headline 96-160 px, section heads >= 64 px, spec lines >= 36 px, mono labels >= 24 px (absolute floor 22 px only for footnotes), civic numerals 96+ px. In-feed viewing wants body >= 32 px, data labels >= 24 px. | Computed font sizes in the DOM. | S-HFCREATIVE (typography, video-composition), S-LEGIB |
| R10 | Display tracking -0.03 to -0.05 em, weight contrast extreme (site: 800 numerals vs 400 body), max two families and they must differ (sans + mono). One expressive face per scene. | CSS audit. | S-HFCREATIVE (typography) |
| R11 | Numbers: `font-variant-numeric: tabular-nums`, `Math.round` (not floor), count-ups 1.2-2.5 s with `.out` easing and no overshoot; suffix arrives after the count lands. | Timeline audit. | S-HFANIM (counting-dynamic-scale) |
| R12 | Text over photo: 4.5:1 for normal text, 3:1 for large (>= 24 px, or >= 19 px bold) against the worst pixels behind it; use a solid panel or a gradient scrim (about 40-60 % dark at the text edge), never rely on the photo. | `hyperframes check` contrast + sampled frames. | S-WCAG, S-SMASH, S-NNG-IMG |

### Layout and safe areas
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R13 | Safe areas: all foreground stays inside action-safe; headlines and key data inside title-safe. Studio convention: 5 % / 10 % insets (1920x1080: 96 x 54 px and 192 x 108 px). Broadcast R95/ST 2046-1: 93 % / 90 %. Use the stricter Studio boxes. | Bounding boxes at sampled times. | S-STUDIO, S-EBU |
| R14 | Density: at least three layers (ground treatment, content, accents), two focal points, hero type 60-80 % of frame width where it is a title, anchor to edges, no dead-centre floating blocks; decorative opacity 12-25 %, borders 2-4 px. | Layer census per scene; frame review. | S-HFCREATIVE (video-composition, house-style) |
| R15 | No full-screen linear gradient on dark grounds (bands under H.264): radial or solid + local glow, plus 2-4 % grain as dither. | Dark-frame inspection; grain layer present. | S-HFCREATIVE, S-BAND |
| R16 | Raster media: displayed width <= 1.15 x native at every frame of a move (2048 px source -> at most 2355 px wide; 1730 px source -> at most 1990 px wide). | Computed from camera scale x layout width per frame. | S-HFANIM (viewport-change), S-CLOUD |

### Motion
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R17 | Duration grows with traversal: small label 0.3-0.5 s, headline 0.6-0.9 s, full-frame move/wipe 0.5-1.2 s. Enter longer than leave. UI research: 100-400 ms for interface feedback, > 500 ms starts to drag (video allows more because there is no waiting user). Material 3 tokens: 50 ms ... 1000 ms, "duration should increase as traversal increases". | Tween durations vs distance. | S-M3, S-NNG-ANIM |
| R18 | Direction of easing: `.out` (decelerate) entering, `.in` (accelerate) leaving, `.inOut` moving between positions. Material 3: emphasized decelerate `cubic-bezier(.05,.7,.1,1)`, accelerate `(.3,0,.8,.15)`. | Scan tweens. | S-M3, S-HFCREATIVE (motion-principles) |
| R19 | Ease family: smooth only. `power3.out` house settle, `expo.out` for the one or two hero hits, `power3.inOut` (= `cubic-bezier(.65,0,.35,1)`, the site's `--ease-draft`) for draws and wipes, `sine.inOut`/`none` for drift. No `back`, `elastic`, `bounce`. At most two independent tweens with the same ease per scene is the ideal, three characters minimum per film. | grep eases. | S-HFANIM (gsap-easing), S-HFCREATIVE |
| R20 | Stagger: total cascade <= about 0.5 s for a group arrival; offsets must be shorter than the animation they offset; sequential *read* items go one per beat or slower, never faster than the reading floor. | Timeline audit. | S-HFCREATIVE, S-UPSTREAM-MOTION |
| R21 | Draw-on strokes: 0.3-0.8 s per segment (long outlines up to 1.7 s), next segment starts at 70-80 % of the previous, no bounce, and a drawn line must land on real elements. | Timeline audit. | S-HFANIM (svg-path-draw) |
| R22 | Nothing stops: every hold carries 1-2 % ambient scale/drift; each shot has one camera act of 4-8 % push (Ken Burns proper is 10-20 % over 4-5 s and near-linear). Allow exactly one fully still "held frame". | Frame-difference of the last 1 s of each scene (only the held frame may be identical). | S-UPSTREAM-MOTION, S-KB |
| R23 | Pacing: about 1.5-4 s per idea; reading-limited scenes may go to about 6.7 s; hard cuts land on the beat, hero landings on downbeats. | Scene list. | S-UPSTREAM-MOTION, S-EDIT |
| R24 | Transitions: one primary (60-70 % of changes) plus one or two accents; the transition is the exit (no separate exit tweens except on the last scene); premium/calm wants 0.5-0.8 s with `sine.inOut`/`power1`, energetic 0.15-0.3 s with `power4`/`expo`. | Seam list. | S-HFANIM (transitions overview) |
| R25 | Every movement makes a claim (direct attention, carry continuity, show change, express character). If it cannot finish "this moves because...", cut it. Cheap-motion test: a frozen final second yields bit-identical frames. | Comment each tween with its job. | S-UPSTREAM-MOTION |

### Audio (researched, NOT applied: the delivered film is silent by request)
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R26 | Picture/sound sync: sound may lead by <= 45 ms (1 frame) and lag by <= 125 ms (3 frames). Author transients on the frame of the visual event or one frame late. Whooshes start 10-20 ms before the move. | Table of (visual frame, SFX frame) with deltas. | S-BT1359, S-SFX |
| R27 | Beat grid: 90 BPM, beat = 20 frames, bar = 80 frames. Scene seams on beats (downbeats for the two biggest), text reveals on every 2nd beat or slower, decorative ticks on eighths. Cut in bar-length blocks. | Beat table vs data-start values. | S-EDIT |
| R28 | Loudness: integrated about -14 LUFS, true peak <= -1 dBTP for web delivery. No voiceover, so the music carries the level; SFX sit 6-12 dB under the music peaks except deliberate hits. | `ffmpeg -af ebur128=peak=true` on the final file. | S-LUFS |
| R29 | Restraint: 6-10 SFX in 28 s, each with a job (draw, arrive, hit, seam). Layer high "air" and low "thump" for hits. | SFX table with jobs. | S-SFX |
| R30 | Music licence must be documented. Bundled ende.app tracks are CC BY 4.0 (credit required). This film uses an original synthesized score generated for the project (no third-party licence); SFX are Pixabay-licensed (media-use) or synthesized. | (Not applied: the film is silent.) BRIEF section 5 lists the licences of what is used. | S-ENDE, media-use CREDITS.md |

### Technical and rights
| # | Rule | Test | Source |
| --- | --- | --- | --- |
| R31 | Contract: one paused timeline per composition, registered under the composition id, no `Date.now`/unseeded random/`repeat:-1`, `fromTo` for entrances inside sub-compositions, transform-based motion only (no width/height/top/left/letter-spacing tweens), fonts as local `@font-face`, each `<audio>` has an `id`, hosts (not clips) carry transition tweens. | `hyperframes lint` + `check` = 0 errors. | S-HFCORE |
| R32 | Do not remove, crop or hide a CoStar watermark. Use only photos without one, and flag every photo's provenance for client confirmation. | Asset list and rights notes in BRIEF section 5. | S-COSTAR, S-LOOPNET |
| R33 | QA is visual and numeric: contact sheet (exact 1 fps, sampled by frame number, never by the `fps` filter) + every seam frame + freeze detection + `ffprobe` stream check (and, when there is sound, loudness + sync table); minimum three rounds. | qa/ folders. | S-HFCLI (check discipline) |
| R34 | A silent film must carry emphasis visually: every event that a sound would have punctuated (the swap, the five unit hits, the CTA landing) needs a visible cause-and-effect pair on the same frame (text lands + fill pulses; button clips in + outline closes), and holds must be long enough to read without a rhythmic cue. | Look at the frames on the event; hold-time table. | S-UPSTREAM-MOTION |
| R35 | Never sample QA frames with `-vf fps=1`: in this ffmpeg build it returned frames at k+0.4 s, which mislabelled a wipe at 18.4 s as 18.0 s. Use `select='not(mod(n,30))'` or `-ss` with a frame-exact time. | Compare a known event (a wipe start) against the labelled time. | measured in this run |
| R36 | Text that passes through a masked window must not cross other text: the outgoing lines finish leaving before the incoming lines start (a 0.32 s exit that ends on the swap frame), otherwise two headlines overlap for 3-4 frames. | Frame at swap + 0.1 s. | measured in this run (round 2) |

## 3. HyperFrames build notes I will rely on

- Root `index.html` is thin: hosts (`data-composition-src`), root-level audio, transition tweens on the hosts, one near-empty root timeline. Scenes are sub-compositions in `compositions/*.html`; everything (style, script, font-face) lives inside `<template>`.
- Sub-composition ids: host `data-composition-id` = template root id = `window.__timelines` key.
- Timed hosts do not get `class="clip"` when I tween them at root (upstream examples tween hosts with scale/blur/opacity); only `visibility/display/autoAlpha` on clips are banned.
- `fromTo` everywhere inside scenes; no `from()`. Ambient motion goes on the seekable timeline, never standalone `gsap.to`.
- Layout constants are computed once (build script) and written into CSS/JS; no `getBoundingClientRect` at tween time.
- Media (`<img>`) is fine anywhere; audio lives on root with unique ids and distinct track indexes for overlapping clips.
- Vendor GSAP locally (`assets/vendor/gsap.min.js`, 3.14.2) so a render never depends on a CDN.
- `check` gates: lint errors switch off the layout/contrast audits (0 samples means nothing ran), so clear lint first.
- Quality names in 0.8.97: `draft`, `looks` (default, CRF 16), `delivery`.

## 4. Registry search log (search before hand-building)

Words tier (no on-device model, nothing sent). Top hits per query:

| Need | Query | Top results | Decision |
| --- | --- | --- | --- |
| Count-up | "count up statistic number" | `number-wheel`, `number-pop-in`, `mk-progress-stat`, `count-up` | Hand-rolled 12-line count-up per the `counting-dynamic-scale` rule: the registry item is a centred full-frame scene with Inter defaults and a fixed 2 s envelope; I need Archivo civic numerals inline in a layout. |
| Kinetic headline | "kinetic headline word by word reveal" | `caption-kinetic-slam`, `kinetic-center-build`, `kinetic-type-swap`, `line-swap` | Adopted the **line-swap pattern** (masked line rises, swap through the same mask, no overshoot) but wrote it left-aligned two-line for the site's type; installed the source to read it. |
| Photo camera push | "photo reveal with slow camera push" | `push-in`, `pull-back-reveal`, `camera-rig-depth-stack` | Hand-built a single-wrapper virtual camera (`viewport-change` rule) because the outline SVG must stay locked to the photo. |
| Map / drive time | "map location pin drive time" | US/world/Spain choropleths only | No suitable Montréal map. Built the site's own **drive-time "sign" panel** instead (real UI) over the clean aerial. |
| Lower thirds | "lower third label over footage" | `lt-*` family | Not needed; labels are part of the drawing/plan language. |
| Look | "film grain vignette cinematic look" | `grain-overlay`, `vignette`, `grain-field` | `vignette` snippet used as is. `grain-overlay` rejected: `feTurbulence` on a 3840x2160 layer per frame is expensive; used a pre-generated 512 px noise tile stepped on the timeline. |
| Outline draw | "draw outline stroke around building" | `outline-draw`, `svg-stroke-trace`, `svg-line-draw-loader` | Wrote my own from the site's real polygon (`hero.json`) with the `svg-path-draw` recipe; `outline-draw` is a conic-gradient rounded-rect border. |
| Specs list | "specs list checklist over footage" | `mk-specs-list`, `marker-checklist-card` | Not adopted; the site's numbered list + drawing markers is the real UI. |
| End card | "end card call to action lockup phone" | `cta-lockup`, `titlecard-lockup`, `store-badge-lockup` | Read `cta-lockup` for structure; built the end card from the site's `btn-mint`, glyph and phone line. |
| Transition | "blur crossfade focus pull transition" | `transitions-blur`, `focus-blur-resolve`, `transitions-dissolve` | CSS transition rules from `hyperframes-animation/transitions` (blur crossfade for the end card). WebGL shader transitions rejected: they force the layered composite path and html2canvas rules for a film that does not need them. |

Gap worth reporting upstream (not sent): no registry item draws a *real photo outline + count cell + callout* hero, no drive-time/minutes ruler, no floor-plan reveal. All three are built here.

## 5. Diagnosis of `/brag` for a commercial client site (read-only; nothing edited)

The skill is well organised. It fails on this project because its *genre*, *defaults* and *asset pack* are built for parody "look what I built" clips, and because its constraints delete the content a property launch needs.

### 5.1 Systematic causes (with the lines that cause them)

| # | Cause | Evidence in the skill | Effect on a commercial film |
| --- | --- | --- | --- |
| 1 | **Wrong genre.** | SKILL.md: "You built it. Now let's brag about it." / "It is narrow, opinionated, and fun." / "Funny earns its place. Humor should come from the project's absurdity". tones.md examples are all parody: Horse Tinder, "UBER FOR WILD BOARS", Fish Flight School, Taxi for Taxis. Rubric Q2: "What is the funniest or most impressive claim?" | The planning questions fish for a joke. A condo listing has no absurdity, so the model manufactures one or falls back to a generic "Made X. It's ..." caption. |
| 2 | **Default tone is playful; the one serious preset is the dullest.** | tones.md `default`: "Playful, clean, postable." `polished`: "Light-to-medium weight. Generous letter-spacing. Nothing aggressive." "One feature per scene. No bullets. No lists." "Slow crossfade (0.6-0.8s)." | `polished` = thin type, wide tracking, slow crossfades: the stock "luxury" cliché. It contradicts hyperframes-creative (video needs 300-vs-900 weight contrast and tighter tracking) and it forbids lists, but a property launch *is* a list (units, specs, times). |
| 3 | **Hard duration cap and a joke structure.** | "Short. 15-25 seconds. Not one second more without a reason." "Scene durations must sum to 15-25 seconds." "Hook (2-3s) -> Reveal (2-4s) -> 2-3 sharp highlights (5-12s) -> Punchline/outro (2-4s)". | Five units + plan + specs + location + CTA cannot be read in 25 s, so text is rushed or content dropped. The house workflow says 30-90 s for product/site films. The last beat is a "punchline", not a call to action. |
| 4 | **It never looks at the rendered site or the photos.** | Description: "Reads the project code directly — no live URL or screenshots needed." step-1: "Don't read: Generated build artifacts (`dist/`, `.next/`, `build/`)". Fonts: "Google Fonts `<link>` in `<head>`". Item 7 on images is one line ("note any images"). | A Next.js static export with `next/font` has no `<link>` and hashed font files, so brand type is missed. Nobody opens the images, so pixel size, watermarks (three CoStar-marked aerials here) and rights are never checked. The real built SVGs (plan, unit drawing) are never seen. |
| 5 | **The hyperframes craft layer is bypassed.** | "/brag is its own workflow: do not enter the `hyperframes` entry-point intent interview or route into its generic promo / launch-video workflow." "Hyperframes decides exact animation timing". No `catalog --query`, no `frame.md`, no blueprint citation, no storyboard review. | The composing model gets a brief about *what* but no discipline about *how*: no design spec, no registry search, no reading-time/motion budgets beyond one paragraph. Output defaults to whatever the model improvises. |
| 6 | **Audio pack is wrong for the tone and the sync policy is loose.** | audio.md: "All tracks are "Happy Beats / Business Moves" by ende.app. Upbeat, clean, corporate-adjacent." SFX families "casino/ Card and chip sounds", dice, "impactTin ... Quirky, lo-fi", "impactPlank ... Comic physical moment". step-3: "Major reveals may move toward nearby strong cues within about 0.15s." "Use only 1-3 strong cue locks in a 15-25s video". Volume "0.3-0.4 ... Never above 0.5" (no loudness target). | I rendered spectrograms of all five tracks: dense, full-band, loudly mastered pop; no sparse intro, nothing to sit type on. Casino chips and dice under real estate. A +-0.15 s window is +-4.5 frames, wider than the 45/125 ms detectability window, and "1-3 locks" means most motion is not on the beat. No LUFS check. |
| 7 | **Licence not surfaced.** | music README: "Before publishing or redistributing the skill, verify and document the exact music license terms". | I verified: ende.app lists these tracks as **CC BY 4.0, credit required**. Nothing in the flow puts a credit line in the share copy, so a client publishing the video would be out of compliance. |
| 8 | **Poster baked into frame 0.** | step-4: "Replace **only** the first frame's pixels with `brag.jpg`". | A one-frame flash at t=0 that also becomes the encoded first I-frame; it fights any fade-in and shows on loops. Ship the poster as a separate file and design frame 0 (or use frame 45) to be poster-worthy. |
| 9 | **Thin QA.** | "Always snapshot before render. Run ... `--at <one settled time per scene>`". Step 4 has no contact sheet of the rendered MP4, no seam frames, no audio measurement. | Overlaps and dead frames occur mid-transition, exactly where one settled frame per scene never looks. |
| 10 | **No compliance layer for listings.** | Nothing on availability dates, disclaimers, language law, watermarks, or the client's approval. Share copy templates: "Made [App Name]. It's ...", "We built [App Name] to solve ...". | The voice is a maker bragging, not an agency delivering for a client. |
| 11 | **"Show the thing" bar is one scene.** | "At least one scene must display actual UI, copy, or a key visual". step-2 prefers "Recreate a working-app moment — the upload screen, the result view". | For a property the *building* must dominate; app-flow language sends the model looking for screens that do not exist. |

### 5.2 Proposed text edits (for the skill maintainer; not applied)

1. **SKILL.md, after "What this skill does"**, add a *genre gate*:
   > "Before choosing a tone, classify the project. **Maker/parody/hobby** -> tones `default|yc-parody|chaotic|deadpan|cinematic|app-store`. **Commercial client site** (real estate, B2B, services, product with a paying customer) -> tone `commercial` only, first person plural is forbidden, no jokes, no parody, the last beat is a call to action with a phone, URL or address."
2. **tones.md**, add a seventh working preset:
   > "## `commercial` — Energy: confident, specific, calm. Voice: outcome first, then proof, then how to act. Typography: the site's own display face; weight contrast 300/800; tracking -0.03em; numbers in the site's numeral style. Pacing: 5-7 scenes of 1.5-4 s, longer only where text must be read (0.3 s per word). Hook: an outcome line or the hero image with one number. Highlights: 3-5 proof points, each a real number, spec or place. Outro: CTA held at least 2.5 s. Transitions: one primary at 0.4-0.6 s plus one accent. Audio: sparse music (no full-band pop), 6-10 SFX, each with a job."
3. **tones.md `polished`**, replace "Light-to-medium weight. Generous letter-spacing" with "Heavy/light weight contrast, tight tracking on display sizes" and delete "No bullets. No lists."
4. **SKILL.md creative laws and step-2**, replace "Short. 15-25 seconds." with "Short means the least time in which every text can be read: 15-30 s for social, 30-60 s when the project has a plan, specs and location. Never cut reading time to fit." and "Punchline/outro" with "Call to action".
5. **step-1**, add a mandatory sub-step: "Serve or open the built site (`out/`, `.next/`, dev server) or run `npx hyperframes capture`, and **look** at the screenshots. Open every image, record pixel dimensions, and check for watermarks (CoStar, Getty, Shutterstock). Read fonts from the built CSS `@font-face` rules as well as `<link>`." Remove `out/` and `.next/` from "Don't read" (read them for fonts/SVG, not for logic).
6. **step-3**, replace "/brag is its own workflow: do not enter..." with "Read `hyperframes-creative/references/house-style.md` and `video-composition.md`, write a `frame.md`, run `npx hyperframes catalog --query` for each beat and note the decision, then build." Replace the ±0.15 s / "1-3 locks" text with "SFX transients within 1 frame early / 3 frames late of the visual event; scene seams on beats; text reveals on every 2nd beat or slower."
7. **audio.md**, replace the music paragraph with: "The bundled tracks are dense upbeat corporate pop under CC BY 4.0. Use them only for the playful tones, and add the credit line ('Music: Sascha Ende, ende.app, CC BY 4.0') to share-copy.txt. For `commercial`/`polished`, use sparse or synthesized beds; measure integrated loudness (-14 LUFS, true peak <= -1 dBTP)." Remove `casino/`, dice, tin and plank from the default suggestions; suggest soft impacts, ticks, air whooshes.
8. **step-4**, delete "Bake the poster as frame 0"; replace with "Export the poster separately; design the first frame so it is poster-worthy." Add: "Extract the rendered MP4 at 1 fps plus every scene boundary into a contact sheet, review it, then measure loudness and check the SFX-to-visual offsets."
9. **step-2 / brief**, add a "Rights and compliance" block: photo provenance, availability date, disclaimer text, language, contact details.

## 6. The design system used for this film

Derived from the site's own tokens (`app/globals.css`, `components/`), captured tokens (`capture-fr/extracted/tokens.json`) and verified against the live screenshots.

### Colour (single accent, semantic)
| Token | Hex | Use in the film |
| --- | --- | --- |
| slate | `#1D3A3C` | primary dark ground (plan, location, hook ground) |
| slate-2 / slate-3 | `#26484A` / `#315759` | raised plates, panel fills |
| ink | `#0F1D1E` | deepest shadow, vignette, text on light |
| mint | `#D4F0C9` | **the accent: "marks what can be bought, nothing else"** (count cell, unit cells, CTA, dimension linework at reduced opacity) |
| mint-2 | `#BFE6B1` | pressed/secondary mint |
| paper | `#F3F5F2` | light ground for the one breather scene |
| paper-2 / line | `#E7ECE8` / `#CBD5D1` | hairlines and quiet surfaces on paper |
| teal / steel | `#557A7C` / `#56666A` | secondary lines / secondary text on light |
| white | `#FFFFFF` | outline on photos, text on slate |

Contrast computed with the WCAG formula (`build/contrast.mjs`): mint on slate **9.93:1**, white on slate **12.19:1**, mint on ink 14.08:1, ink on paper 15.77:1, slate on mint 9.93:1, steel on paper 5.47:1, teal on paper 4.29:1 (large text only), teal on slate 2.59:1 (**lines only, never text**). Text at reduced alpha on slate: mint >= 60 % alpha stays >= 4.66:1 (50 % = 3.74:1, so 50 % is for >= 24 px only); white >= 50 % alpha is >= 4.33:1. Photos get a slate scrim or sit under a panel wherever text touches them.

### Type
- **Archivo** (variable, weight 100-900, `wdth` 62-125) for everything spoken. Display: `wdth 116-125`, weight 720-800, tracking -0.035em, line-height 0.98-1.02 (the site's `.display`). Section heads: `wdth 112`, 700, -0.03em. Civic numerals: `wdth 125`, 800, tabular lining figures. Body/spec: `wdth 100-104`, 500-650.
- **Overpass Mono** (variable 300-700) as the draftsman's annotation voice: uppercase, tracking 0.08-0.12em, 24-28 px.
- Scale at 1080p: display 104-150 px, section head 72-96 px, spec 40-48 px, civic numerals 72-140 px, mono label 23-28 px, legal footnote 20 px (as built: hook 112, heads 76-96, rows 44, plates 58/32, phone 84).
- Both font files are the site's real `woff2` (`out/_next/static/media/...`), copied into the composition. "≈" is not in either latin subset, so it is avoided.

### Layout
- Canvas 1920x1080, safe boxes per R13: content x 192-1728, y 108-972. 12-column grid, 24 px gutter. Left-anchored type, plan and photo run edge to edge (photo may bleed).
- Frame furniture: the site glyph + wordmark ("bug", top-right at x 1440-1728, y 108) on scenes 1-4; on the end card it becomes the top-left lockup.

### Motion language: "draft and settle"
| Move | Ease | Time | Where |
| --- | --- | --- | --- |
| Draw (outline, walls, dimension lines) | `power3.inOut` | 0.5-1.7 s | hook outline, plan, unit drawing |
| Settle (text, cards, plates) | `power3.out`, `expo.out` for the two hero hits | 0.5-0.9 s | all entrances, from below or from the left |
| Wipe (scene seam) | `power3.inOut` | 0.5 s | a mint "plotter line" sweeps left to right along the length axis of the building; the incoming scene is revealed behind it |
| Camera | `sine.inOut` / `none` | whole shot | 4-8 % push on photos; 1-2 % breathing on holds |
| Focus pull | `sine.inOut` | 0.8 s | only into the end card |
| Never | back / elastic / bounce, letter-spacing or width tweens, per-letter typing | | |

### Audio: "quiet studio, one industrial tick" (designed, drafted, then REMOVED: the delivered film is silent by the user's request)
- 90 BPM (20-frame beats), D minor / F major colour, sparse: sub bass, a warm pad, a muted pluck motif, a soft tick (dimension-line tick) on eighths. Original synthesized score generated by `motion-lab/audio/make_score.py` (numpy only), so every hit is sample-accurate to the grid.
- SFX with jobs: draw (filtered noise sweep), arrive (tick + air), seam (soft whoosh), hit (sub thump at the two hero moments), five ascending plucks for the five units, glass chime on the CTA.
- Loudness target -14 LUFS integrated, true peak <= -1 dBTP; last scene fades over the final 0.6 s.

## 7. Open questions recorded with defaults (nobody was available to answer)

| Question | Default chosen |
| --- | --- |
| Language | FR master with concise EN glosses; EN-only alternate only if time allows. |
| Length | 28 s (42 beats at 90 BPM). |
| Sound | **None. The user asked for a silent video (mid-run instruction relayed by the coordinator).** Originally: no voiceover, original score + SFX. All audio was deleted; the film must read and pace itself visually. |
| Prices | None shown ("Prix sur demande" is the site's own state). |
| Availability | Show "as of 2026-09-08" in a footnote (the site does). |

## 8. Sources

- S-HFCORE / S-HFANIM / S-HFCREATIVE / S-HFCLI / S-STUDIO / S-HFROUTE: local skills under `C:\Users\anees\.claude\skills\` (hyperframes-core, -animation, -creative, -cli, -studio, hyperframes references/routes).
- S-UPSTREAM-MOTION: https://raw.githubusercontent.com/heygen-com/hyperframes/main/docs/prompting/motion.mdx (ambient idle 1-2 %, 4-8 % push, showreel cuts 1.5-4 s per idea, "nothing stops").
- S-UPSTREAM-STORY: https://raw.githubusercontent.com/heygen-com/hyperframes/main/docs/prompting/storyboards.mdx (breather, callback, two-colour discipline, held frame). Overview: https://hyperframes.heygen.com/prompting/overview. Repo: https://github.com/heygen-com/hyperframes
- S-M3: https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md (duration tokens 50-1000 ms; easing curves). Also https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- S-NNG-ANIM: https://www.nngroup.com/articles/animation-duration/
- 12 principles applied to UI: https://www.motiontheagency.com/blog/12-principles-of-animation ; https://medium.com/design-bootcamp/disneys-12-principles-of-animation-in-everyday-ui-design-71c6592064fe ; Apple HIG motion: https://developer.apple.com/design/human-interface-guidelines/foundations/motion ; easings.net: https://easings.net/
- S-BBC: https://www.clevercast.com/bbc-subtitling-guidelines/ (BBC 160-180 wpm, about 0.3 s per word). S-NETFLIX: https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements (minimum 5/6 s, maximum 7 s)
- S-BT1359: https://www.tvtechnology.com/opinions/av-synchronization-how-bad-is-bad (detectability +45 ms / -125 ms, acceptability +90 / -185 ms); https://www.semanticscholar.org/paper/Rec.-ITU-R-BT.1359-1-1-RECOMMENDATION-ITU-R-TIMING/0ee98071da172de6e1d6d1fcd560bad9e0a87d5e
- S-SFX: https://pixflow.net/blog/enhancing-motion-graphics-with-cinematic-transition-sounds/ and https://pitchdrift-productions.com/sound-design-tips-for-motion-graphics/ (sound slightly before the move, layer air + sub).
- S-EDIT: https://www.toolsforfilm.com/blog/bpm-and-picture-editors-guide (120 BPM = 0.5 s beats, cut on downbeats, bar-length blocks).
- S-LUFS: https://audioforgepro.com/blog/youtube-lufs-normalization-guide (-14 LUFS, -1 dBTP).
- S-EBU: https://tech.ebu.ch/publications/r095 (action safe 93 %, title safe 90 %).
- S-WCAG: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html ; S-SMASH: https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/ ; S-NNG-IMG: https://www.nngroup.com/articles/text-over-images/
- S-LEGIB: https://legibility.info/rules-for-text-in-videos
- S-BAND: https://forum.blackmagicdesign.com/viewtopic.php?t=152540&p=813007 (8-bit H.264 gradient banding, grain as dither).
- S-KB / S-CLOUD: https://cloudinary.com/guides/image-effects/ken-burns-effect-complete-guide-and-how-to-apply-it (10-20 % over 4-5 s, near-linear).
- S-NAR: https://www.nar.realtor/news/real-estate-news/you-have-just-3-seconds-to-hook-clients-with-your-real-estate-message ; S-SHARP: https://www.sharplaunch.com/blog/commercial-real-estate-video-marketing (social 15-30 s; tours 30 s-2 min; drone exteriors; music).
- S-OQLF: https://www.oqlf.gouv.qc.ca/francisation/droits_linguistiques/droits/langue-du-commerce-et-des-affaires.html ; https://educaloi.qc.ca/capsules/exigences-linguistiques-exploiter-une-entreprise-au-quebec/
- S-COSTAR: https://investors.costargroup.com/news-releases/news-release-details/federal-court-finds-rival-crexi-copied-and-cropped-thousands ; S-LOOPNET: https://www.loopnet.com/solutions/LoopNetTerms-and-Conditions
- S-ENDE: https://ende.app/en/song/12881-happy-beats-business-moves-vol-12 (CC BY 4.0, credit line "Happy Beats & Business Moves Vol. 12 by Sascha Ende — ende.app License: CC BY 4.0").
- S-SITE: `app/globals.css` (palette comment: mint "marks what can be bought, nothing else"), `components/Hero.tsx`, `UnitPlan.tsx`, `UnitDrawing.tsx`, `Location.tsx`, `content/fr.ts`, `content/project.ts`.
