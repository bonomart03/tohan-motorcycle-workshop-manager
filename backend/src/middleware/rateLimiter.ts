import rateLimit from "express-rate-limit";

// ✅ Rate limiter general para todos los endpoints de la API
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "100"),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intente nuevamente en 15 minutos.",
  },
  // Identifica por IP real detrás de Nginx/proxy
  keyGenerator: (req) => {
    return (req.headers["x-forwarded-for"] as string)?.split(",")[0] ?? req.ip ?? "unknown";
  },
});

// ✅ Rate limiter estricto para endpoints de autenticación (anti brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? "10"),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuenta fallos
  message: {
    success: false,
    message:
      "Demasiados intentos de autenticación. Cuenta bloqueada temporalmente.",
  },
});
