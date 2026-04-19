// Shared UI types.

import type { Board, Puzzle } from "../sudoku";

export interface UndoEntry {
  r: number;
  c: number;
  prevValue: number;
  prevPencils: boolean[];
}

export interface State {
  puzzle: Puzzle;
  current: Board;
  pencils: boolean[][][]; // [r][c][n-1] — small candidate marks
  givens: boolean[][];
  selected: { r: number; c: number } | null;
  highlightNumber: number | null;
  undoStack: UndoEntry[];
  solved: boolean;
}

export function emptyPencils(): boolean[][][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array<boolean>(9).fill(false)),
  );
}
