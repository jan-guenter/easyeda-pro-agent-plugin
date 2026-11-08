/** Passive same-worker Sheet/canvas preparation. Every returned flag stays
 * false; only the original Core can use the genuine held pauses and receipts. */
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as FRAMES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyCanvasCommand as validate } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasCommand as Command, CurrentSchematicRelevanceModifyCanvasInputs as Inputs } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { currentSchematicRelevancePublicationNativeProperties as properties } from "./current-schematic-relevance-publication-native-replies.ts";
import { decodeCurrentNativeFunctionMetadata as nativeFunction } from "./current-native-function-metadata.ts";
import { decodeCurrentSchematicRelevanceModifyCmCalleeFunction as callee, requireCurrentSchematicRelevanceModifyCmCalleeDescription as description } from "./current-schematic-relevance-modify-cm-callee-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as BUS } from "./current-footprint-inverse-clock-worker-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata as busFunction } from "./current-footprint-source-function-metadata.ts";

export interface CurrentSchematicRelevanceModifyCanvasHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
interface Read { readonly id: string; readonly fields: ReturnType<typeof tuple> }
const authority = Object.freeze({ ownershipIssued: false, originalWorkerOwnerVerified: false, originalSheetVerified: false, callbackReceiverVerified: false, sourceBodyAuthorized: false, resolvingFunctionAuthorized: false, nativeTimerDeliveryVerified: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false } as const);
export interface CurrentSchematicRelevanceModifyCanvasBefore extends Readonly<typeof authority> {
  readonly enumsObjectId: string; readonly rootsObjectId: string; readonly functionsObjectId: string; readonly nativeRootsObjectId: string; readonly nativePartsObjectId: string;
  readonly iteratorObjectId: string; readonly iteratorParentsObjectId: string; readonly iteratorFunctionsObjectId: string;
  readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string;
  readonly dependencyObjectsObjectId: string; readonly dependencySnapshotObjectId: string; readonly originalRequests: number;
  readonly promiseExecutorObjectId: null; readonly timerCallbackObjectId: null; readonly resolverObjectId: null; readonly promiseObjectId: null;
  readonly functions: Readonly<Record<string, string>>; readonly nativeFunctions: Readonly<Record<string, string>>;
}
export interface CurrentSchematicRelevanceModifyCanvasDataChangeEntry extends Readonly<typeof authority> {
  readonly before: CurrentSchematicRelevanceModifyCanvasBefore; readonly frameObjectId: string; readonly callerFrameObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly originalRequests: number;
}
export interface CurrentSchematicRelevanceModifyCanvasEntry extends Readonly<typeof authority> {
  readonly before: CurrentSchematicRelevanceModifyCanvasBefore; readonly frameObjectId: string; readonly callerFrameObjectId: string;
  readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly originalRequests: number;
}
export interface CurrentSchematicRelevanceModifyCanvasConstructed extends Readonly<typeof authority> {
  readonly entry: CurrentSchematicRelevanceModifyCanvasEntry; readonly frameObjectId: string; readonly createdObjectId: string; readonly rowObjectId: string;
  readonly resolverObjectId: string; readonly promiseObjectId: string; readonly cacheRowsObjectId: string;
  readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string; readonly originalRequests: number;
}
interface Commands { readonly call: (role: string, args: readonly string[]) => Promise<unknown>; readonly props: (id: string) => Promise<unknown>; readonly read: (role: string, args: readonly string[], size?: number) => Promise<Read>; readonly frame: (id: string, role: keyof typeof FRAMES) => Promise<Read>; readonly count: () => number }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CANVAS_PREPARATION"); } }
/** Limit this one passive stage and check the original owner's current pause
 * before and after every transport await. There is no control request path. */
function commands(host: CurrentSchematicRelevanceModifyCanvasHost, input: Inputs, limit: number): Commands {
  let count = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < limit); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-canvas-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, args: readonly string[]): Promise<unknown> => { const row = CALLS.find(item => item[0] === role); need(row !== undefined && row[2] === args.length); return send(validate({ phase: "modify-canvas-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.worker.nativeObjectId, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, args: readonly string[], size?: number): Promise<Read> => { const id = capture(await call(role, args)); return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  const frame = async (callFrameId: string, role: keyof typeof FRAMES): Promise<Read> => { const id = capture(await send(validate({ phase: "modify-canvas-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }))); let size = 12; if (role === "enums") { size = 2; } else if (role === "constructed") { size = 3; } else if (role === "onChangeCaller") { size = 14; } return Object.freeze({ id, fields: tuple(await props(id), size) }); };
  return { call, props, read, frame, count: (): number => count };
}
/** Admit only the known native slot-bearing kinds. The private empty iterator
 * is never advanced, and its state does not prove an application iterator. */
