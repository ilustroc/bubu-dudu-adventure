import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mapsDirectory = resolve(root, "assets/maps");
const base = JSON.parse(readFileSync(resolve(mapsDirectory, "level_01.json"), "utf8"));
const width = 200;
const height = 16;
const tileSize = 18;
const terrainGid = (id) => 754 + id;
const empty = () => Array(width * height).fill(0);
const cell = (data, x, y, value) => { data[y * width + x] = value; };
const levelSpecs = [
  {
    number: 2,
    coins: 27,
    enemies: 7,
    hazards: 5,
    // El primer vacío enseña una secuencia corta: salto a puente bajo,
    // segundo escalón y descenso seguro. Las plataformas altas dejan dos
    // celdas libres sobre el suelo para que Bubu pueda pasar por debajo.
    pits: [[34, 5], [72, 3], [111, 3], [152, 3], [180, 3]],
    platforms: [
      [9, 34, 36], [8, 37, 41], [7, 43, 47],
      [9, 72, 74], [8, 75, 79], [7, 81, 85],
      [9, 111, 113], [8, 114, 118], [7, 120, 124],
      [9, 152, 154], [8, 155, 159], [7, 161, 165],
      [9, 180, 182],
    ],
    enemiesAt: [16, 50, 64, 92, 132, 169, 190],
    hazardsAt: [27, 59, 98, 140, 173],
  },
  {
    number: 3,
    coins: 30,
    enemies: 8,
    hazards: 6,
    pits: [[27, 4], [55, 5], [88, 3], [121, 5], [157, 4], [184, 3]],
    platforms: [
      [9, 27, 29], [8, 30, 34],
      [9, 55, 57], [8, 58, 62], [7, 64, 68],
      [9, 88, 90],
      [9, 121, 123], [8, 124, 128], [7, 130, 134],
      [9, 157, 159], [8, 160, 164],
      [9, 184, 186],
    ],
    enemiesAt: [14, 39, 73, 82, 108, 143, 173, 193],
    hazardsAt: [21, 47, 77, 103, 146, 176],
  },
  {
    number: 4,
    coins: 34,
    enemies: 10,
    hazards: 7,
    pits: [[23, 4], [50, 5], [80, 4], [110, 5], [143, 4], [173, 4]],
    platforms: [
      [9, 23, 25], [8, 26, 30],
      [9, 50, 52], [8, 53, 57], [7, 59, 63],
      [9, 80, 82], [8, 83, 87],
      [9, 110, 112], [8, 113, 117], [7, 119, 123],
      [9, 143, 145], [8, 146, 150],
      [9, 173, 175], [8, 176, 180],
    ],
    enemiesAt: [14, 36, 59, 70, 88, 96, 126, 147, 164, 188],
    hazardsAt: [19, 43, 73, 104, 136, 157, 183],
    beesAt: [36, 96, 147],
  },
  {
    number: 5,
    coins: 38,
    enemies: 11,
    hazards: 8,
    pits: [[19, 5], [45, 4], [72, 5], [103, 4], [132, 5], [162, 4], [186, 3]],
    platforms: [
      [9, 19, 21], [8, 22, 26], [7, 28, 32],
      [9, 45, 47], [8, 48, 52],
      [9, 72, 74], [8, 75, 79], [7, 81, 85],
      [9, 103, 105], [8, 106, 110],
      [9, 132, 134], [8, 135, 139], [7, 141, 145],
      [9, 162, 164], [8, 165, 169],
      [9, 186, 188],
    ],
    enemiesAt: [12, 36, 58, 67, 92, 118, 128, 151, 176, 181, 194],
    hazardsAt: [16, 40, 62, 98, 122, 155, 174, 191],
  },
];

function groundSegments(pits) {
  const blocked = new Set(pits.flatMap(([start, length]) => Array.from({ length }, (_, index) => start + index)));
  const segments = [];
  let start = null;
  for (let x = 0; x <= width; x += 1) {
    if (x < width && !blocked.has(x)) {
      if (start === null) start = x;
      continue;
    }
    if (start !== null) segments.push([start, x - 1]);
    start = null;
  }
  return segments;
}

function buildGround(pits) {
  const ground = empty();
  for (const [start, end] of groundSegments(pits)) {
    for (let y = 11; y < height; y += 1) {
      for (let x = start; x <= end; x += 1) {
        const first = x === start;
        const last = x === end;
        let tile = 41;
        if (y === 11) tile = first ? 0 : last ? 4 : 1 + ((x - start - 1) % 3);
        else if (y === height - 1) tile = first ? 12 : last ? 16 : 13 + ((x - start - 1) % 3);
        else tile = first ? 6 : last ? 10 : 7 + ((x - start - 1) % 3);
        cell(ground, x, y, terrainGid(tile));
      }
    }
  }
  return ground;
}

