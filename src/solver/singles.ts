// Level 1 — Basic Scanning: Full House, Naked Single, Hidden Single.

import { type Board } from "../board";
import { allHouses, candList, type Candidates, type Step } from "./grid";

export function tryFullHouse(board: Board, cand: Candidates): Step | null {
  for (const h of allHouses()) {
    const empties = h.cells.filter(([r, c]) => board[r][c] === 0);
    if (empties.length === 1) {
      const [r, c] = empties[0];
      const list = candList(cand[r][c]);
      if (list.length >= 1) return { kind: "place", r, c, n: list[0] };
    }
  }
  return null;
}

export function tryNakedSingle(board: Board, cand: Candidates): Step | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const list = candList(cand[r][c]);
      if (list.length === 1) return { kind: "place", r, c, n: list[0] };
    }
  }
  return null;
}

export function tryHiddenSingle(board: Board, cand: Candidates): Step | null {
  for (const h of allHouses()) {
    for (let n = 1; n <= 9; n++) {
      const spots: [number, number][] = [];
      for (const [r, c] of h.cells) {
        if (board[r][c] === 0 && cand[r][c][n - 1]) spots.push([r, c]);
      }
      if (spots.length === 1) return { kind: "place", r: spots[0][0], c: spots[0][1], n };
    }
  }
  return null;
}
