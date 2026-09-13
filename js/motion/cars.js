/* ============================================================
   cars.js — the cars and the circuit they drive.

   Scenes
     hero lane     an F1 car passes under the introduction every
                   10 to 16 s, occasionally the other way
     track bands   a GT3, a prototype, and a three-car pack each
                   pass once as their band scrolls into view
     track map     a car laps the console circuit, braking for
                   corners, lighting each sector as it passes
     project line  a racing line threads the gaps between project
                   sheets; the car's position follows your scroll
     distant pack  every 26 to 44 s a small group crosses the
                   fixed backdrop, behind the panels (wide only)

   All movement is transform-only, driven by Anime.js motion
   paths. Reduced motion keeps the geometry and parks every car.
   ============================================================ */

const SVGNS = 'http://www.w3.org/2000/svg';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function cars(ctx) {
  const { reduce, wide } = ctx;
  const ac = new AbortController();
  const cleanups = [() => ac.abort()];
  const run = (fn) => { const c = fn(ctx); if (c) cleanups.push(c); };

  // The racing line is geometry, so it is drawn with or without motion.
  run(projectLine);

  if (!reduce) {
    const start = () => {
      run(heroLane);
      run(trackBands);
      run(trackMap);
      if (wide) run(distantPack);
    };
    if (document.documentElement.classList.contains('intro-done')) start();
    else document.addEventListener('intro:done', start, { once: true, signal: ac.signal });
  }

  return () => cleanups.forEach((fn) => fn());
}

/* ---- One pass of a side-profile car along a lane ------------ */
function drive(anime, car, path, { duration, delay = 0, reversed = false, onComplete } = {}) {
  const { animate, svg, utils } = anime;
  const flip = car.querySelector('.lane__flip');
  const streak = car.querySelector('.lane__streak');

  // Paths run left to right. Reversed playback plus a horizontal
  // flip sends the car right to left, nose first.
  if (flip) utils.set(flip, { scaleX: reversed ? -1 : 1 });

  const pass = animate(car, {
    ...svg.createMotionPath(path),
    duration,
    delay,
    reversed,
    ease: 'inOut(1.35)',
    onComplete,
  });
  const trail = streak
    ? animate(streak, { opacity: [0, 0.55, 0.55, 0], duration, delay, ease: 'linear' })
    : null;

  return { revert: () => { pass.revert(); trail?.revert(); } };
}

/* ---- Hero lane ---------------------------------------------- */
function heroLane({ anime }) {
  const car = document.getElementById('heroCar');
  const path = document.getElementById('heroLine');
  const hero = document.querySelector('.hero');
  if (!car || !path || !hero) return null;

  let visible = true;
  let timer = null;
  let pass = null;

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(hero);

  const schedule = (ms) => {
    timer = anime.createTimer({ duration: ms, onComplete: go });
  };
  const go = () => {
    if (!visible) return schedule(4000);
    pass?.revert();
    pass = drive(anime, car, path, {
      duration: rand(2600, 3400),
      reversed: Math.random() < 0.22,
      onComplete: () => schedule(rand(10000, 16000)),
    });
  };

  schedule(600);

  return () => {
    io.disconnect();
    timer?.revert();
    pass?.revert();
  };
}

/* ---- Track bands between sections --------------------------- */
function trackBands({ anime }) {
  const bands = [...document.querySelectorAll('.lane--band[data-pass]')];
  const passes = [];

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      const band = entry.target;
      const path = band.querySelector('.lane__line');
      const reversed = band.dataset.direction === 'rtl';
      const base = band.dataset.pass === 'pack' ? 3600 : band.dataset.pass === 'lmp' ? 3000 : 3300;

      // A pack spreads out slightly as it goes: each follower is a
      // touch slower than the car ahead.
      band.querySelectorAll('.lane__car').forEach((car, i) => {
        passes.push(drive(anime, car, path, {
          duration: base + i * 140 + rand(-80, 80),
          delay: i * 330,
          reversed,
        }));
      });
    }
  }, { threshold: 0.6 });

  bands.forEach((band) => io.observe(band));

  return () => {
    io.disconnect();
    passes.forEach((p) => p.revert());
  };
}

