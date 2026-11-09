/** Synthetic correlated Inspector replies exercise the real fixed collector.
 * They issue no native owner, cache exclusion or saved/reopened authority. */
/* oxlint-disable import/max-dependencies -- One bounded cold-loading collector joins fixed source/metadata, exact chunks and actual finite wire programs. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE } from "../src/current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_FETCH_BYTES_PROFILES as BYTES } from "../src/current-native-fetch-bytes-intrinsics.ts";
import type { CurrentNativeFunctionProfile } from "../src/current-native-function-metadata.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as BUDGET, validateCurrentPcbViaSavedLoadObservationCommand } from "../src/current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadObservationCommand } from "../src/current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentSchematicRelevanceSavedColdObserver, CurrentSchematicRelevanceSavedColdObserverBindings } from "../src/current-schematic-relevance-saved-cold-observer.ts";
import type { GeneratedSchematicRelevanceSavedLoadData } from "../src/generated-schematic-relevance-saved-load-plan.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS as FLOW, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "../src/current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "../src/current-pcb-via-saved-load-source.ts";
import { deriveCurrentSchematicRelevanceSavedColdMetadata } from "../src/current-schematic-relevance-saved-cold-metadata.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";

const hash = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");
function fixtureData(): GeneratedSchematicRelevanceSavedLoadData {
  const documentUuid = "d".repeat(32), historyUuid = "e".repeat(32), projectUuid = "a".repeat(64);
  return freezeDeep({ projectUuid, branchUuid: "b".repeat(32), documentUuid, headHistoryUuid: historyUuid, schema: "private.generated-schematic-relevance-saved-load-data.v1", schematicUuid: "f".repeat(32), sourceSha256: hash("source"), logicalSha256: hash("logical"), projectionSourceSha256: hash("projection"),
    histories: [{ uuid: historyUuid, num: 1, key: "0".repeat(32), iv: historyUuid, dataStrUrl: `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${historyUuid}` }],
    chunks: ([0, 1] as const).map(ordinal => { const cipher = Buffer.from(`cipher-${String(ordinal)}`.repeat(128)), dataUuid = ordinal === 0 ? historyUuid : `${historyUuid}-1`;
      const parent = ordinal === 0 ? `{"type":"DOCHEAD"}||{"uuid":"${"f".repeat(32)}","docType":"SCH"}|\n{"type":"META"}||{"id":"parent"}|\n` : "";
      const plaintext = `{"type":"EDIT_HEAD"}||{"actor":"synthetic-${String(ordinal)}"}|\n${parent}{"type":"DOCHEAD"}||{"uuid":"${documentUuid}","docType":"SCH_PAGE"}|\n{"type":"TEXT"}||{"id":"${String(ordinal)}"}${ordinal === 0 ? "|\n" : ""}`;
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
function dataReply(data: GeneratedSchematicRelevanceSavedLoadData, role: CurrentPcbViaSavedLoadRole, ordinal: number): object {
  const project = { uuid: data.projectUuid, branchUuid: role === "branch" ? null : data.branchUuid, isOpening: role !== "ready", isReady: role === "ready",
    ...(role === "branch" ? {} : { cacheName: `project_${data.projectUuid}_v6`, localCacheName: `localProject_${data.projectUuid}_v1` }) };
  const final = deriveCurrentSchematicRelevanceSavedColdMetadata(data)[0]; assert.ok(final !== undefined);
  let result: unknown;
  if (role === "branch") { result = { project, branchUuid: data.branchUuid, historyUuid: data.headHistoryUuid }; }
  else if (role === "cold") { result = { project, emptyLocalIndex: true }; }
  else if (role === "histories" || role === "parsed") { result = { project, historyUuid: data.headHistoryUuid, histories: role === "histories" ? data.histories : [final] }; }
  else if (role === "ready") { result = { project, histories: [final] }; }
  else { const chunk = data.chunks[ordinal]; assert.ok(chunk !== undefined); result = { history: data.histories[0], url: chunk.fetchUrl, snapshot: true, debugUndefined: false,
    ...(["bytes", "plaintext"].includes(role) ? { bytes: [...Buffer.from(chunk.dataBase64, "base64")] } : {}), ...(role === "plaintext" ? { plaintext: chunk.plaintext } : {}) }; }
  return { result: { type: "object", value: result } };
}
async function collector(fault: "none" | "cipher" | "callee" = "none"): Promise<Readonly<{ observer: CurrentSchematicRelevanceSavedColdObserver; calls: CurrentPcbViaSavedLoadObservationCommand[]; helpers: string[]; failed: () => boolean }>> {
  const calls: CurrentPcbViaSavedLoadObservationCommand[] = [], data = fixtureData(), helpers: string[] = [];
  let eventIndex = 0, failed = false, ordinal = 0, paused = false, reserved: CurrentPcbViaSavedLoadRole | null = null;
  const order: CurrentPcbViaSavedLoadRole[] = ["branch", "cold", "histories", "fetchEntry", "fetchEntry", "response", "response", "bytes", "bytes", "plaintext", "plaintext", "parsed", "ready"];
  const counts = new Map<CurrentPcbViaSavedLoadRole, number>();
  const bindings: CurrentSchematicRelevanceSavedColdObserverBindings = Object.freeze({ source: Object.freeze({ instrumentationBreakpointId: "instrument", scriptId: "project-script", uniqueContextId: "original-context", executionContextId: 7, source: "explicit-source-seam" }), sessionId: "worker-session", data,
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
  const url = new URL("../src/current-schematic-relevance-saved-cold-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" }); const loaded = { exports: {} as Record<string, unknown> };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => { const actual: unknown = sourceRequire(name); if (name === "./current-pcb-via-saved-load-source.ts") { assert.ok(actual !== null && typeof actual === "object"); return { ...actual, qualifyCurrentPcbViaSavedLoadSource: (source: unknown): void => { assert.equal(source, "explicit-source-seam"); } }; } return actual; }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicRelevanceSavedColdObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit full-source-byte seam above changes; actual collector, protocol, metadata and progress guards execute unchanged.
  const observer = Reflect.construct(Constructor, [bindings]) as CurrentSchematicRelevanceSavedColdObserver; return { observer, calls, helpers, failed: () => failed };
}
void test("SCH collector proves both parent/page metadata and unterminated Save chunk through exact closures and13 original resumes", async () => {
  const f = await collector(); const arm = f.observer.arm(); assert.equal(f.observer.arm(), arm); await arm;
  const work = f.observer.observe(); assert.equal(f.observer.observe(), work); const result = await work;
  assert.equal(f.calls.length + f.helpers.length + 1, BUDGET.total); assert.equal(f.helpers.length, 34); assert.equal(f.calls.filter(call => call.phase === "saved-observe-resume").length, 13);
  assert.equal(result.exactCipherAndPlaintextChunks, 2); assert.equal(result.nativeOwnershipVerified, false); assert.equal(result.reopenedVerified, false); assert.equal(result.cachePublicationCompleted, false);
});
void test("SCH foreign fetch metadata and changed held body refuse before their source continuation and retain original rejected work", async () => {
  const metadata = await collector("callee"); const arm = metadata.observer.arm(); await assert.rejects(arm); assert.equal(metadata.observer.arm(), arm);
  assert.equal(metadata.calls.some(call => call.phase === "saved-observe-arm"), false); assert.equal(metadata.failed(), true);
  const body = await collector("cipher"); await body.observer.arm(); const work = body.observer.observe(); await assert.rejects(work); assert.equal(body.observer.observe(), work);
  assert.equal(body.calls.some(call => call.phase === "saved-observe-resume" && call.role === "bytes"), false); assert.equal(body.failed(), true);
});
