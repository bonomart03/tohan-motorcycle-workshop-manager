import { Request, Response, NextFunction } from "express";
import { clienteService } from "../services/cliente.service";
import { paginationSchema } from "../utils/pagination";
import { z } from "zod";

const listQuerySchema = paginationSchema.extend({
  search: z.string().max(100).trim().optional(),
});

export class ClienteController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = listQuerySchema.parse(req.query);
      const result = await clienteService.findAll(page, limit, search);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.findById(req.params.id);
      return res.status(200).json({ success: true, data: cliente });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.create(req.body);
      return res.status(201).json({ success: true, data: cliente });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.update(req.params.id, req.body);
      return res.status(200).json({ success: true, data: cliente });
    } catch (err) {
      next(err);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      await clienteService.delete(req.params.id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const clienteController = new ClienteController();
