/* oxlint-disable import/max-dependencies -- The fixed source, selector, native refusal and private issuer checks exercise distinct authority boundaries together. */
/** Synthetic V8 object custody and fixed protocol checks; no application,
 * native SQL, HTTP delivery or Windows transport integration is exercised. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as BACKEND } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import { currentFootprintCopyMainBackendWire } from "../src/current-footprint-copy-main-backend-wire.ts";
import { requireCurrentProjectStructureMainLease } from "../src/current-project-structure-main-lease.ts";
import { CurrentProjectStructureMainObserver, requireCurrentProjectStructureMainObservation } from "../src/current-project-structure-main-observer.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as PROGRAMS, CURRENT_PROJECT_STRUCTURE_MAIN_SELECT_SQL as SELECT,
  CURRENT_PROJECT_STRUCTURE_MAIN_UPDATE_SQL as UPDATE } from "../src/current-project-structure-main-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_FLAGS as FLAGS, decodeCurrentProjectStructureMainPause as decodePause,
  validateCurrentProjectStructureMainCommand as validate, validateCurrentProjectStructureMainPlan } from "../src/current-project-structure-main-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_FUNCTIONS as FUNCTIONS, CURRENT_PROJECT_STRUCTURE_MAIN_SITES as SITES } from "../src/current-project-structure-main-source.ts";

/** Allocate actual shared references and failing application methods. A fixed
 * selector may retain these objects but must never invoke an application API. */
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ selectSql: SELECT, updateSql: UPDATE });
  runInContext(`let calls=0,getters=0;const forbidden=()=>{calls++;throw Error("invoked");};
const u=async function u(L){forbidden();},xC=function xC(t,e,r){forbidden();},L3=async function L3(t,e,r=false){forbidden();},y=async function y(t,e){forbidden();},rl=function rl(t){forbidden();};
class Driver{async interceptHttpProtocol(e,r,i){forbidden();}}const backend=new Driver();backend.cb=(()=>async(r,i)=>{forbidden();})();
const source=[u,backend,{},xC,L3,y,Date,Date.now,rl],construction=(${BACKEND.capture.program}).call(source);
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),ticket:101,structureText:"new complete tree"},path="fixture.eprj2",key="c".repeat(64);
const logger={},router={logger},req={req:{method:"POST"},pureUrl:"/api/v4/projects/"+plan.projectUuid+"/branches/"+plan.branchUuid+"/structures"},res={};
const ctx={req,res,routerUrl:req.pureUrl,routerParams:{},routerArgs:[],logger};
const driver=[router,req,res],driverCaller=[backend,req,res],contextFrame=[router,req,res,ctx];
const native={},connection={path,logger,db:native,dbWrap:{db:native},queryOne:forbidden,queryAll:forbidden,exec:forbidden};
const service={},owner={ctx,service,path},controller=[owner,ctx,service,path];
const field=(symbol,name)=>({tbSymbol:symbol,alias:"",name}),table=()=>{const s=Symbol("project_structures");return{branch_uuid:field(s,"branch_uuid"),ticket:field(s,"ticket"),structure:field(s,"structure")};};
const firstTable=table(),nextTable=table(),argument={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,ticket:plan.ticket,structure:plan.structureText};
const queryArgs=[{JOIN:firstTable},{EQ:[firstTable.branch_uuid,{value:plan.branchUuid}]},{PROJECTION:[firstTable.ticket,firstTable.structure]}];
const queryFrame=[connection,queryArgs,selectSql,[{value:plan.branchUuid}]],queryCaller=[ctx,path,argument,firstTable];
const row={ticket:100,structure:"old complete tree"},selected=[service,ctx,path,argument,row],rows=[{...row},{...row}],update=[ctx,path,argument,nextTable,connection,rows];
const execArgs=[{JOIN:nextTable},{EQ:[nextTable.branch_uuid,{value:plan.branchUuid}]},{UPDATE:[[nextTable.ticket,{value:plan.ticket}],[nextTable.structure,{value:plan.structureText}]]}];
const exec=[connection,execArgs,updateSql,[{value:plan.ticket},{value:plan.structureText},{value:plan.branchUuid}]];`, context);
  return context;
}
/** Emit one fixed selector invocation for the synthetic runtime fixture. */
function call(stage: keyof typeof PROGRAMS, receiver: string, args = ""): string { return `(${PROGRAMS[stage]}).call(${receiver}${args ? `,${args}` : ""})`; }
/** Execute maintained descriptor selectors in order against real runtime
 * arrays. A mutation between stages cannot supply an original native issuer. */
