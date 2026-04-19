// Simple Coloring + 3D Medusa.

import { type Board } from "../board";
import { allHouses, candList, sees, type Candidates, type Step } from "./grid";

export function trySimpleColoring(board: Board, cand: Candidates): Step | null {
  for (let n = 1; n <= 9; n++) {
    const edges = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!edges.has(a)) edges.set(a, new Set());
      if (!edges.has(b)) edges.set(b, new Set());
      edges.get(a)!.add(b);
      edges.get(b)!.add(a);
    };
    const key = (r: number, c: number) => `${r},${c}`;
    for (const h of allHouses()) {
      const spots = h.cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length === 2) add(key(spots[0][0], spots[0][1]), key(spots[1][0], spots[1][1]));
    }
    const color = new Map<string, 0 | 1>();
    const compOf = new Map<string, number>();
    let nextComp = 0;
    for (const start of edges.keys()) {
      if (color.has(start)) continue;
      const stack: [string, 0 | 1][] = [[start, 0]];
      while (stack.length) {
        const [node, col] = stack.pop()!;
        if (color.has(node)) continue;
        color.set(node, col);
        compOf.set(node, nextComp);
        for (const nb of edges.get(node)!) {
          if (!color.has(nb)) stack.push([nb, (1 - col) as 0 | 1]);
        }
      }
      nextComp++;
    }
    const comps = new Map<number, { c0: string[]; c1: string[] }>();
    for (const [k, comp] of compOf) {
      if (!comps.has(comp)) comps.set(comp, { c0: [], c1: [] });
      (color.get(k) === 0 ? comps.get(comp)!.c0 : comps.get(comp)!.c1).push(k);
    }
    for (const { c0, c1 } of comps.values()) {
      for (const group of [c0, c1]) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const [r1, cc1] = group[i].split(",").map(Number);
            const [r2, cc2] = group[j].split(",").map(Number);
            if (sees(r1, cc1, r2, cc2)) {
              const elim: [number, number, number][] = [];
              for (const k of group) {
                const [r, c] = k.split(",").map(Number);
                if (cand[r][c][n - 1]) elim.push([r, c, n]);
              }
              if (elim.length) return { kind: "eliminate", cells: elim };
            }
          }
        }
      }
    }
    for (const [comp, { c0, c1 }] of comps) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] !== 0 || !cand[r][c][n - 1]) continue;
          if (compOf.get(key(r, c)) === comp) continue;
          const sees0 = c0.some((k) => { const [rr, cc] = k.split(",").map(Number); return sees(r, c, rr, cc); });
          if (!sees0) continue;
          const sees1 = c1.some((k) => { const [rr, cc] = k.split(",").map(Number); return sees(r, c, rr, cc); });
          if (sees1) return { kind: "eliminate", cells: [[r, c, n]] };
        }
      }
    }
  }
  return null;
}

export function tryMedusa3D(board: Board, cand: Candidates): Step | null {
  const nodeKey = (r: number, c: number, n: number) => `${r},${c},${n}`;
  const nodeOf = new Map<string, { r: number; c: number; n: number }>();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0)
        for (let n = 1; n <= 9; n++)
          if (cand[r][c][n - 1]) nodeOf.set(nodeKey(r, c, n), { r, c, n });

  const edges = new Map<string, Set<string>>();
  const addEdge = (a: string, b: string) => {
    if (!edges.has(a)) edges.set(a, new Set());
    if (!edges.has(b)) edges.set(b, new Set());
    edges.get(a)!.add(b);
    edges.get(b)!.add(a);
  };
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const list = candList(cand[r][c]);
      if (list.length === 2) addEdge(nodeKey(r, c, list[0]), nodeKey(r, c, list[1]));
    }
  for (const h of allHouses()) {
    for (let n = 1; n <= 9; n++) {
      const spots = h.cells.filter(([r, c]) => board[r][c] === 0 && cand[r][c][n - 1]);
      if (spots.length === 2) addEdge(nodeKey(spots[0][0], spots[0][1], n), nodeKey(spots[1][0], spots[1][1], n));
    }
  }

  const color = new Map<string, 0 | 1>();
  const compOf = new Map<string, number>();
  let nextComp = 0;
  for (const start of edges.keys()) {
    if (color.has(start)) continue;
    const stack: [string, 0 | 1][] = [[start, 0]];
    while (stack.length) {
      const [k, col] = stack.pop()!;
      if (color.has(k)) continue;
      color.set(k, col);
      compOf.set(k, nextComp);
      for (const nb of edges.get(k) ?? []) if (!color.has(nb)) stack.push([nb, (1 - col) as 0 | 1]);
    }
    nextComp++;
  }

  const comps = new Map<number, Map<0 | 1, string[]>>();
  for (const [k, comp] of compOf) {
    if (!comps.has(comp)) comps.set(comp, new Map([[0, []], [1, []]]));
    comps.get(comp)!.get(color.get(k)!)!.push(k);
  }

  const killColor = (group: string[]): [number, number, number][] => {
    const e: [number, number, number][] = [];
    for (const k of group) {
      const { r, c, n } = nodeOf.get(k)!;
      if (cand[r][c][n - 1]) e.push([r, c, n]);
    }
    return e;
  };

  for (const [, byColor] of comps) {
    const g0 = byColor.get(0)!, g1 = byColor.get(1)!;
    for (const [group] of [[g0], [g1]] as [string[]][]) {
      const byCell = new Map<string, string[]>();
      for (const k of group) {
        const { r, c } = nodeOf.get(k)!;
        const ck = `${r},${c}`;
        if (!byCell.has(ck)) byCell.set(ck, []);
        byCell.get(ck)!.push(k);
      }
      for (const nodes of byCell.values())
        if (nodes.length >= 2) {
          const elim = killColor(group);
          if (elim.length) return { kind: "eliminate", cells: elim };
        }
      const byDigitHouse = new Map<string, string[]>();
      for (const k of group) {
        const { r, c, n } = nodeOf.get(k)!;
        for (const tag of [`r${r}d${n}`, `c${c}d${n}`, `b${Math.floor(r / 3) * 3 + Math.floor(c / 3)}d${n}`]) {
          if (!byDigitHouse.has(tag)) byDigitHouse.set(tag, []);
          byDigitHouse.get(tag)!.push(k);
        }
      }
      for (const nodes of byDigitHouse.values())
        if (nodes.length >= 2) {
          const distinct = new Set(nodes.map((k) => { const { r, c } = nodeOf.get(k)!; return `${r},${c}`; }));
          if (distinct.size >= 2) {
            const elim = killColor(group);
            if (elim.length) return { kind: "eliminate", cells: elim };
          }
        }
    }
  }

  for (const [comp, byColor] of comps) {
    for (let n = 1; n <= 9; n++) {
      const c0 = byColor.get(0)!.filter((k) => nodeOf.get(k)!.n === n).map((k) => nodeOf.get(k)!);
      const c1 = byColor.get(1)!.filter((k) => nodeOf.get(k)!.n === n).map((k) => nodeOf.get(k)!);
      if (!c0.length || !c1.length) continue;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] !== 0 || !cand[r][c][n - 1]) continue;
          if (compOf.get(nodeKey(r, c, n)) === comp) continue;
          if (c0.some((x) => sees(r, c, x.r, x.c)) && c1.some((x) => sees(r, c, x.r, x.c))) {
            return { kind: "eliminate", cells: [[r, c, n]] };
          }
        }
      }
    }
  }
  return null;
}
