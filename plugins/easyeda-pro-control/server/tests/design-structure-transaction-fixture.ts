/* oxlint-disable import/max-dependencies -- Compose real sealed synthetic profiles and managed artifacts without a runtime or policy override. */
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { controlDataDirectory, createOperation, listOperationStates, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { DispatchOperationJournal, EasyedaControlEngine } from "../src/engine.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, prepareFlatDisplayProfile } from "../src/flat-display-profile.ts";
import { prepareFlatWireProfile } from "../src/flat-wire-profile.ts";
import { context as originalContext, rehash } from "./flat-display-fixture.ts";
import { nativeFormatFixture, nativeFormatOperation } from "./flat-display-native-fixture.ts";
import { storedFlatFixture } from "./flat-display-sqlite-fixture.ts";
import { flatWireFixture, wireOperation } from "./flat-wire-fixture.ts";
import { withInheritedObservationWitness } from "./flat-lifecycle-observation-fixture.ts";

export type HistoricalFlatProfile = "display" | "imported-display" | "wire";
export type HistoricalFlatAction = "commit" | "rollback" | "reconcile" | "saved-reconcile";
interface SealedProfile {
  readonly before: ReturnType<typeof nativeFormatFixture>;
  readonly context: typeof originalContext;
  readonly operation: unknown;
  readonly prepared: Awaited<ReturnType<typeof prepareFlatWireProfile>> | Awaited<ReturnType<typeof prepareFlatDisplayProfile>>;
}

export function noAuthorityExecutor(): { executor: DesignExecutor; accesses: PropertyKey[] } {
  const accesses: PropertyKey[] = [];
  // A throwing proxy proves even property access is absent. It supplies no
  // Successful runtime seam, writer, observation or policy bypass.
  const inert = new Proxy({}, { get: (_target, key): never => {
    accesses.push(key); throw new Error(`Unexpected engine access: ${String(key)}`);
  } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The test deliberately supplies no engine implementation to an entrypoint that must refuse first.
  const engine = inert as EasyedaControlEngine;
  return { executor: new DesignExecutor(engine), accesses };
}

export function invokeDesignInput(executor: DesignExecutor, method: "apply" | "preflightSaveNavigation", input: unknown): Promise<unknown> {
  // Reflection permits malformed confirmation data in this boundary test;
  // It does not reinterpret false as the public method's literal true type.
  const result: unknown = Reflect.apply(executor[method], executor, [input]);
  assert.ok(result instanceof Promise);
  return result;
}

async function sealedProfile(kind: HistoricalFlatProfile): Promise<SealedProfile> {
  const root = controlDataDirectory();
  assert.ok(basename(root).startsWith("easyeda-test-control-"), "Use the mandatory isolated test preload.");
  const directory = await mkdtemp(join(root, "blocked-design-profile-"));
  const fixture = withInheritedObservationWitness(kind === "wire" ? flatWireFixture() : nativeFormatFixture());
  if (kind === "imported-display") {
    const peer = fixture.evidence.history.documents.find((document) => document.uuid === "pcb"); assert.ok(peer);
    const uuid = "imported-symbol";
    fixture.evidence = { ...fixture.evidence, history: rehash({ ...fixture.evidence.history, documents: [
      ...fixture.evidence.history.documents, { ...structuredClone(peer), uuid, docType: "SYMBOL", metadata: { uuid, docType: "SYMBOL" }, records: [
        { id: "META", type: "META", body: { title: "Synthetic imported peer" }, ticket: 1, client: null },
        { id: "symbol-line", type: "LINE", body: { startX: 0, startY: 0, endX: 10, endY: 10 }, ticket: 2, client: null },
      ] },
    ] }) };
  }
  const before = await storedFlatFixture(fixture, directory, "before", kind === "imported-display" ? { libraryFirstTicket: 0 } : undefined);
  const context = { ...originalContext, project: { ...originalContext.project, path: before.evidence.checkpoint.checkpoint } };
  before.evidence.checkpoint.source = context.project.path;
  const operation = kind === "wire" ? wireOperation : nativeFormatOperation;
  const prepared = await (kind === "wire" ? prepareFlatWireProfile : prepareFlatDisplayProfile)({ ...before, context, operation });
  if (kind === "imported-display") { assert.equal(prepared.binding.profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE); }
  return { before, context, operation, prepared };
}

/** Pure preparation is still usable. It grants no current coordinator authority. */
export async function assertSealedApplyRefusal(kind: HistoricalFlatProfile, confirmWrite: boolean): Promise<void> {
  const { context, operation } = await sealedProfile(kind);
  const { executor, accesses } = noAuthorityExecutor();
  const inventory = await listOperationStates();
  const input = { operation, expectedContext: context, expectedFingerprint: {}, confirmWrite };
  await assert.rejects(invokeDesignInput(executor, "apply", input), { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL });
  await assert.rejects(invokeDesignInput(executor, "preflightSaveNavigation", input), { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL });
  assert.deepEqual(accesses, []);
  assert.deepEqual(await listOperationStates(), inventory);
}

/** These are new synthetic historical journals, never copied live evidence.
 * Retain complete baseline/native/profile data and a separately labelled raw
 * observation. Its contents do not claim the omitted SQL/job proof passed.
 */
export async function assertHistoricalFlatRefusal(kind: HistoricalFlatProfile, action: HistoricalFlatAction,
  drift: "none" | "meta" | "peer", terminal = false): Promise<void> {
  const { before, context, operation, prepared } = await sealedProfile(kind);
  const operationId = newOperationId();
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", expectedContext: context, expectedFingerprint: {},
    operation: prepared.operation, expectedTopology: prepared.binding.topology,
    ...(kind === "wire" ? { flatWire: prepared.binding } : { flatDisplay: prepared.binding }) };
  let state = "applied-unsaved";
  if (terminal) { state = "completed"; }
  else if (action === "saved-reconcile") { state = "commit-needs-recovery"; }
  else if (action === "reconcile") { state = "apply-needs-review"; }
  const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan), state,
    mutationState: "after", saved: terminal, reopened: terminal, orphanedCallPossible: false, hardStop: !terminal,
    mutationMayHaveOccurred: true, nextSafeAction: "Synthetic historical evidence, not current execution authority.", context,
    before: parseDocumentSource(before.native.source), beforeNative: before.native,
    after: prepared.expectedSource, afterNative: prepared.expectedNative, inverse: prepared.inverse,
    ...(kind === "wire" ? { targetId: "wire" } : { createdIds: {} }),
    beforeTopology: prepared.binding.topology, preCheckpoint: before.evidence.checkpoint, sequence: 0, artifacts: [], updatedAt: "2026-10-12T00:00:00Z" };
  await createOperation(journal);
  if (!terminal) {
    let observation = structuredClone(before.evidence);
    if (drift !== "none") {
      const row = observation.history.documents.find((document) => document.uuid === (drift === "meta" ? "page" : "pcb"))?.records.find((record) => record.id === "META");
      assert.ok(row); row.body["title"] = "Unrequested synthetic durable change";
      observation = { ...observation, history: rehash(observation.history) };
    }
    journal.sequence += 1;
    journal.artifacts.push(await writePhaseArtifact(operationId, journal.sequence, "historical-observation", {
      provenance: "new synthetic fixture; no connected lifecycle or full SQL completion claim", operation, observation,
    }));
    if (action === "saved-reconcile") {
      journal.sequence += 1;
      journal.artifacts.push(await writePhaseArtifact(operationId, journal.sequence, "save-reopen", { ok: true, saved: true, reopened: true }));
    }
    await updateOperation(journal);
  }
  const retained = await loadOperation(operationId);
  const files = [journal.journalPath, before.evidence.checkpoint.checkpoint, ...journal.artifacts.map((entry) => entry.path)];
  const bytes = await Promise.all(files.map((path) => readFile(path)));
  const names = await readdir(dirname(journal.journalPath));
  const { executor, accesses } = noAuthorityExecutor();
  const inspected = await DesignExecutor.inspect(operationId);
  assert.equal(inspected["operationId"], operationId);
  assert.deepEqual(inspected["artifacts"], retained.artifacts);
  assert.equal(inspected["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
  assert.equal(inspected["retainedNextSafeAction"], journal.nextSafeAction);
  assert.match(String(inspected["nextSafeAction"]), /^Inspect retained evidence only\./u);
  assert.deepEqual(inspected["inverse"], { available: false, reason: "native-project-structure-lifecycle-unavailable" });
  if (terminal) {
    const result = await executor.reconcile(operationId);
    assert.equal(result["state"], "completed"); assert.deepEqual(result["artifacts"], []);
    assert.equal(result["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
    assert.equal(result["retainedNextSafeAction"], journal.nextSafeAction);
  } else {
    const method = action === "saved-reconcile" ? "reconcile" : action;
    await assert.rejects(executor[method](operationId), { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL });
  }
  assert.deepEqual(accesses, []);
  assert.deepEqual(await loadOperation(operationId), retained);
  assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
  assert.deepEqual(await Promise.all(files.map((path) => readFile(path))), bytes);
}
