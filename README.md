# Bubu & Dudu | Al Rescate

Juego de plataformas 2D en Phaser 3 y Vite. El Nivel 1 se diseña con Tiled y usa recursos CC0 de Kenney Pixel Platformer; consulta `CREDITS.md`.

## Desarrollo

```powershell
npm install
npm run generate:level
npm run validate:level
npm run dev
```

`npm run build` genera la versión de producción.

## Nivel 1 y Tiled

Edita `assets/maps/level_01.tmx` con Tiled: es la fuente editable. Phaser carga `assets/maps/level_01.json`. `npm run generate:level` es deliberadamente no destructivo y comprueba que ambos archivos existen; nunca vuelve a escribir el TMX de un diseñador. Para reconstruir la plantilla de referencia de forma explícita se usa `node scripts/generate-level-01.mjs --write`, únicamente cuando se desea descartar el diseño actual.

Capas de tiles: `Background`, `Ground`, `Platforms`, `Decorations`.

Capas de objetos: `Coins`, `Enemies`, `Hazards`, `Checkpoints`, `Spawn_Exit`. Los cactus son objetos `cactus` en `Hazards`; no deben añadirse como decoración ni dentro de precipicios. Enemigos y peligros usan propiedades de objeto (por ejemplo `range`) y no posiciones codificadas en Phaser.

El mapa está formado por cinco zonas: introducción, primer desafío, exploración con ruta superior opcional, checkpoint y desafío final. La física actual da a Bubu una altura teórica de salto de ~192 px y un alcance de ~329 px; los escalones y huecos de la plantilla están por debajo de esos límites.

### Modo de prueba local

Abre `levels/level_1.html?character=bubu&test=1` durante QA. Este modo deja disponibles las 23 monedas y añade el botón **Prueba: reiniciar nivel**: recarga solamente la partida de prueba y no modifica las monedas permanentes ni el progreso. El progreso normal se guarda por `localStorage`, que el navegador separa por origen; por tanto `localhost:5173` y una IP de red como `10.60.1.6:5173` mantienen historiales independientes.

## Bubu

Los sprites oficiales están en `public/assets/characters/bubu/`. La documentación de estados, fotogramas y transición está en `docs/bubu-animations.md`.

Dudu permanecerá bloqueado hasta disponer de sus sprites oficiales separados bajo `public/assets/characters/dudu/`.
