// Completed-puzzle history: persistence (localStorage) + panel rendering +
// open/close. Pure data & DOM, no game-state dependency.

import { DIFFICULTIES, type Difficulty } from "../sudoku";
import { t } from "../i18n";
import { historyBtn, historyCloseBtn, historyOverlay } from "./dom";
import { formatElapsed } from "./timer";

interface HistoryEntry {
  difficulty: Difficulty;
  timeMs: number;
  finishedAt: number;
}
const HISTORY_KEY = "pandoku.history.v1";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* storage may be unavailable */ }
}

const history: HistoryEntry[] = loadHistory();

export function recordWin(difficulty: Difficulty, timeMs: number): void {
  history.push({ difficulty, timeMs, finishedAt: Date.now() });
  saveHistory();
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderHistoryPanel(): void {
  const bestBy = new Map<Difficulty, number>();
  for (const entry of history) {
    const cur = bestBy.get(entry.difficulty);
    if (cur === undefined || entry.timeMs < cur) bestBy.set(entry.difficulty, entry.timeMs);
  }
  const bestEl = document.getElementById("best-times-list")!;
  bestEl.innerHTML = "";
  if (bestBy.size === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = t("history.empty");
    bestEl.appendChild(empty);
  } else {
    for (const diff of DIFFICULTIES) {
      const ms = bestBy.get(diff);
      if (ms === undefined) continue;
      const row = document.createElement("div");
      row.className = "row";
      const label = document.createElement("span"); label.className = "label"; label.textContent = t(`difficulty.${diff}`);
      const value = document.createElement("span"); value.className = "value"; value.textContent = formatElapsed(ms);
      row.appendChild(label);
      row.appendChild(document.createElement("span")); // 3-col grid spacer
      row.appendChild(value);
      bestEl.appendChild(row);
    }
  }

  const listEl = document.getElementById("history-list")!;
  listEl.innerHTML = "";
  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = t("history.empty");
    listEl.appendChild(empty);
  } else {
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      const row = document.createElement("div");
      row.className = "row";
      const diff = document.createElement("span"); diff.className = "diff"; diff.textContent = t(`difficulty.${entry.difficulty}`);
      const time = document.createElement("span"); time.className = "time"; time.textContent = formatElapsed(entry.timeMs);
      const when = document.createElement("span"); when.className = "when"; when.textContent = formatDateTime(entry.finishedAt);
      row.appendChild(diff);
      row.appendChild(time);
      row.appendChild(when);
      listEl.appendChild(row);
    }
  }
}

export function openHistory(): void {
  renderHistoryPanel();
  historyOverlay.classList.remove("hidden");
  historyOverlay.setAttribute("aria-hidden", "false");
}
export function closeHistory(): void {
  historyOverlay.classList.add("hidden");
  historyOverlay.setAttribute("aria-hidden", "true");
}
export function isHistoryOpen(): boolean {
  return !historyOverlay.classList.contains("hidden");
}

export function bindHistoryHandlers(): void {
  historyBtn.addEventListener("click", openHistory);
  historyCloseBtn.addEventListener("click", closeHistory);
  historyOverlay.addEventListener("click", (e) => {
    if (e.target === historyOverlay) closeHistory();
  });
}
