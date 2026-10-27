import Phaser from "phaser";
import { Player } from "./player.js";
import { TouchInput } from "./touch-input.js";
import { GameUi } from "./ui.js";
import { collectCoin, collectedCoinIds, completeLevel, getProgress, saveSelectedCharacter } from "../shared/progress.js";
import tilesheet from "../../assets/external/kenney_pixel-platformer/Tilemap/tilemap_packed.png";
import backgrounds from "../../assets/external/kenney_pixel-platformer/Tilemap/tilemap-backgrounds_packed.png";
import characters from "../../assets/external/kenney_pixel-platformer/Tilemap/tilemap-characters_packed.png";
import levelMapUrl from "../../assets/maps/level_01.json?url";

const TILE = 54;
const MAP_SCALE = 3;
const KENNEY = { grass: 0, dirt: 40, cactus: 127, coin: 151, checkpoint: 64, portal: 130, slime: 0, patroller: 6 };

export class ForestScene extends Phaser.Scene {
  constructor() { super("forest"); }

  preload() {
    this.load.spritesheet("bubu-idle", "/assets/characters/bubu/normalized/idle.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-run", "/assets/characters/bubu/run.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-jump", "/assets/characters/bubu/jump.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-fall", "/assets/characters/bubu/fall.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-hurt", "/assets/characters/bubu/hurt.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-cry", "/assets/characters/bubu/cry.png", { frameWidth: 64, frameHeight: 64 }); this.load.spritesheet("bubu-victory", "/assets/characters/bubu/normalized/victory.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("kenneyTiles", tilesheet, { frameWidth: 18, frameHeight: 18 });
    this.load.spritesheet("kenneyBackgrounds", backgrounds, { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet("kenneyCharacters", characters, { frameWidth: 24, frameHeight: 24 });
    this.load.tilemapTiledJSON("level01", levelMapUrl);
  }

  create() {
    const requested = new URLSearchParams(window.location.search).get("character"); if (requested === "dudu") { window.location.replace("/?notice=dudu"); return; } this.character = "bubu"; saveSelectedCharacter(this.character);
    this.map = this.make.tilemap({ key: "level01" }); this.tileset = this.map.addTilesetImage("kenney_pixel_platformer", "kenneyTiles", 18, 18, 0, 0); this.level = { id: "level1", width: this.map.width * TILE, height: this.map.height * TILE };
    this.physics.world.setBounds(0, 0, this.level.width, this.level.height); this.cameras.main.setBounds(0, 0, this.level.width, this.level.height).setBackgroundColor("#a7e8f2"); this.createScenery();
    this.mapLayers = {}; ["Background", "Ground", "Platforms", "Decorations"].forEach((name, index) => { const layer = this.map.createLayer(name, this.tileset, 0, 0).setScale(MAP_SCALE).setDepth(index === 0 ? -6 : index + 1); this.mapLayers[name] = layer; }); this.mapLayers.Ground.setCollisionByExclusion([-1]); this.mapLayers.Platforms.setCollisionByExclusion([-1]); this.validateMapLayout();
    const spawn = this.getMapObject("Spawn_Exit", "spawn"); this.spawnPoint = this.objectPoint(spawn); this.checkpointPoint = this.spawnPoint; this.player = new Player(this, this.character, this.spawnPoint.x, this.spawnPoint.y); this.physics.add.collider(this.player.sprite, [this.mapLayers.Ground, this.mapLayers.Platforms]);
    this.createCoins(); this.createEnemies(); this.createCheckpointAndPortal(); this.touch = new TouchInput(); this.keys = this.input.keyboard.addKeys({ left: "LEFT", right: "RIGHT", up: "UP", a: "A", d: "D", w: "W", space: "SPACE" });
    this.lives = 3; this.runCoins = 0; this.checkpointActive = false; this.ended = false; this.dying = false; this.paused = false; this.ui = new GameUi(this, this.character); this.ui.update(this.runCoins, this.lives); this.ui.pause.on("pointerup", () => this.togglePause()); this.input.keyboard.on("keydown-ESC", () => this.togglePause());
    this.cameras.main.startFollow(this.player.sprite, true, .09, .09).setDeadzone(180, 65); const hint = this.add.text(480, 155, "Salta sobre los enemigos y busca el portal", { fontFamily: '"Trebuchet MS"', fontSize: "20px", fontStyle: "bold", color: "#564468", stroke: "#fffdf3", strokeThickness: 5 }).setOrigin(.5).setScrollFactor(0).setDepth(19); this.tweens.add({ targets: hint, alpha: 0, delay: 3200, duration: 500, onComplete: () => hint.destroy() });
  }

  createScenery() {
    const sky = this.add.tileSprite(480, 210, 1100, 480, "kenneyBackgrounds", 0).setScrollFactor(0).setDepth(-12); sky.tileScaleX = 2; sky.tileScaleY = 2;
    const distant = this.add.tileSprite(this.level.width / 2, 490, this.level.width + 960, 180, "kenneyBackgrounds", 10).setScrollFactor(.15).setDepth(-10); distant.tileScaleX = 3; distant.tileScaleY = 3;
    const middle = this.add.tileSprite(this.level.width / 2, 550, this.level.width + 960, 110, "kenneyBackgrounds", 18).setScrollFactor(.35).setDepth(-7); middle.tileScaleX = 3; middle.tileScaleY = 3; middle.setAlpha(.8);
  }

  createCoins() {
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true }); const collected = collectedCoinIds(this.level.id);
    this.map.getObjectLayer("Coins").objects.forEach((object, index) => { if (collected.has(object.name)) return; const point = this.objectPoint(object); const coin = this.coins.create(point.x, point.y, "kenneyTiles", KENNEY.coin).setScale(2.15).setDepth(5); coin.setData("id", object.name); coin.body.setCircle(7, 2, 2); this.tweens.add({ targets: coin, y: point.y - 7, duration: 650 + (index % 3) * 90, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); });
    this.physics.add.overlap(this.player.sprite, this.coins, (_, coin) => this.pickCoin(coin));
  }

  createEnemies() {
    this.enemies = this.physics.add.group({ allowGravity: true });
    this.map.getObjectLayer("Enemies").objects.forEach((object) => { const point = this.objectPoint(object); const type = object.type; const range = this.objectProperty(object, "range", 5) * TILE; const frame = type === "slime" ? KENNEY.slime : KENNEY.patroller; const enemy = this.enemies.create(point.x, point.y, "kenneyCharacters", frame).setScale(2.05).setDepth(4).setDataEnabled(); enemy.setData({ type, min: point.x - range, max: point.x + range, speed: type === "slime" ? 60 : 82 }); enemy.body.setSize(17, 20).setOffset(4, 3); enemy.setVelocityX(enemy.getData("speed")); });
    this.physics.add.collider(this.enemies, [this.mapLayers.Ground, this.mapLayers.Platforms]); this.physics.add.overlap(this.player.sprite, this.enemies, (_, enemy) => this.hitEnemy(enemy));
  }

  createCheckpointAndPortal() {
    const checkpointObject = this.getMapObject("Checkpoints", "checkpoint"); this.checkpointPoint = this.objectPoint(checkpointObject); this.checkpoint = this.physics.add.image(this.checkpointPoint.x, this.checkpointPoint.y, "kenneyTiles", KENNEY.checkpoint).setScale(2.8).setDepth(4); this.checkpoint.body.setAllowGravity(false).setImmovable(true);
    const exit = this.getMapObject("Spawn_Exit", "exit"); const exitPoint = this.objectPoint(exit); this.portal = this.physics.add.image(exitPoint.x, exitPoint.y, "kenneyTiles", KENNEY.portal).setScale(3.3).setDepth(4); this.portal.body.setAllowGravity(false).setImmovable(true); this.tweens.add({ targets: this.portal, scaleY: 3.55, scaleX: 3.1, duration: 800, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player.sprite, this.checkpoint, () => this.activateCheckpoint()); this.physics.add.overlap(this.player.sprite, this.portal, () => this.finishLevel());
  }

  getMapObject(layerName, type) { return this.map.getObjectLayer(layerName).objects.find((object) => object.type === type); }
  objectPoint(object) { return { x: (object.x + object.width / 2) * MAP_SCALE, y: (object.y + object.height / 2) * MAP_SCALE }; }
  objectProperty(object, name, fallback) { return object.properties?.find((property) => property.name === name)?.value ?? fallback; }
  validateMapLayout() {
    const maxJumpHeight = (620 ** 2) / (2 * 1000); const maxJumpDistance = 265 * ((2 * 620) / 1000); const problems = [];
    const platformTiles = this.mapLayers.Platforms; const groundTiles = this.mapLayers.Ground;
    this.map.getObjectLayer("Coins").objects.forEach((coin) => { const x = Math.floor(coin.x / 18); const y = Math.floor(coin.y / 18); if (platformTiles.getTileAt(x, y) || groundTiles.getTileAt(x, y)) problems.push(`Moneda incrustada: ${coin.name}`); });
    const rows = new Set(); platformTiles.forEachTile((tile) => { if (tile.index >= 0) rows.add(tile.y); }); if ([...rows].some((row) => (10 - row) * TILE > maxJumpHeight)) problems.push("Hay una plataforma por encima de la altura máxima de salto."); if (maxJumpDistance < 140) problems.push("La distancia máxima de salto no cubre el hueco diseñado.");
    if (problems.length) console.warn("Validación de level_01:", problems); else console.info("level_01 validado: rutas, plataformas y monedas alcanzables.");
  }

  update() {
    if (this.paused || this.ended || this.dying) return;
    this.player.update(this.keys, this.touch);
    this.enemies.children.each((enemy) => { if (!enemy.active) return; const speed = enemy.getData("speed"); if (enemy.x < enemy.getData("min")) enemy.setVelocityX(speed); if (enemy.x > enemy.getData("max")) enemy.setVelocityX(-speed); enemy.setFlipX(enemy.body.velocity.x < 0); });
    if (this.player.sprite.y > 735) this.damagePlayer();
  }

  pickCoin(coin) {
    if (!coin.active || !collectCoin(this.level.id, coin.getData("id"))) return; this.runCoins += 1; const { x, y } = coin; coin.destroy(); this.ui.update(this.runCoins, this.lives);
    for (let i = 0; i < 5; i += 1) { const sparkle = this.add.text(x, y, "✦", { fontSize: "16px", color: "#ffe894" }).setDepth(10); this.tweens.add({ targets: sparkle, x: x + Phaser.Math.Between(-25, 25), y: y + Phaser.Math.Between(-30, 20), alpha: 0, scale: 1.8, duration: 380, onComplete: () => sparkle.destroy() }); }
  }

  hitEnemy(enemy) {
    if (!enemy.active || this.player.invulnerable || this.dying) return; const body = this.player.sprite.body; const stomp = body.velocity.y > 110 && body.bottom < enemy.body.center.y + 14;
    if (stomp) { enemy.disableBody(true, true); body.setVelocityY(-390); this.cameras.main.shake(65, .004); const puff = this.add.text(enemy.x, enemy.y, "¡Puf!", { fontSize: "18px", fontStyle: "bold", color: "#fff" }).setOrigin(.5); this.tweens.add({ targets: puff, y: puff.y - 30, alpha: 0, duration: 450, onComplete: () => puff.destroy() }); } else this.damagePlayer();
  }

  activateCheckpoint() {
    if (this.checkpointActive) return; this.checkpointActive = true; this.checkpoint.setTint(0xffed85); this.tweens.add({ targets: this.checkpoint, angle: { from: -5, to: 5 }, duration: 210, yoyo: true, repeat: 4 }); this.cameras.main.flash(280, 255, 240, 152); const message = this.add.text(this.checkpoint.x, this.checkpoint.y - 110, "¡Checkpoint guardado!", { fontFamily: '"Trebuchet MS"', fontSize: "23px", fontStyle: "bold", color: "#fff9d5", stroke: "#6a4a70", strokeThickness: 5 }).setOrigin(.5); this.tweens.add({ targets: message, y: message.y - 42, alpha: 0, duration: 1250, onComplete: () => message.destroy() });
  }

  damagePlayer() {
    if (this.player.invulnerable || this.ended || this.dying) return; this.dying = true; this.lives -= 1; this.ui.update(this.runCoins, this.lives); this.cameras.main.shake(170, .012);
    if (this.lives <= 0) { this.player.playSad(() => { this.ended = true; this.dying = false; this.physics.pause(); this.showModal("💧", "Game Over", "Bubu o Dudu necesita descansar. ¡Inténtalo otra vez desde el comienzo!", [["Reintentar", () => window.location.reload()], ["Volver al menú", () => window.location.assign("/")]]); }); return; }
    const spawn = this.checkpointActive ? this.checkpointPoint : this.spawnPoint; this.player.takeHit(() => { this.player.respawn(spawn); this.dying = false; });
  }

  togglePause() { if (this.ended || this.dying) return; this.paused ? this.resumeGame() : this.pauseGame(); }
  pauseGame() { this.paused = true; this.touch.clear(); this.physics.pause(); this.showModal("Ⅱ", "Pausa", "Tómate un respiro. El Bosque Encantado te espera.", [["Continuar", () => this.resumeGame()], ["Volver al menú", () => window.location.assign("/")]]); }
  resumeGame() { document.querySelector("#game-modal").hidden = true; this.paused = false; this.physics.resume(); }
  finishLevel() { if (this.ended || this.dying) return; this.ended = true; completeLevel(this.level.id); this.player.playVictory(() => { this.physics.pause(); this.cameras.main.flash(500, 255, 248, 195); this.showModal("🌟", "¡Nivel completado!", `¡Bubu ha cruzado el bosque! Obtuviste ${this.runCoins} monedas nuevas. La aventura continuará…`, [["Jugar de nuevo", () => window.location.reload()], ["Volver al menú", () => window.location.assign("/")]]); }); }
  showModal(icon, title, copy, actions) { const modal = document.querySelector("#game-modal"); document.querySelector("#modal-icon").textContent = icon; document.querySelector("#modal-title").textContent = title; document.querySelector("#modal-copy").textContent = copy; const container = document.querySelector("#modal-actions"); container.replaceChildren(...actions.map(([label, handler], index) => { const button = document.createElement("button"); button.textContent = label; if (index) button.classList.add("secondary"); button.addEventListener("click", handler); return button; })); modal.hidden = false; }
}