function record(input: unknown, actual: ReturnType<typeof tuple>[number]): void {
  const value = properties(input); const internal = value.internalProperties ?? [], names = internal.map(item => item.name);
  if (actual.type === "function") { return; }
  if (actual.subtype === "map" || actual.subtype === "set") { need(names.length === 2 && names.includes("[[Prototype]]") && names.includes("[[Entries]]")); return; }
  if (actual.subtype === "promise") { need(actual.className === "Promise" && value.result.length === 0 && names.length === 3 && names[0] === "[[Prototype]]" && internal[1]?.name === "[[PromiseState]]" && internal[1].value.value === "pending" && internal[2]?.name === "[[PromiseResult]]" && internal[2].value.type === "undefined"); return; }
  if (actual.subtype === "iterator") { need(actual.className === "MapIterator" && value.result.length === 0 && names.length === 5 && names[0] === "[[Prototype]]" && internal[1]?.name === "[[IteratorHasMore]]" && internal[1].value.value === false && internal[2]?.name === "[[IteratorIndex]]" && internal[2].value.value === 0 && internal[3]?.name === "[[IteratorKind]]" && internal[3].value.value === "entries" && internal[4]?.name === "[[Entries]]" && internal[4].value.description === "Array(0)"); return; }
  need(actual.type === "object" && (actual.subtype === undefined || actual.subtype === "array") && names.every(name => name === "[[Prototype]]"));
}
/** Expand only after old descriptor and ordered-collection guards still pass.
 * Each candidate/prototype is metadata-qualified before following its fields. */
function graph(c: Commands, initialQualified: string, initialSnapshot: string, original: () => Promise<void>, maxStages: number = REQUESTS.stages): Readonly<{ qualify: (id: string) => Promise<void>; unchanged: () => Promise<void>; qualified: () => string; snapshot: () => string }> {
  let objects = 0, qualified = initialQualified, snapshot = initialSnapshot, stages = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("same", [snapshot, qualified])); await original(); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= maxStages); let candidate = id;
    for (let wave = 0; wave < REQUESTS.prototypeWaves; wave += 1) {
      await unchanged(); const fresh = await c.read("novel", [candidate, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= REQUESTS.objects); for (const actual of fresh.fields) { record(await c.props(handle(actual)), actual); }
      await unchanged(); const merged = await c.read("merge", [qualified, fresh.id]), parents = await c.read("parents", [fresh.id, merged.id]);
      await unchanged(); const next = await c.read("snapshot", [merged.id]); await unchanged(); qualified = merged.id; snapshot = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_CANVAS_PROTOTYPE_BOUND");
  };
  return { qualify, unchanged, qualified: (): string => qualified, snapshot: (): string => snapshot };
}
/** Native constructors may own unused static/Symbol fields; preserve them in
 * the complete seal while qualifying only the actual constructor recipe. */
function constructor(input: unknown, actual: ReturnType<typeof tuple>[number] | undefined, name: "Promise" | "Symbol"): void {
  need(actual?.type === "function" && actual.description === `function ${name}() { [native code] }`); const value = properties(input); const fields = new Map(value.result.map(item => [item.name, item]));
  for (const [key, expected] of [["name", name], ["length", name === "Promise" ? 1 : 0]] as const) { const row = fields.get(key); need(row?.value?.value === expected && row.writable === false && row.configurable && !row.enumerable); }
  const prototype = fields.get("prototype"); need(prototype?.value?.type === "object" && prototype.writable === false && !prototype.configurable && !prototype.enumerable);
  const internals = value.internalProperties ?? []; need(internals.length === 2 && internals[0]?.name === "[[Prototype]]" && internals[0].value.description === "function () { [native code] }" && internals[1]?.name === "[[Scopes]]" && internals[1].value.description === "Scopes[0]");
}
/** Native metadata and the subsequent JS reference proof are independent;
 * matching a function description alone cannot authorize its invocation. */
async function native(c: Commands, actual: ReturnType<typeof tuple>[number] | undefined, name: string, arity: number): Promise<string> { need(actual?.type === "function" && actual.description === `function ${name}() { [native code] }`); nativeFunction(await c.props(handle(actual)), { name, arity, constructor: false }); return handle(actual); }
/** Keep the current ordered post-CM roster, including peer documents and the
 * selected unique-ID Set, instead of adopting another collection baseline. */
