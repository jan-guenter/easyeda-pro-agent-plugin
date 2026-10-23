import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { sha256Json } from "../src/core.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS, CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT,
  CURRENT_PCB_WORKER_STARTUP_CHANNEL_RELATION, currentPcbWorkerStartupChannelPacketSchema } from "../src/current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupChannelObservationCommand,
  CurrentPcbWorkerStartupChannelObservationTransport } from "../src/current-pcb-worker-startup-channel-observation.ts";
import { CurrentPcbWorkerStartupChannelObservationRunner } from "../src/current-pcb-worker-startup-channel-observation-runner.ts";
import { decodeCurrentPcbStringWorkerProject } from "../src/current-pcb-string-worker-gate-scope.ts";
import { createCurrentPcbStringWorkerProducerResponder } from "./helpers/current-pcb-string-worker-producer-responder.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window_1" });
const RELATION_REPLY = Object.freeze({ result: Object.freeze({ type: "boolean", value: true }) });
const SETUP = `globalThis.traps=0;globalThis.originalOnmessage=s=>s;
class Channel{get onmessage(){return originalOnmessage}}
globalThis.originalChannel=new Channel;globalThis.originalBus={bc:originalChannel};
globalThis.originalProject={workerBus:originalBus};globalThis.PROJECT=originalProject;`;
const EXPRESSION = `(${CURRENT_PCB_WORKER_STARTUP_CHANNEL_RELATION}).call(originalProject,originalBus,originalChannel,originalOnmessage)`;
function fixture(change?: (reply: unknown, command: CurrentPcbWorkerStartupChannelObservationCommand, index: number) => unknown): Readonly<{
  runner: CurrentPcbWorkerStartupChannelObservationRunner; transport: CurrentPcbWorkerStartupChannelObservationTransport;
  calls: CurrentPcbWorkerStartupChannelObservationCommand[]; expire: () => void; revive: () => void; close: () => void;
}> {
  const calls: CurrentPcbWorkerStartupChannelObservationCommand[] = [], responder = createCurrentPcbStringWorkerProducerResponder(IDENTITY);
  const project = decodeCurrentPcbStringWorkerProject(responder.reply({ workerProducerPhase: "project", method: "Runtime.evaluate" }));
  let current = true;
  const request = async (command: CurrentPcbWorkerStartupChannelObservationCommand): Promise<unknown> => {
    calls.push(command); await Promise.resolve();
    let reply: unknown;
    if (command.phase === "channel-relation") { reply = RELATION_REPLY; }
    else if (command.phase === "properties") { reply = responder.reply({ workerProducerPhase: "properties", method: "Runtime.getProperties", objectId: command.objectId }); }
    else if (command.phase === "gate-select") { reply = responder.reply({ workerProducerPhase: "gate-select", method: "Runtime.callFunctionOn", objectId: project }); }
    else { reply = responder.reply({ workerProducerPhase: "gates", method: "Runtime.callFunctionOn", objectId: project,
      workerArgument0: command.bundle, workerArgument1: command.scope }); }
    return change === undefined ? reply : change(reply, command, calls.length);
  };
  const transport = { scriptId: "worker-script-1", request,
    assertCurrent: async (): Promise<void> => { await Promise.resolve(); assert.ok(current, "original owner lost"); } };
  return { runner: new CurrentPcbWorkerStartupChannelObservationRunner(transport, IDENTITY), transport, calls,
    expire: (): void => { current = false; }, revive: (): void => { current = true; }, close: responder.close };
}
function changeGate(reply: unknown, patch: (value: Record<string, unknown>) => void): unknown {
  const outer = z.object({ result: z.object({ type: z.literal("string"), value: z.string() }) }).parse(reply);
  const value = z.record(z.string(), z.unknown()).parse(JSON.parse(outer.result.value)); patch(value);
  return { result: { type: "string", value: JSON.stringify(value) } };
}

void test("fixed channel relation preserves original identities and supports an inherited onmessage accessor", () => {
  for (const change of ["", "PROJECT={...originalProject}", "originalProject.workerBus={...originalBus}",
    "originalBus.bc=new Channel", "Object.defineProperty(originalChannel,'onmessage',{value:()=>0})"]) {
    const context = createContext({}); runInContext(SETUP + change, context);
    if (change === "") { assert.equal(runInContext(EXPRESSION, context) as unknown, true); }
    else { assert.throws(() => runInContext(EXPRESSION, context), /PCB_STRING_OBSERVATION_STATE/u); }
  }
});

void test("channel relation executes under V8 side-effect checking and does not invoke a substituted proxy trap", async () => {
  const session = new Session(); session.connect(); let contextId = 0;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "startup-channel-synthetic") { contextId = params.context.id; }
  });
  try {
    await session.post("Runtime.enable"); const context = createContext({}, { name: "startup-channel-synthetic" });
    runInContext(SETUP, context); assert.ok(contextId > 0);
    const parameters = { expression: EXPRESSION, contextId, silent: true, returnByValue: true, throwOnSideEffect: true };
    const reply = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    const observed = z.object({ result: z.object({ value: z.boolean() }) }).parse(reply);
    assert.equal(observed.result.value, true);
    runInContext("globalThis.originalChannel=new Proxy(originalChannel,{get(o,k){traps++;return Reflect.get(o,k)}});originalBus.bc=originalChannel;", context);
    const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    assert.ok(z.object({ exceptionDetails: z.unknown() }).parse(refused).exceptionDetails !== undefined);
    assert.equal(runInContext("traps", context) as unknown, 0);
  } finally { session.disconnect(); }
});

