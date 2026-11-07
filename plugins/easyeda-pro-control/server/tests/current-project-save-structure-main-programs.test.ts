/** Descriptor/native joins on synthetic values. No main owner, SQL driver,
 * original response publication, worker continuation or Save is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as BACKEND } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as LEGACY, CURRENT_PROJECT_STRUCTURE_MAIN_SELECT_SQL as SELECT, CURRENT_PROJECT_STRUCTURE_MAIN_UPDATE_SQL as UPDATE } from "../src/current-project-structure-main-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_MAIN_PROGRAMS as PROGRAMS } from "../src/current-project-save-structure-main-programs.ts";

function fixture(fault: "none" | "params" | "resolver" | "busy" | "final" | "getter"): ReturnType<typeof createContext> {
  const context = createContext({ fault, isProxy: types.isProxy, BACKEND, LEGACY, PROGRAMS, SELECT, UPDATE });
  runInContext(`"use strict";let calls=0,getters=0;const forbidden=()=>{calls++;throw Error("application call")};
const u=async function u(L){forbidden()},xC=function xC(t,e,r){forbidden()},L3=async function L3(t,e,r=false){forbidden()},y=async function y(t,e){forbidden()},rl=function rl(t){forbidden()};
class Driver{async interceptHttpProtocol(e,r,i){forbidden()}}const backend=new Driver;backend.cb=(()=>async(r,i)=>{forbidden()})();const source=[u,backend,{},xC,L3,y,Date,Date.now,rl],construction=Reflect.apply(eval("("+BACKEND.capture.program+")"),source,[]);
const use=(role,receiver,args)=>Reflect.apply(eval("("+PROGRAMS[role]+")"),receiver,args),old=(role,receiver,args)=>Reflect.apply(eval("("+LEGACY[role]+")"),receiver,args);
const plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),ticket:101,structureText:"new complete tree"},path="fixture.eprj2",key="c".repeat(64),logger={},router={logger},nativeReq=Object.create({get method(){getters++;throw Error("method getter")}}),req={req:nativeReq,pureUrl:"/api/v4/projects/"+plan.projectUuid+"/branches/"+plan.branchUuid+"/structures"},res={};
const ctx={req,res,routerUrl:req.pureUrl,routerParams:{},routerArgs:[],logger},driver=[router,req,res],driverCaller=[backend,req,res],contextFrame=[router,req,res,ctx];
class Database{}class Statement{}class SqlWrap{}class Sql{queryOne(){forbidden()}queryAll(){forbidden()}exec(){forbidden()}}const native=new Database,wrap=new SqlWrap,connection=new Sql;Object.defineProperty(native,"filename",{value:path});wrap.db=native;Object.assign(connection,{path,logger,db:native,dbWrap:wrap,transactionDepth:0});
const sqlite={Database,Statement},util={types:{isProxy}},captureFrame=[SqlWrap,Sql,sqlite,util],capture=[captureFrame,SqlWrap,Sql,sqlite,util,[],isProxy,path,new Map,Date,Date.now];
const service={},owner={ctx,service,path},controller=[owner,ctx,service,path],field=(symbol,name)=>({tbSymbol:symbol,alias:"",name}),table=()=>{const s=Symbol("project_structures");return{branch_uuid:field(s,"branch_uuid"),ticket:field(s,"ticket"),structure:field(s,"structure")}};
const firstTable=table(),nextTable=table(),argument={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,ticket:plan.ticket,structure:plan.structureText},queryArgs=[{JOIN:firstTable},{EQ:[firstTable.branch_uuid,{value:plan.branchUuid}]},{PROJECTION:[firstTable.ticket,firstTable.structure]}];
const queryFrame=[connection,queryArgs,SELECT,[{value:plan.branchUuid}]],queryCaller=[ctx,path,argument,firstTable],row={ticket:1,structure:"old complete tree"},selected=[service,ctx,path,argument,row],rows=[{...row}],update=[ctx,path,argument,nextTable,connection,rows];
const execArgs=[{JOIN:nextTable},{EQ:[nextTable.branch_uuid,{value:plan.branchUuid}]},{UPDATE:[[nextTable.ticket,{value:plan.ticket}],[nextTable.structure,{value:plan.structureText}]]}],exec=[connection,execArgs,UPDATE,[{value:plan.ticket},{value:plan.structureText},{value:plan.branchUuid}]];
const invocation=old("driver",driver,[construction,driverCaller]),contextPacket=old("context",contextFrame,[construction]);old("context-join",invocation,[contextPacket]);Object.assign(ctx,{routerParams:{projectUuid:plan.projectUuid,branchUuid:plan.branchUuid},requestParams:{ticket:plan.ticket,structure:plan.structureText},headers:{path:key},projectUuid:key,projects:{[key]:{path}},db:{}});
if(fault==="getter")Object.defineProperty(ctx.requestParams,"structure",{get(){getters++;return plan.structureText}});
let error=false;try{const controllerPacket=use("controller",controller,[contextPacket,invocation,plan]);ctx.db[path]=Promise.resolve(connection);const queryPacket=use("query",queryFrame,[controllerPacket,queryCaller]);use("connection",queryPacket,[connection]);const selectedPacket=use("selected",selected,[queryPacket]);const oldValue=use("selectedValue",selectedPacket,[]),updatePacket=use("update",update,[selectedPacket]);const rowsValue=use("rowsValue",updatePacket,[]),execPacket=use("exec",exec,[updatePacket]);
const params=[plan.ticket,plan.structureText,plan.branchUuid],resolve=()=>forbidden(),reject=()=>forbidden(),raw=[wrap,UPDATE,params,resolve,reject,sqlite,util];if(fault==="params")params[0]=102;
const run=use("run",raw,[exec,execPacket,capture]),runValue=use("runValue",run,[]),stmt=new Statement;Object.defineProperty(stmt,"sql",{value:UPDATE});Object.assign(stmt,{changes:1,lastID:1});const cb=[stmt,fault==="busy"?{code:"SQLITE_BUSY"}:null,UPDATE,params,fault==="resolver"?()=>forbidden():resolve,reject,sqlite,util];const callback=use("callback",cb,[run]),callbackValue=use("callbackValue",callback,[]);
const returned=use("updateReturned",update,[execPacket]),serviceReturned=use("serviceReturned",selected,[returned]);ctx.body={};const controllerReturned=use("controllerReturned",controller,[serviceReturned]);ctx.matched=true;const response=use("response",contextFrame,[controllerReturned]);res.writeStream={_final:function final(n){forbidden()}};const finalSelected=use("finalSelect",response,[]);res.initializedResponse=true;res.statusCode=200;
const finalFrame=[res,resolve,logger,{}, {},null,()=>forbidden()],entered=use("finalEntry",finalFrame,[finalSelected]);const returnedFrame=[...finalFrame];if(fault==="final")returnedFrame[6]=()=>forbidden();const ended=use("finalReturned",returnedFrame,[entered]);globalThis.report={oldValue,rowsValue,runValue,callbackValue,value:use("finalValue",ended,[])};
}catch{error=true;}globalThis.state={calls,getters,error};`, context);
  return context;
}
void test("modern POST graph, one raw UPDATE/native callback and own finalizer retain exact identities without calling APIs", () => {
  const context = fixture("none"); assert.deepEqual(structuredClone(context["state"]), { calls: 0, getters: 0, error: false });
  const value: unknown = structuredClone(context["report"]); assert.ok(value !== null && typeof value === "object"); assert.deepEqual(Reflect.get(value, "callbackValue"), { changes: 1, lastID: 1 }); assert.deepEqual(Reflect.get(value, "value"), { originalResponseFinalizerReturned: true, statusCode: 200 });
});
void test("foreign SQL/resolve/error/finalizer and body accessors refuse before application callbacks or retry", () => {
  for (const fault of ["params", "resolver", "busy", "final", "getter"] as const) { const context = fixture(fault); assert.deepEqual(structuredClone(context["state"]), { calls: 0, getters: 0, error: true }); }
});
