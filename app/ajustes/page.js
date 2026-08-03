import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Ajustes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px",
      }}
    >
      <h1 className="heading" style={{ fontSize: 28, color: "var(--text)" }}>
        Ajustes
      </h1>
      <p style={{ marginTop: 12, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
        Próximamente.
      </p>
    </main>
  );
}
