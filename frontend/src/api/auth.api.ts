import apiClient from "./client";
import type { AuthUser, ApiResponse } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<null> & { user: AuthUser }>("/auth/login", {
      email,
      password,
    }),

  logout: () => apiClient.post("/auth/logout"),

  me: () => apiClient.get<ApiResponse<AuthUser>>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put<ApiResponse<null>>("/auth/password", { currentPassword, newPassword }),
};
