/** Bounds for modeled copy-v2 data only. The writer, producer qualification,
 * complete launch vocabulary and durable journal issuer are still unmounted. */
import { currentFootprintCopyV2Before } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { currentFootprintCopyV2NativeCreateArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import { assertCurrentFootprintCopyV2SqlInputs } from "./current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlPlan } from "./current-footprint-copy-v2-sql.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS } from "./current-footprint-copy-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES } from "./current-footprint-copy-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS } from "./current-footprint-copy-source-read-runner.ts";

const ARGUMENT_BYTES = 65_536;
const OBSERVATION_OVERHEAD_BYTES = 4096;
const ARTIFACT_OVERHEAD_BYTES = 65_536;
const SOURCE_RESULT_BYTES = 2 * CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes + OBSERVATION_OVERHEAD_BYTES;
const ARTIFACT_BYTES = 2 * CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes + ARTIFACT_OVERHEAD_BYTES;
export interface CurrentFootprintCopyV2Capacity {
  readonly profile: "private.current-footprint-copy-v2-modeled-capacity.v1";
  readonly nativeArgumentsJsonBytes: number;
  readonly nativeArgumentsStringBytes: number;
  readonly retainedDestinationUuidJsonBytes: 18;
  readonly maximumSavedContentBytes: number;
  readonly maximumSavedObservationBytes: number;
  readonly maximumSavedFrameBytes: number;
  readonly maximumSavedPacketArtifactBytes: number;
  readonly sourceObservationRequests: number;
  readonly savedObservationRequests: number;
  readonly cleanupRequestsPerGeneration: 32;
  readonly wholeLaunchBudgetReserved: false;
  readonly nativeWriterCommandReserved: false;
  readonly nativeReturnedResultReserved: false;
  readonly journalPublicationReserved: false;
  readonly retainedRawReplyArtifactsReserved: false;
  readonly executionAuthorized: false;
}
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_V2_CAPACITY: ${detail}`); }
}

/** Completed original plans bound both history and chunk-cache getter forms.
 * A saved source consists of valid JSON atoms and framing whitespace. Encoding
 * that string in JSON costs at most twice its UTF-8 bytes plus quotes: JSON
 * atoms contain no literal control characters, and framing LF/CR/TAB double.
 * The second CDP string encoding doubles the first encoded observation again.
 * These are conservative reservations, never synthetic observed content. */
export function reserveCurrentFootprintCopyV2Capacity(copy: CurrentFootprintCopyV2Plan,
  sql: CurrentFootprintCopyV2SqlPlan): CurrentFootprintCopyV2Capacity {
  assertCurrentFootprintCopyV2SqlInputs(sql, copy, currentFootprintCopyV2Before(copy));
  const args = JSON.stringify(currentFootprintCopyV2NativeCreateArguments(copy));
  const nativeArgumentsJsonBytes = Buffer.byteLength(args), nativeArgumentsStringBytes = Buffer.byteLength(JSON.stringify(args));
  need(nativeArgumentsJsonBytes <= ARGUMENT_BYTES && nativeArgumentsStringBytes <= ARGUMENT_BYTES,
    "native argument encoding exceeds the maintained request ceiling");
  const maximumSavedContentBytes = Math.max(sql.maximumSavedRawSourceBytes, sql.maximumSavedCacheSourceBytes);
  const maximumSavedObservationBytes = 2 * maximumSavedContentBytes + OBSERVATION_OVERHEAD_BYTES;
  const maximumSavedFrameBytes = 2 * maximumSavedObservationBytes + OBSERVATION_OVERHEAD_BYTES;
  // One successful packet with bounded wrapper metadata. Separate raw replies,
  // Partial-failure evidence and any duplicate packet copies need their own
  // Artifact records and budgets in the future journal issuer.
  const maximumSavedPacketArtifactBytes = 2 * maximumSavedContentBytes + ARTIFACT_OVERHEAD_BYTES;
  need(Number.isSafeInteger(maximumSavedContentBytes) && maximumSavedContentBytes > 0 &&
    maximumSavedContentBytes <= CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes &&
    maximumSavedObservationBytes <= SOURCE_RESULT_BYTES && maximumSavedFrameBytes <= CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES &&
    maximumSavedPacketArtifactBytes <= ARTIFACT_BYTES, "complete saved-read envelope exceeds its modeled bounds");
  return Object.freeze({ profile: "private.current-footprint-copy-v2-modeled-capacity.v1",
    nativeArgumentsJsonBytes, nativeArgumentsStringBytes, retainedDestinationUuidJsonBytes: 18,
    maximumSavedContentBytes, maximumSavedObservationBytes, maximumSavedFrameBytes, maximumSavedPacketArtifactBytes,
    sourceObservationRequests: CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS,
    savedObservationRequests: CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS, cleanupRequestsPerGeneration: 32,
    wholeLaunchBudgetReserved: false, nativeWriterCommandReserved: false, nativeReturnedResultReserved: false,
    journalPublicationReserved: false, retainedRawReplyArtifactsReserved: false,
    executionAuthorized: false });
}
