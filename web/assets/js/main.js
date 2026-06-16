/* ============================================================
   KAELUM — Interactions: hero entrance, scroll reveals,
   nav, mobile menu, animated process line.
   Zero dependencies.
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero entrance orchestration ----------
     Sequence (delays in ms):
     nav 0 · badge 200 · title words stagger 40 (start 400)
     · subtitle 800 · CTAs 1000 · proof 1100 · particles 1200 */
  function animateHero() {
    if (reduce) {
      document.querySelectorAll('[data-hero]').forEach(el => (el.style.opacity = '1'));
      if (window.KAELUM_startParticles) window.KAELUM_startParticles();
      return;
    }

    const set = (el, delay, fromY = 12) => {
      if (!el) return;
      el.style.transform = `translateY(${fromY}px)`;
      el.style.transition = 'opacity .7s var(--ease), transform .7s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, delay);
    };

    set(document.querySelector('[data-hero="badge"]'), 200, 8);

    // Headline: words enter one by one, stagger 40ms, base delay 400ms.
    const words = document.querySelectorAll('.hero__title .word');
    words.forEach((wd, i) => {
      wd.style.opacity = '0';
      wd.style.transform = 'translateY(24px)';
      wd.style.transition = 'opacity .6s ease, transform .7s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => { wd.style.opacity = '1'; wd.style.transform = 'none'; }, 400 + i * 40);
    });
    const title = document.querySelector('[data-hero="title"]');
    if (title) title.style.opacity = '1';

    set(document.querySelector('[data-hero="subtitle"]'), 800);
    set(document.querySelector('[data-hero="ctas"]'), 1000);
    set(document.querySelector('[data-hero="proof"]'), 1100);

    setTimeout(() => { if (window.KAELUM_startParticles) window.KAELUM_startParticles(); }, 1200);
  }

  /* ---------- Scroll reveals (fade-up + blur) ---------- */
  function initReveals() {
    const items = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const stagger = parseInt(el.dataset.stagger || '0', 10) * 80; // 80ms stagger
        setTimeout(() => el.classList.add('is-visible'), stagger);
        io.unobserve(el); // never re-animate on scroll-up
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Animated process line ---------- */
  function initProcessLine() {
    const fill = document.getElementById('processLine');
    if (!fill) return;
    if (reduce || !('IntersectionObserver' in window)) { fill.style.width = '100%'; return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { fill.style.width = '100%'; io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(document.getElementById('proceso'));
  }

  /* ---------- Nav: hide on scroll down, show on scroll up ---------- */
  function initNav() {
    const nav = document.getElementById('nav');
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > last && y > 200) nav.style.transform = 'translateY(-100%)';
      else nav.style.transform = 'translateY(0)';
      last = y;
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobile() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const panel = document.getElementById('mobilePanel');
    const overlay = document.getElementById('mobileOverlay');
    if (!burger) return;

    const open = () => {
      nav.classList.add('is-open'); panel.classList.add('is-open');
      overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('is-visible'));
      burger.setAttribute('aria-expanded', 'true'); panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      nav.classList.remove('is-open'); panel.classList.remove('is-open');
      overlay.classList.remove('is-visible'); setTimeout(() => (overlay.hidden = true), 300);
      burger.setAttribute('aria-expanded', 'false'); panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => nav.classList.contains('is-open') ? close() : open());
    overlay.addEventListener('click', close);
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  function init() {
    animateHero();
    initReveals();
    initProcessLine();
    initNav();
    initMobile();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
