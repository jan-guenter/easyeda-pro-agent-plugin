/** Real isolated managed-file publications only. These journal constructors
 * allocate no native owner, app, bridge, helper or design operation. */
/* oxlint-disable import/max-dependencies -- Exercise each active original publisher directly against the same real filesystem faults. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { promises as fsPromises } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, readFile, readlink, realpath, rmdir, unlink } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadOperation, operationPath } from "../src/artifacts.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "../src/current-footprint-forward-execution-opening-journal.ts";
import { CurrentFootprintForwardWriterOpeningJournal } from "../src/current-footprint-forward-writer-opening-journal.ts";
import { CurrentFootprintForwardWriterPublicationJournal } from "../src/current-footprint-forward-writer-publication-journal.ts";
import { CurrentFootprintForwardWriterStartupFrontierJournal } from "../src/current-footprint-forward-writer-startup-frontier-journal.ts";
import { CurrentFootprintForwardWriterTicketTimerJournal } from "../src/current-footprint-forward-writer-ticket-timer-journal.ts";
import { CurrentFootprintForwardWriterCreateIntentJournal } from "../src/current-footprint-forward-writer-create-intent-journal.ts";
import { CurrentFootprintForwardWriterWorkflowV2Journal } from "../src/current-footprint-forward-writer-workflow-v2-journal.ts";
import { CurrentFootprintInverseFullWorkflowJournal } from "../src/current-footprint-inverse-full-workflow-journal.ts";

interface Row {
  readonly operationId: string;
  readonly sequence: number;
  readonly previousSha256: string | null;
  readonly kind: string;
  readonly evidence: Readonly<Record<string, unknown>>;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
interface Publisher {
  readonly reserve: () => Promise<void>;
  readonly settle: () => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly reservationOutcome: () => "not-entered" | "conflict" | "create-unknown" | "reserved";
  readonly retained: () => Readonly<{ records: readonly Row[]; publicationPending: boolean; reserved: boolean }>;
}
interface PublisherFixture {
  readonly journal: Publisher;
  readonly evidence: Readonly<Record<string, unknown>>;
}
interface PublisherDescriptor {
  readonly name: string;
  readonly prefix: string;
  readonly firstKind: "operation-intent" | "create-intent";
  readonly create: (operationId: string, suffix: string) => PublisherFixture;
}
const digest = "a".repeat(64);
const rawWindowsPath = String.raw`C:\isolated\journal-durability.eprj2`;
const target = {
  rawWindowsPath,
  projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
  documentUuid: "b".repeat(16),
  expectedSourceSha256: digest,
};
const openingConsent = {
  target, footprintUuid: "c".repeat(16), confirmDisposableProject: true,
  acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true,
} as const;
const publishers: readonly PublisherDescriptor[] = [
  {
    name: "forward execution opening", prefix: "footprint-forward-execution-", firstKind: "operation-intent",
    create(operationId) {
      const request = { operationId, ...openingConsent };
      return { journal: new CurrentFootprintForwardExecutionOpeningJournal(request), evidence: { request } };
    },
  },
  {
    name: "forward writer opening", prefix: "footprint-forward-writer-", firstKind: "operation-intent",
    create(operationId) {
      const request = { operationId, ...openingConsent };
      return { journal: new CurrentFootprintForwardWriterOpeningJournal(request), evidence: { request } };
    },
  },
  {
    name: "forward publication", prefix: "footprint-forward-publication-", firstKind: "operation-intent",
    create(operationId, suffix) {
      const request = { operationId, parentOperationId: `footprint-forward-writer-${suffix}`, acceptOriginalMutationPublication: true } as const;
      return { journal: new CurrentFootprintForwardWriterPublicationJournal(request), evidence: { request } };
    },
  },
  {
    name: "forward startup frontier", prefix: "footprint-forward-frontier-", firstKind: "operation-intent",
    create(operationId, suffix) {
      const request = { operationId, parentOperationId: `footprint-forward-writer-${suffix}`, acceptOriginalProjectTimerCancellation: true } as const;
      return { journal: new CurrentFootprintForwardWriterStartupFrontierJournal(request), evidence: { request } };
    },
  },
  {
    name: "forward ticket timer", prefix: "footprint-forward-ticket-timer-", firstKind: "operation-intent",
    create(operationId, suffix) {
      const request = { operationId, parentOperationId: `footprint-forward-writer-${suffix}`, acceptOriginalNaturalTicketTimer: true } as const;
      return { journal: new CurrentFootprintForwardWriterTicketTimerJournal(request), evidence: { request } };
    },
  },
  {
    name: "forward create intent", prefix: "footprint-create-intent-", firstKind: "create-intent",
    create(operationId, suffix) {
      const plan = {
        operationId, sourceOperationId: `footprint-forward-writer-${suffix}`,
        sourceInputSha256: digest, nativeBindingSha256: digest, beforeSqlSha256: digest,
        copyPlanSha256: digest, mainReservationSha256: digest,
        nativeAgeRequired: false, headObservationSha256: null, clockWindow: { minimum: 1, maximum: 2 },
        confirmDisposableCopy: true, acceptUnsupportedInverse: true, destinationAllocated: false,
      } as const;
      return { journal: new CurrentFootprintForwardWriterCreateIntentJournal(plan), evidence: { plan } };
    },
  },
  {
    name: "forward workflow v2", prefix: "footprint-forward-flow-", firstKind: "operation-intent",
    create(operationId, suffix) {
      const request = {
        operationId, parentOperationId: `footprint-forward-writer-${suffix}`,
        confirmDisposableCopy: true, acceptUnsupportedInverse: true,
      } as const;
      return { journal: new CurrentFootprintForwardWriterWorkflowV2Journal(request), evidence: { request } };
    },
  },
  {
    name: "inverse full workflow", prefix: "footprint-inverse-flow-", firstKind: "operation-intent",
    create(operationId, suffix) {
      const request = {
        operationId, sourceOperationId: `footprint-forward-flow-${suffix}`,
        confirmDisposableCopiedFootprintDelete: true, confirmDeleteTriggeredPersistence: true, confirmNoExplicitSave: true,
        acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true,
        acceptCacheInvalidationEffects: true, acceptManagerOnlyColdAbsence: true, acceptUnsupportedNativeUiTaskAbsence: true,
      } as const;
      return { journal: new CurrentFootprintInverseFullWorkflowJournal(request), evidence: { request } };
    },
  },
];
type Fault = "create-unknown" | "manifest-rename" | "phase-link";
interface SyncObservation { readonly path: string; readonly dev: number; readonly ino: number }
interface FaultState {
  blocked: boolean;
  creating: boolean;
  manifestLinked: boolean;
  manifestRenamed: boolean;
  phaseLinked: boolean;
  manifestLinks: number;
  phaseLinks: number;
  renames: number;
  failedUnlinks: number;
  readonly injected: Error;
  readonly syncs: SyncObservation[];
}
function installFault(context: TestContext, manifest: string, phase: string, fault: Fault): FaultState {
  const originalOpen = fsPromises.open, originalRename = fsPromises.rename;
  const originalLink = fsPromises.link, originalUnlink = fsPromises.unlink;
  const state: FaultState = {
    blocked: true, creating: true, manifestLinked: false, manifestRenamed: false, phaseLinked: false,
    manifestLinks: 0, phaseLinks: 0, renames: 0, failedUnlinks: 0,
    injected: new Error("injected original publication parent sync"), syncs: [],
  };
  context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof originalRename>) => {
    await originalRename(...args);
    if (await realpath(args[1]) === manifest) { state.manifestRenamed = true; state.renames += 1; }
  });
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof originalLink>) => {
    await originalLink(...args);
    const published = await realpath(args[1]);
    if (published === manifest) { state.manifestLinked = true; state.manifestLinks += 1; }
    if (published === phase) { state.phaseLinked = true; state.phaseLinks += 1; }
  });
  context.mock.method(fsPromises, "unlink", async (...args: Parameters<typeof originalUnlink>) => {
    const selected = fault === "create-unknown" ? manifest : phase;
    const published = fault === "create-unknown" ? state.manifestLinked : state.phaseLinked;
    if (fault !== "manifest-rename" && state.blocked && published && basename(String(args[0])) === basename(selected)) {
      assert.equal(await realpath(args[0]), selected);
      state.failedUnlinks += 1;
      throw new Error("injected original final-link cleanup");
    }
    await originalUnlink(...args);
  });
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    const handle = await originalOpen(...args);
    const path = await readlink(`/proc/self/fd/${String(handle.fd)}`);
    const identity = await handle.stat(), sync = handle.sync.bind(handle);
    context.mock.method(handle, "sync", async () => {
      // Allow creating the unrelated phase directory during recovery.
      // Keep the original manifest link and rename syncs faulted.
      const manifestPublication = state.manifestLinked && (state.creating || state.manifestRenamed);
      const selectedParent = fault === "phase-link"
        ? state.phaseLinked && path === dirname(phase)
        : (fault === "create-unknown" ? manifestPublication : state.manifestRenamed) && path === dirname(manifest);
      if (state.blocked && selectedParent) { throw state.injected; }
      await sync();
      state.syncs.push({ path, dev: identity.dev, ino: identity.ino });
    });
    return handle;
  });
  syncBuiltinESMExports();
  return state;
}
async function assertOriginalSyncs(state: FaultState, path: string): Promise<void> {
  for (const selected of [path, dirname(path)]) {
    const identity = await lstat(selected);
    assert.ok(state.syncs.some(item => item.path === selected && item.dev === identity.dev && item.ino === identity.ino),
      `original file and parent descriptors must both sync before settlement: ${selected}`);
  }
}
async function assertUnchanged(path: string, identity: Stats, bytes: Buffer): Promise<void> {
  const current = await lstat(path);
  assert.equal(current.dev, identity.dev);
  assert.equal(current.ino, identity.ino);
  assert.deepEqual(await readFile(path), bytes);
}
async function assertPending(journal: Publisher): Promise<void> {
  assert.equal(journal.retained().publicationPending, true);
  assert.equal(journal.retained().records.length, 0);
  await assert.rejects(journal.assertCurrent(), /PENDING/u);
}
/** Remove only this successful fixture's exact known files after mocks restore.
 * A failed assertion leaves its isolated publication evidence available. */