function collections(c: Commands, input: Inputs, qualified: () => string): () => Promise<void> { return async (): Promise<void> => { truth(await c.call("collection-same", [input.cmDelta.collectionSnapshotObjectId, input.cmDelta.collectionsObjectId, input.cmBefore.nativeMethodsObjectId, qualified()])); }; }
/** Reprove original native dependencies whose application containers have not
 * changed before publishCanvas. This never reuses an expired handler frame. */
async function dependencies(c: Commands, input: Inputs): Promise<void> { truth(await c.call("reprove", [])); for (const packet of [input.worker, input.body]) { truth(await c.call("same", [packet.snapshotObjectId, packet.qualifiedObjectId])); } }
/** Prepare the watched existing-TEXT/no-revoke branch with empty initial cache
 * Maps/task Set. Created callbacks, resolving functions and Promise stay null. */
export async function collectCurrentSchematicRelevanceModifyCanvasBefore(host: CurrentSchematicRelevanceModifyCanvasHost, onChangeFrameId: string, input: Inputs): Promise<CurrentSchematicRelevanceModifyCanvasBefore> {
  const c = commands(host, input, REQUESTS.beforeReads); await dependencies(c, input);
  const g = graph(c, input.cmDelta.qualifiedObjectId, input.cmDelta.snapshotObjectId, async (): Promise<void> => { truth(await c.call("collection-same", [input.cmDelta.collectionSnapshotObjectId, input.cmDelta.collectionsObjectId, input.cmBefore.nativeMethodsObjectId, input.cmDelta.qualifiedObjectId])); });
  const q = g.qualified;
  const enums = await c.frame(onChangeFrameId, "enums"); await g.qualify(enums.id); truth(await c.call("enums", [enums.id, input.cmBefore.stateObjectId, input.cmEntry.frameObjectId, q()]));
  let roots = await c.read("roots", [input.worker.projectTupleObjectId, input.cmBefore.stateObjectId, input.cmBefore.rootsObjectId, input.cmEntry.frameObjectId, input.cmDelta.frameObjectId, q()], 14); await g.qualify(roots.id);
  const selected = await c.read("selected", [roots.id, input.cmEntry.frameObjectId, input.cmBefore.nativeMethodsObjectId, q()], 2); await g.qualify(selected.id);
  roots = await c.read("complete", [roots.id, selected.id, q()], 14);
  for (const id of [input.body.rootsObjectId, input.body.partsObjectId, input.body.parentsObjectId, input.body.nextObjectId]) { await g.qualify(id); }
  const constructors = await c.read("native-roots", [], 2); await g.qualify(constructors.id); constructor(await c.props(handle(constructors.fields[0])), constructors.fields[0], "Promise"); constructor(await c.props(handle(constructors.fields[1])), constructors.fields[1], "Symbol");
  const prototype = await c.read("native-prototype", [constructors.id, q()], 1); await g.qualify(prototype.id);
  const parts = await c.read("native-parts", [constructors.id, prototype.id, input.cmBefore.nativeMethodsObjectId, input.body.rootsObjectId, input.body.partsObjectId, q()], 14); await g.qualify(parts.id);
  const nativeFunctions: Record<string, string> = {};
  for (const [index, name, arity] of [[1, "resolve", 1], [2, "then", 2], [3, "get [Symbol.species]", 0], [4, "push", 1], [5, "clear", 0], [6, "delete", 1], [7, "entries", 0], [9, "values", 0], [13, "debug", 0]] as const) { nativeFunctions[name] = await native(c, parts.fields[index], name, arity); }
  const iterator = await c.read("map-iterator", [roots.id, parts.id, input.cmBefore.nativeMethodsObjectId, q()], 1); await g.qualify(iterator.id);
  const parents = await c.read("iterator-parents", [iterator.id, input.body.parentsObjectId, q()], 3); await g.qualify(parents.id);
  const iteratorFunctions = await c.read("iterator-functions", [parents.id, parts.id, q()], 2); await g.qualify(iteratorFunctions.id);
  nativeFunctions["mapNext"] = await native(c, iteratorFunctions.fields[0], "next", 0); nativeFunctions["iteratorSelf"] = await native(c, iteratorFunctions.fields[1], "[Symbol.iterator]", 0);
  const functions = await c.read("functions", [roots.id, q()], 6); await g.qualify(functions.id);
  const fn: Record<string, string> = {};
  for (const [index, role] of [[0, "sheetOnDataChange"], [1, "sheetPublishCanvas"], [2, "orderGetOrderNum"]] as const) { const actual = functions.fields[index]; need(actual?.description !== undefined); description(actual.description, role); callee(await c.props(handle(actual)), role, input.worker.scriptId); fn[role] = handle(actual); }
  for (const [index, key] of [[3, "KP.publish"], [4, "JP.broadcastPublish"], [5, "JP.post"]] as const) { const actual = functions.fields[index], row = BUS.find(item => item.key === key); need(row !== undefined && actual?.description !== undefined && Buffer.byteLength(actual.description) === row.bytes && createHash("sha256").update(actual.description).digest("hex") === row.sha256); busFunction(await c.props(handle(actual)), row, input.worker.scriptId, null); fn[key] = handle(actual); }
  truth(await c.call("proof", [roots.id, functions.id, parts.id, constructors.id, parents.id, iteratorFunctions.id, input.cmBefore.nativeMethodsObjectId, q()]));
  truth(await c.call("branch", [roots.id, input.cmBefore.nativeMethodsObjectId, parts.id, input.cmDelta.frameObjectId, q()]));
  const dependencyObjects = await c.read("dependencies", [roots.id, functions.id, parts.id, constructors.id, parents.id, iteratorFunctions.id, q()]); const dependencySnapshot = await c.read("snapshot", [dependencyObjects.id]);
  await dependencies(c, input); await g.unchanged();
  return Object.freeze({ ...authority, enumsObjectId: enums.id, rootsObjectId: roots.id, functionsObjectId: functions.id, nativeRootsObjectId: constructors.id, nativePartsObjectId: parts.id, iteratorObjectId: iterator.id, iteratorParentsObjectId: parents.id, iteratorFunctionsObjectId: iteratorFunctions.id,
    qualifiedObjectId: q(), snapshotObjectId: g.snapshot(), collectionsObjectId: input.cmDelta.collectionsObjectId, collectionSnapshotObjectId: input.cmDelta.collectionSnapshotObjectId, dependencyObjectsObjectId: dependencyObjects.id, dependencySnapshotObjectId: dependencySnapshot.id, originalRequests: c.count(), promiseExecutorObjectId: null, timerCallbackObjectId: null, resolverObjectId: null, promiseObjectId: null, functions: Object.freeze(fn), nativeFunctions: Object.freeze(nativeFunctions) });
}
/** Prove the actual Sheet receiver and all arguments before onDataChange can
 * assign its page ticket; every existing descriptor and collection stays exact. */
