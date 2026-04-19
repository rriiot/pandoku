# pandoku

A tiny, focused desktop Sudoku.

Pandoku is a small window that sits on your desktop and does one thing well: generate Sudoku puzzles at the difficulty you want and let you solve them. No accounts, no ads, no network — just you and a grid.

## Play

- **Play in your browser** → https://rriiot.github.io/pandoku/
- **Windows desktop** → grab `pandoku-win.exe` from the [latest release](https://github.com/rriiot/pandoku/releases/latest). It's a single portable executable — no installer.

## What you get

- **Eight difficulty presets.** Easy, Medium, Hard, Expert, Extreme, two extra Extreme variants, and a Custom mode where you pick the solving techniques the puzzle must require.
- **Three ways to play Extreme.** Time-boxed carving, indefinite carving until a 17-clue puzzle appears, or an instant pick from a verified 17-clue catalog.
- **Technique-driven generation.** Open the **Advanced** panel and tick what you want to practise — Naked Pairs, X-Wing, Swordfish, XY-Chain, Unique Rectangle, even Exocet — and pandoku will try to build a puzzle that can only be solved using those techniques.
- **Pencil marks.** Toggle pencil mode or hold Shift/Ctrl/Alt while entering a digit. Candidates sit in a 3×3 mini-grid inside each cell at their own position (1 top-left, 5 center, 9 bottom-right).
- **Smart highlighting.** Selecting a cell lights up its row, column, and box in yellow. If it has a number, every other cell with that number lights up olive. Pad buttons mark finished numbers with ✓.
- **Undo.** Ctrl+Z or the ↶ button walks back every placement and pencil toggle in order. Selection follows the revert so you see what changed.
- **A timer with pause.** Press P to pause when you need coffee.
- **History.** Every completed puzzle is recorded with difficulty, time, and date. Best time per difficulty shown at the top.
- **Localized.** Ten languages out of the box — English, 中文, 日本語, 한국어, Español, Français, Deutsch, Русский, Italiano, Português. Your choice is remembered across launches. On first run, the app tries to match your system language.
- **Lightweight.** Single-window app that auto-sizes to the content. Runs offline, no background services.

## Hotkeys

| | |
|---|---|
| `1–9` | Place a digit in the selected cell |
| `Shift/Ctrl/Alt + 1–9` | Toggle a pencil mark |
| `0` / `Backspace` / `Delete` | Clear the cell (or clear pencil marks if empty) |
| `Ctrl+Z` | Undo |
| `↑ ↓ ← →` | Move the selection |
| `p` | Pause / resume the timer |
| `s` × 6 | Reveal the solution (debug) |
| `Esc` | Close any floating window |

## Credits

The 17-clue minimal Sudoku puzzles in the Extreme pool come from the public minimal-Sudoku catalogs that have been shared in the Sudoku research community.

---

If you find a puzzle pandoku can't generate in time, click **Kill** on the loading screen and try a different difficulty. If it produces something too easy or too hard, click **New** and the generator will take another swing.
