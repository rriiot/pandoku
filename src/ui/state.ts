// Game state holder + gameplay actions. Actions mutate the current state and
// kick off a render; side-effect-only operations (win → record history +
// freeze timer) live here too.

import { cloneBoard, isBoardComplete } from "../sudoku";
import { t } from "../i18n";
import { statusBar, statusText } from "./dom";
import { emptyPencils, type State, type UndoEntry } from "./types";
import { currentElapsedMs, freezeTimer, stopTimer } from "./timer";
import { recordWin } from "./history";
import { render } from "./render";

let currentState: State | null = null;

export function getState(): State | null { return currentState; }
export function setState(s: State | null): void { currentState = s; }

function pencilsEqual(a: boolean[], b: boolean[]): boolean {
  for (let i = 0; i < 9; i++) if (a[i] !== b[i]) return false;
  return true;
}

function countPlaced(n: number): number {
  if (!currentState) return 0;
  let count = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (currentState.current[r][c] === n) count++;
  return count;
}
export function isNumberFilled(n: number): boolean {
  return countPlaced(n) >= 9;
}

export function selectCell(r: number, c: number): void {
  if (!currentState) return;
  currentState.selected = { r, c };
  currentState.highlightNumber = null;
  render();
}

export function toggleNumberHighlight(n: number): void {
  if (!currentState) return;
  currentState.highlightNumber = currentState.highlightNumber === n ? null : n;
  render();
}

function pushUndo(entry: UndoEntry): void {
  if (!currentState) return;
  currentState.undoStack.push(entry);
}

export function inputNumber(n: number): void {
  if (!currentState || currentState.solved || !currentState.selected) return;
  const { r, c } = currentState.selected;
  if (currentState.givens[r][c]) return;
  const prevValue = currentState.current[r][c];
  const prevPencils = currentState.pencils[r][c].slice();
  if (n === 0) {
    if (currentState.current[r][c] !== 0) currentState.current[r][c] = 0;
    else currentState.pencils[r][c].fill(false);
  } else {
    if (isNumberFilled(n) && currentState.current[r][c] !== n) return;
    currentState.current[r][c] = n;
    currentState.pencils[r][c].fill(false);
  }
  const changed = currentState.current[r][c] !== prevValue ||
    !pencilsEqual(currentState.pencils[r][c], prevPencils);
  if (changed) pushUndo({ r, c, prevValue, prevPencils });
  render();
  checkWin();
}

export function togglePencil(n: number): void {
  if (!currentState || currentState.solved || !currentState.selected) return;
  const { r, c } = currentState.selected;
  if (currentState.givens[r][c]) return;
  if (currentState.current[r][c] !== 0) return;
  if (isNumberFilled(n)) return;
  const prevPencils = currentState.pencils[r][c].slice();
  currentState.pencils[r][c][n - 1] = !currentState.pencils[r][c][n - 1];
  pushUndo({ r, c, prevValue: 0, prevPencils });
  render();
}

export function revertLast(): void {
  if (!currentState || currentState.solved) return;
  const entry = currentState.undoStack.pop();
  if (!entry) return;
  currentState.current[entry.r][entry.c] = entry.prevValue;
  currentState.pencils[entry.r][entry.c] = entry.prevPencils.slice();
  currentState.selected = { r: entry.r, c: entry.c };
  currentState.highlightNumber = null;
  render();
}

export function solvePuzzleImmediately(): void {
  if (!currentState || currentState.solved) return;
  currentState.current = cloneBoard(currentState.puzzle.solution);
  currentState.pencils = emptyPencils();
  currentState.solved = true;
  currentState.selected = null;
  currentState.highlightNumber = null;
  stopTimer();
  freezeTimer(currentElapsedMs());
  statusBar.classList.add("win");
  statusText.textContent = t("status.revealed", { difficulty: t(`difficulty.${currentState.puzzle.difficulty}`) });
  render();
}

function checkWin(): void {
  if (!currentState) return;
  if (isBoardComplete(currentState.current)) {
    currentState.solved = true;
    currentState.selected = null;
    const elapsed = currentElapsedMs();
    stopTimer();
    freezeTimer(elapsed);
    recordWin(currentState.puzzle.difficulty, elapsed);
    statusBar.classList.add("win");
    statusText.textContent = t("status.solved", { difficulty: t(`difficulty.${currentState.puzzle.difficulty}`) });
    render();
  }
}
