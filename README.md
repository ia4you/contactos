# contactos.turel.es

Portal de contactos para el ambiente liberal/swinger en Canarias. Público
adulto 18+, prioridad absoluta a la discreción y la privacidad. Fase inicial
gratuita (sin Stripe todavía).

Next.js 14 (App Router, JavaScript) + Tailwind CSS v3 + PostgreSQL.

## Desarrollo

```bash
npm install
npm run dev
```

Requiere `.env.local` con `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
y credenciales SMTP (no se versiona, ver despliegue en dokploy).

## Base de datos

```bash
docker exec -i contactos-db psql -U contactos -d contactos < scripts/schema.sql
```

## Estructura

- `app/page.js` — puerta de verificación de edad (18+) y landing
- `app/registro`, `app/login`, `app/recuperar` — autenticación (NextAuth v4)
- `app/mi-perfil` — edición de perfil, gestión de fotos, borrado de cuenta
- `app/legal` — aviso legal, privacidad, cookies
- `lib/` — conexión a BD, auth, mailer, constantes
- `scripts/purge-deleted.js` — borrado definitivo de cuentas eliminadas
  hace más de 30 días (ejecución manual o vía cron)
