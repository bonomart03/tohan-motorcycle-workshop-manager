import apiClient from "./client";
import type { Servicio, EstadoServicio, PaginatedResponse, ApiResponse } from "../types";

export const serviciosApi = {
  list: (page = 1, limit = 20, estado?: EstadoServicio, fechaDesde?: string, fechaHasta?: string) =>
    apiClient.get<PaginatedResponse<Servicio>>("/servicios", {
      params: {
        page,
        limit,
        ...(estado && { estado }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
      },
    }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Servicio>>(`/servicios/${id}`),

  create: (data: { vehiculoId: string; descripcion: string; kmIngreso: number }) =>
    apiClient.post<ApiResponse<Servicio>>("/servicios", data),

  update: (id: string, data: Partial<Servicio>) =>
    apiClient.patch<ApiResponse<Servicio>>(`/servicios/${id}`, data),
};
