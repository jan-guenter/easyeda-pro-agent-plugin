/** Maintained factory outcome tracking with synthetic native allocation.
 * No installed helper, process or EasyEDA launch occurs in these cases. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";

async function fixture(failure: "admission" | "allocation" | "retained" | "none"): Promise<{
  start: () => Promise<unknown>; outcome: () => { status: string; owner: object | null }; calls: string[];
}> {
  const calls: string[] = [], input = Object.freeze({}), writer = Object.freeze({ status: () => ({ released: true, helperClosed: true }) });
  const allocations = new WeakMap<object, object>(), attempts = new WeakSet<object>(), factories = new WeakMap<object, unknown>();
  const states = new WeakMap<object, string>(); factories.set(writer, { options: Object.freeze({}) });
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const start = source.indexOf("export async function startCurrentFootprintCopySavedNativeOwner(");
  const end = source.indexOf("\nasync function startFixedOwner(", start); assert.ok(start > 0 && end > start);
  const program = stripTypeScriptTypes(source.slice(start, end)).replaceAll(/\bexport (?=(?:async )?function)/gu, "");
  class SavedOwner {
    public bindFootprintSavedSource(original: object, after: object): void {
      assert.equal(allocations.get(writer), this); assert.equal(original, writer); assert.equal(after, input); calls.push("bind");
    }
  }
  const scope = createContext({ Object, Error, writer, input, footprintSavedAllocations: allocations, footprintSavedAllocationAttempts: attempts,
    footprintSavedAllocationStates: states, footprintFactories: factories, CurrentFootprintCopySavedNativeOwner: SavedOwner,
    assertOriginalCurrentFootprintCopyNativeOwner: (original: object): void => { assert.equal(original, writer); },
    requireCurrentFootprintCopyClosedSnapshot: (original: object, after: object): void => { assert.equal(original, writer); assert.equal(after, input); },
    error: (detail: string): Error => new Error(detail),
    startFixedOwner: (_options: object, purpose: string, generation: string, original: object): Promise<object> => {
      assert.equal(purpose, "worker-startup-footprint-saved209"); assert.equal(generation, "209-startup"); assert.equal(original, writer);
      calls.push("admission");
      if (failure === "admission") { return Promise.reject(new Error("admission failed")); }
      states.set(writer, "unresolved"); calls.push("spawn-boundary");
      if (failure === "allocation") { return Promise.reject(new Error("allocation unresolved")); }
      const owner = new SavedOwner(); allocations.set(writer, owner); calls.push("retain-owner");
      return failure === "retained" ? Promise.reject(new Error("retained startup failed")) : Promise.resolve(owner);
    },
  });
  runInContext(program, scope);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Both calls invoke only the extracted maintained factory functions in this private synthetic realm.
  const begin = (): Promise<unknown> => runInContext("startCurrentFootprintCopySavedNativeOwner(writer,input)", scope) as Promise<unknown>;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained observer returns the fixed allocation outcome union; no returned data confers native authority.
  const outcome = (): { status: string; owner: object | null } => runInContext("currentFootprintCopySavedAllocationOutcome(writer)", scope) as { status: string; owner: object | null };
  assert.equal(outcome().status, "not-attempted"); return { start: begin, outcome, calls };
}

void test("saved factory distinguishes pre-spawn refusal from unresolved allocation and retained owner failure", async () => {
  const expected = { admission: "no-resource", allocation: "unresolved", retained: "retained" } as const;
  for (const failure of ["admission", "allocation", "retained"] as const) {
    const f = await fixture(failure); await assert.rejects(f.start(), /failed|unresolved/u);
    const result = f.outcome();
    assert.equal(result.status, expected[failure]);
    assert.equal(result.owner !== null, failure === "retained"); const before = [...f.calls];
    await assert.rejects(f.start(), /ALLOCATION_CONSUMED/u); assert.deepEqual(f.calls, before);
  }
});

void test("saved factory retains and binds its exact owner on successful allocation", async () => {
  const f = await fixture("none"), owner = await f.start(), result = f.outcome();
  assert.equal(result.status, "retained"); assert.equal(result.owner, owner);
  assert.deepEqual(f.calls, ["admission", "spawn-boundary", "retain-owner", "bind"]);
  await assert.rejects(f.start(), /ALLOCATION_CONSUMED/u);
});

void test("no-resource admission proof ends before the maintained native spawn boundary", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  assert.ok(source.includes('if (savedWriter !== undefined) { footprintSavedAllocationStates.set(savedWriter, "unresolved"); }\n  const child = spawn('));
  const boundary = source.indexOf('footprintSavedAllocationStates.set(savedWriter, "unresolved")');
  const retained = source.indexOf("footprintSavedAllocations.set(savedWriter, owner)", boundary);
  assert.ok(boundary > 0 && retained > boundary);
  assert.equal(/\bawait\b/u.test(source.slice(boundary, retained)), false);
});
