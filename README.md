# KAELUM · Web pública

### 🔗 [Ver web en vivo →](https://kaelum-web.pages.dev/)

Sitio público de **KAELUM** — IA y transformación digital para PYMEs (Madrid, 2026).
Se despliega en **`kaelum.es`** (preview actual: [`kaelum-web.pages.dev`](https://kaelum-web.pages.dev/)).

> El CRM interno vive en un **repo aparte** (`crm`, → `crm.kaelum.es`). Este repo es solo la web pública.

> **Empieza por aquí.** Este README es el panel de control: qué hay, dónde está y cómo se opera.

## 🗂️ Estructura del repositorio

```
web/
├── README.md            ← estás aquí
├── .gitignore
├── web/                 ← SITIO PÚBLICO (esto despliega Cloudflare Pages)
│   ├── index.html       · landing
│   ├── robots.txt · sitemap.xml · _headers
│   └── assets/
│       ├── css/styles.css
│       └── js/particles.js · main.js
├── docs/
│   ├── deploy.md        · desplegar la web + dominio
│   ├── arquitectura.md  · cómo encaja todo (web, CRM, n8n) + roadmap
│   └── operar.md        · día a día (ramas, cambios, acceso)
└── tooling/dev-server.mjs   ← preview local (no se despliega)
```

**Regla de oro:** todo lo público vive en `web/`.

## ▶️ Ver en local

Requiere [Node.js](https://nodejs.org).

```bash
node tooling/dev-server.mjs    # → http://localhost:8099
```
Parar con `Ctrl + C`.

## 🚀 Desplegar

Se publica solo en **Cloudflare Pages** en cada `git push` a `main`. Config (una vez):

| Ajuste | Valor |
|---|---|
| Framework preset | None |
| Build command | *(vacío)* |
| **Build output directory** | `web` |

Guía completa (+ dominio `kaelum.es`) en [`docs/deploy.md`](docs/deploy.md).

## 🧭 A dónde ir según lo que quieras hacer

| Quiero… | Mira… |
|---|---|
| Cambiar textos/precios | `web/index.html` |
| Cambiar colores/estilos | `web/assets/css/styles.css` |
| Tocar las animaciones | `web/assets/js/main.js` · `particles.js` |
| Entender la arquitectura y el plan | `docs/arquitectura.md` |
| Publicar / conectar el dominio | `docs/deploy.md` |
| Tocar el CRM | repo aparte: `crm` |

## 📌 Datos clave

- **Dominio:** `kaelum.es` (comprado en Hostinger). Web → `kaelum.es`, CRM → `crm.kaelum.es`.
- **CRM:** repo `crm` → `crm.kaelum.es`.
- **Email:** `contacto@kaelum.es`
- **Stack:** HTML + CSS + JS, sin dependencias (deploy estático).
