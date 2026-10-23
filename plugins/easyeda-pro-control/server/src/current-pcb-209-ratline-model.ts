/** Supplied semantic milestones for the generation209 empty-ratline branch.
 * This is a pure comparison model, not CDP capture. In particular its role IDs
 * and bridge associations are supplied claims, not native worker ownership. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const token = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u);
const nativeWorkerId = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const documentUuid = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const projectUuid = z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u);
const target = z.object({ projectUuid, documentUuid, pcbTargetId: token, pcbSessionId: token }).strict();
const role = z.object({ targetId: token, sessionId: token, parentTargetId: token, parentSessionId: token,
  nativeWorkerId, parentBridge: token }).strict();
const startupFlags = z.object({ useWebgl: z.boolean(), multiThreadingOnOpen: z.boolean(), needFlushService: z.boolean(),
  modelIsBuilt: z.boolean(), controllerIsBuilt: z.boolean(), engineHighlightReady: z.boolean() }).strict();

export const CURRENT_PCB_209_RATLINE_MILESTONES = Object.freeze([
  "initializer", "startup-created", "startup-entered", "subordinate-created", "subordinate-settled",
  "result-published", "result-received", "handler-returned",
] as const);

const result = z.string().min(1).max(256);
const milestone = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("initializer"), isPreview: z.literal(false), docType: z.literal(3),
    unRebuildRatline: z.literal(false), userWorker: z.literal(true), unActive: z.literal(false) }).strict(),
  z.object({ kind: z.literal("startup-created"), worker: role }).strict(),
  z.object({ kind: z.literal("startup-entered"), projectUuid, documentUuid, targetId: token, sessionId: token,
    nativeWorkerId, selfBridge: token }).strict(),
  z.object({ kind: z.literal("subordinate-created"), worker: role }).strict(),
  z.object({ kind: z.literal("subordinate-settled"), targetId: token, sessionId: token, nativeWorkerId,
    initialized: z.literal(true), workItemCount: z.literal(0), registryEntryRemoved: z.literal(true) }).strict(),
  z.object({ kind: z.literal("result-published"), targetId: token, sessionId: token, selfBridge: token, result }).strict(),
  z.object({ kind: z.literal("result-received"), parentBridge: token, result }).strict(),
  z.object({ kind: z.literal("handler-returned"), result, startupFlags,
    startupRegistryEntryRemoved: z.literal(true), compilerAllowPull: z.literal(true), copperOpenPcb: z.literal(true),
    dynamicCopperWorkers: z.literal(0), dynamicCopperTimers: z.literal(0) }).strict(),
]);
const trace = z.object({ target, milestones: z.array(milestone).max(CURRENT_PCB_209_RATLINE_MILESTONES.length) }).strict();
type Role = z.infer<typeof role>;

function refuse(code: string): never { throw new Error(`PCB209_RATLINE_TRACE_${code}`); }
function sameWorker(worker: Role | null, value: Readonly<{ targetId: string; sessionId: string }>): Role {
  if (worker === null || worker.targetId !== value.targetId || worker.sessionId !== value.sessionId) { refuse("WORKER"); }
  return worker;
}

/** A strict prefix is useful while planning capture. Terminal compatibility
 * requires all eight milestones; sparse flags and worker disappearance do not
 * complete it. The sequence is semantic, not cross-session CDP arrival order. */
export function inspectCurrentPcb209RatlineTrace(input: unknown): Readonly<{
  schema: "easyeda-pro-control.pcb209-ratline-trace.v1";
  receivedMilestones: number;
  nextMilestone: typeof CURRENT_PCB_209_RATLINE_MILESTONES[number] | null;
  terminalCompatible: boolean;
  remaining: readonly string[];
  suppliedDataOnly: true;
  originalNativeOwnershipVerified: false;
  startupCallbackCompletionVerified: false;
  completeLiveBaselineVerified: false;
  saveAuthorized: false;
  executionAuthorized: false;
}> {
  const parsed = trace.parse(captureCurrentPcbStringClockReply(input).value);
  let payload: string | null = null, selfBridge: string | null = null, startup: Role | null = null, subordinate: Role | null = null;
  for (const [index, event] of parsed.milestones.entries()) {
    if (event.kind !== CURRENT_PCB_209_RATLINE_MILESTONES[index]) { refuse("ORDER"); }
    switch (event.kind) {
      case "initializer": { break; }
      case "startup-created": {
        startup = event.worker;
        if (startup.parentTargetId !== parsed.target.pcbTargetId || startup.parentSessionId !== parsed.target.pcbSessionId ||
            startup.targetId === startup.parentTargetId || startup.sessionId === startup.parentSessionId) { refuse("STARTUP_PARENT"); }
        break;
      }
      case "startup-entered": {
        const worker = sameWorker(startup, event);
        if (event.projectUuid !== parsed.target.projectUuid || event.documentUuid !== parsed.target.documentUuid ||
            event.nativeWorkerId !== worker.nativeWorkerId) { refuse("WORLD"); }
        selfBridge = event.selfBridge; break;
      }
      case "subordinate-created": {
        subordinate = event.worker;
        if (startup === null || subordinate.parentTargetId !== startup.targetId || subordinate.parentSessionId !== startup.sessionId ||
            subordinate.targetId === startup.targetId || subordinate.targetId === parsed.target.pcbTargetId ||
            subordinate.sessionId === startup.sessionId || subordinate.sessionId === parsed.target.pcbSessionId ||
            subordinate.parentBridge === selfBridge) { refuse("SUBORDINATE_PARENT"); }
        // Native worker IDs are registry-local. Both factories may allocate0.
        break;
      }
      case "subordinate-settled": {
        if (sameWorker(subordinate, event).nativeWorkerId !== event.nativeWorkerId) { refuse("SUBORDINATE_ID"); }
        break;
      }
      case "result-published": {
        const worker = sameWorker(startup, event);
        if (event.selfBridge !== selfBridge || event.result !== JSON.stringify({ ratlineRes: [], workerName: worker.nativeWorkerId })) {
          refuse("PUBLICATION");
        }
        payload = event.result; break;
      }
      case "result-received": {
        if (startup === null || event.parentBridge !== startup.parentBridge || event.result !== payload) { refuse("RECEIVER"); }
        break;
      }
      case "handler-returned": {
        if (event.result !== payload || !event.startupFlags.multiThreadingOnOpen || !event.startupFlags.modelIsBuilt ||
            !event.startupFlags.controllerIsBuilt || event.startupFlags.needFlushService) { refuse("TERMINAL"); }
        break;
      }
      default: { refuse("KIND"); }
    }
  }
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-ratline-trace.v1", receivedMilestones: parsed.milestones.length,
    nextMilestone: CURRENT_PCB_209_RATLINE_MILESTONES[parsed.milestones.length] ?? null,
    terminalCompatible: parsed.milestones.length === CURRENT_PCB_209_RATLINE_MILESTONES.length,
    remaining: ["admit complete209 application and source tuple separately", "capture original initializer and both native Worker/bridge constructions",
      "bind original project-channel canvas receiver and exclude foreign publishers", "retain original publication, receiver and terminal callback events",
      "prove dynamic-copper async completion and all destination exclusions", "join a complete stable live/source/SQL baseline"],
    suppliedDataOnly: true, originalNativeOwnershipVerified: false, startupCallbackCompletionVerified: false,
    completeLiveBaselineVerified: false, saveAuthorized: false, executionAuthorized: false });
}
