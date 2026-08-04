import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { AnunciosShell } from "./AnunciosShell";

export default async function Anuncios() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { rows } = await query(`SELECT id, island FROM users WHERE id = $1`, [session.user.id]);
  const usuario = rows[0];
  if (!usuario) redirect("/login");

  return <AnunciosShell usuario={usuario} />;
}
