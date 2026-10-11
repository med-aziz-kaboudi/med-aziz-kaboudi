// Every image on the profile is drawn here as an animated SVG.
//
// GitHub shows README images through a proxy as plain <img>, so there is no
// JavaScript, no hover and no external fonts or images. What does work is CSS
// keyframes and SMIL inside the SVG, which is what all the motion below uses.
// Anything external (logos, screenshots) is embedded as a data URI.
//
// Randomness (stars, dot colours) comes from a seeded generator so the same
// input always draws the same file. Otherwise every daily build would produce
// new hashes and a pointless commit.

import { readFileSync } from 'node:fs'

export const THEMES = {
  dark: {
    name: 'dark', bg: '#0d1117', panel: '#151b24', panel2: '#1b2330', border: '#2a3240',
    text: '#f0f4fa', muted: '#8b949e', dim: '#6e7681', accent: '#2f81f7', accent2: '#79c0ff',
    chrome: ['#ffffff', '#c9d4e3', '#ffffff'], hole: '#0d1117', board: ['#1f6feb', '#1550b8'], dot: '#e6edf3',
  },
  light: {
    name: 'light', bg: '#ffffff', panel: '#f6f8fa', panel2: '#eef2f7', border: '#d0d7de',
    text: '#1f2328', muted: '#59636e', dim: '#818b98', accent: '#0969da', accent2: '#218bff',
    chrome: ['#0d1117', '#3b4656', '#0d1117'], hole: '#ffffff', board: ['#2f81f7', '#1b5fc4'], dot: '#24292f',
  },
}

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
const RED = '#ff4d6d'
const YEL = '#ffc93c'

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const f = (n) => Number(n.toFixed(2))
const dataUri = (path, mime) => `data:${mime};base64,${readFileSync(path).toString('base64')}`

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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

/* ------------------------------------------------------------------ icons */

// Hand-drawn line icons on a 24 grid, stroked rather than filled.
export const ICON = {
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 18.5h2',
  layers: 'M12 2.5 2.5 7.5 12 12.5l9.5-5z M2.5 12 12 17l9.5-5 M2.5 16.5 12 21.5l9.5-5',
  gamepad: 'M7.5 6h9a5 5 0 0 1 4.9 4l1 5.2a3 3 0 0 1-5 2.8L15.5 16h-7l-1.9 2a3 3 0 0 1-5-2.8l1-5.2A5 5 0 0 1 7.5 6z M7 10v4 M5 12h4 M15.5 11.5h.01 M18 13.5h.01',
  trophy: 'M7 3h10v6a5 5 0 0 1-10 0z M7 5H4a3 3 0 0 0 3 4 M17 5h3a3 3 0 0 1-3 4 M12 14v4 M8 21h8 M9.5 18h5v3h-5z',
  city: 'M3 21h18 M5 21V9l5-3v15 M10 21V4l9 4v13 M13.5 9.5h2 M13.5 13h2 M13.5 16.5h2 M7 12h.01 M7 15.5h.01',
  calendar: 'M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M8 3v4 M16 3v4 M3 10h18 M8 14h3 M8 17.5h6',
  rocket: 'M12 15l-3-3c1.6-4.6 4.6-8 10-9.5.5 5.4-3 8.4-7 10.5z M9 12H5l2.5-3.5H11 M12 15v4l3.5-2.5V13 M6.5 17.5c-1 .8-1.5 3-1.5 3s2.2-.5 3-1.5a1.4 1.4 0 0 0-1.5-1.5z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1 M16 3.5a4 4 0 0 1 0 7.5 M19 14.5a5.5 5.5 0 0 1 3 5V21',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z M5 19h14',
  bot: 'M5 9h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M12 5v4 M12 3.5h.01 M8.5 14h.01 M15.5 14h.01 M9.5 17.5h5',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7z',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 14l-1.5 8 5-3 5 3-1.5-8',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3.5 6.5 12 13l8.5-6.5',
  rock: 'M6.5 8 11 4.5l6 1.5 3.5 6-2.5 7H8.5L3.5 15z M11 4.5 12.5 11l5.5 1 M12.5 11 8.5 19',
  paper: 'M6 2.5h8.5L19 7v13.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z M14 2.5V7.5h5 M8.5 12h7 M8.5 15.5h7 M8.5 19h4',
  scissors: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 4 8.1 15.9 M14.5 14.5 20 20 M8.1 8.1 12 12',
}

const strokeIcon = (d, color, size, x, y, sw = 1.8) =>
  `<g transform="translate(${f(x)} ${f(y)}) scale(${f(size / 24)})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${f((sw * 24) / size)}" stroke-linecap="round" stroke-linejoin="round"/></g>`

const BRANDS = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url)))
const lum = (hex) => {
  const n = parseInt(hex, 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const brandIcon = (name, color, size, x, y) => {
  const ic = BRANDS[name]
  if (!ic) return ''
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(size / 24)})"><path d="${ic.path}" fill="${color}"/></g>`
}

/* ------------------------------------------------------------------ hero */

/**
 * Banner. A dot globe turns in real 3D (projected with CSS only), a second
 * ring of tech marks orbits inside it, the two products circle it as
 * satellites, cities ping on its surface, and stars and shooting stars move
 * behind. The name is one colour: chrome, with a light passing over it.
 *
 * The projection trick: a point on a sphere turning about the Y axis moves
 * sinusoidally on screen, and an ease-in-out keyframe played back and forth is
 * a close match for a sinusoid. Each latitude ring gets one horizontal and one
 * vertical keyframe, and every dot on it is the same animation with a phase
 * offset (a negative delay). Depth drives opacity, so the far side fades.
 */
