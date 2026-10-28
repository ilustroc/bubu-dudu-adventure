import Phaser from "phaser";
import { Player } from "./player.js";
import { TouchInput } from "./touch-input.js";
import { GameUi } from "./ui.js";
import {
  collectCoin,
  completeLevel,
  saveSelectedCharacter,
} from "../shared/progress.js";
import tilesheet from "../../assets/external/kenney_pixel-platformer/Tilemap/tilemap_packed.png";
import forestHills from "../../assets/levels/level1/tilesets/forest-hills.png";
import forestParallax from "../../assets/levels/level1/forest-parallax.png";
import levelMapUrl from "../../assets/maps/level_01.json?url";

const TILE = 54;
const MAP_SCALE = 3;
const KENNEY = {
  cactus: 127,
  coin: 151,
  forestMushroom: 128,
};

export class ForestScene extends Phaser.Scene {
  constructor() {
    super("forest");
  }

  preload() {
    this.load.spritesheet(
      "bubu-idle",
      "/assets/characters/bubu/idle.png",
      { frameWidth: 64, frameHeight: 64 },
    );
    this.load.spritesheet("bubu-run", "/assets/characters/bubu/run.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("bubu-jump", "/assets/characters/bubu/jump.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("bubu-fall", "/assets/characters/bubu/fall.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("bubu-hurt", "/assets/characters/bubu/hurt.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("bubu-cry", "/assets/characters/bubu/cry.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "bubu-victory",
      "/assets/characters/bubu/victory.png",
      { frameWidth: 64, frameHeight: 64 },
    );
    this.load.spritesheet("kenneyTiles", tilesheet, {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet("forestHills", forestHills, {
      frameWidth: 18,
      frameHeight: 18,
    });
    this.load.spritesheet(
      "door-opening",
      "/assets/environment/door-opening.png",
      { frameWidth: 18, frameHeight: 36 },
    );
    this.load.image("forestParallax", forestParallax);
    this.load.tilemapTiledJSON("level01", levelMapUrl);
  }

  create() {
    const query = new URLSearchParams(window.location.search);
    const requested = query.get("character");
    if (requested === "dudu") {
      window.location.replace("/?notice=dudu");
      return;
    }
    this.testMode = query.get("test") === "1";
    this.character = "bubu";
    if (!this.testMode) saveSelectedCharacter(this.character);
    this.map = this.make.tilemap({ key: "level01" });
    this.tileset = this.map.addTilesetImage(
      "kenney_pixel_platformer",
      "kenneyTiles",
      18,
      18,
      0,
      0,
    );
    this.vegetationTileset = this.map.addTilesetImage(
      "forest-hills",
      "forestHills",
      18,
      18,
      0,
      0,
    );
    this.level = {
      id: "level1",
      width: this.map.width * TILE,
      height: this.map.height * TILE,
    };
    this.deathY = this.level.height + 150;
    this.physics.world.setBounds(0, -220, this.level.width, this.deathY + 240);
    this.cameras.main
      .setBounds(0, 0, this.level.width, this.level.height)
      .setBackgroundColor("#a7e8f2");
    this.configureCamera();
    this.createScenery();
    this.mapLayers = {};
    [
      // Tiled's Background remains available to artists, but the parallax
      // panorama sits above its solid color tiles.
      ["Background", -31],
      ["BackgroundVegetation", 1],
      ["Ground", 2],
      ["Platforms", 3],
      ["Decorations", 4],
      ["ForegroundVegetation", 8],
    ].forEach(([name, depth]) => {
      const layer = this.map
        .createLayer(name, [this.tileset, this.vegetationTileset], 0, 0)
        .setScale(MAP_SCALE)
        .setDepth(depth);
      this.mapLayers[name] = layer;
    });
    this.mapLayers.Ground.setCollisionByExclusion([-1]);
    this.createGroundExtension();
    this.mapLayers.Platforms.setCollisionByExclusion([-1]);
    this.fallTriggerY = this.getFallTriggerY();
    this.validateMapLayout();
    const spawn = this.getMapObject("Spawn_Exit", "spawn");
    this.spawnPoint = this.objectPoint(spawn);
    this.checkpointPoint = this.spawnPoint;
    this.player = new Player(
      this,
      this.character,
      this.spawnPoint.x,
      this.spawnPoint.y,
    );
    this.playerGroundOffset =
      this.getSurfaceYAt(this.spawnPoint.x) - this.spawnPoint.y;
    this.physics.add.collider(this.player.sprite, [
      this.mapLayers.Ground,
      this.mapLayers.Platforms,
    ]);
    this.createCoins();
    this.createEnemies();
    this.createHazards();
    this.createCheckpointAndPortal();
    this.touch = new TouchInput();
    this.keys = this.input.keyboard.addKeys({
      left: "LEFT",
      right: "RIGHT",
      up: "UP",
      a: "A",
      d: "D",
      w: "W",
      space: "SPACE",
    });
    this.lives = 3;
    this.runCoins = 0;
    this.checkpointActive = false;
    this.ended = false;
    this.dying = false;
    this.paused = false;
    this.ui = new GameUi(this, this.character);
    this.ui.update(this.runCoins, this.lives, this.map.getObjectLayer("Coins").objects.length);
    this.ui.pause.addEventListener("click", () => this.togglePause());
    this.input.keyboard.on("keydown-ESC", () => this.togglePause());
    this.createTestControls();
    this.cameras.main
      .startFollow(this.player.sprite, true, 0.1, 0.1)
      .setFollowOffset(0, -65)
      .setDeadzone(220, 95);
    const hint = this.add
      .text(480, 155, "Salta sobre los enemigos y busca el portal", {
        fontFamily: '"Trebuchet MS"',
        fontSize: "20px",
        fontStyle: "bold",
        color: "#564468",
        stroke: "#fffdf3",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(19);
    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 3200,
      duration: 500,
      onComplete: () => hint.destroy(),
    });
  }

  configureCamera() {
    const ratio = this.scale.width / this.scale.height;
    const zoom = Phaser.Math.Clamp(
      ratio > 1.8 ? 1.26 : ratio < 0.82 ? 1.04 : 1.14,
      1,
      1.26,
    );
    this.cameras.main.setZoom(zoom);
    this.layoutScenery?.();
    if (!this.resizeBound) {
      this.resizeBound = true;
      this.scale.on(Phaser.Scale.Events.RESIZE, () => this.configureCamera());
    }
  }


  createScenery() {
    this.scenery = {
      SkyBackground: this.add
        .image(0, 0, "forestParallax")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-30)
    };

    this.layoutScenery();
  }

  layoutScenery() {
    if (!this.scenery) return;

    const sky = this.scenery.SkyBackground;
    const camera = this.cameras.main;

    const visibleWidth = this.scale.width / camera.zoom;
    const visibleHeight = this.scale.height / camera.zoom;

    const texture = sky.texture.source[0];

    const scale = Math.max(
      visibleWidth / texture.width,
      (visibleHeight + TILE * 4) / texture.height
    );

    // Mantener proporciones y cubrir toda la pantalla.
    sky.setScale(scale);
  }

  updateParallax() {
    if (!this.scenery) return;

    const sky = this.scenery.SkyBackground;
    const camera = this.cameras.main;

    const visibleWidth = this.scale.width / camera.zoom;

    const maxScroll = Math.max(
      0,
      sky.displayWidth - visibleWidth
    );

    // Desplazamiento continuo sin saltos ni modulo.
    const offset = Phaser.Math.Clamp(
      camera.scrollX * 0.025,
      0,
      maxScroll
    );

    sky.setPosition(-Math.round(offset), 0);
  }


  createGroundExtension() {
    const ground = this.mapLayers.Ground;
    const bottomRow = this.map.height - 1;

    // Dos filas visuales debajo del mapa.
    // Sin colisiones y respetando los huecos.
    for (let row = 0; row < 2; row++) {
      let start = 0;
      let currentFrame = -1;

      const draw = (end) => {
        if (currentFrame < 0 || end <= start) return;

        this.add.tileSprite(
          start * TILE,
          (this.map.height + row) * TILE,
          (end - start) * this.map.tileWidth,
          this.map.tileHeight,
          "kenneyTiles",
          currentFrame
        )
        .setOrigin(0, 0)
        .setScale(MAP_SCALE)
        .setDepth(2);
      };

      for (let x = 0; x <= this.map.width; x++) {
        const tile = x < this.map.width
          ? ground.getTileAt(x, bottomRow)
          : null;

        const frame = tile && tile.index > 0
          ? tile.index - 1
          : -1;

        if (frame !== currentFrame) {
          draw(x);
          currentFrame = frame;
          start = x;
        }
      }
    }
  }

  createCoins() {
    this.coins = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.map.getObjectLayer("Coins").objects.forEach((object, index) => {
      const point = this.objectPoint(object);
      const coin = this.coins
        .create(point.x, point.y, "kenneyTiles", KENNEY.coin)
        .setScale(3)
        .setDepth(5);
      coin.setData("id", object.name);
      coin.body.setCircle(7, 2, 2);
      this.tweens.add({
        targets: coin,
        y: point.y - 7,
        duration: 650 + (index % 3) * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
    this.physics.add.overlap(this.player.sprite, this.coins, (_, coin) =>
      this.pickCoin(coin),
    );
  }

  createEnemies() {
    this.enemies = this.physics.add.group({ allowGravity: true });
    this.map.getObjectLayer("Enemies").objects.forEach((object) => {
      const point = this.objectPoint(object);
      const type = object.type;
      const range = this.objectProperty(object, "range", 5) * TILE;
      const enemy = this.enemies
        .create(point.x, point.y, "kenneyTiles", KENNEY.forestMushroom)
        .setScale(3)
        .setDepth(4)
        .setDataEnabled();
      if (type === "patroller") enemy.setTint(0xc4df95);
      enemy.setData({
        type,
        min: point.x - range,
        max: point.x + range,
        speed: type === "slime" ? 60 : 82,
        direction: 1,
        turnUntil: 0,
      });
      enemy.body.setSize(14, 15).setOffset(2, 3);
      enemy.setVelocityX(enemy.getData("speed"));
    });
    this.physics.add.collider(this.enemies, [
      this.mapLayers.Ground,
      this.mapLayers.Platforms,
    ]);
    this.physics.add.overlap(this.player.sprite, this.enemies, (_, enemy) =>
      this.hitEnemy(enemy),
    );
  }

  createHazards() {
    this.hazards = this.physics.add.staticGroup();
    this.map.getObjectLayer("Hazards").objects.forEach((object) => {
      const point = this.objectPoint(object);
      const cactus = this.hazards
        .create(point.x, point.y, "kenneyTiles", KENNEY.cactus)
        .setScale(2.7)
        .setDepth(4);
      cactus.body.setSize(12, 14).setOffset(3, 4);
      cactus.refreshBody();
    });
    this.physics.add.overlap(this.player.sprite, this.hazards, () =>
      this.damagePlayer("cactus"),
    );
  }

  createCheckpointAndPortal() {
    const checkpointObject = this.getMapObject("Checkpoints", "checkpoint");
    const checkpointBase = this.objectPoint(checkpointObject);
    this.checkpointPoint = { x: checkpointBase.x - TILE, y: checkpointBase.y };
    this.createFlagTextures();
    this.checkpoint = this.physics.add
      .sprite(checkpointBase.x, checkpointBase.y + 27, "flag-off-0")
      .setOrigin(0.5, 1)
      .setScale(1.9)
      .setDepth(5);
    this.checkpoint.body.setAllowGravity(false).setImmovable(true);
    this.checkpoint.body.setSize(14, 20).setOffset(5, 7);
    this.checkpoint.play("flag-off-wave");
    const exit = this.getMapObject("Spawn_Exit", "exit");
    this.exitPoint = this.objectPoint(exit);
    const doorBaseY = this.exitPoint.y + TILE / 2;
    this.createDoorAnimation();
    this.door = this.add
      .sprite(this.exitPoint.x, doorBaseY, "door-opening", 0)
      .setOrigin(0.5, 1)
      .setScale(MAP_SCALE)
      .setDepth(4);
    this.door.opened = false;
    this.exitTrigger = this.add.zone(
      this.exitPoint.x,
      this.exitPoint.y,
      TILE * 0.9,
      TILE * 1.25,
    );
    this.physics.add.existing(this.exitTrigger, true);
    this.physics.add.overlap(this.player.sprite, this.checkpoint, () =>
      this.activateCheckpoint(),
    );
    this.physics.add.overlap(this.player.sprite, this.exitTrigger, () =>
      this.finishLevel(),
    );
  }

  createFlagTextures() {
    if (this.textures.exists("flag-off-0")) return;
    const drawFlag = (key, cloth, wave) => {
      const graphics = this.add.graphics();
      graphics
        .fillStyle(0x6e4a32)
        .fillRect(7, 2, 3, 31)
        .fillStyle(0xf4cb5e)
        .fillRect(6, 0, 5, 5);
      graphics
        .fillStyle(cloth)
        .fillRect(10, 6, 11 + wave, 9)
        .fillRect(10, 15, 8 + wave, 2);
      graphics.fillStyle(0xffffff, 0.35).fillRect(11, 7, 2, 8);
      graphics.generateTexture(key, 24, 34);
      graphics.destroy();
    };
    [-1, 1, 3].forEach((wave, index) => {
      drawFlag(`flag-off-${index}`, 0xd96975, wave);
      drawFlag(`flag-on-${index}`, 0x7ccf84, wave);
    });
    ["off", "on"].forEach((state) =>
      this.anims.create({
        key: `flag-${state}-wave`,
        frames: [0, 1, 2, 1].map((frame) => ({
          key: `flag-${state}-${frame}`,
        })),
        frameRate: 6,
        repeat: -1,
      }),
    );
  }

  createDoorAnimation() {
    if (this.anims.exists("door-open")) return;
    this.anims.create({
      key: "door-open",
      frames: this.anims.generateFrameNumbers("door-opening", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: 0,
    });
  }

  getMapObject(layerName, type) {
    return this.map
      .getObjectLayer(layerName)
      .objects.find((object) => object.type === type);
  }
  objectPoint(object) {
    return {
      x: (object.x + object.width / 2) * MAP_SCALE,
      y: (object.y + object.height / 2) * MAP_SCALE,
    };
  }
  objectProperty(object, name, fallback) {
    return (
      object.properties?.find((property) => property.name === name)?.value ??
      fallback
    );
  }
  getFallTriggerY() {
    const ground = this.mapLayers.Ground;
    let surfaceRow = this.map.height;
    ground.forEachTile((tile) => {
      if (tile.index >= 0) surfaceRow = Math.min(surfaceRow, tile.y);
    });
    return (surfaceRow + 1) * TILE;
  }
  getSurfaceYAt(worldX, minimumY = 0) {
    const tileX = Phaser.Math.Clamp(
      Math.floor(worldX / TILE),
      0,
      this.map.width - 1,
    );
    for (
      let tileY = Math.max(0, Math.floor(minimumY / TILE));
      tileY < this.map.height;
      tileY += 1
    ) {
      const hasSurface = [this.mapLayers.Ground, this.mapLayers.Platforms].some(
        (layer) => layer.getTileAt(tileX, tileY),
      );
      if (hasSurface) return tileY * TILE;
    }
    return this.fallTriggerY - TILE;
  }
  validateMapLayout() {
    const maxJumpHeight = 620 ** 2 / (2 * 1000);
    const maxJumpDistance = 265 * ((2 * 620) / 1000);
    const problems = [];
    const platformTiles = this.mapLayers.Platforms;
    const groundTiles = this.mapLayers.Ground;
    this.map.getObjectLayer("Coins").objects.forEach((coin) => {
      const x = Math.floor(coin.x / 18);
      const y = Math.floor(coin.y / 18);
      if (platformTiles.getTileAt(x, y) || groundTiles.getTileAt(x, y))
        problems.push(`Moneda incrustada: ${coin.name}`);
    });
    const rows = [...new Set()];
    platformTiles.forEachTile((tile) => {
      if (tile.index >= 0 && !rows.includes(tile.y)) rows.push(tile.y);
    });
    rows.sort((a, b) => a - b);
    if (
      rows.some(
        (row, index) =>
          index > 0 && (row - rows[index - 1]) * TILE > maxJumpHeight,
      )
    )
      problems.push("Hay escalones por encima de la altura máxima de salto.");
    if (maxJumpDistance < 140)
      problems.push("La distancia máxima de salto no cubre el hueco diseñado.");
    this.map.getObjectLayer("Hazards").objects.forEach((hazard) => {
      const x = Math.floor(hazard.x / 18);
      const y = Math.floor(hazard.y / 18) + 1;
      if (![groundTiles, platformTiles].some((layer) => layer.getTileAt(x, y)))
        problems.push(`Cactus sin suelo: ${hazard.name}`);
    });
    if (problems.length) console.warn("Validación de level_01:", problems);
    else
      console.info(
        "level_01 validado: rutas, plataformas y monedas alcanzables.",
      );
  }

  update() {
    this.updateParallax();
    if (this.paused || this.ended || this.dying) return;
    this.player.update(this.keys, this.touch);
    this.enemies.children.each((enemy) => this.updateEnemyPatrol(enemy));
    if (this.player.sprite.body.top > this.fallTriggerY) this.resolvePitFall();
  }

  hasFloorAhead(enemy, direction) {
    const x = Math.floor((enemy.x + direction * 30) / TILE);
    const y = Math.floor((enemy.body.bottom + 12) / TILE);
    return [this.mapLayers.Ground, this.mapLayers.Platforms].some((layer) =>
      layer.getTileAt(x, y),
    );
  }

  updateEnemyPatrol(enemy) {
    if (!enemy.active) return;
    let direction = enemy.getData("direction");
    const now = this.time.now;
    const reachedLimit =
      (direction < 0 && enemy.x <= enemy.getData("min")) ||
      (direction > 0 && enemy.x >= enemy.getData("max"));
    const hitWall =
      (direction < 0 && enemy.body.blocked.left) ||
      (direction > 0 && enemy.body.blocked.right);
    if (
      (reachedLimit || hitWall || !this.hasFloorAhead(enemy, direction)) &&
      now >= enemy.getData("turnUntil")
    ) {
      direction *= -1;
      enemy.setData({ direction, turnUntil: now + 160 });
      enemy.x = Phaser.Math.Clamp(
        enemy.x,
        enemy.getData("min"),
        enemy.getData("max"),
      );
    }
    enemy.setVelocityX(direction * enemy.getData("speed"));
    enemy.setFlipX(direction < 0);
  }

  createTestControls() {
    if (!this.testMode) return;
    const controls = document.querySelector("#qa-controls");
    controls.hidden = false;
    document.querySelector("#test-reset").addEventListener("click", () =>
      window.location.reload(),
    );
    document.querySelector("#qa-checkpoint").addEventListener("click", () =>
      this.moveToQaCheckpoint(),
    );
    document.querySelector("#qa-portal").addEventListener("click", () =>
      this.moveToQaPortal(),
    );
    document.querySelector("#qa-victory").addEventListener("click", () =>
      this.finishLevel(),
    );
    document.querySelector("#qa-fall").addEventListener("click", () =>
      this.simulateQaFall(),
    );
  }

  moveToQaPortal() {
    if (this.ended || this.dying) return;
    this.player.respawn({ x: this.exitPoint.x - TILE * 1.6, y: this.exitPoint.y });
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
  }

  moveToQaCheckpoint() {
    if (this.ended || this.dying) return;
    this.player.respawn({
      x: this.checkpoint.x - TILE * 0.38,
      y: this.getSurfaceYAt(this.checkpoint.x, this.checkpoint.y) - this.playerGroundOffset,
    });
    this.activateCheckpoint();
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
  }

  simulateQaFall() {
    if (this.ended || this.dying) return;
    this.player.sprite.setPosition(this.spawnPoint.x + TILE * 4, this.fallTriggerY - 10);
    this.player.sprite.body.setVelocity(0, 260);
    this.resolvePitFall();
  }

  pickCoin(coin) {
    if (!coin.active) return;

    // Solo las monedas nuevas aumentan el saldo global.
    if (!this.testMode) {
      collectCoin(this.level.id, coin.getData("id"));
    }

    this.runCoins += 1;
    const { x, y } = coin;
    coin.destroy();
    this.ui.update(this.runCoins, this.lives, this.map.getObjectLayer("Coins").objects.length);
    for (let i = 0; i < 5; i += 1) {
      const sparkle = this.add
        .text(x, y, "✦", { fontSize: "16px", color: "#ffe894" })
        .setDepth(10);
      this.tweens.add({
        targets: sparkle,
        x: x + Phaser.Math.Between(-25, 25),
        y: y + Phaser.Math.Between(-30, 20),
        alpha: 0,
        scale: 1.8,
        duration: 380,
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  hitEnemy(enemy) {
    if (!enemy.active || this.player.invulnerable || this.dying) return;
    const body = this.player.sprite.body;
    const stomp =
      body.velocity.y > 110 && body.bottom < enemy.body.center.y + 14;
    if (stomp) {
      enemy.disableBody(true, true);
      body.setVelocityY(-390);
      this.cameras.main.shake(65, 0.004);
      const puff = this.add
        .text(enemy.x, enemy.y, "¡Puf!", {
          fontSize: "18px",
          fontStyle: "bold",
          color: "#fff",
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: puff,
        y: puff.y - 30,
        alpha: 0,
        duration: 450,
        onComplete: () => puff.destroy(),
      });
    } else this.damagePlayer();
  }

  activateCheckpoint() {
    if (this.checkpointActive) return;
    this.checkpointActive = true;
    this.checkpoint.play("flag-on-wave");
    this.cameras.main.flash(280, 255, 240, 152);
    this.emitCheckpointSparkles();
    const message = this.add
      .text(
        this.checkpoint.x,
        this.checkpoint.y - 110,
        "¡Checkpoint activado!",
        {
          fontFamily: '"Trebuchet MS"',
          fontSize: "23px",
          fontStyle: "bold",
          color: "#fff9d5",
          stroke: "#6a4a70",
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5);
    this.tweens.add({
      targets: message,
      y: message.y - 42,
      alpha: 0,
      duration: 1250,
      onComplete: () => message.destroy(),
    });
  }

  emitCheckpointSparkles() {
    for (let index = 0; index < 7; index += 1) {
      const sparkle = this.add
        .rectangle(
          this.checkpoint.x + Phaser.Math.Between(-20, 20),
          this.checkpoint.y - Phaser.Math.Between(18, 50),
          4,
          4,
          0xffdf74,
        )
        .setDepth(9);
      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - Phaser.Math.Between(22, 42),
        alpha: 0,
        scale: 1.6,
        duration: 520 + index * 35,
        ease: "Sine.easeOut",
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  damagePlayer(reason = "enemy") {
    if (this.player.invulnerable || this.ended || this.dying) return;
    this.dying = true;
    this.lives -= 1;
    this.ui.update(this.runCoins, this.lives, this.map.getObjectLayer("Coins").objects.length);
    this.cameras.main.shake(170, 0.012);
    const spawn = this.checkpointActive
      ? this.checkpointPoint
      : this.spawnPoint;
    if (this.lives <= 0) {
      this.player.sprite.setPosition(spawn.x, spawn.y);
      this.player.playSad(() => {
        this.ended = true;
        this.dying = false;
        this.physics.pause();
        this.showModal(
          "💧",
          "Game Over",
          "Bubu necesita descansar. ¡Inténtalo otra vez desde el comienzo!",
          [
            ["Reintentar", () => window.location.reload()],
            ["Volver al menú", () => window.location.assign("/")],
          ],
        );
      });
      return;
    }
    this.player.takeHit(() => {
      this.player.respawn(spawn);
      this.dying = false;
    });
  }

  resolvePitFall() {
    if (this.player.invulnerable || this.ended || this.dying) return;
    this.dying = true;
    this.lives -= 1;
    this.ui.update(this.runCoins, this.lives, this.map.getObjectLayer("Coins").objects.length);
    const spawn = this.checkpointActive ? this.checkpointPoint : this.spawnPoint;
    this.player.recoverFromPit(() => {
      if (this.lives <= 0) {
        this.player.sprite.setPosition(spawn.x, spawn.y).setAlpha(1);
        this.player.playSad(() => {
          this.ended = true;
          this.dying = false;
          this.physics.pause();
          this.showModal(
            "💧",
            "Game Over",
            "Bubu necesita descansar. ¡Inténtalo otra vez desde el comienzo!",
            [["Reintentar", () => window.location.reload()], ["Volver al menú", () => window.location.assign("/")]],
          );
        });
        return;
      }
      this.player.respawn(spawn);
      this.dying = false;
    }, (x, y) => this.emitPitDisappearEffect(x, y));
  }

  emitPitDisappearEffect(x, y) {
    for (let index = 0; index < 6; index += 1) {
      const particle = this.add
        .rectangle(
          x + Phaser.Math.Between(-18, 18),
          y + Phaser.Math.Between(-8, 8),
          5,
          5,
          index % 2 ? 0xffe39b : 0x8dd69d,
        )
        .setDepth(10);
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-25, 25),
        y: particle.y + Phaser.Math.Between(-22, 8),
        alpha: 0,
        duration: 360,
        onComplete: () => particle.destroy(),
      });
    }
  }

  togglePause() {
    if (this.ended || this.dying) return;
    this.paused ? this.resumeGame() : this.pauseGame();
  }
  pauseGame() {
    this.paused = true;
    this.touch.clear();
    this.physics.pause();
    this.showModal(
      "Ⅱ",
      "Pausa",
      "Tómate un respiro. El Bosque Encantado te espera.",
      [
        ["Continuar", () => this.resumeGame()],
        ["Volver al menú", () => window.location.assign("/")],
      ],
    );
  }
  resumeGame() {
    document.querySelector("#game-modal").hidden = true;
    this.paused = false;
    this.physics.resume();
  }
  finishLevel() {
    if (this.ended || this.dying) return;
    this.ended = true;
    if (!this.testMode) completeLevel(this.level.id);
    const safeX = this.exitPoint.x - TILE * 0.9;
    const safePoint = {
      x: safeX,
      y:
        this.getSurfaceYAt(safeX, this.exitPoint.y) -
        this.playerGroundOffset,
    };
    this.openDoor(() => {
      this.player.playVictory(
        () =>
          this.player.enterDoor(
            { x: this.exitPoint.x + TILE * 0.05, y: safePoint.y },
            () => this.showVictoryModal(),
          ),
        safePoint,
      );
    });
  }
  openDoor(onComplete) {
    if (this.door.opened) {
      onComplete();
      return;
    }
    this.door.opened = true;
    this.door.once("animationcomplete-door-open", onComplete);
    this.door.play("door-open");
  }
  showVictoryModal() {
    this.physics.pause();
    this.cameras.main.flash(500, 255, 248, 195);
    this.showModal(
      "🌟",
      "¡Nivel completado!",
      `¡Bubu ha cruzado el bosque! Obtuviste ${this.runCoins} monedas nuevas. La aventura continuará…`,
      [
        ["Jugar de nuevo", () => window.location.reload()],
        ["Volver al menú", () => window.location.assign("/")],
      ],
    );
  }
  showModal(icon, title, copy, actions) {
    const modal = document.querySelector("#game-modal");
    document.querySelector("#modal-icon").textContent = icon;
    document.querySelector("#modal-title").textContent = title;
    document.querySelector("#modal-copy").textContent = copy;
    const container = document.querySelector("#modal-actions");
    container.replaceChildren(
      ...actions.map(([label, handler], index) => {
        const button = document.createElement("button");
        button.textContent = label;
        if (index) button.classList.add("secondary");
        button.addEventListener("click", handler);
        return button;
      }),
    );
    modal.hidden = false;
  }
}
