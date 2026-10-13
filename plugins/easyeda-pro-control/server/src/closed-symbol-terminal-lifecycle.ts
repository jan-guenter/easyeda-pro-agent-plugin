/** Internal historical relations only. No source-project read or restored owner. */
import { lstat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { controlDataDirectory, controlRootCapability, operationPath, readExactUtf8Artifact } from "./artifacts.ts";
import type { ClosedJournal, Generation, PhaseEvent } from "./closed-symbol-journal.ts";
import { buildStartupProgram, validateStartupResult } from "./closed-symbol-startup-program.ts";
import { canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text, validatePrivateFingerprint } from "./core.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import type { TerminalDescriptor, TerminalGenerationEvidence } from "./closed-symbol-terminal-shape.ts";
import { validateRecordedCaptureEvidence, validateRecordedNativeSource } from "./closed-symbol-recorded-native.ts";
import type { RecordedNativeSource } from "./closed-symbol-recorded-native.ts";
// oxlint-disable-next-line import/max-dependencies -- Historical replay must use the exact maintained producer window selection.
import { selectClosedSymbolApplicationWindow } from "./closed-symbol-window.ts";

type Bag = Readonly<Record<string, unknown>>;
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export interface HistoricalGeneration {
  readonly generation: Generation; readonly launch: Bag; readonly capture: Bag;
  readonly closeIntent: Bag; readonly closeReceipt: Bag; readonly proof: Bag;
  readonly checkpoint: Bag; readonly copy: Bag; readonly inventory: Inventory;
  readonly terminal: TerminalGenerationEvidence;
  readonly nativeSource: RecordedNativeSource;
}
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function bag(value: unknown): Bag { need(isRecord(value), "Terminal lifecycle object missing."); return value; }
function text(value: unknown): string { need(typeof value === "string", "Terminal lifecycle string missing."); return value; }
function timestamp(value: unknown): number {
  need(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,7}Z$/u.test(value), "Terminal native timestamp format invalid.");
  const parsed = Date.parse(value);
  need(Number.isFinite(parsed) && new Date(parsed).toISOString() === `${value.slice(0, 23)}Z`, "Terminal native timestamp calendar invalid.");
  return parsed;
}
function same(actual: unknown, expected: unknown, label: string): void { need(canonicalJson(actual) === canonicalJson(expected), `Terminal ${label} differs.`); }
function selfHash(value: Bag, name: string): void {
  const body = Object.fromEntries(Object.entries(value).filter(([key]) => key !== name));
  need(value[name] === sha256Json(body), `Terminal ${name} self-seal differs.`);
}
export function phase(events: readonly PhaseEvent[], sequence: number): PhaseEvent {
  const result = events[sequence - 1]; need(result !== undefined && result.sequence === sequence, "Terminal phase is missing or misordered."); return result;
}
export function phaseData(events: readonly PhaseEvent[], sequence: number): Bag { return bag(phase(events, sequence).data); }
export function inventoryDigests(value: Inventory): Readonly<{ checkpointSha256: string; schemaSha256: string; logicalSha256: string }> {
  const completion = readerCompletion(value);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "Terminal SQL reader did not finish successfully.");
  return { checkpointSha256: value.checkpointSha256, schemaSha256: value.schemaSha256, logicalSha256: value.logicalSha256 };
}
export async function artifactJson(descriptor: TerminalDescriptor): Promise<unknown> {
  const raw = await readExactUtf8Artifact(descriptor);
  return JSON.parse(raw.text) as unknown;
}

