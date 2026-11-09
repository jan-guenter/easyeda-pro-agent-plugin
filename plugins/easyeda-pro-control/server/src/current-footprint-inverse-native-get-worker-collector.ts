/** Native-origin GET service preparation, before any GET request. The source
 * vocabulary is shared with the old reader; runtime tokens and ledger are not. */
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_PROGRAMS as P } from "./current-footprint-inverse-get-worker-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_WORKER_REQUESTS as LIMIT, currentFootprintInverseNativeGetWorkerOrder as order, currentFootprintInverseNativeGetWorkerProgram as program, validateCurrentFootprintInverseNativeGetWorkerCommand as validate } from "./current-footprint-inverse-native-get-worker-protocol.ts";
import type { CurrentFootprintInverseNativeGetWorkerCommand as Command } from "./current-footprint-inverse-native-get-worker-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, currentFootprintCopyClockRpcV2ArrayObject as object, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseGetWorkerPoint as point, qualifyCurrentFootprintInverseGetWorkerRoots as rootsMetadata, qualifyCurrentFootprintInverseGetWorkerTask as taskMetadata } from "./current-footprint-inverse-get-worker-replies.ts";
import { currentFootprintInverseGetCallable as callable, qualifyCurrentFootprintInverseGetFunction as metadata } from "./current-footprint-inverse-get-source.ts";
import { currentFootprintInverseDeleteRpcScope as scope, currentFootprintInverseDeleteRpcCallable as serviceCallable, qualifyCurrentFootprintInverseDeleteRpcFunction as serviceMetadata } from "./current-footprint-inverse-delete-rpc-metadata.ts";
import { currentFootprintInverseGetNativeCallable as nativeCallable, qualifyCurrentFootprintInverseGetNativeFunction as nativeMetadata } from "./current-footprint-inverse-get-native-metadata.ts";
import { currentFootprintInverseDeleteRpcTrue as truth } from "./current-footprint-inverse-delete-rpc-protocol.ts";

export interface CurrentFootprintInverseNativeGetWorkerPrepared { readonly roots: string; readonly capture: string; readonly link: string; readonly bound: string; readonly point: string; readonly normal: number; readonly helpers: number; readonly getInvoked: false; readonly runtimeJobIssued: false }
export interface CurrentFootprintInverseNativeGetWorkerPreparationBindings { readonly source: string; readonly scriptId: string; readonly prelude: string; readonly intrinsics: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown>; readonly qualifyHelper: (command: Command) => Promise<void> }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_WORKER_PREPARATION"); } }

/** Follow the actual original GET registration, receiver, queue, callback and
 * getNeedData/getData source. Metadata and helper receipt precede each later
 * traversal. The only installed breakpoint is its fixed first-call site. */
export async function collectCurrentFootprintInverseNativeGetWorker(b: CurrentFootprintInverseNativeGetWorkerPreparationBindings): Promise<Readonly<CurrentFootprintInverseNativeGetWorkerPrepared>> {
  let helpers = 0, normal = 0;
  /** Spend a fixed slot before transport and join its original helper source
   * before returning data for the next descriptor traversal. */
  const send = async (input: Command): Promise<unknown> => { b.current(); const c = validate(input); need(c.phase === order(normal)); normal += 1; need(normal <= LIMIT.normal); const raw = await b.request(c); b.current(); if (program(c) !== null) { helpers += 1; need(helpers <= LIMIT.helpers); await b.qualifyHelper(c); b.current(); } return raw; };
  const props = (role: string, objectId: string): Promise<unknown> => send(validate({ phase: `inverse-native-get-worker-properties-${role}`, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: keyof typeof P, objectId: string, refs: readonly string[]): Promise<unknown> => send(validate({ phase: `inverse-native-get-worker-${role}`, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: P[role], arguments: refs.map(id => ({ objectId: id })), returnByValue: role === "reprove" } }));
  const roots = result(await call("roots", b.prelude, [b.intrinsics]), 15); rootsMetadata(await props("roots", roots));
  const queueTuple = result(await call("queue", roots, []), 3); const queueFields = array(await props("queue-tuple", queueTuple), 3); const queueValue = queueFields.get("1"); need(queueValue?.type === "object" && queueValue.subtype === "array" && queueValue.className === "Array" && queueValue.description === "Array(1)");
  const queue = object(queueFields, 1), values = array(await props("queue", queue), 1); const task = values.get("0"); need(task?.type === "object" && task.subtype === undefined && task.objectId !== undefined); taskMetadata(await props("task", task.objectId));
  const capture = result(await call("capture", roots, [queueTuple]), 10); const selected = array(await props("capture", capture), 10);
  for (const [slot, role, propertyRole] of [[5, "getNeedData", "get-need-data"], [8, "getData", "get-data"]] as const) { const id = callable({ result: selected.get(String(slot)) }, role); metadata(await props(propertyRole, id), role, b.scriptId, b.source); }
  const callback = serviceCallable({ result: selected.get("4") }, "service"); const callbackScopes = serviceMetadata(await props("service", callback), "service", b.scriptId, b.source); const callbackScope = scope(await props("service-scopes", callbackScopes), "service");
  const link = result(await call("service", callbackScope, [b.intrinsics, capture]), 3); const links = array(await props("link", link), 3); const handler = callable({ result: links.get("1") }, "handler");
  const handlerScopes = metadata(await props("handler", handler), "handler", b.scriptId, b.source); const handlerScope = scope(await props("handler-scopes", handlerScopes), "handler");
  const bound = result(await call("handler", handlerScope, [b.intrinsics, capture, link]), 4); need(array(await props("bound", bound), 4).get("3")?.type === "function");
  for (const [slot, role] of [[6, "debug"], [7, "shift"]] as const) { const id = nativeCallable({ result: selected.get(String(slot)) }, role); nativeMetadata(await props(role, id), role); }
  truth(await call("reprove", capture, [link, bound])); const breakpoint = point(await send(validate({ phase: "inverse-native-get-worker-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: b.scriptId, lineNumber: 109, columnNumber: 34_537 }, condition: "" } })), b.scriptId);
  b.current(); need(normal === LIMIT.normal && helpers === LIMIT.helpers); return Object.freeze({ roots, capture, link, bound, point: breakpoint, normal, helpers, getInvoked: false, runtimeJobIssued: false });
}
