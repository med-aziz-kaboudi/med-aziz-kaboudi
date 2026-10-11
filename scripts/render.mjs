// Draws every image into generated/ and writes README.md from data/.
// Runs on every push, every day, and after every arcade move.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as S from './svg.mjs'
import * as P from '../data/profile.mjs'
import { loadState } from './state.mjs'

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const out = `${root}/generated`
mkdirSync(out, { recursive: true })

const state = loadState()
const st = existsSync(`${root}/data/stats.json`)
  ? JSON.parse(readFileSync(`${root}/data/stats.json`, 'utf8'))
  : { total: 0, weeks: [] }

const RAW = `https://raw.githubusercontent.com/${P.REPO}/main/generated`
const files = {}

// raw.githubusercontent.com caches each path for five minutes and ignores
// query strings, so a ?v= cache-buster does nothing there. Instead the
// content hash is part of the filename: a changed image is a new file at a
// new URL and shows up at once. Files from earlier renders are deleted below.
function save(name, draw) {
  for (const theme of ['dark', 'light']) {
    const svg = draw(S.THEMES[theme])
    const file = `${name}-${theme}-${createHash('sha1').update(svg).digest('hex').slice(0, 8)}.svg`
    writeFileSync(`${out}/${file}`, svg)
    files[`${name}-${theme}`] = file
  }
}
const src = (name, theme) => `${RAW}/${files[`${name}-${theme}`]}`
const pic = (name, alt, width) =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${src(name, 'dark')}"><source media="(prefers-color-scheme: light)" srcset="${src(name, 'light')}"><img alt="${alt}" src="${src(name, 'dark')}" width="${width}"></picture>`
const link = (href, inner) => `<a href="${href}">${inner}</a>`

