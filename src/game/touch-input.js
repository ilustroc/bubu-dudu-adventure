export class TouchInput {
  constructor() {
    this.left = false; this.right = false; this.jump = false;
    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = button.dataset.control;
      const set = (active) => { this[key] = active; button.classList.toggle("is-active", active); };
      button.addEventListener("pointerdown", (event) => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); set(true); });
      ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => button.addEventListener(eventName, () => set(false)));
    });
  }
  clear() { this.left = this.right = this.jump = false; }
}
