/* ============================================================
   KAELUM — Interacciones (rediseño 2026). Vanilla, sin dependencias.
   Recrea el runtime del prototipo: hilo de progreso SVG, style-hover,
   parallax, reveals, contadores, autovídeo en viewport, nav-on-scroll,
   dropdown, menú móvil, glow del hero, chat (demo) y formulario.
   Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  // Endpoint del agente IA (Cloudflare Worker proxy → OpenRouter).
  var CHAT_API = "https://kaelum-chat.iakaelum.workers.dev/";

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
    // style-focus: estilos al enfocar (inputs del formulario)
    document.querySelectorAll("[style-focus]").forEach(function (el) {
      var foc = el.getAttribute("style-focus");
      var base = el.getAttribute("style") || "";
      on(el, "focus", function () { el.style.cssText = base + ";" + foc; });
      on(el, "blur", function () { el.style.cssText = base; });
    });
  }

  /* ---------- Spotlight que sigue al cursor en cards (data-cardhover) ---------- */
  function initCardHover() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll("[data-cardhover]").forEach(function (card) {
      on(card, "pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
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

  /* ---------- Vídeo neural del hero: autoplay + parallax suave ---------- */
  function initHeroVideo() {
    var v = document.getElementById("hero-video");
    if (!v) return;
    if (reduce) { v.style.display = "none"; return; }
    v.muted = true; v.playsInline = true;
    var start = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (v.readyState >= 2) start(); else v.addEventListener("loadeddata", start, { once: true });
    var ticking = false;
    on(window, "scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; v.style.transform = "translateY(" + ((window.scrollY || 0) * 0.18).toFixed(1) + "px)"; });
    }, { passive: true });
  }

  /* ---------- Hilo de progreso de scroll (firma visual, estilo "circuito") ----------
     Réplica fiel del prototipo: segmentos V (vertical) + H (horizontal) = ángulos
     rectos, nodos en cada esquina, suavizado independiente del framerate. */
  function initThread() {
    var svg = document.querySelector(".mzu-line");
    // En páginas donde el hilo está oculto (p. ej. /contacto/, con display:none),
    // medir la geometría del SVG (getTotalLength) puede lanzar en algunos navegadores.
    // No aporta nada ahí, así que lo saltamos.
    if (svg && getComputedStyle(svg).display === "none") return;
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

  /* ---------- Chat "Agente KAELUM" (demo, respuestas guionizadas) ---------- */
  // Markup del widget: ÚNICO punto de definición. Se inyecta en <body> al cargar
  // (en todas las páginas que cargan main.js, salvo las que tengan data-no-chat,
  // p. ej. la 404). Para cambiar el widget, edita solo este template + los estilos
  // .kael-chat-* en style.css. Nunca vuelvas a copiarlo en el HTML de las páginas.
  var CHAT_WIDGET_HTML =
    '<div class="kael-chat-root">' +
      '<div class="kael-chatpanel">' +
        '<div class="kael-chat-header">' +
          '<span class="kael-chat-avatar"><img src="/assets/img/logo-k.png" alt="" width="26" height="26" /></span>' +
          '<div class="kael-chat-headtext">' +
            '<div class="kael-chat-title">Agente KAELUM</div>' +
            '<div class="kael-chat-status"><span class="kael-chat-status-dot"></span> En línea</div>' +
          '</div>' +
          '<button data-action="close-chat" aria-label="Cerrar chat" class="kael-chat-close">×</button>' +
        '</div>' +
        '<div id="kael-chat-scroll" class="kael-chat-scroll"></div>' +
        '<div id="kael-chat-quick" class="kael-chat-quick">' +
          '<button class="kael-chat-quickbtn">Quiero un diagnóstico gratuito</button>' +
          '<button class="kael-chat-quickbtn">¿Qué servicios ofrecéis?</button>' +
          '<button class="kael-chat-quickbtn">Hablar con una persona</button>' +
        '</div>' +
        '<form id="kael-chat-form" class="kael-chat-form">' +
          '<input id="kael-chat-input" class="kael-chat-input" type="text" placeholder="Escribe tu mensaje…" autocomplete="off" />' +
          '<button type="submit" aria-label="Enviar" class="kael-chat-send"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 11 L21 3 L13 21 L11 13 Z" fill="#fff"/></svg></button>' +
        '</form>' +
      '</div>' +
      '<button data-action="toggle-chat" aria-label="Abrir chat" aria-expanded="false" class="kael-chat-fab">' +
        '<span class="kael-chat-fab-ping"></span>' +
        '<img src="/assets/img/logo-k.png" alt="" width="38" height="38" class="kael-chat-fab-logo" />' +
      '</button>' +
    '</div>';

  function injectChatWidget() {
    if (document.body.hasAttribute("data-no-chat")) return;  // páginas que lo excluyen (404)
    if (document.querySelector(".kael-chatpanel")) return;    // evita doble inyección
    var wrap = document.createElement("div");
    wrap.innerHTML = CHAT_WIDGET_HTML;
    document.body.appendChild(wrap.firstElementChild);
  }

  // Escapa <, >, & ANTES de cualquier conversión: así el texto del agente
  // nunca puede inyectar HTML arbitrario en el chat.
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Convierte el Markdown que devuelve el agente a HTML (negrita, cursiva,
  // listas, enlaces y saltos de línea/párrafo). Se aplica SOLO a los mensajes
  // del agente (el texto del usuario va siempre como textContent).
  function renderMarkdown(text) {
    var s = escapeHtml(text).replace(/\r\n/g, "\n");

    // Inline: enlaces [texto](url), negrita **t**, cursiva *t*
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

    // Bloques: listas (-/*, y 1.) y párrafos separados por línea en blanco.
    var lines = s.split("\n"), html = "", run = [], i = 0;
    function flush() { if (run.length) { html += "<p>" + run.join("<br>") + "</p>"; run = []; } }
    while (i < lines.length) {
      var ln = lines[i];
      if (/^\s*[-*]\s+/.test(ln)) {
        flush();
        var ul = "";
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { ul += "<li>" + lines[i].replace(/^\s*[-*]\s+/, "").trim() + "</li>"; i++; }
        html += "<ul>" + ul + "</ul>";
      } else if (/^\s*\d+\.\s+/.test(ln)) {
        flush();
        var ol = "";
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol += "<li>" + lines[i].replace(/^\s*\d+\.\s+/, "").trim() + "</li>"; i++; }
        html += "<ol>" + ol + "</ol>";
      } else if (ln.trim() === "") {
        flush(); i++;            // línea en blanco → separación de párrafo
      } else {
        run.push(ln); i++;       // salto simple → <br> dentro del párrafo
      }
    }
    flush();
    return html;
  }

  function initChat() {
    injectChatWidget();
    var panel = document.querySelector(".kael-chatpanel");
    var scroll = document.getElementById("kael-chat-scroll");
    if (!panel || !scroll) return;
    var quickWrap = document.getElementById("kael-chat-quick");
    var form = document.getElementById("kael-chat-form");
    var input = document.getElementById("kael-chat-input");
    var typing = false;

    function bubble(text, who) {
      var isUser = who === "user";
      var row = document.createElement("div");
      row.className = "kael-chat-row kael-chat-row--" + (isUser ? "user" : "bot");
      var b = document.createElement("div");
      b.className = "kael-chat-msg kael-chat-msg--" + (isUser ? "user" : "bot");
      if (isUser) b.textContent = text;             // usuario: texto plano (seguridad)
      else b.innerHTML = renderMarkdown(text);       // agente: Markdown → HTML escapado
      row.appendChild(b); scroll.appendChild(row); scroll.scrollTop = scroll.scrollHeight;
    }
    function showTyping() {
      typing = true;
      var row = document.createElement("div");
      row.id = "kael-typing";
      row.className = "kael-chat-row kael-chat-row--bot";
      row.innerHTML = '<div class="kael-chat-typing"><span></span><span></span><span></span></div>';
      scroll.appendChild(row); scroll.scrollTop = scroll.scrollHeight;
    }
    function hideTyping() { typing = false; var t = document.getElementById("kael-typing"); if (t) t.remove(); }

    // Historial de la conversación que se envía al Worker en cada turno.
    var history = [];   // [{ role: "user" | "assistant", content: "..." }]
    var sending = false;

    function send(text) {
      text = (text || "").trim();
      if (!text || sending) return;
      sending = true;
      if (quickWrap) quickWrap.style.display = "none";
      bubble(text, "user");
      history.push({ role: "user", content: text });
      showTyping();
      fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          hideTyping();
          if (data && data.reply) {
            bubble(data.reply, "bot");
            history.push({ role: "assistant", content: data.reply });
          } else {
            bubble((data && data.error) || "Disculpa, no he podido responder. Inténtalo de nuevo en unos segundos.", "bot");
          }
        })
        .catch(function () {
          hideTyping();
          bubble("Disculpa, hay un problema de conexión. Inténtalo de nuevo en unos segundos.", "bot");
        })
        .then(function () { sending = false; });
    }

    // mensaje inicial (solo UI; no entra en el historial enviado al modelo)
    bubble("¡Hola! Soy el agente de KAELUM 👋 ¿En qué te ayudo?", "bot");

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
      on(q, "click", function () { send(q.textContent); });
    });
    on(form, "submit", function (e) { e.preventDefault(); var v = input.value; input.value = ""; send(v); });
  }

  /* ---------- Formulario de Contacto (validación + proxy /api/contact → n8n) ---------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var msgs = {
      nombre: "Dinos cómo te llamas.",
      email_empty: "Necesitamos un email para enviarte el informe.",
      email_bad: "Ese email no parece válido.",
      negocio: "¿Cómo se llama tu negocio?",
      mensaje: "Cuéntanos brevemente qué necesitas.",
      rgpd: "Marca la casilla para que podamos contactarte."
    };
    function get(n) { var x = form.elements[n]; return x ? (x.value || "").trim() : ""; }
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
      el = setError("nombre", get("nombre") ? "" : msgs.nombre); first = first || el;
      var email = get("email");
      el = setError("email", !email ? msgs.email_empty : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? msgs.email_bad : "")); first = first || el;
      el = setError("negocio", get("negocio") ? "" : msgs.negocio); first = first || el;
      el = setError("mensaje", get("mensaje") ? "" : msgs.mensaje); first = first || el;
      var rgpd = form.elements["rgpd"];
      el = setError("rgpd", rgpd && rgpd.checked ? "" : msgs.rgpd); first = first || el;
      return first;
    }
    function note(text, ok) {
      var n = form.querySelector(".kael-formnote");
      if (!n) { n = document.createElement("p"); n.className = "kael-formnote"; form.appendChild(n); }
      n.style.cssText = "margin:14px 0 0;font-size:14.5px;line-height:1.55;" + (ok ? "color:#A7F3D0;" : "color:#FCA5A5;");
      n.textContent = text;
    }
    var btn = form.querySelector('[type="submit"]');
    on(form, "submit", function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); return; }
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
      var rgpdEl = form.elements["rgpd"];
      var payload = {
        nombre: get("nombre"),
        apellidos: get("apellidos"),
        email: get("email"),
        telefono: get("telefono"),
        mensaje: get("mensaje"),
        negocio: get("negocio"),
        sector: get("sector"),
        interes: get("interes"),
        web: get("web"),
        rgpd: !!(rgpdEl && rgpdEl.checked),
        empresa: get("empresa") // honeypot: el servidor lo evalúa y NO lo reenvía a n8n
      };
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return null; }).then(function (d) {
            return { ok: r.ok && d && d.ok === true, data: d };
          });
        })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            ["nombre", "email", "negocio", "mensaje", "rgpd"].forEach(function (f) { setError(f, ""); });
            if (btn) { btn.disabled = false; btn.textContent = label; }
            note("Mensaje enviado, te responderemos pronto.", true);
          } else {
            netError(res.data && res.data.error);
          }
        })
        .catch(function () { netError(); });
      function netError(serverMsg) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        note(serverMsg || "No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos a contacto@kaelum.es.", false);
      }
    });
  }

  function init() {
    // Cada widget corre aislado: si uno falla (p. ej. initThread sobre un SVG oculto
    // en algún navegador), no impide que se conecten los demás —incluido el
    // formulario de contacto y su envío—.
    [initHover, initCardHover, initParallax, initReveals, initAutoVideo,
     initNav, initDropdown, initMenu, initHeroGlow, initHeroVideo,
     initThread, initChat, initContactForm].forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console && console.error) console.error("init: " + fn.name, e); }
    });
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
