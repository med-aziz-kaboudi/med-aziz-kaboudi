// Every image on the profile is drawn here as an animated SVG.
//
// GitHub shows README images through a proxy as plain <img>, so there is no
// JavaScript, no hover and no external fonts or images. What does work is CSS
// keyframes and SMIL inside the SVG, which is what all the motion below uses.
// Anything external (logos, screenshots) is embedded as a data URI.

import { readFileSync } from 'node:fs'

export const THEMES = {
  dark: {
    bg: '#0d1117', panel: '#161b22', panel2: '#1c2330', border: '#30363d',
    text: '#e6edf3', muted: '#8b949e', dim: '#6e7681', grid: '#2f81f7',
    hole: '#0d1117', board: ['#1f6feb', '#174ea6'],
  },
  light: {
    bg: '#ffffff', panel: '#f6f8fa', panel2: '#eef1f5', border: '#d0d7de',
    text: '#1f2328', muted: '#59636e', dim: '#818b98', grid: '#0969da',
    hole: '#ffffff', board: ['#2f81f7', '#1b5fc4'],
  },
}

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const f = (n) => Number(n.toFixed(2))
const dataUri = (path, mime) => `data:${mime};base64,${readFileSync(path).toString('base64')}`

const wrap = (w, h, body, style = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<style>
text{font-family:${SANS}}
.mono{font-family:${MONO}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
${style}
</style>
${body}
</svg>
`

/* ------------------------------------------------------------------ hero */

/**
 * Banner: a dot globe turning in 3D, a perspective grid floor flowing toward
 * the viewer, the name revealed behind a moving gradient, and role lines that
 * take turns.
 *
 * The globe is real 3D projected with CSS only. A point on a sphere turning
 * about the Y axis moves sinusoidally on screen, and an ease-in-out keyframe
 * played back and forth is a close match for a sinusoid. So each latitude
 * ring gets one horizontal and one vertical keyframe, and every dot on it is
 * the same animation with a phase offset (a negative delay). Depth drives
 * opacity, so the far side of the globe fades out.
 */
export function hero(t, { name, eyebrow, roles }) {
  const W = 1200, H = 440
  const cx = 905, cy = 205, R = 132, tilt = 0.36
  const T = 9 // seconds for half a turn
  const css = []
  const dots = []

  const rings = []
  for (let lat = -78; lat <= 78; lat += 12) rings.push(lat)
  rings.forEach((lat, k) => {
    const phi = (lat * Math.PI) / 180
    const r = R * Math.cos(phi)
    const y0 = -R * Math.sin(phi) * Math.cos(tilt)
    const dy = r * Math.sin(tilt)
    css.push(`@keyframes x${k}{from{transform:translateX(${f(-r)}px)}to{transform:translateX(${f(r)}px)}}`)
    css.push(`@keyframes y${k}{from{transform:translateY(${f(-dy)}px)}to{transform:translateY(${f(dy)}px)}}`)
    css.push(`.x${k}{animation:x${k} ${T}s ease-in-out infinite alternate}.y${k}{animation:y${k} ${T}s ease-in-out infinite alternate}`)
    const n = Math.max(5, Math.round(30 * Math.cos(phi)))
    for (let i = 0; i < n; i++) {
      const th = (2 * Math.PI * i) / n + k * 0.31
      const mod = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      // x = r sin(th + wt) matches -r cos(w(t + dX)) when w*dX = th + pi/2.
      const dX = (mod(th + Math.PI / 2) / Math.PI) * T
      // z = r cos(th + wt) matches -r cos(w(t + dZ)) when w*dZ = th + pi.
      const dZ = (mod(th + Math.PI) / Math.PI) * T
      const hue = i % 7 === 0 ? 'b' : i % 5 === 0 ? 'p' : 'a'
      dots.push(
        `<g transform="translate(${cx} ${f(cy + y0)})"><g class="x${k}" style="animation-delay:-${f(dX)}s"><g class="y${k}" style="animation-delay:-${f(dZ)}s"><circle r="2.3" class="dp ${hue}" style="animation-delay:-${f(dZ)}s"/></g></g></g>`
      )
    }
  })

  // Static wireframe: latitude ellipses do not change as the globe spins.
  const wire = rings
    .filter((_, i) => i % 2 === 0)
    .map((lat) => {
      const phi = (lat * Math.PI) / 180
      const r = R * Math.cos(phi)
      return `<ellipse cx="${cx}" cy="${f(cy - R * Math.sin(phi) * Math.cos(tilt))}" rx="${f(r)}" ry="${f(r * Math.sin(tilt))}"/>`
    })
    .join('')

  // Grid floor: fixed rays toward a vanishing point, and horizontal lines that
  // accelerate down the screen, which is what perspective does to them.
  const horizon = 338
  const rays = []
  for (let i = -24; i <= 24; i++) {
    rays.push(`<line x1="${600 + i * 22}" y1="${horizon}" x2="${600 + i * 150}" y2="${H}"/>`)
  }
  const flow = []
  for (let i = 0; i < 7; i++) {
    flow.push(`<line class="fl" x1="0" x2="${W}" y1="0" y2="0" style="animation-delay:-${f(i * (3.5 / 7))}s"/>`)
  }

  const roleCycle = roles.length * 3
  const roleCss = roles
    .map((_, i) => `.r${i}{animation:role ${roleCycle}s linear infinite;animation-delay:${i * 3}s;opacity:0}`)
    .join('')
  const fadePct = (100 / roles.length).toFixed(2)

  const style = `
${css.join('\n')}
.dp{animation:depth ${T}s ease-in-out infinite alternate}
@keyframes depth{from{opacity:.1}to{opacity:1}}
.a{fill:${t.text}}.b{fill:#4ade80}.p{fill:#b07be0}
.fl{animation:flow 3.5s cubic-bezier(.55,0,1,.6) infinite}
@keyframes flow{from{transform:translateY(${horizon}px);opacity:0}25%{opacity:.55}to{transform:translateY(${H}px);opacity:.9}}
@keyframes role{0%{opacity:0;transform:translateY(10px)}3%{opacity:1;transform:none}${f(fadePct - 3)}%{opacity:1;transform:none}${fadePct}%{opacity:0;transform:translateY(-8px)}100%{opacity:0}}
${roleCss}
.reveal{animation:reveal 1.3s cubic-bezier(.16,1,.3,1) both}
.reveal2{animation:reveal 1.3s cubic-bezier(.16,1,.3,1) .25s both}
@keyframes reveal{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.eb{animation:reveal 1s ease .1s both}
.pulse{animation:pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
`

  const body = `
<defs>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <radialGradient id="g1" cx="78%" cy="40%" r="45%"><stop offset="0" stop-color="#2f81f7" stop-opacity=".28"/><stop offset="1" stop-color="#2f81f7" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="12%" cy="10%" r="40%"><stop offset="0" stop-color="#4ade80" stop-opacity=".16"/><stop offset="1" stop-color="#4ade80" stop-opacity="0"/></radialGradient>
  <radialGradient id="g3" cx="60%" cy="100%" r="45%"><stop offset="0" stop-color="#b07be0" stop-opacity=".2"/><stop offset="1" stop-color="#b07be0" stop-opacity="0"/></radialGradient>
  <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bg}" stop-opacity="1"/><stop offset=".55" stop-color="${t.bg}" stop-opacity="0"/></linearGradient>
  <linearGradient id="name" x1="0" x2="1">
    <stop offset="0" stop-color="#4ade80"/><stop offset=".33" stop-color="#2f9fe0"/><stop offset=".66" stop-color="#b07be0"/><stop offset="1" stop-color="#f0879f"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-0.5 0;0.5 0;-0.5 0" dur="8s" repeatCount="indefinite"/>
  </linearGradient>
  <radialGradient id="core" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2f81f7" stop-opacity=".22"/><stop offset=".7" stop-color="#2f81f7" stop-opacity=".05"/><stop offset="1" stop-color="#2f81f7" stop-opacity="0"/></radialGradient>
  <path id="orbit" d="M ${cx - 200} ${cy} a 200 52 0 1 0 400 0 a 200 52 0 1 0 -400 0"/>
</defs>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/><rect width="${W}" height="${H}" fill="url(#g2)"/><rect width="${W}" height="${H}" fill="url(#g3)"/>
  <g stroke="${t.grid}" stroke-opacity=".28" stroke-width="1">${rays.join('')}</g>
  <g stroke="${t.grid}" stroke-width="1.2">${flow.join('')}</g>
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floorFade)"/>
  <line x1="0" x2="${W}" y1="${horizon}" y2="${horizon}" stroke="${t.grid}" stroke-opacity=".45"/>

  <circle cx="${cx}" cy="${cy}" r="${R * 1.45}" fill="url(#core)" class="pulse"/>
  <g fill="none" stroke="${t.grid}" stroke-opacity=".22">${wire}<circle cx="${cx}" cy="${cy}" r="${R}" stroke-opacity=".35"/></g>
  ${dots.join('\n  ')}
  <g transform="rotate(-16 ${cx} ${cy})">
    <use href="#orbit" fill="none" stroke="#f0879f" stroke-opacity=".45" stroke-dasharray="3 7"/>
    <circle r="5" fill="#f0879f"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#orbit"/></animateMotion></circle>
    <circle r="3.5" fill="#4ade80"><animateMotion dur="7s" begin="-3.5s" repeatCount="indefinite"><mpath href="#orbit"/></animateMotion></circle>
  </g>

  <text x="72" y="118" class="mono eb" font-size="15" letter-spacing="4" fill="${t.muted}">${esc(eyebrow)}</text>
  <text x="70" y="190" font-size="66" font-weight="800" letter-spacing="-2" fill="${t.text}" class="reveal">${esc(name[0])}</text>
  <text x="70" y="262" font-size="66" font-weight="800" letter-spacing="-2" fill="url(#name)" class="reveal2">${esc(name[1])}</text>
  <g class="mono" font-size="21" fill="${t.text}">
    <text x="72" y="314" fill="#4ade80">❯</text>
    ${roles.map((r, i) => `<text x="98" y="314" class="r${i}">${esc(r)}<tspan fill="#2f81f7">▍<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></tspan></text>`).join('\n    ')}
  </g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${t.border}"/>
`
  return wrap(W, H, body, style)
}

/* ------------------------------------------------------------- products */

/** A product card: logo, pitch, live badge, and the app itself in a phone. */
export function productCard(t, p, root) {
  const W = 600, H = 340
  const logo = dataUri(`${root}/assets/${p.key}-logo-128.png`, 'image/png')
  const shot = dataUri(`${root}/assets/shots/${p.key}.jpg`, 'image/jpeg')
  const per = 2 * (W - 2 + H - 2)
  const style = `
.run{animation:run 7s linear infinite}
@keyframes run{to{stroke-dashoffset:-${per}}}
.float{animation:float 4s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(5px)}to{transform:translateY(-7px)}}
.live{animation:live 1.8s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes live{from{transform:scale(1);opacity:.7}to{transform:scale(2.6);opacity:0}}
.in{animation:in .9s cubic-bezier(.16,1,.3,1) both}
@keyframes in{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
`
  const [c1, c2] = p.colors
  const body = `
<defs>
  <linearGradient id="br" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <radialGradient id="glow" cx="85%" cy="15%" r="65%"><stop offset="0" stop-color="${c1}" stop-opacity=".22"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
  <clipPath id="lg"><rect x="34" y="32" width="64" height="64" rx="16"/></clipPath>
  <clipPath id="scr"><rect x="433" y="26" width="128" height="278" rx="18"/></clipPath>
</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="${t.panel}"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="url(#glow)"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="none" stroke="${t.border}"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="22" fill="none" stroke="url(#br)" stroke-width="2" stroke-dasharray="160 ${per - 160}" class="run"/>
<g class="in">
  <image href="${logo}" x="34" y="32" width="64" height="64" clip-path="url(#lg)"/>
  <text x="34" y="150" font-size="40" font-weight="800" letter-spacing="-1.2" fill="url(#br)">${esc(p.name)}</text>
  ${p.lines.map((l, i) => `<text x="34" y="${186 + i * 26}" font-size="19" fill="${t.text}">${esc(l)}</text>`).join('\n  ')}
  <g transform="translate(34 252)">
    <rect width="214" height="30" rx="15" fill="${c1}" fill-opacity=".12" stroke="${c1}" stroke-opacity=".45"/>
    <circle cx="18" cy="15" r="4.5" fill="${c1}"/><circle cx="18" cy="15" r="4.5" fill="${c1}" class="live"/>
    <text x="32" y="20" class="mono" font-size="11.5" letter-spacing="1.4" fill="${c1}">LIVE · iOS &amp; ANDROID</text>
  </g>
  <text x="34" y="314" class="mono" font-size="12.5" fill="${t.muted}">${esc(p.stack)}</text>
</g>
<g class="float">
  <rect x="427" y="20" width="140" height="290" rx="24" fill="#0a0c10" stroke="${t.border}"/>
  <image href="${shot}" x="433" y="26" width="128" height="278" preserveAspectRatio="xMidYMin slice" clip-path="url(#scr)"/>
  <rect x="477" y="31" width="40" height="11" rx="5.5" fill="#0a0c10"/>
</g>
`
  return wrap(W, H, body, style)
}

/* ---------------------------------------------------------------- stats */

/** Big numbers that roll into place like an odometer. */
export function stats(t, items) {
  const W = 1200, H = 170, gap = 18
  const tw = (W - gap * (items.length - 1)) / items.length
  const fs = 58, lh = 70, adv = fs * 0.62
  const css = []
  let col = 0
  const tiles = items.map((it, i) => {
    const x = i * (tw + gap)
    const chars = it.value.split('')
    const glyphs = chars.map((ch, j) => {
      const gx = 30 + j * adv
      if (!/\d/.test(ch)) {
        return `<text x="${f(gx)}" y="92" font-size="${fs}" font-weight="800" fill="${it.color}" class="late">${esc(ch)}</text>`
      }
      const d = Number(ch)
      const seq = [...'0123456789', ...'0123456789'.slice(0, d + 1)]
      const dist = (seq.length - 1) * lh
      const k = col++
      css.push(`@keyframes o${k}{from{transform:translateY(0)}to{transform:translateY(-${dist}px)}}.o${k}{animation:o${k} ${f(2 + j * 0.35 + i * 0.15)}s cubic-bezier(.15,.85,.25,1) ${f(0.2 + i * 0.12)}s both}`)
      return `<g class="o${k}">${seq.map((s, n) => `<text x="${f(gx)}" y="${92 + n * lh}" font-size="${fs}" font-weight="800" fill="${t.text}">${s}</text>`).join('')}</g>`
    })
    return `<g transform="translate(${f(x)} 0)">
  <rect x=".5" y=".5" width="${f(tw - 1)}" height="${H - 1}" rx="18" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="24" y="0" width="56" height="3" rx="1.5" fill="${it.color}"/>
  <g clip-path="url(#band)">${glyphs.join('')}</g>
  <text x="30" y="136" class="mono" font-size="12" letter-spacing="2.2" fill="${t.muted}">${esc(it.label)}</text>
</g>`
  })
  const style = `
${css.join('\n')}
text{font-variant-numeric:tabular-nums}
.late{animation:late .6s ease 1.6s both}
@keyframes late{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
`
  const body = `<defs><clipPath id="band"><rect x="0" y="32" width="${f(tw)}" height="76"/></clipPath></defs>\n${tiles.join('\n')}`
  return wrap(W, H, body, style)
}

/* ---------------------------------------------------------------- stack */

const ICONS = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url)))
const lum = (hex) => {
  const n = parseInt(hex, 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
// Generic glyph for concepts with no brand mark (a four-point spark).
const SPARK = 'M12 0c.6 5.6 6.4 11.4 12 12-5.6.6-11.4 6.4-12 12-.6-5.6-6.4-11.4-12-12C5.6 11.4 11.4 5.6 12 0z'

/** Logo wall, one row per area, tiles popping in and a light sweeping over. */
export function stack(t, rows, labels, theme) {
  const W = 1200, rowH = 96, top = 18
  const H = top + rows.length * rowH + 6
  const tile = { w: 128, h: 80, gap: 12 }
  let n = 0
  const body = rows.map(([cat, items], r) => {
    const y = top + r * rowH
    const tiles = items.map((name, i) => {
      const x = 178 + i * (tile.w + tile.gap)
      const ic = ICONS[name]
      let color = ic ? `#${ic.hex}` : '#b07be0'
      if (ic && theme === 'dark' && lum(ic.hex) < 0.06) color = t.text
      if (ic && theme === 'light' && lum(ic.hex) > 0.75) color = '#3d4450'
      const path = ic ? ic.path : SPARK
      const k = n++
      return `<g class="tile" style="animation-delay:${f(k * 0.018)}s" transform="translate(${x} ${y})">
  <rect width="${tile.w}" height="${tile.h}" rx="16" fill="${t.panel}" stroke="${t.border}"/>
  <g transform="translate(${tile.w / 2 - 14} 14) scale(${28 / 24})"><path d="${path}" fill="${color}"/></g>
  <text x="${tile.w / 2}" y="66" text-anchor="middle" font-size="12.5" fill="${t.muted}">${esc(labels[name] || name)}</text>
</g>`
    })
    return `<text x="0" y="${y + 46}" class="mono" font-size="12.5" letter-spacing="2" fill="${t.dim}">${esc(cat.toUpperCase())}</text>\n${tiles.join('\n')}`
  })
  const style = `
.tile{animation:pop .5s ease-out both}
@keyframes pop{from{opacity:0;transform-origin:center}to{opacity:1}}
.sweep{animation:sweep 6s ease-in-out 1.5s infinite both}
@keyframes sweep{from{transform:translateX(0)}55%,100%{transform:translateX(${W + 400}px)}}
`
  const shine = `<defs><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="${t.text}" stop-opacity="0"/><stop offset=".5" stop-color="${t.text}" stop-opacity=".07"/><stop offset="1" stop-color="${t.text}" stop-opacity="0"/></linearGradient></defs>
<g class="sweep"><rect x="-260" y="0" width="200" height="${H}" fill="url(#sh)" transform="skewX(-12)"/></g>`
  return wrap(W, H, body.join('\n') + '\n' + shine, style)
}

