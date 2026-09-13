/* ============================================================
   nav.js — sticky state, active sector, mobile menu.

   Works with no animation library at all. The motion system
   listens for the events dispatched here ('sector:change',
   'nav:toggle') and layers animation on top.
   ============================================================ */

export function initNav() {
  const nav = document.getElementById('nav');
  const sentinel = document.getElementById('top');
  const toggle = document.getElementById('navToggle');
  const list = document.getElementById('navList');
  if (!nav) return () => {};

  const ac = new AbortController();
  const observers = [];

  /* ---- Sticky: a zero-height sentinel, not a scroll listener -- */
  if (sentinel) {
    const io = new IntersectionObserver(([entry]) => {
      nav.classList.toggle('is-stuck', !entry.isIntersecting);
    });
    io.observe(sentinel);
    observers.push(io);
  }

  /* ---- Active sector ------------------------------------------
     The root margin collapses the viewport to a band across its
     middle, so exactly one section counts as current.          */
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = new Map(
    [...document.querySelectorAll('.nav__link[href^="#"]')].map((a) => [a.hash.slice(1), a])
  );

  if (sections.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        for (const [key, a] of links) {
          const on = key === id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
        document.dispatchEvent(new CustomEvent('sector:change', {
          detail: { id, index: sections.indexOf(entry.target), total: sections.length },
        }));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
    observers.push(io);
  }

  /* ---- Mobile menu -------------------------------------------- */
  if (toggle && list) {
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    const setOpen = (open, { returnFocus = false } = {}) => {
      if (open === isOpen()) return;
      toggle.setAttribute('aria-expanded', String(open));
      list.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      document.dispatchEvent(new CustomEvent('nav:toggle', { detail: { open, list } }));
      if (open) list.querySelector('a')?.focus({ preventScroll: true });
      else if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(!isOpen()), { signal: ac.signal });

    list.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    }, { signal: ac.signal });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
    }, { signal: ac.signal });

    document.addEventListener('click', (e) => {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
    }, { signal: ac.signal });

    // Leaving the mobile breakpoint with the sheet open would strand it.
    const wide = window.matchMedia('(min-width: 861px)');
    wide.addEventListener('change', (e) => { if (e.matches) setOpen(false); }, { signal: ac.signal });
  }

  return () => {
    ac.abort();
    observers.forEach((io) => io.disconnect());
  };
}