export async function collectCurrentSchematicRelevanceModifyCanvasDataChangeEntry(host: CurrentSchematicRelevanceModifyCanvasHost, frameId: string, callerFrameId: string, input: Inputs, before: CurrentSchematicRelevanceModifyCanvasBefore): Promise<CurrentSchematicRelevanceModifyCanvasDataChangeEntry> {
  const c = commands(host, input, REQUESTS.dataChangeReads), sameCollections = collections(c, input, (): string => before.qualifiedObjectId);
  const unchanged = async (): Promise<void> => { truth(await c.call("same", [before.snapshotObjectId, before.qualifiedObjectId])); await sameCollections(); };
  await dependencies(c, input); await unchanged(); truth(await c.call("enums", [before.enumsObjectId, input.cmBefore.stateObjectId, input.cmEntry.frameObjectId, before.qualifiedObjectId])); const frame = await c.frame(frameId, "dataChange"); const caller = await c.frame(callerFrameId, "onChangeCaller");
  truth(await c.call("data-entry", [frame.id, before.rootsObjectId, input.cmEntry.frameObjectId, input.cmDelta.frameObjectId, caller.id, before.qualifiedObjectId])); await unchanged(); await dependencies(c, input);
  return Object.freeze({ ...authority, before, frameObjectId: frame.id, callerFrameObjectId: caller.id, qualifiedObjectId: before.qualifiedObjectId, snapshotObjectId: before.snapshotObjectId, originalRequests: c.count() });
}
/** Accept only the exact one-field Sheet ticket delta and actual fresh caller
 * arguments, then bracket the new descriptor baseline by the original proof. */
