# Hyperframes Composition Brief: Boul-Industriel-Montreal

## Objective
Create a short launch-style brag video for Boul-Industriel-Montreal.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `C:\Users\anees\Desktop\realestate website clone`
- Primary files read: `content/project.ts`, `content/fr.ts`, `content/en.ts`, `content/hero.json`, `app/globals.css`, `app/[lang]/page.tsx`, `components/Hero.tsx`, `components/UnitPlan.tsx`, `components/Included.tsx`, `components/Contact.tsx`, `components/ContactForm.tsx`, `components/Logo.tsx`, `lib/fonts.ts`, `lib/unit-events.ts`, images in `assets-src/`
- Product name: Boul-Industriel-Montreal (logo: "Boul-Industriel" over "MONTREAL")
- Tagline / strongest claim: "Arrêtez de payer le loyer de quelqu'un d'autre." (site section "Acheter plutôt que louer")
- Key UI or visual moment to recreate: the hero aerial with the building outline drawing itself (polygon in `content/hero.json`, photo `assets-src/hero-aerial.jpg`), then the unit plan from `components/UnitPlan.tsx` with only the five for-sale units lit in mint (geometry from `project.plan` in `content/project.ts`), a cursor picking unit 12656, and the contact form pre-filled with that unit
- Copy that must appear verbatim (French, the site's default locale):
  - "5 unités à vendre sur le boulevard Industriel."
  - "12650–12702, boul. Industriel" / "24 unités · 5 à vendre"
  - "Choisissez votre unité."
  - Units and areas: 12660 · 1 776 pi², 12658 · 1 780 pi², 12656 · 1 252 pi², 12696 · 1 259 pi², 12652 + 12700 · 2 509 pi²
  - "Porte de garage 10' × 12' et porte piétonne"
  - "Demander le prix" / "Recevoir les prix" / "Unité qui vous intéresse" / "Envoyer ma demande"
  - "Disponibilités au 8 septembre 2026"
  - "Arrêtez de payer le loyer de quelqu'un d'autre."
  - "Condos industriels à vendre · Pointe-aux-Trembles, Montréal"

## Creative Direction
- Tone preset: polished
- Creative direction: quiet premium property film, the building draws itself and the plan lights up unit by unit
- Interpretation: few scenes, longer holds, slow crossfades (0.6–0.8s), mixed-case wide Archivo, no jokes, mint used only for what can be bought; restraint is the premium signal
- Angle: The site's own signature move is the building drawing itself onto the aerial, and its own brand rule is that mint marks "what can be bought, nothing else". The video keeps both: the white outline finds the building, then on a dark unit plan only the five units for sale switch on in mint, one after another, and a cursor picks one and requests its price. Every frame is the actual listing. The closing line is the site's sharpest claim: stop paying someone else's rent.
- Hook: the aerial photo, the white outline drawing itself around the building while the surroundings dim, and the count "5" landing as a slate tile with a mint numeral: "5 unités à vendre sur le boulevard Industriel."
- Outro / punchline: "Arrêtez de payer le loyer de quelqu'un d'autre." held alone, then the Boul-Industriel / Montreal lockup with "Condos industriels à vendre · Pointe-aux-Trembles, Montréal"; music fades to silence
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Phone number or contact details in the video (the site phone is an unconfirmed open item)
  - Images carrying the CoStar/LoopNet watermark (`aerial-summer`, `aerial-southwest`, `aerial-top`)

## Visual Identity
- Background: `#1D3A3C` slate (plan and contact bands); page paper `#F3F5F2`
- Text: `#0F1D1E` ink on paper; `#FFFFFF` on slate; secondary `#56666A`
- Accent: `#D4F0C9` mint (also `#BFE6B1` mint-2); teal `#557A7C`; lines `#CBD5D1`
- Display font: Archivo, variable width axis (site uses wdth 112–125, weight 700–800, tracking -0.03em); Google Fonts, fetched locally for the composition
- Body font: Archivo (regular/semibold); Overpass Mono uppercase (tracking 0.08em) for annotations, figures, eyebrows
- Visual references from the project: hero aerial + white outline + pin card; slate plan with mint for-sale cells and hairline unit walls; civic-number plates (mint numerals on slate); the count tile (slate tile, mint numeral); the drive-time "guide sign" panel (white inset rule on slate) if space allows; the plan glyph logo

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Le bâtiment se dessine — 4.4s — aerial + outline drawing, "[5] unités à vendre sur le boulevard Industriel.", pin card; h1 held settled 2.1s+
2. Choisissez votre unité — 7.1s — slate plan, five units switch on in mint one per beat (12660, 12658, 12656, 12696, 12652 + 12700), full set held 1.5s+, cursor picks 12656, directory row lights, "Demander le prix" pressed
3. Recevez les prix — 4.4s — contact form, "Unité qui vous intéresse" fills with "12656 · 1 252 pi²", "Recevoir les prix" selected, "Envoyer ma demande" pressed; unit field held 1.2s+
4. Arrêtez de payer le loyer de quelqu'un d'autre — 5.1s — the line alone (2.4s+), then the lockup; near silence at the end

## Audio
- Audio role: warm bed with sparse professional accents
- Audio arc: a low steady bed from 0s (0.5s fade-in); the track's section change near 8.7s lands with the largest unit; three or four quiet accents; the bed fades to silence across the last 1.5s under the lockup
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: bed at about 0.30 (never above 0.35), 0.5s fade-in, fade-out across the last 1.5s; no ducking needed (no voiceover)
- Music cue guidance: bundled preset. JSON: `~/.claude/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` (109.96 BPM). Strong cues to target: 8.74s (largest unit lands), 13.11s (form unit field fills), 18.56s (lockup). Beat-grid window for the five units: 6.56, 7.09, 7.64, 8.19, 8.74.
- Audio-reactive treatment: subtle; music RMS/bass makes the building outline glow and the lit mint units breathe (3-6% on non-text only). No waveform/equalizer visuals.
- Audio-coupled moments:
  - Scene 1 — the count "5" tile landing — one soft accent
  - Scene 2 — five units switching on — beat-grid sequence, accent the first and last only; cursor press — click
  - Scene 3 — unit field filling / button press — soft click
  - Scene 4 — lockup — one soft bell over the fading bed
- SFX selection guidance: polished tone means 2-3 very subtle cues at 0.55-0.70 volume. Soft warm sounds (bong, drop, soft impact) for accents, a light click for the cursor. Nothing aggressive, no SFX on every item.
- SFX analysis guidance: `~/.claude/skills/brag/assets/sfx/sfx-analysis.md` (and `.json`); use low high-frequency-risk files.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
