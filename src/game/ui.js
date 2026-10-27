export class GameUi {
  constructor(scene, character) {
    this.scene = scene;
    this.title = document.querySelector("#hud-level");
    this.coins = document.querySelector("#hud-coins");
    this.hearts = document.querySelector("#hud-hearts");
    this.hero = document.querySelector("#hud-hero");
    this.pause = document.querySelector("#hud-pause");
    this.hero.textContent = `Jugando: ${character === "bubu" ? "Bubu" : "Dudu"}`;
  }

  update(coins, lives, available = 23) {
    this.coins.textContent = `✦ ${coins} / ${available}`;
    this.hearts.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
  }
}
