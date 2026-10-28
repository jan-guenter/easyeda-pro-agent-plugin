/** Synthetic exact request selectors and real local V8 Promise internals.
 * No EasyEDA application, project, clock RPC or SQL operation is invoked. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as BACKEND_CALLS } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_LIMITS as LIMITS } from "../src/current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS, decodeCurrentFootprintCopyMainRequestPromise,
  decodeCurrentFootprintCopyMainRequestValue, validateCurrentFootprintCopyMainRequestCommand } from "../src/current-footprint-copy-main-request-contract.ts";
import { assertCurrentFootprintCopyMainRequestFunction, qualifyCurrentFootprintCopyMainRequestSource,
  requireCurrentFootprintCopyMainRequestSource } from "../src/current-footprint-copy-main-request-source.ts";
import { mainBackendFragments } from "./helpers/footprint-main-backend-fragments.ts";
import { mainRequestFragments } from "./helpers/footprint-main-request-fragments.ts";

const setup = String.raw`
let called=0;const forbidden=()=>{called++;throw Error("must not invoke");};
const u=async function u(L){forbidden();},xC=function xC(t,e,r){forbidden();},L3=async function L3(t,e,r=false){forbidden();},y=async function y(t,e){forbidden();};
class Driver{async interceptHttpProtocol(e,r,i){forbidden();}}
const backend=new Driver(),session={};backend.cb=(()=>async(r,i)=>{forbidden();})();
const source=[u,backend,session,xC,L3,y,Date,Date.now],router={logger:{}},req={},res={};
const ctx={req,res,routerUrl:"/api/v4/projects/inert/branches/inert/histories",routerParams:{},routerArgs:[],logger:router.logger};
const contextFrame=[router,req,res,ctx];
const expected={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),projectKey:"a".repeat(64),path:"C:\\disposable\\inert.eprj2",dataStr:"inert-native-body"};
const PB=async function PB(t){forbidden();},service={},owner={ctx,service,path:expected.path};
const projectRow={path:expected.path},user={uuid:"c".repeat(32)},row={username:"project-name",nickname:"project-nickname"};
class Z2{constructor(db,logger){this.db=db;this.logger=logger;}}
class yo{constructor(path,db,logger){this.path=path;this.db=db;this.logger=logger;this.dbWrap=new Z2(db,logger);}queryOne(...args){forbidden();}}
const sqlOwner=new yo(expected.path,{},router.logger);
`;
function fixture(options: Readonly<{ missingUser?: boolean; reqData?: boolean }> = {}): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`${setup}\nconst original=(${BACKEND_CALLS.capture.program}).call(source);const contextPacket=(${CALLS.context.program}).call(contextFrame,original);
Object.assign(ctx,{headers:{path:expected.projectKey},requestParams:${options.reqData === true ? "{dataStr:null}" : "{dataStr:expected.dataStr}"},reqData:expected.dataStr,
projectUuid:expected.projectKey,routerParams:{projectUuid:expected.projectUuid,branchUuid:expected.branchUuid},projects:{[expected.projectKey]:projectRow},user,db:{[expected.path]:Promise.resolve(sqlOwner)}});
const controllerFrame=[owner,ctx,service,owner.path,L3,PB,Date,Date.now],controllerPacket=(${CALLS.controller.program}).call(controllerFrame,contextPacket,expected);
const selectedRow=${options.missingUser === true ? "undefined" : "row"},actorFrame=[ctx,owner.path,true,expected.dataStr,selectedRow,Date,Date.now,yo,Z2];
const editArgument={dataStr:expected.dataStr,modify:{uuid:user.uuid,username:${options.missingUser === true ? '""' : "row.username"},nickname:${options.missingUser === true ? '""' : "row.nickname"},updateTime:1700000000123}};
const editFrame=[editArgument],actorPacket=(${CALLS.actor.program}).call(editFrame,actorFrame,controllerPacket);`, context);
  return context;
}
function sql(context: ReturnType<typeof createContext>): unknown {
  return runInContext(`(${CALLS.sql.program}).call(actorPacket,sqlOwner)`, context);
}
void test("actual request context, controller, L3/PB argument and selected SQL owner join without invoking application methods", () => {
  for (const options of [{}, { missingUser: true }, { reqData: true }]) {
    const context = fixture(options); assert.equal(runInContext(`(${CALLS.value.program}).call(actorPacket).updateTime`, context), 1_700_000_000_123);
    assert.equal(runInContext(`(${CALLS.value.program}).call(actorPacket).username`, context), options.missingUser === true ? "" : "project-name");
    assert.ok(Array.isArray(sql(context))); assert.equal(runInContext("called", context), 0);
  }
  assert.equal(LIMITS.mounted, false); assert.equal(LIMITS.actualClockRpcJoinsObserved, false); assert.equal(LIMITS.nativeSqlCompletionObserved, false);
  assert.equal(LIMITS.savedResultVerified, false); assert.equal(LIMITS.executionAuthorized, false);
});
void test("request selectors refuse replaced identities, changed actual actor/time/data and accessor substitutions without calling them", () => {
  for (const mutation of [
    "backend.cb=(()=>async(r,i)=>{})()", "source[0]=async function u(L){}", "source[2]={}", "source[3]=function xC(t,e,r){}", "ctx.req={}", "ctx.res={}", "ctx.logger={}", "owner.ctx={}", "owner.service={}", "owner.path='other'",
    "ctx.headers.path='d'.repeat(64)", "ctx.routerParams.branchUuid='d'.repeat(32)", "ctx.requestParams.dataStr='different'", "projectRow.path='other'",
    "ctx.user={uuid:user.uuid}", "user.uuid='e'.repeat(32)", "row.nickname='changed'", "editArgument.modify.updateTime++", "editArgument.dataStr='changed'",
    "ctx.db[expected.path]=Promise.resolve(sqlOwner)", "sqlOwner.path='other'", "sqlOwner.dbWrap.db={}", "Object.setPrototypeOf(sqlOwner,{})",
    "Object.defineProperty(Object.prototype,'dataStr',{value:'inherited',configurable:true});delete ctx.requestParams.dataStr",
    "Object.defineProperty(sqlOwner,'db',{get:forbidden})", "Object.defineProperty(ctx,'user',{get:forbidden})", "actorFrame[2]=false",
  ]) {
    const context = fixture(); runInContext(mutation, context);
    assert.throws(() => sql(context), /FOOTPRINT_MAIN_REQUEST_BINDING/u, mutation); assert.equal(runInContext("called", context), 0, mutation);
  }
});
void test("fixed request grammar rejects arbitrary code, side effects, caller sessions and new Promise/SQL calls", () => {
  const input = { phase: "request-sql", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "actor", functionDeclaration: CALLS.sql.program,
    arguments: [{ objectId: "fulfilled-result" }], returnByValue: false } };
  assert.ok(Object.isFrozen(validateCurrentFootprintCopyMainRequestCommand(input)));
  for (const changed of [{ ...input, sessionId: "copied" }, { ...input, params: { ...input.params, throwOnSideEffect: false } },
    { ...input, params: { ...input.params, awaitPromise: true } }, { ...input, params: { ...input.params, functionDeclaration: "function(){return this.then(x=>x.queryOne())}" } },
    { ...input, params: { ...input.params, arguments: [{ value: { path: "caller-sql" } }] } }]) {
    assert.throws(() => validateCurrentFootprintCopyMainRequestCommand(changed));
  }
  assert.throws(() => qualifyCurrentFootprintCopyMainRequestSource("changed"));
  assert.throws(() => { requireCurrentFootprintCopyMainRequestSource({ profile: "private.current-footprint-copy-main-request-source.v1", runtimeBound: false, executionAuthorized: false }); });
  assertCurrentFootprintCopyMainRequestFunction("actorClock", mainBackendFragments.actorClock);
  assertCurrentFootprintCopyMainRequestFunction("driverCallback", mainBackendFragments.driverCallback);
  assertCurrentFootprintCopyMainRequestFunction("projectSql", mainBackendFragments.projectSql);
  for (const role of ["createProjectHistory", "editHead", "sqlQueryOne"] as const) { assertCurrentFootprintCopyMainRequestFunction(role, mainRequestFragments[role]); }
  assert.throws(() => { assertCurrentFootprintCopyMainRequestFunction("editHead", mainBackendFragments.actorClock); });
});
void test("real local V8 fulfilled Promise internals select the original SQL result without awaiting or issuing a second query", async () => {
  const context = fixture(), inspector = new Session(); inspector.connect();
  let contextId: number | null = null;
  inspector.on("Debugger.scriptParsed", event => { if (event.params.url === "easyeda-inert-request-promise.js") { contextId = event.params.executionContextId; } });
  try {
    await inspector.post("Runtime.enable"); await inspector.post("Debugger.enable");
    runInContext("void 0;\n//# sourceURL=easyeda-inert-request-promise.js", context); assert.ok(contextId !== null);
    const promise = await inspector.post("Runtime.evaluate", { contextId, expression: "ctx.db[expected.path]", returnByValue: false });
    assert.ok(promise.result.objectId !== undefined);
    const properties = await inspector.post("Runtime.getProperties", { objectId: promise.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const resultId = decodeCurrentFootprintCopyMainRequestPromise(properties);
    const packet = await inspector.post("Runtime.evaluate", { contextId, expression: "actorPacket", returnByValue: false }); assert.ok(packet.result.objectId !== undefined);
    const relation = await inspector.post("Runtime.callFunctionOn", { ...FLAGS, objectId: packet.result.objectId, functionDeclaration: CALLS.sql.program,
      arguments: [{ objectId: resultId }], returnByValue: false });
    assert.equal(relation.exceptionDetails, undefined); assert.equal(relation.result.subtype, "array");
    const actor = await inspector.post("Runtime.callFunctionOn", { ...FLAGS, objectId: packet.result.objectId, functionDeclaration: CALLS.value.program, arguments: [], returnByValue: true });
    assert.equal(actor.exceptionDetails, undefined); assert.equal(decodeCurrentFootprintCopyMainRequestValue(actor).updateTime, 1_700_000_000_123);
    const pending = await inspector.post("Runtime.evaluate", { contextId, expression: "new Promise(()=>{})", returnByValue: false }); assert.ok(pending.result.objectId !== undefined);
    const pendingProperties = await inspector.post("Runtime.getProperties", { objectId: pending.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.throws(() => decodeCurrentFootprintCopyMainRequestPromise(pendingProperties));
    const fake = structuredClone(properties); const state = fake.internalProperties?.find(item => item.name === "[[PromiseState]]"); assert.ok(state?.value !== undefined); state.value.value = "rejected";
    assert.throws(() => decodeCurrentFootprintCopyMainRequestPromise(fake));
    assert.throws(() => decodeCurrentFootprintCopyMainRequestPromise({ ...properties, result: [{ name: "then" }] }));
    assert.equal(runInContext("called", context), 0);
  } finally { inspector.disconnect(); }
});
