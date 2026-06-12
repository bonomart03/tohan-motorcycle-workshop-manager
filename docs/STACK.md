# Stack Tecnológico — Taller Tohan

## Justificación de decisiones

### Backend: Node.js + Express + TypeScript
- **Por qué no PHP/Laravel**: TypeScript end-to-end comparte tipos con el frontend (Zod schemas).
- **Por qué Express sobre Fastify**: ecosistema más maduro, middleware disponible para cada regla de seguridad requerida.
- **Por qué Prisma**: type-safe, previene SQL injection por construcción, migraciones versionadas.

### Base de datos: PostgreSQL
- Soporte nativo para UUIDs, ENUM, transacciones ACID.
- Row Level Security (RLS) disponible si se migra a Supabase.
- Índices en DNI, dominio, estado_servicio para queries frecuentes.

### Frontend: React + Vite + TanStack Query
- **Vite**: build en milisegundos, HMR instantáneo.
- **TanStack Query**: caché, revalidación, sin re-renders innecesarios. Reemplaza Redux para datos del servidor.
- **React Hook Form + Zod**: validación isomórfica (mismos schemas en front y back).

### Seguridad
- **argon2id** sobre bcrypt: más resistente a ataques GPU/ASIC modernos.
- **httpOnly cookie** sobre localStorage: XSS no puede robar el token.
- **Helmet**: 14 security headers configurados automáticamente.
- **express-rate-limit**: previene brute force y ataques de costo.
- **Zod en middleware**: todo input sanitizado antes de llegar al controller.

### Infraestructura
- **Docker multi-stage**: imágenes de producción mínimas (~150MB).
- **Nginx**: TLS 1.2/1.3, HSTS, CSP, X-Frame-Options, no expone backend.
- **Red Docker interna**: la DB solo es accesible por el backend, nunca desde fuera.

## Flujo de una request

```
Usuario → Cloudflare (proxy + DDoS) → Nginx (TLS, headers, rate limit Nginx)
  → [/api/*] → Backend Express (rate limit app, auth cookie, Zod validate)
                 → Service (lógica) → Prisma → PostgreSQL
  → [/*]     → Frontend estático (React SPA)
```
