# KAELUM · Web pública — contexto para Claude

## Qué es esto
Sitio público (landing one-page) de **KAELUM**: startup de Madrid (2026) de IA y transformación
digital para PYMEs. Fundadores: Jaime y Rodrigo. Repo **`iakaelum/kaelum-web`** → despliega en **`kaelum.io`**.

El **CRM interno está en OTRO repo**: `iakaelum/kaelum-crm` → `crm.kaelum.io`.

## Stack y convenciones
- **HTML + CSS + JS vanilla, sin dependencias de runtime.** No hay build.
- Todo lo público vive en **`web/`**. Si tocas la web, tocas `web/`.
- Sistema de diseño en `web/assets/css/styles.css` (tokens en `:root`). Acento `#6B5CE7`, fondo `#0A0A0F`.
- Tipografías: Inter + JetBrains Mono (Google Fonts).
- Animaciones: motor de partículas en canvas (`web/assets/js/particles.js`) + reveals con IntersectionObserver (`main.js`). La entrada del hero se revela solo con la clase `.js` (si JS falla, el contenido se ve igual).

## Estructura
```
web/        → sitio (lo que despliega Cloudflare Pages, build output dir = web)
docs/       → deploy.md, arquitectura.md, operar.md
tooling/    → dev-server.mjs (preview local)
```

## Operar
- Preview local: `node tooling/dev-server.mjs` → http://localhost:8099
- Deploy: Cloudflare Pages, **build output directory = `web`**, build command vacío. Auto-deploy en cada push a `main`.
- Servicios (6, IA primero): Diagnóstico de IA · Agentes de IA a medida (flagship, con mantenimiento recurrente) · IA en tus Procesos · Auditoría Digital · Presencia Digital · Meta Ads.
- Email: `hola@kaelum.io`. Dominios: `kaelum.io` (principal) + `kaelum.es` (redirección). `.com`/`.ai`/`.app` cogidos.

## Roadmap (ver docs/arquitectura.md)
Nivel 0 web estática (hecho) → Nivel 1 CRM con Supabase (repo crm) → Nivel 2 agentes IA con n8n + API.
