/** Runs the unchanged controller body with synthetic provenance/observer seams.
 * No original owner, native transport, application or writer is allocated. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

function observer(kind: string, observed: string[], retired: string[], beforeRetire?: (kind: string) => Promise<unknown>): object {
  return class {
    readonly #kind = kind;
    public observe(): Promise<object> { observed.push(this.#kind); return Promise.resolve({}); }
    public async retireAfterOriginalExit(): Promise<void> { await beforeRetire?.(this.#kind); retired.push(this.#kind); }
  };
}

interface Controller {
  observeOriginalAccessors: () => Promise<unknown>;
  observeOriginalLexicalOperands: () => Promise<unknown>;
  observeOriginalIntent: () => Promise<unknown>;
  retireAccessorsAfterOriginalExit: () => Promise<void>;
}

void test("Wire retirement seals new intent issuance while lexical retirement awaits", async () => {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-wire-proof-controller.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replace("export class", "class");
  const entered = Promise.withResolvers<boolean>(), pending = Promise.withResolvers<boolean>();
  const argumentsValue = {}, prepared = {};
  const original = { prepared, argumentsValue };
  let intentOrigins = 0;
  const observed: string[] = [], retired: string[] = [];
  const owner = {
    createSchematicWireAccessorOrigin: (): Promise<object> => Promise.resolve({}),
    createSchematicWireLexicalOrigin: (): Promise<object> => Promise.resolve({}),
    createSchematicWireIntentOrigin: (): Promise<object> => { intentOrigins += 1; return Promise.resolve({}); },
  };
  const beforeRetire = (kind: string): Promise<boolean> => {
    if (kind === "lexical") { entered.resolve(true); return pending.promise; }
    return Promise.resolve(false);
  };
  const classFromVm: unknown = runInNewContext(`${source}\nCurrentSchematicWireProofController`, {
    assertOriginalCurrentSchematicWireEditOwner: (value: unknown): void => { assert.equal(value, owner); },
    originalCurrentSchematicWireEditTarget: (): object => prepared,
    requireOriginalCurrentSchematicWireEditPlan: (): object => original,
    requireOriginalCurrentSchematicWireAccessorObservation: (): object => ({}),
    requireOriginalCurrentSchematicWireLexicalObservation: (): object => ({}),
    requireOriginalCurrentSchematicWireIntentObservation: (): object => ({}),
    CurrentSchematicWireAccessorObserver: observer("accessor", observed, retired, beforeRetire),
    CurrentSchematicWireLexicalObserver: observer("lexical", observed, retired, beforeRetire),
    CurrentSchematicWireIntentObserver: observer("intent", observed, retired, beforeRetire),
  });
  assert.equal(typeof classFromVm, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The sole VM result is the unchanged controller class with synthetic imported dependencies.
  const ControllerClass = classFromVm as new (ownerValue: object, plan: object) => Controller;
  const controller = new ControllerClass(owner, {});
  const lexicalTask = controller.observeOriginalLexicalOperands(); await lexicalTask;
  const accessorTask = controller.observeOriginalAccessors(); await accessorTask;
  const retirement = controller.retireAccessorsAfterOriginalExit(); await entered.promise;
  try {
    await assert.rejects(Promise.resolve().then(() => controller.observeOriginalIntent()), /SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER/u);
    assert.equal(controller.observeOriginalAccessors(), accessorTask);
    assert.equal(controller.observeOriginalLexicalOperands(), lexicalTask);
    assert.equal(intentOrigins, 0); assert.deepEqual(retired, []);
  } finally { pending.resolve(true); await retirement; }
  assert.deepEqual(retired, ["lexical", "accessor"]);
  assert.throws(() => controller.observeOriginalIntent(), /SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER/u);
  assert.equal(intentOrigins, 0);
});

for (const held of ["lexical", "intent"] as const) {
  void test(`Wire retirement refuses a pending ${held} origin before retiring any observer`, async () => {
    const source = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-wire-proof-controller.ts", import.meta.url), "utf8"))
      .replaceAll(/^import[\s\S]*?;\n/gmu, "").replace("export class", "class");
    const entered = Promise.withResolvers<boolean>(), pending = Promise.withResolvers<object>();
    const argumentsValue = {}, prepared = {};
    const original = { prepared, argumentsValue };
    const observed: string[] = [], retired: string[] = [];
    const origin = (kind: string): Promise<object> => {
      if (kind === held) { entered.resolve(true); return pending.promise; }
      return Promise.resolve({});
    };
    const owner = {
      createSchematicWireAccessorOrigin: (): Promise<object> => origin("accessor"),
      createSchematicWireLexicalOrigin: (): Promise<object> => origin("lexical"),
      createSchematicWireIntentOrigin: (): Promise<object> => origin("intent"),
    };
    const classFromVm: unknown = runInNewContext(`${source}\nCurrentSchematicWireProofController`, {
      assertOriginalCurrentSchematicWireEditOwner: (value: unknown): void => { assert.equal(value, owner); },
      originalCurrentSchematicWireEditTarget: (): object => prepared,
      requireOriginalCurrentSchematicWireEditPlan: (): object => original,
      requireOriginalCurrentSchematicWireAccessorObservation: (): object => ({}),
      requireOriginalCurrentSchematicWireLexicalObservation: (): object => ({}),
      requireOriginalCurrentSchematicWireIntentObservation: (): object => ({}),
      CurrentSchematicWireAccessorObserver: observer("accessor", observed, retired),
      CurrentSchematicWireLexicalObserver: observer("lexical", observed, retired),
      CurrentSchematicWireIntentObserver: observer("intent", observed, retired),
    });
    assert.equal(typeof classFromVm, "function");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The unchanged checked controller class is the sole VM result; only its imported dependencies are synthetic.
    const ControllerClass = classFromVm as new (ownerValue: object, plan: object) => Controller;
    const controller = new ControllerClass(owner, {});
    const task = held === "lexical" ? controller.observeOriginalLexicalOperands() : controller.observeOriginalIntent();
    await entered.promise;
    assert.deepEqual(observed, held === "lexical" ? ["accessor"] : ["accessor", "lexical"]);
    await assert.rejects(controller.retireAccessorsAfterOriginalExit(), /SCHEMATIC_WIRE_PROOF_ORIGINAL_CONTROLLER/u);
    assert.deepEqual(retired, []);
    assert.equal(held === "lexical" ? controller.observeOriginalLexicalOperands() : controller.observeOriginalIntent(), task);
    pending.resolve({}); await task;
    assert.deepEqual(retired, []);
    await controller.retireAccessorsAfterOriginalExit();
    assert.deepEqual(retired, held === "lexical" ? ["lexical", "accessor"] : ["intent", "lexical", "accessor"]);
  });
}