// One click on the board opens a pre-filled issue; pressing Create plays.
const playUrl = (move, label) =>
  `https://github.com/${P.REPO}/issues/new?title=${encodeURIComponent(move)}&body=${encodeURIComponent(
    `## Press the green **Create** button below to play: ${label}\n\nThe bot answers in about ten seconds, replies here, and the board on the profile redraws itself. You can close this tab.`
  )}`

/* ------------------------------------------------------------ the page */

const logos = P.PRODUCTS.map((p) => `data:image/png;base64,${readFileSync(`${root}/assets/${p.key}-logo-128.png`).toString('base64')}`)
save('hero', (t) => S.hero(t, { name: P.NAME, eyebrow: P.EYEBROW, roles: P.ROLES, logos, inner: P.GLOBE_INNER }))
save('btn-portfolio', (t) => S.button(t, { label: 'Portfolio', icon: 'globe', w: 162 }))
save('btn-linkedin', (t) => S.button(t, { label: 'LinkedIn', brand: 'LinkedIn', color: '#0a66c2', w: 152 }))
save('btn-email', (t) => S.button(t, { label: 'Email', icon: 'mail', w: 130 }))
save('stats', (t) => S.tiles(t, P.STATS))

save('h-products', (t) => S.header(t, 'phone', 'My products', 'TWO APPS, BUILT AND RUN END TO END'))
for (const p of P.PRODUCTS) {
  save(`product-${p.key}`, (t) => S.productCard(t, p, root))
  save(`ios-${p.key}`, (t) => S.button(t, { label: 'App Store', brand: 'AppStore', color: p.colors[0], w: 180 }))
  save(`android-${p.key}`, (t) => S.button(t, { label: 'Google Play', brand: 'GooglePlay', color: p.colors[0], w: 180 }))
}
save('h-stack', (t) => S.header(t, 'layers', 'Stack', 'WHAT I SHIP WITH'))
save('stack', (t) => S.stack(t, P.STACK, P.STACK_LABEL))
save('h-awards', (t) => S.header(t, 'trophy', 'Hackathons & certifications'))
save('awards', (t) => S.awards(t, P.HACKATHONS, P.CERTS))

/* ------------------------------------------------------------- arcade */

const tot = state.totals
const playerCount = Object.keys(state.players).length
save('h-arcade', (t) => S.header(t, 'gamepad', 'Arcade', 'THREE GAMES AGAINST MY BOTS. EVERY VISITOR PLAYS THE SAME BOARD.'))
save('scoreboard', (t) => S.tiles(t, [
  { value: String(playerCount), label: 'PLAYERS', icon: 'users' },
  { value: String(tot.games), label: 'GAMES FINISHED', icon: 'gamepad' },
  { value: String(tot.human), label: 'HUMANS WON', icon: 'crown' },
  { value: String(tot.bot), label: 'BOT WON', icon: 'bot' },
  { value: String(tot.moves), label: 'MOVES MADE', icon: 'zap' },
]))

// Connect Four: seven clickable columns.
const c4 = state.connect4
const c4Status = c4.moves === 0 ? 'Fresh board. Click any column to drop the first disc.' : `Game ${c4.game} · ${c4.moves} discs down · click a column to move`
save('c4-bar', (t) => S.gameBar(t, { title: 'Connect Four', status: c4Status, legend: S.c4Legend() }))
for (let c = 0; c < 7; c++) save(`c4-col${c + 1}`, (t) => S.c4Column(t, c4.board, c, { lastMove: c4.lastMove }))
save('connect4-board', (t) => S.c4Board(t, c4.board))
const c4Last = c4.games[0]
if (c4Last) save('connect4-last', (t) => S.c4Board(t, c4Last.board, { title: 'Last Connect Four game', sub: resultLine(c4Last), win: c4Last.win }))

// Tic-Tac-Toe: nine clickable squares.
const ttt = state.ttt
const tttStatus = ttt.board.some(Boolean) ? 'Your move. Click an empty square.' : 'Fresh board. Click any square to place your X.'
save('ttt-bar', (t) => S.gameBar(t, { title: 'Tic-Tac-Toe', status: tttStatus, legend: S.tttLegend(t) }))
ttt.board.forEach((v, i) => save(`ttt-${i + 1}`, (t) => S.tttCell(t, v, { fresh: ttt.last.includes(i), delay: ttt.last.indexOf(i) * 0.6 })))
save('ttt-board', (t) => S.tttBoard(t, ttt.board))
if (ttt.lastGame) save('ttt-last', (t) => S.tttBoard(t, ttt.lastGame.board, { title: 'Last Tic-Tac-Toe game', sub: resultLine({ ...ttt.lastGame, moves: ttt.lastGame.board.filter(Boolean).length }), win: ttt.lastGame.win }))

// Rock, paper, scissors: three clickable throws.
save('rps-bar', (t) => S.gameBar(t, { title: 'Rock, Paper, Scissors', status: 'One click, one round. My bot studies how the crowd throws.' }))
for (const [i, th] of ['rock', 'paper', 'scissors'].entries()) save(`rps-${th}`, (t) => S.rpsButton(t, th, i))
save('rps-last', (t) => S.rpsLast(t, state.rps))

function resultLine(g) {
  const who = g.players.length ? g.players.slice(0, 3).map((p) => `@${p}`).join(', ') : 'visitors'
  if (g.result === 'human') return `${who} beat the bot in ${g.moves} moves`
  if (g.result === 'bot') return `The bot won in ${g.moves} moves against ${who}`
  return `Draw after ${g.moves} moves`
}

/* ---------------------------------------------------------- city gate */

const showCity = st.total >= P.CITY_MIN_CONTRIBUTIONS
if (showCity) {
  save('h-city', (t) => S.header(t, 'city', 'My year in 3D', 'ONE TOWER PER DAY OF CONTRIBUTIONS'))
  save('city', (t) => S.city(t, st.weeks, st.total))
}

/* ------------------------------------------------------------- README */

const views = 'https://api.visitorbadge.io/api/visitors?path=med-aziz-kaboudi-profile&countColor=%232f81f7&style=for-the-badge&labelStyle=upper'
const centered = (inner) => `<p align="center">${inner}</p>`
const md = []

md.push(`<!-- Generated by scripts/render.mjs. Edit data/profile.mjs instead, this file is overwritten. -->`)
md.push(centered(link(P.LINKS.portfolio, pic('hero', 'Mohamed Aziz Kaboudi, software engineer and founder', 1200))))
md.push(centered([
  link(P.LINKS.portfolio, pic('btn-portfolio', 'Portfolio', 162)),
  link(P.LINKS.linkedin, pic('btn-linkedin', 'LinkedIn', 152)),
  link(P.LINKS.email, pic('btn-email', 'Email', 130)),
].join(' ') + `<br><img src="${views}" alt="Profile visitors">`))
md.push(P.ABOUT.map((l) => centered(l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'))).join('\n'))
md.push(centered(pic('stats', 'Two apps live in stores, six years building, fifty plus projects, three hackathon placements', 1200)))

md.push(centered(pic('h-products', 'My products', 1200)))
md.push(`<table><tr>
${P.PRODUCTS.map((p) => `<td width="50%" align="center" valign="top">${link(p.url, pic(`product-${p.key}`, p.name, 600))}<br>${link(p.ios, pic(`ios-${p.key}`, `${p.name} on the App Store`, 180))} ${link(p.android, pic(`android-${p.key}`, `${p.name} on Google Play`, 180))}</td>`).join('\n')}
</tr></table>`)
md.push(`<sub>Both designed, built, shipped and run by me: product, design, mobile, backend, infrastructure and the AI inside them. Click a card for its website. Owemie and Ömrüm are proprietary; their source is private and their names, logos and design may not be reused without written permission.</sub>`)

md.push(centered(pic('h-stack', 'Stack', 1200)))
md.push(centered(pic('stack', 'TypeScript, Dart, Python, Kotlin, Swift, Flutter, React, Next.js, NestJS, PostgreSQL, Supabase, Ollama, PyTorch, Google Cloud, Docker and more', 1200)))

md.push(`<a name="arcade"></a>`)
md.push(centered(pic('h-arcade', 'Arcade', 1200)))
md.push(centered(`<b>Click straight on a board.</b> GitHub opens your move as a ready-made issue: press <b>Create</b> and my bot answers in about ten seconds, then the board here redraws itself. Every game counts on the scoreboard.`))
md.push(centered(pic('scoreboard', `${playerCount} players, ${tot.games} games finished, humans won ${tot.human}, bot won ${tot.bot}`, 1200)))

md.push(centered(pic('c4-bar', c4Status, 600)))
md.push(centered(Array.from({ length: 7 }, (_, c) =>
  link(playUrl(`c4|${c + 1}`, `drop a disc in column ${c + 1}`), pic(`c4-col${c + 1}`, `Drop in column ${c + 1}`, 50))).join('')))

md.push(centered(pic('ttt-bar', tttStatus, 600)))
md.push(centered([0, 1, 2].map((r) =>
  [0, 1, 2].map((c) => {
    const i = r * 3 + c
    return link(playUrl(`ttt|${i + 1}`, `square ${i + 1}`), pic(`ttt-${i + 1}`, `Square ${i + 1}`, 96))
  }).join('')).join('<br>')))

md.push(centered(pic('rps-bar', 'Rock, paper, scissors', 600)))
md.push(centered(['rock', 'paper', 'scissors'].map((th) =>
  link(playUrl(`rps|${th}`, `throw ${th}`), pic(`rps-${th}`, th, 130))).join(' ')))
md.push(centered(pic('rps-last', 'Last round', 600)))

const ranked = Object.entries(state.players)
  .sort((a, b) => b[1].won - a[1].won || b[1].played - a[1].played)
  .slice(0, 8)
if (ranked.length) {
  md.push(`<p align="center"><b>Hall of fame</b></p>`)
  md.push(`<table align="center">
