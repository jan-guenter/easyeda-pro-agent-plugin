/** Fixed native bookkeeping for the separately issued reference worker.
 * Parsing a control packet grants no owner, readiness or application dispatch. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ORDER as ORDER, CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_ROLES as ROLES } from "./current-footprint-inverse-reference-worker-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const point = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const node = z.number().int().min(0).max(63);
const census = z.strictObject({ phase: z.literal("bind"), models: z.number().int().min(1).max(4), node0: node, node1: node, node2: node, node3: node }).refine(value => [value.node0, value.node1, value.node2, value.node3].every((count, index) => index < value.models ? count >= 1 : count === 0));
const schema = z.union([
  census,
  z.strictObject({ phase: z.literal("point"), role: z.enum(ROLES), breakpointId: point }),
  z.strictObject({ phase: z.literal("query"), kind: z.enum(["pcb-all", "footprint-derived", "device-all"]) }),
  z.strictObject({ phase: z.literal("held"), role: z.enum(["entry", ...ORDER]), breakpointId: point }),
  z.strictObject({ phase: z.enum(["ready", "permit", "complete"]) }),
]);
export type CurrentFootprintInverseReferenceWorkerControl = z.infer<typeof schema>;
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_CONTROL_REQUESTS = Object.freeze({ bind: 1, point: ROLES.length, ready: 1, query: 3,
  held: 3 * (1 + ORDER.length), permit: 3, complete: 3, total: 1 + ROLES.length + 1 + 3 * (1 + 1 + ORDER.length + 1 + 1) });
export function currentFootprintInverseReferenceWorkerControl(input: unknown): Readonly<{ action: "footprint-inverse-reference-worker"; method: "control"; requestId: 0 }> & CurrentFootprintInverseReferenceWorkerControl {
  return freezeDeep({ ...schema.parse(capture(input)), action: "footprint-inverse-reference-worker", method: "control", requestId: 0 });
}
