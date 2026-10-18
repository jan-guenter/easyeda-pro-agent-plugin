/** Private aged-only historical computation reuse. No live authority or public route. */
/* oxlint-disable import/max-dependencies -- Fixed storage/parser/observer dependencies; no caller-selected authority callback. */
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { controlDataDirectory, controlRootCapability, readExactUtf8Artifact } from "./artifacts.ts";
import { FAMILY, loadClosedSymbolHistoricalPhaseJournal } from "./closed-symbol-journal.ts";
import { AGED_TERMINAL_STATE, parseClosedSymbolAgedTerminalArtifact, parseClosedSymbolAgedTerminalEnvelope } from "./closed-symbol-aged-terminal-shape.ts";
import type { HistoricalAgedTerminalInspection } from "./closed-symbol-aged-terminal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { machineProfileSchema } from "./machine-profile.ts";
import { captureClosedSymbolJournalBytes } from "./closed-symbol-terminal-closure-journal.ts";
import { observeClosedSymbolAgedTerminalClosure, revalidateClosedSymbolAgedTerminalClosure } from "./closed-symbol-terminal-closure-observer.ts";
import type { ClosureObservation } from "./closed-symbol-terminal-closure-observer.ts";
import { ownBoundedData, requireEvidence } from "./closed-symbol-terminal-closure-plan.ts";
import { ClosureEvidenceChangedError } from "./closed-symbol-terminal-closure-evidence-error.ts";
import { ClosureIneligibleError } from "./closed-symbol-terminal-closure-ineligible-error.ts";

const LIFETIME_MS = 600_000, MAX_ENTRIES = 4, MAX_RETAINED_BYTES = 33_554_432;
const REVISION = "private.aged-admission-cache.v1";
type Bag = Readonly<Record<string, unknown>>;
type Runtime = ReturnType<typeof machineProfileSchema.shape.runtime.parse>;
type Candidate = Readonly<{ operationId: string; state: typeof AGED_TERMINAL_STATE; family: typeof FAMILY;
  storedJournalSha256: string; entireStoredJournalSha256: string; terminalArtifact: ReturnType<typeof parseClosedSymbolAgedTerminalArtifact> }>;
interface Entry { readonly key: string; readonly candidate: Candidate; readonly runtime: Runtime; readonly input: unknown;
  readonly observation: ClosureObservation; readonly result: HistoricalAgedTerminalInspection; readonly bytes: number; readonly enrolledAt: number }
const entries = new Map<string, Entry>();
let retainedBytes = 0;

