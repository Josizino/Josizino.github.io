/* ============================================================
   reveal.js — scroll-triggered entrances.

   IntersectionObserver decides when; Anime.js decides how. Each
   element plays once and is marked `data-revealed`, which CSS
   uses to keep it visible even if the scope later reverts.

   Entrances by kind:
     section head   lap counter slides, title rises, rule draws out
     project sheet  panel rises, racing line sweeps, figures count up
     skill channel  panel rises, evidence segments fill in order
     timeline stint card slides in from the rail
   The timeline rail itself fills in step with scrolling.
   ============================================================ */

const seen = new WeakSet();

export function reveals({ anime, reduce, late }) {
  const { animate, stagger, utils, onScroll } = anime;
  const items = [...document.querySelectorAll('[data-reveal]')];
  const mark = (el) => { el.setAttribute('data-revealed', ''); seen.add(el); };

  if (reduce || late) {
    items.forEach(mark);
    return null;
  }

  const countUp = (scope, delay) => {
    scope.querySelectorAll('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count);
      if (!to) return;
      const o = { v: 0 };
      el.textContent = '0';
      animate(o, {
        v: to,
        delay,
        duration: 900,
        ease: 'out(3)',
        onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      });
    });
  };

  const play = (el, order) => {
    const d = order * 90;
    const done = () => mark(el);

    if (el.matches('.sec-head')) {
      const parts = el.querySelectorAll('.sec-head__lap, .sec-head__title, .sec-head__sub');
      const rule = el.querySelector('.sec-head__rule');
      utils.set(parts, { opacity: 0 });
      if (rule) utils.set(rule, { scaleX: 0 });
      utils.set(el, { opacity: 1 });
      animate(parts, { opacity: [0, 1], y: ['0.5em', '0em'], duration: 620, delay: stagger(90, { start: d }), ease: 'out(4)' });
      if (rule) animate(rule, { scaleX: [0, 1], duration: 900, delay: d + 220, ease: 'inOut(3)', onComplete: done });
      else done();
      return;
    }

    if (el.matches('.spec-card')) {
      animate(el, { opacity: [0, 1], y: [28, 0], duration: 700, delay: d, ease: 'out(4)', onComplete: done });
      const sweep = el.querySelector('.spec-card__sweep');
      if (sweep) {
        animate(sweep, { translateX: ['-100%', '340%'], opacity: [0, 1, 1, 0], duration: 1000, delay: d + 380, ease: 'inOut(2)' });
      }
      countUp(el, d + 300);
      return;
    }

    if (el.matches('.channel')) {
      const segs = el.querySelectorAll('.meter__bar i');
      utils.set(segs, { scaleX: 0 });
      animate(el, { opacity: [0, 1], y: [24, 0], duration: 640, delay: d, ease: 'out(4)', onComplete: done });
      animate(segs, { scaleX: [0, 1], duration: 360, delay: stagger(22, { start: d + 260 }), ease: 'out(3)' });
      return;
    }

    if (el.matches('.stint')) {
      const card = el.querySelector('.stint__card');
      const when = el.querySelector('.stint__when');
      utils.set([card, when], { opacity: 0 });
      utils.set(el, { opacity: 1 });
      animate(when, { opacity: [0, 1], x: [-12, 0], duration: 500, delay: d, ease: 'out(3)' });
      animate(card, { opacity: [0, 1], x: [36, 0], duration: 700, delay: d + 80, ease: 'out(4)', onComplete: done });
      return;
    }

    animate(el, { opacity: [0, 1], y: [20, 0], duration: 620, delay: d, ease: 'out(3)', onComplete: done });
  };

  // Batch whatever enters together so siblings stagger.
  let delivered = false;
  const io = new IntersectionObserver((entries) => {
    delivered = true;
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      io.unobserve(e.target);
      play(e.target, i);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => (seen.has(el) ? mark(el) : io.observe(el)));

  // Some embedded and background rendering contexts never deliver
  // observer callbacks. Never leave content hidden because of that.
  const watchdog = setTimeout(() => {
    if (delivered) return;
    io.disconnect();
    items.forEach(mark);
  }, 1500);

  // Timeline rail fills as the timeline scrolls through centre.
  const rail = document.getElementById('timelineProgress');
  const timeline = document.getElementById('timeline');
  let railAnim = null;
  if (rail && timeline) {
    railAnim = animate(rail, {
      scaleY: [0, 1],
      ease: 'linear',
      autoplay: onScroll({
        target: timeline,
        enter: { target: 'top', container: 'center' },
        leave: { target: 'bottom', container: 'center' },
        sync: true,
      }),
    });
  }

  return () => {
    clearTimeout(watchdog);
    io.disconnect();
    railAnim?.revert();
  };
}
