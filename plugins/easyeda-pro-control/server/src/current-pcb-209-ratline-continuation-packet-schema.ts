/** Durable decoding of scoped observations; decoded JSON supplies no original
 * owner, target identity, continuation capability or writer authority. */
import { z } from "zod";
import { currentPcb209RatlineNativePacketSchema } from "./current-pcb-209-ratline-startup-packet-schema.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";
import { currentPcb209RatlineOriginEvidenceSchema, currentPcb209RatlineOriginSummarySchema, inspectCurrentPcb209RatlineOriginEvidence } from "./current-pcb-209-ratline-origin-observation.ts";
import type { CurrentPcb209RatlineContinuationNativePacket } from "./current-pcb-209-ratline-continuation-native-session.ts";
import { currentPcb209RatlineContinuationCapturesAgree, currentPcb209RatlineContinuationPayloadSchema as resultPayload,
  currentPcb209RatlineContinuationWorldSchema as world } from "./current-pcb-209-ratline-continuation-semantics.ts";
import { currentPcb209RatlineRetirementEvidenceSchema } from "./current-pcb-209-ratline-continuation-handoff.ts";

// The additional source, two captures and their strict bounded metadata fit the
// Existing 24 KiB result allowance beyond the separately bounded origin evidence.
export { CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES as CURRENT_PCB_209_RATLINE_CONTINUATION_RESULT_MAX_BYTES } from "./current-pcb-209-ratline-startup-packet-schema.ts";
const digest = z.string().regex(/^[a-f\d]{64}$/u), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const childSource = currentPcb209RatlineNativePacketSchema.shape.childSource, pcbSource = currentPcb209RatlineNativePacketSchema.shape.pcbSource;
const denied = { nativeWorkerTargetIdentityVerified: z.literal(false), callbackReturnCompletionVerified: z.literal(false),
  completeLiveBaselineVerified: z.literal(false), executionAuthorized: z.literal(false) };
function composite(role: "pcb" | "worker"): z.ZodType<CurrentPcb209RatlineContinuationNativePacket["continuation"]["pcb"]> {
  const sourceSha256 = z.literal(CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role].sha256);
  return z.object({ profile: z.literal("private.current-pcb209-ratline-composite.v1"), role: z.literal(role),
    construction: z.object({ profile: z.literal("private.current-pcb209-ratline-creation-boundary.v1"), role: z.literal(role), sourceSha256,
      constructorBoundaryObserved: z.literal(true), soleWaitingChildObserved: z.literal(true), requestedUrlSha256: digest,
      childTargetId: token, childSessionId: token, parentHeldAfterConstruction: z.literal(true), nativeWorkerTargetIdentityVerified: z.literal(false),
      childSourceQualified: z.literal(false), executionAuthorized: z.literal(false) }).strict(),
    capture: z.object({ profile: z.literal(role === "pcb" ? "private.current-pcb209-ratline-pcb-capture.v1" : "private.current-pcb209-ratline-worker-capture.v1"),
      sourceSha256, pauses: z.literal(role === "pcb" ? 5 : 9), nativeWorkerId: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
      resultPayload, world: role === "pcb" ? z.null() : world,
      originalFactoryAndBridgeEventsRetained: z.literal(true), originalTerminalReturnPauseRetained: z.literal(true), ...denied,
      subscribedCanvasPeerOwnershipVerified: z.literal(false), copperCompletionVerified: z.literal(false) }).strict(),
    originalConstructionAndBridgeWorkerMatch: z.literal(true), originalConstructionAndRegistryMatch: z.literal(true), childStartConsumedOnce: z.literal(true),
    nativePreexecutionSourceOwnershipVerified: z.literal(false), childSourceQualified: z.literal(false), ...denied,
    subscribedCanvasPeerOwnershipVerified: z.literal(false), copperCompletionVerified: z.literal(false),
  }).strict();
}
const retirementSourceSha256 = z.literal(CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker.sha256);
const workerRetirement = currentPcb209RatlineRetirementEvidenceSchema.extend({ role: z.literal("worker"), boundary: z.literal("pcb-received"),
  sourceSha256: retirementSourceSha256 });
