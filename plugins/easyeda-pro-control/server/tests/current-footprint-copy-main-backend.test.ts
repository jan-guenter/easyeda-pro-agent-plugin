/* oxlint-disable import/max-dependencies -- Compare the source, command grammar, native encoder and real V8 metadata together; none can substitute for another's independent proof. */
/** Synthetic original-main selectors and actual local V8 metadata. No app,
 * project, installed source or live inspector is used by these tests. */
import assert from "node:assert/strict";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE, assertCurrentFootprintCopyMainBackendFunction,
  captureCurrentFootprintCopyMainBackendSourceReply, qualifyCurrentFootprintCopyMainBackendSource,
  requireCurrentFootprintCopyMainBackendSource } from "../src/current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendRole as Role } from "../src/current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_LIMITS as LIMITS } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL_PATTERN,
  decodeCurrentFootprintCopyMainBackendFunction, decodeCurrentFootprintCopyMainBackendNative, validateCurrentFootprintCopyMainBackendCommand } from "../src/current-footprint-copy-main-backend-contract.ts";
import { currentFootprintCopyMainBackendNativeCases, currentFootprintCopyMainBackendNativeSource } from "../src/current-footprint-copy-main-backend-native.ts";
import { currentFootprintCopyMainBackendWire } from "../src/current-footprint-copy-main-backend-wire.ts";

import { mainBackendFragments as fragments } from "./helpers/footprint-main-backend-fragments.ts";

