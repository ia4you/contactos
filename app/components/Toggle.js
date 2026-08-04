"use client";

export function Toggle({ checked, onChange, label, descripcion }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0" }}>
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text)" }}>{label}</p>
        {descripcion && (
          <p style={{ marginTop: 4, fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--text-muted)" }}>
            {descripcion}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 44,
          height: 24,
          flexShrink: 0,
          background: checked ? "var(--gold)" : "#2a2a2a",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 18,
            height: 18,
            background: checked ? "var(--bg)" : "var(--text-secondary)",
            transition: "left 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
