# AR safe zone — photograph crop only

Train WebAR **Image Targets on the photo rectangle**. Never train letter capsules, gold frames, or the lower gutter — those shapes repeat across cards and false-match.

## Current print fronts (B+D+E 6×4)

Canvas: **1200 × 1800** px

| | x | y | w | h |
|---|---:|---:|---:|---:|
| **Photo crop** | **64** | **64** | **1072** | **1260** |

Code constant: `AR_PHOTO_CROP_1200x1800` in `src/config/ar.js`.

Cards **01** and **11** are compiled from that crop into `public/ar/targets/photo-crop.mind`. Letters stay in `card_registry.json` (`01` → `M - I - X`, `11` → `G - O - F`).

## This build

- MindAR backup is trained for cards 01 and 11. `hasTrainedImageTargets()` is true.
- 8th Wall is still primary in the product sense, but **no console Image Target payload** is in the repo. Missing `VITE_8THWALL_APP_KEY` or cloud training falls back to MindAR and says so.
- `VITE_AR_ENGINE` remains `stub` | `eighthwall` | `mindar`. Unset uses MindAR when the `.mind` file is registered.
- Chapter 1 vault object AR (microwave cupboard) stays a placeholder stub.

## Frozen registry canvas

`card_registry.json` `canvas` is byte-locked Desktop compiler metadata. Do not train from `canvas.arSafeZone`. The only crop for these 6×4 fronts is `AR_PHOTO_CROP_1200x1800`.
