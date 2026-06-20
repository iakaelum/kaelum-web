/* ============================================================
   KAELUM — Interacciones. Sin dependencias.
   Hero orquestado · reveals (fade-up+blur, stagger) ·
   contadores · línea de proceso · header glass · menú móvil ·
   dropdown. Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: estado glass al hacer scroll ---------- */
  var header = document.getElementById("site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Entrada orquestada del hero ---------- */
  function animateHero() {
    var heroEls = document.querySelectorAll("[data-hero]");
    if (!heroEls.length) return;
    if (reduce) {
      heroEls.forEach(function (el) { el.style.opacity = "1"; });
      if (window.KAELUM_startParticles) window.KAELUM_startParticles();
      return;
    }
    var set = function (sel, delay, fromY) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.style.transform = "translateY(" + (fromY || 12) + "px)";
      el.style.transition = "opacity .7s ease, transform .7s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(function () { el.style.opacity = "1"; el.style.transform = "none"; }, delay);
    };
    set('[data-hero="badge"]', 200, 8);

    // Titular: palabra a palabra, stagger 40ms desde 400ms
    var words = document.querySelectorAll('.hero__title .word');
    words.forEach(function (wd, i) {
      wd.style.opacity = "0";
      wd.style.transform = "translateY(24px)";
      wd.style.transition = "opacity .6s ease, transform .7s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(function () { wd.style.opacity = "1"; wd.style.transform = "none"; }, 400 + i * 40);
    });
    var title = document.querySelector('[data-hero="title"]');
    if (title) title.style.opacity = "1";

    set('[data-hero="subtitle"]', 820);
    set('[data-hero="ctas"]', 1000);
    set('[data-hero="proof"]', 1120);

    setTimeout(function () { if (window.KAELUM_startParticles) window.KAELUM_startParticles(); }, 1200);
  }

  /* ---------- Contador animado ---------- */
  function runCounter(el) {
    var to = parseFloat(el.dataset.count);
    if (isNaN(to)) return;
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
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

    // Contadores que no estén dentro de un [data-reveal]
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

  /* ---------- Video showcase: autoplay al entrar en viewport (35%) ---------- */
  function initVideoShowcase() {
    var videos = document.querySelectorAll(".video-showcase__video");
    if (!videos.length || reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(function (err) { console.log("Video autoplay prevented:", err); });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35, rootMargin: "0px" });
    videos.forEach(function (video) { io.observe(video); });
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
    animateHero();
    initReveals();
    initProcessLine();
    initVideoShowcase();
    initMobile();
    initDropdown();
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