/* ------------------------------------------------------------ connect 4 */

const RED = '#ff4d6d'
const YEL = '#ffc93c'

/**
 * Connect Four board. Discs sit behind a board with holes cut out of it, so
 * the newest disc visibly drops down through the column.
 */
export function board(t, state, { title, sub, lastMove, win } = {}) {
  const cell = 64, cols = 7, rows = 6
  const bx = 36, by = 92
  const W = bx * 2 + cols * cell, H = by + rows * cell + 34
  const holes = []
  const discs = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = bx + c * cell + cell / 2
      const y = by + r * cell + cell / 2
      holes.push(`<circle cx="${x}" cy="${y}" r="25" fill="#000"/>`)
      const v = state.board[r][c]
      if (!v) continue
      const isLast = lastMove && lastMove.some((m) => m.r === r && m.c === c)
      const lastIdx = isLast ? lastMove.findIndex((m) => m.r === r && m.c === c) : 0
      const fill = v === 1 ? RED : YEL
      const drop = isLast
        ? ` class="drop" style="--d:${-(r + 1) * cell - 30}px;animation-delay:${lastIdx * 0.9}s"`
        : ''
      discs.push(`<g${drop}><circle cx="${x}" cy="${y}" r="26" fill="${fill}"/><circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="3"/></g>`)
    }
  }
  let winLine = ''
  if (win && win.length) {
    const p = win.map(([r, c]) => `${bx + c * cell + cell / 2},${by + r * cell + cell / 2}`).join(' ')
    winLine = `<polyline points="${p}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" class="win"/>`
  }
  const colNums = Array.from({ length: cols }, (_, c) =>
    `<text x="${bx + c * cell + cell / 2}" y="${by + rows * cell + 24}" text-anchor="middle" class="mono" font-size="13" fill="${t.dim}">${c + 1}</text>`).join('')
  const style = `
.drop{animation:drop .75s cubic-bezier(.45,0,.75,1.25) both}
@keyframes drop{from{transform:translateY(var(--d))}to{transform:none}}
.win{animation:win 1.2s ease-in-out infinite alternate}
@keyframes win{from{stroke-opacity:.35}to{stroke-opacity:.95}}
`
  const body = `
<defs>
  <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.board[0]}"/><stop offset="1" stop-color="${t.board[1]}"/></linearGradient>
  <mask id="holes"><rect x="${bx}" y="${by}" width="${cols * cell}" height="${rows * cell}" rx="18" fill="#fff"/>${holes.join('')}</mask>
  <clipPath id="well"><rect x="${bx}" y="0" width="${cols * cell}" height="${by + rows * cell}"/></clipPath>
</defs>
<text x="${W / 2}" y="34" text-anchor="middle" font-size="22" font-weight="700" fill="${t.text}">${esc(title || '')}</text>
<text x="${W / 2}" y="60" text-anchor="middle" font-size="14" fill="${t.muted}">${esc(sub || '')}</text>
<rect x="${bx}" y="${by}" width="${cols * cell}" height="${rows * cell}" rx="18" fill="${t.hole}"/>
<g clip-path="url(#well)">${discs.join('')}</g>
<rect x="${bx}" y="${by}" width="${cols * cell}" height="${rows * cell}" rx="18" fill="url(#bd)" mask="url(#holes)"/>
${winLine}
${colNums}
`
  return wrap(W, H, body, style)
}

