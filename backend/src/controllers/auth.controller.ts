import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  // SameSite=none requerido cuando frontend y backend están en dominios distintos (Vercel ≠ Render).
  // SameSite=none exige Secure=true — solo aplica en producción HTTPS.
  sameSite: (IS_PROD ? "none" : "strict") as "none" | "strict",
  maxAge: parseInt(process.env.COOKIE_MAX_AGE_MS ?? "28800000"),
  path: "/",
};

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);

      // ✅ JWT en httpOnly cookie — NUNCA en localStorage ni en el body
      res.cookie("access_token", token, COOKIE_OPTIONS);

      // Solo devuelve datos no sensibles
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.sub, currentPassword, newPassword);
      res.clearCookie("access_token", { path: "/" });
      return res.status(200).json({
        success: true,
        message: "Contraseña actualizada. Iniciá sesión con la nueva contraseña.",
      });
    } catch (err) {
      next(err);
    }
  }

  logout(_req: Request, res: Response) {
    res.clearCookie("access_token", { path: "/" });
    return res.status(200).json({ success: true, message: "Sesión cerrada." });
  }

  me(req: Request, res: Response) {
    // req.user fue validado por requireAuth middleware
    return res.status(200).json({ success: true, user: req.user });
  }
}

export const authController = new AuthController();
