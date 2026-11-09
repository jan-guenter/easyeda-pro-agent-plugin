/** Fused fixed programs consume the same original tuples and private state as
 * their unchanged consumers. Inert realms issue no app or resume authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CAPTURED_FRAMES as FRAMES, CURRENT_MAIN_CAPTURED_SCOPE_JOINS as JOINS, CURRENT_MAIN_CAPTURED_REQUEST_BIND_PROGRAM as PRIVATE_BIND } from "../src/current-main-captured-scope-joins.ts";
import { CURRENT_SELECTED_FILE_MAIN_FETCH_BRAND_SOURCE as BRAND, CURRENT_SELECTED_FILE_MAIN_FETCH_METHOD_SOURCE as METHOD } from "../src/current-selected-file-main-fetch-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as REQUEST } from "../src/current-selected-file-main-request-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as STARTUP } from "../src/current-main-startup-config-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_CALLS as REGISTRATION } from "../src/current-saved-project-registration-config-programs.ts";

const registrationSql = '\n    insert into db_paths ("name","path","system","type","version","last_open_time") values (\n        ?,\n        ?,\n        false,\n        1,\n        ?,\n        ?) on conflict ("path") do update set "last_open_time" = \n    ?';

/** Build only inert SQLite/profile data and source-exact Fetch getter peers.
 * The realm deliberately has no ambient F5 binding. */
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy, nativeDate: types.isDate });
  runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("effectful fixture callback");};
