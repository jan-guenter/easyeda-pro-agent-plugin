/** Inert argument/schema discovery. Matching data cannot issue an original
 * fixture token, native owner, dispatch, cleanup or saved-state proof. */
import { z } from "zod";
import { CURRENT_PCB_VIA_WRITE_CLEANUP_ACTIONS, CURRENT_PCB_VIA_WRITE_TOOL, currentPcbViaWriteActionSchema, currentPcbViaWriteResultSchema } from "./current-pcb-via-write-contract.ts";
import { facadeToolRegistered } from "./facade-mode.ts";
import { currentPcbViaWriteDiagnosticSchema } from "./current-pcb-via-write-diagnostic.ts";
import {currentPcbViaWriteMainFailureSchema} from "./current-pcb-via-write-main-failure.ts";

export function queryCurrentPcbViaWrite(includeSchemas = false): Record<string, unknown> {
  return { offline: true, tool: CURRENT_PCB_VIA_WRITE_TOOL, mountedInPublicUtilities: facadeToolRegistered("public-utilities-only", CURRENT_PCB_VIA_WRITE_TOOL),
    validationOnly: true, runtimeAdmissionRequired: true, sourceAdmissionRequired: true,
    executionAuthorized: false, connectedValidation: false, ordinaryProjectsSupported: false, inverseAvailable: false,
    scope: "one-normal-unlocked-empty-net-Via-in-an-original-generated-via-only-or-line-and-via-PCB",
    actions: ["prepare", "execute", ...CURRENT_PCB_VIA_WRITE_CLEANUP_ACTIONS],
    originalReleasedClosedDataQualificationRequired: true, originalControllerRequired: true, freshSavedReaderRequired: true,
    maximumCreateAttempts: 1, maximumSaveAttempts: 1,
    limitations: [
      "Prepare consumes only the explicitly named released original PCB data qualification; JSON, paths and prior process IDs cannot create it.",
      "Execute requires every fixed confirmation, current installation/source admission and no competing retained workflow. An original refused or uncertain attempt cannot be replayed.",
      "A Save acknowledgement alone is not completion. Original writer and reader closure, helper release, complete SQL/source comparisons and reopened verification remain separate requirements.",
      "Failed cleanup stays with its original controller. Settle original publication before bounded cleanup settlement; an unknown Abort acknowledgement allows only independent original exit observation, not a second Abort.",
      "An immutable abandonment record may clear historical quarantine after actual original resource closure. It preserves failed saved/reopened status and grants no inverse, retry or owner transfer.",
      "The separate Main failure snapshot retains only bounded original runner data before cleanup, without Error text, paths or continuation authority.",
      "Schema discovery and controller implementation do not establish connected execution. Ordinary projects, named nets and inverses remain outside this disposable composition.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbViaWriteActionSchema), outputSchema: z.toJSONSchema(currentPcbViaWriteResultSchema), diagnosticSchema: z.toJSONSchema(currentPcbViaWriteDiagnosticSchema), mainFailureSchema:z.toJSONSchema(currentPcbViaWriteMainFailureSchema) } : {}) };
}
export function validateCurrentPcbViaWriteArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbViaWriteActionSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false, saveAuthorized: false, ordinaryProjectsSupported: false } : {
    valid: false, executionAuthorized: false, saveAuthorized: false, ordinaryProjectsSupported: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
