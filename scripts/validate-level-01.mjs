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
const objectBox = (object, padding = 0) => ({ left: object.x - padding, top: object.y - padding, right: object.x + object.width + padding, bottom: object.y + object.height + padding });
const overlaps = (first, second, padding = 0) => { const a = objectBox(first, padding); const b = objectBox(second, padding); return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; };
const objectProperty = (object, name, fallback) => object.properties?.find((property) => property.name === name)?.value ?? fallback;

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

const coins = getLayer("Coins").objects;
const enemies = getLayer("Enemies").objects;
const hazards = getLayer("Hazards").objects;
for (const coin of coins) {
  const x = Math.floor(coin.x / tileSize); const y = Math.floor(coin.y / tileSize);
  if (solidAt(x, y)) fail(`moneda ${coin.name} incrustada en terreno`);
  for (const enemy of enemies) if (overlaps(coin, enemy, 5)) fail(`moneda ${coin.name} se solapa con ${enemy.name}`);
  for (const hazard of hazards) if (overlaps(coin, hazard, 4)) fail(`moneda ${coin.name} queda oculta por ${hazard.name}`);
}
for (const hazard of hazards) {
  const x = Math.floor(hazard.x / tileSize); const y = Math.floor(hazard.y / tileSize) + 1;
  if (!solidAt(x, y)) fail(`cactus ${hazard.name} sin plataforma`);
}
for (const enemy of enemies) {
  const x = Math.floor(enemy.x / tileSize); const y = Math.floor(enemy.y / tileSize) + 1;
  const range = Number(objectProperty(enemy, "range", 0));
  if (!solidAt(x, y)) fail(`enemigo ${enemy.name} sin suelo`);
  if (range <= 0) fail(`enemigo ${enemy.name} sin rango de patrulla`);
  for (const patrolX of [x - range, x + range]) if (!solidAt(patrolX, y)) fail(`patrulla ${enemy.name} alcanza un precipicio`);
}
const spawn = getLayer("Spawn_Exit").objects.find((object) => object.type === "spawn");
const checkpoint = getLayer("Checkpoints").objects.find((object) => object.type === "checkpoint");
const exit = getLayer("Spawn_Exit").objects.find((object) => object.type === "exit");
for (const [label, marker] of [["spawn", spawn], ["checkpoint", checkpoint], ["salida", exit]]) {
  if (!marker) fail(`falta ${label}`);
  const x = Math.floor(marker.x / tileSize); const y = Math.floor(marker.y / tileSize) + 1;
  if (!solidAt(x, y)) fail(`${label} no tiene suelo seguro`);
  if (hazards.some((hazard) => overlaps(marker, hazard, 8)) || enemies.some((enemy) => overlaps(marker, enemy, 8))) fail(`${label} se superpone con un peligro`);
}
for (const name of ["BackgroundVegetation", "ForegroundVegetation"]) {
  const layer = getLayer(name);
  if (!layer) continue;
  const seen = new Set();
  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if (getTile(layer, x, y) <= 0 || seen.has(`${x},${y}`)) continue;
      const stack = [[x, y]];
      const cells = [];
      seen.add(`${x},${y}`);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        cells.push([cx, cy]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue;
          if (seen.has(`${nx},${ny}`) || getTile(layer, nx, ny) <= 0) continue;
          seen.add(`${nx},${ny}`);
          stack.push([nx, ny]);
        }
      }
      if (!cells.some(([cx, cy]) => solidAt(cx, cy + 1))) {
        fail(`vegetación sin apoyo en ${name} (${x},${y})`);
      }
    }
  }
}
if (maxHeight < 162) fail("la altura de salto configurada es insuficiente para la ruta superior");
console.log(`level_01 válido: salto ${Math.round(maxHeight)}px, alcance ${Math.round(maxDistance)}px, ${coins.length} monedas, ${enemies.length} enemigos y ${hazards.length} cactus.`);
