// Porta las páginas internas del handoff a estático, reusando el chrome de la Home.
// node tooling/port-pages.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const src = join(root, "..", "design_handoff_kaelum_redesign");

// --- Chrome constante extraído de la Home ya portada ---
const home = readFileSync(join(web, "index.html"), "utf8");
const bodyOpen = home.slice(home.indexOf("<body>"), home.indexOf("</header>") + "</header>".length) + "\n";
const bodyClose = "\n" + home.slice(home.indexOf("  <!-- FOOTER -->"));

const LINKS = {
  "Inicio.dc.html": "/",
  "Presencia-Digital.dc.html": "/servicios/presencia-digital/",
  "Implementacion-IA.dc.html": "/servicios/implementacion-ia/",
  "Casos-de-exito.dc.html": "/casos-de-exito/",
  "Sobre-nosotros.dc.html": "/sobre-nosotros/",
  "Contacto.dc.html": "/contacto/",
};

function portMain(file) {
  let s = readFileSync(join(src, file), "utf8");
  s = s.slice(s.indexOf("</helmet>") + "</helmet>".length);
  s = s.slice(0, s.indexOf('<script type="text/x-dc"'));
  // MAIN = entre el primer </header> y el <footer
  let main = s.slice(s.indexOf("</header>") + "</header>".length);
  main = main.slice(0, main.indexOf("<footer"));
  // Limpieza de JSX/runtime
  main = main
    .replace(/\s*ref="\{\{[^}]*\}\}"/g, "")
    .replace(/\s*data-screen-label="[^"]*"/g, "")
    .replace(/<\/?sc-if[^>]*>/g, "")
    .replace(/<\/?sc-for[^>]*>/g, "")
    .replace(/onClick="\{\{\s*([\w.]+)\s*\}\}"/g, 'data-action="$1"');
  // Assets
  main = main
    .split("assets/logo-k.png").join("/assets/img/logo-k.png")
    .split("assets/logo-kaelum.webp").join("/assets/img/logo-kaelum.webp")
    .split("assets/logos/").join("/assets/logos/")
    .split("assets/img/").join("/assets/img/")
    .split("uploads/").join("/assets/video/");
  // Links a URLs limpias
  for (const [k, v] of Object.entries(LINKS)) main = main.split(k).join(v);
  return main;
}

function head(m) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m.title}</title>
<meta name="description" content="${m.desc}">
<link rel="canonical" href="https://kaelum.es${m.url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kaelum">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.desc}">
<meta property="og:url" content="https://kaelum.es${m.url}">
<meta property="og:image" content="https://kaelum.es/assets/img/logo-kaelum.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A0810">
<link rel="icon" type="image/png" href="/assets/img/logo-k.png">
<link rel="apple-touch-icon" href="/assets/img/logo-k.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add("js");</script>
<link rel="stylesheet" href="/assets/css/style.css?v=4">
${m.ld || ""}</head>
`;
}

const PAGES = [
  { file: "Presencia-Digital.dc.html", out: "servicios/presencia-digital/index.html", url: "/servicios/presencia-digital/",
    title: "Presencia digital para PYMEs — Web, SEO local y reservas | Kaelum",
    desc: "Rediseño web, Google Business, reservas con Cal.com, WhatsApp Business, SEO local y automatizaciones. Sistema completo de presencia digital para PYMEs de Madrid. Diagnóstico gratuito." },
  { file: "Implementacion-IA.dc.html", out: "servicios/implementacion-ia/index.html", url: "/servicios/implementacion-ia/",
    title: "Implementación de IA para PYMEs — Agentes y n8n | Kaelum",
    desc: "IA aplicada con casos concretos: agentes 24/7, automatizaciones con n8n, procesamiento documental y cualificación de leads. Diagnóstico de IA por ROI para PYMEs de Madrid." },
  { file: "Casos-de-exito.dc.html", out: "casos-de-exito/index.html", url: "/casos-de-exito/",
    title: "Casos de éxito | Kaelum",
    desc: "Casos reales de PYMEs que mejoran su presencia digital y automatizan procesos con Kaelum. Pronto publicaremos nuestros primeros casos de estudio verificables." },
  { file: "Sobre-nosotros.dc.html", out: "sobre-nosotros/index.html", url: "/sobre-nosotros/",
    title: "Sobre nosotros — Jaime y Rodrigo, fundadores de Kaelum",
    desc: "Somos Jaime y Rodrigo. Kaelum nace en 2026 para poner la IA y la presencia digital de las grandes empresas al alcance de las PYMEs de Madrid Oeste. Con honestidad." },
  { file: "Contacto.dc.html", out: "contacto/index.html", url: "/contacto/",
    title: "Contacto — Solicita tu diagnóstico gratuito | Kaelum",
    desc: "Solicita tu diagnóstico gratuito de presencia digital e IA. Escríbenos desde el formulario o a contacto@kaelum.es. Estamos en Madrid." },
];

for (const p of PAGES) {
  const out = join(web, p.out);
  mkdirSync(dirname(out), { recursive: true });
  const main = portMain(p.file);
  const htmlDoc = head(p) + bodyOpen + main + bodyClose;
  writeFileSync(out, htmlDoc, "utf8");
  console.log("✓ " + p.out + "  (" + htmlDoc.length + " bytes)");
}
console.log("\nListo. Revisa FAQ (Implementación IA) y el formulario (Contacto).");
