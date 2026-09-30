# BRIEF: Boul-Industriel-Montréal launch film

Status: **v2, as built** (the pre-build v1 had an audio plan; see section 7). **The film is silent, by the user's explicit request.** There is no music, no sound effect and no voiceover, no `<audio>` element in the composition, and no audio stream in `launch.mp4`.
Decisions were taken without a client (nobody was available); each one carries its reason and can be reversed in `build/timeline.json` and `build/src/*.src.html`.

## 1. Purpose, audience, message

| | |
| --- | --- |
| **Purpose** | Turn viewers into price requests ("Recevoir les prix" / 514 736-0511) for the five industrial condo units still for sale at 12650-12702, boulevard Industriel, Pointe-aux-Trembles, Montréal. |
| **Audience** | Owners and managers of small businesses in Greater Montréal who lease industrial space today (trades, distribution, e-commerce fulfilment, light manufacturing, garages). Secondary: brokers and investors forwarding the link. |
| **Where it plays** | LinkedIn / Facebook / YouTube, e-mail to brokers, and the site itself. Feeds autoplay muted, so a silent master is the native format there. 16:9 master; 9:16 and 1:1 are reframes for later. |
| **One message** | "Stop paying someone else's rent: five ready-built industrial units, each with its own garage door, power and washroom, three minutes from Highway 40." |
| **Message hierarchy** | 1) Own instead of rent (value, outcome language). 2) Five units for sale, 1 252-2 509 pi² (the product). 3) Each unit is a complete shop (proof: 10′ × 12′ garage door, independent 110/220/550 V entrance, washroom + 15-gal water heater). 4) Three minutes from the 40 (place). 5) How to act (price, phone, address). |
| **Tone** | Confident, premium, clean, commercial-industrial. No parody, no startup tropes, no jokes, no "we built" voice. |
| **Not shown** | Prices (the site says "Prix sur demande"), financing terms, incentives, anything not on the site. |

## 2. Language decision

**FR-first with concise EN glosses.** Reasons: (a) the site's default locale is `fr` (`lib/i18n.ts`); (b) the audience is francophone Montréal east end; (c) Québec's Charter of the French Language requires commercial advertising in French and allows another language alongside it only if French is clearly predominant (OQLF, Éducaloi). Implementation: every headline and label is French, taken from `content/fr.ts` / `content/project.ts` (with typographic apostrophes and prime marks); English appears only as three small secondary lines (hook line, reveal line, end-card action) at roughly 40 % of the FR size and 70-90 % opacity. A full EN-only alternate is a stretch goal, not a deliverable.

## 3. Format

1920 x 1080, 30 fps, H.264 High, yuv420p, MP4, **video only (no audio stream)**, **28.0 s = 840 frames**. All meaning is in the text; nothing depends on sound. Safe boxes: title-safe x 192-1728, y 108-972 for text; action-safe x 96-1824, y 54-1026 for everything else (photos may bleed; the footnote sits at y 1000-1026).

## 4. Look (from the site's own tokens)

