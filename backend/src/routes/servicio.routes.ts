import { Router } from "express";
import { servicioController } from "../controllers/servicio.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createServicioSchema,
  updateServicioSchema,
} from "../validators/servicio.validator";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => servicioController.index(req, res, next));
router.get("/:id", (req, res, next) => servicioController.show(req, res, next));
router.post(
  "/",
  validateBody(createServicioSchema),
  (req, res, next) => servicioController.create(req, res, next)
);
router.patch(
  "/:id",
  validateBody(updateServicioSchema),
  (req, res, next) => servicioController.update(req, res, next)
);

export default router;
