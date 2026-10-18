"use client";

// Logo + «Contactos Liberales» (cabecera, puerta de edad y pie). El nombre
// visible es aria-hidden porque ya lo dice el alt del logo.
export function Marca() {
  return (
    <span className="marca">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-nuevo.png"
        alt="Contactos Liberales"
        className="marca__logo"
        width={371}
        height={221}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
      <span className="marca__nombre" aria-hidden="true">
        Contactos Liberales
      </span>
    </span>
  );
}
