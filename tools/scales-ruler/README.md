# Measurements-across-scales ruler — reuse kit

Three ways to put the ruler on another site, from simplest to most flexible.

## 1. Drop in an SVG (no code)

- `scales-ruler-dark.svg` — dark ground baked in (1100×330, scales to any width).
- `scales-ruler-dark-transparent.svg` — light text/lines, no background: for your own dark sections.
- `scales-ruler-light.svg` — dark text/lines for a light page (yellow bars darkened for contrast).

    <img src="/assets/img/scales-ruler-light.svg" alt="Log-scale ruler from 1 nm to 10 cm showing the range of each modality" style="width:100%;height:auto">

Edit labels directly in the SVG (they are plain `<text>` elements) if you want different modalities.
The text uses "Geist Mono" with a monospace fallback; load Geist Mono on the page or change the
`font-family` attributes.

## 2. Render live with the script (editable data, crisp at any size)

    <div id="ruler"></div>
    <script src="/assets/js/brainlife-art.js"></script>
    <script>BrainlifeArt.ruler(document.getElementById('ruler'), 1100, 330);</script>

The modalities, their resolved ranges and the viewer rows are the arrays at the top of `D.ruler`
inside `brainlife-art.js` — change names, ranges (in metres, log scale 1 nm → 10 cm) and colours there.
The same file also gives you the other two heroes: `BrainlifeArt.field(el, w, h, seed)` (the flow
field) and `BrainlifeArt.lens(el, w, h, seed)`; both draw on a canvas and expect a dark container.

## 3. Share the source

Everything comes from `lib/landing/draw.ts` in brainlife/brainlife.hugo_v2 (branch landing-v3), with
the palette in `PAL`. If the lab site is a Jekyll/HTML site, option 1 or 2 is enough; if it ever moves
to a framework, import the TypeScript directly.

Colours: ground #07131c, blue #005981 / #3b9fd0, red #a9262c, orange #e57536, yellow #f9c926, text
#eef3f6 / #a9bac6 on dark.
