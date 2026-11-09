/** Separate finite accounting for one original English JL receiver. Neither
 * ordered JSON nor all 332 consumed calls proves JL's normal return. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "./current-main-startup-library-catalog.ts";
import { compareCurrentMainStartupLibrarySql } from "./current-main-startup-library-sql.ts";

const selected = z.object({ recognized: z.literal(true), role: z.literal("jl"), site: z.literal("run"),
  scriptIndex: z.number().int().min(0).max(331), sql: z.string().min(1).max(11_377),
  parametersEmpty: z.literal(true), transactionDepth: z.literal(0), designWriteGrant: z.literal(false),
  nativeCompletionProven: z.literal(false), normalReturnProven: z.literal(false) }).strict();
export const currentMainStartupLibrarySelectionSchema = z.union([z.object({ recognized: z.literal(false) }).strict(), selected]);
export type CurrentMainStartupLibrarySelection = z.infer<typeof currentMainStartupLibrarySelectionSchema>;
function need(value: boolean): asserts value { if (!value) { throw new Error("MAIN_STARTUP_LIBRARY_SEQUENCE"); } }
/** Copy only own scalar data before schema traversal. A rejected Proxy or getter
 * must not execute even when the supplied packet would otherwise be invalid. */
export function captureCurrentMainStartupLibrarySelection(input: unknown): CurrentMainStartupLibrarySelection {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) && Object.getPrototypeOf(input) === Object.prototype);
  const keys = Reflect.ownKeys(input); need(keys.length === 1 || keys.length === 10);
  const copy: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string"); const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value")); const value: unknown = descriptor.value;
    need(typeof value === "string" || typeof value === "boolean" || typeof value === "number");
    Object.defineProperty(copy, key, { value, enumerable: true });
  }
  return currentMainStartupLibrarySelectionSchema.parse(copy);
}
export class CurrentMainStartupLibraryProgress {
  #bound = false; #consumed = 0;
  public bind(): void { need(!this.#bound && this.#consumed === 0); this.#bound = true; }
  /** Consume before native continuation. Failure after this point cannot refund
   * the original attempt. This object never issues a resume or retry token. */
  public consume(input: unknown): boolean {
    const packet = captureCurrentMainStartupLibrarySelection(input); if (!packet.recognized) { return false; }
    need(this.#bound && this.#consumed < SOURCE.script.chunkCount && packet.scriptIndex === this.#consumed);
    need(compareCurrentMainStartupLibrarySql(packet.scriptIndex, packet.sql, []) !== null); this.#consumed += 1; return true;
  }
  public requireAllCallsConsumed(): void { need(this.#bound && this.#consumed === SOURCE.script.chunkCount); }
  public snapshot(): Readonly<Record<string, unknown>> {
    return Object.freeze({ receiverBound: this.#bound, receiverLimit: 1, scriptCallsConsumed: this.#consumed,
      allCallsConsumed: this.#bound && this.#consumed === SOURCE.script.chunkCount, normalReturnProven: false,
      nativeCompletionProven: false, readonlySql: false, selectedProjectWriteGrant: false, retryAllowed: false });
  }
}
