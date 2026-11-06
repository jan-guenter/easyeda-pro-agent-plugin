/** One source-defined normal Via on an originally qualified generated PCB.
 * The closed baseline and plan are live references, never authority from JSON. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { assertOriginalGeneratedFixtureTarget, originalGeneratedFixtureInventory } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { assertOriginalGeneratedFixtureOpenCheckpoint, verifyGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";

const coordinate = z.number().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const diameter = z.number().min(0.1).max(100_000);
export const currentPcbViaWriteRequestSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-via-write-request.v1"),
  operationId: z.string().min(20).max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  via: z.strictObject({ netName: z.literal(""), xMil: coordinate, yMil: coordinate,
    holeDiameterMil: diameter, diameterMil: diameter }).refine(value => value.holeDiameterMil < value.diameterMil),
});
export type CurrentPcbViaWriteRequest = z.infer<typeof currentPcbViaWriteRequestSchema>;
export interface CurrentPcbViaWritePlan {
  readonly schema: "private.current-pcb-via-write-plan.v1";
  readonly operationId: string;
  readonly target: QualifiedGeneratedFixtureTarget["target"];
  readonly initialLogicalSha256: string;
  readonly via: Readonly<CurrentPcbViaWriteRequest["via"] & { viaType: 0; designRuleBlindViaName: "";
    solderMaskExpansion: Readonly<{ topSolderMask: 0; bottomSolderMask: 0 }>; primitiveLock: false }>;
  readonly expectedNative: Readonly<{ family: "Via"; net: ""; x: number; y: number; radius: number; holeRadius: number;
    type: 0; startLayer: 1; endLayer: 2; expansionType: 2; topExpansion: 0; bottomExpansion: 0; locked: false }>;
  readonly inverseAvailable: false;
  readonly footprintDocumentAllocationRequired: false;
  readonly footprintStructureWriterRequired: false;
}
interface Original {
  readonly text: string;
  readonly prepared: GeneratedFixtureOpenCheckpoint;
  readonly qualification: QualifiedGeneratedFixtureTarget;
  readonly inventory: NativeSqlInventory;
  readonly history: NativeHistorySnapshot;
}
const issued = new WeakMap<CurrentPcbViaWritePlan, Original>();
/** Complete first closed SQL/source qualification precedes native writer birth.
 * This does not qualify live queues, selected SQL slots or the future Save. */
export async function prepareCurrentPcbViaWritePlan(prepared: GeneratedFixtureOpenCheckpoint, input: unknown): Promise<CurrentPcbViaWritePlan> {
  assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
  const qualification = prepared.qualification, request = currentPcbViaWriteRequestSchema.parse(input);
  assertOriginalGeneratedFixtureTarget(qualification);
  const inventory = originalGeneratedFixtureInventory(qualification); readerCompletion(inventory);
  if (prepared.history.documents.length !== 1 || prepared.history.documents[0]?.uuid !== qualification.target.documentUuid ||
      prepared.history.documents[0].docType !== "PCB") { throw new Error("PCB_VIA_WRITE_GENERATED_ROOT_REQUIRED"); }
  await verifyGeneratedFixtureOpenCheckpoint(prepared); assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
  const v = request.via;
  const plan: CurrentPcbViaWritePlan = freezeDeep({ schema: "private.current-pcb-via-write-plan.v1", operationId: request.operationId,
    target: qualification.target, initialLogicalSha256: inventory.logicalSha256,
    via: { ...v, viaType: 0, designRuleBlindViaName: "", solderMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0 }, primitiveLock: false },
    expectedNative: { family: "Via", net: "", x: v.xMil / 10, y: v.yMil / 10, radius: v.diameterMil / 20, holeRadius: v.holeDiameterMil / 20,
      type: 0, startLayer: 1, endLayer: 2, expansionType: 2, topExpansion: 0, bottomExpansion: 0, locked: false },
    inverseAvailable: false, footprintDocumentAllocationRequired: false, footprintStructureWriterRequired: false });
  issued.set(plan, Object.freeze({ text: canonicalJson(plan), prepared, qualification, inventory, history: prepared.history })); return plan;
}
export function requireOriginalCurrentPcbViaWritePlan(plan: CurrentPcbViaWritePlan): Readonly<Original> {
  const original = issued.get(plan); if (original === undefined || original.text !== canonicalJson(plan)) { throw new Error("PCB_VIA_WRITE_ORIGINAL_PLAN"); }
  assertOriginalGeneratedFixtureOpenCheckpoint(original.prepared); assertOriginalGeneratedFixtureTarget(original.qualification);
  if (originalGeneratedFixtureInventory(original.qualification) !== original.inventory) { throw new Error("PCB_VIA_WRITE_ORIGINAL_SQL"); }
  return original;
}
