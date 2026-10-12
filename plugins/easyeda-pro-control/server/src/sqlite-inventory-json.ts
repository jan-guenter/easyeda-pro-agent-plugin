/** Built-in-only canonical JSON equivalent of the maintained core helpers. */
import { createHash } from "node:crypto";

export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function stable(value: unknown): unknown {
  if (Array.isArray(value)) { return value.map((item: unknown) => stable(item)); }
  if (!record(value)) { return value; }
  return Object.fromEntries(Object.keys(value).toSorted().map((key) => [key, stable(value[key])]));
}
export function canonicalJson(value: unknown): string {
  const encoded = JSON.stringify(stable(value));
  if (encoded === undefined) { throw new TypeError("Canonical JSON requires a JSON-serializable root value."); }
  return encoded;
}
export function sha256Json(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
