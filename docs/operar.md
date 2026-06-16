# Operar el día a día

Guía corta para trabajar sobre el proyecto sin liarla.

## Reglas de oro

1. **Todo lo público vive en `web/`.** Lo demás es docs y herramientas.
2. **`main` es producción.** Lo que esté en `main` es lo que ven los clientes.
3. **Nunca subas claves/contraseñas.** Van en `.env` (ya ignorado por git). Si una clave se sube por error, hay que rotarla (regenerarla).

## Hacer un cambio en la web

```bash
git pull                       # trae lo último antes de empezar
# editas archivos en web/...
node tooling/dev-server.mjs    # compruebas en http://localhost:8099
git add .
git commit -m "Qué has cambiado"
git push                       # Cloudflare redespliega solo
```

## Trabajar con ramas (recomendado cuando seáis dos a la vez)

Para no pisaros, cada cambio grande en su rama y luego Pull Request:

```bash
git checkout -b cambio-precios     # nueva rama
# ...editas, commiteas...
git push -u origin cambio-precios  # súbela
```
En GitHub abres un **Pull Request**. Cloudflare genera una **preview URL** para ver ese cambio aislado. Cuando esté bien, *Merge* a `main` → se publica.

## Dar acceso al socio (Rodrigo)

- **GitHub:** repo → *Settings* → *Collaborators* → invitar su usuario. Así puede hacer push/PR.
- **Cloudflare:** *Manage Account* → *Members* → invitarlo.

## Cuándo dar el salto al Nivel 1 (base de datos)

Señal: empezáis a meter leads de verdad y queréis verlos los dos. Entonces montamos Supabase
(ver `docs/arquitectura.md`) y conectamos el CRM. Hasta entonces, `localStorage` vale.

## Cuándo dar el salto al Nivel 2 (n8n / agentes)

Señal: cerráis el primer cliente de "Agentes de IA a medida". Ahí montamos n8n + API de IA
y damos de alta al cliente en la tabla `clientes` para llevar la cuota mensual.

## Chuleta de comandos git

| Quiero | Comando |
|---|---|
| Ver qué he cambiado | `git status` |
| Traer lo último | `git pull` |
| Guardar cambios | `git add .` → `git commit -m "..."` |
| Publicar | `git push` |
| Nueva rama | `git checkout -b nombre` |
| Cambiar de rama | `git checkout main` |
