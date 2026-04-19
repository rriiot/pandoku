// Custom (technique-based) generator. Carves under two guards simultaneously:
// the uniqueness check AND the restricted solver — so what we keep is always
// solvable with exactly the techniques the user ticked.

import { cloneBoard, shuffle } from "../board";
import { expandAllowed, TECHNIQUES_BY_ID } from "../techniques";
import { IMPLEMENTED_TECHNIQUE_IDS, restrictedSolve } from "../solver";
import { countSolutions, solveAndCountBacktracks } from "./solver";
import { generateSolvedBoard } from "./solvedBoard";
import { GenAbortedError, type GenCancel, type GenProgress, type Puzzle } from "./types";

export interface CustomOptions {
  required: string[];
  budgetMs?: number;
}

export async function generateCustomPuzzleAsync(
  opts: CustomOptions,
  onProgress: (p: GenProgress) => void,
  cancel?: GenCancel,
): Promise<Puzzle> {
  const yieldUI = () => new Promise<void>((r) => setTimeout(r, 0));
  const budget = opts.budgetMs ?? 45_000;
  const deadline = Date.now() + budget;

  const required = new Set(opts.required.filter((id) => IMPLEMENTED_TECHNIQUE_IDS.has(id)));
  if (required.size === 0) throw new Error("No implemented techniques were selected");
  const allowed = expandAllowed(required);

  const targetMaxLevel = Math.max(
    ...Array.from(required).map((id) => TECHNIQUES_BY_ID[id]?.level ?? 1),
  );
  const targetClues =
    targetMaxLevel <= 1 ? 42 :
    targetMaxLevel === 2 ? 32 :
    targetMaxLevel === 3 ? 28 : 24;

  // We return on the first hasRequired match, so there's no need to track an
  // accepted-best. bestClosest is the best solvable-with-allowed fallback.
  let bestClosest: Puzzle | null = null;
  let attempt = 0;

  while (Date.now() < deadline) {
    if (cancel?.stop === "abort") throw new GenAbortedError();
    if (cancel?.stop === "useBest") {
      if (bestClosest) return bestClosest;
      break;
    }

    attempt++;
    onProgress({
      attempt, maxAttempts: 0,
      stage: "Building solved board",
      targetClues,
    });
    await yieldUI();

    const solution = generateSolvedBoard();
    const puzzle = cloneBoard(solution);

    const cells: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
    shuffle(cells);

    let clues = 81;
    let probes = 0;
    for (const [r, c] of cells) {
      if (clues <= targetClues) break;
      if (Date.now() > deadline) break;
      if (cancel?.stop) break;
      probes++;
      if (probes % 6 === 0) {
        onProgress({
          attempt, maxAttempts: 0,
          stage: "Carving (technique-guarded)",
          targetClues, clues,
        });
        await yieldUI();
      }
      const saved = puzzle[r][c];
      if (saved === 0) continue;
      puzzle[r][c] = 0;
      if (countSolutions(puzzle, 2) !== 1) { puzzle[r][c] = saved; continue; }
      const rs = restrictedSolve(puzzle, allowed);
      if (!rs.solved) { puzzle[r][c] = saved; continue; }
    }

    const finalSolve = restrictedSolve(puzzle, allowed);
    const { backtracks } = solveAndCountBacktracks(puzzle);
    let actualClues = 0;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (puzzle[r][c] !== 0) actualClues++;
    const candidate: Puzzle = { puzzle, solution, difficulty: "Custom", backtracks, clues: actualClues };

    const hasRequired = Array.from(required).every((id) => finalSolve.techniquesUsedSet.has(id));

    if (finalSolve.solved && hasRequired) {
      // Criteria met — surface the candidate as "best so far" only when we
      // haven't reached the ideal target clue count. Then return immediately.
      if (actualClues > targetClues) {
        onProgress({
          attempt, maxAttempts: 0,
          stage: `Accepted: ${actualClues} clues (target ${targetClues})`,
          targetClues, clues: actualClues, backtracks,
          bestClues: actualClues, bestBacktracks: backtracks,
        });
        await yieldUI();
      }
      return candidate;
    }

    if (finalSolve.solved) {
      if (!bestClosest || actualClues < bestClosest.clues) bestClosest = candidate;
    }

    onProgress({
      attempt, maxAttempts: 0,
      stage: `Attempt ${attempt}: ${finalSolve.techniquesUsed.length} techniques used`,
      targetClues, clues: actualClues, backtracks,
    });
  }

  if (bestClosest) return bestClosest;
  throw new Error(
    "Could not produce a puzzle that requires every selected technique in the time budget.",
  );
}
