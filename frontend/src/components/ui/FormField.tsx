import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          display: "block",
          marginBottom: 4,
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "#444",
        }}
      >
        {label}
        {required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ color: "#c0392b", fontSize: "0.8rem", marginTop: 2, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// Estilos de input reutilizables
export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
};

export const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "#c0392b",
};
