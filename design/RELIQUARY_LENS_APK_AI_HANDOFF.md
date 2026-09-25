# Reliquary Lens — Android APK AI Handoff (Unity) — LOCKED

```
RELIQUARY LENS — ANDROID APK HANDOFF (Unity)
Share this whole file + locked riddles + flow + decisions with Cursor / Google AI Studio.
Thala (Grok Bot) is offline for ~5 days. Do not wait for Thala.
Old browser/web game and PR #18 are FROZEN — do not build them.
Corrected Flow Lock — 25 Sep 2026.
```

**Written for Gokul · locked 25 September 2026 (NZ / Auckland)**  
**Birthday target:** ~5 October 2026  
**Device:** Samsung Galaxy Tab S7 / S7+ · landscape · offline  
**Repo:** `gokulkrish140795-droid/project-ar-app`

Companion files in `/design/`:
- `RELIQUARY_LENS_APK_MASTER_PACK.md` — design truth
- `RELIQUARY_LENS_APK_LOCKED_RIDDLES.md` — every riddle (never invent)
- `RELIQUARY_LENS_APK_FLOW.md` — player journey
- `RELIQUARY_LENS_APK_DECISIONS.md` — **15 answers LOCKED**
- `design-data/` — card 29 place lock
- `README_START_HERE.md`

---

## 0. How to use this handoff

### For Gokul

1. Open **`README_START_HERE.md`** first.
2. Skim the **master pack** + locked **DECISIONS**.
3. Each morning, find today's day number; do the "Gokul does" steps.
4. Coding: paste matching prompt from `prompts/` when those files exist (or Day blocks below).
5. Art: Google AI Studio / Google Flow — section 5.
6. Every evening: sideload APK to Tab S7; tick section 7.

### For Cursor

Build **Reliquary Lens APK** — private Unity Android AR birthday game.

**Hard rules in section 1. Never invent riddles, love lines, vault words, or letter sets.**  
Import only from locked riddles + card registry/locations when present.

**Corrected Flow Lock (must follow):**
- Card **23** = hunt hide only behind uncle framed photo — **does not** trigger uncle walk-out.
- Uncle walk-out = aim at **pooja tall boy** with discreet AR marker on furniture (not uncle photo; bare wood alone is unreliable).
- Card **29** place = **car boot** (not key chain).
- Finale = **Finish Quest** → letter → rescan **physical wedding ring** → rise → **Look up**. **No Protocol 0510 typing UI.**
- No rehearsal PIN. No candle. No Ginger.
- Ring glossary: physical wedding ring ≠ printed ring card ≠ AR gold ring (see master pack).

### For Google AI Studio / Google Flow

Art and video only. Uncle video: green screen, gentle walk-out, ghostly soft glow. Captions later: mixed Tamil + English.

---

## 1. Hard rules (never break)

1. **Never invent** riddles, love lines, vault words, letter sets.
2. **Import only** from locked riddles + registry/locations.
3. **No Ginger** — Mini-Me speaker name is **Gokul**.
4. **One engine:** Unity 6 URP + AR Foundation + Google ARCore XR Plugin.
5. **Offline** · Tab S7 / S7+ · **landscape**.
6. Vault words: `MICROWAVECUPBOARD` · `GOLDJEWELRYPOUCH` · `UNDERSTAIRS`. Finale is **Finish Quest + wedding-ring rescan** (not 0510 keypad).
7. **Final gift is Gokul (Look up)** — no eclipse, no gift rising from AR home ring as the gift.
8. Web / PR #18 **FROZEN**.
9. Decoy letters intentional.
10. Master pack + DECISIONS win on conflict; flag to Gokul.

---

## 2. Locked decisions (use these — not old defaults)

Full text in **`RELIQUARY_LENS_APK_DECISIONS.md`**. Summary for builders:

