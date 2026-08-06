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

  const { rows: activos } = await query(
    `SELECT u.id, u.nick, u.profile_type, u.last_active, u.show_last_seen,
            (SELECT filename FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved' LIMIT 1) AS avatar_filename
       FROM users u
      WHERE u.island = $2
        AND u.id != $1
        AND u.deleted_at IS NULL
        AND u.last_active > now() - interval '24 hours'
        AND EXISTS (SELECT 1 FROM photos WHERE user_id = u.id AND is_avatar = true AND status = 'approved')
        AND NOT EXISTS (SELECT 1 FROM blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = u.id) OR (bl.blocker_id = u.id AND bl.blocked_id = $1))
      ORDER BY u.last_active DESC
      LIMIT 4`,
    [session.user.id, usuario.island]
  );

  return (
    <FeedShell
      usuario={usuario}
      avatarFilename={fotos[0]?.filename ?? null}
      activosIsla={activos.length >= 2 ? activos : []}
    />
  );
}
