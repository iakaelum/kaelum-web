/* ============================================================
   KAELUM — Signature element: physics-based particle field
   Real velocity + mass + soft repulsion away from cursor.
   Activated last in the hero entrance sequence (see main.js).
   ============================================================ */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  // Reduce density on small screens to protect mobile CPU.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let particles = [];
  let w = 0, h = 0, running = false, raf = null;

  // Cursor (in CSS px). Repulsion radius + strength.
  const mouse = { x: -9999, y: -9999, active: false };
  const REPEL_RADIUS = isMobile ? 90 : 140;
  const REPEL_FORCE = 0.9;

  // Palette: deep purple -> electric blue.
  const COLORS = ['#6B5CE7', '#A78BFA', '#4338CA', '#818cf8'];

  function size() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticles() {
    const area = w * h;
    // Density scales with area; capped for performance.
    const target = Math.min(isMobile ? 46 : 110, Math.round(area / 14000));
    particles = [];
    for (let i = 0; i < target; i++) {
      const r = Math.random() * 2.0 + 0.8;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        // anchor point — particles drift gently around home
        hx: Math.random() * w,
        hy: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r,
        mass: r,                       // bigger = heavier = moves less
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: Math.random() * 0.5 + 0.25
      });
    }
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    // Re-anchor homes slowly so the field breathes.
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // soft spring back to home (keeps the field cohesive)
      p.vx += (p.hx - p.x) * 0.0009;
      p.vy += (p.hy - p.y) * 0.0009;

      // cursor repulsion (force inversely proportional to mass + distance)
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE / p.mass;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
      }

      // integrate + damping
      p.vx *= 0.94; p.vy *= 0.94;
      p.x += p.vx; p.y += p.vy;
    }

    // connection lines between near particles
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 13000) {
          const o = (1 - d2 / 13000) * 0.16;
          ctx.strokeStyle = `rgba(107,92,231,${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(step);
  }

  // ---- cursor tracking (relative to canvas) ----
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const pt = e.touches ? e.touches[0] : e;
    mouse.x = pt.clientX - rect.left;
    mouse.y = pt.clientY - rect.top;
    mouse.active = true;
  }
  function onLeave() { mouse.active = false; mouse.x = mouse.y = -9999; }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseout', onLeave, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { size(); makeParticles(); }, 200);
  });

  // Pause when hero is offscreen (saves battery/CPU).
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && running && !raf) raf = requestAnimationFrame(step);
      if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0 }).observe(hero);
  }

  // Public start hook — called by the hero entrance orchestration.
  window.KAELUM_startParticles = function () {
    if (running) return;
    size();
    makeParticles();
    running = true;
    canvas.style.transition = 'opacity 1.2s ease';
    canvas.style.opacity = '0';
    requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    raf = requestAnimationFrame(step);
  };
})();
