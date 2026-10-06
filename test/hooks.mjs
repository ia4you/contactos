// Resuelve el alias "@/" y especificadores sin extensión (como hace Next).
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    const base = path.join(process.cwd(), spec.slice(2));
    const f = [base, base + ".js"].find((p) => existsSync(p) && p.endsWith(".js"));
    return next(pathToFileURL(f).href, ctx);
  }
  try {
    return await next(spec, ctx);
  } catch (e) {
    if (e.code === "ERR_MODULE_NOT_FOUND" || e.code === "ERR_UNSUPPORTED_DIR_IMPORT") return next(spec + ".js", ctx);
    throw e;
  }
}
