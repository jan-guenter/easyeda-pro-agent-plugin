/** Bounded diagnostic text only. No journal, native call, retry or authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";

const PROFILE = "easyeda-pro-control.closed-symbol-failure-diagnostic.v1";
const STAGES = new Set(["request", "validation", "reservation", "facade", "entry-import", "construction", "entry", "projection",
  "queue", "admission", "sql-runtime", "expectation", "intent", "claim", "coordinator", "terminal"]);
const SUCCESSFUL = new Set(["none", "planned", "baseline-launch", "baseline-admission", "baseline-marker-create", "baseline-close",
  "baseline-termination", "baseline-copy", "baseline-main-reference", "edit-launch", "edit-admission", "edit-marker-read", "edit-open",
  "edit-witness", "edit-preparation", "edit-write", "edit-close", "edit-termination", "edit-copy", "edit-sql-compare", "verify-source",
  "verify-launch", "verify-admission", "verify-marker-read", "verify-open", "verify-saved-content", "verify-close", "verify-termination",
  "verify-copy", "verify-sql-compare"]);
const CODES = new Map([
  ["Ordinary closed-symbol metadata execution awaits successful disposable full-lifecycle validation.", "VALIDATION_REQUIRED"],
  ["Disposable index attempt is unavailable.", "ATTEMPT_UNAVAILABLE"],
  ["Closed navigation runtime does not match the expected subset.", "RUNTIME_FINGERPRINT_MISMATCH"],
  ["Closed navigation lost its exact unchanged checkpoint.", "CHECKPOINT_CHANGED"],
  ["Closed navigation supplied journal is stale.", "NAVIGATION_JOURNAL_STALE"],
  ["Closed navigation needs retained process authority.", "PROCESS_AUTHORITY_REQUIRED"],
  ["Closed navigation requires its outer authenticated scope.", "AUTHENTICATED_SCOPE_REQUIRED"],
  ["Startup fixed observation refused; retained result requires review, never replay.", "STARTUP_OBSERVATION_REFUSED"],
]);
const SAFE_CODES = new Set([...CODES.values(), "UNCLASSIFIED_FAILURE", "ERROR_MESSAGE_UNAVAILABLE"]);
// Fixed public fingerprint fields only. Arbitrary JSON pointers can contain private keys.
const PATHS = new Set(["/toolCount", "/toolCatalogSha256", "/upstreamImplementationDrift", "/upstreamServer/version",
  "/facadeImplementation/sha256", "/facadeImplementation/mode", "/facadeImplementation/version",
  "/health/payload/version", "/health/payload/node_version", "/health/payload/bridge_connected", "/health/payload/easyeda_version",
  "/health/payload/extension_version", "/health/payload/extension_version_mismatch", "/health/payload/registry_mismatch",
  "/bridge/payload/connected", "/bridge/payload/bridge_version", "/bridge/payload/easyeda_version", "/bridge/payload/diagnostics/method_registry_hash",
  "/bridgeDispatcher/payload/source", "/bridgeDispatcher/payload/dispatcher_build_id", "/bridgeDispatcher/payload/total",
  "/installedBundles/pcbEditor/version", "/installedBundles/pcbEditor/implementationSha256", "/installedBundles/publicApi/version",
  "/installedBundles/publicApi/implementationSha256", "/installedBundles/publicApi/adapterSha256", "/installedBundles/publicApi/declarationsSha256"]);

export interface ClosedSymbolFailureDiagnostic {
  readonly profile: typeof PROFILE;
  readonly stage: string;
  readonly lastSuccessfulStage: string | null;
  readonly errorCode: string;
  readonly messageSha256: string | null;
  readonly mismatchPaths: readonly string[];
}
function own(value: unknown, key: string): unknown {
  if (value === null || typeof value !== "object" || types.isProxy(value)) { return undefined; }
  const property = Object.getOwnPropertyDescriptor(value, key);
  return property !== undefined && Object.hasOwn(property, "value") ? property.value as unknown : undefined;
}
function selectedPaths(error: unknown): readonly string[] {
  const values = own(error, "mismatches");
  const count = own(values, "length");
  if (types.isProxy(values) || !Array.isArray(values) || typeof count !== "number" || !Number.isSafeInteger(count) || count < 0 || count > 64) { return []; }
  const paths = new Set<string>();
  for (let index = 0; index < count; index += 1) {
    const pointer = own(own(values, String(index)), "pointer");
    if (typeof pointer === "string" && PATHS.has(pointer)) { paths.add(pointer); }
  }
  return [...paths].toSorted().slice(0, 8);
}

/** Inputs come from caught errors and owned stage fields, never a public request. */
export function closedSymbolFailureDiagnostic(error: unknown, stage: unknown, lastSuccessfulStage?: unknown): ClosedSymbolFailureDiagnostic | undefined {
  if (typeof stage !== "string" || !STAGES.has(stage)) { return undefined; }
  const raw = Error.isError(error) && !types.isProxy(error) ? own(error, "message") : undefined;
  const message = typeof raw === "string" && raw.length <= 8192 && raw.isWellFormed() && Buffer.byteLength(raw) <= 8192 ? raw : undefined;
  const errorCode = message === undefined ? "ERROR_MESSAGE_UNAVAILABLE" : CODES.get(message) ?? "UNCLASSIFIED_FAILURE";
  return Object.freeze({ profile: PROFILE, stage,
    lastSuccessfulStage: typeof lastSuccessfulStage === "string" && SUCCESSFUL.has(lastSuccessfulStage) ? lastSuccessfulStage : null,
    errorCode, messageSha256: message === undefined ? null : createHash("sha256").update(message).digest("hex"),
    mismatchPaths: Object.freeze(errorCode === "RUNTIME_FINGERPRINT_MISMATCH" ? selectedPaths(error) : []) });
}

