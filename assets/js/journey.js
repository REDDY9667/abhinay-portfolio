/* Home page: loader, circuit tree, and the scroll-driven hero → wooden wall → 3D gallery journey. */
(() => {
  const site = window.site, reduce = site.reduce;
  const $ = id => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- timeline, in units of 1% of viewport height scrolled ---------- */
  const T = { slide0: 35, slide1: 135, doors0: 215, doors1: 320, stopLen: 170, travel: 95 };
  const N = document.querySelectorAll('.panel').length;
  T.exit0 = T.doors1 + N * T.stopLen;
  T.total = T.exit0 + 130;
  const stopU = i => T.doors1 + i * T.stopLen + T.travel + 20;
  const LABELS = ['Exhibit 01 · SecondBrain', 'Exhibit 02 · Cancer detection', 'Exhibit 03 · Medicine reminder', 'Chapter 03 · The arsenal', 'Chapter 04 · The arena'];

  /* ---------- loader ---------- */
  const loader = $('loader'), lc = $('ldCount');
  let n = 0;
  site.lenis?.stop();
  const tick = () => {
    n = Math.min(100, n + Math.ceil(Math.random() * 7));
    lc.textContent = String(n).padStart(3, '0');
    if (n < 100) setTimeout(tick, reduce ? 0 : 40);
    else setTimeout(() => {
      loader.classList.add('done'); $('hero').classList.add('in'); site.lenis?.start();
      const el = location.hash && document.getElementById(location.hash.slice(1));
      if (el) site.scrollToY(el.getBoundingClientRect().top + scrollY);
    }, 300);
  };
  tick();

  /* ---------- circuit tree ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gL = $('cLines'), gP = $('cPulses'), gN = $('cNodes'), paths = [];
  const rootX = 450, rootY = 760, trunkTop = 470;
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1, startY = trunkTop + rnd() * 220, sx = rootX + side * (6 + rnd() * 14);
    const rise = 40 + rnd() * 120, spread = 40 + rnd() * 260;
    const x2 = sx + side * spread * .5, y2 = startY - rise, x3 = sx + side * spread, y3 = y2 - (30 + rnd() * 200);
    paths.push({ d: `M${sx} ${startY} V${startY - 20} L${x2} ${y2} V${y3 + 30} L${x3} ${y3}`, end: [x3, y3] });
    if (rnd() > .5) { const tx = x2 + side * 40, ty = y2 - 40 - rnd() * 40; paths.push({ d: `M${x2} ${y2} L${tx} ${ty} V${ty - 30}`, end: [tx, ty - 30] }); }
  }
  for (let k = -3; k <= 3; k++) paths.push({ d: `M${rootX + k * 6} ${rootY} V${trunkTop}`, end: null });
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1, w = 60 + rnd() * 340, drop = 20 + rnd() * 90, y = rootY + 6 + (i % 6) * 6;
    paths.push({ d: `M${rootX} ${y} H${rootX + side * 30} L${rootX + side * 60} ${y + drop * .4} H${rootX + side * w} L${rootX + side * (w + 30)} ${y + drop}`, end: [rootX + side * (w + 30), y + drop] });
  }
  for (let i = 0; i < 6; i++) { const y = 520 + i * 18; paths.push({ d: `M0 ${y} H${180 + i * 20} L${220 + i * 20} ${y - 40 + i * 4} H${rootX - 30}`, end: null }); }
  paths.forEach((p, i) => {
    const line = mk('path', { d: p.d, class: 'c-line' }, gL);
    if (p.end) mk('circle', { cx: p.end[0], cy: p.end[1], r: 2.6 + rnd() * 1.8, class: 'c-node', opacity: .5 + rnd() * .5 }, gN);
    if (!reduce && i % 2 === 0) {
      const len = line.getTotalLength();
      const pu = mk('path', { d: p.d, class: 'c-pulse', 'stroke-dasharray': `14 ${len}`, 'stroke-dashoffset': len + 14 }, gP);
      pu.animate([{ strokeDashoffset: len + 14 }, { strokeDashoffset: 0 }], { duration: 2600 + rnd() * 3400, delay: rnd() * 4000, iterations: Infinity, easing: 'ease-in' });
    }
  });
  mk('rect', { x: rootX - 26, y: trunkTop - 18, width: 52, height: 36, rx: 6, class: 'c-chip' }, gN);
  mk('rect', { x: rootX - 44, y: rootY - 10, width: 88, height: 46, rx: 4, class: 'c-chip' }, gN);
  for (let i = 0; i < 8; i++) mk('line', { x1: rootX - 38 + i * 11, y1: rootY - 16, x2: rootX - 38 + i * 11, y2: rootY - 10, stroke: '#f4b860', 'stroke-width': 1.5 }, gN);

  /* ---------- 3D gallery layout ---------- */
  const journey = $('journey'), gallery = $('gallery'), world = $('world'), track = $('track'), wood = $('wood');
  const panels = [...document.querySelectorAll('.panel')];
  let W, H, P, keys = [], lastW = 0;

  function layout() {
    W = innerWidth; H = innerHeight;
    const pw = Math.min(980, W * .9), ph = Math.min(600, H * (W < 700 ? .74 : .68));
    P = Math.max(pw * 1.05, 520);
    document.body.classList.toggle('narrow', pw < 640);
    gallery.style.perspective = P + 'px';
    world.style.setProperty('--pw', pw + 'px'); world.style.setProperty('--ph', ph + 'px');
    journey.style.height = (H * T.total / 100 + H) + 'px';

    const gap = Math.max(pw * 1.7, 700), ANG = 52, wallX = Math.max(pw * .98, P * .9 + 60);
    const panelX = pw * .62, yFloor = ph / 2 + ph * .16, yCeil = -(ph / 2 + ph * .5);
    const zNear = gap * 1.5, zBack = -(N + .9) * gap, L = zNear - zBack, zMid = (zNear + zBack) / 2;
    const wallH = yFloor - yCeil, yc = (yFloor + yCeil) / 2;
    const set = (el, w, h, tf) => { el.style.width = w + 'px'; el.style.height = h + 'px'; el.style.transform = tf + ' translate(-50%,-50%)'; };
    set($('floor'), wallX * 2, L, `translate3d(0,${yFloor}px,${zMid}px) rotateX(90deg)`);
    set($('ceil'), wallX * 2, L, `translate3d(0,${yCeil}px,${zMid}px) rotateX(90deg)`);
    set($('wallL'), L, wallH, `translate3d(${-wallX}px,${yc}px,${zMid}px) rotateY(90deg)`);
    set($('wallR'), L, wallH, `translate3d(${wallX}px,${yc}px,${zMid}px) rotateY(-90deg)`);
    set($('back'), wallX * 2, wallH, `translate3d(0,${yc}px,${zBack}px)`);
    const rail = ((0 - yCeil) / wallH * 100) + '%';
    $('wallL').style.setProperty('--rail', rail); $('wallR').style.setProperty('--rail', rail);

    const S = { x: 0, z: gap * .35, yaw: 0 };
    keys = [{ u: T.doors0, p: { x: 0, z: gap * 1.25, yaw: 0 } }, { u: T.doors1, p: S }];
    let prev = S;
    panels.forEach((el, i) => {
      const side = i % 2 ? 1 : -1, a = -side * ANG, r = a * Math.PI / 180;
      const x = side * panelX, z = -(i + 1) * gap;
      el.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${a}deg) translate(-50%,-50%)`;
      const pose = { x: x + Math.sin(r) * P, z: z + Math.cos(r) * P, yaw: a };
      const u0 = T.doors1 + i * T.stopLen;
      // walk down the centre of the hall, then turn to face the exhibit
      if (i > 0) keys.push({ u: u0 + T.travel / 2, p: { x: 0, z: (prev.z + pose.z) / 2, yaw: 0 }, e: 'in' });
      keys.push({ u: u0 + T.travel, p: pose, e: i > 0 ? 'out' : null }, { u: u0 + T.stopLen, p: pose });
      prev = pose;
    });
    keys.push({ u: T.exit0 + 50, p: { x: 0, z: (prev.z + zBack) / 2 + P * .3, yaw: 0 }, e: 'in' });
    keys.push({ u: T.total, p: { x: 0, z: zBack + P * .25, yaw: 0 }, e: 'out' });
    lastW = W;
  }

  function camAt(u) {
    if (u <= keys[0].u) return keys[0].p;
    for (let i = 1; i < keys.length; i++) {
      if (u <= keys[i].u) {
        const a = keys[i - 1], b = keys[i], k = clamp((u - a.u) / (b.u - a.u));
        const t = b.e === 'in' ? k * k : b.e === 'out' ? 1 - (1 - k) * (1 - k) : ease(k);
        return { x: lerp(a.p.x, b.p.x, t), z: lerp(a.p.z, b.p.z, t), yaw: lerp(a.p.yaw, b.p.yaw, t) };
      }
    }
    return keys[keys.length - 1].p;
  }

  /* ---------- render ---------- */
  let cur = 0, smx = 0, smy = 0, lastKey = '';
  const hudL = $('hudL'), hudR = $('hudR'), navLinks = [...document.querySelectorAll('#nav a')];
  const unitsFromScroll = () => clamp((scrollY - journey.offsetTop) / H * 100, 0, T.total);

  function render(u) {
    const s = ease(clamp((u - T.slide0) / (T.slide1 - T.slide0)));
    const dz = clamp((u - T.doors0) / (T.doors1 - T.doors0));
    track.style.transform = `translateX(${-82 * s}vw) scale(${1 + ease(dz) * .25})`;
    track.style.visibility = u > T.doors1 + 5 ? 'hidden' : 'visible';
    wood.classList.toggle('lit', u > T.slide1 - 30 && u < T.doors0 + 25);
    $('woodContent').style.opacity = 1 - clamp(dz * 3);
    const d = ease(clamp((dz - .1) / .9));
    $('leafL').style.transform = `rotateY(${-d * 100}deg)`;
    $('leafR').style.transform = `rotateY(${d * 100}deg)`;
    $('flash').style.opacity = Math.sin(clamp((dz - .05) / .7) * Math.PI) * .55;

    const inGallery = u > T.doors0 - 5;
    gallery.style.visibility = inGallery ? 'visible' : 'hidden';
    if (inGallery) {
      const c = camAt(u), yaw = c.yaw + smx * 4, pitch = smy * -2;
      world.style.transform = `translateZ(${P}px) rotateX(${pitch}deg) rotateY(${-yaw}deg) translate3d(${-c.x}px,0,${-c.z}px)`;
      panels.forEach((el, i) => {
        const on = u > stopU(i) - 30 && u < T.doors1 + (i + 1) * T.stopLen + 10;
        if (on && !el.classList.contains('on')) el.querySelectorAll('[data-count]').forEach(site.countUp);
        el.classList.toggle('on', on);
        el.inert = !on;
      });
    }
    $('fade').style.opacity = clamp((u - T.exit0 - 40) / 90);

    let label = 'The age of building', key = 'hero';
    if (u > T.slide1 - 40) { label = 'Chapter 01 · The origin'; key = 'origin'; }
    if (u > T.doors1 - 20) { label = 'Chapter 02 · The exhibits'; key = 'g'; }
    for (let i = 0; i < N; i++) if (u > stopU(i) - 60) { label = LABELS[i]; key = 'p' + i; }
    if (u > T.exit0 + 20) { label = 'Final chapter'; key = 'exit'; }
    if (key !== lastKey) {
      hudL.style.opacity = 0; setTimeout(() => { hudL.textContent = label; hudL.style.opacity = 1; }, 200); lastKey = key;
      const navKey = /^p[012]$/.test(key) ? 'p0' : key;
      navLinks.forEach(a => a.classList.toggle('cur', a.dataset.u === navKey));
    }
    hudR.style.opacity = u < 10 ? 1 : 0;
    $('progBar').style.height = (u / T.total * 100) + '%';
  }

  const hudDot = $('hudDot');
  function frame() {
    const target = unitsFromScroll();
    cur = (reduce || site.lenis) ? target : cur + (target - cur) * .085;
    if (Math.abs(target - cur) < .01) cur = target;
    smx += (site.mouse.x - smx) * .05; smy += (site.mouse.y - smy) * .05;
    // skip work once the journey is fully scrolled past
    if (scrollY < journey.offsetTop + journey.offsetHeight) render(cur);
    hudDot.style.left = ((performance.now() / 24) % 110) + 'px';
    requestAnimationFrame(frame);
  }

  /* ---------- links that jump to a point inside the journey ---------- */
  const unitFor = k => k === '0' ? 0 : k === 'origin' ? (T.slide1 + T.doors0) / 2 : stopU(+k[1]) + 15;
  document.querySelectorAll('[data-u]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); site.closeMenu();
    site.scrollToY(journey.offsetTop + unitFor(a.dataset.u) / 100 * H);
  }));

  addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) > 40 || Math.abs(innerHeight - H) > 160) layout(); });
  layout();
  requestAnimationFrame(frame);
})();
