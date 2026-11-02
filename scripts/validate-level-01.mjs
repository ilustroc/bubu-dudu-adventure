import { readFileSync } from "node:fs";

const requirements = {
  1: { coins: 23, enemies: 6, hazards: 4 },
  2: { coins: 27, enemies: 7, hazards: 5 },
  3: { coins: 30, enemies: 8, hazards: 6 },
  4: { coins: 34, enemies: 10, hazards: 7 },
  5: { coins: 38, enemies: 11, hazards: 8 },
};
const tileSize = 18;
const scale = 3;
const jumpSpeed = 620;
const gravity = 1000;
const walkSpeed = 265;
const worldTile = tileSize * scale;
// Collider y margen de seguridad realistas: no se validan saltos solo con
// distancia de columnas. El cálculo usa la parábola de Arcade Physics y deja
// 30 px antes del vértice teórico de 192 px.
const player = { width: 42, height: 60, clearanceRows: 2 };
const safeRise = 150;
const expectedTilesets = [
  [1, "kenney_pixel_platformer"],
  [181, "forest-hills"],
  [277, "pradera-decoraciones"],
  [655, "bosque_objetos"],
  [754, "terreno_18px"],
];
const requiredLayers = [
  "Background", "BackgroundVegetation", "Ground", "Platforms", "Decorations",
  "ForegroundVegetation", "Coins", "Enemies", "Hazards", "Checkpoints", "Spawn_Exit",
  "ForestBackgroundObjects", "ForestForegroundObjects",
];
const property = (object, name, fallback) =>
  object.properties?.find((candidate) => candidate.name === name)?.value ?? fallback;
const box = (object, padding = 0) => ({
  left: object.x - padding, top: object.y - padding,
  right: object.x + object.width + padding, bottom: object.y + object.height + padding,
});
const overlaps = (a, b, padding = 0) => {
  const first = box(a, padding); const second = box(b, padding);
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
};

function surfaceSegments(map, solidAt) {
  const surfaces = [];
  for (let y = 0; y < map.height; y += 1) {
    let start = null;
    for (let x = 0; x <= map.width; x += 1) {
      const isSurface = x < map.width && solidAt(x, y) && !solidAt(x, y - 1);
      if (isSurface && start === null) start = x;
      if ((!isSurface || x === map.width) && start !== null) {
        surfaces.push({ start, end: x - 1, y });
        start = null;
      }
    }
  }
  return surfaces;
}

function jumpIsSafe(from, to) {
  const goesRight = from.end < to.start;
  const goesLeft = to.end < from.start;
  const horizontalTiles = goesRight
    ? to.start - from.end - 1
    : goesLeft
      ? from.start - to.end - 1
      : 0;
  const heightDifference = (to.y - from.y) * worldTile;
  const discriminant = jumpSpeed ** 2 + 2 * gravity * heightDifference;
  if (discriminant < 0 || -heightDifference > safeRise) return false;
  const flightTime = (jumpSpeed + Math.sqrt(discriminant)) / gravity;
  const horizontalReach = walkSpeed * flightTime - player.width - 24;
  return horizontalTiles * worldTile <= horizontalReach;
}

