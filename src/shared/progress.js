const STORAGE_KEY = "bubu-dudu-adventure-progress-v2";
const LEVEL_IDS = ["level1", "level2", "level3", "level4", "level5"];
const defaults = { selectedCharacter: "bubu", coins: 0, completedLevels: [], collectedCoins: { level1: [] } };

export function getProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaults,
      ...saved,
      completedLevels: Array.isArray(saved.completedLevels) ? saved.completedLevels : [],
      collectedCoins: { level1: [], ...saved.collectedCoins },
    };
  } catch {
    return structuredClone(defaults);
  }
}

function save(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Play continues when storage is unavailable. */ }
}

export function saveSelectedCharacter(selectedCharacter) {
  const progress = getProgress();
  progress.selectedCharacter = selectedCharacter;
  save(progress);
}

export function collectCoin(levelId, coinId) {
  const progress = getProgress();
  const found = new Set(progress.collectedCoins[levelId] || []);
  if (found.has(coinId)) return false;
  found.add(coinId);
  progress.collectedCoins[levelId] = [...found];
  progress.coins += 1;
  save(progress);
  return true;
}

export function collectedCoinIds(levelId) {
  return new Set(getProgress().collectedCoins[levelId] || []);
}

export function completeLevel(levelId) {
  const progress = getProgress();
  if (!progress.completedLevels.includes(levelId)) progress.completedLevels.push(levelId);
  save(progress);
}

export function getHighestUnlockedLevel() {
  const completed = new Set(getProgress().completedLevels);
  for (let index = 0; index < LEVEL_IDS.length - 1; index += 1) {
    if (!completed.has(LEVEL_IDS[index])) return index + 1;
  }
  return LEVEL_IDS.length;
}

export function isLevelUnlocked(levelNumber) {
  return levelNumber >= 1 && levelNumber <= getHighestUnlockedLevel();
}
