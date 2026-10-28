# Pradera · recursos consolidados para Tiled

Este ZIP une dos paquetes del usuario, colocando el parche de terreno y tres árboles **por encima** del paquete inicial.

- 42 tiles del terreno corregido en `terreno_tiled_18x18/` y `tilesets/terreno_18px.png`.
- Árboles corregidos `arbol_pino_01.png`, `arbol_pino_02.png` y `arbole_001.png` (originales y versiones al 25 %).
- Todas las demás imágenes, plantas, flores, monedas, rocas y TSX del primer paquete conservadas.
- `tilesets/objetos_bosque.tsx` contiene 99 entradas que enlazan correctamente a sus PNG.
- `correccion_aplicada/` contiene vistas y documentación del parche.

**Solo recursos fuente**: al descomprimir no se modifican ni los mapas TMX/JSON, ni la escena ni las colisiones. `bosque_terreno_18px` está listo para Tiled pero requiere integración de tileset en Phaser antes de pintar el mapa. Para árboles y arbustos de tamaño variable convienen capas de objetos visuales en Tiled, y su soporte en Phaser es una tarea posterior.

Nota: se actualizaron los anchos de los pinos 97 y 98 en objetos_bosque.tsx para coincidir con las imagenes corregidas.
