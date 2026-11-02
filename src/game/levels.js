import level01Url from "../../assets/maps/level_01.json?url";
import level02Url from "../../assets/maps/level_02.json?url";
import level03Url from "../../assets/maps/level_03.json?url";
import level04Url from "../../assets/maps/level_04.json?url";
import level05Url from "../../assets/maps/level_05.json?url";

export const LEVELS = [
  { number: 1, id: "level1", key: "level01", name: "El Bosque Encantado", url: level01Url },
  { number: 2, id: "level2", key: "level02", name: "Senderos Floridos", url: level02Url },
  { number: 3, id: "level3", key: "level03", name: "Las Colinas Saltarinas", url: level03Url },
  { number: 4, id: "level4", key: "level04", name: "El Jardín de las Abejas", url: level04Url },
  { number: 5, id: "level5", key: "level05", name: "El Último Sendero", url: level05Url },
];

export const getLevel = (number) => LEVELS.find((level) => level.number === number) ?? LEVELS[0];

export const levelUrl = (number, testMode = false) => {
  const search = new URLSearchParams({ character: "bubu", level: String(number) });
  if (testMode) search.set("test", "1");
  return `/levels/level_1.html?${search}`;
};
