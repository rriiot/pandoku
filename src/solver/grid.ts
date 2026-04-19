import { cloneBoard, type Board } from "../board";

export { cloneBoard };

/** Per-cell candidate flags. `[r][c][n-1] === true` means digit n is possible. */
export type Candidates = boolean[][][];

export type House = [number, number][];

export type Step =
  | { kind: "place"; r: number; c: number; n: number }
  | { kind: "eliminate"; cells: [number, number, number][] };

export interface TechniqueImpl {
  id: string;
  run: (b: Board, cand: Candidates) => Step | null;
}

export interface BiValueCell { r: number; c: number; list: number[] }

/* ---- candidate grid construction / mutation ---- */

export function buildCandidates(b: Board): Candidates {
  const cand: Candidates = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array<boolean>(9).fill(true)),
  );
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] !== 0) {
        for (let n = 0; n < 9; n++) cand[r][c][n] = false;
      }
    }
  }
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = b[r][c];
      if (v !== 0) eliminatePeers(cand, r, c, v);
    }
  }
  return cand;
}

export function eliminatePeers(cand: Candidates, r: number, c: number, n: number): void {
  const idx = n - 1;
  for (let i = 0; i < 9; i++) {
    cand[r][i][idx] = false;
    cand[i][c][idx] = false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++)
    for (let cc = bc; cc < bc + 3; cc++) cand[rr][cc][idx] = false;
}

export function placeValue(board: Board, cand: Candidates, r: number, c: number, n: number): void {
  board[r][c] = n;
  for (let i = 0; i < 9; i++) cand[r][c][i] = false;
  eliminatePeers(cand, r, c, n);
}

export function cloneCandidates(cand: Candidates): Candidates {
  return cand.map((row) => row.map((cell) => cell.slice()));
}

export function candList(cell: boolean[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) if (cell[i]) out.push(i + 1);
  return out;
}

/* ---- geometry ---- */

export function sameBox(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}
export function sees(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  return r1 === r2 || c1 === c2 || sameBox(r1, c1, r2, c2);
}

/* ---- houses ---- */

export function rowHouse(r: number): House {
  return Array.from({ length: 9 }, (_, c) => [r, c] as [number, number]);
}
export function colHouse(c: number): House {
  return Array.from({ length: 9 }, (_, r) => [r, c] as [number, number]);
}
export function boxHouse(b: number): House {
  const br = Math.floor(b / 3) * 3;
  const bc = (b % 3) * 3;
  const out: House = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) out.push([br + r, bc + c]);
  return out;
}
export function allHouses(): { type: "row" | "col" | "box"; idx: number; cells: House }[] {
  const out: { type: "row" | "col" | "box"; idx: number; cells: House }[] = [];
  for (let i = 0; i < 9; i++) out.push({ type: "row", idx: i, cells: rowHouse(i) });
  for (let i = 0; i < 9; i++) out.push({ type: "col", idx: i, cells: colHouse(i) });
  for (let i = 0; i < 9; i++) out.push({ type: "box", idx: i, cells: boxHouse(i) });
  return out;
}

/* ---- combinatorics ---- */

export function combinations<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  const walk = (start: number, acc: T[]) => {
    if (acc.length === k) { out.push(acc.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      acc.push(arr[i]);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

export function findBivalues(board: Board, cand: Candidates): BiValueCell[] {
  const out: BiValueCell[] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) {
        const list = candList(cand[r][c]);
        if (list.length === 2) out.push({ r, c, list });
      }
  return out;
}
