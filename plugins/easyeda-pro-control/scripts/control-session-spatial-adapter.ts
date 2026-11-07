/** Strict comparison/cleanup data for one original spatial request. These
 * values supply no client, process, Job, native binding or replay authority. */
import { z } from "zod";
import { currentPcbSpatialRequestSchema } from "../server/src/current-pcb-spatial-validation.ts";
import { currentPcbComponentSpatialRequestSchema } from "../server/src/current-pcb-component-spatial-validation.ts";
import { diagnosticLifecycleBindingSchema } from "../server/src/current-pcb-diagnostic-binding-schema.ts";

const TOOL = "easyeda_control_pcb209_opening";
const spatialWrapper = z.strictObject({ action: z.literal("spatial"), request: currentPcbSpatialRequestSchema });
const componentWrapper = z.strictObject({ action: z.literal("component-spatial"), request: currentPcbComponentSpatialRequestSchema });
const familySchema = z.discriminatedUnion("action", [spatialWrapper, componentWrapper]);
const outer = z.strictObject({ request: familySchema });
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
export interface OriginalSpatialManagerRequest {
  readonly family: "spatial" | "component-spatial";
  readonly operationId: string;
  readonly action: string;
  readonly expectedBindingSha256: string | null;
}
export interface OriginalSpatialManagerRecovery {
  bindingSha256?: string;
  intentSha256?: string;
  hwnd?: string;
  busy: boolean;
  unlaunchedCleanupAvailable: boolean;
  noProcessCleanupAvailable: boolean;
  normalCloseAttempted: boolean;
  componentAbortAttempted: boolean;
  releaseAttempted: boolean;
  prelaunchCleanupAttempted: boolean;
}
export const spatialManagerCleanupSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("inspect") }), z.strictObject({ action: z.literal("observe-window") }),
  z.strictObject({ action: z.literal("normal-close"), confirmNormalClose: z.literal(true) }),
  z.strictObject({ action: z.literal("abort-component"), confirmAbortOriginalComponentJob: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-termination") }), z.strictObject({ action: z.literal("release-closed") }),
  z.strictObject({ action: z.literal("settle-records") }), z.strictObject({ action: z.literal("cleanup-before-launch") }),
  z.strictObject({ action: z.literal("cleanup-no-process") }),
]);
export function captureOriginalSpatialManagerRequest(tool: string, input: unknown): OriginalSpatialManagerRequest | null {
  if (tool !== TOOL) { return null; } const parsed = outer.safeParse(input); if (!parsed.success) { return null; }
  const wrapped = parsed.data.request; const request = wrapped.request;
  return Object.freeze({ family: wrapped.action, operationId: request.operationId, action: request.action,
    expectedBindingSha256: "expectedBindingSha256" in request ? request.expectedBindingSha256 : null });
}
export function createOriginalSpatialManagerRecovery(original: OriginalSpatialManagerRequest | null): OriginalSpatialManagerRecovery {
  return { busy: true, unlaunchedCleanupAvailable: false, noProcessCleanupAvailable: false,
    componentAbortAttempted: original?.action === "abort-component", normalCloseAttempted: original?.action === "normal-close", releaseAttempted: original?.action === "release-closed",
    prelaunchCleanupAttempted: original?.action === "cleanup-unlaunched" || original?.action === "cleanup-no-process" };
}
export function isOriginalSpatialManagerControl(action: string, inFlight = false, family?: OriginalSpatialManagerRequest["family"]): boolean {
  if (action === "abort-component" && family !== "component-spatial") { return false; }
  return inFlight ? action === "inspect" || action === "abort-component" && family === "component-spatial" : spatialManagerCleanupSchema.options.some(option => option.shape.action.value === action);
}
/** Learn only from a fresh private-attempt inspection on the retained manager
 * client. Historical-looking bindings without that private marker do not join. */
