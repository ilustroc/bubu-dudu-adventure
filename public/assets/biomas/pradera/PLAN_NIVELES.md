# Bubu & Dudu al Rescate — Bioma 1: Pradera Encantada

Cinco niveles que reutilizan el mismo estilo grafico y los mismos sprites.

| Nivel | Objetivo de aprendizaje | Novedad propuesta | Dificultad |
|---|---|---|---|
| 1 | Familiarizarse con controles y salto | Recorrido existente, puerta animada, checkpoint | 1/5 |
| 2 | Saltos y ritmo | Slimes y huecos alternados | 2/5 |
| 3 | Saltos verticales | Hongos y plataformas escalonadas | 3/5 |
| 4 | Leer patrones enemigos | Caracoles, abejas y cambios de altura | 4/5 |
| 5 | Integracion de mecanicas | Mezcla con checkpoints espaciados y salida final | 5/5 |

Conservar constantes la velocidad de Bubu, el alcance de salto y el numero de vidas. La dificultad debe aumentar mediante configuracion de rutas, enemigos, huecos, plataformas y timing, sin saltos imposibles.

## Organizacion prevista

public/assets/biomas/pradera/
    animations/puerta_bosque.png
    animations/bandera_roja.png
    animations/bandera_verde.png
    enemies/slime_verde.png
    enemies/hongo_rojo.png
    enemies/caracol.png
    enemies/abeja.png
    manifest.json

Las decoraciones y terreno de bosque_tileset_original.png deben separarse y adaptarse a Tiled antes de reemplazar Ground y Platforms. No tratar ese PNG como una hoja uniforme de tiles 18x18.

No eliminar assets/levels ni Kenney hasta cambiar todas sus referencias en Phaser, Tiled y la validacion.
