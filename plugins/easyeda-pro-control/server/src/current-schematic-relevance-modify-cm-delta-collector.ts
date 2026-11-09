/** Retain passive source-created CM state while the original onChange body
 * stays held. Only the original Core controller can authorize its continuation. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_REQUESTS as LIMIT, validateCurrentSchematicRelevanceModifyCmDeltaCommand as validate } from "./current-schematic-relevance-modify-cm-delta-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmDeltaCommand as Command } from "./current-schematic-relevance-modify-cm-delta-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { currentSchematicRelevancePublicationNativeProperties as properties, currentSchematicRelevancePublicationNativeRecord as record } from "./current-schematic-relevance-publication-native-replies.ts";
import { currentSchematicRelevanceUiPublicationCapture as capture, currentSchematicRelevanceUiPublicationHandle as handle, currentSchematicRelevanceUiPublicationTrue as truth, currentSchematicRelevanceUiPublicationTuple as tuple } from "./current-schematic-relevance-ui-publication-replies.ts";

export interface CurrentSchematicRelevanceModifyCmDeltaHost { readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentSchematicRelevanceModifyCmDeltaInputs {
  readonly nativeObjectId: string;
  readonly entryFrameObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string; readonly nativeMethodsObjectId: string;
  /** Original null handles come from a fixed inspector-owned tuple; callers
   * cannot replace absent namespace/Set provenance with a string sentinel. */
  readonly rootsObjectId: string;
}
export interface CurrentSchematicRelevanceModifyCmDeltaPrepared {
  readonly frameObjectId: string; readonly rootsObjectId: string; readonly freshObjectId: string; readonly pageSetObjectId: string; readonly qualifiedObjectId: string; readonly snapshotObjectId: string; readonly collectionsObjectId: string; readonly collectionSnapshotObjectId: string; readonly originalRequests: number;
  readonly originalReceiverVerified: false; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CM_DELTA_CAPTURE"); } }
/** Hidden collection slots require this separate ordered reader. Other new
 * records use the full descriptor-only non-Proxy qualification unchanged. */
function qualify(input: unknown, actual: ReturnType<typeof tuple>[number]): void {
  if (actual.type !== "object" || actual.subtype !== "set") { record(input, actual); return; }
  const value = properties(input); const internal = value.internalProperties ?? [];
  need(actual.className === "Set" && value.result.length === 0 && internal.length === 2 && internal[0]?.name === "[[Prototype]]" && internal[0].value.type === "object" && internal[0].value.objectId !== undefined && internal[1]?.name === "[[Entries]]" && internal[1].value.type === "object" && internal[1].value.subtype === "array" && internal[1].value.objectId !== undefined);
}
/** Count every original request and recheck custody after each await. The
 * new objects are metadata-qualified before reading any of their fields. */
export async function collectCurrentSchematicRelevanceModifyCmDelta(host: CurrentSchematicRelevanceModifyCmDeltaHost, frameId: string, input: CurrentSchematicRelevanceModifyCmDeltaInputs): Promise<CurrentSchematicRelevanceModifyCmDeltaPrepared> {
  let count = 0; let qualified = input.qualifiedObjectId; let stages = 0; let objects = 0;
  const send = async (command: Command): Promise<unknown> => { host.current(); need(count < LIMIT.reads); count += 1; const reply = await host.request(command); host.current(); return reply; };
  const props = (objectId: string): Promise<unknown> => send(validate({ phase: "modify-cm-delta-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: string, ids: readonly string[]): Promise<unknown> => { const row = CALLS.find(item => item[0] === role); need(row !== undefined && row[2] === ids.length); return send(validate({ phase: "modify-cm-delta-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: input.nativeObjectId, functionDeclaration: row[1], arguments: ids.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); };
  const read = async (role: string, ids: readonly string[], length?: number): Promise<Readonly<{ id: string; values: ReturnType<typeof tuple> }>> => { const id = capture(await call(role, ids)); return Object.freeze({ id, values: tuple(await props(id), length) }); };
  const grow = async (id: string): Promise<void> => {
    stages += 1; need(stages <= LIMIT.stages); let candidate = id;
    for (let depth = 0; depth < LIMIT.prototypeWaves; depth += 1) {
      const fresh = await read("novel", [candidate, qualified]); if (fresh.values.length === 0) { return; } objects += fresh.values.length; need(objects <= LIMIT.objects);
      for (const value of fresh.values) { qualify(await props(handle(value)), value); }
      const next = await read("merge", [qualified, fresh.id]); const parents = await read("parents", [fresh.id, next.id]); qualified = next.id; candidate = parents.id;
    }
    throw new Error("SCH_MODIFY_CM_DELTA_PROTOTYPE_BOUND");
  };
  // Before's original roots tuple carries actual nulls; use it directly.
  const frameObjectId = capture(await send(validate({ phase: "modify-cm-delta-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: frameId, expression: CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES.onChange, returnByValue: false, includeCommandLineAPI: false } })));
  tuple(await props(frameObjectId), 14);
  const fresh = await read("opaque", [frameObjectId, input.rootsObjectId, input.entryFrameObjectId, qualified], 3); await grow(fresh.id);
  const page = await read("page", [input.rootsObjectId, input.entryFrameObjectId, fresh.id, qualified], 1); await grow(page.id);
  const exact = async (): Promise<void> => {
    truth(await call("descriptors", [input.snapshotObjectId, input.qualifiedObjectId, qualified, input.rootsObjectId, fresh.id, page.id, frameObjectId, input.entryFrameObjectId]));
    truth(await call("collections", [input.collectionsObjectId, input.collectionSnapshotObjectId, qualified, input.rootsObjectId, page.id, input.entryFrameObjectId, input.nativeMethodsObjectId]));
  };
  await exact(); const snapshot = await read("snapshot", [qualified]); const collectionState = await read("collection-snapshot", [input.collectionsObjectId, page.id, input.nativeMethodsObjectId, qualified], 2); await exact(); host.current();
  return Object.freeze({ frameObjectId, rootsObjectId: input.rootsObjectId, freshObjectId: fresh.id, pageSetObjectId: page.id, qualifiedObjectId: qualified, snapshotObjectId: snapshot.id, collectionsObjectId: handle(collectionState.values[0]), collectionSnapshotObjectId: handle(collectionState.values[1]), originalRequests: count, originalReceiverVerified: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false });
}
