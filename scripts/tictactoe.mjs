// Tic-Tac-Toe. Cells 0..8, left to right, top to bottom. 1 = visitors (X),
// 2 = bot (O).

export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

export function winner(b) {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return { player: b[l[0]], cells: l }
  return null
}

const free = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0)

function minimax(b, turn, depth) {
  const w = winner(b)
  if (w) return w.player === 2 ? 10 - depth : depth - 10
  const moves = free(b)
  if (!moves.length) return 0
  let best = turn === 2 ? -Infinity : Infinity
  for (const i of moves) {
    b[i] = turn
    const s = minimax(b, turn === 2 ? 1 : 2, depth + 1)
    b[i] = 0
    best = turn === 2 ? Math.max(best, s) : Math.min(best, s)
  }
  return best
}

/**
 * A perfect Tic-Tac-Toe bot never loses, which makes the game pointless. This
 * one always takes a win and always blocks one, but otherwise plays a random
 * move a quarter of the time, so a sharp visitor can beat it.
 */
export function botMove(board, rand = Math.random) {
  const b = board.slice()
  const moves = free(b)
  for (const who of [2, 1]) {
    for (const i of moves) {
      b[i] = who
      const w = winner(b)
      b[i] = 0
      if (w) return i
    }
  }
  if (rand() < 0.25) return moves[Math.floor(rand() * moves.length)]
  let best = -Infinity, picks = []
  for (const i of moves) {
    b[i] = 2
    const s = minimax(b, 1, 0)
    b[i] = 0
    if (s > best) { best = s; picks = [i] } else if (s === best) picks.push(i)
  }
  return picks[Math.floor(rand() * picks.length)]
}

export const isFull = (b) => b.every(Boolean)

/**
 * True once neither side can still make three in a row: every line already
 * holds both an X and an O. The game is a draw from that moment, so it ends
 * there instead of making visitors fill the last squares for nothing.
 */
export const isDead = (b) => LINES.every((l) => l.some((i) => b[i] === 1) && l.some((i) => b[i] === 2))
