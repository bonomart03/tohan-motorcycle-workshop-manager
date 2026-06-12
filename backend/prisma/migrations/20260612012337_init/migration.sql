-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MECANICO');

-- CreateEnum
CREATE TYPE "EstadoServicio" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'MECANICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "domicilio" TEXT NOT NULL,
    "cedula_digital" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "modelo" VARCHAR(100) NOT NULL,
    "dominio" VARCHAR(20) NOT NULL,
    "nro_chasis" VARCHAR(50) NOT NULL,
    "nro_cuadro" VARCHAR(50) NOT NULL,
    "kilometraje" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" UUID NOT NULL,
    "vehiculo_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "diagnostico" TEXT,
    "trabajos_realizados" TEXT,
    "repuestos_utilizados" TEXT,
    "costo_mano_obra" DECIMAL(10,2),
    "costo_repuestos" DECIMAL(10,2),
    "estado" "EstadoServicio" NOT NULL DEFAULT 'PENDIENTE',
    "km_ingreso" INTEGER NOT NULL,
    "km_egreso" INTEGER,
    "fecha_ingreso" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_salida" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE INDEX "clientes_dni_idx" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_dominio_key" ON "vehiculos"("dominio");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_nro_chasis_key" ON "vehiculos"("nro_chasis");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_nro_cuadro_key" ON "vehiculos"("nro_cuadro");

-- CreateIndex
CREATE INDEX "vehiculos_cliente_id_idx" ON "vehiculos"("cliente_id");

-- CreateIndex
CREATE INDEX "vehiculos_dominio_idx" ON "vehiculos"("dominio");

-- CreateIndex
CREATE INDEX "servicios_vehiculo_id_idx" ON "servicios"("vehiculo_id");

-- CreateIndex
CREATE INDEX "servicios_estado_idx" ON "servicios"("estado");

-- CreateIndex
CREATE INDEX "servicios_fecha_ingreso_idx" ON "servicios"("fecha_ingreso" DESC);

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios" ADD CONSTRAINT "servicios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