export function hero(t, { name, eyebrow, roles, logos, inner }) {
  const W = 1200, H = 460
  const cx = 915, cy = 212, R = 138, tilt = 0.36
  const T = 10
  const rand = rng(7)
  const css = []
  const mod = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  // Outer shell of dots.
  const dots = []
  const rings = []
  for (let lat = -78; lat <= 78; lat += 12) rings.push(lat)
  rings.forEach((lat, k) => {
    const phi = (lat * Math.PI) / 180
    const r = R * Math.cos(phi)
    const y0 = -R * Math.sin(phi) * Math.cos(tilt)
    const dy = r * Math.sin(tilt)
    css.push(`@keyframes x${k}{from{transform:translateX(${f(-r)}px)}to{transform:translateX(${f(r)}px)}}@keyframes y${k}{from{transform:translateY(${f(-dy)}px)}to{transform:translateY(${f(dy)}px)}}.x${k}{animation:x${k} ${T}s ease-in-out infinite alternate}.y${k}{animation:y${k} ${T}s ease-in-out infinite alternate}`)
    const n = Math.max(5, Math.round(30 * Math.cos(phi)))
    for (let i = 0; i < n; i++) {
      const th = (2 * Math.PI * i) / n + k * 0.31
      // x = r sin(th + wt) matches -r cos(w(t + dX)) when w*dX = th + pi/2,
      // and z = r cos(th + wt) matches it when w*dZ = th + pi.
      const dX = (mod(th + Math.PI / 2) / Math.PI) * T
      const dZ = (mod(th + Math.PI) / Math.PI) * T
      const cls = rand() < 0.16 ? 'ac' : 'dt'
      dots.push(`<g transform="translate(${cx} ${f(cy + y0)})"><g class="x${k}" style="animation-delay:-${f(dX)}s"><g class="y${k}" style="animation-delay:-${f(dZ)}s"><circle r="2.2" class="dp ${cls}" style="animation-delay:-${f(dZ)}s"/></g></g></g>`)
    }
  })

  // Inner ring: tech marks orbiting inside the shell, same projection.
  const Ri = R * 0.6, Ti = T * 0.8
  css.push(`@keyframes ix{from{transform:translateX(${f(-Ri)}px)}to{transform:translateX(${f(Ri)}px)}}@keyframes iy{from{transform:translateY(${f(-Ri * Math.sin(tilt))}px)}to{transform:translateY(${f(Ri * Math.sin(tilt))}px)}}.ix{animation:ix ${Ti}s ease-in-out infinite alternate}.iy{animation:iy ${Ti}s ease-in-out infinite alternate}`)
  const innerMarks = inner.map((nm, i) => {
    const th = (2 * Math.PI * i) / inner.length
    const dX = (mod(th + Math.PI / 2) / Math.PI) * Ti
    const dZ = (mod(th + Math.PI) / Math.PI) * Ti
    return `<g transform="translate(${cx} ${cy})"><g class="ix" style="animation-delay:-${f(dX)}s"><g class="iy" style="animation-delay:-${f(dZ)}s"><g class="dpi" style="animation-delay:-${f(dZ)}s">${brandIcon(nm, t.accent2, 20, -10, -10)}</g></g></g></g>`
  }).join('\n')

  // Cities pinging on the visible face.
  const pings = [[-60, -40], [35, -78], [72, 20], [-20, 55], [10, -5], [-95, 18]].map(([dx, dy], i) =>
    `<circle cx="${cx + dx}" cy="${cy + dy}" r="3" fill="${t.accent2}" class="ping" style="animation-delay:${f(i * 0.9)}s"/><circle cx="${cx + dx}" cy="${cy + dy}" r="2" fill="${t.accent2}" class="pdot" style="animation-delay:${f(i * 0.9)}s"/>`
  ).join('')

  // Sky.
  const stars = Array.from({ length: 70 }, () => {
    const x = f(rand() * W), y = f(rand() * 340), r = f(0.4 + rand() * 1.1)
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${t.dot}" class="tw" style="animation-delay:-${f(rand() * 5)}s;animation-duration:${f(3 + rand() * 4)}s"/>`
  }).join('')
  const shooting = [0, 1].map((i) => `<line x1="0" y1="0" x2="90" y2="0" stroke="url(#trail)" stroke-width="1.6" stroke-linecap="round" class="shoot" style="animation-delay:${3 + i * 5.5}s"/>`).join('')

  // Grid floor: fixed rays, and horizontal lines that accelerate toward the
  // viewer, which is what perspective does to them.
  const horizon = 352
  const rays = []
  for (let i = -24; i <= 24; i++) rays.push(`<line x1="${600 + i * 22}" y1="${horizon}" x2="${600 + i * 150}" y2="${H}"/>`)
  const flow = Array.from({ length: 7 }, (_, i) =>
    `<line class="fl" x1="0" x2="${W}" y1="0" y2="0" style="animation-delay:-${f(i * 0.5)}s"/>`).join('')

  const cycle = roles.length * 3
  const pct = 100 / roles.length
  const roleCss = roles.map((_, i) => `.r${i}{animation:role ${cycle}s linear ${i * 3}s infinite;opacity:0}`).join('')

  const sats = logos.map((src, i) =>
    `<g><animateMotion dur="9s" begin="-${f(i * 4.5)}s" repeatCount="indefinite"><mpath href="#orbit"/></animateMotion><circle r="19" fill="${t.panel}" stroke="${t.border}"/><image href="${src}" x="-13" y="-13" width="26" height="26"/></g>`
  ).join('')

  const style = `
${css.join('\n')}
.dp{animation:depth ${T}s ease-in-out infinite alternate}
.dpi{animation:depth ${Ti}s ease-in-out infinite alternate}
@keyframes depth{from{opacity:.08}to{opacity:1}}
.dt{fill:${t.dot}}.ac{fill:${t.accent2}}
.ping{animation:ping 5.4s ease-out infinite;transform-box:fill-box;transform-origin:center;opacity:0}
@keyframes ping{0%{transform:scale(1);opacity:.9}20%{transform:scale(6);opacity:0}100%{opacity:0}}
.pdot{animation:pdot 5.4s ease-out infinite;opacity:0}
@keyframes pdot{0%,22%{opacity:1}35%,100%{opacity:0}}
.tw{animation:tw 4s ease-in-out infinite alternate}
@keyframes tw{from{opacity:.08}to{opacity:.7}}
.shoot{animation:shoot 11s linear infinite;opacity:0}
@keyframes shoot{0%{transform:translate(180px,20px) rotate(18deg);opacity:0}2%{opacity:1}9%{transform:translate(620px,160px) rotate(18deg);opacity:0}100%{opacity:0}}
.fl{animation:flow 3.5s cubic-bezier(.55,0,1,.6) infinite}
@keyframes flow{from{transform:translateY(${horizon}px);opacity:0}25%{opacity:.5}to{transform:translateY(${H}px);opacity:.9}}
@keyframes role{0%{opacity:0;transform:translateY(10px)}3%{opacity:1;transform:none}${f(pct - 3)}%{opacity:1;transform:none}${f(pct)}%{opacity:0;transform:translateY(-8px)}100%{opacity:0}}
${roleCss}
.reveal{animation:reveal 1.2s cubic-bezier(.16,1,.3,1) both}
.reveal2{animation:reveal 1.2s cubic-bezier(.16,1,.3,1) .2s both}
.eb{animation:reveal 1s ease .05s both}
@keyframes reveal{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.core{animation:core 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes core{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
.scan{animation:scan 6s ease-in-out infinite}
@keyframes scan{0%{transform:translateY(${cy - R}px);opacity:0}10%{opacity:.6}50%{transform:translateY(${cy + R}px);opacity:.6}60%,100%{opacity:0;transform:translateY(${cy + R}px)}}
`

  const nameText = (txt, y, cls, fill) =>
    `<text x="68" y="${y}" font-size="74" font-weight="900" letter-spacing="-2.6" fill="${fill}" class="${cls}">${esc(txt)}</text>`

  const body = `
<defs>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <clipPath id="ball"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
  <radialGradient id="g1" cx="76%" cy="44%" r="45%"><stop offset="0" stop-color="${t.accent}" stop-opacity=".3"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="8%" cy="0%" r="55%"><stop offset="0" stop-color="${t.accent}" stop-opacity=".12"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bg}" stop-opacity="1"/><stop offset=".55" stop-color="${t.bg}" stop-opacity="0"/></linearGradient>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.chrome[0]}"/><stop offset=".55" stop-color="${t.chrome[1]}"/><stop offset="1" stop-color="${t.chrome[2]}"/></linearGradient>
  <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-400" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="${t.name === 'dark' ? '#ffffff' : t.accent}" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1400 0;1400 0" keyTimes="0;.45;1" dur="6s" begin="1.2s" repeatCount="indefinite"/>
  </linearGradient>
  <filter id="glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
  <radialGradient id="coreG"><stop offset="0" stop-color="${t.accent2}" stop-opacity=".45"/><stop offset=".6" stop-color="${t.accent}" stop-opacity=".12"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="${t.dot}" stop-opacity="0"/><stop offset="1" stop-color="${t.dot}" stop-opacity=".9"/></linearGradient>
  <linearGradient id="scanG" x1="0" x2="1"><stop offset="0" stop-color="${t.accent2}" stop-opacity="0"/><stop offset=".5" stop-color="${t.accent2}" stop-opacity=".9"/><stop offset="1" stop-color="${t.accent2}" stop-opacity="0"/></linearGradient>
  <path id="orbit" d="M ${cx - 215} ${cy} a 215 58 0 1 0 430 0 a 215 58 0 1 0 -430 0"/>
</defs>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/><rect width="${W}" height="${H}" fill="url(#g2)"/>
  ${stars}
  ${shooting}
  <g stroke="${t.accent}" stroke-opacity=".26">${rays.join('')}</g>
  <g stroke="${t.accent}" stroke-width="1.2">${flow}</g>
  <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#floorFade)"/>
  <line x1="0" x2="${W}" y1="${horizon}" y2="${horizon}" stroke="${t.accent}" stroke-opacity=".5"/>

  <circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="url(#coreG)" class="core"/>
  <g fill="none" stroke="${t.accent}" stroke-opacity=".22">${rings.filter((_, i) => i % 2 === 0).map((lat) => {
    const phi = (lat * Math.PI) / 180, r = R * Math.cos(phi)
    return `<ellipse cx="${cx}" cy="${f(cy - R * Math.sin(phi) * Math.cos(tilt))}" rx="${f(r)}" ry="${f(r * Math.sin(tilt))}"/>`
  }).join('')}<circle cx="${cx}" cy="${cy}" r="${R}" stroke-opacity=".4"/></g>
  ${innerMarks}
  ${dots.join('\n  ')}
  <g clip-path="url(#ball)"><rect x="${cx - R}" y="0" width="${2 * R}" height="2" fill="url(#scanG)" class="scan"/></g>
  ${pings}
  <g transform="rotate(-14 ${cx} ${cy})">
    <use href="#orbit" fill="none" stroke="${t.accent2}" stroke-opacity=".35" stroke-dasharray="2 8"/>
    ${sats}
  </g>

  <text x="70" y="112" class="mono eb" font-size="15" letter-spacing="5" fill="${t.muted}">${esc(eyebrow)}</text>
  <g filter="url(#glow)" opacity="${t.name === 'dark' ? '.55' : '.25'}">
    ${nameText(name[0], 192, 'reveal', t.accent)}
    ${nameText(name[1], 270, 'reveal2', t.accent)}
  </g>
  ${nameText(name[0], 192, 'reveal', 'url(#chrome)')}
  ${nameText(name[1], 270, 'reveal2', 'url(#chrome)')}
  ${nameText(name[0], 192, 'reveal', 'url(#shine)')}
  ${nameText(name[1], 270, 'reveal2', 'url(#shine)')}
  <g class="mono" font-size="21" fill="${t.text}">
    <text x="72" y="326" fill="${t.accent2}">❯</text>
    ${roles.map((r, i) => `<text x="100" y="326" class="r${i}">${esc(r)}<tspan fill="${t.accent2}">▍<animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></tspan></text>`).join('\n    ')}
  </g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="none" stroke="${t.border}"/>
`
  return wrap(W, H, body, style)
}

