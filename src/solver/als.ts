// Almost Locked Sets (ALS-XZ) + Sue-de-Coq + Exocet.

import { type Board } from "../board";
import {
  boxHouse, candList, colHouse, combinations, rowHouse, sees,
  type Candidates, type House, type Step,
} from "./grid";

interface ALS {
  cells: [number, number][];
  cellSet: Set<string>;
  candidates: Set<number>;
  house: number;
}

function enumerateALS(board: Board, cand: Candidates): ALS[] {
  const out: ALS[] = [];
  const houses: { type: "row" | "col" | "box"; idx: number; cells: House }[] = [];
  for (let i = 0; i < 9; i++) houses.push({ type: "row", idx: i, cells: rowHouse(i) });
  for (let i = 0; i < 9; i++) houses.push({ type: "col", idx: i, cells: colHouse(i) });
  for (let i = 0; i < 9; i++) houses.push({ type: "box", idx: i, cells: boxHouse(i) });
  for (let hIdx = 0; hIdx < houses.length; hIdx++) {
    const h = houses[hIdx];
    const empties = h.cells.filter(([r, c]) => board[r][c] === 0);
    for (let size = 1; size <= Math.min(4, empties.length - 1); size++) {
      for (const subset of combinations(empties, size)) {
        const cs = new Set<number>();
        for (const [r, c] of subset) for (const n of candList(cand[r][c])) cs.add(n);
        if (cs.size === size + 1) {
          const cellSet = new Set<string>(subset.map(([r, c]) => `${r},${c}`));
          out.push({ cells: subset as [number, number][], cellSet, candidates: cs, house: hIdx });
        }
      }
    }
  }
  return out;
}

export function tryAlsXZ(board: Board, cand: Candidates): Step | null {
  const alses = enumerateALS(board, cand);
  for (let i = 0; i < alses.length; i++) {
    for (let j = i + 1; j < alses.length; j++) {
      const A = alses[i], B = alses[j];
      if (A.house === B.house) continue;
      let disjoint = true;
      for (const k of A.cellSet) if (B.cellSet.has(k)) { disjoint = false; break; }
      if (!disjoint) continue;
      const common: number[] = [];
      for (const n of A.candidates) if (B.candidates.has(n)) common.push(n);
      if (common.length < 2) continue;
      for (const X of common) {
        const aX = A.cells.filter(([r, c]) => cand[r][c][X - 1]);
        const bX = B.cells.filter(([r, c]) => cand[r][c][X - 1]);
        if (aX.length === 0 || bX.length === 0) continue;
        const restricted = aX.every(([r1, c1]) => bX.every(([r2, c2]) => sees(r1, c1, r2, c2)));
        if (!restricted) continue;
        for (const Z of common) {
          if (Z === X) continue;
          const aZ = A.cells.filter(([r, c]) => cand[r][c][Z - 1]);
          const bZ = B.cells.filter(([r, c]) => cand[r][c][Z - 1]);
          if (aZ.length === 0 || bZ.length === 0) continue;
          const elim: [number, number, number][] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (board[r][c] !== 0 || !cand[r][c][Z - 1]) continue;
              const k = `${r},${c}`;
              if (A.cellSet.has(k) || B.cellSet.has(k)) continue;
              const seesAllA = aZ.every(([rr, cc]) => sees(r, c, rr, cc));
              if (!seesAllA) continue;
              const seesAllB = bZ.every(([rr, cc]) => sees(r, c, rr, cc));
              if (seesAllB) elim.push([r, c, Z]);
            }
          }
          if (elim.length) return { kind: "eliminate", cells: elim };
        }
      }
    }
  }
  return null;
}

