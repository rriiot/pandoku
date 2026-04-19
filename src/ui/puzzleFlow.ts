// Puzzle generation flow — standard (by difficulty) and custom (by techniques).
// Wraps the async generators with the loading overlay, error handling, and
// state installation.

import {
  cloneBoard, GenAbortedError,
  generateCustomPuzzleAsync, generatePuzzleAsync,
  type Difficulty, type Puzzle,
} from "../sudoku";
import { t } from "../i18n";
import { diffSelect, metric, newBtn, statusBar, statusText } from "./dom";
import { hideLoading, newGenCancel, showLoading, updateLoadingInfo } from "./loadingOverlay";
import { startTimer } from "./timer";
import { render } from "./render";
import { setState } from "./state";
import { emptyPencils } from "./types";

function installPuzzle(puzzle: Puzzle): void {
  const current = cloneBoard(puzzle.puzzle);
  const givens = puzzle.puzzle.map((row) => row.map((v) => v !== 0));
  setState({
    puzzle, current, pencils: emptyPencils(), givens,
    selected: null, highlightNumber: null, undoStack: [], solved: false,
  });
}

export async function startNewPuzzle(): Promise<void> {
  const target = diffSelect.value as Difficulty;
  newBtn.disabled = true;
  statusText.textContent = t("status.generating");
  metric.textContent = "";
  statusBar.classList.remove("win");
  const cancel = newGenCancel();
  showLoading();
  try {
    const puzzle = await generatePuzzleAsync(target, updateLoadingInfo, cancel);
    installPuzzle(puzzle);
    statusText.textContent = t("status.info", {
      difficulty: t(`difficulty.${puzzle.difficulty}`),
      clues: puzzle.clues,
    });
    metric.textContent = t("status.backtracks", { n: puzzle.backtracks.toLocaleString() });
    startTimer();
    render();
  } catch (err) {
    if (err instanceof GenAbortedError) statusText.textContent = t("status.stopped");
    else { console.error("Generation failed:", err); statusText.textContent = t("status.failed"); }
    metric.textContent = "";
  } finally {
    newBtn.disabled = false;
    hideLoading();
  }
}

export async function startCustomPuzzle(required: string[]): Promise<void> {
  newBtn.disabled = true;
  statusText.textContent = t("status.generatingCustom");
  metric.textContent = "";
  statusBar.classList.remove("win");
  const cancel = newGenCancel();
  showLoading();
  try {
    const puzzle = await generateCustomPuzzleAsync({ required }, updateLoadingInfo, cancel);
    installPuzzle(puzzle);
    statusText.textContent = t("status.customInfo", { clues: puzzle.clues });
    metric.textContent = t("status.backtracks", { n: puzzle.backtracks.toLocaleString() });
    startTimer();
    render();
  } catch (err) {
    if (err instanceof GenAbortedError) statusText.textContent = t("status.stopped");
    else { console.error("Custom generation failed:", err); statusText.textContent = t("status.customFailed"); }
    metric.textContent = "";
  } finally {
    newBtn.disabled = false;
    hideLoading();
  }
}
