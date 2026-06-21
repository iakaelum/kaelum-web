/* ============================================================
   KAELUM — Interacciones (rediseño 2026). Vanilla, sin dependencias.
   Recrea el runtime del prototipo: hilo de progreso SVG, style-hover,
   parallax, reveals, contadores, autovídeo en viewport, nav-on-scroll,
   dropdown, menú móvil, glow del hero, chat (demo) y formulario.
   Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var on = function (el, ev, fn, o) { el && el.addEventListener(ev, fn, o); };

  /* ---------- style-hover: aplica estilos al pasar el cursor ---------- */
  function initHover() {
    document.querySelectorAll("[style-hover]").forEach(function (el) {
      var hov = el.getAttribute("style-hover");
      var base = el.getAttribute("style") || "";
      on(el, "pointerenter", function () { el.style.cssText = base + ";" + hov; });
      on(el, "pointerleave", function () { el.style.cssText = base; });
    });
  }

  /* ---------- Parallax suave ---------- */
  function initParallax() {
    var items = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length || reduce) return;
    var ticking = false;
    function update() {
      var y = window.scrollY || 0;
      items.forEach(function (el) {
        var f = parseFloat(el.getAttribute("data-parallax")) || 0;
        el.style.transform = (el.dataset.baseTransform || "") + " translateY(" + (y * f).toFixed(1) + "px)";
      });
      ticking = false;
    }
    items.forEach(function (el) {
      var t = el.style.transform || "";
      el.dataset.baseTransform = t;
    });
    on(window, "scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Contador animado ---------- */
  function runCounter(el) {
    if (el.dataset.counted) return;
    var to = parseFloat(el.getAttribute("data-count"));
    if (isNaN(to)) return;
    el.dataset.counted = "1";
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + to + suffix; return; }
    var dur = 1300, start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Reveals + contadores ---------- */
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
        el.classList.add("is-visible");
        el.querySelectorAll("[data-count]").forEach(runCounter);
        if (el.hasAttribute("data-count")) runCounter(el);
        io.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -7% 0px" });
    items.forEach(function (el) { io.observe(el); });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { if (!el.closest("[data-reveal]")) cio.observe(el); });
  }

  /* ---------- Autovídeo: play/pause según viewport ---------- */
  function initAutoVideo() {
    var vids = document.querySelectorAll("[data-autovideo]");
    if (!vids.length) return;
    if (reduce || !("IntersectionObserver" in window)) return; // muestran póster
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- Nav: oscurece el fondo al hacer scroll ---------- */
  function initNav() {
    var nav = document.getElementById("site-nav");
    if (!nav) return;
    var base = nav.style.background;
    function upd() {
      if ((window.scrollY || 0) > 40) {
        nav.style.background = "rgba(10,8,16,0.82)";
        nav.style.borderBottomColor = "rgba(255,255,255,0.10)";
      } else {
        nav.style.background = base || "rgba(10,8,16,0.35)";
        nav.style.borderBottomColor = "rgba(255,255,255,0.06)";
      }
    }
    on(window, "scroll", upd, { passive: true });
    upd();
  }

  /* ---------- Dropdown "Servicios" ---------- */
  function initDropdown() {
    var trigger = document.querySelector('[data-action="toggle-servicios"]');
    var panel = document.querySelector("[data-dd-panel]");
    if (!trigger || !panel) return;
    on(trigger, "click", function (e) { e.stopPropagation(); panel.classList.toggle("open"); });
    on(document, "click", function (e) { if (!panel.contains(e.target) && e.target !== trigger) panel.classList.remove("open"); });
  }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    var menu = document.querySelector(".kael-mobilemenu");
    if (!menu) return;
    function close() { menu.classList.remove("open"); document.body.style.overflow = ""; }
    document.querySelectorAll('[data-action="toggle-menu"]').forEach(function (b) {
      on(b, "click", function () { var o = menu.classList.toggle("open"); document.body.style.overflow = o ? "hidden" : ""; });
    });
    menu.querySelectorAll('a, [data-action="close-menu"]').forEach(function (el) { on(el, "click", close); });
    on(document, "keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Glow del hero que sigue al cursor ---------- */
  function initHeroGlow() {
    if (reduce) return;
    var glow = document.getElementById("hero-glow");
    var hero = document.getElementById("top");
    if (!glow || !hero) return;
    on(hero, "pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + "px";
      glow.style.top = (e.clientY - r.top) + "px";
      glow.style.opacity = "1";
    });
    on(hero, "pointerleave", function () { glow.style.opacity = "0"; });
  }

  /* ---------- Hilo de progreso de scroll (firma visual, estilo "circuito") ----------
     Réplica fiel del prototipo: segmentos V (vertical) + H (horizontal) = ángulos
     rectos, nodos en cada esquina, suavizado independiente del framerate. */
  function initThread() {
    var svg = document.querySelector(".mzu-line");
    var path = svg && svg.querySelector(".mzu-prog");
    if (!path) return;
    var track = svg.querySelector(".mzu-track");
    var comet = svg.querySelector(".mzu-comet");
    var nodesG = svg.querySelector(".mzu-nodes");
    if (svg) svg.style.opacity = "0";
    var L = 0, nodeEls = [], prog = null, target = 0, last = 0, looping = false;

    function build() {
      var H = window.innerHeight, W = window.innerWidth;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("preserveAspectRatio", "none");
      var cx = W < 760 ? W * 0.12 : W * 0.5;
      var amp = W < 760 ? W * 0.06 : W * 0.10;
      var pat = [0.6, -0.7, 0.45, -0.55, 0.6, -0.5];
      var d = "M " + cx.toFixed(1) + " 0", corners = [];
      for (var i = 0; i < pat.length; i++) {
        var y = H * (i + 1) / (pat.length + 1), nx = cx + amp * pat[i];
        d += " V " + y.toFixed(1) + " H " + nx.toFixed(1);
        corners.push([nx, y]);
      }
      d += " V " + H.toFixed(1);
      path.setAttribute("d", d); if (track) track.setAttribute("d", d);
      L = path.getTotalLength(); path.style.strokeDasharray = L;
      if (nodesG) {
        nodesG.innerHTML = "";
        nodeEls = corners.map(function (c) {
          var el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          el.setAttribute("cx", c[0].toFixed(1)); el.setAttribute("cy", c[1].toFixed(1)); el.setAttribute("r", "3.6");
          el.setAttribute("fill", "#4B4866"); el.style.transition = "fill .3s,opacity .3s,filter .3s"; el.style.opacity = "0.5";
          nodesG.appendChild(el); return { el: el, y: c[1] };
        });
      }
      if (reduce) {
        path.style.strokeDashoffset = 0; if (comet) comet.style.opacity = "0";
        nodeEls.forEach(function (n) { n.el.setAttribute("fill", "#7CC2FF"); n.el.style.opacity = "1"; });
      } else { path.style.strokeDashoffset = L; update(); }
    }
    function update() {
      if (svg) svg.style.opacity = Math.max(0, Math.min(0.55, ((window.scrollY || 0) - 240) / 360)).toFixed(2);
      if (reduce || !L) return;
      var max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      target = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
      if (prog == null) prog = target;
      if (!looping) { looping = true; requestAnimationFrame(tick); }
    }
    function tick() {
      var now = performance.now(), dt = last ? Math.min(48, now - last) : 16; last = now;
      var k = 1 - Math.pow(0.0022, dt / 1000);
      prog += (target - prog) * k;
      if (Math.abs(target - prog) < 0.0003) { prog = target; looping = false; last = 0; }
      var H = window.innerHeight;
      path.style.strokeDashoffset = (L * (1 - prog)).toFixed(1);
      try {
        var pt = path.getPointAtLength(L * prog);
        if (comet) { comet.setAttribute("cx", pt.x.toFixed(1)); comet.setAttribute("cy", pt.y.toFixed(1)); comet.style.opacity = (prog > 0.002 && prog < 0.999) ? "1" : "0"; }
      } catch (e) {}
      nodeEls.forEach(function (n) {
        var lit = prog >= (n.y / H) - 0.012;
        n.el.setAttribute("fill", lit ? "#7CC2FF" : "#4B4866");
        n.el.style.opacity = lit ? "1" : "0.5";
        n.el.style.filter = lit ? "drop-shadow(0 0 6px rgba(124,194,255,0.9))" : "none";
      });
      if (looping) requestAnimationFrame(tick);
    }
    build();
    on(window, "scroll", update, { passive: true });
    var rt; on(window, "resize", function () { clearTimeout(rt); rt = setTimeout(build, 180); });
  }

  /* ---------- Fondo neural del hero (canvas) — recrea el vídeo neural ---------- */
  function initNeural() {
    var canvas = document.getElementById("neural-canvas");
    var hero = document.getElementById("top");
    if (!canvas || !hero) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], DIST = 150, raf = null, visible = true;
    var pal = ["139,92,246", "99,102,241", "59,130,246", "34,211,238"];
    function seed() {
      var count = Math.round(Math.min(120, Math.max(46, W * H / 13000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.7 + 0.6, hub: Math.random() < 0.09,
          c: pal[(Math.random() * pal.length) | 0]
        });
      }
    }
    function resize() {
      var r = hero.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      DIST = Math.min(170, Math.max(110, W / 11));
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var D2 = DIST * DIST, i, j, a, b, dx, dy, d2;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (!reduce && visible) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < -20) a.x = W + 20; else if (a.x > W + 20) a.x = -20;
          if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
        }
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 < D2) {
            var al = (1 - Math.sqrt(d2) / DIST) * 0.20;
            ctx.strokeStyle = "rgba(150,120,250," + al.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (a.hub) {
          var g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 9);
          g.addColorStop(0, "rgba(" + a.c + ",0.55)"); g.addColorStop(1, "rgba(" + a.c + ",0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a.x, a.y, 9, 0, 6.2832); ctx.fill();
        }
        ctx.fillStyle = "rgba(" + a.c + "," + (a.hub ? 0.95 : 0.7) + ")";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
    }
    function loop() { draw(); raf = requestAnimationFrame(loop); }
    resize();
    on(window, "resize", function () { clearTimeout(canvas._rt); canvas._rt = setTimeout(resize, 200); });
    if (reduce) return; // un solo frame
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !raf) loop(); else if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
      }, { threshold: 0 }).observe(hero);
    } else loop();
  }

  /* ---------- Chat "Agente KAELUM" (demo, respuestas guionizadas) ---------- */
  function initChat() {
    var panel = document.querySelector(".kael-chatpanel");
    var scroll = document.getElementById("kael-chat-scroll");
    if (!panel || !scroll) return;
    var quickWrap = document.getElementById("kael-chat-quick");
    var form = document.getElementById("kael-chat-form");
    var input = document.getElementById("kael-chat-input");
    var typing = false;

    function bubble(text, who) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;justify-content:" + (who === "user" ? "flex-end" : "flex-start") + ";";
      var b = document.createElement("div");
      b.textContent = text;
      b.style.cssText = who === "user"
        ? "max-width:80%;padding:10px 14px;border-radius:15px 15px 4px 15px;background:linear-gradient(135deg,#8B5CF6,#3B82F6);color:#fff;font-size:14px;line-height:1.5;"
        : "max-width:84%;padding:10px 14px;border-radius:15px 15px 15px 4px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#EDECF2;font-size:14px;line-height:1.5;";
      row.appendChild(b); scroll.appendChild(row); scroll.scrollTop = scroll.scrollHeight;
    }
    function showTyping() {
      typing = true;
      var row = document.createElement("div");
      row.id = "kael-typing";
      row.style.cssText = "display:flex;justify-content:flex-start;";
      row.innerHTML = '<div style="display:flex;gap:4px;padding:12px 14px;border-radius:14px 14px 14px 4px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);"><span style="width:6px;height:6px;border-radius:9999px;background:#A9A6C0;animation:kael-blink 1.2s infinite;"></span><span style="width:6px;height:6px;border-radius:9999px;background:#A9A6C0;animation:kael-blink 1.2s infinite .2s;"></span><span style="width:6px;height:6px;border-radius:9999px;background:#A9A6C0;animation:kael-blink 1.2s infinite .4s;"></span></div>';
      scroll.appendChild(row); scroll.scrollTop = scroll.scrollHeight;
    }
    function hideTyping() { typing = false; var t = document.getElementById("kael-typing"); if (t) t.remove(); }
    function reply(text) {
      var t = text.toLowerCase(), r;
      if (/diagn|gratis|gratu|auditor/.test(t)) r = "Genial. Cuéntanos tu negocio en la página de Contacto y te preparamos un diagnóstico gratuito, sin compromiso.";
      else if (/servici|presencia|web|ia|agente|automatiz/.test(t)) r = "Trabajamos dos líneas: Presencia Digital (web, SEO, reservas) e Implementación de IA (agentes, n8n). ¿Cuál encaja mejor contigo?";
      else if (/person|human|hablar|llam|tel/.test(t)) r = "Claro. Escríbenos a contacto@kaelum.es y te responde un humano en menos de 24 h.";
      else if (/precio|cuest|cuánto|cuanto|tarifa/.test(t)) r = "Depende del alcance, pero empezamos siempre por un diagnóstico gratuito. Con él te damos un presupuesto cerrado, sin sorpresas.";
      else r = "Buena pregunta. Lo más útil es un diagnóstico gratuito: cuéntanoslo en Contacto y te orientamos con honestidad.";
      if (quickWrap) quickWrap.style.display = "none";
      showTyping();
      setTimeout(function () { hideTyping(); bubble(r, "bot"); }, 900 + Math.random() * 500);
    }
    function pushUser(text) { if (!text || !text.trim()) return; bubble(text.trim(), "user"); reply(text); }

    // mensaje inicial
    bubble("¡Hola! Soy el agente de KAELUM 👋 ¿En qué te ayudo? (Demo · IA real próximamente)", "bot");

    document.querySelectorAll('[data-action="toggle-chat"]').forEach(function (b) {
      on(b, "click", function () {
        var o = panel.classList.toggle("open");
        b.setAttribute("aria-expanded", String(o));
        if (o && input) setTimeout(function () { input.focus(); }, 60);
      });
    });
    document.querySelectorAll('[data-action="close-chat"]').forEach(function (b) {
      on(b, "click", function () { panel.classList.remove("open"); });
    });
    if (quickWrap) quickWrap.querySelectorAll("button").forEach(function (q) {
      on(q, "click", function () { pushUser(q.textContent); });
    });
    on(form, "submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; pushUser(v); });
  }

  /* ---------- Formulario de Contacto (validación + Formspree AJAX) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var msgs = {
      nombre: "Dinos cómo te llamas.",
      email_empty: "Necesitamos un email para enviarte el informe.",
      email_bad: "Ese email no parece válido.",
      telefono: "Déjanos un teléfono para poder contactarte.",
      negocio: "¿Cómo se llama tu negocio?",
      rgpd: "Marca la casilla para que podamos contactarte."
    };
    function setError(field, text) {
      var wrap = form.querySelector('[data-field="' + field + '"]');
      if (!wrap) return null;
      var err = wrap.querySelector(".kael-err");
      if (!err) { err = document.createElement("p"); err.className = "kael-err"; err.style.cssText = "margin:6px 0 0;font-size:13px;color:#FCA5A5;"; wrap.appendChild(err); }
      err.textContent = text || "";
      err.style.display = text ? "block" : "none";
      var input = wrap.querySelector("input,select,textarea");
      if (input) input.style.borderColor = text ? "#FCA5A5" : "";
      return text ? (wrap.querySelector("input,select,textarea")) : null;
    }
    function validate() {
      var first = null, el;
      var get = function (n) { var x = form.elements[n]; return x ? (x.value || "").trim() : ""; };
      el = setError("nombre", get("nombre") ? "" : msgs.nombre); first = first || el;
      var email = get("email");
      el = setError("email", !email ? msgs.email_empty : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? msgs.email_bad : "")); first = first || el;
      el = setError("telefono", get("telefono") ? "" : msgs.telefono); first = first || el;
      el = setError("negocio", get("negocio") ? "" : msgs.negocio); first = first || el;
      var rgpd = form.elements["rgpd"];
      el = setError("rgpd", rgpd && rgpd.checked ? "" : msgs.rgpd); first = first || el;
      return first;
    }
    var btn = form.querySelector('[type="submit"]');
    on(form, "submit", function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); return; }
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) {
            form.innerHTML = '<div style="text-align:center;padding:20px 6px;">' +
              '<div style="width:60px;height:60px;margin:0 auto 18px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#8B5CF6,#22D3EE);"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-11"/></svg></div>' +
              '<h3 style="margin:0 0 8px;font-family:\'General Sans\',sans-serif;font-weight:600;font-size:24px;color:#F5F4F8;">¡Recibido!</h3>' +
              '<p style="margin:0;color:#B9B6C8;font-size:16px;line-height:1.6;">Te respondemos en menos de 24 h con los siguientes pasos. Mientras, <a href="/servicios/presencia-digital/" style="color:#A78BFA;">mira nuestros servicios</a>.</p></div>';
          } else { netError(); }
        })
        .catch(netError);
      function netError() {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        var note = form.querySelector(".kael-formnote") || (function () { var n = document.createElement("p"); n.className = "kael-formnote"; n.style.cssText = "margin:14px 0 0;font-size:14px;color:#FCA5A5;"; form.appendChild(n); return n; })();
        note.textContent = "No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos a contacto@kaelum.es.";
      }
    });
  }

  function init() {
    initHover();
    initParallax();
    initReveals();
    initAutoVideo();
    initNav();
    initDropdown();
    initMenu();
    initHeroGlow();
    initThread();
    initNeural();
    initChat();
    initContactForm();
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
