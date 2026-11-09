/** Original server errors only. No caller Error can be registered, and neither
 * a message, property, clone nor Proxy can reproduce this private identity. */
const domains = new Set(["PCB_DIAGNOSTIC_OWNER", "FOOTPRINT_MAIN_CONSTRUCTION", "SCHEMATIC_RELEVANCE_WORKFLOW", "SCHEMATIC_RELEVANCE_COORDINATOR", "SCHEMATIC_RELEVANCE_DISPLAY_SETUP", "PCB_VIA_WORKFLOW", "PCB_VIA_COORDINATOR"]);
const issued = new WeakMap<object, string>();
export function createOriginalSourceError(domain: unknown, detail: unknown): Error {
  if (typeof domain !== "string" || !domains.has(domain) || typeof detail !== "string") { throw new TypeError("Original source error arguments refused."); }
  const message = `${domain}_${detail}`; const error = new Error(message);
  if (/^[A-Z][A-Z\d_]{1,127}$(?![\s\S])/u.test(message)) { issued.set(error, message); }
  return error;
}
export function originalSourceErrorCode(value: unknown): string | null {
  return value !== null && typeof value === "object" ? issued.get(value) ?? null : null;
}
