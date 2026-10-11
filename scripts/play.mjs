// Handles one Connect Four move from an issue.
//
// The issue title is the whole input, e.g. "connect4|drop|4". It comes from a
// stranger, so it is read from an env var and matched against a strict
// pattern; nothing from it ever reaches a shell. Writes the new state and a
// reply for the issue comment to game/reply.md.

import { readFileSync, writeFileSync } from 'node:fs'
import { emptyBoard, landingRow, winner, validCols, botMove, HUMAN, BOT } from './connect4.mjs'
import { REPO } from '../data/profile.mjs'

const STATE = new URL('../game/state.json', import.meta.url)
const REPLY = new URL('../game/reply.md', import.meta.url)

const title = (process.env.TITLE || '').trim()
const login = (process.env.LOGIN || 'someone').replace(/[^A-Za-z0-9-]/g, '')
const now = new Date().toISOString()

const state = JSON.parse(readFileSync(STATE, 'utf8'))
const reply = []
const profile = `https://github.com/${REPO.split('/')[0]}`

const m = /^connect4\|drop\|([1-7])$/.exec(title)
if (!m) {
  reply.push(`That does not look like a move. Use the column buttons on [the profile](${profile}) to play.`)
  finish(false)
}

const col = Number(m[1]) - 1
const row = landingRow(state.board, col)
if (row < 0) {
  reply.push(`Column ${col + 1} is full. Pick another one on [the profile](${profile}).`)
  finish(false)
}

state.board[row][col] = HUMAN
state.moves += 1
if (!state.players.includes(login)) state.players.push(login)
state.recent.unshift({ login, col: col + 1, at: now })
state.recent = state.recent.slice(0, 6)
state.lastMove = [{ r: row, c: col }]

let w = winner(state.board)
if (w) {
  reply.push(`🎉 **You won!** Four in a row in column ${col + 1}. The bot has been beaten.`)
  state.wins[login] = (state.wins[login] || 0) + 1
  end('human', w)
} else if (!validCols(state.board).length) {
  reply.push('Board full. It is a draw.')
  end('draw', null)
} else {
  const bc = botMove(state.board)
  const br = landingRow(state.board, bc)
  state.board[br][bc] = BOT
  state.moves += 1
  state.lastMove.push({ r: br, c: bc })
  w = winner(state.board)
  reply.push(`You dropped into column **${col + 1}**. The bot answered in column **${bc + 1}**.`)
  if (w) {
    reply.push('', '🤖 **The bot connected four and won this one.** A new game has started, come and take your revenge.')
    end('bot', w)
  } else if (!validCols(state.board).length) {
    reply.push('', 'Board full. It is a draw.')
    end('draw', null)
  } else {
    reply.push('', 'Your move again, or anyone else\'s. It is a community game.')
  }
}

reply.push('', boardText(state.lastGameBoard && state.moves === 0 ? state.lastGameBoard : state.board))
finish(true)

function end(result, win) {
  state.games.unshift({
    result,
    players: state.players,
    moves: state.moves,
    at: now,
    board: state.board,
    win: win ? win.cells : null,
  })
  state.games = state.games.slice(0, 20)
  state.lastGameBoard = state.board
  state.board = emptyBoard()
  state.moves = 0
  state.players = []
  state.lastMove = []
  state.game += 1
}

function boardText(b) {
  return b.map((r) => r.map((v) => (v === HUMAN ? '🔴' : v === BOT ? '🟡' : '⚪')).join('')).join('\n') + '\n'
}

function finish(changed) {
  reply.push('', `[Back to the profile ↗](${profile})`)
  if (changed) writeFileSync(STATE, JSON.stringify(state, null, 1) + '\n')
  writeFileSync(REPLY, reply.join('\n'))
  process.exit(0)
}
