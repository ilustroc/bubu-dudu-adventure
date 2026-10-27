# Bubu & Dudu | Al Rescate

Juego de plataformas 2D en Phaser 3 y Vite. El Nivel 1 se diseña con Tiled y usa recursos CC0 de Kenney Pixel Platformer; consulta `CREDITS.md`.

## Desarrollo

```powershell
npm install
npm run normalize:bubu
npm run generate:level
npm run dev
```

`npm run build` genera la versión de producción.

## Nivel 1 y Tiled

Edita `assets/maps/level_01.tmx` con Tiled. El JSON consumido por Phaser es `assets/maps/level_01.json`; ambos se regeneran desde la misma definición con `npm run generate:level` hasta que el flujo de autoría pase por exportación directa de Tiled.

Capas de tiles: `Background`, `Ground`, `Platforms`, `Decorations`.

Capas de objetos: `Coins`, `Enemies`, `Checkpoints`, `Spawn_Exit`.

## Bubu

Los sprites oficiales están en `public/assets/characters/bubu/`. Ejecuta `npm run normalize:bubu` después de reemplazarlos. La documentación de estados, fotogramas y transición está en `docs/bubu-animations.md`.

Dudu permanecerá bloqueado hasta disponer de sus sprites oficiales separados bajo `public/assets/characters/dudu/`.
