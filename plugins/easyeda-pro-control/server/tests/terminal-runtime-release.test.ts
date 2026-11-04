/** Real runtime and managed publication, synthetic native transport only. */
import assert from "node:assert/strict";
import { mkdir, readFile, rename, rmdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { operationPath, publishManagedAttachmentExclusive, readExactUtf8Artifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { ArtifactDescriptor } from "../src/artifacts.ts";
import { sha256Text } from "../src/core.ts";
import { OriginalTerminalRuntimeRelease, assertOriginalTerminalRuntimeDisposal, isOriginalTerminalRuntimeDisposalCompleted } from "../src/terminal-runtime-release.ts";
import type { OriginalTerminalRuntimeDisposal } from "../src/terminal-runtime-release.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import type { WindowsAuthoritySupervisor, WindowsLaunchTerminationObservation } from "../src/windows-authority.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

function noDispatchBinding(): undefined { return undefined; }

/** Compose the actual runtime and disposal publisher with a synthetic supervisor.
 * The helper gate and capture failure expose consumed cleanup boundaries while
 * isolated managed files retain the real intent and completion records.
 */
async function fixture(operationId: string, releaseGate?: Promise<unknown>, failCaptures = false): Promise<{
  runtime: WindowsControlRuntime; release: OriginalTerminalRuntimeRelease;
  helperStarted: Promise<null>;
  state: { helpersReleased: number; capturesRetired: number; allocationsCleared: number; currentOwner: boolean };
  complete: (runtime: WindowsControlRuntime, receipt: OriginalTerminalRuntimeDisposal) => void;
}> {
  await writePhaseArtifact(operationId, 1, "synthetic-terminal", { complete: true });
  const authority = closedSessionFixture();
  const helperStarted = Promise.withResolvers<null>();
  const state = { helpersReleased: 0, capturesRetired: 0, allocationsCleared: 0, currentOwner: true };
  const supervisor: WindowsAuthoritySupervisor = { ...authority.supervisor,
    observeLaunchTermination: (launch): Promise<WindowsLaunchTerminationObservation> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: true }),
    release: async () => { state.helpersReleased += 1; helperStarted.resolve(null); await releaseGate; await authority.supervisor.release(); },
  };
  const runtime = new WindowsControlRuntime({ pluginRoot: "/opt/control", assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets",
    wslDistribution: "Synthetic", reviewedExecutionScopeSha256: "e".repeat(64), upstream: {
      bridgeSessionLifecycle: (): ReturnType<WindowsControlRuntimeOptions["upstream"]["bridgeSessionLifecycle"]> => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "synthetic",
        activeSession: null, publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] }),
      currentAuthenticatedBridgeDispatchBinding: noDispatchBinding,
      callTool: (): Promise<never> => Promise.reject(new Error("No bridge dispatch belongs to disposal.")),
    } }, { hashExecutable: (): Promise<string> => Promise.resolve("d".repeat(64)), startSupervisor: (): Promise<WindowsAuthoritySupervisor> => Promise.resolve(supervisor) });
  const launch = await runtime.launch();
  /** Model the index resolver that becomes unavailable after native release.
   * Post-release record settlement must retain object identity without calling it.
   */
  const resolveOwnedRuntime = (): WindowsControlRuntime => {
    assert.equal(state.currentOwner, true); assert.equal(runtime.status().state, "owned"); return runtime;
  };
  const owner = (): void => { assert.equal(state.currentOwner, true); };
  /** Check the synthetic original launch through the owned-only resolver around
   * its termination await, matching the pre-release workflow eligibility boundary.
   */
  const eligible = async (): Promise<void> => {
    assert.equal(resolveOwnedRuntime(), runtime);
    const observation = await runtime.observeLaunchTermination();
    assert.equal(resolveOwnedRuntime(), runtime);
    assert.equal(observation.terminated, true); assert.equal(observation.jobId, launch.jobId);
  };
  const release = new OriginalTerminalRuntimeRelease(runtime, operationId, "project-opening", launch, owner, eligible, (): Promise<void> => {
    state.capturesRetired += 1; if (failCaptures) { throw new Error("Synthetic unsettled capture cleanup"); }
    return Promise.resolve();
  });
  /** Require acknowledged closure and the original issued receipt before counting
   * the allocation callback; its completion latch must still be false on entry.
   */
  const complete = (original: WindowsControlRuntime, receipt: OriginalTerminalRuntimeDisposal): void => {
    assert.equal(original, runtime); assert.equal(runtime.isReleaseAcknowledged(), true);
    assertOriginalTerminalRuntimeDisposal(receipt, runtime, "project-opening", operationId);
    assert.equal(isOriginalTerminalRuntimeDisposalCompleted(receipt, runtime), false);
    state.allocationsCleared += 1;
  };
  return { runtime, release, helperStarted: helperStarted.promise, state, complete };
}

