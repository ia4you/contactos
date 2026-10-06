"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Pantalla obligatoria del gate de avatar (middleware.js la deja pasar y
// redirige aquí a quien no tiene foto de perfil). Si la BD dice que ya la
// tiene pero el JWT va retrasado, se refresca el token y se sale; el flag en
// sessionStorage impide cualquier bucle de redirecciones.
export function SubirFotoForm({ yaTiene }) {
  const { update } = useSession();
  const [archivo, setArchivo] = useState(null);
  const [certifico, setCertifico] = useState(false);
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    if (!yaTiene) return;
    let yaIntentado = false;
    try {
      yaIntentado = sessionStorage.getItem("avatarRefrescado") === "1";
      sessionStorage.setItem("avatarRefrescado", "1");
    } catch {}
    if (yaIntentado) return;
    update().then(() => window.location.assign("/feed"));
  }, [yaTiene, update]);

  async function enviar(e) {
    e.preventDefault();
    if (!archivo || !certifico) return;
    setSubiendo(true);
    setError("");

    const fd = new FormData();
    fd.append("file", archivo);
    fd.append("certifico", "true");
    fd.append("avatar", "true");
    const res = await fetch("/api/perfil/fotos", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSubiendo(false);
      setError(data.error || "No se pudo subir la foto.");
      return;
    }
    await update(); // refresca el claim tieneAvatar del JWT
    window.location.assign("/feed");
  }

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: "0 16px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 12 }}>
        Sube tu foto de perfil
      </h1>
      <p style={{ marginBottom: 20, fontSize: 14, opacity: 0.8 }}>
        La foto de perfil es obligatoria para usar la aplicación.
      </p>
      <form onSubmit={enviar}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          required
        />
        <label style={{ display: "flex", gap: 8, margin: "16px 0", fontSize: 13 }}>
          <input type="checkbox" checked={certifico} onChange={(e) => setCertifico(e.target.checked)} />
          Certifico que todas las personas de la foto son mayores de edad y han consentido.
        </label>
        {error && <p style={{ color: "#e07a7a", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={!archivo || !certifico || subiendo} className="foto-overlay-btn">
          {subiendo ? "Subiendo…" : "Subir foto"}
        </button>
      </form>
    </main>
  );
}
