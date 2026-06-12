import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onCancel,
  loading,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width={400}>
      <p style={{ margin: "0 0 1.5rem", color: "#555" }}>{message}</p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "0.55rem 1.1rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: "0.55rem 1.1rem",
            border: "none",
            borderRadius: 4,
            background: danger ? "#c0392b" : "#2980b9",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Procesando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
