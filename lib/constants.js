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
