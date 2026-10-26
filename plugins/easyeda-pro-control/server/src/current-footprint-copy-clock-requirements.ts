/** The two native qe calls belong to different document producers. This
 * unmounted contract describes evidence still required; no clock is sampled. */
import { CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE } from "./current-footprint-copy-create-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CLOCK_REQUIREMENTS = freezeDeep({
  profile: "private.current-footprint-copy-clock-requirements.v1",
  documentProducers: [
    { role: "buildString", sourceSha256: CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE.worker.spans.buildString.sha256,
      nativeClockFunction: "qe", nativeCallOrdinal: 1, result: "metadata-DOCHEAD-updateTime-and-version" },
    { role: "canvasString", sourceSha256: CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE.worker.spans.canvasString.sha256,
      nativeClockFunction: "qe", nativeCallOrdinal: 2, result: "canvas-DOCHEAD-updateTime-and-version" },
  ],
  qeSourceSha256: CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE.worker.spans.serverTime.sha256,
  distinctNativeResultsRequired: 2,
  resultValuesMayCoincide: true,
  callIdentityMayBeMerged: false,
  projectWorkerLocalDateMaySupplyServerTime: false,
  footprintUser: "own-undefined",
  backendClock: { distinctFromDocumentClock: true, originalWindowsClockBracketRequired: true,
    localOffsetAndZoneRulesRequired: true, terminalOriginalGenerationClockRequired: true },
  // The current SQL comparator admits one bounded union covering both
  // Document calls. Retaining that union does not eliminate either call's
  // Individual provenance, returned value or original native request identity.
  sqlDocumentWindow: { positiveMinimumRequired: true, maximumSpanMs: 60_000, coversBothDocumentResults: true },
  nativeClockRequestCount: null,
  nativeClockAdapterImplemented: false,
  nativeClockRequestsReserved: false,
  clockProvenanceVerified: false,
  executionAuthorized: false,
} as const);
