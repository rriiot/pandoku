// Standard difficulty generator + Extreme (timed / indefinite / pool) variants.
// Async generator yields to the UI between attempts + during carving so the
// loading overlay stays responsive and cancellation is prompt.

import { cloneBoard, shuffle } from "../board";
import { countSolutions, solveAndCountBacktracks } from "./solver";
import { generateSolvedBoard } from "./solvedBoard";
import { puzzleFromExtremePool } from "./extremePool";
import {
  classifyDifficulty, GenAbortedError, SPECS,
  type Difficulty, type GenCancel, type GenProgress, type Puzzle,
} from "./types";

const MAX_GEN_ATTEMPTS = 12;
const MAX_GEN_WALLCLOCK_MS = 20_000;

export async function generatePuzzleAsync(
  target: Difficulty,
  onProgress: (p: GenProgress) => void,
  cancel?: GenCancel,
): Promise<Puzzle> {
  const yieldUI = () => new Promise<void>((r) => setTimeout(r, 0));
  const deadline = Date.now() + MAX_GEN_WALLCLOCK_MS;

  const checkCancel = (best: Puzzle | null): Puzzle | null => {
    if (!cancel?.stop) return null;
    if (cancel.stop === "abort") throw new GenAbortedError();
    return best;
  };

  // Pool-only: pick an entry straight from the 17-clue pool.
  if (target === "Extreme - Pool") {
    onProgress({ attempt: 1, maxAttempts: 1, stage: "Picking from 17-clue pool", targetClues: 17 });
    await yieldUI();
    const fromPool = puzzleFromExtremePool(target);
    if (fromPool) return fromPool;
    throw new Error("17-clue pool is empty");
  }

  // Extreme (timed) and Extreme - Gen (indefinite) share the carving loop.
  if (target === "Extreme" || target === "Extreme - Gen") {
    const EXTREME_BUDGET_MS = 42_000;
    const hasDeadline = target === "Extreme";
    const extremeDeadline = hasDeadline ? Date.now() + EXTREME_BUDGET_MS : Infinity;
    let bestExtreme: Puzzle | null = null;   // closest attempt (fallback)
    let attemptNum = 0;

    while (Date.now() < extremeDeadline) {
      const early = checkCancel(bestExtreme);
      if (cancel?.stop === "useBest" && early) return early;
      if (cancel?.stop === "useBest" && !early) break;

      attemptNum++;
      onProgress({
        attempt: attemptNum, maxAttempts: 0,
        stage: hasDeadline ? "Building solved board (42s budget)" : "Building solved board (no deadline)",
        targetClues: 17,
      });
      await yieldUI();
      { const e = checkCancel(bestExtreme); if (e) return e; if (cancel?.stop === "useBest") break; }

      const solution = generateSolvedBoard();
      const puzzle = cloneBoard(solution);

      const cells: [number, number][] = [];
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
      shuffle(cells);

      let clues = 81;
      let cellsTried = 0;
      let cancelledInCarve = false;
      for (const [r, c] of cells) {
        if (clues <= 17) break;
        if (Date.now() > extremeDeadline) break;
        if (cancel?.stop) { cancelledInCarve = true; break; }
        cellsTried++;
        if (cellsTried % 8 === 0) {
          onProgress({
            attempt: attemptNum, maxAttempts: 0,
            stage: "Carving clues",
            targetClues: 17, clues,
          });
          await yieldUI();
        }
        const saved = puzzle[r][c];
        if (saved === 0) continue;
        puzzle[r][c] = 0;
        if (countSolutions(puzzle, 2) !== 1) {
          puzzle[r][c] = saved;
        } else {
          clues--;
        }
      }
      if (cancelledInCarve) {
        const e = checkCancel(bestExtreme);
        if (e) return e;
        break;
      }

      const { backtracks } = solveAndCountBacktracks(puzzle);
      const candidate: Puzzle = { puzzle, solution, difficulty: target, backtracks, clues };

      // Both Extreme (timed) and Extreme - Gen return on the first 17-clue
      // puzzle produced — target == criteria for this mode.
      if (clues <= 17) return candidate;
      if (!bestExtreme || candidate.clues < bestExtreme.clues) bestExtreme = candidate;

      onProgress({
        attempt: attemptNum, maxAttempts: 0,
        stage: `Attempt ${attemptNum} → ${clues} clues`,
        targetClues: 17, clues, backtracks,
      });
    }

    onProgress({
      attempt: attemptNum, maxAttempts: 0,
      stage: cancel?.stop === "useBest" ? "Using best attempt"
           : "Budget used — picking from 17-clue pool",
      targetClues: 17,
    });
    await yieldUI();
    if (bestExtreme) return bestExtreme;
    const fromPool = puzzleFromExtremePool(target);
    if (fromPool) return fromPool;
    throw new Error("Unable to generate Extreme puzzle");
  }

  // Standard difficulties (Easy / Medium / Hard / Expert).
  const spec = SPECS[target];
  let best: Puzzle | null = null;

  for (let attempt = 1; attempt <= MAX_GEN_ATTEMPTS; attempt++) {
    if (Date.now() > deadline && best) break;
    const early = checkCancel(best);
    if (cancel?.stop === "useBest" && early) return early;
    if (cancel?.stop === "useBest" && !early) break;

    onProgress({
      attempt, maxAttempts: MAX_GEN_ATTEMPTS,
      stage: "Building solved board",
      targetClues: spec.targetClues,
      bestClues: best?.clues, bestBacktracks: best?.backtracks,
    });
    await yieldUI();
    { const e = checkCancel(best); if (e) return e; if (cancel?.stop === "useBest") break; }

    const solution = generateSolvedBoard();
    const puzzle = cloneBoard(solution);

    const cells: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
    shuffle(cells);

    let clues = 81;
    let cellsTried = 0;
    let cancelledInCarve = false;
    for (const [r, c] of cells) {
      if (clues <= spec.targetClues) break;
      if (cancel?.stop) { cancelledInCarve = true; break; }
      cellsTried++;
      if (cellsTried % 8 === 0) {
        onProgress({
          attempt, maxAttempts: MAX_GEN_ATTEMPTS,
          stage: "Carving clues",
          targetClues: spec.targetClues, clues,
          bestClues: best?.clues, bestBacktracks: best?.backtracks,
        });
        await yieldUI();
      }
      const saved = puzzle[r][c];
      if (saved === 0) continue;
      puzzle[r][c] = 0;
      if (countSolutions(puzzle, 2) !== 1) {
        puzzle[r][c] = saved;
      } else {
        clues--;
      }
    }
    if (cancelledInCarve) {
      const e = checkCancel(best);
      if (e) return e;
      break;
    }

    onProgress({
      attempt, maxAttempts: MAX_GEN_ATTEMPTS,
      stage: "Scoring difficulty",
      targetClues: spec.targetClues, clues,
      bestClues: best?.clues, bestBacktracks: best?.backtracks,
    });
    await yieldUI();
    const { backtracks } = solveAndCountBacktracks(puzzle);
    const difficulty = classifyDifficulty(backtracks);
    const candidate: Puzzle = { puzzle, solution, difficulty, backtracks, clues };

    const criteriaMet =
      backtracks >= spec.minBacktracks &&
      backtracks <= spec.maxBacktracks &&
      clues <= spec.targetClues + 2;

    // Criteria met — surface the candidate as "best so far" only when we
    // haven't reached the ideal target clue count. Then return immediately.
    if (criteriaMet) {
      if (clues > spec.targetClues) {
        onProgress({
          attempt, maxAttempts: MAX_GEN_ATTEMPTS,
          stage: `Accepted: ${clues} clues (target ${spec.targetClues})`,
          targetClues: spec.targetClues, clues, backtracks,
          bestClues: clues, bestBacktracks: backtracks,
        });
        await yieldUI();
      }
      return candidate;
    }

    onProgress({
      attempt, maxAttempts: MAX_GEN_ATTEMPTS,
      stage: `Attempt ${attempt}/${MAX_GEN_ATTEMPTS} scored`,
      targetClues: spec.targetClues, clues, backtracks,
    });

    if (!best || Math.abs(clues - spec.targetClues) < Math.abs(best.clues - spec.targetClues)) {
      best = candidate;
    }
  }

  if (!best) throw new GenAbortedError();
  return best;
}

