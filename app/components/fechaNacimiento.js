import { esMayorDeEdad } from "@/lib/constants";

const dos = (n) => String(n).padStart(2, "0");

// Une día/mes/año de los selects del registro. Devuelve { iso: "AAAA-MM-DD" }
// si la fecha existe y la persona tiene 18 años o más, o { error } si no;
// con algún campo vacío, { iso: "" } sin error (lo cubre `required`).
export function validarFechaNacimiento(dia, mes, anio) {
  if (!dia || !mes || !anio) return { iso: "" };
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
  if (fecha.getMonth() !== Number(mes) - 1) return { iso: "", error: "Esa fecha no existe." };
  const iso = `${anio}-${dos(mes)}-${dos(dia)}`;
  if (!esMayorDeEdad(iso)) return { iso: "", error: "Debes ser mayor de 18 años." };
  return { iso };
}
