import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { after, before, beforeEach, test } from "node:test";
import { reset, state } from "./helpers/current-process-sql-runtime-lease-fixture.ts";
import type { CurrentProcessSqlRuntimeLease, assertCurrentProcessSqlRuntimeLease, withCurrentProcessSqlRuntimeLease } from "../src/current-process-sql-runtime-lease.ts";

let api: { assertCurrentProcessSqlRuntimeLease: typeof assertCurrentProcessSqlRuntimeLease; withCurrentProcessSqlRuntimeLease: typeof withCurrentProcessSqlRuntimeLease };
let unregister: () => void;
before(async () => {
  const owner = new URL("../src/current-process-sql-runtime-lease.ts", import.meta.url).href;
  const runtime = new URL("../src/machine-profile.ts", import.meta.url).href;
  const fake = new URL("helpers/current-process-sql-runtime-lease-fixture.ts", import.meta.url).href;
  const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return context.parentURL === owner && resolved.url === runtime ? { url: fake, shortCircuit: true } : resolved;
  } });
  unregister = (): void => { hooks.deregister(); };
  api = await import("../src/current-process-sql-runtime-lease.ts");
});
after((): void => { unregister(); });
beforeEach(reset);
function latch(): { promise: Promise<null>; release: () => void } {
  const { promise, resolve } = Promise.withResolvers<null>(); return { promise, release: (): void => { resolve(null); } };
}

