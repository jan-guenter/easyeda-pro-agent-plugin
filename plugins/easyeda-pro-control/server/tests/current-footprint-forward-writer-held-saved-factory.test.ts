/** Executed production factory slices and complete child-custody helpers.
 * Private fixture registries and an inert Linux child grant no original saved
 * token, Windows ownership, completed copy, SQL witness or connected result. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { types } from "node:util";
import { parse } from "acorn";
import type { Program, Statement, VariableDeclaration } from "acorn";

interface FactorySource {
  readonly source: string;
  readonly statements: readonly Statement[];
  readonly program: Program;
}
async function factorySource(): Promise<FactorySource> {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8"));
  const program = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const factory = program.body.find(row => row.type === "FunctionDeclaration" && row.id?.name === "startFixedOwner");
  assert.ok(factory?.type === "FunctionDeclaration");
  return { source, program, statements: factory.body.body };
}
function declaration(input: FactorySource, name: string): VariableDeclaration {
  const value = input.statements.find(row => row.type === "VariableDeclaration" && row.declarations.some(item => item.id.type === "Identifier" && item.id.name === name));
  assert.ok(value?.type === "VariableDeclaration");
  return value;
}
function text(input: FactorySource, row: { readonly start: number; readonly end: number }): string {
  return input.source.slice(row.start, row.end);
}

void test("actual factory classifiers keep each held-saved registry disjoint from legacy observation", async () => {
  const input = await factorySource();
  const classification = ["fullHeldSaved", "forwardHeldSaved", "forwardSaved"].map(name => text(input, declaration(input, name))).join("\n");
  const legacy = input.statements.find(row => row.type === "IfStatement" && text(input, row).includes('forwardSavedAllocationStates.set(forwardSaved.writer, "unresolved")'));
  assert.ok(legacy?.type === "IfStatement");
  for (const family of ["full", "held", "legacy", "foreign", "none"] as const) {
    const token = Object.freeze({});
    const original = Object.freeze({});
    const full = new WeakMap<object, object>(), held = new WeakMap<object, object>();
    if (family === "full") { full.set(token, original); }
    if (family === "held") { held.set(token, original); }
    const calls: string[] = [];
    const scope = createContext({
      forwardSavedHandoff: family === "none" ? null : token,
      forwardWriterHeldSavedHandoffs: full, forwardExecutionHeldSavedHandoffs: held,
      requireForwardWriterHeldSavedHandoff: (value: object): object => { assert.equal(value, token); calls.push("full"); return original; },
      requireForwardExecutionHeldSavedHandoff: (value: object): object => { assert.equal(value, token); calls.push("held"); return original; },
      requireForwardSavedObservationHandoff: (value: object): object => {
        assert.equal(value, token); calls.push("legacy");
        if (family !== "legacy") { throw new Error("FOREIGN_LEGACY_HANDOFF"); }
        return original;
      },
      forwardSavedAllocationStates: { set: (): void => { calls.push("legacy-state"); } },
      error: (message: string): Error => new Error(message),
    });
    if (family === "foreign") {
      assert.throws(() => runInContext(classification, scope), /FOREIGN_LEGACY_HANDOFF/u);
      assert.deepEqual(calls, ["legacy"]);
    } else {
      runInContext([classification, text(input, legacy)].join("\n"), scope);
      let expected: string[] = [];
      if (family === "legacy") { expected = ["legacy", "legacy", "legacy-state"]; }
      else if (family !== "none") { expected = [family]; }
      assert.deepEqual(calls, expected);
    }
  }
});

interface Allocation {
  state: "unresolved";
  owner: null;
  child: null | { readonly original: ChildProcessWithoutNullStreams; readonly observation: { readonly closed: boolean } };
  eofAttempted: boolean;
}
async function childFixture(context: TestContext): Promise<Readonly<{
  allocation: Allocation;
  retained: Set<object>;
  child: ChildProcessWithoutNullStreams;
  closeOwnerless: () => Promise<unknown>;
}>> {
  const input = await factorySource();
  const childStatement = declaration(input, "child"), ownerStatement = declaration(input, "owner");
  assert.ok(childStatement.start < ownerStatement.start);
  const helpers = ["retainForwardExecutionBirthChild", "closeForwardExecutionOwnerlessBirth"].map(name => {
    const row = input.program.body.find(item => item.type === "FunctionDeclaration" && item.id?.name === name);
    assert.ok(row?.type === "FunctionDeclaration");
    return text(input, row);
  }).join("\n");
  const allocation: Allocation = { state: "unresolved", owner: null, child: null, eofAttempted: false };
  const retained = new Set<object>([allocation]);
  let original: ChildProcessWithoutNullStreams | null = null;
  const scope = createContext({
    Object, Promise, setTimeout, clearTimeout, retainedOwners: retained,
    CURRENT_FOOTPRINT_COMBINED_READY: { eofCleanupMilliseconds: 2000 },
    error: (message: string): Error => new Error(message),
    fullHeldSaved: allocation, footprintInverseAllocation: null, forwardExecutionBirth: null,
    forwardHeldSaved: null, savedReadbackAllocation: null, schematicSavedAllocation: null,
    viaWriteAllocation: null, schematicWireAllocation: null, schematicRelevanceAllocation: null, schematicDisplayAllocation: null,
    installation: { paths: { powershellExecutable: "inert-node-only" } }, encoded: "inert-unused",
    spawn: (executable: string): ChildProcessWithoutNullStreams => {
      assert.equal(executable, "inert-node-only");
      assert.equal(original, null);
      original = spawn(process.execPath, ["-e", "process.stdin.resume()"], { stdio: ["pipe", "pipe", "pipe"] });
      return original;
    },
  });
  runInContext([helpers, input.source.slice(childStatement.start, ownerStatement.start)].join("\n"), scope);
  // Acquire the original child from the actual spawn seam. This fixture
  // Supplies no production native owner or original saved token.
  const child: unknown = runInContext("child", scope);
  assert.equal(child, original);
  assert.ok(original !== null);
  const inert: ChildProcessWithoutNullStreams = original;
  context.after(async () => {
    if (inert.exitCode === null) { const closed = once(inert, "close"); inert.stdin.end(); await closed; }
  });
  return {
    allocation, retained, child: inert,
    closeOwnerless: (): Promise<unknown> => {
      const result: unknown = runInContext("closeForwardExecutionOwnerlessBirth(fullHeldSaved)", scope);
      assert.ok(types.isPromise(result));
      return result;
    },
  };
}
void test("actual post-spawn full saved enrollment permits one ownerless EOF before constructor completion", async context => {
  const f = await childFixture(context);
  assert.ok(f.allocation.child?.original === f.child);
  assert.equal(f.retained.has(f.allocation), true);
  assert.equal(f.allocation.eofAttempted, false);
  await f.closeOwnerless();
  assert.equal(f.allocation.eofAttempted, true);
  assert.equal(f.allocation.child?.observation.closed, true);
  assert.equal(f.child.exitCode, 0);
  assert.equal(f.retained.has(f.allocation), false);
  await assert.rejects(f.closeOwnerless(), /OWNERLESS_EOF_REFUSED/u);
});
void test("actual full saved child close observer removes its retained allocation on independent normal exit", async context => {
  const f = await childFixture(context);
  assert.ok(f.allocation.child?.original === f.child);
  assert.equal(f.retained.has(f.allocation), true);
  const closed = once(f.child, "close"); f.child.stdin.end(); await closed;
  assert.equal(f.allocation.child?.observation.closed, true);
  assert.equal(f.child.exitCode, 0);
  assert.equal(f.allocation.eofAttempted, false);
  assert.equal(f.retained.has(f.allocation), false);
});
