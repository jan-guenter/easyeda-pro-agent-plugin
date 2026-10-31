/** Synthetic original transport and explicit source substitution for focused main-owner tests. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "../../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRole as Role } from "../../src/current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID } from "../../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport, requireCurrentFootprintCopyMainCompletionOrigin, requireCurrentFootprintCopyMainRequestOrigin } from "../../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendFragments as fragments } from "./footprint-main-backend-fragments.ts";
import { CONTEXT_SOURCE, CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS } from "./footprint-head-age-backend-data.ts";

type Data = Record<string, unknown>;
const qualified = Object.freeze({ profile: "private.current-footprint-copy-main-backend-source.v1", sha256: SOURCE.sha256, runtimeBound: false, executionAuthorized: false });
export async function mainBackendModule(overrides: Readonly<Record<string, unknown>> = {}): Promise<Readonly<{ Constructor: typeof CurrentFootprintCopyMainBackendRunner; requireRequest: typeof requireCurrentFootprintCopyMainRequestOrigin; requireCompletion: typeof requireCurrentFootprintCopyMainCompletionOrigin }>> {
  const path = new URL("../../src/current-footprint-copy-main-backend-runner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = vm.runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  const source: unknown = originalRequire("./current-footprint-copy-main-backend-source.ts"); assert.ok(source !== null && typeof source === "object");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (Object.hasOwn(overrides, specifier)) { return overrides[specifier]; }
    if (specifier === "./current-footprint-copy-main-backend-source.ts") { return { ...source,
      qualifyCurrentFootprintCopyMainBackendSource: (value: unknown): typeof qualified => { assert.equal(value, "synthetic-complete-app-source"); return qualified; },
      requireCurrentFootprintCopyMainBackendSource: (value: unknown): void => { assert.equal(value, qualified); } }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentFootprintCopyMainBackendRunner"]; assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The original class is loaded with one explicitly synthetic full-source issuer and identity checker.
  const Constructor = result as typeof CurrentFootprintCopyMainBackendRunner;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual evaluated module exports are checked by each test through their genuine private maps.
  return { Constructor, requireRequest: loaded.exports["requireCurrentFootprintCopyMainRequestOrigin"] as typeof requireCurrentFootprintCopyMainRequestOrigin, requireCompletion: loaded.exports["requireCurrentFootprintCopyMainCompletionOrigin"] as typeof requireCurrentFootprintCopyMainCompletionOrigin };
}
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function internal(native: boolean, async = false): Data[] {
  return [{ name: "[[Prototype]]", value: { type: async ? "object" : "function", className: async ? "AsyncFunction" : "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: native ? "Scopes[0]" : "Scopes[1]", objectId: "scopes" } }];
}
function metadata(role: Role): Data {
  const profile = SOURCE.functions[role], result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (!profile.async) { result.push(property("prototype", { type: "object", className: "Object", objectId: "router-prototype" }, true, false, false)); }
  return { result, internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
    scriptId: "app", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } }, ...internal(false, profile.async)] };
}
function nativeMetadata(role: "Date" | "now"): Data {
  const result = [property("name", { type: "string", value: role }), property("length", { type: "number", value: role === "Date" ? 7 : 0 })];
  if (role === "Date") {
    result.push(property("prototype", { type: "object", className: "Object", objectId: "date-prototype" }, false, false, false));
    for (const name of ["now", "parse", "UTC"]) { result.push(property(name, { type: "function", className: "Function", objectId: `native-${name}`, description: `function ${name}() { [native code] }` }, true)); }
  }
  return { result, internalProperties: internal(true) };
}
function array(): Data {
  const roles = new Map<number, Role>([[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"], [12, "dateParser"]]);
  const result = Array.from({ length: 13 }, (_, index) => {
    const role = roles.get(index); let value: Data = { type: "object", objectId: `member-${String(index)}` };
    if (role !== undefined) { value = { type: "function", className: SOURCE.functions[role].async ? "AsyncFunction" : "Function", description: fragments[role], objectId: role }; }
    else if (index === 10 || index === 11) { value = { type: "function", className: "Function", objectId: index === 10 ? "Date" : "now" }; }
    return property(String(index), value, true, true);
  });
  result.push(property("length", { type: "number", value: 13 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
function remoteArray(values: readonly Data[]): Data {
  return { result: [...values.map((value, index) => property(String(index), value, true, true)), property("length", { type: "number", value: values.length }, true, false, false)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
function contextAccessor(role: "getter" | "setter", scriptId: string): Data {
  const pin = CONTEXT_SOURCE[role];
  return { result: [property("name", { type: "string", value: pin.name }), property("length", { type: "number", value: pin.arity })],
    internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, lineNumber: pin.lineNumber, columnNumber: pin.columnNumber } } },
      { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[3]", objectId: `${role}-scopes` } }] };
}
export function mainBackendTransportFixture(headAge = false): Readonly<{ transport: CurrentFootprintCopyMainBackendTransport; commands: Command[]; state: {
  current: boolean; wrongSource: boolean; foreignPause: boolean; duplicateResume: boolean; sendFailure: string; malformedChunk: boolean; resumeCount: number; polls: number;
  registrationColumnDelta: number; foreignRegistrationScript: boolean;
  metadataShapeRole: string; sendFailureText: string; sendError: Error | null;
  bootstrap: "unique" | "missing" | "duplicate"; contextScriptId: string; headAgeExceptionPhase: string; headAgeExceptionReply: unknown;
} }> {
  const commands: Command[] = [], queue: string[] = [];
  const state = { current: true, wrongSource: false, foreignPause: false, duplicateResume: false, sendFailure: "", malformedChunk: false, resumeCount: 0, polls: 0,
    registrationColumnDelta: 0, foreignRegistrationScript: false, metadataShapeRole: "", sendFailureText: "lost original send acknowledgment", sendError: null as Error | null,
    bootstrap: "unique" as "unique" | "missing" | "duplicate", contextScriptId: "bootstrap", headAgeExceptionPhase: "", headAgeExceptionReply: null as unknown };
  const event = (method: string, params: Data): void => { queue.push(`${JSON.stringify({ method, params })}\0`); };
  function response(command: Command): unknown {
    if (command.phase === state.headAgeExceptionPhase) { return state.headAgeExceptionReply; }
    if (command.phase === "debugger-enable") { return { debuggerId: "main-debugger" }; }
    if (command.phase === "registration-arm") { return { breakpointId: REGISTRATION_ID, locations: [] }; }
    if (command.phase === "run-waiting") { event("Debugger.paused", { reason: state.foreignPause ? "other" : "Break on start", hitBreakpoints: [], callFrames: [{ callFrameId: "initial-frame", location: { scriptId: "internal", lineNumber: 1, columnNumber: 0 } }] }); return {}; }
    if (command.phase === "resume") {
      state.resumeCount += 1; event("Debugger.resumed", {}); if (state.duplicateResume) { event("Debugger.resumed", {}); }
      if (state.resumeCount === 1) {
        if (headAge && state.bootstrap !== "missing") {
          const bootstrap = { scriptId: "bootstrap", url: CONTEXT_SOURCE.url, executionContextId: 1, startLine: 0, startColumn: 0, endLine: 479, endColumn: 0,
            length: 15_939, isLiveEdit: false, hasSourceURL: false, isModule: false, scriptLanguage: "JavaScript", embedderName: CONTEXT_SOURCE.url };
          event("Debugger.scriptParsed", bootstrap); if (state.bootstrap === "duplicate") { event("Debugger.scriptParsed", bootstrap); }
        }
        const registeredLocation = { scriptId: state.foreignRegistrationScript ? "foreign" : "app", lineNumber: SOURCE.registration.https.lineNumber,
          columnNumber: SOURCE.registration.https.breakpointColumnNumber + state.registrationColumnDelta };
        event("Debugger.scriptParsed", { scriptId: "app", url: "file:///synthetic/app.js", executionContextId: 1 });
        event("Debugger.breakpointResolved", { breakpointId: REGISTRATION_ID, location: registeredLocation });
        event("Debugger.paused", { reason: "other", hitBreakpoints: [REGISTRATION_ID], callFrames: [{ callFrameId: "registration-frame", location: registeredLocation }] });
      }
      return {};
    }
    if (command.phase === "source") { return { scriptSource: state.wrongSource ? "drift" : "synthetic-complete-app-source" }; }
    if (command.phase === "frame" || command.phase === "capture") { return { result: { type: "object", subtype: "array", className: "Array", description: command.phase === "frame" ? "Array(9)" : "Array(13)", objectId: command.phase } }; }
    if (command.phase === "require") { return { result: { type: "boolean", value: true } }; }
    if (command.phase === "head-age-context-source") { return { scriptSource: "s".repeat(CONTEXT_SOURCE.bytes) }; }
    if (command.phase === "head-age-context-capture" || command.phase === "head-age-context-bind" || command.phase === "head-age-capture") {
      const counts = { "head-age-context-capture": 4, "head-age-context-bind": 5, "head-age-capture": 16 };
      const count = counts[command.phase];
      return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${count})`, objectId: command.phase } };
    }
    if (command.phase === "properties") {
      const id = command.params.objectId;
      if (id === state.metadataShapeRole) { return { result: [{ value: { className: "sensitive-foreign-value" } }] }; }
      if (id === "capture") { return array(); }
      if (id === "Date" || id === "now") { return nativeMetadata(id); }
      if (headAge && id === "head-age-context-capture") {
        return remoteArray([{ type: "object", objectId: "capture" }, { type: "object", objectId: "global" },
          ...(["getter", "setter"] as const).map(role => ({ type: "function", className: "Function", description: CONTEXT_SOURCE[role].text, objectId: role }))]);
      }
      if (headAge && (id === "getter" || id === "setter")) { return contextAccessor(id, state.contextScriptId); }
      if (headAge && (id === "getter-scopes" || id === "setter-scopes")) {
        return { result: ["Closure (setupProcessObject)", "Closure", "Global"].map((description, index) => property(String(index),
          { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${id}-${index}` }, true, true)) };
      }
      if (headAge && id === "head-age-capture") {
        const values: Data[] = Array.from({ length: 16 }, (_, index) => ({ type: "object", objectId: `head-${index}` }));
        for (const [index, name] of CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS.entries()) { values[index + 5] = { type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId: `head-method-${name}` }; }
        return remoteArray(values);
      }
      if (headAge && id.startsWith("head-method-")) {
        const name = id.slice("head-method-".length); assert.ok(CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS.some(value => value === name));
        return { result: [property("name", { type: "string", value: name }), property("length", { type: "number", value: 0 })], internalProperties: internal(true) };
      }
      assert.ok(Object.hasOwn(SOURCE.functions, id));
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Above membership check restricts this synthetic remote handle to the exact seven role literals.
      return metadata(id as Role);
    }
    return {};
  }
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent(): Promise<void> { assert.ok(state.current, "original transport lost"); return Promise.resolve(); },
    send(command: Command, id: number): Promise<void> {
      assert.equal(id, commands.length + 1); commands.push(command);
      if (state.sendFailure === command.phase) { return Promise.reject(state.sendError ?? new Error(state.sendFailureText)); }
      const result = response(command); queue.push(`${JSON.stringify({ id, result })}\0`); return Promise.resolve();
    },
    poll(): Promise<string> { state.polls += 1; if (state.malformedChunk) { return Promise.resolve("===="); } return Promise.resolve(Buffer.from(queue.shift() ?? "").toString("base64")); },
  });
  return { transport, commands, state };
}
