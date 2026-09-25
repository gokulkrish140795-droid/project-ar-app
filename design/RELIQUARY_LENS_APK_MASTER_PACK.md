# Reliquary Lens APK — Master Design Pack (LOCKED v2)

```
╔══════════════════════════════════════════════════════════════════╗
║  ANDROID APK — Unity 6 URP + AR Foundation + ARCore              ║
║  Samsung Tab S7 / S7+ · landscape · offline · ~5 Oct 2026        ║
║  Corrected Flow Lock v2 — 25 Sep 2026                            ║
║  Web / PR #18 FROZEN · No Ginger                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

**Theme:** The Search for a Stray Heart · **Player:** Aishwarya · **Builder:** Gokul + Cursor / Studio / Flow  
**Companion docs:** `README_START_HERE.md` · `FEATURES.md` · `AI_HANDOFF.md` · `DECISIONS.md` · `FLOW.md` · `LOCKED_RIDDLES.md` · `design-data/`

---

## Ring glossary

| Name | What |
|---|---|
| Physical wedding ring | Real band — opening + finale rescan |
| Printed ring card | Opening handoff / wake scan only |
| Home AR gold ring | First digital ring after wipe; vault home |
| Friends AR ring | Open-world find → snowglobe / friends montage **video** |
| Guardian Angel AR ring | Open-world find → **hologram** presence (not montage) |

---

## A. What this game is

Gokul hands her the flat ring card (real wedding ring on it) and the Tab S7.

She scans the card. Gold traces the real ring. Screen is fogged; she **wipes with her finger**; **Aishwarya** appears. A **home AR gold ring** can sit on the table — heartbeat glow, real shadows, room-matched light, stays pinned.

Then the house is an **open world**. She walks with the Lens. She cannot see the secret points. As she nears one, the tablet **vibrates harder** and **edges blink** toward it. On target, an AR ring appears.

- **Friends ring** → snowglobe / friends **montage video**  
- **Guardian Angel ring** → he appears as a **hologram** (dust-assemble WOW), speaks wishes (mixed Tamil + English), then **stays** in the room like he’s really there  

She can leave, move, close, or reopen those rings.

Then the **card hunt** (chapters 1–3), seals, music-box vaults **MICROWAVECUPBOARD** · **GOLDJEWELRYPOUCH** · **UNDERSTAIRS**. Card 23 is only hidden behind the uncle framed photo (different hunt image). Card 29 is in the **car boot**.

After under-stairs gift: **Finish Quest** → letter (one more grand gift) → rescan **physical wedding ring** → ring rises → **Look up** → Gokul. No 0510 typing. No candle.

Full B Good + WOW list: `RELIQUARY_LENS_APK_FEATURES.md`.

---

## B. Player flow

See `RELIQUARY_LENS_APK_FLOW.md` (source of truth).

1. Hand card + real ring + tablet  
2. Scan → wipe fog → name → home AR ring  
3. Open-world find Friends ring + Guardian Angel ring (vibe + edge blink)  
4. CH1 01–09 → vault MICROWAVECUPBOARD  
5. CH2 11–19 → vault GOLDJEWELRYPOUCH  
6. CH3 21–22 → card 23 hide-only → 24–27 → 28–29 boot → vault UNDERSTAIRS  
7. Finish Quest → rescan wedding ring → Look up → Gokul  

---

## C. Card map (summary)

Places/letters/riddles: `RELIQUARY_LENS_APK_LOCKED_RIDDLES.md` + registry when imported.  
**29 = car boot.** **23 = hide only.** No tall-boy uncle trigger row.

Vaults: Latch Click / Velvet Pocket / Stairs Dust Drift.

---

## D. Locked design moments

- Wipe wake · heartbeat home ring · shadows · room light · Night Lens · thermal ease-off  
- Open-world hidden finds (Friends + Guardian Angel)  
- Guardian Angel = hologram presence; Friends = montage video  
- Wax seal · music-box vaults · collection scrapbook · hints · Back · chapter colours · save  
- Finale Finish Quest + physical ring rescan  
- Mini-Me **Gokul** 2D captions only  
- Living Glass navy/gold/cyan · Cinzel / Source Sans 3 / Caveat  

---

## E. Stack

Unity 6 LTS · URP · AR Foundation 6.x · ARCore 6.x · Input System · UI Toolkit · TMP · Shuriken · VideoPlayer→RenderTexture · GameCI · offline landscape Tab S7.

**Tech notes for open-world finds:** player never sees markers; under the hood each secret needs a **world anchor** (tiny hidden print or setup-placed pose). Bare furniture tracking is unreliable — do not use as primary lock.

---

## F. Decisions + features

- Answers: `RELIQUARY_LENS_APK_DECISIONS.md`  
- B + WOW: `RELIQUARY_LENS_APK_FEATURES.md`  

---

## G. Hard rules

- Never invent riddles / vault words / letters  
- No Ginger · no web MindAR · no 0510 keypad · no candle · no PIN gate  
- Friends ≠ Guardian Angel content type  
- Master + DECISIONS + FEATURES win on conflict; flag to Gokul  

---

## Confirm

- [x] Open-world Friends + Guardian Angel early finds  
- [x] Wipe wake · B Good + WOW  
- [x] Card 23 hide-only · card 29 boot · no tall-boy trigger  
- [x] Finale Finish Quest → wedding ring → Look up  
- [x] No 0510 / no PIN / no candle  
