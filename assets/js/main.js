/* Pestilli Lab — shared behaviour: nav toggle, scroll reveal, hero animations. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mark current page in nav
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Hero stack: start assembled, explode top-down once.
  var stack = document.querySelector('.hero-stack');
  if (stack && !reduce) {
    stack.classList.add('assembled');
    var parts = Array.prototype.slice.call(stack.querySelectorAll('.hs-part'));
    var steps = Math.max.apply(null, parts.map(function (p) { return +p.dataset.step; }));
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        stack.classList.remove('assembled');
        parts.forEach(function (p) { p.style.transform = 'translateY(var(--lift))'; });
        stack.querySelectorAll('.hs-label, .hs-trace').forEach(function (l) { l.style.opacity = 0; });
        var i = 1;
        function go() {
          parts.filter(function (p) { return +p.dataset.step === i; }).forEach(function (p) {
            p.style.transform = 'none';
            var lab = p.querySelector('.hs-label');
            if (lab) setTimeout(function () { lab.style.opacity = 1; }, 500);
          });
          i += 1;
          if (i <= steps) setTimeout(go, 420);
          else setTimeout(function () { stack.querySelectorAll('.hs-trace').forEach(function (t) { t.style.opacity = 1; }); }, 300);
        }
        setTimeout(go, 500);
      });
    });
  }

  // Hero background: slow drifting fibre bundle (streamlines) in the lab palette.
  var canvas = document.querySelector('canvas.hero-bg');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var colors = ['#005981', '#a9262c', '#e57536', '#f9c926', '#3b9fd0'];
    var fibres = [];
    function resize() {
      var r = canvas.parentNode.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      fibres = [];
      var n = Math.round(W / 26);
      for (var i = 0; i < n; i++) {
        fibres.push({
          y: (i / n) * H * 1.3 - H * 0.15,
          amp: 40 + Math.random() * 90,
          freq: 0.0018 + Math.random() * 0.0022,
          phase: Math.random() * Math.PI * 2,
          speed: (0.00015 + Math.random() * 0.0003) * (Math.random() < 0.5 ? 1 : -1),
          color: colors[i % colors.length],
          alpha: 0.06 + Math.random() * 0.12,
          width: 0.6 + Math.random() * 1.2
        });
      }
    }
    var t0 = performance.now();
    function draw(now) {
      var t = now - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (var i = 0; i < fibres.length; i++) {
        var fb = fibres[i];
        ctx.beginPath();
        ctx.strokeStyle = fb.color;
        ctx.globalAlpha = fb.alpha;
        ctx.lineWidth = fb.width;
        for (var x = -20; x <= W + 20; x += 14) {
          var y = fb.y + Math.sin(x * fb.freq + fb.phase + t * fb.speed) * fb.amp
                       + Math.sin(x * fb.freq * 2.7 + fb.phase * 1.3 - t * fb.speed * 0.6) * fb.amp * 0.25;
          if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }
})();
