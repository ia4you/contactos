import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LikesShell } from "./LikesShell";

export default async function Likes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <LikesShell usuarioId={session.user.id} />;
}
