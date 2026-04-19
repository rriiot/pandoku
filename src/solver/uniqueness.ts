// Uniqueness-based techniques: Unique Rectangle (Type 1), BUG + 1.

import { type Board } from "../board";
import { candList, findBivalues, type Candidates, type Step } from "./grid";

export function tryUniqueRect(board: Board, cand: Candidates): Step | null {
  const bivs = findBivalues(board, cand);
  for (let i = 0; i < bivs.length; i++) {
    for (let j = i + 1; j < bivs.length; j++) {
      const b1 = bivs[i], b2 = bivs[j];
      if (b1.list[0] !== b2.list[0] || b1.list[1] !== b2.list[1]) continue;
      if (b1.r !== b2.r && b1.c !== b2.c) continue;
      for (let k = 0; k < bivs.length; k++) {
        if (k === i || k === j) continue;
        const b3 = bivs[k];
        if (b3.list[0] !== b1.list[0] || b3.list[1] !== b1.list[1]) continue;
        let r4: number, c4: number;
        if (b1.r === b2.r) {
          if (b3.c !== b1.c && b3.c !== b2.c) continue;
          r4 = b3.r;
          c4 = b3.c === b1.c ? b2.c : b1.c;
        } else {
          if (b3.r !== b1.r && b3.r !== b2.r) continue;
          c4 = b3.c;
          r4 = b3.r === b1.r ? b2.r : b1.r;
        }
        if (r4 === b1.r && c4 === b1.c) continue;
        if (r4 === b2.r && c4 === b2.c) continue;
        if (r4 === b3.r && c4 === b3.c) continue;
        const box = (rr: number, cc: number) => Math.floor(rr / 3) * 3 + Math.floor(cc / 3);
        const boxes = new Set([box(b1.r, b1.c), box(b2.r, b2.c), box(b3.r, b3.c), box(r4, c4)]);
        if (boxes.size !== 2) continue;
        if (board[r4][c4] !== 0) continue;
        const list4 = candList(cand[r4][c4]);
        if (!list4.includes(b1.list[0]) || !list4.includes(b1.list[1])) continue;
        if (list4.length < 3) continue;
        const elim: [number, number, number][] = [];
        if (cand[r4][c4][b1.list[0] - 1]) elim.push([r4, c4, b1.list[0]]);
        if (cand[r4][c4][b1.list[1] - 1]) elim.push([r4, c4, b1.list[1]]);
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}

export function tryBugPlus1(board: Board, cand: Candidates): Step | null {
  let triple: { r: number; c: number; list: number[] } | null = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const list = candList(cand[r][c]);
      if (list.length === 2) continue;
      if (list.length === 3) {
        if (triple) return null;
        triple = { r, c, list };
      } else {
        return null;
      }
    }
  }
  if (!triple) return null;
  const { r, c, list } = triple;
  for (const n of list) {
    let rowCount = 0;
    for (let cc = 0; cc < 9; cc++) if (board[r][cc] === 0 && cand[r][cc][n - 1]) rowCount++;
    if (rowCount === 3) return { kind: "place", r, c, n };
    let colCount = 0;
    for (let rr = 0; rr < 9; rr++) if (board[rr][c] === 0 && cand[rr][c][n - 1]) colCount++;
    if (colCount === 3) return { kind: "place", r, c, n };
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    let boxCount = 0;
    for (let rr = br; rr < br + 3; rr++)
      for (let cc = bc; cc < bc + 3; cc++)
        if (board[rr][cc] === 0 && cand[rr][cc][n - 1]) boxCount++;
    if (boxCount === 3) return { kind: "place", r, c, n };
  }
  return null;
}
