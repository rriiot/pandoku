// Naked / Hidden subsets — pair (2), triple (3), quad (4). One helper per flavor.

import { type Board } from "../board";
import { allHouses, candList, combinations, type Candidates, type Step } from "./grid";

function tryNakedSubset(board: Board, cand: Candidates, size: 2 | 3 | 4): Step | null {
  for (const h of allHouses()) {
    const pool = h.cells
      .filter(([r, c]) => board[r][c] === 0)
      .map(([r, c]) => ({ r, c, list: candList(cand[r][c]) }))
      .filter((x) => x.list.length >= 2 && x.list.length <= size);
    if (pool.length < size) continue;
    for (const combo of combinations(pool, size)) {
      const union = new Set<number>();
      for (const x of combo) for (const n of x.list) union.add(n);
      if (union.size !== size) continue;
      const elim: [number, number, number][] = [];
      for (const [r, c] of h.cells) {
        if (combo.some((x) => x.r === r && x.c === c)) continue;
        if (board[r][c] !== 0) continue;
        for (const n of union) if (cand[r][c][n - 1]) elim.push([r, c, n]);
      }
      if (elim.length) return { kind: "eliminate", cells: elim };
    }
  }
  return null;
}

function tryHiddenSubset(board: Board, cand: Candidates, size: 2 | 3 | 4): Step | null {
  for (const h of allHouses()) {
    const digitSpots = new Map<number, [number, number][]>();
    for (let n = 1; n <= 9; n++) {
      const spots = h.cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length >= 2 && spots.length <= size) digitSpots.set(n, spots as [number, number][]);
    }
    const digits = [...digitSpots.keys()];
    if (digits.length < size) continue;
    for (const combo of combinations(digits, size)) {
      const union = new Set<string>();
      for (const d of combo) for (const [r, c] of digitSpots.get(d)!) union.add(`${r},${c}`);
      if (union.size !== size) continue;
      const elim: [number, number, number][] = [];
      for (const key of union) {
        const [r, c] = key.split(",").map(Number);
        for (let n = 1; n <= 9; n++) {
          if (combo.includes(n)) continue;
          if (cand[r][c][n - 1]) elim.push([r, c, n]);
        }
      }
      if (elim.length) return { kind: "eliminate", cells: elim };
    }
  }
  return null;
}

export const tryNakedPair   = (b: Board, c: Candidates) => tryNakedSubset(b, c, 2);
export const tryNakedTriple = (b: Board, c: Candidates) => tryNakedSubset(b, c, 3);
export const tryNakedQuad   = (b: Board, c: Candidates) => tryNakedSubset(b, c, 4);
export const tryHiddenPair   = (b: Board, c: Candidates) => tryHiddenSubset(b, c, 2);
export const tryHiddenTriple = (b: Board, c: Candidates) => tryHiddenSubset(b, c, 3);
export const tryHiddenQuad   = (b: Board, c: Candidates) => tryHiddenSubset(b, c, 4);
