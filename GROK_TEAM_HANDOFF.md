# Project AR — Full Team Handoff (Initial → Current)
**For:** Gok Bot / Grok / any new teammate joining the birthday quest build  
**Day-to-day:** Bot (Grok) `8357d67c` — CEO / Pepper Potts (replaces `cd3c9309`, 2026-09-23 NZ)  
**Owner (major gates):** Gokul — taste, spend, go-no-go, deploy only  
**Recipient:** Aishwarya — 30th birthday (Protocol 0510 · DOB 5 Oct 1996)  
**Target device:** iPhone 14 · Safari  
**Budget cap:** ~USD $200 (DIY engine/characters; spend on uncle video + prints)  
**Status snapshot:** 23 Sep 2026 NZ — **BOARD UNPARKED** after Gokul token reset. CEO / Pepper Potts = Bot `8357d67c` (was `cd3c9309`). Producer under Bot; Gokul = taste / spend / go-no-go / deploy. One Cursor job at a time; no status theater. `ginger.glb` on `main` (PR #7: Idle/Sit/WalkIn, ≤8MB; procedural fallback retired when file present). Queued behind Bot wakes: print AR scan go/no-go (Printicular mats) → Hunt training crop `64,64,1072,1260` → transition lean (Uncle A / Floo Ember) → Montage last

---

## 0. Read this first (current status)

**BOARD UNPARKED** 2026-09-23 (NZ) after Gokul token reset. **One Cursor job at a time. No status theater.** Queued work waits for a Bot wake.

**Org.** Day-to-day CEO / Pepper Potts = Bot (Grok) **`8357d67c`** (replaces prior Bot `cd3c9309`, 2026-09-23 NZ). AR Producer routes **under Bot**. Gokul = major taste, spend, go-no-go, deploy only. Details: `GROK_BOT_TEAM.md`.

`ginger.glb` on `main` (PR #7, SHA `7b9f8d1`): **Idle / Sit / WalkIn**, ≤8MB. Procedural fallback **retired for Ginger when the file is present**. Do **not** invent puzzle content. Hard locks unchanged. `DeviceFrame` / `CaptionRail` stay. Do **not** touch `minime.glb`.

### Current status

| Item | Truth on `main` |
|---|---|
| **Board** | **UNPARKED** 2026-09-23 after Gokul token reset. One Cursor job at a time. No status theater. |
| **Ch1 hunt shell** | **On `main` (PR #2).** Help → Unlock with Code → letter collect → **`MICROWAVECUPBOARD` workbench**. Persistence: `localStorage` `project-ar-hunt-v1` (v2). AAA chrome intact. |
| **AR training** | **Cards 01 and 11 photo crops trained** (MindAR `public/ar/targets/photo-crop.mind`). `hasTrainedImageTargets()` is true. Crop **locked** **`64, 64, 1072, 1260`** on 1200×1800 — photo only. 8th Wall console payload is **not** trained; missing key falls back to MindAR and says so. Do not train from `card_registry.json` `canvas`. |
| **Print gate** | Print pack **ordered** Printicular matte 6×4. **Physical go/no-go still pending** when Gokul picks up. Hunt Image Target training only after that scan go/no-go. |
| **C-G1 Ginger** | **Load path landed (PR #5).** Drop path **`/models/ginger.glb`**. Checklist: `BLENDER_COMPANION_CHECKLIST.md` §2.1. |
| **ginger.glb** | **On `main` (PR #7, SHA `7b9f8d1`).** Clips: **Idle / Sit / WalkIn**, ≤8MB. Procedural fallback **retired when the file is present**. |
| **Transitions** | Lean **queued, not built:** Uncle **A** / Floo **Ember**. |
| **Uncle** | Short **`ehqNWIrxr60` live** (after montage only; not in the reel; not from card 23). |
| **Montage** | Real edit **LAST**, when clips ready. |

Ch1 payloads MIX/CRY/OW/AVZ/EC/UP/BO/AR/DQ; full bible bypasses only. Desktop may still be ahead for print PNGs / photos / compiler.

### Queued behind Bot wakes (this order)

1. Print AR scan go/no-go (Printicular mats).  
2. Hunt Image Targets for the remaining photo cards — same locked crop as cards 01 and 11 (`AR_PHOTO_CROP_1200x1800` only).  
3. Transition lean (Uncle A / Floo Ember).  
4. Montage last.

### Locked chrome (do not regress)

Magical-phone AAA bar: `DeviceFrame` + `CaptionRail` (speech not on faces). Navy velvet / gold / cyan HUD. Fonts Cinzel + Source Sans 3. Tokens in `src/theme.js`. Full bar: `UI_BLUEPRINT.md`.

---

## 1. What this project is

Private in-home romantic quest: a **React + Vite + Three.js** web app plus physical **Instax photo-card WebAR** scavenger hunt.

**Theme:** *The Search for a Stray Heart*  
She walks through the shared home as a living scrapbook-reliquary for one night, guided by stylized 3D companions, collecting pieces of a lost heart.

**Not:** a generic AR demo, Unity App Store app, photoreal face-on-body avatar, outdoor GPS map.

---

## 2. Locked product flow

```
gateway (accept / No-trap — AAA chrome, no scroll clutter)
  → floo swirl (~1.6s)
  → prank (99% freeze → face kiss)
  → video_montage (friends & family ONLY — no uncle)   ← clips pending ~2 days
  → uncle_hologram (YouTube Short ehqNWIrxr60 — wish → continue)
  → scavenger_hunt (27 card scans + 3 workbench object ARs)
  → look_up_finale (real Gokul in the room — not in the phone)
```

| Phase | App state (`App.jsx`) | Status |
|---|---|---|
| Unboxing | `gateway` | Built — AAA DeviceFrame / CaptionRail |
| Floo | transition overlay | Built |
| Kiss prank | `prank` | Built — AAA chrome |
| Montage | `video_montage` | Shell ready — **`MONTAGE_YOUTUBE_ID` empty** |
| Uncle | `uncle_hologram` | **Live** — Short `ehqNWIrxr60` |
| Hunt | `scavenger_hunt` | **Placeholder UI** — camera AR not wired |
| Finale | look-up | Planned |

---

## 3. Characters (locked)

| Character | Form | Role |
|---|---|---|
| **Mini-Me / Gokul-Mage** | Stylized Tripo + Blender GLB | Narrator / husband |
| **Ginger** | Stylized 3D tabby (`ginger.glb` on `main`: Idle / Sit / WalkIn) | Quest guide; present through hunt |
| Real faces | Instax cards + montage video | Memory layer |
| Late uncle | Post-montage YouTube Short | Wish (**not** in montage, **not** card-spawn) |
| Real Gokul | In the room | Grand gift at finale |

**Rule:** Do **not** put photoreal faces on continuous 3D companion bodies.

---

## 4. Repo & folder map

### App (code)
```
C:\Users\aishw\OneDrive\Desktop\Project AR\project-ar-app\project-ar-app\
```

| Path | Purpose |
|---|---|
| `src/App.jsx` | Master screen state machine |
| `src/index.css` / `src/theme.js` | AAA theme tokens |
| `src/components/ui/DeviceFrame.jsx` | Shared glass HUD bezel |
| `src/components/ui/CaptionRail.jsx` | Shared cinematic captions |
| `src/components/Screen1Gateway.jsx` | Accept quest (no-scroll AAA) |
| `src/components/Screen2Prank.jsx` | Kiss prank |
| `src/components/ScreenVideoMontage.jsx` | Friends/family video |
| `src/components/ScreenUncleHologram.jsx` | Uncle wish Short |
| `src/components/ScreenHunt.jsx` | Hunt UI (**placeholder** — AR next) |
| `src/config/media.js` | YouTube IDs (uncle live; montage blank) |
| `src/config/companionModels.js` | GLB URLs + clipAliases |
| `src/utils/gltfCharacter.js` | Load GLB, poses, **SkeletonUtils.clone**, driveFace |
| `public/models/minime.glb` | Current Mini-Me art |
| `public/models/ginger.glb` | **On `main` (PR #7, `7b9f8d1`)** — clips Idle / Sit / WalkIn |

### Docs (source of truth)
| File | Role |
|---|---|
| `PROJECT_AR_MASTER_SYSTEM_ARCHITECTURE_AND_BLUEPRINT_V3.md` | Locked product + tech |
| `UI_BLUEPRINT.md` | **AAA magical-phone UI bar** |
| `BLENDER_COMPANION_CHECKLIST.md` | Clip names, export, Tripo mapping |
| `GROK_TEAM_HANDOFF.md` | This file |
| `Resources - drafts/Project AR.txt` | Content bible — **do not invent puzzle words** |
| `Resources - drafts/AR_SAFE_ZONE.md` | Print → WebAR crop coords |

### Print / photos (Resources)
```
C:\Users\aishw\OneDrive\Desktop\Project AR\Resources - drafts\
```

| Path | Role |
|---|---|
| `project_ar_photos/Chapter_1_Everyday/` | Cards 01–09 photos |
| `project_ar_photos/Chapter_2_Detective/` | Cards 11–19 |
| `project_ar_photos/Chapter_3_Finale/` | Cards 21–29 |
| `project_ar_photos/backs/minime_avatar_v1.jpg` | Back-side mini-me render |
| `card_registry.json` | Letters + quotes + photo paths (source of truth for compile) |
| `project-ar-card-compiler-aaa-hybrid.mjs` | **Primary** Node+sharp compiler |
| `project-ar-card-compiler-aaa-hybrid.py` | Pillow twin (Python optional) |
| `Compiled_Print_Ready_Cards_AAA/` | **54 PNGs ready** (27 front + 27 back) |
| `project-ar-card-compiler-final.py` | Legacy cream/pink Instax — do not overwrite |
| `project-ar-card-catalog.xlsx` | Spreadsheet mirror of registry |

### Stack
- React 19 + Vite 8 + Three.js r175  
- Scripts: `npm run dev` / `build` / `preview`  
- Dev server typically `http://localhost:5173/`

---

## 5. Journey so far (initial → current)

### Phase A — Product lock
- Heart Reliquary vision; 30-step hunt; vaults `MICROWAVECUPBOARD` / `GOLDJEWELRYPOUCH` / `UNDERSTAIRS`
- WebAR: 8th Wall free Image Targets primary; MindAR backup
- Image target = **full photo**, not letter box

### Phase B — App shell
- Gateway → prank → montage → uncle → hunt state machine
- EnchantedCanvas3D; companion director; procedural fallbacks

### Phase C–F — Character pipeline
- AccuRIG / Mixamo.com downloads / bad Blender retargets rejected  
- **Chosen:** Tripo Smart Mesh (Mixamo bone names) + Text-to-Motion + Blender face morphs/cardigan  
- Face morphs in current `minime.glb`; Tripo Priority-2 AI clips **await explicit deploy**  
- Do not global auto-weight Tripo skin (head detach history)

### Phase G — AAA UI overhaul (19 Sep 2026) ← **major discussion change**
- User feedback: companions looked 2D/static; UI too game-like  
- Locked **AAA magical-device** chrome across all screens  
- `DeviceFrame` + `CaptionRail`; gateway no-scroll; strip cheap particles  
- Companion skin fix: **SkeletonUtils.clone** (not `scene.clone`) for Mixamo skins  
- Caption speech must not cover Ginger/Mini-Me  

### Phase H — Uncle media
- CapCut Seedance talking video + ElevenLabs Tamil + lip sync  
- YouTube Short **`ehqNWIrxr60`** wired in `media.js`  
- Montage deferred ~2 days (awaiting friend/family clips)

### Phase I — AAA hybrid print cards (19 Sep 2026) ← **current**
- 27 photos + registry letters/quotes compiled  
- Front: navy + cream Instax mat + gold letter capsules; **photo zone clean for AR**  
- Back: navy + shared mini-me avatar + act labels (same outfit until detective/aviator renders exist)  
- Output: `Compiled_Print_Ready_Cards_AAA/` (54 files)  
- AR crop for current 6×4 fronts: **`64, 64, 1072, 1260`** (`AR_PHOTO_CROP_1200x1800`). Ignore `card_registry.json` `canvas` when training.  
- Note: `card_01` + `card_28` were HEIC mislabeled as JPG — converted to real JPEG for sharp

---

## 6. How companions work in code

1. `useCompanionDirector` picks weighted `BEHAVIORS` every ~7–12s  
2. Sets Mini-Me + Ginger pose + CaptionRail speech + audio  
3. `MiniMeAvatar3D` → local `minime.glb` → else procedural  
4. `gltfCharacter` uses **SkeletonUtils.clone**; `playPose` via `clipAliases`  
5. `driveFace(pose, talking, lipAmp, t)` for morphs  

**Gated:** Do **not** pack Tripo AI clips into `public/models/minime.glb` until Gokul says **deploy**.

---

## 7. WebAR hunt + print rules (do not deviate)

| Rule | Detail |
|---|---|
| Image target | Unique **photograph** (safe zone crop only) |
| Letters | Reward payload for anagrams — **not** AR targets |
| Why | Letter boxes look alike → engine false-matches |
| Vaults only | Quests 10 / 20 / 30 object AR |
| Bypass | Type password / letters if camera fails |
| Card 23 | Uncle photo = letter only; no uncle spawn |
| Uncle timing | After montage only |

**Anagrams (locked — never invent):**
- `MICROWAVECUPBOARD`
- `GOLDJEWELRYPOUCH`
- `UNDERSTAIRS`

**Recompile cards:**
```bash
cd "C:\Users\aishw\OneDrive\Desktop\Project AR\Resources - drafts"
npm install
node project-ar-card-compiler-aaa-hybrid.mjs --sample
node project-ar-card-compiler-aaa-hybrid.mjs
```

---

## 8. Current status checklist

| Area | Status |
|---|---|
| App flow screens | Built |
| AAA UI chrome (DeviceFrame / CaptionRail / theme) | **Shipped** |
| Companion director + captions | Built |
| `minime.glb` face morphs + Priority-1 | In public |
| Tripo AI Priority-2 body clips | Generated; **await deploy** |
| `ginger.glb` | **On `main` (PR #7, `7b9f8d1`)** — Idle / Sit / WalkIn, ≤8MB; procedural fallback retired when file present |
| Transitions | Lean **queued, not built** (Uncle A / Floo Ember) |
| Uncle YouTube Short | **Live** `ehqNWIrxr60` |
| Montage YouTube / clips | **LAST** — when clips ready |
| Hunt camera / 8th Wall / MindAR | **Not wired** — train only after physical print AR scan go/no-go |
| AAA print PNGs (54) | **Ready** in `Compiled_Print_Ready_Cards_AAA/` |
| Physical Printicular matte 6×4 | **Ordered** — physical go/no-go pending pickup |
| Board | **UNPARKED** 2026-09-23 after Gokul token reset |
| Detective/Finale back outfits | Optional later (same avatar now) |

---

## 9. Next actions (queued behind Bot wakes)

**Board UNPARKED** 2026-09-23. One Cursor job at a time. No status theater.

1. **Print AR scan go/no-go** — Printicular mats  
2. **Hunt Image Targets** — cards 01 and 11 are trained on **`64, 64, 1072, 1260`**. Remaining cards use that same crop.  
3. **Transition lean** — Uncle A / Floo Ember  
4. **Montage last** — when clips arrive → CapCut/YouTube → set `MONTAGE_YOUTUBE_ID`

---

## 10. Hard rules for any bot (including Gok Bot)

1. Do **not** invent puzzle words, vault anagrams, letter payloads, or uncle dialogue — content bible / Gokul only  
2. Do **not** overwrite `minime.glb` with Tripo AI pack without explicit **deploy**  
3. Do **not** train AR on letter capsules — photo safe zone only  
4. Do **not** regress UI to parchment/wax-scroll / purple-void / mouth bubbles covering companions  
5. Do **not** spawn uncle from card 23 or put uncle in the montage  
6. Do **not** global auto-weight Tripo skin; prefer Mixamo **bone names** only (not Mixamo.com downloads)  
7. Keep GLBs ≤ ~6–8 MB for iPhone Safari  
8. Do **not** edit the locked cream compiler as the production path — use AAA hybrid `.mjs`  
9. Do **not** edit plan files unless asked; prefer working code + this handoff  

---

## 11. Key commands

```bash
# App
cd "C:\Users\aishw\OneDrive\Desktop\Project AR\project-ar-app\project-ar-app"
npm run dev

# Cards
cd "C:\Users\aishw\OneDrive\Desktop\Project AR\Resources - drafts"
node project-ar-card-compiler-aaa-hybrid.mjs
```

Blender (art workspace):
```
C:\Users\aishw\OneDrive\Desktop\ProjectAR-Blender\
```
```bash
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python path\to\script.py
```

---

## 12. One-paragraph elevator pitch

Project AR is Aishwarya’s 30th-birthday private quest: a romantic React/Three.js “Heart Reliquary” phone experience with **AAA magical-device UI** (navy/gold/cyan HUD), stylized Mini-Me + Ginger (`ginger.glb` Idle/Sit/WalkIn on `main`), kiss prank, friends/family montage (clips pending — last), uncle’s Tamil YouTube Short wish (`ehqNWIrxr60`), then a 30-step Instax-card WebAR hunt ending with “look up.” Printicular mats are ordered; physical AR scan go/no-go is still pending. Queued behind Bot wakes: that scan go/no-go, Hunt Image Target training (crop `64,64,1072,1260`), transition lean (Uncle A / Floo Ember), then montage last. Board unparked 2026-09-23.
