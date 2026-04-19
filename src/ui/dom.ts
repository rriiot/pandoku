// Centralized DOM references so every module queries once at module-load time.

import { getCurrentWindow } from "@tauri-apps/api/window";

export const appWindow = getCurrentWindow();

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el as T;
}

function bySel<T extends HTMLElement>(sel: string): T {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing required element: ${sel}`);
  return el as T;
}

export const boardEl = byId<HTMLDivElement>("board");
export const padEl = byId<HTMLDivElement>("pad");
export const pencilBtn = byId<HTMLButtonElement>("pencil-btn");
export const diffSelect = byId<HTMLSelectElement>("difficulty-select");
export const newBtn = byId<HTMLButtonElement>("new-btn");

export const statusText = byId<HTMLSpanElement>("status-text");
export const metric = byId<HTMLSpanElement>("metric");
export const timerEl = byId<HTMLSpanElement>("timer");
export const statusBar = bySel<HTMLElement>(".status");

export const loadingOverlay = byId<HTMLDivElement>("loading-overlay");
export const loStage = byId<HTMLSpanElement>("lo-stage");
export const loAttempt = byId<HTMLSpanElement>("lo-attempt");
export const loClues = byId<HTMLSpanElement>("lo-clues");
export const loBestRow = byId<HTMLDivElement>("lo-best-row");
export const loBest = byId<HTMLSpanElement>("lo-best");
export const stopGenBtn = byId<HTMLButtonElement>("stop-gen-btn");
export const useBestBtn = byId<HTMLButtonElement>("use-best-btn");

export const historyBtn = byId<HTMLButtonElement>("history-btn");
export const historyOverlay = byId<HTMLDivElement>("history-overlay");
export const historyCloseBtn = byId<HTMLButtonElement>("history-close");

export const helpBtn = byId<HTMLButtonElement>("help-btn");
export const helpOverlay = byId<HTMLDivElement>("help-overlay");
export const helpCloseBtn = byId<HTMLButtonElement>("help-close");

export const advancedBtn = byId<HTMLButtonElement>("advanced-btn");
export const advancedOverlay = byId<HTMLDivElement>("advanced-overlay");
export const advancedCloseBtn = byId<HTMLButtonElement>("advanced-close");
export const advancedCancelBtn = byId<HTMLButtonElement>("advanced-cancel");
export const advancedGenerateBtn = byId<HTMLButtonElement>("advanced-generate");
export const advancedListEl = byId<HTMLDivElement>("advanced-list");
