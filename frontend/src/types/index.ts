// ─── Autenticación ────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: "ADMIN" | "MECANICO";
}

// ─── Paginación ───────────────────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  domicilio: string;
  cedulaDigital?: string;
  createdAt: string;
  updatedAt: string;
  vehiculos?: VehiculoResumen[];
}

export interface VehiculoResumen {
  id: string;
  marca: string;
  modelo: string;
  dominio: string;
  kilometraje: number;
}

export interface ServicioResumen {
  id: string;
  descripcion: string;
  estado: EstadoServicio;
  kmIngreso: number;
  kmEgreso?: number;
  fechaIngreso: string;
  fechaSalida?: string;
  costoManoObra?: number;
  costoRepuestos?: number;
}

export interface VehiculoConServicios extends VehiculoResumen {
  nroChasis: string;
  nroCuadro: string;
  servicios: ServicioResumen[];
}

export interface ClienteDetail extends Cliente {
  vehiculos: VehiculoConServicios[];
}

// ─── Vehículos ────────────────────────────────────────────────────────────────
export interface Vehiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  dominio: string;
  nroChasis: string;
  nroCuadro: string;
  kilometraje: number;
  createdAt: string;
  updatedAt: string;
  cliente?: Pick<Cliente, "id" | "nombre" | "apellido" | "dni">;
}

// ─── Servicios ────────────────────────────────────────────────────────────────
export type EstadoServicio = "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "ENTREGADO";

export interface Servicio {
  id: string;
  vehiculoId: string;
  descripcion: string;
  diagnostico?: string;
  trabajosRealizados?: string;
  repuestosUtilizados?: string;
  costoManoObra?: number;
  costoRepuestos?: number;
  estado: EstadoServicio;
  kmIngreso: number;
  kmEgreso?: number;
  fechaIngreso: string;
  fechaSalida?: string;
  createdAt: string;
  updatedAt: string;
  vehiculo?: {
    id: string;
    marca: string;
    modelo: string;
    dominio: string;
    nroChasis?: string;
    nroCuadro?: string;
    cliente?: Pick<Cliente, "id" | "nombre" | "apellido" | "dni" | "domicilio">;
  };
  mecanico?: { id: string; nombre: string };
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}