export async function collectCurrentSchematicRelevanceModifyCanvasEntry(host: CurrentSchematicRelevanceModifyCanvasHost, frameId: string, callerFrameId: string, input: Inputs, before: CurrentSchematicRelevanceModifyCanvasBefore): Promise<CurrentSchematicRelevanceModifyCanvasEntry> {
  const c = commands(host, input, REQUESTS.entryReads), sameCollections = collections(c, input, (): string => before.qualifiedObjectId);
  const exact = async (): Promise<void> => { truth(await c.call("ticket-delta", [before.snapshotObjectId, before.qualifiedObjectId, before.rootsObjectId, input.cmDelta.frameObjectId])); await sameCollections(); };
  await dependencies(c, input); await exact(); truth(await c.call("enums", [before.enumsObjectId, input.cmBefore.stateObjectId, input.cmEntry.frameObjectId, before.qualifiedObjectId])); const frame = await c.frame(frameId, "entry"); const caller = await c.frame(callerFrameId, "caller");
  truth(await c.call("entry", [frame.id, caller.id, before.rootsObjectId, input.cmEntry.frameObjectId, input.cmDelta.frameObjectId, before.qualifiedObjectId]));
  truth(await c.call("proof", [before.rootsObjectId, before.functionsObjectId, before.nativePartsObjectId, before.nativeRootsObjectId, before.iteratorParentsObjectId, before.iteratorFunctionsObjectId, input.cmBefore.nativeMethodsObjectId, before.qualifiedObjectId]));
  truth(await c.call("branch", [before.rootsObjectId, input.cmBefore.nativeMethodsObjectId, before.nativePartsObjectId, input.cmDelta.frameObjectId, before.qualifiedObjectId]));
  await exact(); const snapshot = await c.read("snapshot", [before.qualifiedObjectId]); await exact(); truth(await c.call("same", [snapshot.id, before.qualifiedObjectId])); await dependencies(c, input);
  return Object.freeze({ ...authority, before, frameObjectId: frame.id, callerFrameObjectId: caller.id, qualifiedObjectId: before.qualifiedObjectId, snapshotObjectId: snapshot.id, originalRequests: c.count() });
}
/** Capture an actual post-construction block before Set.add/timer registration.
 * The old cache Map may contain only the exact new dense row; every peer stays
 * exact. Native resolver/Promise metadata supplies data, never invocation. */
export async function collectCurrentSchematicRelevanceModifyCanvasConstructed(host: CurrentSchematicRelevanceModifyCanvasHost, frameId: string, input: Inputs, before: CurrentSchematicRelevanceModifyCanvasBefore, entry: CurrentSchematicRelevanceModifyCanvasEntry, originalResolverObjectId: string): Promise<CurrentSchematicRelevanceModifyCanvasConstructed> {
  const c = commands(host, input, REQUESTS.constructedReads); host.current(); need(entry.before === before); await dependencies(c, input); truth(await c.call("same", [entry.snapshotObjectId, entry.qualifiedObjectId]));
  const frame = await c.frame(frameId, "constructed"); const created = await c.read("constructed", [frame.id, before.rootsObjectId, originalResolverObjectId, input.cmBefore.nativeMethodsObjectId, input.cmDelta.frameObjectId, entry.qualifiedObjectId], 3);
  const exact = async (): Promise<void> => { truth(await c.call("cache-delta", [before.collectionSnapshotObjectId, before.collectionsObjectId, input.cmBefore.nativeMethodsObjectId, before.rootsObjectId, created.id, input.cmDelta.frameObjectId, entry.qualifiedObjectId])); };
  const g = graph(c, entry.qualifiedObjectId, entry.snapshotObjectId, exact, 2); await g.qualify(created.id);
  await native(c, created.fields[0], "", 1);
  const row = await c.read("cache-row", [created.id, g.qualified()], 1); await g.qualify(row.id);
  truth(await c.call("constructed-proof", [created.id, row.id, before.rootsObjectId, before.nativePartsObjectId, input.cmDelta.frameObjectId, g.qualified()]));
  await g.unchanged(); const collectionSnapshot = await c.read("collection-snapshot", [before.collectionsObjectId, input.cmBefore.nativeMethodsObjectId, g.qualified()]); await g.unchanged(); await dependencies(c, input);
  return Object.freeze({ ...authority, entry, frameObjectId: frame.id, createdObjectId: created.id, rowObjectId: row.id, resolverObjectId: handle(created.fields[0]), promiseObjectId: handle(created.fields[1]), cacheRowsObjectId: handle(created.fields[2]), qualifiedObjectId: g.qualified(), snapshotObjectId: g.snapshot(), collectionsObjectId: before.collectionsObjectId, collectionSnapshotObjectId: collectionSnapshot.id, originalRequests: c.count() });
}
