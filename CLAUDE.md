# KAELUM · Web pública — contexto para Claude

## Qué es esto
Sitio público (multipágina) de **KAELUM**: startup de Madrid (2026) de IA y transformación
digital para PYMEs. Fundadores: Jaime y Rodrigo. Repo **`iakaelum/kaelum-web`** → despliega en **`kaelum.es`**.

El **CRM interno está en OTRO repo**: `iakaelum/kaelum-crm` → `crm.kaelum.es`.

## Stack y convenciones
- **HTML + CSS + JS vanilla, sin dependencias de runtime.** No hay build.
- Todo lo público vive en **`web/`**. Si tocas la web, tocas `web/`.
- Sistema de diseño en `web/assets/css/style.css`. Acento azul `#0B84F3` / `#4DA6F7`, fondo `#18191A`.
- Tipografías **self-host** (woff2 en `web/assets/fonts/`): General Sans (titulares) + Geist (texto) + JetBrains Mono (etiquetas). Sin Google Fonts.
- Todas las animaciones viven en `web/assets/js/main.js` (vanilla, sin dependencias): reveals con IntersectionObserver, hilo de progreso SVG al scroll, fake-3D del logo del hero y partículas CSS alrededor de la K. La entrada del hero se revela solo con la clase `.js` (si JS falla, el contenido se ve igual). Todo respeta `prefers-reduced-motion`.

## Estructura
```
web/        → sitio (lo que despliega Cloudflare Pages, build output dir = web)
  index.html                          → Inicio
  servicios/presencia-digital/        → Servicio: Presencia Digital
  servicios/implementacion-ia/        → Servicio: Implementación de IA
  contacto/index.html                 → Contacto (formulario multipaso → POST /api/contact)
  sobre-nosotros/index.html           → Sobre nosotros
  privacidad/index.html               → Política de privacidad
  404.html                            → Página de error
  assets/                             → css/style.css, js/main.js, img/, fonts/, logos/
  _redirects                          → 301 de rutas retiradas: /servicios/ y /blog/ → /, /casos-de-exito/* → /contacto/
functions/  → api/contact.js (Cloudflare Pages Function: proxy del formulario a n8n; oculta N8N_WEBHOOK_URL)
docs/       → deploy.md, arquitectura.md, operar.md
tooling/    → dev-server.mjs (preview local), fix-faq.mjs, port-pages.mjs
```
Nota: las páginas legacy `blog/`, `servicios/index.html` y `casos-de-exito/` se borraron (jul 2026); solo sobreviven como reglas 301 en `_redirects`.

## Operar
- Preview local: `node tooling/dev-server.mjs` → http://localhost:8099
- Deploy: Cloudflare Pages, **build output directory = `web`**, build command vacío. Auto-deploy en cada push a `main`.
- Dos servicios (una página cada uno), y dentro el detalle en acordeón:
  **Presencia Digital** (web optimizada, SEO local, Google Business, reservas, WhatsApp Business, email marketing, Meta/Google Ads) e
  **Implementación de IA** (diagnóstico por ROI, agentes/chatbots, automatizaciones con n8n, procesamiento documental, integraciones).
  Sin precios cerrados en la web: todo arranca con un diagnóstico gratuito.
- Email: `contacto@kaelum.es` (correo de Hostinger). Dominio: `kaelum.es` (comprado en Hostinger), web → `kaelum.es`, CRM → `crm.kaelum.es`.

## Roadmap (ver docs/arquitectura.md)
Nivel 0 web estática (hecho) → Nivel 1 CRM con Supabase (repo crm) → Nivel 2 agentes IA con n8n + API.
