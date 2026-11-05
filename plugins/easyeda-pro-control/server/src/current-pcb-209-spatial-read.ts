/** Bounded data contracts for the private, original-owner Via spatial reader.
 * Parsing never captures a native owner or grants an execution route.
 */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_SPATIAL_MAX_HITS = 256;
export const CURRENT_PCB_209_SPATIAL_MAX_BYTES = 65_536;
export const CURRENT_PCB_209_SPATIAL_MAX_COORDINATE = 10_000_000;
const coordinate = z.number().min(-CURRENT_PCB_209_SPATIAL_MAX_COORDINATE)
  .max(CURRENT_PCB_209_SPATIAL_MAX_COORDINATE).refine(value => !Object.is(value, -0));
const region = z.strictObject({ kind: z.literal("region"), mode: z.enum(["inside", "intersects"]),
  leftMil: coordinate, rightMil: coordinate, bottomMil: coordinate, topMil: coordinate })
  .refine(value => value.leftMil < value.rightMil && value.bottomMil < value.topMil);
export const currentPcb209SpatialQuerySchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("point"), xMil: coordinate, yMil: coordinate }), region,
]);
export type CurrentPcb209SpatialQuery = z.infer<typeof currentPcb209SpatialQuerySchema>;
const id = z.string().min(1).max(256).refine(value => value.isWellFormed() && !value.includes("\0"));
const ids = z.array(id).max(CURRENT_PCB_209_SPATIAL_MAX_HITS).refine(value => new Set(value).size === value.length);
const identity = z.strictObject({ primitiveId: id, family: z.literal("Via") });
export const currentPcb209SpatialResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-via-read.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  query: currentPcb209SpatialQuerySchema,
  identities: z.array(identity).max(CURRENT_PCB_209_SPATIAL_MAX_HITS)
    .refine(rows => new Set(rows.map(row => row.primitiveId)).size === rows.length),
  sceneViaCount: z.number().int().min(0).max(CURRENT_PCB_209_SPATIAL_MAX_HITS).refine(value => !Object.is(value, -0)),
  selectedPrimitiveIds: ids, samples: z.literal(2), nativeOrderingPreserved: z.literal(true),
  retainedSceneDescriptorsUnchanged: z.literal(true), selectionUnchanged: z.literal(true),
  allowedExistingStateEffect: z.literal("D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ"),
  scope: z.literal("standalone-via-ready-bbox-scene-no-region-border-crossings"),
  nativeFunctionGraphVerified: z.literal(false), nativeIntrinsicsVerified: z.literal(false),
  sourceMembershipVerified: z.literal(false), persistenceVerified: z.literal(false),
}).refine(value => value.identities.length <= value.sceneViaCount && value.selectedPrimitiveIds.length <= value.sceneViaCount &&
  (value.query.kind !== "point" || value.identities.length <= 1));
export type CurrentPcb209SpatialResult = Readonly<z.infer<typeof currentPcb209SpatialResultSchema>>;

function own(input: unknown, keys: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) {
    throw new Error("PCB209_SPATIAL_REPLY");
  }
  const actual = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if ((prototype !== Object.prototype && prototype !== null) || actual.length !== keys.length ||
      actual.some(key => typeof key !== "string" || !keys.includes(key))) { throw new Error("PCB209_SPATIAL_REPLY"); }
  return Object.fromEntries(keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB209_SPATIAL_REPLY"); }
    return [key, descriptor.value as unknown];
  }));
}

/** Exact CDP string reply only. A matching observation remains data until its
 * original runner joins it with the sealed document/query and owner checks.
 */
export function decodeCurrentPcb209SpatialReply(input: unknown): CurrentPcb209SpatialResult {
  try {
    const result = own(own(input, ["result"])["result"], ["type", "value"]), value = result["value"];
    if (result["type"] !== "string" || typeof value !== "string" || !value.isWellFormed() ||
        Buffer.byteLength(value) > CURRENT_PCB_209_SPATIAL_MAX_BYTES) { throw new Error("PCB209_SPATIAL_REPLY"); }
    const decoded = decodeCurrentPcbDiagnosticJson(Buffer.from(value));
    return freezeDeep(currentPcb209SpatialResultSchema.parse(decoded));
  } catch { throw new Error("PCB209_SPATIAL_REPLY"); }
}
