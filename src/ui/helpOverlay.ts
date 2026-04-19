// Help overlay — static content in index.html plus a language-picker grid at
// the top of the body. This module handles open/close and also builds the grid.

import { helpBtn, helpCloseBtn, helpOverlay } from "./dom";
import { buildLanguageGrid } from "../i18n/dom";

export function openHelp(): void {
  const grid = document.getElementById("language-grid");
  if (grid) buildLanguageGrid(grid);
  helpOverlay.classList.remove("hidden");
  helpOverlay.setAttribute("aria-hidden", "false");
}
export function closeHelp(): void {
  helpOverlay.classList.add("hidden");
  helpOverlay.setAttribute("aria-hidden", "true");
}
export function isHelpOpen(): boolean {
  return !helpOverlay.classList.contains("hidden");
}

export function bindHelpHandlers(): void {
  helpBtn.addEventListener("click", openHelp);
  helpCloseBtn.addEventListener("click", closeHelp);
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) closeHelp();
  });
}
