/** Passive original stock refusal data only. No SQL, handles, source text,
 * paths, Error properties, transport requests or continuation leave here. */
import { z } from "zod";
import { CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "./current-main-startup-library-catalog.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as LIVE } from "./current-main-startup-library-v2-profile.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES as SITES } from "./current-selected-file-main-sql-fence-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSelectedFileMainSqlStartupPauseLocations } from "./current-selected-file-main-sql-startup-refusal-context.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const coordinate = z.number().int().min(0).max(SOURCE.app.bytes), count = z.number().int().min(0).max(64);
const frameIndex = z.number().int().min(0).max(63);
const locations = z.strictObject({ totalFrames: count.min(1), omittedForeignScript: count, omittedOutsideSource: count,
  locations: z.array(z.strictObject({ frameIndex, lineNumber: coordinate, columnNumber: coordinate })).max(64),
}).refine(value => value.locations.length + value.omittedForeignScript + value.omittedOutsideSource === value.totalFrames &&
  value.locations.every((item, index) => item.frameIndex < value.totalFrames && (index === 0 || item.frameIndex > (value.locations[index - 1]?.frameIndex ?? item.frameIndex))));
const progress = z.strictObject({ receiverBound: z.boolean(), receiverLimit: z.literal(1), scriptCallsConsumed: z.number().int().min(0).max(332), allCallsConsumed: z.boolean(),
  normalReturnProven: z.literal(false), nativeCompletionProven: z.literal(false), readonlySql: z.literal(false), selectedProjectWriteGrant: z.literal(false), retryAllowed: z.literal(false),
}).refine(value => value.allCallsConsumed === (value.receiverBound && value.scriptCallsConsumed === 332) && (value.receiverBound || value.scriptCallsConsumed === 0));
/** Separate optional artifact contract. Historical public v1 snapshots and
 * every existing startup selection/parser/count remain unchanged. */
export const currentMainStartupLibraryRefusalContextSchema = z.strictObject({
  profile: z.literal("private.current-main-startup-library-refusal-context.v1"), reason: z.literal("original-lineage-refused"), site: z.enum(SITES),
  sourceSha256: z.literal(SOURCE.app.sha256), firstCall: z.boolean(), originEnrolled: z.boolean(), callFrames: locations, progress,
  stockRequests: z.number().int().min(0).max(LIVE.requests), sourceQualified: z.literal(true), originalFailureRetained: z.literal(true), additionalRequests: z.literal(0),
  callStackReevaluated: z.literal(false), selectionReevaluated: z.literal(false), resumeAuthorized: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
});
export type CurrentMainStartupLibraryRefusalContext = z.infer<typeof currentMainStartupLibraryRefusalContextSchema>;
/** The runner supplies only its already captured original locations and own
 * scalar progress. Copies can explain a refusal, never enroll an origin. */
export function createCurrentMainStartupLibraryRefusalContext(site: CurrentMainStartupLibraryRefusalContext["site"], firstCall: boolean, originEnrolled: boolean,
  stockRequests: number, snapshot: unknown, callFrames: CurrentSelectedFileMainSqlStartupPauseLocations): CurrentMainStartupLibraryRefusalContext {
  return freezeDeep(currentMainStartupLibraryRefusalContextSchema.parse({ profile: "private.current-main-startup-library-refusal-context.v1", reason: "original-lineage-refused", site,
    sourceSha256: SOURCE.app.sha256, firstCall, originEnrolled, stockRequests, progress: captureCurrentPcbStringClockReply(snapshot).value,
    callFrames: captureCurrentPcbStringClockReply(callFrames).value, sourceQualified: true, originalFailureRetained: true, additionalRequests: 0,
    callStackReevaluated: false, selectionReevaluated: false, resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false }));
}
