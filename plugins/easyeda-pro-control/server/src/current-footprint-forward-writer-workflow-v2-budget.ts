/** Data-only current recovery reservation. Historical v1 remains immutable. */
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET as V1 } from "./current-footprint-forward-writer-workflow-budget.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_PROFILE="private.current-footprint-forward-writer-workflow.v2";
const additionalRecords=4;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET=Object.freeze({
 ...V1,cleanupRecords:V1.cleanupRecords+additionalRecords,records:V1.records+additionalRecords,
 cleanupBytes:V1.cleanupBytes+additionalRecords*V1.cleanupRecordBytes,
 manifestBytes:V1.manifestBytes+additionalRecords*(V1.cleanupRecordBytes+V1.artifactPathUnits+512),
 releaseAttemptsPerGeneration:2,
});
