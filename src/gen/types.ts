// Generation-related types and constants (difficulties, SPECS, progress, cancellation).

import type { Board } from "../board";

export const DIFFICULTIES = [
  "Easy",
  "Medium",
  "Hard",
  "Expert",
  "Extreme",
  "Extreme - Gen",
  "Extreme - Pool",
  "Custom",
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface DiffSpec { targetClues: number; maxBacktracks: number; minBacktracks: number }

export const SPECS: Record<Difficulty, DiffSpec> = {
  Easy:             { targetClues: 42, minBacktracks: 0,    maxBacktracks: 30 },
  Medium:           { targetClues: 34, minBacktracks: 20,   maxBacktracks: 200 },
  Hard:             { targetClues: 28, minBacktracks: 150,  maxBacktracks: 2000 },
  Expert:           { targetClues: 22, minBacktracks: 1000, maxBacktracks: 20000 },
  Extreme:          { targetClues: 17, minBacktracks: 5000, maxBacktracks: Infinity },
  "Extreme - Gen":  { targetClues: 17, minBacktracks: 5000, maxBacktracks: Infinity },
  "Extreme - Pool": { targetClues: 17, minBacktracks: 5000, maxBacktracks: Infinity },
  Custom:           { targetClues: 30, minBacktracks: 0,    maxBacktracks: Infinity },
};

export interface Puzzle {
  puzzle: Board;
  solution: Board;
  difficulty: Difficulty;
  backtracks: number;
  clues: number;
}

export interface GenProgress {
  attempt: number;
  maxAttempts: number;
  stage: string;
  clues?: number;
  targetClues: number;
  backtracks?: number;
  bestClues?: number;
  bestBacktracks?: number;
}

/** Shared with the UI so the user can stop generation mid-flight.
 *  `stop: "abort"` → throw GenAbortedError; `"useBest"` → return best-so-far. */
export interface GenCancel { stop: null | "abort" | "useBest" }

export class GenAbortedError extends Error {
  constructor() { super("Generation aborted"); }
}

export function classifyDifficulty(backtracks: number): Difficulty {
  if (backtracks <= SPECS.Easy.maxBacktracks) return "Easy";
  if (backtracks <= SPECS.Medium.maxBacktracks) return "Medium";
  if (backtracks <= SPECS.Hard.maxBacktracks) return "Hard";
  if (backtracks <= SPECS.Expert.maxBacktracks) return "Expert";
  return "Extreme";
}
