# AR safe zone — photograph crop only

Train WebAR **Image Targets on the photo rectangle**. Never train letter capsules, gold frames, or Instax mats — those shapes repeat across cards and false-match.

## Current print fronts (B+D+E 6×4)

Canvas: **1200 × 1800** px

| | x | y | w | h |
|---|---:|---:|---:|---:|
| **Photo crop** | **64** | **64** | **1072** | **1260** |

Code constant: `AR_PHOTO_CROP_1200x1800` in `src/config/ar.js`.

## This build

- No Image Targets are uploaded or trained in this PR.
- 8th Wall (primary) and MindAR (backup) are **stubs** behind `VITE_AR_ENGINE` (`stub` | `eighthwall` | `mindar`).
- Chapter 1 is playable via bypass + letter collect → `MICROWAVECUPBOARD` workbench.
- Vault object AR (microwave cupboard) is a placeholder stub only.

## Legacy compiler canvas (do not use for 6×4 fronts)

630 × 1020 with crop `36, 36, 558 × 744` — kept only as historical note from the smaller AAA hybrid compiler.
