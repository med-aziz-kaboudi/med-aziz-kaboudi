// Pulls the public contribution calendar into data/stats.json. Runs in the
// daily workflow with the workflow's own token; nothing else is needed.

import { writeFileSync } from 'node:fs'
import { USER } from '../data/profile.mjs'

const token = process.env.GITHUB_TOKEN
if (!token) throw new Error('GITHUB_TOKEN is required')

const query = `query($login:String!){ user(login:$login){
  followers{ totalCount }
  contributionsCollection{ contributionCalendar{ totalContributions weeks{ contributionDays{ contributionCount } } } }
} }`

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { login: USER } }),
})
const json = await res.json()
if (!json.data?.user) throw new Error(`GraphQL failed: ${JSON.stringify(json.errors || json)}`)

const cal = json.data.user.contributionsCollection.contributionCalendar
const stats = {
  total: cal.totalContributions,
  weeks: cal.weeks.map((w) => w.contributionDays.map((d) => d.contributionCount)),
  followers: json.data.user.followers.totalCount,
}
writeFileSync(new URL('../data/stats.json', import.meta.url), JSON.stringify(stats) + '\n')
console.log(`contributions: ${stats.total}, weeks: ${stats.weeks.length}`)
