/* oxlint-disable import/max-dependencies -- This focused boundary regression joins the separate fixed wire, real channel allocator and legacy refusal checks. */
/** Synthetic fixed wire/CDP frames only. These checks establish no connected
 * cache metadata, genuine namespace absence, native owner or replay authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentFootprintCopyHeldSavedStartupChannel, CurrentFootprintCopySavedChannel,
  isOriginalFootprintHeldSavedDependency, isOriginalFootprintSavedDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE as PROFILE } from "../src/current-footprint-copy-held-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE as LEGACY } from "../src/current-footprint-copy-saved-profile.ts";
import { currentFootprintCopyHeldSavedSourceWire } from "../src/current-footprint-copy-held-saved-source-wire.ts";
import { currentFootprintCopySavedSourceWire } from "../src/current-footprint-copy-saved-source-wire.ts";
import { currentFootprintCopySavedSourceCommand } from "../src/current-footprint-copy-saved-source-command.ts";
import { currentFootprintCopySavedQueueCommand } from "../src/current-footprint-copy-saved-queue.ts";
import { currentFootprintCopyHeldSavedStartupWire, currentFootprintCopySavedStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { currentFootprintSavedCacheHeldNativeCases } from "../src/current-footprint-saved-cache-held-native.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "../src/current-footprint-saved-cache-held-protocol.ts";

type Request = Readonly<Record<string, string | number>>;
/** Supply only synthetic original callbacks and framed replies to the real
 * channel. Its actual counter, pending writes and cleanup paths remain in use. */