<tr><th>Player</th><th>Won</th><th>Lost</th><th>Drawn</th><th>Moves</th></tr>
${ranked.map(([l, p]) => `<tr><td><a href="https://github.com/${l}"><img src="https://github.com/${l}.png?size=40" width="20" height="20"> @${l}</a></td><td align="center">${p.won}</td><td align="center">${p.lost}</td><td align="center">${p.draw}</td><td align="center">${p.played}</td></tr>`).join('\n')}
</table>`)
}
const feed = state.feed.slice(0, 5)
if (feed.length) {
  const names = { connect4: 'Connect Four', ttt: 'Tic-Tac-Toe', rps: 'Rock, Paper, Scissors' }
  md.push(centered(`<sub><b>Latest moves:</b> ${feed.map((m) => `<a href="https://github.com/${m.login}">@${m.login}</a> in ${names[m.game]}`).join(' · ')}</sub>`))
}
const lastGames = [c4Last && ['connect4-last', 'Last Connect Four game'], ttt.lastGame && ['ttt-last', 'Last Tic-Tac-Toe game']].filter(Boolean)
if (lastGames.length) {
  md.push(`<details><summary>Last finished games</summary><p align="center">${lastGames.map(([n, alt]) => pic(n, alt, 400)).join(' ')}</p></details>`)
}

if (showCity) {
  md.push(centered(pic('h-city', 'My year in 3D', 1200)))
  md.push(centered(pic('city', `${st.total} contributions in the last year as a 3D city`, 1200)))
  md.push(centered(`<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${P.REPO}/output/snake-dark.svg"><img alt="Snake eating my contributions" src="https://raw.githubusercontent.com/${P.REPO}/output/snake.svg"></picture>`))
}

md.push(centered(pic('h-awards', 'Hackathons and certifications', 1200)))
md.push(centered(pic('awards', P.HACKATHONS.map((h) => `${h[0]} ${h[1]}`).join(', '), 1200)))

md.push(centered(`<sub>© ${new Date().getFullYear()} Mohamed Aziz Kaboudi · this profile draws itself: every image is generated by code in this repo and redrawn by GitHub Actions · <a href="archive/v1/README.md">previous version</a></sub>`))

writeFileSync(`${root}/README.md`, md.join('\n\n') + '\n')

// Fill the image placeholders in a pending game reply.
const replyFile = `${root}/game/reply.md`
if (existsSync(replyFile)) {
  const reply = readFileSync(replyFile, 'utf8').replace(/\{\{IMG:([\w-]+)\}\}/g, (_, n) =>
    files[`${n}-dark`] ? pic(n, n.replace(/-/g, ' '), 420) : '')
  writeFileSync(replyFile, reply)
}

const keep = new Set(Object.values(files))
for (const f of readdirSync(out)) if (f.endsWith('.svg') && !keep.has(f)) unlinkSync(`${out}/${f}`)
console.log(`rendered README, ${keep.size} images, city ${showCity ? 'shown' : `hidden (${st.total} < ${P.CITY_MIN_CONTRIBUTIONS})`}`)
