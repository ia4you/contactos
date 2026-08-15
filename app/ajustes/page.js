import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { AjustesShell } from "./AjustesShell";

export default async function Ajustes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { rows: userRows } = await query(
    `SELECT id, nick, email, profile_type, island, bio, her_bio, his_bio,
            her_birthdate, his_birthdate, looking_for, genero, orientacion, rol, verified, created_at,
            estado_relacion, sitios_web, show_in_search, show_last_seen, only_verified, nick_changed_at
       FROM users WHERE id = $1`,
    [session.user.id]
  );
  const usuario = userRows[0];
  if (!usuario) redirect("/login");

  const { rows: fotos } = await query(
    `SELECT filename FROM photos WHERE user_id = $1 AND is_avatar = true AND status = 'approved' LIMIT 1`,
    [session.user.id]
  );

  return <AjustesShell usuario={usuario} avatarFilename={fotos[0]?.filename ?? null} />;
}