function buildPlatforms(runs) {
  const platforms = empty();
  for (const [y, start, end] of runs) {
    for (let x = start; x <= end; x += 1) {
      const tile = start === end ? 21 : x === start ? 18 : x === end ? 20 : 19;
      cell(platforms, x, y, terrainGid(tile));
    }
  }
  return platforms;
}

const isSolid = (ground, platforms, x, y) => Boolean(ground[y * width + x] || platforms[y * width + x]);
const makeObject = (id, name, type, x, y, extras = {}) => ({ id, name, type, x: x * tileSize, y: y * tileSize, width: 18, height: 18, ...extras });
const rangeProperty = (value) => [{ name: "range", type: "int", value }];

function makeCoins(count, ground, platforms, platformRuns, occupiedColumns) {
  const candidates = [];
  for (let x = 4; x < width - 4; x += 3) {
    if (isSolid(ground, platforms, x, 11)) candidates.push([x, 9]);
  }
  platformRuns.forEach(([y, start, end]) => candidates.push([Math.floor((start + end) / 2), y - 1]));
  const seen = new Set();
  const safeCandidates = candidates
    .filter((candidate) => {
      const key = candidate.join(",");
      const tooCloseToDanger = occupiedColumns.some(
        (column) => Math.abs(candidate[0] - column) <= 1,
      );
      if (seen.has(key) || tooCloseToDanger || isSolid(ground, platforms, candidate[0], candidate[1])) return false;
      seen.add(key);
      return true;
    })
    .sort(([firstX, firstY], [secondX, secondY]) => firstX - secondX || firstY - secondY);
  const selected = [];
  const used = new Set();
  for (let index = 0; index < count; index += 1) {
    const desired = Math.round(index * (safeCandidates.length - 1) / Math.max(1, count - 1));
    const candidateIndex = safeCandidates.findIndex(
      (candidate, offset) => offset >= desired && !used.has(candidate.join(",")),
    );
    const candidate = safeCandidates[candidateIndex >= 0 ? candidateIndex : safeCandidates.findIndex((entry) => !used.has(entry.join(",")))];
    if (!candidate) break;
    selected.push(candidate);
    used.add(candidate.join(","));
  }
  if (selected.length !== count) throw new Error(`No hay posiciones de moneda suficientes (${selected.length}/${count}).`);
  return selected;
}

function forestObjects() {
  const background = [
    [655, "tree-round", 8, 68, 88], [752, "pine-tall", 50, 50, 90], [657, "tree-small", 104, 49, 70], [753, "pine-short", 139, 46, 73], [656, "tree-wide", 172, 83, 76],
  ].map(([gid, name, x, objectWidth, objectHeight], index) => ({ id: 47 + index, name: `${name}-${index + 1}`, type: "", gid, x: x * tileSize, y: 198, width: objectWidth, height: objectHeight, rotation: 0, visible: true }));
  const foreground = [
    [658, "bush", 23, 39, 23], [660, "flower", 40, 18, 11], [669, "rock", 92, 36, 20], [666, "bush", 126, 42, 26], [674, "flower", 156, 14, 12], [687, "rock", 184, 52, 24],
  ].map(([gid, name, x, objectWidth, objectHeight], index) => ({ id: 53 + index, name: `${name}-${index + 1}`, type: "", gid, x: x * tileSize, y: 198, width: objectWidth, height: objectHeight, rotation: 0, visible: true }));
  return { background, foreground };
}

