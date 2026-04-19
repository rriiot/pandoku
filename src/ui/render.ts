// Board/pad construction + the `render` function that reflects state to DOM.

import type { Board } from "../sudoku";
import { boardEl, padEl } from "./dom";
import { getState } from "./state";

let cellEls: HTMLDivElement[][] = [];
const padButtons: HTMLButtonElement[] = [];

function cellHasConflict(b: Board, r: number, c: number): boolean {
  const n = b[r][c];
  if (n === 0) return false;
  for (let i = 0; i < 9; i++) {
    if (i !== c && b[r][i] === n) return true;
    if (i !== r && b[i][c] === n) return true;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if ((rr !== r || cc !== c) && b[rr][cc] === n) return true;
    }
  }
  return false;
}

export function buildGrid(onCellClick: (r: number, c: number) => void): void {
  boardEl.innerHTML = "";
  const cells: HTMLDivElement[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: HTMLDivElement[] = [];
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      if (c === 2 || c === 5) cell.dataset.right = "1";
      if (r === 2 || r === 5) cell.dataset.bottom = "1";

      const main = document.createElement("span");
      main.className = "main";
      cell.appendChild(main);

      const pencils = document.createElement("div");
      pencils.className = "pencils";
      for (let i = 0; i < 9; i++) pencils.appendChild(document.createElement("span"));
      cell.appendChild(pencils);

      cell.addEventListener("click", () => onCellClick(r, c));
      boardEl.appendChild(cell);
      row.push(cell);
    }
    cells.push(row);
  }
  cellEls = cells;
}

export interface PadHandlers {
  onNumber: (n: number, e: MouseEvent) => void;
  onRevert: () => void;
}

export function buildPad(handlers: PadHandlers): void {
  padEl.innerHTML = "";
  padButtons.length = 0;
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.textContent = String(n);
    btn.dataset.num = String(n);
    btn.title = `${n}  (Shift/Ctrl/Alt+${n} = pencil mark)`;
    btn.addEventListener("click", (e) => handlers.onNumber(n, e));
    padEl.appendChild(btn);
    padButtons.push(btn);
  }
  const revert = document.createElement("button");
  revert.className = "revert";
  revert.textContent = "↶";
  revert.title = "Revert last action (Ctrl+Z)";
  revert.addEventListener("click", handlers.onRevert);
  padEl.appendChild(revert);
}

export function getPadButton(n: number): HTMLButtonElement | undefined {
  return padButtons[n - 1];
}

export function render(): void {
  const state = getState();
  if (!state) return;
  const sel = state.selected;
  const selVal = sel ? state.current[sel.r][sel.c] : 0;
  const activeNumber = state.highlightNumber ?? selVal;

  // Pad buttons.
  for (let n = 1; n <= 9; n++) {
    const btn = padButtons[n - 1];
    if (!btn) continue;
    let count = 0;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (state.current[r][c] === n) count++;
    const filled = count >= 9;
    btn.classList.toggle("filled", filled);
    btn.classList.toggle("active", state.highlightNumber === n);
    btn.textContent = filled ? "✓" : String(n);
  }

  // Cells.
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const el = cellEls[r][c];
      const v = state.current[r][c];
      const mainEl = el.firstElementChild as HTMLElement;
      const pencilContainer = el.lastElementChild as HTMLElement;
      if (v > 0) {
        el.classList.add("has-value");
        mainEl.textContent = String(v);
      } else {
        el.classList.remove("has-value");
        mainEl.textContent = "";
        const slots = pencilContainer.children;
        for (let i = 0; i < 9; i++) {
          const on = state.pencils[r][c][i];
          (slots[i] as HTMLElement).textContent = on ? String(i + 1) : "";
        }
      }
      el.classList.toggle("given", state.givens[r][c]);
      el.classList.toggle("invalid", !state.givens[r][c] && cellHasConflict(state.current, r, c));

      let peer = false, match = false, selected = false;
      if (sel) {
        const sameRow = r === sel.r;
        const sameCol = c === sel.c;
        const sameBox = Math.floor(r / 3) === Math.floor(sel.r / 3) && Math.floor(c / 3) === Math.floor(sel.c / 3);
        selected = r === sel.r && c === sel.c;
        peer = (sameRow || sameCol || sameBox) && !selected;
      }
      match = activeNumber !== 0 && v === activeNumber;

      el.classList.toggle("peer", peer);
      el.classList.toggle("match", match);
      el.classList.toggle("selected", selected);
    }
  }
}