/** Fail the real publisher's path revalidation and pre-unlink identity check.
 * Only publication I/O is replaced; runtime ownership and the opaque receipt
 * registry remain the maintained implementation on the original instance.
 */
function failCompletionPublication(value: Awaited<ReturnType<typeof fixture>>, operationId: string,
  leftover: "exact" | "absent" | "different"): { failures: unknown[]; expected?: ArtifactDescriptor } {
  const state: { failures: unknown[]; expected?: ArtifactDescriptor } = { failures: [] };
  const prototype: unknown = Object.getPrototypeOf(value.release);
  assert.ok(typeof prototype === "object" && prototype !== null);
  const publish: unknown = Object.getOwnPropertyDescriptor(prototype, "publish")?.value;
  assert.ok(typeof publish === "function");
  let attempts = 0;
  Object.defineProperty(value.release, "publish", { value: async (name: string, record: unknown): Promise<unknown> => {
    if (name !== "native-runtime-released.json") {
      const result: unknown = Reflect.apply(publish, value.release, [name, record]); return await result;
    }
    attempts += 1;
    const bytes = Buffer.from(`${JSON.stringify(record)}\n`), path = join(dirname(operationPath(operationId)), operationId, name);
    state.expected = { path, bytes: bytes.length, sha256: sha256Text(bytes.toString("utf8")) };
    try {
      return await publishManagedAttachmentExclusive(path, "Original native runtime disposal", bytes,
        "easyeda-pro-control.terminal-runtime-release.v1", async () => {
          await rename(path, join(dirname(path), `native-runtime-release-unpublished-${attempts}.json`));
          if (leftover !== "absent") {
            const replacement = Buffer.from(bytes);
            if (leftover === "different") { replacement[0] = 0x5B; }
            await publishManagedAttachmentExclusive(path, "Synthetic replacement after publication", replacement, "synthetic-publication-fault");
          }
        });
    } catch (error) { state.failures.push(error); throw error; }
  } });
  return state;
}

void test("terminal cleanup awaits actual runtime helper closure and survives an owned-only index resolver", async () => {
  const gate = Promise.withResolvers<null>();
  const value = await fixture("synthetic-terminal-release-pending", gate.promise);
  const pending = value.release.run(value.complete);
  await value.helperStarted;
  assert.equal(value.state.helpersReleased, 1); assert.equal(value.runtime.status().state, "released");
  assert.equal(value.runtime.isReleaseAcknowledged(), false); assert.equal(value.release.isDisposed(), false);
  assert.equal(value.state.allocationsCleared, 0);
  await assert.rejects(value.release.run(value.complete), /pending/u);
  await assert.rejects(value.release.settle(value.complete), /pending/u);
  gate.resolve(null); const receipt = await pending;
  assert.equal(value.release.isDisposed(value.runtime), true); assert.equal(isOriginalTerminalRuntimeDisposalCompleted(receipt, value.runtime), true);
  assert.equal(value.state.allocationsCleared, 1); assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.capturesRetired, 1);
  assert.throws(() =>{  assertOriginalTerminalRuntimeDisposal(structuredClone(receipt), value.runtime, "project-opening", receipt.operationId); }, /original/u);
  assert.equal(isOriginalTerminalRuntimeDisposalCompleted(structuredClone(receipt), value.runtime), false);
  await assert.rejects(value.release.run(value.complete), /completed/u);
  const saved = await readExactUtf8Artifact(receipt.releaseArtifact); assert.match(saved.text, /helperTransportClosed/u);
});

void test("original failed helper closure never becomes disposal or a second release", async () => {
  const gate = Promise.withResolvers<null>(), value = await fixture("synthetic-terminal-release-rejected", gate.promise);
  const failed = assert.rejects(value.release.run(value.complete), /Synthetic rejected original helper/u);
  await value.helperStarted;
  gate.reject(new Error("Synthetic rejected original helper")); await failed;
  assert.equal(value.runtime.isReleaseAcknowledged(), false); assert.equal(value.release.isDisposed(), false);
  await assert.rejects(value.release.run(value.complete), /consumed/u);
  await assert.rejects(value.release.settle(value.complete), /consumed/u);
  assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.allocationsCleared, 0);
});

