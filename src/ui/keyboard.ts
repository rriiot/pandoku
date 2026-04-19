// Top-level keyboard handler. Escape closes overlays; Ctrl+Z undoes; `p`
// pauses; `ssssss` reveals the solution; digits / arrows drive the selection.

import { getState, inputNumber, isNumberFilled, revertLast, selectCell, solvePuzzleImmediately, toggleNumberHighlight, togglePencil } from "./state";
import { togglePauseTimer } from "./timer";
import { isPencilInput } from "./pencilMode";
import { closeHistory, isHistoryOpen } from "./history";
import { closeHelp, isHelpOpen } from "./helpOverlay";
import { closeAdvanced, isAdvancedOpen } from "./advancedOverlay";

let sKeyCount = 0;
let lastSKeyAt = 0;

function isAnyOverlayOpen(): boolean {
  return isHelpOpen() || isHistoryOpen() || isAdvancedOpen();
}

export function bindKeyboard(): void {
  document.addEventListener("keydown", (e) => {
    // Escape closes the topmost open overlay.
    if (e.key === "Escape") {
      if (isAdvancedOpen()) { closeAdvanced(); e.preventDefault(); return; }
      if (isHelpOpen()) { closeHelp(); e.preventDefault(); return; }
      if (isHistoryOpen()) { closeHistory(); e.preventDefault(); return; }
    }
    if (isAnyOverlayOpen()) return;
    const state = getState();
    if (!state) return;

    // Ctrl/Cmd+Z — revert (works even when solved; no-op).
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
      revertLast();
      e.preventDefault();
      sKeyCount = 0;
      return;
    }

    // p — pause/resume.
    if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "p" || e.key === "P")) {
      if (state.solved) return;
      togglePauseTimer(true);
      e.preventDefault();
      sKeyCount = 0;
      return;
    }

    // ssssss — six consecutive 's' within 1.5s each reveal the solution.
    if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "s" || e.key === "S")) {
      const now = Date.now();
      if (now - lastSKeyAt > 1500) sKeyCount = 0;
      lastSKeyAt = now;
      sKeyCount++;
      if (sKeyCount >= 6) {
        sKeyCount = 0;
        solvePuzzleImmediately();
      }
      e.preventDefault();
      return;
    }
    sKeyCount = 0;

    if (state.solved) return;

    if (e.key >= "1" && e.key <= "9") {
      const n = Number(e.key);
      if (isNumberFilled(n)) toggleNumberHighlight(n);
      else if (state.selected) {
        if (isPencilInput(e)) togglePencil(n);
        else inputNumber(n);
      }
      e.preventDefault();
      return;
    }
    if (!state.selected) return;
    if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      inputNumber(0);
      e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const { r, c } = state.selected;
      let nr = r, nc = c;
      if (e.key === "ArrowUp") nr = Math.max(0, r - 1);
      if (e.key === "ArrowDown") nr = Math.min(8, r + 1);
      if (e.key === "ArrowLeft") nc = Math.max(0, c - 1);
      if (e.key === "ArrowRight") nc = Math.min(8, c + 1);
      selectCell(nr, nc);
      e.preventDefault();
    }
  });
}
