import Image from "next/image";
import Link from "next/link";

export function AuthLayout({ activo, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "calc(100vh - 81px)",
      }}
      className="auth-layout"
    >
      <div style={{ position: "relative", overflow: "hidden" }} className="auth-layout__imagen">
        <Image
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
              "linear-gradient(180deg, rgba(14,10,11,0.35) 0%, rgba(14,10,11,0.55) 60%, rgba(14,10,11,0.92) 100%)",
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
            fontSize: 24,
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
              borderBottom: "1px solid rgba(201,161,90,0.18)",
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
                textTransform: "uppercase",
                fontSize: 13,
                letterSpacing: 1.5,
                textDecoration: "none",
                color: activo === "login" ? "var(--gold)" : "var(--text-secondary)",
                borderBottom: activo === "login" ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              Acceder
            </Link>
            <Link
              href="/registro"
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0 0 16px",
                fontFamily: "var(--font-body)",
                textTransform: "uppercase",
                fontSize: 13,
                letterSpacing: 1.5,
                textDecoration: "none",
                color: activo === "registro" ? "var(--gold)" : "var(--text-secondary)",
                borderBottom: activo === "registro" ? "2px solid var(--gold)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              Crear perfil
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
