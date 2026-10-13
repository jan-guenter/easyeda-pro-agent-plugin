/** Private strict aged terminal v2 structure only. Locked v1 is not projected or weakened. No completion interpretation or restored authority. */
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { operationPath } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";

const HASH = /^[a-f0-9]{64}$/u, OPERATION = /^[a-z0-9][a-z0-9-]{7,95}$/iu;
export const AGED_TERMINAL_STATE = "closed-session-completed";
export const AGED_TERMINAL_NEXT_ACTION = "Read historical completion evidence only; no runtime authority is restored.";
export const AGED_TERMINAL_MAX_BYTES = 65_536;
export type AgedTerminalDescriptor = Readonly<{ path: string; bytes: number; sha256: string }>;
type SqlDigests = Readonly<Record<"checkpointSha256" | "schemaSha256" | "logicalSha256", string>>;
type TerminalResults = Readonly<Record<"witnessResultSha256" | "preparationSha256" | "writeResultSha256" | "editComparisonSha256" |
  "savedSourceSha256" | "savedReadResultSha256" | "verificationComparisonSha256" | "verificationNavigationBindingSha256" | "mainReferenceResultSha256", string>>;
type TerminalEvidence = Readonly<Record<"fingerprint" | "baselineWindow" | "editWindow" | "verificationWindow" | "witnessQualification" |
  "witnessRaw" | "writeRaw" | "savedReadRaw" | "mainReferenceIntent" | "mainReferenceResult", AgedTerminalDescriptor>>;
