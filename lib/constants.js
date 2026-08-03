export const ISLANDS = [
  { value: "gran_canaria", label: "Gran Canaria" },
  { value: "tenerife", label: "Tenerife" },
  { value: "lanzarote", label: "Lanzarote" },
  { value: "fuerteventura", label: "Fuerteventura" },
  { value: "la_palma", label: "La Palma" },
  { value: "la_gomera", label: "La Gomera" },
  { value: "el_hierro", label: "El Hierro" },
  { value: "la_graciosa", label: "La Graciosa" },
];

export const PROFILE_TYPES = [
  { value: "pareja", label: "Pareja" },
  { value: "chica", label: "Chica" },
  { value: "chico", label: "Chico" },
];

export const LOOKING_FOR_OPTIONS = [
  { value: "parejas", label: "Parejas" },
  { value: "chicas", label: "Chicas" },
  { value: "chicos", label: "Chicos" },
  { value: "amistad", label: "Amistad" },
];

export const AVATAR_PLACEHOLDER = {
  pareja: "/images/avatar-pareja.png",
  chica: "/images/avatar-chica.png",
  chico: "/images/avatar-chico.png",
};

// Rango del selector de fecha de nacimiento: hasta 18 años cumplidos
// hacia atrás (31/12 del año límite, para no excluir a quien cumple 18
// justo este año) y un límite razonable de 1930 hacia el pasado.
export const FECHA_NACIMIENTO_MAX = `${new Date().getFullYear() - 18}-12-31`;
export const FECHA_NACIMIENTO_MIN = "1930-01-01";

export function esMayorDeEdad(fechaISO) {
  if (!fechaISO) return false;
  const nacimiento = new Date(fechaISO);
  if (Number.isNaN(nacimiento.getTime())) return false;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const noHaCumplidoAun =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (noHaCumplidoAun) edad -= 1;

  return edad >= 18;
}
