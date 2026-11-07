/** Fixed original-F2 advance. The host owns the sole original resume and all
 * actual command/source/event receipts; no arbitrary callback is invoked. */
import { CURRENT_FOOTPRINT_INVERSE_GET_RPC_ENTRY_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_GET_RPC_ENTRY_FLAGS as FLAGS, validateCurrentFootprintInverseGetRpcEntryCommand as validate } from "./current-footprint-inverse-get-rpc-entry-protocol.ts";
import type { CurrentFootprintInverseGetRpcEntryCommand as Command } from "./current-footprint-inverse-get-rpc-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RPC_ENTRY_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-get-rpc-entry-programs.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as description } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as metadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { requireCurrentFootprintInversePublicLookupGraphDescription as graphDescription, decodeCurrentFootprintInversePublicLookupGraphFunction as graphMetadata } from "./current-footprint-inverse-public-lookup-graph-replies.ts";
import { currentFootprintInverseGetRpcEntryProfile as profile, qualifyCurrentFootprintInverseGetRpcManagerSource, currentFootprintInverseGetRpcEntryScope as scope } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import type { CurrentFootprintInverseGetRpcEntryProfile as Profile } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";

export interface CurrentFootprintInverseGetRpcEntryCollectorBindings {
  readonly receipt: string; readonly roots: string; readonly context: string; readonly originalEntry: string; readonly uiScriptId: string; readonly managerScriptId: string;
  readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>;
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>;
  readonly control: (phase: "bind" | "prepared" | "armed" | "resumed" | "held" | "complete", value?: string) => Promise<void>;
  readonly f2Frame: () => string; readonly waitEntry: (breakpoint: string, profile: Profile) => Promise<string>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_GET_RPC_ENTRY_COLLECTOR"); } }
export async function collectCurrentFootprintInverseGetRpcEntry(b: CurrentFootprintInverseGetRpcEntryCollectorBindings): Promise<Readonly<{ selected: string; functions: string; scope: string; getterScope: string; entry: string; argument: string; rpc: string; profile: Profile }>> {
  const identity = currentFootprintInverseLookupIdentity(b.target);
  const props = async (objectId: string): Promise<unknown> => { b.current(); const raw = await b.request({ phase: "inverse-get-rpc-entry-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); b.current(); return raw; };
  const call = async (role: keyof typeof CALLS, refs: readonly string[], target = false): Promise<unknown> => { b.current(); const row = CALLS[role]; const args: unknown[] = refs.map(objectId => ({ objectId })); if (target) { args.push({ value: identity }); } const raw = await b.request(validate({ phase: "inverse-get-rpc-entry-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } })); b.current(); return raw; };
  const tuple = async (role: keyof typeof CALLS, refs: readonly string[], size: number): Promise<string> => result(await call(role, refs), size);
  const frame = async (role: keyof typeof EXPRESSIONS, callFrameId: string, size: number): Promise<string> => result(await b.request({ phase: "inverse-get-rpc-entry-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: EXPRESSIONS[role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } }), size);
  await b.control("bind"); qualifyCurrentFootprintInverseGetRpcManagerSource(await b.request({ phase: "inverse-get-rpc-entry-source", method: "Debugger.getScriptSource", params: { scriptId: b.managerScriptId } })); b.current(); const selected = await tuple("select", [b.roots, b.context, b.originalEntry], 4); const selectedValues = array(await props(selected), 4); for (const value of selectedValues) { properties(await props(object(value))); }
  const functions = await tuple("functions", [selected], 4), values = array(await props(functions), 4); const ctor = values[0]; const rpc = values[1]; const getBus = values[2]; need(ctor?.type === "function" && rpc?.type === "function" && getBus?.type === "function");
  const actualProfile = profile(ctor.description ?? ""), classRole = actualProfile === "ui" ? "uiBusClass" : "managerBusClass", rpcRole = actualProfile === "ui" ? "uiBusRpcCall" : "managerBusRpcCall", scriptId = actualProfile === "ui" ? b.uiScriptId : b.managerScriptId;
  description(ctor.description ?? "", classRole); metadata(await props(object(ctor)), classRole, scriptId); description(rpc.description ?? "", rpcRole); const rpcMetadata = metadata(await props(object(rpc)), rpcRole, scriptId);
  graphDescription(getBus.description ?? "", "messageBus"); const getterMetadata = graphMetadata(await props(object(getBus)), "messageBus", b.uiScriptId);
  const sourceScope = scope(await props(rpcMetadata.scopes)); const getterSourceScope = scope(await props(getterMetadata.scopes));
  const capturedScope = await tuple(actualProfile === "ui" ? "scope" : "managerScope", [sourceScope, functions], 2); array(await props(capturedScope), 2); const getterScope = await tuple("getterScope", [getterSourceScope, b.roots, selected], 2); array(await props(getterScope), 2);
  const rpcId = object(rpc); await b.control("prepared", rpcId); const breakpoint = point(await b.request({ phase: "inverse-get-rpc-entry-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: rpcId, condition: "" } })); await b.control("armed", breakpoint);
  const fresh = await frame("f2", b.f2Frame(), 2); const f2Values = array(await props(fresh), 2); const f2Argument = f2Values[1]; need(f2Argument !== undefined); properties(await props(object(f2Argument)));
  truth(await call("same", [selected, functions, capturedScope, getterScope])); truth(await call("f2", [fresh, b.originalEntry, b.roots, functions, capturedScope, getterScope], true));
  await b.request({ phase: "inverse-get-rpc-entry-resume", method: "Debugger.resume", params: {} }); const heldFrame = await b.waitEntry(breakpoint, actualProfile); b.current(); await b.control("resumed"); await b.control("held");
  const entry = await frame(actualProfile === "ui" ? "rpc" : "managerRpc", heldFrame, 5); const entryValues = array(await props(entry), 5); const argument = entryValues[2]; need(argument !== undefined); array(await props(object(argument)), 2); truth(await call("entry", [entry, selected, functions, capturedScope, getterScope], true)); await b.control("complete");
  return Object.freeze({ selected, functions, scope: capturedScope, getterScope, entry, argument: object(argument), rpc: rpcId, profile: actualProfile });
}
