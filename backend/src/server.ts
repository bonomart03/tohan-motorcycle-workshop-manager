import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

async function bootstrap() {
  await prisma.$connect();
  logger.info("Conexión con base de datos establecida.");

  const server = app.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`Entorno: ${process.env.NODE_ENV ?? "development"}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Señal ${signal} recibida. Cerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info("Servidor cerrado correctamente.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  logger.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
