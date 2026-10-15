/** Historical inputs for a future source-pinned, local project-only opening.
 * No bridge call, live cache observation, opening or writer authority is issued.
 */
import { sha256Json } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
import { selectCurrentStartupSql } from "./current-startup-sql.ts";
import type { CurrentStartupSqlInput } from "./current-startup-sql.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";

type Blocker = "unsupported-sql-schema" | "unsupported-database-version" | "target-pcb-count-witness-unavailable" | "active-schematic-pages";
export interface CurrentStartupPremises {
  readonly profile: "private.current-startup-premises.v1";
  readonly scope: "historical-closed-default-branch";
  readonly implementationProfileSha256: string;
  readonly sourceSha256: string;
  readonly checkpointSha256: string;
  readonly sqlLogicalSha256: string;
  readonly historySemanticSha256: string;
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly documentUuid: string;
  readonly sqlSchemaSupported: boolean;
  readonly databaseVersion: string | null;
  readonly targetPcbSuppliesNonzeroNativeCount: boolean;
  readonly activeSchematicPages: number;
  readonly historicalSubsetSatisfied: boolean;
  readonly blockers: readonly Blocker[];
  readonly localEditorVersionUpdate: "source-reviewed-backend-no-op";
  readonly localProjectDetailExamInfo: "source-reviewed-field-omitted";
  readonly runtimeExamStateVerified: false;
  readonly preOpeningContinuityVerified: false;
  readonly startupQualified: false;
  readonly openingEffectsVerified: false;
  readonly executionAuthorized: false;
}

/** The owning copy stage supplies its actual decoded checkpoint and completed
 * raw-copy inventory. This function checks their relation, not their issuance
 * as a baseline. Only the enclosing original baseline object retains that brand.
 */
export async function assessCurrentStartupPremises(input: CurrentStartupSqlInput & Readonly<{ documentUuid: string }>): Promise<CurrentStartupPremises> {
  if (!/^[a-f0-9]{64}$/u.test(input.target.projectUuid)) { throw new Error("Current startup premises require a local path-hash project."); }
  const sql = await selectCurrentStartupSql(input);
  if (!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(input.documentUuid)) { throw new Error("Current startup PCB identity is invalid."); }
  const matches = input.history.documents.filter((document) => document.uuid === input.documentUuid);
  const pcb = matches[0];
  if (matches.length !== 1 || pcb?.docType !== "PCB" || isNativeDocumentDeleted(pcb)) {
    throw new Error("Current startup baseline requires its exact undeleted PCB.");
  }
  // WORKER2144574 counts getter-filtered maps, not geometry. Require META as a
  // Conservative witness even though DOCHEAD alone can seed the native map.
  // This does not compute the native count or prove zero when META is absent.
  const metadata = pcb.records.filter((record) => record.id === "META" || record.type === "META");
  const meta = metadata[0];
  const counted = metadata.length === 1 && meta?.id === "META" && meta.type === "META" && typeof meta.body["title"] === "string";
  // A deliberately narrower condition than native linked-page filtering:
  // Zero active SCH_PAGE entries excludes its entire linked-sheet loop.
  const activePages = input.history.documents.filter((document) => document.docType === "SCH_PAGE" && !isNativeDocumentDeleted(document)).length;
  const blockers: Blocker[] = [];
  if (!sql.supported) { blockers.push("unsupported-sql-schema"); }
  else if (sql.databaseVersion !== "25.10.31.1") { blockers.push("unsupported-database-version"); }
  if (!counted) { blockers.push("target-pcb-count-witness-unavailable"); }
  if (activePages !== 0) { blockers.push("active-schematic-pages"); }
  return Object.freeze({ profile: "private.current-startup-premises.v1", scope: "historical-closed-default-branch",
    implementationProfileSha256: sha256Json(CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION),
    sourceSha256: input.sourceSha256, checkpointSha256: input.checkpointSha256, sqlLogicalSha256: input.inventory.logicalSha256,
    historySemanticSha256: input.history.semanticSha256, projectUuid: input.target.projectUuid, branchUuid: input.target.branchUuid,
    documentUuid: input.documentUuid, sqlSchemaSupported: sql.supported, databaseVersion: sql.supported ? sql.databaseVersion : null,
    targetPcbSuppliesNonzeroNativeCount: counted, activeSchematicPages: activePages,
    historicalSubsetSatisfied: blockers.length === 0, blockers: Object.freeze(blockers),
    // APP2373856 ignores the UI's truthy editorVersion-only update. APP2317612
    // Omits exam_info; neither fact establishes the renderer's later cache.
    localEditorVersionUpdate: "source-reviewed-backend-no-op", localProjectDetailExamInfo: "source-reviewed-field-omitted",
    runtimeExamStateVerified: false, preOpeningContinuityVerified: false, startupQualified: false,
    openingEffectsVerified: false, executionAuthorized: false });
}