/* -------------------------------------------------------- section header */

/** Section title with a custom icon and a light running along its rule. */
export function header(t, icon, title, sub) {
  const W = 1200, H = 92
  const style = `
.run{animation:run 4.5s cubic-bezier(.6,0,.4,1) infinite}
@keyframes run{from{transform:translateX(0);opacity:0}10%{opacity:1}80%{opacity:1}to{transform:translateX(${W - 300}px);opacity:0}}
.in{animation:in .8s cubic-bezier(.16,1,.3,1) both}
@keyframes in{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
`
  const body = `
<defs>
  <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.accent2}"/><stop offset="1" stop-color="${t.accent}"/></linearGradient>
  <linearGradient id="ray" x1="0" x2="1"><stop offset="0" stop-color="${t.accent2}" stop-opacity="0"/><stop offset=".5" stop-color="${t.accent2}"/><stop offset="1" stop-color="${t.accent2}" stop-opacity="0"/></linearGradient>
</defs>
<g class="in">
  <rect x="2" y="16" width="56" height="56" rx="16" fill="url(#tile)"/>
  <rect x="2" y="16" width="56" height="56" rx="16" fill="none" stroke="#fff" stroke-opacity=".25"/>
  ${strokeIcon(ICON[icon], '#ffffff', 30, 15, 29, 2.2)}
  <text x="80" y="${sub ? 46 : 56}" font-size="32" font-weight="800" letter-spacing="-.8" fill="${t.text}">${esc(title)}</text>
  ${sub ? `<text x="81" y="70" class="mono" font-size="13" letter-spacing="1.6" fill="${t.muted}">${esc(sub)}</text>` : ''}
</g>
<rect x="80" y="86" width="${W - 82}" height="1" fill="${t.border}"/>
<rect x="80" y="85" width="220" height="3" rx="1.5" fill="url(#ray)" class="run"/>
`
  return wrap(W, H, body, style)
}

