(function () {
  var root = document.documentElement; root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var euro = function (n) { return '€' + Math.round(n).toLocaleString('en-US'); };
  var euroNeg = function (n) { return '−€' + Math.round(n).toLocaleString('en-US'); };

  function countUp(el) {
    var raw = el.getAttribute('data-count') || el.textContent;
    if (!el.getAttribute('data-count')) el.setAttribute('data-count', raw);
    var m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/); if (!m) return;
    var pre = m[1], target = parseFloat(m[2]), suf = m[3], dec = (m[2].split('.')[1] || '').length, start = performance.now();
    (function tick(now) { var p = Math.min(1, (now - start) / 1500), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (target * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(tick); else el.textContent = pre + target.toFixed(dec) + suf; })(performance.now());
  }
  function reveal(el) { el.classList.add('is-in'); if (!reduce) { if (el.classList.contains('d-count')) countUp(el); el.querySelectorAll('.d-count').forEach(countUp); } }
  var items = [].slice.call(document.querySelectorAll('.d-inview'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    items.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) reveal(el); else io.observe(el); });
    document.querySelectorAll('.d-count').forEach(function (c) { if (!c.closest('.d-inview')) { var r = c.getBoundingClientRect(); if (r.top < innerHeight) reveal(c); else io.observe(c); } });
  } else items.forEach(reveal);
  setTimeout(function () { items.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);

  // hero video
  var v = document.querySelector('.d-hero-video');
  if (v) { var kick = function () { if (v.play) v.play().catch(function () {}); }; kick();
    ['touchstart', 'pointerdown', 'scroll', 'click'].forEach(function (ev) { addEventListener(ev, function h() { kick(); removeEventListener(ev, h); }, { passive: true }); }); }

  // scroll: nav, progress bar, FAB, parallax
  var bar = document.querySelector('.d-scrollbar'), fab = document.querySelector('.d-fab-wa'),
      nav = document.querySelector('.d-nav'), par = [].slice.call(document.querySelectorAll('.d-parallax')), ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () {
      var y = scrollY; if (nav) nav.dataset.scrolled = String(y > 40);
      if (bar) { var h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%'; }
      if (fab) fab.classList.toggle('is-shown', y > innerHeight * 0.7);
      if (innerWidth > 768) par.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) { var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; el.style.transform = 'translate3d(0,' + (-p * 26).toFixed(1) + 'px,0) scale(1.12)'; } });
      ticking = false; }); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  var burger = document.querySelector('.d-burger');
  if (burger) burger.addEventListener('click', function () {
    var ex = document.querySelector('.d-mobile-menu'); if (ex) { ex.remove(); return; }
    var m = document.createElement('div'); m.className = 'd-mobile-menu'; var innerNav = document.createElement('nav');
    document.querySelectorAll('.d-nav-links .d-nav-link').forEach(function (a) { var x = document.createElement('a'); x.href = a.getAttribute('href'); x.className = 'd-mobile-link'; x.textContent = a.textContent; innerNav.appendChild(x); });
    m.appendChild(innerNav); m.addEventListener('click', function (e) { if (e.target === m) m.remove(); }); (nav || document.body).appendChild(m);
  });

  // language toggle (EN <-> ES via .es.html pages)
  var langBtns = document.querySelectorAll('.d-lang button');
  if (langBtns.length >= 2) {
    var path = location.pathname, file = path.substring(path.lastIndexOf('/') + 1);
    if (!file) file = 'index.html';
    var isES = /\.es\.html$/.test(file);
    var base = file.replace(/\.es\.html$/, '.html');
    var enHref = base, esHref = base.replace(/\.html$/, '.es.html');
    langBtns[0].setAttribute('data-on', String(!isES)); langBtns[0].setAttribute('aria-pressed', String(!isES));
    langBtns[1].setAttribute('data-on', String(isES)); langBtns[1].setAttribute('aria-pressed', String(isES));
    langBtns[0].addEventListener('click', function () { if (isES) location.href = enHref; });
    langBtns[1].addEventListener('click', function () { if (!isES) location.href = esHref; });
  }

  // collection area filter (properties page)
  var filterBar = document.querySelector('.d-filter');
  if (filterBar) {
    var fcards = [].slice.call(document.querySelectorAll('.d-card'));
    var fbtns = [].slice.call(filterBar.querySelectorAll('button'));
    fbtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        fbtns.forEach(function (b) { b.style.background = 'transparent'; b.style.color = 'var(--d-navy)'; b.style.borderColor = 'var(--d-line)'; b.setAttribute('data-on', 'false'); });
        btn.style.background = 'var(--d-navy)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--d-navy)'; btn.setAttribute('data-on', 'true');
        var all = idx === 0, label = btn.textContent.trim();
        fcards.forEach(function (c) { var loc = (c.querySelector('.d-card-loc') || {}).textContent || ''; c.style.display = (all || loc.indexOf(label) !== -1) ? '' : 'none'; });
      });
    });
  }

  // owner earnings calculator
  var sliders = document.querySelectorAll('.d-calc-inputs input[type=range], .d-slider input[type=range]');
  if (document.querySelector('.d-flow') && sliders.length >= 3) {
    var priceS = sliders[0], nightsS = sliders[1], rateS = sliders[2];
    var chips = [].slice.call(document.querySelectorAll('.d-chip-btn'));
    var channels = [{ n: 'Airbnb', f: 3 }, { n: 'Booking.com', f: 15 }, { n: 'VRBO', f: 8 }, { n: 'Direct', f: 0 }];
    var flowVals = document.querySelectorAll('.d-flow-val');
    var flowLabels = document.querySelectorAll('.d-flow-label');
    var sVals = document.querySelectorAll('.d-slider-val');
    var annualVal = document.querySelector('.d-annual-val');
    function channel() { var i = chips.findIndex(function (c) { return c.getAttribute('data-on') === 'true'; }); return channels[i < 0 ? 0 : i]; }
    function render() {
      var price = +priceS.value, ch = channel(), fee = price * ch.f / 100, net = price - fee, domia = net * 0.2, receive = net - domia;
      if (sVals[0]) sVals[0].textContent = euro(price);
      if (flowVals[0]) flowVals[0].textContent = euro(price);
      if (flowVals[1]) flowVals[1].textContent = euroNeg(fee);
      if (flowVals[2]) flowVals[2].textContent = euro(net);
      if (flowVals[3]) flowVals[3].textContent = euroNeg(domia);
      if (flowVals[4]) flowVals[4].textContent = euro(receive);
      if (flowLabels[1]) flowLabels[1].textContent = ch.n + ' platform fee (' + ch.f + '%)';
      var nights = +nightsS.value, rate = +rateS.value;
      if (sVals[1]) sVals[1].innerHTML = nights + ' <small>nights</small>';
      if (sVals[2]) sVals[2].innerHTML = '€' + rate + ' <small>/ night</small>';
      if (annualVal) annualVal.innerHTML = euro(nights * rate * 12 * (1 - ch.f / 100) * 0.8) + '<small>/ yr</small>';
    }
    [priceS, nightsS, rateS].forEach(function (s) { s.addEventListener('input', render); });
    chips.forEach(function (c) { c.addEventListener('click', function () { chips.forEach(function (x) { x.setAttribute('data-on', 'false'); }); c.setAttribute('data-on', 'true'); render(); }); });
    render();
  }
})();
