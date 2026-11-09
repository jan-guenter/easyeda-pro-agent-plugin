/** Original Node ChildProcess/stream callback ordering with no process spawn.
 * The synthetic child has no OS PID, namespace or application ownership. */
import assert from "node:assert/strict";
import { ChildProcess } from "node:child_process";
import { PassThrough } from "node:stream";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import { CLI4197_METADATA_LIMITS as LIMITS } from "../../scripts/cli4197-metadata/profile.ts";
import { cli4197MetadataClosedFailure, observeCli4197MetadataChild, runCli4197MetadataProbe, writeCli4197MetadataClosedFailure } from "../../scripts/cli4197-metadata/runner.ts";

/** Fresh native wrapper only. It is never spawned and cannot signal a PID. */
function peer(): Readonly<{ child: ChildProcess; out: PassThrough; err: PassThrough }> {
  const child = new ChildProcess(), err = new PassThrough(), out = new PassThrough();
  Object.defineProperties(child, { stdout: { value: out }, stderr: { value: err }, kill: { value: (): never => { throw new Error("No signal is permitted"); } } });
  return { child, out, err };
}

void test("original exit and child close cannot substitute for both observed stdio closes", async () => {
  const f = peer(), pending = observeCli4197MetadataChild(f.child); let settled = false;
  void (async (): Promise<void> => { await pending; settled = true; })(); f.child.emit("spawn"); f.child.emit("exit", 0, null); f.child.emit("close", 0, null);
  f.out.write(Buffer.from("late buffered report")); await setImmediate(); assert.equal(settled, false);
  f.out.emit("close"); await setImmediate(); assert.equal(settled, false); f.err.emit("close");
  const result = await pending; assert.equal(result.exitObserved, true); assert.equal(result.stdioClosed, true); assert.equal(result.stdout.toString(), "late buffered report");
  assert.equal(result.spawnFailed, false); assert.equal(result.exitCode, 0);
});

void test("overflow stops retention while the original child and stdio remain owned until actual closure", async () => {
  const f = peer(), pending = observeCli4197MetadataChild(f.child); let settled = false;
  void (async (): Promise<void> => { await pending; settled = true; })(); f.child.emit("spawn"); f.out.write(Buffer.alloc(LIMITS.reportBytes + 1)); f.err.write(Buffer.alloc(LIMITS.outerStderrBytes + 1));
  await setImmediate(); assert.equal(settled, false);
  f.child.emit("exit", 125, null); f.out.emit("close"); f.err.emit("close"); await setImmediate(); assert.equal(settled, false); f.child.emit("close", 125, null);
  const result = await pending; assert.equal(result.stdoutOverflow, true); assert.equal(result.stderrOverflow, true);
  assert.equal(result.stdout.length, 0); assert.equal(result.stderr.length, 0); assert.equal(result.exitCode, 125);
});

void test("a stream error never supplies no-process proof, while an original spawn refusal retains its distinct outcome", async () => {
  const f = peer(), pending = observeCli4197MetadataChild(f.child); let settled = false;
  void (async (): Promise<void> => { await pending; settled = true; })(); f.out.emit("error", new Error("synthetic stream failure"));
  f.out.emit("close"); f.err.emit("close"); f.child.emit("close", 1, null); await setImmediate(); assert.equal(settled, false);
  f.child.emit("exit", 1, null); const result = await pending; assert.equal(result.spawnFailed, false); assert.equal(result.errorSeen, true);
  const refused = peer(); const refusal = observeCli4197MetadataChild(refused.child);
  refused.child.emit("error", new Error("synthetic spawn refusal")); refused.out.emit("close"); refused.err.emit("close"); refused.child.emit("close", -2, null);
  const absent = await refusal; assert.equal(absent.spawnFailed, true); assert.equal(absent.exitObserved, false); assert.equal(absent.stdioClosed, true);
  const hostError = cli4197MetadataClosedFailure("rootHelp", result), spawnError = cli4197MetadataClosedFailure("rootHelp", absent);
  assert.equal(hostError["spawnFailed"], false); assert.equal(hostError["spawnOrStreamErrorSeen"], true); assert.equal(hostError["originalChildExitObserved"], true);
  assert.equal(spawnError["spawnFailed"], true); assert.equal(spawnError["spawnOrStreamErrorSeen"], true); assert.equal(spawnError["originalChildExitObserved"], false);
  assert.equal(hostError["retryAuthorized"], false); assert.equal(spawnError["retryAuthorized"], false);
});

