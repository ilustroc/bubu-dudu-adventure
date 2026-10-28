# Bioma Pradera — fase 2: recursos del bosque

Se obtuvieron 49 sprites decorativos de `bosque_tileset_original.png` sin redibujar la imagen original y 9 recortes de terreno como referencia.

**Instalación en C:\GitHub\bubu-dudu-adventure:**

1. Extrae el ZIP en la raíz del repositorio (contiene `public/` y `scripts/`).
2. Conserva `public/assets/backgrounds/bosque_tileset_original.png` como imagen maestra.
3. En Tiled, `Mapa > Nuevos conjuntos de patrones...` / `Add External Tileset...`: selecciona `public/assets/biomas/pradera/decorations/pradera-decoraciones.tsx`.
4. Elige una capa decorativa sin colisiones y estampa el área completa del árbol (3 columnas × 5 filas) o arbusto (2 × 2), no cada celda suelta.
5. IMPORTANTE: agregar el tileset al TMX y exportar JSON es solo la mitad: **Phaser debe cargar su PNG y asociarlo con `addTilesetImage`**. Hasta integrar esa carga, las piezas nuevas pueden verse en Tiled pero NO en el juego.
6. No elimines Kenney ni `assets/levels` aún: los mapas y la escena todavía los utilizan.

`decorations/pradera-decoraciones.png` — atlas con cuadrícula real 18x18, 18 columnas.
`decorations/individuales/` — recortes individuales de alta resolución.
`collectibles/moneda_pradera_4frames.png` — 4 fotogramas de 18x36 horizontal (72x36 total); requiere integración con Phaser.
`terrain/recortes_fuente/` — recortes de suelo solo para referencia, **no garantizan continuidad automática**. Ground intacto.
`manifest-decoraciones.json` — posiciones y tamaños dentro del atlas.
`scripts/preparar_terreno_pradera.py` — genera todos los recursos desde la imagen maestra.

**No se modifican** `assets/maps/level_01.tmx`, `assets/maps/level_01.json`, ni `src/game/game-scene.js` mediante el script.

Para regenerar (necesita Pillow):

```powershell
cd C:\GitHub\bubu-dudu-adventure
python scripts\preparar_terreno_pradera.py
```

Nota: esta versión está preparada como atlas editable en Tiled; faltan su integración y pruebas visuales de runtime para utilizarlo en el nivel.
