/* brainlife hero drawings (field, lens, ruler) — from brainlife.hugo_v2 lib/landing/draw.ts.
   Usage: BrainlifeArt.ruler(element, width, height); BrainlifeArt.field(el, w, h, seed); BrainlifeArt.lens(el, w, h, seed)
   Draws into `element` (an <svg> or <canvas> is appended). Palette in PAL at the top. MIT. */
(function(global){
/* eslint-disable */
// @ts-nocheck
/**
 * Generative drawings for the landing page.
 *
 * Hero visuals only, drawn from the brand palette (PAL) and deterministic for a seed:
 *   D.field (flow field across scales), D.lens (concentric scale rings), D.ruler (log-scale ruler).
 * The small pictures on cards and tiles are the geometric motifs in lib/landing/motifs.ts.
 *
 * Every drawer has the same signature: D.name(container, width, height, seed, small).
 * It appends a <canvas> or <svg> to `container`. `small` trims labels for tile-sized output.
 *
 * Type-checking is off here on purpose: self-contained canvas/SVG code with no app dependencies,
 * where the loose numeric style reads better than annotations would. Components never import D
 * directly; they go through the typed facade in lib/landing/drawers.ts, which is also where a new
 * drawer must be registered (and added to HERO_VARIANTS in lib/landing/pairs.ts).
 */
const PAL = {
    blue: '#005981',
    bluel: '#3b9fd0',
    red: '#a9262c',
    orange: '#e57536',
    yellow: '#f9c926',
    ink: '#eef3f6',
    muted: '#a9bac6',
    bg: '#07131c',
    bg2: '#0b1f2d',
    slate: '#2a4a5e',
};
const SEQ = ['#07131c', '#005981', '#3b9fd0', '#e57536', '#f9c926'];
/** Deterministic pseudo-random generator (LCG) so a given seed always draws the same picture. */
function rng(seed) {
    return function () {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}
/** '#rrggbb' → [r, g, b] */
function hex(h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
/** Interpolates along a list of hex stops; t in [0, 1]. Used for all data colour ramps. */
function ramp(stops, t) {
    var c = stops.map(hex);
    t = Math.max(0, Math.min(0.9999, t)) * (c.length - 1);
    var i = Math.floor(t);
    return mix(c[i], c[i + 1], t - i);
}
function rgba(c, a) {
    return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';
}
/** 2D simplex noise (Gustavson). Returns noise(x, y) in roughly [-1, 1]. */
function Simplex(r) {
    var p = [];
    for (var i = 0; i < 256; i++)
        p[i] = i;
    for (i = 255; i > 0; i--) {
        var j = Math.floor(r() * (i + 1));
        var t = p[i];
        p[i] = p[j];
        p[j] = t;
    }
    var perm = [];
    for (i = 0; i < 512; i++)
        perm[i] = p[i & 255];
    var G = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ], F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    return function (x, y) {
        var s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2, x0 = x - (i - t), y0 = y - (j - t), i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1, x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2, ii = i & 255, jj = j & 255, n = 0, tt, g;
        tt = 0.5 - x0 * x0 - y0 * y0;
        if (tt > 0) {
            g = G[perm[ii + perm[jj]] % 8];
            tt *= tt;
            n += tt * tt * (g[0] * x0 + g[1] * y0);
        }
        tt = 0.5 - x1 * x1 - y1 * y1;
        if (tt > 0) {
            g = G[perm[ii + i1 + perm[jj + j1]] % 8];
            tt *= tt;
            n += tt * tt * (g[0] * x1 + g[1] * y1);
        }
        tt = 0.5 - x2 * x2 - y2 * y2;
        if (tt > 0) {
            g = G[perm[ii + 1 + perm[jj + 1]] % 8];
            tt *= tt;
            n += tt * tt * (g[0] * x2 + g[1] * y2);
        }
        return 70 * n;
    };
}
/** Appends a device-pixel-ratio-aware canvas filling `el`; returns its 2D context, cleared to the dark ground. */
function canvasIn(el, W, H) {
    var c = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = '100%';
    c.style.height = '100%';
    el.appendChild(c);
    var x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.fillStyle = PAL.bg;
    x.fillRect(0, 0, W, H);
    return x;
}
/** Replaces `el`'s content with an SVG of the given viewBox and inner markup. */
function svgIn(el, W, H, inner, label) {
    el.innerHTML =
        '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + label + '">' + inner + '</svg>';
}
/* ===== drawing functions: (el, W, H, seed, small) ===== */
const D = {};
/** Hero: flow field whose lines curl tightly on the left (EM) and lengthen into tract-like arcs on the right (MRI). */
D.field = function (el, W, H, seed, small) {
    var x = canvasIn(el, W, H), r = rng(seed), noise = Simplex(rng(seed + 1)), N = Math.round((W * H) / (small ? 120 : 190));
    x.lineCap = 'round';
    x.globalCompositeOperation = 'lighter';
    for (var i = 0; i < N; i++) {
        var px = r() * W, py = r() * H, u = px / W, freq = 0.045 * Math.pow(0.08, u), steps = Math.round(8 + 70 * u * u), len = 0.9 + 3.2 * u, ang = 0, col = ramp([PAL.bluel, PAL.red, PAL.orange, PAL.yellow], u + (r() - 0.5) * 0.12), a = (0.2 + 0.1 * u) * (0.6 + r() * 0.6);
        x.strokeStyle = rgba(col, a);
        x.lineWidth = 0.9 + 0.8 * u;
        x.beginPath();
        x.moveTo(px, py);
        for (var s = 0; s < steps; s++) {
            var n = noise(px * freq, py * freq * 0.9);
            ang = n * Math.PI * 2 * (1.6 - 0.9 * u);
            px += Math.cos(ang) * len;
            py += Math.sin(ang) * len * (0.5 + 0.5 * u);
            if (px < -5 || px > W + 5 || py < -5 || py > H + 5)
                break;
            x.lineTo(px, py);
        }
        x.stroke();
    }
    if (!small) {
        x.globalCompositeOperation = 'source-over';
        var g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'rgba(7,19,28,0)');
        g.addColorStop(0.45, 'rgba(7,19,28,0.1)');
        g.addColorStop(1, 'rgba(7,19,28,0.8)');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        var g2 = x.createLinearGradient(0, 0, W * 0.5, 0);
        g2.addColorStop(0, 'rgba(7,19,28,0.4)');
        g2.addColorStop(1, 'rgba(7,19,28,0)');
        x.fillStyle = g2;
        x.fillRect(0, 0, W, H);
    }
};
/** Hero: one circle read inward — arcs (cm), laminae (mm), branching fibres (µm), granular core (nm). */
D.lens = function (el, W, H, seed, small) {
    var r = rng(seed), cx = W * 0.52, cy = H * 0.5, R = Math.min(W, H) * 0.46, out = [];
    function arc(rad, a0, a1, col, w, op) {
        var x0 = cx + Math.cos(a0) * rad, y0 = cy + Math.sin(a0) * rad, x1 = cx + Math.cos(a1) * rad, y1 = cy + Math.sin(a1) * rad, big = a1 - a0 > Math.PI ? 1 : 0;
        out.push('<path d="M' +
            x0.toFixed(1) +
            ' ' +
            y0.toFixed(1) +
            'A' +
            rad.toFixed(1) +
            ' ' +
            rad.toFixed(1) +
            ' 0 ' +
            big +
            ' 1 ' +
            x1.toFixed(1) +
            ' ' +
            y1.toFixed(1) +
            '" fill="none" stroke="' +
            col +
            '" stroke-width="' +
            w +
            '" opacity="' +
            op +
            '" stroke-linecap="round"/>');
    }
    var k = R / 280;
    for (var i = 0; i < 70; i++) {
        var rad = (215 + r() * 62) * k, a0 = r() * 6.283;
        arc(rad, a0, a0 + 0.5 + r() * 1.5, PAL.yellow, (0.9 + r() * 0.8) * Math.max(0.6, k), 0.35 + r() * 0.4);
    }
    for (var b = 0; b < 9; b++) {
        var rb = (152 + b * 6.4) * k;
        for (var q = 0; q < 4; q++) {
            var a = r() * 6.283;
            arc(rb, a, a + 0.35 + r() * 0.6, PAL.orange, 1.2 * Math.max(0.6, k), 0.45 + r() * 0.4);
        }
    }
    for (var f = 0; f < 60; f++) {
        var a = r() * 6.283, rad = (88 + r() * 48) * k, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad, d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1), ang = a + (r() - 0.5) * 1.2;
        for (var s = 0; s < 5; s++) {
            ang += (r() - 0.5) * 1.1;
            x += Math.cos(ang) * (5 + r() * 7) * k;
            y += Math.sin(ang) * (5 + r() * 7) * k;
            var rr = Math.hypot(x - cx, y - cy);
            if (rr < 84 * k || rr > 146 * k)
                break;
            d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        out.push('<path d="' +
            d +
            '" fill="none" stroke="' +
            PAL.red +
            '" stroke-width="' +
            1.1 * Math.max(0.6, k) +
            '" opacity="' +
            (0.5 + r() * 0.4) +
            '" stroke-linecap="round"/>');
        out.push('<circle cx="' +
            (cx + Math.cos(a) * rad).toFixed(1) +
            '" cy="' +
            (cy + Math.sin(a) * rad).toFixed(1) +
            '" r="' +
            ((1.6 + r() * 1.4) * k).toFixed(1) +
            '" fill="' +
            PAL.red +
            '" opacity="0.8"/>');
    }
    for (var g = 0; g < 420; g++) {
        var a = r() * 6.283, rad = Math.sqrt(r()) * 76 * k;
        out.push('<circle cx="' +
            (cx + Math.cos(a) * rad).toFixed(1) +
            '" cy="' +
            (cy + Math.sin(a) * rad).toFixed(1) +
            '" r="' +
            ((0.7 + r() * 2.2) * k).toFixed(1) +
            '" fill="' +
            PAL.bluel +
            '" opacity="' +
            (0.3 + r() * 0.6).toFixed(2) +
            '"/>');
    }
    [80, 148, 210, 280].forEach(function (rad) {
        out.push('<circle cx="' +
            cx +
            '" cy="' +
            cy +
            '" r="' +
            rad * k +
            '" fill="none" stroke="rgba(238,243,246,0.16)" stroke-width="0.8"/>');
    });
    if (!small) {
        [
            ['nm', 'EM', 40],
            ['µm', 'lightsheet', 114],
            ['mm', 'PS-OCT', 179],
            ['cm', 'MRI', 245],
        ].forEach(function (l) {
            var ang = -Math.PI / 4, x = cx + Math.cos(ang) * l[2] * k, y = cy + Math.sin(ang) * l[2] * k;
            out.push('<line x1="' +
                x.toFixed(1) +
                '" y1="' +
                y.toFixed(1) +
                '" x2="' +
                (x + 14).toFixed(1) +
                '" y2="' +
                (y - 14).toFixed(1) +
                '" stroke="rgba(238,243,246,0.5)" stroke-width="0.8"/><text x="' +
                (x + 18).toFixed(1) +
                '" y="' +
                (y - 16).toFixed(1) +
                '" font-family="Geist Mono,ui-monospace,monospace" font-size="10.5" letter-spacing="1.2" fill="#eef3f6">' +
                l[0] +
                '<tspan fill="#a9bac6"> · ' +
                l[1].toUpperCase() +
                '</tspan></text>');
        });
    }
    svgIn(el, W, H, out.join(''), 'Concentric rings, each drawn at a different scale of the brain');
};
/** Hero: log-scale ruler 1 nm → 10 cm with each modality drawn over the range it resolves. Edit the arrays to change claims. */
D.ruler = function (el, W, H) {
    var L = 190, R = W - 40, x0 = -9, x1 = -1;
    function X(m) {
        return L + ((Math.log10(m) - x0) / (x1 - x0)) * (R - L);
    }
    var out = [], axisY = 168;
    out.push('<line x1="' +
        L +
        '" y1="' +
        axisY +
        '" x2="' +
        R +
        '" y2="' +
        axisY +
        '" stroke="rgba(238,243,246,0.45)"/>');
    var dec = [
        [1e-9, '1 nm'],
        [1e-8, '10 nm'],
        [1e-7, '100 nm'],
        [1e-6, '1 µm'],
        [1e-5, '10 µm'],
        [1e-4, '100 µm'],
        [1e-3, '1 mm'],
        [1e-2, '1 cm'],
        [1e-1, '10 cm'],
    ];
    dec.forEach(function (d, i) {
        var x = X(d[0]);
        out.push('<line x1="' +
            x +
            '" y1="' +
            (axisY - 6) +
            '" x2="' +
            x +
            '" y2="' +
            (axisY + 6) +
            '" stroke="rgba(238,243,246,0.6)"/><text x="' +
            x +
            '" y="' +
            (axisY + 22) +
            '" text-anchor="middle" font-family="Geist Mono,ui-monospace,monospace" font-size="10.5" letter-spacing="1" fill="#a9bac6">' +
            d[1] +
            '</text>');
        if (i < dec.length - 1)
            for (var k = 2; k < 10; k++) {
                var xx = X(d[0] * k);
                out.push('<line x1="' +
                    xx +
                    '" y1="' +
                    (axisY - 3) +
                    '" x2="' +
                    xx +
                    '" y2="' +
                    (axisY + 3) +
                    '" stroke="rgba(238,243,246,0.25)" stroke-width="0.8"/>');
            }
    });
    [
        [2e-8, 'synapse'],
        [1e-6, 'axon'],
        [2e-5, 'cell body'],
        [2e-3, 'cortical column'],
        [1e-1, 'whole brain'],
    ].forEach(function (a) {
        var x = X(a[0]);
        out.push('<line x1="' +
            x +
            '" y1="' +
            (axisY + 34) +
            '" x2="' +
            x +
            '" y2="' +
            (axisY + 42) +
            '" stroke="rgba(238,243,246,0.35)"/><text x="' +
            x +
            '" y="' +
            (axisY + 56) +
            '" text-anchor="' +
            (a[0] >= 1e-1 ? 'end' : 'middle') +
            '" font-family="Geist Mono,ui-monospace,monospace" font-size="9.5" letter-spacing="1" fill="rgba(238,243,246,0.5)">' +
            a[1].toUpperCase() +
            '</text>');
    });
    [
        ['Electron microscopy', 3e-9, 1e-3, PAL.bluel],
        ['X-ray nanotomography', 3e-8, 5e-3, PAL.bluel],
        ['Lightsheet microscopy', 3e-7, 2e-2, PAL.red],
        ['PS-OCT · tract tracing', 2e-6, 3e-2, PAL.orange],
        ['MRI · fMRI · dMRI', 4e-4, 2.5e-1, PAL.yellow],
        ['EEG · MEG', 5e-3, 2.5e-1, PAL.yellow],
    ].forEach(function (m, i) {
        var y = axisY - 24 - i * 20, xa = X(m[1]), xb = X(m[2]);
        out.push('<line x1="' +
            xa +
            '" y1="' +
            y +
            '" x2="' +
            xb +
            '" y2="' +
            y +
            '" stroke="' +
            m[3] +
            '" stroke-width="6" stroke-linecap="round" opacity="0.9"/><text x="' +
            (xa - 10) +
            '" y="' +
            (y + 4) +
            '" text-anchor="end" font-family="Geist,system-ui,sans-serif" font-size="12" fill="#eef3f6">' +
            m[0] +
            '</text>');
    });
    [
        ['Neuroglancer · precomputed · OME-Zarr · BossDB', 3e-9, 3e-2],
        ['NiiVue · NIfTI · BIDS · TRX · NWB', 2e-5, 2.5e-1],
    ].forEach(function (m, i) {
        var y = axisY + 84 + i * 22, xa = X(m[1]), xb = X(m[2]);
        out.push('<line x1="' +
            xa +
            '" y1="' +
            y +
            '" x2="' +
            xb +
            '" y2="' +
            y +
            '" stroke="rgba(238,243,246,0.55)" stroke-width="2" stroke-linecap="round"/><text x="' +
            xa +
            '" y="' +
            (y + 16) +
            '" font-family="Geist Mono,ui-monospace,monospace" font-size="10" letter-spacing="1" fill="#a9bac6">' +
            m[0].toUpperCase() +
            '</text>');
    });
    svgIn(el, W, H, out.join(''), 'Log-scale ruler from one nanometre to ten centimetres showing the range of each modality and viewer');
};
// palette-mapped tracts: bundles in the four colours instead of RGB direction coding
// connectivity matrix with community structure, sequential ramp
// parcellated cortical surface, abstract: sulcal contours with coloured parcels
// fMRI statistical map: grey anatomy noise with thresholded clusters, orange->yellow
// MEG/EEG: sensor topography + butterfly plot
// EM, lightsheet, PS-OCT tiles (palette-aligned)
// featured publication video slot


global.BrainlifeArt = D; global.BrainlifeArt.PAL = PAL;
})(window);
