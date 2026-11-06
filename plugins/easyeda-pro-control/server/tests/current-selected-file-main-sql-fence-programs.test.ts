/** Pure source-condition classification in an isolated realm. Genuine built-in
 * native constructors model native prototype/immutable field shapes here;
 * these comparisons do not issue an original app/runtime capability. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM as CONFIGURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SELECT_PROGRAM as SELECT } from "../src/current-selected-file-main-sql-fence-programs.ts";

type Site = keyof typeof CONDITIONS;
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy });
  runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("native/app effect");};
class Z2{constructor(db){this.db=db;}}
class Yo{}const F5={types:{isProxy:nativeProxy}},sc={Database:Map,Statement:Set};
const path="C:\\Synthetic\\fixture.eprj2",db=new Map,wrap=new Z2(db),stmt=new Set;
Object.defineProperty(db,"filename",{value:path});Object.defineProperty(stmt,"sql",{value:"select uuid from projects where uuid = ?"});
let e="select uuid from projects where uuid = ?",r=["known"],s=stmt,t=path,a=db;
const captured=(${CAPTURE}).call([Z2,Yo,sc,F5],path);`, context);
  return context;
}
function predicate(context: ReturnType<typeof createContext>, site: Site): unknown {
  return runInContext(`(function(){return ${CONDITIONS[site]};}).call(wrap)`, context);
}
function query(context: ReturnType<typeof createContext>, sql: string, params: unknown[] = []): void {
  runInContext(`e=${JSON.stringify(sql)};r=${JSON.stringify(params)};`, context);
}
void test("source-known SELECT shapes pass without native/application calls or shared state mutations", () => {
  const allowed: readonly (readonly [string, unknown[]])[] = [
    ['select t1."uuid" as "uuid" from projects t1 where t1."uuid" = ?', ["known"]],
    ['SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type = \'table\' AND name = ?', ["projects"]],
    ['select count(1) as "cnt" from branches t1 where t1."uuid" IN (?,?)', ["a", "b"]],
    ['select max(t1."num") as "num" from project_history_0123456789abcdef0123456789abcdef t1 where t1."uuid" = ?', ["h"]],
  ];
  for (const [sql, params] of allowed) { const context = fixture(); query(context, sql, params); assert.equal(predicate(context, "queryOne"), false, sql); assert.equal(runInContext("calls", context), 0); assert.equal(runInContext(`(${REQUIRE}).call(captured)`, context), true); }
});
void test("every non-source SQL/function/table/parameter form pauses instead of failing open", () => {
  const blocked = ['select 1', 'update projects set ticket=2', 'delete from history_data', 'begin immediate transaction', 'commit transaction', 'rollback transaction', 'vacuum', 'pragma user_version', 'pragma journal_mode=wal', 'pragma writable_schema=ON', 'select load_extension(?) from projects', 'select writefile(?,?) from projects', 'select eval(?) from projects', 'select arbitrary_function(?) from projects', 'select datetime(?) from projects', 'select * from pragma_wal_checkpoint(?)', 'select * from foreign_table', 'select 1 from projects;delete from projects', 'select 1 from projects--comment', 'select 1 from projects/*comment*/', 'WITH x AS(SELECT 1)DELETE FROM projects', 'explain select 1 from projects', 'select 1 into x from projects', 'select \'load_extension\'(?) from projects', 'select (1 from projects', 'select 1)from projects', 'select \u0000'];
  for (const sql of blocked) { const context = fixture(); query(context, sql); assert.equal(predicate(context, "queryOne"), true, sql); assert.equal(runInContext("calls", context), 0); }
  const context = fixture(); query(context, "select uuid from projects where uuid=?", []); assert.equal(predicate(context, "queryOne"), true);
  runInContext('e="select uuid from projects where uuid=?";r=[{valueOf:forbidden,toString:forbidden}];', context); assert.equal(predicate(context, "run"), true); assert.equal(runInContext("calls", context), 0);
});
void test("prepared SQL checks the actual native statement's immutable own SQL field; mutation preparation pauses before native compile", () => {
  const context = fixture(); assert.equal(predicate(context, "prepare"), false); runInContext("e=stmt", context); assert.equal(predicate(context, "statementEach"), false);
  runInContext('e="insert into texts(path,dataStr)values(?,?)";r=["path","text"];', context); assert.equal(predicate(context, "prepare"), true);
  runInContext('e=new Set;Object.defineProperty(e,"sql",{value:"insert into texts(path,dataStr)values(?,?)"});', context); assert.equal(predicate(context, "statementRun"), true);
  runInContext('e=Object.create(Set.prototype);Object.defineProperty(e,"sql",{get:forbidden});', context); assert.equal(predicate(context, "statementEach"), true); assert.equal(runInContext("calls", context), 0);
});
void test("unknown descriptor/prototype/property forms and proxies pause without invoking effectful traps", () => {
  for (const mutation of ['Object.setPrototypeOf(wrap,{})', 'Object.defineProperty(wrap,"db",{get:forbidden})', 'wrap.db=new Map', 'db.run=forbidden', 'r=new Proxy([],{getOwnPropertyDescriptor:forbidden,getPrototypeOf:forbidden})', 'e=stmt', 'wrap.db=new Proxy(db,{getOwnPropertyDescriptor:forbidden,getPrototypeOf:forbidden})']) {
    const context = fixture(); runInContext(mutation, context); assert.equal(predicate(context, "queryOne"), true, mutation); assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture(); runInContext('F5.types.isProxy=()=>false;', context); assert.equal(predicate(context, "queryOne"), true); assert.equal(runInContext("calls", context), 0);
});
void test("initializer configuration always pauses separately; no statement/driver policy calls it readonly", () => {
  const context = fixture(); assert.equal(predicate(context, "initializerSerialize"), true); assert.equal(predicate(context, "initializerPragma"), true);
  query(context, "PRAGMA journal_mode = delete"); assert.equal(predicate(context, "run"), true); assert.equal(runInContext("calls", context), 0);
});
void test("captured original exports/prototypes and current selected raw frame are independently joined", () => {
  const context = fixture(); assert.equal(runInContext(`(${REQUIRE}).call(captured)`, context), true);
  assert.doesNotThrow(() => runInContext(`(${SELECT}).call([wrap,e,r,sc,F5],captured)`, context));
  runInContext('sc.Database=WeakMap;', context); assert.throws(() => runInContext(`(${REQUIRE}).call(captured)`, context), /SELECTED_FILE_MAIN_SQL_FENCE_BINDING/u);
  const changed = fixture(); runInContext(String.raw`const wrong=new Map;Object.defineProperty(wrong,"filename",{value:"C:\other.eprj2"});wrap.db=wrong;`, changed);
  assert.throws(() => runInContext(`(${SELECT}).call([wrap,e,r,sc,F5],captured)`, changed), /SELECTED_FILE_MAIN_SQL_FENCE_BINDING/u); assert.equal(runInContext("calls", changed), 0);
});
void test("fixed predicates are bounded and exceptions from unknown lexical bindings pause", () => {
  for (const [site, condition] of Object.entries(CONDITIONS)) { assert.ok(Buffer.byteLength(condition) < 8192, site); assert.equal(runInContext(condition, createContext({})), true, site); }
});

void test("original initializer configuration records each native DB/owner pair once without granting design SQL", () => {
  const context = fixture();
  runInContext('const owner=new Yo;owner.path=path;owner.db=db;owner.dbWrap=wrap;const cfgFrame=[path,db,owner,sc,F5];', context);
  const first = runInContext(`(${CONFIGURE}).call(cfgFrame,captured,"serialize")`, context);
  assert.equal(Reflect.get(first, "designWriteGrant"), false); assert.equal(Reflect.get(first, "readonlySql"), false);
  assert.throws(() => runInContext(`(${CONFIGURE}).call(cfgFrame,captured,"serialize")`, context));
  const second = runInContext(`(${CONFIGURE}).call(cfgFrame,captured,"pragma")`, context);
  assert.equal(Reflect.get(second, "selectedFile"), true); assert.equal(Reflect.get(second, "nativeCompletionProven"), false);
  assert.throws(() => runInContext(`(${CONFIGURE}).call(cfgFrame,captured,"pragma")`, context));
  assert.equal(runInContext("calls", context), 0);
});
