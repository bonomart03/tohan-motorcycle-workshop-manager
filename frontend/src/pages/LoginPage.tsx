import { useRef, useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Road animation ────────────────────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars (fixed ratio positions so they scale on resize)
    const STARS = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random() * 0.38,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.55 + 0.1,
    }));

    // Center dashes — t: 0 = vanishing point, 1 = bottom
    const DASH_COUNT = 16;
    const dashT = Array.from({ length: DASH_COUNT }, (_, i) => i / DASH_COUNT);

    const SPEED = 0.007;
    let lastTime = 0;

    const draw = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      const W  = canvas.width;
      const H  = canvas.height;
      const vpX = W / 2;
      const vpY = H * 0.36;
      const halfTop = 22;
      const halfBot = W * 0.44;

      ctx.clearRect(0, 0, W, H);

      // ── Sky
      const sky = ctx.createLinearGradient(0, 0, 0, vpY + 8);
      sky.addColorStop(0,   "#03030b");
      sky.addColorStop(0.7, "#07071a");
      sky.addColorStop(1,   "#0d0d20");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, vpY + 8);

      // ── Ground (off-road)
      const gnd = ctx.createLinearGradient(0, vpY, 0, H);
      gnd.addColorStop(0, "#040404");
      gnd.addColorStop(1, "#0b0b0b");
      ctx.fillStyle = gnd;
      ctx.fillRect(0, vpY, W, H - vpY);

      // ── Stars
      for (const s of STARS) {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }

      // ── Horizon city-glow (warm amber)
      const hg = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, W * 0.55);
      hg.addColorStop(0,   "rgba(255,140,30,0.22)");
      hg.addColorStop(0.35,"rgba(255,100,20,0.07)");
      hg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, W, H);

      // ── Road fill
      ctx.beginPath();
      ctx.moveTo(vpX - halfTop, vpY);
      ctx.lineTo(vpX + halfTop, vpY);
      ctx.lineTo(vpX + halfBot, H);
      ctx.lineTo(vpX - halfBot, H);
      ctx.closePath();
      const rg = ctx.createLinearGradient(0, vpY, 0, H);
      rg.addColorStop(0,   "#0c0c0c");
      rg.addColorStop(0.5, "#141414");
      rg.addColorStop(1,   "#1a1a1a");
      ctx.fillStyle = rg;
      ctx.fill();

      // ── Headlight cone (clipped to road)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vpX - halfTop, vpY);
      ctx.lineTo(vpX + halfTop, vpY);
      ctx.lineTo(vpX + halfBot, H);
      ctx.lineTo(vpX - halfBot, H);
      ctx.closePath();
      ctx.clip();
      const hl = ctx.createRadialGradient(vpX, H * 1.15, 0, vpX, H * 0.5, H * 0.82);
      hl.addColorStop(0,   "rgba(255,248,200,0.14)");
      hl.addColorStop(0.4, "rgba(255,240,180,0.04)");
      hl.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = hl;
      ctx.fillRect(vpX - halfBot, vpY, halfBot * 2, H - vpY);
      ctx.restore();

      // ── Road edge lines
      ctx.save();
      ctx.shadowBlur  = 8;
      ctx.shadowColor = "rgba(255,255,255,0.35)";
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.moveTo(vpX - halfTop, vpY); ctx.lineTo(vpX - halfBot, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vpX + halfTop, vpY); ctx.lineTo(vpX + halfBot, H); ctx.stroke();
      ctx.restore();

      // ── Shoulder lines (yellow, farther out)
      const shoulderOffset = 0.12;
      const sTopOff  = halfTop  * (1 + shoulderOffset * 8);
      const sBotOff  = halfBot  * (1 + shoulderOffset);
      ctx.strokeStyle = "rgba(255,200,60,0.18)";
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.moveTo(vpX - sTopOff, vpY); ctx.lineTo(vpX - sBotOff, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vpX + sTopOff, vpY); ctx.lineTo(vpX + sBotOff, H); ctx.stroke();

      // ── Update dashes
      for (let i = 0; i < dashT.length; i++) {
        dashT[i] += SPEED * dt * (0.06 + dashT[i] * dashT[i] * 2.8);
        if (dashT[i] > 1.06) dashT[i] -= 1.06;
      }

      // ── Draw dashes
      for (const t of dashT) {
        if (t < 0.02) continue;
        const y     = vpY + (H - vpY) * t;
        const half  = halfTop + (halfBot - halfTop) * t;
        const dashW = Math.max(2, half * 0.065);
        const dashH = Math.max(2, half * 0.09);
        const alpha = Math.min(1, t * 1.6) * 0.88;
        ctx.fillStyle = `rgba(255,248,140,${alpha})`;
        ctx.fillRect(vpX - dashW / 2, y - dashH / 2, dashW, dashH);
      }

      // ── Subtle speed lines from vanishing point
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const dist  = W * 0.7;
        const x2    = vpX + Math.cos(angle) * dist;
        const y2    = vpY + Math.sin(angle) * dist;
        const grad  = ctx.createLinearGradient(vpX, vpY, x2, y2);
        grad.addColorStop(0, "rgba(255,255,255,0.025)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

// ─── Login page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = useCallback(async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setServerError(msg ?? "Credenciales inválidas.");
    }
  }, [login]);

  return (
    <div style={{
      position: "relative", width: "100%", minHeight: "100vh",
      overflow: "hidden", background: "#03030b",
    }}>
      <AnimatedBackground />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        {/* ── Navbar */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 120px",
        }}>
          <img src="/logo.jpeg" alt="Taller Tohan" style={{ height: 48, mixBlendMode: "screen" }} />
          <span style={{
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500,
          }}>
            Sistema de gestión
          </span>
        </nav>

        {/* ── Hero content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", marginTop: 10, padding: "0 20px",
        }}>
          {/* Badge + title */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 34, marginBottom: 44,
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 4px 4px 8px", borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "3px 8px", background: "#fff",
                borderRadius: 999, color: "#000",
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.35 4.65H11L8.1 6.85L9.18 10.5L6 8.4L2.82 10.5L3.9 6.85L1 4.65H4.65L6 1Z" fill="#000"/>
                </svg>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600 }}>
                  Bienvenido Iancito Tohan
                </span>
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                fontWeight: 400, color: "rgba(255,255,255,0.7)", paddingRight: 8,
              }}>
                Iniciá sesión para continuar
              </span>
            </div>

            {/* Title + subtitle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <h1 style={{
                fontFamily: "'Fustat', sans-serif",
                fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 700,
                letterSpacing: "-4.8px", lineHeight: 1,
                color: "#fff", textAlign: "center", margin: 0,
              }}>
                Taller Tohan
              </h1>
              <p style={{
                fontFamily: "'Fustat', sans-serif",
                fontSize: 20, fontWeight: 500,
                letterSpacing: "-0.4px", color: "rgba(255,255,255,0.55)",
                maxWidth: 542, textAlign: "center",
                margin: 0, lineHeight: 1.5,
              }}>
                Registrá ingresos, seguí el historial de cada vehículo y llevá el control de tu taller desde cualquier lugar.
              </p>
            </div>
          </div>

          {/* ── Login form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{
              maxWidth: 480, width: "100%",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: 18, padding: 12,
              display: "flex", flexDirection: "column", gap: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {serverError && (
              <div style={{
                background: "rgba(192,57,43,0.85)", color: "#fff",
                padding: "10px 14px", borderRadius: 10,
                fontSize: 14, fontFamily: "'Schibsted Grotesk', sans-serif",
              }}>
                {serverError}
              </div>
            )}

            {/* Email */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}>
              <label style={{
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase" as const, letterSpacing: 0.5,
              }}>Email</label>
              <input
                {...register("email")}
                type="email" autoComplete="email"
                placeholder="admin@tallertohan.com"
                style={{
                  border: "none", outline: "none",
                  fontFamily: "'Schibsted Grotesk', sans-serif",
                  fontSize: 16, color: "#000", background: "transparent", width: "100%",
                }}
              />
              {errors.email && (
                <span style={{ color: "#c0392b", fontSize: 12, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div style={{
              background: "#fff", borderRadius: 12, padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}>
              <label style={{
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase" as const, letterSpacing: 0.5,
              }}>Contraseña</label>
              <input
                {...register("password")}
                type="password" autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  border: "none", outline: "none",
                  fontFamily: "'Schibsted Grotesk', sans-serif",
                  fontSize: 16, color: "#000", background: "transparent", width: "100%",
                }}
              />
              {errors.password && (
                <span style={{ color: "#c0392b", fontSize: 12, fontFamily: "'Schibsted Grotesk', sans-serif" }}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "14px",
                background: isSubmitting ? "rgba(255,255,255,0.15)" : "#fff",
                color: isSubmitting ? "rgba(255,255,255,0.5)" : "#000",
                border: "none", borderRadius: 12,
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 16, fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Iniciando..." : "Iniciar sesión →"}
            </button>
          </form>
        </div>

        {/* ── Footer */}
        <div style={{
          padding: "1.5rem", textAlign: "center",
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontSize: 12, color: "rgba(255,255,255,0.25)",
        }}>
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/bono-martinez-8b638227a"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontWeight: 600 }}
          >
            Bonomart
          </a>
        </div>
      </div>
    </div>
  );
}
