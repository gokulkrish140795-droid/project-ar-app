# Reliquary Lens — Android APK AI Handoff (LOCKED v2)

```
Unity APK handoff · Tab S7 · offline · Corrected Flow Lock v2 · 25 Sep 2026
Web / PR #18 FROZEN · Do not wait for Thala
```

**Repo:** `gokulkrish140795-droid/project-ar-app` · **Design folder:** `/design/`

Read with: `MASTER_PACK` · `FEATURES` · `DECISIONS` · `FLOW` · `LOCKED_RIDDLES`

---

## Hard rules

1. Never invent riddles, love lines, vault words, letters.  
2. Import locked riddles + registry/locations when present.  
3. No Ginger. Mini-Me = **Gokul** (captions only).  
4. Unity 6 URP + AR Foundation + ARCore only.  
5. Offline · landscape · Tab S7 / S7+.  
6. Vaults: `MICROWAVECUPBOARD` · `GOLDJEWELRYPOUCH` · `UNDERSTAIRS`.  
7. Finale: **Finish Quest** + physical wedding-ring rescan → Look up. **No 0510 keypad.**  
8. **Guardian Angel** = room hologram (not montage). **Friends** = montage video via AR ring.  
9. **No** pooja tall-boy uncle trigger. Card 23 hide-only. Card 29 = **boot**.  
10. Fog clear = **finger wipe**. No rehearsal PIN gate. No candle.

---

## Locked flow summary (builders)

1. Scan ring card → wipe fog → name → home AR ring (heartbeat, pin, shadows, room light).  
2. Open world: 2 hidden anchors → rising vibe + edge blink → Friends ring + Guardian Angel ring.  
3. Rings movable / closable / reopenable. Dust-assemble WOW on holograms.  
4. Hunt chapters → vaults → understairs.  
5. Finish Quest → rescan real wedding ring → rise → Look up.

Open-world tech: player never sees markers; each find needs a **world anchor** under the hood (tiny hidden print or setup pose). Do not rely on bare wood furniture tracking.

Full B Good + WOW: `RELIQUARY_LENS_APK_FEATURES.md`.

---

## Days 0–5

| Day | Aim |
|---|---|
| 0 | Confirm locked `/design/` pack |
| 1 | Unity 6 LTS URP + `/unity` + GameCI empty APK on Tab |
| 2 | Spine: AR cam, wipe fog stub, home ring place/pin, captions, vibe stub, edge-blink stub, image-target stub |
| 3 | CH1 01–09 + vault MICROWAVECUPBOARD + seal + collection stub |
| 4 | Open-world Friends + Guardian Angel finds · CH2/CH3 · boot card 29 · Finish Quest finale |
| 5 | B polish (shadows, Night Lens, thermal, music-box, hints) + WOW dust + Tab rehearsal |

### Day 4 must include

- [ ] Hidden-find vibe intensity + edge blink for Friends + Guardian Angel  
- [ ] Friends ring → montage/snowglobe video path  
- [ ] Guardian Angel ring → hologram presence (stays); **not** montage UI  
- [ ] Card 23 does **not** spawn angel  
- [ ] No tall-boy target required  
- [ ] Card 29 = boot  
- [ ] Finish Quest → wedding-ring rescan → Look up  
- [ ] No 0510 UI · no PIN gate  

### Day 5 acceptance extras

- [ ] Features B list smoke (wipe, heartbeat, blur, seal, dials, collection, hint, Back, colours, save, Night Lens, quality ease-off)  
- [ ] Dust-assemble on Guardian Angel (or stub particles)  
- [ ] Airplane mode playable  

---

## Unity setup (abbrev)

Hub → Unity 6 LTS · Android + OpenJDK + SDK/NDK · New **3D (URP)** `ReliquaryLens` · Packages: AR Foundation 6.x, ARCore XR 6.x, Input System · Player: Landscape, API 29+, IL2CPP, ARM64, ARCore Required.

```
project-ar-app/
  /unity/
  /design/   ← this pack
  /media/
  /.github/workflows/unity-android.yml
```

GameCI: `game-ci/unity-builder` · `projectPath: unity` · Android artifact · secrets UNITY_LICENSE / EMAIL / PASSWORD.

---

## Art

- Studio: Mini-Me Gokul sheet · ring · seal · fog · gold dust  
- Flow: Guardian Angel full-body green-screen → idle loop (respectful); chroma for hologram plane  
- Captions: mixed Tamil + English  
- Friends montage media: attach later OK  

---

## Day-of (abbrev)

Charge Tab · offline · reset progress · hide cards (29 in boot) · real vault gifts · ring card ready · hidden anchors for Friends + Angel set · Gokul around her · Look-up spot ready.

## Do not

Revive Ginger / web MindAR · invent codes · 0510 keypad · PIN gate · candle · tall-boy uncle trigger · bare-furniture primary tracking · wait for Thala.
