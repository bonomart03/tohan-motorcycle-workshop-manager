import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { JwtPayload } from "../middleware/auth";

export class AuthService {
  // ✅ Hashea con argon2id — más resistente que bcrypt a ataques GPU
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as any,
      issuer: "taller-tohan",
      audience: "taller-tohan-client",
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) throw new AppError(404, "Usuario no encontrado.");

    const valid = await this.verifyPassword(user.passwordHash, currentPassword);
    if (!valid) throw new AppError(401, "La contraseña actual es incorrecta.");

    const newHash = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  async login(email: string, password: string) {
    // ✅ Proyección explícita: selecciona solo los campos necesarios
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        nombre: true,
        rol: true,
        activo: true,
      },
    });

    // Mismo tiempo de respuesta si el usuario no existe (anti-timing attack)
    const dummyHash =
      "$argon2id$v=19$m=65536,t=3,p=4$placeholder$placeholder";
    const hash = user?.passwordHash ?? dummyHash;
    const valid = await this.verifyPassword(hash, password);

    if (!user || !valid || !user.activo) {
      throw new AppError(401, "Credenciales inválidas.");
    }

    const token = this.generateToken({
      sub: user.id,
      email: user.email,
      rol: user.rol,
    });

    // ✅ NUNCA devuelve passwordHash en la respuesta
    return {
      token,
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    };
  }
}

export const authService = new AuthService();
