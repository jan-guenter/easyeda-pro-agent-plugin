/** Synthetic original transport and explicit source substitution for focused main-owner tests. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "../../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRole as Role } from "../../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../../src/current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID } from "../../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport, requireCurrentFootprintCopyMainCompletionOrigin, requireCurrentFootprintCopyMainRequestOrigin } from "../../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendFragments as fragments } from "./footprint-main-backend-fragments.ts";

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
export function mainBackendTransportFixture(): Readonly<{ transport: CurrentFootprintCopyMainBackendTransport; commands: Command[]; state: {
  current: boolean; wrongSource: boolean; foreignPause: boolean; duplicateResume: boolean; sendFailure: string; malformedChunk: boolean; resumeCount: number; polls: number;
  registrationColumnDelta: number; foreignRegistrationScript: boolean;
  metadataShapeRole: string; sendFailureText: string; sendError: Error | null;
} }> {
  const commands: Command[] = [], queue: string[] = [];
  const state = { current: true, wrongSource: false, foreignPause: false, duplicateResume: false, sendFailure: "", malformedChunk: false, resumeCount: 0, polls: 0,
    registrationColumnDelta: 0, foreignRegistrationScript: false, metadataShapeRole: "", sendFailureText: "lost original send acknowledgment", sendError: null as Error | null };
  const event = (method: string, params: Data): void => { queue.push(`${JSON.stringify({ method, params })}\0`); };
  function response(command: Command): unknown {
    if (command.phase === "debugger-enable") { return { debuggerId: "main-debugger" }; }
    if (command.phase === "registration-arm") { return { breakpointId: REGISTRATION_ID, locations: [] }; }
    if (command.phase === "run-waiting") { event("Debugger.paused", { reason: state.foreignPause ? "other" : "Break on start", hitBreakpoints: [], callFrames: [{ callFrameId: "initial-frame", location: { scriptId: "internal", lineNumber: 1, columnNumber: 0 } }] }); return {}; }
    if (command.phase === "resume") {
      state.resumeCount += 1; event("Debugger.resumed", {}); if (state.duplicateResume) { event("Debugger.resumed", {}); }
      if (state.resumeCount === 1) {
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
    if (command.phase === "properties") {
      const id = command.params.objectId;
      if (id === state.metadataShapeRole) { return { result: [{ value: { className: "sensitive-foreign-value" } }] }; }
      if (id === "capture") { return array(); }
      if (id === "Date" || id === "now") { return nativeMetadata(id); }
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
