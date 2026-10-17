import { CURRENT_SYMBOL_STARTUP_STAGES } from "./current-symbol-startup-guard.ts";

const phases = new Set(["HOST", "DEADLINE", "PERMISSION", "BEFORE", "CLOCK_BEFORE", "FINAL_BEFORE", "MUTATION",
  "POST_MUTATION", "ACK", "CLOCK_AFTER", "AFTER", "TIMEOUT", "TIMEOUT_CLEANUP", "CLEANUP"]);
const guards = new Set(["PROJECT", "STARTUP", "ACTOR", "RPC", "HOST", "DATE"]);
const startupStages = new Set<string>(CURRENT_SYMBOL_STARTUP_STAGES);

/** Only complete facade-owned tokens are public. Native error text, arbitrary
 * suffixes and payloads never enter this diagnostic or grant retry authority.
 * MUTATION includes RPC rejection; POST_MUTATION proves only that it returned.
 */
export function currentSymbolWriteFailureCategory(message: unknown): string | null {
  if (typeof message !== "string" || message.length > 160) { return null; }
  const [prefix, phase, guard, startup, ...extra] = message.split(":");
  if (prefix !== "CURRENT_SYMBOL_WRITE_REFUSED" || phase === undefined || !phases.has(phase) || extra.length > 0) { return null; }
  if (guard === undefined) { return `current-symbol-write:${phase.toLowerCase().replaceAll("_", "-")}`; }
  if (phase === "TIMEOUT" || phase === "TIMEOUT_CLEANUP" || phase === "CLEANUP" || !guards.has(guard) ||
      (guard === "STARTUP" ? startup === undefined || !startupStages.has(startup) : startup !== undefined)) { return null; }
  return `current-symbol-write:${phase.toLowerCase().replaceAll("_", "-")}:${guard.toLowerCase()}${startup === undefined ? "" : `:${startup}`}`;
}
