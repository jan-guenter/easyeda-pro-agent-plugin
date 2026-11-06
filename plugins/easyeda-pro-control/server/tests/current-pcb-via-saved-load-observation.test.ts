/** Synthetic correlated Inspector replies exercise the real fixed collector.
 * They issue no native owner, cache exclusion or saved/reopened authority. */
/* oxlint-disable import/max-dependencies -- One bounded cold-loading collector joins fixed source/metadata, exact chunks and actual finite wire programs. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { createContext, runInContext, runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE, CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE_CALLS } from "../src/current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_FETCH_BYTES_PROFILES as BYTES, CURRENT_NATIVE_FETCH_BYTES_CALLS as BYTES_CALLS } from "../src/current-native-fetch-bytes-intrinsics.ts";
import type { CurrentNativeFunctionProfile } from "../src/current-native-function-metadata.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as BUDGET, currentPcbViaSavedLoadObservationCases, validateCurrentPcbViaSavedLoadObservationCommand } from "../src/current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadObservationCommand } from "../src/current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadObserver, CurrentPcbViaSavedLoadObserverBindings } from "../src/current-pcb-via-saved-load-observer.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_CALLS as PROGRAMS } from "../src/current-pcb-via-saved-load-programs.ts";
import type { CurrentPcbViaSavedLoadData } from "../src/current-pcb-via-saved-load-plan.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS as FLOW, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "../src/current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "../src/current-pcb-via-saved-load-source.ts";
import { currentPcbViaSavedLoadWorkerFrame, currentPcbViaSavedLoadWorkerNativeFrame, currentPcbViaSavedLoadWorkerWire } from "../src/current-pcb-via-saved-load-worker-wire.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";

const hash = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
function fixtureData(): CurrentPcbViaSavedLoadData {
  const documentUuid = "d".repeat(32), historyUuid = "e".repeat(32), projectUuid = "a".repeat(64);
  return freezeDeep({ projectUuid, branchUuid: "b".repeat(32), documentUuid, headHistoryUuid: historyUuid, sourceSha256: hash("source"), logicalSha256: hash("logical"), projectionSourceSha256: hash("projection"),
    histories: [{ uuid: historyUuid, num: 1, key: "0".repeat(32), iv: historyUuid, dataStrUrl: `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${historyUuid}` }],
    chunks: ([0, 1] as const).map(ordinal => { const cipher = Buffer.from(`cipher-${String(ordinal)}`), dataUuid = ordinal === 0 ? historyUuid : `${historyUuid}-1`;
      const plaintext = `{"type":"EDIT_HEAD"}||{"actor":"synthetic-${String(ordinal)}"}|\n{"type":"DOCHEAD"}||{"uuid":"${documentUuid}","docType":"PCB"}|\n{"type":"VIA"}||{"id":"${String(ordinal)}"}|\n`;
      return { historyUuid, ordinal, dataUuid, fetchUrl: `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${dataUuid}`, keyHex: "0".repeat(32), dataBase64: cipher.toString("base64"), cipherSha256: hash(cipher), plaintext, plaintextSha256: hash(plaintext) }; }),
    nativeLoadingVerified: false, cacheExclusionVerified: false, reopenedVerified: false });
}
const property = (name: string, value: unknown, writable = false, enumerable = false, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
const arrayCapture = (objectId: string, count: number): object => ({ result: { type: "object", subtype: "array", className: "Array", objectId, description: `Array(${String(count)})` } });
function array(count: number, prefix: string): object {
  return { result: [...Array.from({ length: count }, (_, index) => property(String(index), { type: "object", objectId: `${prefix}-${String(index)}` }, true, true)), property("length", { type: "number", value: count }, true, false, false)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
}
function native(profile: CurrentNativeFunctionProfile): Record<string, unknown> {
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (profile.constructor) { result.push(property("prototype", { type: "object", className: profile.name, description: profile.name, objectId: "native-prototype" }, false, false, false)); }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", description: profile.parentDescription ?? "function () { [native code] }", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", className: "Array", subtype: "internal#scopeList", description: "Scopes[0]", objectId: "native-scopes" } }] };
}
function dataReply(data: CurrentPcbViaSavedLoadData, role: CurrentPcbViaSavedLoadRole, ordinal: number): object {
  const project = { uuid: data.projectUuid, branchUuid: role === "branch" ? null : data.branchUuid, isOpening: role !== "ready", isReady: role === "ready",
    ...(role === "branch" ? {} : { cacheName: `project_${data.projectUuid}_v6`, localCacheName: `localProject_${data.projectUuid}_v1` }) };
  const final = { ...data.histories[0], editHead: [{ actor: "synthetic-0" }, { actor: "synthetic-1" }], docs: [{ [data.documentUuid]: 0 }, { [data.documentUuid]: 0 }], docIds: [[data.documentUuid], [data.documentUuid]] };
  let result: unknown;
  if (role === "branch") { result = { project, branchUuid: data.branchUuid, historyUuid: data.headHistoryUuid }; }
  else if (role === "cold") { result = { project, emptyLocalIndex: true }; }
  else if (role === "histories" || role === "parsed") { result = { project, historyUuid: data.headHistoryUuid, histories: role === "histories" ? data.histories : [final] }; }
  else if (role === "ready") { result = { project, histories: [final] }; }
  else { const chunk = data.chunks[ordinal]; assert.ok(chunk !== undefined); result = { history: data.histories[0], url: chunk.fetchUrl, snapshot: true, debugUndefined: false,
    ...(["bytes", "plaintext"].includes(role) ? { bytes: [...Buffer.from(chunk.dataBase64, "base64")] } : {}), ...(role === "plaintext" ? { plaintext: chunk.plaintext } : {}) }; }
  return { result: { type: "object", value: result } };
}
async function collector(fault: "none" | "cipher" | "callee" = "none"): Promise<Readonly<{ observer: CurrentPcbViaSavedLoadObserver; calls: CurrentPcbViaSavedLoadObservationCommand[]; helpers: string[]; failed: () => boolean }>> {
  const calls: CurrentPcbViaSavedLoadObservationCommand[] = [], data = fixtureData(), helpers: string[] = [];
  let eventIndex = 0, failed = false, ordinal = 0, paused = false, reserved: CurrentPcbViaSavedLoadRole | null = null;
  const order: CurrentPcbViaSavedLoadRole[] = ["branch", "cold", "histories", "fetchEntry", "fetchEntry", "response", "response", "bytes", "bytes", "plaintext", "plaintext", "parsed", "ready"];
  const counts = new Map<CurrentPcbViaSavedLoadRole, number>();
  const bindings: CurrentPcbViaSavedLoadObserverBindings = Object.freeze({ source: Object.freeze({ instrumentationBreakpointId: "instrument", scriptId: "project-script", uniqueContextId: "original-context", executionContextId: 7, source: "explicit-source-seam" }), sessionId: "worker-session", data,
    assertCurrent: (): Promise<void> => { assert.equal(failed, false); return Promise.resolve(); }, fail: (): void => { failed = true; }, whenProjectStarted: (): Promise<void> => Promise.resolve(),
    helper: (source: string): Promise<void> => { helpers.push(source); return Promise.resolve(); }, registerPoint: (role: CurrentPcbViaSavedLoadRole, id: string): void => { assert.equal(id, `point-${role}`); }, reserveResume: (role: CurrentPcbViaSavedLoadRole): void => { assert.equal(reserved, null); reserved = role; },
    nextEvent: (): Promise<{ method: string; sessionId: string; params: Record<string, unknown> }> => {
      const role = order[eventIndex]; assert.ok(role !== undefined); const site = SITES[role];
      if (paused) { assert.equal(reserved, role); paused = false; reserved = null; eventIndex += 1; return Promise.resolve({ method: "Debugger.resumed", sessionId: "worker-session", params: {} }); }
      ordinal = counts.get(role) ?? 0; counts.set(role, ordinal + 1); paused = true;
      return Promise.resolve({ method: "Debugger.paused", sessionId: "worker-session", params: { reason: "other", hitBreakpoints: [`point-${role}`], callFrames: [{ callFrameId: "actual-frame", functionName: site.functionName,
        location: { scriptId: "project-script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "project-script", lineNumber: site.functionLine, columnNumber: site.functionColumn } }] } });
    },
    request: (command: CurrentPcbViaSavedLoadObservationCommand): Promise<unknown> => {
      calls.push(command); validateCurrentPcbViaSavedLoadObservationCommand(command);
      if (command.phase === "saved-observe-intrinsic") { const count = { cacheConstructors: 4, cacheMembers: 28, cacheReprove: 0, bytesConstructors: 4, bytesMembers: 7, bytesReprove: 0 }[command.role];
        return Promise.resolve(command.role.endsWith("Reprove") ? { result: { type: "boolean", value: true } } : arrayCapture(command.role, count)); }
      if (command.phase === "saved-observe-array") { const count = { cacheConstructors: 4, cacheMembers: 28, bytesConstructors: 4, bytesMembers: 7, project: 3, flowEntry: 6, flowFunctions: 2 }[command.role]; return Promise.resolve(array(count, command.role)); }
      if (command.phase === "saved-observe-native") { const profile = (command.role === "cache" ? CACHE : BYTES).find(row => row.index === command.index); assert.ok(profile !== undefined); const reply = native(profile);
        if (fault === "callee" && command.role === "bytes" && command.index === 3) { reply["internalProperties"] = []; } return Promise.resolve(reply); }
      if (command.phase === "saved-observe-arm") { return Promise.resolve({ breakpointId: `point-${command.role}`, actualLocation: command.params.location }); }
      if (command.phase === "saved-observe-frame") { return Promise.resolve(arrayCapture(`frame-${command.role}-${String(ordinal)}`, SITES[command.role].length)); }
      if (command.phase === "saved-observe-flow-functions") { return Promise.resolve(arrayCapture("flow-functions", 2)); }
      if (command.phase === "saved-observe-flow-method") { const expected = FLOW[command.role]; return Promise.resolve({ result: [property("name", { type: "string", value: expected.name }), property("length", { type: "number", value: expected.arity })],
        internalProperties: [{ name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "scopes" } },
          { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "project-script", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } }] }); }
      if (command.phase === "saved-observe-value") { const packet = dataReply(data, command.role, ordinal);
        return Promise.resolve(fault === "cipher" && command.role === "bytes" ? { result: { type: "object", value: { bytes: [0] } } } : packet); }
      return Promise.resolve({});
    } });
  const url = new URL("../src/current-pcb-via-saved-load-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" }); const loaded = { exports: {} as Record<string, unknown> };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => { const actual: unknown = sourceRequire(name); if (name === "./current-pcb-via-saved-load-source.ts") { assert.ok(actual !== null && typeof actual === "object"); return { ...actual, qualifyCurrentPcbViaSavedLoadSource: (source: unknown): void => { assert.equal(source, "explicit-source-seam"); } }; } return actual; }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedLoadObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit full-source-byte seam above changes; actual collector, protocol, metadata and progress guards execute unchanged.
  const observer = Reflect.construct(Constructor, [bindings]) as CurrentPcbViaSavedLoadObserver; return { observer, calls, helpers, failed: () => failed };
}
void test("actual collector handles interleaved two-chunk loads, exact closures, helper receipts and resumes within the derived reservation", async () => {
  const f = await collector(); const arm = f.observer.arm(); assert.equal(f.observer.arm(), arm); await arm;
  const work = f.observer.observe(); assert.equal(f.observer.observe(), work); const result = await work;
  assert.equal(f.calls.length + f.helpers.length + 1, BUDGET.total); assert.equal(f.helpers.length, 34); assert.equal(f.calls.filter(call => call.phase === "saved-observe-resume").length, 13);
  assert.equal(result.exactCipherAndPlaintextChunks, 2); assert.equal(result.nativeOwnershipVerified, false); assert.equal(result.reopenedVerified, false); assert.equal(result.cachePublicationCompleted, false);
});
void test("foreign fetch metadata and changed held body refuse before their source continuation and retain original rejected work", async () => {
  const metadata = await collector("callee"); const arm = metadata.observer.arm(); await assert.rejects(arm); assert.equal(metadata.observer.arm(), arm);
  assert.equal(metadata.calls.some(call => call.phase === "saved-observe-arm"), false); assert.equal(metadata.failed(), true);
  const body = await collector("cipher"); await body.observer.arm(); const work = body.observer.observe(); await assert.rejects(work); assert.equal(body.observer.observe(), work);
  assert.equal(body.calls.some(call => call.phase === "saved-observe-resume" && call.role === "bytes"), false); assert.equal(body.failed(), true);
});
void test("wire omits original constructor realm selectors and refusal points have no inspect/resume grammar", () => {
  for (const command of currentPcbViaSavedLoadObservationCases()) {
    const wire = currentPcbViaSavedLoadWorkerWire(command, 30);
    if (command.phase === "saved-observe-intrinsic" && command.role.endsWith("Constructors")) { assert.equal(Object.hasOwn(wire.request, "uniqueContextId"), false); }
    const pair = { targetId: "target", browserSessionId: "browser", pageSessionId: "page", title: "title", url: "https://client/" };
    const bytes = Buffer.from(`${JSON.stringify(currentPcbViaSavedLoadWorkerFrame(command, 30, pair))}\0`);
    assert.deepEqual(currentPcbViaSavedLoadWorkerNativeFrame(bytes, command, pair), wire.request);
  }
  for (const role of ["warm", "pending", "fallback", "failed"]) { assert.throws(() => validateCurrentPcbViaSavedLoadObservationCommand({ phase: "saved-observe-resume", role, method: "Debugger.resume", params: {} })); }
});

void test("fixed held-body snapshots read absent branch backing and exact bytes without invoking fetch or application accessors", () => {
  const context = createContext({});
  runInContext(`let invoked=0;function Cache(){};function CacheStorage(){};function Response(){};
for(const[prototype,names]of [[Cache.prototype,["put","match","delete","keys"]],[CacheStorage.prototype,["open","keys","has","delete"]],[Response.prototype,["clone","arrayBuffer"]]])for(const key of names)Object.defineProperty(prototype,key,{value:function(){invoked++;throw Error("method")},enumerable:true,writable:true,configurable:true});
for(const key of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])Object.defineProperty(Response.prototype,key,{get:function(){if(key==="ok")return true;invoked++;throw Error("getter")},enumerable:true,configurable:true});
Object.defineProperty(globalThis,"caches",{get:function(){invoked++;throw Error("caches")},enumerable:true,configurable:true});
Object.defineProperty(globalThis,"fetch",{value:function(){invoked++;throw Error("fetch")},writable:true,enumerable:true,configurable:true});
const cacheCtors=(${CACHE_CALLS.constructors.program})(),cache=(${CACHE_CALLS.members.program}).call(cacheCtors);
const bytesCtors=(${BYTES_CALLS.constructors.program})(),bytes=(${BYTES_CALLS.members.program}).call(bytesCtors);
globalThis.PROJECT={uuid:"project",_isV2Format:false,debugOpen:false,isOpening:true,isReady:false};
const flow={update:function(){invoked++;throw Error("update")},end:function(){invoked++;throw Error("end")}};
const response=Object.create(Response.prototype),buffer=new Uint8Array([0,255,42]).buffer;`, context);
  const branch: unknown = runInContext(`(${PROGRAMS.branch}).call([PROJECT,"branch","head"],cache,bytes,PROJECT)`, context);
  assert.ok(branch !== null && typeof branch === "object" && "project" in branch && branch.project !== null && typeof branch.project === "object" && "branchUuid" in branch.project); assert.equal(branch.project.branchUuid, null);
  const body: unknown = runInContext(`(${PROGRAMS.plaintext}).call([{},"/data",true,flow,false,response,buffer,"plain",fetch],cache,bytes,PROJECT)`, context);
  assert.ok(body !== null && typeof body === "object" && "bytes" in body && "plaintext" in body); assert.ok(Array.isArray(body.bytes)); assert.deepEqual(Array.from(body.bytes, (item: unknown): unknown => item), [0, 255, 42]); assert.equal(body.plaintext, "plain");
  assert.equal(runInContext("invoked", context), 0);
  runInContext('Object.defineProperty(PROJECT,"uuid",{get:function(){invoked++;throw Error("application")},configurable:true})', context);
  assert.throws(() => runInContext(`(${PROGRAMS.branch}).call([PROJECT,"branch","head"],cache,bytes,PROJECT)`, context)); assert.equal(runInContext("invoked", context), 0);
});
