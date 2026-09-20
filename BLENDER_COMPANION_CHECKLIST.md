# Project AR — Blender Companion Checklist
**Mini-Me (Gokul-Mage) + Ginger (quest guide)**  
Target device: iPhone 14 Safari · Style: stylized Pixar-adjacent · Not photoreal

---

## 1. Goal (read once)

You build and animate in **Blender**.  
You export **`.glb`** files.  
The React + Three.js app **loads** them and **plays** your clips at story moments.

| Role | Character |
|---|---|
| Narrator / husband | Mini-Me |
| Quest guide (leads, reacts, leaps on “No”) | Ginger |
| Together beat | Nuzzle scene (both standing / touching) |

Real faces stay on Instax cards + montage + uncle video.  
Companions stay **stylized 3D**.

---

## 2. File deliverables

Drop finished files here:

```
public/models/minime.glb
public/models/ginger.glb
```

Optional later:

```
public/models/companions_nuzzle.glb   ← both in one clip if easier
```

| Rule | Target |
|---|---|
| Format | **`.glb` only** (single file) |
| Size each | **≤ 6–8 MB** (smaller is better on iPhone) |
| Scale | Standing on ground at origin `(0,0,0)`, facing **+Z** or toward camera |
| Units | Meters; Mini-Me ~1.0–1.2 m tall in Blender is fine (app re-scales) |
| Materials | Principled BSDF → bake/simplify; avoid heavy subsurface + particle fur |
| Textures | Prefer 1–2K max; pack into GLB |

---

## 2.1 C-G1 — Ginger drop-path (docs only; no GLB invented)

**Ticket:** confirm the app load path and export checklist so a future ≤~6–8 MB `ginger.glb` drops cleanly. Do **not** generate a placeholder binary.

### App load wiring (already in repo)

| Piece | Path / value |
|---|---|
| Config | `src/config/companionModels.js` → `GINGER_MODEL` |
| Drop target | `GINGER_MODEL.localUrl` = **`/models/ginger.glb`** |
| Vite public file | **`public/models/ginger.glb`** (exact name; not in repo yet) |
| Viewport | `src/components/GingerCat3D.jsx` calls `resolveCompanionGltf(GINGER_MODEL)` |
| Resolver | `src/utils/gltfCharacter.js` — local URL first (HEAD/GET probe), then `demoUrl`, else `null` |
| Missing file | `demoUrl: **null**` → stay on **procedural** tabby (no CDN Fox) |
| Clip match | case-insensitive substring via `GINGER_MODEL.clipAliases` |

Until `public/models/ginger.glb` exists, GingerCat3D mounts procedural Ginger immediately, then upgrades only if the local GLB probes OK.

### Desktop art workspace (not in this git repo)

Use the existing Blender folder + `ginger-*` reference naming — do not invent meshes or clips here.

```
C:\Users\aishw\OneDrive\Desktop\ProjectAR-Blender\
  01-references/ginger-*     ← photos / short walk video (see §9)
  03-export/ginger.glb       ← Blender staging export when art exists
```

| Role | Exact path |
|---|---|
| References | `ProjectAR-Blender/01-references/ginger-*` |
| Staging export | `ProjectAR-Blender/03-export/ginger.glb` |
| App drop (this repo) | `public/models/ginger.glb` |

Copy the staging GLB into the app drop path. Do not pack Ginger into `minime.glb`.

### C-G1 ship-first Actions (already expected by `clipAliases`)

Name Actions exactly (case-insensitive match exists; exact is best). **Idle / Sit / Walk** are the minimum drop set; extra Priority-1 names below are already wired — export them when ready, do not invent new clip names.

| Action name | App pose | `clipAliases` fragments (existing) | Length |
|---|---|---|---|
| `Idle` | `idle` | `idle`, `survey`, `wait` | 2–4s loop |
| `Sit` | `sit` | `sit`, `idle`, `survey` | ~2s |
| `WalkIn` or `Walk` | `walkIn` | `walkin`, `walk`, `run` | ~1.5–2s |

After those three, keep using the Ginger Priority 1 / 2 tables in §5 (`Leap`, `Nuzzle`, `Peek`, `Glass`, then cute set). Director poses without a matching clip fall back to `idle` / `survey` / first clip.

### C-G1 hard locks

- **Procedural until `ginger.glb` ships.** Missing file is correct. Do not invent a fake / placeholder GLB.
- **Size:** each companion GLB **≤ ~6–8 MB** (iPhone 14 Safari).
- **Do not** pack Tripo AI clips (or Ginger) into `public/models/minime.glb` — Mini-Me deploy is a separate gated ticket.
- **Do not** global auto-weight skins (head-detach history on Tripo).
- **Photo AR crop / Hunt Image Targets are unrelated** — do not touch Hunt, montage, or DeviceFrame/AAA chrome for this ticket.
- Ginger cannot use Mini-Me’s humanoid Tripo Animate tab (`Boop` / `LoafOnHim` / `TailWrap` stay procedural until a real Ginger rig exists).

