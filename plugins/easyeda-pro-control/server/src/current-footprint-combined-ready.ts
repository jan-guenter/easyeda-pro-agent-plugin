/** Data-only native readiness contract. A parsed packet grants no factory,
 * application process, termination or writer authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_FOOTPRINT_COMBINED_READY = Object.freeze({
  schema: "easyeda-pro-control.footprint-combined-ready.v1", maximumBytes: 512,
  milliseconds: 15_000, eofCleanupMilliseconds: 15_000, stderrBytes: 65_536,
} as const);
const readySchema = z.object({ schema: z.literal(CURRENT_FOOTPRINT_COMBINED_READY.schema),
  challenge: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u), helperInstance: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u), jobId: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u),
  creationState: z.literal("not-entered"), processCreated: z.literal(false), emptyJob: z.literal(true), pipesChecked: z.literal(true),
}).strict();
export type CurrentFootprintCombinedReadyPacket = Readonly<z.infer<typeof readySchema>>;
export const currentFootprintCombinedBeforeLaunchFailureProofSchema = z.object({
  profile: z.literal("private.current-footprint-combined-before-launch-failure.v1"), helperTransportClosed: z.literal(true),
  launchRequestWritten: z.literal(false), applicationLaunchDispatched: z.literal(false), terminationProved: z.literal(false),
}).strict();
export type CurrentFootprintCombinedBeforeLaunchFailureProof = Readonly<z.infer<typeof currentFootprintCombinedBeforeLaunchFailureProofSchema>>;
export const currentFootprintCombinedFactoryFailureDiagnosticsSchema = z.object({
  profile: z.literal("private.current-footprint-combined-factory-failure-diagnostics.v1"),
  helperClosed: z.boolean(), failure: z.string().regex(/^[A-Z][A-Z_]{0,79}(?![\s\S])/u).nullable(),
  readinessObserved: z.boolean(), launchInvoked: z.boolean(), stdinBytesWritten: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  stderr: z.object({ bytes: z.number().int().min(0).max(CURRENT_FOOTPRINT_COMBINED_READY.stderrBytes),
    sha256: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u).nullable(), truncated: z.boolean() }).strict()
    .refine(value => (value.bytes === 0) === (value.sha256 === null)),
}).strict();
export type CurrentFootprintCombinedFactoryFailureDiagnostics = Readonly<z.infer<typeof currentFootprintCombinedFactoryFailureDiagnosticsSchema>>;
export function decodeCurrentFootprintCombinedReady(value: unknown): CurrentFootprintCombinedReadyPacket {
  return Object.freeze(readySchema.parse(captureCurrentPcbStringClockReply(value).value));
}
/** The actual original helper has allocated its empty Job and checked pipe
 * inheritance. It cannot dispatch Launch until the owner writes a request. */
export function currentFootprintCombinedReadyNativeSource(): string {
  return `  # BEGIN GENERATED FOOTPRINT COMBINED READY
  if ($WorkerStartupFootprintCombined209 -and -not $CompileOnly) {
    $readyState=$owner.NoProcessCreationState()
    if ($readyState -cne 'not-entered' -or $owner.RootPid -ne 0 -or $owner.RootCreated -cne '0') {throw 'pcb-diagnostic-combined-ready-state'}
    @{schema='${CURRENT_FOOTPRINT_COMBINED_READY.schema}';challenge=$CombinedReadyChallenge;helperInstance=$owner.HelperInstance;jobId=$owner.JobId;creationState=$readyState;processCreated=$false;emptyJob=$true;pipesChecked=$true} | ConvertTo-Json -Compress
  }
  # END GENERATED FOOTPRINT COMBINED READY`;
}
