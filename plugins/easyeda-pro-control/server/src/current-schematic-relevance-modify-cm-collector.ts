/** Passive original CM graph observations. Data snapshots and source handles
 * confer no worker body, timer, modification, persistence or Save authority. */
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_REQUESTS as REQUESTS, decodeCurrentSchematicRelevanceModifyCmPayload as capturePayload, validateCurrentSchematicRelevanceModifyCmCommand as validate } from "./current-schematic-relevance-modify-cm-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmCommand as Command, CurrentSchematicRelevanceModifyCmInputs as Inputs } from "./current-schematic-relevance-modify-cm-protocol.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { currentSchematicRelevancePublicationNativeProperties as properties } from "./current-schematic-relevance-publication-native-replies.ts";
import { decodeCurrentSchematicRelevanceModifyCmCalleeFunction as callee, requireCurrentSchematicRelevanceModifyCmCalleeDescription as description } from "./current-schematic-relevance-modify-cm-callee-replies.ts";
import type { CurrentSchematicRelevanceModifyCmCalleeRole as CalleeRole } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import { decodeCurrentSchematicRelevanceModifyTicketCallee as ticketCallee } from "./current-schematic-relevance-modify-ticket-replies.ts";
import { decodeCurrentNativeFunctionMetadata as nativeFunction } from "./current-native-function-metadata.ts";
import { decodeCurrentGeneratedSyncCallee as callbackCallee } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as STRUCTURE } from "./current-schematic-relevance-modify-structure-source.ts";

export interface CurrentSchematicRelevanceModifyCmHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
interface Read { readonly id: string; readonly fields: ReturnType<typeof tuple> }
const authority = Object.freeze({ ownershipIssued: false, originalWorkerOwnerVerified: false, originalConsistencyVerified: false, callbackReceiverVerified: false, bodyAuthorized: false, cancellationAuthorized: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false } as const);
export interface CurrentSchematicRelevanceModifyCmBefore extends Readonly<typeof authority> {
  readonly rootsObjectId: string; readonly stateObjectId: string; readonly functionsObjectId: string; readonly nativeMethodsObjectId: string;
  readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string;
  readonly selectedObjectId: string; readonly selectedDetailsObjectId: string; readonly consistencyManagerObjectId: string; readonly nodeObjectId: string; readonly oldLastObjectId: string;
  readonly uniqueIdsObjectId: string; readonly uniqueNamespaceObjectId: string | null; readonly uniquePageSetObjectId: string | null; readonly documentMapObjectId: string;
  readonly sheetObjectId: string; readonly sheetPageObjectId: string; readonly orderTreeObjectId: string; readonly selectedOrderObjectId: string | null;
  readonly remoteChangeObjectId: string; readonly onChangeObjectId: string; readonly nativeCallObjectId: string;
  readonly functions: Readonly<Record<string, string>>; readonly nativeMethods: Readonly<Record<string, string>>; readonly originalRequests: number;
}
export interface CurrentSchematicRelevanceModifyCmEntry extends Readonly<typeof authority> {
  readonly before: CurrentSchematicRelevanceModifyCmBefore; readonly frameObjectId: string; readonly callerFrameObjectId: string;
  readonly entryObjectId: string; readonly staticsObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string;
  readonly functions: Readonly<Record<string, string>>; readonly originalRequests: number;
}
interface Commands { readonly call: (role: string, args: readonly string[]) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly read: (role: string, args: readonly string[], size?: number) => Promise<Read>; readonly frame: (frameId: string, role: "entry" | "caller") => Promise<Read>; readonly count: () => number }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CM_PREPARATION"); } }
/** Distinguish a captured null/undefined value from a missing or copied handle. */
const nullable = (value: ReturnType<typeof tuple>[number] | undefined): string | null => value?.type === "undefined" || value?.subtype === "null" ? null : handle(value);
/** Charge only the fixed passive vocabulary and retain original host custody
 * across every transport await, including both fresh call-frame captures. */
