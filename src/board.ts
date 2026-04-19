// Board primitives — type, construction helpers, validity, completion check.

export type Board = number[][];

export function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array<number>(9).fill(0));
}

export function cloneBoard(b: Board): Board {
  return b.map((row) => row.slice());
}

/** Is placing `n` at `(r, c)` consistent with the rest of `b`? Ignores `(r, c)` itself. */
export function isValid(b: Board, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === n) return false;
    if (b[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if (b[rr][cc] === n) return false;
    }
  }
  return true;
}

/** Fisher–Yates in-place shuffle. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** First empty cell in row-major order, or null if the board is full. */
export function firstEmpty(b: Board): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] === 0) return [r, c];
    }
  }
  return null;
}

/** True when the board is fully filled AND every cell is consistent. Does not
 *  mutate the board — duplicate detection compares peer cells directly. */
export function isBoardComplete(b: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const n = b[r][c];
      if (n === 0) return false;
      for (let i = 0; i < 9; i++) {
        if (i !== c && b[r][i] === n) return false;
        if (i !== r && b[i][c] === n) return false;
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let rr = br; rr < br + 3; rr++) {
        for (let cc = bc; cc < bc + 3; cc++) {
          if ((rr !== r || cc !== c) && b[rr][cc] === n) return false;
        }
      }
    }
  }
  return true;
}
