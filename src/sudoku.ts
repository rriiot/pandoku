// Backward-compat barrel. The actual code lives in:
//   ./board                 — Board type + primitives
//   ./gen/*                 — generation pipeline (solver, solvedBoard, standard, custom, extremePool)
//   ./solver/*              — restricted (human-logic) solver + individual techniques
// New modules should import from the specific files; this barrel exists so
// legacy imports of `./sudoku` keep working.

export {
  cloneBoard, emptyBoard, isBoardComplete, isValid,
  type Board,
} from "./board";

export {
  DIFFICULTIES, GenAbortedError, SPECS, classifyDifficulty,
  type Difficulty, type GenCancel, type GenProgress, type Puzzle,
} from "./gen/types";

export {
  countSolutions, solveAndCountBacktracks,
} from "./gen/solver";

export { generateSolvedBoard } from "./gen/solvedBoard";

export {
  generatePuzzle, generatePuzzleAsync,
} from "./gen/standard";

export {
  generateCustomPuzzleAsync, type CustomOptions,
} from "./gen/custom";
