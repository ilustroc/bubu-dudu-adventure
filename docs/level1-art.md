# Arte del Nivel 1

El panorama `assets/levels/level1/forest-parallax.png` se mantiene intacto como
fondo (`SkyBackground`, parallax 0.025); los árboles y montañas dibujados dentro
del panorama siguen formando parte de esa imagen.

La vegetación independiente vive en dos capas de tiles editables desde Tiled:

| Capa | Profundidad | Contenido |
| --- | --- | --- |
| `BackgroundVegetation` | 1 (detrás de Bubu) | árboles multitile de Kenney y arbustos de `forest-hills` |
| `ForegroundVegetation` | 8 (delante de Bubu) | brotes, helechos, pinos y arbustos pequeños |

Ambas capas usan los dos tilesets del mapa: `kenney_pixel_platformer`
(`firstgid` 1) y `forest-hills` (`firstgid` 181). No reciben cuerpo de Arcade
Physics, así que se pueden atravesar. `createWorldDecorations()` ya no existe:
Phaser dibuja exactamente los tiles guardados en `level_01.json`.

El panorama es una ilustración original generada localmente; los sprites de
árboles, brotes, monedas, puertas y hongos proceden del paquete local Kenney
Pixel Platformer (CC0).

## Cómo editar la vegetación en Tiled

1. Abrir `assets/maps/level_01.tmx` con Tiled 1.10 o superior.
2. Seleccionar `BackgroundVegetation` o `ForegroundVegetation` en el panel de
   capas.
3. Elegir el tileset de Kenney o `forest-hills` y pintar con el sello.
4. Para un árbol grande, pintar o copiar la estructura multitile de 3×5: copa
   `17/18/19`, `37/38/39`, `57/97/59` y tronco `116/137` (índices locales de
   Kenney). También se puede convertir en objeto de tile si se prefiere.
5. Apoyar siempre la base sobre `Ground` o `Platforms`; no pintar vegetación
   sobre un precipicio. `npm run validate:level` detecta grupos flotantes.
6. Guardar el TMX y exportarlo a JSON (`level_01.json`) para que Phaser muestre
   los cambios.

## Tileset de colinas

`assets/levels/level1/tilesets/forest-hills.png` usa una cuadrícula de 12×8
tiles de 18×18 px. `forest-hills.tsx` permite abrirlo desde Tiled como un
tileset independiente. Incluye caps de césped, pendientes, rellenos de tierra
sin bordes oscuros repetidos, pequeñas plataformas y arbustos con flores; en el
Nivel 1 se usa para los arbustos de ambas capas de vegetación.

## Escala visual

- Mundo: 18 px por tile × escala 3 = 54 px.
- Bubu: contenido visible de `run.png` de 56 px × 1.4 = ~78 px, aproximadamente
  1.5 tiles; el collider no cambia.
- Checkpoint: textura 24×34 px × 1.9 = ~65 px, aproximadamente 1.2 tiles.
- Moneda: tile Kenney × 3; su dibujo visible queda cercano a 0.85 tiles.
- Enemigos de hongo: tile Kenney × 3; el dibujo visible mide aproximadamente
  0.8–1 tile.

## Enemigos de pradera

La hoja local `tilemap-characters_packed.png` contiene cápsulas y robots, por
lo que no se usa como enemigo del Bosque Encantado. Tras inspeccionar ambos
atlases de 18/24 px, los seis objetos existentes de la capa `Enemies` se
representan con el hongo terrestre de `tilemap_packed.png` (frame local 128).
Los patrulleros reciben un tinte más claro: sus posiciones, rangos, velocidades
y cuerpos físicos no se modifican.