- **Colour**: slate `#1D3A3C` ground, mint `#D4F0C9` as the *only* accent ("marks what can be bought"), white for outlines/text on slate, ink `#0F1D1E` for shadow and for text on paper, paper `#F3F5F2` for the single light scene. No third hue except the photographs.
- **Type**: Archivo (site's variable woff2: weight 720-800, `wdth` 116-125, tracking -0.035em for display) + Overpass Mono uppercase (0.08-0.12em) for the draftsman's annotations. As built: hook headline 112 px, section heads 76-96 px, rows 44 px, civic numerals 58 px (plates), phone 84 px, mono labels 23-28 px, footnote 20 px (legal line).
- **Grade**: restrained. The summer hero gets contrast +5 %, saturation -5 % and is resampled once (Lanczos 1.5 x + a light luma unsharp, `build/build.mjs`) then displayed downscaled, which is cleaner than the browser upscaling a 1730 px file to 1.12-1.16 x; the hazy dusk photo gets contrast +16 %, brightness -4 %, saturation +6 %. A spotlight shade (ink 42 %) falls on everything outside the building outline; 10 % film grain over everything as dither (20 % was too noisy on the photos); radial vignette only on photo scenes.
- **Motion language, "draft and settle"**: lines *draw* (`power3.inOut` = the site's `--ease-draft`), things *settle* (`power3.out`, `expo.out` for the two hero hits), the camera *drifts* (`sine.inOut`). Scene seams are a mint "plotter line" wipe left-to-right along the building's length axis (0.5 s, `power3.inOut`), except the last seam, a 0.8 s focus-pull dissolve into the end card. No back/elastic/bounce, no letter-spacing tweens, no per-letter typing.

## 5. Real material

| Asset | Use | Real size | Rights note |
| --- | --- | --- | --- |
| `hero-aerial.jpg` (summer, wide, the site hero) | Scenes 1 and 5 | 1730 x 660 | No watermark seen in any corner. Origin unknown; already published on the client's site. **Client to confirm.** |
| `aerial-outlined.jpg` (= `OneDrive.../12650-12702-Boul-Industr.png`, dusk, building outlined in white by the client) | Scene 4 | 2048 x 1245 | No watermark seen. Baked-in outline and tint are the client's. **Client to confirm.** |
| Site SVG plan + unit drawing | Scenes 2 and 3 | vector | Rebuilt 1:1 from the site's own geometry (`components/UnitPlan.tsx`, `UnitDrawing.tsx`, `content/project.ts`); `build/check-plan.mjs` matches the built page (161/161 lines, 78 walls, 24 civic labels). |
| Site UI: hero count cell, outline draw, pin card, civic plates, drive-time "sign", `btn-mint`, logo glyph | Scenes 1-5 | vector/DOM | Rebuilt from the site's CSS tokens; verified against `capture-fr/screenshots`. |
| **Not used**: `aerial-summer`, `aerial-southwest`, `aerial-top` (+ the three OneDrive duplicates `...A (1).jpg`, `...Aer.jpg`, `...Aeria.jpg`) | none | 2048 x 1365 | **CoStar watermark, bottom-right, on all three.** Cropping it out is precisely what LoopNet's terms forbid and what CoStar litigated (CREXi), so they are excluded rather than cropped. |
| **Not used**: `building-end.jpg` | none | 2048 x 1364 | Clean but drab; nothing to add. |
| **Not used**: client's plan graphic `608816281_...jpg` | none | 960 x 597 | Low resolution and shows an older availability (12 units highlighted vs 5 on the site). Using it would misstate availability. |

**Licences of what is in the film**: Archivo and Overpass Mono are the site's own woff2 files (both SIL Open Font License 1.1, embedded by the compiler); GSAP 3.14.2 is vendored (GSAP's standard no-charge licence); the photographs are the client's (rights to be confirmed, section 9); the plan, drawing and UI are rebuilt from the client's own site source; no stock footage, no stock music, and no sound of any kind.

Photo pixels limit the framing: 1730 px at 1.12-1.16 x = 1938-2007 px wide, so the hero photo is a **panorama band** anchored to the bottom of the frame with the top fading into slate (never a full-height crop). The 2048 px dusk photo is full-bleed at 0.94-1.0 x (sharp). Photography is on screen for about 17 of the 28 s (scene 1 7.3 s, scene 4 about 4.9 s, scene 5 about 5.2 s, minus about 0.5 s of dissolve overlap); the rest is the site's own real plan, drawing and UI, rebuilt from its source.

## 6. Storyboard (as built)

Pacing grid: a **visual pulse** of 90 per minute at 30 fps = 20 frames = 0.667 s per pulse ("beat" in `timeline.json` means one pulse), 42 pulses = 840 frames. Scene boundaries and choreographed events sit on that grid (or on a named second) so the cadence is consistent without any sound. Times are absolute film seconds. Wipe seams end on a pulse and are 15 frames long; each incoming scene starts assembling *under* the wipe so the seam reveals something already alive (no empty reveal).

| Scene | Pulses | Seconds | Job (traced to the message) |
| --- | --- | --- | --- |
| 1 Hook + reveal | 0-11 | 0.00-7.33 | Outcome hook, then the product on the real building (message in the first 5 s) |
| 2 Plan | 11-18 | 7.33-12.00 | Which five of 24 (product proof); the mint "for sale" callback |
| 3 Included | 18-28 | 12.00-18.67 | Each unit is a complete shop (proof); the one light breather |
| 4 Location | 28-35 | 18.67-23.33 | Place: 3 minutes from Highway 40 |
| 5 CTA | 35-42 | 23.33-28.00 | How to act; outline callback; held address |

### Scene 1: "Own it" (0.00-7.33 s, one continuous world)
- **Frame**: slate ground; hero-aerial band anchored bottom (y 334-1080), top 34 % masked to slate; brand bug (glyph + "Boul-Industriel") top-right. Frame 0 already shows the building (fade from 60 % ink, never from black), so a thumbnail is honest.
- **0.30** eyebrow (mono, mint 85 %): "ACHETER PLUTÔT QUE LOUER". **0.55** headline (Archivo 720, 112 px, two lines, masked rise, 0.12 s offset): "Arrêtez de payer le loyer" / "de quelqu’un d’autre." Settled by 1.3 s, so the value claim is fully readable at 1.3 s.
- **1.00-2.70** the building draws itself (the site's polygon, white 6 px stroke, `power3.inOut`, 1.7 s); shade (ink 42 %) 1.5-2.5; mint fill 16 % at 2.2-3.0. **1.70** EN gloss (40 px, white 74 %, on screen 1.9 s): "Stop paying someone else’s rent."
- **3.64-4.00** the old lines leave upward (0.32 s, `power3.in`) and are completely out before the new ones enter, so two headlines never cross.
- **4.00 the swap, hero hit 1**: eyebrow "CONDOS INDUSTRIELS À VENDRE · POINTE-AUX-TREMBLES, MONTRÉAL"; headline "[5] unités à vendre" / "sur le boulevard Industriel." (`expo.out`); the **5** in a mint cell popping 0.82 to 1; the building's fill pulses 0.16 to 0.36 to 0.24 on the same frame (the visible cause and effect that a sound would otherwise carry). **4.75** EN gloss "5 units for sale on Boulevard Industriel."
- **5.00** pin (mint dot, white stem) then **5.18** paper label card "12650–12702, boul. Industriel" / "24 UNITÉS · 5 À VENDRE". **5.55-7.05** one white glint travels the outline (keeps the hold alive). Camera pushes 1.12 to 1.16 x, locked to the pin, all shot.
- **6.83-7.33** wipe to scene 2.
- **Reading budget**: state 1 settled 1.3-3.64 s = 2.3 s for 8 words (0.29 s/word); state 2 settled 4.7-6.83 s = 2.1 s for 8 tokens (EN gloss and card follow).

### Scene 2: "Choisissez votre unité." (7.33-12.00 s; host starts at 6.83 under the wipe)
- **Frame**: slate; eyebrow "PLAN DU BÂTIMENT", H2 "Choisissez votre unité." (Archivo 700, 96 px); the site's real plan (24 cells, 5 for sale) at 1536 px wide (y 322-708); legend "À VENDRE · DE 1 252 À 2 509 PI²" (y 730); five plates below (y 776-948, civic numerals 58 px, areas 32 px mono).
- **6.93** heading rises as the bar passes; **6.98-8.4** the plan draws (dimension lines, boulevard dashed line, walls and partitions as dash-offset strokes, doors, service hatch, unit codes). Drawn state is reached at about 8.4 s.
- **8.67 / 9.00 / 9.33 / 9.67 / 10.00 (pulses 13-15, every half pulse)** five units light: 12660, 12658, 12656, 12696, 12652 + 12700 (through unit). Each: mint fill 0 to 1 (0.35 s), label inverts to slate, matching plate rises (44 px, 0.5 s, `power3.out`). **Callback**: the mint "for sale" cell.
- **10.5-11.5** hold (plan and plates fully legible, plan breathes 1.2 %); **11.5-12.0** wipe to scene 3.
- **Reading budget**: plate 5 is settled at 10.5 s and readable until about 11.8 s (the bar reaches it last): 1.3 s for a numeral and an area; plate 1 is readable for 2.2 s.

### Scene 3: "Un atelier complet" (12.00-18.67 s; host starts 11.5; the breather)
- **Frame**: paper ground (the only light scene); white drawing card left (x 192-892, y 132-940) with the site's unit plan (typical unit, 36 x 35 ft) and caption "UNITÉ TYPE, VUE EN PLAN"; right column x 960-1728.
- **11.5-13.05** card, eyebrow "DANS CHAQUE UNITÉ" and H2 "Un atelier complet, / pas une simple / coquille vide." (Archivo 700, 76 px, three lines) arrive under the wipe; the drawing assembles (walls scale in from their start edges, door arcs and tracks stroke on, fixtures fade in, "AIRE OUVERTE").
- **12.15 / 12.29 / 12.43** the three-row list is on screen early (a silent film needs reading time), badges muted: 1 "Porte de garage 10′ × 12′", 2 "Entrée électrique indépendante" + "110 V · 220 V · 550 V", 3 "Salle de bain et chauffe-eau" + "15 GALLONS".
- **14.33 / 15.67 / 17.00 (pulses 21.5, 23.5, 25.5)** each badge lights (muted to ink, with a scale pop) while its numbered marker pops onto the drawing and its part highlights (garage door panel with "10 pi" dimension; electrical panel; washroom and heater). Cause and effect on the same frame.
- **Reading budget**: list readable from 12.9 s = 5.3 s for about 14 words; the last badge lights at 17.0 s and holds 1.2 s before the wipe.
- Dropped for reading time (and because they are not on every unit): the walk-in door and "aire ouverte" line items.

### Scene 4: "À 3 minutes de l’autoroute 40." (18.67-23.33 s; host starts 18.17)
- **Frame**: dusk aerial full-bleed (0.94 to 1.0 x native), graded, right-hand slate scrim; the building (already outlined by the client) at left-centre gets a mint pin and label "12650–12702, boulevard Industriel". Right column: eyebrow "EMPLACEMENT", H2 "À 3 minutes de / l’autoroute 40." (80 px, two lines), the site's drive-time **sign** (slate panel, white inset rule): header "TEMPS DE ROUTE DEPUIS LE BÂTIMENT", rows "Autoroute 40 3 min", "Autoroute 25 10 min", "Centre-ville de Montréal 31 min", "Aéroport Montréal-Trudeau 36 min".
- **18.42** eyebrow, **18.50** H2 (rises as the bar passes the right half), **18.95-19.15** pin and card, **19.10** sign panel rises with its header.
- **19.67 (pulse 29.5)** row 1 lands alone: the "3" counts 0 to 3 and a mint bar sweeps behind it (the hero number gets its own beat). **20.33 / 20.67 / 21.00** rows 2-4 cascade; the panel grows by one row each time, so it is never a box of empty rows.
- **21.4-22.53** hold; **22.53-23.33** focus-pull dissolve into the end card.
- **Reading budget**: H2 settled by 19.2 s; row 4 settled at 21.45 s and clean until 22.53 s (1.1 s), plus the dissolve.

### Scene 5: "Recevoir les prix" (23.33-28.00 s; host starts 22.53 under the dissolve)
- **Frame**: slate; hero-aerial band anchored bottom again (the film closes where it opened), lockup top-left (glyph 72 px + "Boul-Industriel" 44 px + "MONTRÉAL"), address top-right ("12650–12702, boulevard Industriel" / "Pointe-aux-Trembles, Montréal (Québec) H1A 3V2"), big mint button "Recevoir les prix →" (`btn-mint`, 68 px text), phone "514 736-0511" (mono 600, 84 px, mint), "Équipe des ventes", EN gloss "GET PRICING", one-line footnote (20 px mono): "Disponibilités au 8 septembre 2026 · Superficies et plans à titre indicatif, sujets à changement sans préavis."
- **22.98** lockup, **23.13** address; the building's outline redraws from 22.6 and **closes exactly on 24.00 (pulse 36, hero hit 2)** while the button clips in from the left (`expo.out`, 0.6 s) and the fill pulses: the visible equivalent of the impact. **24.2** phone, **24.35** gloss, **24.5** team line, **24.9** footnote.
- **25.3-27.1** one glint travels the outline; **27.4-28.0** fade to ink. **Held frame**: the type does not move from 24.6 s to the end (the one intentional still); the photo keeps drifting.

## 7. Silence: what carries the rhythm instead of sound

The user asked for no audio, so the audio plan of v1 (original score, SFX, sync table, loudness target) was dropped and every related file deleted. The things sound would have done are done by the picture:

| Sound would have carried | The picture carries it like this |
| --- | --- |
| The hook "hit" at the swap | Old lines are gone 0.03 s before the swap (a deliberate clear beat), then the new line lands with `expo.out`, the mint 5 pops and the building fill pulses on the same frame |
| Five ascending unit plucks | Five lights at a steady 0.33 s cadence, each with a plate rising, in a fixed left-to-right-then-up order |
| Seam whooshes | The mint plotter line is the seam: a visible, directional event; the incoming scene is already moving under it |
| The riser and the CTA impact | The building outline re-draws over 1.4 s and closes on the exact frame the button clips in |
| Ticks on drawn elements | Stagger cadences on strokes (0.05-0.1 s) and row-by-row reveals; badges light with a pop |
| Silence reads as dead air | No freeze longer than 0.4 s anywhere (`freezedetect` on the render finds none); every hold carries a 1-2 % drift, a glint or a slow camera push; one deliberate still (the end address) |

Hold times were set by reading need (about 0.3 s per word, at least 0.8 s for a label) not by a bar count, because nothing in the film is tied to a musical phrase any more.

## 8. What would make me reject a frame (QA rubric, graded in the hand-back summary; a separate REPORT.md could not be written because this environment refuses report files from sub-agents)

Hook lands in 2 s; every text readable (short label >= 0.83 s settled, sentence 0.3 s/word); no overlap, clipping or safe-area violation; contrast; clear hierarchy (one focal point per beat); one motion language and ease family; no dead frames; photo crops sharp with no watermark; **the film works and paces itself in silence** (emphasis carried visually); proper end card. (v1 also had "audio sync"; it no longer applies.)

## 9. Open items for the client

1. Confirm usage rights for the two photos used (and for the three watermarked ones, if they ever want them).
2. Confirm the availability footnote date (site says 8 septembre 2026) and whether a legal line is required in the video.
3. Confirm the phone number is the sales line (site: listing brokers' line, LoopNet 35093549).
4. Decide whether an English-only version or a 9:16 reframe is wanted. (Sound: not wanted for this cut; if it is ever wanted, the score and SFX would have to be re-made, the synthesized drafts were deleted.)
5. Confirm "Un atelier complet, pas une simple coquille vide" is an acceptable claim for the units (it is our wording; the facts behind it are the three listed components on the site's typical-unit drawing).
