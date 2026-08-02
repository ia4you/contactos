import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { PerfilForm } from "./PerfilForm";

export default async function MiPerfil() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { rows: userRows } = await query(
    `SELECT id, nick, email, profile_type, island, bio, looking_for
       FROM users WHERE id = $1`,
    [session.user.id]
  );
  const usuario = userRows[0];
  if (!usuario) redirect("/login");

  const { rows: fotos } = await query(
    `SELECT id, filename, is_private, is_avatar, status, created_at
       FROM photos WHERE user_id = $1 ORDER BY created_at DESC`,
    [session.user.id]
  );

  return <PerfilForm usuario={usuario} fotosIniciales={fotos} />;
}