void test("acknowledged helper release permits only explicit retained record settlement", async () => {
  const id = "synthetic-terminal-release-publication", value = await fixture(id);
  const obstruction = join(dirname(operationPath(id)), id, "native-runtime-released.json");
  await mkdir(obstruction, { mode: 0o700 });
  await assert.rejects(value.release.run(value.complete));
  assert.equal(value.runtime.isReleaseAcknowledged(), true); assert.equal(value.release.isDisposed(), false);
  assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.allocationsCleared, 0);
  await assert.rejects(value.release.run(value.complete), /consumed/u);
  // Remove only this test's empty obstruction, retaining the original intent.
  await rmdir(obstruction);
  const receipt = await value.release.settle(value.complete);
  assert.equal(value.release.isDisposed(), true); assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.capturesRetired, 1);
  assert.equal(isOriginalTerminalRuntimeDisposalCompleted(receipt, value.runtime), true);
});

for (const leftover of ["exact", "absent", "different"] as const) {
  void test(`original terminal settlement recovers only exact managed completion after ${leftover} publication cleanup`, async () => {
    const id = `synthetic-terminal-release-leftover-${leftover}`, value = await fixture(id);
    const publication = failCompletionPublication(value, id, leftover);
    await assert.rejects(value.release.run(value.complete), (error: unknown) => error === publication.failures[0]);
    assert.equal(publication.failures.length, 1);
    assert.ok(publication.failures[0] instanceof AggregateError);
    assert.match(publication.failures[0].message, /publication failed and cleanup was incomplete/u);
    const intentPath = join(dirname(operationPath(id)), id, "native-runtime-release-intent.json");
    const intent = await readFile(intentPath);
    assert.equal(value.runtime.isReleaseAcknowledged(), true); assert.equal(value.release.isDisposed(), false);
    assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.capturesRetired, 1); assert.equal(value.state.allocationsCleared, 0);
    assert.ok(publication.expected !== undefined);
    if (leftover === "exact") {
      const existing = await readExactUtf8Artifact(publication.expected); assert.equal(existing.bytes, publication.expected.bytes);
    }
    else { await assert.rejects(readExactUtf8Artifact(publication.expected)); }
    await assert.rejects(value.release.run(value.complete), /consumed/u);
    if (leftover === "exact") {
      const receipt = await value.release.settle(value.complete);
      assert.deepEqual(receipt.releaseArtifact, publication.expected);
      assert.equal(isOriginalTerminalRuntimeDisposalCompleted(receipt, value.runtime), true);
      assert.equal(value.release.isDisposed(), true); assert.equal(value.state.allocationsCleared, 1);
      await assert.rejects(value.release.settle(value.complete), /completed/u);
    } else {
      await assert.rejects(value.release.settle(value.complete), (error: unknown) => error === publication.failures[1]);
      assert.equal(value.release.isDisposed(), false); assert.equal(value.state.allocationsCleared, 0);
    }
    assert.equal(publication.failures.length, 2);
    assert.deepEqual(await readFile(intentPath), intent);
    assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.capturesRetired, 1);
  });
}

void test("uncertain original capture retirement blocks the native helper release permanently", async () => {
  const value = await fixture("synthetic-terminal-release-capture", undefined, true);
  await assert.rejects(value.release.run(value.complete), /unsettled capture/u);
  assert.equal(value.state.helpersReleased, 0); assert.equal(value.runtime.isReleaseAcknowledged(), false);
  await assert.rejects(value.release.run(value.complete), /consumed/u);
  await assert.rejects(value.release.settle(value.complete), /consumed/u);
  assert.equal(value.state.capturesRetired, 1); assert.equal(value.state.allocationsCleared, 0); assert.equal(value.release.isDisposed(), false);
});

void test("a failed allocation callback cannot make its published receipt a completed disposal", async () => {
  const value = await fixture("synthetic-terminal-release-callback");
  let retained: OriginalTerminalRuntimeDisposal | undefined;
  await assert.rejects(value.release.run((_runtime, receipt) => { retained = receipt; throw new Error("Synthetic allocation callback refused"); }), /callback refused/u);
  assert.ok(retained !== undefined); assert.equal(value.runtime.isReleaseAcknowledged(), true);
  assert.equal(isOriginalTerminalRuntimeDisposalCompleted(retained, value.runtime), false); assert.equal(value.release.isDisposed(), false);
  const settled = await value.release.settle(value.complete);
  assert.equal(settled, retained); assert.equal(value.state.helpersReleased, 1); assert.equal(value.state.capturesRetired, 1);
  assert.equal(value.state.allocationsCleared, 1); assert.equal(isOriginalTerminalRuntimeDisposalCompleted(settled, value.runtime), true);
});
