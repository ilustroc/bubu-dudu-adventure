# Investigación de sprites individuales

Se revisaron los recursos solicitados el 2026-10-27. No se incorporó ningún recurso externo: los personajes actuales conservan la identidad visual de Bubu y Dudu.

- **Petey Panda / Duckhive:** ofrece idle, walk, jump, hit y death; la página declara que es gratuito, pero no presenta una licencia reutilizable formal. No se descarga ni integra sin una licencia verificable para este proyecto.
- **Little Bear / CazBee:** sprites de 32×32 (idle y walk), CC0; es reutilizable, pero no representa inequívocamente a Dudu. Se mantiene como referencia técnica, no como sustituto.
- **Codex Pet bubu:** muestra un paquete con `spritesheet.webp` y nueve estados, pero la página no otorga una licencia de uso en videojuegos. No se integra.

La clase `Player` mantiene estados preparados para `idle`, `walk`, `jump`, `hurt`, `cry` y `victory`; por ahora esos estados usan transformaciones sobre las imágenes individuales actuales.
