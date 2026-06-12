import { Request, Response, NextFunction } from "express";
import { vehiculoService } from "../services/vehiculo.service";
import { paginationSchema } from "../utils/pagination";
import { z } from "zod";

const listQuerySchema = paginationSchema.extend({
  clienteId: z.string().uuid().optional(),
});

export class VehiculoController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, clienteId } = listQuerySchema.parse(req.query);
      const result = await vehiculoService.findAll(page, limit, clienteId);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await vehiculoService.findById(req.params.id);
      return res.status(200).json({ success: true, data: v });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await vehiculoService.create(req.body);
      return res.status(201).json({ success: true, data: v });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await vehiculoService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: v });
    } catch (err) {
      next(err);
    }
  }
}

export const vehiculoController = new VehiculoController();
