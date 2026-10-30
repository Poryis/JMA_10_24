# JMA Press Kit

Jelly of the Month Club Music Academy: screenshots and original artwork for the marketing site.

## Screenshots
- `screenshots/desktop/`: 1920×1080
- `screenshots/tablet/`: 1366×1024 (iPad landscape)

01 Academy interior · 02 Plaza · 03 Play street (Main Stage, Jelly Jukebox, Shred City) · 04 Learn street · 05 Create street · 06 Dressing Room · 07 Jam Session (guitar) · 09 Jelly Jukebox · 10 Detective Dr. Jellybone · 14 JMAtv · 15 Sight-Reading Sprint · 16 Charlie's Song Studio

## Hero loop video (`hero/`)
A seamless 10-second loop of the underwater Plaza with no sound and no app buttons.
- `jma-hero-loop-1920.webm` (2 MB) and `jma-hero-loop-1920.mp4` (5 MB): desktop
- `jma-hero-loop-1280.mp4` (1.9 MB): phones and slower connections
- `jma-hero-poster.jpg`: still frame to show while the video loads, and for reduced-motion visitors

```html
<video autoplay muted loop playsinline poster="jma-hero-poster.jpg">
  <source src="jma-hero-loop-1920.webm" type="video/webm">
  <source src="jma-hero-loop-1920.mp4" type="video/mp4">
</video>
```

## Artwork (transparent PNGs)
- `logos/`: JMA crest, white crest, JMAtv logo, harp icon
- `characters/`: Charlie, Dr. Jellybone, Finn, Jazzy, Chunk, Lou, Stew, Jelly Rap Trio
- `buildings/`: the Academy, Dressing Room trailer, Sticker Shack, Main Stage, and the game buildings
- `academy-room/`: every layer of the Academy interior (hall.jpg = back wall, then props)
- `dressing-room/`: room background, mirror, clothes rail
- `underwater-layers/`: the living underwater scene (see below)

## Building the living underwater hero
Stack these layers from back to front:

1. **Water:** solid colour `#34E0F6`
2. **`bands.png`:** light wave bands across the top, full width
3. **`sand-back-tile.png`:** back dune. Repeat horizontally (`background-repeat: repeat-x`, it tiles seamlessly), anchored to the bottom
4. **Accents on the back dune:** `seaweed-2.png`, `shell-1.png`
5. **`sand-front-tile.png`:** front dune, repeat-x, anchored to the bottom
6. **Front accents:** `seaweed-1.png`, `shell-2.png`
7. **Fish:** `fish-1.png`, `fish-2.png`, `fish-school.png`. All face RIGHT, so mirror them (`scaleX(-1)`) when they swim left. Drift slowly across the scene (20–40 s per crossing) with a gentle 3 s up-and-down bob
8. **Bubbles:** CSS circles (6–14 px, 1.5 px white border, `rgba(255,255,255,0.25)` fill) rising from below the scene and fading at the top

Motion tips: animate only `transform` and `opacity`, sway the seaweed from its base (`transform-origin: bottom center`, ±3°), and turn all motion off for visitors who prefer reduced motion (`@media (prefers-reduced-motion: reduce)`). Use the moving scene only in the hero section. Convert the images to WebP for speed.

## Brand
- Fonts: **Fredoka** (body and display), **Bungee** (marquee signs)
- Navy ink `#0A2540` · Jelly yellow `#FFCC00` · Water `#34E0F6` · Stage red `#C2213B`
- Tagline: "Where music friends play together"
