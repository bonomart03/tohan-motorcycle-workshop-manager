import React, { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/auth.api";
import { Modal } from "../ui/Modal";
import { FormField, inputStyle, inputErrorStyle } from "../ui/FormField";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/clientes", label: "Clientes" },
  { to: "/vehiculos", label: "Vehículos" },
  { to: "/servicios", label: "Servicios" },
];

const ADMIN_ITEMS = [
  { to: "/usuarios", label: "Usuarios" },
];

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requerida."),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres.")
      .regex(/[A-Z]/, "Debe incluir una mayúscula.")
      .regex(/[0-9]/, "Debe incluir un número."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = React.memo(function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.rol === "ADMIN";
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const changePwMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setSuccessMsg("Contraseña actualizada. Cerrando sesión…");
      setTimeout(() => {
        queryClient.setQueryData(["session"], null);
        queryClient.clear();
      }, 1500);
    },
  });

  const onSubmit = useCallback(
    async (data: ChangePasswordForm) => {
      await changePwMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    [changePwMutation]
  );

  const closeModal = useCallback(() => {
    setPwModalOpen(false);
    reset();
    setSuccessMsg("");
    changePwMutation.reset();
  }, [changePwMutation, reset]);

  return (
    <aside
      className={isOpen ? "sidebar-mobile-open" : ""}
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#0e1311",
        color: "#eee",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0 0",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#fff", fontFamily: "'Schibsted Grotesk', sans-serif", letterSpacing: "-0.5px" }}>
          Taller Tohan
        </h1>
        {user && (
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Schibsted Grotesk', sans-serif" }}>
            {user.nombre} · {user.rol}
          </p>
        )}
      </div>

      {/* Navegación principal */}
      <nav style={{ flex: 1, paddingTop: "0.5rem" }}>
        {NAV_ITEMS.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "block",
              padding: "0.65rem 1.5rem",
              color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
              textDecoration: "none",
              background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
              borderLeft: `3px solid ${isActive ? "#fff" : "transparent"}`,
              fontSize: "0.9rem",
              fontFamily: "'Schibsted Grotesk', sans-serif",
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.12s",
            })}
          >
            {label}
          </NavLink>
        ))}

        {/* Sección admin */}
        {isAdmin && (
          <>
            <div style={{ padding: "1rem 1.5rem 0.4rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
              Administración
            </div>
            {ADMIN_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "0.65rem 1.5rem",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#fff" : "transparent"}`,
                  fontSize: "0.9rem",
                  fontFamily: "'Schibsted Grotesk', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.12s",
                })}
              >
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Cambiar contraseña + Logout */}
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => setPwModalOpen(true)}
          style={{
            width: "100%",
            padding: "0.55rem",
            background: "transparent",
            color: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.82rem",
            marginBottom: "0.5rem",
            fontFamily: "'Schibsted Grotesk', sans-serif",
          }}
        >
          Cambiar contraseña
        </button>
        <button
          onClick={() => logout()}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "rgba(231,76,60,0.1)",
            color: "#e74c3c",
            border: "1px solid rgba(231,76,60,0.25)",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.88rem",
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontWeight: 500,
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Footer Bonomart */}
      <div style={{ padding: "0.9rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
        <p style={{ margin: "0 0 0.3rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", fontFamily: "'Schibsted Grotesk', sans-serif" }}>
          Developed by{" "}
          <a href="https://www.linkedin.com/in/bono-martinez-8b638227a" target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 600 }}>
            Bonomart
          </a>
        </p>
      </div>

      {/* Modal cambiar contraseña */}
      <Modal open={pwModalOpen} onClose={closeModal} title="Cambiar contraseña" width={420}>
        {successMsg ? (
          <div style={{ padding: "1rem", background: "#d5f5e3", color: "#196f3d", borderRadius: 4, textAlign: "center" }}>
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Contraseña actual" error={errors.currentPassword?.message}>
              <input
                {...register("currentPassword")}
                type="password"
                autoComplete="current-password"
                style={errors.currentPassword ? inputErrorStyle : inputStyle}
              />
            </FormField>
            <FormField label="Nueva contraseña" error={errors.newPassword?.message}>
              <input
                {...register("newPassword")}
                type="password"
                autoComplete="new-password"
                style={errors.newPassword ? inputErrorStyle : inputStyle}
              />
            </FormField>
            <FormField label="Confirmar nueva contraseña" error={errors.confirmPassword?.message}>
              <input
                {...register("confirmPassword")}
                type="password"
                autoComplete="new-password"
                style={errors.confirmPassword ? inputErrorStyle : inputStyle}
              />
            </FormField>

            {changePwMutation.error && (
              <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.6rem 0.8rem", borderRadius: 4, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                {(changePwMutation.error as any)?.response?.data?.message ?? "Error al cambiar la contraseña."}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" onClick={closeModal} style={{ padding: "0.6rem 1rem", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: "0.6rem 1.2rem", background: isSubmitting ? "#95a5a6" : "#2980b9", color: "#fff", border: "none", borderRadius: 4, cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 500 }}
              >
                {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </aside>
  );
});