/* ---- Console track map ---------------------------------------- */
function trackMap({ anime }) {
  const { animate, svg, utils } = anime;
  const path = document.getElementById('trackPath');
  const car = document.getElementById('trackCar');
  const consoleEl = document.querySelector('.console');
  if (!path || !car || !consoleEl) return null;

  const length = path.getTotalLength();
  const startOffset = 90 / length;      // the start/finish line sits 90 units along the path

  // Sector boundaries as fractions of the lap, from the path start.
  const sectorPaths = [...document.querySelectorAll('.track__sector')];
  const sectorItems = [...document.querySelectorAll('.console__sectors li')];
  const bounds = [];
  sectorPaths.reduce((acc, p) => { acc += p.getTotalLength(); bounds.push(acc / length); return acc; }, 0);

  // Sampled path points, for mapping the car's position back to a sector.
  const STEPS = 240;
  const probe = Array.from({ length: STEPS }, (_, i) => {
    const pt = path.getPointAtLength((i / STEPS) * length);
    return { x: pt.x, y: pt.y, f: i / STEPS };
  });

  let lit = -1;
  const light = (i) => {
    if (i === lit || i < 0) return;
    lit = i;
    sectorPaths.forEach((p, k) => animate(p, { opacity: k === i ? 1 : 0.16, duration: 380, ease: 'out(2)' }));
    sectorItems.forEach((li, k) => li.classList.toggle('is-lit', k === i));
  };

  utils.set(car, { opacity: 1 });
  const lapAnim = animate(car, {
    ...svg.createMotionPath(path, startOffset),
    duration: 13000,
    loop: true,
    ease: speedProfile(path, startOffset),
    onUpdate: () => {
      const x = parseFloat(utils.get(car, 'translateX'));
      const y = parseFloat(utils.get(car, 'translateY'));
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < STEPS; i++) {
        const d = (probe[i].x - x) ** 2 + (probe[i].y - y) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      light(bounds.findIndex((b) => probe[best].f <= b));
    },
  });

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) lapAnim.play();
    else lapAnim.pause();
  });
  io.observe(consoleEl);

  return () => {
    io.disconnect();
    lapAnim.revert();
    sectorPaths.forEach((p) => p.style.removeProperty('opacity'));
    sectorItems.forEach((li) => li.classList.remove('is-lit'));
  };
}

/* Build an easing function from the circuit's shape: fast on the
   straights, braking into tight corners. Speed at each point is
   capped by the sharpest curvature just ahead of it (so the car
   brakes before the corner, not in it), then smoothed, then turned
   into a time-to-distance map the animation can use as its ease. */
function speedProfile(path, offset, steps = 360) {
  const length = path.getTotalLength();
  const s0 = offset * length;
  const ds = length / steps;
  const pts = Array.from({ length: steps + 1 }, (_, i) => path.getPointAtLength((s0 + i * ds) % length));

  const heading = pts.slice(0, steps).map((p, i) => Math.atan2(pts[i + 1].y - p.y, pts[i + 1].x - p.x));
  const curvature = heading.map((h, i) => {
    const d = heading[(i + 1) % steps] - h;
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) / ds;
  });

  const LOOKAHEAD = 14;
  const raw = curvature.map((_, i) => {
    let c = 0;
    for (let j = 0; j < LOOKAHEAD; j++) c = Math.max(c, curvature[(i + j) % steps]);
    return Math.max(0.3, 1 / (1 + c * 60));
  });
  const speed = raw.map((_, i) => {
    let sum = 0;
    for (let j = -4; j <= 4; j++) sum += raw[(i + j + steps) % steps];
    return sum / 9;
  });

  const time = [0];
  for (let i = 0; i < steps; i++) time.push(time[i] + ds / speed[i]);
  const total = time[steps];

  return (t) => {
    const target = Math.min(1, Math.max(0, t)) * total;
    let lo = 0;
    let hi = steps;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (time[mid] <= target) lo = mid; else hi = mid;
    }
    const span = time[hi] - time[lo] || 1;
    return (lo + (target - time[lo]) / span) / steps;
  };
}

/* ---- Project racing line -------------------------------------
   Built from the real card layout: a straight through each gap
   between rows, joined by hairpins at the edges, so the car shows
   in the gaps and passes behind the sheets. Rebuilt on resize.  */
