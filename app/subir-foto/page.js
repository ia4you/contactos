import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { tieneAvatar } from "@/lib/fotosPerfil";
import { SubirFotoForm } from "./SubirFotoForm";

export const metadata = { title: "Sube tu foto de perfil" };

export default async function SubirFoto() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const yaTiene = await tieneAvatar({ query }, session.user.id);
  return <SubirFotoForm yaTiene={yaTiene} />;
}
