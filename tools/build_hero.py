#!/usr/bin/env python3
"""Build the exploded-axonometric "research stack" hero SVG for the lab site.

Uses the 2:1 dimetric projection from the diagram-design skill (axonometry.py).
Every coordinate is projected; nothing is placed by hand. Output: assets/img/hero-stack.svg
plus an HTML fragment (assets/hero-stack.html) with the same SVG inline so it can be
animated with CSS.
"""
from __future__ import annotations
import math, sys
from dataclasses import dataclass
from pathlib import Path

# Needs a checkout of https://github.com/cathrynlavery/diagram-design next to this repo (or set DIAGRAM_DESIGN).
import os
sys.path.insert(0, os.path.join(os.environ.get("DIAGRAM_DESIGN", os.path.join(os.path.dirname(__file__), "..", "..", "diagram-design")), "scripts"))
from axonometry import Proj, Rect, f, prism, outline, point, walk, M, L  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "assets"

# Lab palette on dark
PAPER = "none"
BASE = "#0f2a3b"           # face base
INK = "#eef3f6"
MUTED = "#a9bac6"
ACC = "#f9c926"            # yellow accent (focal)
BLUE = "#005981"
ORANGE = "#e57536"
RED = "#a9262c"
TOP = "rgba(238,243,246,0.10)"
RIGHT = "rgba(4,14,22,0.45)"
FOCAL_TOP = "rgba(249,201,38,0.07)"
SIL = "rgba(238,243,246,0.92)"
INNER = "rgba(238,243,246,0.40)"
TRACE = "rgba(238,243,246,0.28)"
LEAD = "rgba(238,243,246,0.45)"


@dataclass
class Part:
    key: str
    name: str
    sub: str
    rect: Rect
    t: float
    detail: str = ""
    z: float = 0


W, D = 300, 220
SLAB = Rect(0, 0, W, D, 10)
parts = [
    Part("data", "Brain connectivity", "MICROSCOPY · TRACING · MRI", SLAB, 16, "data"),
    Part("standards", "Data standards", "FORMATS · METADATA · PROVENANCE", SLAB, 12, "standards"),
    Part("compute", "Responsible cloud technology", "PLATFORMS · APPS · GOVERNANCE", SLAB, 14, "compute"),
    Part("models", "AI agents &amp; models", "DEEP LEARNING · AGENTS · BENCHMARKS", SLAB, 12, "models"),
    Part("discovery", "Brain white matter", "PERCEPTION · LEARNING · LIFESPAN", SLAB, 14, "discovery"),
]
FOCUS = "compute"

# explode
gap = max(0.55 * (W + D) / 2, 3 * max(p.t for p in parts))
gap = math.ceil(gap / 4) * 4
z = 0
for p in parts:
    p.z = z
    z += p.t + gap

P0 = Proj(0, 0)
pts = [pt for p in parts for pt in prism(P0, p.rect, p.z, p.z + p.t)["poly"]]
minx, maxx = min(p[0] for p in pts), max(p[0] for p in pts)
miny, maxy = min(p[1] for p in pts), max(p[1] for p in pts)
lead_w, label_w = 44, 470
total_w = maxx - minx + lead_w + label_w
vw = max(1000, math.ceil((total_w + 48) / 4) * 4)   # widen the viewBox if the labels need it
left = math.floor((vw - total_w) / 2 / 4) * 4
ox, oy = round((left - minx) / 4) * 4, round((40 - miny) / 4) * 4
P = Proj(ox, oy)
vh = math.ceil((oy + maxy + 32) / 4) * 4
col_x = ox + maxx + lead_w


def solid(rect, z0, z1, focal, chip=False):
    pr = prism(P, rect, z0, z1)
    out = [f'<path d="{pr["sil"]}" fill="{BASE}"/>']
    out.append(f'<path d="{pr["top"]}" fill="{FOCAL_TOP if focal else TOP}"/>')
    out.append(f'<path d="{pr["right"]}" fill="{RIGHT}"/>')
    sw = 0.8 if chip else 1.2
    out.append(f'<path d="{pr["edge"]}" fill="none" stroke="{INNER}" stroke-width="0.7"/>')
    out.append(f'<path d="{pr["sil"]}" fill="none" stroke="{ACC if focal else SIL}" stroke-width="{sw}" stroke-linejoin="round"/>')
    return pr, out


