import { basename } from "node:path";
import { z } from "zod";
import { readArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { sha256Text } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";

export const DESIGN_SAVE_ATTEMPT_PROFILE = "easyeda-pro-control.design-save-attempt.v1";
const phaseSchema = z.enum(["save-reopen", "symbol-save", "footprint-save"]);
export type DesignSavePhase = z.infer<typeof phaseSchema>;
const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const scopeSchema = z.object({ projectUuid: z.string().min(1).max(256), documentUuid: z.string().min(1).max(256),
  documentType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }).strict();
const intentSchema = z.object({ profile: z.literal(DESIGN_SAVE_ATTEMPT_PROFILE), operationId: z.string(), planHash: hashSchema,
  sequence: z.number().int().positive(), phase: phaseSchema, sourceSha256: hashSchema, scope: scopeSchema }).strict();
const notDispatchedSchema = z.object({ profile: z.literal("easyeda-pro-control.design-save-not-dispatched.v1"), operationId: z.string(),
  planHash: hashSchema, phase: phaseSchema, intentSha256: hashSchema, dispatchStarted: z.literal(false),
  reason: z.literal("before-dispatch-callback-failed") }).strict();
export type DesignSaveIntent = z.infer<typeof intentSchema>;
interface SaveJournal {
  readonly operationId: string;
  readonly planHash: string;
  readonly sequence: number;
  readonly state: string;
  readonly saved: boolean;
  readonly reopened: boolean;
  readonly orphanedCallPossible: boolean;
  readonly orphanedCallPhase?: string | undefined;
  readonly saveAttemptProtocol?: unknown;
  readonly designSaveAttempted?: unknown;
  readonly wireSaveAttempted?: unknown;
  readonly context: ExpectedContext;
  readonly after?: { readonly sha256: string } | undefined;
  readonly artifacts: readonly ArtifactDescriptor[];
}
function scope(context: ExpectedContext): z.infer<typeof scopeSchema> {
  return scopeSchema.parse({ projectUuid: context.project.uuid ?? context.project.projectUuid,
    documentUuid: context.document.uuid ?? context.document.documentUuid, documentType: context.document.documentType });
}
export function designSavePhase(value: string): DesignSavePhase | undefined {
  const parsed = phaseSchema.safeParse(value); return parsed.success ? parsed.data : undefined;
}
export function createDesignSaveIntent(journal: SaveJournal, phase: DesignSavePhase): DesignSaveIntent {
  return intentSchema.parse({ profile: DESIGN_SAVE_ATTEMPT_PROFILE, operationId: journal.operationId, planHash: journal.planHash,
    sequence: journal.sequence + 1, phase, sourceSha256: journal.after?.sha256, scope: scope(journal.context) });
}
export function createDesignSaveNotDispatched(journal: SaveJournal, intent: DesignSaveIntent, descriptor: ArtifactDescriptor): z.infer<typeof notDispatchedSchema> {
  if (journal.orphanedCallPossible || intent.operationId !== journal.operationId || intent.planHash !== journal.planHash) {
    throw new Error("Save non-dispatch proof requires cleared pre-dispatch authority and the exact original intent.");
  }
  return notDispatchedSchema.parse({ profile: "easyeda-pro-control.design-save-not-dispatched.v1", operationId: journal.operationId,
    planHash: journal.planHash, phase: intent.phase, intentSha256: descriptor.sha256, dispatchStarted: false,
    reason: "before-dispatch-callback-failed" });
}

/** Retain old Save evidence before rebind/open/read overwrites its phase. Old
 * journals have no callback-bound intent, so missing acknowledgments remain a
 * stop. New journals use the precise ledger instead of broad recovery states.
 */
export function hasLegacyDesignSaveEvidence(journal: SaveJournal): boolean {
  if (journal.saveAttemptProtocol !== undefined && journal.saveAttemptProtocol !== DESIGN_SAVE_ATTEMPT_PROFILE) {
    throw new Error("Design Save-attempt protocol is malformed.");
  }
  if (journal.designSaveAttempted !== undefined && journal.designSaveAttempted !== true) { throw new Error("Design Save-attempt marker is malformed."); }
  if (journal.saved || journal.reopened || journal.designSaveAttempted === true || journal.artifacts.some((entry) =>
    /^[0-9]+-(?:save-reopen|symbol-save|footprint-save|library-save-intent|wire-save-intent)\.json$/u.test(basename(entry.path)))) { return true; }
  if (journal.saveAttemptProtocol === DESIGN_SAVE_ATTEMPT_PROFILE) { return false; }
  // Legacy commit failures cannot distinguish an earlier read refusal from
  // A consumed Save whose return artifact or phase was lost. Keep uncertainty
  // No-repeat. The new protocol above uses its precise callback-bound ledger.
  return journal.wireSaveAttempted === true || journal.state === "commit-needs-recovery" ||
    ["save-reopen", "symbol-save", "footprint-save", "commit-upload-barrier"].includes(journal.orphanedCallPhase ?? "") ||
    ["save-reopen-dispatching", "symbol-save-dispatching", "footprint-save-dispatching"].includes(journal.state);
}

async function readSaveAttemptArtifact(descriptor: ArtifactDescriptor): Promise<unknown> {
  if (!Number.isSafeInteger(descriptor.bytes) || descriptor.bytes < 1 || descriptor.bytes > 65_536) { throw new Error("Save-attempt artifact exceeds its bounded record size."); }
  const read = await readArtifact(descriptor.path, 0, descriptor.bytes);
  if (read.size !== descriptor.bytes || read.bytesRead !== descriptor.bytes || Buffer.byteLength(read.text) !== descriptor.bytes ||
      sha256Text(read.text) !== descriptor.sha256) { throw new Error("Save-attempt artifact changed or its complete hash is invalid."); }
  const value: unknown = JSON.parse(read.text); return value;
}
export interface DesignSaveAttemptEvidence {
  readonly attempted: boolean;
  readonly intentCount: number;
  readonly provenNotDispatchedCount: number;
}

/** Intent precedes callTool. A fixed callback failure is the only exception,
 * and its separately verified receipt must bind that exact intent. A returned
 * error, missing return, rebind or restart can never make Save repeatable.
 */
export async function inspectDesignSaveAttempts(journal: SaveJournal, read: (descriptor: ArtifactDescriptor) => Promise<unknown> = readSaveAttemptArtifact): Promise<DesignSaveAttemptEvidence> {
  const legacyAttempt = hasLegacyDesignSaveEvidence(journal);
  const intents = journal.artifacts.filter((entry) => /^[0-9]+-design-save-intent\.json$/u.test(basename(entry.path)));
  const cancellations = journal.artifacts.filter((entry) => /^[0-9]+-design-save-not-dispatched\.json$/u.test(basename(entry.path)));
  const pending = new Map<string, { readonly phase: DesignSavePhase; readonly index: number }>();
  for (const descriptor of intents) {
    const intent = intentSchema.parse(await read(descriptor));
    if (intent.operationId !== journal.operationId || intent.planHash !== journal.planHash ||
        JSON.stringify(intent.scope) !== JSON.stringify(scope(journal.context)) ||
        basename(descriptor.path) !== `${intent.sequence.toString().padStart(2, "0")}-design-save-intent.json` || pending.has(descriptor.sha256)) {
      throw new Error("Design Save intent has conflicting operation, scope or duplicate identity.");
    }
    pending.set(descriptor.sha256, { phase: intent.phase, index: journal.artifacts.indexOf(descriptor) });
  }
  for (const descriptor of cancellations) {
    const cancellation = notDispatchedSchema.parse(await read(descriptor));
    const intent = pending.get(cancellation.intentSha256);
    if (intent === undefined || intent.phase !== cancellation.phase || cancellation.operationId !== journal.operationId ||
        cancellation.planHash !== journal.planHash || journal.artifacts.indexOf(descriptor) <= intent.index) {
      throw new Error("Save non-dispatch receipt lacks its unique preceding exact intent.");
    }
    pending.delete(cancellation.intentSha256);
  }
  return { attempted: legacyAttempt || pending.size > 0, intentCount: intents.length, provenNotDispatchedCount: cancellations.length };
}
