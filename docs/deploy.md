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

## 2. Conectar el dominio

`.com`, `.ai` y `.app` están cogidos. Usa **`kaelum.io`** (principal) y **`kaelum.es`** (redirección).

1. Registra `kaelum.io` (Cloudflare Registrar es lo más cómodo porque ya estás dentro; también Porkbun/Namecheap).
2. En tu proyecto de Pages → **Custom domains** → **Set up a domain** → `kaelum.io`.
3. Registros DNS (si el dominio está en Cloudflare se crean solos; si está fuera, créalos a mano):

   | Tipo | Nombre | Valor |
   |---|---|---|
   | CNAME | `@` (raíz) | `kaelum.pages.dev` |
   | CNAME | `www` | `kaelum.pages.dev` |

   *(Si tu DNS no permite CNAME en la raíz, activa CNAME flattening o usa los A/AAAA que indique Pages.)*
4. `kaelum.es`: añádelo como dominio extra o crea una **Redirect Rule 301 → https://kaelum.io**.
5. El SSL (candado https) se emite solo en unos minutos.

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
