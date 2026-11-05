/** Synthetic original-owner issuers exercise the maintained snapshot engine.
 * Checkpoint/SQL stubs grant no native termination or connected durability. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { canonicalJson, isRecord } from "../src/core.ts";
import type { Inventory } from "../src/closed-sql-equality.ts";

interface Engine {
  readonly copy: (owner: object, termination: object) => Promise<Inventory>;
  readonly forward: (owner: object, termination: object) => Promise<Inventory>;
  readonly requireCopy: (owner: object, inventory: Inventory) => unknown;
  readonly requireForward: (owner: object, inventory: Inventory) => unknown;
}
interface FixtureState {
  owned: boolean; checkpoints: number; readers: number; complete: boolean; afterCheckpoint?: () => void;
}
async function fixture(): Promise<Readonly<{
  engine: Engine; copy: object; forward: object; termination: object;
  state: FixtureState;
}>> {
  const copy = Object.freeze({}), forward = Object.freeze({}), termination = Object.freeze({});
  const state: FixtureState = { owned: true, checkpoints: 0, readers: 0, complete: true };
  const sourceIdentity = { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" };
  const checkpoint = Object.freeze({ source: "/synthetic/disposable.eprj2", checkpoint: "/synthetic/checkpoint.eprj2",
    receiptPath: "/synthetic/receipt.json", checkpointSha256: "a".repeat(64), sourceSha256: "a".repeat(64),
    sourceDumpSha256: "b".repeat(64), checkpointDumpSha256: "b".repeat(64), sourceIdentity,
    sourceStatAfter: { ctimeNs: "4", mtimeNs: "5", size: "6" } });
  const origin = Object.freeze({ operationId: "footprint-forward-execution-synthetic", source: checkpoint.source,
    checkpoint, runtime: Object.freeze({}), before: Object.freeze({}) });
  const completions = new WeakMap<object, object>();
  function owner(selected: object, family: object): void { assert.equal(selected, family, "original owner family"); assert.equal(state.owned, true, "original owner lost"); }
  function ended(selected: object, observed: object, family: object): void { owner(selected, family); assert.equal(observed, termination, "original termination"); }
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-closed-snapshot.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const scope = vm.createContext({ Error, Object, JSON, Promise, WeakMap, WeakSet, canonicalJson, isRecord, join,
    assertOriginalCurrentFootprintCopyNativeOwner: (selected: object): void => { owner(selected, copy); },
    assertOriginalCurrentFootprintForwardExecutionNativeOwner: (selected: object): void => { owner(selected, forward); },
    assertOriginalCurrentFootprintCopyNativeTermination: (selected: object, observed: object): void => { ended(selected, observed, copy); },
    assertOriginalCurrentFootprintForwardExecutionNativeTermination: (selected: object, observed: object): void => { ended(selected, observed, forward); },
    originalCurrentFootprintCopyNativeTarget: (selected: object): object => { owner(selected, copy); return origin; },
    originalCurrentFootprintForwardExecutionNativeTarget: (selected: object): object => { owner(selected, forward); return origin; },
    controlRootCapability: (): Promise<object> => Promise.resolve(Object.freeze({})),
    controlDataDirectory: (): string => "/synthetic/control",
    createCheckpoint: (): Promise<object> => { state.checkpoints += 1; state.afterCheckpoint?.(); return Promise.resolve(checkpoint); },
    freezeDeep: (value: unknown): unknown => value,
    readExactSqlInventory: (): Promise<object> => {
      state.readers += 1;
      const inventory = Object.freeze({ checkpointSha256: checkpoint.checkpointSha256 });
      completions.set(inventory, Object.freeze({ observedChildClose: state.complete, exitCode: state.complete ? 0 : null, exitSignal: null }));
      return Promise.resolve(inventory);
    },
    readerCompletion: (inventory: object): object => { const complete = completions.get(inventory); assert.ok(complete, "original SQL reader"); return complete; },
    readArtifact: (): Promise<object> => Promise.resolve({ eof: true, text: JSON.stringify(checkpoint) }),
    verifyCheckpoint: (): Promise<object> => Promise.resolve({ ok: true, sourceChanged: false, sourceMatchesReceipt: true,
      checkpointMatchesReceipt: true, sourceEqualsCheckpoint: true, sourceSha256: checkpoint.sourceSha256,
      checkpointSha256: checkpoint.checkpointSha256, sourceDumpSha256: checkpoint.sourceDumpSha256,
      checkpointDumpSha256: checkpoint.checkpointDumpSha256 }),
    lstat: (): Promise<object> => Promise.resolve({ isFile: (): boolean => true, isSymbolicLink: (): boolean => false,
      dev: 1n, ino: 2n, birthtimeNs: 3n, ctimeNs: 4n, mtimeNs: 5n, size: 6n, mode: 0o600n, uid: 1n, gid: 1n, nlink: 1n }),
  });
  const loaded: unknown = vm.runInContext(`${program}\n({copy:captureCurrentFootprintCopyClosedSnapshot,forward:captureCurrentFootprintForwardExecutionClosedSnapshot,requireCopy:requireCurrentFootprintCopyClosedSnapshot,requireForward:requireCurrentFootprintForwardExecutionClosedSnapshot});`, scope);
  assert.ok(isRecord(loaded) && ["copy", "forward", "requireCopy", "requireForward"].every((name) => typeof loaded[name] === "function"));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Private VM evaluates the maintained engine with synthetic issuers; these functions are never installed in production.
  return { engine: loaded as unknown as Engine, copy, forward, termination, state };
}

void test("Closed snapshot families preserve original owner, termination and complete-reader identities", async () => {
  const f = await fixture();
  await assert.rejects(f.engine.forward(f.copy, f.termination), /original owner family/u);
  await assert.rejects(f.engine.copy(f.forward, f.termination), /original owner family/u);
  await assert.rejects(f.engine.forward(f.forward, structuredClone(f.termination)), /original termination/u);
  assert.equal(f.state.checkpoints, 0); assert.equal(f.state.readers, 0);
  const observed = await f.engine.forward(f.forward, f.termination);
  assert.notEqual(f.engine.requireForward(f.forward, observed), undefined);
  assert.throws(() => f.engine.requireCopy(f.forward, observed), /ORIGINAL_SNAPSHOT/u);
  assert.throws(() => f.engine.requireForward(f.forward, structuredClone(observed)), /ORIGINAL_SNAPSHOT/u);
  await assert.rejects(f.engine.forward(f.forward, f.termination), /ATTEMPT_CONSUMED/u);
  const old = await f.engine.copy(f.copy, f.termination);
  assert.notEqual(f.engine.requireCopy(f.copy, old), undefined);
  assert.throws(() => f.engine.requireForward(f.copy, old), /ORIGINAL_SNAPSHOT/u);
  assert.equal(f.state.checkpoints, 2); assert.equal(f.state.readers, 2);
});

void test("Closed snapshot failures retain their consumed attempt and issue no snapshot after owner loss or unfinished reader", async () => {
  for (const failure of ["owner", "reader"] as const) {
    const f = await fixture();
    if (failure === "owner") { f.state.afterCheckpoint = (): void => { f.state.owned = false; }; }
    else { f.state.complete = false; }
    await assert.rejects(f.engine.forward(f.forward, f.termination), failure === "owner" ? /original owner lost/u : /COMPLETE_READER/u);
    assert.equal(f.state.checkpoints, 1); assert.equal(f.state.readers, failure === "owner" ? 0 : 1);
    f.state.owned = true;
    await assert.rejects(f.engine.forward(f.forward, f.termination), /ATTEMPT_CONSUMED/u);
    assert.equal(f.state.checkpoints, 1);
  }
});
