# Recursos bosque separados para Tiled

Este paquete se extrajo de la imagen aportada. Cada elemento grande tiene su PNG transparente separado. Los sprites de escena conservan su tamaño original; una copia escalada con vecino más próximo al 25 % se incluye para el mapa Tiled de 18x18.

## Carpetas

- `arboles`, `arbustos`, `flores_y_plantas`, `rocas`, `enredaderas_y_plataformas`, `monedas`, `objetos_varios`: PNG originales separados.
- `terreno_original`: bloques completos recortados del PNG original.
- `componentes_originales`: copias automáticas por contorno sin los ajustes de separación de árboles.
- `tiled_objetos_25pct`: versiones reducidas con nearest-neighbor, ideales para el juego.
- `terreno_tiled_18x18`: 30 bloques de 18x18 PNG independientes listos para pintar.
- `tilesets/terreno_18px.png` + `terreno_18px.tsx`: atlas de 30 bloques.
- `tilesets/objetos_bosque.tsx`: colección de imágenes que enlaza a PNG independientes.

## Cómo cargar en Tiled

1. Abre `assets/maps/level_01.tmx`.
2. Abre `Mapa > Añadir conjunto de patrones externo` y selecciona los TSX de `tilesets/`.
3. Usa `bosque_terreno_18px` con el pincel sobre `Ground` o `Platforms` (cuidado: es un nuevo tileset, hay que exportar JSON y adaptarlo en Phaser).
4. Los árboles/arbustos con tamaño variable se colocan como objetos de patrón en una capa de objetos decorativa, no con el pincel de terreno.

**Importante:** Agregar tilesets a Tiled no los integra automáticamente al renderizador Phaser. Si se usan en el nivel, también hay que cargar las imágenes y registrar los nuevos tilesets en `src/game/game-scene.js` antes de renderizar la capa.

**Nota visual:** Los bloques de 18x18 se dibujaron como piezas compatibles con la cuadrícula tomando la paleta de la imagen. No son recortes 1:1 del material de alta resolución porque el original no tiene una cuadrícula exacta de 18x18. Los demás objetos sí son recortes de la fuente. Algunos elementos originalmente superpuestos pueden conservar pequeños fragmentos de vegetación cercana.

## Totales

- PNG separados por contornos clasificados: 130
- PNG terreno Tiled: 30
- TSX: 2
- PNG imagen original del bosque: 128

## Cantidades por categoría
- arboles: 5
- arbustos: 23
- enredaderas_y_plataformas: 21
- flores_y_plantas: 31
- monedas: 4
- objetos_varios: 8
- rocas: 7
- terreno_original: 31
