import { useRef, useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";
const FADE_MS   = 250;
const FADE_TRIG = 0.55;

const loginSchema = z.object({
  email:    z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Video background ──────────────────────────────────────────────────────────
function VideoBackground() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const rafRef      = useRef<number>(0);
  const fadingOut   = useRef(false);

  const cancel = useCallback(() => cancelAnimationFrame(rafRef.current), []);

  const fadeIn = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    cancel(); fadingOut.current = false;
    const from = parseFloat(v.style.opacity || "0");
    const t0   = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / FADE_MS, 1);
      v.style.opacity = String(from + (1 - from) * p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancel]);

  const fadeOut = useCallback((cb?: () => void) => {
    const v = videoRef.current; if (!v) return;
    cancel(); fadingOut.current = true;
    const from = parseFloat(v.style.opacity || "1");
    const t0   = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / FADE_MS, 1);
      v.style.opacity = String(from * (1 - p));
      if (p < 1) { rafRef.current = requestAnimationFrame(tick); } else { cb?.(); }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancel]);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.style.opacity = "0";
    const onCan  = () => fadeIn();
    const onTime = () => {
      if (!v.duration || fadingOut.current) return;
      if (v.duration - v.currentTime <= FADE_TRIG) fadeOut();
    };
    const onEnd  = () => {
      v.style.opacity = "0"; fadingOut.current = false;
      setTimeout(() => { v.currentTime = 0; v.play().then(() => fadeIn()).catch(() => {}); }, 100);
    };
    v.addEventListener("canplay",    onCan);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended",      onEnd);
    return () => {
      v.removeEventListener("canplay",    onCan);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended",      onEnd);
      cancel();
    };
  }, [fadeIn, fadeOut, cancel]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <video
        ref={videoRef}
        src={VIDEO_URL}
        autoPlay muted playsInline
        style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "115%", height: "115%",
          objectFit: "cover", objectPosition: "top center",
          opacity: 0,
        }}
      />
    </div>
  );
}

// ─── Login page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setServerError(msg ?? "Credenciales inválidas.");
    }
  };

  return (
    <div style={{
      position: "relative", width: "100%", minHeight: "100vh",
      overflow: "hidden", background: "#f8f8f8",
    }}>
      <VideoBackground />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        {/* ── Navbar ─────────────────────────────────────────────────────────── */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 120px",
        }}>
          <span style={{
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontSize: 24, fontWeight: 600, letterSpacing: "-1.44px", color: "#000",
          }}>
            Taller Tohan
          </span>
          <span style={{
            fontFamily: "'Schibsted Grotesk', sans-serif",
            fontSize: 13, color: "rgba(0,0,0,0.4)", fontWeight: 500,
          }}>
            Sistema de gestión
          </span>
        </nav>

        {/* ── Hero content ───────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", marginTop: 10, padding: "0 20px",
        }}>
          {/* Header group */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 34, marginBottom: 44,
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 4px 4px 8px", borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "3px 8px", background: "#0e1311",
                borderRadius: 999, color: "#fff",
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.35 4.65H11L8.1 6.85L9.18 10.5L6 8.4L2.82 10.5L3.9 6.85L1 4.65H4.65L6 1Z" fill="white"/>
                </svg>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500 }}>
                  Bienvenido
                </span>
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 14,
                fontWeight: 400, color: "#000", paddingRight: 8,
              }}>
                Iniciá sesión para continuar
              </span>
            </div>

            {/* Title + subtitle */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
              <h1 style={{
                fontFamily: "'Fustat', sans-serif",
                fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 700,
                letterSpacing: "-4.8px", lineHeight: 1,
                color: "#000", textAlign: "center", margin: 0,
              }}>
                Taller Tohan
              </h1>
              <p style={{
                fontFamily: "'Fustat', sans-serif",
                fontSize: 20, fontWeight: 500,
                letterSpacing: "-0.4px", color: "#505050",
                maxWidth: 542, textAlign: "center",
                margin: 0, lineHeight: 1.5,
              }}>
                Registrá ingresos, seguí el historial de cada vehículo y llevá el control de tu taller desde cualquier lugar.
              </p>
            </div>
          </div>

          {/* ── Login form ─────────────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{
              maxWidth: 480, width: "100%",
              background: "rgba(0,0,0,0.24)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 18, padding: 12,
              display: "flex", flexDirection: "column", gap: 8,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Error */}
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
              background: "#fff", borderRadius: 12,
              padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
              <label style={{
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 11, fontWeight: 600,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase" as const, letterSpacing: 0.5,
              }}>
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@tallertohan.com"
                style={{
                  border: "none", outline: "none",
                  fontFamily: "'Schibsted Grotesk', sans-serif",
                  fontSize: 16, color: "#000", background: "transparent",
                  width: "100%",
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
              background: "#fff", borderRadius: 12,
              padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
              <label style={{
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 11, fontWeight: 600,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase" as const, letterSpacing: 0.5,
              }}>
                Contraseña
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  border: "none", outline: "none",
                  fontFamily: "'Schibsted Grotesk', sans-serif",
                  fontSize: 16, color: "#000", background: "transparent",
                  width: "100%",
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
                background: isSubmitting ? "rgba(255,255,255,0.25)" : "#000",
                color: "#fff", border: "none", borderRadius: 12,
                fontFamily: "'Schibsted Grotesk', sans-serif",
                fontSize: 16, fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Iniciando..." : "Iniciar sesión →"}
            </button>
          </form>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div style={{
          padding: "1.5rem", textAlign: "center",
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontSize: 12, color: "rgba(0,0,0,0.35)",
        }}>
          Developed by{" "}
          <a
            href="https://www.linkedin.com/in/bono-martinez-8b638227a"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(0,0,0,0.5)", textDecoration: "none", fontWeight: 600 }}
          >
            Bonomart
          </a>
        </div>
      </div>
    </div>
  );
}