/** Synchronous best-effort generator — pool-only for Extreme variants, otherwise
 *  runs attempts without yielding. Kept as a fallback for non-async contexts. */
export function generatePuzzle(target: Difficulty): Puzzle {
  if (target === "Extreme" || target === "Extreme - Gen" || target === "Extreme - Pool") {
    const fromPool = puzzleFromExtremePool(target);
    if (fromPool) return fromPool;
  }

  const spec = SPECS[target];
  let best: Puzzle | null = null;

  for (let attempt = 0; attempt < MAX_GEN_ATTEMPTS; attempt++) {
    const solution = generateSolvedBoard();
    const puzzle = cloneBoard(solution);

    const cells: [number, number][] = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c]);
    shuffle(cells);

    let clues = 81;
    for (const [r, c] of cells) {
      if (clues <= spec.targetClues) break;
      const saved = puzzle[r][c];
      if (saved === 0) continue;
      puzzle[r][c] = 0;
      if (countSolutions(puzzle, 2) !== 1) puzzle[r][c] = saved;
      else clues--;
    }

    const { backtracks } = solveAndCountBacktracks(puzzle);
    const difficulty = classifyDifficulty(backtracks);
    const candidate: Puzzle = { puzzle, solution, difficulty, backtracks, clues };

    if (
      backtracks >= spec.minBacktracks &&
      backtracks <= spec.maxBacktracks &&
      clues <= spec.targetClues + 2
    ) {
      return candidate;
    }
    if (!best || Math.abs(clues - spec.targetClues) < Math.abs(best.clues - spec.targetClues)) {
      best = candidate;
    }
  }

  if (!best) throw new GenAbortedError();
  return best;
}
