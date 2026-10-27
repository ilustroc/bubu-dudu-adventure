# Animaciones oficiales de Bubu

Los archivos fuente se mantienen en `public/assets/characters/bubu/`. Las versiones normalizadas se generan con `npm run normalize:bubu` y nunca sustituyen sus fuentes.

| Estado | Fuente | Rejilla / fotogramas | FPS | Regla |
| --- | --- | --- | --- | --- |
| idle lateral | frame 0 de `run.png` | 4×4, frame 0 | 1 | Reposo inmediato: conserva perfil y pies de Run |
| idle prolongado | `idle.png` | 1 imagen 256×256, normalizada a 64×64 | 1 | Tras 5 segundos sin movimiento, pose frontal intencional |
| run | `run.png` | 4×4, 16 frames | 12 | Movimiento horizontal |
| jump | `jump.png` | 4×4, 16 frames | 16 | Inicio del salto |
| fall | `fall.png` | 4×4, 16 frames | 12 | Velocidad vertical positiva |
| hurt | `hurt.png` | 5×4, 17 frames útiles | 18 | Una vez; bloquea movimiento |
| cry | `cry.png` | 4×4, 16 frames | 10 | Última vida; prioridad absoluta |
| victory | `victory.png` | 20×16 fuente; 272 frames compactados a 16×17 | 8 | Secuencia curada de 20 frames (~2.5 s): sonrisa, brazos, salto, estrellas y corazones |

Prioridad: `cry` → `victory` → `hurt` → `jump/fall` → `run` → `idle lateral` → `idle prolongado`. Hurt, Cry y Victory finalizan con `animationcomplete`; Victory espera además una breve pausa antes de abrir el modal.

Para habilitar Dudu más adelante, añade la misma convención de archivos bajo `public/assets/characters/dudu/`, incorpora sus metadatos al controlador y elimina su bloqueo del menú. Nunca se reutilizan fotogramas de Bubu para Dudu.
