/** Immutable journal-only reservation. Keeping this data leaf independent
 * of provider schemas avoids a budget/contract/native initialization cycle. */
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as LIMITS } from "./current-footprint-copy-execution.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_PROFILE = "private.current-footprint-forward-writer-workflow.v1";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES = Object.freeze(["opening", "metadata", "preaction", "request-arm", "create", "clocks", "local", "upload", "main", "drain", "timer", "create-result", "writer-snapshot", "closed-effect", "saved-allocation", "saved-cache", "saved-open", "saved-read", "saved-snapshot", "saved-checkpoint"] as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_CLEANUP_ACTIONS = Object.freeze(["close", "abort", "termination", "observers", "release", "unlaunched", "no-process", "no-allocation", "unowned-helper"] as const);
const stages = CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_STAGES;
const actions = CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_CLEANUP_ACTIONS;
const normalRecords = 2 * stages.length + 3;
const cleanupRecords = 2 * 2 * LIMITS.terminationObservationsPerGeneration + 2 * 2 * (actions.length - 1) + 1;
const records = normalRecords + cleanupRecords;
const recordBytes = 4096;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET = Object.freeze({ normalRecords, cleanupRecords, records, normalRecordBytes: recordBytes, cleanupRecordBytes: recordBytes,
  normalBytes: normalRecords * recordBytes, cleanupBytes: cleanupRecords * recordBytes, artifactPathUnits: 8192,
  manifestBytes: records * (recordBytes + 8192 + 512) + 65_536, terminationObservations: LIMITS.terminationObservationsPerGeneration,
  nativeRequestsAdded: 0, executionAuthorized: false });
