/** Execute the real fixed programs in a separate realm with inert SQLite
 * peers. No native app/SQL or genuine Core intent is supplied by this fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as STARTUP } from "../src/current-main-startup-config-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_CALLS as CALLS } from "../src/current-saved-project-registration-config-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SQL as SQL } from "../src/current-saved-project-registration-config-source.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy, nativeDate: types.isDate });
  runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("unexpected application/native invocation");};
class Z2{constructor(db){this.db=db;}}class Yo{constructor(path,db){this.path=path;this.db=db;this.dbWrap=new Z2(db);this.transactionDepth=0;}}
const F5={types:{isProxy:nativeProxy,isDate:nativeDate}},sc={Database:Map,Statement:Set},documents="C:\\Synthetic\\Documents",root=documents+"\\EasyEDA-Pro",directory=root+"\\database",path=directory+"\\web.db",selected="C:\\Synthetic\\Disposable@3.2.209.eprj2";
const db=()=>{const value=new Map;Object.defineProperty(value,"filename",{value:path});return value;},init=new Yo(path,db()),config=new Yo(path,db());
const row={key:"sqlite",value:"25.10.31.1"},startupFrame=[path,init.db,init,row,path,documents,root,directory,"EasyEDA-Pro",sc,F5,Date,Date.now];
const capture=(${CAPTURE}).call([Z2,Yo,sc,F5],selected),startup=(${STARTUP.version}).call(startupFrame,capture);
class Vu{constructor(ctx){this.ctx=ctx;}}class Sd{constructor(ctx){this.ctx=ctx;}}class Q{constructor(){this.tableName="db_paths";this.example={path:"string",name:"string",version:"",system:false,type:1,last_open_time:new Date};}}class Jr{constructor(symbol,name){this.tbSymbol=symbol;this.alias="";this.name=name;}}
const ctx={requestParams:{path:selected}},receiver=new Vu(ctx),outer=new Sd(ctx),metadata={name:"Disposable",version:"3.2.209",path:selected,ext:".eprj2",system:false},table=new Q,columns={},symbol=Symbol("db_paths");
for(const name of["path","name","version","system","type","last_open_time"])columns[name]=new Jr(symbol,name);
const frame=[receiver,metadata,columns,config,table,Vu,Sd,Q,Jr,path,sc,F5,Date,Date.now,Date.prototype.getTime,Date.prototype,"SystemLibrary"];
let tracker,params=[metadata.name,selected,metadata.version,new Date(200),new Date(100)],runFrame=[config.dbWrap,${JSON.stringify(SQL.upsert)},params,sc,F5];`, context);
  return context;
}
function bind(context: ReturnType<typeof createContext>): void { runInContext(`tracker=(${CALLS.bind}).call(frame,startup,selected)`, context); }
function run(context: ReturnType<typeof createContext>): unknown { return runInContext(`(${CALLS.run}).call(runFrame,tracker)`, context); }
function afterExec(context: ReturnType<typeof createContext>): void { runInContext(`(${CALLS.afterExec}).call([receiver,metadata,columns,config,sc,F5,Date,Date.now],tracker)`, context); }
function opened(context: ReturnType<typeof createContext>): void { runInContext(`(${CALLS.opened}).call([outer,selected,metadata,sc,F5,Date,Date.now],tracker)`, context); }

void test("actual fixed registration programs preserve both Date identities and consume one run and each original await once", () => {
  const context = fixture(); bind(context);
  const result: unknown = run(context); assert.deepEqual(structuredClone(result), { schema: "private.current-saved-project-registration-run.v1",
    path: String.raw`C:\Synthetic\Disposable@3.2.209.eprj2`, insertEpochMilliseconds: 200, updateEpochMilliseconds: 100,
    nativeSqlCallbackCompleted: false, selectedDesignWriteAuthorized: false });
  assert.throws(() => { run(context); }); afterExec(context); assert.throws(() => { afterExec(context); }); opened(context); assert.throws(() => { opened(context); });
  assert.equal(runInContext("calls", context), 0);
});
void test("wrong project/metadata, receiver, SQL, native Date, callback order or changed original descriptors stay held", () => {
  const mutations = [String.raw`frame[1].path="C:\\foreign.eprj2"`, 'frame[1].system=true', 'frame[1].name="SystemLibrary"',
    'frame[0]=new Sd(ctx)', 'Object.defineProperty(metadata,"name",{get:forbidden})', 'frame[2]=new Proxy(columns,{getOwnPropertyDescriptor:forbidden})'];
  for (const mutation of mutations) { const context = fixture(); runInContext(mutation, context); assert.throws(() => { bind(context); }); assert.equal(runInContext("calls", context), 0); }
  for (const mutation of ['runFrame[0]=init.dbWrap', 'runFrame[1]+=";DELETE FROM projects"', 'params[3]=params[4]',
    'params[3]={}', 'params[3]=new Date(NaN)', 'params[3]=new Proxy(new Date,{getPrototypeOf:forbidden})',
    'config.queryOne=forbidden', 'config.db.get=forbidden', 'Date.prototype.getTime=forbidden']) {
    const context = fixture(); bind(context); runInContext(mutation, context); assert.throws(() => { run(context); }); assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture(); bind(context); assert.throws(() => { afterExec(context); }); run(context); assert.throws(() => { opened(context); });
  afterExec(context); runInContext('outer.ctx={requestParams:{path:selected}}', context); assert.throws(() => { opened(context); }); assert.equal(runInContext("calls", context), 0);
});