/* --------------------------------------------------------------- buttons */

/** A link button: brand mark or line icon plus a label. */
export function button(t, { label, brand, icon, color, w }) {
  const W = w || Math.round(72 + label.length * 9.4), H = 50
  const c = color || t.accent2
  const mark = brand === 'LinkedIn'
    ? `<rect x="18" y="13" width="24" height="24" rx="5" fill="${c}"/><text x="30" y="31" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">in</text>`
    : brand
      ? brandIcon(brand, c, 22, 19, 14)
      : strokeIcon(ICON[icon], c, 22, 19, 14, 2)
  const style = `
.sh{animation:sh 5s ease-in-out 1s infinite}
@keyframes sh{from{transform:translateX(-120px)}40%,100%{transform:translateX(${W + 40}px)}}
`
  const body = `
<defs><clipPath id="b"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14"/></clipPath>
<linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset=".5" stop-color="${c}" stop-opacity=".2"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${t.panel}" stroke="${t.border}"/>
<g clip-path="url(#b)"><g class="sh"><rect x="0" y="0" width="90" height="${H}" fill="url(#s)" transform="skewX(-15)"/></g></g>
${mark}
<text x="52" y="31" font-size="15" font-weight="700" letter-spacing=".2" fill="${t.text}">${esc(label)}</text>
`
  return wrap(W, H, body, style)
}

/* ------------------------------------------------------------- products */

