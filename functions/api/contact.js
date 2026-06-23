/**
 * Cloudflare Pages Function — Proxy del formulario de contacto hacia n8n.
 * Ruta: POST /api/contact
 *
 * Actúa de intermediario para NO exponer la URL del webhook de n8n en el cliente.
 * La URL real se lee de la variable de entorno N8N_WEBHOOK_URL (configurada en el
 * dashboard de Cloudflare Pages). Nunca se hardcodea aquí.
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Solo POST. Cualquier otro método → 405.
  if (request.method !== "POST") {
    return json({ ok: false, error: "Método no permitido." }, 405, { Allow: "POST" });
  }

  // Leer el body como JSON.
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Cuerpo de la petición inválido." }, 400);
  }
  if (!data || typeof data !== "object") {
    return json({ ok: false, error: "Cuerpo de la petición inválido." }, 400);
  }

  // Honeypot antispam: si "empresa" viene con contenido es un bot.
  // Respondemos 200 { ok:true } SIN reenviar nada y sin darle pistas.
  if (typeof data.empresa === "string" && data.empresa.trim() !== "") {
    return json({ ok: true }, 200);
  }

  // Normalizar entradas.
  const nombre = str(data.nombre);
  const apellidos = str(data.apellidos);
  const email = str(data.email);
  const telefono = str(data.telefono);
  const mensaje = str(data.mensaje);
  const negocio = str(data.negocio);
  const sector = str(data.sector);
  const interes = str(data.interes);
  const web = str(data.web);
  const rgpd = data.rgpd === true || data.rgpd === "si" || data.rgpd === "true" || data.rgpd === "on";

  // Validación: nombre, email y mensaje son obligatorios.
  if (!nombre || !email || !mensaje) {
    return json({ ok: false, error: "Faltan campos obligatorios: nombre, email y mensaje." }, 400);
  }
  // El email debe tener formato válido.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "El email no tiene un formato válido." }, 400);
  }

  // URL del webhook de n8n desde variable de entorno (nunca hardcodeada).
  const webhookUrl = env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ ok: false, error: "El servidor no está configurado correctamente." }, 500);
  }

  // Payload limpio para n8n: claves exactas acordadas (sin el honeypot "empresa").
  const payload = { nombre, apellidos, email, telefono, mensaje, negocio, sector, interes, web, rgpd };

  // Reenviar a n8n.
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return json({ ok: false, error: "No se pudo entregar el mensaje. Inténtalo de nuevo en un momento." }, 502);
    }
  } catch {
    return json({ ok: false, error: "No se pudo conectar con el servidor de envío." }, 502);
  }

  return json({ ok: true }, 200);
}

/** Convierte cualquier valor en string recortado. */
function str(value) {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
}

/** Construye una respuesta JSON. */
function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}
