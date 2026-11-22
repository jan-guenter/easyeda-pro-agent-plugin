/** Separate v4 source birth and inert local Inspector checks. No original
 * native helper, application, fixture or live writer is allocated here. */
/* oxlint-disable import/max-dependencies -- Separate stage, legacy and readonly transport routes must be compared independently. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_MARKERS as MARKERS, CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT as SCRIPT } from "../src/current-schematic-wire-writer-v4-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-writer-v4-native-profile.ts";
import { currentSchematicWireWriterV4NativeCommand as command } from "../src/current-schematic-wire-writer-v4-native-command.ts";
import { decodeCurrentSchematicWireWriterV4Capture as decodeCapture, currentSchematicWireWriterV4NativeRequest as encode } from "../src/current-schematic-wire-writer-v4-protocol.ts";
import { currentSchematicWireEditNativeRequest as legacy } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as text } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicWireAccessorCases } from "../src/current-schematic-wire-accessor-protocol.ts";
import { currentSchematicWireLexicalCases } from "../src/current-schematic-wire-lexical-protocol.ts";
import { currentSchematicWireIntentCases } from "../src/current-schematic-wire-intent-protocol.ts";
import { currentSchematicWireDependencyCases } from "../src/current-schematic-wire-dependencies-protocol.ts";
import { CurrentSchematicWireWriterV4Controller } from "../src/current-schematic-wire-writer-v4-controller.ts";
import { CurrentSchematicWireWriterV4Owner } from "../src/current-schematic-wire-writer-v4-owner.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_SHARED_ACTIONS as SHARED_ACTIONS } from "../src/current-schematic-wire-writer-v4-native-fragment.ts";
import { currentGeneratedInitialCacheNativeCases } from "../src/current-generated-initial-cache-protocol.ts";
import { currentGeneratedInitialSyncNativeCases } from "../src/current-generated-initial-sync-protocol.ts";
import { currentGeneratedPeriodicSyncNativeCases } from "../src/current-generated-periodic-sync-protocol.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerGuardCases } from "../src/current-project-save-producer-guard-protocol.ts";
import { currentProjectStructureTransportNativeCases } from "../src/current-project-structure-transport-protocol.ts";
import { currentSchematicDisplayWorkerNativeCases } from "../src/current-schematic-display-worker-wire.ts";


const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("v4 stage and readonly packets keep separate markers and 6910 bound; legacy 2721 and Text reject them", () => {
  const { args } = wireData();
  assert.equal(PROFILE.renderer.prefixObservation, 4096); assert.equal(PROFILE.renderer.accessorObservation, 175);
  assert.equal(PROFILE.renderer.total, 6910); assert.equal(PROFILE.executionAuthorized, false); assert.equal(PROFILE.originalTailReservationComplete, false);
  for (const phase of ["start", "navigate", "capture", "preflight", "modify", "observe", "save"] as const) {
    const fixed = command(phase, "123.1.2", args.target, args.operation), raw = { id: PROFILE.renderer.total, ...fixed, sessionId: "123.1" };
    const encoded = encode(wire(raw)); assert.equal(encoded["action"], "schematic-wire-writer-v4-native"); assert.equal(encoded["phase"], phase);
    assert.equal(Object.hasOwn(encoded, "functionDeclaration"), false); assert.throws(() => encode(wire({ ...raw, id: PROFILE.renderer.total + 1 })));
    assert.throws(() => legacy(wire({ ...raw, id: 1 }))); assert.throws(() => text(wire({ ...raw, id: 1 })));
    assert.throws(() => encode(wire({ ...raw, params: { ...fixed.params, functionDeclaration: "function(){return true}" } })));
  }
  const readers = [
    ["Accessor", currentSchematicWireAccessorCases(), "accessor"], ["Lexical", currentSchematicWireLexicalCases(), "lexical"],
    ["Intent", currentSchematicWireIntentCases(), "intent"], ["Dependency", currentSchematicWireDependencyCases(), "dependencies"],
  ] as const;
  for (const [name, cases, action] of readers) {
    for (const fixed of cases) {
      const raw = { id: 1, ...fixed, [`schematicWireWriterV4${name}Command`]: true, sessionId: "123.1" };
      assert.equal(encode(wire(raw))["action"], `schematic-wire-writer-v4-${action}`);
      assert.throws(() => legacy(wire(raw))); assert.throws(() => text(wire(raw)));
      assert.throws(() => encode(wire({ ...raw, code: "foreign" })));
    }
  }
  assert.equal(encode(wire({ id: PROFILE.renderer.total, method: "Target.getTargets" }))["requestId"], PROFILE.renderer.total);
  assert.throws(() => legacy(wire({ id: PROFILE.renderer.total, method: "Target.getTargets" })));
});
void test("v4 admission covers every shared readonly startup codebook action while retaining foreign mutation refusals", () => {
  const kinds = [
    ["initialCacheCommand", currentGeneratedInitialCacheNativeCases()], ["initialSyncCommand", currentGeneratedInitialSyncNativeCases()],
    ["periodicSyncCommand", currentGeneratedPeriodicSyncNativeCases()], ["producerObserveCommand", currentProjectSaveProducerNativeCases()],
    ["producerGuardCommand", currentProjectSaveProducerGuardCases("123.1")], ["structureTransportCommand", currentProjectStructureTransportNativeCases()],
    ["schematicWorkerCommand", currentSchematicDisplayWorkerNativeCases()],
  ] as const;
  let count = 0; const actions = new Set<string>();
  for (const [marker, cases] of kinds) { for (const fixed of cases) {
    const packet = { id: 1, ...fixed, [marker]: true, sessionId: "123.1" }; const action = encode(wire(packet))["action"];
    assert.ok(typeof action === "string"); actions.add(action); assert.ok(SHARED_ACTIONS.some(value => value === action));
    assert.throws(() => encode(wire({ ...packet, code: "foreign" }))); count += 1;
  } }
  assert.equal(actions.size, kinds.length); assert.ok(count > 50);
  for (const action of ["schematic-display-action", "schematic-display-clock", "schematic-display-accessor", "schematic-display-producer-prefix-enroll", "schematic-relevance-display-modify-generate", "schematic-wire-edit-native"]) {
    assert.equal(SHARED_ACTIONS.some(value => value === action), false);
  }
});
void test("v4 returned holder requires the exact CDP Array2 shape and accepts digit handles", () => {
  const packet = { result: { type: "object", subtype: "array", className: "Array", description: "Array(2)", objectId: "123.1.2" } };
  assert.equal(decodeCapture(packet), "123.1.2");
  for (const changed of [{ result: { ...packet.result, objectId: String.raw`123\1\2` } }, { result: { ...packet.result, description: "Array(3)" } }, { ...packet, id: 1 }, { result: { ...packet.result, preview: {} } }]) { assert.throws(() => decodeCapture(changed)); }
});
void test("v4 debugger markers match the actual compiled native wrapper", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const compiled = await session.post("Runtime.compileScript", { expression: SCRIPT, sourceURL: "wire-v4-inert-wrapper", persistScript: true });
    assert.equal(compiled.exceptionDetails, undefined); assert.ok(compiled.scriptId !== undefined);
    const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId: compiled.scriptId, lineNumber: 0, columnNumber: 0 }, restrictToFunction: false });
    const debuggerPoints = possible.locations.filter(location => location.type === "debuggerStatement");
    assert.equal(debuggerPoints.length, 6);
    assert.deepEqual(debuggerPoints.map(({ lineNumber, columnNumber }) => ({ lineNumber, columnNumber })), MARKERS.map(({ lineNumber, columnNumber }) => ({ lineNumber, columnNumber })));
  } finally { session.disconnect(); }
});
interface Controller {
  captureOriginalPreflight: () => Promise<unknown>; observeOriginalDependencies: () => Promise<unknown>; armOriginalRunGuard: () => Promise<unknown>;
  retireAccessorsAfterOriginalExit: () => Promise<void>; inspect: () => Readonly<{ executionAuthorized: boolean; saveAuthorized: boolean; preflightFailed: boolean }>;
  inspectRunGuard: () => Readonly<{ settled: boolean; failed: boolean; originalRunPointArmed: boolean }>;
}
async function harness(open: () => Promise<unknown>, stage: (name: string) => Promise<object>, arm: () => Promise<object> = () => Promise.resolve({})): Promise<Readonly<{ controller: Controller; observed: string[]; retired: string[] }>> {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-wire-writer-v4-controller.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replace("export class", "class");
  const argumentsValue = {}, prepared = {}; const original = { prepared, argumentsValue }; const observed: string[] = [], retired: string[] = [];
  const observer = (kind: string): object => class {
    readonly #kind = kind;
    public observe(): Promise<object> { observed.push(this.#kind); return Promise.resolve({}); }
    public retireAfterOriginalExit(): Promise<void> { retired.push(this.#kind); return Promise.resolve(); }
  };
  const owner = { openGeneratedSchematicWireWriterV4: open, executeSchematicWireWriterV4ReadStage: stage, armSchematicWireWriterV4RunGuard: arm,
    createSchematicWireAccessorOrigin: (): Promise<object> => Promise.resolve({}), createSchematicWireLexicalOrigin: (): Promise<object> => Promise.resolve({}),
    createSchematicWireIntentOrigin: (): Promise<object> => Promise.resolve({}), createSchematicWireDependencyOrigin: (): Promise<object> => Promise.resolve({}) };
  const result: unknown = runInNewContext(`${source}\nCurrentSchematicWireWriterV4Controller`, {
    assertOriginalCurrentSchematicWireWriterV4Owner: (value: unknown): void => { assert.equal(value, owner); }, originalCurrentSchematicWireWriterV4Target: (): object => prepared,
    requireOriginalCurrentSchematicWireEditPlan: (): object => original, requireOriginalSchematicWireWriterV4ReadStage: (ownerValue: unknown, argumentsInput: unknown): void => { assert.equal(ownerValue, owner); assert.equal(argumentsInput, argumentsValue); },
    requireOriginalSchematicWireWriterV4RunGuard: (ownerValue: unknown, argumentsInput: unknown): void => { assert.equal(ownerValue, owner); assert.equal(argumentsInput, argumentsValue); },
    requireOriginalCurrentSchematicWireAccessorObservation: (): object => ({}), requireOriginalCurrentSchematicWireLexicalObservation: (): object => ({}),
    requireOriginalCurrentSchematicWireIntentObservation: (): object => ({}), requireOriginalCurrentSchematicWireDependencyObservation: (): object => ({}),
    CurrentSchematicWireAccessorObserver: observer("accessor"), CurrentSchematicWireLexicalObserver: observer("lexical"),
    CurrentSchematicWireIntentObserver: observer("intent"), CurrentSchematicWireDependencyObserver: observer("dependency"),
  });
  assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Sole VM result is the unchanged controller with explicitly synthetic imported seams.
  const Class = result as new (owner: object, plan: object) => Controller;
  return { controller: new Class(owner, {}), observed, retired };
}
void test("v4 controller retains one original preflight Promise and orders all four observations and retirement", async () => {
  const opening = Promise.withResolvers<boolean>(), stages: string[] = []; let opens = 0;
  const { controller, observed, retired } = await harness(() => { opens += 1; return opening.promise; }, name => { stages.push(name); return Promise.resolve({ schema: "synthetic" }); });
  const task = controller.observeOriginalDependencies(); const preflight = controller.captureOriginalPreflight();
  assert.equal(controller.captureOriginalPreflight(), preflight); assert.equal(controller.observeOriginalDependencies(), task); assert.equal(opens, 1);
  assert.deepEqual(stages, []); assert.deepEqual(observed, []); await assert.rejects(controller.retireAccessorsAfterOriginalExit());
  opening.resolve(true); await task; assert.deepEqual(stages, ["capture", "preflight"]); assert.deepEqual(observed, ["accessor", "lexical", "intent", "dependency"]);
  assert.equal(controller.inspect().executionAuthorized, false); assert.equal(controller.inspect().saveAuthorized, false);
  await controller.retireAccessorsAfterOriginalExit(); assert.deepEqual(retired, ["dependency", "intent", "lexical", "accessor"]);
});
void test("v4 controller retains the rejected preflight and refuses forged owners before plan getters", async () => {
  const failure = new Error("synthetic-preflight"); let calls = 0;
  const { controller, observed } = await harness(() => Promise.resolve(), name => { calls += 1; return name === "capture" ? Promise.resolve({}) : Promise.reject(failure); });
  const pending = controller.captureOriginalPreflight(); await assert.rejects(pending, error => error === failure);
  assert.equal(controller.captureOriginalPreflight(), pending); assert.equal(calls, 2); assert.deepEqual(observed, []); assert.equal(controller.inspect().preflightFailed, true);
  let touched = false;
  assert.throws(() => Reflect.construct(CurrentSchematicWireWriterV4Controller, [{}, { get operationId(): never { touched = true; throw new Error("foreign"); } }]), /WIRE_WRITER_V4_ORIGINAL_FACTORY/u);
  assert.equal(touched, false);
});

void test("v4 original cleanup uses the shared authoritative factory guard before touching any native owner fields", async () => {
  const forged: unknown = Object.create(CurrentSchematicWireWriterV4Owner.prototype);
  const abort: unknown = Reflect.get(CurrentSchematicWireWriterV4Owner.prototype, "abortSchematicDisplayWrite"); assert.equal(typeof abort, "function");
  assert.ok(typeof abort === "function");
  const pending: unknown = Reflect.apply(abort, forged, []); assert.ok(pending instanceof Promise);
  await assert.rejects(pending, /WIRE_WRITER_V4_ORIGINAL_FACTORY/u);
});

void test("v4 run arming retains its one pending Promise and seals retirement until the original arm settles", async () => {
  const entered = Promise.withResolvers<boolean>(), pending = Promise.withResolvers<object>(); let arms = 0;
  const { controller, observed, retired } = await harness(() => Promise.resolve(), () => Promise.resolve({ schema: "synthetic" }), () => { arms += 1; entered.resolve(true); return pending.promise; });
  const task = controller.armOriginalRunGuard(); await entered.promise;
  assert.equal(controller.armOriginalRunGuard(), task); assert.equal(arms, 1); assert.equal(controller.inspectRunGuard().settled, false);
  assert.deepEqual(observed, ["accessor", "lexical", "intent", "dependency"]); await assert.rejects(controller.retireAccessorsAfterOriginalExit()); assert.deepEqual(retired, []);
  pending.resolve({}); await task; assert.equal(controller.inspectRunGuard().originalRunPointArmed, true); assert.equal(controller.inspect().executionAuthorized, false);
  await controller.retireAccessorsAfterOriginalExit(); assert.deepEqual(retired, ["dependency", "intent", "lexical", "accessor"]);
});
void test("v4 run arming preserves its original rejection without retry", async () => {
  const failure = new Error("synthetic-arm"); let arms = 0;
  const { controller } = await harness(() => Promise.resolve(), () => Promise.resolve({ schema: "synthetic" }), () => { arms += 1; return Promise.reject(failure); });
  const task = controller.armOriginalRunGuard(); await assert.rejects(task, error => error === failure);
  assert.equal(controller.armOriginalRunGuard(), task); assert.equal(arms, 1); assert.equal(controller.inspectRunGuard().failed, true);
  assert.equal(controller.inspectRunGuard().originalRunPointArmed, false);
});
