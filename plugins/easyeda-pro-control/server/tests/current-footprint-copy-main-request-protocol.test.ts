/** Fixed native parity and actual local V8 pause/function metadata. Vendor
 * fragments run only against inert stubs, without app, project or SQLite I/O. */
/* oxlint-disable import/max-dependencies -- Independently compare source, V8, fixed command grammar, native reconstruction and descriptor-only joins. */
import assert from "node:assert/strict";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as BACKEND } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES as SITES,
  currentFootprintCopyMainRequestAllocatedId, currentFootprintCopyMainRequestSourceArm, decodeCurrentFootprintCopyMainRequestCollectedFunction, decodeCurrentFootprintCopyMainRequestCollectionPause,
  validateCurrentFootprintCopyMainRequestCollectCommand } from "../src/current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "../src/current-footprint-copy-main-request-collect-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS } from "../src/current-footprint-copy-main-request-programs.ts";
import { currentFootprintCopyMainRequestNativeCases, currentFootprintCopyMainRequestNativeSource } from "../src/current-footprint-copy-main-request-native.ts";
import { currentFootprintCopyMainRequestWire } from "../src/current-footprint-copy-main-request-wire.ts";
import { mainBackendFragments } from "./helpers/footprint-main-backend-fragments.ts";
import { mainRequestFragments } from "./helpers/footprint-main-request-fragments.ts";

