// Runtime environment probes. The same source is bundled for both the Tauri
// desktop shell and the GitHub Pages static build; guards here let us branch.

export const IS_TAURI =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
