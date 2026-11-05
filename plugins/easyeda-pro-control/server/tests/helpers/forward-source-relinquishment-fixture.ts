/** Actual managed Source chain, historical private maps and generic engine
 * guards. A test-only VM code-profile substitution supplies synthetic hashes;
 * Windows/installation/file collectors are inert labelled seams. No production
 * profile override, native owner, process control or private design is supplied. */
/* oxlint-disable import/max-dependencies -- Exercise the actual private history, chain, admission and sidecar modules together. */
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, join } from "node:path";
import { runInThisContext } from "node:vm";
import type { TestContext } from "node:test";
import { transform } from "esbuild";
import { controlDataDirectory, createOperation, operationPath, publishManagedAttachmentExclusive, writePhaseArtifact } from "../../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, sha256Json, sha256Text } from "../../src/core.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET, CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PROFILE,
  currentFootprintForwardExecutionOpeningRequestSchema } from "../../src/current-footprint-forward-execution-opening-contract.ts";
import type { CurrentFootprintForwardExecutionOpeningRecord } from "../../src/current-footprint-forward-execution-opening-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_KINDS as KINDS, CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE as PROFILE } from "../../src/current-footprint-forward-source-relinquishment-contract.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../../src/current-pcb-diagnostic-installation.ts";
import { ORDINARY_LAUNCH_RECOVERY_HELPER } from "../../src/ordinary-launch-recovery.ts";
import { currentFootprintForwardOpeningFileProofSchema } from "../../src/current-footprint-forward-opening-relinquishment-file-proof.ts";
import type { CurrentFootprintForwardSourceRelinquishmentRequest,currentFootprintForwardSourceRelinquishmentRequestSchema,currentFootprintForwardSourceRelinquishmentResultSchema } from "../../src/current-footprint-forward-source-relinquishment-contract.ts";
import type { CurrentFootprintForwardSourceUnknownRelinquishment, CurrentFootprintForwardSourceUnknownRelinquishmentDependencies, CurrentFootprintForwardSourceUnknownRelinquishmentOptions } from "../../src/current-footprint-forward-source-unknown-relinquishment.ts";
import type { assertCurrentFootprintForwardSourceHistoricalSnapshot, publishCurrentFootprintForwardSourceRelinquishment,
  readCurrentFootprintForwardSourceHistoricalSnapshot, readCurrentFootprintForwardSourceRelinquishment } from "../../src/current-footprint-forward-source-relinquishment-journal.ts";
import type { assertNoUnresolvedCurrentFootprintForwardExecutionOpenings } from "../../src/current-footprint-forward-execution-opening-journal.ts";
import type { scanQualifiedAdmissionOperations } from "../../src/closed-symbol-terminal-admission.ts";
import type { EasyedaControlEngine } from "../../src/engine.ts";

type HistoricalApi = Readonly<{ assertCurrentFootprintForwardSourceHistoricalSnapshot: typeof assertCurrentFootprintForwardSourceHistoricalSnapshot;
  publishCurrentFootprintForwardSourceRelinquishment: typeof publishCurrentFootprintForwardSourceRelinquishment;
  readCurrentFootprintForwardSourceHistoricalSnapshot: typeof readCurrentFootprintForwardSourceHistoricalSnapshot;
  readCurrentFootprintForwardSourceRelinquishment: typeof readCurrentFootprintForwardSourceRelinquishment }>;
type CoordinatorApi = Readonly<{ CurrentFootprintForwardSourceUnknownRelinquishment: typeof CurrentFootprintForwardSourceUnknownRelinquishment }>;
type ContractApi = Readonly<{ currentFootprintForwardSourceRelinquishmentRequestSchema: typeof currentFootprintForwardSourceRelinquishmentRequestSchema;
  currentFootprintForwardSourceRelinquishmentResultSchema: typeof currentFootprintForwardSourceRelinquishmentResultSchema }>;
type SourceApi = Readonly<{ assertNoUnresolvedCurrentFootprintForwardExecutionOpenings: typeof assertNoUnresolvedCurrentFootprintForwardExecutionOpenings }>;
type AdmissionApi = Readonly<{ scanQualifiedAdmissionOperations: typeof scanQualifiedAdmissionOperations }>;
type EngineApi = Readonly<{ EasyedaControlEngine: typeof EasyedaControlEngine }>;