void test("one original owner serves fresh assertions and closes before returning data", async () => {
  let retained: CurrentProcessSqlRuntimeLease | undefined;
  const result = await api.withCurrentProcessSqlRuntimeLease(async lease => {
    retained = lease;
    assert.deepEqual(Object.keys(lease), ["runtime"]); assert.equal(Object.isFrozen(lease), true);
    assert.equal(Object.isFrozen(lease.runtime), true); assert.equal(lease.runtime, state.nodes[0]?.node.runtime);
    await api.assertCurrentProcessSqlRuntimeLease(lease); await api.assertCurrentProcessSqlRuntimeLease(lease);
    assert.equal(state.nodes[0]?.closes, 0); return "checked";
  });
  assert.equal(result, "checked"); assert.equal(state.acquisitions, 1);
  assert.equal(state.nodes[0]?.assertions, 3); assert.equal(state.nodes[0]?.closes, 1);
  assert.ok(retained); await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(retained), /lease-not-current/u);
});
void test("copied, reconstructed and accessor tokens are not authority", async () => {
  await api.withCurrentProcessSqlRuntimeLease(async lease => {
    let getterCalls = 0;
    const forged = Object.defineProperty({ runtime: lease.runtime }, "runtime", { get() { getterCalls += 1; return lease.runtime; } });
    for (const copy of [{ ...lease }, structuredClone(lease), forged]) {
      await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(copy), /lease-not-current/u);
    }
    assert.equal(getterCalls, 0); assert.equal(state.nodes[0]?.assertions, 0);
    await api.assertCurrentProcessSqlRuntimeLease(lease);
  });
  assert.equal(state.acquisitions, 1); assert.equal(state.nodes[0]?.assertions, 2);
});
void test("nested scans cannot borrow each other's leases even with equal runtime data", async () => {
  await api.withCurrentProcessSqlRuntimeLease(async outer => {
    await api.withCurrentProcessSqlRuntimeLease(async inner => {
      assert.deepEqual(inner.runtime, outer.runtime); assert.notEqual(inner, outer);
      await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(outer), /lease-not-current/u);
      await api.assertCurrentProcessSqlRuntimeLease(inner);
    });
    await api.assertCurrentProcessSqlRuntimeLease(outer);
  });
  assert.equal(state.acquisitions, 2); assert.deepEqual(state.nodes.map(node => [node.assertions, node.closes]), [[2, 1], [2, 1]]);
});
void test("an asynchronous descendant cannot use its inherited lease after scan completion", async () => {
  const gate = latch();
  let late: Promise<void> | undefined;
  await api.withCurrentProcessSqlRuntimeLease(lease => {
    late = (async (): Promise<void> => { await gate.promise; await api.assertCurrentProcessSqlRuntimeLease(lease); })();
    return Promise.resolve();
  });
  assert.ok(late); const refused = assert.rejects(late, /lease-not-current/u); gate.release(); await refused;
  assert.equal(state.nodes[0]?.assertions, 1); assert.equal(state.nodes[0]?.closes, 1);
});
void test("observed runtime drift poisons the scan even if its callback catches the failure", async () => {
  const drift = new Error("synthetic executable drift");
  await assert.rejects(api.withCurrentProcessSqlRuntimeLease(async lease => {
    state.assertionFailure = drift;
    await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(lease), error => error === drift);
    state.assertionFailure = undefined;
    await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(lease), /lease-not-current/u);
    return "must not publish";
  }), /lease-not-current/u);
  assert.equal(state.acquisitions, 1); assert.equal(state.nodes[0]?.assertions, 1); assert.equal(state.nodes[0]?.closes, 1);
});
void test("failure at final verification defeats a successful callback without reacquisition", async () => {
  const drift = new Error("synthetic final drift");
  await assert.rejects(api.withCurrentProcessSqlRuntimeLease(() => {
    state.assertionFailure = drift; return Promise.resolve("must not publish");
  }), error => error === drift);
  assert.equal(state.acquisitions, 1); assert.equal(state.nodes[0]?.assertions, 1); assert.equal(state.nodes[0]?.closes, 1);
});
void test("initial acquisition failure invokes no callback", async () => {
  const failure = new Error("synthetic acquisition failure"); state.acquireFailure = failure;
  await assert.rejects(api.withCurrentProcessSqlRuntimeLease(() => { assert.fail("must not enter"); }), error => error === failure);
  assert.equal(state.acquisitions, 1); assert.equal(state.nodes.length, 0);
});
function cleanupFailureTest(callbackFails: boolean): void {
  void test(`required cleanup failure defeats result and preserves primary: ${String(callbackFails)}`, async () => {
    const cleanup = new Error("synthetic close failure"), primary = new Error("synthetic callback failure"); state.closeFailure = cleanup;
    await assert.rejects(api.withCurrentProcessSqlRuntimeLease(() => callbackFails ? Promise.reject(primary) : Promise.resolve("done")), error => {
      assert.ok(error instanceof AggregateError); assert.equal(error.message, "machine-sql-scan-lease-cleanup-failed");
      assert.deepEqual(error.errors, callbackFails ? [primary, cleanup] : [cleanup]); return true;
    });
    assert.equal(state.nodes[0]?.closes, 1); assert.equal(state.acquisitions, 1);
  });
}
cleanupFailureTest(false); cleanupFailureTest(true);
void test("callback failure drains an in-flight assertion before closing the original owner", async () => {
  const entered = latch(), release = latch(), stopped = latch();
  const primary = new Error("synthetic callback stopped"); let assertion: Promise<void> | undefined;
  state.beforeAssert = async (): Promise<void> => { entered.release(); await release.promise; };
  const failed = assert.rejects(api.withCurrentProcessSqlRuntimeLease(async lease => {
    assertion = assert.rejects(api.assertCurrentProcessSqlRuntimeLease(lease), /lease-not-current/u);
    await entered.promise; stopped.release(); throw primary;
  }), (actual: unknown) => actual === primary);
  await stopped.promise; assert.equal(state.nodes[0]?.closes, 0); release.release();
  await failed; await assertion; assert.equal(state.nodes[0]?.closes, 1);
});
void test("concurrent descriptor assertions refuse rather than sharing stream positions", async () => {
  const entered = latch(), release = latch();
  await api.withCurrentProcessSqlRuntimeLease(async lease => {
    state.beforeAssert = async (): Promise<void> => { entered.release(); await release.promise; };
    const first = api.assertCurrentProcessSqlRuntimeLease(lease); await entered.promise;
    await assert.rejects(api.assertCurrentProcessSqlRuntimeLease(lease), /lease-busy/u);
    release.release(); await first; state.beforeAssert = undefined;
  });
  assert.equal(state.nodes[0]?.assertions, 2); assert.equal(state.nodes[0]?.closes, 1);
});
