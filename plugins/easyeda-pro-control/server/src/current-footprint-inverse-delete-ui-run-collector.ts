/** Reprove passive object state, then prove actual lexicals only while the
 * original entry event remains held. No runtime authority is issued. */
import type { CurrentFootprintInverseDeleteCollateralReceipt as Collateral } from "./current-footprint-inverse-delete-collateral-collector.ts";
import { currentFootprintInverseDeleteCollateralRunPause as pause } from "./current-footprint-inverse-delete-collateral-run-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-delete-ui-run-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_REQUESTS as LIMIT, validateCurrentFootprintInverseDeleteUiRunCommand as validate } from "./current-footprint-inverse-delete-ui-run-protocol.ts";
import type { CurrentFootprintInverseDeleteUiRunCommand as Command, CurrentFootprintInverseDeleteUiRunRole as Role } from "./current-footprint-inverse-delete-ui-run-protocol.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceDescription as description, decodeCurrentFootprintInversePublicServiceFunction as metadata, requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { qualifyCurrentFootprintInversePreferenceRemoval } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_SOURCE as REMOVAL } from "./current-footprint-inverse-public-preferences-source.ts";

interface Bindings { readonly receipt: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
interface Tuple { readonly id: string; readonly values: readonly Remote[] }
export interface CurrentFootprintInverseDeleteUiRunBindings extends Bindings { readonly collateral: Collateral; readonly rowGuard: string; readonly preferenceRoots: string; readonly scriptId: string }
export interface CurrentFootprintInverseDeleteUiRunPrepared { readonly module: string; readonly proof: string; readonly ja: string; readonly p4: string; readonly yy: string; readonly removal: string; readonly liveLexicalsProved: false; readonly collateralComplete: false; readonly preferenceRemovalAuthorized: false; readonly runtimeAuthorityIssued: false }
export interface CurrentFootprintInverseDeleteUiRunEntryBindings extends Bindings { readonly prepared: CurrentFootprintInverseDeleteUiRunPrepared; readonly role: Role; readonly event: unknown; readonly sessionId: string; readonly scriptId: string; readonly breakpointId: string; readonly ja: string | null }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_UI_RUN_PROOF"); } }
function lane(b: Bindings, maximum: number): Readonly<{ send: (command: Command) => Promise<unknown>; props: (id: string) => Promise<unknown>; call: (role: keyof typeof CALLS, refs: readonly string[]) => Promise<unknown>; tuple: (role: keyof typeof CALLS, refs: readonly string[], size: number) => Promise<Tuple>; inspect: (id: string, size: number, skipRoot?: boolean) => Promise<Tuple> }> {
  let count = 0;
  const send = async (input: Command): Promise<unknown> => { b.current(); count += 1; need(count <= maximum); const command = validate(input); const raw = await b.request(command); b.current(); return raw; };
  const props = (id: string): Promise<unknown> => send({ phase: "inverse-delete-ui-run-properties", method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const call = (role: keyof typeof CALLS, refs: readonly string[]): Promise<unknown> => { const row = CALLS[role]; return send(validate({ phase: "inverse-delete-ui-run-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: row.program, arguments: refs.map(objectId => ({ objectId })), returnByValue: row.byValue } })); };
  const inspect = async (id: string, size: number, skipRoot = false): Promise<Tuple> => { const values = array(await props(id), size); for (const [index, value] of values.entries()) { if (!(skipRoot && index === 0) && (value.type === "function" || value.type === "object" && value.subtype !== "null")) { properties(await props(object(value))); } } return Object.freeze({ id, values }); };
  const tuple = async (role: keyof typeof CALLS, refs: readonly string[], size: number): Promise<Tuple> => inspect(result(await call(role, refs), size), size);
  return Object.freeze({ send, props, call, tuple, inspect });
}
/** Build a fresh row/tab guard without retaining or reading virtual scope
 * mirrors. The original host must retain the function and object provenance. */
export async function collectCurrentFootprintInverseDeleteUiRun(b: CurrentFootprintInverseDeleteUiRunBindings): Promise<Readonly<CurrentFootprintInverseDeleteUiRunPrepared>> {
  const io = lane(b, LIMIT.preparation.normalMaximum); const frame = array(await io.props(b.collateral.frame), 12); const functions: string[] = [];
  for (const [index, role] of [[0, "componentLogDispatch"], [1, "componentLog"], [2, "sourcePath"], [3, "closeTargetTab"], [4, "tabId"]] as const) { const fn = frame[index]; need(fn?.type === "function" && typeof fn.description === "string"); description(fn.description, role); const id = object(fn); metadata(await io.props(id), role, b.scriptId); functions.push(id); }
  const enumObject = frame[10], removal = frame[9]; need(removal?.type === "function" && removal.description === REMOVAL.source && enumObject?.type === "object" && enumObject.subtype !== "null"); const removalId = object(removal); qualifyCurrentFootprintInversePreferenceRemoval(await io.props(removalId), b.scriptId); properties(await io.props(object(enumObject)));
  const module = await io.tuple("module", [b.collateral.module, b.rowGuard, b.preferenceRoots], 4); const c = b.collateral;
  const proof = await io.tuple("proof", [module.id, c.roots, c.members, c.containers, c.lists, c.rows], 5); truth(await io.call("reprove", [proof.id])); b.current();
  const [ja, p4, , yy] = functions; need(ja !== undefined && p4 !== undefined && yy !== undefined); return Object.freeze({ module: module.id, proof: proof.id, ja, p4, yy, removal: removalId, liveLexicalsProved: false, collateralComplete: false, preferenceRemovalAuthorized: false, runtimeAuthorityIssued: false });
}
/** Inspect only one actual original entry. An Inspector mirror retained by an
 * earlier preparation cannot substitute for this fresh frame projection. */
export async function collectCurrentFootprintInverseDeleteUiRunEntry(b: CurrentFootprintInverseDeleteUiRunEntryBindings): Promise<Readonly<{ role: Role; ja: string | null; entryLexicalsMatch: true; collateralComplete: false; runtimeAuthorityIssued: false }>> {
  b.current(); const held = pause(b.event, b.role, b.sessionId, b.scriptId, b.breakpointId); need(held.returnPromise === null && (b.role === "p4" ? b.ja !== null : b.ja === null)); const io = lane(b, LIMIT[b.role].normalMaximum);
  const raw = await io.send({ phase: "inverse-delete-ui-run-frame", role: b.role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: held.frame, expression: EXPRESSIONS[b.role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } });
  const frame = await io.inspect(result(raw, b.role === "yy" ? 5 : 7), b.role === "yy" ? 5 : 7, true); let ja: string | null = null;
  if (b.role === "ja") { const tuple = await io.tuple("ja", [frame.id, b.prepared.module, b.prepared.proof], 3); ja = tuple.id; }
  else { const third = b.role === "p4" ? b.ja : b.prepared.proof; need(third !== null); truth(await io.call(b.role, [frame.id, b.prepared.module, third])); }
  b.current(); return Object.freeze({ role: b.role, ja, entryLexicalsMatch: true, collateralComplete: false, runtimeAuthorityIssued: false });
}