/** A product card: logo, pitch, live badge, site, and the app in a phone. */
export function productCard(t, p, root) {
  const W = 600, H = 340
  const logo = dataUri(`${root}/assets/${p.key}-logo-128.png`, 'image/png')
  const shot = dataUri(`${root}/assets/shots/${p.key}.jpg`, 'image/jpeg')
  const per = 2 * (W - 2 + H - 2)
  const [c1, c2] = p.colors
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
  <text x="264" y="272" font-size="14" font-weight="600" fill="${t.muted}">${esc(p.site)} ↗</text>
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

/* ---------------------------------------------------------------- tiles */

/**
 * A row of number tiles. Numbers roll into place like an odometer, a line
 * icon sits in a lit badge, and a bar charges up underneath.
 */
export function tiles(t, items, { H = 196 } = {}) {
  const W = 1200, gap = 16
  const tw = (W - gap * (items.length - 1)) / items.length
  const fs = items.length > 4 ? 52 : 60, lh = fs * 1.2, adv = fs * 0.62
  const css = []
  let col = 0
  const out = items.map((it, i) => {
    const x = i * (tw + gap)
    const chars = String(it.value).split('')
    const glyphs = chars.map((ch, j) => {
      const gx = 28 + j * adv
      if (!/\d/.test(ch)) return `<text x="${f(gx)}" y="138" font-size="${fs}" font-weight="900" fill="${t.accent2}" class="late">${esc(ch)}</text>`
      const d = Number(ch)
      const seq = [...'0123456789', ...'0123456789'.slice(0, d + 1)]
      const k = col++
      css.push(`@keyframes o${k}{to{transform:translateY(-${f((seq.length - 1) * lh)}px)}}.o${k}{animation:o${k} ${f(2 + j * 0.3 + i * 0.12)}s cubic-bezier(.15,.85,.25,1) ${f(0.2 + i * 0.1)}s both}`)
      return `<g class="o${k}">${seq.map((s, n) => `<text x="${f(gx)}" y="${f(138 + n * lh)}" font-size="${fs}" font-weight="900" fill="${t.text}">${s}</text>`).join('')}</g>`
    })
    return `<g transform="translate(${f(x)} 0)">
  <rect x=".5" y=".5" width="${f(tw - 1)}" height="${H - 1}" rx="20" fill="${t.panel}" stroke="${t.border}"/>
  <rect x=".5" y=".5" width="${f(tw - 1)}" height="${H - 1}" rx="20" fill="url(#dots)"/>
  <rect x=".5" y=".5" width="${f(tw - 1)}" height="${H - 1}" rx="20" fill="url(#corner)"/>
  <rect x="24" y="22" width="40" height="40" rx="12" fill="${t.accent}" fill-opacity=".14" stroke="${t.accent}" stroke-opacity=".4"/>
  ${strokeIcon(ICON[it.icon], t.accent2, 22, 33, 31, 2)}
  <g clip-path="url(#band)">${glyphs.join('')}</g>
  <text x="28" y="${H - 34}" class="mono" font-size="11.5" letter-spacing="2" fill="${t.muted}">${esc(it.label)}</text>
  <rect x="28" y="${H - 20}" width="${f(tw - 56)}" height="3" rx="1.5" fill="${t.border}"/>
  <rect x="28" y="${H - 20}" width="${f(tw - 56)}" height="3" rx="1.5" fill="url(#bar)" class="charge" style="animation-delay:${f(0.4 + i * 0.15)}s"/>
</g>`
  })
  const style = `
${css.join('\n')}
text{font-variant-numeric:tabular-nums}
.late{animation:late .6s ease 1.6s both}
@keyframes late{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.charge{animation:charge 2.2s cubic-bezier(.2,.8,.2,1) both;transform-box:fill-box;transform-origin:left}
@keyframes charge{from{transform:scaleX(0)}to{transform:scaleX(1)}}
`
  const body = `<defs>
<clipPath id="band"><rect x="0" y="${f(138 - fs * 1.05)}" width="${f(tw)}" height="${f(fs * 1.3)}"/></clipPath>
<pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${t.text}" fill-opacity=".05"/></pattern>
<radialGradient id="corner" cx="100%" cy="0%" r="70%"><stop offset="0" stop-color="${t.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>
</defs>
${out.join('\n')}`
  return wrap(W, H, body, style)
}

/* ---------------------------------------------------------------- stack */

const SPARK = 'M12 0c.6 5.6 6.4 11.4 12 12-5.6.6-11.4 6.4-12 12-.6-5.6-6.4-11.4-12-12C5.6 11.4 11.4 5.6 12 0z'

/** Logo wall, one row per area, tiles popping in and a light sweeping over. */
export function stack(t, rows, labels) {
  const W = 1200, rowH = 96, top = 18
  const H = top + rows.length * rowH + 6
  const tile = { w: 128, h: 80, gap: 12 }
  let n = 0
  const body = rows.map(([cat, items], r) => {
    const y = top + r * rowH
    const tilesSvg = items.map((name, i) => {
      const x = 178 + i * (tile.w + tile.gap)
      const ic = BRANDS[name]
      let color = ic ? `#${ic.hex}` : t.accent2
      if (ic && t.name === 'dark' && lum(ic.hex) < 0.06) color = t.text
      if (ic && t.name === 'light' && lum(ic.hex) > 0.75) color = '#3d4450'
      const k = n++
      return `<g class="tile" style="animation-delay:${f(k * 0.018)}s" transform="translate(${x} ${y})">
  <rect width="${tile.w}" height="${tile.h}" rx="16" fill="${t.panel}" stroke="${t.border}"/>
  <g transform="translate(${tile.w / 2 - 14} 14) scale(${28 / 24})"><path d="${ic ? ic.path : SPARK}" fill="${color}"/></g>
  <text x="${tile.w / 2}" y="66" text-anchor="middle" font-size="12.5" fill="${t.muted}">${esc(labels[name] || name)}</text>
</g>`
    })
    return `<text x="0" y="${y + 46}" class="mono" font-size="12.5" letter-spacing="2" fill="${t.dim}">${esc(cat.toUpperCase())}</text>\n${tilesSvg.join('\n')}`
  })
  const style = `
.tile{animation:pop .5s ease-out both}
@keyframes pop{from{opacity:0}to{opacity:1}}
.sweep{animation:sweep 6s ease-in-out 1.5s infinite both}
@keyframes sweep{from{transform:translateX(0)}55%,100%{transform:translateX(${W + 400}px)}}
`
  const shine = `<defs><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="${t.text}" stop-opacity="0"/><stop offset=".5" stop-color="${t.text}" stop-opacity=".07"/><stop offset="1" stop-color="${t.text}" stop-opacity="0"/></linearGradient></defs>
<g class="sweep"><rect x="-260" y="0" width="200" height="${H}" fill="url(#sh)" transform="skewX(-12)"/></g>`
  return wrap(W, H, body.join('\n') + '\n' + shine, style)
}

/* ---------------------------------------------------------------- arcade */

/** Title strip above each game: name, status line, and who is who. */
export function gameBar(t, { title, status, legend, w = 600 }) {
  const W = w, H = legend ? 96 : 74
  const body = `
<text x="${W / 2}" y="32" text-anchor="middle" font-size="24" font-weight="800" letter-spacing="-.4" fill="${t.text}">${esc(title)}</text>
<text x="${W / 2}" y="58" text-anchor="middle" font-size="14" fill="${t.muted}">${esc(status)}</text>
${legend ? `<g transform="translate(${W / 2} 86)" font-size="12" class="mono" fill="${t.dim}">${legend}</g>` : ''}
`
  return wrap(W, H, body)
}

export const c4Legend = () =>
  `<circle cx="-86" cy="-4" r="6" fill="${RED}"/><text x="-74" y="0">YOU</text><circle cx="6" cy="-4" r="6" fill="${YEL}"/><text x="18" y="0">MY BOT</text>`
export const tttLegend = (t) =>
  `<text x="-86" y="0" fill="${t.accent2}" font-weight="800">X</text><text x="-72" y="0">YOU</text><text x="6" y="0" fill="${YEL}" font-weight="800">O</text><text x="20" y="0">MY BOT</text>`

/**
 * One clickable column of the Connect Four board. Seven of these sit side by
 * side in the README, each wrapped in its own link, so a visitor clicks the
 * board itself to drop a disc. Discs sit behind a board with holes cut out of
 * it, so the newest disc visibly drops down through its column.
 */
export function c4Column(t, board, c, { lastMove = [] } = {}) {
  const cell = 50, rows = 6, cap = 40
  const W = cell, H = cap + rows * cell + 8
  const discs = []
  const holes = []
  for (let r = 0; r < rows; r++) {
    const y = cap + r * cell + cell / 2
    holes.push(`<circle cx="${cell / 2}" cy="${y}" r="19" fill="#000"/>`)
    const v = board[r][c]
    if (!v) continue
    const li = lastMove.findIndex((m) => m.r === r && m.c === c)
    const drop = li >= 0 ? ` class="drop" style="--d:${-(r + 1) * cell - 10}px;animation-delay:${li * 0.9}s"` : ''
    discs.push(`<g${drop}><circle cx="${cell / 2}" cy="${y}" r="20" fill="${v === 1 ? RED : YEL}"/><circle cx="${cell / 2}" cy="${y}" r="13" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2.5"/></g>`)
  }
  const full = board[0][c] !== 0
  const style = `
.drop{animation:drop .75s cubic-bezier(.45,0,.75,1.25) both}
@keyframes drop{from{transform:translateY(var(--d))}to{transform:none}}
.bob{animation:bob 1.6s ease-in-out ${f(c * 0.12)}s infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
`
  // Only the outer columns get rounded corners, so seven images read as one board.
  const bx = c === 0 ? 0 : -30
  const bw = c === 0 || c === 6 ? cell + 30 : cell + 60
  const body = `
<defs>
  <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.board[0]}"/><stop offset="1" stop-color="${t.board[1]}"/></linearGradient>
  <clipPath id="frame"><rect x="${bx}" y="${cap}" width="${bw}" height="${rows * cell + 8}" rx="16"/></clipPath>
  <mask id="holes"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>${holes.join('')}</mask>
</defs>
<g class="bob" opacity="${full ? '.25' : '1'}">
  <rect x="7" y="6" width="36" height="26" rx="9" fill="${t.panel}" stroke="${t.border}"/>
  <path d="M19 15l6 6 6-6" fill="none" stroke="${full ? t.dim : RED}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g clip-path="url(#frame)">
  <rect x="0" y="${cap}" width="${W}" height="${rows * cell + 8}" fill="${t.hole}"/>
  ${discs.join('')}
  <rect x="0" y="${cap}" width="${W}" height="${rows * cell + 8}" fill="url(#bd)" mask="url(#holes)"/>
</g>
`
  return wrap(W, H, body, style)
}

/** The whole Connect Four board in one image, for replies and the last game. */
export function c4Board(t, board, { title, sub, win } = {}) {
  const cell = 56, bx = 24, by = title ? 74 : 16
  const W = bx * 2 + 7 * cell, H = by + 6 * cell + 24
  const holes = [], discs = []
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const x = bx + c * cell + cell / 2, y = by + r * cell + cell / 2
    holes.push(`<circle cx="${x}" cy="${y}" r="22" fill="#000"/>`)
    const v = board[r][c]
    if (v) discs.push(`<circle cx="${x}" cy="${y}" r="23" fill="${v === 1 ? RED : YEL}"/>`)
  }
  const line = win && win.length
    ? `<polyline points="${win.map(([r, c]) => `${bx + c * cell + cell / 2},${by + r * cell + cell / 2}`).join(' ')}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".9"/>`
    : ''
  const body = `
<defs><linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.board[0]}"/><stop offset="1" stop-color="${t.board[1]}"/></linearGradient>
<mask id="holes"><rect x="${bx}" y="${by}" width="${7 * cell}" height="${6 * cell}" rx="16" fill="#fff"/>${holes.join('')}</mask></defs>
${title ? `<text x="${W / 2}" y="32" text-anchor="middle" font-size="20" font-weight="800" fill="${t.text}">${esc(title)}</text><text x="${W / 2}" y="56" text-anchor="middle" font-size="13" fill="${t.muted}">${esc(sub || '')}</text>` : ''}
<rect x="${bx}" y="${by}" width="${7 * cell}" height="${6 * cell}" rx="16" fill="${t.hole}"/>
${discs.join('')}
<rect x="${bx}" y="${by}" width="${7 * cell}" height="${6 * cell}" rx="16" fill="url(#bd)" mask="url(#holes)"/>
${line}
`
  return wrap(W, H, body)
}

