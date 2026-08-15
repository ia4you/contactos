"use client";

import { useState } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUsuarios } from "./AdminUsuarios";
import { AdminDenuncias } from "./AdminDenuncias";
import { AdminBlog } from "./AdminBlog";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "usuarios", label: "Usuarios" },
  { id: "denuncias", label: "Denuncias" },
  { id: "blog", label: "Blog" },
];

export function AdminShell() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="kicker">Panel interno</p>
      <h1 className="heading" style={{ fontSize: 32, color: "var(--text)", marginTop: 6 }}>
        Administración
      </h1>

      <div className="tab-nav" style={{ marginTop: 28 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`tab-nav-item ${tab === t.id ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "usuarios" && <AdminUsuarios />}
        {tab === "denuncias" && <AdminDenuncias />}
        {tab === "blog" && <AdminBlog />}
      </div>
    </div>
  );
}
