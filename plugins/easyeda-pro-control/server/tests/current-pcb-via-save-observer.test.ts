/** Real observer state/async callbacks with explicit original-native/source
 * seams. No native owner, worker, SDK Save, SQL or connected proof is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaSaveBodyObservation, CurrentPcbViaSaveObserver } from "../src/current-pcb-via-save-observer.ts";
import type { CurrentPcbViaSaveCommand } from "../src/current-pcb-via-save-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_METHODS as METHODS, CURRENT_PCB_VIA_SAVE_SITES as SITES, CURRENT_PCB_VIA_SAVE_SOURCE as SOURCE } from "../src/current-pcb-via-save-source.ts";

const property = (name: string, value: unknown, length = false): unknown => ({ name, value, writable: true, enumerable: !length, configurable: !length, isOwn: true });
function remoteArray(id: string, length: number): unknown { return { result: { type: "object", subtype: "array", className: "Array", objectId: id, description: `Array(${String(length)})` } }; }
const methodRoles = ["save", "rpc", "compress", "getTicket", "setTicket"] as const;
const metadataProperty = (name: string, scalar: string | number): unknown => ({ name, value: { type: typeof scalar, value: scalar }, writable: false, enumerable: false, configurable: true, isOwn: true });
const metadata = (role: keyof typeof METHODS): unknown => {
  const method = METHODS[role];
    return { result: [metadataProperty("name", method.name), metadataProperty("length", method.arity)], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original", lineNumber: method.lineNumber, columnNumber: method.columnNumber } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "scopes" } }, { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } }] };
  };
async function fixture(delayed = false): Promise<Readonly<{ observer: CurrentPcbViaSaveObserver; state: { exited: boolean; failed: boolean; resumes: number }; waiting: Promise<unknown>;
  abortOriginal: () => void; requireBody: (packet: CurrentPcbViaSaveBodyObservation) => Promise<unknown> }>> {
  const owner = Object.freeze({ explicitSyntheticOwner: true }); const origin = Object.freeze({ explicitSyntheticOrigin: true });
  const plan = Object.freeze({ target: { documentUuid: "a".repeat(32), projectUuid: "b".repeat(64) } }); const source = Object.freeze({ explicitSyntheticSource: true });
  const state = { exited: false, failed: false, resumes: 0 }; const order = ["entry", "clock", "compress", "body", "result"] as const;
  let index = 0; const notices: unknown[] = []; const event = Promise.withResolvers<unknown>(); const ready = Promise.withResolvers<null>();
  const value = { ...plan.target, uniqueId: "compiler", client: "client", clock: 1_700_000_000_123, headTicket: 5, body: "original-body", userUndefined: true, userJson: null };
  const array = (role: typeof order[number]): unknown => {
    const length = role === "entry" ? 13 : SITES[role].length; const entries: unknown[] = [];
    for (let position = 0; position < length; position += 1) {
      let item: unknown = { type: "object", objectId: `original-${String(position)}` };
      if (role === "entry") {
        const method = methodRoles.find(key => METHODS[key].index === position);
        if (method !== undefined) { item = { type: "function", objectId: `method-${method}`, description: `qualified-${method}` }; }
      } else if (position === 3 || position === 4) { item = { type: "number", value: position === 3 ? value.clock : value.headTicket }; }
      else if (position === 5) { item = { type: "string", value: value.body }; }
      entries.push(property(String(position), item));
    }
    entries.push(property("length", { type: "number", value: length }, true));
    return { result: entries, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
  };
  const bindings = { sessionId: "session", scriptId: "original", uniqueContextId: "context", source,
    assertCurrent: (): Promise<void> => { assert.equal(state.exited, false); return Promise.resolve(); }, assertSaveAttempt: (): void => { assert.equal(state.failed, false); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); }, fail: (): void => { state.failed = true; },
    nextEvent: (): Promise<unknown> => {
      ready.resolve(null);
      if (notices.length > 0) { return Promise.resolve(notices.shift()); }
      if (delayed) { return event.promise; }
      const role = order[index]; index += 1; assert.ok(role !== undefined); const site = SITES[role];
      return Promise.resolve({ method: "Debugger.paused", sessionId: "session", params: { reason: "other", hitBreakpoints: [`bp-${role}`], callFrames: [{ callFrameId: `frame-${role}`, functionName: "saveCanvas",
        location: { scriptId: "original", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "original", lineNumber: SOURCE.saveCanvas.functionLine, columnNumber: SOURCE.saveCanvas.functionColumn } }] } });
    }, request: (command: CurrentPcbViaSaveCommand): Promise<unknown> => {
      if (command.phase === "via-save-source") { return Promise.resolve({ scriptSource: "explicit-source-seam" }); }
      if (command.phase === "via-save-arm") { return Promise.resolve({ breakpointId: `bp-${command.role}`, actualLocation: command.params.location }); }
      if (command.phase === "via-save-frame") { return Promise.resolve(remoteArray(`raw-${command.role}`, SITES[command.role].length)); }
      if (command.phase === "via-save-value") { return Promise.resolve({ result: { type: "object", value } }); }
      if (command.phase === "via-save-resume") { state.resumes += 1; notices.push({ method: "Debugger.resumed", sessionId: "session", params: {} }); return Promise.resolve({}); }
      if (command.phase === "via-save-properties") {
        const id = command.params.objectId;
        for (const role of methodRoles) { if (id === `method-${role}`) { return Promise.resolve(metadata(role)); } }
        const role = order.find(stage => id === `joined-${stage}`); assert.ok(role !== undefined); return Promise.resolve(array(role));
      }
      const role = order.find(stage => command.phase === `via-save-${stage}`); assert.ok(role !== undefined);
      return Promise.resolve(remoteArray(`joined-${role}`, role === "entry" ? 13 : SITES[role].length));
    } };
  const url = new URL("../src/current-pcb-via-save-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-owner.ts") { return { requireOriginalCurrentPcbViaSaveWorkerOrigin: (o: unknown, actual: unknown, p: unknown): unknown => {
      assert.equal(o, origin); assert.equal(actual, owner); assert.equal(p, plan); return bindings;
    } }; }
    if (name === "./current-pcb-via-save-source.ts") { return { CURRENT_PCB_VIA_SAVE_METHODS: METHODS, CURRENT_PCB_VIA_SAVE_SITES: SITES,
      requireOriginalCurrentPcbViaSaveSource: (s: unknown): void => { assert.equal(s, source); },
      captureCurrentPcbViaSaveScriptReply: (s: unknown): unknown => { assert.deepEqual(s, { scriptSource: "explicit-source-seam" }); return structuredClone(s); }, qualifyCurrentPcbViaSaveScriptReply: (s: unknown): void => { assert.deepEqual(s, { scriptSource: "explicit-source-seam" }); } }; }
    if (name === "./current-pcb-via-save-replies.ts") { const actual: unknown = sourceRequire(name); assert.ok(typeof actual === "object" && actual !== null); return { ...actual,
      requireCurrentPcbViaSaveMethodDescription: (description: unknown, role: keyof typeof METHODS): void => { assert.equal(description, `qualified-${role}`); } }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSaveObserver"], requireBody = loaded.exports["requireOriginalCurrentPcbViaSaveBody"];
  assert.ok(typeof Constructor === "function" && typeof requireBody === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real observer class is VM-loaded with the two explicit ownership/source seams above; no native constructor runs.
  const observer = Reflect.construct(Constructor, [origin, owner, plan]) as CurrentPcbViaSaveObserver;
  return { observer, state, waiting: ready.promise, abortOriginal: (): void => { state.exited = true; event.reject(new Error("original-job-exited")); },
    requireBody: packet => { const result: unknown = Reflect.apply(requireBody, undefined, [packet, owner, plan]); assert.ok(result instanceof Promise); return result; } };
}
void test("the original body stays paused, cannot be copied or resumed twice, and completion preserves the original attempt", async () => {
  const f = await fixture(); await f.observer.arm(); const packet = await f.observer.observeBody();
  assert.equal(f.state.resumes, 3); assert.equal(packet.selectedClockResponderVerified, false); assert.equal(packet.selectedSqlAuthorized, false);
  await assert.rejects(f.requireBody({ ...packet }), /ORIGINAL_BODY/u); await f.requireBody(packet);
  await assert.rejects(f.observer.releaseBody({ ...packet }), /BODY_RELEASE_CONSUMED/u); await f.observer.releaseBody(packet);
  await assert.rejects(f.observer.releaseBody(packet), /BODY_RELEASE_CONSUMED/u); await f.observer.observeCompletion(); assert.equal(f.state.resumes, 5);
  await f.requireBody(packet); f.state.exited = true; await f.observer.retireAfterOriginalExit(); await assert.rejects(f.requireBody(packet), /ORIGINAL/u);
});
void test("original Job abort settles a delayed native event before observer retirement without abandoning or replaying it", async () => {
  const f = await fixture(true); await f.observer.arm(); const pending = f.observer.observeBody(); await f.waiting;
  await assert.rejects(f.observer.retireAfterOriginalExit(), /RETIRE_PENDING/u); f.abortOriginal(); await assert.rejects(pending, /original-job-exited/u);
  assert.equal(f.state.failed, true); assert.equal(f.state.resumes, 0); await f.observer.retireAfterOriginalExit(); await assert.rejects(f.observer.observeBody(), /BODY_CONSUMED/u);
});
