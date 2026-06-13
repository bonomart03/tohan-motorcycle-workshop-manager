import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { buildPaginatedResponse, paginationToSkipTake } from "../utils/pagination";
import type { CreateClienteDto, UpdateClienteDto } from "../validators/cliente.validator";

// ✅ Proyección: solo expone los campos necesarios, nunca SELECT *
const clienteSelect = {
  id: true,
  nombre: true,
  apellido: true,
  dni: true,
  domicilio: true,
  cedulaDigital: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ClienteService {
  async findAll(page: number, limit: number, search?: string) {
    const where = search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" as const } },
            { apellido: { contains: search, mode: "insensitive" as const } },
            { dni: { contains: search } },
          ],
        }
      : {};

    const { skip, take } = paginationToSkipTake(page, limit);

    const [data, total] = await prisma.$transaction([
      prisma.cliente.findMany({
        where,
        select: clienteSelect,
        orderBy: { apellido: "asc" },
        skip,
        take,
      }),
      prisma.cliente.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findById(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        ...clienteSelect,
        cedulaFoto: true,
        vehiculos: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            dominio: true,
            kilometraje: true,
            nroChasis: true,
            nroCuadro: true,
            servicios: {
              select: {
                id: true,
                descripcion: true,
                estado: true,
                kmIngreso: true,
                kmEgreso: true,
                fechaIngreso: true,
                fechaSalida: true,
                costoManoObra: true,
                costoRepuestos: true,
              },
              orderBy: { fechaIngreso: "desc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!cliente) throw new AppError(404, "Cliente no encontrado.");
    return cliente;
  }

  async create(dto: CreateClienteDto) {
    const exists = await prisma.cliente.findUnique({ where: { dni: dto.dni } });
    if (exists) throw new AppError(409, "Ya existe un cliente con ese DNI.");

    return prisma.cliente.create({
      data: dto,
      select: clienteSelect,
    });
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findById(id);
    if (dto.dni) {
      const conflict = await prisma.cliente.findFirst({
        where: { dni: dto.dni, NOT: { id } },
      });
      if (conflict) throw new AppError(409, "El DNI ya pertenece a otro cliente.");
    }
    return prisma.cliente.update({
      where: { id },
      data: dto,
      select: clienteSelect,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.cliente.delete({ where: { id } });
  }
}

export const clienteService = new ClienteService();