/** Read only the index-owned entry's retained fields. Do not invoke retained methods. */
export function closedSymbolEntryFailureDiagnostic(entry: unknown): ClosedSymbolFailureDiagnostic | undefined {
  const failure = own(entry, "failure");
  if (failure === undefined) { return undefined; }
  return closedSymbolFailureDiagnostic(failure, own(entry, "phase"), own(own(entry, "coordinator"), "lastSuccessfulStage"));
}

/** Invalid optional diagnostics are omitted; they cannot replace the original result. */
export function closedSymbolFailureDiagnosticText(value: unknown): readonly { type: "text"; text: string }[] {
  const errorCode = own(value, "errorCode"), lastSuccessfulStage = own(value, "lastSuccessfulStage"),
    messageSha256 = own(value, "messageSha256"), paths = own(value, "mismatchPaths"), stage = own(value, "stage");
  const count = own(paths, "length");
  if (own(value, "profile") !== PROFILE || typeof stage !== "string" || !STAGES.has(stage) ||
    !(lastSuccessfulStage === null || typeof lastSuccessfulStage === "string" && SUCCESSFUL.has(lastSuccessfulStage)) ||
    typeof errorCode !== "string" || !SAFE_CODES.has(errorCode) ||
    !(messageSha256 === null || typeof messageSha256 === "string" && /^[a-f0-9]{64}$/u.test(messageSha256)) ||
    types.isProxy(paths) || !Array.isArray(paths) || typeof count !== "number" || !Number.isSafeInteger(count) || count < 0 || count > 8) { return []; }
  const mismatchPaths: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const path = own(paths, String(index));
    if (typeof path !== "string" || !PATHS.has(path)) { return []; }
    mismatchPaths.push(path);
  }
  const text = JSON.stringify({ profile: PROFILE, stage, lastSuccessfulStage, errorCode, messageSha256, mismatchPaths });
  return Buffer.byteLength(text) <= 2048 ? [{ type: "text", text }] : [];
}
