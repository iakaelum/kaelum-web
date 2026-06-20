// Aplica el "shell" compartido del rediseño v2 a las páginas internas:
// favicon real + theme-color, logo de marca en header/footer, og:image y ?v=2.
// Uso: node tooling/apply-shell-v2.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const files = [
  "servicios/index.html",
  "servicios/presencia-digital/index.html",
  "servicios/implementacion-ia/index.html",
  "casos-de-exito/index.html",
  "sobre-nosotros/index.html",
  "contacto/index.html",
  "blog/index.html",
  "404.html",
];

const replacements = [
  // Favicon real + theme-color
  [
    `  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">`,
    `  <meta name="theme-color" content="#0A0A0F">
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg?v=2">
  <link rel="icon" type="image/webp" sizes="192x192" href="/assets/img/logo-mark.webp">
  <link rel="apple-touch-icon" href="/assets/img/logo-mark.webp">`,
  ],
  // og:image -> logo real
  [
    `  <meta property="og:image" content="https://kaelum.es/assets/img/og-cover.svg">`,
    `  <meta property="og:image" content="https://kaelum.es/assets/img/logo-mark.webp">`,
  ],
  // CSS cache-bust
  [
    `  <link rel="stylesheet" href="/assets/css/style.css">`,
    `  <link rel="stylesheet" href="/assets/css/style.css?v=2">`,
  ],
  // Header brand: mark + wordmark
  [
    `      <a href="/" class="brand" aria-label="Kaelum — inicio">
        <img src="/assets/img/logo.svg" alt="Kaelum" class="brand-logo" width="200" height="40">
      </a>`,
    `      <a href="/" class="brand" aria-label="Kaelum — inicio">
        <img src="/assets/img/logo-mark.webp?v=2" alt="" class="brand-mark" width="38" height="38" aria-hidden="true">
        <span class="brand-word">KAELUM</span>
      </a>`,
  ],
  // Footer brand img -> mark + wordmark
  [
    `          <img src="/assets/img/logo.svg" alt="Kaelum" class="brand-logo" width="200" height="40">`,
    `          <a href="/" class="brand" aria-label="Kaelum — inicio">
            <img src="/assets/img/logo-mark.webp?v=2" alt="" class="brand-mark" width="38" height="38" aria-hidden="true">
            <span class="brand-word">KAELUM</span>
          </a>`,
  ],
  // JS cache-bust
  [
    `  <script src="/assets/js/main.js" defer></script>`,
    `  <script src="/assets/js/main.js?v=2" defer></script>`,
  ],
];

let totalOk = 0;
for (const rel of files) {
  const path = join(root, rel);
  let html = readFileSync(path, "utf8");
  const missing = [];
  for (const [from, to] of replacements) {
    if (!html.includes(from)) { missing.push(from.trim().slice(0, 48)); continue; }
    html = html.split(from).join(to);
  }
  writeFileSync(path, html, "utf8");
  totalOk++;
  console.log(`✓ ${rel}${missing.length ? "  (no encontrado: " + missing.length + ")" : ""}`);
  if (missing.length) missing.forEach((m) => console.log(`    · falta: ${m}…`));
}
console.log(`\nListo. ${totalOk}/${files.length} páginas procesadas.`);
