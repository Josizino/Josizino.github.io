/* ============================================================
   telemetry.js — the race-control readouts.

   Every value is real and describes this visit, never a race:
     Session   time since the page loaded
     Lap       which of the six sections is current
     Distance  how far down the page you are
     Sector    the current section's name
     Trace     your scroll velocity and pointer speed, sampled live

   The trace draws like an oscilloscope: a cursor sweeps across
   and writes the newest sample where it passes. When you are
   idle the line is flat, because nothing is happening.
   ============================================================ */

export function telemetry({ anime, reduce }) {
  const { createTimer, animate, onScroll } = anime;
  const byId = (id) => document.getElementById(id);
  const session = byId('roSession');
  const lap = byId('roLap');
  const distance = byId('roDistance');
  const sector = byId('roSector');
  const traceLine = byId('traceLine');
  const cursor = byId('traceCursor');
  const consoleEl = document.querySelector('.console');
  if (!session || !lap || !distance || !sector) return null;

  const ac = new AbortController();
  const owned = [];
  const pad = (n, w = 2) => String(n).padStart(w, '0');

  /* ---- Session clock ------------------------------------------
     performance.now() counts from navigation start, so the clock
     stays correct even if the scope rebuilds this module.        */
  const tick = () => {
    const s = Math.floor(performance.now() / 1000);
    session.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  };
  tick();
  owned.push(createTimer({ duration: 1000, loop: true, onLoop: tick }));

  /* ---- Lap and sector ----------------------------------------- */
  const total = document.querySelectorAll('main section[id]').length;
  const nameOf = (id) => {
    const a = document.querySelector(`.nav__link[href="#${id}"]`);
    return a ? a.lastChild.textContent.trim() : id;
  };
  let lastIndex = -1;
  const setSector = (id, index, animateChange) => {
    if (index === lastIndex) return;
    lastIndex = index;
    lap.textContent = `${pad(index + 1)}/${pad(total)}`;
    sector.textContent = nameOf(id);
    if (animateChange && !reduce) {
      animate([lap, sector], { opacity: [0, 1], y: ['0.35em', '0em'], duration: 320, ease: 'out(3)' });
    }
  };

  // Pick up the current section if the nav already marked one
  // (for example after a reload restored the scroll position).
  const active = document.querySelector('.nav__link.is-active');
  if (active) {
    const ids = [...document.querySelectorAll('main section[id]')].map((s) => s.id);
    const id = active.hash.slice(1);
    setSector(id, ids.indexOf(id), false);
  }

  document.addEventListener('sector:change', (e) => {
    setSector(e.detail.id, e.detail.index, true);
  }, { signal: ac.signal });

  /* ---- Distance: scrubbed straight from the scroll position ---- */
  const reading = { p: 0 };
  owned.push(animate(reading, {
    p: [0, 100],
    ease: 'linear',
    onUpdate: () => { distance.textContent = `${pad(Math.round(reading.p), 3)}%`; },
    autoplay: onScroll({
      target: document.body,
      enter: { target: 'top', container: 'top' },
      leave: { target: 'bottom', container: 'bottom' },
      sync: true,
    }),
  }));

  const cleanup = () => {
    ac.abort();
    owned.forEach((o) => o.revert());
  };

  /* ---- Input trace (motion only) ------------------------------ */
  if (reduce || !traceLine || !cursor || !consoleEl) return cleanup;

  const N = 90;
  const W = 300;
  const MID = 28;
  const AMP = 24;
  const xs = Array.from({ length: N }, (_, i) => (i / (N - 1)) * W);
  const samples = new Float32Array(N);
  let head = 0;
  let lastP = reading.p;
  let pointerTravel = 0;
  let px = null;
  let py = null;

  document.addEventListener('pointermove', (e) => {
    if (px !== null) pointerTravel += Math.hypot(e.clientX - px, e.clientY - py);
    px = e.clientX;
    py = e.clientY;
  }, { signal: ac.signal, passive: true });

  const sample = () => {
    const dp = reading.p - lastP;               // percent of page since last sample
    lastP = reading.p;
    const scroll = Math.max(-1, Math.min(1, dp * 2.2));
    const pointer = Math.min(1, pointerTravel / 140);
    pointerTravel = 0;

    // Magnitude is whichever input is stronger; scroll direction
    // sets the sign, so scrolling up deflects the trace downward.
    samples[head] = (scroll < 0 ? -1 : 1) * Math.max(Math.abs(scroll), pointer);

    let points = '';
    for (let i = 0; i < N; i++) points += `${xs[i].toFixed(1)},${(MID - samples[i] * AMP).toFixed(1)} `;
    traceLine.setAttribute('points', points);
    cursor.setAttribute('x1', xs[head]);
    cursor.setAttribute('x2', xs[head]);
    head = (head + 1) % N;
  };

  const sampler = createTimer({ duration: 33, loop: true, onLoop: sample });
  owned.push(sampler);

  // Only sample while the console is on screen.
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) sampler.play();
    else sampler.pause();
  });
  io.observe(consoleEl);

  return () => {
    io.disconnect();
    cleanup();
  };
}
