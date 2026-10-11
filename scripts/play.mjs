// Handles one arcade move from an issue.
//
// The issue title is the whole input: "c4|4", "ttt|5" or "rps|rock". It
// comes from a stranger, so it is read from an env var and matched against
// strict patterns; nothing from it ever reaches a shell. Writes the new state
// and the issue reply (game/reply.md). render.mjs later swaps the
// {{IMG:name}} placeholders in the reply for the freshly drawn images.

import { readFileSync, writeFileSync } from 'node:fs'
import * as C4 from './connect4.mjs'
import * as TTT from './tictactoe.mjs'
import * as RPS from './rps.mjs'
import { USER } from '../data/profile.mjs'
import { loadState } from './state.mjs'

const STATE = new URL('../game/state.json', import.meta.url)
const REPLY = new URL('../game/reply.md', import.meta.url)

const title = (process.env.TITLE || '').trim().toLowerCase()
const login = (process.env.LOGIN || 'someone').replace(/[^A-Za-z0-9-]/g, '') || 'someone'
const now = new Date().toISOString()
const profile = `https://github.com/${USER}#arcade`

const state = loadState()
const reply = []

// ------------------------------------------------------------- bookkeeping

function player(name) {
  const p = (state.players[name] ||= { played: 0, won: 0, lost: 0, draw: 0, first: now })
  p.last = now
  return p
}

/** A finished community game credits everyone who took part in it. */
function credit(players, result) {
  for (const name of players) {
    const p = player(name)
    if (result === 'human') p.won++
    else if (result === 'bot') p.lost++
    else p.draw++
  }
  state.totals.games++
  state.totals[result]++
}

function move(game) {
  const p = player(login)
  p.played++
  state.totals.moves++
  state.feed.unshift({ login, game, at: now })
  state.feed = state.feed.slice(0, 8)
}

// ------------------------------------------------------------ connect four

function connect4(col) {
  const g = state.connect4
  const row = C4.landingRow(g.board, col)
  if (row < 0) return reply.push(`Column ${col + 1} is full. Pick another one on [the profile](${profile}).`), false
  move('connect4')
  g.board[row][col] = C4.HUMAN
  g.moves++
  if (!g.players.includes(login)) g.players.push(login)
  g.lastMove = [{ r: row, c: col }]

  let w = C4.winner(g.board)
  if (w) return endC4('human', w, `**You won.** Four in a row, the bot is beaten. Your name goes on the board.`)
  if (!C4.validCols(g.board).length) return endC4('draw', null, 'Board full. A draw.')

  const bc = C4.botMove(g.board)
  const br = C4.landingRow(g.board, bc)
  g.board[br][bc] = C4.BOT
  g.moves++
  g.lastMove.push({ r: br, c: bc })
  reply.push(`You dropped into column **${col + 1}**. The bot answered in column **${bc + 1}**.`)
  w = C4.winner(g.board)
  if (w) return endC4('bot', w, '**The bot connected four.** A new game has started. Come back for revenge.')
  if (!C4.validCols(g.board).length) return endC4('draw', null, 'Board full. A draw.')
  reply.push('', 'Your move again, or anyone else\'s: everyone plays the same game.', '', '{{IMG:connect4-board}}')
  return true
}

function endC4(result, win, line) {
  const g = state.connect4
  reply.push(line, '', '{{IMG:connect4-last}}')
  credit(g.players, result)
  g.games.unshift({ result, players: g.players, moves: g.moves, at: now, board: g.board, win: win ? win.cells : null })
  g.games = g.games.slice(0, 10)
  Object.assign(g, { board: C4.emptyBoard(), moves: 0, players: [], lastMove: [], game: g.game + 1 })
  return true
}

// ------------------------------------------------------------- tic tac toe

function tictactoe(cell) {
  const g = state.ttt
  if (g.board[cell]) return reply.push(`That square is taken. Pick an empty one on [the profile](${profile}).`), false
  move('ttt')
  g.board[cell] = 1
  if (!g.players.includes(login)) g.players.push(login)
  g.last = [cell]

  let w = TTT.winner(g.board)
  if (w) return endTTT('human', w, '**Three in a row. You beat the bot.**')
  if (TTT.isFull(g.board)) return endTTT('draw', null, 'Board full. A draw.')

  const b = TTT.botMove(g.board)
  g.board[b] = 2
  g.last.push(b)
  w = TTT.winner(g.board)
  if (w) return endTTT('bot', w, '**The bot got three in a row.** New board is up.')
  if (TTT.isFull(g.board)) return endTTT('draw', null, 'Board full. A draw.')
  reply.push('You played your X. The bot placed its O. Your turn again, or anyone else\'s.', '', '{{IMG:ttt-board}}')
  return true
}

function endTTT(result, win, line) {
  const g = state.ttt
  g.lastGame = { result, players: g.players, board: g.board, win: win ? win.cells : null, at: now }
  reply.push(line, '', '{{IMG:ttt-last}}')
  credit(g.players, result)
  Object.assign(g, { board: Array(9).fill(0), players: [], last: [], game: g.game + 1 })
  return true
}

// ------------------------------------------------------ rock paper scissors

function rps(you) {
  const g = state.rps
  move('rps')
  const bot = RPS.botThrow(g.throws)
  g.throws[you] = (g.throws[you] || 0) + 1
  const result = RPS.result(you, bot)
  g.rounds++
  g.results[result]++
  g.last = { login, you, bot, result, at: now }
  credit([login], result)
  const verdict = { human: '**You win this round.**', bot: '**The bot wins this round.**', draw: '**Draw.**' }[result]
  reply.push(`You threw **${you}**, the bot threw **${bot}**. ${verdict}`, '', '{{IMG:rps-last}}')
  return true
}

// --------------------------------------------------------------- dispatch

let changed = false
let m
if ((m = /^(?:c4|connect4\|drop)\|([1-7])$/.exec(title))) changed = connect4(Number(m[1]) - 1)
else if ((m = /^ttt\|([1-9])$/.exec(title))) changed = tictactoe(Number(m[1]) - 1)
else if ((m = /^rps\|(rock|paper|scissors)$/.exec(title))) changed = rps(m[1])
else reply.push(`That does not look like a move. Play from the arcade on [the profile](${profile}).`)

const me = state.players[login]
if (changed && me) {
  reply.push('', `<sub>Your record: ${me.won} won · ${me.lost} lost · ${me.draw} drawn · ${me.played} moves</sub>`)
}
reply.push('', `[Back to the arcade](${profile})`)
if (changed) writeFileSync(STATE, JSON.stringify(state, null, 1) + '\n')
writeFileSync(REPLY, reply.join('\n'))
