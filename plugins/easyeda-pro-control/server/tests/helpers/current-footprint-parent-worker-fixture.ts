/** Synthetic original-owner CDP fixture; no browser or native delivery. */
import assert from "node:assert/strict";
import { CurrentFootprintParentWorkerRunner } from "../../src/current-footprint-copy-parent-worker-runner.ts";
import type { CurrentFootprintParentWorkerCommand as Command, CurrentFootprintParentWorkerPending as Pending,
  CurrentFootprintParentWorkerTransport as Transport } from "../../src/current-footprint-copy-parent-worker-contract.ts";
import { validateCurrentFootprintParentWorkerCommand } from "../../src/current-footprint-copy-parent-worker-wire.ts";

type Data = Record<string, unknown>;
const binding = Object.freeze({ parentSessionId: "parent", parentUniqueContextId: "parent-context", projectObjectId: "project",
  childSessionId: "child", childUniqueContextId: "child-context", childTargetId: "child-target" });
const names = ["postMessage", "addEventListener", "removeEventListener", "stopImmediatePropagation", "get data", "get type", "get currentTarget"] as const;
const arities = [1, 2, 2, 0, 0, 0, 0];
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function native(index: number): Data {
  return { result: [property("name", { type: "string", value: names[index] }), property("length", { type: "number", value: arities[index] })],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "empty-scopes" } }] };
}
function array(kind: "parent" | "child"): Data {
  const count = kind === "parent" ? 4 : 8;
  const fields = Array.from({ length: count }, (_, index) => {
    let fn: number | null = null;
    if (kind === "parent" && index === 2) { fn = 0; }
    else if (kind === "child" && index > 0 && index < 7) { fn = index; }
    const value: Data = fn === null ? { type: "object", objectId: `${kind}-${String(index)}` } :
      { type: "function", className: "Function", description: `function ${String(names[fn])}() { [native code] }`, objectId: `native-${String(fn)}` };
    if (kind === "parent" && index === 1) { value["className"] = "Worker"; }
    return property(String(index), value, true, true);
  });
  fields.push(property("length", { type: "number", value: count }, true, false, false));
  return { result: fields, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
function fixture(): { runner: CurrentFootprintParentWorkerRunner; commands: Command[]; state: {
  nonce: string | null; bootstrap: boolean; owner: boolean; exited: boolean; wrongReceipt: boolean; disposeReceived: boolean;
  parentContinued: boolean; continuationAttempts: number; continueParent: ((pending: Pending) => Promise<void>) | null;
  failPhase: Command["phase"] | null; failReleaseSession: string | null }; transport: Transport } {
  const commands: Command[] = [], state = { nonce: null as string | null, bootstrap: false, owner: true, exited: false,
    wrongReceipt: false, disposeReceived: true, parentContinued: false, continuationAttempts: 0,
    continueParent: null as ((pending: Pending) => Promise<void>) | null,
    failPhase: null as Command["phase"] | null, failReleaseSession: null as string | null };
  const transport: Transport = {
    assertOriginalState: stage => {
      assert.ok(state.owner, "original owner lost"); assert.equal(stage === "before-imports", !state.bootstrap);
      if (stage === "parent-running" || stage === "peer-proved") { assert.ok(state.parentContinued); }
      return Promise.resolve();
    },
    advanceOriginalChildBootstrap: () => { state.bootstrap = true; return Promise.resolve(); },
    continueOriginalParentForPeer: async pending => {
      state.continuationAttempts += 1; await state.continueParent?.(pending); state.parentContinued = true;
    },
    assertOriginalGenerationExited: () => { assert.ok(state.exited, "original generation still alive"); return Promise.resolve(); },
    request: command => {
      validateCurrentFootprintParentWorkerCommand(command); commands.push(command);
      if (command.phase === state.failPhase || command.phase === "release" && command.sessionId === state.failReleaseSession) { return Promise.reject(new Error("lost native acknowledgment")); }
      if (command.phase === "release") { return Promise.resolve({}); }
      if (command.method === "Runtime.getProperties") {
        if (command.params.objectId === "parent-bundle" || command.params.objectId === "child-bundle") { return Promise.resolve(array(command.params.objectId === "parent-bundle" ? "parent" : "child")); }
        const index = Number(command.params.objectId.slice(-1)); return Promise.resolve(native(index));
      }
      if (command.phase === "parentSelect" || command.phase === "childSelect") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array",
        description: command.phase === "parentSelect" ? "Array(4)" : "Array(8)", objectId: command.phase === "parentSelect" ? "parent-bundle" : "child-bundle" } }); }
      if (command.phase === "childInstall") { const argument = command.params.arguments[0]; assert.ok(argument !== undefined && "value" in argument); state.nonce = argument.value; }
      if (command.phase === "parentSend") { assert.ok(state.bootstrap); const argument = command.params.arguments[0]; assert.ok(argument !== undefined && "value" in argument); assert.equal(argument.value, state.nonce); }
      if (command.phase === "childReceipt") { assert.ok(state.parentContinued); return Promise.resolve({ result: { type: "object", value: { profile: "private.current-footprint-worker-peer-receipt.v1",
        nonce: state.wrongReceipt ? "f".repeat(64) : state.nonce, trusted: true, removed: true } } }); }
      if (command.phase === "childDispose") { return Promise.resolve({ result: { type: "object", value: { received: state.disposeReceived, removed: true, installed: false } } }); }
      return Promise.resolve({ result: { type: "boolean", value: true } });
    },
  };
  return { runner: new CurrentFootprintParentWorkerRunner(transport, binding), commands, state, transport };
}


export { binding, fixture, native };