---

## 3. Look bible (so they feel “alive,” not toys)

### Mini-Me
- [ ] Recognisable you: **cardigan**, **gold chain**, **diamond stud**
- [ ] Big soft eyes, clear silhouette, slight asymmetry (one ear / stud sparkle)
- [ ] Soft toon / stylized PBR — not Roblox, not uncanny photoreal
- [ ] Mouth can open (jaw bone **or** shape key `mouthOpen`)

### Ginger
- [ ] Orange & white tabby, soft shapes
- [ ] Readable face from phone distance
- [ ] Tail + ears must move in Idle
- [ ] Skip ultra-fur (kills mobile). Use painted fur / normal map instead

---

## 4. Rigging checklist

### Mini-Me
- [ ] Humanoid armature (Mixamo-compatible is fine if you retarget)
- [ ] Root bone at feet
- [ ] Head / eyes / jaw (or mouth shape keys)
- [ ] Arms free for Glass (hands forward) and Lean

### Ginger
- [ ] Quad armature: spine, neck, head, 4 legs, tail, ears
- [ ] Root at paws
- [ ] Tail has 2–4 bones for swish

### Both
- [ ] Apply Scale / Rotation (`Ctrl+A`) before export
- [ ] No leftover ik constraints that break glTF (bake actions)
- [ ] Test play in Blender Timeline before export

---

## 5. Animation clips — **exact Action names**

Name Actions exactly like this (case-insensitive matching exists, but exact is best).

### Mini-Me — Priority 1 (ship these first)

| Action name | Length | What it is |
|---|---|---|
| `Idle` | 2–4s loop | Breath + tiny sway + **blink** every 2–4s |
| `Talk` | 2–3s loop | Mouth / face for voice lines |
| `WalkIn` | ~1.5–2.5s | Walks into frame |
| `Peek` | ~1.5–2s | Peeks from side |
| `Smile` | ~1.5–2s | Happy beat |
| `Lean` | ~2s | Leans toward Ginger (pairs with her Nuzzle) |
| `Glass` | ~2s hold | Hands / face pressed to phone glass (99% prank) |
| `Jump` | ~1s | Vault celebrate |

### Mini-Me — Priority 2 (nice + random director pops)

| Action name | Length | What it is |
|---|---|---|
| `Yarn` | ~1.5s | Throw / play with yarn |
| `Scratch` | ~1.5s | Gentle head-scratch Ginger |
| `Bump` | ~1.2s | Playful head bump |
| `Wave` | ~1.8s | Hello / accept quest |
| `Cheer` | ~1.5–2s | Mini fist-pump / “that’s my girl” |
| `FlyKiss` | ~2s | Blow a kiss toward camera |
| `WinkSmile` | ~1.5s | One-eye wink + grin |
| `MagicCast` | ~2s | Small wand flourish (accio heart) |
| `Search` | ~2–2.5s | Looks around for the missing heart |
| `Clap` | ~1.5s | Soft clap |
| `HeartHands` | ~2s | Hands make a heart at chest |
| `Dance` | ~2–3s loop | Compact two-step (not Mixamo dance_04) |

### Ginger — Priority 1
C-G1 ship-first is **`Idle` / `Sit` / `WalkIn` (or `Walk`)** — see §2.1. The rest of this table is already in `GINGER_MODEL.clipAliases`; export when the rig exists, do not invent extra Action names.

| Action name | Length | What it is |
|---|---|---|
| `Idle` | 2–4s loop | Tail swish, ear twitch, blink, weight shift |
| `WalkIn` | ~1.5–2s | Walk / trot into frame |
| `Leap` | ~0.8–1.2s | Arc leap onto “No” button |
| `Sit` | ~2s | Sit cute |
| `Nuzzle` | ~2s | Nuzzles Mini-Me (or sits into his Lean) |
| `Peek` | ~1.5s | Peek |
| `Glass` | ~2s | Paw on glass (prank) |

### Ginger — Priority 2 (random director cuteness)

| Action name | Use |
|---|---|
| `Loaf` | Loaf sit |
| `Stretch` | Big stretch |
| `Lick` | Paw lick |
| `Bat` | Bat at yarn / air |
| `Roll` | Side roll |
| `Sleep` | Tiny nap |
| `Yarn` | Chase / pounce yarn |

### Together (high wow — do when comfortable)

- [ ] One shot where both are in frame: Mini-Me `Lean` + Ginger `Nuzzle` (same timing ~2s)
- [ ] Either same file with two armatures, **or** separate GLBs timed in the app (app can sync)

---

## 6. Export settings (Blender → glTF 2.0)

**File → Export → glTF 2.0 (`.glb`)**