function commands(host: CurrentSchematicRelevanceModifyCmHost, input: Inputs, limit: number): Commands {
  let count = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < limit); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-cm-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, args: readonly string[]): Promise<unknown> => { const row = CALLS.find(item => item[0] === role); need(row !== undefined && row[2] === args.length); return send(validate({ phase: "modify-cm-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.worker.nativeObjectId, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, args: readonly string[], size?: number): Promise<Read> => { const id = capture(await call(role, args)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const frame = async (callFrameId: string, role: "entry" | "caller"): Promise<Read> => { const expression = role === "entry" ? "[this,e,t,s,r,i,n,a,o,c,l,u,h,p,d,m,At,EE]" : "[this,s]"; const id = capture(await send(validate({ phase: "modify-cm-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression, returnByValue: false, includeCommandLineAPI: false } }))); return Object.freeze({ id, fields: tuple(await props(id), role === "entry" ? 18 : 2) }); };
  return { call, props, read, frame, count: (): number => count };
}
/** Permit native collection internal slots only for a complete separate
 * ordered reader; every other selected non-callable object is descriptor data. */
function record(input: unknown, actual: ReturnType<typeof tuple>[number]): void {
  const metadata = properties(input), names = metadata.internalProperties?.map(item => item.name) ?? [];
  if (actual.type === "function") { return; }
  if (actual.type === "object" && (actual.subtype === "map" || actual.subtype === "set")) { need(names.length === 2 && names.includes("[[Prototype]]") && names.includes("[[Entries]]")); return; }
  need(actual.type === "object" && (actual.subtype === undefined || actual.subtype === "array") && names.every(name => name === "[[Prototype]]"));
}
/** Extend a baseline only after its descriptors and original ordered
 * collections still match. Unknown fields and Symbols remain in each seal. */
