import Image from "next/image";
import Link from "next/link";
import { ISLANDS, AVATAR_PLACEHOLDER } from "@/lib/constants";
import { mostrarPuntoOnline } from "@/lib/online";
import { PuntoOnline } from "../components/PuntoOnline";

const ISLAND_LABEL = Object.fromEntries(ISLANDS.map((i) => [i.value, i.label]));

export function ActivosIslaWidget({ usuarios, isla }) {
  if (!usuarios || usuarios.length < 2) return null;

  return (
    <div style={{ background: "#1c1416", border: "1px solid rgba(201,161,90,0.18)", padding: 18, marginBottom: 24 }}>
      <h3 className="heading" style={{ fontSize: 16, color: "var(--gold)" }}>
        Activos en {ISLAND_LABEL[isla]} hoy
      </h3>
      <div style={{ marginTop: 14, display: "flex", gap: 18, flexWrap: "wrap" }}>
        {usuarios.map((u) => {
          const src = u.avatar_filename ? `/uploads/${u.id}/${u.avatar_filename}` : AVATAR_PLACEHOLDER[u.profile_type];
          return (
            <Link
              key={u.id}
              href={`/perfil/${u.nick}`}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 68, textDecoration: "none" }}
            >
              <div style={{ position: "relative", width: 52, height: 52 }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border-gold)" }}>
                  <Image src={src} alt="" fill unoptimized={false} style={{ objectFit: "cover" }} />
                </div>
                {mostrarPuntoOnline(u) && <PuntoOnline />}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  color: "var(--text)",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {u.nick}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
