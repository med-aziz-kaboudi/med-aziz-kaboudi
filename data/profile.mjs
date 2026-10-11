// Everything written on the profile lives here. Edit this file, push, and the
// build workflow regenerates every image and the README from it.

export const USER = 'med-aziz-kaboudi'
export const REPO = `${USER}/${USER}`

export const NAME = ['Mohamed Aziz', 'Kaboudi']
export const EYEBROW = 'HELLO WORLD, I AM'
export const ROLES = [
  'Software engineer & founder',
  'Shipping Owemie and Ömrüm',
  'AI in production, not demos',
  'Mobile · backend · cloud · design',
]

export const LINKS = {
  portfolio: 'https://mohamedazizkaboudi.tn',
  linkedin: 'https://www.linkedin.com/in/mohamed-aziz-kaboudi/',
  email: 'mailto:azizkaboudi123@gmail.com',
}

export const ABOUT = [
  'I build products end to end, from the first design frame to the store release, and increasingly the AI that runs inside them.',
  'Software Engineering at **ESPRIT** after a Bachelor\'s from **ISIG Kairouan**. Two apps of my own live on iOS and Android, built alone across mobile, backend, cloud and design. Currently in Germany. Arabic, French, English.',
]

export const PRODUCTS = [
  {
    key: 'owemie',
    name: 'Owemie',
    lines: ['Money between people,', 'finally clear.'],
    colors: ['#4ade80', '#2f9fe0'],
    stack: 'Flutter · NestJS · PostgreSQL · GCP · AI',
    url: 'https://www.owemie.com',
    site: 'owemie.com',
    ios: 'https://apps.apple.com/app/id6759562603',
    android: 'https://play.google.com/store/apps/details?id=com.owemie.owemie',
  },
  {
    key: 'omrum',
    name: 'Ömrüm',
    lines: ['A private app for two.', 'No signup, one code.'],
    colors: ['#b07be0', '#f0879f'],
    stack: 'Flutter · NestJS · Realtime · WidgetKit · LiveKit',
    url: 'https://omrum.space',
    site: 'omrum.space',
    ios: 'https://apps.apple.com/app/id6778920520',
    android: 'https://play.google.com/store/apps/details?id=com.omrum.omrum',
  },
]

export const STATS = [
  { value: '2', label: 'APPS LIVE IN STORES', color: '#4ade80' },
  { value: '6', label: 'YEARS BUILDING', color: '#2f9fe0' },
  { value: '50+', label: 'PROJECTS SHIPPED', color: '#b07be0' },
  { value: '3', label: 'HACKATHON PLACES', color: '#f0879f' },
]

// Names match scripts/icons.json (Simple Icons). Anything without an icon is
// drawn with a generic glyph, so the list can hold concepts too.
export const STACK = [
  ['Languages', ['TypeScript', 'Dart', 'Python', 'Kotlin', 'Swift']],
  ['Mobile', ['Flutter', 'Jetpack Compose', 'Android', 'Apple', 'Xcode']],
  ['Web', ['React', 'Next.js', 'Vite', 'Tailwind', 'Three.js']],
  ['Backend', ['NestJS', 'Node.js', 'FastAPI', 'Socket.IO', 'WebRTC', 'LiveKit']],
  ['Data', ['PostgreSQL', 'Prisma', 'Supabase', 'Redis', 'MongoDB']],
  ['AI', ['Ollama', 'PyTorch', 'ONNX', 'LLMs', 'RAG', 'Fine-tuning']],
  ['Cloud & Design', ['Google Cloud', 'Docker', 'Firebase', 'Vercel', 'GitHub Actions', 'Figma', 'Blender']],
]
// Display names where the icon's name is not what the tile should say.
export const STACK_LABEL = { Apple: 'SwiftUI', 'Jetpack Compose': 'Compose', 'GitHub Actions': 'CI/CD' }

export const HACKATHONS = [
  ['🥇 1st', 'Imaginary-ai', 'Story generation from image prompts'],
  ['🥉 3rd', 'FinAssist', 'Personal finance analytics and automated reporting'],
  ['4th', 'Cement Sales App', 'Field sales operations and vendor mapping'],
  ['Participant', 'Gatra (with GIZ)', 'Water conservation platform with a voice assistant'],
  ['Participant', 'Linguify.ai', 'AI language learning with a tutor chatbot'],
]

export const CERTS = [
  ['NVIDIA', 'Generative AI with Diffusion Models', '2025'],
  ['NVIDIA', 'Applications of AI for Predictive Maintenance', '2025'],
  ['AWS Academy', 'Cloud Foundations', '2025'],
]

// The 3D contribution city and the snake only appear once the public graph
// has enough in it to look like a city rather than an empty lot.
export const CITY_MIN_CONTRIBUTIONS = 150