function exact(value: unknown, keys: readonly string[]): Bag {
  requireEvidence(isRecord(value) && canonicalJson(Object.keys(value).toSorted()) === canonicalJson([...keys].toSorted()), "cache-exact-fields"); return value;
}
function hash(value: unknown): string { requireEvidence(typeof value === "string" && /^[a-f0-9]{64}$/u.test(value), "cache-hash"); return value; }
function candidateData(value: unknown): Candidate {
  const data = exact(ownBoundedData(value), ["operationId", "state", "family", "storedJournalSha256", "entireStoredJournalSha256", "terminalArtifact"]);
  const operationId = data["operationId"];
  requireEvidence(typeof operationId === "string" && data["state"] === AGED_TERMINAL_STATE && data["family"] === FAMILY, "cache-candidate-profile");
  return Object.freeze({ operationId, state: AGED_TERMINAL_STATE, family: FAMILY, storedJournalSha256: hash(data["storedJournalSha256"]),
    entireStoredJournalSha256: hash(data["entireStoredJournalSha256"]), terminalArtifact: parseClosedSymbolAgedTerminalArtifact(data["terminalArtifact"], operationId) });
}
function historicalData(value: unknown, candidate: Candidate, bodySha256: string): HistoricalAgedTerminalInspection {
  const data = exact(ownBoundedData(value), ["profile", "operationId", "classification", "historicalCompletionRecorded", "terminalOutcomeVerified", "liveOriginalCompletionProved",
    "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed", "terminalArtifact", "bodySha256", "storedJournalSha256", "entireStoredJournalSha256"]);
  requireEvidence(data["profile"] === "private.closed-symbol-historical-terminal.v2" && data["operationId"] === candidate.operationId &&
    data["classification"] === "historical-completion-verified" && data["historicalCompletionRecorded"] === true && data["terminalOutcomeVerified"] === true &&
    data["storedJournalSha256"] === candidate.storedJournalSha256 && data["entireStoredJournalSha256"] === candidate.entireStoredJournalSha256 &&
    canonicalJson(data["terminalArtifact"]) === canonicalJson(candidate.terminalArtifact) && data["bodySha256"] === bodySha256, "cache-cold-result-binding");
  for (const key of ["liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed"]) {
    requireEvidence(data[key] === false, "cache-result-authority");
  }
  return Object.freeze({ profile: "private.closed-symbol-historical-terminal.v2", operationId: candidate.operationId,
    classification: "historical-completion-verified", historicalCompletionRecorded: true, terminalOutcomeVerified: true,
    liveOriginalCompletionProved: false, currentSourceChecked: false, currentOwnershipChecked: false, authorityRestored: false,
    executionAuthorized: false, replayAllowed: false, terminalArtifact: candidate.terminalArtifact, bodySha256,
    storedJournalSha256: candidate.storedJournalSha256, entireStoredJournalSha256: candidate.entireStoredJournalSha256 });
}
function forget(slot: string, selected: Entry): void {
  if (entries.get(slot) === selected) { entries.delete(slot); retainedBytes -= selected.bytes; }
}
function expire(now: number): void {
  for (const [slot, entry] of entries) { if (now - entry.enrolledAt >= LIFETIME_MS || now < entry.enrolledAt) { forget(slot, entry); } }
}
function same(actual: unknown, expected: unknown, label: string): void { requireEvidence(canonicalJson(actual) === canonicalJson(expected), `cache-${label}-changed`); }

/** Candidate hashes select only. A resident exists solely after this module's
 * fixed complete cold replay and unchanged-byte observation. No setter exists. */
