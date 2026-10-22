/* Publications page: live PubMed query (E-utilities, no key needed) with a bundled snapshot
   as the instant first render and the fallback. Merges data/extra-publications.js, de-duplicates
   preprints that later appeared as articles, and supports search + year filtering. */
(function () {
  'use strict';
  var list = document.getElementById('pub-list');
  var QUERY = (list && list.dataset.query) || 'Pestilli F[Author]';
  var EU = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  var status = document.getElementById('pub-status');
  var search = document.getElementById('pub-search');
  var yearSel = document.getElementById('pub-year');
  var countEl = document.getElementById('pub-count');
  var all = [];

  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function yearOf(p) { var m = /(\d{4})/.exec(p.pubdate || p.epubdate || ''); return m ? +m[1] : (p.year || 0); }
  function isPreprint(p) { return /preprint/i.test(p.pubtype || '') || /biorxiv|medrxiv|arxiv/i.test(p.journal || ''); }

  function fromSummary(res) {
    return res.uids.map(function (id) {
      var p = res[id];
      var doi = (p.articleids || []).filter(function (a) { return a.idtype === 'doi'; })[0];
      return { pmid: id, title: p.title, authors: (p.authors || []).map(function (a) { return a.name; }).join(', '),
               journal: p.fulljournalname || p.source, source: p.source, pubdate: p.pubdate, epubdate: p.epubdate,
               doi: doi ? doi.value : '', pubtype: (p.pubtype || []).join(';') };
    });
  }

  function merge(pubmed) {
    var excl = window.EXCLUDED_PMIDS || [];
    pubmed = pubmed.filter(function (p) { return excl.indexOf(String(p.pmid)) < 0 && !/Pestilli V\b/.test(p.authors || ''); });
    var items = pubmed.map(function (p) { p.year = yearOf(p); p.preprint = isPreprint(p); return p; });
    (window.EXTRA_PUBLICATIONS || []).forEach(function (e) {
      var dup = items.some(function (p) { return (e.doi && p.doi && p.doi.toLowerCase() === e.doi.toLowerCase()) || norm(p.title) === norm(e.title); });
      if (!dup) items.push({ title: e.title, authors: e.authors, journal: e.journal, year: e.year, doi: e.doi || '', url: e.url || '', pubtype: '', preprint: /preprint/i.test(e.tag || ''), tag: e.tag || '', extra: true });
    });
    // De-duplicate preprint + published pairs by normalised title (keep the published one).
    var byTitle = {};
    items.forEach(function (p) {
      var k = norm(p.title).replace(/\s+/g, ' ');
      if (!byTitle[k] || (byTitle[k].preprint && !p.preprint)) byTitle[k] = p;
    });
    items = Object.keys(byTitle).map(function (k) { return byTitle[k]; });
    items.sort(function (a, b) { return (b.year - a.year) || String(b.pmid || '').localeCompare(String(a.pmid || '')); });
    return items;
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function authorsHtml(a) {
    return esc(a).replace(/Pestilli F\b/g, '<span class="me">Pestilli F</span>');
  }

  function render() {
    var q = norm(search.value);
    var y = yearSel.value;
    var shown = all.filter(function (p) {
      if (y && String(p.year) !== y) return false;
      if (q && norm(p.title + ' ' + p.authors + ' ' + p.journal).indexOf(q) < 0) return false;
      return true;
    });
    countEl.textContent = shown.length + ' of ' + all.length;
    var html = '', cur = null;
    shown.forEach(function (p) {
      if (p.year !== cur) { cur = p.year; html += '<h2 class="pub-year">' + (cur || 'Undated') + '</h2>'; }
      var href = p.doi ? 'https://doi.org/' + p.doi : (p.url || (p.pmid ? 'https://pubmed.ncbi.nlm.nih.gov/' + p.pmid + '/' : '#'));
      var tag = p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : (p.preprint ? '<span class="tag">Preprint</span>' : '');
      var links = '';
      if (p.doi) links += '<a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">DOI</a>';
      if (p.pmid) links += '<a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(p.pmid) + '/" target="_blank" rel="noopener">PubMed</a>';
      if (!p.doi && p.url) links += '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">Link</a>';
      html += '<article class="pub"><div>' +
        '<div class="title">' + tag + '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a></div>' +
        '<div class="authors">' + authorsHtml(p.authors) + '</div>' +
        '<div class="venue">' + esc(p.journal) + (p.pubdate ? ' · ' + esc(p.pubdate) : '') + '</div>' +
        '</div><div class="links">' + links + '</div></article>';
    });
    list.innerHTML = html || '<p class="muted">No publications match.</p>';
  }

  function setAll(items, live) {
    all = items;
    var years = {};
    all.forEach(function (p) { if (p.year) years[p.year] = 1; });
    var keep = yearSel.value;
    yearSel.innerHTML = '<option value="">All years</option>' + Object.keys(years).sort().reverse().map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
    yearSel.value = keep;
    status.className = 'pub-status' + (live ? ' live' : '');
    status.innerHTML = '<span class="dot"></span>' + (live ? 'Live from PubMed' : 'Snapshot ' + (window.PUBMED_SNAPSHOT ? window.PUBMED_SNAPSHOT.fetched : ''));
    render();
  }

  // 1. instant render from snapshot
  if (window.PUBMED_SNAPSHOT) setAll(merge(window.PUBMED_SNAPSHOT.items.slice()), false);

  // 2. live refresh
  function live() {
    fetch(EU + 'esearch.fcgi?db=pubmed&retmode=json&retmax=500&term=' + encodeURIComponent(QUERY))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var ids = j.esearchresult.idlist;
        if (!ids.length) throw new Error('empty');
        var batches = [];
        for (var i = 0; i < ids.length; i += 200) batches.push(ids.slice(i, i + 200));
        return Promise.all(batches.map(function (b) {
          return fetch(EU + 'esummary.fcgi?db=pubmed&retmode=json&id=' + b.join(',')).then(function (r) { return r.json(); });
        }));
      })
      .then(function (parts) {
        var items = [];
        parts.forEach(function (j) { items = items.concat(fromSummary(j.result)); });
        setAll(merge(items), true);
      })
      .catch(function () { /* keep snapshot */ });
  }
  live();

  search.addEventListener('input', render);
  yearSel.addEventListener('change', render);
})();
