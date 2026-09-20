# WebAR assets (not in this PR)

No trained Image Targets or `.mind` files ship here.

When training later:

1. Crop **B+D+E 6×4 fronts (1200×1800)** to `x=64, y=64, w=1072, h=1260`.
2. Use the **photograph only** — never letter capsules.
3. Prefer 8th Wall free Image Targets; keep MindAR as backup (`VITE_AR_ENGINE`).
4. Chapter 1 vault object AR (microwave cupboard) stays a stub until a later ticket.
