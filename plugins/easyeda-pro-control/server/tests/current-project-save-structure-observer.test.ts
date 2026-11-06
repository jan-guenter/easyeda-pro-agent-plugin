/** Explicit synthetic native-registry/source seams. The real observer,
 * protocol and metadata decoders run; no app, native origin or grant is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_CALLBACK_LOCATIONS as CALLBACKS, CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS as PRODUCERS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, validateCurrentProjectSaveStructureCommand } from "../src/current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand, CurrentProjectSaveStructureSite as Site } from "../src/current-project-save-structure-protocol.ts";
import type { CurrentProjectHistorySqlCompletion, CurrentProjectSaveStructureBindings, CurrentProjectSaveStructureEvent, CurrentProjectSaveStructureOrigin } from "../src/current-project-save-structure-origin.ts";
import type { CurrentProjectSaveStructureObserver } from "../src/current-project-save-structure-observer.ts";
import { worker209ConstructionFixtureSource } from "./helpers/current-pcb-209-worker-construction-fixture.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

type Remote = Record<string, unknown>;
const ref = (objectId: string): Remote => ({ type: "object", objectId, className: "Object" });
const property = (name: string, value: Remote, writable = true, enumerable = true, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
function array(values: readonly Remote[]): object { return { result: [...values.map((value, index) => property(String(index), value)), property("length", { type: "number", value: values.length }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: ref("array.prototype") }] }; }
function sourceAt(source: string, profile: Readonly<{ utf16Offset: number; sourceBytes: number; sourceSha256: string }>): string {
  for (let offset = profile.utf16Offset - 24; offset <= profile.utf16Offset + 4; offset += 1) { const text = source.slice(offset, offset + profile.sourceBytes);
    if (Buffer.byteLength(text) === profile.sourceBytes && createHash("sha256").update(text).digest("hex") === profile.sourceSha256) { return text; } }
  throw new Error("Synthetic unchanged function excerpt missing");
}
const arrayRef = (id: string, length: number): object => ({ result: { type: "object", className: "Array", objectId: id, description: `Array(${String(length)})` } });
const metadata = (id: string): object => {
  const callback = id === "uploadCallback" || id === "structureCallback", profile = callback ? CALLBACKS[id === "uploadCallback" ? "uploadStructure" : "structure"] : PRODUCERS[id === "debounce" ? "debounce" : "serial"];
  const result = [property("length", { type: "number", value: profile.parameterCount }, false, false), property("name", { type: "string", value: "" }, false, false)];
  if (id === "debounce") { result.push(property("prototype", ref("debounce.prototype"), true, false, false)); }
  return { result, internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker.script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: id === "structureCallback" ? { type: "object", className: "AsyncFunction", objectId: "async.prototype" } : { type: "function", className: "Function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${id}.scopes`, description: "Scopes[3]" } }] };
};
const scopes = (id: string): object => ({ result: (id.startsWith("debounce") ? ["Block (QA)", "Closure (QA)", "Global"] : ["Closure (Nd)", "Global"]).map((description, index) => property(String(index), {
  type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}.scope${String(index)}` })) });

async function fixture(changedTree = false, changedTimer = false): Promise<Readonly<{ observer: CurrentProjectSaveStructureObserver; origin: CurrentProjectSaveStructureOrigin; token: CurrentProjectHistorySqlCompletion; resumes: Site[]; consumed: () => boolean; exit: () => void }>> {
  const excerpt = worker209ConstructionFixtureSource(); const descriptions = { upload: sourceAt(excerpt, PRODUCERS.serial), structure: sourceAt(excerpt, PRODUCERS.serial), debounce: sourceAt(excerpt, PRODUCERS.debounce),
    uploadCallback: sourceAt(excerpt, CALLBACKS.uploadStructure), structureCallback: sourceAt(excerpt, CALLBACKS.structure) };
  const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), documentUuid: "3".repeat(32) };
  const prepared = Object.freeze({ qualification: { target } }); const owner = Object.freeze({ syntheticOwner: true }); const operation = Object.freeze({ syntheticOperation: true });
  const origin: CurrentProjectSaveStructureOrigin = Object.freeze({ profile: "private.current-pcb-via-save-structure-origin.v1" }); const token = Object.freeze({ profile: "private.current-project-history-sql-completion.v1" });
  let consumed = false, exited = false, finalizer = 0; const resumes: Site[] = [];
  const events: CurrentProjectSaveStructureEvent[] = []; const points = new Map<Site, string>();
  const roles: readonly Site[] = ["bootstrap", "packet", "response", "callbackReturn", "initialFinally", "initialFinally"];
  for (const [index, role] of roles.entries()) { events.push({ method: "Debugger.paused", sessionId: "worker.session", params: { reason: "other", hitBreakpoints: [`bp.${role}`], callFrames: [{ callFrameId: `frame.${String(index)}`,
    location: { scriptId: "worker.script", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber } },
  ...(role === "packet" ? [{ callFrameId: "timer.caller", location: { scriptId: "worker.script", lineNumber: SITES.timer.lineNumber, columnNumber: SITES.timer.columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: SITES.timer.lineNumber, columnNumber: SITES.timer.columnNumber } }] : [])] } }, { method: "Debugger.resumed", sessionId: "worker.session", params: {} }); }
  const selected = (name: keyof typeof descriptions): Remote => ({ type: "function", className: name === "structureCallback" ? "AsyncFunction" : "Function", objectId: name, description: descriptions[name] });
  const value = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, ticket: 20, structureText: changedTree ? "unrelated metadata" : "fixed expected metadata" };
  const readProperties = (id: string): object => {
    if (id in descriptions) { return metadata(id); } if (id.endsWith(".scopes")) { return scopes(id); }
    if (id === "frame.bootstrap") { return array([ref("project"), ref("bus")]); }
    if (id === "initial") { return array([ref("project"), selected("upload"), selected("structure")]); }
    if (id === "frame.packet") { return array([ref("project"), ref("packet"), ref("task")]); }
    if (id === "frame.timer") { return array([selected("structureCallback"), { type: "function", objectId: changedTimer ? "borrowed.resolver" : "resolver" }, { type: "number", value: 1 }]); }
    if (id === "frame.response" || id === "frame.callbackReturn") { return array([ref("project"), ref("packet"), ref("task"), ref("response")]); }
    if (id === "frame.initialFinally") { return array([ref(finalizer === 0 ? "upload.promise" : "structure.promise"), { type: "object", subtype: "null", value: null }, selected(finalizer === 0 ? "uploadCallback" : "debounce")]); }
    if (id === "debounce.values") { return array([{ type: "number", value: 1 }, { type: "function", objectId: "resolver" }]); }
    if (id === "upload.values" || id === "structure.values") { return array([ref(id === "upload.values" ? "upload.promise" : "structure.promise"), ref("arguments")]); }
    if (id === "packet.values") { return array([ref("datas"), ref("taskSet")]); }
    if (id === "task" || id.endsWith(".promise")) { return { result: [], internalProperties: [{ name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }; }
    throw new Error(`Unexpected synthetic properties ${id}`);
  };
  const request = (input: CurrentProjectSaveStructureCommand, _cleanup: boolean, retain?: (raw: unknown) => void): Promise<unknown> => {
    const command = validateCurrentProjectSaveStructureCommand(input); let raw: unknown;
    if (command.method === "Debugger.getScriptSource") { raw = { scriptSource: "synthetic complete source seam" }; }
    else if (command.method === "Debugger.setBreakpoint") { points.set(command.role, `bp.${command.role}`); raw = { breakpointId: `bp.${command.role}`, actualLocation: command.params.location }; retain?.(raw); }
    else if (command.method === "Debugger.evaluateOnCallFrame") { raw = arrayRef(`frame.${command.role}`, SITES[command.role].length); }
    else if (command.method === "Runtime.getProperties") { raw = readProperties(command.params.objectId); }
    else if (command.method === "Debugger.resume") { assert.ok(command.role === "bootstrap" || consumed); resumes.push(command.role); if (command.role === "initialFinally") { finalizer += 1; } raw = {}; }
    else if (command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.releaseObjectGroup") { raw = {}; }
    else { const id = command.params.objectId;
      if (command.phase === "project-save-structure-bootstrap") { raw = arrayRef("initial", 3); }
      else if (command.phase === "project-save-structure-callback") { let name: keyof typeof descriptions = "structureCallback"; if (id.startsWith("upload")) { name = "uploadCallback"; } else if (id.startsWith("structure")) { name = "debounce"; } raw = { result: selected(name) }; }
      else if (command.phase === "project-save-structure-debounce") { raw = arrayRef("debounce.values", 2); }
      else if (command.phase === "project-save-structure-serial") { raw = arrayRef(id.startsWith("upload") ? "upload.values" : "structure.values", 2); }
      else if (command.phase === "project-save-structure-packet") { raw = arrayRef("packet.values", 2); }
      else if (command.phase === "project-save-structure-data") { raw = { result: ref("datas") }; }
      else if (command.phase === "project-save-structure-packetText") { raw = { result: { type: "object", value } }; }
      else { raw = { result: { type: "boolean", value: command.phase !== "project-save-structure-same" || command.params.arguments[0]?.objectId === id } }; }
    }
    return Promise.resolve(raw);
  };
  const bindings: CurrentProjectSaveStructureBindings = Object.freeze({ sessionId: "worker.session", scriptId: "worker.script", uniqueContextId: "worker.context",
    // Explicit synthetic checkpoint seam; the actual expectation issuer is separately tested and never replaced in production.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This explicit synthetic registry seam does not issue a production checkpoint.
    prepared: prepared as unknown as CurrentProjectSaveStructureBindings["prepared"], request, nextEvent: (): Promise<CurrentProjectSaveStructureEvent> => { const event = events.shift(); assert.ok(event); return Promise.resolve(event); },
    assertCurrent: (): Promise<void> => Promise.resolve(), assertOperationPending: (): void => { assert.equal(exited, false); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.ok(exited); return Promise.resolve(); }, fail: (): void => {
      // Synthetic source revocation only.
    } });
  const loaded = await loadSyntheticRegistryModule(new URL("../src/current-project-save-structure-observer.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-project-save-structure-protocol.ts") { return { ...actual, qualifyCurrentProjectSaveStructureSource: (text: unknown): void => { assert.equal(text, "synthetic complete source seam"); } }; }
    if (name === "./current-project-save-structure-expectation.ts") { return { ...actual, expectedCurrentGeneratedProjectSaveStructure: (input: unknown, clock: unknown): string => { assert.equal(input, prepared); assert.equal(clock, 1_800_000_000_000); return "fixed expected metadata"; } }; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { ...actual, requireOriginalCurrentProjectSaveStructureOrigin: (input: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, origin); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); return bindings; },
      consumeOriginalCurrentProjectHistorySqlCompletion: (input: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, token); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); assert.equal(consumed, false); consumed = true;
        return { ...target, bodySha256: "4".repeat(64), saveHeadTicket: 20, workerClock: 1_800_000_000_000, workerEditVersion: null, originalHistoryNativeCallbacksCompleted: true, selectedSqlStillFenced: true }; } }; }
    return actual;
  });
  const constructor = loaded["CurrentProjectSaveStructureObserver"]; assert.ok(typeof constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The compiled original class is instantiated only behind this explicit synthetic native-registry seam; no production capability is supplied.
  const observer = Reflect.construct(constructor, [origin, owner, operation]) as CurrentProjectSaveStructureObserver;
  return { observer, origin, token, resumes, consumed: (): boolean => consumed, exit: (): void => { exited = true; } };
}
void test("original-held packet waits history consumption and observes both original serial finalizers within exact budget", async () => {
  const f = await fixture(); await f.observer.arm(); await f.observer.observeConstruction(); const packet = await f.observer.observePacket();
  assert.deepEqual(f.resumes, ["bootstrap"]); assert.equal(f.consumed(), false); assert.equal(f.observer.retained().packetHeld, true);
  await assert.rejects(f.observer.releasePacket({ ...packet }, f.token)); assert.equal(f.consumed(), false);
  await f.observer.releasePacket(packet, f.token); assert.equal(f.consumed(), true); const completion = await f.observer.observeCompletion();
  assert.equal(completion.mainStructurePublicationVerified, false); assert.equal(completion.completeClosedSqlVerified, false); assert.equal(completion.persistenceVerified, false);
  assert.equal(f.observer.retained().normalRequests, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS.normal); await f.observer.cleanup(); assert.equal(f.observer.retained().cleanupRequests, 7);
  assert.equal(f.observer.retained().resourcesClosed, true); await assert.rejects(f.observer.releasePacket(packet, f.token));
});
void test("an incomplete or mismatched structure packet is never resumed by cleanup", async () => {
  const f = await fixture(); await f.observer.arm(); await f.observer.observeConstruction(); await f.observer.observePacket(); await assert.rejects(f.observer.cleanup()); assert.deepEqual(f.resumes, ["bootstrap"]);
  f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, ["bootstrap"]); assert.equal(f.observer.retained().cleanupRequests, 0);
  const mismatch = await fixture(true); await mismatch.observer.arm(); await mismatch.observer.observeConstruction(); const packet = await mismatch.observer.observePacket();
  await assert.rejects(mismatch.observer.releasePacket(packet, mismatch.token), /EXACT_HISTORY_AND_METADATA_INTENT/u); assert.equal(mismatch.consumed(), true); assert.deepEqual(mismatch.resumes, ["bootstrap"]);
  mismatch.exit(); await mismatch.observer.cleanup();
  const timer = await fixture(false, true); await timer.observer.arm(); await timer.observer.observeConstruction(); await assert.rejects(timer.observer.observePacket());
  assert.deepEqual(timer.resumes, ["bootstrap"]); timer.exit(); await timer.observer.cleanup();
});
