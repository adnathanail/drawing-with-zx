# drawing-with-zx

Drawings made with [zxcc](https://github.com/adnathanail/zxcc)'s styles

## SpLean

Each script writes its output into `out/`.

| Run | Writes |
| --- | --- |
| `npm run plate` | `out/spleen.html` — the labelled plate, with a key |
| `npm run logo` | `out/logo.svg`, `out/logo-mark.svg`, `out/logo-glyph.svg`, and `out/logo.html` to compare them at size |
| `npm run element` | `out/spleen-element.html` — the same plate as a `DiagramData`, drawn by `<zx-diagram>` itself |

That last one is the exception to all of the above: it needs
`@adnathanail/zxcc` installed (`npm install`), and it is the one output not
committed. The page embeds the package's `dist/index.bundle.js` so that it
opens from disk — the bundle is an ES module, which a `file:` page cannot load
by `src` — and a copy of a published build checked into the repo would go
quietly stale.

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
