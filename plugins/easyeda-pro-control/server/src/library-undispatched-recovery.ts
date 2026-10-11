import { basename } from "node:path";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json } from "./core.ts";
import type { LibraryJournal } from "./library-execution.ts";
import { LIBRARY_EXECUTION_PROFILE } from "./library-runtime.ts";
import { prepareDocumentActivation } from "./document-activation.ts";
import { prepareDocumentClose } from "./document-close.ts";
import { prepareDocumentPageCreate } from "./document-page-create.ts";
import { prepareProjectSymbolCreate } from "./project-symbol-create.ts";
import { prepareDocumentContainerRename } from "./document-container-rename.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";

const preparations = {
  "document.activate": { key: "activationPlan", phase: "activation-prepared", derive: prepareDocumentActivation },
  "document.close": { key: "closePlan", phase: "close-prepared", derive: prepareDocumentClose },
  "document.page.create": { key: "pageCreatePlan", phase: "page-create-prepared", derive: prepareDocumentPageCreate },
  "library.symbol.create": { key: "symbolCreatePlan", phase: "symbol-create-prepared", derive: prepareProjectSymbolCreate },
  "document.pcb.rename": { key: "documentRenamePlan", phase: "document-rename-prepared", derive: prepareDocumentContainerRename },
  "document.schematic.rename": { key: "documentRenamePlan", phase: "document-rename-prepared", derive: prepareDocumentContainerRename },
} as const;
const initialKeys = new Set(["schema", "operationId", "journalPath", "planHash", "plan", "state", "mutationState", "saved", "reopened",
  "orphanedCallPossible", "hardStop", "mutationMayHaveOccurred", "nextSafeAction", "context", "preCheckpoint", "beforeSourceSha256",
  "sequence", "createdAt", "updatedAt", "artifacts", "integrityModel", "journalSha256"]);

function preparation(journal: LibraryJournal): (typeof preparations)[keyof typeof preparations] {
  const action = journal.plan.operation.action;
  if (action !== "document.activate" && action !== "document.close" && action !== "document.page.create" && action !== "library.symbol.create" && action !== "document.pcb.rename" && action !== "document.schematic.rename") {
    throw new Error("Undispatched preparation invalidation does not support this operation.");
  }
  return preparations[action];
}

/** Route missing preparation separately before any recovery upload barrier can
 * add dispatch authority. A present preparation retains the established path.
 */
export function hasMissingLibraryPreparation(journal: LibraryJournal): boolean {
  const action = journal.plan.operation.action;
  if (action !== "document.activate" && action !== "document.close" && action !== "document.page.create" && action !== "library.symbol.create" && action !== "document.pcb.rename" && action !== "document.schematic.rename") { return false; }
  const { phase } = preparations[action];
  return !journal.artifacts.some((entry) => new RegExp(`^[0-9]+-${phase}\\.json$`, "u").test(basename(entry.path)));
}

/** Only exact publication prefixes of execute are admitted. Unknown OWN keys,
 * including undefined dispatch markers, refuse rather than imply no dispatch.
 * This is corruption-detection evidence, not authentication against a writer
 * with access to the control-data directory.
 */
export function assertUndispatchedLibraryPreparation(journal: LibraryJournal): void {
  const { key } = preparation(journal), hasPlan = Object.hasOwn(journal, key);
  const envelope: Record<string, unknown> = journal;
  if (!hasMissingLibraryPreparation(journal) || Reflect.ownKeys(journal).some((field) => typeof field !== "string" || (!initialKeys.has(field) && field !== key)) ||
      journal.schema !== OPERATION_SCHEMA || journal.plan.profile !== LIBRARY_EXECUTION_PROFILE || buildPlanHash(journal.plan) !== journal.planHash ||
      journal.mutationState !== "before" || envelope["mutationMayHaveOccurred"] !== false || envelope["saved"] !== false || envelope["reopened"] !== false ||
      envelope["orphanedCallPossible"] !== false || canonicalJson(journal.context) !== canonicalJson(journal.plan.expectedContext)) {
    throw new Error("Missing preparation has no exact undispatched journal envelope; dispatch or recovery evidence cannot be inferred away.");
  }
  const beforeOnly = journal.artifacts.length === 1 && basename(journal.artifacts[0]?.path ?? "") === "01-before.json";
  const planned = journal.state === "planned" && envelope["hardStop"] === false && !hasPlan &&
    (journal.sequence === 0 && journal.artifacts.length === 0 || journal.sequence === 1 && beforeOnly);
  const publicationFailed = journal.state === "library-needs-review" && envelope["hardStop"] === true && hasPlan && journal.sequence === 2 && beforeOnly;
  if (!planned && !publicationFailed) { throw new Error("Missing preparation is not an exact initial publication prefix."); }
}

export function rederiveUndispatchedLibraryPlan(journal: LibraryJournal, history: NativeHistorySnapshot): string {
  assertUndispatchedLibraryPreparation(journal);
  const { key, derive } = preparation(journal);
  const expected = derive(journal.plan.operation, history, journal.plan.expectedContext);
  if (Object.hasOwn(journal, key) && canonicalJson(expected) !== canonicalJson(journal[key])) {
    throw new Error("Unpublished preparation differs from the immutable operation and checkpoint.");
  }
  return sha256Json(expected);
}
