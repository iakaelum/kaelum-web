# KAELUM — Contexto para agentes de IA (AGENTS.md)

> Documento canónico de contexto. Lo leen ChatGPT/Astra, Codex, Cursor, etc. Claude usa `CLAUDE.md`,
> que apunta aquí. Mantén este archivo al día. Si vas a trabajar en el repo, **léelo entero primero**.

## Qué es KAELUM
Startup de Madrid Oeste (2026). Socios: **Jaime** (línea IA/CRM) y **Rodrigo** (presencia digital).
Implementamos **IA + presencia digital para PYMEs y comercio local**.
Tono de marca: **profesional, cercano, local y SIN hype**. La **transparencia** es el diferenciador
(diagnóstico gratuito real, sin humo, **SIN datos inventados**).

- **2 líneas:** Presencia Digital (web, SEO local, Google Business, reservas Cal.com, WhatsApp
  Business, Meta/Google Ads) · IA (automatizaciones n8n, agentes de IA, procesamiento documental,
  dashboards).
- **Modelo en 3 fases:** diagnóstico gratuito → implementación (2-4 sem) → mantenimiento mensual
  recurrente (mín. 6 meses).
- **Paquetes:** Esencial 1.200€ + 300€/mes · Profesional 1.500€ + 400€/mes (⭐ más vendido) ·
  Premium 2.500€ + 600€/mes (IA personalizada).
- **Cliente objetivo:** clínicas, fisios, academias, inmobiliarias, comercio local (Madrid oeste).

## Marca / diseño
- Paleta (del logo): azul **#4D8DF0** → púrpura **#6B5CE7** → magenta **#C24DE0**. Logo = "K" árbol/red neuronal.
- **REGLA DE ORO:** nada de métricas, clientes, logos o testimonios **inventados**. Números reales
  o ejemplos claramente etiquetados como ejemplo.

## Repos (GitHub, organización: iakaelum)
- **kaelum-web** (público) → web pública → https://kaelum.es
- **kaelum-crm** (privado) → CRM interno → https://crm.kaelum.es
- Ambos: **vanilla HTML/CSS/JS, SIN build**. Deploy = **Cloudflare Pages**, build output directory =
  `web`, sin build command. Cada push a `main` despliega automáticamente.
- **Caché:** los assets no llevan hash → al editar css/js **sube el `?v=N`** en los `<link>`/`<script>`,
  o los cambios no se ven (regla en `web/_headers`).

## Estructura de la web (kaelum-web/web/)
`index.html` · `servicios/` (+`presencia-digital/` +`implementacion-ia/`) · `casos-de-exito/` ·
`sobre-nosotros/` · `contacto/` (formulario multipaso) · `blog/` · `privacidad/` · `404.html`
CSS: `assets/css/style.css` · JS: `assets/js/main.js`, `particles.js` · Fuentes self-host en `assets/fonts/`.
Hay un **widget de chat** (agente IA) que llama a un Cloudflare Worker — no lo rompas.
**Estado actual:** rediseño OSCURO en vivo (hero con logo + partículas, logos de integración, vídeos).

## Reglas de trabajo (IMPORTANTE)
1. `git pull` ANTES de empezar. **NUNCA push directo a `main`**: trabaja en una RAMA y abre un Pull Request.
2. No rompas textos ni enlaces existentes. No inventes datos (ver regla de oro).
3. Al terminar, escribe una entrada en `docs/HANDOFF.md` (fecha · quién · qué hiciste · qué queda · avisos).
4. Deja una **preview de Cloudflare** y pide validación antes de merge a `main`.

## Tarea actual
Rediseñar la web pública para que **NO sea monótona**: **fondo blanco**, **cambiar las viñetas**,
más **profesional y cercana** (de empresa real). Trabaja en la rama `rediseno-claro`, con preview.
