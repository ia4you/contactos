"use client";

import { useState } from "react";
import { SubInfoGeneral } from "./SubInfoGeneral";
import { SubAcercaDe } from "./SubAcercaDe";
import { SubRelaciones } from "./SubRelaciones";
import { SubSitiosWeb } from "./SubSitiosWeb";

const SUBSECCIONES = [
  { id: "general", label: "Información general" },
  { id: "acerca", label: "Acerca de" },
  { id: "relaciones", label: "Relaciones" },
  { id: "sitios", label: "Sitios web" },
];

export function TabPerfil({ usuario }) {
  const [sub, setSub] = useState("general");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 40 }} className="perfil-layout">
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {SUBSECCIONES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSub(s.id)}
            className={`nav-link-vertical ${sub === s.id ? "active" : ""}`}
            style={{ textAlign: "left" }}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: 520 }}>
        {sub === "general" && <SubInfoGeneral usuario={usuario} />}
        {sub === "acerca" && <SubAcercaDe usuario={usuario} />}
        {sub === "relaciones" && <SubRelaciones usuario={usuario} />}
        {sub === "sitios" && <SubSitiosWeb usuario={usuario} />}
      </div>
    </div>
  );
}
