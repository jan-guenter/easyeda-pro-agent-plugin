/** One admission scan's original current-Node descriptors, never cached authority.
 * SQL children keep their separate descriptor-bound execution verification. */
import { AsyncLocalStorage } from "node:async_hooks";
import { MachineProfileError, retainCurrentProcessSqlNode } from "./machine-profile.ts";
import type { MachineProfile, VerifiedMachineNode } from "./machine-profile.ts";

export interface CurrentProcessSqlRuntimeLease {
  readonly runtime: Readonly<MachineProfile["runtime"]>;
}
interface State {
  readonly node: VerifiedMachineNode;
  active: boolean;
  failed: boolean;
  assertion: Promise<void> | undefined;
}
const owners = new WeakMap<CurrentProcessSqlRuntimeLease, State>();
const scopes = new AsyncLocalStorage<CurrentProcessSqlRuntimeLease>();
function current(lease: CurrentProcessSqlRuntimeLease, state: State | undefined): asserts state is State {
  if (state === undefined || !state.active || state.failed || scopes.getStore() !== lease || state.node.runtime !== lease.runtime) {
    throw new MachineProfileError("machine-sql-scan-lease-not-current");
  }
}

/** Lifecycle ownership only, never executable or evidence admission. The scan
 * uses this after an inspector refusal to stop immediately on a poisoned lease. */
export function requireCurrentProcessSqlRuntimeLease(lease: CurrentProcessSqlRuntimeLease): void {
  current(lease, owners.get(lease));
}

/** Fresh complete Node hash/path/kernel/version/core-limit checks on every borrow.
 * Copies, another asynchronous scan and a completed or failed scope cannot use it. */
export async function assertCurrentProcessSqlRuntimeLease(lease: CurrentProcessSqlRuntimeLease): Promise<void> {
  const state = owners.get(lease); current(lease, state);
  if (state.assertion !== undefined) { throw new MachineProfileError("machine-sql-scan-lease-busy"); }
  // Reserve before the underlying asynchronous verification can run.
  const assertion = (async (): Promise<void> => {
    await Promise.resolve(); current(lease, state); await state.node.assertCurrent();
  })();
  state.assertion = assertion;
  try { await assertion; current(lease, state); }
  catch (error) { state.failed = true; throw error; }
  finally { state.assertion = undefined; }
}

/** The original owner closes both retained descriptors after the whole scan.
 * A close failure defeats the result; a failed assertion never reacquires or
 * falls back. No caller-provided executable, descriptor or verification function
 * is accepted. */
export async function withCurrentProcessSqlRuntimeLease<T>(invoke: (lease: CurrentProcessSqlRuntimeLease) => Promise<T>): Promise<T> {
  const node = await retainCurrentProcessSqlNode();
  const lease: CurrentProcessSqlRuntimeLease = Object.freeze({ runtime: node.runtime });
  const state: State = { node, active: true, failed: false, assertion: undefined };
  owners.set(lease, state);
  let failed = false;
  let primary: unknown;
  try {
    return await scopes.run(lease, async () => {
      const result = await invoke(lease);
      await assertCurrentProcessSqlRuntimeLease(lease);
      return result;
    });
  } catch (error) { failed = true; primary = error; throw error; }
  finally {
    state.active = false;
    // Drain an already-running assertion before closing its descriptors, even
    // When the callback failed without awaiting that assertion.
    const failures: unknown[] = [];
    if (state.assertion !== undefined) {
      try { await state.assertion; } catch (error) { failures.push(error); }
    }
    owners.delete(lease);
    try { await node.close(); } catch (error) { failures.push(error); }
    if (failures.length > 0) {
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Required original-descriptor cleanup must defeat success and retain the primary failure.
      throw new AggregateError(failed ? [primary, ...failures] : failures, "machine-sql-scan-lease-cleanup-failed");
    }
  }
}