function validate(number, expected) {
  const label = `level_${String(number).padStart(2, "0")}`;
  const map = JSON.parse(readFileSync(new URL(`../assets/maps/${label}.json`, import.meta.url), "utf8"));
  const fail = (message) => { throw new Error(`${label} inválido: ${message}`); };
  const layer = (name) => map.layers.find((candidate) => candidate.name === name);
  const tile = (mapLayer, x, y) => mapLayer.data[y * map.width + x] ?? 0;
  const solids = [layer("Ground"), layer("Platforms")];
  const solidAt = (x, y) => solids.some((candidate) => candidate && tile(candidate, x, y) > 0);

  for (const name of requiredLayers) if (!layer(name)) fail(`falta la capa ${name}`);
  const tilesets = [...map.tilesets].sort((a, b) => a.firstgid - b.firstgid);
  if (tilesets.length !== expectedTilesets.length) fail(`se esperaban ${expectedTilesets.length} tilesets`);
  for (const [firstgid, name] of expectedTilesets) {
    const tileset = tilesets.find((candidate) => candidate.firstgid === firstgid);
    if (!tileset || tileset.name !== name) fail(`tileset ${firstgid}:${name} no está definido`);
    const hasImage = Boolean(tileset.image) || tileset.tiles?.every((entry) => entry.image);
    if (!hasImage || !tileset.tilewidth || !tileset.tileheight || !tileset.tilecount)
      fail(`tileset ${firstgid} no está completamente exportado`);
  }
  const isValidGid = (gid) => {
    if (!gid) return true;
    const raw = gid & 0x1fffffff;
    return tilesets.some((tileset, index) => raw >= tileset.firstgid && raw < (tilesets[index + 1]?.firstgid ?? tileset.firstgid + tileset.tilecount));
  };
  for (const tileLayer of map.layers.filter((candidate) => candidate.type === "tilelayer")) {
    const invalid = tileLayer.data.find((gid) => !isValidGid(gid));
    if (invalid !== undefined) fail(`GID ${invalid} inválido en ${tileLayer.name}`);
  }
  for (const name of ["Ground", "Platforms"]) {
    if (layer(name).data.some((gid) => gid && !(gid >= 754 && gid < 796)))
      fail(`${name} contiene tiles ajenos a terreno_18px`);
  }

  const coins = layer("Coins").objects;
  const enemies = layer("Enemies").objects;
  const hazards = layer("Hazards").objects;
  if (coins.length !== expected.coins || enemies.length !== expected.enemies || hazards.length !== expected.hazards)
    fail(`objetos esperados ${expected.coins}/${expected.enemies}/${expected.hazards}, recibidos ${coins.length}/${enemies.length}/${hazards.length}`);
  for (const coin of coins) {
    const x = Math.floor(coin.x / tileSize); const y = Math.floor(coin.y / tileSize);
    if (solidAt(x, y)) fail(`moneda ${coin.name} incrustada`);
    if (enemies.some((enemy) => overlaps(coin, enemy, 5))) fail(`moneda ${coin.name} se solapa con enemigo`);
    if (hazards.some((hazard) => overlaps(coin, hazard, 4))) fail(`moneda ${coin.name} se solapa con cactus`);
  }
  for (const hazard of hazards) {
    if (!solidAt(Math.floor(hazard.x / tileSize), Math.floor(hazard.y / tileSize) + 1)) fail(`cactus ${hazard.name} sin suelo`);
  }
  for (const enemy of enemies) {
    const x = Math.floor(enemy.x / tileSize); const y = Math.floor(enemy.y / tileSize) + 1;
    const range = Number(property(enemy, "range", 0));
    if (range <= 0) fail(`enemigo ${enemy.name} sin rango`);
    if (enemy.type === "bee") continue;
    if (!solidAt(x, y)) fail(`enemigo ${enemy.name} sin suelo`);
    for (const patrolX of [x - range, x + range]) if (!solidAt(patrolX, y)) fail(`patrulla ${enemy.name} alcanza un precipicio`);
  }
  const spawn = layer("Spawn_Exit").objects.find((candidate) => candidate.type === "spawn");
  const checkpoint = layer("Checkpoints").objects.find((candidate) => candidate.type === "checkpoint");
  const exit = layer("Spawn_Exit").objects.find((candidate) => candidate.type === "exit");
  for (const [kind, object] of [
    ["spawn", spawn],
    ["checkpoint", checkpoint],
    ["salida", exit],
  ]) {
    if (!object) fail(`falta ${kind}`);
    const x = Math.floor(object.x / tileSize); const y = Math.floor(object.y / tileSize) + 1;
    if (!solidAt(x, y)) fail(`${kind} no tiene suelo seguro`);
    if (hazards.some((hazard) => overlaps(object, hazard, 8)) || enemies.some((enemy) => enemy.type !== "bee" && overlaps(object, enemy, 8))) fail(`${kind} se superpone con un peligro`);
  }
  if (number === 1) {
    console.log(`${label} válido: ${coins.length} monedas, ${enemies.length} enemigos y ${hazards.length} cactus.`);
    return;
  }
  const surfaces = surfaceSegments(map, solidAt);
  for (const surface of surfaces) {
    if (surface.end - surface.start + 1 < 2) fail(`plataforma de aterrizaje demasiado corta en ${surface.start},${surface.y}`);
    for (let x = surface.start; x <= surface.end; x += 1) {
      for (let row = 1; row <= player.clearanceRows; row += 1) {
        if (solidAt(x, surface.y - row))
          fail(`pasadizo con menos de dos tiles libres en ${x},${surface.y}`);
      }
    }
  }
  const spawnColumn = Math.floor(spawn.x / tileSize);
  const exitColumn = Math.floor(exit.x / tileSize);
  const findSurface = (column) => surfaces.findIndex(
    (surface) => surface.start <= column && surface.end >= column && surface.y === 11,
  );
  const spawnSurface = findSurface(spawnColumn);
  const exitSurface = findSurface(exitColumn);
  if (spawnSurface < 0 || exitSurface < 0) fail("spawn o salida no se encuentran sobre una superficie transitable");
  const reached = new Set([spawnSurface]);
  const queue = [spawnSurface];
  while (queue.length) {
    const index = queue.shift();
    for (let candidate = 0; candidate < surfaces.length; candidate += 1) {
      if (reached.has(candidate) || !jumpIsSafe(surfaces[index], surfaces[candidate])) continue;
      reached.add(candidate);
      queue.push(candidate);
    }
  }
  if (!reached.has(exitSurface)) fail("no hay ruta física continua desde spawn hasta el portal");
  for (const [index, surface] of surfaces.entries()) {
    if (surface.y < 11 && !reached.has(index))
      fail(`plataforma inaccesible en ${surface.start},${surface.y}`);
  }
  console.log(`${label} válido: ${coins.length} monedas, ${enemies.length} enemigos y ${hazards.length} cactus; ${surfaces.length} superficies conectadas.`);
}

for (const [number, expected] of Object.entries(requirements)) validate(Number(number), expected);
