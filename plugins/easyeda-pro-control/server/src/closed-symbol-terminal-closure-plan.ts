/** Private data-only closure derivation. This does not validate historical completion. */
import { basename, dirname, join, resolve } from "node:path";
import { controlDataDirectory, operationPath } from "./artifacts.ts";
import { STEPS } from "./closed-symbol-journal.ts";
import { parseClosedSymbolTerminalArtifact, parseClosedSymbolTerminalEnvelope, reconstructClosedSymbolTerminalPredecessor } from "./closed-symbol-terminal-shape.ts";
import { canonicalJson, isRecord, reviewedCompatibilityManifestPath, sha256Json, sha256Text } from "./core.ts";
import { ClosureEvidenceChangedError } from "./closed-symbol-terminal-closure-evidence-error.ts";
import { ClosureIneligibleError } from "./closed-symbol-terminal-closure-ineligible-error.ts";

export { ClosureEvidenceChangedError } from "./closed-symbol-terminal-closure-evidence-error.ts";
export { ClosureIneligibleError } from "./closed-symbol-terminal-closure-ineligible-error.ts";

export const CLOSURE_LIMITS = Object.freeze({ roles: 64, files: 62, chunkBytes: 262_144, aggregateBytes: 536_870_912, deadlineMs: 10_000, inputBytes: 8_388_608, metadataBytes: 1_048_576 });
type Bag = Readonly<Record<string, unknown>>;
export interface ClosureRole {
  readonly role: string; readonly path: string; readonly bytes: number | null; readonly maximumBytes: number;
  readonly sha256: string; readonly jsonSha256: string | null; readonly database: boolean;
  readonly recordedIdentity: Readonly<Record<string, string>> | null; readonly managed: boolean;
}
export interface ClosurePlan {
  readonly profile: "private.closed-terminal-closure-plan.v1"; readonly operationId: string;
  readonly inputSha256: string; readonly roles: readonly ClosureRole[]; readonly runtime: Bag;
  readonly semanticValidationPerformed: false; readonly executionAuthorized: false; readonly completionProved: false;
}
export function requireEvidence(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new ClosureEvidenceChangedError(message); }
}
function eligible(condition: boolean, message: string): asserts condition { if (!condition) { throw new ClosureIneligibleError(message); } }
export function ownBoundedData(input: unknown): unknown {
  let nodes = 0;
  let bytes = 0;
  const seen = new Set<object>();
  function copy(value: unknown, depth: number): unknown {
    nodes += 1; eligible(nodes <= 250_000 && depth <= 64, "closure-input-complexity");
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { bytes += Buffer.byteLength(value); eligible(bytes <= CLOSURE_LIMITS.inputBytes, "closure-input-bytes"); return value; }
    if (typeof value === "number") { requireEvidence(Number.isFinite(value) && !Object.is(value, -0), "closure-json-number"); return value; }
    requireEvidence(typeof value === "object" && !seen.has(value), "closure-json-object");
    requireEvidence(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null || Array.isArray(value) && Object.getPrototypeOf(value) === Array.prototype, "closure-json-prototype");
    seen.add(value);
    try {
      if (Array.isArray(value)) {
        requireEvidence(Reflect.ownKeys(value).length === value.length + 1, "closure-array-properties");
        const result: unknown[] = [];
        for (let index = 0; index < value.length; index += 1) {
          const property = Object.getOwnPropertyDescriptor(value, String(index));
          requireEvidence(property !== undefined && Object.hasOwn(property, "value"), "closure-array-data"); result.push(copy(property.value as unknown, depth + 1));
        }
        return Object.freeze(result);
      }
      const result: Record<string, unknown> = {};
      for (const key of Reflect.ownKeys(value)) {
        requireEvidence(typeof key === "string", "closure-json-symbol");
        bytes += Buffer.byteLength(key); eligible(bytes <= CLOSURE_LIMITS.inputBytes, "closure-input-bytes");
        const property = Object.getOwnPropertyDescriptor(value, key);
        requireEvidence(property !== undefined && Object.hasOwn(property, "value"), "closure-own-data");
        Object.defineProperty(result, key, { value: copy(property.value as unknown, depth + 1), enumerable: true });
      }
      return Object.freeze(result);
    } finally { seen.delete(value); }
  }
  const output = copy(input, 0);
  eligible(Buffer.byteLength(JSON.stringify(output)) <= CLOSURE_LIMITS.inputBytes, "closure-input-encoding"); return output;
}
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
export function deriveClosedSymbolTerminalClosure(input: unknown): ClosurePlan {
  const data = bag(ownBoundedData(input));
  requireEvidence(canonicalJson(Object.keys(data).toSorted()) === canonicalJson(["envelope", "events", "fingerprint", "journal", "journalBytes", "runtime"]), "closure-input-fields");
  const journal = bag(data["journal"]);
  const envelope = parseClosedSymbolTerminalEnvelope(data["envelope"]);
  reconstructClosedSymbolTerminalPredecessor(journal, envelope);
  const operationId = envelope.body.operationId;
  const directory = operationPath(operationId).slice(0, -5);
  const terminal = parseClosedSymbolTerminalArtifact(journal["terminalArtifact"], operationId);
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
  requireEvidence(roles.length === CLOSURE_LIMITS.roles, "closure-role-count");
  const distinct = new Map<string, ClosureRole>(); let knownBytes = 0;
  for (const role of roles) {
    const previous = distinct.get(role.path);
    if (previous === undefined) { distinct.set(role.path, role); knownBytes += role.bytes ?? 0; }
    else { requireEvidence(previous.bytes === role.bytes && previous.sha256 === role.sha256 && previous.database === role.database && previous.managed === role.managed &&
      canonicalJson(previous.recordedIdentity) === canonicalJson(role.recordedIdentity), "closure-alias-conflict"); }
  }
  eligible(distinct.size <= CLOSURE_LIMITS.files && knownBytes <= CLOSURE_LIMITS.aggregateBytes, "closure-aggregate-budget");
  return Object.freeze({ profile: "private.closed-terminal-closure-plan.v1", operationId, inputSha256: sha256Json(data), roles: Object.freeze(roles), runtime,
    semanticValidationPerformed: false, executionAuthorized: false, completionProved: false });
}
