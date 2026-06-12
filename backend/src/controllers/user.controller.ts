import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { paginationSchema } from "../utils/pagination";

export class UserController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await userService.findAll(page, limit);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updateActivo(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateActivo(req.params.id, req.body);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
