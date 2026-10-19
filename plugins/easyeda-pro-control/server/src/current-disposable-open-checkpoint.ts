/* oxlint-disable import/max-dependencies -- The shared pre-navigation checkpoint binds each purpose to its maintained complete history/SQL qualification, managed receipt and machine-pinned reader. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, normalizeEasyedaProjectPath, sha256Text } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenPreparationCheckpoint, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationIntentSchema } from "./current-schematic-operation.ts";
import { prepareCurrentSchematicOpeningExpectation } from "./current-schematic-operation-startup.ts";
import type { CurrentSchematicOpeningExpectation } from "./current-schematic-operation-startup.ts";
import { CURRENT_SYMBOL_OPERATION_PURPOSE } from "./current-symbol-operation.ts";
import { currentSymbolStartupExpectationSchema, selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import { readExactSqlInventory } from "./sqlite-inventory.ts";

const PROFILE = "easyeda-pro-control.current-disposable-open-checkpoint.v1";
const MAX_SOURCE_BYTES = 268_435_456;

export interface CurrentDisposableOpenCheckpoint {
  readonly profile: typeof PROFILE;
  readonly checkpoint: CheckpointReceipt;
  /** Optional for historical journals. The checkpoint size is not its source size. */
  readonly preparationCheckpoint?: Readonly<CurrentDisposableOpenPreparationCheckpoint>;
  readonly targetEvidence: Readonly<{
    projectUuid: string; branchUuid: string; documentUuid: string; docType: "PCB";
    sourceSha256: string; checkpointSha256: string; documentSemanticSha256: string;
    historySemanticSha256: string; headHistoryUuid: string;
  }>;
  readonly purpose?: typeof CURRENT_SYMBOL_OPERATION_PURPOSE | typeof CURRENT_SCHEMATIC_OPERATION_PURPOSE;
  readonly startupExpectation?: CurrentSymbolStartupExpectation;
  readonly schematicExpectation?: CurrentSchematicOpeningExpectation;
}

function normalizedSource(target: CurrentDisposableOpenTarget): string {
  const raw = target.rawWindowsPath, separator = raw[2];
  if (!/^[a-z]:[\\/]/iu.test(raw) || (separator !== "\\" && separator !== "/") ||
      raw.includes(separator === "\\" ? "/" : "\\") || target.projectUuid !== sha256Text(raw)) {
    throw new Error("Disposable opening requires one exact absolute drive path and its raw-path project UUID.");
  }
  const segments = raw.slice(3).split(separator);
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === ".." ||
      segment.trim() !== segment || segment.endsWith(".") || /[<>:"|?*]/u.test(segment) ||
      /~\d/u.test(segment) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment))) {
    throw new Error("Disposable opening refuses ambiguous Windows path spellings or aliases.");
  }
  return normalizeEasyedaProjectPath(raw);
}

async function accessPolicy(source: string): Promise<CheckpointAccessPolicy> {
  return { expectedSource: source, controlRoot: await controlRootCapability(),
    artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: MAX_SOURCE_BYTES };
}

function assertSourceBinding(checkpoint: CheckpointReceipt, target: CurrentDisposableOpenTarget, source: string): void {
  if (checkpoint.schema !== "easyeda-pro-control.checkpoint.v2" || checkpoint.source !== source ||
      checkpoint.sourceSha256 !== target.expectedSourceSha256) {
    throw new Error("Disposable opening checkpoint does not match the exact requested original source.");
  }
}

async function targetEvidence(checkpoint: CheckpointReceipt, target: CurrentDisposableOpenTarget): Promise<CurrentDisposableOpenCheckpoint["targetEvidence"]> {
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" });
  const matches = history.documents.filter((document) => document.uuid === target.documentUuid);
  const document = matches[0];
  if (history.projectUuid !== target.projectUuid || !/^[a-f0-9]{32}$/u.test(history.branchUuid) ||
      matches.length !== 1 || document?.docType !== "PCB" || isNativeDocumentDeleted(document)) {
    throw new Error("Disposable opening target is not one undeleted PCB in the project's default branch.");
  }
  return Object.freeze({ projectUuid: history.projectUuid, branchUuid: history.branchUuid, documentUuid: document.uuid,
    docType: "PCB", sourceSha256: checkpoint.sourceSha256, checkpointSha256: checkpoint.checkpointSha256,
    documentSemanticSha256: document.semanticSha256, historySemanticSha256: history.semanticSha256, headHistoryUuid: history.headHistoryUuid });
}

