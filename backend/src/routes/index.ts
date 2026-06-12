import { Router } from "express";
import authRoutes from "./auth.routes";
import clienteRoutes from "./cliente.routes";
import vehiculoRoutes from "./vehiculo.routes";
import servicioRoutes from "./servicio.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clientes", clienteRoutes);
router.use("/vehiculos", vehiculoRoutes);
router.use("/servicios", servicioRoutes);
router.use("/users", userRoutes);

export default router;
