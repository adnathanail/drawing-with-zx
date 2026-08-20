// Emits the SpLean mark from the same definitions as the plate, with the text,
// the scalar and the badge left off and the vessels cut back to stubs.
//
// Three assets, because one drawing cannot hold up across the whole size range:
//   diagram/  the whole organ, tight to its marks, for 128px and up
//   mark/     the sparse capsule, the trabecula and the three vessels, in a
//             square box, with the strokes weighted up for 48px
//   logo/     sparser still, for favicon sizes
// Each gets a directory holding its SVG and a PNG at each of the sizes it is
// meant for, plus logo.html alongside them, which puts all three at every size
// on light and dark.
//
// Run it with `node logo.mjs`, then open `out/logo.html`.
import { Resvg } from '@resvg/resvg-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CORE, drawing, layers, LOGO, nodes, RING_LOGO, RING_SPARSE, SIZE } from './spleenDrawing.mjs'

// The sizes each mark is shown at are the range it is meant for: the whole
// organ stops where its interior stops reading, and the two reduced marks
// start below where it does.
const SIZES = {
  diagram: [256, 128, 96],
  mark: [128, 96, 64],
  logo: [64, 48, 32],
}

/** Grow a box to a square about its own centre, so a mark that is taller than
 *  it is wide keeps its margins when it is dropped into a square slot. */
function squared({ x, y, width, height }) {
  const side = Math.max(width, height)
  return { x: x - (side - width) / 2, y: y - (side - height) / 2, width: side, height: side }
}

function svg(parts, { square = false } = {}) {
  const b = square ? squared(parts.bounds) : parts.bounds
  const box = [b.x, b.y, b.width, b.height].map(n => Math.round(n * 100) / 100).join(' ')
  return {
    box,
    parts,
    ratio: b.width / b.height,
    markup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">\n${layers(parts)}\n</svg>\n`,
  }
}

/**
 * How much heavier than the plate each reduced mark is drawn — spiders and
 * stroke widths together. The plate's proportions are set for a 700px drawing,
 * where a spider is 3% of the width; a mark that has to hold at 32px wants a
 * bigger share of itself to be spider. These are the numbers to tweak, and
 * `ceiling()` below prints how far each can go.
 */
const SCALE = { mark: 2.1, logo: 3.8 }

/** How much of a node's own size each shape reaches out from its centre: a
 *  spider its radius, a boundary half that, an H-box half its width. */
const REACH = { z: 1, x: 1, h: 0.75, boundary: 0.5 }

/** The scale at which a mark's closest two nodes meet, and which pair they
 *  are. Past it the drawing overlaps itself. Measured on the positions the
 *  mark is actually drawn at, since a stub moves its boundary well off the one
 *  in `nodes`. */
function ceiling(keep, positions) {
  let closest = { scale: Number.POSITIVE_INFINITY, pair: '' }
  for (const [i, a] of keep.entries())
    for (const b of keep.slice(i + 1)) {
      const [ax, ay] = positions.get(a)
      const [bx, by] = positions.get(b)
      const gap = Math.hypot(ax - bx, ay - by)
      const scale = gap / ((REACH[nodes[a][0]] + REACH[nodes[b][0]]) * SIZE)
      if (scale < closest.scale) closest = { scale, pair: `${a}–${b}` }
    }
  return closest
}

// The three vessels leave the hilum within 33° of each other, so how far out
// they run is what sets how far apart their dots land.
const diagram = svg(drawing({ text: false, stubs: 62 }))
const mark = svg(
  drawing({ ring: RING_SPARSE, keep: CORE, text: false, stubs: 140, scale: SCALE.mark }),
  { square: true },
)
// The logo is what is left when every mark has to be worth a pixel: a capsule
// of eight spiders, the trabecula in the middle of it, and one vessel.
const logo = svg(
  drawing({ ring: RING_LOGO, keep: LOGO, text: false, stubs: 140, scale: SCALE.logo }),
  { square: true },
)

