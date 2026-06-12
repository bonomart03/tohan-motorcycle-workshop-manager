import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./lib/logger";
import apiRoutes from "./routes";

const app = express();

// ─── Seguridad de cabeceras HTTP ──────────────────────────────────────────────
// ✅ Helmet configura 14 headers de seguridad automáticamente
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  })
);

// ─── CORS: solo el frontend autorizado puede consumir la API ─────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true, // necesario para enviar/recibir cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ─── Parsers ──────────────────────────────────────────────────────────────────
// ✅ Limita el tamaño del payload a 10kb (anti billing-bomb / DoS)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Logging HTTP ─────────────────────────────────────────────────────────────
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.path === "/health",
  })
);

// ─── Rate limiting global ─────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Health check (sin auth, sin rate limit) ─────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use("/api/v1", apiRoutes);

// ─── 404 y manejo global de errores ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