void test("closed failure retains invalid output and signal separately from pre-spawn failure", async () => {
  const f = peer(), pending = observeCli4197MetadataChild(f.child); f.child.emit("spawn"); f.out.emit("data", "invalid text chunk");
  f.child.emit("exit", null, "SIGTERM"); f.out.emit("close"); f.err.emit("close"); f.child.emit("close", null, "SIGTERM");
  const failure = cli4197MetadataClosedFailure("rootHelp", await pending); const beforeSpawn = cli4197MetadataClosedFailure("rootHelp", null);
  assert.equal(failure["profile"], "private.cli4197-developer-metadata-failure.v2"); assert.equal(failure["invalidChunk"], true); assert.equal(failure["signal"], "SIGTERM");
  assert.equal(failure["spawnFailed"], false); assert.equal(failure["spawnOrStreamErrorSeen"], false); assert.equal(failure["childSpawnAttempted"], true);
  assert.equal(beforeSpawn["childSpawnAttempted"], false); assert.equal(beforeSpawn["signal"], null); assert.equal(beforeSpawn["invalidChunk"], false);
  assert.equal(failure["retryAuthorized"], false); assert.equal(beforeSpawn["retryAuthorized"], false);
});

void test("invalid developer arguments refuse before any filesystem or child preparation", async () => {
  let hooks = 0; const poison = Object.defineProperty({}, "command", { enumerable: true, get: (): never => { hooks += 1; throw new Error("must not inspect"); } });
  for (const input of [poison, { command: "invoke", code: "private code" }, { command: "rootHelp", runtimeDirectory: "/runtime", inventoryPath: "/inventory", evidenceParent: "/private", argv: [] }]) {
    await assert.rejects(runCli4197MetadataProbe(input));
  }
  assert.equal(hooks, 0);
});

void test("failure publication retains primary and write failures without inspection or a retry", async () => {
  let hooks = 0; const poison = new Proxy({}, { get: (): never => { hooks += 1; throw new Error("failure must not be inspected"); } });
  for (const synchronous of [true, false]) {
    let calls = 0; const writeError = new Error("synthetic publication failure");
    const writer = { write: (): Promise<void> => { calls += 1; if (synchronous) { throw writeError; } return Promise.reject(writeError); } };
    const pending = writeCli4197MetadataClosedFailure(writer, "rootHelp", null, poison);
    assert.equal(calls, 0); assert.equal(writeCli4197MetadataClosedFailure(writer, "rootHelp", null, poison), pending);
    await assert.rejects(pending, (error: unknown): boolean => {
      assert.ok(error instanceof AggregateError); assert.equal(error.message, "CLI4197_METADATA_FAILURE_RECORD_FAILED");
      assert.equal(error.errors.length, 2); assert.equal(error.errors[0], poison); assert.equal(error.errors[1], writeError); assert.equal(error.cause, writeError); return true;
    });
    assert.equal(calls, 1); assert.equal(writeCli4197MetadataClosedFailure(writer, "rootHelp", null, poison), pending);
  }
  let calls = 0;
  await writeCli4197MetadataClosedFailure({ write: (name, bytes): Promise<void> => {
    calls += 1; assert.equal(name, "closed-failure.json"); const value: unknown = JSON.parse(bytes.toString());
    assert.ok(value !== null && typeof value === "object" && "retryAuthorized" in value); assert.equal(value.retryAuthorized, false); return Promise.resolve();
  } }, "rootHelp", null, poison);
  assert.equal(calls, 1); assert.equal(hooks, 0);
});