async function checkpointArtifact(checkpoint: Bag, copy: Bag, source: string, runtime: MachineProfile["runtime"]): Promise<void> {
  const path = text(checkpoint["checkpoint"]), receiptPath = text(checkpoint["receiptPath"]);
  const directory = join(controlDataDirectory(), "checkpoints");
  need(dirname(path) === directory && dirname(receiptPath) === directory && path.endsWith(".eprj2") && receiptPath.endsWith(".json") &&
    checkpoint["source"] === source && checkpoint["schema"] === "easyeda-pro-control.checkpoint.v2", "Terminal checkpoint paths or source binding differ.");
  selfHash(checkpoint, "receiptSha256");
  same(checkpoint["quickCheck"], { sourceBefore: "ok", sourceAfter: "ok", checkpoint: "ok" }, "checkpoint quick checks");
  need(checkpoint["sourceSha256"] === copy["sha256"] && checkpoint["sourceDumpSha256"] === checkpoint["checkpointDumpSha256"],
    "Terminal checkpoint source/hash relation differs.");
  const expected = bag(checkpoint["checkpointIdentity"]), lineage = bag(checkpoint["sourceIdentity"]);
  const sourceIdentity = bag(copy["sourceIdentity"]), stat = bag(checkpoint["sourceStatAfter"]);
  need(lineage["dev"] === sourceIdentity["device"] && lineage["ino"] === sourceIdentity["inode"] &&
    lineage["birthtimeNs"] === sourceIdentity["birthtimeNs"] && lineage["ctimeNs"] === sourceIdentity["ctimeNs"] &&
    stat["size"] === sourceIdentity["size"] && stat["mtimeNs"] === sourceIdentity["mtimeNs"] && stat["ctimeNs"] === sourceIdentity["ctimeNs"],
    "Terminal checkpoint and raw-copy source lineage differ.");
  // The producer writes these exact pretty JSON bytes. This managed read never
  // Invokes verifyCheckpoint, which would also open today's source project.
  const receiptText = `${JSON.stringify(checkpoint, null, 2)}\n`;
  need(Buffer.byteLength(receiptText) <= 60_000, "Terminal retained checkpoint receipt is oversized.");
  await readExactUtf8Artifact({ path: receiptPath, bytes: Buffer.byteLength(receiptText), sha256: sha256Text(receiptText) });
  const assertIdentity = async (): Promise<void> => {
    const value = await lstat(path, { bigint: true });
    need(value.isFile() && !value.isSymbolicLink() && value.nlink === 1n && value.mode % 512n === 0o600n &&
      typeof process.getuid === "function" && value.uid === BigInt(process.getuid()) &&
      value.dev.toString() === expected["dev"] && value.ino.toString() === expected["ino"] &&
      value.birthtimeNs.toString() === expected["birthtimeNs"] && value.ctimeNs.toString() === expected["ctimeNs"],
      "Terminal retained checkpoint identity differs.");
  };
  await assertIdentity();
  const inventory = await readExactSqlInventory({ checkpointPath: path, expectedSha256: text(checkpoint["checkpointSha256"]), runtime });
  inventoryDigests(inventory); await assertIdentity();
  // VACUUM INTO can change SQLite bookkeeping such as schema_version. Do not
  // Assert full logical equality with the separately preserved raw-byte copy.
}

function startup(journal: ClosedJournal, events: readonly PhaseEvent[], ordinal: number): void {
  const sequences = [5, 15, 33] as const;
  const names = ["baseline-marker-create", "edit-marker-read", "verify-marker-read"] as const;
  const sequence = sequences[ordinal];
  const selected = names[ordinal];
  need(sequence !== undefined && selected !== undefined, "Terminal startup ordinal differs.");
  const input = { phase: selected, projectUuid: journal.plan.projectUuid, branchUuid: journal.plan.branchUuid, ownerUuid: journal.plan.ownerUuid, marker: journal.plan.marker };
  const request = { profile: "easyeda-pro-control.closed-symbol-startup-request.v1", input,
    codeSha256: sha256Text(buildStartupProgram(input)), directMainFrameOnly: true };
  same(phaseData(events, sequence), request, "startup fixed request");
  need(phase(events, sequence).requestSha256 === sha256Json(request), "Terminal startup request hash differs.");
  const data = phaseData(events, sequence + 1);
  same(Object.keys(data), ["rawReturn"], "startup result fields");
  const validated = validateStartupResult(extractToolPayload(data["rawReturn"]), input);
  need(validated["ok"] === true, "Terminal startup observation did not pass.");
}

