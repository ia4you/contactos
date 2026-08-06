import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Sin key configurada: fallback silencioso, el cliente cae a un input
    // normal sin autocompletado en vez de mostrar un error.
    return NextResponse.json({ sugerencias: [], disponible: false });
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 3) {
    return NextResponse.json({ sugerencias: [], disponible: true });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", q);
  url.searchParams.set("components", "country:es");
  url.searchParams.set("language", "es");
  url.searchParams.set("key", apiKey);

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000));
    const res = await Promise.race([fetch(url), timeout]);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places Autocomplete error:", data.status, data.error_message);
      return NextResponse.json({ sugerencias: [], disponible: true });
    }

    const sugerencias = (data.predictions || []).map((p) => ({
      placeId: p.place_id,
      descripcion: p.description,
    }));

    return NextResponse.json({ sugerencias, disponible: true });
  } catch (err) {
    console.error("Fallo al consultar Google Places:", err.message);
    return NextResponse.json({ sugerencias: [], disponible: true });
  }
}
