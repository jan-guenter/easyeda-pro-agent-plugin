/** Explicit synthetic native-registry/source seams. The real observer,
 * protocol and metadata decoders run; no app, native origin or grant is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_CALLBACK_LOCATIONS as CALLBACKS, CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS as PRODUCERS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS, CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTION_SEQUENCE as SEQUENCE, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, validateCurrentProjectSaveStructureCommand } from "../src/current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand, CurrentProjectSaveStructureSite as Site } from "../src/current-project-save-structure-protocol.ts";
import type { CurrentProjectStructureBodyReservation, CurrentProjectStructureMainPublication } from "../src/current-project-structure-transport-origin.ts";
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
  const callbacks = new Map<string, (typeof CALLBACKS)[keyof typeof CALLBACKS]>([["uploadCallback", CALLBACKS.uploadStructure], ["structureCallback", CALLBACKS.structure], ["bufferedCallback", CALLBACKS.upload], ["cooperationCallback", CALLBACKS.cooperation]]);
  const producer = PRODUCERS.serial;
  const profile = callbacks.get(id) ?? new Map<string, (typeof PRODUCERS)[keyof typeof PRODUCERS]>([["debounce", PRODUCERS.debounce], ["bufferedUpload", PRODUCERS.upload], ["cooperationWrapper", PRODUCERS.cooperation]]).get(id) ?? producer;
  const result = [property("length", { type: "number", value: profile.parameterCount }, false, false), property("name", { type: "string", value: "" }, false, false)];
  if (id === "debounce") { result.push(property("prototype", ref("debounce.prototype"), true, false, false)); }
  return { result, internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker.script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: (id === "structureCallback" || id === "bufferedCallback") ? { type: "object", className: "AsyncFunction", objectId: "async.prototype" } : { type: "function", className: "Function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `${id}.scopes`, description: "Scopes[3]" } }] };
};
const scopes = (id: string): object => {
  let descriptions = ["Closure (Nd)", "Global"];
  if (id.startsWith("debounce")) { descriptions = ["Block (QA)", "Closure (QA)", "Global"]; }
  else if (id.startsWith("bufferedUpload")) { descriptions = ["Closure (bufferedStream)", "Global"]; }
  else if (id.startsWith("cooperationWrapper")) { descriptions = ["Closure (ZA)", "Global"]; }
  return { result: descriptions.map((description, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}.scope${String(index)}` })) };
};
function constructorName(role: Site): string { if (role === "producerUpload") { return "Gd"; } return "Lg"; }


async function fixture(changedTree = false, changedTimer = false, changedReceiver = false, changedCallback = false, changedCaller = false, startupCalls = 0, wrongStartupReady = false, wrongStartupReturn = false, wrongStartupFinalizer = false, earlySave = false, prehistoryFault: "body" | "publication" | "mode" | null = null, inverse = false): Promise<Readonly<{ lookupBootstrap: (hold: object, wrong?: "observer" | "owner" | "origin" | "prepared") => unknown;  reservation: CurrentProjectStructureBodyReservation; publication: CurrentProjectStructureMainPublication; publish: () => void; bodyConsumed: () => boolean; observer: CurrentProjectSaveStructureObserver; origin: CurrentProjectSaveStructureOrigin; token: CurrentProjectHistorySqlCompletion; resumes: Site[]; consumed: () => boolean; exit: () => void }>> {
  const excerpt = worker209ConstructionFixtureSource(); const descriptions = { upload: sourceAt(excerpt, PRODUCERS.serial), structure: sourceAt(excerpt, PRODUCERS.serial), debounce: sourceAt(excerpt, PRODUCERS.debounce),
    uploadCallback: sourceAt(excerpt, CALLBACKS.uploadStructure), structureCallback: sourceAt(excerpt, CALLBACKS.structure), bufferedUpload: sourceAt(excerpt, PRODUCERS.upload), cooperationWrapper: sourceAt(excerpt, PRODUCERS.cooperation), bufferedCallback: sourceAt(excerpt, CALLBACKS.upload), cooperationCallback: sourceAt(excerpt, CALLBACKS.cooperation) };
  const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), documentUuid: "3".repeat(32) };
  const prepared = inverse ? Object.freeze({ profile: "private.current-footprint-forward-saved-checkpoint.v1" }) : Object.freeze({ qualification: { target }, history: { documents: [{ records: Array.from({ length: 7 }, () => ({})) }] } }); const owner = Object.freeze({ syntheticOwner: true }); const operation = inverse ? prepared : Object.freeze({ syntheticOperation: true });
  const origin: CurrentProjectSaveStructureOrigin = inverse ? Object.freeze({ profile: "private.current-footprint-inverse-structure-origin.v1" }) : Object.freeze({ profile: "private.current-pcb-via-save-structure-origin.v1" }); const token = Object.freeze({ profile: "private.current-project-history-sql-completion.v1" });
  const publication: CurrentProjectStructureMainPublication = Object.freeze({ profile: "private.current-project-structure-main-publication.v1" }), reservation: CurrentProjectStructureBodyReservation = Object.freeze({ profile: "private.current-project-structure-body-reservation.v1" });
  let bodyConsumed = false, consumed = false, exited = false, finalizer = 0, published = false, startupFinalizers = 0; const resumes: Site[] = [];
  const events: CurrentProjectSaveStructureEvent[] = []; const points = new Map<Site, string>();
  const roles: readonly Site[] = [...SEQUENCE, "bootstrap", ...Array.from({ length: startupCalls }, (_, index) => ["startupEntry", "startupReturn", index % 2 === 0 ? "initialFinally" : "queuedFinally"] as const).flat(), "packet", "response", "callbackReturn", "initialFinally", "initialFinally"];
  for (const [index, role] of roles.entries()) { events.push({ method: "Debugger.paused", sessionId: "worker.session", params: { reason: "other", hitBreakpoints: [`bp.${role}`], callFrames: [{ callFrameId: `frame.${String(index)}`,
    location: { scriptId: "worker.script", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber }, ...(role === "startupReturn" ? { returnValue: wrongStartupReturn ? { type: "number", value: 1 } : { type: "undefined" } } : {}) },
  ...(role === "producerUpload" || role === "producerCooperation" || role === "producerSerial" || role === "producerDebounce" ? [{ callFrameId: "constructor.caller", functionName: changedCaller ? "Unowned" : constructorName(role),
    location: { scriptId: "worker.script", lineNumber: SITES[role === "producerUpload" ? "producerBase" : "producerProject"].lineNumber, columnNumber: SITES[role === "producerUpload" ? "producerBase" : "producerProject"].columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: 0, columnNumber: 0 } }] : []),
  ...(role === "startupEntry" ? [{ callFrameId: "startup.caller", location: { scriptId: "worker.script", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber } }] : []),
  ...(role === "packet" ? [{ callFrameId: "timer.caller", location: { scriptId: "worker.script", lineNumber: SITES.timer.lineNumber, columnNumber: SITES.timer.columnNumber }, functionLocation: { scriptId: "worker.script", lineNumber: SITES.timer.lineNumber, columnNumber: SITES.timer.columnNumber } }] : [])] } }, { method: "Debugger.resumed", sessionId: "worker.session", params: {} }); }
  const selected = (name: keyof typeof descriptions): Remote => ({ type: "function", className: (name === "structureCallback" || name === "bufferedCallback") ? "AsyncFunction" : "Function", objectId: name, description: descriptions[name] });
  const value = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, ticket: 20, structureText: changedTree ? "unrelated metadata" : "fixed expected metadata" };
  const readProperties = (id: string): object => {
    if (id === "unowned.sameSourceCallback") { return metadata("bufferedCallback"); } if (id in descriptions) { return metadata(id); } if (id.endsWith(".scopes")) { return scopes(id); }
    if (id === "frame.startupEntry" || id === "frame.startupReturn") { return array([ref("project"), { type: "string", value: "PCB" }, { type: "string", value: "VIA" }, { type: "boolean", value: true }]); }
    if (id === "frame.startupCaller") { return array([selected("uploadCallback"), ref("startup.promise"), { type: "object", subtype: "null", value: null }, ref("startup.arguments")]); }
    if ((id === "frame.initialFinally" || id === "frame.queuedFinally") && startupFinalizers < startupCalls) { return array([ref("startup.promise"), { type: "object", subtype: "null", value: null }, selected(wrongStartupFinalizer ? "debounce" : "uploadCallback")]); }
    if (id === "frame.producerCaller" || id === "frame.producerBase" || id === "frame.producerProject") { return array([ref(changedReceiver && id === "frame.producerBase" ? "unowned.project" : "project")]); }
    if (id === "frame.producerUpload") { return array([{ ...selected("bufferedCallback"), objectId: changedCallback ? "unowned.sameSourceCallback" : "bufferedCallback" }, { type: "number", value: 500 }]); }
    if (id === "frame.producerCooperation") { return array([selected("cooperationCallback"), { type: "number", value: 10 }]); }
    if (id === "frame.producerDebounce") { return array([selected("structureCallback"), { type: "number", value: 300 }]); }
    if (id === "frame.producerSerial") { return array([selected(resumes.filter(role => role === "producerSerial").length === 0 ? "uploadCallback" : "debounce")]); }
    if (id === "frame.mode") { return array([{ type: "boolean", value: prehistoryFault === "mode" }]); }
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
    else if (command.method === "Debugger.resume") { assert.ok(command.role === "bootstrap" || command.role === "startupEntry" || command.role === "startupReturn" || (command.role === "initialFinally" || command.role === "queuedFinally") && startupFinalizers < startupCalls || CONSTRUCTORS.some(role => role === command.role) || consumed || (command.role === "packet" ? bodyConsumed : published)); resumes.push(command.role); if (command.role === "initialFinally" || command.role === "queuedFinally") { if (startupFinalizers < startupCalls) { startupFinalizers += 1; } else { finalizer += 1; } } raw = {}; }
    else if (command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.releaseObjectGroup") { raw = {}; }
    else { const id = command.params.objectId;
      if (command.phase === "project-save-structure-uploadRelation") { assert.equal(command.params.arguments[2]?.objectId, "bufferedCallback", "only original constructor arrow can join upload wrapper"); }
      if (command.phase === "project-save-structure-startupEntry") { raw = { result: { type: "boolean", value: !wrongStartupReady } }; }
      else if (command.phase === "project-save-structure-startupFinalizer") { raw = { result: { type: "boolean", value: !wrongStartupFinalizer } }; }
      else if (command.phase === "project-save-structure-uploadSelect") { raw = { result: selected("bufferedUpload") }; }
      else if (command.phase === "project-save-structure-cooperationSelect") { raw = { result: selected("cooperationWrapper") }; }
      else if (command.phase === "project-save-structure-bootstrap") { raw = arrayRef("initial", 3); }
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
    assertCurrent: (): Promise<void> => Promise.resolve(), assertStartupPending: (): void => { assert.equal(earlySave, false); }, assertOperationPending: (): void => { assert.equal(exited, false); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.ok(exited); return Promise.resolve(); }, fail: (): void => {
      // Synthetic source revocation only.
    } });
  const prehistory = await loadSyntheticRegistryModule(new URL("../src/current-project-save-structure-prehistory.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-project-save-structure-expectation.ts") { return { ...actual, expectedCurrentGeneratedProjectSaveStructure: (input: unknown, clock: unknown): string => { assert.equal(input, prepared); assert.equal(clock, 1_800_000_000_000); return "fixed expected metadata"; } }; } return actual;
  });
  const loaded = await loadSyntheticRegistryModule(new URL("../src/current-project-save-structure-observer.ts", import.meta.url), (name, actual): unknown => {
    if (name === "./current-project-save-structure-protocol.ts") { return { ...actual, qualifyCurrentProjectSaveStructureSource: (text: unknown): void => { assert.equal(text, "synthetic complete source seam"); } }; }
    if (name === "./current-project-save-structure-prehistory.ts") { return prehistory; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { ...actual, requireOriginalCurrentProjectSaveStructureOrigin: (input: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, origin); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); return bindings; },
      consumeOriginalCurrentProjectHistorySqlCompletion: (input: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, token); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); assert.equal(consumed, false); consumed = true;
        return { ...target, bodySha256: "4".repeat(64), saveHeadTicket: 20, workerClock: 1_800_000_000_000, workerEditVersion: null, originalHistoryNativeCallbacksCompleted: true, selectedSqlStillFenced: true }; },
      consumeOriginalCurrentProjectStructureBodyReservation: (input: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, reservation); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); assert.equal(bodyConsumed, false); bodyConsumed = true;
        return { ...target, bodySha256: "4".repeat(64), saveHeadTicket: 20, workerClock: 1_800_000_000_000, expectedStructureText: prehistoryFault === "body" ? "foreign structure" : "fixed expected metadata" }; },
      requireOriginalCurrentProjectStructurePublicationForSharedOrigin: (input: unknown, inputOrigin: unknown, inputOwner: unknown, inputOperation: unknown): object => { assert.equal(input, publication); assert.equal(inputOrigin, origin); assert.equal(inputOwner, owner); assert.equal(inputOperation, operation); assert.equal(published, true);
        return { projectUuid: target.projectUuid, branchUuid: target.branchUuid, ticket: 20, structureSha256: prehistoryFault === "publication" ? "9".repeat(64) : createHash("sha256").update("fixed expected metadata").digest("hex"), nativeChanges: 1, nativeBeforeEpochMs: 1_800_000_000_000, nativeAfterEpochMs: 1_800_000_000_001, originalResponsePublished: true, selectedSqlStillFenced: true }; } }; }
    return actual;
  });
  const constructor = loaded["CurrentProjectSaveStructureObserver"]; assert.ok(typeof constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The compiled original class is instantiated only behind this explicit synthetic native-registry seam; no production capability is supplied.
  const observer = Reflect.construct(constructor, [origin, owner, operation]) as CurrentProjectSaveStructureObserver;
  const lookup = loaded["requireOriginalCurrentFootprintInverseBootstrapHeld"]; assert.ok(typeof lookup === "function");
  return { lookupBootstrap: (hold: object, wrong?: "observer" | "owner" | "origin" | "prepared"): unknown => Reflect.apply(lookup, undefined, [hold, wrong === "observer" ? Object.freeze({}) : observer, wrong === "origin" ? Object.freeze({ ...origin }) : origin, wrong === "owner" ? Object.freeze({}) : owner, wrong === "prepared" ? Object.freeze({ ...prepared }) : prepared]), observer, origin, token, reservation, publication, publish: (): void => { published = true; }, bodyConsumed: (): boolean => bodyConsumed, resumes, consumed: (): boolean => consumed, exit: (): void => { exited = true; } };
}
void test("original-held packet waits history consumption and observes both original serial finalizers within exact budget", async () => {
  const f = await fixture(false, false, false, false, false, 7); await f.observer.arm(); await f.observer.observeConstruction(); const packet = await f.observer.observePacket();
  assert.deepEqual(f.resumes, [...SEQUENCE, "bootstrap", ...Array.from({ length: 7 }, (_, index) => ["startupEntry", "startupReturn", index % 2 === 0 ? "initialFinally" : "queuedFinally"]).flat()]); assert.equal(f.consumed(), false); assert.equal(f.observer.retained().packetHeld, true);
  await assert.rejects(f.observer.releasePacket({ ...packet }, f.token)); assert.equal(f.consumed(), false);
  await f.observer.releasePacket(packet, f.token); assert.equal(f.consumed(), true); const completion = await f.observer.observeCompletion();
  assert.equal(completion.mainStructurePublicationVerified, false); assert.equal(completion.completeClosedSqlVerified, false); assert.equal(completion.persistenceVerified, false);
  assert.equal(f.observer.producerConstruction().originalSevenConstructorContinuationsObserved, true); assert.equal(f.observer.producerConstruction().completeUploadFrontierVerified, false);
  assert.equal(f.observer.retained().normalRequests, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS.normal); await f.observer.cleanup(); assert.equal(f.observer.retained().cleanupRequests, 15);
  assert.equal(f.observer.retained().resourcesClosed, true); await assert.rejects(f.observer.releasePacket(packet, f.token));
});
void test("an incomplete or mismatched structure packet is never resumed by cleanup", async () => {
  const f = await fixture(); await f.observer.arm(); await f.observer.observeConstruction(); await f.observer.observePacket(); await assert.rejects(f.observer.cleanup()); assert.deepEqual(f.resumes, [...SEQUENCE, "bootstrap"]);
  f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, [...SEQUENCE, "bootstrap"]); assert.equal(f.observer.retained().cleanupRequests, 6);
  const mismatch = await fixture(true); await mismatch.observer.arm(); await mismatch.observer.observeConstruction(); const packet = await mismatch.observer.observePacket();
  await assert.rejects(mismatch.observer.releasePacket(packet, mismatch.token), /EXACT_HISTORY_AND_METADATA_INTENT/u); assert.equal(mismatch.consumed(), true); assert.deepEqual(mismatch.resumes, [...SEQUENCE, "bootstrap"]);
  mismatch.exit(); await mismatch.observer.cleanup();
  const timer = await fixture(false, true); await timer.observer.arm(); await timer.observer.observeConstruction(); await assert.rejects(timer.observer.observePacket());
  assert.deepEqual(timer.resumes, [...SEQUENCE, "bootstrap"]); timer.exit(); await timer.observer.cleanup();
});

void test("foreign constructor receivers, callers and same-source callbacks never reach bootstrap resume", async () => {
  for (const changed of ["receiver", "callback", "caller"]) {
    const f = await fixture(false, false, changed === "receiver", changed === "callback", changed === "caller");
    await f.observer.arm(); await assert.rejects(f.observer.observeConstruction());
    assert.equal(f.resumes.includes("bootstrap"), false); assert.equal(f.consumed(), false);
    const before = [...f.resumes]; await assert.rejects(f.observer.cleanup()); f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
  }
});

void test("startup continuation requires the actual false predicate, undefined return and original serial finalizer before Save", async () => {
  for (const wrong of ["ready", "return", "finalizer", "save"]) {
    const f = await fixture(false, false, false, false, false, 1, wrong === "ready", wrong === "return", wrong === "finalizer", wrong === "save");
    await f.observer.arm(); await f.observer.observeConstruction(); await assert.rejects(f.observer.observePacket());
    assert.equal(f.resumes.includes("packet"), false); assert.equal(f.consumed(), false); const before = [...f.resumes]; f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
  }
});

void test("prehistory structure uses a separate consumed body reservation and actual publication, retaining history/frontier refusal", async () => {
  const f = await fixture(); await f.observer.arm(); await f.observer.observeConstruction(); const packet = await f.observer.observePacket();
  await assert.rejects(f.observer.releasePrehistoryPacket({ ...packet }, f.reservation)); assert.equal(f.bodyConsumed(), false);
  await f.observer.releasePrehistoryPacket(packet, f.reservation); assert.equal(f.bodyConsumed(), true); assert.equal(f.consumed(), false); assert.equal(f.resumes.at(-1), "packet");
  await assert.rejects(f.observer.observeCompletion(), /COMPLETION_CONSUMED/u); f.publish(); const result = await f.observer.observePrehistoryCompletion(f.publication);
  assert.equal(result.originalMainPublicationJoined, true); assert.equal(result.originalTaskAndBothSerialFinalizersObserved, true); assert.equal(result.originalHistorySqlCompleted, false); assert.equal(result.completeUploadFrontierVerified, false);
  assert.equal(f.observer.retained().completed, false); assert.equal(f.observer.retained().prehistoryCompleted, true); assert.equal(f.consumed(), false);
  await assert.rejects(f.observer.cleanup()); const before = [...f.resumes]; f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before); assert.equal(f.observer.retained().cleanupRequests, 6);
});
void test("foreign prehistory intent or publication stays held and never acquires the old history result", async () => {
  for (const fault of ["body", "publication"] as const) {
    const f = await fixture(false, false, false, false, false, 0, false, false, false, false, fault); await f.observer.arm(); await f.observer.observeConstruction(); const packet = await f.observer.observePacket();
    if (fault === "body") { await assert.rejects(f.observer.releasePrehistoryPacket(packet, f.reservation), /EXACT_BODY_AND_METADATA_INTENT/u); assert.equal(f.resumes.includes("packet"), false); }
    else { await f.observer.releasePrehistoryPacket(packet, f.reservation); f.publish(); await assert.rejects(f.observer.observePrehistoryCompletion(f.publication), /EXACT_MAIN_PUBLICATION/u); assert.equal(f.resumes.includes("response"), false); }
    assert.equal(f.consumed(), false); assert.equal(f.observer.retained().completed, false); assert.equal(f.observer.retained().prehistoryCompleted, false); const before = [...f.resumes]; f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
  }
});

void test("original PRIVATE mode refuses before EP and cannot resume its bootstrap as cleanup", async () => {
  const f = await fixture(false, false, false, false, false, 0, false, false, false, false, "mode"); await f.observer.arm();
  await assert.rejects(f.observer.observeConstruction(), /ORIGINAL_NONPRIVATE_MODE_REQUIRED/u); assert.equal(f.resumes.includes("bootstrap"), false); assert.equal(f.consumed(), false);
  const before = [...f.resumes]; f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
});

void test("explicit original constructor hold never resumes bootstrap or starts publication", async () => {
  const f = await fixture(); await f.observer.arm(); await f.observer.observeConstructionBeforeBootstrap();
  assert.deepEqual(f.resumes, [...SEQUENCE]); const data = f.observer.producerConstruction();
  assert.equal(data.originalSevenConstructorContinuationsObserved, true); assert.equal(data.completeUploadFrontierVerified, false);
  await assert.rejects(f.observer.observeConstruction()); assert.equal(f.resumes.at(-1), "producerProject");
  const before = [...f.resumes]; f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
});

void test("inverse bootstrap setup receives only its own active opaque hold and never resumes EP", async () => {
  const f = await fixture(false, false, false, false, false, 0, false, false, false, false, null, true);
  await f.observer.arm(); await f.observer.observeConstructionBeforeBootstrap(); const before = [...f.resumes], holds: object[] = []; let calls = 0;
  await f.observer.withOriginalFootprintInverseBootstrapHeld(async original => {
    calls += 1; holds.push(original); const args = f.lookupBootstrap(original);
    assert.ok(args !== null && typeof args === "object" && "project" in args); assert.equal(args.project, "project"); assert.equal(Object.isFrozen(args), true);
    assert.throws(() => f.lookupBootstrap(structuredClone(original)), /INVERSE_BOOTSTRAP_ORIGINAL/u);
    for (const wrong of ["observer", "owner", "origin", "prepared"] as const) { assert.throws(() => f.lookupBootstrap(original, wrong), /INVERSE_BOOTSTRAP_ORIGINAL/u); }
    await Promise.resolve(); assert.equal(f.lookupBootstrap(original), args);
  });
  assert.equal(calls, 1); assert.deepEqual(f.resumes, before); const [hold] = holds; assert.ok(hold !== undefined);
  assert.throws(() => f.lookupBootstrap(hold), /INVERSE_BOOTSTRAP_CHANGED/u);
  await assert.rejects(f.observer.withOriginalFootprintInverseBootstrapHeld(() => Promise.resolve()), /INVERSE_BOOTSTRAP_SETUP/u);
  const generated = await fixture(); await generated.observer.arm(); await generated.observer.observeConstructionBeforeBootstrap();
  await assert.rejects(generated.observer.withOriginalFootprintInverseBootstrapHeld(() => Promise.resolve()), /INVERSE_BOOTSTRAP_SETUP/u);
});
void test("failed inverse bootstrap setup stays consumed and retains original post-exit cleanup", async () => {
  const f = await fixture(false, false, false, false, false, 0, false, false, false, false, null, true);
  await f.observer.arm(); await f.observer.observeConstructionBeforeBootstrap(); const before = [...f.resumes]; const failure = new Error("inert setup refusal");
  await assert.rejects(f.observer.withOriginalFootprintInverseBootstrapHeld(async () => { await Promise.resolve(); throw failure; }), value => value === failure);
  assert.equal(f.observer.retained().failed, true); await assert.rejects(f.observer.withOriginalFootprintInverseBootstrapHeld(() => Promise.resolve()));
  f.exit(); await f.observer.cleanup(); assert.deepEqual(f.resumes, before);
});
