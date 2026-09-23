/**
 * Compile MindAR photo-crop targets for cards 01 and 11.
 * Crop is locked: 1200×1800 canvas, x=64 y=64 w=1072 h=1260 (photograph only).
 *
 * Requires system Chrome and puppeteer-core (not an app runtime dependency):
 *   npm install --prefix /tmp/pup puppeteer-core
 *   PUPPETEER_CORE=/tmp/pup/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js \
 *     node scripts/compile-photo-targets.mjs
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
const puppeteer = await import(process.env.PUPPETEER_CORE || 'puppeteer-core')

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, 'public')
const PAGE = join(PUBLIC, 'ar', '.compile-photo-targets.html')
const MIND = join(PUBLIC, 'ar', 'targets', 'photo-crop.mind')
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome'

const HTML = `<!doctype html>
<meta charset="utf-8" />
<script type="module">
import { Compiler, Controller } from './vendor/mind-ar/mindar-image.prod.js'

const sources = [
  { cardId: '01', src: '/ar/targets/card_01_photo.png' },
  { cardId: '11', src: '/ar/targets/card_11_photo.png' },
]

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed ' + src))
    img.src = src
  })
}

window.compileTargets = async () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) throw new Error('WebGL unavailable')

  const images = []
  for (const source of sources) {
    const img = await loadImage(source.src)
    if (img.naturalWidth !== 1072 || img.naturalHeight !== 1260) {
      throw new Error(source.cardId + ' crop is ' + img.naturalWidth + 'x' + img.naturalHeight)
    }
    images.push(img)
  }

  const compiler = new Compiler()
  await compiler.compileImageTargets(images, (progress) => {
    console.log('PROGRESS ' + progress.toFixed(1))
  })
  const exported = compiler.exportData()
  const bytes = exported instanceof Uint8Array ? exported : new Uint8Array(exported)
  const save = await fetch('/save-mind', { method: 'POST', body: bytes })
  if (!save.ok) throw new Error('save failed')

  const matches = []
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const controller = new Controller({
      inputWidth: img.naturalWidth,
      inputHeight: img.naturalHeight,
      maxTrack: 1,
    })
    const copy = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    controller.addImageTargetsFromBuffer(copy)
    await new Promise((resolve) => setTimeout(resolve, 800))
    try {
      controller.dummyRun(img)
      const detected = await controller.detect(img)
      const matched = await Promise.race([
        controller.match(detected.featurePoints, i),
        new Promise((_, reject) => setTimeout(() => reject(new Error('match timeout')), 45000)),
      ])
      matches.push({
        cardId: sources[i].cardId,
        points: detected.featurePoints?.length || 0,
        matched: matched.modelViewTransform != null,
      })
    } catch (error) {
      matches.push({ cardId: sources[i].cardId, matched: false, error: String(error && error.message || error) })
    }
    controller.dispose()
  }

  return {
    byteLength: bytes.byteLength,
    gl: gl.getParameter(gl.VERSION),
    matches,
  }
}
</script>
`

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.mind': 'application/octet-stream',
}

function startServer() {
  const server = createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save-mind') {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        const body = Buffer.concat(chunks)
        writeFileSync(MIND, body)
        res.writeHead(200)
        res.end('ok')
      })
      return
    }
    const url = new URL(req.url, 'http://127.0.0.1')
    const rel = decodeURIComponent(url.pathname)
    const file = normalize(join(PUBLIC, rel))
    if (!file.startsWith(PUBLIC)) {
      res.writeHead(403)
      res.end()
      return
    }
    try {
      const data = readFileSync(file)
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' })
      res.end(data)
    } catch {
      res.writeHead(404)
      res.end()
    }
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

writeFileSync(PAGE, HTML)
const server = await startServer()
const { port } = server.address()
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  protocolTimeout: 600000,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
})

try {
  const page = await browser.newPage()
  page.setDefaultTimeout(600000)
  page.on('console', (msg) => console.log('PAGE', msg.text()))
  page.on('pageerror', (error) => console.error('PAGEERROR', error))
  await page.goto(`http://127.0.0.1:${port}/ar/.compile-photo-targets.html`, { waitUntil: 'networkidle0' })
  const result = await page.evaluate(() => window.compileTargets())
  console.log(JSON.stringify(result, null, 2))
  if (!existsSync(MIND)) throw new Error('mind file missing')
  if (result.matches.some((item) => !item.matched)) {
    throw new Error('compiled target did not match its photo crop')
  }
} finally {
  await browser.close()
  server.close()
  if (existsSync(PAGE)) unlinkSync(PAGE)
}
