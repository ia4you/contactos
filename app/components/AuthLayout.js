import Image from "next/image";
import Link from "next/link";
import { RegistroCTA } from "./RegistroCTA";

export function AuthLayout({ activo, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "calc(100dvh - var(--header-h))",
      }}
      className="auth-layout"
    >
      <div style={{ position: "relative", overflow: "hidden" }} className="auth-layout__imagen">
        <Image sizes="50vw"
          src="/images/salon-lujo.png"
          alt=""
          fill
          unoptimized={false}
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, var(--veil-soft) 0%, var(--veil) 60%, var(--veil-solid) 100%)",
          }}
        />
        <p
          className="heading"
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 48,
            fontStyle: "italic",
            fontSize: 22,
            color: "var(--text)",
          }}
        >
          &ldquo;Lo que sucede entre nosotros, permanece entre nosotros.&rdquo;
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--rule)",
              marginBottom: 40,
            }}
          >
            <Link
              href="/login"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0 0 16px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: activo === "login" ? "var(--gold)" : "var(--text-secondary)",
                borderBottom: activo === "login" ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              Acceder
            </Link>
            <RegistroCTA
              location="auth_tab"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0 0 16px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: activo === "registro" ? "var(--gold)" : "var(--text-secondary)",
                borderBottom: activo === "registro" ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              Crear perfil
            </RegistroCTA>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
