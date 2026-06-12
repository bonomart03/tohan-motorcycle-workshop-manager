import { Router } from "express";
import { clienteController } from "../controllers/cliente.controller";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createClienteSchema,
  updateClienteSchema,
} from "../validators/cliente.validator";

const router = Router();

router.use(requireAuth);

router.get("/", (req, res, next) => clienteController.index(req, res, next));
router.get("/:id", (req, res, next) => clienteController.show(req, res, next));
router.post(
  "/",
  validateBody(createClienteSchema),
  (req, res, next) => clienteController.create(req, res, next)
);
router.patch(
  "/:id",
  validateBody(updateClienteSchema),
  (req, res, next) => clienteController.update(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  clienteController.destroy(req, res, next)
);

export default router;
