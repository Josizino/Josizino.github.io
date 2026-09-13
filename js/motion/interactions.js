/* ============================================================
   interactions.js — hover, press, menu, and form feedback.

   CSS already gives every control a visible hover and focus
   state; this layer adds the telemetry-style detail on top.
   Pointer effects run only on hover-capable fine pointers, so
   touch devices get plain, fast taps. Keyboard focus triggers the
   same card feedback as hover.
   ============================================================ */

export function interactions({ anime, reduce }) {
  const { animate, stagger, svg } = anime;
  const ac = new AbortController();
  const opts = { signal: ac.signal };
  const on = (el, type, fn) => el && el.addEventListener(type, fn, opts);
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Mobile menu: links arrive in order ------------------- */
  on(document, 'nav:toggle', (e) => {
    if (!e.detail.open || reduce) return;
    animate(e.detail.list.querySelectorAll('li'), {
      opacity: [0, 1],
      x: [-18, 0],
      duration: 420,
      delay: stagger(45),
      ease: 'out(3)',
    });
  });

  /* ---- Contact feedback -------------------------------------- */
  const form = document.getElementById('contactForm');
  const link = document.getElementById('formLink');
  const signal = document.getElementById('signalPath');
  const [signalDraw] = signal ? svg.createDrawable(signal) : [];
  const LINK = {
    invalid: ['Check fields', 'status--red'],
    ready: ['Ready to send', 'status--go'],
    copied: ['Copied', 'status--go'],
  };

  on(form, 'contact:state', (e) => {
    const state = e.detail.state;
    if (link && LINK[state]) {
      link.textContent = LINK[state][0];
      link.className = `status ${LINK[state][1]}`;
    }
    if (reduce) return;
    if (state === 'invalid') {
      animate(form.querySelector('.comms__form-head'), { x: [0, -6, 6, -3, 0], duration: 380, ease: 'inOut(2)' });
    } else if (signalDraw) {
      animate(signal, { opacity: [0, 1, 1, 0], duration: 1200, ease: 'linear' });
      animate(signalDraw, { draw: ['0 0', '0 1', '1 1'], duration: 1200, ease: 'inOut(2)' });
    }
  });

  if (reduce) return () => ac.abort();

  /* ---- Project sheets: racing line + readouts ---------------- */
  document.querySelectorAll('[data-card]').forEach((card) => {
    const sweep = card.querySelector('.spec-card__sweep');
    const figures = card.querySelectorAll('[data-count]');
    let busy = false;

    const run = () => {
      if (busy || !card.hasAttribute('data-revealed')) return;
      busy = true;
      if (sweep) {
        animate(sweep, {
          translateX: ['-100%', '340%'],
          opacity: [0, 1, 1, 0],
          duration: 900,
          ease: 'inOut(2)',
          onComplete: () => { busy = false; },
        });
      } else {
        busy = false;
      }
      figures.forEach((el) => {
        const to = Number(el.dataset.count);
        if (!to) return;
        const o = { v: Math.floor(to * 0.6) };
        animate(o, { v: to, duration: 520, ease: 'out(3)', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      });
    };

    if (finePointer) on(card, 'pointerenter', run);
    on(card, 'focusin', run);
  });

  if (!finePointer) return () => ac.abort();

  /* ---- Skill channels: lit segments ripple ------------------- */
  document.querySelectorAll('.channel').forEach((channel) => {
    const lit = [...channel.querySelectorAll('.meter')].flatMap((meter) => {
      const n = parseInt(meter.style.getPropertyValue('--n'), 10) || 0;
      return [...meter.querySelectorAll('.meter__bar i')].slice(0, n);
    });
    on(channel, 'pointerenter', () => {
      animate(lit, { opacity: [1, 0.3, 1], duration: 520, delay: stagger(28), ease: 'inOut(2)' });
    });
  });

  /* ---- Buttons: a short mechanical press --------------------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    const release = () => animate(btn, { scale: 1, duration: 280, ease: 'outBack(3)' });
    on(btn, 'pointerdown', () => animate(btn, { scale: 0.965, duration: 90, ease: 'out(2)' }));
    on(btn, 'pointerup', release);
    on(btn, 'pointerleave', release);
  });

  /* ---- Nav and comms rows: the index digit ticks -------------- */
  document.querySelectorAll('.nav__link').forEach((a) => {
    const idx = a.querySelector('.nav__idx');
    on(a, 'pointerenter', () => idx && animate(idx, { y: ['-0.5em', '0em'], opacity: [0, 1], duration: 260, ease: 'out(3)' }));
  });

  document.querySelectorAll('.radio__row').forEach((row) => {
    const arrow = row.querySelector('.radio__go');
    on(row, 'pointerenter', () => arrow && animate(arrow, { x: [-6, 3], opacity: [0.4, 1], duration: 320, ease: 'out(3)' }));
    on(row, 'pointerleave', () => arrow && animate(arrow, { x: 0, duration: 240, ease: 'out(2)' }));
  });

  return () => ac.abort();
}