| Topic | Locked |
|---|---|
| Snowglobe timing | Right after AR gold ring place |
| Uncle beat | Pooja tall boy (marker-assisted) — **not** card 23 / not uncle framed photo |
| Card 23 | Hide behind uncle photo only; different hunt image |
| Card 29 | **Car boot** |
| Finale | Finish Quest → rescan physical wedding ring → Look up (**no 0510 typing**) |
| Ring presentation | Flat printed card + real wedding ring |
| Candle | **No candle** |
| Friends / uncle montages | Separate slots after snowglobe; media later |
| Uncle captions | Mixed Tamil + English |
| Rehearsal PIN | **None** — Gokul around her |
| Gokul during play | Around her (including car help as needed) |
| Home for AR gold ring | Soft: lounge near sofa; wherever she places it |
| Uncle full-body AR | Proceed |
| Vault gifts | Real gifts yes (items day-of) |

---

## Day-by-day plan (5 days)

### Day 0 — Confirm lock

**Gokul does:** Skim master pack + DECISIONS + FLOW. No need to re-answer the 15 questions unless changing the lock.

**Builders:** Treat DECISIONS as locked.

### Day 1 — Unity install + empty project + GitHub + GameCI APK

Same as prior handoff: Unity 6 LTS, URP project `ReliquaryLens`, `/unity` + `/design` + `/media`, GameCI, sideload empty APK to Tab S7.

**Done when:** empty APK installs and opens on Tab S7.

### Day 2 — Spine

AR camera, place AR gold ring stub, caption strip, fog/blow stub, image-target stub.

**Done when:** section 7 Day-2 boxes pass.

### Day 3 — Chapter 1 + vault 1

Cards 01–09 + vault `MICROWAVECUPBOARD` + Latch Click stub.

**Done when:** section 7 Day-3 boxes pass.

### Day 4 — CH2 + CH3 + uncle + car + finale

- Cards 11–19 + vault `GOLDJEWELRYPOUCH`
- Cards 21–29 path + vault `UNDERSTAIRS`
- Card 23 = letter/seal only (no uncle video)
- Separate **pooja tall boy** image target → mist + uncle video plane
- Cards 28–29 car dim; card 29 boot presentation
- After vault 30: **Finish Quest** → letter → wedding-ring rescan stub → rise → **Look up**
- **Do not** build 0510 keypad

**Done when:** section 7 Day-4 boxes pass.

### Day 5 — Polish + Tab S7 rehearsal

Mini-Me, snowglobe media, montage slots (placeholders OK), Night Lens, full walkthrough. No PIN gate.

**Done when:** section 7 Day-5 boxes pass.

---

## 3. Click-by-click Unity + GitHub + GameCI setup

Keep versions flexible: **Unity 6 LTS latest `6000.x`**.

### 3.1–3.2 Unity account + Hub
Unity ID Personal · Hub · Unity 6 LTS · modules: Android Build Support, OpenJDK, Android SDK & NDK Tools.

### 3.3 New project
3D (URP) · name `ReliquaryLens`.

### 3.4 Packages
AR Foundation 6.x · Google ARCore XR Plugin 6.x · Input System.

### 3.5 Player Settings
Landscape · min API 29+ · IL2CPP · ARM64 · ARCore Required.

### 3.6 GitHub layout

```
project-ar-app/
  (existing web files — FROZEN)
  /unity/
  /design/          ← this locked pack lives here
  /media/
  /.github/workflows/unity-android.yml
```

Branch option: `apk/unity`. Copy locked design files into `/design/`.

### 3.7 GameCI sketch

`game-ci/unity-builder` · `projectPath: unity` · `targetPlatform: Android` · secrets `UNITY_LICENSE` / `UNITY_EMAIL` / `UNITY_PASSWORD`.

### 3.8 Sideload Tab S7
Unknown apps · allow Camera + Microphone.

---

## 4. Cursor prompts index

When `prompts/` files exist:

| File | When |
|---|---|
| `CURSOR_PROMPT_01_PROJECT_SPINE.md` | Day 2 |
| `CURSOR_PROMPT_02_CH1_VAULT1.md` | Day 3 |
| `CURSOR_PROMPT_03_CH2CH3_FINALE.md` | Day 4 — must include Finish Quest finale + tall-boy uncle + boot card 29 |
| `CURSOR_PROMPT_04_POLISH.md` | Day 5 |
| `STUDIO_MINIME.md` / `FLOW_UNCLE.md` / etc. | Art |

One Cursor run per prompt file.

---

## 5. Art prompts (unchanged intent)