function createMap(spec) {
  const ground = buildGround(spec.pits);
  const platforms = buildPlatforms(spec.platforms);
  const coins = makeCoins(
    spec.coins,
    ground,
    platforms,
    spec.platforms,
    [...spec.enemiesAt, ...spec.hazardsAt],
  );
  let nextObjectId = 1;
  const coinObjects = coins.map(([x, y], index) => makeObject(nextObjectId++, `coin-${String(index + 1).padStart(2, "0")}`, "coin", x, y));
  const bees = new Set(spec.beesAt || []);
  const enemyObjects = spec.enemiesAt.map((x, index) => {
    const type = bees.has(x) ? "bee" : index % 3 === 0 ? "slime" : "patroller";
    const y = type === "bee" ? 7 : 10;
    const name = type === "bee" ? `bee-${String(index + 1).padStart(2, "0")}` : type === "slime" ? `slime-${String(index + 1).padStart(2, "0")}` : `patrol-${String(index + 1).padStart(2, "0")}`;
    return makeObject(nextObjectId++, name, type, x, y, { properties: rangeProperty(type === "bee" ? 3 : type === "patroller" ? 2 : 1) });
  });
  const hazardObjects = spec.hazardsAt.map((x, index) => makeObject(nextObjectId++, `cactus-${String(index + 1).padStart(2, "0")}`, "cactus", x, 10));
  const checkpointColumn = 101;
  const checkpointObjects = [makeObject(nextObjectId++, "checkpoint-01", "checkpoint", checkpointColumn, 10)];
  const spawnExitObjects = [makeObject(nextObjectId++, "spawn", "spawn", 3, 10), makeObject(nextObjectId++, "exit", "exit", 196, 10)];
  const forest = forestObjects();
  const replacement = new Map([
    ["Background", empty()], ["BackgroundVegetation", empty()], ["Ground", ground], ["Platforms", platforms], ["Decorations", empty()], ["ForegroundVegetation", empty()],
    ["Coins", coinObjects], ["Enemies", enemyObjects], ["Hazards", hazardObjects], ["Checkpoints", checkpointObjects], ["Spawn_Exit", spawnExitObjects], ["ForestBackgroundObjects", forest.background], ["ForestForegroundObjects", forest.foreground],
  ]);
  const layers = base.layers.map((layer) => {
    const content = replacement.get(layer.name);
    if (content === undefined) return structuredClone(layer);
    return layer.type === "tilelayer" ? { ...structuredClone(layer), data: content } : { ...structuredClone(layer), objects: content };
  });
  return {
    ...structuredClone(base),
    layers,
    nextobjectid: nextObjectId,
    properties: [{ name: "level", type: "int", value: spec.number }],
    tilesets: structuredClone(base.tilesets),
  };
}

const csv = (data) => Array.from({ length: height }, (_, row) => data.slice(row * width, (row + 1) * width).join(",")).join(",\n");
const xmlEscape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;");
function xmlObject(object) {
  const attributes = ["id", "name", "type", "x", "y", "width", "height", "gid"].filter((key) => object[key] !== undefined && object[key] !== "").map((key) => `${key}="${xmlEscape(object[key])}"`).join(" ");
  if (!object.properties?.length) return `  <object ${attributes}/>`;
  const properties = object.properties.map((property) => `    <property name="${xmlEscape(property.name)}" type="${property.type}" value="${xmlEscape(property.value)}"/>`).join("\n");
  return `  <object ${attributes}>\n   <properties>\n${properties}\n   </properties>\n  </object>`;
}
function mapToTmx(map) {
  const tilesets = [
    [1, "../external/kenney_pixel-platformer/Tiled/tileset-tiles.tsx"], [181, "../levels/level1/tilesets/forest-hills.tsx"], [277, "../../public/assets/biomas/pradera/decorations/pradera-decoraciones.tsx"], [655, "../biomas/pradera/bosque_tiled/tilesets/objetos_bosque.tsx"], [754, "../biomas/pradera/bosque_tiled/tilesets/terreno_18px.tsx"],
  ].map(([firstgid, source]) => ` <tileset firstgid="${firstgid}" source="${source}"/>`).join("\n");
  const layers = map.layers.map((layer) => {
    if (layer.type === "tilelayer") return ` <layer id="${layer.id}" name="${layer.name}" width="${width}" height="${height}"${layer.visible === false ? ' visible="0"' : ""}>\n  <data encoding="csv">\n${csv(layer.data)}\n  </data>\n </layer>`;
    const objects = layer.objects.map(xmlObject).join("\n");
    return ` <objectgroup id="${layer.id}" name="${layer.name}">\n${objects}\n </objectgroup>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<map version="1.10" tiledversion="1.12.2" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="18" tileheight="18" infinite="0" nextlayerid="${map.nextlayerid}" nextobjectid="${map.nextobjectid}">\n${tilesets}\n${layers}\n</map>\n`;
}

for (const spec of levelSpecs) {
  const map = createMap(spec);
  const suffix = String(spec.number).padStart(2, "0");
  writeFileSync(resolve(mapsDirectory, `level_${suffix}.json`), `${JSON.stringify(map, null, 2)}\n`);
  writeFileSync(resolve(mapsDirectory, `level_${suffix}.tmx`), mapToTmx(map));
  console.log(`Nivel ${spec.number}: ${spec.coins} monedas, ${spec.enemies} enemigos y ${spec.hazards} cactus.`);
}
