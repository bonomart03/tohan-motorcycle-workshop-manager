import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { buildPaginatedResponse, paginationToSkipTake } from "../utils/pagination";
import type { CreateVehiculoDto, UpdateVehiculoDto } from "../validators/vehiculo.validator";

const vehiculoSelect = {
  id: true,
  marca: true,
  modelo: true,
  dominio: true,
  nroChasis: true,
  nroCuadro: true,
  kilometraje: true,
  clienteId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class VehiculoService {
  async findAll(page: number, limit: number, clienteId?: string) {
    const where = clienteId ? { clienteId } : {};
    const { skip, take } = paginationToSkipTake(page, limit);

    const [data, total] = await prisma.$transaction([
      prisma.vehiculo.findMany({
        where,
        select: {
          ...vehiculoSelect,
          cliente: { select: { id: true, nombre: true, apellido: true, dni: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.vehiculo.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string) {
    const v = await prisma.vehiculo.findUnique({
      where: { id },
      select: {
        ...vehiculoSelect,
        cliente: { select: { id: true, nombre: true, apellido: true, dni: true } },
        servicios: {
          select: {
            id: true,
            estado: true,
            fechaIngreso: true,
            fechaSalida: true,
            descripcion: true,
          },
          orderBy: { fechaIngreso: "desc" },
          take: 10,
        },
      },
    });
    if (!v) throw new AppError(404, "Vehículo no encontrado.");
    return v;
  }

  async create(dto: CreateVehiculoDto) {
    const [domConflict, chassisConflict, frameConflict] = await Promise.all([
      prisma.vehiculo.findUnique({ where: { dominio: dto.dominio } }),
      prisma.vehiculo.findUnique({ where: { nroChasis: dto.nroChasis } }),
      prisma.vehiculo.findUnique({ where: { nroCuadro: dto.nroCuadro } }),
    ]);
    if (domConflict) throw new AppError(409, "El dominio ya está registrado.");
    if (chassisConflict) throw new AppError(409, "El N° de chasis ya está registrado.");
    if (frameConflict) throw new AppError(409, "El N° de cuadro ya está registrado.");

    return prisma.vehiculo.create({ data: dto, select: vehiculoSelect });
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    await this.findById(id);
    return prisma.vehiculo.update({
      where: { id },
      data: dto,
      select: vehiculoSelect,
    });
  }
}

export const vehiculoService = new VehiculoService();
