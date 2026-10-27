import Phaser from "phaser";
import { ForestScene } from "./game-scene.js";
new Phaser.Game({ type: Phaser.AUTO, parent: "game-container", backgroundColor: "#9ce2f5", physics: { default: "arcade", arcade: { gravity: { y: 1000 }, debug: false } }, scene: [ForestScene], scale: { mode: Phaser.Scale.RESIZE, width: 960, height: 540, autoCenter: Phaser.Scale.CENTER_BOTH }, render: { antialias: false, pixelArt: true, roundPixels: true } });
