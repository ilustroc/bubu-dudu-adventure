import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = resolve(projectRoot, "assets/maps/level_01.json");
const mapDirectory = dirname(mapPath);
const map = JSON.parse(readFileSync(mapPath, "utf8"));
const canonicalNames = new Map([
  [1, "kenney_pixel_platformer"],
  [181, "forest-hills"],
  [277, "pradera-decoraciones"],
]);

const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [
      key,
      value,
    ]),
  );

const requiredNumber = (value, field, source) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0)
    throw new Error(`${source}: ${field} inválido.`);
  return number;
};

const relativeToMap = (path) => relative(mapDirectory, path).replaceAll("\\", "/");

const inlineTileset = (entry) => {
  const { firstgid, source } = entry;
  if (!source) {
    if (!entry.name || !entry.image)
      throw new Error(`Tileset ${firstgid} no tiene metadata ni source externo.`);
    return { ...entry, name: canonicalNames.get(firstgid) ?? entry.name };
  }
  const tsxPath = resolve(mapDirectory, source);
  const tsx = readFileSync(tsxPath, "utf8");
  const tilesetTag = tsx.match(/<tileset\b[^>]*>/)?.[0];
  const imageTag = tsx.match(/<image\b[^>]*\/>/)?.[0];
  if (!tilesetTag || !imageTag)
    throw new Error(`${source}: falta <tileset> o <image>.`);

  const tileset = attributes(tilesetTag);
  const image = attributes(imageTag);
  const imagePath = resolve(dirname(tsxPath), image.source);
  const tilewidth = requiredNumber(tileset.tilewidth, "tilewidth", source);
  const tileheight = requiredNumber(tileset.tileheight, "tileheight", source);
  const imagewidth = requiredNumber(image.width, "image width", source);
  const imageheight = requiredNumber(image.height, "image height", source);
  const columns = requiredNumber(tileset.columns, "columns", source);
  const tilecount = requiredNumber(tileset.tilecount, "tilecount", source);

  return {
    firstgid,
    columns,
    image: relativeToMap(imagePath),
    imageheight,
    imagewidth,
    margin: Number(tileset.margin ?? 0),
    name: canonicalNames.get(firstgid) ?? tileset.name,
    spacing: Number(tileset.spacing ?? 0),
    tilecount,
    tileheight,
    tilewidth,
  };
};

map.tilesets = map.tilesets.map(inlineTileset).sort((a, b) => a.firstgid - b.firstgid);
writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
console.log(
  `Tilesets sincronizados: ${map.tilesets
    .map(({ firstgid, name }) => `${firstgid}:${name}`)
    .join(", ")}.`,
);
