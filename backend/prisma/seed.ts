import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando datos iniciales...");

  // ✅ Usuario admin con contraseña hasheada — cambiar en producción
  const passwordHash = await argon2.hash("CambiarEnProduccion123!", {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@tallertohan.com" },
    update: {},
    create: {
      email: "admin@tallertohan.com",
      passwordHash,
      nombre: "Administrador",
      rol: "ADMIN",
    },
  });

  console.log(`Usuario admin creado: ${admin.email}`);
  console.log("IMPORTANTE: Cambiar contraseña en producción!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
