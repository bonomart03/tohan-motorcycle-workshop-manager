import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// ✅ Valida y sanitiza el body con Zod antes de llegar al controller
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res
        .status(422)
        .json({ success: false, message: "Datos inválidos.", errors });
    }
    // Reemplaza el body con el dato parseado/sanitizado por Zod
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res
        .status(422)
        .json({ success: false, message: "Parámetros inválidos.", errors });
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
