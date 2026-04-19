// Registry + top-level solve loop. Everything "public" about the restricted
// solver is re-exported from here.

import { cloneBoard, type Board } from "../board";
import {
  buildCandidates, placeValue,
  type TechniqueImpl,
} from "./grid";
import { tryFullHouse, tryHiddenSingle, tryNakedSingle } from "./singles";
import { tryLockedClaiming, tryLockedPointing } from "./eliminations";
import {
  tryHiddenPair, tryHiddenQuad, tryHiddenTriple,
  tryNakedPair, tryNakedQuad, tryNakedTriple,
} from "./subsets";
import { tryJellyfish, trySwordfish, tryXWing } from "./fish";
import { tryWWing, tryXYWing, tryXYZWing } from "./wings";
import { try2StringKite, tryEmptyRectangle, trySkyscraper } from "./patterns";
import { tryMedusa3D, trySimpleColoring } from "./coloring";
import { tryXChain, tryXYChain } from "./chains";
import { tryBugPlus1, tryUniqueRect } from "./uniqueness";
import { tryAlsXZ, tryExocet, trySueDeCoq } from "./als";
import { tryBowmansBingo } from "./bingo";

export interface RestrictedResult {
  solved: boolean;
  /** True when the safety counter was exhausted without making progress — the
   *  solver gave up rather than proving unsolvability. */
  aborted: boolean;
  board: Board;
  techniquesUsed: string[];
  techniquesUsedSet: Set<string>;
}

const SAFETY_LIMIT = 5000;

const TECHNIQUE_IMPLS: TechniqueImpl[] = [
  { id: "full_house",      run: tryFullHouse },
  { id: "naked_single",    run: tryNakedSingle },
  { id: "hidden_single",   run: tryHiddenSingle },
  { id: "locked_pointing", run: tryLockedPointing },
  { id: "locked_claiming", run: tryLockedClaiming },
  { id: "naked_pair",      run: tryNakedPair },
  { id: "hidden_pair",     run: tryHiddenPair },
  { id: "naked_triple",    run: tryNakedTriple },
  { id: "naked_quad",      run: tryNakedQuad },
  { id: "hidden_triple",   run: tryHiddenTriple },
  { id: "hidden_quad",     run: tryHiddenQuad },
  { id: "x_wing",          run: tryXWing },
  { id: "swordfish",       run: trySwordfish },
  { id: "jellyfish",       run: tryJellyfish },
  { id: "xy_wing",         run: tryXYWing },
  { id: "xyz_wing",        run: tryXYZWing },
  { id: "skyscraper",      run: trySkyscraper },
  { id: "two_string_kite", run: try2StringKite },
  { id: "bug_plus_1",      run: tryBugPlus1 },
  { id: "unique_rect",     run: tryUniqueRect },
  { id: "w_wing",          run: tryWWing },
  { id: "simple_coloring", run: trySimpleColoring },
  { id: "empty_rect",      run: tryEmptyRectangle },
  { id: "x_chain",         run: tryXChain },
  { id: "xy_chain",        run: tryXYChain },
  { id: "als",             run: tryAlsXZ },
  { id: "sue_de_coq",      run: trySueDeCoq },
  { id: "medusa_3d",       run: tryMedusa3D },
  { id: "exocet",          run: tryExocet },
  { id: "bowmans_bingo",   run: tryBowmansBingo },
];

export const IMPLEMENTED_TECHNIQUE_IDS = new Set(TECHNIQUE_IMPLS.map((t) => t.id));

export function restrictedSolve(startBoard: Board, allowed: Set<string>): RestrictedResult {
  const board = cloneBoard(startBoard);
  const cand = buildCandidates(board);
  const usedSet = new Set<string>();
  const usedOrder: string[] = [];
  let safety = SAFETY_LIMIT;
  let aborted = false;

  while (safety-- > 0) {
    let progressed = false;
    for (const impl of TECHNIQUE_IMPLS) {
      if (!allowed.has(impl.id)) continue;
      const step = impl.run(board, cand);
      if (!step) continue;
      if (!usedSet.has(impl.id)) { usedSet.add(impl.id); usedOrder.push(impl.id); }
      if (step.kind === "place") {
        placeValue(board, cand, step.r, step.c, step.n);
      } else {
        for (const [r, c, n] of step.cells) cand[r][c][n - 1] = false;
      }
      progressed = true;
      break;
    }
    if (!progressed) break;
  }
  if (safety <= 0) aborted = true;

  let solved = true;
  for (let r = 0; r < 9 && solved; r++)
    for (let c = 0; c < 9 && solved; c++) if (board[r][c] === 0) solved = false;
  return { solved, aborted, board, techniquesUsed: usedOrder, techniquesUsedSet: usedSet };
}
