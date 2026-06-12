import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../validators/user.validator";

const router = Router();

// Todos los endpoints de usuarios requieren admin
router.use(requireAuth, requireAdmin);

router.get("/", (req, res, next) => userController.index(req, res, next));
router.post("/", validateBody(createUserSchema), (req, res, next) =>
  userController.create(req, res, next)
);
router.patch("/:id", validateBody(updateUserSchema), (req, res, next) =>
  userController.updateActivo(req, res, next)
);

export default router;
