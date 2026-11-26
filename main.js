/* The Pharmacist — landing page behaviour */
(function () {
  'use strict';

  /* Fill these in when the listings and contact address are live.
     Empty values keep the buttons in their "coming soon" state. */
  var LINKS = {
    playStore: '',
    appStore: '',
    contactEmail: ''
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  /* ---------- Header ---------- */
  var header = $('#siteHeader');
  var toggle = $('#menuToggle');
  var nav = $('#navLinks');
  var progress = $('#progress');

  function syncHeader() {
    header.classList.toggle('is-solid', window.scrollY > 30 || nav.classList.contains('open'));
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    syncHeader();
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Store and contact links ---------- */
  $$('[data-store]').forEach(function (btn) {
    var url = LINKS[btn.dataset.store];
    if (!url) return;
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.removeAttribute('aria-disabled');
    $('small', btn).textContent = btn.dataset.store === 'playStore' ? 'Get it on' : 'Download on the';
  });
  if (LINKS.contactEmail) {
    var contact = $('#contactBtn');
    contact.href = 'mailto:' + LINKS.contactEmail;
    contact.hidden = false;
  }

  if (!finePointer) $('#heroHint').textContent = 'Tap anywhere up here to drop more capsules.';

  /* ---------- Hero headline: words drop in one by one ---------- */
  var title = $('#heroTitle');
  var words = title.textContent.trim().split(/\s+/);
  title.setAttribute('aria-label', title.textContent.trim());
  title.textContent = '';
  words.forEach(function (w, i) {
    var span = document.createElement('span');
    span.className = 'word';
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--i', i);
    span.textContent = w;
    title.appendChild(span);
    if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
  });

  /* ---------- Headings: split into words that rise out of a mask ---------- */
  (function splitHeadings() {
    var heads = $$('.section-heading h2, .intro-copy h2, .cta-panel h2');
    heads.forEach(function (h) {
      var k = 0;
      var label = h.textContent.replace(/\s+/g, ' ').trim();
      Array.prototype.slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span');
          var inner = document.createElement('span');
          outer.className = 'hw';
          outer.setAttribute('aria-hidden', 'true');
          inner.style.setProperty('--k', k);
          inner.textContent = part;
          k += 1;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        h.replaceChild(frag, node);
      });
      h.setAttribute('aria-label', label);
      h.classList.add('split');
      h.classList.remove('drop');
      var wrap = h.parentElement;
      if (wrap.classList.contains('section-heading')) {
        wrap.classList.remove('drop');
        var p = $('p', wrap);
        if (p) { p.classList.add('drop'); p.style.setProperty('--r', '0deg'); }
      }
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      heads.forEach(function (h) { io.observe(h); });
    } else {
      heads.forEach(function (h) { h.classList.add('in'); });
    }
  })();

  /* ---------- Drop-in reveals ---------- */
  var drops = $$('.drop');
  drops.forEach(function (el) {
    var siblings = $$(':scope > .drop', el.parentElement);
    el.style.setProperty('--i', Math.max(0, siblings.indexOf(el)));
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var dropObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        dropObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    drops.forEach(function (el) { dropObserver.observe(el); });
  } else {
    drops.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Hero phone: the order flow ---------- */
  (function demo() {
    var scenes = $$('.scene');
    var dots = $$('.scene-dots button');
    var typed = $('#typed');
    var qty = $('#qty');
    var query = typed.textContent;
    var hold = [4300, 3600, 3400, 3600];
    var current = 0;
    var timer = null;
    var typeTimer = null;
    var qtyTimer = null;
    var visible = true;

    function typeQuery() {
      clearInterval(typeTimer);
      var n = 0;
      typed.textContent = '';
      typeTimer = setInterval(function () {
        n += 1;
        typed.textContent = query.slice(0, n);
        if (n >= query.length) clearInterval(typeTimer);
      }, 55);
    }
    function countQty() {
      clearInterval(qtyTimer);
      var n = 1;
      qty.textContent = n;
      qtyTimer = setInterval(function () {
        n += 1;
        qty.textContent = n;
        if (n >= 10) clearInterval(qtyTimer);
      }, 90);
    }
    function schedule() {
      clearTimeout(timer);
      if (reduceMotion || !visible || document.hidden) return;
      timer = setTimeout(function () { show((current + 1) % scenes.length); }, hold[current]);
    }
    function show(n) {
      current = n;
      scenes.forEach(function (s, k) { s.classList.toggle('is-active', k === n); });
      dots.forEach(function (d, k) {
        d.classList.toggle('is-active', k === n);
        d.setAttribute('aria-pressed', String(k === n));
      });
      if (!reduceMotion) {
        if (n === 0) typeQuery();
        if (n === 1) countQty();
      }
      schedule();
    }
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(Number(d.dataset.go)); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.2 }).observe($('#demoPhone'));
    }
    document.addEventListener('visibilitychange', schedule);
    show(0);
  })();

  /* ---------- Role switch ---------- */
  (function roles() {
    var sw = $('.role-switch');
    var tabs = $$('[role="tab"]', sw);
    $$('.bento').forEach(function (grid) {
      $$('.card', grid).forEach(function (card, i) { card.style.setProperty('--i', i); });
    });
    $$('.grid-sheet i, .viz-chart i').forEach(function (el) {
      el.style.setProperty('--n', Array.prototype.indexOf.call(el.parentElement.children, el));
    });
    function select(tab, focus) {
      var role = tab.id.replace('tab-', '');
      sw.dataset.active = role;
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('is-active', on);
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      });
    });

    var accept = $('#acceptBtn');
    accept.addEventListener('click', function () {
      if (accept.classList.contains('is-done')) return;
      accept.classList.add('is-done');
      accept.textContent = 'Accepted. Retailer notified.';
      var newOrders = $('#newOrders');
      newOrders.textContent = String(Number(newOrders.textContent) - 1);
    });
  })();

  /* ---------- How it works: the capsule follows the scroll ---------- */
  (function steps() {
    var list = $('#steps');
    var rail = $('.rail', list);
    var items = $$('.step', list);
    var ghost = $('#ghostNum');
    var shown = 1;
    var ticking = false;
    function update() {
      ticking = false;
      var r = rail.getBoundingClientRect();
      if (r.height === 0) return;
      var p = clamp((window.innerHeight * 0.55 - r.top) / r.height, 0, 1);
      list.style.setProperty('--p', p.toFixed(4));
      var reach = r.top + p * r.height + 6;
      items.forEach(function (item) {
        var no = $('.step-no', item).getBoundingClientRect();
        item.classList.toggle('is-on', no.top + no.height / 2 <= reach);
      });
      var active = Math.max(1, $$('.step.is-on', list).length);
      if (active !== shown) {
        shown = active;
        ghost.textContent = active;
        ghost.classList.remove('pop');
        void ghost.offsetWidth;
        ghost.classList.add('pop');
      }
    }
    function request() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  })();

  /* ---------- Tickers: repeat the content so the loop is seamless ---------- */
  $$('[data-ticker]').forEach(function (track) {
    track.innerHTML += track.innerHTML + track.innerHTML + track.innerHTML;
  });

  /* ---------- Cursor spotlight and tilt ---------- */
  if (finePointer) {
    $$('.card, [data-glow]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        card.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--ty', (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2) + 'deg');
        el.style.setProperty('--tx', (((e.clientY - r.top) / r.height - 0.5) * -16).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--ty', '0deg');
        el.style.setProperty('--tx', '0deg');
      });
    });
  }

  /* ---------- Text that lights up word by word as it scrolls past ---------- */
  (function wordReveal() {
    var blocks = $$('[data-reveal-words]').map(function (el) {
      var text = el.textContent.trim();
      el.setAttribute('aria-label', text);
      el.textContent = '';
      var spans = text.split(/\s+/).map(function (w, i, all) {
        var s = document.createElement('span');
        s.className = 'w';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = w;
        el.appendChild(s);
        if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
        return s;
      });
      return { el: el, spans: spans };
    });
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      blocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        var p = clamp((vh * 0.88 - r.top) / (vh * 0.5), 0, 1);
        var lit = Math.round(p * b.spans.length);
        b.spans.forEach(function (s, i) { s.classList.toggle('lit', i < lit); });
      });
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  })();

  /* ---------- Count-up facts ---------- */
  (function counters() {
    var els = $$('[data-count]');
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var target = Number(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var start = performance.now();
        var dur = target > 10 ? 1400 : 700;
        (function tick(now) {
          var t = clamp((now - start) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { el.textContent = '0' + (el.dataset.suffix || ''); io.observe(el); });
  })();

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.btn, .nav-links .nav-cta').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.translate = (dx * 0.28).toFixed(1) + 'px ' + (dy * 0.4).toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = '0px 0px'; });
    });
  }

  /* ---------- Drifting capsules in the dark sections ---------- */
  if (!reduceMotion) {
    $$('.how, .ecosystem, .site-footer').forEach(function (sec) {
      var box = document.createElement('div');
      box.className = 'motes';
      box.setAttribute('aria-hidden', 'true');
      for (var n = 0; n < 12; n += 1) {
        var m = document.createElement('i');
        m.style.setProperty('--l', (Math.random() * 100).toFixed(1) + '%');
        m.style.setProperty('--s', (7 + Math.random() * 9).toFixed(1) + 'px');
        m.style.setProperty('--t', (14 + Math.random() * 16).toFixed(1) + 's');
        m.style.setProperty('--dl', (-Math.random() * 30).toFixed(1) + 's');
        m.style.setProperty('--c', n % 3 === 0 ? '#f4c95d' : '#7fe9d6');
        box.appendChild(m);
      }
      sec.insertBefore(box, sec.firstChild);
    });
  }

  /* ---------- Footer wordmark: letters drop in ---------- */
  (function footerWord() {
    var word = $('.footer-word');
    var text = word.textContent;
    word.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'fl';
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      word.appendChild(s);
    });
    if ('IntersectionObserver' in window && !reduceMotion) {
      new IntersectionObserver(function (entries, io) {
        if (!entries[0].isIntersecting) return;
        word.classList.add('in');
        io.disconnect();
      }, { threshold: 0.25 }).observe(word);
    } else {
      word.classList.add('in');
    }
  })();

  /* ---------- Scroll-linked motion ---------- */
  (function scrollFx() {
    var hero = $('#home');
    var heroGrid = $('.hero-grid');
    var tracks = $$('.ticker-track');
    var foot = $('.footer-word');
    var flow = $('.flow');
    var mark = $('.intro-mark');
    var pillars = $('#value');
    var grid = $('.pillar-grid', pillars);
    var extraX = 0;
    var links = $$('a:not(.nav-cta)', nav);
    var targets = links.map(function (l) { return document.querySelector(l.getAttribute('href')); });
    var lastSection = $('#why-us');
    var ind = document.createElement('span');
    ind.className = 'nav-ind';
    ind.setAttribute('aria-hidden', 'true');
    nav.insertBefore(ind, nav.firstChild);
    var ticking = false;

    function layout() {
      var pin = !reduceMotion && window.innerWidth > 960 && window.innerHeight >= 680;
      pillars.classList.toggle('is-h', pin);
      if (pin) {
        extraX = Math.max(0, grid.offsetWidth - window.innerWidth);
        pillars.style.height = (window.innerHeight + extraX) + 'px';
      } else {
        extraX = 0;
        pillars.style.height = '';
        pillars.style.removeProperty('--x');
      }
      update();
    }

    function update() {
      ticking = false;
      var y = window.scrollY;
      var vh = window.innerHeight;
      var r;

      var active = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= vh * 0.45) active = i; });
      if (lastSection.getBoundingClientRect().top <= vh * 0.45) active = -1;
      if (active >= 0) {
        ind.style.left = links[active].offsetLeft + 'px';
        ind.style.width = links[active].offsetWidth + 'px';
        ind.style.opacity = '1';
      } else {
        ind.style.opacity = '0';
      }

      if (extraX > 0) {
        r = pillars.getBoundingClientRect();
        var hp = clamp(-r.top / extraX, 0, 1);
        pillars.style.setProperty('--x', (-hp * extraX).toFixed(1) + 'px');
        pillars.style.setProperty('--hp', hp.toFixed(3));
      }

      r = flow.getBoundingClientRect();
      flow.style.setProperty('--draw', reduceMotion ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.55), 0, 1).toFixed(3));

      if (reduceMotion) return;

      var hh = hero.offsetHeight;
      if (y <= hh) {
        heroGrid.style.translate = '0 ' + (y * 0.2).toFixed(1) + 'px';
        heroGrid.style.opacity = clamp(1 - (y / hh) * 1.3, 0, 1).toFixed(3);
      }
      var shift = clamp(y * 0.14, 0, 420);
      if (tracks[0]) tracks[0].style.translate = shift.toFixed(1) + 'px 0';
      if (tracks[1]) tracks[1].style.translate = (-shift).toFixed(1) + 'px 0';

      r = mark.getBoundingClientRect();
      mark.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -0.09).toFixed(1) + 'px';

      r = foot.getBoundingClientRect();
      foot.style.translate = ((1 - clamp((vh - r.top) / (r.height * 0.7), 0, 1)) * 14).toFixed(2) + '% 0';
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    layout();
  })();

  /* ---------- Off-screen sections stop animating ---------- */
  if ('IntersectionObserver' in window) {
    (function pauseOffscreen() {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          el.classList.toggle('is-off', !entry.isIntersecting);
          $$('svg.flow', el).forEach(function (svg) {
            if (!svg.pauseAnimations) return;
            if (entry.isIntersecting) svg.unpauseAnimations(); else svg.pauseAnimations();
          });
        });
      }, { rootMargin: '120px 0px' });
      $$('main > section, .tickers, .site-footer').forEach(function (el) { io.observe(el); });
    })();
  }

  /* ---------- Hero: capsules drop, pile up, and can be thrown ---------- */
  (function pills() {
    var hero = $('#home');
    var canvas = $('#pillCanvas');
    var M = window.Matter;
    if (!M || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var engine = M.Engine.create({ enableSleeping: true });
    var world = engine.world;
    var W = 0, H = 0, dpr = 1;
    var walls = [];
    var bodies = [];
    var MAX_PILLS = 70;
    var STEP = 1000 / 60;
    var SKINS = [
      ['#ffffff', '#c9eee6'],
      ['#f4c95d', '#ffffff'],
      ['#064b48', '#c9eee6'],
      ['#c9eee6', '#ffffff'],
      ['#ffffff', '#f4c95d']
    ];
    var running = false;
    var onScreen = true;
    var rafId = 0;

    function resize() {
      W = hero.clientWidth;
      H = hero.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      M.Composite.remove(world, walls);
      var opts = { isStatic: true };
      walls = [
        M.Bodies.rectangle(W / 2, H + 40, W + 400, 80, opts),
        M.Bodies.rectangle(-40, H / 2 - H, 80, H * 4, opts),
        M.Bodies.rectangle(W + 40, H / 2 - H, 80, H * 4, opts)
      ];
      M.Composite.add(world, walls);
      bodies.forEach(function (b) {
        M.Sleeping.set(b, false);
        if (b.position.y > H || b.position.x < 0 || b.position.x > W) {
          M.Body.setPosition(b, { x: 40 + Math.random() * (W - 80), y: -40 });
          M.Body.setVelocity(b, { x: 0, y: 0 });
        }
      });
    }

    function spawn(x, y) {
      var isCapsule = Math.random() < 0.68;
      var skin = SKINS[Math.floor(Math.random() * SKINS.length)];
      var common = { restitution: 0.38, friction: 0.35, frictionAir: 0.012, density: 0.0016, angle: Math.random() * Math.PI };
      var body;
      if (isCapsule) {
        var h = 20 + Math.random() * 6;
        var w = h * (2.25 + Math.random() * 0.5);
        common.chamfer = { radius: h / 2 - 0.5 };
        body = M.Bodies.rectangle(x, y, w, h, common);
        body.pill = { kind: 'capsule', w: w, h: h, a: skin[0], b: skin[1] };
      } else {
        var r = 12 + Math.random() * 5;
        body = M.Bodies.circle(x, y, r, common);
        body.pill = { kind: 'tablet', r: r, a: skin[1] === '#ffffff' ? skin[0] : skin[1] };
      }
      M.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
      bodies.push(body);
      M.Composite.add(world, body);
      if (bodies.length > MAX_PILLS) M.Composite.remove(world, bodies.shift());
      wake();
      return body;
    }

    // Each pill is painted once (shadow included) to its own small canvas,
    // then stamped every frame. Per-frame shadow blur was the costly part.
    function makeSprite(p) {
      var pad = 16;
      var w = (p.kind === 'capsule' ? p.w : p.r * 2) + pad * 2;
      var h = (p.kind === 'capsule' ? p.h : p.r * 2) + pad * 2;
      var cv = document.createElement('canvas');
      cv.width = Math.ceil(w * dpr);
      cv.height = Math.ceil(h * dpr);
      var g = cv.getContext('2d');
      g.scale(dpr, dpr);
      g.translate(w / 2, h / 2);
      g.shadowColor = 'rgba(2, 48, 45, .32)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      if (p.kind === 'capsule') {
        var r = p.h / 2;
        g.beginPath();
        g.moveTo(-p.w / 2 + r, -r);
        g.lineTo(p.w / 2 - r, -r);
        g.arc(p.w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
        g.lineTo(-p.w / 2 + r, r);
        g.arc(-p.w / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
        g.closePath();
        g.fillStyle = p.a;
        g.fill();
        g.shadowColor = 'transparent';
        g.clip();
        g.fillStyle = p.b;
        g.fillRect(0, -p.h / 2, p.w / 2, p.h);
        g.fillStyle = 'rgba(255, 255, 255, .38)';
        g.fillRect(-p.w / 2, -p.h / 2 + 3, p.w, 3);
      } else {
        g.beginPath();
        g.arc(0, 0, p.r, 0, Math.PI * 2);
        g.fillStyle = p.a;
        g.fill();
        g.shadowColor = 'transparent';
        g.strokeStyle = 'rgba(6, 75, 72, .22)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(-p.r * 0.62, 0);
        g.lineTo(p.r * 0.62, 0);
        g.stroke();
      }
      p.img = cv;
      p.iw = w;
      p.ih = h;
      p.dpr = dpr;
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < bodies.length; i += 1) {
        var b = bodies[i];
        var p = b.pill;
        if (!p.img || p.dpr !== dpr) makeSprite(p);
        var cos = Math.cos(b.angle) * dpr;
        var sin = Math.sin(b.angle) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, b.position.x * dpr, b.position.y * dpr);
        ctx.drawImage(p.img, -p.iw / 2, -p.ih / 2, p.iw, p.ih);
      }
    }

    var raining = false;
    var grab = null;
    function frame() {
      rafId = 0;
      if (!running) return;
      M.Engine.update(engine, STEP);
      draw();
      var busy = raining || Boolean(grab && grab.body);
      for (var i = 0; !busy && i < bodies.length; i += 1) {
        if (!bodies[i].isSleeping) busy = true;
      }
      // Nothing moving: stop until something wakes the pile.
      if (busy) rafId = requestAnimationFrame(frame);
    }
    function wake() {
      if (running && !rafId) rafId = requestAnimationFrame(frame);
    }
    function setRunning() {
      var should = onScreen && !document.hidden && !reduceMotion;
      if (should === running) return;
      running = should;
      if (running && !rafId) rafId = requestAnimationFrame(frame);
    }

    resize();
    var initial = W < 700 ? 14 : W < 1100 ? 24 : 34;

    if (reduceMotion) {
      // No motion: settle the pile off-screen and show the resting state.
      for (var k = 0; k < initial; k += 1) spawn(40 + Math.random() * (W - 80), H - 60 - Math.random() * 260);
      for (var s = 0; s < 500; s += 1) M.Engine.update(engine, STEP);
      draw();
      window.addEventListener('resize', function () { resize(); for (var s2 = 0; s2 < 300; s2 += 1) M.Engine.update(engine, STEP); draw(); });
      return;
    }

    var dropped = 0;
    raining = true;
    var rainFrom = Date.now() + 1900;
    var rain = setInterval(function () {
      if (dropped >= initial) { raining = false; clearInterval(rain); return; }
      if (!running || Date.now() < rainFrom) return;
      spawn(30 + Math.random() * (W - 60), -30 - Math.random() * 60);
      dropped += 1;
    }, 105);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        setRunning();
      }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', setRunning);
    setRunning();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); wake(); }, 120);
    });

    function localPoint(e) {
      var rect = hero.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function isControl(target) {
      return Boolean(target.closest('a, button, .phone, .chip'));
    }

    var draggedAt = 0;
    if (finePointer) {
      var mouse = M.Mouse.create(hero);
      // Matter swallows wheel and touch events by default; give scrolling back to the page.
      ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach(function (t) { hero.removeEventListener(t, mouse.mousewheel); });
      hero.removeEventListener('touchmove', mouse.mousemove);
      hero.removeEventListener('touchstart', mouse.mousedown);
      hero.removeEventListener('touchend', mouse.mouseup);
      grab = M.MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
      M.Composite.add(world, grab);
      M.Events.on(grab, 'startdrag', function () { hero.classList.add('is-grabbing'); });
      hero.addEventListener('mousedown', wake);
      M.Events.on(grab, 'enddrag', function () { hero.classList.remove('is-grabbing'); draggedAt = Date.now(); });
      // Releasing outside the hero must still let go of the capsule.
      window.addEventListener('mouseup', function (e) { if (!hero.contains(e.target)) mouse.mouseup(e); });

      var phone = $('#demoPhone');
      var stage = $('#stage');
      hero.addEventListener('mousemove', function (e) {
        var pt = localPoint(e);
        hero.classList.toggle('is-grab', !isControl(e.target) && M.Query.point(bodies, pt).length > 0);
        phone.style.setProperty('--ty', ((pt.x / W - 0.5) * 12).toFixed(2) + 'deg');
        phone.style.setProperty('--tx', ((pt.y / H - 0.5) * -9).toFixed(2) + 'deg');
        stage.style.setProperty('--px', (pt.x / W - 0.5).toFixed(3));
        stage.style.setProperty('--py', (pt.y / H - 0.5).toFixed(3));
      });
      hero.addEventListener('mouseleave', function () {
        hero.classList.remove('is-grab');
        phone.style.setProperty('--ty', '0deg');
        phone.style.setProperty('--tx', '0deg');
      });
    }

    hero.addEventListener('click', function (e) {
      if (isControl(e.target) || Date.now() - draggedAt < 250) return;
      var pt = localPoint(e);
      if (M.Query.point(bodies, pt).length) return;
      for (var n = 0; n < 3; n += 1) {
        spawn(clamp(pt.x + (n - 1) * 34, 30, W - 30), -30 - n * 46);
      }
    });
  })();
})();
