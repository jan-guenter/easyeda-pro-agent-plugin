/** Fixed structural profile routing only. No terminal semantics or authority. */
import { isRecord } from "./core.ts";
import { reconstructClosedSymbolTerminalPredecessor } from "./closed-symbol-terminal-shape.ts";
import { reconstructClosedSymbolAgedTerminalPredecessor } from "./closed-symbol-aged-terminal-shape.ts";

export function reconstructProfiledClosedSymbolTerminalPredecessor(stored: unknown, envelope: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(envelope)) { throw new Error("Terminal profile object required."); }
  const descriptor = Object.getOwnPropertyDescriptor(envelope, "profile");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("Terminal own data profile required."); }
  const profile: unknown = descriptor.value;
  if (profile === "easyeda-pro-control.closed-symbol-terminal.v1") {
    return reconstructClosedSymbolTerminalPredecessor(stored, envelope);
  }
  if (profile === "easyeda-pro-control.closed-symbol-terminal.v2") {
    return reconstructClosedSymbolAgedTerminalPredecessor(stored, envelope);
  }
  throw new Error("Terminal profile is not supported.");
}
