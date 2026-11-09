/** Complete saved-branch cache expectations only. Matching data issues no
 * original worker, Cache.put continuation, Promise or mutation authority. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_SAVED_FLOW_CACHE_PROJECTION_SHA256 } from "./current-footprint-saved-flow-cache-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const hash = z.string().regex(/^[a-f\d]{64}$/u), uuid = z.string().regex(/^[a-f\d]{32}$/u);
const body = z.string().min(1).max(8192).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 8192);
const cached = z.strictObject({ url: z.string().min(1).max(1024), body, sha256: hash });
const flowBody=cached.extend({historyUuid:uuid,ordinal:z.number().int().min(0).max(7)});
const flowBodies=z.array(flowBody).min(1).max(7);
const source = z.strictObject({ schema: z.literal("private.current-footprint-saved-flow-cache-data.v1"), projectUuid: hash, branchUuid: uuid, headHistoryUuid: uuid,
  projectionSourceSha256: hash, namespace: z.string().max(128), bodies:flowBodies, headIndex: cached,
  suppliedObservationsOnly: z.literal(true), nativeWorkerOwnershipVerified: z.literal(false), cacheContinuationAuthorized: z.literal(false), completeUploadFrontierVerified: z.literal(false) });
export interface CurrentFootprintInverseInitialHeadLimits { readonly nodes: number; readonly depth: number; readonly array: number; readonly keys: number; readonly string: number }
export interface CurrentFootprintInverseInitialCacheData {
  readonly schema: "private.current-footprint-inverse-initial-cache-data.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly namespace: string; readonly originalFlowDataSha256: string;
  readonly jobs: readonly Readonly<{ slot: number; kind: "flow" | "head"; key: string; body: string; sha256: string }>[];
  readonly headLimits: CurrentFootprintInverseInitialHeadLimits;
  readonly suppliedObservationsOnly: true; readonly originalCachePromiseQualified: false; readonly cacheContinuationAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_DATA"); } }
/** Limits are measured from the exact source-derived compact JSON graph.
 * The eight-KiB source body bounds work; depth/collection domain limits remain
 * explicit and independent of the existing generated-fixture encoder. */
function headLimits(text: string): CurrentFootprintInverseInitialHeadLimits {
  const parsed: unknown = JSON.parse(text); need(JSON.stringify(parsed) === text);
  const todo: { value: unknown; depth: number }[] = [{ value: parsed, depth: 0 }];
  let array = 0, depth = 0, keys = 0, nodes = 0, string = 0;
  while (todo.length > 0) {
    const item = todo.pop(); need(item !== undefined); nodes += 1; need(nodes <= 8192 && item.depth <= 32); depth = Math.max(depth, item.depth);
    const value = item.value;
    if (typeof value === "string") { string = Math.max(string, value.length); }
    else if (typeof value === "number") { need(Number.isFinite(value)); }
    else if (value !== null && typeof value === "object") {
      if (Array.isArray(value)) { need(value.length <= 32); array = Math.max(array, value.length); for (const entry of value) { todo.push({ value: entry, depth: item.depth + 1 }); } }
      else { const names = Object.keys(value); need(names.length <= 32); keys = Math.max(keys, names.length); for (const name of names) { todo.push({ value: Reflect.get(value, name), depth: item.depth + 1 }); } }
    } else { need(value === null || typeof value === "boolean"); }
  }
  return Object.freeze({ nodes, depth, array, keys, string });
}
export function deriveCurrentFootprintInverseInitialCacheData(input: unknown): CurrentFootprintInverseInitialCacheData {
  const data = source.parse(captureCurrentPcbStringClockReply(input).value);
  need(data.projectionSourceSha256 === CURRENT_FOOTPRINT_SAVED_FLOW_CACHE_PROJECTION_SHA256 && data.namespace === `project_${data.projectUuid}_v6` && data.headIndex.url === `https://client/index/v1/${data.branchUuid}`);
  const initial = [...data.bodies.map(value => ({ kind: "flow" as const, key: value.url, body: value.body, sha256: value.sha256 })), { kind: "head" as const, key: data.headIndex.url, body: data.headIndex.body, sha256: data.headIndex.sha256 }];
  need(initial.length <= 8 && new Set(initial.map(value => value.key)).size === initial.length && initial.reduce((total, value) => total + Buffer.byteLength(value.body), 0) <= 32_768);
  for (const value of data.bodies) {
    const prefix = `https://client/dataStr/${value.historyUuid}${value.ordinal === 0 ? "" : `-${String(value.ordinal)}`}-`;
    need(value.url.startsWith(prefix) && /^(?:[a-f\d]{16}|[a-f\d]{32}|SYMBOL|FOOTPRINT|BLOB|FONT|PANEL_LIB|DEVICE|BOARD|INSTANCE|CONFIG|VARIANT|COMPONENT_GROUP|COMPONENT_GROUP_DATA)$/u.test(value.url.slice(prefix.length)));
  }
  need(initial.every(value => sha256Text(value.body) === value.sha256));
  return freezeDeep({ schema: "private.current-footprint-inverse-initial-cache-data.v1", projectUuid: data.projectUuid, branchUuid: data.branchUuid, namespace: data.namespace,
    originalFlowDataSha256: sha256Text(canonicalJson(data)), jobs: initial.map((value, slot) => ({slot,kind:value.kind,key:value.key,body:value.body,sha256:value.sha256})), headLimits: headLimits(data.headIndex.body),
    suppliedObservationsOnly: true, originalCachePromiseQualified: false, cacheContinuationAuthorized: false });
}
