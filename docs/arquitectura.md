# Arquitectura y roadmap

Tres niveles. No hace falta todo hoy; los vais activando según crecéis.

## Nivel 0 — Hoy (ya está hecho)

```
web/ (HTML/CSS/JS)  ──►  GitHub  ──►  Cloudflare Pages  ──►  kaelum.es
CRM                 ──►  localStorage (datos por dispositivo)
```
Coste: **0 €**. Sirve para lanzar y captar los primeros leads.
Limitación: el CRM guarda los leads en el navegador, así que **no se comparten** entre Jaime y Rodrigo. Se arregla en el Nivel 1.

## Nivel 1 — CRM compartido con base de datos

Cuando queráis ver los dos los mismos leads y entrar con contraseña.

```
Web/CRM (Cloudflare) ──API──► Supabase (Postgres + Auth)
```

**Por qué Supabase:** base de datos + login + API automática + panel visual tipo hoja de cálculo. Plan gratis (500 MB) sobra al principio.

Esquema inicial (incluye la parte de ingresos recurrentes de mantenimiento):

```sql
-- Leads (lo que hoy vive en localStorage)
create table leads (
  id         uuid primary key default gen_random_uuid(),
  empresa    text not null,
  contacto   text,
  telefono   text,
  servicio   text,
  estado     text default 'nuevo',
  notas      text,
  created_at timestamptz default now()
);

-- Clientes con cuota mensual (ingresos recurrentes)
create table clientes (
  id              uuid primary key default gen_random_uuid(),
  empresa         text not null,
  servicio        text,
  cuota_mensual   numeric,
  estado          text default 'activo',  -- activo | pausado | baja
  alta            date default now(),
  proxima_factura date
);
```

Migración (se hace en el **repo `crm`**, en `web/assets/js/crm.js`): cambiar el guardado en `localStorage` por llamadas a Supabase (se carga su cliente JS por CDN, sin build). Las claves van en variables de entorno, **nunca** commiteadas (ya están en `.gitignore`). Detalle en el repo `crm`: `docs/supabase.md`.

Coste: **0 €** hasta tener volumen alto.

## Nivel 2 — Infraestructura de agentes de IA (negocio recurrente)

La "fábrica" con la que montáis y **mantenéis** los agentes de cada cliente — la fuente de ingresos recurrentes.

```
Cliente (web/WhatsApp/email)
        │
        ▼
   n8n / Make  ──►  API de IA (Claude / GPT)
        │
        ▼
   Panel de salud + facturación
```

- **Orquestación:** n8n (open-source, autohospedable barato) o Make. Donde "vive" cada agente y se conecta a las apps del cliente.
- **Cerebro:** API de Claude o GPT (pago por uso → se repercute en la cuota).
- **Mantenimiento = ingreso recurrente:** monitorizáis que el flujo no se rompa, lo ajustáis y cobráis cuota mensual. Esos clientes van en la tabla `clientes`.

Coste: bajo y variable (n8n autohospedado ~5-10 €/mes + uso de API).

## Resumen

| Necesidad | Herramienta | Cuándo | Coste |
|---|---|---|---|
| Web pública | Cloudflare Pages | Ya | 0 € |
| CRM compartido + login | Supabase | Primeros clientes | 0 € → poco |
| Montar/operar agentes | n8n + API Claude/GPT | 1er agente vendido | ~5-10 €/mes + uso |
| Cobros recurrentes | Stripe | Varios clientes fijos | % por cobro |

**Orden recomendado:** (1) web online + dominio → (2) CRM a Supabase → (3) n8n al cerrar el primer agente.