export interface AgedTerminalGenerationEvidence {
  readonly ordinal: 0 | 1 | 2; readonly generationSha256: string; readonly launchReceiptSha256: string;
  readonly closeIntentSha256: string; readonly closeReceiptSha256: string; readonly terminationProofSha256: string;
  readonly checkpointReceiptSha256: string; readonly copyReceiptSha256: string; readonly copyArtifact: AgedTerminalDescriptor;
  readonly sqlDigests: SqlDigests;
}
export interface ClosedSymbolAgedTerminalBody {
  readonly headEligibility: "aged-unlocked";
  readonly operationId: string; readonly family: "easyeda-pro-control.project-symbol-closed-session.v1";
  readonly closedPlanSha256: string; readonly markerSha256: string; readonly expectedFingerprintSha256: string;
  readonly facadeSha256: string; readonly nativePinsSha256: string;
  readonly predecessor: Readonly<{ state: "closed-session-evidence-recorded"; updatedAt: string; nextSafeAction: string; entireJournalSha256: string }>;
  readonly recordedAt: string; readonly phaseArtifacts: readonly AgedTerminalDescriptor[]; readonly generations: readonly AgedTerminalGenerationEvidence[];
  readonly evidence: TerminalEvidence; readonly results: TerminalResults;
  readonly finalSource: Readonly<{ source: string; sourceSha256: string; sourceIdentitySha256: string; checkpointReceiptSha256: string;
    copyReceiptSha256: string; sqlDigests: SqlDigests; method: "issued-copy+verifyCheckpoint+complete-sql" }>;
  readonly outcome: Readonly<{ metadataPersistedAndVerified: true; savedContentVerifiedInFreshWorker: true; wholeOwnedSessionsExited: true;
    companionOpenedInFreshSession: true; explicitSavePerformed: false; targetEditorOpened: false; saved: false; reopened: false }>;
}
export interface ClosedSymbolAgedTerminalEnvelope {
  readonly profile: "easyeda-pro-control.closed-symbol-terminal.v2"; readonly body: ClosedSymbolAgedTerminalBody; readonly bodySha256: string;
}
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function exact(input: unknown, keys: readonly string[]): Record<string, unknown> {
  need(isRecord(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) &&
    Reflect.ownKeys(input).length === keys.length, "Terminal exact object refused.");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const field = Object.getOwnPropertyDescriptor(input, key);
    need(field !== undefined && Object.hasOwn(field, "value"), "Terminal own data field required.");
    Object.defineProperty(result, key, { value: field.value as unknown, enumerable: true });
  }
  return result;
}
function text(value: unknown, expression?: RegExp): string {
  need(typeof value === "string" && value.length <= 2048 && Buffer.byteLength(value) <= 2048 && (expression === undefined || expression.test(value)), "Terminal bounded text refused.");
  return value;
}
function hash(value: unknown): string { return text(value, HASH); }
function timestamp(value: unknown): string {
  const output = text(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u);
  need(Number.isFinite(Date.parse(output)) && new Date(output).toISOString() === output, "Terminal timestamp refused."); return output;
}
function array(value: unknown, length: number): readonly unknown[] {
  need(Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype && value.length === length &&
    Reflect.ownKeys(value).length === length + 1, "Terminal exact array refused.");
  const result: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const field = Object.getOwnPropertyDescriptor(value, String(index));
    need(field !== undefined && Object.hasOwn(field, "value"), "Terminal array data field required."); result.push(field.value as unknown);
  }
  return result;
}
function descriptor(value: unknown, directory: string, maximum: number, filename?: string): AgedTerminalDescriptor {
  const fields = exact(value, ["path", "bytes", "sha256"]);
  const bytes = fields["bytes"], path = text(fields["path"]);
  need(isAbsolute(path) && resolve(path) === path && dirname(path) === directory && !/[\0\r\n]/u.test(path) &&
    (filename === undefined || basename(path) === filename), "Terminal artifact path refused.");
  need(typeof bytes === "number" && Number.isSafeInteger(bytes) && !Object.is(bytes, -0) && bytes > 0 && bytes <= maximum, "Terminal artifact byte bound refused.");
  return Object.freeze({ path, bytes, sha256: hash(fields["sha256"]) });
}
function sql(value: unknown): SqlDigests {
  const fields = exact(value, ["checkpointSha256", "schemaSha256", "logicalSha256"]);
  return Object.freeze({ checkpointSha256: hash(fields["checkpointSha256"]), schemaSha256: hash(fields["schemaSha256"]), logicalSha256: hash(fields["logicalSha256"]) });
}
function generation(value: unknown, ordinal: number, directory: string): AgedTerminalGenerationEvidence {
  const fields = exact(value, ["ordinal", "generationSha256", "launchReceiptSha256", "closeIntentSha256", "closeReceiptSha256",
    "terminationProofSha256", "checkpointReceiptSha256", "copyReceiptSha256", "copyArtifact", "sqlDigests"]);
  need((ordinal === 0 || ordinal === 1 || ordinal === 2) && fields["ordinal"] === ordinal && !Object.is(fields["ordinal"], -0), "Terminal generation ordinal refused.");
  const copyArtifact = descriptor(fields["copyArtifact"], directory, 268_435_456);
  need(/^closed-copy-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.eprj2$/u.test(basename(copyArtifact.path)), "Terminal copy name refused.");
  return Object.freeze({ ordinal, generationSha256: hash(fields["generationSha256"]), launchReceiptSha256: hash(fields["launchReceiptSha256"]),
    closeIntentSha256: hash(fields["closeIntentSha256"]), closeReceiptSha256: hash(fields["closeReceiptSha256"]),
    terminationProofSha256: hash(fields["terminationProofSha256"]), checkpointReceiptSha256: hash(fields["checkpointReceiptSha256"]),
    copyReceiptSha256: hash(fields["copyReceiptSha256"]), copyArtifact, sqlDigests: sql(fields["sqlDigests"]) });
}
/** Fixed45 descriptor parser; no configurable path or bound. */
export function parseClosedSymbolAgedTerminalArtifact(value: unknown, operationId: string): AgedTerminalDescriptor {
  text(operationId, OPERATION);
  return descriptor(value, operationPath(operationId).slice(0, -5), AGED_TERMINAL_MAX_BYTES, "45-closed-symbol-terminal.json");
}
export function parseClosedSymbolAgedTerminalEnvelope(value: unknown): ClosedSymbolAgedTerminalEnvelope {
  const envelope = exact(value, ["profile", "body", "bodySha256"]);
  need(envelope["profile"] === "easyeda-pro-control.closed-symbol-terminal.v2", "Terminal profile refused.");
  const input = exact(envelope["body"], ["operationId", "family", "headEligibility", "closedPlanSha256", "markerSha256", "expectedFingerprintSha256", "facadeSha256", "nativePinsSha256",
    "predecessor", "recordedAt", "phaseArtifacts", "generations", "evidence", "results", "finalSource", "outcome"]);
  const operationId = text(input["operationId"], OPERATION);
  const directory = operationPath(operationId).slice(0, -5);
  need(input["family"] === "easyeda-pro-control.project-symbol-closed-session.v1", "Terminal family refused.");
  need(input["headEligibility"] === "aged-unlocked", "Terminal aged head eligibility refused.");
  const prior = exact(input["predecessor"], ["state", "updatedAt", "nextSafeAction", "entireJournalSha256"]);
  need(prior["state"] === "closed-session-evidence-recorded", "Terminal predecessor state refused.");
  const predecessor = Object.freeze({ state: "closed-session-evidence-recorded" as const, updatedAt: timestamp(prior["updatedAt"]),
    nextSafeAction: text(prior["nextSafeAction"]), entireJournalSha256: hash(prior["entireJournalSha256"]) });
  const phaseArtifacts = Object.freeze(array(input["phaseArtifacts"], 44).map((entry) => descriptor(entry, directory, 60_000)));
  const generations = Object.freeze(array(input["generations"], 3).map((entry, ordinal) => generation(entry, ordinal, directory)));
  const evidenceInput = exact(input["evidence"], ["fingerprint", "baselineWindow", "editWindow", "verificationWindow", "witnessQualification", "witnessRaw", "writeRaw", "savedReadRaw", "mainReferenceIntent", "mainReferenceResult"]);
  // These are narrower terminal-admission caps, not promises from the generic artifact writer.
  const evidence = Object.freeze({ fingerprint: descriptor(evidenceInput["fingerprint"], directory, 262_144, "00-expected-fingerprint.json"),
    baselineWindow: descriptor(evidenceInput["baselineWindow"], directory, 262_144, "00-baseline-owned-window.json"),
    editWindow: descriptor(evidenceInput["editWindow"], directory, 262_144, "00-edit-owned-window.json"),
    verificationWindow: descriptor(evidenceInput["verificationWindow"], directory, 262_144, "00-verify-owned-window.json"),
    witnessQualification: descriptor(evidenceInput["witnessQualification"], directory, 60_000, "20-edit-witness-clock-qualification.json"),
    witnessRaw: descriptor(evidenceInput["witnessRaw"], directory, 60_000, "20-edit-witness-result.json"),
    writeRaw: descriptor(evidenceInput["writeRaw"], directory, 60_000, "22-edit-write-result.json"),
    savedReadRaw: descriptor(evidenceInput["savedReadRaw"], directory, 245_760, "38-verify-content-read-raw.json"),
    mainReferenceIntent: descriptor(evidenceInput["mainReferenceIntent"], directory, 60_000, "10-baseline-main-reference-intent.json"),
    mainReferenceResult: descriptor(evidenceInput["mainReferenceResult"], directory, 196_608, "10-baseline-main-reference-result.json") });
  const resultInput = exact(input["results"], ["witnessResultSha256", "preparationSha256", "writeResultSha256", "editComparisonSha256", "savedSourceSha256", "savedReadResultSha256", "verificationComparisonSha256", "verificationNavigationBindingSha256", "mainReferenceResultSha256"]);
  const results = Object.freeze({ witnessResultSha256: hash(resultInput["witnessResultSha256"]), preparationSha256: hash(resultInput["preparationSha256"]),
    writeResultSha256: hash(resultInput["writeResultSha256"]), editComparisonSha256: hash(resultInput["editComparisonSha256"]),
    savedSourceSha256: hash(resultInput["savedSourceSha256"]), savedReadResultSha256: hash(resultInput["savedReadResultSha256"]),
    verificationComparisonSha256: hash(resultInput["verificationComparisonSha256"]), verificationNavigationBindingSha256: hash(resultInput["verificationNavigationBindingSha256"]),
    mainReferenceResultSha256: hash(resultInput["mainReferenceResultSha256"]) });
  const finalInput = exact(input["finalSource"], ["source", "sourceSha256", "sourceIdentitySha256", "checkpointReceiptSha256", "copyReceiptSha256", "sqlDigests", "method"]);
  const source = text(finalInput["source"]);
  need(isAbsolute(source) && resolve(source) === source && source.endsWith(".eprj2") && !/[\0\r\n]/u.test(source) && finalInput["method"] === "issued-copy+verifyCheckpoint+complete-sql", "Terminal final source refused.");
  const finalSource = Object.freeze({ source, sourceSha256: hash(finalInput["sourceSha256"]), sourceIdentitySha256: hash(finalInput["sourceIdentitySha256"]),
    checkpointReceiptSha256: hash(finalInput["checkpointReceiptSha256"]), copyReceiptSha256: hash(finalInput["copyReceiptSha256"]),
    sqlDigests: sql(finalInput["sqlDigests"]), method: "issued-copy+verifyCheckpoint+complete-sql" as const });
  const outcome = Object.freeze({ metadataPersistedAndVerified: true, savedContentVerifiedInFreshWorker: true, wholeOwnedSessionsExited: true,
    companionOpenedInFreshSession: true, explicitSavePerformed: false, targetEditorOpened: false, saved: false, reopened: false } as const);
  const flags = exact(input["outcome"], Object.keys(outcome));
  need(canonicalJson(flags) === canonicalJson(outcome), "Terminal exact outcome refused.");
  const body = Object.freeze({ operationId, headEligibility: "aged-unlocked" as const, family: "easyeda-pro-control.project-symbol-closed-session.v1" as const,
    closedPlanSha256: hash(input["closedPlanSha256"]), markerSha256: hash(input["markerSha256"]), expectedFingerprintSha256: hash(input["expectedFingerprintSha256"]),
    facadeSha256: hash(input["facadeSha256"]), nativePinsSha256: hash(input["nativePinsSha256"]), predecessor, recordedAt: timestamp(input["recordedAt"]),
    phaseArtifacts, generations, evidence, results, finalSource, outcome });
  const bodySha256 = hash(envelope["bodySha256"]);
  need(bodySha256 === sha256Json(body), "Terminal body digest refused.");
  const parsed = Object.freeze({ profile: "easyeda-pro-control.closed-symbol-terminal.v2" as const, body, bodySha256 });
  need(Buffer.byteLength(JSON.stringify(parsed)) + 1 <= AGED_TERMINAL_MAX_BYTES, "Terminal complete envelope byte bound refused."); return parsed;
}

