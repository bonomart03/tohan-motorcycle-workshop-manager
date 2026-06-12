import { Request, Response, NextFunction } from "express";
import { servicioService } from "../services/servicio.service";
import { paginationSchema } from "../utils/pagination";
import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const listQuerySchema = paginationSchema.extend({
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "ENTREGADO"]).optional(),
  fechaDesde: z.string().regex(DATE_REGEX, "Formato YYYY-MM-DD").optional(),
  fechaHasta: z.string().regex(DATE_REGEX, "Formato YYYY-MM-DD").optional(),
});

export class ServicioController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, estado, fechaDesde, fechaHasta } = listQuerySchema.parse(req.query);
      const result = await servicioService.findAll(page, limit, estado, fechaDesde, fechaHasta);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await servicioService.findById(req.params.id);
      return res.status(200).json({ success: true, data: s });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await servicioService.create(req.body, req.user!.sub);
      return res.status(201).json({ success: true, data: s });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await servicioService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: s });
    } catch (err) {
      next(err);
    }
  }
}

export const servicioController = new ServicioController();