const X_MARK = (s, color, fresh) =>
  `<path d="M${s * 0.3} ${s * 0.3} L${s * 0.7} ${s * 0.7} M${s * 0.7} ${s * 0.3} L${s * 0.3} ${s * 0.7}" stroke="${color}" stroke-width="${f(s * 0.09)}" stroke-linecap="round" fill="none"${fresh ? ' pathLength="1" stroke-dasharray="1" class="ink"' : ''}/>`
const O_MARK = (s, color, fresh) =>
  `<circle cx="${s / 2}" cy="${s / 2}" r="${f(s * 0.22)}" stroke="${color}" stroke-width="${f(s * 0.09)}" fill="none"${fresh ? ' pathLength="1" stroke-dasharray="1" class="ink"' : ''}/>`

/** One clickable square of the Tic-Tac-Toe board. */
export function tttCell(t, v, { fresh = false, delay = 0 } = {}) {
  const s = 104
  const style = `
.ink{animation:ink .5s ease-out ${delay}s both}
@keyframes ink{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.empty{animation:breathe 2.6s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.25}50%{opacity:.7}}
`
  const mark = v === 1 ? X_MARK(s, t.accent2, fresh) : v === 2 ? O_MARK(s, YEL, fresh) : `<circle cx="${s / 2}" cy="${s / 2}" r="4" fill="${t.dim}" class="empty"/>`
  const body = `<rect x="4" y="4" width="${s - 8}" height="${s - 8}" rx="18" fill="${t.panel}" stroke="${t.border}"/>${mark}`
  return wrap(s, s, body, style)
}

