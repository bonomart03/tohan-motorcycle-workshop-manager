import { Router } from "express";
import { vehiculoController } from "../controllers/vehiculo.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createVehiculoSchema,
  updateVehiculoSchema,
} from "../validators/vehiculo.validator";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => vehiculoController.index(req, res, next));
router.get("/:id", (req, res, next) => vehiculoController.show(req, res, next));
router.post(
  "/",
  validateBody(createVehiculoSchema),
  (req, res, next) => vehiculoController.create(req, res, next)
);
router.patch(
  "/:id",
  validateBody(updateVehiculoSchema),
  (req, res, next) => vehiculoController.update(req, res, next)
);

export default router;
