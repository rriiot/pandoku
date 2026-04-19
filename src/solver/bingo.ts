// Bowman's Bingo — depth-1 trial/error on bivalue cells.

import { cloneBoard, type Board } from "../board";
import {
  allHouses, candList, cloneCandidates, placeValue,
  type Candidates, type Step,
} from "./grid";

function propagateBasic(board: Board, cand: Candidates): boolean {
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const list = candList(cand[r][c]);
        if (list.length === 0) return false;
        if (list.length === 1) {
          placeValue(board, cand, r, c, list[0]);
          changed = true;
        }
      }
    }
    for (const h of allHouses()) {
      for (let n = 1; n <= 9; n++) {
        let found = false;
        for (const [r, c] of h.cells) if (board[r][c] === n) { found = true; break; }
        if (found) continue;
        let spot: [number, number] | null = null, count = 0;
        for (const [r, c] of h.cells) {
          if (board[r][c] === 0 && cand[r][c][n - 1]) { spot = [r, c]; count++; if (count > 1) break; }
        }
        if (count === 0) return false;
        if (count === 1 && spot) { placeValue(board, cand, spot[0], spot[1], n); changed = true; }
      }
    }
  }
  return true;
}

export function tryBowmansBingo(board: Board, cand: Candidates): Step | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const list = candList(cand[r][c]);
      if (list.length !== 2) continue;
      const [a, b] = list;
      const ba = cloneBoard(board), ca = cloneCandidates(cand);
      placeValue(ba, ca, r, c, a);
      const aOk = propagateBasic(ba, ca);
      const bb = cloneBoard(board), cb = cloneCandidates(cand);
      placeValue(bb, cb, r, c, b);
      const bOk = propagateBasic(bb, cb);
      if (!aOk && bOk) return { kind: "place", r, c, n: b };
      if (aOk && !bOk) return { kind: "place", r, c, n: a };
    }
  }
  return null;
}
