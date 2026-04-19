// Basic fish — X-Wing (size 2), Swordfish (3), Jellyfish (4).

import { type Board } from "../board";
import { combinations, type Candidates, type Step } from "./grid";

function tryFish(board: Board, cand: Candidates, size: 2 | 3 | 4): Step | null {
  for (let n = 1; n <= 9; n++) {
    // Row-based
    const rowCols: (number[] | null)[] = Array(9).fill(null);
    for (let r = 0; r < 9; r++) {
      const cs: number[] = [];
      for (let c = 0; c < 9; c++) if (board[r][c] === 0 && cand[r][c][n - 1]) cs.push(c);
      if (cs.length >= 2 && cs.length <= size) rowCols[r] = cs;
    }
    const eligibleRows = rowCols.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (eligibleRows.length >= size) {
      for (const rowCombo of combinations(eligibleRows, size)) {
        const allCols = new Set<number>();
        for (const r of rowCombo) for (const c of rowCols[r]!) allCols.add(c);
        if (allCols.size !== size) continue;
        const elim: [number, number, number][] = [];
        for (const c of allCols) {
          for (let r = 0; r < 9; r++) {
            if (rowCombo.includes(r)) continue;
            if (board[r][c] === 0 && cand[r][c][n - 1]) elim.push([r, c, n]);
          }
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
    // Column-based
    const colRows: (number[] | null)[] = Array(9).fill(null);
    for (let c = 0; c < 9; c++) {
      const rs: number[] = [];
      for (let r = 0; r < 9; r++) if (board[r][c] === 0 && cand[r][c][n - 1]) rs.push(r);
      if (rs.length >= 2 && rs.length <= size) colRows[c] = rs;
    }
    const eligibleCols = colRows.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (eligibleCols.length >= size) {
      for (const colCombo of combinations(eligibleCols, size)) {
        const allRows = new Set<number>();
        for (const c of colCombo) for (const r of colRows[c]!) allRows.add(r);
        if (allRows.size !== size) continue;
        const elim: [number, number, number][] = [];
        for (const r of allRows) {
          for (let c = 0; c < 9; c++) {
            if (colCombo.includes(c)) continue;
            if (board[r][c] === 0 && cand[r][c][n - 1]) elim.push([r, c, n]);
          }
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}

export const tryXWing     = (b: Board, c: Candidates) => tryFish(b, c, 2);
export const trySwordfish = (b: Board, c: Candidates) => tryFish(b, c, 3);
export const tryJellyfish = (b: Board, c: Candidates) => tryFish(b, c, 4);
