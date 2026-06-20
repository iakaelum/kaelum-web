/* ============================================================
   KAELUM — Interacciones (rediseño v2). Sin build.
   Fondo de orbes + parallax · Lenis (scroll suave) · reveals
   (fade-up+blur, stagger) · spotlight en cards · contadores ·
   header glass · menú móvil · dropdown · vídeo del hero.
   Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Fondo de orbes (inyectado, va en TODAS las páginas) ---------- */
  function injectOrbs() {
    if (document.querySelector(".bg-orbs")) return;
    var wrap = document.createElement("div");
    wrap.className = "bg-orbs";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<span class="orb orb-1"></span><span class="orb orb-2"></span><span class="orb orb-3"></span>';
    document.body.insertBefore(wrap, document.body.firstChild);
    return wrap;
  }

  /* ---------- Header glass + parallax de orbes al hacer scroll ---------- */
  var header = document.getElementById("site-header");
  var orbsEls = [];
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (!reduce && orbsEls.length) {
      orbsEls[0] && (orbsEls[0].style.translate = "0 " + (y * 0.12) + "px");
      orbsEls[1] && (orbsEls[1].style.translate = "0 " + (y * -0.08) + "px");
      orbsEls[2] && (orbsEls[2].style.translate = "0 " + (y * 0.05) + "px");
    }
  }

  /* ---------- Lenis: scroll suave (CDN, con fallback al nativo) ---------- */
  function initLenis() {
    if (reduce) return;
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js";
    s.async = true;
    s.onload = function () {
      if (!window.Lenis) return;
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      // anclas internas con Lenis
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id.length < 2) return;
          var target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -90 }); }
        });
      });
    };
    document.head.appendChild(s);
  }

  /* ---------- Entrada orquestada del hero ---------- */
  function animateHero() {
    var heroEls = document.querySelectorAll("[data-hero]");
    if (!heroEls.length) return;
    if (reduce) { heroEls.forEach(function (el) { el.style.opacity = "1"; }); return; }
    var set = function (sel, delay, fromY) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.style.transform = "translateY(" + (fromY || 12) + "px)";
      el.style.transition = "opacity .7s ease, transform .7s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(function () { el.style.opacity = "1"; el.style.transform = "none"; }, delay);
    };
    set('[data-hero="badge"]', 150, 8);

    var words = document.querySelectorAll('.hero__title .word');
    words.forEach(function (wd, i) {
      wd.style.opacity = "0";
      wd.style.transform = "translateY(24px)";
      wd.style.transition = "opacity .6s ease, transform .7s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(function () { wd.style.opacity = "1"; wd.style.transform = "none"; }, 350 + i * 38);
    });
    var title = document.querySelector('[data-hero="title"]');
    if (title) title.style.opacity = "1";

    set('[data-hero="subtitle"]', 760);
    set('[data-hero="ctas"]', 920);
    set('[data-hero="media"]', 1040, 18);
    set('[data-hero="proof"]', 1180);
  }

  /* ---------- Vídeo del hero: autoplay con fallback a botón ---------- */
  function initVideo() {
    var frame = document.querySelector("[data-video]");
    if (!frame) return;
    var video = frame.querySelector("video");
    var btn = frame.querySelector(".play-btn");
    function play() {
      if (!video) return;
      var p = video.play();
      if (p && p.then) p.then(function () { frame.classList.add("is-playing"); }).catch(function () {});
    }
    // intento de autoplay silencioso (si hay archivo de vídeo válido)
    if (video && !reduce) {
      video.addEventListener("playing", function () { frame.classList.add("is-playing"); });
      video.addEventListener("loadeddata", function () { if (video.readyState >= 2) play(); });
    }
    if (btn) btn.addEventListener("click", function () {
      if (video) { video.muted = true; play(); }
    });
  }

  /* ---------- Rise-on-scroll: las tarjetas suben al hacer scroll ---------- */
  function initRise() {
    var risers = [].slice.call(document.querySelectorAll("[data-rise]"));
    if (!risers.length) return;
    if (reduce) { risers.forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; }); return; }
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      risers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var start = vh * 0.98, end = vh * 0.55;
        var p = (start - r.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        if (p >= 1) {
          if (!el.classList.contains("risen")) { el.classList.add("risen"); el.style.transform = ""; el.style.opacity = ""; }
          return;
        }
        el.classList.remove("risen");
        var dist = parseFloat(el.dataset.rise) || 70;
        el.style.transform = "translateY(" + ((1 - p) * dist).toFixed(1) + "px)";
        el.style.opacity = (0.12 + 0.88 * p).toFixed(3);
      });
      ticking = false;
    }
    function onRise() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onRise, { passive: true });
    window.addEventListener("resize", onRise);
    update();
  }

  /* ---------- Botones magnéticos ---------- */
  function initMagnetic() {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll(".btn-accent, [data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (mx * 0.22).toFixed(1) + "px," + (my * 0.32).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Glow que sigue al cursor en el hero ---------- */
  function initCursorGlow() {
    if (reduce) return;
    var hero = document.querySelector(".hero");
    var glow = hero && hero.querySelector(".hero__cursor");
    if (!glow) return;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty("--cx", (e.clientX - r.left) + "px");
      glow.style.setProperty("--cy", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- Cluster flotante (Sobre nosotros): pulsar = desplegar info ---------- */
  function initFloating() {
    var cards = document.querySelectorAll("[data-float-target]");
    var panels = [].slice.call(document.querySelectorAll(".float-panel"));
    if (!cards.length) return;
    function close(p) { p.classList.remove("open"); document.body.style.overflow = ""; }
    cards.forEach(function (c) {
      c.addEventListener("click", function () {
        var panel = document.getElementById(c.getAttribute("data-float-target"));
        if (panel) { panel.classList.add("open"); document.body.style.overflow = "hidden"; }
      });
    });
    panels.forEach(function (p) {
      p.querySelectorAll("[data-float-close], .float-panel__bg").forEach(function (el) {
        el.addEventListener("click", function () { close(p); });
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") panels.forEach(close); });
  }

  /* ---------- Spotlight que sigue al cursor en cards ---------- */
  function initSpotlight() {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Contador animado ---------- */
  function runCounter(el) {
    var to = parseFloat(el.dataset.count);
    if (isNaN(to)) return;
    var prefix = el.dataset.prefix || "", suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = prefix + to + suffix; return; }
    var dur = 1100, start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveals (fade-up + blur, con stagger) ---------- */
  function initReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    var counters = document.querySelectorAll("[data-count]");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      counters.forEach(runCounter);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var stagger = parseInt(el.dataset.stagger || "0", 10) * 80;
        setTimeout(function () {
          el.classList.add("is-visible");
          el.querySelectorAll("[data-count]").forEach(runCounter);
          if (el.hasAttribute("data-count")) runCounter(el);
        }, stagger);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { if (!el.closest("[data-reveal]")) cio.observe(el); });
  }

  /* ---------- Línea de proceso animada ---------- */
  function initProcessLine() {
    var fill = document.getElementById("processLine");
    if (!fill) return;
    var wrap = fill.closest(".steps");
    if (reduce || !("IntersectionObserver" in window) || !wrap) { fill.style.width = "100%"; return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { fill.style.width = "100%"; io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(wrap);
  }

  /* ---------- Menú móvil ---------- */
  function initMobile() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Dropdown "Servicios" (click en móvil) ---------- */
  function initDropdown() {
    document.querySelectorAll(".has-dropdown > .dropdown-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        if (window.matchMedia("(max-width: 860px)").matches) {
          e.preventDefault();
          trigger.parentElement.classList.toggle("open");
        }
      });
    });
  }

  function init() {
    var wrap = injectOrbs();
    if (wrap) orbsEls = [].slice.call(wrap.querySelectorAll(".orb"));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    initLenis();
    animateHero();
    initVideo();
    initSpotlight();
    initRise();
    initMagnetic();
    initCursorGlow();
    initFloating();
    initReveals();
    initProcessLine();
    initMobile();
    initDropdown();
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