/** The whole Tic-Tac-Toe board in one image, for replies and the last game. */
export function tttBoard(t, board, { title, sub, win } = {}) {
  const s = 92, top = title ? 70 : 10, W = s * 3 + 20, H = top + s * 3 + 10
  const cells = board.map((v, i) => {
    const x = 10 + (i % 3) * s, y = top + Math.floor(i / 3) * s
    const w = win && win.includes(i)
    const mark = v === 1 ? X_MARK(s, t.accent2) : v === 2 ? O_MARK(s, YEL) : ''
    return `<g transform="translate(${x} ${y})"><rect x="3" y="3" width="${s - 6}" height="${s - 6}" rx="14" fill="${w ? t.panel2 : t.panel}" stroke="${w ? t.accent2 : t.border}" stroke-width="${w ? 2.5 : 1}"/>${mark}</g>`
  }).join('')
  const head = title ? `<text x="${W / 2}" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="${t.text}">${esc(title)}</text><text x="${W / 2}" y="52" text-anchor="middle" font-size="13" fill="${t.muted}">${esc(sub || '')}</text>` : ''
  return wrap(W, H, head + cells)
}

/** Rock, paper or scissors: a big clickable tile. */
export function rpsButton(t, throwName, i) {
  const S = 150
  const style = `
.hand{animation:hand 2.4s ease-in-out ${f(i * 0.25)}s infinite;transform-box:fill-box;transform-origin:center}
@keyframes hand{0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-4px)}}
`
  const body = `
<defs><radialGradient id="g" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="${t.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient></defs>
<rect x="4" y="4" width="${S - 8}" height="${S - 8}" rx="24" fill="${t.panel}" stroke="${t.border}"/>
<rect x="4" y="4" width="${S - 8}" height="${S - 8}" rx="24" fill="url(#g)"/>
<g class="hand">${strokeIcon(ICON[throwName], t.accent2, 56, 47, 26, 1.8)}</g>
<text x="${S / 2}" y="118" text-anchor="middle" font-size="14" font-weight="800" letter-spacing="2" fill="${t.text}">${throwName.toUpperCase()}</text>
`
  return wrap(S, S, body, style)
}

