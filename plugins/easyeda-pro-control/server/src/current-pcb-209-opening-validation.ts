/** Fixed 209 disposable navigation and original layer observation contract.
 * No worker/compiler observations, raw commands, writers or Save are admitted. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_209_OPENING_PROFILE } from "./current-pcb-209-opening-profile.ts";

const operationId = z.string().max(80).regex(/^pcb209-[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcb209OpeningRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(["browser", "frames", "script", "pcb-opening", "layers209"]).optional() }).strict(),
  z.object({ action: z.literal("settle-records"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("observe-layers"), ...bound }).strict(),
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
