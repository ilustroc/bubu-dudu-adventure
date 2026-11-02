import {
  getHighestUnlockedLevel,
  getProgress,
  saveSelectedCharacter,
} from "/src/shared/progress.js";

const cards = [...document.querySelectorAll(".character-card")];
const message = document.querySelector("#character-selection");
const playButton = document.querySelector("#play-button");
let selectedCharacter = null;
const continueLevel = getHighestUnlockedLevel();

playButton.setAttribute("aria-label", `Jugar desde el nivel ${continueLevel}`);

function selectCharacter(character) {
  selectedCharacter = character;
  saveSelectedCharacter(character);

  cards.forEach((card) => {
    const selected = !card.disabled && card.dataset.character === character;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });

  message.textContent = "¡Rescata a Dudu!";
}

cards
  .filter((card) => !card.disabled)
  .forEach((card) => card.addEventListener("click", () => selectCharacter(card.dataset.character)));

playButton.addEventListener("click", () => {
  if (!selectedCharacter) {
    message.textContent = "Elige a Bubu para comenzar la aventura.";
    return;
  }

  window.location.assign(`/levels/level_1.html?character=bubu&level=${continueLevel}`);
});

document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.getElementById(button.dataset.dialog).showModal());
});
document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelector("#coin-balance").textContent = getProgress().coins;
const notice = new URLSearchParams(window.location.search).get("notice");
if (notice === "dudu") {
  message.textContent = "Dudu estará disponible cuando sus animaciones oficiales estén listas.";
} else if (notice === "locked") {
  message.textContent = "Completa el nivel anterior para desbloquear este sendero.";
}
