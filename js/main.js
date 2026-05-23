/* ── Navbar scroll effect ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ── Mobile nav toggle ────────────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Typing animation ─────────────────────────────────────── */
const phrases = [
  'cybersecurity_student',
  'threat_hunter',
  'data_analyst',
  'blue_team_defender',
  'python_developer',
];

let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  const phrase = phrases[phraseIdx];

  if (!deleting) {
    typedEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typedEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }

  setTimeout(type, deleting ? 45 : 90);
}

type();

/* ── Reveal on scroll ─────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay    = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ── Animated counters ────────────────────────────────────── */
function animateCount(el, target, duration = 1200) {
  const start     = performance.now();
  const isYear    = target > 1000;
  const startVal  = isYear ? target - 4 : 0;

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(startVal + (target - startVal) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(el => {
        animateCount(el, +el.dataset.target);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statsObserver.observe(statsEl);

/* ── Skill bar animation ──────────────────────────────────── */
const barsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      barsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const profEl = document.querySelector('.proficiency-section');
if (profEl) barsObserver.observe(profEl);

/* ── Active nav link on scroll ────────────────────────────── */
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${entry.target.id}`) {
          a.style.color = 'var(--cyan)';
        }
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => sectionObserver.observe(s));

/* ── Particle canvas ──────────────────────────────────────── */
(function initParticles() {
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let   W, H, particles = [];

  const PARTICLE_COUNT = 55;
  const MAX_DIST       = 130;
  const COLORS         = ['rgba(0,212,255,', 'rgba(124,58,237,', 'rgba(34,211,160,'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  init();
  loop();
})();

/* ── Smooth active link clicks ────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Footer year ──────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Tilt effect on project cards ────────────────────────── */
document.querySelectorAll('.project-card-featured').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
