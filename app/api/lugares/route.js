import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ sugerencias: [], disponible: true });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "es");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "es");

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000));
    // Nominatim exige un User-Agent identificable — sin él responde 403.
    const res = await Promise.race([
      fetch(url, { headers: { "User-Agent": "contactos.turel.es/1.0" } }),
      timeout,
    ]);
    const data = await res.json();

    const sugerencias = (Array.isArray(data) ? data : []).map((r) => ({
      placeId: r.place_id,
      descripcion: r.display_name,
    }));

    return NextResponse.json({ sugerencias, disponible: true });
  } catch (err) {
    console.error("Fallo al consultar Nominatim:", err.message);
    return NextResponse.json({ sugerencias: [], disponible: true });
  }
}
