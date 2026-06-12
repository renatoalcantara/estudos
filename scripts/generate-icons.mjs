// Gera os PNGs do PWA a partir de scripts/icon-source.svg.
// Uso: npm run generate-icons
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const svgPath = fileURLToPath(new URL('./icon-source.svg', import.meta.url))
const iconsDir = fileURLToPath(new URL('../public/icons/', import.meta.url))
const svg = readFileSync(svgPath)

mkdirSync(iconsDir, { recursive: true })

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

await Promise.all(
  targets.map(({ name, size }) =>
    sharp(svg).resize(size, size).png().toFile(iconsDir + name),
  ),
)

console.log(`Ícones gerados em ${iconsDir}`)
