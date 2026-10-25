/** Durable data decoding only. No parsed packet supplies a native owner,
 * Worker/CDP identity association, continuation capability or writer authority. */
import { z } from "zod";
import type { CurrentPcb209RatlineNativePacket } from "./current-pcb-209-ratline-native-session.ts";
import { CURRENT_PCB_209_RATLINE_ORIGIN_EVIDENCE_BYTES, currentPcb209RatlineOriginEvidenceSchema,
  currentPcb209RatlineOriginSummarySchema, inspectCurrentPcb209RatlineOriginEvidence } from "./current-pcb-209-ratline-origin-observation.ts";

// Four independently bounded complete native observations plus at most8KiB
// Origin metadata and24KiB for the original packet, summary and journal fields.
// The complete288KiB purpose result fits the unchanged512KiB MCP response cap.
export const CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES = CURRENT_PCB_209_RATLINE_ORIGIN_EVIDENCE_BYTES + 24_576;
const digest = z.string().regex(/^[a-f0-9]{64}$/u), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const sourceFlags = { completeImportedSourceQualified: z.literal(true), importedSourceHeldBeforeExecution: z.literal(true),
  nativeWorkerTargetIdentityVerified: z.literal(false), continuousInstallationLeaseVerified: z.literal(false), executionAuthorized: z.literal(false) };
const pcbSource = z.object({ profile: z.literal("private.pcb209-ratline-pcb-bootstrap.v1"), sessionId: token, parentTargetId: token,
  frameId: token, contextId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), uniqueContextId: token,
  origin: z.literal("https://client"), frameUrl: z.literal("https://client/editor?entry=pcb"), scriptId: token,
  ...sourceFlags, nativeFrameAncestryVerified: z.literal(false) }).strict();
const childSource = z.object({ profile: z.literal("private.pcb209-ratline-bootstrap.v1"), childTargetId: token, childSessionId: token,
  scriptId: token, uniqueContextId: token, ...sourceFlags }).strict();
export const currentPcb209RatlineNativePacketSchema = z.object({ profile: z.literal("private.pcb209-ratline-native-held-import.v1"),
  targetSha256: digest, originalProjectConstructionSha256: digest, pcbSource, childSource, nativeOrigin: currentPcb209RatlineOriginSummarySchema,
  nativeOriginEvidence: currentPcb209RatlineOriginEvidenceSchema, originalFrameProofSets: z.literal(3),
  pcbNavigationAcknowledged: z.boolean(), firstChildImportHeld: z.literal(true), nativeWorkerTargetIdentityVerified: z.literal(false),
  completeStartupVerified: z.literal(false), completeLiveBaselineVerified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => value.pcbSource.sessionId !== value.childSource.childSessionId && value.pcbSource.parentTargetId !== value.childSource.childTargetId,
  "Parent and child cannot share the same CDP session or target.").refine(value => {
  try {
    const metadata = value.nativeOriginEvidence.metadata, observed = inspectCurrentPcb209RatlineOriginEvidence(value.nativeOriginEvidence);
    return JSON.stringify(observed) === JSON.stringify(value.nativeOrigin) && metadata.parentSessionId === value.pcbSource.sessionId &&
      metadata.parentScriptId === value.pcbSource.scriptId && metadata.childUniqueContextId === value.childSource.uniqueContextId;
  } catch { return false; }
}, "Origin summary, evidence digest or retained realm binding disagrees.") satisfies z.ZodType<CurrentPcb209RatlineNativePacket>;