export function learnOriginalSpatialManagerInspection(original: OriginalSpatialManagerRequest, recovery: OriginalSpatialManagerRecovery, envelope: unknown): void {
  const fields = z.looseObject({ operationId: z.literal(original.operationId), busy: z.boolean(), publicationSettlementAvailable: z.literal(true), intentSha256: digest,
    launchAcknowledged: z.boolean().optional(), binding: diagnosticLifecycleBindingSchema.optional(), bindingSha256: digest.optional(),
    unlaunchedCleanupAvailable: z.boolean().optional(), noProcessCleanupAvailable: z.boolean().optional(), closeAttemptConsumed: z.boolean(), releaseAttemptConsumed: z.boolean(), componentAbortAttemptConsumed: z.boolean().optional() });
  const content = z.looseObject({ ok: z.literal(true).optional(), result: fields });
  const schema = z.looseObject({ isError: z.literal(false).optional(), structuredContent: content });
  recovery.busy = true;
  const parsed = schema.safeParse(envelope); if (!parsed.success) { return; } const value = parsed.data.structuredContent.result;
  if (recovery.intentSha256 !== undefined && recovery.intentSha256 !== value.intentSha256) { throw new Error("manager-spatial-original-intent-changed"); }
  if ((value.launchAcknowledged === true || original.family === "component-spatial") && value.binding !== undefined && value.binding.rootCreated !== "0" && value.bindingSha256 !== undefined) {
    if (original.expectedBindingSha256 !== null && original.expectedBindingSha256 !== value.bindingSha256 ||
      recovery.bindingSha256 !== undefined && recovery.bindingSha256 !== value.bindingSha256) { throw new Error("manager-spatial-original-binding-changed"); }
    recovery.bindingSha256 = value.bindingSha256;
  }
  recovery.intentSha256 = value.intentSha256; recovery.busy = value.busy;
  recovery.unlaunchedCleanupAvailable = value.unlaunchedCleanupAvailable === true; recovery.noProcessCleanupAvailable = value.noProcessCleanupAvailable === true;
  recovery.componentAbortAttempted ||= value.componentAbortAttemptConsumed === true;
  recovery.normalCloseAttempted ||= value.closeAttemptConsumed; recovery.releaseAttempted ||= value.releaseAttemptConsumed;
}
export function learnOriginalSpatialManagerWindow(original: OriginalSpatialManagerRequest, recovery: OriginalSpatialManagerRecovery, envelope: unknown): void {
  if (recovery.bindingSha256 === undefined) { throw new Error("manager-spatial-inspection-required"); }
  const hwnd = z.string().regex(/^[1-9]\d{0,18}$/u).nullable();
  const fields = z.looseObject({ operationId: z.literal(original.operationId), bindingSha256: z.literal(recovery.bindingSha256), launchAcknowledged: z.literal(true), hwnd });
  const content = z.looseObject({ ok: z.literal(true).optional(), result: fields });
  const schema = z.looseObject({ isError: z.literal(false).optional(), structuredContent: content });
  delete recovery.hwnd;
  const parsed = schema.safeParse(envelope);
  if (parsed.success) {
    if (parsed.data.structuredContent.result.hwnd === null) { delete recovery.hwnd; }
    else { recovery.hwnd = parsed.data.structuredContent.result.hwnd; }
  }
}
/** The manager supplies family, operation, binding, intent and HWND from its
 * original request/receipts. The selector can confirm only one normal close. */
export function originalSpatialManagerControl(original: OriginalSpatialManagerRequest, recovery: OriginalSpatialManagerRecovery, input: unknown): Readonly<{ tool: typeof TOOL; arguments: z.infer<typeof outer> }> {
  const selected = spatialManagerCleanupSchema.parse(input); const action = selected.action;
  if (action === "abort-component" && (original.family !== "component-spatial" || recovery.componentAbortAttempted)) { throw new Error("manager-spatial-component-abort-consumed-or-purpose"); }
  if (recovery.componentAbortAttempted && !["inspect", "observe-termination", "release-closed", "settle-records"].includes(action)) { throw new Error("manager-spatial-component-cleanup-only"); }
  if (action !== "inspect" && action !== "abort-component" && recovery.busy) { throw new Error("manager-spatial-inspection-required"); }
  const request: Record<string, unknown> = { action, operationId: original.operationId };
  if (action === "cleanup-before-launch" || action === "cleanup-no-process" || action === "settle-records") {
    if (recovery.intentSha256 === undefined || action !== "settle-records" && (recovery.prelaunchCleanupAttempted ||
      !(action === "cleanup-before-launch" ? recovery.unlaunchedCleanupAvailable : recovery.noProcessCleanupAvailable))) { throw new Error("manager-spatial-original-prelaunch-inspection-required"); }
    request["action"] = action === "cleanup-before-launch" ? "cleanup-unlaunched" : action; request["expectedIntentSha256"] = recovery.intentSha256;
  } else if (action !== "inspect") {
    if (recovery.bindingSha256 === undefined) { throw new Error("manager-spatial-inspection-required"); } request["expectedBindingSha256"] = recovery.bindingSha256;
    if (action === "abort-component") { request["confirmAbortOriginalComponentJob"] = true; }
    if (action === "normal-close") {
      if (recovery.normalCloseAttempted || recovery.hwnd === undefined) { throw new Error("manager-spatial-original-window-required"); }
      request["hwnd"] = recovery.hwnd; request["confirmNormalClose"] = true;
    }
    if (action === "release-closed" && recovery.releaseAttempted) { throw new Error("manager-spatial-release-consumed"); }
  }
  const argumentsValue = outer.parse({ request: { action: original.family, request } });
  Object.freeze(argumentsValue.request.request); Object.freeze(argumentsValue.request); Object.freeze(argumentsValue);
  return Object.freeze({ tool: TOOL, arguments: argumentsValue });
}
/** Called synchronously immediately before the original SDK call, after durable
 * cleanup intent. A lost native reply never permits replay of close or release. */
export function consumeOriginalSpatialManagerControl(recovery: OriginalSpatialManagerRecovery, action: string): void {
  if (action === "abort-component") { recovery.componentAbortAttempted = true; }
  if (action === "normal-close") { recovery.normalCloseAttempted = true; }
  if (action === "release-closed") { recovery.releaseAttempted = true; }
  if (action === "cleanup-before-launch" || action === "cleanup-no-process") { recovery.prelaunchCleanupAttempted = true; }
}