/** The last rock-paper-scissors round, and what the bot has learned. */
export function rpsLast(t, g) {
  const W = 600, H = 150
  const l = g.last
  const verdict = !l ? 'No rounds yet. Throw first.'
    : l.result === 'human' ? `@${l.login} beat the bot`
      : l.result === 'bot' ? `The bot beat @${l.login}` : `@${l.login} drew with the bot`
  const fav = ['rock', 'paper', 'scissors'].reduce((a, b) => ((g.throws[b] || 0) > (g.throws[a] || 0) ? b : a))
  const tx = l ? 262 : 36
  const chip = (x, name, color, label) => `<g transform="translate(${x} 22)">
  <rect width="78" height="78" rx="18" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-opacity=".45"/>
  ${strokeIcon(ICON[name], color, 44, 17, 17, 1.8)}
  <text x="39" y="100" text-anchor="middle" class="mono" font-size="10.5" letter-spacing="1.5" fill="${t.muted}">${label}</text>
</g>`
  const body = `
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.panel}" stroke="${t.border}"/>
${l ? `${chip(32, l.you, t.accent2, 'VISITOR')}<text x="129" y="68" text-anchor="middle" font-size="14" font-weight="800" fill="${t.dim}">VS</text>${chip(148, l.bot, YEL, 'MY BOT')}` : ''}
<text x="${tx}" y="56" font-size="19" font-weight="800" fill="${t.text}">${esc(verdict)}</text>
<text x="${tx}" y="84" font-size="14" fill="${t.muted}">Humans ${g.results.human} · Bot ${g.results.bot} · Draws ${g.results.draw}</text>
<text x="${tx}" y="114" class="mono" font-size="11" letter-spacing="1" fill="${t.dim}">${g.rounds >= 3 ? `CROWD FAVOURITE: ${fav.toUpperCase()}. THE BOT KNOWS.` : 'THE BOT LEARNS FROM EVERY THROW.'}</text>
`
  return wrap(W, H, body)
}

/* ---------------------------------------------------------- achievements */

/** Hackathon placings with drawn medals, and certifications. */
export function awards(t, hackathons, certs) {
  const W = 1200, rowH = 64
  const H = 40 + Math.max(hackathons.length, certs.length) * rowH
  const medal = (place) => {
    const p = place.toLowerCase()
    if (p.startsWith('1')) return ['#f5c451', '1ST']
    if (p.startsWith('2')) return ['#c0c8d4', '2ND']
    if (p.startsWith('3')) return ['#d08a4b', '3RD']
    if (p.startsWith('4')) return [t.accent2, '4TH']
    return [t.dim, 'IN']
  }
  const left = hackathons.map(([place, name, what], i) => {
    const [c, txt] = medal(place)
    return `<g class="row" style="animation-delay:${f(i * 0.08)}s" transform="translate(0 ${40 + i * rowH})">
  <circle cx="24" cy="22" r="22" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2"/>
  <text x="24" y="27" text-anchor="middle" font-size="11.5" font-weight="800" fill="${c}">${txt}</text>
  <text x="62" y="18" font-size="17" font-weight="700" fill="${t.text}">${esc(name)}</text>
  <text x="62" y="40" font-size="13.5" fill="${t.muted}">${esc(what)}</text>
</g>`
  }).join('\n')
  const right = certs.map(([issuer, name, year], i) =>
    `<g class="row" style="animation-delay:${f(0.3 + i * 0.08)}s" transform="translate(640 ${40 + i * rowH})">
  <rect x="0" y="0" width="44" height="44" rx="12" fill="${t.accent}" fill-opacity=".12" stroke="${t.accent}" stroke-opacity=".4"/>
  ${strokeIcon(ICON.award, t.accent2, 24, 10, 10, 1.8)}
  <text x="60" y="18" font-size="16" font-weight="700" fill="${t.text}">${esc(name)}</text>
  <text x="60" y="40" class="mono" font-size="12" letter-spacing="1" fill="${t.muted}">${esc(issuer.toUpperCase())} · ${esc(year)}</text>
</g>`).join('\n')
  const style = `.row{animation:row .7s cubic-bezier(.16,1,.3,1) both}@keyframes row{from{opacity:0}to{opacity:1}}`
  const body = `
<text x="0" y="16" class="mono" font-size="12.5" letter-spacing="2" fill="${t.dim}">HACKATHONS</text>
<text x="640" y="16" class="mono" font-size="12.5" letter-spacing="2" fill="${t.dim}">CERTIFICATIONS</text>
${left}
${right}`
  return wrap(W, H, body, style)
}

/* ------------------------------------------------------ contribution city */

/** The last year of contributions as an isometric city, rising week by week. */
export function city(t, weeks, total) {
  const W = 1200, H = 470
  const s = 9.2
  const cos = Math.cos(Math.PI / 6), sin = Math.sin(Math.PI / 6)
  const max = Math.max(1, ...weeks.flat())
  const ox = 330, oy = 120
  const shades = ['#0b3d91', '#1158c7', '#1f6feb', '#388bfd', '#58a6ff', '#79c0ff']
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
