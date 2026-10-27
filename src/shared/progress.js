const STORAGE_KEY = "bubu-dudu-adventure-progress-v2";
const defaults = { selectedCharacter: "bubu", coins: 0, completedLevels: [], collectedCoins: { level1: [] } };
export function getProgress() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); return { ...defaults, ...saved, collectedCoins: { level1: [], ...saved.collectedCoins } }; } catch { return structuredClone(defaults); } }
function save(progress) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Play continues when storage is unavailable. */ } }
export function saveSelectedCharacter(selectedCharacter) { const progress = getProgress(); progress.selectedCharacter = selectedCharacter; save(progress); }
export function collectCoin(levelId, coinId) { const progress = getProgress(); const found = new Set(progress.collectedCoins[levelId] || []); if (found.has(coinId)) return false; found.add(coinId); progress.collectedCoins[levelId] = [...found]; progress.coins += 1; save(progress); return true; }
export function collectedCoinIds(levelId) { return new Set(getProgress().collectedCoins[levelId] || []); }
export function completeLevel(levelId) { const progress = getProgress(); if (!progress.completedLevels.includes(levelId)) progress.completedLevels.push(levelId); save(progress); }
