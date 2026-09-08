/* ============================================================
   main.js

   Four small behaviours, each self-contained. Everything that
   reacts to scroll position uses IntersectionObserver rather
   than a scroll listener, so nothing runs per frame.

   Smooth scrolling and reduced-motion are handled in CSS
   (scroll-behavior + the prefers-reduced-motion block), not here.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky nav ------------------------------------------
     A zero-height sentinel sits at the top of the document. The
     nav gets its solid background exactly when that sentinel
     leaves the viewport.                                       */
  function stickyNav() {
    var nav = document.getElementById('nav');
    var sentinel = document.getElementById('top');
    if (!nav || !sentinel) return;

    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---- Scroll reveals --------------------------------------
     Progressive enhancement: the markup is visible until this
     runs. We only take the hidden start state once we know an
     observer exists to undo it, so a script error or an
     unsupported browser cannot leave the page blank.

     A watchdog covers the remaining case where the observer is
     created but never delivers (some embedded and background
     rendering contexts do not service IntersectionObserver).   */
  function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('js-reveal');

    var pending = items.length;
    var delivered = false;

    var io = new IntersectionObserver(function (entries) {
      delivered = true;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
        pending--;
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });

    function showAll() {
      io.disconnect();
      items.forEach(function (el) { el.classList.add('is-in'); });
    }

    // If nothing has been delivered shortly after load, assume the
    // observer will not fire and show the content.
    window.setTimeout(function () {
      if (!delivered && pending > 0) showAll();
    }, 1200);
  }

  /* ---- Active section in the nav ---------------------------
     The margins collapse the viewport to a band across its
     middle, so exactly one section is "current" at a time.     */
  function activeLink() {
    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('.nav__link[href^="#"]');
    if (!sections.length || !links.length) return;

    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute('href').slice(1)] = link;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var current = byId[entry.target.id];
        if (!current) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        current.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---- Mobile menu -----------------------------------------
     Opens the nav sheet, keeps aria-expanded truthful, and
     closes on link click, Escape, or a click outside.          */
  function mobileMenu() {
    var toggle = document.getElementById('navToggle');
    var list = document.getElementById('navList');
    var nav = document.getElementById('nav');
    if (!toggle || !list || !nav) return;

    function setOpen(open) {
      list.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      toggle.focus();
    });

    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (!nav.contains(e.target)) setOpen(false);
    });
  }

  /* ---- Footer year ----------------------------------------- */
  function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  stickyNav();
  reveals();
  activeLink();
  mobileMenu();
  year();
})();