export function trySueDeCoq(board: Board, cand: Candidates): Step | null {
  const intersections: { line: House; box: House; inter: [number, number][]; lineOut: [number, number][]; boxOut: [number, number][] }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let bc = 0; bc < 3; bc++) {
      const inter = [[r, bc * 3], [r, bc * 3 + 1], [r, bc * 3 + 2]] as [number, number][];
      const lineOut = rowHouse(r).filter(([, c]) => Math.floor(c / 3) !== bc);
      const box = boxHouse(Math.floor(r / 3) * 3 + bc);
      const boxOut = box.filter(([rr]) => rr !== r);
      intersections.push({ line: rowHouse(r), box, inter, lineOut, boxOut });
    }
  }
  for (let c = 0; c < 9; c++) {
    for (let br = 0; br < 3; br++) {
      const inter = [[br * 3, c], [br * 3 + 1, c], [br * 3 + 2, c]] as [number, number][];
      const lineOut = colHouse(c).filter(([r]) => Math.floor(r / 3) !== br);
      const box = boxHouse(br * 3 + Math.floor(c / 3));
      const boxOut = box.filter(([, cc]) => cc !== c);
      intersections.push({ line: colHouse(c), box, inter, lineOut, boxOut });
    }
  }

  for (const inter of intersections) {
    const emptyInter = inter.inter.filter(([r, c]) => board[r][c] === 0);
    if (emptyInter.length < 2) continue;
    for (const pair of combinations(emptyInter, 2)) {
      const candsInter = new Set<number>();
      for (const [r, c] of pair) for (const n of candList(cand[r][c])) candsInter.add(n);
      if (candsInter.size !== 4) continue;
      const digits = [...candsInter];
      for (const split of combinations(digits, 2)) {
        const lineSet = new Set(split);
        const boxSet = new Set(digits.filter((d) => !lineSet.has(d)));
        const lineEmpties = inter.lineOut.filter(([r, c]) => board[r][c] === 0);
        for (const alsLine of combinations(lineEmpties, 2)) {
          const ac = new Set<number>();
          for (const [r, c] of alsLine) for (const n of candList(cand[r][c])) ac.add(n);
          if (ac.size !== 3) continue;
          if (![...lineSet].every((d) => ac.has(d))) continue;
          const boxEmpties = inter.boxOut.filter(([r, c]) => board[r][c] === 0);
          for (const alsBox of combinations(boxEmpties, 2)) {
            const bc2 = new Set<number>();
            for (const [r, c] of alsBox) for (const n of candList(cand[r][c])) bc2.add(n);
            if (bc2.size !== 3) continue;
            if (![...boxSet].every((d) => bc2.has(d))) continue;
            const used = new Set<string>([
              ...pair.map(([r, c]) => `${r},${c}`),
              ...alsLine.map(([r, c]) => `${r},${c}`),
              ...alsBox.map(([r, c]) => `${r},${c}`),
            ]);
            const elim: [number, number, number][] = [];
            for (const [r, c] of inter.lineOut) {
              if (used.has(`${r},${c}`) || board[r][c] !== 0) continue;
              for (const d of ac) if (cand[r][c][d - 1]) elim.push([r, c, d]);
            }
            for (const [r, c] of inter.boxOut) {
              if (used.has(`${r},${c}`) || board[r][c] !== 0) continue;
              for (const d of bc2) if (cand[r][c][d - 1]) elim.push([r, c, d]);
            }
            if (elim.length) return { kind: "eliminate", cells: elim };
          }
        }
      }
    }
  }
  return null;
}

export function tryExocet(board: Board, cand: Candidates): Step | null {
  for (let r = 0; r < 9; r++) {
    for (let bc = 0; bc < 3; bc++) {
      const baseCells: [number, number][] = [];
      for (let dc = 0; dc < 3; dc++) {
        const c = bc * 3 + dc;
        if (board[r][c] === 0) baseCells.push([r, c]);
      }
      if (baseCells.length !== 2) continue;
      const baseDigits = new Set<number>();
      for (const [rr, cc] of baseCells) for (const n of candList(cand[rr][cc])) baseDigits.add(n);
      if (baseDigits.size < 2 || baseDigits.size > 4) continue;
      const otherBoxes = [0, 1, 2].filter((x) => x !== bc);
      const bandRows = [Math.floor(r / 3) * 3, Math.floor(r / 3) * 3 + 1, Math.floor(r / 3) * 3 + 2].filter((x) => x !== r);
      if (bandRows.length !== 2) continue;
      for (const tbc1 of otherBoxes) {
        for (const tbc2 of otherBoxes) {
          if (tbc1 === tbc2) continue;
          for (const tr1 of bandRows) {
            for (const tr2 of bandRows) {
              if (tr1 === tr2) continue;
              for (let tdc1 = 0; tdc1 < 3; tdc1++) {
                const tc1 = tbc1 * 3 + tdc1;
                if (board[tr1][tc1] !== 0) continue;
                for (let tdc2 = 0; tdc2 < 3; tdc2++) {
                  const tc2 = tbc2 * 3 + tdc2;
                  if (board[tr2][tc2] !== 0) continue;
                  const t1c = new Set(candList(cand[tr1][tc1]));
                  const t2c = new Set(candList(cand[tr2][tc2]));
                  let ok = true;
                  for (const d of baseDigits) if (!t1c.has(d) || !t2c.has(d)) { ok = false; break; }
                  if (!ok) continue;
                  const elim: [number, number, number][] = [];
                  for (const d of t1c) if (!baseDigits.has(d) && cand[tr1][tc1][d - 1]) elim.push([tr1, tc1, d]);
                  for (const d of t2c) if (!baseDigits.has(d) && cand[tr2][tc2][d - 1]) elim.push([tr2, tc2, d]);
                  if (elim.length) return { kind: "eliminate", cells: elim };
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}
