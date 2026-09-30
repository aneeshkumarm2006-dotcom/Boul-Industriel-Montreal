# Brag Plan: Boul-Industriel-Montreal

## What is this app?
A bilingual (FR default / EN) one-page listing site for five industrial condo units for sale (1 252 to 2 509 pi²) in a 24-unit, single-level 1989 building at 12650–12702, boulevard Industriel, Pointe-aux-Trembles, Montréal. Every unit has its own 10' × 12' garage door, electrical entrance and washroom, and the building is 3 minutes from Highway 40. It is not a joke and not an app: it is a serious commercial listing, so the impressive thing is clarity.

## The angle
A quiet premium property film. The site's own signature move is the building drawing itself onto the aerial photo, and its own brand rule is that mint marks "what can be bought, nothing else". The video keeps both: the white outline finds the building, then on a dark unit plan only the five units for sale switch on in mint, one after another, and someone picks one. Nothing is decoration; every frame is the actual listing (its photo, its plan, its civic numbers, its form). The closing line is the site's own sharpest claim: stop paying someone else's rent.

## Hook (first 2-3 seconds)
The aerial photo of the building from the hero, and the white outline drawing itself around the 12650–12702 building while the surroundings dim (the exact hero animation on the site). The count lands at full scale as the site sets it: a slate tile with a mint numeral, "5 unités à vendre sur le boulevard Industriel." A single strong image plus the claim, no preamble.

## Key moments (the middle)
- The unit plan, dark slate with mint linework: 24 cells in two rows, then only the five units for sale switching on in mint, one by one, each carrying its civic number and area (12660, 12658, 12656, 12696, and the through-unit 12652 + 12700 last, the largest at 2 509 pi²).
- The pick: a cursor chooses 12656 (1 252 pi²), its cell turns white and its row in the directory lights up ("Porte de garage 10' × 12' et porte piétonne"); it presses "Demander le prix".
- The result: the contact form with "Unité qui vous intéresse" already filled with "12656 · 1 252 pi²" and "Recevoir les prix" selected.

## Outro / punchline
The final line, straight from the site, held on its own: "Arrêtez de payer le loyer de quelqu'un d'autre." Then the lockup, Boul-Industriel / Montreal with the plan glyph, and under it "Condos industriels à vendre · Pointe-aux-Trembles, Montréal". Music fades to silence.

## User flow worth showing
Entry: the five civic-number plates under the hero photo and the plan ("Choisissez votre unité."). Key action: pick a unit on the plan (the cell and its directory row highlight together). Result: "Demander le prix" scrolls to the form pre-filled with that unit (`requestUnit()` in `lib/unit-events.ts`). It is a light flow, but it is real, and it is the site's whole job: get a buyer from a photo to a priced inquiry on a specific unit. Scenes 2 and 3 show it; scene 1 is the frame around it.

## Tone
- Preset: polished
- Creative direction: quiet premium property film, the building draws itself and the plan lights up unit by unit
- Interpretation: few scenes and longer holds, slow crossfades (0.6–0.8s), mixed-case type in the site's wide Archivo, no jokes and no exclamation, mint used as sparingly as the site uses it. Restraint is the premium signal.

## Format: landscape — 1920x1080
## Duration: 21 seconds

## Visual identity (from the project)
- Background: `#1D3A3C` slate (plan and contact bands); page paper `#F3F5F2`
- Accent: `#D4F0C9` mint (only ever on units for sale and the count numeral)
- Text: `#0F1D1E` ink on paper; white on slate; secondary `#56666A`
- Display font: Archivo, variable width (the site sets headlines at wdth 112–125, weight 700–800, tracking -0.03em)
- Body font: Archivo (regular/semibold); Overpass Mono, uppercase, for annotations and figures
- Strongest visual element: the hero aerial with the white building outline drawing itself, and the slate plan with only the for-sale units lit in mint

## Share copy (draft)
5 unités industrielles à vendre sur le boulevard Industriel, à Pointe-aux-Trembles : de 1 252 à 2 509 pi², chacune avec sa porte de garage 10' × 12'. À 3 minutes de l'autoroute 40.

