# Companion GLB models
#
# Drop your final art here (exact names):
#   minime.glb   — stylized husband Mini-Me
#   ginger.glb   — orange & white tabby Ginger (quest guide)
#                 C-G1 drop target: GINGER_MODEL.localUrl = /models/ginger.glb
#
# Desktop art (not in this git repo):
#   ProjectAR-Blender/01-references/ginger-*
#   ProjectAR-Blender/03-export/ginger.glb  → copy here as ginger.glb
#
# Full Blender checklist (clip names, export, size limits):
#   ../../BLENDER_COMPANION_CHECKLIST.md
#   (or project root: BLENDER_COMPANION_CHECKLIST.md)  — see §2.1 C-G1
#
# Until those files exist:
#   minime.glb missing → CDN RobotExpressive demo
#   ginger.glb missing → procedural tabby (GINGER_MODEL.demoUrl is null; no Fox)
# Local files always win over demos / procedural.
#
# Rules:
# - Prefer .glb (single file)
# - Keep under ~6–8 MB each for iPhone 14
# - Do not invent a placeholder ginger.glb; do not pack Ginger into minime.glb
# - Name Actions exactly: Idle, Talk, WalkIn, Peek, Smile, Lean, Glass, Jump
#   Ginger C-G1 ship-first: Idle, Sit, WalkIn (or Walk)
#   Ginger also wired: Leap, Nuzzle, Peek, Glass, Loaf, Stretch, Lick, Bat, Roll, Sleep, Yarn
