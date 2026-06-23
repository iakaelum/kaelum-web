/* ============================================================
   KAELUM — Elemento característico: campo de partículas físicas.
   Velocidad + masa + repulsión suave respecto al cursor.
   Se activa al final de la entrada del hero (ver main.js).
   ============================================================ */
(function () {
  var canvas = document.getElementById("particles");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d", { alpha: true });
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var particles = [];
  var w = 0, h = 0, running = false, raf = null;

  var mouse = { x: -9999, y: -9999, active: false };
  var REPEL_RADIUS = isMobile ? 90 : 140;
  var REPEL_FORCE = 0.9;
  var COLORS = ["#6B5CE7", "#B8A3FF", "#4338CA", "#818cf8"];

  function size() {
    var rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeParticles() {
    var area = w * h;
    var target = Math.min(isMobile ? 46 : 110, Math.round(area / 14000));
    particles = [];
    for (var i = 0; i < target; i++) {
      var r = Math.random() * 2.0 + 0.8;
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        hx: Math.random() * w, hy: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: r, mass: r,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: Math.random() * 0.5 + 0.25
      });
    }
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.vx += (p.hx - p.x) * 0.0009;
      p.vy += (p.hy - p.y) * 0.0009;
      if (mouse.active) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          var f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE / p.mass;
          p.vx += (dx / dist) * f; p.vy += (dy / dist) * f;
        }
      }
      p.vx *= 0.94; p.vy *= 0.94;
      p.x += p.vx; p.y += p.vy;
    }
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var pa = particles[a], pb = particles[b];
        var ddx = pa.x - pb.x, ddy = pa.y - pb.y;
        var d2 = ddx * ddx + ddy * ddy;
        if (d2 < 13000) {
          var o = (1 - d2 / 13000) * 0.16;
          ctx.strokeStyle = "rgba(107,92,231," + o + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
    }
    for (var k = 0; k < particles.length; k++) {
      var q = particles[k];
      ctx.globalAlpha = q.alpha; ctx.fillStyle = q.color;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(step);
  }

  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    var pt = e.touches ? e.touches[0] : e;
    mouse.x = pt.clientX - rect.left; mouse.y = pt.clientY - rect.top; mouse.active = true;
  }
  function onLeave() { mouse.active = false; mouse.x = mouse.y = -9999; }
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("mouseout", onLeave, { passive: true });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { size(); makeParticles(); }, 200);
  });

  // Pausa cuando el hero sale de pantalla (ahorra CPU/batería)
  var hero = document.getElementById("hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && running && !raf) raf = requestAnimationFrame(step);
      if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0 }).observe(hero);
  }

  window.KAELUM_startParticles = function () {
    if (running) return;
    size(); makeParticles(); running = true;
    canvas.style.transition = "opacity 1.2s ease";
    canvas.style.opacity = "0";
    requestAnimationFrame(function () { canvas.style.opacity = "1"; });
    raf = requestAnimationFrame(step);
  };
})();
