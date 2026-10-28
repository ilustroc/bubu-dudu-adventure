Bubu & Dudu — Forest Parallax Level 1

Source: original generated pixel-art scene, split into layers.
Files:
- sky.png: opaque background (1370 x 720)
- clouds.png: transparent cloud strip
- far_hills.png: transparent mountain strip
- near_hills.png: transparent rolling-hills strip
- back_forest.png: transparent forest strip
- front_vegetation.png: transparent foliage strip

In Phaser, render behind Ground and Platforms; sky at scrollFactor 0,
clouds at 0.05, far_hills at 0.12, near_hills at 0.28, back_forest at 0.48,
front_vegetation at 0.8 or as decorative in-game sprites.
Align using visual ground height, repeat horizontally with tileSprite or
repeating images. Some bands are artistic assets rather than mathematically
seamless tiles: inspect seams when scrolling; use mirror repeats if needed.
Do not use their opaque colored pixels for collision.
