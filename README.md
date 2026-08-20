# drawing-with-zx

Drawings made with [zxcc](https://github.com/adnathanail/zxcc)'s styles

## SpLean

Each script writes its output into `out/`, which is not tracked.

| Run | Writes |
| --- | --- |
| `npm run plate` | `out/spleen.html` — the labelled plate, with a key |
| `npm run logo` | `out/diagram/`, `out/mark/` and `out/logo/` — each holding that mark's SVG and a transparent PNG at each size it is meant for (`splean-mark-128.png`, …) — plus `out/logo.html` to compare all three at size |
| `npm run element` | `out/spleen-element.html` — the same plate as a `DiagramData`, drawn by `<zx-diagram>` itself |

That last one is the exception to all of the above: it needs
`@adnathanail/zxcc` installed (`npm install`). The page embeds the package's
`dist/index.bundle.js` so that it opens from disk — the bundle is an ES module,
which a `file:` page cannot load by `src`.

`spleenDrawing.mjs` holds the one set of definitions all three draw from — node
positions, wires, Pauli webs, and a `drawing()` that takes the knobs a logo
needs (drop the text, cut the vessels back to stubs, thin the capsule out, and
scale the strokes and spiders up so the mark survives being shrunk). The
element version reads the same table and projects it into the package's own
input shape instead of into markup.

The palette, shapes, text slots and web strands are copies of what
[zxcc](https://github.com/adnathanail/zxcc) paints, at `scale` 40. They are
copies on purpose: these are pictures that happen to look like the library's,
not a second implementation of it, and nothing here is imported by the
package.
