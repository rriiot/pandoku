// Pencil mode toggle + live "modifier held down" indicator on the pencil button.

import { pencilBtn } from "./dom";

let pencilMode = false;

export function isPencilInput(e: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean }): boolean {
  const modifier = e.shiftKey || e.ctrlKey || e.altKey;
  // XOR: holding a modifier inverts the pencil toggle.
  return modifier !== pencilMode;
}

function renderPencilBtn(): void {
  pencilBtn.classList.toggle("on", pencilMode);
}

let bound = false;
export function bindPencilMode(): void {
  if (bound) return;
  bound = true;
  pencilBtn.addEventListener("click", () => {
    pencilMode = !pencilMode;
    renderPencilBtn();
  });
  const updatePressing = (e: KeyboardEvent) => {
    const held = e.shiftKey || e.ctrlKey || e.altKey;
    pencilBtn.classList.toggle("pressing", held);
  };
  document.addEventListener("keydown", updatePressing);
  document.addEventListener("keyup", updatePressing);
  window.addEventListener("blur", () => pencilBtn.classList.remove("pressing"));
}
