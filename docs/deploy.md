# Deploy — publicar la web

La web es estática (sin build) y se publica en **Cloudflare Pages** conectado a este repo de GitHub.
Cada `git push` a `main` redespliega solo. No hay que subir archivos a mano nunca más.

## 1. Conectar Cloudflare Pages con GitHub (una vez)

1. Entra en https://dash.cloudflare.com → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Autoriza Cloudflare a acceder a tu GitHub y selecciona el repositorio **kaelum**.
3. Configura el build:

   | Ajuste | Valor |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | *(déjalo vacío)* |
   | **Build output directory** | `web` |

4. **Save and Deploy.** En ~1 min estará en `https://kaelum.pages.dev`.

> La clave es **Build output directory = `web`**: el sitio vive en la subcarpeta `web/`, no en la raíz del repo.

## 2. Conectar el dominio `kaelum.es` (comprado en Hostinger)

El dominio está en **Hostinger**. La forma recomendada de conectarlo a Cloudflare Pages es **mover el
DNS a Cloudflare** (cambiar los nameservers). Así dominio + DNS + web + subdominio del CRM quedan en un
solo sitio y el dominio raíz funciona sin líos.

> ⚠️ **CUIDADO CON EL EMAIL.** `contacto@kaelum.es` depende de registros DNS (MX, SPF, DKIM) que hoy
> viven en Hostinger. Al mover el DNS a Cloudflare hay que **conservar esos registros** o el correo deja
> de funcionar. Cloudflare los importa solos al añadir el dominio, pero **hay que verificarlo**.

1. En Cloudflare: **Add a site** → escribe `kaelum.es` → plan **Free**.
2. Cloudflare escanea el DNS actual. **Comprueba que aparezcan los registros de correo** (varios `MX` que
   apuntan a Hostinger, y `TXT` de SPF/DKIM). Si falta alguno, cópialo desde Hostinger (panel de Email).
3. Cloudflare te da **2 nameservers** (p.ej. `xxx.ns.cloudflare.com`). En **Hostinger → Dominios → DNS /
   Nameservers**, cambia a "usar nameservers personalizados" y pega esos dos. (Tarda de minutos a 24 h.)
4. Cuando Cloudflare diga "Active", ve al proyecto **kaelum-web** → **Custom domains** → **Set up a domain**
   → `kaelum.es` y también `www.kaelum.es`. Como el DNS ya está en Cloudflare, los registros se crean solos.
5. SSL (candado https) automático en minutos.
6. **Verifica el correo:** manda un email a `contacto@kaelum.es` desde fuera y comprueba que llega.

### Alternativa sin mover nameservers (dejar DNS en Hostinger)
Posible pero más frágil para el dominio raíz: en Hostinger creas un `CNAME` de `www` → `kaelum-web.pages.dev`
y rediriges la raíz a `www`. El email no se toca. Solo si no quieres mover los nameservers.

## 3. Flujo de trabajo diario

```bash
# haces cambios en web/...
git add .
git commit -m "Describe el cambio"
git push          # Cloudflare redespliega automáticamente
```

- Cada Pull Request genera una **preview URL** propia para ver el cambio antes de fusionarlo.
- `main` = lo que está en producción.

## Alternativa sin GitHub (no recomendada)

Pages permite *Upload assets* arrastrando la carpeta `web/` a mano. Solo para una prueba rápida; pierdes el deploy automático.