export async function inspectAgedTerminalForAdmission(candidateInput: unknown, runtimeInput: unknown): Promise<HistoricalAgedTerminalInspection> {
  const rootPath = resolve(controlDataDirectory());
  const candidateOwn = ownBoundedData(candidateInput), runtimeOwn = ownBoundedData(runtimeInput);
  const candidate = candidateData(candidateOwn);
  const runtime = Object.freeze(machineProfileSchema.shape.runtime.parse(runtimeOwn));
  const originalInputSeal = canonicalJson({ candidate: candidateOwn, runtime: runtimeOwn });
  const root = await controlRootCapability(false);
  const rootBinding = Object.freeze({ path: root.path, device: String(root.device), inode: String(root.inode), handle: root.handle });
  const rootCheck = root.assertCurrent;
  const scope = (): void => {
    requireEvidence(resolve(controlDataDirectory()) === rootPath && root.path === rootPath && root.path === rootBinding.path &&
      String(root.device) === rootBinding.device && String(root.inode) === rootBinding.inode && root.handle === rootBinding.handle && root.assertCurrent === rootCheck,
      "cache-root-scope-changed");
    requireEvidence(canonicalJson({ candidate: ownBoundedData(candidateInput), runtime: ownBoundedData(runtimeInput) }) === originalInputSeal, "cache-caller-input-changed");
  };
  const failAfterScope = (primary: unknown): never => {
    try { scope(); }
    catch (error) {
      // A known contradiction must not become eligibility if caller drift makes
      // The synchronous scope check fail too. Other paired failures stay hard.
      if (primary instanceof ClosureEvidenceChangedError) { throw primary; }
      throw new AggregateError([primary, error], "cache-action-and-scope-failed", { cause: error });
    }
    throw primary;
  };
  const current = async (): Promise<void> => { scope(); await Reflect.apply(rootCheck, root, []); scope(); };
  const checked = async <T,>(invoke: () => Promise<T>): Promise<T> => {
    await current(); scope();
    let value: T;
    try { value = await invoke(); } catch (error) { return failAfterScope(error); }
    scope();
    await current(); return value;
  };
  const finalChecked = async <T,>(invoke: () => Promise<T>): Promise<T> => {
    await current(); scope();
    // The fixed final observer owns its own asynchronous filesystem/runtime
    // Proof and cleanup. Only synchronous scope checks may follow its return.
    let value: T;
    try { value = await invoke(); } catch (error) { return failAfterScope(error); }
    scope(); return value;
  };
  await current();
  const now = performance.now(); expire(now);
  const slot = canonicalJson([rootPath, candidate.operationId]);
  const key = canonicalJson({ revision: REVISION, rootPath, candidate, runtime });
  const selected = entries.get(slot);
  if (selected !== undefined && selected.key === key) {
    try {
      await finalChecked(() => revalidateClosedSymbolAgedTerminalClosure(selected.input, selected.observation));
      const end = performance.now();
      if (end < selected.enrolledAt || end - selected.enrolledAt >= LIFETIME_MS) { throw new ClosureIneligibleError("cache-hit-expired"); }
      scope();
      requireEvidence(entries.get(slot) === selected, "cache-resident-changed-during-hit");
      return historicalData(selected.result, candidate, hash(selected.result.bodySha256));
    } catch (error) { forget(slot, selected); throw error; }
  }
  if (selected !== undefined) { forget(slot, selected); }

  const loaded = await checked(() => loadClosedSymbolHistoricalPhaseJournal(candidate.operationId));
  requireEvidence(loaded.journal.state === AGED_TERMINAL_STATE && loaded.journal["journalSha256"] === candidate.storedJournalSha256 &&
    sha256Json(loaded.journal) === candidate.entireStoredJournalSha256, "cache-pre-cold-journal");
  const terminal = parseClosedSymbolAgedTerminalArtifact(loaded.journal["terminalArtifact"], candidate.operationId);
  same(terminal, candidate.terminalArtifact, "pre-cold-descriptor");
  const rawTerminal = await checked(() => readExactUtf8Artifact(terminal));
  const envelope = parseClosedSymbolAgedTerminalEnvelope(JSON.parse(rawTerminal.text) as unknown);
  const rawFingerprint = await checked(() => readExactUtf8Artifact(envelope.body.evidence.fingerprint));
  const fingerprint: unknown = JSON.parse(rawFingerprint.text);
  let input: unknown;
  try {
    const journalBytes = await checked(() => captureClosedSymbolJournalBytes(loaded.journal));
    input = ownBoundedData({ journal: loaded.journal, journalBytes, events: loaded.events, envelope, fingerprint, runtime });
  } catch (error) { if (!(error instanceof ClosureIneligibleError)) { throw error; } scope(); }

  // Keep generic admission imports lazy. A fixed module, never a supplied verifier.
  const inspector = await checked(() => import("./closed-symbol-aged-terminal.ts"));
  const returned = await finalChecked(() => inspector.inspectClosedSymbolAgedTerminal(candidate.operationId, runtime));
  const result = historicalData(returned, candidate, envelope.bodySha256);
  if (input === undefined) { scope(); return result; }
  let observation: ClosureObservation;
  try { observation = await finalChecked(() => observeClosedSymbolAgedTerminalClosure(input)); }
  catch (error) {
    if (!(error instanceof ClosureIneligibleError)) { throw error; }
    // Observation may await filesystem work before finding an eligibility limit.
    // The earlier cold result is stale if evidence changed meanwhile.
    // Finish with a fresh fixed replay and synchronous checks only; never enroll.
    scope();
    const fresh = await finalChecked(() => inspector.inspectClosedSymbolAgedTerminal(candidate.operationId, runtime));
    return historicalData(fresh, candidate, envelope.bodySha256);
  }
  // A completed observer is still not an issuer; only this fixed sequence may
  // Retain its historical result. No awaited work follows this insertion check.
  scope();
  const enrolledAt = performance.now(); expire(enrolledAt);
  const bytes = Buffer.byteLength(JSON.stringify({ key, candidate, runtime, input, observation, result, enrolledAt }));
  if (!entries.has(slot) && entries.size < MAX_ENTRIES && retainedBytes + bytes <= MAX_RETAINED_BYTES) {
    entries.set(slot, Object.freeze({ key, candidate, runtime, input, observation, result, bytes, enrolledAt })); retainedBytes += bytes;
  }
  return result;
}