def flat(rect, z, fill, stroke=None, sw=0.6):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<path d="{outline(P, rect, z)}" fill="{fill}"{s}/>'


def detail(p: Part, z1: float):
    r = p.rect
    out = []
    if p.detail == "data":
        # a grid of data tiles in the four brand colours (datasets of many modalities)
        cols = [BLUE, RED, ORANGE, ACC]
        i = 0
        for gy in range(4):
            for gx in range(6):
                x0 = r.x0 + 20 + gx * 44
                y0 = r.y0 + 24 + gy * 46
                c = cols[(gx + gy) % 4]
                out.append(flat(Rect(x0, y0, x0 + 34, y0 + 36, 3), z1, c, "rgba(0,0,0,0.25)", 0.5))
                i += 1
    elif p.detail == "standards":
        # three index cards with ruled lines
        for k, (x0, y0) in enumerate(((22, 26), (112, 60), (196, 30))):
            card = Rect(r.x0 + x0, r.y0 + y0, r.x0 + x0 + 80, r.y0 + y0 + 110, 4)
            out.append(flat(card, z1, "rgba(238,243,246,0.08)", INNER, 0.6))
            for n in range(5):
                ln = Rect(card.x0 + 10, card.y0 + 16 + n * 18, card.x1 - 10 - (18 if n == 4 else 0), card.y0 + 20 + n * 18, 1)
                out.append(flat(ln, z1, "rgba(238,243,246,0.35)" if n else ACC))
    elif p.detail == "compute":
        # a reproducible pipeline: data -> app -> app -> result, as flat cards joined by arrows,
        # with a queue of running jobs (progress bars) underneath
        def seg(x1, y1, x2, y2, col=ACC, w=1.4):
            a, b = P.iso(x1, y1, z1), P.iso(x2, y2, z1)
            return f'<line x1="{f(a[0])}" y1="{f(a[1])}" x2="{f(b[0])}" y2="{f(b[1])}" stroke="{col}" stroke-width="{w}" stroke-opacity="0.9"/>'
        y0, h, w, gap = r.y0 + 66, 88, 56, 22
        xs = [r.x0 + 22 + i * (w + gap) for i in range(4)]
        for i, x in enumerate(xs):
            c = Rect(x, y0, x + w, y0 + h, 4)
            focal_card = i in (1, 2)
            out.append(flat(c, z1, "rgba(238,243,246,0.10)", ACC if focal_card else INNER, 0.9 if focal_card else 0.7))
            out.append(flat(Rect(c.x0 + 8, c.y0 + 8, c.x1 - 8, c.y0 + 13, 1), z1, "rgba(238,243,246,0.6)"))
            if focal_card:
                for n in range(2):
                    out.append(flat(Rect(c.x0 + 8, c.y0 + 24 + n * 10, c.x1 - 8 - (10 if n else 0), c.y0 + 28 + n * 10, 1), z1, "rgba(238,243,246,0.3)"))
                out.append(flat(Rect(c.x0 + 8, c.y1 - 14, c.x1 - 8, c.y1 - 9, 1), z1, ACC))
            else:
                for n in range(3):
                    out.append(flat(Rect(c.x0 + 8, c.y0 + 24 + n * 9, c.x1 - 8 - (8 if n == 2 else 0), c.y0 + 28 + n * 9, 1), z1, "rgba(238,243,246,0.3)"))
            if i < 3:
                ym = y0 + h / 2
                out.append(seg(c.x1, ym, c.x1 + gap, ym))
                q = P.iso(c.x1 + gap, ym, z1)
                out.append(f'<circle cx="{f(q[0])}" cy="{f(q[1])}" r="2.4" fill="{ACC}"/>')
    elif p.detail == "models":
        # a small layered network glyph on the face
        layers = [(40, 3), (120, 5), (200, 4), (260, 2)]
        coords = []
        for lx, n in layers:
            ys = [r.y0 + D / 2 + (i - (n - 1) / 2) * 36 for i in range(n)]
            coords.append([(r.x0 + lx, y) for y in ys])
        for a, b in zip(coords, coords[1:]):
            for (x1, y1) in a:
                for (x2, y2) in b:
                    pa, pb = P.iso(x1, y1, z1), P.iso(x2, y2, z1)
                    out.append(f'<line x1="{f(pa[0])}" y1="{f(pa[1])}" x2="{f(pb[0])}" y2="{f(pb[1])}" stroke="rgba(238,243,246,0.22)" stroke-width="0.6"/>')
        for li, layer in enumerate(coords):
            for (x, y) in layer:
                c = ORANGE if li == len(coords) - 1 else BLUE
                out.append(flat(Rect(x - 9, y - 9, x + 9, y + 9, 9), z1, c, "rgba(238,243,246,0.6)", 0.6))
    elif p.detail == "discovery":
        # the lab's brain mark laid flat on the top face (content on a face uses the top matrix)
        # pestillilab-02.svg viewBox 0 0 166.71 108.97 ; scale to ~ 230 x 150 model units
        s = 1.38
        tx, ty = r.x0 + 36, r.y0 + 36
        o = P.iso(tx, ty, z1)
        out.append(f'<g transform="matrix(1,0.5,-1,0.5,{f(o[0])},{f(o[1])}) scale({s})">{BRAIN_PATHS}</g>')
    return out