async function fixture(context: TestContext, nextRequestId = 17): Promise<Readonly<{
  channel: CurrentFootprintCopyHeldSavedStartupChannel;
  dependency: Awaited<ReturnType<CurrentFootprintCopyHeldSavedStartupChannel["start"]>>;
  commands: readonly CurrentFootprintSavedCacheHeldCommand[];
  requests: Request[];
  state: { errorPhase: string | null };
}>> {
  const commands = currentFootprintSavedCacheHeldNativeCases();
  const capture = commands[0];
  assert.ok(capture?.heldCachePhase === "capture");
  const project = commands.find(command => command.heldCachePhase === "queue-first");
  assert.ok(project?.heldCachePhase === "queue-first");
  const binding = { sessionId: capture.sessionId, uniqueContextId: capture.params.uniqueContextId,
    projectUuid: project.params.arguments[0].value, branchUuid: project.params.arguments[1].value };
  const parent = Object.freeze({ targetId: "synthetic-parent", sessionId: binding.sessionId, nextRequestId });
  const chunks: Buffer[] = [], requests: Request[] = [], state: { errorPhase: string | null } = { errorPhase: null };
  let exited = false;
  const channel = new CurrentFootprintCopyHeldSavedStartupChannel({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(exited); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => undefined,
    exchange: (request: Request): Promise<unknown> => {
      if (request["action"] === "poll") { return Promise.resolve({ bytes: (chunks.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      requests.push(request);
      const response = { id: request["requestId"], ...(request["sessionId"] === undefined ? {} : { sessionId: request["sessionId"] }),
        ...(request["phase"] === state.errorPhase ? { error: { code: -1, message: "synthetic remote refusal" } } : { result: {} }) };
      chunks.push(Buffer.from(`${JSON.stringify(response)}\0`)); return Promise.resolve({ written: true });
    },
  }, binding, (): void => undefined);
  const dependency = await channel.start(); dependency.subscribe((): void => undefined);
  context.after(async () => { exited = true; await channel.releaseAfterTermination(); });
  return { channel, dependency, commands, requests, state };
}

void test("held-saved source uses its own363 ID grammar while legacy353 bytes and refusals remain exact", () => {
  assert.equal(PROFILE.normalRequestLimit, 328); assert.equal(PROFILE.cleanupRequestLimit, 35);
  assert.equal(PROFILE.requestLimit, 363); assert.equal(PROFILE.normalIdCeiling, PROFILE.requestLimit);
  assert.equal(LEGACY.normalRequestLimit, 319); assert.equal(LEGACY.requestLimit, 353);
  const bindings = { manager: "manager", project: "project", bus: "bus", consistency: "consistency", constructors: "constructors", methods: "methods" };
  const selected = { identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab" },
    footprintUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 1 };
  const source = { ...currentFootprintCopySavedSourceCommand(bindings, selected), sessionId: "worker-session" };
  for (const id of [1, LEGACY.requestLimit]) {
    assert.deepEqual(currentFootprintCopyHeldSavedSourceWire(source, id), currentFootprintCopySavedSourceWire(source, id));
  }
  assert.equal(currentFootprintCopyHeldSavedStartupWire(source, PROFILE.requestLimit).request["requestId"], PROFILE.requestLimit);
  assert.throws(() => currentFootprintCopySavedStartupWire(source, PROFILE.requestLimit));
  assert.throws(() => currentFootprintCopySavedSourceWire(source, PROFILE.requestLimit));
  assert.throws(() => currentFootprintCopyHeldSavedStartupWire(source, PROFILE.requestLimit + 1));
  for (const command of currentFootprintSavedCacheHeldNativeCases()) {
    assert.throws(() => currentFootprintCopySavedStartupWire(command, 1));
    assert.throws(() => currentFootprintCopyHeldSavedStartupWire(command, 1));
  }
});

void test("held-saved global IDs allow cleanup before the last normal class slot", async context => {
  const value = await fixture(context, 317);
  assert.equal(isOriginalFootprintHeldSavedDependency(value.dependency), true);
  assert.equal(isOriginalFootprintSavedDependency(value.dependency), false);
  for (const command of value.commands) { await value.channel.requestFootprintHeldSavedCache(command); }
  assert.equal(value.channel.status().heldSaved?.normalRequests, 327);
  assert.equal(value.channel.status().heldSaved?.cleanupRequests, 1);
  await value.dependency.request({ method: "Target.getTargets", params: {} });
  assert.equal(value.requests.at(-1)?.["requestId"], 329);
  assert.equal(value.channel.status().heldSaved?.normalRequests, PROFILE.normalRequestLimit);
  assert.equal(value.channel.status().heldSaved?.released, true);
  const before = value.requests.length;
  await assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }), /HELD_SAVED_REQUEST_CLASS/u);
  assert.equal(value.requests.length, before);
});

void test("held-saved channel refuses context, tuple, target and legacy queue substitutions before sending", async context => {
  const value = await fixture(context);
  const capture = value.commands[0]; assert.ok(capture?.heldCachePhase === "capture");
  await assert.rejects(value.channel.requestFootprintHeldSavedCache({ ...capture, params: { ...capture.params, uniqueContextId: "foreign" } }), /HELD_CACHE_CONTEXT/u);
  for (const command of value.commands.slice(0, 5)) { await value.channel.requestFootprintHeldSavedCache(command); }
  const recheck = value.commands[5]; assert.ok(recheck?.heldCachePhase === "recheck-before-getter");
  await assert.rejects(value.channel.requestFootprintHeldSavedCache({ ...recheck, params: { ...recheck.params, objectId: "foreign-tuple" } }), /HELD_CACHE_TUPLE/u);
  for (const command of value.commands.slice(5, 7)) { await value.channel.requestFootprintHeldSavedCache(command); }
  const queue = value.commands[7]; assert.ok(queue?.heldCachePhase === "queue-first");
  await assert.rejects(value.channel.requestFootprintHeldSavedCache({ ...queue, params: { ...queue.params,
    arguments: [{ value: "f".repeat(64) }, queue.params.arguments[1]] } }), /HELD_CACHE_TARGET/u);
  const before = value.requests.length;
  await assert.rejects(value.channel.requestFootprintSavedUploadQueue(currentFootprintCopySavedQueueCommand({ sessionId: capture.sessionId,
    uniqueContextId: capture.params.uniqueContextId, projectUuid: queue.params.arguments[0].value, branchUuid: queue.params.arguments[1].value })), /PURPOSE/u);
  assert.equal(value.requests.length, before);
});

void test("a failed held observation consumes its phase but preserves one original cleanup release", async context => {
  const value = await fixture(context);
  for (const command of value.commands.slice(0, 7)) { await value.channel.requestFootprintHeldSavedCache(command); }
  const first = value.commands[7], release = value.commands.at(-1); assert.ok(first !== undefined && release?.heldCachePhase === "release");
  value.state.errorPhase = "queue-first";
  await assert.rejects(value.channel.requestFootprintHeldSavedCache(first), /REMOTE/u);
  const failed = value.requests.length;
  await assert.rejects(value.channel.requestFootprintHeldSavedCache(first)); assert.equal(value.requests.length, failed);
  await value.channel.requestFootprintHeldSavedCache(release);
  assert.equal(value.channel.status().heldSaved?.released, true); assert.equal(value.channel.status().heldSaved?.cleanupRequests, 1);
  await assert.rejects(value.channel.requestFootprintHeldSavedCache(release), /HELD_CACHE_SEQUENCE/u);
  assert.equal(value.requests.length, failed + 1);
  const legacy = new CurrentFootprintCopySavedChannel({ requireOriginalParent: (): Promise<never> => Promise.reject(new Error("unused")),
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), observeOriginalParentEvent: (): void => undefined,
    exchange: (): Promise<never> => Promise.reject(new Error("unused")) });
  await assert.rejects(legacy.requestFootprintHeldSavedCache(release), /PURPOSE/u);
});
