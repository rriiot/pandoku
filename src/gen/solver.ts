// Brute-force solvers. These power the generator:
//  - `countSolutions` enforces uniqueness during carving.
//  - `solveAndCountBacktracks` gives the difficulty metric (Method B).

import { cloneBoard, firstEmpty, isValid, type Board } from "../board";

/** Returns 0, 1, or `limit` (meaning "at least `limit` solutions"). `maxSteps`
 *  caps total search so pathological positions can't hang the UI; hitting the
 *  cap returns `limit` as the safe conservative default. */
export function countSolutions(board: Board, limit = 2, maxSteps = 200_000): number {
  const b = cloneBoard(board);
  let count = 0;
  let steps = 0;
  let aborted = false;
  const walk = (): void => {
    if (aborted || count >= limit) return;
    if (++steps > maxSteps) { aborted = true; return; }
    const slot = firstEmpty(b);
    if (!slot) { count++; return; }
    const [r, c] = slot;
    for (let n = 1; n <= 9; n++) {
      if (isValid(b, r, c, n)) {
        b[r][c] = n;
        walk();
        b[r][c] = 0;
        if (aborted || count >= limit) return;
      }
    }
  };
  walk();
  return aborted ? limit : count;
}

/** Deterministic 1-to-9 brute-force solver. Counts every backtrack; caps at
 *  `maxBacktracks` to bound work on pathological inputs. */
export function solveAndCountBacktracks(
  board: Board,
  maxBacktracks = 1_000_000,
): { solved: boolean; backtracks: number; aborted: boolean } {
  const b = cloneBoard(board);
  let backtracks = 0;
  let aborted = false;
  const walk = (): boolean => {
    if (aborted) return false;
    const slot = firstEmpty(b);
    if (!slot) return true;
    const [r, c] = slot;
    for (let n = 1; n <= 9; n++) {
      if (isValid(b, r, c, n)) {
        b[r][c] = n;
        if (walk()) return true;
        b[r][c] = 0;
        if (++backtracks > maxBacktracks) { aborted = true; return false; }
      }
    }
    return false;
  };
  const solved = walk() && !aborted;
  return { solved, backtracks, aborted };
}

/** Basic solver — stops at the first solution found. */
export function solveToCompletion(b: Board): Board | null {
  const clone = cloneBoard(b);
  const walk = (): boolean => {
    const slot = firstEmpty(clone);
    if (!slot) return true;
    const [r, c] = slot;
    for (let n = 1; n <= 9; n++) {
      if (isValid(clone, r, c, n)) {
        clone[r][c] = n;
        if (walk()) return true;
        clone[r][c] = 0;
      }
    }
    return false;
  };
  return walk() ? clone : null;
}