async function unchanged(checkpoint: CheckpointReceipt, source: string): Promise<void> {
  const raw = await readArtifact(checkpoint.receiptPath, 0, 65_536);
  const actual: unknown = JSON.parse(raw.text);
  if (!raw.eof || canonicalJson(actual) !== canonicalJson(checkpoint)) {
    throw new Error("Disposable opening checkpoint receipt changed.");
  }
  const verified = await verifyCheckpoint(checkpoint.receiptPath, await accessPolicy(source));
  const fields = ["receiptPath", "source", "checkpoint", "sourceSha256", "checkpointSha256", "sourceDumpSha256", "checkpointDumpSha256"] as const;
  if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt ||
      !verified.sourceEqualsCheckpoint || fields.some((field) => verified[field] !== checkpoint[field])) {
    throw new Error("Disposable opening original source or checkpoint changed before navigation.");
  }
}

async function verifyPreparationCheckpoint(checkpoint: CheckpointReceipt, input: CurrentDisposableOpenPreparationCheckpoint): Promise<void> {
  const descriptor = currentDisposableOpenPreparationCheckpointSchema.parse(input);
  if (descriptor.path !== checkpoint.checkpoint || descriptor.sha256 !== checkpoint.checkpointSha256) {
    throw new Error("Disposable opening preparation checkpoint descriptor differs from its receipt.");
  }
  await verifyExactManagedArtifact(descriptor);
}

/** Preserve one managed SQLite snapshot before ordinary opening, whose native
 * effects may subsequently change the disposable source. This is not a promise
 * of byte-identical restoration, process closure or unchanged post-open storage.
 */
export async function prepareCurrentDisposableOpenCheckpoint(input: CurrentDisposableOpenTarget): Promise<CurrentDisposableOpenCheckpoint> {
  const target = currentDisposableOpenTargetSchema.parse(input);
  const inputText = canonicalJson(input), source = normalizedSource(target);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"),
    label: "current-disposable-open" }, await accessPolicy(source));
  assertSourceBinding(checkpoint, target, source);
  const evidence = await targetEvidence(checkpoint, target);
  // Read only the managed snapshot to obtain its actual byte count. The full
  // Hash check binds it to this receipt; unchanged below also checks identity.
  const observed = await readArtifact(checkpoint.checkpoint, 0, 1);
  const preparationCheckpoint = Object.freeze(currentDisposableOpenPreparationCheckpointSchema.parse({ path: observed.path,
    bytes: observed.size, sha256: checkpoint.checkpointSha256 }));
  await verifyPreparationCheckpoint(checkpoint, preparationCheckpoint);
  await unchanged(checkpoint, source);
  if (canonicalJson(input) !== inputText) { throw new Error("Disposable opening target changed during checkpoint preparation."); }
  return Object.freeze({ profile: PROFILE, checkpoint, preparationCheckpoint, targetEvidence: evidence });
}

/** Reprove the retained backup, default-branch PCB membership and original
 * source immediately before project opening. Never call after navigation to
 * assert unchanged storage, and never mint a replacement baseline here.
 */
export async function verifyCurrentDisposableOpenCheckpoint(prepared: CurrentDisposableOpenCheckpoint, input: CurrentDisposableOpenTarget): Promise<void> {
  const target = currentDisposableOpenTargetSchema.parse(input);
  const inputText = canonicalJson(input), preparedText = canonicalJson(prepared);
  const checkpoint = structuredClone(prepared.checkpoint), source = normalizedSource(target);
  if (prepared.profile !== PROFILE) { throw new Error("Disposable opening checkpoint profile is unsupported."); }
  assertSourceBinding(checkpoint, target, source);
  const evidence = await targetEvidence(checkpoint, target);
  if (canonicalJson(evidence) !== canonicalJson(prepared.targetEvidence)) { throw new Error("Disposable opening target evidence changed."); }
  if (prepared.preparationCheckpoint !== undefined) { await verifyPreparationCheckpoint(checkpoint, prepared.preparationCheckpoint); }
  await unchanged(checkpoint, source);
  if (canonicalJson(input) !== inputText || canonicalJson(prepared) !== preparedText) {
    throw new Error("Disposable opening retained admission changed during verification.");
  }
}

async function startupExpectation(prepared: CurrentDisposableOpenCheckpoint): Promise<CurrentSymbolStartupExpectation> {
  const history = await readNativeHistoryCheckpoint({ checkpointPath: prepared.checkpoint.checkpoint,
    expectedSha256: prepared.checkpoint.checkpointSha256, projectUuid: prepared.targetEvidence.projectUuid, libraryAtomHeaders: "preserve" });
  if (history.branchUuid !== prepared.targetEvidence.branchUuid || history.semanticSha256 !== prepared.targetEvidence.historySemanticSha256) {
    throw new Error("Ordinary symbol opening startup history differs from its complete managed checkpoint.");
  }
  return selectCurrentSymbolStartupExpectation(history);
}