def brain_paths():
    src = (OUT / "img" / "favicon.svg").read_text()
    # keep only the path elements; map classes to fills
    import re
    cls = {"b": ACC, "c": "#2f8fbf", "d": ORANGE, "e": "rgba(238,243,246,0.10)", "f": RED}
    paths = re.findall(r'<path class="(\w)" d="([^"]+)"', src)
    outp = []
    for c, d in paths:
        fill = cls.get(c, INK)
        stroke = f' stroke="{SIL}" stroke-width="1.6"' if c == "e" else ""
        outp.append(f'<path d="{d}" fill="{fill}"{stroke}/>')
    return "".join(outp)


BRAIN_PATHS = brain_paths()


def label(p: Part, anchor, focal):
    ax, ay = anchor
    return (f'<g class="hs-label" data-role="label">'
            f'<line x1="{f(ax + 6)}" y1="{f(ay)}" x2="{f(col_x - 12)}" y2="{f(ay)}" stroke="{ACC if focal else LEAD}" stroke-width="0.8"/>'
            f'<circle cx="{f(ax)}" cy="{f(ay)}" r="2.2" fill="{ACC if focal else INK}"/>'
            f'<text x="{f(col_x)}" y="{f(ay - 5)}" fill="{INK}" font-size="31" font-weight="600" font-family="Geist, system-ui, sans-serif">{p.name}</text>'
            f'<text x="{f(col_x)}" y="{f(ay + 20)}" fill="{ACC if focal else MUTED}" font-size="14.5" font-family="\'Geist Mono\', ui-monospace, monospace" letter-spacing="0.08em">{p.sub}</text></g>')


body = []
b, t = parts[0], parts[-1]
for th in (135, -45):
    a1 = point(P, b.rect, th, b.z + b.t)
    a2 = point(P, b.rect, th, t.z)
    body.append(f'<line class="hs-trace" x1="{f(a1[0])}" y1="{f(a1[1])}" x2="{f(a2[0])}" y2="{f(a2[1])}" stroke="{TRACE}" stroke-width="0.8" stroke-dasharray="4,3"/>')

n = len(parts)
for i, p in enumerate(parts):
    focal = p.key == FOCUS
    pr, out = solid(p.rect, p.z, p.z + p.t, focal)
    out += detail(p, p.z + p.t)
    lift = p.z - sum(q.t for q in parts[:i])  # exploded z minus assembled z
    step = n - i  # top lifts first
    body.append(f'<g class="hs-part" data-part="{p.key}" data-step="{step}" style="--lift:{f(lift)}px">' + "".join(out) + label(p, pr["anchor"], focal) + "</g>")

svg = (f'<svg class="hero-stack" viewBox="0 0 {vw} {vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="hs-title hs-desc">'
       f'<title id="hs-title">The lab\'s research stack</title>'
       f'<desc id="hs-desc">Five layers pulled apart: brain connectivity at the base, then data standards, responsible cloud technology, AI agents and models, and brain white matter on top.</desc>'
       + "\n".join(body) + "</svg>")

(OUT / "img" / "hero-stack.svg").write_text(svg.replace('class="hero-stack" ', ''))
print("viewBox", vw, "x", vh, "gap", gap, "steps", n)

# ---- write the include used by _layouts/home.html
inc = OUT.parent / "_includes" / "hero-stack.svg"
inc.write_text(svg + "\n")
print("wrote", inc)
