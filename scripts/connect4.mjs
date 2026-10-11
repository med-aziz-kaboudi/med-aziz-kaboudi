// Connect Four rules and the bot that plays against profile visitors.
// Board is 6 rows x 7 columns, row 0 at the top. 1 = visitors, 2 = bot.

export const ROWS = 6
export const COLS = 7
export const HUMAN = 1
export const BOT = 2

export const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

/** Row the disc lands in, or -1 when the column is full. */
export function landingRow(board, c) {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][c]) return r
  return -1
}

export const validCols = (board) => [...Array(COLS).keys()].filter((c) => !board[0][c])

/** The four cells that won, or null. */
export function winner(board) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c]
      if (!v) continue
      for (const [dr, dc] of dirs) {
        const cells = [[r, c]]
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== v) break
          cells.push([rr, cc])
        }
        if (cells.length === 4) return { player: v, cells }
      }
    }
  }
  return null
}

/* ----------------------------------------------------------------- the bot */

function scoreWindow(w, me) {
  const op = me === BOT ? HUMAN : BOT
  const mine = w.filter((v) => v === me).length
  const theirs = w.filter((v) => v === op).length
  const empty = w.filter((v) => !v).length
  if (mine === 4) return 1000
  if (mine === 3 && empty === 1) return 6
  if (mine === 2 && empty === 2) return 2
  if (theirs === 3 && empty === 1) return -5
  return 0
}

function evaluate(b, me) {
  let s = 0
  // The centre column takes part in the most lines.
  for (let r = 0; r < ROWS; r++) if (b[r][3] === me) s += 3
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS) s += scoreWindow([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]], me)
      if (r + 3 < ROWS) s += scoreWindow([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]], me)
      if (r + 3 < ROWS && c + 3 < COLS) s += scoreWindow([b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]], me)
      if (r + 3 < ROWS && c - 3 >= 0) s += scoreWindow([b[r][c], b[r + 1][c - 1], b[r + 2][c - 2], b[r + 3][c - 3]], me)
    }
  }
  return s
}

const ORDER = [3, 2, 4, 1, 5, 0, 6]

function minimax(b, depth, alpha, beta, maximizing) {
  const w = winner(b)
  if (w) return w.player === BOT ? 100000 + depth : -100000 - depth
  const moves = ORDER.filter((c) => !b[0][c])
  if (!moves.length) return 0
  if (depth === 0) return evaluate(b, BOT)
  if (maximizing) {
    let best = -Infinity
    for (const c of moves) {
      const r = landingRow(b, c)
      b[r][c] = BOT
      best = Math.max(best, minimax(b, depth - 1, alpha, beta, false))
      b[r][c] = 0
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return best
  }
  let best = Infinity
  for (const c of moves) {
    const r = landingRow(b, c)
    b[r][c] = HUMAN
    best = Math.min(best, minimax(b, depth - 1, alpha, beta, true))
    b[r][c] = 0
    beta = Math.min(beta, best)
    if (alpha >= beta) break
  }
  return best
}

/**
 * Depth 5 is strong enough to punish careless play and still beatable by
 * anyone who plans ahead, which is the point of a game on a profile. Ties are
 * broken at random so games do not repeat move for move.
 */
export function botMove(board, depth = 5, rand = Math.random) {
  const b = board.map((row) => row.slice())
  let best = -Infinity
  let picks = []
  for (const c of ORDER.filter((c) => !b[0][c])) {
    const r = landingRow(b, c)
    b[r][c] = BOT
    const s = minimax(b, depth - 1, -Infinity, Infinity, false)
    b[r][c] = 0
    if (s > best) { best = s; picks = [c] } else if (s === best) picks.push(c)
  }
  return picks[Math.floor(rand() * picks.length)]
}
