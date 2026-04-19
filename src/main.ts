// Entry point — imports all UI modules and wires them together. No business
// logic lives here; everything else is in ./ui, ./gen, ./solver, ./board, etc.

import { LogicalSize } from "@tauri-apps/api/window";
import { appWindow, boardEl, diffSelect, newBtn } from "./ui/dom";
import { buildGrid, buildPad, render } from "./ui/render";
import { inputNumber, selectCell, togglePencil } from "./ui/state";
import { revertLast } from "./ui/state";
import { isPencilInput, bindPencilMode } from "./ui/pencilMode";
import { bindLoadingHandlers } from "./ui/loadingOverlay";
import { bindHelpHandlers } from "./ui/helpOverlay";
import { bindHistoryHandlers } from "./ui/history";
import { bindAdvancedHandlers, openAdvanced } from "./ui/advancedOverlay";
import { bindKeyboard } from "./ui/keyboard";
import { startCustomPuzzle, startNewPuzzle } from "./ui/puzzleFlow";
import { onLocaleChange } from "./i18n";
import { applyI18n } from "./i18n/dom";

/* Titlebar controls */
document.getElementById("minimize-btn")?.addEventListener("click", () => appWindow.minimize());
document.getElementById("close-btn")?.addEventListener("click", () => appWindow.close());
document.getElementById("titlebar")?.addEventListener("dblclick", (e) => {
  if ((e.target as Element).closest("button")) return;
});

/* Grid + pad construction */
buildGrid(selectCell);
buildPad({
  onNumber: (n, e) => {
    const btn = (e.currentTarget ?? e.target) as HTMLButtonElement;
    if (btn.classList.contains("filled")) {
      import("./ui/state")
        .then(({ toggleNumberHighlight }) => toggleNumberHighlight(n))
        .catch((err) => console.error("Failed to load state module:", err));
      return;
    }
    if (isPencilInput(e)) togglePencil(n);
    else inputNumber(n);
  },
  onRevert: revertLast,
});

/* Module wiring */
bindPencilMode();
bindLoadingHandlers();
bindHelpHandlers();
bindHistoryHandlers();
bindAdvancedHandlers(startCustomPuzzle);
bindKeyboard();

newBtn.addEventListener("click", () => { void startNewPuzzle(); });

/* Fit window to content after initial layout. */
async function fitWindowToContent() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  const titlebar = document.getElementById("titlebar") as HTMLElement;
  const app = document.getElementById("app") as HTMLElement;
  const width = Math.ceil(app.scrollWidth);
  const height = Math.ceil(titlebar.offsetHeight + app.scrollHeight);
  try { await appWindow.setSize(new LogicalSize(width, height)); } catch { /* not in Tauri */ }
}

// Translate static DOM now and re-apply on every locale change.
applyI18n();
onLocaleChange(() => {
  applyI18n();
  // Re-render the advanced modal's dynamic content (level headings, tooltips,
  // (not impl) badge) if the modal is currently open.
  const adv = document.getElementById("advanced-overlay");
  if (adv && !adv.classList.contains("hidden")) openAdvanced();
});

void render();
void startNewPuzzle();
void fitWindowToContent();
void boardEl; // keep reference (already used by buildGrid)
void diffSelect;
