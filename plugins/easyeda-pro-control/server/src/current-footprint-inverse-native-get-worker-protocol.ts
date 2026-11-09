/** Separate native-origin readonly GET preparation. Only immutable old program
 * bytes are shared; phases, group, marker and original ledger are independent. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_FLAGS as OLD_FLAGS, currentFootprintInverseGetWorkerCases, currentFootprintInverseGetWorkerOrder, currentFootprintInverseGetWorkerProgram, currentFootprintInverseGetWorkerTemplate, validateCurrentFootprintInverseGetWorkerCommand as oldValidate } from "./current-footprint-inverse-get-worker-protocol.ts";
import type { CurrentFootprintInverseGetWorkerCommand as OldCommand } from "./current-footprint-inverse-get-worker-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const OLD = "inverse-get-worker-", PREFIX = "inverse-native-get-worker-";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP = "easyeda-footprint-inverse-native-get-worker-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_FLAGS = Object.freeze({ ...OLD_FLAGS, objectGroup: CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP } as const);
export { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_REQUESTS as CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_REQUESTS } from "./current-footprint-inverse-get-worker-protocol.ts";
type Phase<P> = P extends `inverse-get-worker-${infer Tail}` ? `inverse-native-get-worker-${Tail}` : never;
type Native<C> = C extends { phase: infer P; params: infer Params } ? Omit<C, "phase" | "params"> & Readonly<{ phase: Phase<P>; params: Params extends { objectGroup: string } ? Omit<Params, "objectGroup"> & Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP }> : Params }> : never;
export type CurrentFootprintInverseNativeGetWorkerCommand = Readonly<Native<OldCommand>>;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_WORKER_COMMAND"); } }
/** Convert only a fully validated historical command into the new closed book. */
function fromOld(input: OldCommand): CurrentFootprintInverseNativeGetWorkerCommand {
  const c = oldValidate(input); const params = c.method === "Runtime.callFunctionOn" ? { ...c.params, objectGroup: CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP } : c.params;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The closed historical union and exact prefix/group substitution define Native<C>.
  return freezeDeep({ ...c, phase: `${PREFIX}${c.phase.slice(OLD.length)}`, params }) as CurrentFootprintInverseNativeGetWorkerCommand;
}
/** Reject foreign markers/groups before the unchanged strict old parser checks
 * every program, flag, method, field and positional reference. No caller code. */
export function validateCurrentFootprintInverseNativeGetWorkerCommand(input: unknown): CurrentFootprintInverseNativeGetWorkerCommand {
  const raw = z.looseObject({ phase: z.string().max(96), method: z.string(), params: z.record(z.string(), z.unknown()) }).parse(capture(input));
  need(raw.phase.startsWith(PREFIX));
  if (raw.method === "Runtime.callFunctionOn") { need(raw.params["objectGroup"] === CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_GROUP); }
  const params = raw.method === "Runtime.callFunctionOn" ? { ...raw.params, objectGroup: OLD_FLAGS.objectGroup } : raw.params;
  return fromOld(oldValidate({ ...raw, phase: `${OLD}${raw.phase.slice(PREFIX.length)}`, params }));
}
/** Reuse old immutable source selectors after validating this distinct book. */
export function currentFootprintInverseNativeGetWorkerProgram(input: CurrentFootprintInverseNativeGetWorkerCommand): string | null { const c = validateCurrentFootprintInverseNativeGetWorkerCommand(input); return c.method === "Runtime.callFunctionOn" ? c.params.functionDeclaration : null; }
/** The complete fixed order remains twenty-two normal requests. */
export function currentFootprintInverseNativeGetWorkerOrder(step: number): string { return `${PREFIX}${currentFootprintInverseGetWorkerOrder(step).slice(OLD.length)}`; }
/** Enumerate the native book without allocating or borrowing an original owner. */
export function currentFootprintInverseNativeGetWorkerCases(): readonly CurrentFootprintInverseNativeGetWorkerCommand[] { return Object.freeze(currentFootprintInverseGetWorkerCases().map(c => fromOld(c))); }
/** Require exact helper bytes from this route's original correlated script. */
export function qualifyCurrentFootprintInverseNativeGetWorkerHelper(input: unknown, command: CurrentFootprintInverseNativeGetWorkerCommand): void { const c = validateCurrentFootprintInverseNativeGetWorkerCommand(command), program = currentFootprintInverseNativeGetWorkerProgram(c); const raw = z.strictObject({ scriptSource: z.string().max(32_768) }).parse(capture(input)); need(program !== null && raw.scriptSource === `(${program})`); }
/** Encode the independent marker and original session without extra fields. */
export function currentFootprintInverseNativeGetWorkerWire(input: CurrentFootprintInverseNativeGetWorkerCommand, id: number, sessionId: string): CurrentFootprintInverseNativeGetWorkerCommand & Readonly<{ id: number; sessionId: string; inverseNativeGetWorker: true }> { need(Number.isSafeInteger(id) && id > 0); handle.parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseNativeGetWorkerCommand(input), id, sessionId, inverseNativeGetWorker: true }); }
/** Compare the full byte frame before exposing only fixed decoder operands. */
export function currentFootprintInverseNativeGetWorkerNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeGetWorkerCommand, sessionId: string): Readonly<Record<string, string | number>> {
  need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id;
  const c = validateCurrentFootprintInverseNativeGetWorkerCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseNativeGetWorkerWire(c, id, sessionId))}\0`);
  const fields: Record<string, string | number> = { action: "footprint-inverse-native-get-worker", requestId: id, phase: c.phase, method: c.method };
  if (c.method === "Debugger.setBreakpoint") { fields["scriptId"] = c.params.location.scriptId; } else if (c.method === "Debugger.getScriptSource") { fields["scriptId"] = c.params.scriptId; } else { fields["objectId"] = c.params.objectId; if (c.method === "Runtime.callFunctionOn") { for (const [index, arg] of c.params.arguments.entries()) { fields[`arg${String(index)}`] = arg.objectId; } } } return Object.freeze(fields);
}
/** Derive the unchanged old codec selector for a validated native command.
 * This helper shares data only and grants no historical ledger admission. */
export function currentFootprintInverseNativeGetWorkerLegacyTemplate(input: CurrentFootprintInverseNativeGetWorkerCommand): ReturnType<typeof currentFootprintInverseGetWorkerTemplate> {
  const c = validateCurrentFootprintInverseNativeGetWorkerCommand(input); const params = c.method === "Runtime.callFunctionOn" ? { ...c.params, objectGroup: OLD_FLAGS.objectGroup } : c.params;
  const old = oldValidate({ ...c, phase: `${OLD}${c.phase.slice(PREFIX.length)}`, params }); need(currentFootprintInverseGetWorkerProgram(old) === currentFootprintInverseNativeGetWorkerProgram(c)); return currentFootprintInverseGetWorkerTemplate(old);
}