/** One column button under the board. */
export function colButton(t, n) {
  const W = 64, H = 40
  const body = `<rect x="4" y="2" width="56" height="36" rx="12" fill="${t.panel}" stroke="${t.border}"/>
<text x="32" y="26" text-anchor="middle" font-size="15" font-weight="700" fill="${t.text}">↓ ${n}</text>`
  return wrap(W, H, body)
}

/* ------------------------------------------------------ contribution city */

/**
 * The last year of contributions as an isometric city. Every day is a tower
 * whose height is that day's count, and the city rises week by week.
 */
export function city(t, weeks, total) {
  const W = 1200, H = 470
  const s = 9.2
  const cos = Math.cos(Math.PI / 6), sin = Math.sin(Math.PI / 6)
  const max = Math.max(1, ...weeks.flat())
  const ox = 330, oy = 120
  const shades = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2']
  const cells = []
  weeks.forEach((days, w) => days.forEach((v, d) => cells.push({ w, d, v })))
  cells.sort((a, b) => a.w + a.d - (b.w + b.d) || a.w - b.w)
  const towers = cells.map(({ w, d, v }) => {
    const x = ox + (w - d) * cos * s
    const y = oy + (w + d) * sin * s
    const h = v ? 6 + (v / max) * 120 : 1.5
    const lvl = v ? Math.min(shades.length - 1, Math.ceil((v / max) * (shades.length - 1))) : -1
    const top = v ? shades[lvl] : t.panel2
    const left = v ? shade(top, -0.22) : t.border
    const right = v ? shade(top, -0.38) : t.panel
    const a = cos * s, b = sin * s
    const pTop = `${f(x)},${f(y - h)} ${f(x + a)},${f(y + b - h)} ${f(x)},${f(y + 2 * b - h)} ${f(x - a)},${f(y + b - h)}`
    const pL = `${f(x - a)},${f(y + b - h)} ${f(x)},${f(y + 2 * b - h)} ${f(x)},${f(y + 2 * b)} ${f(x - a)},${f(y + b)}`
    const pR = `${f(x)},${f(y + 2 * b - h)} ${f(x + a)},${f(y + b - h)} ${f(x + a)},${f(y + b)} ${f(x)},${f(y + 2 * b)}`
    return `<g class="tw" style="animation-delay:${f(w * 0.03)}s"><polygon points="${pL}" fill="${left}"/><polygon points="${pR}" fill="${right}"/><polygon points="${pTop}" fill="${top}"/></g>`
  })
  const style = `
.tw{animation:rise 1s cubic-bezier(.2,1,.3,1) both;transform-box:fill-box;transform-origin:50% 100%}
@keyframes rise{from{transform:scaleY(0);opacity:0}to{transform:none;opacity:1}}
`
  const body = `
<rect width="${W}" height="${H}" rx="22" fill="${t.panel}" stroke="${t.border}"/>
<text x="40" y="58" font-size="26" font-weight="800" fill="${t.text}">${total.toLocaleString('en-US')} contributions</text>
<text x="40" y="84" class="mono" font-size="13" letter-spacing="1.5" fill="${t.muted}">THE LAST 12 MONTHS, ONE TOWER PER DAY</text>
${towers.join('\n')}
`
  return wrap(W, H, body, style)
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v + v * amt))))
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}
