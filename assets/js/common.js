/* Shared behaviour for every page: links, smooth scroll, cursor, dust, menu, reveals, FAQ. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const site = (window.site = { reduce, lenis: null });

  /* ---------- links from config.js ---------- */
  const L = window.SITE_LINKS || {};
  document.querySelectorAll('[data-link]').forEach(a => {
    const url = L[a.dataset.link];
    if (!url) { a.remove(); return; }
    a.href = url;
    if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  // drop link rows that ended up empty
  document.querySelectorAll('.ex-links,.links').forEach(r => { if (!r.children.length) r.remove(); });

  /* ---------- smooth scroll (Lenis) ---------- */
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    site.lenis = lenis;
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  site.scrollToY = y => site.lenis ? site.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });

  /* ---------- in-page anchors ---------- */
  const header = document.querySelector('header.site'), mb = document.getElementById('menuBtn');
  const closeMenu = () => { header?.classList.remove('open'); mb?.setAttribute('aria-expanded', 'false'); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.dataset.u !== undefined) return;
    const id = a.getAttribute('href').slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault(); closeMenu();
    site.scrollToY(el.getBoundingClientRect().top + scrollY);
    history.replaceState(null, '', '#' + id);
  });
  mb?.addEventListener('click', () => { const o = header.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  site.closeMenu = closeMenu;

  /* ---------- cursor ---------- */
  const cursor = document.getElementById('cursor');
  site.mouse = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    site.mouse.x = e.clientX / innerWidth - .5; site.mouse.y = e.clientY / innerHeight - .5;
    if (cursor) {
      cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      cursor.classList.toggle('big', !!e.target.closest('a,button'));
    }
  });

  /* ---------- golden dust ---------- */
  const cv = document.getElementById('dust');
  if (cv) {
    const ctx = cv.getContext('2d'); let CW, CH; const dots = [];
    const size = () => { const r = devicePixelRatio || 1; CW = cv.width = innerWidth * r; CH = cv.height = innerHeight * r; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
    size(); addEventListener('resize', size);
    for (let i = 0; i < (innerWidth < 600 ? 40 : 90); i++) dots.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .3, s: Math.random() * .00025 + .00005, a: Math.random() * 7 });
    (function draw() {
      ctx.clearRect(0, 0, CW, CH); const r = devicePixelRatio || 1;
      for (const d of dots) {
        d.y -= d.s; d.a += .01; if (d.y < -.02) { d.y = 1.02; d.x = Math.random(); }
        ctx.beginPath(); ctx.arc((d.x + Math.sin(d.a) * .003) * CW, d.y * CH, d.r * r, 0, 7);
        ctx.fillStyle = `rgba(255,205,130,${.35 + Math.sin(d.a * 2) * .3})`; ctx.shadowColor = 'rgba(255,170,70,.9)'; ctx.shadowBlur = 8 * r; ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    })();
  }

  /* ---------- count-ups ---------- */
  site.countUp = el => {
    if (el.dataset.done) return; el.dataset.done = 1;
    const target = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = reduce ? 0 : 1500;
    const step = t => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1, v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(site.countUp);
    io.unobserve(e.target);
  }), { threshold: .12 });
  document.querySelectorAll('.rv2').forEach(el => io.observe(el));

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.q button').forEach(b => b.addEventListener('click', () => {
    const o = b.parentElement.classList.toggle('open'); b.setAttribute('aria-expanded', o);
  }));

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
