# Grok Bot team — Project AR

Cursor + this GitHub repo are the **single source of truth**. Grok Bots read this file and `GROK_TEAM_HANDOFF.md`; they do not keep a parallel plan.

**Org (23 Sep 2026 NZ — BOARD UNPARKED)**

| Seat | Role |
|---|---|
| **Bot (Grok) `8357d67c`** | Day-to-day **CEO / Pepper Potts** (replaces prior Bot `cd3c9309` as of 2026-09-23 NZ). Integrator, Cursor bridge. |
| **AR Producer** | Executes planning/routing **under Bot**. Checklists, hard-rule gate, update `GROK_TEAM_HANDOFF.md` after GitHub lands. |
| **Gokul** | Major **taste**, **spend**, **go-no-go**, **deploy** only. Not day-to-day routing. |

**One Cursor job at a time. No status theater.** Queued work waits for a Bot wake.

## Standing bots
| Bot | Role |
|---|---|
| Bot (Grok) `8357d67c` | Day-to-day CEO / Pepper Potts. Wakes others; Gokul only on major taste / spend / go-no-go / deploy |
| AR Producer | Plans, checklists, hard-rule gate, routing — **under Bot** |
| AR Architect | UI / transitions / SFX / AAA mobile-browser design advice within locked React+Vite+Three.js+WebAR; research proposals; no core-concept changes. Wake when Bot schedules |

## On-call bots (Bot schedules wake → work → pause)
| Bot | When |
|---|---|
| AR Hunt | **Cards 01 and 11 trained** on crop `64, 64, 1072, 1260` (MindAR backup; 8th Wall cloud payload still absent). Remaining photo cards queued. |
| AR Companion | `ginger.glb` on `main` (PR #7): Idle/Sit/WalkIn, ≤8MB. Procedural fallback retired for Ginger when the file is present. Do not touch `minime.glb`. |
| AR Montage | Friends-family montage → `MONTAGE_YOUTUBE_ID` — **last**, when clips ready |

## Cursor cloud agents
Every coding session: read `GROK_TEAM_HANDOFF.md` §0 + this file first. **One Cursor job at a time.** Push via normal GitHub flow.

## Hard rules
1. Do not invent puzzle words, vault anagrams, letter payloads, or uncle dialogue.
2. Do not overwrite `public/models/minime.glb` without Gokul’s explicit **deploy**.
3. AR targets = photo crop only (`64, 64, 1072, 1260` on 1200×1800); never letter capsules. No trained targets yet.
4. Do not regress AAA magical-phone UI (DeviceFrame / CaptionRail; navy/gold/cyan).
5. Uncle Short `ehqNWIrxr60` after montage only — not in montage, not from card 23.
6. Do not global auto-weight Tripo skin; keep GLBs ≤ ~6–8 MB.

## Channel
Grok team room: **Project AR**. **No status theater.** Board **UNPARKED** 2026-09-23 after Gokul token reset. Ping Gokul only for major taste, spend, go-no-go, deploy.
