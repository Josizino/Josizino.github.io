/* ============================================================
   app.js — entry point.

   Core behaviour (navigation, contact form) never depends on the
   animation library. Anime.js and the motion system load after,
   through a dynamic import: if either fails, the page is marked
   `no-motion`, content stays visible, and everything still works.
   ============================================================ */

import { initNav } from './ui/nav.js';
import { initContact } from './ui/contact.js';

initNav();
initContact();

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

(async () => {
  const root = document.documentElement;
  try {
    const anime = await import('./vendor/anime.esm.min.js');
    const { startMotion } = await import('./motion/index.js');
    startMotion(anime);
  } catch (err) {
    root.classList.add('no-motion');
    console.warn('[motion] disabled, static layout in use:', err);
  }
})();
