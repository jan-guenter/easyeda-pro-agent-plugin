/** Inert argument discovery. JSON cannot supply an original fixture, native
 * completion, journal, cleanup or saved-reader acceptance. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_CLEANUP_ACTIONS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteActionSchema, currentSchematicRelevanceDisplayWriteResultSchema } from "./current-schematic-relevance-display-write-contract.ts";
import { currentSchematicRelevanceDisplayWriteDiagnosticSchema } from "./current-schematic-relevance-display-write-diagnostic.ts";
import { facadeToolRegistered } from "./facade-mode.ts";

export function queryCurrentSchematicRelevanceDisplayWrite(includeSchemas = false): Record<string, unknown> {
  return { offline: true, tool: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, mountedInPublicUtilities: facadeToolRegistered("public-utilities-only", CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL),
    validationOnly: true, runtimeAdmissionRequired: true, sourceAdmissionRequired: true,
    executionAuthorized: false, connectedValidation: false, ordinaryProjectsSupported: false, inverseAvailable: false,
    scope: "one-Text-display-patch-in-an-original-generated-seven-record-explicit-Relevance-schematic",
    actions: ["prepare", "execute", ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_CLEANUP_ACTIONS],
    originalReleasedClosedDataQualificationRequired: true, originalControllerRequired: true, freshSavedReaderRequired: true,
    maximumModifyAttempts: 1, maximumSaveAttempts: 1,
    limitations: [
      "Prepare consumes only the named released original explicit-Relevance schematic data token. Other fixture families refuse before their source is spent.",
      "Execute requires all original group methods and their genuine completion receipts. Missing Modify/Save/drain composition refuses before allocation; matching JSON or an SDK acknowledgement cannot replace it.",
      "The fixed Text display patch preserves the Relevance ATTR and all peers. Root zIndex normalization is an explicit in-memory bookkeeping effect; no general text, wiring or connectivity edit is admitted.",
      "One original Modify and one Save require the retained worker, UI, Main SQL, producer and cache continuations. A separate saved-reader generation must prove cold load, complete scene, full closed SQL, normal closure and helper release.",
      "Failure cleanup retains the original Job, request and publication promises. Unknown abort acknowledgement permits original exit observation, never another abort or a replacement owner.",
      "A separate immutable abandonment receipt can settle historical admission after genuine resource closure. It retains saved/reopened=false and grants no retry, inverse or ownership transfer.",
      "Source implementation and synthetic orchestration tests do not establish connected execution. Ordinary projects, other schematic profiles and unsupported inverse operations remain outside this route.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentSchematicRelevanceDisplayWriteActionSchema), outputSchema: z.toJSONSchema(currentSchematicRelevanceDisplayWriteResultSchema), diagnosticSchema: z.toJSONSchema(currentSchematicRelevanceDisplayWriteDiagnosticSchema) } : {}) };
}
export function validateCurrentSchematicRelevanceDisplayWriteArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSchematicRelevanceDisplayWriteActionSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false, saveAuthorized: false, ordinaryProjectsSupported: false } : {
    valid: false, executionAuthorized: false, saveAuthorized: false, ordinaryProjectsSupported: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