void test("channel collector qualifies real synthetic V8 gate metadata in exactly eighteen reads", async () => {
  const f = fixture();
  try {
    const packet = await f.runner.observe(); assert.equal(f.calls.length, CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT);
    assert.deepEqual(f.calls.map(call => call.phase), ["channel-relation", "gate-select", ...Array.from({ length: 9 }, () => "properties"),
      "properties", "properties", "gates", "properties", "properties", "gates", "channel-relation"]);
    assert.equal(await f.runner.requireOriginal(packet), packet); assert.ok(currentPcbWorkerStartupChannelPacketSchema.safeParse(packet).success);
    assert.deepEqual(packet.identity, IDENTITY); assert.equal(packet.originalConstructorChannelRelationsObserved, true);
    for (const key of Object.keys(CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS)) {
      assert.equal(Object.getOwnPropertyDescriptor(packet, key)?.value as unknown, false, key);
    }
    await assert.rejects(f.runner.requireOriginal(structuredClone(packet)), /original completed packet/u);
    await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, 18);
    f.expire(); await assert.rejects(f.runner.requireOriginal(packet), /original owner lost/u); f.revive();
    await assert.rejects(f.runner.requireOriginal(packet), /original completed packet/u);
  } finally { f.close(); }
});

void test("channel collector refuses a changed channel without selecting publisher metadata", async () => {
  const f = fixture((reply, command) => command.phase === "channel-relation" ? { result: { type: "boolean", value: false } } : reply);
  try { await assert.rejects(f.runner.observe()); assert.equal(f.calls.length, 1); assert.equal(f.runner.status().phase, "failed"); }
  finally { f.close(); }
});

void test("channel collector retains malformed and post-arrival-loss gate text without replay", async () => {
  for (const kind of ["malformed", "owner-lost"] as const) {
    const f = fixture((reply, command) => {
      if (command.phase !== "gates") { return reply; }
      if (kind === "owner-lost") { f.expire(); return reply; }
      return { result: { type: "string", value: "{invalid}" } };
    });
    try {
      await assert.rejects(f.runner.observe()); assert.equal(f.runner.retainedGateReplies().length, 1);
      assert.equal(f.calls.at(-1)?.phase, "gates"); const previous = f.calls.length;
      f.revive(); await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, previous);
    } finally { f.close(); }
  }
});

void test("channel collector rejects foreign identity, changed paired gates and replaced transport", async () => {
  for (const mutation of ["identity", "paired"] as const) {
    let samples = 0;
    const f = fixture((reply, command) => {
      if (command.phase !== "gates") { return reply; } samples += 1;
      return changeGate(reply, value => {
        if (mutation === "identity") { value["identity"] = { ...IDENTITY, branchUuid: "c".repeat(32) }; }
        else if (samples === 2) {
          const publisher = z.record(z.string(), z.unknown()).parse(value["publisher"]);
          value["publisher"] = { ...publisher, senderUuid: "23456789-1234-4234-8234-123456789abc" };
        }
      });
    });
    try { await assert.rejects(f.runner.observe(), /sample identity differs|paired gate samples differ/u); }
    finally { f.close(); }
  }
  const f = fixture(); let redirected = false;
  try {
    Object.defineProperty(f.transport, "request", { value: (): Promise<unknown> => { redirected = true; return Promise.resolve(RELATION_REPLY); } });
    await assert.rejects(f.runner.observe(), /original transport changed/u); assert.equal(redirected, false); assert.equal(f.calls.length, 0);
  } finally { f.close(); }
});

void test("channel journal packet independently rejects changed identity, claims, raw gates and digest", async () => {
  const f = fixture();
  try {
    const packet = await f.runner.observe();
    const { packetSha256: _digest, ...body } = packet;
    for (const change of [
      { identity: { ...IDENTITY, projectUuid: "c".repeat(64) } }, { nativeChannelIntrinsicAndPeerOwnershipVerified: true },
      { publisherSenderUuid: "23456789-1234-4234-8234-123456789abc" }, { gateReplies: [packet.gateReplies[0], "{}"] },
      { requestCount: 17 }, { qualifiedMethodKinds: packet.qualifiedMethodKinds.toReversed() },
    ]) {
      const altered = { ...body, ...change };
      assert.equal(currentPcbWorkerStartupChannelPacketSchema.safeParse({ ...altered, packetSha256: sha256Json(altered) }).success, false);
    }
    assert.equal(currentPcbWorkerStartupChannelPacketSchema.safeParse({ ...packet, packetSha256: "f".repeat(64) }).success, false);
  } finally { f.close(); }
});