void test("all21 finite native templates reconstruct exact fixed methods, source sites, programs and typed comparison fields", async () => {
  const cases = currentFootprintCopyMainRequestNativeCases(), source = currentFootprintCopyMainRequestNativeSource(); assert.equal(cases.length, 21);
  const { rows } = await decodeFixedNativeTable(source, 21, 4);
  for (const [index, command] of cases.entries()) {
    const wire = currentFootprintCopyMainRequestWire(command, 73); const row = rows[index]?.split("\t"); assert.ok(row !== undefined); const template = row[3]; assert.ok(template !== undefined);
    const restored = template.replaceAll(/"__mainrequest_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(wire.request[name]));
    const { phase: _phase, ...expected } = command; const actual: unknown = JSON.parse(restored); assert.deepEqual(actual, expected);
    assert.equal(wire.request["action"], "main-request-send"); assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
    assert.equal(Object.hasOwn(wire.request, "sessionId"), false); assert.equal(Object.hasOwn(wire.request, "url"), false);
    assert.throws(() => currentFootprintCopyMainRequestWire({ ...command, sessionId: "copied" }, 73)); assert.throws(() => currentFootprintCopyMainRequestWire(command, 0));
  }
  const controller = cases.find(command => command.phase === "request-controller"); assert.ok(controller?.phase === "request-controller");
  const changed = (dataStr: string): unknown => ({ ...controller, params: { ...controller.params,
    arguments: [controller.params.arguments[0], { value: { ...controller.params.arguments[1].value, dataStr } }] } });
  assert.doesNotThrow(() => { currentFootprintCopyMainRequestWire(changed('native\nbody\t"slash\\😀'), 73); });
  assert.throws(() => currentFootprintCopyMainRequestWire(changed("😀".repeat(4097)), 73));
  assert.throws(() => currentFootprintCopyMainRequestWire(changed("\u0001".repeat(6000)), 73), /ENVELOPE_BYTES/u);
  assert.throws(() => currentFootprintCopyMainRequestWire(changed("\u0001".repeat(16_384)), 73), /COMMAND_BYTES/u);
  assert.throws(() => currentFootprintCopyMainRequestWire(changed("\uD800"), 73));
  const arm = currentFootprintCopyMainRequestSourceArm("context", "app"); assert.equal(arm.method, "Debugger.setBreakpoint");
  assert.throws(() => validateCurrentFootprintCopyMainRequestCollectCommand({ phase: "request-site-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber: 1164, columnNumber: 1663 } } }));
});

void test("driver invocation and later context join compare original receivers rather than copied request fields", () => {
  const setup = String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("must not invoke");};
const u=async function u(t){forbidden();},xC=function xC(t,e,r){forbidden();},L3=async function L3(t,e,r=false){forbidden();},y=async function y(t,e){forbidden();},rl=function rl(t){forbidden();};
class Driver{async interceptHttpProtocol(e,r,i){forbidden();}}const backend=new Driver();backend.cb=(()=>async(r,i)=>{forbidden();})();
const source=[u,backend,{},xC,L3,y,Date,Date.now,rl],router={logger:{}},req={},res={},top=[router,req,res],caller=[backend,req,res];
const ctx={req,res,routerUrl:"inert",routerParams:{},routerArgs:[],logger:router.logger};const contextFrame=[router,req,res,ctx];`;
  const make = (): ReturnType<typeof createContext> => {
    const context = createContext({}); runInContext(`${setup}\nconst original=(${BACKEND.capture.program}).call(source);const invocation=(${PROGRAMS.invocation}).call(top,original,caller);const contextPacket=(${CALLS.context.program}).call(contextFrame,original);`, context); return context;
  };
  const context = make(); assert.equal(runInContext(`(${PROGRAMS.contextJoin}).call(invocation,contextPacket)`, context), true); assert.equal(runInContext("calls", context), 0);
  for (const change of ["caller[0]={}", "caller[1]={}", "top[0]={logger:router.logger}", "top[1]={}", "contextPacket[1]=[...original]", "source[2]={}"]) {
    const altered = make(); runInContext(change, altered); assert.throws(() => runInContext(`(${PROGRAMS.contextJoin}).call(invocation,contextPacket)`, altered)); assert.equal(runInContext("calls", altered), 0);
  }
});

function inertRequestScript(): string {
  let text = String.raw`const row={username:"inert-name",nickname:"inert-nickname"},logger={trace(){},error(){}},router={logger};
const Va=false,ge={lcscUuid:"forbidden"},fe={instance(){return{uuid:"uuid",username:"username",nickname:"nickname"};}},B5=()=>{},wo=()=>({sql:"inert",params:[]});
class Z2{constructor(db,logger){this.db=db;this.logger=logger;}queryOne(){return Promise.resolve(row);}}
class BL{constructor(req){this.req=req;}url(){return"/api/v4/projects/inert/branches/inert/histories";}}
class YL{constructor(){this.headers={};this.output={writableEnded:false,end(){this.writableEnded=true;}};}setStatus(){}setHeader(k,v){this.headers[k]=v;}getHeader(k){return this.headers[k];}stream(){return this.output;}}
`;
  const put = (line: number, column: number, prefix: string, fragment: string, suffix: string): void => {
    const currentLine = text.split("\n").length - 1; assert.ok(currentLine <= line); text += "\n".repeat(line - currentLine);
    const currentColumn = text.length - text.lastIndexOf("\n") - 1; assert.ok(currentColumn + prefix.length <= column);
    text += `${" ".repeat(column - currentColumn - prefix.length)}${prefix}${fragment}${suffix}`;
  };
  put(1025, 2763, "class yo{constructor(path,db,logger){this.path=path;this.db=db;this.logger=logger;this.dbWrap=new Z2(db,logger);}", mainRequestFragments.sqlQueryOne, "};");
  put(1164, 2434, "var makeCallback=function(){return ", mainBackendFragments.driverCallback, "};");
  put(1164, 51_045, "class Driver{", mainBackendFragments.driverIntercept, "};");
  put(8572, 27_755, "", mainRequestFragments.editHead, "");
  put(8573, 14, "", mainBackendFragments.actorClock, ";");
  put(8573, 1622, 'class Controller{constructor(ctx){this.ctx=ctx;this.path="inert";this.service={saveProjectHistory(){return Promise.resolve("history");}};}', mainRequestFragments.createProjectHistory, "};");
  text += String.raw`
const sqlOwner=new yo("inert",{},logger);async function y(ctx,path){return ctx.db[path];}
router.run=async function(ctx){ctx.requestParams={dataStr:"inert-body"};ctx.routerParams={projectUuid:"inert-project",branchUuid:"inert-branch"};ctx.user={uuid:"c".repeat(32)};ctx.db={inert:Promise.resolve(sqlOwner)};ctx.matched=true;await new Controller(ctx).createProjectHistory();};
var backend=new Driver();backend.cb=makeCallback.call(router);
//# sourceURL=easyeda-inert-main-request.js`;
  return text;
}
async function observedResume(promise: Promise<unknown>, errors: unknown[]): Promise<void> { try { await promise; } catch (error) { errors.push(error); } }
void test("actual local V8 joins exact driver-call, after-context, controller and PB/L3 pause locations", async () => {
  const inspector = new Session(); inspector.connect(); const context = createContext({});
  const script: { value: Readonly<{ id: string; contextId: number }> | null } = { value: null };
  const events: unknown[] = []; const errors: unknown[] = []; const breakpoints: string[] = [];
  inspector.on("Debugger.scriptParsed", event => { if (event.params.url === "easyeda-inert-main-request.js") { script.value = { id: event.params.scriptId, contextId: event.params.executionContextId }; } });
  inspector.on("Debugger.paused", event => { events.push(event.params); void observedResume(inspector.post("Debugger.resume"), errors); });
  try {
    await inspector.post("Runtime.enable"); await inspector.post("Debugger.enable"); runInContext(inertRequestScript(), context); const selected = script.value; assert.ok(selected !== null);
    const driver = await inspector.post("Runtime.evaluate", { expression: "backend.cb", contextId: selected.contextId }); assert.ok(driver.result.objectId !== undefined);
    // oxlint-disable-next-line typescript/unbound-method -- The actual session is supplied explicitly; Node's older declaration omits this implemented inspector method.
    const invocation: unknown = Reflect.apply(inspector.post, inspector, ["Debugger.setBreakpointOnFunctionCall", { objectId: driver.result.objectId }]); assert.ok(invocation instanceof Promise);
    const first = currentFootprintCopyMainRequestAllocatedId(await invocation); assert.ok(first !== null); breakpoints.push(first);
    for (const stage of ["context", "controller", "editHead"] as const) {
      const site = SITES[stage]; const allocation: Readonly<{ breakpointId: string; actualLocation: Readonly<{ columnNumber?: number | undefined }> }> =
        await inspector.post("Debugger.setBreakpoint", { location: { scriptId: selected.id, lineNumber: site.lineNumber, columnNumber: site.columnNumber } });
      assert.equal(allocation.actualLocation.columnNumber, site.columnNumber); breakpoints.push(allocation.breakpointId);
    }
    for (const role of ["editHead", "sqlQueryOne"] as const) {
      const fn = await inspector.post("Runtime.evaluate", { contextId: selected.contextId, expression: role === "editHead" ? "PB" : "yo.prototype.queryOne" }); assert.ok(fn.result.objectId !== undefined);
      const properties = await inspector.post("Runtime.getProperties", { objectId: fn.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      decodeCurrentFootprintCopyMainRequestCollectedFunction(properties, role, selected.id);
    }
    const result = await inspector.post("Runtime.evaluate", { contextId: selected.contextId, expression: 'backend.interceptHttpProtocol({url:"https://client/inert"},()=>{},logger)', awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined); assert.equal(events.length, 4); assert.deepEqual(errors, []);
    for (const [index, stage] of ORDER.entries()) { const breakpoint = breakpoints[index]; assert.ok(breakpoint !== undefined);
      const decoded = decodeCurrentFootprintCopyMainRequestCollectionPause(events[index], stage, selected.id, breakpoint); assert.equal(typeof decoded.frameId, "string"); }
  } finally { try { for (const breakpointId of breakpoints) { await inspector.post("Debugger.removeBreakpoint", { breakpointId }); } } finally { inspector.disconnect(); } }
});
