// 17-clue minimal Sudoku pool — pre-verified at module load and served when
// carving can't produce a 17-clue puzzle within a time budget.

import { cloneBoard, emptyBoard, type Board } from "../board";
import { countSolutions, solveAndCountBacktracks, solveToCompletion } from "./solver";
import type { Difficulty, Puzzle } from "./types";

function parseBoardString(s: string): Board | null {
  if (s.length !== 81) return null;
  const b = emptyBoard();
  for (let i = 0; i < 81; i++) {
    const ch = s[i];
    const n = ch === "." || ch === "0" ? 0 : parseInt(ch, 10);
    if (Number.isNaN(n) || n < 0 || n > 9) return null;
    b[Math.floor(i / 9)][i % 9] = n;
  }
  return b;
}

function clueCount(b: Board): number {
  let n = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (b[r][c] !== 0) n++;
  return n;
}

// Public-domain 17-clue minimals. Every entry is strictly validated below so a
// mis-transcribed string (wrong clue count or non-unique) can't leak through.
const EXTREME_17_RAW = [
  "000000010400000000020000000000050407008000300001090000300400200050100000000806000",
  "000000012003600000000007000410020000000500300700000600280000040000300500000000000",
];

export const EXTREME_17_POOL: Board[] = EXTREME_17_RAW
  .map(parseBoardString)
  .filter((b): b is Board => {
    if (!b) return false;
    if (clueCount(b) !== 17) return false;
    // Generous step budget — runs once at module load.
    return countSolutions(b, 2, 5_000_000) === 1;
  });

export function puzzleFromExtremePool(difficulty: Difficulty): Puzzle | null {
  if (EXTREME_17_POOL.length === 0) return null;
  const source = EXTREME_17_POOL[Math.floor(Math.random() * EXTREME_17_POOL.length)];
  const puzzle = cloneBoard(source);
  const solution = solveToCompletion(puzzle);
  if (!solution) return null;
  let clues = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (puzzle[r][c] !== 0) clues++;
  const { backtracks } = solveAndCountBacktracks(puzzle);
  return { puzzle, solution, difficulty, backtracks, clues };
}
