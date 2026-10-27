# Animaciones oficiales de Bubu

Los archivos fuente se mantienen en `public/assets/characters/bubu/`. Las versiones normalizadas se generan con `npm run normalize:bubu` y nunca sustituyen sus fuentes.

| Estado | Fuente | Rejilla / fotogramas | FPS | Regla |
| --- | --- | --- | --- | --- |
| idle | `idle.png` | 1 imagen 256×256, normalizada a 64×64 | 1 | Apoyado y sin movimiento |
| run | `run.png` | 4×4, 16 frames | 12 | Movimiento horizontal |
| jump | `jump.png` | 4×4, 16 frames | 16 | Inicio del salto |
| fall | `fall.png` | 4×4, 16 frames | 12 | Velocidad vertical positiva |
| hurt | `hurt.png` | 5×4, 17 frames útiles | 18 | Una vez; bloquea movimiento |
| cry | `cry.png` | 4×4, 16 frames | 10 | Última vida; prioridad absoluta |
| victory | `victory.png` | 20×16 fuente; 272 frames compactados a 16×17 | 18 | Portal; bloquea controles |

Prioridad: `cry` → `victory` → `hurt` → `jump/fall` → `run` → `idle`.

Para habilitar Dudu más adelante, añade la misma convención de archivos bajo `public/assets/characters/dudu/`, incorpora sus metadatos al controlador y elimina su bloqueo del menú. Nunca se reutilizan fotogramas de Bubu para Dudu.
