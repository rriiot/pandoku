// X-Chain and XY-Chain — bounded-length inference chains.

import { type Board } from "../board";
import { allHouses, findBivalues, sees, type Candidates, type Step } from "./grid";

export function tryXChain(board: Board, cand: Candidates): Step | null {
  for (let n = 1; n <= 9; n++) {
    const key = (r: number, c: number) => `${r},${c}`;
    const unkey = (k: string): [number, number] => {
      const [r, c] = k.split(",").map(Number);
      return [r, c];
    };
    const strong = new Map<string, Set<string>>();
    const addStrong = (a: string, b: string) => {
      if (!strong.has(a)) strong.set(a, new Set());
      if (!strong.has(b)) strong.set(b, new Set());
      strong.get(a)!.add(b);
      strong.get(b)!.add(a);
    };
    for (const h of allHouses()) {
      const spots = h.cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length === 2) addStrong(key(spots[0][0], spots[0][1]), key(spots[1][0], spots[1][1]));
    }
    if (strong.size === 0) continue;

    const weakLinks = (k: string): string[] => {
      const [r, c] = unkey(k);
      const out: string[] = [];
      for (let i = 0; i < 9; i++) {
        if (i !== c && board[r][i] === 0 && cand[r][i][n - 1]) out.push(key(r, i));
        if (i !== r && board[i][c] === 0 && cand[i][c][n - 1]) out.push(key(i, c));
      }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++)
        for (let cc = bc; cc < bc + 3; cc++)
          if (!(rr === r && cc === c) && board[rr][cc] === 0 && cand[rr][cc][n - 1]) out.push(key(rr, cc));
      return out;
    };

    const MAX_DEPTH = 8;
    for (const start of strong.keys()) {
      const stack: { node: string; depth: number; path: Set<string> }[] = [
        { node: start, depth: 0, path: new Set([start]) },
      ];
      while (stack.length) {
        const s = stack.pop()!;
        if (s.depth >= MAX_DEPTH) continue;
        const nextIsStrong = s.depth % 2 === 0;
        const neighbors = nextIsStrong ? Array.from(strong.get(s.node) ?? []) : weakLinks(s.node);
        for (const nb of neighbors) {
          if (s.path.has(nb)) continue;
          const newPath = new Set(s.path);
          newPath.add(nb);
          const newDepth = s.depth + 1;
          if (nextIsStrong && newDepth >= 2 && newDepth % 2 === 0) {
            const [sr, sc] = unkey(start);
            const [er, ec] = unkey(nb);
            const elim: [number, number, number][] = [];
            for (let r = 0; r < 9; r++) {
              for (let c = 0; c < 9; c++) {
                if (board[r][c] !== 0 || !cand[r][c][n - 1]) continue;
                if (newPath.has(key(r, c))) continue;
                if (sees(r, c, sr, sc) && sees(r, c, er, ec)) elim.push([r, c, n]);
              }
            }
            if (elim.length) return { kind: "eliminate", cells: elim };
          }
          stack.push({ node: nb, depth: newDepth, path: newPath });
        }
      }
    }
  }
  return null;
}

export function tryXYChain(board: Board, cand: Candidates): Step | null {
  const bivs = findBivalues(board, cand);
  if (bivs.length === 0) return null;

  const MAX_DEPTH = 9;
  for (const start of bivs) {
    for (const startDigit of start.list) {
      const leave = start.list[0] === startDigit ? start.list[1] : start.list[0];
      type State = { cell: typeof start; leaveDigit: number; path: string[] };
      const stack: State[] = [{ cell: start, leaveDigit: leave, path: [`${start.r},${start.c}`] }];
      while (stack.length) {
        const s = stack.pop()!;
        if (s.path.length > MAX_DEPTH) continue;
        if (s.path.length >= 3 && s.leaveDigit === startDigit && s.cell !== start) {
          const elim: [number, number, number][] = [];
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (board[r][c] !== 0 || !cand[r][c][startDigit - 1]) continue;
              if (s.path.includes(`${r},${c}`)) continue;
              if (sees(r, c, start.r, start.c) && sees(r, c, s.cell.r, s.cell.c)) elim.push([r, c, startDigit]);
            }
          }
          if (elim.length) return { kind: "eliminate", cells: elim };
        }
        for (const next of bivs) {
          if (next === s.cell) continue;
          const k = `${next.r},${next.c}`;
          if (s.path.includes(k)) continue;
          if (!sees(s.cell.r, s.cell.c, next.r, next.c)) continue;
          if (!next.list.includes(s.leaveDigit)) continue;
          const nextLeave = next.list[0] === s.leaveDigit ? next.list[1] : next.list[0];
          stack.push({ cell: next, leaveDigit: nextLeave, path: [...s.path, k] });
        }
      }
    }
  }
  return null;
}
