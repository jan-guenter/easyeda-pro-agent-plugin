/** Offline contract only. Discovery never starts a helper or grants execution. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";

const operationId = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcbDiagnosticValidationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(["browser", "frames", "script", "workers", "worker-script", "worker-state", "pcb-opening", "model-state"]).optional() }).strict(),
  z.object({ action: z.literal("settle-records"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.enum(["ui", "pcb", "public-api"]) }).strict(),
  z.object({ action: z.literal("inspect-workers"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-worker-script"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("observe-worker-state"), ...bound }).strict(),
  z.object({ action: z.literal("observe-model-state"), ...bound }).strict(),
  z.object({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("observe-window"), ...bound }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-termination"), ...bound }).strict(),
  z.object({ action: z.literal("release-closed"), ...bound }).strict(),
]);
export type CurrentPcbDiagnosticValidationRequest = z.infer<typeof currentPcbDiagnosticValidationRequestSchema>;
export const currentPcbDiagnosticValidationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryCurrentPcbDiagnosticValidation(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbDiagnosticValidationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_pcb_diagnostic_validation", registrationEnabled: true, validationOnly: true,
    invocationEnabledByDiscovery: false, executionAuthorized: false, connectedValidation: false, frameWorkerVerified: false,
    startupQualified: false, projectFreeVerified: false, profileIsolated: false, savedStateVerified: false,
    actions: ["launch", "inspect", "browser-observation", "inspect-frames", "inspect-script", "inspect-workers", "inspect-worker-script",
      "observe-worker-state", "observe-model-state", "open-project", "open-pcb", "observe-pcb-opening", "observe-window", "normal-close",
      "observe-termination", "release-closed", "cleanup-unlaunched", "cleanup-no-process", "settle-records"],
    limitations: [
      "Validation-only native diagnostic startup uses compiled executable, PowerShell and asset identities. Existing-profile startup may restore projects, migrate data or persist settings. It is not project-free, profile-isolated or qualified design execution.",
      "One original helper owns a contained application and pipe. No TCP debugger listener is intentionally requested; socket absence is not verified. Ordinary and replacement launches are excluded until original termination, helper closure and durable settlement.",
      "One browser observation, one attachment to a target from its retained inventory, and one pinned UI/PCB/public-API script observation are available. Target and frame IDs are selectors within original retained observations, never owner-recreation tokens. No caller URL, executable, script-source hash, CDP method, expression or command is accepted.",
      "Only bounded identity summaries and event counts are returned. Source identity does not prove the project worker, compiler owner, complete drawing state, authenticated bridge, startup safety, writer authority or saved verification. No CAD edits or explicit Save are dispatched.",
      "After frame inspection, one fixed parent-scoped worker-only autoattachment may observe at most sixteen direct children without pausing them. A single retained worker can be selected for exact context and project-worker source admission, followed by one compiled descriptor-only state read with side-effect checking. No caller expression, script hash, context ID or arbitrary worker attachment is accepted.",
      "Worker state exposes bounded opaque identities, booleans, collection cardinalities and timer-presence markers, not queue values or design content. It does not establish renderer/compiler association, complete membership, latent callbacks, queue completion or writer eligibility. Start Page normally has no project worker.",
      "observe-model-state requires a separately retained, source-qualified existing PCB frame or the accepted original PCB-opening observation. Fixed reads report bounded main compiler counters, raw-string summaries, loaded custom-footprint participants and pending-producer state without Save or a writer. They do not bind the project worker, prove pending-producer completion or establish complete design content. The UI project-only opener does not create this PCB-frame authority.",
      "open-project is a single diagnostic disposable opening after exact UI source admission and before worker discovery. A managed checkpoint binds the original file hash, default branch and existing PCB membership; exact registered path and an empty editor are rechecked before the fixed public project-open service. Opening can migrate the file, replay caches, restore tabs, change shared metadata and automatically Save. It is not isolated or startup-qualified. A prefix event is not restoration completion, persistence or writer authority. Any uncertain attempt is consumed; only original-owner observation and cleanup remain.",
      "The project opener supports only the retained single top-level UI frame, exact selected-project same-document URL transition and source-derived project title transition. Restored schematic/PCB child frames, full navigation, context loss or any other title drift are refused after a possibly effective opening. Worker-only opening does not authorize drawing-frame creation or model observation.",
      "After an accepted original disposable project opening, open-pcb may dispatch one fixed document-open call for that same sealed target. It accepts no new path, document, frame or code. A separate observe-pcb-opening stage must prove one exact child, original DOM ownership, readiness and separately pinned PCB source before model inspection. Both stages are consumed once, exclude worker inspection and preserve cleanup after failure. An open acknowledgment alone is not readiness, persistence or writer authority.",
      "Every effectful stage is consumed once, including uncertain replies. Inspect retained outcomes instead of replaying. Settle-records publishes only absent exact original in-memory records; corrupt records are never replaced and JSON cannot recreate ownership after restart.",
      "Normal close requires the original observed window. No Save/Discard choice, force termination or process discovery is offered. Cleanup remains local to the original owner and does not require bridge authentication or full startup re-admission. Unlaunched cleanup requires original never-dispatched state and native empty-Job proof; a factory failure without a returned owner remains unresolved.",
      "Native creation starts suspended, verifies the original process image against retained file/ancestor identities, then resumes the primary thread once. A failed post-create image check can retain a suspended process without a GUI window. It is not a no-process refusal; no retry, forced termination or caller-controlled resume is available.",
      "cleanup-no-process requires the original launch intent and healthy retained helper after a settled rootless refusal. Native proof must show either no native launch request issued or an exact refused request with CreateProcess not entered or returning false with no process created. Helper closure and terminal publication must complete; missing replies, timeouts, lost owners, post-create states and corrupt journals cannot use this route. It is distinct from never calling the launch method and never authorizes replay.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbDiagnosticValidationRequestSchema) } : {}) };
}
export function validateCurrentPcbDiagnosticValidationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbDiagnosticValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
