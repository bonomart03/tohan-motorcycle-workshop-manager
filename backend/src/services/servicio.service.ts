import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { buildPaginatedResponse, paginationToSkipTake } from "../utils/pagination";
import type { CreateServicioDto, UpdateServicioDto } from "../validators/servicio.validator";

const servicioSelect = {
  id: true,
  descripcion: true,
  diagnostico: true,
  trabajosRealizados: true,
  repuestosUtilizados: true,
  costoManoObra: true,
  costoRepuestos: true,
  estado: true,
  kmIngreso: true,
  kmEgreso: true,
  fechaIngreso: true,
  fechaSalida: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ServicioService {
  async findAll(page: number, limit: number, estado?: string, fechaDesde?: string, fechaHasta?: string) {
    const where: any = {};
    if (estado) where.estado = estado;
    if (fechaDesde || fechaHasta) {
      where.fechaIngreso = {};
      if (fechaDesde) where.fechaIngreso.gte = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        where.fechaIngreso.lte = hasta;
      }
    }
    const { skip, take } = paginationToSkipTake(page, limit);

    const [data, total] = await prisma.$transaction([
      prisma.servicio.findMany({
        where,
        select: {
          ...servicioSelect,
          vehiculo: {
            select: {
              id: true,
              marca: true,
              modelo: true,
              dominio: true,
              cliente: { select: { id: true, nombre: true, apellido: true } },
            },
          },
          mecanico: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaIngreso: "desc" },
        skip,
        take,
      }),
      prisma.servicio.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string) {
    const s = await prisma.servicio.findUnique({
      where: { id },
      select: {
        ...servicioSelect,
        vehiculo: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            dominio: true,
            nroChasis: true,
            nroCuadro: true,
            cliente: {
              select: { id: true, nombre: true, apellido: true, dni: true, domicilio: true },
            },
          },
        },
        mecanico: { select: { id: true, nombre: true } },
      },
    });
    if (!s) throw new AppError(404, "Servicio no encontrado.");
    return s;
  }

  async create(dto: CreateServicioDto, userId: string) {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: dto.vehiculoId },
    });
    if (!vehiculo) throw new AppError(404, "Vehículo no encontrado.");

    return prisma.servicio.create({
      data: {
        vehiculoId: dto.vehiculoId,
        userId,
        descripcion: dto.descripcion,
        kmIngreso: dto.kmIngreso,
      },
      select: servicioSelect,
    });
  }

  async update(id: string, dto: UpdateServicioDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.fechaSalida) data.fechaSalida = new Date(dto.fechaSalida);
    return prisma.servicio.update({ where: { id }, data, select: servicioSelect });
  }
}

export const servicioService = new ServicioService();
