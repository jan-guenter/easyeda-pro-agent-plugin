/** Internal data recorder. No runtime, dispatch, restored brand or completion grant. */
import { join } from "node:path";
import { TERMINAL_STATE, parseClosedSymbolTerminalArtifact } from "./closed-symbol-terminal-shape.ts";
import { reconstructProfiledClosedSymbolTerminalPredecessor } from "./closed-symbol-terminal-profiles.ts";
import { controlRootCapability, createOperation, loadOperation, operationPath, readArtifact, readExactUtf8Artifact, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isErrnoException, isRecord, sha256Json } from "./core.ts";
import type { TrackedDispatchOperationJournal } from "./engine.ts";
import { projectSymbolMetadataOperation } from "./project-symbol-metadata.ts";

export const FAMILY = "easyeda-pro-control.project-symbol-closed-session.v1";
const EVENT = "easyeda-pro-control.project-symbol-closed-session-event.v1";
const MAX_EVENT_BYTES = 60_000;
const HASH = /^[a-f0-9]{64}$/u, UUID = /^[a-f0-9]{32}$/u;
const DOCUMENT_UUID = /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u;
export const STEPS = ["baseline-launch", "baseline-admission", "baseline-marker-create", "baseline-close", "baseline-copy", "edit-launch", "edit-admission", "edit-marker-read", "edit-open", "edit-witness", "edit-write", "edit-close", "edit-copy", "edit-sql-compare", "verify-launch", "verify-admission", "verify-marker-read", "verify-open", "verify-content-read", "verify-close", "verify-copy", "verify-sql-compare"] as const;
type Step = typeof STEPS[number];
type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface LaunchGeneration {
  readonly ordinal: number; readonly helperInstance: string; readonly jobId: string;
  readonly rootPid: number; readonly rootStartIdentity: string;
}
export interface Generation extends LaunchGeneration {
  readonly runtimeSha256: string; readonly sessionSha256: string; readonly captureSha256: string;
}
export interface ClosedJournal extends TrackedDispatchOperationJournal {
  plan: ClosedSymbolPlan;
  closedPlanSha256: string;
  markerSha256: string;
}
export interface ClosedSymbolPlan extends Record<string, unknown> {
  readonly profile: typeof FAMILY;
  readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string;
  readonly targetUuid: string; readonly activeUuid: string; readonly projectPath: string;
  readonly operation: ReturnType<typeof projectSymbolMetadataOperation>;
  readonly marker: Readonly<Record<"namespaceNonce" | "keyNonce" | "bodyNonce", string>>;
  readonly nativePinsSha256: string; readonly facadeSha256: string;
  readonly expectedFingerprintSha256: string;
}
export interface PhaseEvent {
  readonly profile: typeof EVENT; readonly operationId: string; readonly closedPlanSha256: string;
  readonly markerSha256: string; readonly sequence: number; readonly step: Step;
  readonly kind: "intent" | "result"; readonly generationOrdinal: number;
  readonly generation: LaunchGeneration | Generation | null; readonly previousArtifactSha256: string | null;
  readonly requestSha256: string; readonly dataSha256: string; readonly data: Json;
}
export interface AppendInput {
  readonly step: Step; readonly kind: "intent" | "result";
  readonly generation: LaunchGeneration | Generation | null; readonly requestSha256: string; readonly data: unknown;
}
const busy = new Set<string>();
function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }
function exact(input: unknown, keys: readonly string[]): Record<string, unknown> {
  requireValue(isRecord(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === keys.length, "Closed journal exact object refused.");
  const value: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    requireValue(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "Closed journal requires own data fields.");
    value[key] = descriptor.value as unknown;
  }
  return value;
}
function text(input: unknown, pattern: RegExp): string { requireValue(typeof input === "string" && pattern.test(input), "Closed journal text refused."); return input; }
function jsonData(input: unknown): Json {
  let nodes = 0, textBytes = 0;
  const seen = new Set<object>();
  function retainText(value: string, limit: number): void {
    requireValue(value.length <= limit, "Closed journal string/key bound exceeded.");
    const bytes = Buffer.byteLength(value);
    requireValue(bytes <= limit, "Closed journal string/key bound exceeded.");
    textBytes += bytes;
    requireValue(textBytes <= 48_000, "Closed journal cumulative text byte bound exceeded.");
  }
  function visit(value: unknown, depth: number): Json {
    nodes += 1;
    requireValue(nodes <= 4096 && depth <= 16, "Closed journal data bounds exceeded.");
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { retainText(value, 48_000); return value; }
    if (typeof value === "number") { requireValue(Number.isFinite(value) && !Object.is(value, -0), "Closed journal numeric data refused."); return value; }
    requireValue(typeof value === "object" && !seen.has(value), "Closed journal non-JSON data refused."); seen.add(value);
    try {
      if (Array.isArray(value)) {
        requireValue(Object.getPrototypeOf(value) === Array.prototype && value.length <= 4096 && Reflect.ownKeys(value).length === value.length + 1, "Closed journal sparse/extra array refused.");
        const result: Json[] = [];
        for (let index = 0; index < value.length; index += 1) {
          const item = Object.getOwnPropertyDescriptor(value, String(index));
          requireValue(item !== undefined && Object.hasOwn(item, "value"), "Closed journal array accessor refused.");
          result.push(visit(item.value as unknown, depth + 1));
        }
        return result;
      }
      requireValue(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "Closed journal data prototype refused.");
      const result: Record<string, Json> = {};
      for (const key of Reflect.ownKeys(value)) {
        requireValue(typeof key === "string", "Closed journal symbol field refused.");
        retainText(key, 512);
        const item = Object.getOwnPropertyDescriptor(value, key);
        requireValue(item !== undefined && Object.hasOwn(item, "value"), "Closed journal data accessor refused.");
        Object.defineProperty(result, key, { value: visit(item.value as unknown, depth + 1), enumerable: true, writable: true, configurable: true });
      }
      return result;
    } finally { seen.delete(value); }
  }
  const result = visit(input, 0);
  requireValue(Buffer.byteLength(JSON.stringify(result)) <= 48_000, "Closed journal data byte bound exceeded.");
  return result;
}
function launchGeneration(input: unknown): LaunchGeneration {
  const value = exact(input, ["ordinal", "helperInstance", "jobId", "rootPid", "rootStartIdentity"]);
  const ordinal = value["ordinal"], rootPid = value["rootPid"];
  requireValue(typeof ordinal === "number" && Number.isInteger(ordinal) && ordinal >= 0 && ordinal <= 2 && typeof rootPid === "number" && Number.isSafeInteger(rootPid) && rootPid > 0, "Closed journal generation number refused.");
  const jobId = text(value["jobId"], UUID), rootStartIdentity = text(value["rootStartIdentity"], /^win32:\d{15,20}:job:[a-f0-9]{32}$/u);
  requireValue(rootStartIdentity.endsWith(`:job:${jobId}`), "Closed journal root belongs to another Job.");
  return { ordinal, rootPid, helperInstance: text(value["helperInstance"], UUID), jobId, rootStartIdentity };
}
function launchFields(input: LaunchGeneration): LaunchGeneration {
  return { ordinal: input.ordinal, helperInstance: input.helperInstance, jobId: input.jobId, rootPid: input.rootPid, rootStartIdentity: input.rootStartIdentity };
}
function generation(input: unknown): Generation {
  const value = exact(input, ["ordinal", "helperInstance", "jobId", "rootPid", "rootStartIdentity", "runtimeSha256", "sessionSha256", "captureSha256"]);
  const launch = launchGeneration({ ordinal: value["ordinal"], helperInstance: value["helperInstance"], jobId: value["jobId"], rootPid: value["rootPid"], rootStartIdentity: value["rootStartIdentity"] });
  return { ...launch, runtimeSha256: text(value["runtimeSha256"], HASH), sessionSha256: text(value["sessionSha256"], HASH), captureSha256: text(value["captureSha256"], HASH) };
}
function phaseGeneration(step: Step, kind: "intent" | "result", input: unknown): LaunchGeneration | Generation | null {
  if (input === null) { return null; }
  return step.endsWith("-launch") || (step.endsWith("-admission") && kind === "intent") ? launchGeneration(input) : generation(input);
}
function bindLaunchData(data: Json, bound: LaunchGeneration): void {
  const envelope = exact(data, ["launchReceipt", "launchReceiptSha256"]);
  const receipt = exact(envelope["launchReceipt"], ["jobId", "helperInstance", "root"]);
  const root = exact(receipt["root"], ["pid", "role", "startIdentity"]);
  requireValue(root["role"] === "easyeda-main", "Closed journal launch root role differs.");
  requireValue(text(envelope["launchReceiptSha256"], HASH) === sha256Json(receipt), "Closed journal launch receipt hash differs.");
  const observed = launchGeneration({ ordinal: bound.ordinal, helperInstance: receipt["helperInstance"], jobId: receipt["jobId"], rootPid: root["pid"], rootStartIdentity: root["startIdentity"] });
  requireValue(canonicalJson(observed) === canonicalJson(bound), "Closed journal launch receipt binding differs.");
}
function plan(input: unknown): ClosedSymbolPlan {
  const value = exact(input, ["profile", "projectUuid", "branchUuid", "ownerUuid", "targetUuid", "activeUuid", "projectPath", "operation", "marker", "nativePinsSha256", "facadeSha256", "expectedFingerprintSha256"]);
  requireValue(value["profile"] === FAMILY, "Wrong closed journal family.");
  const projectUuid = text(value["projectUuid"], /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u);
  const targetUuid = text(value["targetUuid"], DOCUMENT_UUID);
  const activeUuid = text(value["activeUuid"], DOCUMENT_UUID);
  requireValue(activeUuid !== targetUuid, "Closed journal target/peer collision.");
  const operation = projectSymbolMetadataOperation(value["operation"]);
  requireValue("uuid" in operation.target && operation.target.uuid === targetUuid && operation.libraryUuid === projectUuid, "Closed journal operation identity differs.");
  const markerFields = exact(value["marker"], ["namespaceNonce", "keyNonce", "bodyNonce"]);
  const marker = { namespaceNonce: text(markerFields["namespaceNonce"], HASH), keyNonce: text(markerFields["keyNonce"], HASH), bodyNonce: text(markerFields["bodyNonce"], HASH) };
  return { profile: FAMILY, projectUuid, branchUuid: text(value["branchUuid"], UUID), ownerUuid: text(value["ownerUuid"], UUID), targetUuid, activeUuid,
    projectPath: text(value["projectPath"], /^(?:\/|[A-Za-z]:[\\/])[^\0\r\n]{1,2048}\.eprj2$/u), operation, marker,
    nativePinsSha256: text(value["nativePinsSha256"], HASH), facadeSha256: text(value["facadeSha256"], HASH), expectedFingerprintSha256: text(value["expectedFingerprintSha256"], HASH) };
}
function stepOrdinal(step: Step): number {
  if (step.startsWith("baseline-")) { return 0; }
  return step.startsWith("edit-") ? 1 : 2;
}
function expected(sequence: number): { step: Step; kind: "intent" | "result" } {
  const step = STEPS[Math.floor((sequence - 1) / 2)];
  requireValue(step !== undefined && Number.isInteger(sequence) && sequence >= 1, "Closed journal phase prefix exhausted or invalid.");
  return { step, kind: sequence % 2 === 1 ? "intent" : "result" };
}
function parseEvent(input: unknown): PhaseEvent {
  const value = exact(input, ["profile", "operationId", "closedPlanSha256", "markerSha256", "sequence", "step", "kind", "generationOrdinal", "generation", "previousArtifactSha256", "requestSha256", "dataSha256", "data"]);
  requireValue(value["profile"] === EVENT && typeof value["sequence"] === "number", "Closed journal event profile/sequence refused.");
  const position = expected(value["sequence"]);
  requireValue(value["step"] === position.step && value["kind"] === position.kind && value["generationOrdinal"] === stepOrdinal(position.step), "Closed journal event order differs.");
  const data = jsonData(value["data"]);
  requireValue(sha256Json(data) === value["dataSha256"], "Closed journal data hash differs.");
  return { profile: EVENT, operationId: text(value["operationId"], /^[a-z0-9][a-z0-9-]{7,95}$/iu), closedPlanSha256: text(value["closedPlanSha256"], HASH), markerSha256: text(value["markerSha256"], HASH),
    sequence: value["sequence"], ...position, generationOrdinal: stepOrdinal(position.step), generation: phaseGeneration(position.step, position.kind, value["generation"]),
    previousArtifactSha256: value["previousArtifactSha256"] === null ? null : text(value["previousArtifactSha256"], HASH), requestSha256: text(value["requestSha256"], HASH), dataSha256: text(value["dataSha256"], HASH), data };
}
function relate(journal: ClosedJournal, events: readonly PhaseEvent[], descriptors: readonly ArtifactDescriptor[]): void {
  const launches: LaunchGeneration[] = [];
  const generations: Generation[] = [];
  for (const [index, event] of events.entries()) {
    requireValue(event.sequence === index + 1 && event.operationId === journal.operationId && event.closedPlanSha256 === journal.closedPlanSha256 && event.markerSha256 === journal.markerSha256 && event.previousArtifactSha256 === (descriptors[index - 1]?.sha256 ?? null), "Closed journal phase binding differs.");
    if (event.kind === "result") { requireValue(event.requestSha256 === events[index - 1]?.requestSha256, "Closed journal result does not bind its intent."); }
    const launch = event.step.endsWith("-launch");
    if (launch && event.kind === "intent") { requireValue(event.generation === null, "Future launch intent cannot invent a generation."); }
    else {
      const bound = event.generation;
      requireValue(bound !== null && bound.ordinal === event.generationOrdinal, "Closed journal generation binding missing.");
      if (launch) {
        requireValue(launches.length === bound.ordinal && launches.every((prior) => prior.jobId !== bound.jobId && !(prior.rootPid === bound.rootPid && prior.rootStartIdentity === bound.rootStartIdentity)), "Closed journal reuses a generation.");
        bindLaunchData(event.data, bound);
        launches.push(bound);
      } else if (event.step.endsWith("-admission")) {
        requireValue(generations.length === bound.ordinal && canonicalJson(launches[bound.ordinal]) === canonicalJson(launchFields(bound)), "Closed journal admission differs from its retained launch.");
        if (event.kind === "result") { generations.push(generation(bound)); }
      } else { requireValue(canonicalJson(generations[bound.ordinal]) === canonicalJson(bound), "Closed journal generation drift."); }
    }
  }
}
function assertJournal(input: unknown): asserts input is ClosedJournal {
  requireValue(isRecord(input), "Closed journal missing.");
  const selected = plan(input["plan"]);
  requireValue(input["schema"] === OPERATION_SCHEMA && typeof input["operationId"] === "string" && input["journalPath"] === operationPath(input["operationId"]) && input["planHash"] === buildPlanHash(selected) && input["closedPlanSha256"] === sha256Json(selected) && input["markerSha256"] === sha256Json(selected.marker), "Closed journal plan binding differs.");
  requireValue(!Object.hasOwn(input, "terminalArtifact"), "Nonterminal closed journal cannot carry a terminal artifact.");
  requireValue(input["state"] === "closed-session-recording" || input["state"] === "closed-session-evidence-recorded", "Closed journal cannot declare completion.");
  requireValue(input["saved"] === false && input["reopened"] === false && typeof input["orphanedCallPossible"] === "boolean" && typeof input["hardStop"] === "boolean" && typeof input["mutationMayHaveOccurred"] === "boolean" && typeof input["mutationState"] === "string" && typeof input["nextSafeAction"] === "string" && typeof input["updatedAt"] === "string" && !Object.hasOwn(input, "context") && !Object.hasOwn(input, "preCheckpoint"), "Closed journal tracked state refused.");
  requireValue(Array.isArray(input["artifacts"]) && typeof input["sequence"] === "number" && Number.isSafeInteger(input["sequence"]) && input["sequence"] >= 0 && input["sequence"] <= STEPS.length * 2 && input["artifacts"].length === input["sequence"], "Closed journal artifact count differs.");
  requireValue(input["sequence"] < STEPS.indexOf("edit-write") * 2 + 1 || input["mutationMayHaveOccurred"],
    "Closed journal write intent lost its possible-mutation marker.");
  requireValue((input["state"] === "closed-session-evidence-recorded") === (input["sequence"] === STEPS.length * 2), "Closed journal final evidence state differs.");
}
async function readEvents(journal: ClosedJournal): Promise<PhaseEvent[]> {
  const events: PhaseEvent[] = [];
  for (const [index, descriptor] of journal.artifacts.entries()) {
    const position = expected(index + 1);
    const phase = `${position.step}-${position.kind}`;
    requireValue(descriptor.path === join(operationPath(journal.operationId).slice(0, -5), `${String(index + 1).padStart(2, "0")}-${phase}.json`) && Number.isSafeInteger(descriptor.bytes) && descriptor.bytes > 0 && descriptor.bytes <= MAX_EVENT_BYTES, "Closed journal artifact descriptor refused.");
    const read = await readExactUtf8Artifact(descriptor);
    const raw: unknown = JSON.parse(read.text); events.push(parseEvent(raw));
  }
  relate(journal, events, journal.artifacts); return events;
}
export async function createClosedSymbolJournal(operationId: string, input: unknown): Promise<ClosedJournal> {
  const selected = plan(input), timestamp = new Date().toISOString();
  const journal: ClosedJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan: selected, planHash: buildPlanHash(selected), closedPlanSha256: sha256Json(selected), markerSha256: sha256Json(selected.marker),
    state: "closed-session-recording", mutationState: "data-only", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
    nextSafeAction: "Inspect evidence only; this recorder grants no dispatch or completion authority.", sequence: 0, createdAt: timestamp, updatedAt: timestamp, artifacts: [] };
  await createOperation(journal); return journal;
}
async function readClosedSymbolPhasePrefix(journal: unknown): Promise<{ journal: ClosedJournal; events: readonly PhaseEvent[] }> {
  assertJournal(journal); const operationId = journal.operationId;
  const events = await readEvents(journal);
  if (journal.sequence < STEPS.length * 2) {
    const position = expected(journal.sequence + 1);
    const path = join(operationPath(operationId).slice(0, -5), `${String(journal.sequence + 1).padStart(2, "0")}-${position.step}-${position.kind}.json`);
    try { await readArtifact(path, 0, 1); }
    catch (error) { if (isErrnoException(error) && error.code === "ENOENT") { return { journal, events }; } throw error; }
    throw new Error("Unreferenced next phase artifact requires read-only investigation; never replay.");
  }
  return { journal, events };
}
export async function loadClosedSymbolJournal(operationId: string): Promise<{ journal: ClosedJournal; events: readonly PhaseEvent[] }> {
  return readClosedSymbolPhasePrefix(await loadOperation(operationId));
}
/** Data-only terminal structure and phase validation; never call full terminal inspection here. */
export async function loadClosedSymbolHistoricalPhaseJournal(operationId: string): Promise<{
  journal: ClosedJournal; predecessor: ClosedJournal; events: readonly PhaseEvent[]; terminalOutcomeVerified: false;
}> {
  await controlRootCapability(false);
  const stored = await loadOperation(operationId);
  if (stored["state"] !== TERMINAL_STATE) {
    const prefix = await readClosedSymbolPhasePrefix(stored);
    return { ...prefix, predecessor: prefix.journal, terminalOutcomeVerified: false };
  }
  const terminalArtifact = parseClosedSymbolTerminalArtifact(stored["terminalArtifact"], operationId);
  const raw = await readExactUtf8Artifact(terminalArtifact);
  const value: unknown = JSON.parse(raw.text);
  const predecessor = reconstructProfiledClosedSymbolTerminalPredecessor(stored, value);
  assertJournal(predecessor);
  const events = await readEvents(predecessor);
  // Reconstruction preserves every other field. This assertion narrows the
  // Actual stored record after the unchanged predecessor shape was checked.
  assertTerminalStoredJournal(stored, predecessor);
  return { journal: stored, predecessor, events, terminalOutcomeVerified: false };
}
function assertTerminalStoredJournal(value: unknown, predecessor: ClosedJournal): asserts value is ClosedJournal {
  requireValue(isRecord(value) && value["state"] === TERMINAL_STATE && canonicalJson(value["plan"]) === canonicalJson(predecessor.plan) &&
    value["closedPlanSha256"] === predecessor.closedPlanSha256 && value["markerSha256"] === predecessor.markerSha256 &&
    value["operationId"] === predecessor.operationId, "Terminal stored journal type binding differs.");
}
/** Data recording only. Pass the same actual journal used by tracked dispatch. */
export async function appendClosedSymbolEvent(journal: ClosedJournal, input: AppendInput): Promise<void> {
  const operationId = journal.operationId;
  requireValue(!busy.has(operationId), "Closed journal append already running."); busy.add(operationId);
  try {
    const fields = exact(input, ["step", "kind", "generation", "requestSha256", "data"]);
    const data = jsonData(fields["data"]);
    const capturedGeneration = jsonData(fields["generation"]);
    const requestSha256 = text(fields["requestSha256"], HASH);
    const loaded = await loadClosedSymbolJournal(operationId);
    const predecessor = loaded.journal;
    const predecessorText = canonicalJson(predecessor);
    requireValue(predecessorText === canonicalJson(journal), "Closed journal supplied predecessor is stale.");
    const unchangedCaller = (): void => {
      requireValue(canonicalJson(journal) === predecessorText, "Closed journal changed while append was awaiting I/O.");
    };
    const sequence = predecessor.sequence + 1;
    const position = expected(sequence);
    requireValue(position.step === fields["step"] && position.kind === fields["kind"], "Closed journal phase order/replay refused.");
    const event = parseEvent({ profile: EVENT, operationId, closedPlanSha256: predecessor.closedPlanSha256, markerSha256: predecessor.markerSha256, sequence,
      ...position, generationOrdinal: stepOrdinal(position.step), generation: capturedGeneration, previousArtifactSha256: predecessor.artifacts.at(-1)?.sha256 ?? null,
      requestSha256, dataSha256: sha256Json(data), data });
    relate(predecessor, [...loaded.events, event], predecessor.artifacts);
    requireValue(Buffer.byteLength(`${JSON.stringify(event)}\n`) <= MAX_EVENT_BYTES, "Closed journal event byte bound exceeded.");
    const artifact = await writePhaseArtifact(operationId, sequence, `${position.step}-${position.kind}`, event);
    unchangedCaller();
    const next = { ...predecessor, sequence, artifacts: [...predecessor.artifacts, artifact], updatedAt: new Date().toISOString(),
      // Record conservative risk in the same successor as the write intent.
      // Later evidence recording cannot clear it or claim that an edit occurred.
      mutationMayHaveOccurred: predecessor.mutationMayHaveOccurred || (position.step === "edit-write" && position.kind === "intent"),
      state: sequence === STEPS.length * 2 ? "closed-session-evidence-recorded" : "closed-session-recording" };
    await updateOperation(next);
    unchangedCaller();
    Object.assign(journal, next);
  } finally { busy.delete(operationId); }
}
/** Pure historical classification after managed integrity checks. Never resume. */
export async function inspectClosedSymbolRestart(operationId: string): Promise<Readonly<Record<string, unknown>>> {
  const { journal, events } = await loadClosedSymbolJournal(operationId), last = events.at(-1);
  let classification = "planned";
  if (last?.kind === "intent") { classification = "intent-without-result"; }
  else if (last !== undefined) { classification = events.length === STEPS.length * 2 ? "all-evidence-recorded" : "after-result"; }
  return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-restart-classification.v1", operationId, closedPlanSha256: journal.closedPlanSha256,
    classification,
    retainedEvents: events.length, lastStep: last?.step ?? null, nextEvidencePhase: events.length === STEPS.length * 2 ? null : expected(events.length + 1),
    orphanedCallPossible: journal.orphanedCallPossible, executionAuthorized: false, resumeAuthorized: false, replayAllowed: false, authorityRestored: false, completionProved: false,
    nextSafeAction: "Read retained evidence only. Never replay an intent; serialized receipts restore no runtime or proof authority." });
}