## Audio direction
- Role: warm bed with sparse professional accents
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` ("Steady and clean", polished/cinematic pick in `audio.md`, ~110 BPM)
- Music treatment: starts at 0s with a 0.5s fade-in, bed at about 0.30, fades to silence across the last 1.5s so the lockup lands in near-silence
- Music cue guidance: bundled preset read (see section below)
- Audio-reactive treatment: subtle; use music RMS/bass to make the building outline glow and the lit mint units breathe. No waveform or equalizer visuals.
- SFX posture: sparse; motion-matched; professional restraint
- Audio-coupled moments: outline drawing, the five units switching on in sequence, the cursor press, the pre-filled form, the final lockup
- Restraint rule: nothing aggressive, no SFX on every item, music never above 0.35, no swells or risers, no voice

## Music cue guidance
- Track: vol-12, 109.96 BPM (beat period about 0.546s), preset read from `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.md`
- Strong cues to target for major moments: 8.74s (the largest unit lands), 13.11s (form unit field fills), 18.56s (lockup)
- Beat-grid window for the sequential reveal (five units, one per beat): 6.56, 7.09, 7.64, 8.19, 8.74. These are graphic accents; the full set of labels is then held on screen for 1.5s+ before the cursor moves.
- Restraint: cues are optional hints. If snapping hurts readability of the plan labels or the h1, natural timing wins.

## Storyboard

### Scene 1 — Le bâtiment se dessine — 4.4s
The hero aerial (`hero-aerial`, the site's own crop) with the white outline of the building drawing itself around 12650–12702 (coordinates in `content/hero.json`), surroundings dimming, a faint mint fill; then the h1 lands: [5] "unités à vendre sur le boulevard Industriel." with the count as a slate tile with a mint numeral. The pin card "12650–12702, boul. Industriel · 24 unités · 5 à vendre" arrives last. The h1 holds settled for at least 2.1s (7 words).
Sequential/interaction: yes — the outline draws (about 1.7s), then the h1, then the pin card.
Audio intent: calm, confident; the count landing is the first soft accent.
Audio-coupled idea: a single soft accent as the "5" tile lands; nothing on the outline.
Music: bed fades in, steady.
Transition mood: soft crossfade (0.6s) → Scene 2

### Scene 2 — Choisissez votre unité — 7.1s
Dark slate plan (`UnitPlan`): the two rows of 24 cells in mint linework, the title "Choisissez votre unité." Then only the five units for sale switch on in mint, one per beat, in this order: 12660 (1 776 pi²), 12658 (1 780 pi²), 12656 (1 252 pi²), 12696 (1 259 pi²), 12652 + 12700 (2 509 pi²). Each shows its civic number and area. The set holds fully lit for 1.5s+ (small note "Disponibilités au 8 septembre 2026"). Then the cursor moves to 12656: its cell turns white and its directory row lights ("12656 — 1 252 pi² — Porte de garage 10' × 12' et porte piétonne") and the cursor presses "Demander le prix".
Sequential/interaction: yes — five units switch on one at a time; a cursor picks 12656 and presses "Demander le prix". Text labels reveal on the beat, then the full set is held (flagged: sequential text, hold the complete set 1.5s+).
Audio intent: quiet momentum, then one satisfying click.
Audio-coupled idea: a soft drop on the first and last unit only; a click on the cursor press.
Music: the bed opens up (the track's section change lands around 8.7s with the biggest unit).
Transition mood: soft crossfade (0.6s) → Scene 3

### Scene 3 — Recevez les prix — 4.4s
The contact form in its paper card on the slate band: "Unité qui vous intéresse" fills with "12656 · 1 252 pi²", "Recevoir les prix" is selected in the intent switch, the "Envoyer ma demande" button is pressed. Heading "Recevez les prix et visitez les unités." (site copy) is present but secondary. The unit field is the read; hold it 1.2s+.
Sequential/interaction: yes — the unit field fills, the intent switches, the button is pressed.
Audio intent: precise, efficient.
Audio-coupled idea: a soft click when the field fills; nothing else.
Music: steady.
Transition mood: soft crossfade (0.6–0.8s) → Scene 4

### Scene 4 — Arrêtez de payer le loyer de quelqu'un d'autre — 5.1s
The site's own line, alone on slate: "Arrêtez de payer le loyer de quelqu'un d'autre." (8 words, held 2.4s+ settled). Then it gives way to the lockup: the plan glyph, "Boul-Industriel" over "MONTREAL", and "Condos industriels à vendre · Pointe-aux-Trembles, Montréal". Silence in the last second.
Sequential/interaction: none (line, then lockup).
Audio intent: resolve, then quiet.
Audio-coupled idea: one soft bell as the lockup lands; the bed fades out under it.
Music: fades to silence.
Transition mood: end (fade to slate)

**Music mood for this video:** upbeat-but-steady corporate bed, kept low (polished)
**Audio summary:** a low steady bed with three or four quiet accents (count, first/last unit, cursor click, lockup bell) that fades to silence under the closing lockup.
