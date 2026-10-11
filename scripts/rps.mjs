// Rock, paper, scissors against a bot that reads the crowd: it tracks what
// visitors throw most and usually plays the counter to it.

export const THROWS = ['rock', 'paper', 'scissors']
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
const COUNTER = { rock: 'paper', paper: 'scissors', scissors: 'rock' }

export function botThrow(history, rand = Math.random) {
  const total = THROWS.reduce((n, t) => n + (history[t] || 0), 0)
  // Two in three rounds it counters the crowd's favourite; otherwise random,
  // so nobody can simply farm it with the second-favourite throw.
  if (total >= 3 && rand() < 0.66) {
    const fav = THROWS.reduce((a, b) => ((history[b] || 0) > (history[a] || 0) ? b : a))
    return COUNTER[fav]
  }
  return THROWS[Math.floor(rand() * 3)]
}

export function result(you, bot) {
  if (you === bot) return 'draw'
  return BEATS[you] === bot ? 'human' : 'bot'
}
