/* ============================================================
   motion/index.js — orchestrates every Anime.js behaviour.

   One Anime.js Scope owns the lot. Its media queries decide
   between full motion and the static alternative, and when one
   changes (reduced motion toggled, the window crossing the wide
   breakpoint) the scope reverts every animation it created, runs
   each module's cleanup, and builds the scene again.

   Module contract: `module(ctx)` sets up its behaviour and
   returns a cleanup function (or null). Modules never import the
   library themselves; it arrives through ctx.anime, so there is
   exactly one place that loads it.
   ============================================================ */

import { intro } from './intro.js';
import { reveals } from './reveal.js';
import { interactions } from './interactions.js';
import { telemetry } from './telemetry.js';
import { cars } from './cars.js';

const MODULES = [intro, reveals, interactions, telemetry, cars];

export function startMotion(anime) {
  const root = document.documentElement;

  // If the head watchdog already gave up waiting, content is on
  // screen: skip entrances rather than hiding it again.
  const late = root.classList.contains('no-motion');
  if (!late) root.classList.add('motion');

  const scope = anime.createScope({
    mediaQueries: {
      reduce: '(prefers-reduced-motion: reduce)',
      wide: '(min-width: 901px)',
    },
  }).add((self) => {
    const ctx = {
      anime,
      reduce: self.matches.reduce,
      wide: self.matches.wide,
      late,
    };

    // A failing module must not take the others down with it.
    const cleanups = MODULES.map((mod) => {
      try {
        return mod(ctx);
      } catch (err) {
        console.warn(`[motion] ${mod.name} failed:`, err);
        return null;
      }
    });

    return () => cleanups.forEach((fn) => fn && fn());
  });

  window.addEventListener('pagehide', (e) => {
    if (!e.persisted) scope.revert();
  });

  return scope;
}
