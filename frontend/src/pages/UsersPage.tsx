import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usersApi, type CreateUserDto } from "../api/users.api";
import { Modal } from "../components/ui/Modal";
import { FormField, inputStyle, inputErrorStyle } from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

// ─── Esquema ──────────────────────────────────────────────────────────────────
const createUserSchema = z.object({
  nombre: z.string().min(2).max(100).trim(),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(128)
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número"),
  rol: z.enum(["ADMIN", "MECANICO"]),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ Solo ADMIN puede acceder — redirige si no
  if (currentUser?.rol !== "ADMIN") return <Navigate to="/" replace />;

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(1, 50),
  });

  const users = data?.data.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { rol: "MECANICO" },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      reset();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      usersApi.toggleActive(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleCreate = useCallback(
    async (data: CreateUserForm) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Gestión de Usuarios</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          + Nuevo usuario
        </button>
      </div>

      {isLoading && <p style={{ color: "#888" }}>Cargando usuarios...</p>}

      <div className="table-scroll" style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["Nombre", "Email", "Rol", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #dee2e6", textAlign: "left", fontSize: "0.85rem", color: "#555", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{u.nombre}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#555" }}>{u.email}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: 12,
                    background: u.rol === "ADMIN" ? "#fdf2e9" : "#eaf4fb",
                    color: u.rol === "ADMIN" ? "#e67e22" : "#555",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}>
                    {u.rol}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: 12,
                    background: u.activo ? "#d5f5e3" : "#fde8e8",
                    color: u.activo ? "#196f3d" : "#c0392b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  {/* No permite desactivar al propio usuario */}
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleMutation.mutate({ id: u.id, activo: !u.activo })}
                      style={{
                        padding: "0.3rem 0.7rem",
                        border: `1px solid ${u.activo ? "#e0b0b0" : "#b0d8b0"}`,
                        borderRadius: 8,
                        color: u.activo ? "#c0392b" : "#27ae60",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear usuario */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Nuevo usuario" width={480}>
        <form onSubmit={handleSubmit(handleCreate)} noValidate>
          <FormField label="Nombre completo" error={errors.nombre?.message} required>
            <input {...register("nombre")} style={errors.nombre ? inputErrorStyle : inputStyle} autoFocus />
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            <input {...register("email")} type="email" style={errors.email ? inputErrorStyle : inputStyle} />
          </FormField>
          <FormField label="Contraseña" error={errors.password?.message} required>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              style={errors.password ? inputErrorStyle : inputStyle}
            />
            <span style={{ fontSize: "0.77rem", color: "#888", display: "block", marginTop: 2 }}>
              Mínimo 8 caracteres, una mayúscula y un número.
            </span>
          </FormField>
          <FormField label="Rol" error={errors.rol?.message} required>
            <select {...register("rol")} style={{ ...inputStyle, background: "#fff" }}>
              <option value="MECANICO">Mecánico</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </FormField>

          {createMutation.error && (
            <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.6rem 0.75rem", borderRadius: 10, marginBottom: "0.75rem", fontSize: "0.88rem" }}>
              {(createMutation.error as any)?.response?.data?.message ?? "Error al crear usuario."}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} style={{ padding: "0.55rem 1.1rem", border: "1px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: "0.55rem 1.2rem", background: isSubmitting ? "#95a5a6" : "#000", color: "#fff", border: "none", borderRadius: 10, cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600 }}>
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