Mini-Me "Gokul" 2D sheet · gold ring reference · wax seal · fog · gold dust · Google Flow uncle full-body green-screen walk-out (respectful, no furniture sit). Captions in app: mixed Tamil + English.

---

## 6. Repo layout

```
project-ar-app/
  /unity/
  /design/     ← locked pack (this folder)
  /media/
```

---

## 7. Acceptance tests per slice (Tab S7)

### Day 1
- [ ] Unity project opens without red errors
- [ ] `/unity` (or `apk/unity`) present
- [ ] APK installs and launches on Tab S7

### Day 2 — Spine
- [ ] Landscape lock; AR camera preview
- [ ] Place AR gold ring stub; basic drag/rotate/resize
- [ ] Caption strip; menu/help; Back stub
- [ ] Fog + mic permission path
- [ ] Image-target scan stub

### Day 3 — CH1 + vault 1
- [ ] Cards 01–09 riddles exact from locked file
- [ ] Letters match registry; decoys kept
- [ ] Vault accepts **MICROWAVECUPBOARD** only + Latch Click stub
- [ ] Save/resume mid-chapter

### Day 4 — CH2/CH3 + finale
- [ ] Cards 11–19 + **GOLDJEWELRYPOUCH** + Velvet Pocket stub
- [ ] Cards 21–29 + **UNDERSTAIRS** + Stairs Dust Drift stub
- [ ] Card 23 does **not** play uncle video
- [ ] Pooja tall-boy target triggers uncle mist + video plane
- [ ] Card 29 treated as **boot** location
- [ ] **Finish Quest** → letter → wedding-ring rescan stub → rise → **Look up**
- [ ] **No** 0510 keypad / typing UI
- [ ] No eclipse; no Ginger strings

### Day 5 — Polish
- [ ] Mini-Me peek captions only
- [ ] Snowglobe real media or placeholder
- [ ] Montage slots graceful if media missing
- [ ] Night Lens / quality fallback
- [ ] No PIN required for rehearsal (Gokul present)
- [ ] Offline airplane mode playable

---

## 8. Media drop checklist

| Item | Status |
|---|---|
| Ring-card photo | Need |
| Uncle framed photo (hide furniture only) | Need |
| Pooja tall-boy AR marker print | Need |
| Uncle Flow green-screen video | Need |
| Uncle wish audio + mixed Tamil/English captions | Later |
| Snowglobe photos/clips | Later |
| Friends montage | Later slot |
| Uncle ghost montage | Later slot (after friends) |
| Mini-Me PNGs | Need |
| Hunt cards 01–29 printed | Need before birthday |
| Card 29 placed in **car boot** | Day-of |

---

## 9. Day-of birthday runbook (~5 Oct 2026)

Morning
- [ ] Tab S7 100% + charger nearby
- [ ] Offline confirm
- [ ] Reset progress for real run
- [ ] Hide cards 01–29 (29 in **boot**)
- [ ] Real gifts: microwave cupboard · gold jewelry pouch · under-stairs
- [ ] Flat ring card + real wedding ring ready
- [ ] Uncle framed photo undisturbed (card 23 hide)
- [ ] Tall-boy marker affixed discreetly
- [ ] Gokul around her; know Look-up standing spot for finale

Finale
- [ ] After Finish Quest + ring rise + Look up — be there. You are the gift.

---

## 10. What NOT to do

- Don't revive Ginger or web MindAR / PR #18
- Don't invent vault words or riddles
- Don't wait for Thala
- Don't build Protocol **0510** typing UI
- Don't trigger uncle from card 23 or uncle framed photo
- Don't hide card 29 on the key chain
- Don't add candle / eclipse / gift-rising finale from AR home ring
- Don't require internet for play

---

## Quick stack reminder

- Unity 6 LTS `6000.x` · URP · AR Foundation 6.x · ARCore 6.x
- Landscape · ARM64 · min API 29+
- Living Glass navy/gold/cyan · Cinzel / Source Sans 3 / Caveat
- Vaults: Latch Click / Velvet Pocket / Stairs Dust Drift
- Finale: Finish Quest + physical wedding ring rescan → Look up

End of handoff. Start Day 0 / Day 1. Do not wait for Thala.
