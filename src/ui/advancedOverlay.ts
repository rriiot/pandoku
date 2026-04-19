// Advanced (technique-picker) modal. Builds the checkbox list, handles
// subsumption-based mutual exclusion, and forwards the selection to the
// custom-puzzle flow when the user clicks Generate.

import {
  advancedBtn, advancedCancelBtn, advancedCloseBtn, advancedGenerateBtn,
  advancedListEl, advancedOverlay,
} from "./dom";
import { computeDisabledIds, TECHNIQUES } from "../techniques";
import { IMPLEMENTED_TECHNIQUE_IDS } from "../solver";
import { t as tr } from "../i18n";

const tickedTechniques = new Set<string>();

const levelKey = (lvl: number): string => `advanced.level${lvl}`;

function renderAdvancedList(): void {
  const disabled = computeDisabledIds(tickedTechniques);
  advancedListEl.innerHTML = "";
  const groups = new Map<number, typeof TECHNIQUES>();
  for (const tech of TECHNIQUES) {
    if (!groups.has(tech.level)) groups.set(tech.level, []);
    groups.get(tech.level)!.push(tech);
  }
  for (let level = 1; level <= 6; level++) {
    const list = groups.get(level);
    if (!list) continue;
    const group = document.createElement("div");
    group.className = "adv-group";
    const title = document.createElement("div");
    title.className = "adv-group-title";
    title.textContent = tr(levelKey(level));
    group.appendChild(title);
    const items = document.createElement("div");
    items.className = "adv-items";
    for (const tech of list) {
      const label = document.createElement("label");
      label.className = "adv-item";
      const isDisabled = disabled.has(tech.id) || !tech.implemented;
      if (isDisabled) label.classList.add("disabled");
      label.title = !tech.implemented
        ? tr("advanced.notImplTip")
        : disabled.has(tech.id)
        ? tr("advanced.subsumedTip")
        : tech.name;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = tech.id;
      cb.checked = tickedTechniques.has(tech.id);
      cb.disabled = isDisabled;
      if (disabled.has(tech.id) && tickedTechniques.has(tech.id)) {
        tickedTechniques.delete(tech.id);
        cb.checked = false;
      }
      cb.addEventListener("change", () => {
        if (cb.checked) tickedTechniques.add(tech.id);
        else tickedTechniques.delete(tech.id);
        renderAdvancedList();
        updateGenerateEnabled();
      });
      label.appendChild(cb);
      const name = document.createElement("span");
      name.textContent = tech.name;
      label.appendChild(name);
      if (!tech.implemented) {
        const badge = document.createElement("span");
        badge.className = "not-impl";
        badge.textContent = tr("advanced.notImpl");
        label.appendChild(badge);
      }
      items.appendChild(label);
    }
    group.appendChild(items);
    advancedListEl.appendChild(group);
  }
}

function updateGenerateEnabled(): void {
  const hasImplemented = Array.from(tickedTechniques).some((id) => IMPLEMENTED_TECHNIQUE_IDS.has(id));
  advancedGenerateBtn.disabled = !hasImplemented;
}

export function openAdvanced(): void {
  renderAdvancedList();
  updateGenerateEnabled();
  advancedOverlay.classList.remove("hidden");
  advancedOverlay.setAttribute("aria-hidden", "false");
}
export function closeAdvanced(): void {
  advancedOverlay.classList.add("hidden");
  advancedOverlay.setAttribute("aria-hidden", "true");
}
export function isAdvancedOpen(): boolean {
  return !advancedOverlay.classList.contains("hidden");
}

/** Wire the modal's buttons. `onGenerate` runs with the selected (implemented) technique ids. */
export function bindAdvancedHandlers(onGenerate: (required: string[]) => void): void {
  advancedBtn.addEventListener("click", openAdvanced);
  advancedCloseBtn.addEventListener("click", closeAdvanced);
  advancedCancelBtn.addEventListener("click", closeAdvanced);
  advancedOverlay.addEventListener("click", (e) => {
    if (e.target === advancedOverlay) closeAdvanced();
  });
  advancedGenerateBtn.addEventListener("click", () => {
    const required = Array.from(tickedTechniques).filter((id) => IMPLEMENTED_TECHNIQUE_IDS.has(id));
    if (required.length === 0) return;
    closeAdvanced();
    onGenerate(required);
  });
}