function observe(context: ReturnType<typeof createContext>, mutation = ""): unknown {
  return runInContext(`const invocation=${call("driver", "driver", "construction,driverCaller")};
const contextPacket=${call("context", "contextFrame", "construction")};${call("context-join", "invocation", "contextPacket")};
ctx.routerParams={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid};ctx.requestParams={ticket:plan.ticket,structure:plan.structureText};ctx.headers={path:key};ctx.projectUuid=key;ctx.projects={[key]:{path}};ctx.db={};
${mutation}
const controllerPacket=${call("controller", "controller", "contextPacket,invocation,plan")};ctx.db[path]=Promise.resolve(connection);
const queryPacket=${call("query-one", "queryFrame", "controllerPacket,queryCaller")};${call("connection", "queryPacket", "connection")};
const selectedPacket=${call("selected", "selected", "queryPacket")};const updatePacket=${call("update", "update", "selectedPacket")};
const execPacket=${call("exec", "exec", "updatePacket")};const returned=${call("update-return", "update", "execPacket")};
const serviceReturned=${call("service-return", "selected", "returned")};ctx.body={};const controllerReturned=${call("controller-return", "controller", "serviceReturned")};
ctx.matched=true;const responsePacket=${call("response", "contextFrame", "controllerReturned")};${call("value", "responsePacket")};`, context);
}
void test("main selectors retain the original POST, connection, lower-ticket branch update and response without application calls", () => {
  const context = fixture(), value = observe(context);
  assert.deepEqual(structuredClone(value), { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 101,
    structureText: "new complete tree", projectPath: "fixture.eprj2", selectedTicket: 100, selectedRows: 2 });
  assert.equal(runInContext("responsePacket[2]===req&&responsePacket[3]===res&&responsePacket[4]===connection", context), true);
  assert.equal(runInContext("calls", context), 0); assert.equal(runInContext("getters", context), 0);
});
void test("foreign request/connection, changed update predicates, nonlower rows and accessors fail the retained chain", () => {
  for (const mutation of ['ctx.req={...req};', 'req.req.method="GET";', 'queryFrame[0]={...connection};',
    'queryFrame[3]=[{value:"d".repeat(32)}];', 'exec[2]=updateSql+" AND id = ?";', 'exec[3][0].value=102;',
    'execArgs[1].EQ[1].value="d".repeat(32);', 'update[4]={...connection};', 'rows[1].ticket=101;', 'rows[1].structure="foreign tree";',
    'Object.defineProperty(ctx.requestParams,"structure",{get(){getters++;return plan.structureText;}});']) {
    const context = fixture(); assert.throws(() => observe(context, mutation), /PROJECT_STRUCTURE_MAIN_BINDING/u);
    assert.equal(runInContext("calls", context), 0); assert.equal(runInContext("getters", context), 0);
  }
  const context = fixture(); observe(context);
  assert.throws(() => runInContext(`(${PROGRAMS.connection}).call(queryPacket,{...connection})`, context), /PROJECT_STRUCTURE_MAIN_BINDING/u);
  assert.throws(() => runInContext(`ctx.res={};(${PROGRAMS.value}).call(responsePacket)`, context), /PROJECT_STRUCTURE_MAIN_BINDING/u);
});
void test("new fixed grammar remains rejected by the original native wire and copied objects grant no lease", async () => {
  const stage = "controller" as const; const site = SITES[stage]; const command = validate({ phase: "structure-main-arm", stage, method: "Debugger.setBreakpoint", params: {
    location: { scriptId: "actual", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } });
  assert.throws(() => currentFootprintCopyMainBackendWire(command, 1));
  assert.throws(() => validate({ ...command, params: { location: { scriptId: "actual", lineNumber: site.lineNumber, columnNumber: site.columnNumber + 1 } } }));
  assert.throws(() => validate({ phase: "structure-main-join", stage: "controller", method: "Runtime.callFunctionOn", params: {
    ...FLAGS, objectId: "fake", functionDeclaration: "function(){return true;}", arguments: [], returnByValue: true } }));
  const fake = Object.freeze({ profile: "private.current-project-structure-main-lease.v1" as const });
  assert.throws(() => requireCurrentProjectStructureMainLease(fake), /ORIGINAL_LEASE_REQUIRED/u);
  assert.throws(() => new CurrentProjectStructureMainObserver(fake, {}), /ORIGINAL_LEASE_REQUIRED/u);
  assert.throws(() => requireCurrentProjectStructureMainObservation({}), /ORIGINAL_OBSERVATION/u);
  let sends = 0; const runner = new CurrentFootprintCopyMainBackendRunner(Object.freeze({ assertCurrent: (): Promise<void> => Promise.resolve(),
    send: (): Promise<void> => { sends += 1; return Promise.resolve(); }, poll: (): Promise<string> => Promise.resolve("") }));
  await assert.rejects(runner.issueStructureLease({ profile: "private.current-footprint-combined-main-capability.v1", executionAuthorized: false }, {}), /ORIGINAL_CONSTRUCTION_REQUIRED/u); assert.equal(sends, 0);
});
void test("pause grammar pins exact original function/caller sites and comparison input refuses accessors", () => {
  const stage = "query-one" as const; const site = SITES[stage]; const fn = FUNCTIONS[site.role]; const caller = FUNCTIONS.select;
  const pause = { reason: "other", hitBreakpoints: ["owned"], callFrames: [
    { callFrameId: "frame", functionName: fn.functionName, location: { scriptId: "actual", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
      functionLocation: { scriptId: "actual", lineNumber: fn.functionLine, columnNumber: fn.functionColumn } },
    { callFrameId: "caller", functionName: caller.functionName, location: { scriptId: "actual", lineNumber: 8573, columnNumber: 5706 },
      functionLocation: { scriptId: "actual", lineNumber: caller.functionLine, columnNumber: caller.functionColumn } },
  ] };
  assert.deepEqual(decodePause(pause, stage, "actual", "owned"), { frameId: "frame", callerId: "caller" });
  assert.throws(() => decodePause(pause, stage, "foreign", "owned"));
  const top = pause.callFrames[0]; assert.ok(top !== undefined); top.location.columnNumber += 1; assert.throws(() => decodePause(pause, stage, "actual", "owned"));
  const large = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 101, structureText: "a".repeat(1_048_576) };
  assert.equal(validateCurrentProjectStructureMainPlan(large).structureText.length, 1_048_576);
  assert.throws(() => validateCurrentProjectStructureMainPlan({ ...large, structureText: "\u0000".repeat(1_048_576) }));
  let getters = 0; assert.throws(() => validateCurrentProjectStructureMainPlan({ get projectUuid(): string { getters += 1; return "a".repeat(64); } })); assert.equal(getters, 0);
});
