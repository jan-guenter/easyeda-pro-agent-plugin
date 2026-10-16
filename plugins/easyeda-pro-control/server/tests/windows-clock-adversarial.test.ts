import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { createClockedTransport } from "../src/windows-clock-transport.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { assertIssuedWindowsClockObservation, createWindowsAuthoritySupervisor, windowsClockObservationForResult } from "../src/windows-authority.ts";
import type { WindowsAuthorityTransport } from "../src/windows-authority.ts";
import { clockEngineFixture, clockTrackedJournal } from "./helpers/windows-clock-engine-fixture.ts";

const HELPER_SHA256 = "507fdea31ee30387ea31e90ca749058fa987ee573de12940db57357d2d321e35";
function terminationBody(source: string): string {
  const start = source.indexOf("  async function proveTerminated(");
  const end = source.indexOf("  /** Revalidation is intentionally separate", start);
  assert.ok(start > 0 && end > start); return source.slice(start, end);
}

void test("public factory with the exact reviewed source hash and fabricated envelope cannot issue a clock", async () => {
  const jobId = "1".padStart(32, "0");
  const raw: WindowsAuthorityTransport = {
    assertClosedSessionAvailable(): void {
      // Synthetic only.
    },
    request(): Promise<unknown> { return Promise.resolve({ jobId, helperInstance: "b".repeat(32),
      root: { pid: 100, role: "easyeda-main", startIdentity: `win32:639247486000000001:job:${jobId}` } }); },
    release(): Promise<void> { return Promise.resolve(); },
  };
  const supervisor = createWindowsAuthoritySupervisor(raw, { helperSha256: HELPER_SHA256,
    expectedExecutable: String.raw`C:\Synthetic\easyeda-pro.exe`, expectedExecutableSha256: "d".repeat(64),
    reviewedExecutionScopeSha256: "e".repeat(64), revalidateClosedSessionHelper(): Promise<void> { return Promise.resolve(); } });
  const launch = await supervisor.launch({ confirmLaunch: true });
  await assert.rejects(windowsClockObservationForResult(launch, "launch"), /Original Windows result/u);
  await supervisor.release();
});
for (const key of ["request", "release", "assertClosedSessionAvailable"] as const) {
  void test(`adapter rejects replaced own ${key} method during later availability check`, () => {
    const raw = { request(): Promise<unknown> { return Promise.resolve(null); }, release(): Promise<void> { return Promise.resolve(); },
      assertClosedSessionAvailable(): void {
        // Synthetic only.
      } };
    const wrapped = createClockedTransport(raw, { helperSourceSha256: HELPER_SHA256, executionScopeSha256: "e".repeat(64) });
    wrapped.transport.assertClosedSessionAvailable?.();
    Object.defineProperty(raw, key, { value(): Promise<unknown> { return Promise.resolve(null); } });
    assert.throws(() => wrapped.transport.assertClosedSessionAvailable?.(), /CLOCK_RECEIPT_REFUSED/u);
  });
}
for (const drift of ["phase", "job", "helper", "binding"] as const) {
  void test(`native capture ${drift} contradiction does not become an issued clock`, async (context) => {
    const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
    f.behavior.mutateResponse = (request, response): void => {
      if (request["action"] !== "clocked-capture") { return; }
      if (drift === "phase") { response["schema"] = "easyeda-pro-control.windows-clocked-launch.v1"; return; }
      const base = response["base"]; assert.ok(base !== null && typeof base === "object");
      if (drift === "job") { Object.assign(base, { jobId: "9".repeat(32) }); }
      else if (drift === "helper") { Object.assign(base, { helperInstance: "9".repeat(32) }); }
      else { Object.assign(base, { bindingSha256: "9".repeat(64) }); }
    };
    await assert.rejects(f.supervisor.capture(INPUT));
    assert.equal(f.requests.filter((r) => r["action"] === "clocked-capture").length, 1);
  });
}
void test("result mutation during actual helper revalidation is rejected after the await", async (context) => {
  const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
  const clock = await windowsClockObservationForResult(launch, "launch");
  const original = fs.readFile;
  context.mock.method(fs, "readFile", async (...args: Parameters<typeof fs.readFile>): ReturnType<typeof fs.readFile> => {
    const result = await original(...args);
    Object.assign(launch.root, { pid: 909 }); return result;
  }); syncBuiltinESMExports();
  await assert.rejects(assertIssuedWindowsClockObservation(clock), /result or launched generation/u);
});
for (const field of ["operationId", "runtimeIdentityBeforeOrphan", "bridgeSessionBeforeOrphan", "runtimeRestartChallengeAttempt", "executionAuthorityBeforeOrphan"] as const) {
  void test(`tracked lookup rejects changed ${field} binding`, async (context) => {
    const f = await clockEngineFixture(context), journal = await clockTrackedJournal(context, `clock-tracked-${field}`);
    await f.engine.markOrphanedCallRisk(journal, "clock-observer");
    await f.engine.clockObservationForTrackedDispatch(journal, "clock-observer");
    const before = structuredClone(journal);
    let changed: unknown = {};
    if (field === "operationId") { changed = "different-operation"; }
    else if (field === "runtimeRestartChallengeAttempt") { changed = 99; }
    Object.assign(journal, { [field]: changed });
    await assert.rejects(f.engine.clockObservationForTrackedDispatch(journal, "clock-observer"), /original operation-bound/u);
    Object.assign(journal, before);
  });
}
void test("legacy proveTerminated body preserves its reviewed pre-clock digest", async () => {
  const source = await fs.readFile(new URL("../src/windows-authority.ts", import.meta.url), "utf8");
  assert.equal(createHash("sha256").update(terminationBody(source)).digest("hex"), "ae6187de8a6de1174828fbe8b7a0a0205c1a4a86d95b1dd6f85f622da1735f0c");
});
