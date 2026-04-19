// Loading overlay shown during generation. Exposes update + show/hide + the
// shared `currentGenCancel` flag so user clicks on Stop / Use best propagate
// into the running generator.

import type { GenCancel, GenProgress } from "../sudoku";
import { t } from "../i18n";
import {
  loAttempt, loBest, loBestRow, loClues, loStage,
  loadingOverlay, stopGenBtn, useBestBtn,
} from "./dom";

export let currentGenCancel: GenCancel = { stop: null };
export function newGenCancel(): GenCancel {
  currentGenCancel = { stop: null };
  return currentGenCancel;
}

function resetLoadingInfo(): void {
  loStage.textContent = "—";
  loAttempt.textContent = "—";
  loClues.textContent = "—";
  loBest.textContent = "—";
  loBestRow.hidden = true;
}

// Maps English stage strings emitted by the generator to i18n keys so they can
// be localized at render time without changing the generator API.
const STAGE_KEY_MAP: Record<string, string> = {
  "Picking from 17-clue pool": "loading.pickingPool",
  "Building solved board": "loading.buildingBoard",
  "Building solved board (42s budget)": "loading.buildingBoard42",
  "Building solved board (no deadline)": "loading.buildingBoardNoDeadline",
  "Carving clues": "loading.carving",
  "Carving (technique-guarded)": "loading.carvingTechGuarded",
  "Scoring difficulty": "loading.scoring",
  "Using best attempt": "loading.usingBest",
  "Budget used — picking from 17-clue pool": "loading.budgetPool",
};

function translateStage(raw: string): string {
  if (STAGE_KEY_MAP[raw]) return t(STAGE_KEY_MAP[raw]);
  // Parameterized stages emitted by the generator.
  let m = raw.match(/^Attempt (\d+)\/(\d+) scored$/);
  if (m) return t("loading.attemptScored", { n: m[1], max: m[2] });
  m = raw.match(/^Attempt (\d+) → (\d+) clues$/);
  if (m) return t("loading.attemptResult", { n: m[1], clues: m[2] });
  m = raw.match(/^Accepted: (\d+) clues \(target (\d+)\)$/);
  if (m) return t("loading.accepted", { clues: m[1], target: m[2] });
  m = raw.match(/^Attempt (\d+): matched required techniques$/);
  if (m) return t("loading.customMatched", { n: m[1] });
  m = raw.match(/^Attempt (\d+): (\d+) techniques used$/);
  if (m) return t("loading.customAttempt", { n: m[1], used: m[2] });
  return raw;
}

export function updateLoadingInfo(p: GenProgress): void {
  loStage.textContent = translateStage(p.stage);
  loAttempt.textContent = p.maxAttempts > 0 ? `${p.attempt} / ${p.maxAttempts}` : `${p.attempt}`;
  loClues.textContent = p.clues !== undefined
    ? t("loading.cluesWithTarget", { clues: p.clues, target: p.targetClues })
    : t("loading.targetOnly", { target: p.targetClues });
  // "Best so far" appears only once a working, criteria-met candidate exists.
  if (p.bestClues !== undefined && p.bestBacktracks !== undefined) {
    loBest.textContent = t("loading.bestLine", {
      clues: p.bestClues,
      bt: p.bestBacktracks.toLocaleString(),
    });
    loBestRow.hidden = false;
  } else {
    loBest.textContent = "—";
    loBestRow.hidden = true;
  }
}

export function showLoading(): void {
  resetLoadingInfo();
  loadingOverlay.classList.remove("hidden");
  loadingOverlay.setAttribute("aria-hidden", "false");
}
export function hideLoading(): void {
  loadingOverlay.classList.add("hidden");
  loadingOverlay.setAttribute("aria-hidden", "true");
}

export function bindLoadingHandlers(): void {
  stopGenBtn.addEventListener("click", () => { currentGenCancel.stop = "abort"; });
  useBestBtn.addEventListener("click", () => { currentGenCancel.stop = "useBest"; });
}
