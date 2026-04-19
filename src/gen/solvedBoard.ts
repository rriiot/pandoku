// Generates a random fully-solved Sudoku grid by filling the diagonal boxes
// (independent) and then completing the rest with randomized backtracking.

import { emptyBoard, firstEmpty, isValid, shuffle, type Board } from "../board";

function fillRandom(b: Board): boolean {
  const slot = firstEmpty(b);
  if (!slot) return true;
  const [r, c] = slot;
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const n of nums) {
    if (isValid(b, r, c, n)) {
      b[r][c] = n;
      if (fillRandom(b)) return true;
      b[r][c] = 0;
    }
  }
  return false;
}

export function generateSolvedBoard(): Board {
  const b = emptyBoard();
  // Fill diagonal 3×3 boxes first (independent → no conflicts) for faster completion.
  for (let box = 0; box < 9; box += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let k = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) b[box + r][box + c] = nums[k++];
    }
  }
  fillRandom(b);
  return b;
}
