// Convierte el FAQ (sc-for con {{ }}) en <details> nativos estáticos.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "..", "design_handoff_kaelum_redesign");

function faqItems(protoFile) {
  const s = readFileSync(join(src, protoFile), "utf8");
  const block = s.slice(s.indexOf("faqItems: ["));
  const arr = block.slice(0, block.indexOf("].map"));
  const re = /\[\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*\]/g;
  const out = []; let m;
  while ((m = re.exec(arr))) out.push([m[1].replace(/\\'/g, "'"), m[2].replace(/\\'/g, "'")]);
  return out;
}
function details(items) {
  return items.map(function (it) {
    return `          <details class="kael-faq" style="border-bottom:1px solid rgba(255,255,255,0.08);">
            <summary style="display:flex; align-items:center; justify-content:space-between; gap:18px; padding:22px 4px; color:#F5F4F8; font-family:'General Sans',sans-serif; font-size:18px; font-weight:600;">
              <span>${it[0]}</span>
              <span class="kf-icon" style="font-size:26px; color:#9B8CFF; line-height:1; flex:none;">+</span>
            </summary>
            <p style="margin:0; padding:0 4px 24px; font-size:16px; line-height:1.65; color:#C4C2CE;">${it[1]}</p>
          </details>`;
  }).join("\n");
}

const TEMPLATE = /<div style="border-bottom:1px solid rgba\(255,255,255,0\.08\);">[\s\S]*?\{\{ item\.a \}\}[\s\S]*?<\/div>/;

const targets = [
  { proto: "Implementacion-IA.dc.html", out: "web/servicios/implementacion-ia/index.html" },
  { proto: "Presencia-Digital.dc.html", out: "web/servicios/presencia-digital/index.html" },
];
for (const t of targets) {
  const p = join(root, t.out);
  let html = readFileSync(p, "utf8");
  const items = faqItems(t.proto);
  if (!TEMPLATE.test(html)) { console.log("✗ plantilla FAQ no encontrada en " + t.out); continue; }
  html = html.replace(TEMPLATE, details(items).trimStart());
  writeFileSync(p, html, "utf8");
  console.log("✓ FAQ (" + items.length + " items) en " + t.out);
}
