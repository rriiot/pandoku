// Game timer with pause support. `formatElapsed` is also used by history.

import { timerEl } from "./dom";

let timerStart = 0;          // timestamp of the current running segment
let timerAccumulatedMs = 0;  // sum of completed segments
let timerInterval: number | null = null;
let timerPaused = false;

export function currentElapsedMs(): number {
  if (timerPaused || timerStart === 0) return timerAccumulatedMs;
  return timerAccumulatedMs + (Date.now() - timerStart);
}

export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function tickTimer(): void {
  timerEl.textContent = formatElapsed(currentElapsedMs());
  timerEl.classList.toggle("paused", timerPaused);
  timerEl.title = timerPaused ? "Paused — press P to resume" : "Press P to pause";
}

export function startTimer(): void {
  stopTimer();
  timerAccumulatedMs = 0;
  timerPaused = false;
  timerStart = Date.now();
  timerEl.textContent = "0:00";
  timerInterval = window.setInterval(tickTimer, 500);
  tickTimer();
}

export function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function freezeTimer(elapsedMs: number): void {
  timerEl.textContent = formatElapsed(elapsedMs);
}

export function togglePauseTimer(onlyIfRunning: boolean): void {
  if (onlyIfRunning && timerInterval === null) return;
  if (timerPaused) {
    timerStart = Date.now();
    timerPaused = false;
  } else {
    timerAccumulatedMs += Date.now() - timerStart;
    timerPaused = true;
  }
  tickTimer();
}
