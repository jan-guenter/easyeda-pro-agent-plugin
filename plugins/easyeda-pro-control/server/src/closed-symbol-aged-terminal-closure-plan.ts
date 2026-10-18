/** Fixed aged-v2 dependency closure. Pure data only, never historical completion or runtime authority. */
import { basename, dirname, join, resolve } from "node:path";
import { controlDataDirectory, operationPath } from "./artifacts.ts";
import { STEPS } from "./closed-symbol-journal.ts";
import { parseClosedSymbolAgedTerminalArtifact, parseClosedSymbolAgedTerminalEnvelope, reconstructClosedSymbolAgedTerminalPredecessor } from "./closed-symbol-aged-terminal-shape.ts";
import { canonicalJson, isRecord, reviewedCompatibilityManifestPath, sha256Json, sha256Text } from "./core.ts";
import { mainReferenceV3AssetDescriptors } from "./closed-symbol-main-reference-v3-metadata.ts";
import { CLOSURE_LIMITS, ClosureIneligibleError, ownBoundedData, requireEvidence } from "./closed-symbol-terminal-closure-plan.ts";
import type { ClosureRole } from "./closed-symbol-terminal-closure-plan.ts";

const AGED_CLOSURE_LIMITS = Object.freeze({ ...CLOSURE_LIMITS, roles: 69, files: 67 });
type Bag = Readonly<Record<string, unknown>>;
export interface AgedClosurePlan {
  readonly profile: "private.aged-terminal-closure-plan.v1"; readonly operationId: string;
  readonly inputSha256: string; readonly roles: readonly ClosureRole[]; readonly runtime: Bag;
  readonly semanticValidationPerformed: false; readonly executionAuthorized: false; readonly completionProved: false;
}
function eligible(condition: boolean, message: string): asserts condition { if (!condition) { throw new ClosureIneligibleError(message); } }
function bag(value: unknown): Bag { requireEvidence(isRecord(value), "closure-object"); return value; }
function text(value: unknown): string { requireEvidence(typeof value === "string" && value.length <= 4096 && !/[\0\r\n]/u.test(value), "closure-text"); return value; }
function hash(value: unknown): string { const result = text(value); requireEvidence(/^[a-f0-9]{64}$/u.test(result), "closure-hash"); return result; }
function size(value: unknown, maximum: number): number {
  requireEvidence(typeof value === "number" && Number.isSafeInteger(value) && value > 0, "closure-size");
  eligible(value <= maximum, "closure-role-size"); return value;
}
function identity(input: unknown, keys: readonly string[]): Readonly<Record<string, string>> {
  const object = bag(input), result: Record<string, string> = {};
  requireEvidence(Object.keys(object).length === keys.length, "closure-identity-fields");
  for (const key of keys) { const value = text(object[key]); requireEvidence(/^\d{1,31}$/u.test(value), "closure-identity-value"); result[key] = value; }
  return Object.freeze(result);
}
export function deriveClosedSymbolAgedTerminalClosure(input: unknown): AgedClosurePlan {
  const data = bag(ownBoundedData(input));
  requireEvidence(canonicalJson(Object.keys(data).toSorted()) === canonicalJson(["envelope", "events", "fingerprint", "journal", "journalBytes", "runtime"]), "closure-input-fields");
  const journal = bag(data["journal"]);
  const envelope = parseClosedSymbolAgedTerminalEnvelope(data["envelope"]);
  reconstructClosedSymbolAgedTerminalPredecessor(journal, envelope);
  const operationId = envelope.body.operationId;
  const directory = operationPath(operationId).slice(0, -5);
  const terminal = parseClosedSymbolAgedTerminalArtifact(journal["terminalArtifact"], operationId);
  const events = data["events"]; requireEvidence(Array.isArray(events) && events.length === 44, "closure-events");
  const fingerprint = bag(data["fingerprint"]), runtime = bag(data["runtime"]);
  requireEvidence(sha256Json(fingerprint) === envelope.body.expectedFingerprintSha256, "closure-fingerprint-binding");
  const roles: ClosureRole[] = [];
  const add = (role: string, path: string, bytes: number | null, maximumBytes: number, sha256: string,
    jsonSha256: string | null = null, database = false, recordedIdentity: Readonly<Record<string, string>> | null = null, managed = true): void => {
    requireEvidence(resolve(path) === path && path.startsWith("/") && !/[\0\r\n]/u.test(path), "closure-path");
    roles.push(Object.freeze({ role, path, bytes, maximumBytes, sha256, jsonSha256, database, recordedIdentity, managed }));
  };
  const captured = bag(data["journalBytes"]), journalArtifact = bag(captured["artifact"]);
  requireEvidence(canonicalJson(Object.keys(captured).toSorted()) === canonicalJson(["artifact", "journalSemanticSha256", "operationId", "profile"]) &&
    captured["profile"] === "private.closed-terminal-journal-bytes.v1" && captured["operationId"] === operationId && captured["journalSemanticSha256"] === sha256Json(journal), "closure-journal-capture-binding");
  requireEvidence(canonicalJson(Object.keys(journalArtifact).toSorted()) === canonicalJson(["bytes", "path", "sha256"]) && journalArtifact["path"] === operationPath(operationId), "closure-journal-capture-path");
  add("journal", operationPath(operationId), size(journalArtifact["bytes"], CLOSURE_LIMITS.inputBytes), CLOSURE_LIMITS.inputBytes, hash(journalArtifact["sha256"]), sha256Json(journal));
  for (let index = 0; index < 44; index += 1) {
    const event = bag(events[index]);
    const descriptor = envelope.body.phaseArtifacts[index];
    const step = STEPS[Math.floor(index / 2)];
    const kind = index % 2 === 0 ? "intent" : "result";
    requireEvidence(descriptor !== undefined && step !== undefined && event["sequence"] === index + 1 && event["step"] === step && event["kind"] === kind && event["operationId"] === operationId &&
      event["dataSha256"] === sha256Json(event["data"]) && event["previousArtifactSha256"] === (index === 0 ? null : envelope.body.phaseArtifacts[index - 1]?.sha256), "closure-phase-binding");
    requireEvidence(descriptor.path === join(directory, `${String(index + 1).padStart(2, "0")}-${step}-${kind}.json`), "closure-phase-path");
    add(`phase:${String(index + 1)}`, descriptor.path, descriptor.bytes, 60_000, descriptor.sha256, sha256Json(event));
  }
  add("terminal", terminal.path, terminal.bytes, 65_536, terminal.sha256, sha256Json(envelope));
  for (const [key, descriptor] of Object.entries(envelope.body.evidence)) {
    let maximum = 60_000;
    if (key === "savedReadRaw") { maximum = 245_760; }
    else if (key === "mainReferenceResult") { maximum = 196_608; }
    else if (key === "fingerprint" || key.endsWith("Window")) { maximum = 262_144; }
    add(`evidence:${key}`, descriptor.path, descriptor.bytes, maximum, descriptor.sha256, key === "fingerprint" ? sha256Json(fingerprint) : null);
  }
  for (const ordinal of [0, 1, 2]) {
    const index = [8, 24, 40][ordinal]; requireEvidence(index !== undefined, "closure-copy-index");
    const intent = bag(bag(events[index])["data"]), result = bag(bag(events[index + 1])["data"]);
    const checkpoint = bag(intent["checkpoint"]), copy = bag(result["copyReceipt"]), generation = envelope.body.generations[ordinal];
    const checkpointBody = Object.fromEntries(Object.entries(checkpoint).filter(([key]) => key !== "receiptSha256"));
    const copyBody = Object.fromEntries(Object.entries(copy).filter(([key]) => key !== "receiptSha256"));
    requireEvidence(generation !== undefined && checkpoint["receiptSha256"] === sha256Json(checkpointBody) &&
      copy["receiptSha256"] === sha256Json(copyBody) &&
      sha256Json(checkpoint) === generation.checkpointReceiptSha256 && sha256Json(copy) === generation.copyReceiptSha256, "closure-receipt-binding");
    requireEvidence(copy["artifact"] === generation.copyArtifact.path && copy["bytes"] === generation.copyArtifact.bytes && copy["sha256"] === generation.copyArtifact.sha256, "closure-copy-descriptor");
    add(`copy:${String(ordinal)}`, generation.copyArtifact.path, generation.copyArtifact.bytes, 268_435_456, generation.copyArtifact.sha256, null, true,
      identity(copy["artifactIdentity"], ["device", "inode", "size", "mtimeNs", "ctimeNs", "birthtimeNs", "mode", "uid", "gid", "links"]));
    const path = text(checkpoint["checkpoint"]);
    const receiptPath = text(checkpoint["receiptPath"]);
    const checkpointDirectory = join(controlDataDirectory(), "checkpoints");
    requireEvidence(dirname(path) === checkpointDirectory && dirname(receiptPath) === checkpointDirectory && basename(path).endsWith(".eprj2") && basename(receiptPath).endsWith(".json"), "closure-checkpoint-path");
    add(`checkpoint:${String(ordinal)}`, path, null, 268_435_456, hash(checkpoint["checkpointSha256"]), null, true,
      identity(checkpoint["checkpointIdentity"], ["dev", "ino", "birthtimeNs", "ctimeNs"]));
    const receiptText = `${JSON.stringify(checkpoint, null, 2)}\n`;
    // Cold lifecycle replay already requires these exact producer bytes.
    add(`receipt:${String(ordinal)}`, receiptPath, size(Buffer.byteLength(receiptText), 60_000), 60_000, sha256Text(receiptText), sha256Json(checkpoint));
  }
  const manifest = bag(fingerprint["reviewedCompatibilityManifest"]), manifestPath = reviewedCompatibilityManifestPath();
  requireEvidence(manifest["path"] === manifestPath, "closure-manifest-path");
  add("manifest", manifestPath, size(manifest["bytes"], 4_194_304), 4_194_304, hash(manifest["sha256"]), null, false, null, false);
  // These fixed packaged files are also freshly read by the cold v2 compiler.
  // Their identities and bytes must remain dependencies of every warm reuse.
  for (const asset of mainReferenceV3AssetDescriptors()) {
    add(`compiler:${asset.name}`, asset.path, asset.bytes, asset.maximumBytes, asset.sha256, null, false, null, false);
  }
  requireEvidence(roles.length === AGED_CLOSURE_LIMITS.roles, "closure-role-count");
  const distinct = new Map<string, ClosureRole>(); let knownBytes = 0;
  for (const role of roles) {
    const previous = distinct.get(role.path);
    if (previous === undefined) { distinct.set(role.path, role); knownBytes += role.bytes ?? 0; }
    else { requireEvidence(previous.bytes === role.bytes && previous.sha256 === role.sha256 && previous.database === role.database && previous.managed === role.managed &&
      canonicalJson(previous.recordedIdentity) === canonicalJson(role.recordedIdentity), "closure-alias-conflict"); }
  }
  eligible(distinct.size <= AGED_CLOSURE_LIMITS.files && knownBytes <= CLOSURE_LIMITS.aggregateBytes, "closure-aggregate-budget");
  return Object.freeze({ profile: "private.aged-terminal-closure-plan.v1", operationId, inputSha256: sha256Json(data), roles: Object.freeze(roles), runtime,
    semanticValidationPerformed: false, executionAuthorized: false, completionProved: false });
}
