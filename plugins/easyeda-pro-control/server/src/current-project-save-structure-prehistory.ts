/** Pure packet/intent comparisons. Matching values never issue continuation,
 * original body, publication, history or native ownership authority. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { expectedCurrentGeneratedProjectSaveStructure } from "./current-project-save-structure-expectation.ts";
import type { CurrentProjectSaveStructureBindings } from "./current-project-save-structure-origin.ts";

export type { CurrentProjectStructureBodyReservation, CurrentProjectStructureMainPublication } from "./current-project-structure-transport-origin.ts";

interface Packet { readonly projectUuid: string; readonly branchUuid: string; readonly ticket: number; readonly structureText: string }
interface Intent { readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly saveHeadTicket: number; readonly workerClock: number }
const bodySchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^[a-f\d]{32}$/u),
  bodySha256: z.string().regex(/^[a-f\d]{64}$/u), saveHeadTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), workerClock: z.number().int().positive().max(8_640_000_000_000_000),
  expectedStructureText: z.string().max(2_097_152).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 2_097_152) });
const publicationSchema = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), ticket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  structureSha256: z.string().regex(/^[a-f\d]{64}$/u), nativeChanges: z.literal(1), nativeBeforeEpochMs: z.number().int().positive().max(8_640_000_000_000_000), nativeAfterEpochMs: z.number().int().positive().max(8_640_000_000_000_000),
  originalResponsePublished: z.literal(true), selectedSqlStillFenced: z.literal(true) });
export function matchesCurrentProjectSaveStructureIntent(prepared: CurrentProjectSaveStructureBindings["prepared"], packet: Packet, value: Intent): boolean {
  const target = prepared.qualification.target; const documentUuid = "documentUuid" in target ? target.documentUuid : target.pageUuid;
  return value.projectUuid === target.projectUuid && value.branchUuid === target.branchUuid && value.documentUuid === documentUuid && packet.projectUuid === value.projectUuid && packet.branchUuid === value.branchUuid && packet.ticket === value.saveHeadTicket &&
    packet.structureText === expectedCurrentGeneratedProjectSaveStructure(prepared, value.workerClock);
}
export function requireCurrentProjectPrehistoryBodyIntent(prepared: CurrentProjectSaveStructureBindings["prepared"], packet: Packet, input: unknown): void {
  const value = bodySchema.parse(input);
  if (packet.structureText !== value.expectedStructureText || !matchesCurrentProjectSaveStructureIntent(prepared, packet, value)) { throw new Error("PROJECT_SAVE_STRUCTURE_EXACT_BODY_AND_METADATA_INTENT"); }
}
export function requireCurrentProjectPrehistoryPublication(packet: Packet, input: unknown): void {
  const value = publicationSchema.parse(input);
  if (value.projectUuid !== packet.projectUuid || value.branchUuid !== packet.branchUuid || value.ticket !== packet.ticket || value.structureSha256 !== createHash("sha256").update(packet.structureText).digest("hex") || value.nativeAfterEpochMs < value.nativeBeforeEpochMs) { throw new Error("PROJECT_SAVE_STRUCTURE_EXACT_MAIN_PUBLICATION"); }
}
