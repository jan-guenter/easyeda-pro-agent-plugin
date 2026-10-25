import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import fileSystem, { link, lstat, mkdtemp, readFile, readlink, rename, rm, utimes, writeFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { after, afterEach, before, test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import type { ArtifactDescriptor, controlRootCapability, createOperation, createOperationScanner, loadOperation, writePhaseArtifact } from "../src/artifacts.ts";

let previousRoot: string | undefined, root = "", sequence = 0;
let artifacts: { controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation;
  createOperationScanner: typeof createOperationScanner; loadOperation: typeof loadOperation; writePhaseArtifact: typeof writePhaseArtifact };
before(async () => {
  root = await mkdtemp(join(tmpdir(), "easyeda-artifact-hash-concurrency-"));
  previousRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  configureTestControlRoot(root);
  artifacts = await import("../src/artifacts.ts");
});
afterEach(async () => { await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (previousRoot === undefined) { configureTestControlRoot(); }
  else { configureTestControlRoot(previousRoot); }
  await rm(root, { recursive: true, force: true });
});

async function fixture(large = false): Promise<{ id: string; descriptors: ArtifactDescriptor[] }> {
  sequence += 1;
  const descriptors: ArtifactDescriptor[] = [], id = `easyeda-hash-concurrency-${String(sequence)}`;
  for (let index = 1; index <= 6; index += 1) {
    descriptors.push(await artifacts.writePhaseArtifact(id, index, "before", { data: "a".repeat(large ? 1024 * 1024 + 32 : 32) }));
  }
  const plan = { name: "Synthetic artifact hashing fixture" };
  await artifacts.createOperation({ schema: OPERATION_SCHEMA, operationId: id, state: "completed", plan,
    planHash: buildPlanHash(plan), artifacts: descriptors });
  return { id, descriptors };
}

async function waitForGate(gate: Promise<unknown>): Promise<void> {
  const timeout = Promise.withResolvers<never>();
  const timer = setTimeout(() => { timeout.reject(new Error("The bounded hashing fixture did not reach its gate.")); }, 5000);
  try { await Promise.race([gate, timeout.promise]); }
  finally { clearTimeout(timer); }
}

async function drainFixture(pending: Promise<unknown>): Promise<void> {
  try { await pending; }
  catch {
    // The test owns the result assertion; cleanup only drains the pending work.
  }
}

function interceptPhaseReads(context: TestContext, beforeRead: (index: number) => Promise<void>): {
  opened: number[]; closed: number[]; buffers: number[]; restore: () => void;
} {
  const buffers: number[] = [], closed: number[] = [], opened: number[] = [];
  const originalOpen = fileSystem.open;
  const intercepted = context.mock.method(fileSystem, "open", async (...arguments_: Parameters<typeof originalOpen>): Promise<FileHandle> => {
    const handle = await originalOpen(...arguments_);
    const match = /\/(0[1-6])-before\.json$/u.exec(String(arguments_[0]));
    if (match?.[1] === undefined) { return handle; }
    const index = Number(match[1]);
    opened.push(index);
    const originalClose = handle.close.bind(handle), originalRead = handle.read.bind(handle);
    context.mock.method(handle, "read", async (...args: unknown[]): Promise<unknown> => {
      assert.ok(Buffer.isBuffer(args[0])); buffers.push(args[0].length);
      await beforeRead(index);
      const result: unknown = await Reflect.apply(originalRead, undefined, args);
      return result;
    });
    context.mock.method(handle, "close", async (): Promise<void> => {
      await originalClose(); closed.push(index);
    });
    return handle;
  });
  syncBuiltinESMExports();
  return { opened, closed, buffers, restore: (): void => { intercepted.mock.restore(); syncBuiltinESMExports(); } };
}

function interceptManagedReads(context: TestContext, beforeRead: (path: string) => Promise<void>, beforeClose?: (path: string) => Promise<void>): {
  opened: string[]; closed: string[]; buffers: number[]; active: number; peak: number; restore: () => void;
} {
  const state = { opened: [] as string[], closed: [] as string[], buffers: [] as number[], active: 0, peak: 0 };
  const originalOpen = fileSystem.open;
  const intercepted = context.mock.method(fileSystem, "open", async (...arguments_: Parameters<typeof originalOpen>): Promise<FileHandle> => {
    const handle = await originalOpen(...arguments_);
    const path = await readlink(`/proc/self/fd/${String(handle.fd)}`);
    if (!path.startsWith(`${root}/operations/`) || !path.endsWith(".json")) { return handle; }
    state.opened.push(path); state.active += 1; state.peak = Math.max(state.peak, state.active);
    const originalClose = handle.close.bind(handle), originalRead = handle.read.bind(handle);
    context.mock.method(handle, "read", async (...args: unknown[]): Promise<unknown> => {
      assert.ok(Buffer.isBuffer(args[0])); state.buffers.push(args[0].length);
      await beforeRead(path);
      const result: unknown = await Reflect.apply(originalRead, undefined, args);
      return result;
    });
    context.mock.method(handle, "close", async (): Promise<void> => {
      await beforeClose?.(path);
      await originalClose(); state.closed.push(path); state.active -= 1;
    });
    return handle;
  });
  syncBuiltinESMExports();
  return Object.assign(state, { restore: (): void => { intercepted.mock.restore(); syncBuiltinESMExports(); } });
}

void test("warm scans overlap four journals while journal and phase readers share the same four-stream budget", async (context) => {
  const ids: string[] = [];
  for (let index = 0; index < 6; index += 1) { const value = await fixture(); ids.push(value.id); }
  ids.sort();
  const scan = artifacts.createOperationScanner((value) => value["operationId"]);
  assert.deepEqual(await scan(), ids);
  const journalsEntered = Promise.withResolvers<true>(), releaseJournals = Promise.withResolvers<true>();
  const phasesEntered = Promise.withResolvers<true>(), releasePhases = Promise.withResolvers<true>();
  const journals = new Set<string>(), phases = new Set<string>();
  const inspection = interceptManagedReads(context, async (path) => {
    if (/\/easyeda-hash-concurrency-[0-9]+\.json$/u.test(path)) {
      journals.add(path); if (journals.size === 4) { journalsEntered.resolve(true); }
      await releaseJournals.promise;
    } else {
      phases.add(path); if (phases.size === 4) { phasesEntered.resolve(true); }
      await releasePhases.promise;
    }
  });
  const pending = scan();
  try {
    await waitForGate(journalsEntered.promise); await nextTurn();
    assert.deepEqual([...journals].toSorted(), ids.slice(0, 4).map((id) => join(root, "operations", `${id}.json`)));
    assert.equal(inspection.active, 4); assert.equal(inspection.peak, 4);
    releaseJournals.resolve(true); await waitForGate(phasesEntered.promise); await nextTurn();
    assert.equal(inspection.active, 4); assert.equal(inspection.peak, 4);
    assert.equal(journals.size, 4, "later journals wait while all four verifiers are blocked on phases");
    releasePhases.resolve(true); assert.deepEqual(await pending, ids);
    assert.equal(journals.size, 6); assert.equal(phases.size, 36);
    assert.equal(inspection.active, 0); assert.equal(inspection.peak, 4);
    assert.deepEqual(inspection.closed.toSorted(), inspection.opened.toSorted());
    assert.ok(inspection.buffers.every((bytes) => bytes > 0 && bytes <= 1024 * 1024));
  } finally {
    releaseJournals.resolve(true); releasePhases.resolve(true); await drainFixture(pending); inspection.restore();
  }
});

void test("warm scan failures drain sibling cleanup before sorted projector failure and leave queued slots reusable", async (context) => {
  const ids: string[] = [];
  for (let index = 0; index < 5; index += 1) { const value = await fixture(); ids.push(value.id); }
  ids.sort();
  const failure = new Error("first sorted unreadable projection"), projected: unknown[] = [];
  let failUnreadable = false;
  const scan = artifacts.createOperationScanner((value) => {
    projected.push(value["operationId"]);
    if (failUnreadable && value["state"] === "journal-unreadable") { throw failure; }
    return value["operationId"];
  });
  assert.deepEqual(await scan(), ids); projected.length = 0; failUnreadable = true;
  const firstPath = join(root, "operations", `${String(ids[0])}.json`), heldPath = join(root, "operations", `${String(ids[1])}.json`);
  const entered = Promise.withResolvers<true>(), release = Promise.withResolvers<true>();
  const inspection = interceptManagedReads(context, (path) => path === firstPath ? Promise.reject(new Error("synthetic first journal read failure")) : Promise.resolve(),
    async (path) => { if (path === heldPath) { entered.resolve(true); await release.promise; } });
  let settled = false;
  const pending = (async (): Promise<unknown> => { try { return await scan(); } finally { settled = true; } })();
  const rejected = assert.rejects(pending, { message: failure.message });
  try {
    await waitForGate(entered.promise); await nextTurn();
    assert.equal(settled, false); assert.deepEqual(projected, []);
    release.resolve(true); await rejected;
    assert.deepEqual(projected, [ids[0]]);
    assert.equal(inspection.active, 0); assert.ok(inspection.peak <= 4);
    assert.deepEqual(inspection.closed.toSorted(), inspection.opened.toSorted());
    const laterJournalPath = join(root, "operations", `${String(ids[4])}.json`);
    assert.equal(inspection.opened.includes(laterJournalPath), true, "rolling verification settles every warm candidate before sorted projection");
  } finally { release.resolve(true); await rejected; inspection.restore(); }
  failUnreadable = false;
  await waitForGate(scan());
  assert.deepEqual(await scan(), ids);
});

void test("hashing overlaps four phase readers with bounded buffers and closes every descriptor", async (context) => {
  const { id } = await fixture(true);
  const entered = Promise.withResolvers<true>(), release = Promise.withResolvers<true>();
  const readers = new Set<number>();
  const inspection = interceptPhaseReads(context, async (index) => {
    readers.add(index);
    if (readers.size === 4) { entered.resolve(true); }
    await release.promise;
  });
  const pending = artifacts.loadOperation(id);
  try {
    await waitForGate(entered.promise);
    assert.deepEqual(inspection.opened.toSorted((left, right) => left - right), [1, 2, 3, 4]);
    assert.deepEqual(inspection.closed, []);
    release.resolve(true);
    await pending;
    assert.deepEqual(inspection.opened.toSorted((left, right) => left - right), [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(inspection.closed.toSorted((left, right) => left - right), [1, 2, 3, 4, 5, 6]);
    assert.ok(inspection.buffers.length >= 12);
    assert.ok(inspection.buffers.every((bytes) => bytes > 0 && bytes <= 1024 * 1024));
  } finally {
    release.resolve(true); await drainFixture(pending); inspection.restore();
  }
});

void test("hash failures drain the complete batch and select the first descriptor-order error", async (context) => {
  const { id } = await fixture();
  const entered = Promise.withResolvers<true>(), first = Promise.withResolvers<true>(), third = Promise.withResolvers<true>();
  const readers = new Set<number>();
  const inspection = interceptPhaseReads(context, async (index) => {
    readers.add(index); if (readers.size === 4) { entered.resolve(true); }
    if (index === 1) { await first.promise; throw new Error("first descriptor failure"); }
    if (index === 2) { throw new Error("second descriptor failure"); }
    if (index === 3) { await third.promise; }
  });
  let settled = false;
  const pending = (async (): Promise<unknown> => {
    try { return await artifacts.loadOperation(id); }
    finally { settled = true; }
  })();
  const rejected = assert.rejects(pending, /first descriptor failure/u);
  try {
    await waitForGate(entered.promise);
    await nextTurn();
    assert.equal(settled, false);
    first.resolve(true); await nextTurn();
    assert.equal(settled, false, "failure must wait for the still-running third descriptor");
    third.resolve(true); await rejected;
    assert.deepEqual(inspection.opened.toSorted((left, right) => left - right), [1, 2, 3, 4]);
    assert.deepEqual(inspection.closed.toSorted((left, right) => left - right), [1, 2, 3, 4]);
  } finally {
    first.resolve(true); third.resolve(true); await rejected; inspection.restore();
  }
});

void test("concurrent fresh-byte scans reject corruption, path replacement and new hardlinks during hashing", async (context) => {
  for (const mutation of ["bytes", "replacement", "hardlink"] as const) {
    const { id, descriptors } = await fixture();
    const scan = artifacts.createOperationScanner((value) => value["operationId"] === id ? value["state"] : undefined);
    assert.deepEqual(await scan(), ["completed"]);
    const target = descriptors[2]; assert.ok(target !== undefined);
    const bytes = await readFile(target.path), info = await lstat(target.path);
    const entered = Promise.withResolvers<true>(), release = Promise.withResolvers<true>();
    const inspection = interceptPhaseReads(context, async (index) => {
      if (index === 3) { entered.resolve(true); await release.promise; }
    });
    const pending = scan();
    try {
      await waitForGate(entered.promise);
      if (mutation === "bytes") {
        const changed = Buffer.from(bytes); changed[10] = 98;
        assert.notDeepEqual(changed, bytes);
        await writeFile(target.path, changed); await utimes(target.path, info.atime, info.mtime);
      } else if (mutation === "replacement") {
        await rename(target.path, `${target.path}.retired`);
        await writeFile(target.path, bytes);
        await utimes(target.path, info.atime, info.mtime);
      } else { await link(target.path, `${target.path}.alias`); }
      release.resolve(true);
      assert.deepEqual(await pending, ["journal-unreadable"]);
      assert.deepEqual(inspection.opened.toSorted((left, right) => left - right), [1, 2, 3, 4]);
      assert.deepEqual(inspection.closed.toSorted((left, right) => left - right), [1, 2, 3, 4]);
    } finally {
      release.resolve(true); await drainFixture(pending); inspection.restore();
    }
    await rm(join(root, "operations"), { recursive: true, force: true });
  }
});
