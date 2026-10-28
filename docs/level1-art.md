# Arte del Nivel 1

El Nivel 1 conserva sus capas y objetos de Tiled sin cambios. Las capas de
escenario se crean como arte no colisionable en `ForestScene`:

| Capa | Recurso / uso | Parallax |
| --- | --- | --- |
| `SkyBackground` | `assets/levels/level1/forest-parallax.png` | 0.025 |
| `FarHills` | banda rasterizada del mismo panorama | 0.08 |
| `NearHills` | banda rasterizada del mismo panorama | 0.18 |
| `BackgroundDecorations` | `forest-hills.png`, vegetación suave | 0.36 |
| `ForegroundDecorations` | `forest-hills.png`, borde de césped | 0.65 |

El panorama es una ilustración original generada localmente para el proyecto;
no se descarga en tiempo de ejecución. Los sprites de árboles, brotes,
monedas, puertas y hongos proceden del paquete local Kenney Pixel Platformer
(CC0). Ninguna de estas capas recibe un cuerpo de Arcade Physics.

## Tileset de colinas

`assets/levels/level1/tilesets/forest-hills.png` usa una cuadrícula de
12×8 tiles de 18×18 px. `forest-hills.tsx` permite abrirlo desde Tiled como un
tileset independiente. Incluye caps de césped, pendientes, rellenos de tierra
sin bordes oscuros repetidos, pequeñas plataformas y arbustos. Es una fuente
para futuras capas de fondo y no sustituye todavía el terreno colisionable del
mapa existente.

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
