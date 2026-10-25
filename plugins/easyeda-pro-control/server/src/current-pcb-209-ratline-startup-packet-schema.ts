/** Durable data decoding only. No parsed packet supplies a native owner,
 * Worker/CDP identity association, continuation capability or writer authority. */
import { z } from "zod";
import type { CurrentPcb209RatlineNativePacket } from "./current-pcb-209-ratline-native-session.ts";

// Nine ASCII identifiers of at most256 bytes, two64-byte digests, the fixed
// URL, profiles, field names and flags fit below8KiB including journal metadata.
export const CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES = 8192;
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
  targetSha256: digest, originalProjectConstructionSha256: digest, pcbSource, childSource, originalFrameProofSets: z.literal(3),
  pcbNavigationAcknowledged: z.boolean(), firstChildImportHeld: z.literal(true), nativeWorkerTargetIdentityVerified: z.literal(false),
  completeStartupVerified: z.literal(false), completeLiveBaselineVerified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(value => value.pcbSource.sessionId !== value.childSource.childSessionId && value.pcbSource.parentTargetId !== value.childSource.childTargetId,
  "Parent and child cannot share the same CDP session or target.") satisfies z.ZodType<CurrentPcb209RatlineNativePacket>;
