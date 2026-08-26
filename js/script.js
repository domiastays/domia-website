(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var raw = el.getAttribute('data-count') || el.textContent;
    if (!el.getAttribute('data-count')) el.setAttribute('data-count', raw);
    var m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var pre = m[1], target = parseFloat(m[2]), suf = m[3];
    var dec = (m[2].split('.')[1] || '').length, start = performance.now(), dur = 1500;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = pre + target.toFixed(dec) + suf;
    }
    requestAnimationFrame(tick);
  }
  function reveal(el) {
    el.classList.add('is-in');
    if (!reduce) {
      if (el.classList.contains('d-count')) countUp(el);
      el.querySelectorAll('.d-count').forEach(countUp);
    }
  }
  var items = [].slice.call(document.querySelectorAll('.d-inview'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) reveal(el); else io.observe(el);
    });
    document.querySelectorAll('.d-count').forEach(function (c) {
      if (!c.closest('.d-inview')) { var r = c.getBoundingClientRect(); if (r.top < innerHeight) reveal(c); else io.observe(c); }
    });
  } else { items.forEach(reveal); }
  setTimeout(function () { items.forEach(function (el) { el.classList.add('is-in'); }); }, 2500); // safety

  // hero video: play on load + first interaction (mobile autoplay)
  var v = document.querySelector('.d-hero-video');
  if (v) {
    var kick = function () { if (v.play) v.play().catch(function () {}); };
    kick();
    ['touchstart', 'pointerdown', 'scroll', 'click'].forEach(function (ev) {
      addEventListener(ev, function h() { kick(); removeEventListener(ev, h); }, { passive: true });
    });
  }

  // scroll: nav solidify, progress bar, FAB, parallax
  var bar = document.querySelector('.d-scrollbar'), fab = document.querySelector('.d-fab-wa'),
      nav = document.querySelector('.d-nav'), par = [].slice.call(document.querySelectorAll('.d-parallax'));
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = scrollY;
      if (nav) nav.dataset.scrolled = String(y > 40);
      if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%'; }
      if (fab) fab.classList.toggle('is-shown', y > innerHeight * 0.7);
      if (innerWidth > 768) par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          el.style.transform = 'translate3d(0,' + (-p * 26).toFixed(1) + 'px,0) scale(1.12)';
        }
      });
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu: built from the primary nav links
  var burger = document.querySelector('.d-burger');
  if (burger) burger.addEventListener('click', function () {
    var ex = document.querySelector('.d-mobile-menu'); if (ex) { ex.remove(); return; }
    var m = document.createElement('div'); m.className = 'd-mobile-menu';
    var innerNav = document.createElement('nav');
    document.querySelectorAll('.d-nav-links .d-nav-link').forEach(function (a) {
      var x = document.createElement('a'); x.href = a.getAttribute('href'); x.className = 'd-mobile-link'; x.textContent = a.textContent; innerNav.appendChild(x);
    });
    m.appendChild(innerNav);
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    (nav || document.body).appendChild(m);
  });
})();
