"use client";

import { useEffect, useRef, useState } from "react";
import { FECHA_NACIMIENTO_MIN } from "@/lib/constants";
import { validarFechaNacimiento } from "./fechaNacimiento";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const ANIO_MIN = Number(FECHA_NACIMIENTO_MIN.slice(0, 4));
const ANIO_MAX = new Date().getFullYear() - 18;
const ANIOS = Array.from({ length: ANIO_MAX - ANIO_MIN + 1 }, (_, i) => ANIO_MAX - i);
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

// Fecha de nacimiento con tres selects (como la puerta de edad). Devuelve
// "AAAA-MM-DD" solo cuando la fecha existe y la persona tiene 18 años o más;
// si no, "" y un mensaje de validación nativo en el select del día. El
// servidor vuelve a comprobar la edad.
export function SelectorFecha({ leyenda, onChange }) {
  const [partes, setPartes] = useState({ dia: "", mes: "", anio: "" });
  const diaRef = useRef(null);

  useEffect(() => {
    const { iso, error = "" } = validarFechaNacimiento(partes.dia, partes.mes, partes.anio);
    diaRef.current?.setCustomValidity(error);
    onChange(iso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partes]);

  const cambiar = (campo) => (e) => setPartes((p) => ({ ...p, [campo]: e.target.value }));

  return (
    <fieldset className="fecha-selects">
      <legend className="label-field">{leyenda}</legend>
      <label>
        <span className="sr-only">Día</span>
        <select ref={diaRef} required value={partes.dia} onChange={cambiar("dia")} className="input-field">
          <option value="" disabled>Día</option>
          {DIAS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Mes</span>
        <select required value={partes.mes} onChange={cambiar("mes")} className="input-field">
          <option value="" disabled>Mes</option>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Año</span>
        <select required value={partes.anio} onChange={cambiar("anio")} className="input-field">
          <option value="" disabled>Año</option>
          {ANIOS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
