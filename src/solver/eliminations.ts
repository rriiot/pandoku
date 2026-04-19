// Level 2 — Basic Eliminations: Locked Candidates (Pointing & Claiming).
// Naked and Hidden Pair live in ./subsets.ts since they generalize to Triple/Quad.

import { type Board } from "../board";
import { boxHouse, colHouse, rowHouse, type Candidates, type House, type Step } from "./grid";

export function tryLockedPointing(board: Board, cand: Candidates): Step | null {
  for (let b = 0; b < 9; b++) {
    const cells = boxHouse(b);
    for (let n = 1; n <= 9; n++) {
      const spots = cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length < 2) continue;
      const rows = new Set(spots.map(([r]) => r));
      const cols = new Set(spots.map(([, c]) => c));
      if (rows.size === 1) {
        const r = [...rows][0];
        const elim: [number, number, number][] = [];
        for (let c = 0; c < 9; c++) {
          if (Math.floor(c / 3) === b % 3) continue;
          if (board[r][c] === 0 && cand[r][c][n - 1]) elim.push([r, c, n]);
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
      if (cols.size === 1) {
        const c = [...cols][0];
        const elim: [number, number, number][] = [];
        for (let r = 0; r < 9; r++) {
          if (Math.floor(r / 3) === Math.floor(b / 3)) continue;
          if (board[r][c] === 0 && cand[r][c][n - 1]) elim.push([r, c, n]);
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}

export function tryLockedClaiming(board: Board, cand: Candidates): Step | null {
  const lines: House[] = [];
  for (let r = 0; r < 9; r++) lines.push(rowHouse(r));
  for (let c = 0; c < 9; c++) lines.push(colHouse(c));
  for (const cells of lines) {
    for (let n = 1; n <= 9; n++) {
      const spots = cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length < 2) continue;
      const boxes = new Set(spots.map(([r, c]) => Math.floor(r / 3) * 3 + Math.floor(c / 3)));
      if (boxes.size === 1) {
        const b = [...boxes][0];
        const elim: [number, number, number][] = [];
        for (const [r, c] of boxHouse(b)) {
          if (spots.some(([sr, sc]) => sr === r && sc === c)) continue;
          if (board[r][c] === 0 && cand[r][c][n - 1]) elim.push([r, c, n]);
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}
