/** Exact native request projection over synthetic completed SQL. The paired
 * issuer is explicitly synthetic here; this does not run an EasyEDA writer. */
/* oxlint-disable import/max-dependencies -- Exercise actual source preparation, wire reservation and the binder while substituting only the private native observation issuer. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { assertCurrentFootprintCopyMainRequestPlanWire, bindCurrentFootprintCopyMainRequestPlan,
  isCurrentFootprintCopyMainRequestReservation, requireCurrentFootprintCopyMainRequestReservation,
  reserveCurrentFootprintCopyMainRequestPlan } from "../src/current-footprint-copy-main-request-plan.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcObservation } from "../src/current-footprint-copy-clock-rpc-runner.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { verifyCurrentFootprintCopyV2Append } from "../src/current-footprint-copy-v2-append.ts";
import type { CurrentFootprintCopyMainRequestRunner } from "../src/current-footprint-copy-main-request-runner.ts";
import { requestCollectorFixture, syntheticRequestSource } from "./helpers/footprint-main-request-collector-fixture.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), CLOCK = 1_700_000_000_123, PROJECT = "1".repeat(64), TARGET = "e".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const real = Object.freeze({ assertCurrentFootprintCopyMainRequestPlanWire, bindCurrentFootprintCopyMainRequestPlan,
  isCurrentFootprintCopyMainRequestReservation, requireCurrentFootprintCopyMainRequestReservation, reserveCurrentFootprintCopyMainRequestPlan });
const CONTEXT = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, projectKey: PROJECT, path: "inert-request-path" });
const WINDOW = Object.freeze({ minimum: CLOCK - 10, maximum: CLOCK + 10 });
const META = { title: "Source", description: "Keep \"Ω\"\n\\", tags: ["raw"], source: "original" };
const PAD = '{"number":"1", "unknown":[true, null]}';
function row(type: string, ticket: number, id: string, body: string): string { return `${JSON.stringify({ type, ticket, id })}||${body}`; }
function head(ticket: number, time: number, uuid = IDS.target, user = true): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.209", ...(user ? { user: ACTOR } : {}) })}`;
}
async function copyPlan(large = false): Promise<Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>> {
  const created = await fixture({ project: PROJECT, branch: IDS.branch, target: IDS.target });
  const pad = large ? JSON.stringify({ number: "1", future: "\u0001".repeat(6000) }) : PAD;
  const rows = [row("PAD", 20, "pad", pad), row("LINE", 30, "deleted", "")];
  const raw = ['{"type":"EDIT_HEAD"}||{}', head(100, 300), row("META", 3, "META", JSON.stringify(META)), ...rows].join("|\n");
  mutate(created.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(created.path);
  const source = await prepareCurrentFootprintSourcePlan(before, { projectUuid: PROJECT, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const content = [head(101, 300), row("META", 30, "META", JSON.stringify(META)), head(100, 300), ...rows].join("|\n");
  return prepareCurrentFootprintCopyV2Plan(before, source, { client: CLIENT, content });
}
function packet(times: readonly [number, number] = [CLOCK, CLOCK + 1], target = TARGET): CurrentFootprintCopyClockRpcObservation {
  return Object.freeze({ profile: "private.current-footprint-clock-rpc-observation.v1",
    samples: Object.freeze([{ ordinal: 1, producer: "buildString", documentUuid: target, updateTime: times[0], lexicalOffset: 1, replyTopicSha256: "a".repeat(64) },
      { ordinal: 2, producer: "canvasString", documentUuid: target, updateTime: times[1], lexicalOffset: 2, replyTopicSha256: "b".repeat(64) }] as const),
    distinctOriginalRequestsAndPendingTasksObserved: true, originalShiftAndSelectedServiceTaskJoined: true,
    originalCallbackResultAndPostAwaitValueMatched: true, allTenResumesObserved: true, allAllocatedBreakpointsRemoved: true,
    temporaryGroupsReleased: false, nativeBroadcastSenderHandleAuthenticated: false, backendClockOrSqlCompletionVerified: false,
    nativeCreateCompletionVerified: false, executionAuthorized: false });
}
const ORIGIN: CurrentFootprintCopyClockRpcOrigin = Object.freeze({ profile: "private.current-footprint-clock-rpc-origin.v1" });
async function model(proof?: () => Promise<void>): Promise<typeof real> {
  const loaded = { exports: {} }, path = new URL("../src/current-footprint-copy-main-request-plan.ts", import.meta.url);
  const originalRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-footprint-copy-clock-rpc-runner.ts" ? {
    requireCurrentFootprintCopyClockRpcObservation: async (_packet: unknown, origin: unknown): Promise<void> => { assert.equal(origin, ORIGIN); await proof?.(); },
  } : originalRequire(name) as unknown, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Evaluate the exact production binder with one explicit synthetic observation issuer, never a genuine origin.
  return loaded.exports as typeof real;
}
async function collector(f: ReturnType<typeof requestCollectorFixture>, projection: typeof real): Promise<typeof CurrentFootprintCopyMainRequestRunner> {
  const loaded = { exports: {} }, path = new URL("../src/current-footprint-copy-main-request-runner.ts", import.meta.url);
  const originalRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-main-request-origin.ts") { return {
      requireCurrentFootprintCopyMainRequestOrigin: f.require,
      requireCurrentFootprintCopyMainRequestClockOrigin: (main: unknown, clock: unknown): void => { assert.equal(main, f.token); assert.equal(clock, ORIGIN); },
    }; }
    if (name === "./current-footprint-copy-main-request-source.ts") { return {
      requireCurrentFootprintCopyMainRequestSource: (source: unknown): void => { assert.equal(source, syntheticRequestSource); },
    }; }
    return name === "./current-footprint-copy-main-request-plan.ts" ? projection : originalRequire(name) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Evaluate the actual collector with explicit synthetic original native/source issuers and the actual projection module above.
  const module = loaded.exports as { CurrentFootprintCopyMainRequestRunner: typeof CurrentFootprintCopyMainRequestRunner };
  return module.CurrentFootprintCopyMainRequestRunner;
}
void test("late body uses both clocks, exact raw order and omitted worker user without a backend edit header", async () => {
  const copy = await copyPlan(), module = await model();
  const reservation = module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
  assert.equal(reservation.nativeAllocationQualified, false); assert.equal(reservation.executionAuthorized, false);
  const maximum = module.requireCurrentFootprintCopyMainRequestReservation(reservation);
  const plan = await module.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet());
  const expected = [head(101, CLOCK, TARGET, false), row("META", 101, "META", JSON.stringify({ ...META, title: "Source_1", source: "" })),
    head(102, CLOCK + 1, TARGET, false), row("META", 30, "META", JSON.stringify(META)), row("PAD", 20, "pad", PAD), row("LINE", 30, "deleted", "")].join("|\n");
  assert.equal(plan.dataStr, expected); assert.equal(plan.dataStr.includes('"user"'), false); assert.equal(plan.dataStr.includes("EDIT_HEAD"), false);
  assert.equal(Buffer.byteLength(plan.dataStr) <= reservation.maximumDataStrBytes, true);
  assert.equal(plan.dataStr.length <= maximum.dataStr.length, true);
  verifyCurrentFootprintCopyV2Append(copy, TARGET, `{"type":"EDIT_HEAD"}||{}|\n${plan.dataStr}`);
  module.assertCurrentFootprintCopyMainRequestPlanWire(plan);
  await assert.rejects(module.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet()), /ORIGINAL_RESERVATION/u);
});
void test("real issuer refuses synthetic packets and the consumed reservation cannot be rebound", async () => {
  const copy = await copyPlan(), reservation = real.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
  await assert.rejects(real.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet()), /ORIGINAL_PACKET/u);
  await assert.rejects(real.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet()), /ORIGINAL_RESERVATION/u);
  assert.throws(() => real.reserveCurrentFootprintCopyMainRequestPlan(structuredClone(copy), CONTEXT, WINDOW), /original/u);
  assert.equal(real.isCurrentFootprintCopyMainRequestReservation(structuredClone(reservation)), false);
});
void test("late binding consumes before the first original issuer await and rechecks after it", async () => {
  const entered = Promise.withResolvers<null>(), pending = Promise.withResolvers<null>(); let checks = 0;
  const module = await model(async () => { checks += 1; if (checks === 1) { entered.resolve(null); await pending.promise; } });
  const copy = await copyPlan(), reservation = module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
  const binding = module.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet()); await entered.promise;
  await assert.rejects(module.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet()), /ORIGINAL_RESERVATION/u);
  pending.resolve(null); await binding; assert.equal(checks, 2);
});
void test("clock windows, native UUID freshness, copies and escaped output refuse before controller work", async () => {
  const copy = await copyPlan(), module = await model();
  for (const [times, target] of [[[CLOCK + 1, CLOCK], TARGET], [[CLOCK - 11, CLOCK], TARGET], [[CLOCK, CLOCK + 11], TARGET],
    [[CLOCK, CLOCK], IDS.target.slice(0, 16)]] as const) {
    const reservation = module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
    await assert.rejects(module.bindCurrentFootprintCopyMainRequestPlan(reservation, ORIGIN, packet(times, target)));
  }
  assert.throws(() => module.reserveCurrentFootprintCopyMainRequestPlan(copy, { ...CONTEXT, branchUuid: "f".repeat(32) }, WINDOW), /COPY_IDENTITY/u);
  for (const window of [{ minimum: 0, maximum: CLOCK }, { minimum: CLOCK, maximum: CLOCK + 60_001 }, { minimum: CLOCK + 1, maximum: CLOCK }]) {
    assert.throws(() => module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, window));
  }
  const large = await copyPlan(true); assert.throws(() => module.reserveCurrentFootprintCopyMainRequestPlan(large, CONTEXT, WINDOW));
});

void test("actual main collector arms before clocks but refuses collection until one original late binding", async () => {
  const copy = await copyPlan(), f = requestCollectorFixture(), module = await model();
  const Constructor = await collector(f, module), reservation = module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
  const runner = new Constructor(f.token, reservation); await runner.armForCompletion(); runner.consumeBeforeInvocation();
  assert.equal(f.commands.length, 4); await assert.rejects(runner.collectToHeldFinalPb(), /LATE_PLAN_REQUIRED/u);
  assert.equal(f.commands.length, 4); await runner.bindObservedClocks(ORIGIN, packet());
  await assert.rejects(runner.bindObservedClocks(ORIGIN, packet()), /LATE_PLAN_CONSUMED/u);
  assert.equal(f.commands.length, 4); f.state.invoked = true;
  const held = await runner.collectToHeldFinalPb(); const bindings = runner.heldFinalPbBindings(held);
  const controller = f.commands.find(command => command.phase === "request-controller");
  assert.ok(controller?.phase === "request-controller"); assert.deepEqual(controller.params.arguments[1].value, bindings.plan);
  assert.equal(bindings.plan.dataStr.startsWith(head(101, CLOCK, TARGET, false)), true);
  assert.equal(bindings.plan.dataStr.includes(head(102, CLOCK + 1, TARGET, false)), true);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 3);
  f.state.exited = true; await runner.observeOriginalGenerationEnded(); assert.equal(runner.diagnostics().retired, true);
});
void test("a foreign clock origin fails the composed collector before binding or another native command", async () => {
  const copy = await copyPlan(), f = requestCollectorFixture(), module = await model();
  const Constructor = await collector(f, module), reservation = module.reserveCurrentFootprintCopyMainRequestPlan(copy, CONTEXT, WINDOW);
  const runner = new Constructor(f.token, reservation); await runner.armForCompletion(); runner.consumeBeforeInvocation();
  await assert.rejects(runner.bindObservedClocks(Object.freeze({ ...ORIGIN }), packet()));
  assert.equal(f.commands.length, 4); assert.equal(runner.diagnostics().phase, "failed");
  f.state.exited = true; await runner.observeOriginalGenerationEnded(); assert.equal(runner.diagnostics().retired, true);
});
