import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message ?? "Error al iniciar sesión."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          background: "#fff",
          padding: "2.5rem",
          borderRadius: 8,
          width: 380,
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>Taller Tohan</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
          Inicia sesión para continuar
        </p>

        {serverError && (
          <div
            style={{
              background: "#fde8e8",
              color: "#c0392b",
              padding: "0.75rem",
              borderRadius: 4,
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {serverError}
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
          {errors.email && (
            <span style={{ color: "#c0392b", fontSize: "0.8rem" }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
            Contraseña
          </label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid #ccc",
              borderRadius: 4,
              boxSizing: "border-box",
            }}
          />
          {errors.password && (
            <span style={{ color: "#c0392b", fontSize: "0.8rem" }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: isSubmitting ? "#95a5a6" : "#2980b9",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: "1rem",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
