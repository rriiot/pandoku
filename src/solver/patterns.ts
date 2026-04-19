// Single-digit geometric patterns: Skyscraper, 2-String Kite, Empty Rectangle.

import { type Board } from "../board";
import { sameBox, sees, type Candidates, type Step } from "./grid";

export function trySkyscraper(board: Board, cand: Candidates): Step | null {
  for (let n = 1; n <= 9; n++) {
    // Column-base
    const colSpots: ([number, number] | null)[] = Array(9).fill(null);
    for (let c = 0; c < 9; c++) {
      const rs: number[] = [];
      for (let r = 0; r < 9; r++) if (board[r][c] === 0 && cand[r][c][n - 1]) rs.push(r);
      if (rs.length === 2) colSpots[c] = [rs[0], rs[1]];
    }
    for (let c1 = 0; c1 < 8; c1++) {
      if (!colSpots[c1]) continue;
      for (let c2 = c1 + 1; c2 < 9; c2++) {
        if (!colSpots[c2]) continue;
        const [a1, a2] = colSpots[c1]!;
        const [b1, b2] = colSpots[c2]!;
        let top1: number | null = null, top2: number | null = null;
        if (a1 === b1) { top1 = a2; top2 = b2; }
        else if (a1 === b2) { top1 = a2; top2 = b1; }
        else if (a2 === b1) { top1 = a1; top2 = b2; }
        else if (a2 === b2) { top1 = a1; top2 = b1; }
        if (top1 === null || top2 === null || top1 === top2) continue;
        const elim: [number, number, number][] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c] !== 0 || !cand[r][c][n - 1]) continue;
            if ((r === top1 && c === c1) || (r === top2 && c === c2)) continue;
            if (sees(r, c, top1, c1) && sees(r, c, top2, c2)) elim.push([r, c, n]);
          }
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
    // Row-base
    const rowSpots: ([number, number] | null)[] = Array(9).fill(null);
    for (let r = 0; r < 9; r++) {
      const cs: number[] = [];
      for (let c = 0; c < 9; c++) if (board[r][c] === 0 && cand[r][c][n - 1]) cs.push(c);
      if (cs.length === 2) rowSpots[r] = [cs[0], cs[1]];
    }
    for (let r1 = 0; r1 < 8; r1++) {
      if (!rowSpots[r1]) continue;
      for (let r2 = r1 + 1; r2 < 9; r2++) {
        if (!rowSpots[r2]) continue;
        const [a1, a2] = rowSpots[r1]!;
        const [b1, b2] = rowSpots[r2]!;
        let top1: number | null = null, top2: number | null = null;
        if (a1 === b1) { top1 = a2; top2 = b2; }
        else if (a1 === b2) { top1 = a2; top2 = b1; }
        else if (a2 === b1) { top1 = a1; top2 = b2; }
        else if (a2 === b2) { top1 = a1; top2 = b1; }
        if (top1 === null || top2 === null || top1 === top2) continue;
        const elim: [number, number, number][] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c] !== 0 || !cand[r][c][n - 1]) continue;
            if ((r === r1 && c === top1) || (r === r2 && c === top2)) continue;
            if (sees(r, c, r1, top1) && sees(r, c, r2, top2)) elim.push([r, c, n]);
          }
        }
        if (elim.length) return { kind: "eliminate", cells: elim };
      }
    }
  }
  return null;
}

export function try2StringKite(board: Board, cand: Candidates): Step | null {
  for (let n = 1; n <= 9; n++) {
    const rowConjs: { r: number; cs: [number, number] }[] = [];
    for (let r = 0; r < 9; r++) {
      const cs: number[] = [];
      for (let c = 0; c < 9; c++) if (board[r][c] === 0 && cand[r][c][n - 1]) cs.push(c);
      if (cs.length === 2) rowConjs.push({ r, cs: [cs[0], cs[1]] });
    }
    const colConjs: { c: number; rs: [number, number] }[] = [];
    for (let c = 0; c < 9; c++) {
      const rs: number[] = [];
      for (let r = 0; r < 9; r++) if (board[r][c] === 0 && cand[r][c][n - 1]) rs.push(r);
      if (rs.length === 2) colConjs.push({ c, rs: [rs[0], rs[1]] });
    }
    for (const row of rowConjs) {
      for (const col of colConjs) {
        for (const ri of [0, 1] as const) {
          for (const ci of [0, 1] as const) {
            const rowCell: [number, number] = [row.r, row.cs[ri]];
            const colCell: [number, number] = [col.rs[ci], col.c];
            if (rowCell[0] === colCell[0] && rowCell[1] === colCell[1]) continue;
            if (!sameBox(rowCell[0], rowCell[1], colCell[0], colCell[1])) continue;
            const rowOther: [number, number] = [row.r, row.cs[1 - ri]];
            const colOther: [number, number] = [col.rs[1 - ci], col.c];
            const tr = colOther[0], tc = rowOther[1];
            if (tr === rowOther[0] && tc === rowOther[1]) continue;
            if (tr === colOther[0] && tc === colOther[1]) continue;
            if (board[tr][tc] === 0 && cand[tr][tc][n - 1]) {
              return { kind: "eliminate", cells: [[tr, tc, n]] };
            }
          }
        }
      }
    }
  }
  return null;
}

export function tryEmptyRectangle(board: Board, cand: Candidates): Step | null {
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    for (let n = 1; n <= 9; n++) {
      const spots: [number, number][] = [];
      for (let dr = 0; dr < 3; dr++)
        for (let dc = 0; dc < 3; dc++) {
          const r = br + dr, c = bc + dc;
          if (board[r][c] === 0 && cand[r][c][n - 1]) spots.push([r, c]);
        }
      if (spots.length < 2 || spots.length > 5) continue;
      for (let dr = 0; dr < 3; dr++) {
        const R = br + dr;
        for (let dc = 0; dc < 3; dc++) {
          const C = bc + dc;
          if (!spots.every(([r, c]) => r === R || c === C)) continue;
          const onRow = spots.some(([r, c]) => r === R && c !== C);
          const onCol = spots.some(([r, c]) => c === C && r !== R);
          if (!onRow || !onCol) continue;
          for (let r_out = 0; r_out < 9; r_out++) {
            if (r_out >= br && r_out < br + 3) continue;
            if (!(board[r_out][C] === 0 && cand[r_out][C][n - 1])) continue;
            const rowCands: number[] = [];
            for (let cc = 0; cc < 9; cc++)
              if (board[r_out][cc] === 0 && cand[r_out][cc][n - 1]) rowCands.push(cc);
            if (rowCands.length !== 2) continue;
            const c_other = rowCands.find((cc) => cc !== C);
            if (c_other === undefined) continue;
            if (board[R][c_other] === 0 && cand[R][c_other][n - 1]) {
              return { kind: "eliminate", cells: [[R, c_other, n]] };
            }
          }
          for (let c_out = 0; c_out < 9; c_out++) {
            if (c_out >= bc && c_out < bc + 3) continue;
            if (!(board[R][c_out] === 0 && cand[R][c_out][n - 1])) continue;
            const colCands: number[] = [];
            for (let rr = 0; rr < 9; rr++)
              if (board[rr][c_out] === 0 && cand[rr][c_out][n - 1]) colCands.push(rr);
            if (colCands.length !== 2) continue;
            const r_other = colCands.find((rr) => rr !== R);
            if (r_other === undefined) continue;
            if (board[r_other][C] === 0 && cand[r_other][C][n - 1]) {
              return { kind: "eliminate", cells: [[r_other, C, n]] };
            }
          }
        }
      }
    }
  }
  return null;
}