const digest = "a".repeat(64);
export async function forwardSourceRelinquishmentFixture(context: TestContext, suffix: string): Promise<Readonly<{
  operationId: string; path: string; originalBytes: Buffer; request: CurrentFootprintForwardSourceRelinquishmentRequest;
  historical: HistoricalApi; contract: ContractApi; source: SourceApi; admission: AdmissionApi;
  engine: EasyedaControlEngine;
  owner: CurrentFootprintForwardSourceUnknownRelinquishment;
  state: { installation: number; linux: number; windows: number; files: number; otherLinux: boolean; windowsPresent: boolean; fileMismatch: boolean; loseResultAck: boolean;
    failIntentPublication: boolean; intentSnapshots: object[]; intentValues: unknown[];
    globalChecks: number; revalidations: number; changeFileAfterGlobal: boolean;
    hold: boolean; entered: PromiseWithResolvers<null>; release: PromiseWithResolvers<null> };
  restart: () => CurrentFootprintForwardSourceUnknownRelinquishment;
}>> {
  const operationId = `footprint-forward-execution-synthetic-relinquishment-${suffix}`;
  const rawWindowsPath = String.raw`C:\Synthetic\HistoricalFixture.eprj2`;
  const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "a".repeat(16), expectedSourceSha256: digest };
  const request = currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId, target, footprintUuid: "b".repeat(16),
    confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  const checkpointPath = join(controlDataDirectory(), "checkpoints", `${suffix}.eprj2`);
  const checkpoint = { profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: {
    schema: "easyeda-pro-control.checkpoint.v2", sourceSha256: digest, checkpointSha256: digest, checkpoint: checkpointPath,
  }, preparationCheckpoint: { path: checkpointPath, bytes: 512, sha256: digest },
  targetEvidence: { branchUuid: "b".repeat(32), historySemanticSha256: digest } };
  const evidence: Record<string, unknown>[] = [
    { request }, { target }, { checkpoint, beforeSqlSha256: digest, originalSqlReaderCompleted: true },
    { purpose: "worker-startup-footprint-forward-execution209" }, { retained: true, purpose: "worker-startup-footprint-forward-execution209" },
    { executableSha256: digest }, { binding: { helperInstance: "synthetic", jobId: "synthetic", rootPid: 1, rootCreated: "1" }, acknowledged: true },
    {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
    { phase: "ui-source", originalErrorRetained: true, code: "ORIGINAL_STAGE_FAILED" }, { hwnd: "1" }, { requested: true },
    { ordinal: 1 }, { ordinal: 1, terminated: true }, {},
  ];
  const records: CurrentFootprintForwardExecutionOpeningRecord[] = [];
  const artifacts = [];
  for (const [index, kind] of KINDS.entries()) {
    const item = evidence[index]; assert.ok(item !== undefined);
    const record: CurrentFootprintForwardExecutionOpeningRecord = { schema: "easyeda-pro-control.footprint-forward-execution-opening-record.v2",
      operationId, sequence: index, previousSha256: index === 0 ? null : sha256Json(records[index - 1]), kind, evidence: item, executionAuthorized: false, saveAuthorized: false };
    records.push(record); artifacts.push(await writePhaseArtifact(operationId, index, kind, record));
  }
  const plan = { profile: CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_PROFILE, request,
    nonce: digest, budgetSha256: sha256Json(CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET) };
  const operation = { schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan), records, artifacts, state: "prepared" };
  await createOperation(operation);
  const path = operationPath(operationId); const originalBytes = await readFile(path);
  const stored: unknown = JSON.parse(originalBytes.toString("utf8"));
  const roster = artifacts.map((artifact, index) => ({ sequence: index, kind: KINDS[index], name: basename(artifact.path), bytes: artifact.bytes,
    sha256: artifact.sha256, canonicalRecordSha256: sha256Json(records[index]) }));
  const profile = { ...PROFILE, manifestBytes: originalBytes.length, manifestSha256: sha256Text(originalBytes.toString("utf8")),
    canonicalManifestSha256: sha256Json(stored), rosterSha256: sha256Json(roster) };
  context.after(async () => {
    await rm(path, { force: true }); await rm(join(controlDataDirectory(), "operations", operationId), { recursive: true, force: true });
    await rm(join(controlDataDirectory(), "footprint-forward-source-relinquishments-v1", operationId), { recursive: true, force: true });
  });
  const names = ["current-footprint-forward-source-relinquishment-contract.ts", "current-footprint-forward-source-relinquishment-journal.ts",
    "current-footprint-forward-source-unknown-relinquishment.ts", "current-footprint-forward-execution-opening-journal.ts",
    "current-pcb-diagnostic-lifecycle-journal.ts", "closed-symbol-terminal-admission.ts", "engine.ts"];
  const state = { installation: 0, linux: 0, windows: 0, files: 0, otherLinux: false, windowsPresent: false, fileMismatch: false, loseResultAck: false,
    failIntentPublication: false, intentSnapshots: [] as object[], intentValues: [] as unknown[],
    globalChecks: 0, revalidations: 0, changeFileAfterGlobal: false,
    hold: false, entered: Promise.withResolvers<null>(), release: Promise.withResolvers<null>() };
  const outputs = new Map<string, string>(); const cache = new Map<string, { exports: Record<string, unknown> }>();
  for (const name of names) {
    let source = await readFile(new URL(`../../src/${name}`, import.meta.url), "utf8");
    if (name === "current-footprint-forward-source-relinquishment-contract.ts") {
      // Production has no dependency/configuration accepting a profile. Only
      // This VM replaces the fixed public hash constants for synthetic files.
      const start = source.indexOf("export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE =");
      const end = source.indexOf("export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_KINDS", start);
      assert.ok(start !== -1 && end > start);
      source = `${source.slice(0, start)}export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE = Object.freeze(${JSON.stringify(profile)});\n${source.slice(end)}`;
    }
    const transformed = await transform(source, { loader: "ts", format: "cjs", target: "node24", supported: { "dynamic-import": false } });
    outputs.set(`./${name}`, transformed.code);
  }
  const sourceRequire = createRequire(new URL("../../src/engine.ts", import.meta.url));
  const sourceArtifactsRaw: unknown = sourceRequire("./artifacts.ts"); assert.ok(isRecord(sourceArtifactsRaw));
  const sourceArtifacts = { ...sourceArtifactsRaw,
    publishManagedAttachmentExclusive: (...args: Parameters<typeof publishManagedAttachmentExclusive>): ReturnType<typeof publishManagedAttachmentExclusive> => {
      const [attachmentPath, label, bytes, kind, beforePathRevalidation] = args;
      if (state.failIntentPublication && attachmentPath === join(controlDataDirectory(), "footprint-forward-source-relinquishments-v1", operationId, "intent.json")) {
        state.failIntentPublication = false;
        // Fail inside the actual publisher after it creates the file and parent.
        // Its real cleanup removes the failed file and leaves the empty slot.
        return publishManagedAttachmentExclusive(attachmentPath, label, bytes, kind, async () => {
          await beforePathRevalidation?.(); throw new Error("Synthetic failed first intent publication");
        });
      }
      return publishManagedAttachmentExclusive(...args);
    },
  };
  function requireSource(specifier: string): unknown {
    if (outputs.has(specifier)) { return load(specifier); }
    if (specifier === "./artifacts.ts") { return sourceArtifacts; }
    return sourceRequire(specifier) as unknown;
  }
  function load(name: string): Record<string, unknown> {
    const cached = cache.get(name); if (cached !== undefined) { return cached.exports; }
    const output = outputs.get(name); assert.ok(output !== undefined);
    const loaded = { exports: {} }; cache.set(name, loaded);
    const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output}\n})`); assert.ok(typeof evaluate === "function");
    Reflect.apply(evaluate, undefined, [requireSource, loaded, loaded.exports]);
    return loaded.exports;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual VM modules retain their private maps; only the synthetic fixed hash profile is replaced above.
  const historical = load("./current-footprint-forward-source-relinquishment-journal.ts") as unknown as HistoricalApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Same actual private module graph, not fabricated owner registry entries.
  const coordinator = load("./current-footprint-forward-source-unknown-relinquishment.ts") as unknown as CoordinatorApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The strict schema module is executed in the same labelled synthetic profile graph.
  const contract = load("./current-footprint-forward-source-relinquishment-contract.ts") as unknown as ContractApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual maintained Source chain and normal/isolation guards.
  const source = load("./current-footprint-forward-execution-opening-journal.ts") as unknown as SourceApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual generic scanner calls the original VM historical inspector.
  const admission = load("./closed-symbol-terminal-admission.ts") as unknown as AdmissionApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual engine method, constructor and original managed data readers.
  const engineApi = load("./engine.ts") as unknown as EngineApi;
  const engine = new engineApi.EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live call is allowed.")) });
  await engine.controlFingerprintPromise;
  const options: CurrentFootprintForwardSourceUnknownRelinquishmentOptions = { pluginRoot: "/synthetic/plugin", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "Synthetic", powershellBytes: 1, powershellSha256: digest,
    assertLocalAllowed: (): void => {
      // The fixture has no production facade.
    },
    assertFreshNoOwnedAllocations: (): void => {
      // No fixture creates an application owner.
    },
    assertOtherLaunchesSettled: async (snapshot): Promise<void> => {
      state.globalChecks += 1;
      if (state.hold) { state.entered.resolve(null); await state.release.promise; }
      await engine.assertForwardSourceRelinquishmentOtherOperationsSettled(snapshot);
      if (state.changeFileAfterGlobal) { state.fileMismatch = true; }
    } };
  const fileProof = currentFootprintForwardOpeningFileProofSchema.parse({ profile: "private.current-footprint-forward-opening-file-proof.v1",
    projectUuid: target.projectUuid, branchUuid: "b".repeat(32), documentUuid: target.documentUuid, oldCheckpointSha256: digest, freshCheckpointSha256: digest,
    oldCheckpointReceiptSha256: sha256Json(checkpoint.checkpoint), freshCheckpointReceiptSha256: digest, beforeSqlSha256: digest, freshSqlSha256: digest,
    rawSourceSha256: digest, oldHistorySemanticSha256: digest, freshHistorySemanticSha256: digest,
    fullSqlEqual: true, historyEqual: true, sidecarsAbsent: true, executionAuthorized: false, writerAuthority: false, restored: false });
  let fileCurrent: (() => Promise<void>) | null = null;
  const deps: CurrentFootprintForwardSourceUnknownRelinquishmentDependencies = {
    verifyInstallation: (): Promise<ReturnType<typeof createCurrentPcb209DiagnosticInstallationPlan> & { facadeSha256: string }> => {
      state.installation += 1; return Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: digest });
    },
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(state.otherLinux); },
    observeWindows: (): Promise<{ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1"; samples: 2; otherPowerShellPresent: boolean; sameNameProcessPresent: boolean; helperSha256: typeof ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 }> => {
      state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", samples: 2,
        otherPowerShellPresent: state.windowsPresent, sameNameProcessPresent: state.windowsPresent, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 });
    },
    collectFileProof: async (_input, current) => { state.files += 1; fileCurrent = current; await current(); assert.equal(state.fileMismatch, false, "Synthetic complete-file proof refusal"); return fileProof; },
    revalidateFileProof: async proof => {
      assert.equal(proof, fileProof); assert.ok(fileCurrent !== null);
      state.revalidations += 1; await fileCurrent();
      assert.equal(state.fileMismatch, false, "Synthetic completed-file revalidation refusal");
    },
    publishRecord: async (snapshot, name, value): Promise<void> => {
      if (name === "intent.json") { state.intentSnapshots.push(snapshot); state.intentValues.push(value); }
      await historical.publishCurrentFootprintForwardSourceRelinquishment(snapshot, name, value);
      if (name === "relinquished.json" && state.loseResultAck) { state.loseResultAck = false; throw new Error("Synthetic lost sidecar ACK"); }
    },
  };
  const restart = (): CurrentFootprintForwardSourceUnknownRelinquishment => new coordinator.CurrentFootprintForwardSourceUnknownRelinquishment(options, deps);
  return { operationId, path, originalBytes, historical, contract, source, admission, engine, state, restart, owner: restart(),
    request: contract.currentFootprintForwardSourceRelinquishmentRequestSchema.parse({ action: "relinquish-unknown-source-opening", operationId,
      expectedManifestSha256: profile.manifestSha256, expectedRosterSha256: profile.rosterSha256, expectedIntentSha256: sha256Json(records[0]),
      expectedBindingSha256: sha256Json(records[6]), confirmRelinquishUnknownSourceOpening: true, acceptUnknownCaptureOutcome: true }) };
}
