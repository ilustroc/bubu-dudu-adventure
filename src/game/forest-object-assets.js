const forestObjectModules = import.meta.glob(
  "../../assets/biomas/pradera/bosque_tiled/tiled_objetos_25pct/{arboles,arbustos,flores_y_plantas,rocas}/*.png",
  { eager: true, import: "default", query: "?url" },
);

const modulePathFor = (tileImage) =>
  tileImage.replace("../biomas/", "../../assets/biomas/");

const textureKeyFor = (modulePath) =>
  `bosque-object-${modulePath.replace(/[^a-z0-9]+/gi, "-")}`;

// The TSX is a collection of individual PNGs. Vite resolves every supported
// decoration ahead of time; Tiled still owns their IDs and their placement.
export const forestObjectAssets = new Map(
  Object.entries(forestObjectModules).map(([modulePath, assetUrl]) => [
    textureKeyFor(modulePath),
    assetUrl,
  ]),
);

export const forestObjectTextureKey = (tileImage) => {
  const textureKey = textureKeyFor(modulePathFor(tileImage));
  return forestObjectAssets.has(textureKey) ? textureKey : null;
};
