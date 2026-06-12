import axios from "axios";

// ✅ Axios con credentials: siempre envía la httpOnly cookie automáticamente
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Interceptor de respuesta: redirige al login si la sesión expiró
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Evita redirigir si ya estamos en login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
