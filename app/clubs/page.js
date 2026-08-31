import { query } from "@/lib/db";
import { ClubsShell } from "./ClubsShell";

// La consulta a clubs requiere BD, que no está disponible durante `next
// build` (fuera de la red docker donde vive el contenedor de Postgres) —
// forzarlo a dinámico evita que el build intente prerenderizar esta ruta de
// forma estática (mismo motivo que app/sitemap.js).
export const dynamic = "force-dynamic";

export default async function ClubsPage({ searchParams }) {
  const { rows: clubs } = await query(
    `SELECT id, nombre, slug, isla, descripcion, horario, foto1, destacado
       FROM clubs
      WHERE activo = true
      ORDER BY destacado DESC, id ASC`
  );

  return <ClubsShell clubs={clubs} proximamenteSlug={searchParams?.club} />;
}
