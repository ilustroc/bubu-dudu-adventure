const BUBU = {
  scale: 1.4,
  body: { width: 30, height: 43, offsetX: 17, offsetY: 18 },
  walkSpeed: 265,
  jumpSpeed: 620,
};

// The short side-facing idle comes from the run sheet, so stopping never
// swaps Bubu's silhouette or foot placement. The front-facing approved idle
// is intentionally reserved for a deliberate, longer wait pose.
const ANIMATIONS = [
  ["idle-side", "bubu-run", 0, 0, 1, -1],
  ["idle-long", "bubu-idle", 0, 0, 1, -1],
  ["run", "bubu-run", 0, 15, 12, -1],
  ["jump", "bubu-jump", 0, 15, 16, 0],
  ["fall", "bubu-fall", 0, 15, 12, -1],
  ["hurt", "bubu-hurt", 0, 16, 18, 0],
  ["cry", "bubu-cry", 0, 15, 10, 0],
];

export class Player {
  constructor(scene, character, x, y) {
    this.scene = scene;
    this.character = character;
    this.createAnimations();
    this.sprite = scene.physics.add.sprite(x, y, "bubu-run", 0).setScale(BUBU.scale).setDepth(4);
    this.sprite.body.setSize(BUBU.body.width, BUBU.body.height).setOffset(BUBU.body.offsetX, BUBU.body.offsetY);
    // World bounds would catch Bubu at the bottom. Horizontal bounds are kept
    // manually so every real gap can reach the kill zone below the map.
    this.sprite.setCollideWorldBounds(false);
    this.facing = 1;
    this.jumpWasDown = false;
    this.invulnerable = false;
    this.locked = false;
    this.state = "idle-side";
    this.idleSince = scene.time.now;
    this.play("idle-side", true);
  }

  createAnimations() {
    ANIMATIONS.forEach(([state, texture, start, end, frameRate, repeat]) => {
      const key = `bubu-${state}`;
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({ key, frames: this.scene.anims.generateFrameNumbers(texture, { start, end }), frameRate, repeat });
      }
    });
    if (!this.scene.anims.exists("bubu-victory")) {
      this.scene.anims.create({
        key: "bubu-victory",
        frames: this.scene.anims.generateFrameNumbers("bubu-victory", {
          start: 0,
          end: 19,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }
  }

  play(state, force = false) {
    if (!force && this.state === state && this.sprite.anims.isPlaying) return;
    this.state = state;
    this.sprite.play(`bubu-${state}`, true);
  }

  update(keys, touch) {
    if (this.locked) return;
    const body = this.sprite.body;
    const left = keys.left.isDown || keys.a.isDown || touch.left;
    const right = keys.right.isDown || keys.d.isDown || touch.right;
    const direction = Number(right) - Number(left);
    body.setVelocityX(direction * BUBU.walkSpeed);
    if (direction) {
      this.facing = direction;
      this.sprite.setFlipX(direction < 0);
      this.idleSince = null;
    }

    const onGround = body.blocked.down || body.touching.down;
    const jumpDown = keys.up.isDown || keys.w.isDown || keys.space.isDown || touch.jump;
    if (jumpDown && !this.jumpWasDown && onGround) {
      body.setVelocityY(-BUBU.jumpSpeed);
      this.play("jump", true);
      this.scene.cameras.main.shake(55, 0.002);
    }
    this.jumpWasDown = jumpDown;
    this.keepHorizontalBounds();

    if (!onGround) {
      this.idleSince = null;
      this.play(body.velocity.y < 0 ? "jump" : "fall");
      return;
    }
    if (direction) {
      this.play("run");
      return;
    }
    if (this.idleSince === null) this.idleSince = this.scene.time.now;
    if (this.scene.time.now - this.idleSince >= 5000) {
      // Front view is an intentional little acknowledgement after waiting.
      this.sprite.setFlipX(false);
      this.play("idle-long");
    } else {
      this.sprite.setFlipX(this.facing < 0);
      this.play("idle-side");
    }
  }

  keepHorizontalBounds() {
    const body = this.sprite.body;
    const halfWidth = body.width / 2;
    if (body.center.x < halfWidth) {
      this.sprite.x = halfWidth;
      body.setVelocityX(Math.max(0, body.velocity.x));
    } else if (body.center.x > this.scene.level.width - halfWidth) {
      this.sprite.x = this.scene.level.width - halfWidth;
      body.setVelocityX(Math.min(0, body.velocity.x));
    }
  }

  respawn(point) {
    this.locked = false;
    this.invulnerable = false;
    this.sprite.setPosition(point.x, point.y).setAngle(0).setScale(BUBU.scale).setAlpha(1).clearTint();
    this.sprite.body.setAllowGravity(true).setVelocity(0, 0);
    this.idleSince = this.scene.time.now;
    this.play("idle-side", true);
  }

  recoverFromPit(onComplete) {
    this.locked = true;
    this.invulnerable = true;
    this.sprite.body.setVelocityX(0);
    this.play("fall");
    this.scene.time.delayedCall(460, onComplete);
  }

  takeHit(onComplete) {
    this.locked = true;
    this.invulnerable = true;
    this.sprite.body.setVelocity(-this.facing * 140, -170);
    this.play("hurt", true);
    this.sprite.once("animationcomplete-bubu-hurt", () => {
      this.invulnerable = false;
      this.locked = false;
      onComplete?.();
    });
  }

  playSad(onComplete) {
    this.locked = true;
    this.invulnerable = true;
    this.sprite.body.setAllowGravity(false).setVelocity(0, 0);
    this.play("cry", true);
    this.sprite.once("animationcomplete-bubu-cry", onComplete);
  }

  playVictory(onComplete, safePoint) {
    this.locked = true;
    this.sprite.body.setAllowGravity(false).setVelocity(0, 0);
    if (safePoint) this.sprite.setPosition(safePoint.x, safePoint.y);
    this.sprite.setDepth(7);
    this.play("victory", true);
    this.sprite.once("animationcomplete-bubu-victory", () => {
      this.scene.time.delayedCall(550, onComplete);
    });
  }
}