function graph(c: Commands, initialQualified: string, initialSnapshot: string, priorCollections: (() => Promise<void>) | null = null, maxStages: number = REQUESTS.stages): Readonly<{ qualify: (id: string) => Promise<void>; unchanged: () => Promise<void>; qualified: () => string; snapshot: () => string }> {
  let objects = 0, qualified = initialQualified, snapshot = initialSnapshot, stages = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same", [snapshot, qualified])); if (priorCollections !== null) { await priorCollections(); } };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= maxStages); let candidate = id;
    for (let wave = 0; wave < REQUESTS.prototypeWaves; wave += 1) {
      await unchanged(); const fresh = await c.read("novel", [candidate, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects);
      for (const value of fresh.fields) { record(await c.props(handle(value)), value); }
      await unchanged(); const merged = await c.read("merge", [qualified, fresh.id]), parents = await c.read("parents", [fresh.id, merged.id]);
      await unchanged(); const next = await c.read("snapshot", [merged.id]); await unchanged(); qualified = merged.id; snapshot = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_CM_PROTOTYPE_BOUND");
  };
  return { qualify, unchanged, qualified: (): string => qualified, snapshot: (): string => snapshot };
}
const nativeProfiles = [null, null, null, null, ["get", 1], ["has", 1], ["forEach", 1], ["get size", 0], ["set", 2], ["has", 1], ["add", 1], ["forEach", 1], ["get size", 0], ["forEach", 1], ["includes", 1], ["isExtensible", 1], ["setTimeout", 1], ["clearTimeout", 0]] as const;
const nativeNames = ["mapConstructor", "mapPrototype", "setConstructor", "setPrototype", "mapGet", "mapHas", "mapForEach", "mapSize", "mapSet", "setHas", "setAdd", "setForEach", "setSize", "arrayForEach", "arrayIncludes", "isExtensible", "setTimeout", "clearTimeout"] as const;
const roles = ["jaConstructor", "cmBaseConstructor", "remoteChange", "getDoctype", "setDoctype", "setMaxTicket", "getUnique", "getIsLocalChange", "getIsPendChange", "setDocMaxTicket", "publishChange", "sheetOnDataChange", "sheetPublishCanvas", "orderHas", "orderGetOrderNum"] as const;
/** Native constructor provenance is descriptor/source data. Unused static and
 * Symbol fields are retained by the complete seal and never invoked. */
function constructorMetadata(input: unknown, actual: ReturnType<typeof tuple>[number], name: "Map" | "Set" | "Object"): void {
  need(actual.type === "function" && actual.description === `function ${name}() { [native code] }`);
  const data = properties(input), fields = new Map(data.result.map(item => [item.name, item]));
  for (const [key, expected] of [["name", name], ["length", name === "Object" ? 1 : 0]] as const) { const row = fields.get(key); need(row?.value?.value === expected && row.writable === false && !row.enumerable && row.configurable); }
  const proto = fields.get("prototype"); need(proto?.value?.type === "object" && proto.writable === false && !proto.enumerable && !proto.configurable);
  const parts = new Map(data.internalProperties?.map(item => [item.name, item.value])); need(parts.size === 2 && parts.get("[[Prototype]]")?.description === "function () { [native code] }" && parts.get("[[Scopes]]")?.description === "Scopes[0]");
}
/** Match source and actual V8 location without constructing a class, invoking
 * a method, or treating its descriptive handle as an original receiver. */
async function sourceFunction(c: Commands, actual: ReturnType<typeof tuple>[number], role: CalleeRole, scriptId: string): Promise<void> { need(actual.type === "function" && actual.description !== undefined); description(actual.description, role); callee(await c.props(handle(actual)), role, scriptId); }
/** Preserve the original pending publication data while avoiding the expired
 * handler callFrameId; only its retained descriptor and payload objects recur. */
async function original(c: Commands, input: Inputs): Promise<void> {
  truth(await c.call("reprove", []));
  for (const packet of [input.worker, input.body, input.event]) { truth(await c.call("same", [packet.snapshotObjectId, packet.qualifiedObjectId])); }
  const actual = await c.call("event-payload", [input.event.readObjectId, input.worker.busTupleObjectId, input.worker.nativeMembersObjectId, input.event.qualifiedObjectId]);
  // Payload remains a primitive original-Core comparison, not a new issuer.
  const value = capturePayload(actual); need(value.length === input.payload.length && value.every((item, index) => Object.is(item, input.payload[index])));
}
/** Retain complete original descriptors and ordered native collections before
 * the batch can call CM. No application getter/method or timer is invoked. */
export async function collectCurrentSchematicRelevanceModifyCmBefore(host: CurrentSchematicRelevanceModifyCmHost, input: Inputs): Promise<CurrentSchematicRelevanceModifyCmBefore> {
  const c = commands(host, input, REQUESTS.beforeReads); await original(c, input);
  let collectionBaseline: Readonly<{ snapshot: string; collections: string; native: string; qualified: string }> | null = null;
  const collectionUnchanged = async (): Promise<void> => { if (collectionBaseline !== null) { truth(await c.call("collection-same", [collectionBaseline.snapshot, collectionBaseline.collections, collectionBaseline.native, collectionBaseline.qualified])); } };
  const g = graph(c, input.event.qualifiedObjectId, input.event.snapshotObjectId, collectionUnchanged), q = g.qualified;
  const sealCollections = async (collections: string, native: string): Promise<string> => { await g.unchanged(); const next = await c.read("collection-snapshot", [collections, native, q()]); await g.unchanged(); collectionBaseline = { snapshot: next.id, collections, native, qualified: q() }; await collectionUnchanged(); return next.id; };
  const roots = await c.read("batch", [input.worker.projectTupleObjectId, input.batchFrameObjectId, input.event.frameObjectId, input.event.readObjectId, q()], 3); await g.qualify(roots.id);
  const constructors = await c.read("native-roots", [], 3); await g.qualify(constructors.id);
  for (const [index, name] of [[0, "Map"], [1, "Set"], [2, "Object"]] as const) { const value = constructors.fields[index]; need(value !== undefined); constructorMetadata(await c.props(handle(value)), value, name); }
  const prototypes = await c.read("native-prototypes", [constructors.id, q()], 2); await g.qualify(prototypes.id);
  const native = await c.read("native", [constructors.id, q()], 18); await g.qualify(native.id);
  const nativeMethods: Record<string, string> = {};
  for (const [index, name] of nativeNames.entries()) { const value = native.fields[index]; need(value !== undefined); nativeMethods[name] = handle(value); const profile = nativeProfiles[index]; if (profile !== null && profile !== undefined) { need(value.type === "function" && value.description === `function ${profile[0]}() { [native code] }`); nativeFunction(await c.props(handle(value)), { name: profile[0], arity: profile[1], constructor: false }); } }
  const order = await c.read("order", [roots.id, q()], 1); await g.qualify(order.id);
  const state = await c.read("state", [input.worker.projectTupleObjectId, roots.id, q()], 18); await g.qualify(state.id);
  const functions = await c.read("functions", [input.worker.projectTupleObjectId, state.id, q()], 19); await g.qualify(functions.id);
  const fn: Record<string, string> = {};
  for (const [index, role] of roles.entries()) { const value = functions.fields[index]; need(value !== undefined); await sourceFunction(c, value, role, input.worker.scriptId); fn[role] = handle(value); }
  for (const [index, role] of [[15, "localPublishTicket"], [16, "canWsPublish"]] as const) { const value = functions.fields[index]; need(value !== undefined); ticketCallee(await c.props(handle(value)), value, role, input.worker.scriptId); fn[role] = handle(value); }
  const call = functions.fields[18], callback = functions.fields[17]; need(callback?.description !== undefined && call?.description === "function call() { [native code] }");
  need(Buffer.byteLength(callback.description) === STRUCTURE.onChange.bytes && createHash("sha256").update(callback.description).digest("hex") === STRUCTURE.onChange.sha256);
  callbackCallee(await c.props(handle(callback)), { name: "", arity: 13, regular: false, async: false, lineNumber: STRUCTURE.onChange.lineNumber, columnNumber: STRUCTURE.onChange.columnNumber }, input.worker.scriptId);
  nativeFunction(await c.props(handle(call)), { name: "call", arity: 1, constructor: false }); fn["onChange"] = handle(callback);
  const references = await c.read("references", [state.id, q()]); await g.qualify(references.id);
  const sets = await c.read("unique-sets", [state.id, q()]); await g.qualify(sets.id);
  let collections = await c.read("collections", [state.id, q(), native.id]); await g.qualify(collections.id);
  let collectionSnapshotId = await sealCollections(collections.id, native.id);
  let members = await c.read("map-members", [collections.id, native.id, q()]); await g.qualify(members.id);
  collections = await c.read("document-maps", [state.id, collections.id, native.id, q()]);
  collectionSnapshotId = await sealCollections(collections.id, native.id);
  members = await c.read("map-members", [collections.id, native.id, q()]); await g.qualify(members.id);
  const nodes = await c.read("nodes", [state.id, collections.id, native.id, q()]); await g.qualify(nodes.id);
  const lists = await c.read("node-lists", [state.id, native.id, q()]); await g.qualify(lists.id);
  const selected = await c.read("selected", [state.id, native.id, input.event.readObjectId, q()], 3); await g.qualify(selected.id);
  const details = await c.read("selected-details", [selected.id, state.id, input.event.readObjectId, q()], 5); await g.qualify(details.id);
  const delta = await c.read("delta-roots", [input.worker.projectTupleObjectId, state.id, selected.id, details.id, q()], 8); await g.qualify(delta.id);
  await g.unchanged();
  truth(await c.call("before-proof", [input.worker.projectTupleObjectId, state.id, functions.id, native.id, delta.id, input.event.readObjectId, q()]));
  truth(await c.call("branch", [state.id, native.id, delta.id, details.id, input.event.readObjectId, q()]));
  await original(c, input); await g.unchanged(); truth(await c.call("collection-same", [collectionSnapshotId, collections.id, native.id, q()]));
  return Object.freeze({ ...authority, rootsObjectId: delta.id, stateObjectId: state.id, functionsObjectId: functions.id, nativeMethodsObjectId: native.id,
    collectionsObjectId: collections.id, collectionSnapshotObjectId: collectionSnapshotId, qualifiedObjectId: q(), snapshotObjectId: g.snapshot(),
    selectedObjectId: selected.id, selectedDetailsObjectId: details.id, consistencyManagerObjectId: handle(delta.fields[0]), nodeObjectId: handle(delta.fields[1]), oldLastObjectId: handle(delta.fields[2]),
    uniqueIdsObjectId: handle(delta.fields[3]), uniqueNamespaceObjectId: nullable(delta.fields[4]), uniquePageSetObjectId: nullable(delta.fields[5]), documentMapObjectId: handle(selected.fields[2]),
    sheetObjectId: handle(state.fields[1]), sheetPageObjectId: handle(details.fields[3]), orderTreeObjectId: handle(state.fields[11]), selectedOrderObjectId: nullable(details.fields[4]),
    remoteChangeObjectId: handle(functions.fields[2]), onChangeObjectId: handle(callback), nativeCallObjectId: handle(call), functions: Object.freeze(fn), nativeMethods: Object.freeze(nativeMethods), originalRequests: c.count() });
}
/** Reprove the complete original baseline before accepting actual remoteChange
 * formals and its fresh batch caller. At and EE come only from that held frame. */
export async function collectCurrentSchematicRelevanceModifyCmEntry(host: CurrentSchematicRelevanceModifyCmHost, frameId: string, callerFrameId: string, input: Inputs, before: CurrentSchematicRelevanceModifyCmBefore): Promise<CurrentSchematicRelevanceModifyCmEntry> {
  const c = commands(host, input, REQUESTS.entryReads); await original(c, input);
  const collections = async (): Promise<void> => { truth(await c.call("collection-same", [before.collectionSnapshotObjectId, before.collectionsObjectId, before.nativeMethodsObjectId, before.qualifiedObjectId])); };
  truth(await c.call("same", [before.snapshotObjectId, before.qualifiedObjectId])); await collections();
  const g = graph(c, before.qualifiedObjectId, before.snapshotObjectId, collections, REQUESTS.entryStages);
  const frame = await c.frame(frameId, "entry"); const caller = await c.frame(callerFrameId, "caller");
  const entry = await c.read("entry", [frame.id, caller.id, input.batchFrameObjectId, before.stateObjectId, input.event.readObjectId, g.qualified()], 2); await g.qualify(entry.id);
  for (const [index, role] of [[0, "nodeConstructor"], [1, "ticketCompare"]] as const) { const value = entry.fields[index]; need(value !== undefined); await sourceFunction(c, value, role, input.worker.scriptId); }
  const statics = await c.read("statics", [entry.id, g.qualified()], 7); await g.qualify(statics.id);
  const fn: Record<string, string> = { ...before.functions, nodeConstructor: handle(entry.fields[0]), ticketCompare: handle(entry.fields[1]) };
  for (const [index, role] of (["nodeFind", "nodeGetFirstTicket", "nodeGetHead", "nodeInsert", "nodePreForEach", "nodeGetLength", "nodeRemove"] as const).entries()) { const value = statics.fields[index]; need(value !== undefined); await sourceFunction(c, value, role, input.worker.scriptId); fn[role] = handle(value); }
  truth(await c.call("before-proof", [input.worker.projectTupleObjectId, before.stateObjectId, before.functionsObjectId, before.nativeMethodsObjectId, before.rootsObjectId, input.event.readObjectId, g.qualified()]));
  truth(await c.call("branch", [before.stateObjectId, before.nativeMethodsObjectId, before.rootsObjectId, before.selectedDetailsObjectId, input.event.readObjectId, g.qualified()]));
  await original(c, input); await g.unchanged();
  return Object.freeze({ ...authority, before, frameObjectId: frame.id, callerFrameObjectId: caller.id, entryObjectId: entry.id, staticsObjectId: statics.id, qualifiedObjectId: g.qualified(), snapshotObjectId: g.snapshot(), functions: Object.freeze(fn), originalRequests: c.count() });
}
