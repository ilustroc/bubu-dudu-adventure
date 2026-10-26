let selectedCharacterKey = null;
const playButton = document.querySelector(".btn.btn-primary.mb-2");
const selectionMessage = document.getElementById("character-selection");

document.querySelectorAll(".character").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCharacterKey = button.dataset.character;
    const character = selectedCharacterKey === "bubu" ? "Bubu" : "Dudu";

    document.querySelectorAll(".character img").forEach((image) => {
      const imageCharacterKey = image.closest(".character").dataset.character;
      image.src = `assets/images/${imageCharacterKey}.png`;
    });

    const characterImage = button.querySelector("img");
    if (characterImage) {
      characterImage.src = `assets/images/${selectedCharacterKey}.gif`;
    }

    selectionMessage.textContent = `Seleccionaste a ${character}`;
  });
});

if (playButton) {
  playButton.addEventListener("click", (event) => {
    if (!selectedCharacterKey) {
      event.preventDefault();
      selectionMessage.textContent = "Selecciona un personaje para jugar.";
      return;
    }

    window.location.href = `levels/level_1.html?character=${encodeURIComponent(selectedCharacterKey)}`;
  });
}
