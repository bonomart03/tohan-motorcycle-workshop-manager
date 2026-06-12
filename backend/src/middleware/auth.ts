import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  iat: number;
  exp: number;
}

// Extiende Request para exponer el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ✅ Lee el JWT exclusivamente desde httpOnly cookie — NUNCA de localStorage
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.["access_token"];

  if (!token) {
    return res.status(401).json({ success: false, message: "No autenticado." });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Sesión inválida o expirada." });
  }
}

// ✅ Solo permite acceso a usuarios con rol ADMIN
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.rol !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Acceso denegado." });
  }
  next();
}
