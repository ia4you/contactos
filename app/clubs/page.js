import { query } from "@/lib/db";
import { ClubsShell } from "./ClubsShell";

export default async function ClubsPage({ searchParams }) {
  const { rows: clubs } = await query(
    `SELECT id, nombre, slug, isla, descripcion, horario, foto1, destacado
       FROM clubs
      WHERE activo = true
      ORDER BY destacado DESC, id ASC`
  );

  return <ClubsShell clubs={clubs} proximamenteSlug={searchParams?.club} />;
}
