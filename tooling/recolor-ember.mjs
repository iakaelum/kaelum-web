// Paleta "Ember": frío (violeta/azul/cian) -> cálido (rojo/naranja/ámbar). Solo recolorea tokens.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
function walk(d){let o=[];for(const f of readdirSync(d)){const p=join(d,f);const s=statSync(p);if(s.isDirectory())o=o.concat(walk(p));else if(/\.(html|css)$/.test(f))o.push(p);}return o;}
const MAP = [
  // Hex marca
  ["#8B5CF6","#F43F5E"],["#6366F1","#FB7134"],["#3B82F6","#FF8A2B"],["#22D3EE","#FFC24D"],
  ["#9B8CFF","#FFA86B"],["#A78BFA","#FFB07A"],["#C4B5FD","#FFD0A8"],["#CFC8FF","#FFD8B0"],["#7C5CDA","#F86A3D"],
  // rgb triples (glows/bordes/sombras)
  ["139,92,246","244,63,94"],["99,102,241","251,113,52"],["59,130,246","255,138,43"],["34,211,238","255,194,77"],
  ["150,90,255","255,95,80"],["120,60,240","235,75,60"],["40,90,220","245,135,45"],["16,140,170","240,170,55"],
  ["124,194,255","255,185,95"],["150,210,255","255,195,115"],["167,139,250","255,176,120"],
  ["196,181,253","255,205,165"],["155,140,255","255,158,100"],
  // Fondos oscuros violáceos -> oscuros cálidos
  ["#1E1238","#2A1212"],["#140C26","#1A0C0C"],["#100d1b","#170E0A"],["#211c34","#2A1810"],
  ["#0e0b18","#160E0A"],["#221d36","#2A1810"],["#36186F","#6E1C2C"],["#16265F","#5E3612"],
  ["#1C1142","#2A1414"],["#0E1030","#1A0E0A"],["#1b1338","#2A1410"],["#0e0a1c","#160C0A"],
  ["#0A0810","#0A0707"],["#0A0A0F","#0A0707"],
];
let total=0;
for(const p of walk(web)){let h=readFileSync(p,"utf8");const o=h;for(const [a,b] of MAP)h=h.split(a).join(b);if(h!==o){writeFileSync(p,h,"utf8");total++;}}
console.log("recoloreado en",total,"archivos");
