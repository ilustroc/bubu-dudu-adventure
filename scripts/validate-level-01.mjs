import { readFileSync } from "node:fs";

const map = JSON.parse(readFileSync(new URL("../assets/maps/level_01.json", import.meta.url), "utf8"));
const tileSize = 18;
const scale = 3;
const jumpSpeed = 620;
const gravity = 1000;
const walkSpeed = 265;
const maxHeight = (jumpSpeed ** 2) / (2 * gravity);
const maxDistance = walkSpeed * ((2 * jumpSpeed) / gravity);
const getLayer = (name) => map.layers.find((layer) => layer.name === name);
const getTile = (layer, x, y) => layer.data[y * map.width + x] ?? 0;
const solidAt = (x, y) => [getLayer("Ground"), getLayer("Platforms")].some((layer) => getTile(layer, x, y) > 0);
const fail = (message) => { throw new Error(`level_01 inválido: ${message}`); };

for (const name of ["Background", "Ground", "Platforms", "Decorations", "Coins", "Enemies", "Hazards", "Checkpoints", "Spawn_Exit"]) {
  if (!getLayer(name)) fail(`falta la capa ${name}`);
}

const ground = getLayer("Ground");
let gapStart = null;
for (let x = 0; x < map.width; x += 1) {
  const open = !getTile(ground, x, 11);
  if (open && gapStart === null) gapStart = x;
  if ((!open || x === map.width - 1) && gapStart !== null) {
    const end = open ? x + 1 : x;
    const gapWidth = (end - gapStart) * tileSize * scale;
    if (gapWidth > maxDistance * .8) fail(`hueco de ${gapWidth}px supera el margen de salto`);
    gapStart = null;
  }
}

for (const coin of getLayer("Coins").objects) {
  const x = Math.floor(coin.x / tileSize); const y = Math.floor(coin.y / tileSize);
  if (solidAt(x, y)) fail(`moneda ${coin.name} incrustada en terreno`);
}
for (const hazard of getLayer("Hazards").objects) {
  const x = Math.floor(hazard.x / tileSize); const y = Math.floor(hazard.y / tileSize) + 1;
  if (!solidAt(x, y)) fail(`cactus ${hazard.name} sin plataforma`);
}
if (maxHeight < 162) fail("la altura de salto configurada es insuficiente para la ruta superior");
console.log(`level_01 válido: salto ${Math.round(maxHeight)}px, alcance ${Math.round(maxDistance)}px, ${getLayer("Coins").objects.length} monedas y ${getLayer("Hazards").objects.length} cactus.`);
