/**
 * KAELUM — Worker proxy del agente de chat.
 *
 * Recibe el historial de mensajes del widget (POST { messages: [...] }),
 * antepone el system prompt de KAELUM y reenvía la conversación a OpenRouter
 * (Claude Haiku 4.5). Devuelve { reply } al frontend.
 *
 * La API key vive como SECRETO del Worker (OPENROUTER_API_KEY), nunca en el
 * frontend ni en este código:  wrangler secret put OPENROUTER_API_KEY
 */

// Orígenes autorizados a llamar al Worker (CORS).
const ALLOWED_ORIGINS = [
  "https://kaelum.es",
  "https://www.kaelum.es",
  "https://kaelum-web.pages.dev"
];

const MODEL = "anthropic/claude-haiku-4.5";

const SYSTEM_PROMPT = `Eres el asistente virtual oficial de Kaelum, una empresa española especializada en presencia digital e implementación de inteligencia artificial para PYMEs y comercio local de la zona oeste de Madrid (Boadilla, Las Rozas, Pozuelo, Majadahonda, Torrelodones y alrededores).

SOBRE KAELUM:
- Empresa joven formada por dos socios: Rodrigo López (presencia digital, marketing) y Jaime Millán (implementación de IA, diagnóstico técnico).
- Web: kaelum.es
- Email de contacto: contacto@kaelum.es
- Trabajamos con clínicas y centros de salud, comercio local y retail, academias y formación, y servicios profesionales (asesorías, inmobiliarias, despachos, fisios).

QUÉ OFRECEMOS:
1. PRESENCIA DIGITAL: webs profesionales que convierten, Google Business, sistema de reservas online (Cal.com), WhatsApp Business, SEO local, analítica (Google Analytics, Meta Pixel), automatizaciones de marketing con Brevo.
2. IMPLEMENTACIÓN DE IA: diagnóstico gratuito de oportunidades de IA, agentes de IA a medida, automatizaciones con n8n, integraciones con sistemas actuales, IA aplicada que ahorra horas reales.

PROCESO DE TRABAJO:
1. Diagnóstico gratuito: auditamos su presencia digital y procesos. Entregamos informe profesional con prioridades.
2. Implementación: ejecutamos las soluciones de mayor impacto, validando en cada entrega.
3. Mantenimiento: monitorizamos, optimizamos y evolucionamos el sistema mes a mes con reportes claros.

PAQUETES Y PRECIOS:
- Paquete Esencial: 1.200€ setup + 300€/mes
- Paquete Profesional: 1.500€ setup + 400€/mes (el más recomendado)
- Paquete Premium: 2.500€ setup + 600€/mes
- Contratos con permanencia mínima de 6 meses.
- Diagnóstico de IA individual: 500€ (si solo quieren el informe técnico).

DIFERENCIADORES:
- Diagnóstico gratuito real, no llamada comercial encubierta.
- Mantenimiento continuo, no entrega y desaparición.
- Especialistas en PYME local de Madrid Oeste.
- Honestidad: no prometemos lo que no podemos cumplir.

TU PERSONALIDAD:
- Profesional pero cercano. Tuteo siempre.
- Respuestas breves y útiles (máximo 3-4 frases salvo que pidan detalle).
- No inventes datos que no sepas. Si dudas, deriva al diagnóstico gratuito.
- Si el usuario muestra interés real (pregunta por precios concretos, su sector, casos), invítale a solicitar el diagnóstico gratuito en kaelum.es/contacto.
- No hables de competencia ni de otras agencias.
- Si la pregunta no tiene relación con Kaelum o nuestros servicios, redirige amablemente: "Mi función es resolver dudas sobre Kaelum. ¿Hay algo de nuestros servicios que te interese?".

IMPORTANTE: El email de contacto público es contacto@kaelum.es. Cuando el usuario pregunte cómo contactar, dirígele a la página /contacto/ o al email contacto@kaelum.es. NUNCA menciones iakaelum@gmail.com ni ningún email interno porque son de uso interno del equipo.

OBJETIVO:
Resolver dudas y, cuando detectes interés genuino, llevar al usuario a solicitar el diagnóstico gratuito en /contacto.`;

function corsHeaders(origin) {
  // Refleja el origen si está permitido; si no, cae al dominio principal.
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    try {
      const { messages } = await request.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: "Falta el historial de mensajes." }), {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" }
        });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kaelum.es",
          "X-Title": "Kaelum Web Agent"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error("OpenRouter error " + response.status);
      }

      const data = await response.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "";

      return new Response(JSON.stringify({ reply: reply }), {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Disculpa, hay un problema técnico. Inténtalo de nuevo en unos segundos."
      }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
  }
};
