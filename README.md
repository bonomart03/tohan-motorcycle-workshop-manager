# Taller Tohan — Sistema de Gestión

Sistema web de gestión para taller de motos. Permite registrar clientes, vehículos e ingresos de servicio, con historial completo por vehículo y panel de control en tiempo real.

**Demo:** https://frontend-bono-s-projects2.vercel.app

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL (Neon) |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| PWA | manifest.json + Service Worker |

---

## Funcionalidades

- **Clientes** — alta, edición, búsqueda y eliminación
- **Vehículos** — registro con marca, modelo, dominio, chasis, cuadro y kilometraje
- **Servicios** — ingreso de órdenes de trabajo con diagnóstico, trabajos realizados, repuestos, costos y estado (Pendiente → En proceso → Completado → Entregado)
- **Historial por cliente** — vista completa de todos los vehículos y servicios del cliente
- **Dashboard** — métricas en tiempo real (clientes, servicios pendientes, en proceso)
- **Usuarios** — gestión de cuentas con roles ADMIN y MECÁNICO
- **Impresión** — orden de servicio lista para imprimir
- **PWA** — instalable en iOS y Android como app desde el navegador
- **Responsive** — funciona en celular, tablet y desktop

---

## Seguridad

- Contraseñas con **argon2id**
- JWT en **httpOnly cookies** (nunca en localStorage)
- **SameSite=lax** con proxy same-origin (Vercel → Render)
- **Zod** para validación y sanitización de todos los inputs
- **Rate limiting** en todos los endpoints (más estricto en `/auth/login`)
- **Helmet** para headers HTTP de seguridad
- Proyecciones explícitas en Prisma (sin `SELECT *`)
- Paginación obligatoria en todos los listados

---

## Estructura del proyecto

```
├── frontend/          # React + Vite
│   ├── public/
│   │   ├── logo.jpeg
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types/
│   └── vercel.json
│
├── backend/           # Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── services/
│
└── render.yaml
```

---

## Variables de entorno

### Backend (Render)

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
COOKIE_SECRET=...
FRONTEND_URL=https://frontend-bono-s-projects2.vercel.app
JWT_EXPIRES_IN=8h
COOKIE_MAX_AGE_MS=28800000
```

### Frontend (Vercel)

```env
VITE_API_URL=/api/v1
```

---

## Correr localmente

```bash
# Clonar
git clone https://github.com/bonomart03/tohan-motorcycle-workshop-manager.git
cd tohan-motorcycle-workshop-manager

# Backend
cd backend
cp .env.example .env   # completar variables
npm install
npx prisma migrate dev
npm run dev

# Frontend (otra terminal)
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3001/api/v1
npm install
npm run dev
```

---

## Deploy

El proyecto usa **GitHub → Render** (backend) y **Vercel CLI** (frontend).

El `vercel.json` incluye un proxy rewrite `/api/v1/*` → Render para que las cookies sean same-origin y funcionen en iOS Safari.

---

## Instalar como app (PWA)

1. Abrí el link en Safari (iOS) o Chrome (Android)
2. Tocá **Compartir → Agregar a pantalla de inicio**
3. La app queda instalada con el logo del taller, sin barra del navegador

---

Developed by [Bonomart](https://www.linkedin.com/in/bono-martinez-8b638227a)
