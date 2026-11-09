/* oxlint-disable import/max-dependencies -- One readonly collector joins independent original source, native, graph and scope decoders; no decoder supplies runtime authority. */
/** Original reference inputs only. Core must correlate every actual request,
 * helper source and owner before issuing the distinct readiness token. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_MODEL_LIMIT as MODEL_LIMIT, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_PROGRAMS as PROGRAMS, currentFootprintInverseReferenceWorkerBudget, validateCurrentFootprintInverseReferenceWorkerCommand } from "./current-footprint-inverse-reference-worker-protocol.ts";
import type { CurrentFootprintInverseReferenceWorkerCommand as Command } from "./current-footprint-inverse-reference-worker-protocol.ts";
import { qualifyCurrentFootprintInverseReferenceWorkerSource } from "./current-footprint-inverse-reference-worker-source.ts";
import { qualifyCurrentFootprintInverseReferenceQueryFunction, requireCurrentFootprintInverseReferenceQueryDescription } from "./current-footprint-inverse-reference-query-source.ts";
import type { CurrentFootprintInverseReferenceQueryRole } from "./current-footprint-inverse-reference-query-source.ts";
import type { CurrentFootprintInverseReferenceQueryKind as Kind } from "./current-footprint-inverse-reference-query-job.ts";
import type { CurrentFootprintInverseReferenceData, CurrentFootprintInversePublicRowValue as Value } from "./current-footprint-inverse-public-row-data.ts";
import { currentFootprintInverseReferenceHandlerScope, currentFootprintInverseReferenceNativeCallable, qualifyCurrentFootprintInverseReferenceNativeFunction } from "./current-footprint-inverse-reference-worker-metadata.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseDeleteRpcCallable, currentFootprintInverseDeleteRpcScope, qualifyCurrentFootprintInverseDeleteRpcFunction } from "./current-footprint-inverse-delete-rpc-metadata.ts";
import { currentFootprintInverseGetCallable, qualifyCurrentFootprintInverseGetFunction } from "./current-footprint-inverse-get-source.ts";
import { currentFootprintInverseGetOuterClosure } from "./current-footprint-inverse-get-scope.ts";
import { currentFootprintInverseGetNativeCallable, qualifyCurrentFootprintInverseGetNativeFunction } from "./current-footprint-inverse-get-native-metadata.ts";
import { currentFootprintInverseClockNativeCallable, qualifyCurrentFootprintInverseClockNativeFunction, qualifyCurrentFootprintInverseClockPromiseConstructor } from "./current-footprint-inverse-clock-native-metadata.ts";
import { currentFootprintInverseLookupNativeParent, qualifyCurrentFootprintInverseLookupNativeConstructor } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { currentFootprintInverseOwnDataParent } from "./current-footprint-inverse-own-data-replies.ts";
import { qualifyCurrentFootprintInverseGetWorkerTask } from "./current-footprint-inverse-get-worker-replies.ts";
import { compareCurrentFootprintInverseRuntimeRowProperties } from "./current-footprint-inverse-public-row-runtime.ts";
import { currentFootprintInverseDeleteRpcTrue } from "./current-footprint-inverse-delete-rpc-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.looseObject({ name: z.string(), value: remote.optional(), writable: z.boolean().optional(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const propertyPacket = z.looseObject({ result: z.array(property).max(128) });
type Values = ReturnType<typeof decodeCurrentFootprintCopyClockRpcV2Array>;
export interface CurrentFootprintInverseReferenceGraph { readonly tuple: string; readonly relations: string; readonly nodes: number }
export interface CurrentFootprintInverseReferenceNamespace { readonly kind: Kind; readonly namespace: string; readonly service: string; readonly link: string; readonly bound: string; readonly ready: string }
export interface CurrentFootprintInverseReferencePreparedInputs {
  readonly roots: string; readonly methods: string; readonly graphMethods: string;
  readonly namespaces: readonly CurrentFootprintInverseReferenceNamespace[];
  readonly graphs: readonly CurrentFootprintInverseReferenceGraph[];
  readonly normal: number; readonly helpers: number;
}
export interface CurrentFootprintInverseReferencePreparationBindings {
  readonly source: string; readonly scriptId: string; readonly intrinsics: string; readonly originalGetRoots: string;
  readonly data: CurrentFootprintInverseReferenceData;
  readonly current: () => void;
  readonly request: (command: Command) => Promise<unknown>;
  readonly assertOriginalHelperReceipt: (command: Command) => Promise<void>;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_REFERENCE_PREPARATION"); } }
function object(value: unknown): string { const parsed = remote.parse(capture(value)); need(parsed.objectId !== undefined && (parsed.type === "object" || parsed.type === "function") && parsed.subtype !== "proxy" && parsed.subtype !== "null"); return parsed.objectId; }
function selected(values: Values, slot: number): string { return object(values.get(String(slot))); }
function ownData(input: unknown, key: string): z.infer<typeof remote> {
  const rows = propertyPacket.parse(capture(input)).result.filter(row => row.name === key); need(rows.length === 1);
  const row = rows[0]; need(row !== undefined && row.value !== undefined && row.writable === true && row.enumerable && row.configurable); object(row.value); return row.value;
}
// oxlint-disable-next-line unicorn/prefer-code-point -- The fixed wire preserves UTF-16 code units, including supplementary-character pairs.
export function currentFootprintInverseReferenceAscii(value: unknown): string { const encoded = JSON.stringify(value); let text = ""; for (let index = 0; index < encoded.length; index += 1) { const code = encoded.charCodeAt(index); text += code >= 127 ? `\\u${code.toString(16).padStart(4, "0")}` : encoded[index]; } return text; }
function nodes(value: Value, depth = 0): number { need(depth <= 8 && (value.kind === "array" || value.kind === "object")); const children = value.kind === "array" ? value.values : value.entries.map(row => row[1]); need(children.length <= 63); let total = 1; for (const child of children) { if (child.kind === "array" || child.kind === "object") { total += nodes(child, depth + 1); } } need(total <= 63); return total; }
export function currentFootprintInverseReferenceModelValues(data: CurrentFootprintInverseReferenceData): readonly Value[] {
  need(data.models.length > 0 && data.models.length <= MODEL_LIMIT && data.models.some(row => row.uuid === data.footprintUuid) && new Set(data.models.map(row => row.uuid)).size === data.models.length && data.derivedFootprintUuids.length === 0);
  return Object.freeze(data.models.map(row => { need(/^[a-f\d]{32}$/u.test(row.uuid) && row.model.kind === "object" && row.model.entries.length === 12); const value: Value = Object.freeze({ kind: "array", values: Object.freeze(row.model.entries.map(entry => entry[1])) }); nodes(value); return value; }));
}
export function currentFootprintInverseReferenceModelNodeCounts(data: CurrentFootprintInverseReferenceData): readonly number[] { return Object.freeze(currentFootprintInverseReferenceModelValues(data).map(value => nodes(value))); }
/** Input observations return references and counts only, never a permit. */
export async function collectCurrentFootprintInverseReferencePreparation(b: CurrentFootprintInverseReferencePreparationBindings): Promise<CurrentFootprintInverseReferencePreparedInputs> {
  b.current(); qualifyCurrentFootprintInverseReferenceWorkerSource(b.source); const expectedModels = currentFootprintInverseReferenceModelValues(b.data); const budget = currentFootprintInverseReferenceWorkerBudget(expectedModels.map(value => nodes(value))); let helpers = 0, normal = 0;
  const send = async (input: unknown): Promise<unknown> => { b.current(); const command = validateCurrentFootprintInverseReferenceWorkerCommand(input); normal += 1; need(normal <= budget.setupNormal - 12); const raw = await b.request(command); b.current(); if (command.method === "Runtime.callFunctionOn") { helpers += 1; need(helpers <= budget.setupHelpers); await b.assertOriginalHelperReceipt(command); b.current(); } return raw; };
  const properties = (objectId: string): Promise<unknown> => send({ phase: "inverse-reference-worker-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const call = (role: string, objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[], value = false): Promise<unknown> => { const program = PROGRAMS[role]; need(program !== undefined); return send({ phase: "inverse-reference-worker-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: program, arguments: args, returnByValue: value } }); };
  const tuple = async (raw: unknown, count: number): Promise<Readonly<{ id: string; values: Values }>> => { const id = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, count); return Object.freeze({ id, values: decodeCurrentFootprintCopyClockRpcV2Array(await properties(id), count) }); };
  const invoke = async (role: string, receiver: string, args: readonly string[], count: number): Promise<Awaited<ReturnType<typeof tuple>>> => tuple(await call(role, receiver, args.map(objectId => ({ objectId }))), count);
  const sourceFunction = async (value: unknown, role: CurrentFootprintInverseReferenceQueryRole): Promise<string> => { const actual = remote.parse(capture(value)); need(actual.type === "function" && actual.subtype === undefined && typeof actual.description === "string"); requireCurrentFootprintInverseReferenceQueryDescription(actual.description, role); const id = object(actual); return qualifyCurrentFootprintInverseReferenceQueryFunction(await properties(id), role, b.scriptId); };
  const roots = await tuple(await call("input-roots", b.originalGetRoots, [{ objectId: b.intrinsics }]), 16);
  const methods = await invoke("input-methods", roots.id, [], 9); const graphMethods = await invoke("input-graphMethods", methods.id, [], 6);
  const native = decodeCurrentFootprintCopyClockRpcV2Array(await properties(selected(methods.values, 2)), 9);
  for (const [slot, role] of [[0, "parse"], [1, "stringify"], [2, "lower"], [7, "hasInstance"], [8, "push"]] as const) { const id = currentFootprintInverseGetNativeCallable({ result: native.get(String(slot)) }, role); qualifyCurrentFootprintInverseGetNativeFunction(await properties(id), role); }
  for (const [slot, role] of [[3, 5], [4, 6], [5, 7], [6, 9]] as const) { const id = currentFootprintInverseClockNativeCallable({ result: native.get(String(slot)) }, role); qualifyCurrentFootprintInverseClockNativeFunction(await properties(id), role); }
  const promise = selected(methods.values, 3); currentFootprintInverseClockNativeCallable({ result: methods.values.get("3") }, "Promise"); qualifyCurrentFootprintInverseClockPromiseConstructor(await properties(promise));
  const extra = decodeCurrentFootprintCopyClockRpcV2Array(await properties(selected(methods.values, 6)), 6);
  for (const [slot, role] of [[0, "values"], [1, "filter"], [2, "map"], [3, "forEach"], [4, "species"], [5, "shift"]] as const) { const id = currentFootprintInverseReferenceNativeCallable(extra.get(String(slot)), role); qualifyCurrentFootprintInverseReferenceNativeFunction(await properties(id), role); }
  qualifyCurrentFootprintInverseLookupNativeConstructor(await properties(selected(methods.values, 7)), methods.values.get("7"), "Array");
  qualifyCurrentFootprintInverseLookupNativeConstructor(await properties(selected(methods.values, 8)), methods.values.get("8"), "Symbol");
  const graphs: CurrentFootprintInverseReferenceGraph[] = [];
  const graph = async (root: string, expected: Value): Promise<CurrentFootprintInverseReferenceGraph> => {
    const edges: number[][] = [], pending = [{ id: root, expected }], proofs: string[] = [];
    for (let index = 0; index < pending.length; index += 1) { const item = pending[index]; need(item !== undefined && pending.length <= 63); const children = compareCurrentFootprintInverseRuntimeRowProperties(await properties(item.id), item.expected); const proof = await tuple(await call("graph-node", item.id, [{ objectId: b.intrinsics }, { objectId: graphMethods.id }, { value: currentFootprintInverseReferenceAscii(item.expected) }]), 4); proofs.push(proof.id); for (const [ordinal, child] of children.entries()) { const childIndex = pending.length; pending.push({ id: child.objectId, expected: child.expected }); edges.push([index, ordinal, childIndex]); } }
    const combined = await tuple(await call("graph-collect", b.intrinsics, [{ objectId: b.intrinsics }, ...proofs.map(objectId => ({ objectId }))]), 2); const relations = currentFootprintInverseReferenceAscii({ edges }); currentFootprintInverseDeleteRpcTrue(await call("graph-reprove", combined.id, [{ objectId: graphMethods.id }, { value: relations }], true)); return Object.freeze({ tuple: combined.id, relations, nodes: pending.length });
  };
  const namespaces: CurrentFootprintInverseReferenceNamespace[] = [];
  for (const [kind, slot] of [["pcb-all", 4], ["footprint-derived", 5], ["device-all", 6]] as const) {
    const manager = selected(roots.values, slot); const managerPacket = await properties(manager); currentFootprintInverseLookupNativeParent(managerPacket); const data = ownData(managerPacket, "data"); currentFootprintInverseOwnDataParent(await properties(object(data)), "object");
    const namespace = await tuple(await call("input-namespace", roots.id, [{ value: kind }]), 10); const queuePacket = await properties(selected(namespace.values, 5)); currentFootprintInverseOwnDataParent(queuePacket, "array"); const queueValues = decodeCurrentFootprintCopyClockRpcV2Array(queuePacket, 1); qualifyCurrentFootprintInverseGetWorkerTask(await properties(selected(queueValues, 0)));
    const service = await invoke("input-service", namespace.id, [], 5); const callback = currentFootprintInverseDeleteRpcCallable({ result: service.values.get("3") }, "service"); const callbackScopes = qualifyCurrentFootprintInverseDeleteRpcFunction(await properties(callback), "service", b.scriptId, b.source); const callbackScope = currentFootprintInverseDeleteRpcScope(await properties(callbackScopes), "service");
    const link = await invoke("input-serviceScope", callbackScope, [b.intrinsics, service.id], 4); let handlerRole: CurrentFootprintInverseReferenceQueryRole = "workerFootprintHandler"; if (kind === "pcb-all") { handlerRole = "workerPcbHandler"; } else if (kind === "device-all") { handlerRole = "workerDeviceHandler"; }
    const handlerScopes = await sourceFunction(link.values.get("2"), handlerRole); const handlerScope = currentFootprintInverseReferenceHandlerScope(await properties(handlerScopes), kind); const bound = await invoke("input-handlerScope", handlerScope, [b.intrinsics, link.id], 3);
    const methodsPacket = decodeCurrentFootprintCopyClockRpcV2Array(await properties(selected(namespace.values, 8)), kind === "footprint-derived" ? 4 : 2);
    let primaryRole: CurrentFootprintInverseReferenceQueryRole = "workerFootprintKeys"; if (kind === "pcb-all") { primaryRole = "workerPcbAll"; } else if (kind === "device-all") { primaryRole = "workerDeviceAll"; }
    let allRole: CurrentFootprintInverseReferenceQueryRole = "workerFootprintGetAll"; if (kind === "pcb-all") { allRole = "workerPcbGetAll"; } else if (kind === "device-all") { allRole = "workerDeviceGetAll"; }
    await sourceFunction(methodsPacket.get("0"), primaryRole); await sourceFunction(methodsPacket.get("1"), allRole);
    const modelTuples: string[] = []; let branch = namespace.id, lexical = namespace.id, regexp = namespace.id;
    if (kind === "footprint-derived") {
      const getter = currentFootprintInverseGetCallable({ result: methodsPacket.get("3") }, "get"); const getterScopes = qualifyCurrentFootprintInverseGetFunction(await properties(getter), "get", b.scriptId, b.source); const getterScope = currentFootprintInverseGetOuterClosure(await properties(getterScopes));
      const lexicalTuple = await invoke("input-getLexical", getterScope, [b.intrinsics, namespace.id], 6); lexical = lexicalTuple.id;
      const normalize = currentFootprintInverseGetCallable({ result: lexicalTuple.values.get("2") }, "normalizeTitle"); const normalizeScopes = qualifyCurrentFootprintInverseGetFunction(await properties(normalize), "normalizeTitle", b.scriptId, b.source); const normalizeScope = currentFootprintInverseGetOuterClosure(await properties(normalizeScopes)); const normalized = await invoke("input-normalizeBranch", normalizeScope, [b.intrinsics, lexical], 3); branch = normalized.id;
      const verifyScopes = await sourceFunction(methodsPacket.get("2"), "workerFootprintVerifySource"); const verifyScope = currentFootprintInverseGetOuterClosure(await properties(verifyScopes)); const source = await invoke("input-sourceLexical", verifyScope, [b.intrinsics, namespace.id], 6);
      await sourceFunction(source.values.get("3"), "workerMustString"); const validScopes = await sourceFunction(source.values.get("4"), "workerFootprintSourceValid"); const validScope = currentFootprintInverseGetOuterClosure(await properties(validScopes)); const regex = await invoke("input-regexp", validScope, [b.intrinsics, source.id], 6); regexp = regex.id;
      const expression = regex.values.get("2"); need(expression?.type === "object" && expression.subtype === "regexp" && expression.className === "RegExp" && expression.description === String.raw`/^[^|]+(\|[^|]+)?$/`); await properties(selected(regex.values, 2));
      for (const [index, role] of [[3, "test"], [4, "exec"]] as const) { const id = currentFootprintInverseReferenceNativeCallable(regex.values.get(String(index)), role); qualifyCurrentFootprintInverseReferenceNativeFunction(await properties(id), role); }
      currentFootprintInverseDeleteRpcTrue(await call("input-modelRoster", namespace.id, [{ value: b.data.models.map(model => model.uuid).join(",") }], true));
      for (const [index, model] of b.data.models.entries()) { const dataPacket = await properties(object(data)); object(ownData(dataPacket, model.uuid)); const expected = expectedModels[index]; need(expected !== undefined); const modelTuple = await tuple(await call("input-model", namespace.id, [{ value: model.uuid }]), 5); currentFootprintInverseOwnDataParent(await properties(selected(modelTuple.values, 2)), "object"); modelTuples.push(modelTuple.id); const proof = await graph(selected(modelTuple.values, 3), expected); need(proof.nodes === nodes(expected)); graphs.push(proof); }
    }
    const models = await tuple(await call("input-collectModels", b.intrinsics, [{ objectId: b.intrinsics }, ...modelTuples.map(objectId => ({ objectId }))]), 2);
    const ready = await invoke("input-readyNamespace", namespace.id, [service.id, link.id, bound.id, models.id, methods.id, lexical, branch, regexp], 7);
    namespaces.push(Object.freeze({ kind, namespace: namespace.id, service: service.id, link: link.id, bound: bound.id, ready: ready.id }));
  }
  for (const proof of graphs) { currentFootprintInverseDeleteRpcTrue(await call("graph-reprove", proof.tuple, [{ objectId: graphMethods.id }, { value: proof.relations }], true)); }
  b.current(); need(namespaces.length === 3 && graphs.length === b.data.models.length && normal === budget.setupNormal - 12 && helpers === budget.setupHelpers);
  return Object.freeze({ roots: roots.id, methods: methods.id, graphMethods: graphMethods.id, namespaces: Object.freeze(namespaces), graphs: Object.freeze(graphs), normal, helpers });
}
