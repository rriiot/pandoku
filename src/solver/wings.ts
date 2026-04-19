// XY-Wing, XYZ-Wing, W-Wing — short bivalue-based patterns.

import { type Board } from "../board";
import {
  allHouses, candList, findBivalues, sees,
  type BiValueCell, type Candidates, type Step,
} from "./grid";

export function tryXYWing(board: Board, cand: Candidates): Step | null {
  const bivs = findBivalues(board, cand);
  for (const pivot of bivs) {
    const [X, Y] = pivot.list;
    for (const w1 of bivs) {
      if (w1 === pivot) continue;
      if (!sees(pivot.r, pivot.c, w1.r, w1.c)) continue;
      let shared: number | null = null;
      let Z: number | null = null;
      if (w1.list.includes(X) && !w1.list.includes(Y)) {
        shared = X; Z = w1.list[0] === X ? w1.list[1] : w1.list[0];
      } else if (w1.list.includes(Y) && !w1.list.includes(X)) {
        shared = Y; Z = w1.list[0] === Y ? w1.list[1] : w1.list[0];
      }
      if (shared === null || Z === null) continue;
      const other = shared === X ? Y : X;
      for (const w2 of bivs) {
        if (w2 === pivot || w2 === w1) continue;
        if (!sees(pivot.r, pivot.c, w2.r, w2.c)) continue;
        if (!(w2.list.includes(other) && w2.list.includes(Z))) continue;
        const elim: [number, number, number][] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c] !== 0 || !cand[r][c][Z - 1]) continue;
            if ((r === pivot.r && c === pivot.c) || (r === w1.r && c === w1.c) || (r === w2.r && c === w2.c)) continue;
            if (sees(r, c, w1.r, w1.c) && sees(r, c, w2.r, w2.c)) elim.push([r, c, Z]);
          }
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}

export function tryXYZWing(board: Board, cand: Candidates): Step | null {
  const bivs = findBivalues(board, cand);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const list = candList(cand[r][c]);
      if (list.length !== 3) continue;
      const [A, B, C] = list;
      for (const Z of [A, B, C]) {
        const others = list.filter((x) => x !== Z) as [number, number];
        const [X, Y] = others;
        const seeing = bivs.filter((b) => sees(r, c, b.r, b.c));
        const w1s = seeing.filter((b) => b.list.includes(X) && b.list.includes(Z));
        const w2s = seeing.filter((b) => b.list.includes(Y) && b.list.includes(Z));
        for (const w1 of w1s) {
          for (const w2 of w2s) {
            if (w1 === w2) continue;
            const elim: [number, number, number][] = [];
            for (let rr = 0; rr < 9; rr++) {
              for (let cc = 0; cc < 9; cc++) {
                if (board[rr][cc] !== 0 || !cand[rr][cc][Z - 1]) continue;
                if ((rr === r && cc === c) || (rr === w1.r && cc === w1.c) || (rr === w2.r && cc === w2.c)) continue;
                if (sees(rr, cc, r, c) && sees(rr, cc, w1.r, w1.c) && sees(rr, cc, w2.r, w2.c)) elim.push([rr, cc, Z]);
              }
            }
            if (elim.length) return { kind: "eliminate", cells: elim };
          }
        }
      }
    }
  }
  return null;
}

export function tryWWing(board: Board, cand: Candidates): Step | null {
  const bivs: BiValueCell[] = findBivalues(board, cand);
  for (let i = 0; i < bivs.length; i++) {
    for (let j = i + 1; j < bivs.length; j++) {
      const a = bivs[i], b = bivs[j];
      if (a.list[0] !== b.list[0] || a.list[1] !== b.list[1]) continue;
      if (sees(a.r, a.c, b.r, b.c)) continue;
      for (const X of a.list) {
        for (const h of allHouses()) {
          const spots = h.cells.filter(([rr, cc]) => board[rr][cc] === 0 && cand[rr][cc][X - 1]);
          if (spots.length !== 2) continue;
          const [p1, p2] = spots;
          const linksA = sees(p1[0], p1[1], a.r, a.c) && sees(p2[0], p2[1], b.r, b.c);
          const linksB = sees(p1[0], p1[1], b.r, b.c) && sees(p2[0], p2[1], a.r, a.c);
          if (!linksA && !linksB) continue;
          const Y = a.list[0] === X ? a.list[1] : a.list[0];
          const elim: [number, number, number][] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (board[r][c] !== 0 || !cand[r][c][Y - 1]) continue;
              if ((r === a.r && c === a.c) || (r === b.r && c === b.c)) continue;
              if (sees(r, c, a.r, a.c) && sees(r, c, b.r, b.c)) elim.push([r, c, Y]);
            }
          }
          if (elim.length) return { kind: "eliminate", cells: elim };
        }
      }
    }
  }
  return null;
}
