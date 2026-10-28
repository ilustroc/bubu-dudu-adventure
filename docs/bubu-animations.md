# Animaciones oficiales de Bubu

Los sprites de Bubu se mantienen directamente en `public/assets/characters/bubu/`. `idle.png` es el recurso de 64×64 usado por Phaser; `idle-original.png` conserva la fuente de alta resolución.

| Estado | Fuente | Rejilla / fotogramas | FPS | Regla |
| --- | --- | --- | --- | --- |
| idle lateral | frame 0 de `run.png` | 4×4, frame 0 | 1 | Reposo inmediato: conserva perfil y pies de Run |
| idle prolongado | `idle.png` | 1 imagen 64×64 | 1 | Tras 5 segundos sin movimiento, pose frontal intencional |
| run | `run.png` | 4×4, 16 frames | 9 | Movimiento horizontal |
| jump | `jump.png` | 4×4, 16 frames | 11 | Inicio del salto |
| fall | `fall.png` | 4×4, 16 frames | 10 | Velocidad vertical positiva; también se mantiene durante una caída a un precipicio |
| hurt | `hurt.png` | 5×4, 17 frames útiles | 18 | Una vez; bloquea movimiento |
| cry | `cry.png` | 4×4, 16 frames | 10 | Última vida; prioridad absoluta |
| victory | `victory.png` | 5×4, frames 0–19 | 8 | Secuencia completa de 20 frames (~2.5 s): sonrisa, brazos, salto, estrellas y corazones |

Prioridad: `cry` → `victory` → `hurt` → `jump/fall` → `run` → `idle lateral` → `idle prolongado`. Hurt, Cry y Victory finalizan con `animationcomplete`; Victory espera una pausa breve y la entrada visual por la puerta antes de abrir el modal. Los FPS y tiempos de caída/puerta viven en `src/game/player.js` (`ANIMATION_FPS` y `PLAYER_TIMING`).

Para habilitar Dudu más adelante, añade la misma convención de archivos bajo `public/assets/characters/dudu/`, incorpora sus metadatos al controlador y elimina su bloqueo del menú. Nunca se reutilizan fotogramas de Bubu para Dudu.