async function removeSuccessfulFixture(operationId: string, phase: string, journal: Publisher): Promise<void> {
  await journal.assertCurrent();
  assert.equal(journal.retained().publicationPending, false);
  const operation = await loadOperation(operationId);
  assert.deepEqual(operation.artifacts?.map(item => item.path), [phase]);
  await unlink(phase);
  await unlink(operationPath(operationId));
  await rmdir(dirname(phase));
}

for (const publisher of publishers) {
  for (const fault of ["create-unknown", "manifest-rename", "phase-link"] as const) {
    void test(`${publisher.name} settles only durable original bytes after ${fault}`, async context => {
      const suffix = `durability-${randomUUID()}`;
      const operationId = publisher.prefix + suffix;
      const { journal, evidence } = publisher.create(operationId, suffix);
      const manifest = operationPath(operationId);
      const phase = join(dirname(manifest), operationId, `00-${publisher.firstKind}.json`);
      const state = installFault(context, manifest, phase, fault);
      try {
        if (fault === "create-unknown") {
          await assert.rejects(journal.reserve(), AggregateError);
          assert.equal(journal.reservationOutcome(), "create-unknown");
          assert.equal(journal.retained().reserved, false);
          const reservation = await loadOperation(operationId);
          assert.deepEqual(reservation["records"], []);
          await assert.rejects(journal.assertCurrent(), /PENDING/u);
          state.creating = false;
          await assert.rejects(journal.settle(), (cause: unknown) => cause === state.injected);
          assert.equal(state.manifestRenamed, true);
        } else {
          await assert.rejects(journal.reserve(), fault === "phase-link" ? AggregateError : (cause: unknown): boolean => cause === state.injected);
        }
        assert.equal(journal.reservationOutcome(), "reserved");
        assert.equal(state.manifestLinks, 1);
        assert.equal(state.phaseLinks, 1);
        assert.equal(state.failedUnlinks, fault === "manifest-rename" ? 0 : 1);
        await assertPending(journal);
        await assert.rejects(journal.reserve(), /RESERVATION_CONSUMED/u);
        const originalPhase = await readFile(phase), phaseIdentity = await lstat(phase);
        const originalManifest = await readFile(manifest);
        const manifestIdentity = await lstat(manifest);
        const originalRenames = state.renames;
        const pendingManifest = await loadOperation(operationId);
        assert.deepEqual(pendingManifest["records"],
          fault === "phase-link" ? [] : [JSON.parse(originalPhase.toString("utf8")) as unknown]);
        for (let attempt = 0; attempt < 2; attempt += 1) {
          await assert.rejects(journal.settle(), (cause: unknown) => cause === state.injected);
          await assertPending(journal);
          await assertUnchanged(phase, phaseIdentity, originalPhase);
          await assertUnchanged(manifest, manifestIdentity, originalManifest);
          assert.equal(state.renames, originalRenames);
          assert.equal(state.phaseLinks, 1);
        }
        state.syncs.length = 0;
        state.blocked = false;
        await journal.settle();
        assert.equal(journal.retained().publicationPending, false);
        assert.equal(journal.retained().reserved, true);
        await assertOriginalSyncs(state, phase);
        await assertOriginalSyncs(state, manifest);
        await assertUnchanged(phase, phaseIdentity, originalPhase);
        if (fault !== "phase-link") { await assertUnchanged(manifest, manifestIdentity, originalManifest); }
        const records = journal.retained().records;
        assert.equal(records.length, 1);
        assert.equal(records[0]?.operationId, operationId);
        assert.equal(records[0]?.kind, publisher.firstKind);
        assert.equal(records[0]?.sequence, 0);
        assert.equal(records[0]?.previousSha256, null);
        assert.equal(records[0]?.executionAuthorized, false);
        assert.equal(records[0]?.saveAuthorized, false);
        // Compare persisted data; captured requests can have null prototypes.
        assert.equal(JSON.stringify(records[0]?.evidence), JSON.stringify(evidence));
        assert.equal(originalPhase.toString("utf8"), `${JSON.stringify(records[0])}\n`);
        const operation = await loadOperation(operationId);
        assert.equal(JSON.stringify(operation["records"]), JSON.stringify(records));
        assert.equal(operation.artifacts?.length, 1);
        assert.equal(state.manifestLinks, 1);
        assert.equal(state.phaseLinks, 1);
        assert.equal(state.renames, 1);
        await journal.assertCurrent();
        await journal.settle();
        assert.deepEqual(journal.retained().records, records);
        assert.equal(state.renames, 1);
        assert.equal(state.phaseLinks, 1);
        context.diagnostic(JSON.stringify({
          publisher: publisher.name, fault, operationId,
          manifestLinks: state.manifestLinks, phaseLinks: state.phaseLinks, renames: state.renames, failedUnlinks: state.failedUnlinks,
          originalPhase: { dev: phaseIdentity.dev, ino: phaseIdentity.ino },
          observedRepairSyncs: state.syncs,
        }));
      } finally {
        context.mock.restoreAll();
        syncBuiltinESMExports();
      }
      await removeSuccessfulFixture(operationId, phase, journal);
    });
  }
}