function projectLine({ anime, reduce }) {
  const { animate, svg, onScroll, utils } = anime;
  const wrap = document.getElementById('projectTrack');
  const svgEl = document.getElementById('projectLine');
  const path = document.getElementById('projectPath');
  const car = document.getElementById('projectCar');
  if (!wrap || !svgEl || !path) return null;

  let anim = null;
  let frame = 0;

  const build = () => {
    const box = wrap.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const W = box.width;

    const rows = [];
    wrap.querySelectorAll('.spec-card').forEach((card) => {
      const r = card.getBoundingClientRect();
      const top = r.top - box.top;
      const bottom = r.bottom - box.top;
      const row = rows.find((x) => Math.abs(x.top - top) < 8);
      if (row) row.bottom = Math.max(row.bottom, bottom);
      else rows.push({ top, bottom });
    });
    if (!rows.length) return;
    rows.sort((a, b) => a.top - b.top);

    const gaps = [rows[0].top - 18];
    rows.forEach((row, i) => gaps.push(rows[i + 1] ? (row.bottom + rows[i + 1].top) / 2 : row.bottom + 22));

    const left = W * 0.05;
    const right = W * 0.95;
    const bulge = Math.min(W * 0.045, 36);
    let d = `M${left.toFixed(1)} ${gaps[0].toFixed(1)}`;
    gaps.forEach((y, i) => {
      const toRight = i % 2 === 0;
      const end = toRight ? right : left;
      d += ` H${end.toFixed(1)}`;
      const next = gaps[i + 1];
      if (next !== undefined) {
        const cx = end + (toRight ? bulge : -bulge);
        d += ` C${cx.toFixed(1)} ${y.toFixed(1)} ${cx.toFixed(1)} ${next.toFixed(1)} ${end.toFixed(1)} ${next.toFixed(1)}`;
      }
    });

    svgEl.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${box.height.toFixed(1)}`);
    path.setAttribute('d', d);

    if (reduce || !car) return;
    anim?.revert();
    utils.set(car, { opacity: 1 });
    anim = animate(car, {
      ...svg.createMotionPath(path),
      ease: 'linear',
      autoplay: onScroll({
        target: wrap,
        enter: { target: 'top', container: 'bottom' },
        leave: { target: 'bottom', container: 'top' },
        sync: 0.25,
      }),
    });
  };

  build();
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(build);
  });
  ro.observe(wrap);

  return () => {
    ro.disconnect();
    cancelAnimationFrame(frame);
    anim?.revert();
  };
}

/* ---- Distant pack on the fixed backdrop ---------------------- */
function distantPack({ anime }) {
  const { animate, svg, createTimer } = anime;
  const layer = document.getElementById('distantCars');
  if (!layer) return null;

  const KINDS = [['car-gt3', 460, 130], ['car-lmp', 500, 110], ['car-f1', 560, 100]];
  const running = new Set();
  let timer = null;

  const spawn = () => {
    const [id, w, h] = pick(KINDS);
    const depth = Math.random();                    // 0 = near, 1 = far
    const scale = 0.34 - depth * 0.16;              // far cars are smaller
    const y = 640 - depth * 380;                    // and sit higher, toward the horizon
    const ltr = Math.random() < 0.7;
    const duration = 11000 - depth * 4000;          // and cross faster
    const bend = rand(-28, 28);

    const route = document.createElementNS(SVGNS, 'path');
    route.setAttribute('d', `M-320 ${y} C 400 ${y + bend}, 1200 ${y - bend}, 1920 ${y}`);
    route.setAttribute('fill', 'none');
    layer.append(route);

    const count = Math.random() < 0.6 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'distant__car');
      const flip = document.createElementNS(SVGNS, 'g');
      if (!ltr) flip.setAttribute('transform', 'scale(-1 1)');
      const use = document.createElementNS(SVGNS, 'use');
      const cw = w * scale;
      const ch = h * scale;
      use.setAttribute('href', `#${id}`);
      use.setAttribute('x', String(-cw / 2));
      use.setAttribute('y', String(-ch));
      use.setAttribute('width', String(cw));
      use.setAttribute('height', String(ch));
      flip.append(use);
      g.append(flip);
      layer.append(g);

      const a = animate(g, {
        ...svg.createMotionPath(route),
        duration: duration + i * rand(120, 260),
        delay: i * rand(420, 700),
        reversed: !ltr,
        ease: 'linear',
        onComplete: () => {
          g.remove();
          running.delete(a);
          if (![...running].some((r) => r.route === route)) route.remove();
        },
      });
      a.route = route;
      running.add(a);
    }

    timer = createTimer({ duration: rand(26000, 44000), onComplete: spawn });
  };

  timer = createTimer({ duration: rand(5000, 9000), onComplete: spawn });

  return () => {
    timer?.revert();
    running.forEach((a) => a.revert());
    running.clear();
    layer.replaceChildren();
  };
}