const subordinateRetirement = currentPcb209RatlineRetirementEvidenceSchema.extend({ role: z.literal("subordinate"), boundary: z.literal("worker-initialized"),
  sourceSha256: retirementSourceSha256 });
const continuation = z.object({ profile: z.literal("private.pcb209-ratline-fresh-continuation.v1"), pcbSource, workerSource: childSource, subordinateSource: childSource,
  pcb: composite("pcb"), worker: composite("worker"), subordinate: z.object({ profile: z.literal("private.pcb209-ratline-subordinate-continuation.v1"),
    source: childSource, sourceResumeAcknowledged: z.literal(true), sourceResumeObserved: z.literal(true), ...denied }).strict(),
  retirements: z.object({ worker: workerRetirement, subordinate: subordinateRetirement }).strict(),
  nativeOrigin: currentPcb209RatlineOriginSummarySchema, nativeOriginEvidence: currentPcb209RatlineOriginEvidenceSchema,
  allThreeOriginalSourcesQualified: z.literal(true), ...denied, subscribedCanvasPeerOwnershipVerified: z.literal(false), copperCompletionVerified: z.literal(false),
  completeStartupVerified: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => {
  const sessions = [value.pcbSource.sessionId, value.workerSource.childSessionId, value.subordinateSource.childSessionId];
  const targets = [value.pcbSource.parentTargetId, value.workerSource.childTargetId, value.subordinateSource.childTargetId];
  return new Set(sessions).size === 3 && new Set(targets).size === 3 &&
    value.pcb.construction.childSessionId === value.workerSource.childSessionId && value.pcb.construction.childTargetId === value.workerSource.childTargetId &&
    value.worker.construction.childSessionId === value.subordinateSource.childSessionId && value.worker.construction.childTargetId === value.subordinateSource.childTargetId &&
    JSON.stringify(value.subordinate.source) === JSON.stringify(value.subordinateSource);
}, "Distinct retained source realms and construction ancestry disagree.").refine(value =>
  value.retirements.worker.parentSessionId === value.pcbSource.sessionId &&
  value.retirements.worker.childSessionId === value.workerSource.childSessionId &&
  value.retirements.worker.childTargetId === value.workerSource.childTargetId &&
  value.retirements.subordinate.parentSessionId === value.workerSource.childSessionId &&
  value.retirements.subordinate.childSessionId === value.subordinateSource.childSessionId &&
  value.retirements.subordinate.childTargetId === value.subordinateSource.childTargetId,
"Retirement boundaries must retain the exact source and parent realms.").refine(value =>
  currentPcb209RatlineContinuationCapturesAgree(value.pcb.capture, value.worker.capture),
"Worker publication, PCB receipt or captured worker identity disagree.").refine(value => {
  try { const metadata = value.nativeOriginEvidence.metadata;
    return JSON.stringify(inspectCurrentPcb209RatlineOriginEvidence(value.nativeOriginEvidence)) === JSON.stringify(value.nativeOrigin) &&
      metadata.parentSessionId === value.pcbSource.sessionId && metadata.parentScriptId === value.pcbSource.scriptId &&
      metadata.childUniqueContextId === value.workerSource.uniqueContextId;
  } catch { return false; }
}, "Origin summary, evidence digest or retained realm binding disagrees.");
export const currentPcb209RatlineContinuationNativePacketSchema = z.object({ profile: z.literal("private.pcb209-ratline-native-continuation.v1"),
  targetSha256: digest, originalProjectConstructionSha256: digest, continuation, pcbNavigationAcknowledged: z.boolean(), ...denied,
  completeStartupVerified: z.literal(false), saveAuthorized: z.literal(false),
}).strict() satisfies z.ZodType<CurrentPcb209RatlineContinuationNativePacket>;
