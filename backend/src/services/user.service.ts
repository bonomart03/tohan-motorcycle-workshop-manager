import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { authService } from "./auth.service";
import { buildPaginatedResponse, paginationToSkipTake } from "../utils/pagination";
import type { CreateUserDto, UpdateUserDto } from "../validators/user.validator";

// ✅ passwordHash nunca incluido en las proyecciones de respuesta
const userSelect = {
  id: true,
  email: true,
  nombre: true,
  rol: true,
  activo: true,
  createdAt: true,
} as const;

export class UserService {
  async findAll(page: number, limit: number) {
    const { skip, take } = paginationToSkipTake(page, limit);
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        select: userSelect,
        orderBy: { nombre: "asc" },
        skip,
        take,
      }),
      prisma.user.count(),
    ]);
    return buildPaginatedResponse(data, total, page, limit);
  }

  async create(dto: CreateUserDto) {
    const exists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new AppError(409, "Ya existe un usuario con ese email.");

    const passwordHash = await authService.hashPassword(dto.password);

    return prisma.user.create({
      data: { email: dto.email, passwordHash, nombre: dto.nombre, rol: dto.rol },
      select: userSelect,
    });
  }

  async updateActivo(id: string, dto: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "Usuario no encontrado.");
    return prisma.user.update({ where: { id }, data: { activo: dto.activo }, select: userSelect });
  }
}

export const userService = new UserService();
