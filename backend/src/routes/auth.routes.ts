import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate";
import { loginSchema, changePasswordSchema } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", authLimiter, validateBody(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);
router.post("/logout", requireAuth, (req, res) =>
  authController.logout(req, res)
);
router.get("/me", requireAuth, (req, res) =>
  authController.me(req, res)
);
router.put("/password", requireAuth, validateBody(changePasswordSchema), (req, res, next) =>
  authController.changePassword(req, res, next)
);

export default router;