for (const [name, keep, parts] of [
  ['mark', CORE, mark.parts],
  ['logo', LOGO, logo.parts],
]) {
  const { scale, pair } = ceiling(keep, parts.positions)
  console.log(`${name}: drawn at ${SCALE[name]}, ceiling ${scale.toFixed(2)} at ${pair}`)
}

const OUT = new URL('out/', import.meta.url)
mkdirSync(OUT, { recursive: true })
const out = name => fileURLToPath(new URL(name, OUT))
/** Rasterise at a given height, sized the way logo.html sizes its `<svg>`: the
 *  size a mark is listed at is its height, and the width follows the mark's own
 *  ratio. The background is left transparent, so the one file drops onto either
 *  the light or the dark backing it is shown over. */
const png = (markup, height) =>
  new Resvg(markup, { fitTo: { mode: 'height', value: height } }).render().asPng()

// Each asset lands in a directory of its own, holding its SVG and a PNG per size.
for (const [dir, asset, sizes] of [
  ['diagram', diagram, SIZES.diagram],
  ['mark', mark, SIZES.mark],
  ['logo', logo, SIZES.logo],
]) {
  mkdirSync(new URL(`${dir}/`, OUT), { recursive: true })
  const stem = `${dir}/splean-${dir}`
  writeFileSync(out(`${stem}.svg`), asset.markup)
  for (const size of sizes) writeFileSync(out(`${stem}-${size}.png`), png(asset.markup, size))
}

/** One row of a mark across the sizes it is meant for, over a background. */
const row = (label, sizes, { box, markup, ratio }, background, dark) => `
  <section class="${dark ? 'dark' : ''}" style="background:${background}">
    <h2>${label}</h2>
    <div class="row">
      ${sizes
        .map(
          s =>
            `<figure>${markup.replace('<svg ', `<svg width="${Math.round(s * ratio)}" height="${s}" `)}<figcaption>${s}px</figcaption></figure>`,
        )
        .join('\n      ')}
    </div>
    <p class="box">viewBox="${box}"</p>
  </section>`

const html = `<!doctype html>
<meta charset="utf-8" />
<title>SpLean mark</title>
<style>
  body {
    margin: 0;
    padding: 2rem;
    background: white;
    font: 14px system-ui, sans-serif;
    color: #333;
  }
  h1 { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.25rem; }
  p.sub { margin: 0 0 1.5rem; color: #666; max-width: 46rem; }
  section { padding: 1.25rem; border-radius: 8px; margin: 0 0 1rem; }
  section.dark { color: #eee; }
  h2 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
       letter-spacing: 0.06em; margin: 0 0 1rem; opacity: 0.7; }
  .row { display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
  figure { margin: 0; text-align: center; }
  figcaption { margin-top: 0.5rem; font-size: 11px; opacity: 0.6; }
  p.box { margin: 1rem 0 0; font: 11px monospace; opacity: 0.5; }
</style>

<h1>SpLean mark</h1>
<p class="sub">The spleen diagram as a logo: same node positions, wires and Pauli webs as the plate, with the labels, phases, scalar and badge dropped, the vessels cut back to stubs at the hilum, and progressively less kept as the mark gets smaller.</p>

${row('Whole organ — diagram/splean-diagram.svg', SIZES.diagram, diagram, '#fcfcfd', false)}
${row('Whole organ, on dark', SIZES.diagram, diagram, '#1c1c1f', true)}
${row('Sparse mark — mark/splean-mark.svg', SIZES.mark, mark, '#fcfcfd', false)}
${row('Sparse mark, on dark', SIZES.mark, mark, '#1c1c1f', true)}
${row('Logo — logo/splean-logo.svg', SIZES.logo, logo, '#fcfcfd', false)}
${row('Logo, on dark', SIZES.logo, logo, '#1c1c1f', true)}
`

writeFileSync(out('logo.html'), html)
