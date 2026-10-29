/** Real channel queue/framing/counters over an explicitly synthetic native
 * collaborator. Only test-loaded source adds a prerequisite-state seed. No
 * application, live native origin, process, project or writer is exercised. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCombinedStartupChannel, CurrentFootprintCopyClockRpcChannelReservation, CurrentFootprintCopyClockRpcChannelRoute } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES } from "../src/current-footprint-copy-clock-rpc-source.ts";
import { currentFootprintCopyClockRpcCondition } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } from "../src/current-footprint-copy-clock-rpc-programs.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";

type StartupDependency = Awaited<ReturnType<CurrentFootprintCombinedStartupChannel["start"]>>;
interface SyntheticChannel {
  start: () => Promise<StartupDependency>;
  seedRpcPrerequisitesForTest: (partial: boolean) => void;
  prepareFootprintClockRpc: (dependency: StartupDependency, session: string) => Promise<CurrentFootprintCopyClockRpcChannelReservation>;
  requestFootprintClock: (command: Readonly<{ method: "Debugger.resume"; params: Readonly<Record<string, never>>; sessionId: string }>) => Promise<unknown>;
  beginFootprintClockRpc: (dependency: StartupDependency, reservation: CurrentFootprintCopyClockRpcChannelReservation) => Promise<CurrentFootprintCopyClockRpcChannelRoute>;
  status: () => Readonly<{ nextRequestId: number; pendingReplies: number; failed: boolean }>;
  releaseAfterTermination: () => Promise<void>;
  retainedFootprintClockRpc: () => Readonly<Record<string, unknown>>;
}
interface SyntheticNative {
  readonly parent: Readonly<{ targetId: string; sessionId: string; nextRequestId: number }>;
  readonly sent: Record<string, unknown>[];
  readonly frames: unknown[];
  readonly structural: string[];
  exited: boolean;
  lostBegin: boolean;
  lostReply: boolean;
  lostRetire: boolean;
}
function own(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test collaborator reads only a freshly validated ordinary protocol object.
  return value as Record<string, unknown>;
}
async function fixture(nextRequestId = 100, partial = false): Promise<Readonly<{
  channel: SyntheticChannel; dependency: StartupDependency; state: SyntheticNative;
}>> {
  const url = new URL("../src/current-pcb-worker-startup-channel.ts", import.meta.url);
  const initial = await readFile(url, "utf8");
  const seed = `public seedRpcPrerequisitesForTest(partial: boolean): void {
    this.#openingConsumed=true;this.#footprintUiStarted=true;this.#footprintClockRegistrationStarted=true;
    this.#executionWorkerSession="worker";this.#workers.set("worker","worker-target");this.#used=partial?1:0;
  }\n  public status():`;
  const source = initial.replace("public status():", seed); assert.notEqual(source, initial);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]);
  const candidate = loaded.exports["CurrentFootprintCombinedStartupChannel"]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The test-only VM class contains the real channel plus the explicit synthetic prerequisite seed above.
  const Constructor = candidate as new (native: object) => SyntheticChannel;
  const state: SyntheticNative = { parent: Object.freeze({ targetId: "parent-target", sessionId: "ui", nextRequestId }),
    sent: [], frames: [], structural: [], exited: false, lostBegin: false, lostReply: false, lostRetire: false };
  const native = Object.freeze({ requireOriginalParent: (): Promise<typeof state.parent> => Promise.resolve(state.parent),
    assertOriginalTermination: (): Promise<void> => state.exited ? Promise.resolve() : Promise.reject(new Error("synthetic original generation remains live")),
    observeOriginalParentEvent: (event: unknown): void => { state.structural.push(String(own(event)["method"])); },
    exchange: (request: unknown): Promise<unknown> => {
      const value = own(request); state.sent.push(value);
      if (value["action"] === "footprint-clock-rpc-begin") {
        if (state.lostBegin) { return Promise.reject(new Error("synthetic lost begin acknowledgement")); }
        return Promise.resolve({ begun: true });
      }
      if (value["action"] === "footprint-clock-rpc-retire") {
        if (state.lostRetire) { return Promise.reject(new Error("synthetic lost native retirement acknowledgement")); }
        return Promise.resolve({ retired: true });
      }
      if (value["action"] === "footprint-clock-rpc-send") {
        if (!state.lostReply) {
          state.frames.push({ id: value["requestId"], sessionId: value["realm"] === "worker" ? "worker" : "ui", result: {} });
        }
        return Promise.resolve({ written: true });
      }
      assert.equal(value["action"], "poll");
      const data = state.frames.splice(0).map(frame => `${JSON.stringify(frame)}\0`).join("");
      return Promise.resolve({ bytes: Buffer.from(data).toString("base64") });
    },
  });
  const channel = new Constructor(native); const dependency = await channel.start();
  dependency.subscribe(() => { throw new Error("paired debugger event reached old worker listener"); });
  channel.seedRpcPrerequisitesForTest(partial); return { channel, dependency, state };
}
function command(cleanup: boolean, sessionId = "worker"): CurrentFootprintCopyClockRpcCommand {
  return cleanup ? { phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } } :
    { phase: "rpc-properties", method: "Runtime.getProperties", sessionId, params: { objectId: "retained", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
async function finish(f: Awaited<ReturnType<typeof fixture>>): Promise<void> { f.state.exited = true; await f.channel.releaseAfterTermination(); }

void test("paired RPC unit retains the real allocator and original framing without enlarging its normal-ID ceiling", async () => {
  const f = await fixture(736);
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    await assert.rejects(f.dependency.request({ method: "Debugger.resume", sessionId: "worker", params: {} }), /EXCLUSIVE/u);
    const route = await f.channel.beginFootprintClockRpc(f.dependency, reservation);
    for (let index = 0; index < 67; index += 1) {
      const cleanup = index >= 49; await route.request(command(cleanup, index % 2 === 0 ? "worker" : "ui"), cleanup);
    }
    await route.retire(); assert.equal(f.channel.status().nextRequestId, 803);
    const sends = f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-send");
    assert.deepEqual(sends.map(value => value["requestId"]), Array.from({ length: 67 }, (_, index) => 736 + index));
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-begin").length, 1);
    await assert.rejects(route.request(command(false), false), /ORIGINAL/u);
    await assert.rejects(f.channel.requestFootprintClock({ method: "Debugger.resume", params: {}, sessionId: "worker" }), /CLOCK_PURPOSE/u);
    await assert.rejects(f.channel.prepareFootprintClockRpc(f.dependency, "worker"), /PURPOSE/u);
  } finally { await finish(f); }
});
void test("both original realm debugger events use one cursor while structural parent events retain the old guard", async () => {
  const f = await fixture();
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    const route = await f.channel.beginFootprintClockRpc(f.dependency, reservation);
    f.state.frames.push({ method: "Debugger.paused", sessionId: "ui", params: { reason: "other" } },
      { method: "Debugger.resumed", sessionId: "worker", params: {} },
      { method: "Debugger.scriptParsed", sessionId: "ui", params: {} });
    await route.request(command(false), false);
    assert.equal(route.takeEvent()?.sessionId, "ui"); assert.equal(route.takeEvent()?.sessionId, "worker"); assert.equal(route.takeEvent(), null);
    assert.deepEqual(f.state.structural, ["Debugger.scriptParsed"]);
  } finally { await finish(f); }
});
void test("lost begin acknowledgement cannot allocate a replacement phase or regain the old route", async () => {
  const f = await fixture(); f.state.lostBegin = true;
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    await assert.rejects(f.channel.beginFootprintClockRpc(f.dependency, reservation), /lost begin/u);
    await assert.rejects(f.channel.beginFootprintClockRpc(f.dependency, reservation), /RESERVATION/u);
    await assert.rejects(f.dependency.request({ method: "Debugger.resume", sessionId: "worker", params: {} }), /EXCLUSIVE/u);
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-begin").length, 1);
    await assert.rejects(f.channel.releaseAfterTermination(), /remains live/u);
  } finally { await finish(f); }
});
void test("a lost allocation reply remains retained until actual original-generation proof rejects its wait", async () => {
  const f = await fixture(); f.state.lostReply = true;
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    const route = await f.channel.beginFootprintClockRpc(f.dependency, reservation);
    let settled = false;
    const site = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES.push;
    const allocation: CurrentFootprintCopyClockRpcCommand = { phase: "rpc-arm", role: "push", method: "Debugger.setBreakpoint", sessionId: "worker",
      params: { location: { scriptId: "worker-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
        condition: currentFootprintCopyClockRpcCondition("push", "11111111-1111-1111-1111-111111111111") } };
    const request = (async (): Promise<unknown> => {
      try { await route.request(allocation, false); settled = true; return null; }
      catch (error) { settled = true; return error; }
    })();
    await route.pump(false); await route.assertOriginal();
    assert.equal(f.channel.status().pendingReplies, 1);
    await assert.rejects(route.assertOriginalGenerationExited(), /remains live/u); assert.equal(settled, false);
    f.state.exited = true; await route.assertOriginalGenerationExited();
    const failure = await request; assert.ok(failure instanceof Error); assert.match(failure.message, /TERMINATED/u);
    assert.equal(f.channel.status().pendingReplies, 0); assert.equal(f.channel.status().nextRequestId, 101);
    await route.retire(); await assert.rejects(route.request(command(false), false));
  } finally { await finish(f); }
});
for (const partial of [false, true]) {
  void test(`handoff refuses ${partial ? "an incomplete frame" : "insufficient unchanged ID headroom"} before native begin`, async () => {
    const f = await fixture(partial ? 100 : 737, partial);
    try {
      await assert.rejects(f.channel.prepareFootprintClockRpc(f.dependency, "worker"));
      assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-begin").length, 0);
    } finally { await finish(f); }
  });
}

void test("lost retirement acknowledgement settles after actual exit without repeating the consumed native control", async () => {
  const f = await fixture();
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    const route = await f.channel.beginFootprintClockRpc(f.dependency, reservation);
    for (let index = 0; index < 67; index += 1) { await route.request(command(index >= 49), index >= 49); }
    f.state.lostRetire = true;
    await assert.rejects(route.retire(), /lost native retirement/u);
    await assert.rejects(route.retire(), /RETAIN_RETIRE_UNKNOWN/u);
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-retire").length, 1);
    f.state.exited = true; await route.assertOriginalGenerationExited(); await route.retire();
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-retire").length, 1);
    assert.equal(f.channel.retainedFootprintClockRpc()["retired"], true);
    assert.equal(f.channel.retainedFootprintClockRpc()["nativeRetirementAcknowledged"], false);
    await assert.rejects(route.request(command(false), false));
  } finally { await finish(f); }
});
void test("semantic failure poisons shared retirement authority after every command received a reply", async () => {
  const f = await fixture();
  try {
    const reservation = await f.channel.prepareFootprintClockRpc(f.dependency, "worker");
    const route = await f.channel.beginFootprintClockRpc(f.dependency, reservation);
    for (let index = 0; index < 67; index += 1) { await route.request(command(index >= 49), index >= 49); }
    route.fail(); route.fail(); await assert.rejects(route.retire());
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-retire").length, 0);
    await assert.rejects(route.assertOriginalGenerationExited(), /remains live/u);
    f.state.exited = true; await route.assertOriginalGenerationExited(); route.fail(); await route.retire();
    assert.equal(f.state.sent.filter(value => value["action"] === "footprint-clock-rpc-retire").length, 1);
  } finally { await finish(f); }
});
