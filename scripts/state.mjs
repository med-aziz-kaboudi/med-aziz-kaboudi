// Arcade state, with an upgrade from the first, Connect Four only, format.

import { readFileSync } from 'node:fs'
import { emptyBoard } from './connect4.mjs'

const FILE = new URL('../game/state.json', import.meta.url)

export function fresh() {
  return {
    version: 2,
    connect4: { game: 1, board: emptyBoard(), moves: 0, players: [], lastMove: [], games: [] },
    ttt: { game: 1, board: Array(9).fill(0), players: [], last: [], lastGame: null },
    rps: { rounds: 0, throws: { rock: 0, paper: 0, scissors: 0 }, results: { human: 0, bot: 0, draw: 0 }, last: null },
    players: {},
    totals: { moves: 0, games: 0, human: 0, bot: 0, draw: 0 },
    feed: [],
  }
}

export function loadState() {
  const raw = JSON.parse(readFileSync(FILE, 'utf8'))
  if (raw.version === 2) return raw

  // v1 held a single Connect Four game at the top level.
  const s = fresh()
  Object.assign(s.connect4, {
    game: raw.game, board: raw.board, moves: raw.moves, players: raw.players,
    lastMove: raw.lastMove, games: raw.games || [],
  })
  for (const r of raw.recent || []) {
    const p = (s.players[r.login] ||= { played: 0, won: 0, lost: 0, draw: 0, first: r.at, last: r.at })
    p.played++
    s.totals.moves++
    s.feed.push({ login: r.login, game: 'connect4', at: r.at })
  }
  return s
}
