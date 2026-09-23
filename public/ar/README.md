# WebAR photo targets

Trained MindAR backup for the photograph rectangle only.

| Card | Registry letters | Crop file | Mind index |
| --- | --- | --- | --- |
| 01 | `M - I - X` | `targets/card_01_photo.png` | 0 |
| 11 | `G - O - F` | `targets/card_11_photo.png` | 1 |

Compiled file: `targets/photo-crop.mind`

## Crop

B+D+E 6×4 fronts are 1200×1800. Train on **x=64, y=64, w=1072, h=1260** (photo region). Do not include letter discs, quotes, or the lower gutter.

`hasTrainedImageTargets()` is true because this `.mind` file exists. 8th Wall console training is **not** done (`EIGHTH_WALL_CLOUD_TRAINED` is false). With no `VITE_AR_ENGINE`, the app uses MindAR. `VITE_AR_ENGINE=eighthwall` without a cloud payload also falls back to MindAR and keeps that reason. `VITE_AR_ENGINE=stub` does not open the camera.

## Recompile

```bash
npm install --prefix /tmp/pup puppeteer-core
PUPPETEER_CORE=/tmp/pup/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js \
  node scripts/compile-photo-targets.mjs
```

The script checks each crop is 1072×1260 and that MindAR matches the cropped photo back to its own target.

## Phone smoke test

iPhone Safari needs HTTPS (or localhost on that phone).

1. Open the hunt (`?phase=scavenger_hunt` in dev).
2. Tap **Aim at the photograph** and allow the rear camera.
3. Fill the frame with the **photo** on printed card 01 (keep the letter discs out of the crop you trained). `M I X` collects and the step advances.
4. Show card 11’s photo. `G O F` appears from the registry and does not enter the Chapter 1 workbench tiles.

Samsung Chrome can use the same tap-to-start path.
