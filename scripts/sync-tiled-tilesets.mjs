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
  [655, "bosque_objetos"],
  [754, "terreno_18px"],
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
    const hasAtlasImage = typeof entry.image === "string" && entry.image;
    const hasCollectionImages = Array.isArray(entry.tiles) && entry.tiles.length > 0;
    if (!entry.name || (!hasAtlasImage && !hasCollectionImages))
      throw new Error(`Tileset ${firstgid} no tiene metadata ni source externo.`);
    return { ...entry, name: canonicalNames.get(firstgid) ?? entry.name };
  }
  const tsxPath = resolve(mapDirectory, source);
  const tsx = readFileSync(tsxPath, "utf8");
  const tilesetTag = tsx.match(/<tileset\b[^>]*>/)?.[0];
  if (!tilesetTag) throw new Error(`${source}: falta <tileset>.`);

  const tileset = attributes(tilesetTag);
  const tilewidth = requiredNumber(tileset.tilewidth, "tilewidth", source);
  const tileheight = requiredNumber(tileset.tileheight, "tileheight", source);
  const columns = Number(tileset.columns);
  if (!Number.isInteger(columns) || columns < 0)
    throw new Error(`${source}: columns inválido.`);
  const tilecount = requiredNumber(tileset.tilecount, "tilecount", source);

  const imageTag = tsx.match(/<tileset\b[^>]*>\s*<image\b[^>]*\/>/)?.[0]
    ?.match(/<image\b[^>]*\/>/)?.[0];
  if (!imageTag) {
    const tiles = [...tsx.matchAll(/<tile\b[^>]*>\s*<image\b[^>]*\/>\s*<\/tile>/g)].map((match) => {
      const tile = attributes(match[0].match(/<tile\b[^>]*>/)?.[0] ?? "");
      const image = attributes(match[0].match(/<image\b[^>]*\/>/)?.[0] ?? "");
      const id = Number(tile.id);
      if (!Number.isInteger(id) || id < 0)
        throw new Error(`${source}: tile id inválido.`);
      return {
        id,
        image: relativeToMap(resolve(dirname(tsxPath), image.source)),
        imageheight: requiredNumber(image.height, "tile image height", source),
        imagewidth: requiredNumber(image.width, "tile image width", source),
      };
    });
    if (tiles.length !== tilecount)
      throw new Error(`${source}: colección incompleta (${tiles.length}/${tilecount}).`);
    return {
      firstgid,
      columns,
      margin: Number(tileset.margin ?? 0),
      name: canonicalNames.get(firstgid) ?? tileset.name,
      spacing: Number(tileset.spacing ?? 0),
      tilecount,
      tileheight,
      tilewidth,
      tiles,
    };
  }

  const image = attributes(imageTag);
  const imagePath = resolve(dirname(tsxPath), image.source);
  const imagewidth = requiredNumber(image.width, "image width", source);
  const imageheight = requiredNumber(image.height, "image height", source);

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
