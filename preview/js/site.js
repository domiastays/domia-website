/* Domia Stays — site behaviour. No libraries. Every block checks that its markup is on the page. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return [].slice.call((ctx || doc).querySelectorAll(sel)); }
  function throttle(fn) { var busy = false; return function () { if (busy) return; busy = true; requestAnimationFrame(function () { busy = false; fn(); }); }; }
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Every message link the forms build goes through here (WhatsApp in a new tab, email in the same one).
  function openUrl(url, newTab) {
    doc.dispatchEvent(new CustomEvent('domia:open', { detail: { url: url } }));
    if (newTab) window.open(url, '_blank', 'noopener'); else location.href = url;
  }

  /* ----- header state and the thin progress line at the top ----- */
  var hdr = $('.hdr'), progress = doc.createElement('div');
  progress.className = 'progress'; progress.setAttribute('aria-hidden', 'true'); doc.body.appendChild(progress);
  var onPageScroll = throttle(function () {
    var y = window.scrollY, max = root.scrollHeight - innerHeight, m = $('#menu');
    if (hdr) { hdr.classList.toggle('is-scrolled', y > 24); hdr.classList.toggle('is-solid', y > 24 || (m && !m.hidden)); }
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
  });
  addEventListener('scroll', onPageScroll, { passive: true });
  addEventListener('resize', onPageScroll);
  onPageScroll();

  /* ----- phone menu ----- */
  var menuBtn = $('.menu-btn'), menu = $('#menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      doc.body.style.overflow = open ? 'hidden' : '';
      onPageScroll();
    };
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    addEventListener('resize', throttle(function () { if (innerWidth >= 1040 && !menu.hidden) setMenu(false); }));
  }

  /* ----- hero video: starts after the page has loaded. It also plays with Reduce Motion on (it is slow, and the
     button pauses it). With data saver on, or where the phone blocks autoplay (iPhone Low Power Mode), the
     button shows "play" and starts it with one tap. ----- */
  var video = $('[data-hero-video]'), vctl = $('[data-video-toggle]');
  if (video) {
    var loaded = false;
    var showPaused = function (paused) {
      if (!vctl) return;
      vctl.classList.toggle('is-paused', paused);
      vctl.setAttribute('aria-label', paused ? vctl.dataset.labelPlay : vctl.dataset.labelPause);
    };
    var startVideo = function () {
      if (!loaded) {
        loaded = true;
        video.src = innerWidth < 700 ? video.dataset.srcSm : video.dataset.src;
        video.addEventListener('playing', function () { video.classList.add('is-on'); });
      }
      var p = video.play();
      if (p && p.then) p.then(function () { showPaused(false); }, function () { showPaused(true); });
    };
    video.addEventListener('play', function () { showPaused(false); });
    video.addEventListener('pause', function () { showPaused(true); });
    if (vctl) vctl.addEventListener('click', function () { if (!loaded || video.paused) startVideo(); else video.pause(); });
    if (navigator.connection && navigator.connection.saveData) showPaused(true);
    else if (doc.readyState === 'complete') setTimeout(startVideo, 200);
    else addEventListener('load', function () { setTimeout(startVideo, 200); });
  }

  /* ----- home: the video window, its gold line and the seal shift a little with the pointer ----- */
  var tilt = $('[data-tilt]');
  if (tilt && !reduceMotion && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tiltBox = tilt.closest('section') || tilt, tx = 0, ty = 0;
    var setTilt = throttle(function () { tilt.style.setProperty('--px', tx.toFixed(3)); tilt.style.setProperty('--py', ty.toFixed(3)); });
    tiltBox.addEventListener('pointermove', function (e) {
      var r = tiltBox.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
      setTilt();
    });
    tiltBox.addEventListener('pointerleave', function () { tx = ty = 0; setTilt(); });
  }

  /* ----- things ease in as they come on screen (with Reduce Motion they only fade, see site.css) ----- */
  if ('IntersectionObserver' in window) {
    var revealSel = '.sechead, .find, .split__head, .split__body > *, .cards .card, .deflist > div, .stats > div, .dfig, .owners-teaser__in > div, .ohero__in > div, .closing__in > *, .intro__media, .intro__text > *, .band__in > *, .ghero__in > *, .phead .wrap > *, .area, .pics li, .cmp__col, .svc__group, .story > *, .ways li, .form, .review, .filters, .calc__panel, .hgrid__main > *, .earn__up, .chips li, .faq details';
    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting || en.boundingClientRect.bottom < 0) { en.target.classList.add('is-in'); revealIo.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    $$(revealSel).forEach(function (el) {
      var n = 0, sib = el.previousElementSibling;
      while (sib && n < 6) { n++; sib = sib.previousElementSibling; }
      el.style.setProperty('--rv-d', (n * 0.07).toFixed(2) + 's');
      el.classList.add('rv');
      revealIo.observe(el);
    });
  }

  /* ----- numbers count up the first time they are seen ----- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countIo.unobserve(en.target);
        var el = en.target, m = /^(\D*?)(\d+)(\D*)$/.exec(el.textContent.trim());
        if (!m) return;
        var end = +m[2], t0 = null, dur = 1400;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = m[1] + Math.round(end * eased) + m[3];
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$('[data-countup]').forEach(function (el) { countIo.observe(el); });
  }

  /* ----- large photos drift slightly as the page scrolls ----- */
  var drifting = $$('[data-parallax]').map(function (sec) { return { sec: sec, img: $('img', sec) }; });
  if (drifting.length && !reduceMotion) {
    var drift = throttle(function () {
      drifting.forEach(function (d) {
        var r = d.sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
        d.img.style.transform = 'translate3d(0,' + (p * -0.08 * r.height).toFixed(1) + 'px,0)';
      });
    });
    addEventListener('scroll', drift, { passive: true });
    drift();
  }

  /* ----- WhatsApp button: appears once you scroll ----- */
  var fab = $('.fab');
  if (fab) {
    var onScroll = throttle(function () { fab.classList.toggle('is-on', scrollY > 480); });
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----- the collection: filters and sorting ----- */
  var filters = $('[data-filters]'), cardList = $('[data-cards]');
  if (filters && cardList) {
    var cards = $$('.card', cardList), emptyBox = $('[data-empty]'), countEl = $('[data-count]', filters);
    var keys = ['area', 'guests', 'beds', 'sort'];
    var params = new URLSearchParams(location.search);
    keys.forEach(function (k) {
      var el = filters.elements[k], v = params.get(k);
      if (!el || !v) return;
      el.value = v;
      if (el.value !== v) el.value = '';
    });
    var applyFilters = function (updateUrl) {
      var area = filters.elements.area.value, guests = +filters.elements.guests.value || 0,
          beds = +filters.elements.beds.value || 0, sort = filters.elements.sort.value, shown = 0;
      cards.forEach(function (c) {
        var ok = (!area || c.dataset.area === area) && +c.dataset.guests >= guests && +c.dataset.beds >= beds;
        c.hidden = !ok;
        if (ok) shown++;
      });
      cards.slice().sort(function (a, b) {
        if (sort === 'low') return a.dataset.price - b.dataset.price;
        if (sort === 'high') return b.dataset.price - a.dataset.price;
        return a.dataset.order - b.dataset.order;
      }).forEach(function (c) { cardList.appendChild(c); });
      countEl.textContent = shown === 1 ? countEl.dataset.one : countEl.dataset.many.replace('{n}', shown);
      if (emptyBox) emptyBox.hidden = shown > 0;
      cardList.hidden = shown === 0;
      if (updateUrl) {
        var q = new URLSearchParams();
        keys.forEach(function (k) { if (filters.elements[k].value) q.set(k, filters.elements[k].value); });
        var qs = q.toString();
        try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// */ }
      }
    };
    filters.addEventListener('change', function () { applyFilters(true); });
    filters.addEventListener('submit', function (e) { e.preventDefault(); });
    var clearBtn = $('[data-clear]');
    if (clearBtn) clearBtn.addEventListener('click', function () { filters.reset(); applyFilters(true); });
    applyFilters(false);
  }

  /* ----- one home: photo strip counter and full-screen viewer ----- */
  var gal = $('[data-gallery]'), lb = $('[data-lightbox]');
  if (gal && lb) {
    var items = $$('.gal__item', gal), lbImg = $('[data-lb-img]', lb), lbCap = $('[data-lb-cap]', lb), lbN = $('[data-lb-n]', lb), at = 0;
    var show = function (k) {
      at = (k + items.length) % items.length;
      var a = items[at];
      lbImg.src = a.href;
      lbImg.alt = a.dataset.alt || '';
      lbCap.textContent = a.dataset.alt || '';
      lbN.textContent = (at + 1) + ' / ' + items.length;
      if (items.length > 1) { var pre = new Image(); pre.src = items[(at + 1) % items.length].href; }
    };
    var openAt = function (k) {
      show(k);
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    };
    var closeLb = function () { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
    items.forEach(function (a, k) { a.addEventListener('click', function (e) { e.preventDefault(); openAt(k); }); });
    var allBtn = $('[data-gal-open]', gal);
    if (allBtn) allBtn.addEventListener('click', function () { openAt(0); });
    $('[data-lb-close]', lb).addEventListener('click', closeLb);
    var prevBtn = $('[data-lb-prev]', lb), nextBtn = $('[data-lb-next]', lb);
    prevBtn.addEventListener('click', function () { show(at - 1); });
    nextBtn.addEventListener('click', function () { show(at + 1); });
    if (items.length < 2) { prevBtn.hidden = true; nextBtn.hidden = true; }
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb__fig')) closeLb(); });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 48) show(at + (dx < 0 ? 1 : -1));
    }, { passive: true });
    var track = $('[data-gal-track]', gal), counter = $('[data-gal-i]', gal);
    if (track && counter) {
      track.addEventListener('scroll', throttle(function () {
        var step = items[0].offsetWidth + 8;
        counter.textContent = Math.max(1, Math.min(items.length, Math.round(track.scrollLeft / step) + 1));
      }), { passive: true });
    }
  }

  /* ----- one home: enquiry card -> WhatsApp message ----- */
  var enq = $('[data-enquiry]');
  if (enq) {
    var dIn = enq.elements['in'], dOut = enq.elements.out, errEl = $('[data-err]', enq);
    var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
    var today = new Date();
    dIn.min = iso(today); dOut.min = iso(today);
    dIn.addEventListener('change', function () {
      if (!dIn.value) return;
      var next = new Date(dIn.value + 'T00:00:00'); next.setDate(next.getDate() + 1);
      dOut.min = iso(next);
      if (dOut.value && dOut.value <= dIn.value) dOut.value = '';
    });
    enq.addEventListener('submit', function (e) {
      e.preventDefault();
      errEl.hidden = true;
      var d = enq.dataset, parts = [d.msg];
      if (dIn.value && dOut.value) {
        if (dOut.value <= dIn.value) { errEl.textContent = d.error; errEl.hidden = false; dOut.focus(); return; }
        var nice = function (v) { return new Date(v + 'T00:00:00').toLocaleDateString(d.locale, { day: 'numeric', month: 'short', year: 'numeric' }); };
        parts.push(d.msgDates.replace('{in}', nice(dIn.value)).replace('{out}', nice(dOut.value)));
      }
      parts.push(d.msgGuests.replace('{n}', enq.elements.guests.value));
      parts.push(d.msgEnd);
      openUrl(d.wa + '?text=' + encodeURIComponent(parts.join(' ')), true);
    });
  }

  /* ----- sticky bar on phones: hides while the same call to action is already on screen ----- */
  var bar = $('[data-bar]');
  if (bar && 'IntersectionObserver' in window) {
    var onScreen = [];
    var barWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var at = onScreen.indexOf(en.target);
        if (en.isIntersecting && at < 0) onScreen.push(en.target);
        if (!en.isIntersecting && at >= 0) onScreen.splice(at, 1);
      });
      bar.classList.toggle('is-off', onScreen.length > 0);
    }, { threshold: 0.2 });
    $$(bar.dataset.watch || '#enquire').forEach(function (el) { barWatch.observe(el); });
  }

  /* ----- contact form -> WhatsApp or email ----- */
  var contact = $('[data-contact]');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = contact.dataset, f = contact.elements, lines = [d.intro];
      [[d.lName, f.name.value], [d.lDates, f.dates.value], [d.lGuests, f.guests.value], [d.lLooking, f.message.value]].forEach(function (row) {
        if (String(row[1]).trim()) lines.push(row[0] + ': ' + String(row[1]).trim());
      });
      var body = lines.join('\n');
      var byEmail = e.submitter && e.submitter.dataset.send === 'email';
      if (byEmail) openUrl('mailto:' + d.email + '?subject=' + encodeURIComponent(d.subject) + '&body=' + encodeURIComponent(body), false);
      else openUrl(d.wa + '?text=' + encodeURIComponent(body), true);
    });
  }

  /* ----- owner earnings calculator ----- */
  var calc = $('[data-calc]');
  if (calc) {
    var priceIn = $('[data-in=price]', calc), nightsIn = $('[data-in=nights]', calc), rateIn = $('[data-in=rate]', calc), radios = $$('input[name=channel]', calc);
    var euro = function (n) { return '€' + Math.round(n).toLocaleString('en-US'); };
    var minus = function (n) { return Math.round(n) === 0 ? '€0' : '−' + euro(n); };
    var put = function (sel, text) { var el = $(sel, calc); if (el) el.textContent = text; };
    var wide = function (sel, part) { var el = $(sel, calc); if (el) el.style.width = (Math.max(0, Math.min(1, part)) * 100).toFixed(1) + '%'; };
    var pct = function (part) { return ' (' + Math.round(part * 100) + '%)'; };
    var renderCalc = function () {
      var ch = radios.filter(function (r) { return r.checked; })[0] || radios[0];
      var fee = +ch.dataset.fee, price = +priceIn.value, feeAmt = price * fee / 100, net = price - feeAmt, domia = net * 0.2, you = net - domia;
      put('[data-out=price]', euro(price));
      put('[data-flow=price]', euro(price));
      put('[data-flow=feeLabel]', calc.dataset.feeLabel.replace('{channel}', ch.dataset.name).replace('{pct}', fee));
      put('[data-flow=fee]', minus(feeAmt));
      put('[data-flow=net]', euro(net));
      put('[data-flow=domia]', minus(domia));
      put('[data-flow=you]', euro(you));
      wide('[data-split=you]', you / price); wide('[data-split=domia]', domia / price); wide('[data-split=fee]', feeAmt / price);
      put('[data-legend=you]', euro(you) + pct(you / price));
      put('[data-legend=domia]', euro(domia) + pct(domia / price));
      put('[data-legend=feeName]', ch.dataset.name);
      put('[data-legend=fee]', euro(feeAmt) + pct(feeAmt / price));
      radios.forEach(function (r, i) {
        var v = (price - price * (+r.dataset.fee) / 100) * 0.8;
        wide('[data-chbar="' + i + '"]', v / (price * 0.8));
        put('[data-chval="' + i + '"]', euro(v));
      });
      put('[data-out=nights]', nightsIn.value);
      put('[data-out=rate]', euro(+rateIn.value));
      put('[data-out=annual]', euro(nightsIn.value * rateIn.value * 12 * (1 - fee / 100) * 0.8));
    };
    calc.addEventListener('input', renderCalc);
    calc.addEventListener('change', renderCalc);
    renderCalc();
  }
})();
