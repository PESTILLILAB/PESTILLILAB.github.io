/* Impact page: statistics band + navigable graph. No external libraries.
   Data comes from map-data.js (built by Jekyll from _data and the collections)
   and pubmed-snapshot.js (papers). Nothing here needs editing to add content. */
(function () {
  'use strict';
  var D = window.MAP_DATA || {}, S = D.stats || {};
  var css = getComputedStyle(document.documentElement);
  var C = { blue: '#3b9fd0', red: '#c4474d', orange: '#e57536', yellow: '#f9c926', teal: '#3cb8a8',
            ink: css.getPropertyValue('--ink').trim() || '#eef3f6', muted: css.getPropertyValue('--muted').trim() || '#a9bac6',
            rule: 'rgba(238,243,246,0.14)', paper: 'rgba(238,243,246,0.55)', person: '#eef3f6' };
  var fmt = function (n) { return n == null ? '–' : (n >= 10000 ? (n / 1000).toFixed(1) + 'k' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')); };

  /* ---------------- statistics ---------------- */
  function stat(v, label) { return '<div class="figure"><b>' + fmt(v) + '</b><span>' + label + '</span></div>'; }
  var o = S.owned || {}, d = S.derived || {};
  var sch = D.scholar || {};
  if (o.scholar && o.scholar.citations && (!sch.as_of || String(o.scholar.as_of) >= String(sch.as_of))) sch = Object.assign({}, sch, o.scholar);
  var ownedEl = document.querySelector('[data-tier=owned]'), derivedEl = document.querySelector('[data-tier=derived]');
  if (ownedEl) ownedEl.innerHTML =
    stat((o.papers || {}).total, 'papers on PubMed') +
    (sch && sch.citations
      ? stat(sch.citations, 'citations · h-index ' + sch.h_index + ' · <a href="' + sch.url + '" target="_blank" rel="noopener">Google Scholar</a>, ' + sch.as_of)
      : stat((o.citations || {}).total, 'citations to them' + ((o.citations || {}).h_index ? ' · h-index ' + o.citations.h_index : ''))) +
    stat((o.github || {}).repos, 'public repositories') +
    stat((o.github || {}).stars, 'GitHub stars') +
    stat((o.github || {}).forks, 'forks of lab code') +
    stat((o.github || {}).followers, 'followers of lab accounts');
  if (derivedEl) derivedEl.innerHTML =
    stat((d.citations || {}).people, 'trainees with a publication record') +
    stat((d.citations || {}).works, 'works they have authored') +
    stat((d.citations || {}).total, 'citations to their work') +
    stat((d.github || {}).repos, 'repositories in their accounts') +
    stat(((d.github || {}).stars || 0) + ((d.github || {}).forks || 0), 'stars and forks of their code') +
    stat((d.github || {}).followers, 'followers on GitHub');
  var upd = document.getElementById('stats-updated');
  if (upd) upd.textContent = 'Updated ' + (S.updated || '–') + '. The automatic citation counts come from OpenAlex and run lower than Google Scholar, which also counts preprints and theses; ' + (S.owned && S.owned.scholar ? 'the Scholar figures are read from my profile page' : 'I copy the Scholar figures from my profile by hand') + ' (OpenAlex counts ' + fmt((o.citations || {}).total) + ' for the same papers). Lab-derived citations cover all work by our current and former trainees, not only the work they did here.';

  function barChart(el, series, years, colors, tall) {
    // series: array of {year: value} maps; years: sorted list. Y axis with gridlines on the right; hover shows the value.
    if (!el || !years.length) return;
    var W = 760, H = tall ? 200 : 170, padL = 4, padR = 44, padB = 20, padT = 10, n = years.length, gw = (W - padL - padR) / n, max = 1;
    series.forEach(function (s) { years.forEach(function (y) { max = Math.max(max, s[y] || 0); }); });
    var step = Math.pow(10, Math.floor(Math.log10(max))); if (max / step < 2) step /= 2; else if (max / step > 5) step *= 2;
    var top = Math.ceil(max / step) * step, plotH = H - padB - padT;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" class="bars' + (tall ? ' show-values' : '') + '">';
    for (var v = 0; v <= top; v += step) {
      var gy = padT + plotH - plotH * v / top;
      svg += '<line x1="' + padL + '" x2="' + (W - padR + 4) + '" y1="' + gy + '" y2="' + gy + '" stroke="rgba(238,243,246,0.1)"/>' +
             '<text x="' + (W - padR + 8) + '" y="' + (gy + 3) + '" font-size="10" fill="' + C.muted + '" font-family="Geist Mono, monospace">' + fmt(v) + '</text>';
    }
    years.forEach(function (y, i) {
      var x = padL + i * gw;
      series.forEach(function (s, k) {
        var v = s[y] || 0, h = plotH * v / top, bw = (gw - 3) / series.length;
        svg += '<g class="bar"><rect x="' + (x + k * bw) + '" y="' + (padT + plotH - h) + '" width="' + Math.max(bw - 1, 1) + '" height="' + h + '" fill="' + colors[k] + '" rx="1"/>' +
               '<text class="val" x="' + (x + k * bw + bw / 2) + '" y="' + (padT + plotH - h - 3) + '" text-anchor="middle" font-size="9" fill="' + C.ink + '" font-family="Geist Mono, monospace">' + fmt(v) + '</text><title>' + y + ': ' + fmt(v) + '</title></g>';
      });
      if (n <= 20 || i % Math.ceil(n / 20) === 0) svg += '<text x="' + (x + gw / 2) + '" y="' + (H - 4) + '" text-anchor="middle" font-size="10" fill="' + C.muted + '" font-family="Geist Mono, monospace">' + y + '</text>';
    });
    el.innerHTML = svg + '</svg>';
  }
  var yrs = function (maps, from) { var set = {}; maps.forEach(function (m) { Object.keys(m || {}).forEach(function (y) { if (+y >= from) set[y] = 1; }); }); return Object.keys(set).sort(); };
  var thisYear = new Date().getFullYear();
  var pby = (o.papers || {}).by_year || {}, cby = (sch.by_year && Object.keys(sch.by_year).length ? sch.by_year : (o.citations || {}).by_year) || {}, dby = (d.citations || {}).by_year || {};
  var citSrc = document.querySelector('[data-chart=citations]'); if (citSrc && sch.by_year && Object.keys(sch.by_year).length) { var srcEl = citSrc.parentNode.querySelector('.src'); if (srcEl) srcEl.textContent = 'Sources: Google Scholar (lab-owned), OpenAlex (lab-derived)'; }
  barChart(document.querySelector('[data-chart=papers]'), [pby], yrs([pby], 2008), [C.yellow], true);
  barChart(document.querySelector('[data-chart=citations]'), [cby, dby], yrs([cby, dby], thisYear - 11), [C.yellow, C.blue]);
  var gh = document.querySelector('[data-chart=github]');
  if (gh && o.github && o.github.accounts) {
    var rows = o.github.accounts.slice().sort(function (a, b) { return b.repos - a.repos; });
    var maxv = Math.max.apply(null, rows.map(function (a) { return Math.max(a.repos, a.stars, a.forks); })) || 1;
    var metrics = [['repos', 'repositories', C.muted], ['stars', 'stars', C.yellow], ['forks', 'forks', C.blue]];
    gh.innerHTML = '<div class="hbars">' + rows.map(function (a) {
      return '<div class="hrow"><div class="hlabel"><a href="https://github.com/' + a.login + '" target="_blank" rel="noopener">' + a.login + '</a><span class="muted small">' + (a.kind === 'org' ? 'organization' : 'personal account') + ' · ' + fmt(a.followers) + ' followers</span></div><div class="hset">' +
        metrics.map(function (m) { var v = a[m[0]] || 0; return '<div class="hbar"><i style="width:' + Math.max(1, 100 * v / maxv) + '%;background:' + m[2] + '"></i><b>' + fmt(v) + '</b><span>' + m[1] + '</span></div>'; }).join('') + '</div></div>';
    }).join('') + '</div>';
  }
  var tr = document.querySelector('[data-chart=toprepos]');
  if (tr && o.github && o.github.accounts) {
    var all = [];
    o.github.accounts.forEach(function (a) { (a.top || []).forEach(function (r) { all.push({ owner: a.login, name: r.name, stars: r.stars, forks: r.forks, language: r.language, pushed: r.pushed }); }); });
    all.sort(function (a, b) { return b.stars - a.stars; });
    var maxs = all.length ? all[0].stars : 1;
    tr.innerHTML = '<ol class="toprepos">' + all.slice(0, 8).map(function (r) {
      return '<li><a href="https://github.com/' + r.owner + '/' + r.name + '" target="_blank" rel="noopener"><span class="rname">' + r.owner + '/<b>' + r.name + '</b></span></a><i style="width:' + (100 * r.stars / maxs) + '%"></i><span class="rnum">' + fmt(r.stars) + ' stars · ' + fmt(r.forks) + ' forks' + (r.language ? ' · ' + r.language : '') + '</span></li>';
    }).join('') + '</ol>';
  }

  /* ---------------- graph data ---------------- */
  var nodes = [], links = [], byId = {};
  function add(n) { if (byId[n.id]) return byId[n.id]; byId[n.id] = n; nodes.push(n); return n; }
  function link(a, b, w) { if (a && b && a !== b) links.push({ s: a, t: b, w: w || 1 }); }
  var areaColor = {};
  (D.areas || []).forEach(function (a) {
    areaColor[a.slug] = C[a.accent] || C.blue;
    add({ id: 'area:' + a.slug, type: 'area', label: a.title, sub: a.summary, url: a.url, color: areaColor[a.slug], r: 16 });
  });
  add({ id: 'area:other', type: 'area', label: 'Other topics', sub: 'Papers that do not match an area by title.', url: null, color: C.muted, r: 10 });
  (D.projects || []).forEach(function (p) {
    var n = add({ id: 'project:' + p.slug, type: 'project', label: p.title.replace(/ · .*$/, ''), sub: p.role, url: p.url, ext: p.website, color: C.orange, r: 10 });
    (p.areas || []).forEach(function (a) { link(n, byId['area:' + a], 2); });
  });
  (D.resources || []).forEach(function (r) {
    if (!r.area) return;
    var n = add({ id: 'resource:' + r.name, type: 'resource', label: r.name, sub: r.description, url: r.url, ext: r.repo, color: C.teal, r: 7 });
    link(n, byId['area:' + r.area], 1.5);
    if (r.project) link(n, byId['project:' + r.project], 1.5);
  });
  // people: match PubMed author strings ("Pestilli F") by surname + first initial, or the explicit pubmed_name
  function pubName(p) {
    if (p.pubmed_name) return p.pubmed_name.toLowerCase();
    var clean = p.name.replace(/\(.*?\)/g, '').replace(/[’'.]/g, '').trim().split(/\s+/);
    return (clean[clean.length - 1] + ' ' + clean[0][0]).toLowerCase();
  }
  var peopleByKey = {};
  (D.people || []).forEach(function (p) {
    var n = { id: 'person:' + p.name, type: p.role === 'pi' ? 'pi' : 'person', role: p.role, label: p.name, sub: p.position || '', url: p.url, ext: p.github, color: p.role === 'pi' ? C.yellow : C.person, r: p.role === 'pi' ? 12 : 5, _key: pubName(p) };
    peopleByKey[n._key] = n;
  });
  // papers from the PubMed snapshot
  var rules = (D.rules || {}).keywords || {}, overrides = (D.rules || {}).overrides || {};
  var excl = {}; (D.excludePmids || []).forEach(function (x) { excl[String(x)] = 1; });
  var items = ((window.PUBMED_SNAPSHOT || {}).items || []).filter(function (it) { return !excl[it.pmid]; });
  items.forEach(function (it) {
    var title = (it.title || '').toLowerCase(), scores = {}, best = 0;
    Object.keys(rules).forEach(function (a) {
      var s = 0; (rules[a] || []).forEach(function (k) { if (title.indexOf(String(k).toLowerCase()) >= 0) s++; });
      scores[a] = s; best = Math.max(best, s);
    });
    var areas = overrides[it.pmid] ? [String(overrides[it.pmid])] : (best ? Object.keys(scores).filter(function (a) { return scores[a] === best; }) : ['other']);
    var year = (it.pubdate || '').slice(0, 4);
    var n = add({ id: 'paper:' + it.pmid, type: 'paper', label: it.title, sub: (it.source || it.journal || '') + (year ? ' · ' + year : ''), authors: it.authors,
                  url: it.doi ? 'https://doi.org/' + it.doi : 'https://pubmed.ncbi.nlm.nih.gov/' + it.pmid + '/', color: areaColor[areas[0]] || C.muted, r: 3.2 });
    areas.forEach(function (a) { link(n, byId['area:' + a] || byId['area:other'], 0.6); });
    (it.authors || '').split(/,\s*/).forEach(function (au) {
      var key = au.toLowerCase().replace(/\s+(\w)\w*$/, ' $1');   // "Pestilli FM" -> "pestilli f"
      var p = peopleByKey[key];
      if (p && p.type !== 'pi') { add(p); link(p, n, 0.8); }
    });
  });
  // resources that list their papers
  (D.resources || []).forEach(function (r) { (r.pmids || []).forEach(function (pm) { link(byId['resource:' + r.name], byId['paper:' + pm], 1); }); });
  // the PI connects to the areas, not to every paper (he is on all of them)
  var pi = Object.keys(peopleByKey).map(function (k) { return peopleByKey[k]; }).filter(function (p) { return p.type === 'pi'; })[0];
  if (pi) { add(pi); (D.areas || []).forEach(function (a) { link(pi, byId['area:' + a.slug], 1.2); }); }
  nodes.forEach(function (n) { n.deg = 0; }); links.forEach(function (l) { l.s.deg++; l.t.deg++; });
  nodes.forEach(function (n) { if (n.type === 'person') n.r = 4 + Math.min(6, Math.sqrt(n.deg)); });

  /* ---------------- force layout on a canvas ---------------- */
  var canvas = document.getElementById('map'); if (!canvas) return;
  var ctx = canvas.getContext('2d'), panel = document.getElementById('map-panel');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), zoom = 1, tx = 0, ty = 0;
  var hidden = {}, selected = null, hover = null, query = '';
  function resize() {
    var rect = canvas.parentNode.getBoundingClientRect();
    W = Math.max(320, Math.floor(rect.width)); H = Math.max(420, Math.min(760, Math.floor(window.innerHeight * 0.72)));
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  resize(); window.addEventListener('resize', function () { resize(); draw(); });
  nodes.forEach(function (n, i) { var a = i * 2.4, r = Math.sqrt(i) * 14 + 20; n.x = W / 2 + Math.cos(a) * r; n.y = H / 2 + Math.sin(a) * r; n.vx = 0; n.vy = 0; });
  // areas start on a ring so the layout is stable from the first frame
  var areaNodes = nodes.filter(function (n) { return n.type === 'area'; });
  areaNodes.forEach(function (n, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / areaNodes.length; n.x = W / 2 + Math.cos(a) * Math.min(W, H) * 0.3; n.y = H / 2 + Math.sin(a) * Math.min(W, H) * 0.3; });
  var alpha = 1, running = true;
  function visible(n) { return !hidden[n.type === 'pi' ? 'person' : n.type]; }
  function step() {
    var vis = nodes.filter(visible);
    // repulsion (simple O(n^2); fine for a few hundred nodes)
    for (var i = 0; i < vis.length; i++) {
      var a = vis[i];
      for (var j = i + 1; j < vis.length; j++) {
        var b = vis[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01;
        if (d2 > 90000) continue;
        var f = 1400 / d2 * (a.r + b.r) / 10, d = Math.sqrt(d2), fx = dx / d * f, fy = dy / d * f;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
      }
    }
    links.forEach(function (l) {
      if (!visible(l.s) || !visible(l.t)) return;
      var dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      var ideal = l.s.r + l.t.r + (l.s.type === 'paper' || l.t.type === 'paper' ? 26 : 70);
      var f = (d - ideal) * 0.02 * l.w, fx = dx / d * f, fy = dy / d * f;
      l.s.vx += fx; l.s.vy += fy; l.t.vx -= fx; l.t.vy -= fy;
    });
    vis.forEach(function (n) {
      n.vx += (W / 2 - n.x) * 0.002; n.vy += (H / 2 - n.y) * 0.002;   // gravity to the centre
      if (n !== dragging) { n.x += n.vx * alpha; n.y += n.vy * alpha; }
      n.vx *= 0.6; n.vy *= 0.6;
    });
    alpha = Math.max(0.03, alpha * 0.985);
  }
  function worldToScreen(x, y) { return [(x - W / 2) * zoom + W / 2 + tx, (y - H / 2) * zoom + H / 2 + ty]; }
  function screenToWorld(x, y) { return [(x - W / 2 - tx) / zoom + W / 2, (y - H / 2 - ty) / zoom + H / 2]; }
  function matches(n) { return query && (n.label + ' ' + (n.sub || '') + ' ' + (n.authors || '')).toLowerCase().indexOf(query) >= 0; }
  function neighbors(n) { var s = {}; links.forEach(function (l) { if (l.s === n) s[l.t.id] = 1; if (l.t === n) s[l.s.id] = 1; }); return s; }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var focus = selected || hover, nb = focus ? neighbors(focus) : null;
    links.forEach(function (l) {
      if (!visible(l.s) || !visible(l.t)) return;
      var a = worldToScreen(l.s.x, l.s.y), b = worldToScreen(l.t.x, l.t.y);
      var on = focus && (l.s === focus || l.t === focus);
      ctx.strokeStyle = on ? (focus.color === C.person ? C.yellow : focus.color) : C.rule; ctx.lineWidth = on ? 1.4 : 0.6; ctx.globalAlpha = focus && !on ? 0.35 : 1;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    nodes.forEach(function (n) {
      if (!visible(n)) return;
      var p = worldToScreen(n.x, n.y), r = n.r * Math.sqrt(zoom);
      var dim = (focus && n !== focus && !nb[n.id]) || (query && !matches(n));
      ctx.globalAlpha = dim ? 0.25 : 1;
      ctx.fillStyle = n.type === 'paper' ? n.color : n.color; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill();
      if (n.type === 'person' || n.type === 'pi') { ctx.strokeStyle = C.yellow; ctx.lineWidth = n.type === 'pi' ? 2 : 1; ctx.stroke(); }
      if (n === focus) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
      var showLabel = n.type === 'area' || n.type === 'project' || n.type === 'pi' || n === focus || (nb && nb[n.id] && n.type !== 'paper') || (query && matches(n)) || (zoom > 1.8 && n.type !== 'paper');
      if (showLabel) {
        ctx.font = (n.type === 'area' ? '600 13px' : '500 11px') + ' Geist, system-ui, sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        var t = n.type === 'paper' ? n.label.slice(0, 60) + (n.label.length > 60 ? '…' : '') : n.label;
        ctx.fillText(t, p[0] + r + 5, p[1]);
      }
    });
    ctx.globalAlpha = 1;
  }
  function loop() { if (running) { step(); draw(); } requestAnimationFrame(loop); }
  loop();

  /* ---------------- interaction ---------------- */
  var dragging = null, dragMoved = false, panStart = null;
  function nodeAt(sx, sy) {
    var best = null, bd = 1e9;
    nodes.forEach(function (n) { if (!visible(n)) return; var p = worldToScreen(n.x, n.y), dx = p[0] - sx, dy = p[1] - sy, d = dx * dx + dy * dy, rr = Math.pow(n.r * Math.sqrt(zoom) + 4, 2); if (d < rr && d < bd) { best = n; bd = d; } });
    return best;
  }
  function pos(e) { var r = canvas.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return [t.clientX - r.left, t.clientY - r.top]; }
  canvas.addEventListener('mousemove', function (e) {
    var p = pos(e);
    if (dragging) { var w = screenToWorld(p[0], p[1]); dragging.x = w[0]; dragging.y = w[1]; dragMoved = true; alpha = Math.max(alpha, 0.3); return; }
    if (panStart) { tx = panStart[2] + p[0] - panStart[0]; ty = panStart[3] + p[1] - panStart[1]; return; }
    var n = nodeAt(p[0], p[1]); canvas.style.cursor = n ? 'pointer' : 'grab'; if (n !== hover) { hover = n; }
  });
  canvas.addEventListener('mousedown', function (e) { var p = pos(e), n = nodeAt(p[0], p[1]); dragMoved = false; if (n) dragging = n; else panStart = [p[0], p[1], tx, ty]; });
  window.addEventListener('mouseup', function () { if (dragging && !dragMoved) select(dragging); dragging = null; panStart = null; });
  canvas.addEventListener('dblclick', function (e) { var p = pos(e), n = nodeAt(p[0], p[1]); if (n && (n.url || n.ext)) window.open(n.ext && n.type === 'paper' ? n.url : (n.url || n.ext), n.url && n.url.charAt(0) === '/' ? '_self' : '_blank'); });
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); var k = e.deltaY < 0 ? 1.12 : 1 / 1.12; zoom = Math.min(5, Math.max(0.4, zoom * k)); }, { passive: false });
  canvas.addEventListener('mouseleave', function () { hover = null; });
  function select(n) {
    selected = n; alpha = Math.max(alpha, 0.1);
    if (!panel) return;
    var nb = neighbors(n), groups = {};
    nodes.forEach(function (m) { if (nb[m.id]) { var k = m.type === 'pi' ? 'person' : m.type; (groups[k] = groups[k] || []).push(m); } });
    var typeName = { area: 'Research area', project: 'Project', resource: 'Software & data', person: 'Person', pi: 'Principal investigator', paper: 'Paper' };
    var h = '<p class="eyebrow">' + typeName[n.type] + '</p><h3>' + n.label + '</h3>' + (n.sub ? '<p class="muted small">' + n.sub + '</p>' : '') +
      (n.authors ? '<p class="small">' + n.authors + '</p>' : '') +
      '<p class="links-row small">' + (n.url ? '<a href="' + n.url + '"' + (n.url.charAt(0) === '/' ? '' : ' target="_blank" rel="noopener"') + '>Open →</a>' : '') + (n.ext ? '<a href="' + n.ext + '" target="_blank" rel="noopener">' + (n.type === 'person' || n.type === 'pi' ? 'GitHub' : 'Website') + '</a>' : '') + '</p>';
    Object.keys(groups).forEach(function (k) {
      h += '<h4>' + (typeName[k] || k) + (groups[k].length > 1 ? 's' : '') + ' · ' + groups[k].length + '</h4><ul>' +
        groups[k].sort(function (a, b) { return a.label.localeCompare(b.label); }).slice(0, 40).map(function (m) { return '<li><a href="#" data-node="' + m.id + '">' + (m.type === 'paper' ? m.label.slice(0, 90) : m.label) + '</a></li>'; }).join('') +
        (groups[k].length > 40 ? '<li class="muted">… and ' + (groups[k].length - 40) + ' more</li>' : '') + '</ul>';
    });
    panel.innerHTML = h;
    panel.querySelectorAll('[data-node]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var m = byId[a.getAttribute('data-node')]; if (m) { select(m); centerOn(m); } }); });
  }
  function centerOn(n) { tx = -(n.x - W / 2) * zoom; ty = -(n.y - H / 2) * zoom; }
  // filters
  var filters = document.getElementById('map-filters');
  if (filters) {
    [['area', 'Areas', C.blue], ['project', 'Projects', C.orange], ['resource', 'Software & data', C.teal], ['person', 'People', C.person], ['paper', 'Papers', C.paper]].forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip on'; b.innerHTML = '<i style="background:' + f[2] + '"></i>' + f[1];
      b.addEventListener('click', function () { hidden[f[0]] = !hidden[f[0]]; b.classList.toggle('on', !hidden[f[0]]); alpha = Math.max(alpha, 0.3); });
      filters.appendChild(b);
    });
  }
  var search = document.getElementById('map-search');
  if (search) search.addEventListener('input', function () { query = search.value.trim().toLowerCase(); });
  // deep link: /impact/#node=person:Name or #node=paper:PMID
  var m = /node=([^&]+)/.exec(location.hash); if (m) { var target = byId[decodeURIComponent(m[1])]; if (target) { setTimeout(function () { select(target); centerOn(target); }, 1200); } }
})();
