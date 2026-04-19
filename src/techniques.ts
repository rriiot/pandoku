export type TechniqueLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TechniqueInfo {
  id: string;
  name: string;
  level: TechniqueLevel;
  category: string;
  implemented: boolean;
  /** If this technique is ticked, these ids are auto-disabled in the UI
   *  because they'd be subsumed (a strictly simpler / nested pattern). */
  subsumes?: string[];
}

export const TECHNIQUES: TechniqueInfo[] = [
  // ---- Level 1 ----
  { id: "full_house",   name: "Full House",    level: 1, category: "Basic Scanning", implemented: true },
  { id: "naked_single", name: "Naked Single",  level: 1, category: "Basic Scanning", implemented: true },
  { id: "hidden_single", name: "Hidden Single", level: 1, category: "Basic Scanning", implemented: true, subsumes: ["full_house"] },

  // ---- Level 2 ----
  { id: "locked_pointing", name: "Locked Candidates (Pointing)", level: 2, category: "Basic Eliminations", implemented: true },
  { id: "locked_claiming", name: "Locked Candidates (Claiming)", level: 2, category: "Basic Eliminations", implemented: true },
  { id: "naked_pair",  name: "Naked Pair",  level: 2, category: "Basic Eliminations", implemented: true },
  { id: "hidden_pair", name: "Hidden Pair", level: 2, category: "Basic Eliminations", implemented: true },

  // ---- Level 3 ----
  { id: "naked_triple",  name: "Naked Triple",  level: 3, category: "Intermediate Subsets", implemented: true, subsumes: ["naked_pair"] },
  { id: "naked_quad",    name: "Naked Quad",    level: 3, category: "Intermediate Subsets", implemented: true, subsumes: ["naked_triple", "naked_pair"] },
  { id: "hidden_triple", name: "Hidden Triple", level: 3, category: "Intermediate Subsets", implemented: true, subsumes: ["hidden_pair"] },
  { id: "hidden_quad",   name: "Hidden Quad",   level: 3, category: "Intermediate Subsets", implemented: true, subsumes: ["hidden_triple", "hidden_pair"] },
  { id: "x_wing",        name: "X-Wing",        level: 3, category: "Intermediate Subsets", implemented: true },

  // ---- Level 4 ----
  { id: "swordfish",       name: "Swordfish",       level: 4, category: "Advanced Patterns", implemented: true, subsumes: ["x_wing"] },
  { id: "jellyfish",       name: "Jellyfish",       level: 4, category: "Advanced Patterns", implemented: true, subsumes: ["swordfish", "x_wing"] },
  { id: "xy_wing",         name: "XY-Wing",         level: 4, category: "Advanced Patterns", implemented: true },
  { id: "xyz_wing",        name: "XYZ-Wing",        level: 4, category: "Advanced Patterns", implemented: true, subsumes: ["xy_wing"] },
  { id: "simple_coloring", name: "Simple Coloring", level: 4, category: "Advanced Patterns", implemented: true },
  { id: "skyscraper",      name: "Skyscraper",      level: 4, category: "Advanced Patterns", implemented: true },
  { id: "two_string_kite", name: "2-String Kite",   level: 4, category: "Advanced Patterns", implemented: true },

  // ---- Level 5 ----
  { id: "unique_rect",  name: "Unique Rectangle", level: 5, category: "Chains & Uniqueness", implemented: true },
  { id: "bug_plus_1",   name: "BUG + 1",           level: 5, category: "Chains & Uniqueness", implemented: true },
  { id: "w_wing",       name: "W-Wing",            level: 5, category: "Chains & Uniqueness", implemented: true },
  { id: "empty_rect",   name: "Empty Rectangle",   level: 5, category: "Chains & Uniqueness", implemented: true },
  { id: "x_chain",      name: "X-Chain",           level: 5, category: "Chains & Uniqueness", implemented: true },
  { id: "xy_chain",     name: "XY-Chain",          level: 5, category: "Chains & Uniqueness", implemented: true, subsumes: ["xy_wing"] },

  // ---- Level 6 ----
  { id: "sue_de_coq",    name: "Sue-de-Coq",           level: 6, category: "Diabolical / Extreme", implemented: true },
  { id: "als",           name: "Almost Locked Sets",   level: 6, category: "Diabolical / Extreme", implemented: true },
  { id: "medusa_3d",     name: "3D Medusa",            level: 6, category: "Diabolical / Extreme", implemented: true, subsumes: ["simple_coloring"] },
  { id: "exocet",        name: "Exocet",               level: 6, category: "Diabolical / Extreme", implemented: true },
  { id: "bowmans_bingo", name: "Bowman's Bingo",       level: 6, category: "Diabolical / Extreme", implemented: true },
];

export const TECHNIQUES_BY_ID: Record<string, TechniqueInfo> = Object.fromEntries(
  TECHNIQUES.map((t) => [t.id, t]),
);

/** Given a set of user-ticked ids, return ids that should be *disabled* in the UI
 *  because they are strictly subsumed by something already ticked. */
export function computeDisabledIds(ticked: Set<string>): Set<string> {
  const disabled = new Set<string>();
  for (const id of ticked) {
    const t = TECHNIQUES_BY_ID[id];
    if (!t?.subsumes) continue;
    for (const sub of t.subsumes) disabled.add(sub);
  }
  return disabled;
}

/** Techniques that are "allowed" given the user's ticks — we assume all strictly
 *  easier / implied techniques are also allowed so the solver can actually reach
 *  progress between harder steps. */
export function expandAllowed(ticked: Set<string>): Set<string> {
  const allowed = new Set(ticked);
  // Lower levels are assumed always allowed — a puzzle almost always needs them
  // as glue between harder deductions.
  const maxLevel = Math.max(1, ...Array.from(ticked).map((id) => TECHNIQUES_BY_ID[id]?.level ?? 1));
  for (const t of TECHNIQUES) {
    if (t.implemented && t.level <= Math.max(2, maxLevel)) allowed.add(t.id);
  }
  return allowed;
}
