/** Fixed 209 disposable navigation and original layer/primitive observation contract.
 * No worker/compiler observations, raw commands, writers or Save are admitted. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_209_OPENING_PROFILE } from "./current-pcb-209-opening-profile.ts";
import { currentPcb209SelectionRelationsComponentIdsSchema } from "./current-pcb-209-selection-relations.ts";
import { currentPcb209ObservationQuerySchema, currentPcb209ObservationQueryStageSchema } from "./current-pcb-209-observation-query.ts";

const operationId = z.string().max(80).regex(/^pcb209-[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcb209OpeningRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(["browser", "frames", "script", "pcb-opening", "layers209", "primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209"]).optional() }).strict(),
  z.object({ action: z.literal("query-observation"), operationId, observation: currentPcb209ObservationQueryStageSchema,
    expectedResultRecordSha256: digest, query: currentPcb209ObservationQuerySchema }).strict(),
  z.object({ action: z.literal("settle-records"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("observe-layers"), ...bound }).strict(),
  z.object({ action: z.literal("observe-primitives"), ...bound }).strict(),
  z.object({ action: z.literal("observe-extended-primitives"), ...bound }).strict(),
  z.object({ action: z.literal("observe-pad-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-image-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-selection-relations"), ...bound,
    componentIds: currentPcb209SelectionRelationsComponentIdsSchema.default([]) }).strict(),
  z.object({ action: z.literal("observe-window"), ...bound }).strict(),
  z.object({ action: z.literal("observe-termination"), ...bound }).strict(),
  z.object({ action: z.literal("release-closed"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }).strict(),
  z.object({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
]);
export type CurrentPcb209OpeningRequest = z.infer<typeof currentPcb209OpeningRequestSchema>;

export function queryCurrentPcb209Opening(input: unknown = {}): Record<string, unknown> {
  const request = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", profile: CURRENT_PCB_209_OPENING_PROFILE.schema,
    application: CURRENT_PCB_209_OPENING_PROFILE.application, validationOnly: true, connectedValidation: false,
    startupCompletionVerified: false, completeLiveBaselineVerified: false, executionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209OpeningRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "A separate pcb209-* original native owner supports one disposable project opening, one PCB opening and exact UI/PCB source and identity observations. No legacy206 worker, model or precreate reader is admitted.",
      "Opening uses the original fixed public project/document services. Startup and opening can restore tabs, migrate data, replay caches, contact services, change shared settings and automatically persist or Save. This is not profile isolation or a zero-write operation.",
      "The original file checkpoint, default branch and existing PCB membership bind the one-shot target. Repeating an ambiguous open is forbidden. Source/DOM identity and an acknowledged open do not establish ratline completion, complete geometry, contained destinations, writer eligibility or saved-state proof.",
      "The existing native helper retains the original process, Job and pipe through normal close, observed original termination and release. No force termination or Save/Discard choice is offered. Restarted hosts cannot reconstruct that ownership from records.",
      "After accepted original PCB opening, observe-layers consumes one double-sampled native layer collection with identity checks before and after both samples. It returns the nine-field getAllLayers projection and enabled native SIGNAL/PLANE count plus two. Raw colors are not repaired. This is not a physical stackup, complete startup, saved state or writer baseline. getCurrentLayer remains excluded.",
      "After accepted original PCB opening, observe-primitives consumes two matching bounded native collections for Line, Arc, Via and parentless String, with ordered IDs and source-derived geometry projections. Only existing native views are included; models without views, component text, other families, complete-board membership, connectivity and saved-state proof are excluded. This native task equivalent is not public SDK instance parity or writer authority.",
      "The separate observe-extended-primitives stage observes Component, Pad, Attribute, Dimension and Image loaded-view projections and ordered IDs twice. Attribute parent groups retain observed ordering, including empty groups. These samples do not prove reciprocal ownership, symbol-pin mapping, image assets, rendered geometry, saved membership or a complete writer baseline.",
      "The separate observe-selection-relations stage compares two complete nine-family projections bracketed by selected-ID lists and native identity reads. Optional componentIds requests at most16 observed Component child-pad groups, correlated with global Pad rows using identity and raw scalar fields. Selection order and child order are preserved; unsupported or missing selected objects and inconsistent child groups refuse. This is observed membership, not reciprocal ownership, electrical pin mapping or saved state.",
      "observe-pad-shapes separately observes complete supported Pad rows and native top/inner/bottom special style groups twice. Groups retain exact native selectors; they are not physical layer expansion. Unsupported or incomplete groups refuse whole. Empty groups mean only that the native serializer emitted none. This stage preserves existing decoder versions and provides no fabrication or saved-state proof.",
      "observe-image-shapes separately observes Image/Picture rows with their serialized vector paths or opaque asset references. It accepts a bounded native path grammar, retains per-ID association and compares two matching samples. No asset content, font, rendered boundary, filesystem loading or public SDK instance parity is supplied.",
      "query-observation projects one published primitive observation by its exact result-record hash and original journal target. It performs no live read, requires no current native owner, and cannot reopen an attempt or establish freshness. Exact IDs and supported scalar filters retain historical scope; unavailable families, missing IDs and unobserved component groups refuse.",
      "The 103-request and 64MiB diagnostic transport budgets are unchanged. No ratline worker capture, debugger pause or user-selected native command is exposed.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209OpeningRequestSchema) } : {}) };
}

export function validateCurrentPcb209OpeningArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209OpeningRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