export async function replayRecordedLifecycle(input: Readonly<{
  journal: ClosedJournal; events: readonly PhaseEvent[]; inventories: readonly [Inventory, Inventory, Inventory];
  fingerprint: TerminalDescriptor; windows: readonly [TerminalDescriptor, TerminalDescriptor, TerminalDescriptor]; runtime: MachineProfile["runtime"];
  nativeClockSource: Bag;
}>): Promise<readonly [HistoricalGeneration, HistoricalGeneration, HistoricalGeneration]> {
  const { journal, events, inventories } = input;
  const captured = canonicalJson({ journal, events, fingerprint: input.fingerprint, windows: input.windows, nativeClockSource: input.nativeClockSource });
  const current = (): void => { same(canonicalJson({ journal, events, fingerprint: input.fingerprint, windows: input.windows, nativeClockSource: input.nativeClockSource }), captured, "lifecycle input changed"); };
  need(journal.sequence === 44 && events.length === 44 && journal.state === "closed-session-evidence-recorded" &&
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Refuse malformed untyped historical flags, not merely truthy values.
    !journal.hardStop && !journal.orphanedCallPossible && journal.saved === false && journal.reopened === false, "Terminal requires exact nonquarantined44 predecessor.");
  await controlRootCapability(false); current();
  need(input.fingerprint.path === join(operationPath(journal.operationId).slice(0, -5), "00-expected-fingerprint.json") && input.fingerprint.bytes <= 262_144,
    "Terminal fingerprint path or bound differs.");
  const fingerprint = bag(await artifactJson(input.fingerprint)); current(); validatePrivateFingerprint(fingerprint);
  const implementation = bag(fingerprint["facadeImplementation"]);
  need(sha256Json(fingerprint) === journal.plan.expectedFingerprintSha256 && implementation["sha256"] === journal.plan.facadeSha256,
    "Terminal fingerprint differs from its sealed plan.");
  const scope = input.nativeClockSource["executionScopeSha256"];
  need(typeof scope === "string" && /^[a-f0-9]{64}$/u.test(scope), "Terminal retained execution scope is missing.");
  const editGeneration = phase(events, 14).generation;
  need(editGeneration !== null && "captureSha256" in editGeneration, "Terminal edit admission generation missing.");
  const source = validateRecordedNativeSource({ journal, fingerprint, bootstrapStatus: phaseData(events, 1)["runtimeStatus"],
    launchClock: input.nativeClockSource, launchGeneration: editGeneration });
  const result: HistoricalGeneration[] = [];
  for (const ordinal of [0, 1, 2] as const) {
    const indices = [[2, 4, 7, 8, 9, 10], [12, 14, 23, 24, 25, 26], [30, 32, 39, 40, 41, 42]][ordinal];
    need(indices !== undefined, "Terminal ordinal mapping missing.");
    const [launchIndex, admissionIndex, closeIntentIndex, closeResultIndex, copyIntentIndex, copyResultIndex] = indices;
    need(launchIndex !== undefined && admissionIndex !== undefined && closeIntentIndex !== undefined && closeResultIndex !== undefined && copyIntentIndex !== undefined && copyResultIndex !== undefined,
      "Terminal phase mapping incomplete.");
    const admission = phase(events, admissionIndex), generation = admission.generation;
    need(generation !== null && "captureSha256" in generation && generation.ordinal === ordinal, "Terminal full generation missing.");
    const launchData = phaseData(events, launchIndex);
    const launch = bag(launchData["launchReceipt"]);
    const captureData = phaseData(events, admissionIndex);
    const capture = bag(captureData["capture"]);
    same(captureData, { capture, captureSha256: sha256Json(capture) }, "complete admission result");
    const authority = bag(capture["executionAuthority"]);
    const capturePhase = (["closed-baseline", "closed-edit", "closed-verification"] as const)[ordinal];
    const launchRequest = phaseData(events, launchIndex - 1);
    const admissionRequest = phaseData(events, admissionIndex - 1);
    const admissionPhase = ["baseline-admission", "edit-admission", "verify-admission"][ordinal];
    if (ordinal === 0) {
      same(launchRequest, { profile: "easyeda-pro-control.closed-symbol-bootstrap-launch-request.v1", operationId: journal.operationId,
        closedPlanSha256: journal.closedPlanSha256, runtimeStatus: { state: "not-launched", launch: null, executableSha256: null, reviewedExecutionScopeSha256: scope } }, "bootstrap request");
    } else {
      const previousCopyIndex = ordinal === 1 ? 9 : 25;
      const prior = phaseData(events, previousCopyIndex), priorResult = phaseData(events, previousCopyIndex + 1);
      same(launchRequest, { profile: "easyeda-pro-control.closed-symbol-relaunch-request.v1", operationId: journal.operationId,
        phase: ordinal === 1 ? "edit-launch" : "verify-launch", closedPlanSha256: journal.closedPlanSha256,
        priorCopySha256: bag(priorResult["copyReceipt"])["receiptSha256"], priorProofSha256: bag(prior["proof"])["proofSha256"], checkpoint: prior["checkpoint"] }, "relaunch request");
    }
    same(admissionRequest, { profile: "easyeda-pro-control.closed-symbol-admission-request.v1", operationId: journal.operationId, phase: admissionPhase,
      closedPlanSha256: journal.closedPlanSha256, launchReceiptSha256: sha256Json(launch), capturePhase, challengeAttempt: 1,
      bridgeDispatch: admissionRequest["bridgeDispatch"] }, "admission request");
    need(phase(events, launchIndex - 1).requestSha256 === sha256Json(launchRequest) && phase(events, admissionIndex - 1).requestSha256 === sha256Json(admissionRequest),
      "Terminal launch or admission request digest differs.");
    validateRecordedCaptureEvidence({ journal, generation, capture, phase: capturePhase, attempt: 1,
      bridgeDispatch: admissionRequest["bridgeDispatch"], source });
    need(launchData["launchReceiptSha256"] === sha256Json(launch) && captureData["captureSha256"] === sha256Json(capture) &&
      sha256Json(capture) === generation.captureSha256 && capture["operationId"] === journal.operationId && capture["phase"] === capturePhase &&
      capture["challengeAttempt"] === 1 && sha256Json(capture["bridgeSession"]) === generation.sessionSha256 && sha256Json(capture["runtimeIdentity"]) === generation.runtimeSha256,
      "Terminal admission capture/launch relation differs.");
    selfHash(authority, "authoritySha256");
    const processes = authority["processes"];
    need(authority["schema"] === "easyeda-pro-control.execution-authority.v1" && Array.isArray(processes) && processes.length > 0 && processes.length <= 512 &&
      authority["processTreeSha256"] === sha256Json(processes), "Terminal captured process tree differs.");
    const roots = processes.filter((entry: unknown) => isRecord(entry) && entry["role"] === "easyeda-main");
    need(roots.length === 1 && isRecord(roots[0]) && roots[0]["pid"] === generation.rootPid && roots[0]["startIdentity"] === generation.rootStartIdentity,
      "Terminal captured main process differs.");
    const closeData = phaseData(events, closeIntentIndex);
    const closeIntent = bag(closeData["intent"]);
    same(closeData, { intent: closeIntent, capture, launch }, "complete close intent");
    const closeResult = phaseData(events, closeResultIndex);
    const closeReceipt = bag(closeResult["closeReceipt"]);
    const copyIntent = phaseData(events, copyIntentIndex);
    const proof = bag(copyIntent["proof"]);
    const copyResult = phaseData(events, copyResultIndex);
    const copy = bag(copyResult["copyReceipt"]);
    const checkpoint = bag(copyIntent["checkpoint"]);
    same(closeData["capture"], capture, "close capture"); same(closeData["launch"], launch, "close launch");
    selfHash(closeIntent, "closeIntentSha256");
    same(closeIntent, { schema: "easyeda-pro-control.closed-session-close-intent.v1", operationId: journal.operationId, phase: capturePhase, challengeAttempt: 1,
      authoritySha256: authority["authoritySha256"], captureBindingSha256: authority["bindingSha256"], launchSha256: sha256Json(launch),
      bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256, helperInstance: generation.helperInstance,
      jobId: generation.jobId, windowHandle: closeIntent["windowHandle"], preparedAt: closeIntent["preparedAt"],
      policyId: authority["policyId"], policySha256: authority["policySha256"], closeIntentSha256: closeIntent["closeIntentSha256"] }, "close intent");
    need(typeof closeIntent["windowHandle"] === "string" && /^[1-9]\d{0,18}$/u.test(closeIntent["windowHandle"]), "Terminal close window invalid.");
    timestamp(closeIntent["preparedAt"]);
    const receiptBody = { schema: "easyeda-pro-control.closed-session-close-dispatch.v1", closeIntentSha256: closeIntent["closeIntentSha256"],
      closeDispatched: true, saveOrDiscardSelected: false, terminationProved: false };
    same(closeReceipt, { ...receiptBody, closeReceiptSha256: sha256Json(receiptBody) }, "one-shot close receipt");
    same(closeResult, { closeIntentSha256: closeIntent["closeIntentSha256"], closeReceipt, closeReceiptSha256: sha256Json(closeReceipt) }, "close result");
    const proofBody = { schema: "easyeda-pro-control.closed-session-termination.v1", operationId: journal.operationId, phase: capturePhase, challengeAttempt: 1,
      closeIntentSha256: closeIntent["closeIntentSha256"], closeReceiptSha256: closeReceipt["closeReceiptSha256"], authoritySha256: authority["authoritySha256"],
      launchSha256: sha256Json(launch), bridgeSessionSha256: generation.sessionSha256, runtimeIdentitySha256: generation.runtimeSha256,
      helperInstance: generation.helperInstance, jobId: generation.jobId, closedAt: proof["closedAt"], jobEmpty: true, retainedProcessesExited: true,
      saveOrDiscardSelected: false, policyId: authority["policyId"], policySha256: authority["policySha256"],
      queuedWritesPersisted: "not-proved", persistentWorkReplayExcluded: "not-proved" };
    same(proof, { ...proofBody, proofSha256: sha256Json(proofBody) }, "whole-Job termination receipt");
    need(timestamp(authority["capturedAt"]) <= timestamp(proof["closedAt"]),
      "Terminal admission was recorded after its closed-session receipt.");
    same(copyIntent, { proof, checkpoint, source: journal.plan.projectPath, generation }, "copy intent");
    const inventory = inventories[ordinal];
    need(copy["closureProofSha256"] === proof["proofSha256"] && copy["source"] === journal.plan.projectPath && copy["sha256"] === inventory.checkpointSha256,
      "Terminal copy/proof relation differs.");
    same(copyResult, { copyReceipt: copy, sqlDigests: inventoryDigests(inventory) }, "copy result");
    const windowDescriptor = input.windows[ordinal];
    const windowName = ["baseline", "edit", "verify"][ordinal];
    need(windowDescriptor.bytes <= 262_144 && windowDescriptor.path === join(operationPath(journal.operationId).slice(0, -5), `00-${String(windowName)}-owned-window.json`),
      "Terminal owned-window path or bound differs.");
    const window = bag(await artifactJson(windowDescriptor)); current();
    same(Object.keys(window).toSorted(), ["generation", "observed", "profile"], "owned-window fields");
    same(window["generation"], generation, "owned-window generation");
    const observed = bag(window["observed"]);
    const binding = bag(observed["binding"]);
    const windows = bag(observed["result"]);
    need(window["profile"] === "private.closed-symbol-owned-window.v1" && observed["schema"] === "easyeda-pro-control.windows-native-ui.v1" &&
      observed["action"] === "windows" && observed["authority"] === "retained-job" && binding["rootPid"] === generation.rootPid &&
      binding["executable"] === source.executable && binding["executableSha256"] === source.executableSha256 &&
      generation.rootStartIdentity === `win32:${String(binding["rootStartTicks"])}:job:${generation.jobId}`,
      "Terminal owned-window and close binding differ.");
    need(selectClosedSymbolApplicationWindow(windows, generation.rootPid) === closeIntent["windowHandle"], "Terminal window selection and close binding differ.");
    startup(journal, events, ordinal);
    await checkpointArtifact(checkpoint, copy, journal.plan.projectPath, input.runtime); current();
    const artifact = text(copy["artifact"]), bytes = copy["bytes"];
    need(typeof bytes === "number" && Number.isSafeInteger(bytes) && bytes > 0 && bytes <= 268_435_456 && dirname(artifact) === operationPath(journal.operationId).slice(0, -5) &&
      /^closed-copy-[a-f0-9-]+\.eprj2$/u.test(basename(artifact)), "Terminal copy artifact is invalid.");
    result.push({ generation, launch, capture, closeIntent, closeReceipt, proof, checkpoint, copy, inventory, nativeSource: source,
      terminal: { ordinal, generationSha256: sha256Json(generation), launchReceiptSha256: sha256Json(launch), closeIntentSha256: sha256Json(closeIntent),
        closeReceiptSha256: sha256Json(closeReceipt), terminationProofSha256: sha256Json(proof), checkpointReceiptSha256: sha256Json(checkpoint),
        copyReceiptSha256: sha256Json(copy), copyArtifact: { path: artifact, bytes, sha256: inventory.checkpointSha256 }, sqlDigests: inventoryDigests(inventory) } });
  }
  const [baseline, edit, verification] = result;
  need(result.length === 3 && baseline !== undefined && edit !== undefined && verification !== undefined &&
    new Set(result.map((entry) => entry.generation.jobId)).size === 3 && new Set(result.map((entry) => entry.generation.sessionSha256)).size === 3,
    "Terminal generations are incomplete or reused.");
  return Object.freeze([baseline, edit, verification] as const);
}
