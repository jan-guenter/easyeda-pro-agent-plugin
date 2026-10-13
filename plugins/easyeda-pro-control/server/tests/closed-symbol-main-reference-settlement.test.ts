import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { compileMainReferenceTransport, invokeMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { flushMicrotasks, request, transportFixture } from "./helpers/main-reference-settlement-fixture.ts";
import type { Options } from "./helpers/main-reference-settlement-fixture.ts";

async function start(context: TestContext, options: Options = {}): Promise<{
  compiled: Awaited<ReturnType<typeof compileMainReferenceTransport>>;
  fixture: ReturnType<typeof transportFixture>;
  pending: ReturnType<typeof invokeMainReferenceTransport>;
  state: { settled: boolean };
}> {
  const compiled = await compileMainReferenceTransport(request), fixture = transportFixture(context, options), state = { settled: false };
  // oxlint-disable-next-line promise/prefer-await-to-then -- Observe settlement without awaiting the pending transport in the fixture.
  const pending = invokeMainReferenceTransport(compiled).then((value) => { state.settled = true; return value; });
  return { compiled, fixture, pending, state };
}
function nonauthorizing(value: Awaited<ReturnType<typeof invokeMainReferenceTransport>>): void {
  assert.equal(value.windowsJobTerminationProved, false); assert.equal(value.executionAuthorized, false);
  assert.ok(Object.isFrozen(value)); assert.doesNotMatch(JSON.stringify(value), /Synthetic private/u);
}

for (const mode of ["normal", "nonzero", "signal", "split-unicode", "bom", "controls", "malformed-utf8"] as const) {
  void test(`observed close retains ${mode} without claiming a Windows Job proof`, async (context) => {
    const s = await start(context);
    let expected = "complete";
    if (mode === "split-unicode") { expected = "A😀Z"; for (const byte of Buffer.from(expected)) { s.fixture.output.write(Buffer.from([byte])); } }
    else if (mode === "bom") { expected = "\uFEFF{}"; s.fixture.output.write(expected); }
    else if (mode === "controls") { expected = "\0".repeat(131_072); s.fixture.output.write(expected); }
    else if (mode === "malformed-utf8") { s.fixture.output.write(Buffer.from([0xF0, 0x9F, 0x92])); }
    else { s.fixture.output.write(expected); }
    await flushMicrotasks(); assert.equal(s.state.settled, false);
    let expectedExit: number | null = 0;
    if (mode === "signal") { expectedExit = null; } else if (mode === "nonzero") { expectedExit = 1; }
    s.fixture.close(expectedExit, mode === "signal" ? "SIGTERM" : null);
    const result = await s.pending; nonauthorizing(result);
    assert.equal(result.transportState, "closed"); assert.equal(result.transportCloseObserved, true);
    assert.equal(result.transportFailure, mode === "malformed-utf8" ? "malformed-utf8" : null);
    assert.equal(result.stdout, mode === "malformed-utf8" ? "" : expected);
    assert.equal(result.containmentRequest, "not-requested"); assert.equal(s.fixture.state.kills, 0);
    assert.equal(result.exitCode, expectedExit);
    assert.equal(result.signal, mode === "signal" ? "SIGTERM" : null);
    const retained = JSON.stringify(result); s.fixture.output.write("late"); s.fixture.close(99, "SIGKILL");
    s.fixture.child.emit("error", new Error("Synthetic private late error")); context.mock.timers.tick(200_000);
    assert.equal(JSON.stringify(result), retained);
    assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
  });
}

for (const first of ["stdin-failure", "start-failure", "output-limit", "deadline"] as const) {
  for (const closing of ["before-drain", "drain-expires"] as const) {
    void test(`${first}: ${closing} preserves first failure and never restores consumption`, async (context) => {
      const s = await start(context); s.fixture.output.write("prefix");
      if (first === "stdin-failure") { s.fixture.input.emit("error", new Error("Synthetic private stdin payload")); }
      else if (first === "start-failure") { s.fixture.child.emit("error", new Error("Synthetic private startup payload")); }
      else if (first === "output-limit") { s.fixture.output.write(Buffer.alloc(131_073, 97)); }
      else { context.mock.timers.tick(180_000); }
      await flushMicrotasks(); assert.equal(s.state.settled, false); assert.equal(s.fixture.state.kills, 1);
      s.fixture.input.emit("error", new Error("Synthetic private second error"));
      s.fixture.child.emit("error", new Error("Synthetic private third error")); s.fixture.error.write("later stderr");
      context.mock.timers.tick(4999); await flushMicrotasks(); assert.equal(s.state.settled, false);
      if (closing === "before-drain") { s.fixture.close(197, null); } else { context.mock.timers.tick(1); }
      const result = await s.pending; nonauthorizing(result);
      assert.equal(result.transportFailure, first); assert.equal(result.timedOut, first === "deadline");
      assert.equal(result.transportState, closing === "before-drain" ? "closed" : "unresolved");
      assert.equal(result.transportCloseObserved, closing === "before-drain");
      assert.equal(result.exitCode, closing === "before-drain" ? 197 : null); assert.equal(result.signal, null);
      assert.equal(result.containmentRequest, "accepted"); assert.equal(result.stdout, ""); assert.equal(result.stderr, "");
      const raw = Buffer.from(result.rawStdoutBase64, "base64"), retained = JSON.stringify(result);
      assert.equal(raw.length, first === "output-limit" ? 131_072 : 6); assert.equal(result.rawStderrBase64, "");
      s.fixture.close(0, null); s.fixture.output.write("late success"); context.mock.timers.tick(200_000);
      assert.equal(JSON.stringify(result), retained); assert.equal(s.fixture.state.kills, 1);
      assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
    });
  }
}

for (const kill of ["refused", "threw", "synchronous-close"] as const) {
  void test(`containment ${kill} is retained separately from close evidence`, async (context) => {
    const s = await start(context, { kill }); s.fixture.input.emit("error", new Error("Synthetic private stdin payload"));
    if (kill !== "synchronous-close") { context.mock.timers.tick(5000); }
    const result = await s.pending; nonauthorizing(result);
    assert.equal(result.transportFailure, "stdin-failure");
    assert.equal(result.containmentRequest, kill === "synchronous-close" ? "accepted" : kill);
    assert.equal(result.transportState, kill === "synchronous-close" ? "closed" : "unresolved");
    assert.equal(result.transportCloseObserved, kill === "synchronous-close");
    assert.equal(s.fixture.state.kills, 1);
  });
}

for (const option of ["spawnThrows", "stdinThrows", "missingStdio"] as const) {
  void test(`${option} does not confuse missing setup with proved native termination`, async (context) => {
    const s = await start(context, { [option]: true }); await flushMicrotasks();
    assert.equal(s.state.settled, option === "spawnThrows");
    if (option !== "spawnThrows") { s.fixture.close(197, null); }
    const result = await s.pending; nonauthorizing(result);
    assert.equal(result.transportState, option === "stdinThrows" ? "closed" : "unresolved");
    assert.equal(result.spawnReturnObserved, option !== "spawnThrows");
    assert.equal(result.transportCloseObserved, option !== "spawnThrows");
    assert.equal(result.observationGuardsComplete, option === "stdinThrows");
    assert.equal(result.transportFailure, option === "stdinThrows" ? "stdin-failure" : "start-failure");
    assert.equal(s.fixture.state.kills, option === "spawnThrows" ? 0 : 1);
    assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
  });
}

void test("shared stdout/stderr bound is exact and later bytes are not adopted", async (context) => {
  const s = await start(context); s.fixture.output.write(Buffer.alloc(65_536, 97)); s.fixture.error.write(Buffer.alloc(65_537, 98));
  s.fixture.close(1, null); const result = await s.pending;
  assert.equal(result.transportFailure, "output-limit"); assert.equal(Buffer.from(result.rawStdoutBase64, "base64").length, 65_536);
  assert.equal(Buffer.from(result.rawStderrBase64, "base64").length, 65_536); nonauthorizing(result);
});
void test("the operation deadline remains 180 seconds before the separate five-second drain", async (context) => {
  const s = await start(context); context.mock.timers.tick(179_999); await flushMicrotasks();
  assert.equal(s.state.settled, false); assert.equal(s.fixture.state.kills, 0);
  context.mock.timers.tick(1); await flushMicrotasks(); assert.equal(s.state.settled, false); assert.equal(s.fixture.state.kills, 1);
  context.mock.timers.tick(4999); await flushMicrotasks(); assert.equal(s.state.settled, false);
  context.mock.timers.tick(1); const result = await s.pending; assert.equal(result.transportState, "unresolved"); assert.equal(result.transportFailure, "deadline");
});
void test("clone cannot invoke, and refusal does not consume the actual original", async (context) => {
  const compiled = await compileMainReferenceTransport(request), fixture = transportFixture(context);
  assert.throws(() => invokeMainReferenceTransport(structuredClone(compiled)), /unissued/u); assert.equal(fixture.state.calls, 0);
  const pending = invokeMainReferenceTransport(compiled); fixture.close(); nonauthorizing(await pending); assert.equal(fixture.state.calls, 1);
});

for (const setup of ["close-in-close-listener", "error-in-error-listener", "throw-in-output-listener", "close-and-throw-in-output-listener"] as const) {
  void test(`synchronous ${setup} never fabricates not-started evidence`, async (context) => {
    const s = await start(context, { setup }); await flushMicrotasks();
    const alreadyClosed = setup === "close-in-close-listener" || setup === "close-and-throw-in-output-listener";
    assert.equal(s.state.settled, alreadyClosed);
    if (!alreadyClosed) { s.fixture.close(197, null); }
    const result = await s.pending; nonauthorizing(result);
    assert.equal(result.transportState, "closed"); assert.equal(result.transportCloseObserved, true);
    assert.equal(result.transportFailure, setup === "close-in-close-listener" ? null : "start-failure");
    assert.equal(s.fixture.state.kills, alreadyClosed ? 0 : 1);
    assert.equal(s.fixture.state.stdinBytes, 0);
    const before = JSON.stringify(result); context.mock.timers.tick(200_000); assert.equal(JSON.stringify(result), before);
    assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
  });
}
void test("asynchronous ENOENT error waits for the returned child's close", async (context) => {
  const s = await start(context);
  queueMicrotask(() => { s.fixture.child.emit("error", Object.assign(new Error("spawn ENOENT"), { code: "ENOENT" })); });
  await flushMicrotasks(); assert.equal(s.state.settled, false);
  s.fixture.close(-2, null); const result = await s.pending;
  assert.equal(result.transportState, "closed"); assert.equal(result.transportFailure, "start-failure");
  assert.equal(result.exitCode, -2); assert.equal(result.transportCloseObserved, true); nonauthorizing(result);
});
void test("spawn-then-throw retains uncertainty even though no ChildProcess was returned", async (context) => {
  const s = await start(context, { spawnThenThrows: true });
  const result = await s.pending;
  assert.equal(s.fixture.state.unreturnedChildStarted, true); assert.equal(s.fixture.state.calls, 1);
  assert.equal(result.transportState, "unresolved"); assert.equal(result.spawnReturnObserved, false);
  assert.equal(result.transportCloseObserved, false); assert.equal(result.containmentRequest, "not-requested");
  assert.equal(result.observationGuardsComplete, false);
  assert.equal(result.transportFailure, "start-failure"); assert.equal(s.fixture.state.kills, 0); nonauthorizing(result);
  const retained = JSON.stringify(result); s.fixture.close(0, null); context.mock.timers.tick(200_000);
  assert.equal(JSON.stringify(result), retained);
  assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
});

for (const stream of ["stdout", "stderr"] as const) {
  for (const timing of ["first", "after-failure", "after-unresolved"] as const) {
    void test(`${stream} error ${timing} is handled with fixed failure precedence`, async (context) => {
      const s = await start(context); s.fixture.output.write("prefix");
      if (timing !== "first") { s.fixture.input.emit("error", new Error("Synthetic private initial stdin failure")); }
      if (timing === "after-unresolved") { context.mock.timers.tick(5000); await flushMicrotasks(); assert.equal(s.state.settled, true); }
      const target = stream === "stdout" ? s.fixture.output : s.fixture.error;
      assert.doesNotThrow(() => { target.emit("error", new Error("Synthetic private readable error")); });
      if (timing !== "after-unresolved") { await flushMicrotasks(); assert.equal(s.state.settled, false); s.fixture.close(197, null); }
      const result = await s.pending; nonauthorizing(result);
      assert.equal(result.transportFailure, timing === "first" ? `${stream}-failure` : "stdin-failure");
      assert.equal(result.transportState, timing === "after-unresolved" ? "unresolved" : "closed");
      assert.equal(result.observationGuardsComplete, true); assert.equal(s.fixture.state.kills, 1);
      const retained = JSON.stringify(result); s.fixture.close(); target.emit("error", new Error("Synthetic private late readable error"));
      assert.equal(JSON.stringify(result), retained); assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
    });
  }
}
void test("stdin error after output setup throw is already guarded", async (context) => {
  const s = await start(context, { setup: "throw-in-output-listener" });
  assert.doesNotThrow(() => { s.fixture.input.emit("error", new Error("Synthetic private late stdin failure")); });
  assert.doesNotThrow(() => { s.fixture.error.emit("error", new Error("Synthetic private late stderr failure")); });
  await flushMicrotasks(); assert.equal(s.state.settled, false); s.fixture.close(197, null);
  const result = await s.pending; assert.equal(result.transportFailure, "start-failure");
  assert.equal(result.observationGuardsComplete, true); assert.equal(result.transportState, "closed"); assert.equal(s.fixture.state.kills, 1);
});
for (const failedGuard of ["child-error", "child-close", "stdin-error", "stdout-error", "stderr-error"] as const) {
  void test(`${failedGuard} installation failure attempts every remaining guard and stays unresolved`, async (context) => {
    const s = await start(context, { guardFailures: [failedGuard] });
    assert.deepEqual(s.fixture.state.guardAttempts, ["child-error", "child-close", "stdin-error", "stdout-error", "stderr-error"]);
    assert.equal(s.fixture.state.stdinBytes, 0);
    if (failedGuard !== "stdin-error") { assert.doesNotThrow(() => { s.fixture.input.emit("error", new Error("Synthetic private later input error")); }); }
    if (failedGuard !== "stdout-error") { assert.doesNotThrow(() => { s.fixture.output.emit("error", new Error("Synthetic private later output error")); }); }
    if (failedGuard !== "stderr-error") { assert.doesNotThrow(() => { s.fixture.error.emit("error", new Error("Synthetic private later stderr error")); }); }
    s.fixture.close(197, null);
    if (failedGuard === "child-close") { context.mock.timers.tick(5000); }
    const result = await s.pending; nonauthorizing(result);
    assert.equal(result.transportFailure, "start-failure"); assert.equal(result.observationGuardsComplete, false);
    assert.equal(result.transportState, "unresolved"); assert.equal(result.transportCloseObserved, failedGuard !== "child-close");
    assert.equal(s.fixture.state.kills, 1); assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
  });
}
void test("multiple guard installation failures remain one containment request", async (context) => {
  const s = await start(context, { guardFailures: ["child-error", "stdout-error", "stderr-error"] });
  assert.deepEqual(s.fixture.state.guardAttempts, ["child-error", "child-close", "stdin-error", "stdout-error", "stderr-error"]);
  assert.doesNotThrow(() => { s.fixture.input.emit("error", new Error("Synthetic private guarded error")); });
  s.fixture.close(197, null); const result = await s.pending;
  assert.equal(result.transportState, "unresolved"); assert.equal(result.observationGuardsComplete, false);
  assert.equal(result.transportFailure, "start-failure"); assert.equal(s.fixture.state.kills, 1);
});
for (const stream of ["stdin", "stdout", "stderr"] as const) {
  void test(`${stream} late error remains guarded after synchronous setup close`, async (context) => {
    const s = await start(context, { setup: "close-in-close-listener" });
    const result = await s.pending;
    assert.deepEqual(s.fixture.state.guardAttempts, ["child-error", "child-close", "stdin-error", "stdout-error", "stderr-error"]);
    assert.equal(result.transportState, "closed"); assert.equal(result.observationGuardsComplete, true);
    let target = s.fixture.error;
    if (stream === "stdin") { target = s.fixture.input; } else if (stream === "stdout") { target = s.fixture.output; }
    const retained = JSON.stringify(result);
    assert.doesNotThrow(() => { target.emit("error", new Error("Synthetic private late setup-close stream error")); });
    assert.equal(JSON.stringify(result), retained); assert.equal(s.fixture.state.kills, 0);
    assert.throws(() => invokeMainReferenceTransport(s.compiled), /already consumed/u);
  });
}