class Z2{constructor(db){this.db=db;}}class Yo{constructor(path,db){this.path=path;this.db=db;this.dbWrap=new Z2(db);this.transactionDepth=0;}}
const utilObject={types:{isProxy:nativeProxy,isDate:nativeDate}},sc={Database:Map,Statement:Set},documents="C:\\Synthetic\\Documents",root=documents+"\\EasyEDA-Pro",directory=root+"\\database",path=directory+"\\web.db",selected="C:\\Synthetic\\Disposable@3.2.209.eprj2";
const database=()=>{const value=new Map;Object.defineProperty(value,"filename",{value:path});return value;},init=new Yo(path,database()),config=new Yo(path,database());
const capture=(${CAPTURE}).call([Z2,Yo,sc,utilObject],selected),startup=(${STARTUP.version}).call([path,init.db,init,{key:"sqlite",value:"25.10.31.1"},path,documents,root,directory,"EasyEDA-Pro",sc,utilObject,Date,Date.now],capture);
class Vu{constructor(ctx){this.ctx=ctx;}}class Sd{constructor(ctx){this.ctx=ctx;}}class Q{constructor(){this.tableName="db_paths";this.example={path:"string",name:"string",version:"",system:false,type:1,last_open_time:new Date};}}class Jr{constructor(symbol,name){this.tbSymbol=symbol;this.alias="";this.name=name;}}
const ctx={requestParams:{path:selected}},receiver=new Vu(ctx),outer=new Sd(ctx),metadata={name:"Disposable",version:"3.2.209",path:selected,ext:".eprj2",system:false},table=new Q,columns={},symbol=Symbol("db_paths");
for(const name of["path","name","version","system","type","last_open_time"])columns[name]=new Jr(symbol,name);
const registrationFrame=[receiver,metadata,columns,config,table,Vu,Sd,Q,Jr,path,sc,utilObject,Date,Date.now,Date.prototype.getTime,Date.prototype,"SystemLibrary"],registrationRaw=registrationFrame.filter((_value,index)=>index!==11),params=[metadata.name,selected,metadata.version,new Date(200),new Date(100)],runFrame=[config.dbWrap,${JSON.stringify(registrationSql)},params,sc,utilObject];
const FunctionPrototypeSymbolHasInstance=Function.prototype.call.bind(Function.prototype[Symbol.hasInstance]),webidl={};webidl.brandCheck=${BRAND};
const RequestClass=class _Request{#state;constructor(method){this.#state={method};}${METHOD}get url(){return forbidden();}};Object.defineProperty(RequestClass.prototype,"method",{enumerable:true});
class BL{constructor(req){this.req=req;this.pureUrl="/api/v4/projects/"+"a".repeat(64);this.pureQuery="";this._headers={path:"b".repeat(64)};}}class zL extends BL{}
const fetchWrapper=new BL(new RequestClass("GET")),legacyWrapper=new zL({method:"HEAD"}),driverFrame=[{},fetchWrapper,{},sc,utilObject,BL,zL],driverRaw=[driverFrame[0],fetchWrapper,driverFrame[2],sc,BL,zL];`, context);
  assert.equal(runInContext("typeof F5", context), "undefined"); return context;
}

void test("one fused driver call preserves Fetch and legacy captures for the unchanged reader without ambient util", () => {
  for (const mode of ["fetch", "legacy"] as const) {
    const context = fixture();
    if (mode === "legacy") { runInContext("driverFrame[1]=legacyWrapper;driverRaw[1]=legacyWrapper", context); }
    runInContext(`const before=(${REQUEST.capture}).call(driverFrame,capture),fused=(${JOINS.driver}).call(driverRaw,capture);`, context);
    assert.equal(runInContext("fused.length===9&&fused[0].length===7&&fused[0][4]===utilObject&&fused[1]===capture&&fused[0][1]===driverFrame[1]", context), true);
    if (mode === "fetch") { runInContext(`const scopes=[{_Request:RequestClass},{webidl},webidl,{FunctionPrototypeSymbolHasInstance}];const originalBound=(${REQUEST.bind}).call(before,...scopes),fusedBound=(${REQUEST.bind}).call(fused,...scopes);`, context); }
    const receiver = mode === "fetch" ? ["originalBound", "fusedBound"] : ["before", "fused"];
    const original: unknown = runInContext(`(${REQUEST.read}).call(${String(receiver[0])})`, context);
    const fused: unknown = runInContext(`(${REQUEST.read}).call(${String(receiver[1])})`, context);
    assert.deepEqual(structuredClone(fused), structuredClone(original)); assert.equal(runInContext("calls", context), 0);
  }
});

void test("fused registration uses independent SQL/startup trackers and preserves all original Date and await gates", () => {
  const context = fixture();
  runInContext(`const original=(${REGISTRATION.bind}).call(registrationFrame,startup,selected),fused=(${JOINS.registrationBind}).call(registrationRaw,capture,startup,selected);`, context);
  assert.equal(runInContext("fused.length===8&&fused[0].length===17&&fused[0][11]===utilObject&&fused[1]===startup&&fused[1]!==capture", context), true);
  const original: unknown = runInContext(`(${REGISTRATION.run}).call(runFrame,original)`, context);
  const fused: unknown = runInContext(`(${REGISTRATION.run}).call(runFrame,fused)`, context);
  assert.deepEqual(structuredClone(fused), structuredClone(original));
  runInContext(`const afterRaw=[receiver,metadata,columns,config,sc,Date,Date.now],openedRaw=[outer,selected,metadata,sc,Date,Date.now];
(${REGISTRATION.afterExec}).call([receiver,metadata,columns,config,sc,utilObject,Date,Date.now],original);(${JOINS.registrationAfterExec}).call(afterRaw,capture,fused);
(${REGISTRATION.opened}).call([outer,selected,metadata,sc,utilObject,Date,Date.now],original);(${JOINS.registrationOpened}).call(openedRaw,capture,fused);`, context);
  assert.equal(runInContext('fused[7].stage==="registration-awaited"&&fused[7].dates[0]===params[3]&&fused[7].dates[1]===params[4]', context), true);
  assert.throws(() => runInContext(`(${JOINS.registrationOpened}).call(openedRaw,capture,fused)`, context));
  assert.equal(runInContext("calls", context), 0);
});

void test("fixed fused joins reject raw/proxy/module/Date drift and reordered registration without invoking hooks", () => {
  for (const mutation of ['driverRaw[3]={}', 'Object.defineProperty(driverRaw,"1",{get:forbidden})', 'driverRaw=new Proxy(driverRaw,{ownKeys:forbidden})', 'utilObject.types.extra=true']) {
    const context = fixture();
    if (mutation.startsWith("driverRaw=new")) { runInContext("const rawProxy=new Proxy(driverRaw,{ownKeys:forbidden});", context); assert.throws(() => runInContext(`(${JOINS.driver}).call(rawProxy,capture)`, context)); }
    else { runInContext(mutation, context); assert.throws(() => runInContext(`(${JOINS.driver}).call(driverRaw,capture)`, context)); }
    assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture();
  assert.throws(() => runInContext(`(${JOINS.registrationBind}).call(registrationRaw,capture,capture,selected)`, context));
  runInContext(`const fused=(${JOINS.registrationBind}).call(registrationRaw,capture,startup,selected);`, context);
  assert.throws(() => runInContext(`(${JOINS.registrationAfterExec}).call([receiver,metadata,columns,config,sc,Date,Date.now],capture,fused)`, context));
  runInContext(`(${REGISTRATION.run}).call(runFrame,fused);`, context);
  assert.throws(() => runInContext(`(${JOINS.registrationAfterExec}).call([receiver,metadata,columns,config,sc,Date,forbidden],capture,fused)`, context));
  assert.equal(runInContext("calls", context), 0);
  for (const row of Object.values(FRAMES)) { assert.equal(/\bF5\b/u.test(row.rawExpression), false); }
  for (const program of Object.values(JOINS)) { assert.ok(Buffer.byteLength(JSON.stringify(program)) < 16_384); }
});

void test("the private bind accepts only exact Inspector scope wrappers and keeps the original direct-scope consumer unchanged", () => {
  const context = fixture();
  runInContext(`const request=(${JOINS.driver}).call(driverRaw,capture),holders=[{_Request:RequestClass},{webidl},webidl,{FunctionPrototypeSymbolHasInstance}],wrappers=[{description:"Block (lib/web/fetch/request.js)",object:holders[0]},{description:"Closure (lib/web/fetch/request.js)",object:holders[1]},webidl,{description:"Closure (lib/web/webidl/index.js)",object:holders[3]}];`, context);
  const direct: unknown = runInContext(`(${REQUEST.bind}).call(request,...holders)`, context);
  const normalized: unknown = runInContext(`(${PRIVATE_BIND}).call(request,...wrappers)`, context);
  assert.ok(Array.isArray(direct) && Array.isArray(normalized)); assert.equal(normalized.length, direct.length);
  assert.equal(normalized[0], direct[0]); assert.equal(normalized[1], direct[1]); assert.equal(normalized[2], direct[2]); assert.equal(normalized[4], direct[4]);
  assert.throws(() => runInContext(`(${PRIVATE_BIND}).call(request,...holders)`, context));
  assert.equal(runInContext("calls", context), 0); assert.ok(Buffer.byteLength(JSON.stringify(PRIVATE_BIND)) < 16_384);
  for (const mutation of [
    'wrappers[0].description="Closure (lib/web/fetch/request.js)"',
    'wrappers[0].unknown=true',
    'wrappers[0][Symbol("unknown")]=true',
    'Object.defineProperty(wrappers[0],"object",{get:forbidden})',
    'wrappers[0]=new Proxy(wrappers[0],{getOwnPropertyDescriptor:forbidden,ownKeys:forbidden,getPrototypeOf:forbidden})',
    'wrappers[0].object=new Proxy(holders[0],{getOwnPropertyDescriptor:forbidden,ownKeys:forbidden,getPrototypeOf:forbidden})',
    'capture[6]=forbidden',
  ]) {
    const changed = fixture();
    runInContext(`const request=(${JOINS.driver}).call(driverRaw,capture),holders=[{_Request:RequestClass},{webidl},webidl,{FunctionPrototypeSymbolHasInstance}],wrappers=[{description:"Block (lib/web/fetch/request.js)",object:holders[0]},{description:"Closure (lib/web/fetch/request.js)",object:holders[1]},webidl,{description:"Closure (lib/web/webidl/index.js)",object:holders[3]}];${mutation};`, changed);
    assert.throws(() => runInContext(`(${PRIVATE_BIND}).call(request,...wrappers)`, changed)); assert.equal(runInContext("calls", changed), 0);
  }
});