- [ ] Format: **glTF Binary (.glb)**
- [ ] Include: Selected Objects (or whole scene cleaned)
- [ ] Transform: **+Y Up**
- [ ] Geometry: Apply Modifiers ✓
- [ ] Animation: **Animations ✓**
- [ ] Animation: **NLA Strips** if you used NLA; else export Actions
- [ ] Shape Keys ✓ (if mouth uses them)
- [ ] Skinning ✓
- [ ] Materials: Export
- [ ] Compression: Draco optional (if you know it); otherwise leave off for first tests

After export:

- [ ] Open https://gltf-viewer.donmccurdy.com/ and confirm clips play
- [ ] File size ≤ 8 MB
- [ ] Copy into `public/models/`

---

## 7. Build order (don’t try everything day one)

1. [ ] Blockout bodies (recognisable silhouettes)
2. [ ] Texture pass (cardigan / tabby colours)
3. [ ] Rig + weight paint
4. [ ] **Idle + Talk** (Mini-Me) and **Idle + Leap** (Ginger) ← biggest wow for least work
5. [ ] WalkIn, Peek, Smile, Sit, Glass
6. [ ] Lean + Nuzzle together
7. [ ] Cute random set (Loaf, Stretch, Lick…)
8. [ ] Export → drop in `public/models/` → tell me to test on phone

---

## 8. What you do NOT need in Blender

- [ ] Full house environment (app does Heart Reliquary background)
- [ ] Camera AR / 8th Wall (separate)
- [ ] Uncle character (video + star-dust in app)
- [ ] Photoreal skin / real filmed face on body
- [ ] 60 animation clips — Priority 1 is enough for birthday night

---

## 9. Reference photos to keep open while modelling

- [ ] You: front + ¾ smile (cardigan / chain / stud visible)
- [ ] Ginger: keep open `ProjectAR-Blender/01-references/ginger-*` (face, side, sitting, loaf — 6–10 photos)
- [ ] Optional: 1 short `ginger-*` walk video for WalkIn reference

---

## 10. Done definition

Companions are “done for birthday” when:

- [ ] `minime.glb` loads instead of demo robot; `ginger.glb` loads instead of **procedural** Ginger (no Fox)
- [ ] Idle loops look alive (blink / breath / tail)
- [ ] Talk plays with your voice MP3s
- [ ] Random director pops Cheer / FlyKiss / WinkSmile / Search (not stuck on one pose)
- [ ] Leap works on “No” trap
- [ ] Glass works on kiss prank
- [ ] Lean + Nuzzle plays at least once in gateway

When those are true, stop polishing and move to prints / uncle video.

---

## 11. Mini-Me animation sources (Tripo)

**AI Text-to-Motion** (custom, 20 credits each) — do not use Mixamo-style presets for these:

| App pose | Tripo clip name |
|---|---|
| `Talk` | Storytelling Gesture |
| `Peek` | Peeking Around Doorway |
| `Lean` | Leaning Affectionately |
| `Glass` | Pressing Invisible Phone Glass |
| `Cheer` | Celebratory Bounce |
| `FlyKiss` | Blowing a Kiss |
| `WinkSmile` | Standing Smile with Wink |
| `Shh` | Shh Gesture Pose |
| `Think` | Thinking Pose |
| `Surprise` | Sudden Surprise Reaction |
| `Point` | Pointing Motion |

**Standard Preset tab** — click these, do not generate:

| App pose | Preset |
|---|---|
| `Idle` | `idle` |
| `WalkIn` | `walk` |
| `Dance` | `dance_04` |
| `Jump` | `jump` |
| `Wave` | `greet_01` |
| `Clap` | `clap` |
| `Bow` | `bow` |
| `Laugh` | `laugh_01` |
| `HoldHeart` | `heart_pose` |
| `MagicCast` | `cast_a_spell` |
| `Search` | `look_around` |
| `Smile` | `agree` |

**Ginger** (`Boop`, `LoafOnHim`, `TailWrap`) cannot use this humanoid Animate tab — procedural until Ginger is rigged.

Do **not** copy Tripo AI Animation clips into `public/models/minime.glb` until Gokul confirms deploy.

### Face + cardigan pass (Blender, done)

| Item | Status |
|---|---|
| Shape keys `mouthOpen`, `smile`, `blink_L`, `blink_R` | in `minime_tripo_face_cardigan.blend` |
| App drives morphs via `driveFace()` (talk/wink/smile/blink) | yes |
| Cleared custom normals (black shade) | yes |
| Cardigan chest/side weight bleed → Spine/Shoulder | yes |
| Softened Glass / Peek / Lean arm extremes | yes |
| Staging GLB | `ProjectAR-Blender/03-export/minime_face_cardigan.glb` |
| App preview copy | `public/models/minime.glb` (backup: `minime_pre_face.glb`) |

**Honest limits:** Tripo’s face is a sealed painted mouth — morphs move skin, they don’t carve a real open jaw. Some hip clipping can remain on extreme poses until cardigan is retopo’d / re-weighted by hand. Tripo AI body clips are still not merged; await deploy for that.
