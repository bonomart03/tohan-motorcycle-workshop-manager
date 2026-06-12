import apiClient from "./client";
import type { PaginatedResponse, ApiResponse } from "../types";

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: "ADMIN" | "MECANICO";
  activo: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  nombre: string;
  rol: "ADMIN" | "MECANICO";
}

export const usersApi = {
  list: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<User>>("/users", { params: { page, limit } }),

  create: (data: CreateUserDto) =>
    apiClient.post<ApiResponse<User>>("/users", data),

  toggleActive: (id: string, activo: boolean) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, { activo }),
};
