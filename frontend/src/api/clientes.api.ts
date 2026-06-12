import apiClient from "./client";
import type { Cliente, PaginatedResponse, ApiResponse } from "../types";

export const clientesApi = {
  list: (page = 1, limit = 20, search?: string) =>
    apiClient.get<PaginatedResponse<Cliente>>("/clientes", {
      params: { page, limit, ...(search && { search }) },
    }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`),

  create: (data: Omit<Cliente, "id" | "createdAt" | "updatedAt" | "vehiculos">) =>
    apiClient.post<ApiResponse<Cliente>>("/clientes", data),

  update: (id: string, data: Partial<Omit<Cliente, "id" | "createdAt" | "updatedAt">>) =>
    apiClient.patch<ApiResponse<Cliente>>(`/clientes/${id}`, data),

  delete: (id: string) => apiClient.delete(`/clientes/${id}`),
};
