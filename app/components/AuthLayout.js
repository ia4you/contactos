import Link from "next/link";
import { RegistroCTA } from "./RegistroCTA";

function estiloPestana(activa) {
  return {
    flex: 1,
    textAlign: "center",
    padding: "0 0 16px",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    letterSpacing: "0.04em",
    textDecoration: "none",
    color: activa ? "var(--gold)" : "var(--text-secondary)",
    borderBottom: activa ? "2px solid var(--gold)" : "2px solid transparent",
    marginBottom: -1,
  };
}

// Sin `activo` (recuperar contraseña) no se muestran las pestañas.
export function AuthLayout({ activo, children }) {
  return (
    <main className="auth-layout">
      <aside className="auth-layout__cita">
        <p className="auth-layout__texto">
          &ldquo;Lo que sucede entre nosotros, permanece entre nosotros.&rdquo;
        </p>
        <hr className="auth-layout__regla" />
      </aside>

      <div className="auth-layout__form">
        <div style={{ width: "100%", maxWidth: 420 }}>
          {activo && (
            <div style={{ display: "flex", borderBottom: "1px solid var(--rule)", marginBottom: 40 }}>
              <Link href="/login" style={estiloPestana(activo === "login")}>
                Acceder
              </Link>
              <RegistroCTA location="auth_tab" style={estiloPestana(activo === "registro")}>
                Crear perfil
              </RegistroCTA>
            </div>
          )}

          {children}
        </div>
      </div>
    </main>
  );
}
