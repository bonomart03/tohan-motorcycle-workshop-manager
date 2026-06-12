import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import type { AuthUser } from "../types";

// Clave compartida: React Query deduplica automáticamente cuando varios
// componentes (Sidebar, ProtectedRoute) llaman al mismo queryKey
const SESSION_KEY = ["session"] as const;

export function useAuth() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user = null, isLoading } = useQuery<AuthUser | null>({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      const { data } = await authApi.me();
      return data.data;
    },
    retry: false,       // Un 401 no es un error transitorio, no reintentar
    staleTime: Infinity, // No re-fetch automático; la sesión la actualizamos nosotros
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then((r) => r.data.user),
    onSuccess: (loggedUser) => {
      qc.setQueryData(SESSION_KEY, loggedUser);
      navigate("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Limpia toda la caché: todos los datos son del usuario autenticado
      qc.setQueryData(SESSION_KEY, null);
      qc.clear();
      navigate("/login");
    },
  });

  return {
    user,
    loading: isLoading,
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    logout: () => logoutMutation.mutateAsync(),
  };
}