const roles: readonly Role[] = ["projectSql", "driverCallback", "driverIntercept", "actorClock", "protocolCallback", "router", "dateParser"];
void test("seven exact backend fragments match local V8 function locations and native async prototype shapes", async () => {
  const session = new Session(); session.connect();
  const scripts = new Map<string, Readonly<{ scriptId: string; contextId: number }>>();
  session.on("Debugger.scriptParsed", event => { scripts.set(event.params.url, { scriptId: event.params.scriptId, contextId: event.params.executionContextId }); });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const role of roles) {
      const fragment = fragments[role], profile = SOURCE.functions[role]; assertCurrentFootprintCopyMainBackendFunction(role, fragment);
      let delta = fragment.indexOf("(");
      if (role === "driverIntercept") { delta = 27; }
      else if (role === "driverCallback") { delta = 0; }
      const prefix = role === "driverIntercept" ? "x=({" : "x=(0,", suffix = role === "driverIntercept" ? "}).interceptHttpProtocol;" : ");";
      const url = `easyeda-synthetic-backend-${role}.js`;
      const source = `"use strict";let x;${"\n".repeat(profile.lineNumber)}${" ".repeat(profile.columnNumber - delta - prefix.length)}${prefix}${fragment}${suffix}\n//# sourceURL=${url}`;
      const context = createContext({}); runInContext(source, context); const script = scripts.get(url); assert.ok(script !== undefined);
      const result = await session.post("Runtime.evaluate", { expression: "x", contextId: script.contextId, returnByValue: false });
      assert.ok(result.result.objectId !== undefined); assert.equal(result.exceptionDetails, undefined);
      const properties = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      decodeCurrentFootprintCopyMainBackendFunction(properties, role, script.scriptId);
      assert.throws(() => { decodeCurrentFootprintCopyMainBackendFunction(properties, role, "unrelated"); });
    }
    for (const role of ["Date", "now"] as const) {
      const result = await session.post("Runtime.evaluate", { expression: role === "Date" ? "Date" : "Date.now" }); assert.ok(result.result.objectId !== undefined);
      const properties = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      decodeCurrentFootprintCopyMainBackendNative(properties, role);
    }
  } finally { session.disconnect(); }
});
const setup = String.raw`
let called=0;const forbidden=()=>{called++;throw Error("must not invoke");};
const u=async function u(L){forbidden();},xC=function xC(t,e,r){forbidden();},L3=async function L3(t,e,r=false){forbidden();},y=async function y(t,e){forbidden();},rl=function rl(t){forbidden();};
class Driver{async interceptHttpProtocol(e,r,i){forbidden();}}
const backend=new Driver(),session={};backend.cb=(()=>async(r,i)=>{forbidden();})();
const source=[u,backend,session,xC,L3,y,Date,Date.now,rl];
`;
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({}); runInContext(`${setup}\nconst original=(${CALLS.capture.program}).call(source);`, context); return context;
}
function reprove(context: ReturnType<typeof createContext>): unknown { return runInContext(`(${CALLS.require.program}).call(source,original)`, context); }
void test("construction capture retains descriptor identities without invoking registration, callbacks, clock or SQL", () => {
  const context = fixture(); assert.equal(reprove(context), true); assert.equal(runInContext("called", context), 0);
  assert.equal(LIMITS.protocolRegistrationObserved, false); assert.equal(LIMITS.requestContextRetained, false);
  assert.equal(LIMITS.actualActorClockInvocationObserved, false); assert.equal(LIMITS.projectSqlInvocationObserved, false); assert.equal(LIMITS.executionAuthorized, false);
  for (const mutation of ["backend.cb=(()=>async(r,i)=>{})()", "Object.setPrototypeOf(backend,{interceptHttpProtocol:Driver.prototype.interceptHttpProtocol})",
    "source[2]={}", "source[3]=function xC(t,e,r){}", "Object.defineProperty(backend,'cb',{get:forbidden})", "source[7]=()=>0", "source[8]=function rl(t){}", "source.push({})"]) {
    const altered = fixture(); runInContext(mutation, altered); assert.throws(() => reprove(altered), /FOOTPRINT_MAIN_BACKEND_BINDING/u); assert.equal(runInContext("called", altered), 0);
  }
});
void test("source replies and fixed commands refuse accessors, arbitrary execution, copied authority and renderer sessions", () => {
  let called = 0;
  assert.throws(() => captureCurrentFootprintCopyMainBackendSourceReply({ get scriptSource(): string { called += 1; return ""; } })); assert.equal(called, 0);
  assert.throws(() => captureCurrentFootprintCopyMainBackendSourceReply(new Proxy({}, { ownKeys(): never { throw new Error("proxy trap"); } })));
  assert.deepEqual(captureCurrentFootprintCopyMainBackendSourceReply({ scriptSource: "inert" }), { scriptSource: "inert" });
  assert.throws(() => qualifyCurrentFootprintCopyMainBackendSource("changed"));
  assert.throws(() => { requireCurrentFootprintCopyMainBackendSource({ profile: "private.current-footprint-copy-main-backend-source.v1", sha256: SOURCE.sha256, runtimeBound: false, executionAuthorized: false }); });
  const valid = { phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } };
  assert.ok(Object.isFrozen(validateCurrentFootprintCopyMainBackendCommand(valid)));
  for (const modified of [{ ...valid, sessionId: "renderer" }, { ...valid, url: "ws://127.0.0.1:1234/copied" }, { ...valid, params: { ...valid.params, throwOnSideEffect: false } },
    { ...valid, params: { ...valid.params, functionDeclaration: "function(){return Date.now()}" } }, { ...valid, params: { ...valid.params, arguments: [{ value: "caller" }] } }]) {
    assert.throws(() => validateCurrentFootprintCopyMainBackendCommand(modified));
  }
});
async function retainResume(promise: Promise<unknown>, errors: unknown[]): Promise<void> { try { await promise; } catch (error) { errors.push(error); } }
void test("both exact original registration expressions retain unrelocated V8 breakpoint locations", async () => {
  const session = new Session(); session.connect(); const context = createContext({});
  const script: { value: Readonly<{ id: string; context: number }> | null } = { value: null };
  const errors: unknown[] = [], events: number[] = [], points: string[] = [];
  session.on("Debugger.scriptParsed", event => { if (event.params.url === "file:///synthetic/main-registration/app.js") { script.value = { id: event.params.scriptId, context: event.params.executionContextId }; } });
  session.on("Debugger.paused", event => { events.push(event.params.callFrames[0]?.location.columnNumber ?? -1); void retainResume(session.post("Debugger.resume"), errors); });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    // The native receiver is closure-captured. Making it an invented entry
    // Parameter changes V8's breakable map and incorrectly admits3994/4023.
    const pair = 't.protocol.handle("https",u),t.protocol.handle("http",u)',
      prefix = "var makeEntry=function(t,e){return function(){var l=()=>{},f=()=>{};var c=l,A=f;";
    runInContext(`${"\n".repeat(SOURCE.registration.https.lineNumber)}${" ".repeat(SOURCE.registration.https.columnNumber - prefix.length)}${prefix}${pair};${fragments.protocolCallback}};};const calls=[];\n//# sourceURL=file:///synthetic/main-registration/app.js`, context);
    const selected = script.value; assert.ok(selected !== null);
    const registration = await session.post("Debugger.setBreakpointByUrl", { urlRegex: URL_PATTERN, lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber });
    assert.equal(registration.breakpointId, REGISTRATION_ID); points.push(registration.breakpointId);
    assert.deepEqual(registration.locations, [{ scriptId: selected.id, lineNumber: 8583, columnNumber: 4003 }]);
    assert.equal(currentFootprintCopyMainBackendWire({ phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: registration.breakpointId } }, 73).request["breakpointId"], REGISTRATION_ID);
    for (const site of Object.values(SOURCE.registration)) {
      const location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> = { scriptId: selected.id, lineNumber: site.lineNumber, columnNumber: site.breakpointColumnNumber };
      const result = await session.post("Debugger.setBreakpoint", { location }); points.push(result.breakpointId); assert.deepEqual(result.actualLocation, location);
    }
    for (const [obsolete, actual] of [[3994, 4003], [4023, 4032]] as const) {
      const allocation: Readonly<{ breakpointId: string; actualLocation: Readonly<{ columnNumber?: number | undefined }> }> =
        await session.post("Debugger.setBreakpoint", { location: { scriptId: selected.id, lineNumber: 8583, columnNumber: obsolete } });
      points.push(allocation.breakpointId); assert.equal(allocation.actualLocation.columnNumber, actual); assert.notEqual(allocation.actualLocation.columnNumber, obsolete);
    }
    const result = await session.post("Runtime.evaluate", { contextId: selected.context, expression: 'makeEntry({protocol:{handle(name,callback){calls.push(name);}}},{})()', returnByValue: true });
    assert.equal(result.exceptionDetails, undefined); assert.deepEqual(events, [4003, 4032]); assert.deepEqual(errors, []); assert.equal(runInContext('calls.join(",")', context), "https,http");
  } finally { try { for (const breakpointId of points) { await session.post("Debugger.removeBreakpoint", { breakpointId }); } } finally { session.disconnect(); } }
});
void test("all fourteen fixed native main commands retain exact JSON and admit no caller program, session or endpoint", async () => {
  const cases = currentFootprintCopyMainBackendNativeCases(), native = currentFootprintCopyMainBackendNativeSource(); assert.equal(cases.length, 14);
  const { rows } = await decodeFixedNativeTable(native, 14, 4);
  for (const [index, command] of cases.entries()) {
    const fields = rows[index]?.split("\t"), wire = currentFootprintCopyMainBackendWire(command, 73); assert.ok(fields !== undefined); const template = fields[3]; assert.ok(template !== undefined);
    const restored = template.replaceAll(/"__mainbackend_([A-Za-z\d]+)__"/gu, (_all, name: string) => JSON.stringify(wire.request[name]));
    const { phase: _phase, ...expected } = command; const actual: unknown = JSON.parse(restored); assert.deepEqual(actual, expected);
    assert.equal(wire.request["action"], "main-send"); assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false); assert.equal(Object.hasOwn(wire.request, "sessionId"), false); assert.equal(Object.hasOwn(wire.request, "url"), false);
    assert.throws(() => currentFootprintCopyMainBackendWire({ ...command, sessionId: "renderer" }, 73));
    assert.throws(() => currentFootprintCopyMainBackendWire(command, 0));
  }
});
