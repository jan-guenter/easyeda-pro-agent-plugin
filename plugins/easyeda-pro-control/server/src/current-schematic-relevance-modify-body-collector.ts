/** Passive worker bus-body preconditions. The original host retains the
 * owner/context; returned native references alone cannot release a body. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS } from "./current-schematic-relevance-modify-body-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyControlCommand as validate } from "./current-schematic-relevance-modify-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyControlCommand as Command } from "./current-schematic-relevance-modify-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared as Worker } from "./current-schematic-relevance-modify-worker-collector.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";
import { currentSchematicRelevancePublicationNativeRecord as record } from "./current-schematic-relevance-publication-native-replies.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { qualifyCurrentFootprintInverseLookupNativeConstructor } from "./current-footprint-inverse-lookup-native-metadata.ts";

export interface CurrentSchematicRelevanceModifyBodyHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyBodyPrepared {
  readonly rootsObjectId: string; readonly partsObjectId: string; readonly iteratorObjectId: string; readonly parentsObjectId: string; readonly nextObjectId: string;
  readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly originalRequests: number;
  readonly ownershipIssued: false; readonly originalWorkerOwnerVerified: false; readonly bodyAuthorized: false; readonly workerAuthorized: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
export { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS } from "./current-schematic-relevance-modify-body-programs.ts";
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_BODY_PREPARATION"); } }
/** Count the original metadata lane and recheck custody after every await;
 * returned helpers can select only the fixed worker/control program table. */
function commands(host: CurrentSchematicRelevanceModifyBodyHost, worker: Worker): Readonly<{ call: (role: string, args: readonly string[]) => Promise<unknown>; props: (objectId: string) => Promise<unknown>; read: (role: string, args: readonly string[], length?: number) => Promise<Readonly<{ id: string; fields: ReturnType<typeof tuple> }>>; count: () => number }> {
  let count = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS.reads); count += 1; const result = await host.request(command); host.current(); return result; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-control-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, args: readonly string[]): Promise<unknown> => {
    const row = CALLS.find(item => item[0] === role); need(row !== undefined && row[2] === args.length);
    return send(validate({ phase: "modify-control-proof", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: worker.nativeObjectId, functionDeclaration: row[1], arguments: args.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } }));
  };
  const read = async (role: string, args: readonly string[], length?: number): Promise<Readonly<{ id: string; fields: ReturnType<typeof tuple> }>> => { const id = capture(await call(role, args)); return Object.freeze({ id, fields: tuple(await props(id), length) }); };
  return { call, props, read, count: (): number => count };
}
/** Qualify the selected native callable without invoking it or inferring
 * native identity from its displayed function description alone. */
function nativeFunction(input: unknown, actual: ReturnType<typeof tuple>[number] | undefined, name: string): void { need(actual?.type === "function" && actual.description === `function ${name}() { [native code] }` && actual.subtype === undefined); decodeCurrentNativeFunctionMetadata(input, { name, arity: 0, constructor: false }); }
/** Qualify the exact native console and Array-iterator recipe reached by
 * onReceivedPublish. The unsafe=true single task branch excludes cloning,
 * task removal and error logging; the original callback stays held later. */
export async function collectCurrentSchematicRelevanceModifyBody(host: CurrentSchematicRelevanceModifyBodyHost, worker: Worker): Promise<CurrentSchematicRelevanceModifyBodyPrepared> {
  const c = commands(host, worker); let qualified = worker.qualifiedObjectId; let snapshot = worker.snapshotObjectId; let stages = 0; let objects = 0;
  const unchanged = async (): Promise<void> => { truth(await c.call("worker-same", [snapshot, qualified])); };
  const qualify = async (id: string): Promise<void> => {
    stages += 1; need(stages <= CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS.stages); let candidate = id;
    for (let depth = 0; depth < CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS.prototypeWaves; depth += 1) {
      await unchanged(); const fresh = await c.read("worker-novel", [candidate, qualified]); if (fresh.fields.length === 0) { return; }
      objects += fresh.fields.length; need(objects <= CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS.objects);
      for (const value of fresh.fields) { record(await c.props(handle(value)), value); }
      await unchanged(); const merged = await c.read("worker-merge", [qualified, fresh.id]); const parents = await c.read("worker-parents", [fresh.id, merged.id]);
      await unchanged(); const next = await c.read("worker-snapshot", [merged.id]); await unchanged(); qualified = merged.id; snapshot = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_BODY_PROTOTYPE_BOUND");
  };
  truth(await c.call("worker-reprove", [])); await unchanged();
  const roots = await c.read("body-roots", [], 3); await qualify(roots.id);
  qualifyCurrentFootprintInverseLookupNativeConstructor(await c.props(handle(roots.fields[1])), roots.fields[1], "Symbol");
  const parts = await c.read("body-parts", [roots.id, qualified], 4); await qualify(parts.id);
  nativeFunction(await c.props(handle(parts.fields[0])), parts.fields[0], "debug"); nativeFunction(await c.props(handle(parts.fields[2])), parts.fields[2], "values");
  need(parts.fields[1]?.type === "symbol" && parts.fields[1].description === "Symbol(Symbol.iterator)"); await unchanged();
  const iterator = await c.read("body-iterator", [parts.id, worker.subscribedRosterObjectId], 1); await qualify(iterator.id);
  const parents = await c.read("body-parents", [iterator.id, qualified], 2); await qualify(parents.id);
  const next = await c.read("body-next", [parents.id, qualified], 1); await qualify(next.id); nativeFunction(await c.props(handle(next.fields[0])), next.fields[0], "next");
  await unchanged(); truth(await c.call("body-proof", [worker.projectTupleObjectId, worker.busTupleObjectId, worker.taskTupleObjectId, worker.functionsObjectId, worker.subscribedRosterObjectId, roots.id, parts.id, iterator.id, parents.id, next.id, qualified])); await unchanged();
  return Object.freeze({ rootsObjectId: roots.id, partsObjectId: parts.id, iteratorObjectId: iterator.id, parentsObjectId: parents.id, nextObjectId: next.id, qualifiedObjectId: qualified, snapshotObjectId: snapshot, originalRequests: c.count(), ownershipIssued: false, originalWorkerOwnerVerified: false, bodyAuthorized: false, workerAuthorized: false, modifyCompleted: false, saveAuthorized: false });
}
/** Reprove all captured dependencies immediately before the one original
 * handler continuation; a fresh snapshot never replaces this prior baseline. */
export async function reproveCurrentSchematicRelevanceModifyBody(host: CurrentSchematicRelevanceModifyBodyHost, worker: Worker, original: CurrentSchematicRelevanceModifyBodyPrepared): Promise<number> {
  const c = commands(host, worker); truth(await c.call("worker-reprove", [])); truth(await c.call("worker-same", [original.snapshotObjectId, original.qualifiedObjectId]));
  truth(await c.call("body-proof", [worker.projectTupleObjectId, worker.busTupleObjectId, worker.taskTupleObjectId, worker.functionsObjectId, worker.subscribedRosterObjectId, original.rootsObjectId, original.partsObjectId, original.iteratorObjectId, original.parentsObjectId, original.nextObjectId, original.qualifiedObjectId])); truth(await c.call("worker-same", [original.snapshotObjectId, original.qualifiedObjectId])); need(c.count() <= CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_REQUESTS.reproofReads); return c.count();
}
