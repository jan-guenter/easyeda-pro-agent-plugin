/** Mixed standalone Track/Line and Via identities. This is a new result
 * contract; released Via-only observations keep their original schema. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_209_SPATIAL_MAX_BYTES, CURRENT_PCB_209_SPATIAL_MAX_HITS,
  currentPcb209SpatialQuerySchema, currentPcb209SpatialResultSchema } from "./current-pcb-209-spatial-read.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const identity = currentPcb209SpatialResultSchema.shape.identities.element.extend({ family: z.enum(["Via", "Line"]) });
export const currentPcb209SpatialTrackResultSchema = z.strictObject({
  ...currentPcb209SpatialResultSchema.shape,
  schema: z.literal("easyeda-pro-control.pcb209-spatial-line-via-read.v1"),
  identities: z.array(identity).max(CURRENT_PCB_209_SPATIAL_MAX_HITS)
    .refine(rows => new Set(rows.map(row => row.primitiveId)).size === rows.length),
  sceneLineCount: z.number().int().min(0).max(CURRENT_PCB_209_SPATIAL_MAX_HITS).refine(value => !Object.is(value, -0)),
  scope: z.literal("standalone-line-via-ready-bbox-scene-no-region-border-crossings"),
}).refine(value => {
  const count = value.sceneLineCount + value.sceneViaCount;
  return count <= CURRENT_PCB_209_SPATIAL_MAX_HITS && value.identities.length <= count &&
    value.selectedPrimitiveIds.length <= count &&
    value.identities.filter(row => row.family === "Line").length <= value.sceneLineCount &&
    value.identities.filter(row => row.family === "Via").length <= value.sceneViaCount &&
    (value.query.kind !== "point" || value.identities.length <= 1);
});
export type CurrentPcb209SpatialTrackResult = Readonly<z.infer<typeof currentPcb209SpatialTrackResultSchema>>;
export const currentPcb209SpatialTrackQueriesSchema = z.array(currentPcb209SpatialQuerySchema).min(1).max(15);

/** Copy one exact own-data envelope without invoking getters or proxies. */
function data(value: unknown, keys: readonly string[]): Record<string, unknown> {
      if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) { throw new Error("SPATIAL_TRACK_REPLY"); }
      const actual = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
      if ((prototype !== Object.prototype && prototype !== null) || actual.length !== keys.length ||
          actual.some(key => typeof key !== "string" || !keys.includes(key))) { throw new Error("SPATIAL_TRACK_REPLY"); }
      return Object.fromEntries(keys.map(key => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SPATIAL_TRACK_REPLY"); }
        return [key, descriptor.value as unknown];
      }));
}
/** A complete bounded CDP string only; parsing creates no owner or provenance. */
export function decodeCurrentPcb209SpatialTrackReply(input: unknown): CurrentPcb209SpatialTrackResult {
  try {
    const outer = data(input, ["result"]), remote = data(outer["result"], ["type", "value"]), value = remote["value"];
    if (remote["type"] !== "string" || typeof value !== "string" || !value.isWellFormed() ||
        Buffer.byteLength(value) > CURRENT_PCB_209_SPATIAL_MAX_BYTES) { throw new Error("SPATIAL_TRACK_REPLY"); }
    const decoded = decodeCurrentPcbDiagnosticJson(Buffer.from(value));
    return freezeDeep(currentPcb209SpatialTrackResultSchema.parse(decoded));
  } catch { throw new Error("PCB209_SPATIAL_TRACK_REPLY"); }
}
