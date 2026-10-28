# CORRECCIÓN PUNTUAL: terreno y 3 árboles

Este paquete sustituye SOLO recursos defectuosos del paquete anterior. Los demás arbustos, monedas, flores, rocas y decoraciones no se modifican.

## Archivos
- `arboles/arbol_pino_01.png`: pino primero completo.
- `arboles/arbol_pino_02.png`: pino segundo sin residuos flotantes.
- `arboles/arbole_001.png`: árbol redondo sin corte artificial de follaje ni arbustos en la base.
- `tiled_objetos_25pct/arboles/`: copia de los mismos tres árboles reducidos 4 veces con vecino próximo para la colección existente de Tiled.
- `terreno_tiled_18x18/`: 42 celdas de tierra individuales, transparentes cuando corresponde.
- `tilesets/terreno_18px.png`: atlas 108x126 píxeles (6 columnas × 7 filas).
- `tilesets/terreno_18px.tsx`: tileset de Tiled con tilewidth=18, tileheight=18 y 42 tiles.
- `vista_terreno.png`, `vista_arboles_antes_despues.png`, `ejemplo_mapa_mosaicos.png`: vistas de revisión.

## Para Codex
Copia el contenido de este paquete conservando la estructura. Reemplaza solo los 3 árboles, sus copias pequeñas, `tilesets/terreno_18px.png`, `tilesets/terreno_18px.tsx`, y `terreno_tiled_18x18` del paquete anterior. **No borres** los otros PNG ni recrees el mapa desde scripts. Verifica que el TSX encuentre la imagen en la misma carpeta.

### Integración Tiled/Phaser
- El PNG y TSX por sí solos no cambian el mapa de juego.
- Para ponerlo en Tiled abre `assets/maps/level_01.tmx` y añade `tilesets/terreno_18px.tsx` como conjunto de patrones externo.
- Usar el atlas de terreno sobre `Ground` y `Platforms` requiere exportar de nuevo `level_01.json` desde Tiled y registrar el nuevo tileset en `src/game/game-scene.js`, agregándolo a `createLayer` para su renderizado.
- Conservar ID/posición de objetos, colisiones, checkpoints, enemigos, monedas y parallax existentes.
- Cuidado: las rampas decorativas NO crean colisiones diagonales por sí solas; requieren física adaptada o superficies separadas.
- No crear commit ni push automático sin autorización.

## Validaciones
- Todos los tiles del atlas: 18x18.
- 42 celdas sin espaciado entre ellas.
- Los tres árboles conservan canal alfa y el acabado de la imagen original.
- Los árboles no necesitan ser forzados a un tile de 18x18; son objetos gráficos de dimensiones variables.
