import apiClient from "./client";
import type { Vehiculo, PaginatedResponse, ApiResponse } from "../types";

export const vehiculosApi = {
  list: (page = 1, limit = 20, clienteId?: string) =>
    apiClient.get<PaginatedResponse<Vehiculo>>("/vehiculos", {
      params: { page, limit, ...(clienteId && { clienteId }) },
    }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Vehiculo>>(`/vehiculos/${id}`),

  create: (data: Omit<Vehiculo, "id" | "createdAt" | "updatedAt" | "cliente">) =>
    apiClient.post<ApiResponse<Vehiculo>>("/vehiculos", data),

  update: (
    id: string,
    data: Partial<Omit<Vehiculo, "id" | "clienteId" | "createdAt" | "updatedAt">>
  ) => apiClient.patch<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, data),
};
