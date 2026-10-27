import { existsSync, mkdirSync, writeFileSync } from "node:fs";

// level_01.tmx is the editable source of truth. This script only rewrites it
// when explicitly invoked with --write. The default command is intentionally
// non-destructive so manual Tiled edits are never erased by accident.
const writeTemplate = process.argv.includes("--write");
const tileSize = 18;
const width = 200;
const height = 16;
const empty = () => Array(width * height).fill(0);
const put = (data, x, y, gid) => {
  if (x >= 0 && x < width && y >= 0 && y < height) data[y * width + x] = gid;
};
const fill = (data, start, end, top = 11) => {
  for (let x = start; x < end; x += 1) {
    put(data, x, top, 1);
    for (let y = top + 1; y < height; y += 1) put(data, x, y, 41);
  }
};
const run = (data, start, y, length, gid = 1) => {
  for (let x = start; x < start + length; x += 1) put(data, x, y, gid);
};

const ground = empty();
// Five zones. Mandatory gaps are only 2 tiles (108 px): an early, generous
// lesson that remains comfortable on touch controls and below Bubu's reach.
[[0, 43], [45, 82], [84, 122], [124, 161], [163, 183], [185, 200]]
  .forEach(([start, end]) => fill(ground, start, end));
const platforms = empty();
// Introduction, optional high route and final challenge. Max rise: 3 tiles.
[
  [15, 9, 4], [23, 9, 5],
  [45, 9, 5], [52, 8, 5], [60, 7, 5], [68, 8, 5],
  [84, 9, 4], [91, 8, 5], [99, 7, 5], [107, 8, 3],
  [120, 9, 5], [128, 8, 4], [136, 7, 5], [145, 9, 4],
  [160, 9, 5], [168, 8, 4], [174, 7, 3], [186, 9, 5], [193, 8, 4],
].forEach(([start, y, length]) => run(platforms, start, y - 1, length));
const decorations = empty();
// Decorations stay visual-only. Cactus art is deliberately not used here:
// every cactus the player sees comes from Hazards and therefore communicates damage.

const object = (id, name, type, x, y, properties = []) => ({
  id, name, type, x: x * tileSize, y: y * tileSize, width: tileSize, height: tileSize,
  rotation: 0, visible: true, properties,
});
let id = 1;
const objectLayer = (name, objects) => ({ id: id++, name, type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects });
const coins = [
  [6, 9], [10, 9], [16, 7], [24, 7], [31, 9],
  [46, 7], [53, 6], [60, 5], [65, 6], [69, 6],
  [85, 7], [92, 6], [99, 5], [108, 6], [121, 7],
  [129, 6], [137, 5], [146, 7], [161, 7], [168, 6],
  [175, 5], [187, 7], [194, 6],
];
const coinsLayer = objectLayer("Coins", coins.map(([x, y], index) => object(id++, `coin-${String(index + 1).padStart(2, "0")}`, "coin", x, y)));
const enemiesLayer = objectLayer("Enemies", [
  // Main-route lessons: safe starting distance, clear patrol lengths and no pits.
  object(id++, "slime-01", "slime", 14, 10, [{ name: "range", type: "int", value: 3 }]),
  object(id++, "slime-02", "slime", 55, 10, [{ name: "range", type: "int", value: 3 }]),
  object(id++, "patrol-01", "patroller", 88, 10, [{ name: "range", type: "int", value: 4 }]),
  object(id++, "slime-03", "slime", 132, 10, [{ name: "range", type: "int", value: 3 }]),
  object(id++, "patrol-02", "patroller", 168, 10, [{ name: "range", type: "int", value: 3 }]),
  object(id++, "slime-04", "slime", 190, 10, [{ name: "range", type: "int", value: 2 }]),
]);
const hazardsLayer = objectLayer("Hazards", [
  // Cacti live on solid raised tiles: visible lessons for optional routes,
  // never invisible blockers in a mandatory landing zone or a pit.
  object(id++, "cactus-01", "cactus", 26, 7), object(id++, "cactus-02", "cactus", 62, 5),
  object(id++, "cactus-03", "cactus", 102, 5), object(id++, "cactus-04", "cactus", 170, 6),
]);
const checkpointsLayer = objectLayer("Checkpoints", [object(id++, "checkpoint-01", "checkpoint", 105, 10)]);
const spawnExitLayer = objectLayer("Spawn_Exit", [object(id++, "spawn", "spawn", 3, 10), object(id++, "exit", "exit", 196, 10)]);
const tileLayer = (name, data) => ({ id: id++, name, type: "tilelayer", x: 0, y: 0, width, height, visible: true, opacity: 1, data });
const map = {
  compressionlevel: -1, height, infinite: false,
  layers: [tileLayer("Background", empty()), tileLayer("Ground", ground), tileLayer("Platforms", platforms), tileLayer("Decorations", decorations), coinsLayer, enemiesLayer, hazardsLayer, checkpointsLayer, spawnExitLayer],
  nextlayerid: id + 1, nextobjectid: id + 1, orientation: "orthogonal", renderorder: "right-down", tiledversion: "1.10.2", tileheight: tileSize, tilewidth: tileSize, type: "map", version: "1.10", width,
  tilesets: [{ firstgid: 1, name: "kenney_pixel_platformer", tilewidth: tileSize, tileheight: tileSize, tilecount: 180, columns: 20, image: "../external/kenney_pixel-platformer/Tilemap/tilemap_packed.png", imagewidth: 360, imageheight: 162 }],
};
const csv = (data) => data.join(",");
const xmlProperties = (properties) => properties.length ? `<properties>${properties.map((property) => `<property name="${property.name}" type="${property.type}" value="${property.value}"/>`).join("")}</properties>` : "";
const xmlObjects = (entry) => entry.objects.map((item) => `<object id="${item.id}" name="${item.name}" type="${item.type}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}">${xmlProperties(item.properties)}</object>`).join("");
const tmx = `<?xml version="1.0" encoding="UTF-8"?>\n<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="18" tileheight="18" infinite="0" nextlayerid="${map.nextlayerid}" nextobjectid="${map.nextobjectid}">\n <tileset firstgid="1" source="../external/kenney_pixel-platformer/Tiled/tileset-tiles.tsx"/>\n${[["Background", empty()], ["Ground", ground], ["Platforms", platforms], ["Decorations", decorations]].map(([name, data], index) => ` <layer id="${index + 1}" name="${name}" width="${width}" height="${height}"><data encoding="csv">${csv(data)}</data></layer>`).join("\n")}\n${[coinsLayer, enemiesLayer, hazardsLayer, checkpointsLayer, spawnExitLayer].map((entry, index) => ` <objectgroup id="${index + 5}" name="${entry.name}">${xmlObjects(entry)}</objectgroup>`).join("\n")}\n</map>\n`;

const mapPath = new URL("../assets/maps/level_01.json", import.meta.url);
const tmxPath = new URL("../assets/maps/level_01.tmx", import.meta.url);
if (!writeTemplate) {
  if (!existsSync(tmxPath) || !existsSync(mapPath)) throw new Error("Falta level_01.tmx o level_01.json.");
  console.log("Mapa protegido: level_01.tmx es editable en Tiled. No se sobrescribió nada.");
  console.log("Para reconstruir la plantilla base de forma explícita usa: node scripts/generate-level-01.mjs --write");
} else {
  mkdirSync(new URL("../assets/maps/", import.meta.url), { recursive: true });
  writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
  writeFileSync(tmxPath, tmx);
  console.log("Plantilla level_01 reconstruida: 5 zonas, Hazards y rutas superior/inferior.");
}
