import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";

export const CURRENT_SCHEMATIC_PAGE_OPENING_PROFILE = "easyeda-pro-control.current-schematic-page-opening.v1";
export const currentSchematicPageOpeningIdSchema = z.string().min(16).max(80).regex(/^sch209-open-[a-z0-9][a-z0-9_-]*$/u);
export const currentSchematicPageOpeningTargetSchema = currentDisposableOpenSealedTargetSchema.safeExtend({
  schematicUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u),
});
const openRequestSchema = z.strictObject({ action: z.literal("open"), operationId: currentSchematicPageOpeningIdSchema,
  target: currentSchematicPageOpeningTargetSchema, confirmOrdinaryProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) });
export const currentSchematicPageOpeningRequestSchema = z.discriminatedUnion("action", [openRequestSchema,
  z.strictObject({ action: z.literal("inspect"), operationId: currentSchematicPageOpeningIdSchema })]);
export type CurrentSchematicPageOpeningRequest = z.infer<typeof currentSchematicPageOpeningRequestSchema>;
export type CurrentSchematicPageOpeningTarget = z.infer<typeof currentSchematicPageOpeningTargetSchema>;
export const currentSchematicPageOpeningResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.current-schematic-page-opening-result.v1"),
  phase: z.enum(["preflight", "open"]), projectUuid: z.string(), branchUuid: z.string(), documentUuid: z.string(), schematicUuid: z.string(),
  tabId: z.string(), windowTabId: z.string().min(1).max(128), opened: z.boolean(), dispatchAttempted: z.boolean(),
  nativeWorkMayRemain: z.boolean(), startupCompletionVerified: z.literal(false), completeSourceVerified: z.literal(false),
  persistenceVerified: z.literal(false), executionAuthorized: z.literal(false), explicitSaveDispatched: z.literal(false),
}).refine(value => value.opened === (value.phase === "open") && value.dispatchAttempted === value.opened &&
  value.nativeWorkMayRemain === value.opened && value.tabId === `${value.documentUuid}@${value.projectUuid}`,
"Opening result contradicts its phase or target.");

export function queryCurrentSchematicPageOpening(input: unknown = {}): Record<string, unknown> {
  const query = z.strictObject({ includeSchemas: z.boolean().default(false) }).parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "schematic-page-open", profile: CURRENT_SCHEMATIC_PAGE_OPENING_PROFILE,
    ordinaryProjectsSupported: true, validationOnly: false, connectedValidation: false, explicitSaveDispatched: false, executionAuthorized: false,
    limitations: [
      "One existing ordinary SCH_PAGE and parent in the default branch of an already-loaded matching registered local project. Requires no editor tabs/PCB iframes before opening. Exact file hash, complete managed checkpoint, parent/page source membership, branch, registry path and native project/window receivers are mandatory. No different project is opened.",
      "The once-only public openDocument path can initialize drawings, update partition/title metadata, replay caches, contact services, change shared state and automatically persist or Save. confirmOrdinaryProject:true and acceptNormalOpenEffects:true acknowledge those effects. No unchanged-storage, passive-navigation or startup-completion promise is made.",
      "The maintained tracked dispatcher captures original process-tree execution authority and authenticated bridge scope before native dispatch. A durable consumed navigation journal precedes the call. Lost/timeout acknowledgments retain quarantine and cannot replay. Historical JSON cannot supply original ownership; use schematic-page-opening-inspect for local evidence only.",
      "Successful public acknowledgment and exact active target tab do not prove page-canvas readiness, full source, electrical connectivity or saved state. Use the separate schematic-page-read route afterward. There is no explicit Save, CAD edit, close/discard, prompt choice, restoration, generic UI command or writer action. Original application launch cleanup remains with its retained launch owner.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSchematicPageOpeningRequestSchema) } : {}) };
}
export function validateCurrentSchematicPageOpeningArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSchematicPageOpeningRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
