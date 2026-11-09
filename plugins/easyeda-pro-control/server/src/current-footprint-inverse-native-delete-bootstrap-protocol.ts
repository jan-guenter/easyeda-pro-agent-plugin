/** Separate native-equivalent UI reflection lane. The immutable historical
 * primitive programs and exact flags are reused; original Call/owner custody
 * and the native action remain distinct from the public SDK bootstrap. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentFootprintInverseUiOwnDataCases as priorCases, currentFootprintInverseUiOwnDataProgram as priorProgram, currentFootprintInverseUiOwnDataTemplate as priorTemplate, validateCurrentFootprintInverseUiOwnDataCommand as validatePrior } from "./current-footprint-inverse-ui-own-data-protocol.ts";
import type { CurrentFootprintInverseUiOwnDataCommand as Prior } from "./current-footprint-inverse-ui-own-data-protocol.ts";

type Rephase<C extends Prior> = C extends Prior ? Omit<C, "phase"> & Readonly<{ phase: C["phase"] extends `inverse-ui-own-data-${infer S}` ? `inverse-native-delete-bootstrap-${S}` : never }> : never;
export type CurrentFootprintInverseNativeDeleteBootstrapCommand = Readonly<Rephase<Prior>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_BOOTSTRAP_REQUESTS = Object.freeze({ normal: 19, helpers: 4, cdpRequests: 23, controls: 25, events: 4, cleanupAfterOriginalExit: 0 } as const);
const prefix = "inverse-native-delete-bootstrap-"; const before = "inverse-ui-own-data-";
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_BOOTSTRAP_COMMAND"); } }
/** Convert only a closed phase prefix before invoking the unchanged historical
 * validator. No arbitrary field, program, flag or method is admitted. */
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The unchanged strict historical schema validates every field; only its closed phase prefix is reconstructed.
export function validateCurrentFootprintInverseNativeDeleteBootstrapCommand(input: unknown): CurrentFootprintInverseNativeDeleteBootstrapCommand { const raw = z.looseObject({ phase: z.string() }).parse(capture(input)); need(raw.phase.startsWith(prefix)); const prior = validatePrior({ ...raw, phase: before + raw.phase.slice(prefix.length) }); return freezeDeep({ ...prior, phase: prefix + prior.phase.slice(before.length) }) as CurrentFootprintInverseNativeDeleteBootstrapCommand; }
/** Return a validated historical data command; this conversion transfers no
 * live origin, old Call, native ledger or reflection receipt. */
export function currentFootprintInverseNativeDeleteBootstrapPrior(input: CurrentFootprintInverseNativeDeleteBootstrapCommand): Prior { const c = validateCurrentFootprintInverseNativeDeleteBootstrapCommand(input); return validatePrior({ ...c, phase: before + c.phase.slice(prefix.length) }); }
/** Select only one of the immutable native reflection primitive programs. */
export function currentFootprintInverseNativeDeleteBootstrapProgram(c: CurrentFootprintInverseNativeDeleteBootstrapCommand): string | null { return priorProgram(currentFootprintInverseNativeDeleteBootstrapPrior(c)); }
/** Enumerate every distinct action case without extending the historical schema. */
export function currentFootprintInverseNativeDeleteBootstrapCases(): readonly CurrentFootprintInverseNativeDeleteBootstrapCommand[] { return freezeDeep(priorCases().map(c => validateCurrentFootprintInverseNativeDeleteBootstrapCommand({ ...c, phase: prefix + c.phase.slice(before.length) }))); }
/** Keep the original fixed CDP bytes, changing only the private ledger phase. */
export function currentFootprintInverseNativeDeleteBootstrapTemplate(c: CurrentFootprintInverseNativeDeleteBootstrapCommand): ReturnType<typeof priorTemplate> { const row = priorTemplate(currentFootprintInverseNativeDeleteBootstrapPrior(c)); return freezeDeep({ ...row, phase: prefix + row.phase.slice(before.length) }); }
/** Bind the fresh private command to the original accepted request/session. */
export function currentFootprintInverseNativeDeleteBootstrapWire(input: CurrentFootprintInverseNativeDeleteBootstrapCommand, id: number, sessionId: string): CurrentFootprintInverseNativeDeleteBootstrapCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeleteBootstrap: true }> { need(Number.isSafeInteger(id) && id > 0); z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u).parse(sessionId); return freezeDeep({ ...validateCurrentFootprintInverseNativeDeleteBootstrapCommand(input), id, sessionId, inverseNativeDeleteBootstrap: true }); }
/** Compare the exact original frame before extracting bounded fixed native
 * fields. A packet matching these bytes cannot acquire original Core custody. */
export function currentFootprintInverseNativeDeleteBootstrapNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeleteBootstrapCommand, sessionId: string): Readonly<Record<string, string | number>> { need(bytes.length <= 65_536 && bytes.at(-1) === 0); const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1))); const id = z.looseObject({ id: z.number().int().positive() }).parse(capture(raw)).id; const c = validateCurrentFootprintInverseNativeDeleteBootstrapCommand(input); need(bytes.toString("utf8") === `${JSON.stringify(currentFootprintInverseNativeDeleteBootstrapWire(c, id, sessionId))}\0`); const fields: Record<string, string | number> = { action: "footprint-inverse-native-delete-bootstrap", requestId: id, phase: c.phase, method: c.method }; if (c.method === "Debugger.getScriptSource") { fields["scriptId"] = c.params.scriptId; } else if ("uniqueContextId" in c.params) { fields["uniqueContextId"] = c.params.uniqueContextId; } else { fields["objectId"] = c.params.objectId; if (c.method === "Runtime.callFunctionOn") { for (const [index, arg] of c.params.arguments.entries()) { fields[`reference${String(index)}`] = arg.objectId; } } } return Object.freeze(fields); }
