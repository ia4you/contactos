import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { FeedShell } from "./FeedShell";

export default async function Feed() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { rows } = await query(
    `SELECT id, nick, profile_type, island FROM users WHERE id = $1`,
    [session.user.id]
  );
  const usuario = rows[0];
  if (!usuario) redirect("/login");

  const { rows: fotos } = await query(
    `SELECT filename FROM photos WHERE user_id = $1 AND is_avatar = true AND status = 'approved' LIMIT 1`,
    [session.user.id]
  );

  return <FeedShell usuario={usuario} avatarFilename={fotos[0]?.filename ?? null} />;
}
