/** Explicit synthetic cursor bindings. No native owner or Cache.put is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseInitialCacheData } from "../src/current-footprint-inverse-initial-cache-data.ts";
import { CurrentFootprintInverseInitialCacheCursor } from "../src/current-footprint-inverse-initial-cache-cursor.ts";
import type { CurrentFootprintInverseInitialCacheBindings, CurrentFootprintInverseInitialCacheHeld } from "../src/current-footprint-inverse-initial-cache-cursor.ts";
import { currentFootprintInverseInitialCacheBudget, validateCurrentFootprintInverseInitialCacheCommand } from "../src/current-footprint-inverse-initial-cache-protocol.ts";
import { currentFootprintInverseInitialCacheNativeFrame, currentFootprintInverseInitialCacheTemplates, currentFootprintInverseInitialCacheWire } from "../src/current-footprint-inverse-initial-cache-wire.ts";

const line = (type: string, value: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(value)}|\n`;
function data(): ReturnType<typeof deriveCurrentFootprintInverseInitialCacheData> {
  const historyUuid = "c".repeat(32), plaintext = line("EDIT_HEAD", { uuid: "actor" }) + Array.from({ length: 7 }, (_, index) => {
    const docType = index === 0 ? "FOOTPRINT" : "PCB", uuid = (index + 1).toString(16).padStart(32, "0");
    return line("DOCHEAD", { uuid, docType, client: "native" }, { ticket: 1 }) + line("META", { title: `Document ${String(index)}` }, { id: "META", ticket: index + 2 });
  }).join("");
  return deriveCurrentFootprintInverseInitialCacheData(deriveCurrentFootprintSavedFlowCacheData({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), headHistoryUuid: historyUuid,
    heads: [{ id: 1, uuid: historyUuid, parent: null, key: "d".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }], chunks: [{ historyUuid, ordinal: 0, plaintext, plaintextSha256: sha256Text(plaintext) }] }));
}
const metadata = (state: string): object => ({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "native.promise.prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: state } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] });
void test("eight original jobs may interleave and require actual later fulfillment before completion", async () => {
  const source = data(); assert.equal(source.jobs.length, 8); const original = new WeakMap<object, CurrentFootprintInverseInitialCacheHeld>(); let complete = 0, pass = 0, resumes = 0;
  const cursor = new CurrentFootprintInverseInitialCacheCursor(source, Object.freeze<CurrentFootprintInverseInitialCacheBindings>({ assertCurrent: (): Promise<void> => Promise.resolve(),
    requireHeld: (packet: object): CurrentFootprintInverseInitialCacheHeld => { const value = original.get(packet); assert.ok(value !== undefined); return value; },
    request: (input): Promise<unknown> => { const command = validateCurrentFootprintInverseInitialCacheCommand(input); if (command.phase === "inverse-initial-cache-settled") { if (command.slot === 0) { pass += 1; } return Promise.resolve(metadata(pass === 1 && command.slot === 7 ? "pending" : "fulfilled")); } return Promise.resolve({ result: { type: "boolean", value: true } }); },
    resume: (_held, command): Promise<void> => { assert.equal(command.phase, "inverse-initial-cache-resume"); resumes += 1; return Promise.resolve(); }, complete: (): Promise<void> => { complete += 1; return Promise.resolve(); }, fail: (): void => { assert.fail("valid original fixture unexpectedly failed"); } }));
  for (const role of ["headEntry", "headPromise", "headSuccess"] as const) {
    for (const job of source.jobs) {
      const packet = Object.freeze({ role, slot: job.slot }); const cache: CurrentFootprintInverseInitialCacheHeld["cache"] = role === "headEntry" ? Object.freeze({ role: job.kind === "flow" ? "flow" : "openCloudHead", joinedId: `cache.${String(job.slot)}` }) : null; const promise = role === "headPromise" ? Object.freeze({ objectId: `promise.${String(job.slot)}` }) : null; original.set(packet, Object.freeze({ packet, role, key: job.key, joinedId: `${role}.${String(job.slot)}`, cache, promise })); await cursor.continue(packet);
    }
  }
  assert.equal(resumes, 24); assert.equal(complete, 0); assert.equal(cursor.status().canSettle, true); await cursor.settle(); cursor.requireCompleted(); assert.equal(complete, 1); assert.equal(cursor.status().completeProducerFrontierVerified, false); await assert.rejects(cursor.settle());
  const budget = currentFootprintInverseInitialCacheBudget(8); assert.equal(budget.captureNormal + budget.cursorNormal + budget.helperSources, budget.cdpRequests); assert.equal(budget.cdpRequests, 272);
});
void test("copied cache packets and eight-slot grammar overflow refuse before a resume", async () => {
  let failed = false, requests = 0;
  const cursor = new CurrentFootprintInverseInitialCacheCursor(data(), Object.freeze<CurrentFootprintInverseInitialCacheBindings>({ assertCurrent: (): Promise<void> => Promise.resolve(), requireHeld: (): CurrentFootprintInverseInitialCacheHeld => { throw new Error("not an original packet"); }, request: (): Promise<unknown> => { requests += 1; return Promise.resolve({}); }, resume: (): Promise<void> => { requests += 1; return Promise.resolve(); }, complete: (): Promise<void> => Promise.resolve(), fail: (): void => { failed = true; } }));
  await assert.rejects(cursor.continue(Object.freeze({ profile: "private.current-footprint-inverse-initial-cache-held.v1" }))); assert.equal(requests, 0); assert.equal(failed, true);
  const source = data(); const job = source.jobs[0]; assert.ok(job !== undefined); const command = validateCurrentFootprintInverseInitialCacheCommand({ phase: "inverse-initial-cache-settled", slot: 7, method: "Runtime.getProperties", params: { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  assert.throws(() => validateCurrentFootprintInverseInitialCacheCommand({ ...command, slot: 8 })); const wire = currentFootprintInverseInitialCacheWire(command, 79, "original"); const frame = currentFootprintInverseInitialCacheNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`), command, "original"); assert.equal(frame["action"], "footprint-inverse-initial-cache");
  const templates = currentFootprintInverseInitialCacheTemplates(); assert.equal(templates.filter(row => row.phase.startsWith("inverse-initial-cache-")).length, 65); assert.equal(new Set(templates.map(row => row.phase)).size, templates.length);
});

const ref = (id: string, length: number): object => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: id } });
const promise = (id: string): object => ({ type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: id });

/** Real collector/decoder, explicitly synthetic registry and native replies. */
void test("collector retains each original returned Promise before resume and refuses a copied origin", async () => {
  const { loadSyntheticRegistryModule } = await import("./helpers/load-synthetic-registry-module.ts");
  const { CURRENT_PROJECT_SAVE_PRODUCER_SITES: sites } = await import("../src/current-project-save-producer-source.ts");
  const { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS: callers } = await import("../src/current-project-save-producer-cache-source.ts");
  const source = data(); const origin = Object.freeze({ syntheticOrigin: true }), owner = Object.freeze({ syntheticOwner: true }), prepared = Object.freeze({ syntheticPrepared: true });
  let completed: object | null = null, delivered = false, role: "headEntry" | "headPromise" | "headSuccess" = "headEntry", selected = source.jobs[0];
  const commands: string[] = [];
  const fields = (length: number, cache: boolean): object => {
    const rows = Array.from({ length }, (_, index) => {
      let value: object = { type: "undefined" };
      if (index === (cache ? 6 : 1)) { value = { type: "string", value: selected?.key }; }
      else if (cache && index === 8) { value = { type: "string", value: source.projectUuid }; }
      else if (cache && index === 9) { value = { type: "string", value: source.branchUuid }; }
      return { name: String(index), isOwn: true, value };
    });
    return { result: [...rows, { name: "length", isOwn: true, value: { type: "number", value: length } }] };
  };
  const bindings = Object.freeze({ data: source, actual: { sessionId: "original.session", scriptId: "original.script", project: "original.project" }, producer: { wrapper: "original.wrapper", callback: "original.callback" }, intrinsics: "original.intrinsics", originalBreakpoints: ["headEntry", "headPromise", "headSuccess"].map(name => ({ role: name, id: `bp.${name}` })), assertCurrent: (): void => { assert.ok(Object.isFrozen(origin)); }, fail: (): void => assert.fail("original cache collector unexpectedly failed"),
    complete: (packet: object): Promise<void> => { assert.equal(completed, null); completed = packet; return Promise.resolve(); },
    nextEvent: (): Promise<object> => {
      assert.ok(selected !== undefined); if (delivered) { return Promise.resolve({ method: "Debugger.resumed", sessionId: "original.session", params: {} }); } delivered = true;
      const caller = callers[selected.kind === "flow" ? "flow" : "openCloudHead"], site = sites[role];
      return Promise.resolve({ method: "Debugger.paused", sessionId: "original.session", params: { reason: "other", hitBreakpoints: [`bp.${role}`], callFrames: [
        { callFrameId: "original.frame", location: { scriptId: "original.script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "original.script", lineNumber: site.functionLineNumber, columnNumber: site.functionColumnNumber }, ...(role === "headPromise" ? { returnValue: promise("ephemeral.return") } : {}) },
        { callFrameId: "original.caller", location: { scriptId: "original.script", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber }, functionLocation: { scriptId: "original.script", lineNumber: caller.functionLineNumber, columnNumber: caller.functionColumnNumber } },
      ] } });
    }, request: (input: unknown): Promise<unknown> => {
      const command = validateCurrentFootprintInverseInitialCacheCommand(input); commands.push(command.phase);
      if (command.phase === "project-save-producer-frame" || command.phase === "project-save-producer-receiver") { return Promise.resolve(ref("original.joined", sites[role].length)); }
      if (command.phase === "project-save-producer-properties") { return Promise.resolve(fields(sites[role].length, false)); }
      if (command.phase === "project-save-producer-cache-caller") { return Promise.resolve(ref("original.caller.tuple", callers[command.cacheRole].length)); }
      if (command.phase === "project-save-producer-cache-receiver") { return Promise.resolve(ref("original.cache.tuple", 10)); }
      if (command.phase === "project-save-producer-cache-properties") { return Promise.resolve(fields(10, true)); }
      if (command.phase === "project-save-producer-cache-promise") { assert.equal(command.params.objectId, "ephemeral.return"); return Promise.resolve({ result: promise("owned.return") }); }
      if (command.phase === "project-save-producer-cache-promise-properties" || command.phase === "inverse-initial-cache-settled") { assert.equal(command.params.objectId, "owned.return"); return Promise.resolve(metadata("fulfilled")); }
      if (command.method === "Debugger.resume") { if (role === "headPromise") { assert.deepEqual(commands.slice(-4), ["project-save-producer-cache-promise", "project-save-producer-cache-promise-properties", "inverse-initial-cache-promise", "inverse-initial-cache-resume"]); } return Promise.resolve({}); }
      return Promise.resolve({ result: { type: "boolean", value: true } });
    },
  });
  const module = await loadSyntheticRegistryModule(new URL("../src/current-footprint-inverse-initial-cache-observer.ts", import.meta.url), (name, actual) => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentFootprintInverseInitialCacheOrigin: (a: object, b: object, c: object): object => { assert.equal(a, origin); assert.equal(b, owner); assert.equal(c, prepared); return bindings; } } : actual);
  const Constructor = module["CurrentFootprintInverseInitialCacheObserver"], lookup = module["requireOriginalCurrentFootprintInverseInitialCacheCompletion"]; assert.ok(typeof Constructor === "function" && typeof lookup === "function"); const observer: unknown = Reflect.construct(Constructor, [origin, owner, prepared]); assert.ok(observer !== null && typeof observer === "object");
  const requireCompleted: unknown = Reflect.get(observer, "requireCompleted"), service: unknown = Reflect.get(observer, "serviceOriginalHeld"); assert.ok(typeof service === "function" && typeof requireCompleted === "function");
  assert.throws(() => Reflect.construct(Constructor, [{ ...origin }, owner, prepared]));
  for (const job of source.jobs) { selected = job; for (const name of ["headEntry", "headPromise", "headSuccess"] as const) { role = name; delivered = false; const result: unknown = Reflect.apply(service, observer, []); assert.ok(result instanceof Promise); await result; } }
  Reflect.apply(requireCompleted, observer, []); assert.ok(completed !== null); Reflect.apply(lookup, undefined, [completed, observer, origin, owner, prepared]); assert.throws(() => Reflect.apply(lookup, undefined, [{ ...completed }, observer, origin, owner, prepared]));
});
