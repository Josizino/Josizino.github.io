/* ============================================================
   intro.js — the start-up sequence. About 1.6 seconds, once.

   1. Race control reports "Initialising"
   2. Navigation drops into place
   3. The name, role, and actions rise in sequence
   4. The track map and the racing line draw themselves
   5. Readouts come online, status flips to "Systems online"
   6. `intro:done` fires; telemetry and cars start

   Nothing blocks input: every element is interactive the moment
   it is visible, and there is no loading screen.
   ============================================================ */

let played = false;

export function intro({ anime, reduce, late }) {
  const { createTimeline, splitText, stagger, utils, svg, animate } = anime;
  const root = document.documentElement;
  const sys = document.getElementById('sysStatus');

  const finish = () => {
    played = true;
    root.classList.add('intro-done');
    if (sys) {
      sys.textContent = 'Systems online';
      sys.classList.remove('status--caution');
      sys.classList.add('status--go');
    }
    document.dispatchEvent(new CustomEvent('intro:done'));
  };

  // Replays are pointless and reduced motion gets the end state.
  if (played || reduce || late) {
    finish();
    return null;
  }

  const $ = (s) => document.querySelector(s);
  const nameEl = $('.hero__name');
  const roleEl = $('.hero__role');
  const navParts = document.querySelectorAll('.nav__brand, .nav__list > li, .nav__toggle');
  const trackLine = document.getElementById('trackPath');
  const heroLine = document.getElementById('heroLine');

  if (sys) {
    sys.textContent = 'Initialising';
    sys.classList.remove('status--go');
    sys.classList.add('status--caution');
  }

  const name = splitText(nameEl, { chars: true });
  const role = splitText(roleEl, { words: true });

  // Hide the pieces before revealing their parents, so nothing
  // flashes during a stagger delay.
  utils.set([...name.chars, ...role.words], { opacity: 0 });
  utils.set('.console__readouts > div, .console__trace, .console__note, .lane--hero .lane__kerb', { opacity: 0 });
  utils.set([nameEl, roleEl], { opacity: 1 });

  const [trackDraw] = trackLine ? svg.createDrawable(trackLine) : [];
  const [laneDraw] = heroLine ? svg.createDrawable(heroLine) : [];

  const tl = createTimeline({
    defaults: { ease: 'out(3)', duration: 520 },
    onComplete: () => {
      finish();
      if (sys) animate(sys, { opacity: [0.35, 1], duration: 320, ease: 'out(2)' });
    },
  });

  tl.add(navParts, { opacity: [0, 1], y: [-10, 0], delay: stagger(40) }, 0)
    .add('.hero__status', { opacity: [0, 1], x: [-14, 0] }, 120)
    .add(name.chars, {
      opacity: [0, 1],
      y: ['0.42em', '0em'],
      skewX: [-14, 0],
      duration: 640,
      ease: 'out(4)',
      delay: stagger(26),
    }, 180)
    .add(role.words, { opacity: [0, 1], y: ['0.6em', '0em'], delay: stagger(45) }, 520)
    .add('.hero__lede', { opacity: [0, 1], y: [14, 0] }, 700)
    .add('.hero__actions', { opacity: [0, 1], y: [14, 0] }, 780)
    .add('.console', { opacity: [0, 1], x: [32, 0], duration: 700, ease: 'out(4)' }, 260);

  if (trackDraw) tl.add(trackDraw, { draw: ['0 0', '0 1'], duration: 1100, ease: 'inOut(2)' }, 560);
  if (laneDraw) tl.add(laneDraw, { draw: ['0 0', '0 1'], duration: 1300, ease: 'inOut(2)' }, 360);

  tl.add('.lane--hero .lane__kerb', { opacity: [0, 1], duration: 700 }, 900)
    .add('.console__readouts > div', { opacity: [0, 1], y: [8, 0], delay: stagger(60) }, 900)
    .add('.console__trace, .console__note', { opacity: [0, 1], duration: 500 }, 1050);

  return () => {
    if (!played) finish();
  };
}
