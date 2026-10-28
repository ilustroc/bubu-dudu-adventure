# Integracion segura — Pradera

Este ZIP trae solo los nuevos assets preparados. **No actualiza automaticamente Phaser, el mapa ni las colisiones.**

Para usar los assets en `C:\GitHub\bubu-dudu-adventure`, extrae el contenido de este ZIP en `public\assets\biomas\pradera\`.

Ejemplo Phaser 3 (en preload):

```js
this.load.spritesheet('pradera-puerta', '/assets/biomas/pradera/animations/puerta_bosque.png', { frameWidth: 160, frameHeight: 160 });
this.load.spritesheet('pradera-bandera-roja', '/assets/biomas/pradera/animations/bandera_roja.png', { frameWidth: 112, frameHeight: 128 });
this.load.spritesheet('pradera-bandera-verde', '/assets/biomas/pradera/animations/bandera_verde.png', { frameWidth: 112, frameHeight: 128 });
this.load.spritesheet('pradera-slime', '/assets/biomas/pradera/enemies/slime_verde.png', { frameWidth: 112, frameHeight: 96 });
this.load.spritesheet('pradera-hongo', '/assets/biomas/pradera/enemies/hongo_rojo.png', { frameWidth: 112, frameHeight: 96 });
this.load.spritesheet('pradera-caracol', '/assets/biomas/pradera/enemies/caracol.png', { frameWidth: 120, frameHeight: 96 });
this.load.spritesheet('pradera-abeja', '/assets/biomas/pradera/enemies/abeja.png', { frameWidth: 104, frameHeight: 104 });
```

**Importante:** estos sprites se prepararon desde un atlas de ilustracion grande: nunca aplicar `setScale(3)` a estos nuevos frames sin comprobar primero su tamaño en el mundo. Ajustar la altura visual deseada con `setDisplaySize`, conservando las proporciones, y mantener el collider independiente.

Puerta: 6 fotogramas. Banderas: 4 cada una. Enemigos: 4 cada uno. Archivo `manifest.json` contiene las medidas exactas y FPS recomendados.

El fondo PNG del bosque, Ground y Platforms actuales NO se modifican por este paquete.
