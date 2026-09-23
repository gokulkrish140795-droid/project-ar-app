# Grok Bot team — Project AR

Cursor + this GitHub repo are the **single source of truth**. Grok Bots read this file and `GROK_TEAM_HANDOFF.md`; they do not keep a parallel plan.

**Org (23 Sep 2026 NZ — BOARD UNPARKED)**

| Seat | Role |
|---|---|
| **Thala `8357d67c`** | Day-to-day **CEO / Pepper Potts** (this id was called Bot; replaces prior Bot `cd3c9309` as of 2026-09-23 NZ). Integrator, Cursor bridge. |
| **AR Producer** | Executes planning/routing **under Thala**. Checklists, hard-rule gate, update `GROK_TEAM_HANDOFF.md` after GitHub lands. |
| **AR Lead Game Tester `6efc9173`** | Former **AR Montage** seat. Reports to **Thala + AR Producer**. AAA playtest gate on iPhone Safari. Gaps → consult Architect → short improvement batch via Thala for Gokul approve/reject. **No Cursor unless woken.** Montage/media packing is **not** this role. |
| **Gokul** | **Taste**, **spend**, **go-no-go**, **deploy** only. Not day-to-day routing. |

**One Cursor job at a time. No status theater.** Short acks in the **Project AR** room only. Queued work waits for a Thala wake.

## Standing bots
| Bot | Role |
|---|---|
| Thala `8357d67c` | Day-to-day CEO / Pepper Potts. Wakes others; Gokul only on taste / spend / go-no-go / deploy |
| AR Producer | Plans, checklists, hard-rule gate, routing — **under Thala** |
| AR Architect | UI / transitions / SFX / AAA mobile-browser design advice within locked React+Vite+Three.js+WebAR; research proposals; no core-concept changes. Wake when Thala schedules. Lead Game Tester consults here on playtest gaps. |
| AR Lead Game Tester `6efc9173` | AAA playtest gate on iPhone Safari. Reports to Thala + AR Producer. No Cursor unless woken. |

## On-call bots (Thala schedules wake → work → pause)
| Bot | When |
|---|---|
| AR Hunt | **Soft open.** PR #10 merged (`9224231`): Image Targets + ScreenHunt camera for cards **01 + 11** on `main`. Crop `64, 64, 1072, 1260` photo-only. Physical iPhone + print smoke; 8th Wall cloud payload when a key exists. |
| AR Companion | `ginger.glb` on `main` (PR #7): Idle/Sit/WalkIn, ≤8MB. Procedural fallback retired for Ginger when the file is present. Do not touch `minime.glb`. |

**Montage.** Real friends-family edit is still **last** (Gokul may send a dummy video later). No seated montage/media-packing bot — that work left the former AR Montage seat.

## Cursor cloud agents
Every coding session: read `GROK_TEAM_HANDOFF.md` §0 + this file first. **One Cursor job at a time.** Push via normal GitHub flow. Lead Game Tester does not open Cursor unless Thala wakes that seat.

## Hard rules
1. Do not invent puzzle words, vault anagrams, letter payloads, or uncle dialogue.
2. Do not overwrite `public/models/minime.glb` without Gokul’s explicit **deploy**.
3. AR targets = photo crop only (`64, 64, 1072, 1260` on 1200×1800); never letter capsules. Cards **01 + 11** Image Targets + ScreenHunt camera are on `main` (PR #10, `9224231`). 8th Wall cloud payload only when a key exists.
4. Do not regress AAA magical-phone UI (DeviceFrame / CaptionRail; navy/gold/cyan).
5. Uncle Short `ehqNWIrxr60` after montage only — not in montage, not from card 23.
6. Do not global auto-weight Tripo skin; keep GLBs ≤ ~6–8 MB.

## Channel
Grok team room: **Project AR**. **Short acks in that room only. No status theater.** Board **UNPARKED** 2026-09-23. Ping Gokul only for taste, spend, go-no-go, deploy.