/** Validate JSON data before copying unknown predecessor fields without invoking getters. */
function journalData(input: unknown): Record<string, unknown> {
  let bytes = 0, nodes = 0;
  const seen = new Set<object>();
  function copy(value: unknown, depth: number): unknown {
    nodes += 1; need(nodes <= 1_000_000 && depth <= 128, "Terminal journal data bound refused.");
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { bytes += Buffer.byteLength(value); need(bytes <= 67_108_864, "Terminal journal text bound refused."); return value; }
    if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0), "Terminal journal number refused."); return value; }
    need(value !== null && typeof value === "object" && !seen.has(value), "Terminal journal JSON data refused."); seen.add(value);
    try {
      if (Array.isArray(value)) { return array(value, value.length).map((entry) => copy(entry, depth + 1)); }
      need(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "Terminal journal prototype refused.");
      const output: Record<string, unknown> = {};
      for (const key of Reflect.ownKeys(value)) {
        need(typeof key === "string", "Terminal journal symbol refused."); bytes += Buffer.byteLength(key);
        need(bytes <= 67_108_864, "Terminal journal text bound refused.");
        const field = Object.getOwnPropertyDescriptor(value, key);
        need(field !== undefined && Object.hasOwn(field, "value"), "Terminal journal own data required.");
        Object.defineProperty(output, key, { value: copy(field.value as unknown, depth + 1), enumerable: true, writable: true, configurable: true });
      }
      return output;
    } finally { seen.delete(value); }
  }
  const result = copy(input, 0); need(isRecord(result), "Terminal stored journal missing."); return result;
}
/** Structural predecessor only. All44 phase and semantic outcome checks are separate. */
export function reconstructClosedSymbolAgedTerminalPredecessor(storedJournal: unknown, input: unknown): Readonly<Record<string, unknown>> {
  const envelope = parseClosedSymbolAgedTerminalEnvelope(input);
  const body = envelope.body, stored = journalData(storedJournal);
  need(stored["state"] === AGED_TERMINAL_STATE && stored["operationId"] === body.operationId && stored["sequence"] === 44 && stored["hardStop"] === false &&
    stored["orphanedCallPossible"] === false && stored["saved"] === false && stored["reopened"] === false && stored["updatedAt"] === body.recordedAt &&
    stored["nextSafeAction"] === AGED_TERMINAL_NEXT_ACTION && stored["closedPlanSha256"] === body.closedPlanSha256 && stored["markerSha256"] === body.markerSha256 &&
    canonicalJson(stored["artifacts"]) === canonicalJson(body.phaseArtifacts), "Terminal stored journal binding refused.");
  parseClosedSymbolAgedTerminalArtifact(stored["terminalArtifact"], body.operationId);
  const plan = stored["plan"];
  need(isRecord(plan) && plan["profile"] === body.family && plan["projectPath"] === body.finalSource.source &&
    plan["expectedFingerprintSha256"] === body.expectedFingerprintSha256 && plan["facadeSha256"] === body.facadeSha256 &&
    plan["nativePinsSha256"] === body.nativePinsSha256, "Terminal stored plan binding refused.");
  const selfHash = stored["journalSha256"], { journalSha256: _self, ...currentCore } = stored;
  need(hash(selfHash) === sha256Json(currentCore), "Terminal stored journal self-seal refused.");
  const predecessor = { ...stored };
  delete predecessor["terminalArtifact"];
  predecessor["state"] = body.predecessor.state; predecessor["updatedAt"] = body.predecessor.updatedAt; predecessor["nextSafeAction"] = body.predecessor.nextSafeAction;
  // The storage update changes the self-seal as well as the four logical transition fields.
  delete predecessor["journalSha256"]; predecessor["journalSha256"] = sha256Json(predecessor);
  need(sha256Json(predecessor) === body.predecessor.entireJournalSha256, "Terminal entire predecessor digest refused.");
  return Object.freeze(predecessor);
}
