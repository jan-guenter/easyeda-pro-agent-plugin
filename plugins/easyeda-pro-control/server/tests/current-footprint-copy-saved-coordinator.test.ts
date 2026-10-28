/** Synthetic saved-start boundary in the maintained private coordinator.
 * Earlier writer phases are fixed test setup, not writer or closure evidence. */
/* oxlint-disable import/max-dependencies -- Exercise the maintained coordinator's strict owner, schema, SQL completion and comparison code together at the saved-allocation boundary. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { canonicalJson, sha256Text } from "../src/core.ts";
import { compareCompleteClosedSql } from "../src/closed-sql-equality.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as LIMITS, currentFootprintCopyExecutionAdvanceSchema,
  currentFootprintCopyExecutionGenerationSchema } from "../src/current-footprint-copy-execution.ts";
import type { CurrentFootprintCopyExecutionCoordinator, CurrentFootprintCopyExecutionNative,
  CurrentFootprintCopySavedExecutionNative, CurrentFootprintCopySavedStartOutcome } from "../src/current-footprint-copy-execution-runtime.ts";
import { CurrentFootprintCopyTransactionClockEvents } from "../src/current-footprint-copy-transaction-clock-events.ts";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

const unavailable = (): Promise<never> => Promise.reject(new Error("writer already closed in this synthetic boundary"));
async function fixture(options: Readonly<{ outcome: CurrentFootprintCopySavedStartOutcome; journalFails?: boolean;
  intentFails?: boolean; expireBeforeStart?: boolean }>): Promise<{
  runner: CurrentFootprintCopyExecutionCoordinator; calls: string[]; records: Readonly<{ phase: string; evidence: unknown }>[];
}> {
  const calls: string[] = [], input = await savedFixture(), records: { phase: string; evidence: unknown }[] = [];
  const termination = Object.freeze({}); let attempted = false, now = 0n;
  const saved: CurrentFootprintCopySavedExecutionNative = Object.freeze({ generation: Object.freeze({}), assertOwned: (): void => undefined,
    start: (): Promise<void> => { attempted = true; calls.push("start"); return Promise.reject(new Error("saved start failed")); },
    startOutcome: (): CurrentFootprintCopySavedStartOutcome => { assert.equal(attempted, options.outcome !== "not-started"); return options.outcome; },
    excludeReplay: (): Promise<never> => Promise.reject(new Error("no replay exclusion")),
    requireReplayExclusion: (): Promise<never> => Promise.reject(new Error("no original exclusion")),
    open: (): Promise<never> => Promise.reject(new Error("open must not execute")),
    close: (): Promise<unknown> => { calls.push("close"); return Promise.resolve({ closeDispatched: true }); },
    termination: () => { calls.push("termination"); return Promise.resolve({ status: "terminated", original: termination } as const); },
    requireTermination: (original: object): Promise<void> => { assert.equal(original, termination); return Promise.resolve(); },
    snapshot: (original: object) => { assert.equal(original, termination); calls.push("snapshot"); return Promise.resolve(input.after); },
    release: (original: object): Promise<void> => { assert.equal(original, termination); calls.push("release"); return Promise.resolve(); },
    observeRelease: (original: object): Promise<"released"> => { assert.equal(original, termination); calls.push("observe-release"); return Promise.resolve("released"); },
  });
  const native: CurrentFootprintCopyExecutionNative = Object.freeze({
    generation: Object.freeze({ profile: "private.current-footprint-copy-execution-generation.v1",
      purpose: "worker-startup-footprint-copy209", operationId: "footprint-copy-saved-boundary", bindingSha256: "a".repeat(64) }),
    nativeGeneration: Object.freeze({}), assertOwned: (): void => undefined, qualify: unavailable, requireQualification: unavailable,
    publish: (phase: string, evidence: unknown): Promise<void> => {
      records.push({ phase, evidence });
      if (phase === "verification-start-intent" && options.expireBeforeStart === true) { now = BigInt(LIMITS.milliseconds) * 1_000_000n; }
      if (phase === "verification-start-intent" && options.intentFails === true) { return Promise.reject(new Error("start intent unavailable")); }
      return phase === "verification-not-allocated" && options.journalFails === true ? Promise.reject(new Error("journal unavailable")) : Promise.resolve();
    }, create: unavailable, close: unavailable, termination: unavailable, requireTermination: unavailable, snapshot: unavailable,
    verifyClockClosure: unavailable, release: unavailable, observeRelease: unavailable,
    verification: (): CurrentFootprintCopySavedExecutionNative => { calls.push("allocate-binding"); return saved; },
  });
  let program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-execution-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "")
    .replaceAll(/(#(?:phase|after|projection)) +(?==)/gu, "$1 ");
  // Start at the saved boundary while preserving the actual native-owner
  // Constructor, strict member checks, catch routing and all cleanup methods.
  for (const [original, replacement] of [
    ['#phase = "prepare"', '#phase = "start-verification"'], ["#writerReleased = false", "#writerReleased = true"],
    ["#writerClosed = false", "#writerClosed = true"], ["#after = null", "#after = input.after"],
    ["#projection = null", "#projection = input.projection"],
  ]) {
    assert.ok(original !== undefined && replacement !== undefined); assert.equal(program.split(original).length, 2);
    program = program.replace(original, replacement);
  }
  const scope = createContext({ types, Object, Reflect, Error, AggregateError,
    process: { hrtime: { bigint: (): bigint => now } }, canonicalJson, sha256Text,
    LIMITS, currentFootprintCopyExecutionAdvanceSchema, currentFootprintCopyExecutionGenerationSchema,
    CurrentFootprintCopyTransactionClockEvents, captureCurrentPcbStringClockReply, compareCompleteClosedSql,
    readerCompletion, native, input });
  const loaded: unknown = runInContext(`${program}\nnew CurrentFootprintCopyExecutionCoordinator(new CurrentFootprintCopyExecutionOwner(native))`, scope);
  assert.ok(loaded !== null && typeof loaded === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Execute the maintained class in a private realm with only the explicit synthetic prior-phase setup above.
  return { runner: loaded as CurrentFootprintCopyExecutionCoordinator, calls, records };
}

void test("saved helper admission failure ends the private coordinator without inventing native cleanup evidence", async () => {
  const f = await fixture({ outcome: "no-resource" });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /saved start failed/u);
  const status = f.runner.status();
  assert.equal(status.phase, "failed-closed"); assert.equal(status.verificationNoResource, true);
  assert.equal(status.verificationGenerationClosed, false); assert.equal(status.verificationReleased, false);
  assert.equal(status.savedContentVerified, false); assert.equal(status.finalClosedSqlEqual, false); assert.equal(status.cleanupPending, false);
  assert.equal(status.nativeExecutionMounted, false); assert.equal(status.executionAuthorized, false);
  assert.deepEqual(f.calls, ["allocate-binding", "start"]);
  assert.deepEqual(f.records.map(record => record.phase), ["verification-start-intent", "verification-not-allocated"]);
  assert.deepEqual(structuredClone(f.records[1]?.evidence), { startAttemptConsumed: true, startOutcome: "no-resource", retryAllowed: false,
    nativeGenerationAllocated: false, nativeTerminationObserved: false, nativeReleaseObserved: false, savedContentVerified: false });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /PHASE_CONSUMED/u);
  await assert.rejects(f.runner.advance({ expectedPhase: "failed-closed" }), /PHASE_CONSUMED/u);
});

void test("saved no-resource truth remains terminal if its journal acknowledgment is lost", async () => {
  const f = await fixture({ outcome: "no-resource", journalFails: true });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /journal unavailable/u);
  assert.equal(f.runner.status().phase, "failed-closed"); assert.equal(f.runner.status().verificationNoResource, true);
  assert.equal(f.runner.status().verificationReleased, false); assert.deepEqual(f.calls, ["allocate-binding", "start"]);
});

void test("deadline after pure saved binding allocation grants no helper closure or retry", async () => {
  const f = await fixture({ outcome: "not-started", expireBeforeStart: true });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /LIFETIME/u);
  const status = f.runner.status(); assert.equal(status.phase, "failed-closed"); assert.equal(status.verificationNoResource, true);
  assert.equal(status.verificationGenerationClosed, false); assert.equal(status.verificationReleased, false);
  assert.equal(status.cleanupPending, false); assert.deepEqual(f.calls, ["allocate-binding"]);
  assert.deepEqual(structuredClone(f.records[1]?.evidence), { startAttemptConsumed: false, startOutcome: "not-started", retryAllowed: false,
    nativeGenerationAllocated: false, nativeTerminationObserved: false, nativeReleaseObserved: false, savedContentVerified: false });
});

void test("lost saved start intent leaves the pure binding unstarted and terminal without fake native cleanup", async () => {
  const f = await fixture({ outcome: "not-started", intentFails: true });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /start intent unavailable/u);
  const status = f.runner.status(); assert.equal(status.phase, "failed-closed"); assert.equal(status.verificationNoResource, true);
  assert.equal(status.verificationGenerationClosed, false); assert.equal(status.verificationReleased, false);
  assert.deepEqual(f.calls, ["allocate-binding"]);
});

void test("allocated saved start failure retains normal close, complete SQL and original release", async () => {
  const f = await fixture({ outcome: "retained" });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /saved start failed/u);
  assert.equal(f.runner.status().phase, "close-verification"); assert.equal(f.runner.status().verificationNoResource, false);
  await f.runner.advance({ expectedPhase: "close-verification" });
  await f.runner.advance({ expectedPhase: "observe-verification-exit" });
  await f.runner.advance({ expectedPhase: "release-verification" });
  const status = f.runner.status(); assert.equal(status.phase, "failed-closed");
  assert.equal(status.verificationGenerationClosed, true); assert.equal(status.verificationReleased, true);
  assert.equal(status.finalClosedSqlEqual, true); assert.equal(status.savedContentVerified, false); assert.equal(status.cleanupPending, false);
  assert.deepEqual(f.calls, ["allocate-binding", "start", "close", "termination", "snapshot", "release", "observe-release"]);
});

void test("unresolved saved allocation never gains a no-resource exemption", async () => {
  const f = await fixture({ outcome: "unresolved" });
  await assert.rejects(f.runner.advance({ expectedPhase: "start-verification" }), /saved start failed/u);
  assert.equal(f.runner.status().phase, "close-verification"); assert.equal(f.runner.status().verificationNoResource, false);
  assert.equal(f.runner.status().cleanupPending, true); assert.equal(f.records.some(record => record.phase === "verification-not-allocated"), false);
});
