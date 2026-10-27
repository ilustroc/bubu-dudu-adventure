import { mkdirSync, writeFileSync } from "node:fs";

const tileSize = 18;
const width = 200;
const height = 14;
const empty = () => Array(width * height).fill(0);
const put = (data, x, y, gid) => { if (x >= 0 && x < width && y >= 0 && y < height) data[y * width + x] = gid; };
const ground = empty(); const platforms = empty(); const decorations = empty();
const segments = [[0, 34], [37, 75], [78, 112], [115, 150], [153, 178], [181, 200]];
for (const [start, end] of segments) for (let x = start; x < end; x += 1) { put(ground, x, 10, 1); for (let y = 11; y < height; y += 1) put(ground, x, y, 41); }
const platformRuns = [[10, 9, 6], [16, 8, 5], [23, 9, 6], [42, 9, 6], [49, 8, 5], [57, 7, 5], [84, 9, 6], [91, 8, 5], [99, 7, 5], [119, 9, 6], [127, 8, 5], [136, 7, 5], [157, 9, 6], [165, 8, 5], [172, 7, 5], [185, 9, 5], [192, 8, 5]];
for (const [start, y, run] of platformRuns) for (let x = start; x < start + run; x += 1) put(platforms, x, y, 1);
for (const x of [35, 76, 113, 151, 179]) put(decorations, x, 9, 128);
const object = (id, name, type, x, y, properties = []) => ({ id, name, type, x: x * tileSize, y: y * tileSize, width: tileSize, height: tileSize, rotation: 0, visible: true, properties });
const coins = [[7, 9], [11, 8], [18, 7], [25, 8], [43, 8], [51, 7], [59, 6], [69, 9], [85, 8], [93, 7], [101, 6], [120, 8], [128, 7], [138, 6], [146, 9], [158, 8], [166, 7], [173, 6], [186, 8], [193, 7]];
let id = 1;
const coinsLayer = { id: id++, name: "Coins", type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects: coins.map(([x, y], index) => object(id++, `coin-${String(index + 1).padStart(2, "0")}`, "coin", x, y)) };
const enemiesLayer = { id: id++, name: "Enemies", type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects: [object(id++, "slime-01", "slime", 30, 9, [{ name: "range", type: "int", value: 4 }]), object(id++, "patrol-01", "patroller", 72, 9, [{ name: "range", type: "int", value: 7 }]), object(id++, "slime-02", "slime", 110, 9, [{ name: "range", type: "int", value: 5 }]), object(id++, "patrol-02", "patroller", 148, 9, [{ name: "range", type: "int", value: 7 }]), object(id++, "slime-03", "slime", 177, 9, [{ name: "range", type: "int", value: 4 }])] };
const checkpointLayer = { id: id++, name: "Checkpoints", type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects: [object(id++, "checkpoint-01", "checkpoint", 104, 9)] };
const spawnExitLayer = { id: id++, name: "Spawn_Exit", type: "objectgroup", visible: true, opacity: 1, draworder: "topdown", objects: [object(id++, "spawn", "spawn", 3, 9), object(id++, "exit", "exit", 196, 8)] };
const tileLayer = (layerId, name, data) => ({ id: layerId, name, type: "tilelayer", x: 0, y: 0, width, height, visible: true, opacity: 1, data });
const map = { compressionlevel: -1, height, infinite: false, layers: [tileLayer(id++, "Background", empty()), tileLayer(id++, "Ground", ground), tileLayer(id++, "Platforms", platforms), tileLayer(id++, "Decorations", decorations), coinsLayer, enemiesLayer, checkpointLayer, spawnExitLayer], nextlayerid: id + 1, nextobjectid: id + 1, orientation: "orthogonal", renderorder: "right-down", tiledversion: "1.10.2", tileheight: tileSize, tilewidth: tileSize, type: "map", version: "1.10", width, tilesets: [{ firstgid: 1, name: "kenney_pixel_platformer", tilewidth: tileSize, tileheight: tileSize, tilecount: 180, columns: 20, image: "../external/kenney_pixel-platformer/Tilemap/tilemap_packed.png", imagewidth: 360, imageheight: 162 }] };
const csv = (data) => data.join(",");
const tmx = `<?xml version="1.0" encoding="UTF-8"?>\n<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="18" tileheight="18" infinite="0">\n <tileset firstgid="1" source="../external/kenney_pixel-platformer/Tiled/tileset-tiles.tsx"/>\n${[ ["Background", empty()], ["Ground", ground], ["Platforms", platforms], ["Decorations", decorations] ].map(([name, data], index) => ` <layer id="${index + 1}" name="${name}" width="${width}" height="${height}"><data encoding="csv">${csv(data)}</data></layer>`).join("\n")}\n <objectgroup id="5" name="Coins">${coinsLayer.objects.map((entry) => `<object id="${entry.id}" name="${entry.name}" type="coin" x="${entry.x}" y="${entry.y}" width="18" height="18"/>`).join("")}</objectgroup>\n <objectgroup id="6" name="Enemies">${enemiesLayer.objects.map((entry) => `<object id="${entry.id}" name="${entry.name}" type="${entry.type}" x="${entry.x}" y="${entry.y}" width="18" height="18"/>`).join("")}</objectgroup>\n <objectgroup id="7" name="Checkpoints"><object id="${checkpointLayer.objects[0].id}" name="checkpoint-01" type="checkpoint" x="${checkpointLayer.objects[0].x}" y="${checkpointLayer.objects[0].y}" width="18" height="18"/></objectgroup>\n <objectgroup id="8" name="Spawn_Exit">${spawnExitLayer.objects.map((entry) => `<object id="${entry.id}" name="${entry.name}" type="${entry.type}" x="${entry.x}" y="${entry.y}" width="18" height="18"/>`).join("")}</objectgroup>\n</map>\n`;
mkdirSync(new URL("../assets/maps/", import.meta.url), { recursive: true });
writeFileSync(new URL("../assets/maps/level_01.json", import.meta.url), `${JSON.stringify(map, null, 2)}\n`);
writeFileSync(new URL("../assets/maps/level_01.tmx", import.meta.url), tmx);
