export class GameUi {
  constructor(scene, character) {
    this.scene = scene; this.hud = scene.add.container(0, 0).setDepth(20);
    const style = { fontFamily: '"Trebuchet MS", sans-serif', fontStyle: "bold", color: "#49335d", stroke: "#fffdf5", strokeThickness: 5 };
    this.title = scene.add.text(18, 15, "Nivel 1 · El Bosque Encantado", { ...style, fontSize: "16px" }); this.coins = scene.add.text(18, 43, "✦ 0", { ...style, fontSize: "22px", color: "#a76b18" }); this.hearts = scene.add.text(18, 71, "♥♥♥", { ...style, fontSize: "24px", color: "#d75a72" });
    this.hero = scene.add.text(18, 103, `Jugando: ${character === "bubu" ? "Bubu" : "Dudu"}`, { ...style, fontSize: "13px" }); this.pause = scene.add.text(scene.scale.width - 24, 19, "Ⅱ", { ...style, fontSize: "28px" }).setOrigin(1, 0).setInteractive({ useHandCursor: true }); this.hud.add([this.title, this.coins, this.hearts, this.hero, this.pause]);
    // A camera zoomed for a compact vertical composition also zooms world
    // display objects. Pin the HUD in camera space so it never drifts or clips.
    scene.events.on("postupdate", this.pinToCamera, this);
    scene.scale.on("resize", (size) => this.pause.setX(size.width - 24));
  }
  update(coins, lives) { this.coins.setText(`✦ ${coins}`); this.hearts.setText("♥".repeat(lives) + "♡".repeat(3 - lives)); }
  pinToCamera() { this.hud.setPosition(this.scene.cameras.main.scrollX, this.scene.cameras.main.scrollY); }
}