/** Ordinary editing must reject unsupported startup before its first navigation,
 * not discover an unsupported page/template only after opening changed storage.
 */
export async function prepareCurrentSymbolOperationCheckpoint(input: CurrentDisposableOpenTarget): Promise<CurrentDisposableOpenCheckpoint> {
  const inputText = canonicalJson(input);
  const prepared = await prepareCurrentDisposableOpenCheckpoint(input);
  const expectation = await startupExpectation(prepared);
  await unchanged(prepared.checkpoint, prepared.checkpoint.source);
  if (canonicalJson(input) !== inputText) { throw new Error("Ordinary symbol opening target changed during startup preparation."); }
  return Object.freeze({ ...prepared, purpose: CURRENT_SYMBOL_OPERATION_PURPOSE, startupExpectation: expectation });
}

export async function verifyCurrentSymbolOperationCheckpoint(prepared: CurrentDisposableOpenCheckpoint, input: CurrentDisposableOpenTarget): Promise<void> {
  const inputText = canonicalJson(input), preparedText = canonicalJson(prepared);
  if (prepared.purpose !== CURRENT_SYMBOL_OPERATION_PURPOSE || !currentSymbolStartupExpectationSchema.safeParse(prepared.startupExpectation).success) {
    throw new Error("Ordinary symbol opening needs its sealed pre-navigation startup expectation.");
  }
  await verifyCurrentDisposableOpenCheckpoint(prepared, input);
  if (canonicalJson(await startupExpectation(prepared)) !== canonicalJson(prepared.startupExpectation)) {
    throw new Error("Ordinary symbol opening startup expectation changed.");
  }
  await unchanged(prepared.checkpoint, prepared.checkpoint.source);
  if (canonicalJson(prepared) !== preparedText || canonicalJson(input) !== inputText) {
    throw new Error("Ordinary symbol opening retained startup admission changed.");
  }
}

async function schematicExpectation(prepared: CurrentDisposableOpenCheckpoint, input: unknown): Promise<CurrentSchematicOpeningExpectation> {
  const intent = currentSchematicOperationIntentSchema.parse(input);
  if (intent.target.projectUuid !== prepared.targetEvidence.projectUuid || intent.target.branchUuid !== prepared.targetEvidence.branchUuid) {
    throw new Error("Ordinary SCH opening intent differs from its checkpoint project/default branch.");
  }
  const configured = await loadRuntimeMachineProfile();
  const inventory = await readExactSqlInventory({ checkpointPath: prepared.checkpoint.checkpoint,
    expectedSha256: prepared.checkpoint.checkpointSha256, runtime: configured.profile.runtime });
  return prepareCurrentSchematicOpeningExpectation(inventory, intent);
}

export async function prepareCurrentSchematicOperationCheckpoint(input: CurrentDisposableOpenTarget, rename: unknown): Promise<CurrentDisposableOpenCheckpoint> {
  const inputText = canonicalJson(input), renameText = canonicalJson(rename);
  const prepared = await prepareCurrentDisposableOpenCheckpoint(input);
  const expectation = await schematicExpectation(prepared, rename);
  await unchanged(prepared.checkpoint, prepared.checkpoint.source);
  if (canonicalJson(input) !== inputText || canonicalJson(rename) !== renameText) {
    throw new Error("Ordinary SCH opening input changed during pre-navigation qualification.");
  }
  return Object.freeze({ ...prepared, purpose: CURRENT_SCHEMATIC_OPERATION_PURPOSE,
    startupExpectation: expectation.startup, schematicExpectation: expectation });
}

export async function verifyCurrentSchematicOperationCheckpoint(prepared: CurrentDisposableOpenCheckpoint,
  input: CurrentDisposableOpenTarget, rename: unknown): Promise<void> {
  const before = canonicalJson({ prepared, input, rename });
  if (prepared.purpose !== CURRENT_SCHEMATIC_OPERATION_PURPOSE || prepared.schematicExpectation === undefined) {
    throw new Error("Ordinary SCH opening needs its sealed pre-navigation expectation.");
  }
  await verifyCurrentDisposableOpenCheckpoint(prepared, input);
  const expectation = await schematicExpectation(prepared, rename);
  if (canonicalJson(expectation) !== canonicalJson(prepared.schematicExpectation) ||
    canonicalJson(expectation.startup) !== canonicalJson(prepared.startupExpectation)) {
    throw new Error("Ordinary SCH opening startup projection changed.");
  }
  await unchanged(prepared.checkpoint, prepared.checkpoint.source);
  if (before !== canonicalJson({ prepared, input, rename })) { throw new Error("Ordinary SCH checkpoint binding changed during verification."); }
}
