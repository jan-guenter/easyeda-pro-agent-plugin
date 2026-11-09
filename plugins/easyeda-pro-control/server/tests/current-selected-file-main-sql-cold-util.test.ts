/** Real cold CommonJS util and Inspector; SQL classes are inert native Map/Set
 * peers. The separate retained N-API3 probe covers actual sqlite3 source. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_V1_CAPTURE_PROGRAM as V1,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_V1_JOIN_HELPERS as V1_JOINS } from "../src/current-selected-file-main-sql-fence-programs.ts";

// A fresh CJS process is essential: an ESM node:util import materializes every
// Named exports otherwise hide the original NativeLazyDataProperty refusal.
const childProgram = String.raw`
const fs=require('node:fs'),{Session}=require('node:inspector/promises');
const programs=JSON.parse(fs.readFileSync(0,'utf8')),util=require('node:util');
class Z2{}class Yo{};globalThis.__selectedSqlFrame=[Z2,Yo,{Database:Map,Statement:Set},util];
(async()=>{const session=new Session;session.connect();try{
await session.post('Runtime.enable');
const frame=await session.post('Runtime.evaluate',{expression:'globalThis.__selectedSqlFrame',throwOnSideEffect:true,returnByValue:false,silent:true});
if(frame.exceptionDetails||!frame.result.objectId)throw Error('FRAME');
const call=(program,objectId,args=[],byValue=false)=>session.post('Runtime.callFunctionOn',{objectId,functionDeclaration:program,arguments:args,throwOnSideEffect:true,returnByValue:byValue,silent:true,awaitPromise:false});
const before=await call(programs.v1,frame.result.objectId,[{value:'C:\\Synthetic\\fixture.eprj2'}]);
const capture=await call(programs.capture,frame.result.objectId,[{value:'C:\\Synthetic\\fixture.eprj2'}]);
if(capture.exceptionDetails||!capture.result.objectId)throw Error('CAPTURE');
const reproof=await call(programs.require,capture.result.objectId,[],true);
const after=await call(programs.v1,frame.result.objectId,[{value:'C:\\Synthetic\\fixture.eprj2'}]);
let getters=0;Object.defineProperty(util,'parseArgs',{configurable:true,enumerable:true,get(){getters++;throw Error('GETTER');}});
const opaque=await call(programs.capture,frame.result.objectId,[{value:'C:\\Synthetic\\fixture.eprj2'}]);
const defineLazyProperties=require('internal/util').defineLazyProperties;
if(typeof defineLazyProperties!=='function')throw Error('LAZY_FIXTURE');
defineLazyProperties(util,'internal/util/parse_args/parse_args',['unreviewedLazy']);
const unknown=await call(programs.capture,frame.result.objectId,[{value:'C:\\Synthetic\\fixture.eprj2'}]);
const sideEffect=r=>Boolean(r.exceptionDetails&&r.result.className==='EvalError'&&r.result.description.startsWith('EvalError: Possible side-effect in debug-evaluate'));
console.log(JSON.stringify({v8:process.versions.v8,before:sideEffect(before),capture:capture.result.description,reproof:reproof.result.value===true&&!reproof.exceptionDetails,after:sideEffect(after),opaque:!opaque.exceptionDetails,getters,unknown:sideEffect(unknown),dbConstructors:0,sqlCalls:0}));
}finally{session.disconnect();delete globalThis.__selectedSqlFrame;}})().catch(()=>{process.exitCode=1;});`;

void test("cold CJS lazy exports stay cold across the v2 capture and reproof under real Inspector side-effect checks", async () => {
  const child = spawn(process.execPath, ["--expose-internals", "--input-type=commonjs", "-e", childProgram], { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, NODE_OPTIONS: "" } });
  let stderr = "", stdout = "";
  child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
  child.stdout.on("data", (value: string) => { stdout += value; }); child.stderr.on("data", (value: string) => { stderr += value; });
  const exited = once(child, "close");
  child.stdin.end(JSON.stringify({ v1: V1, capture: CAPTURE, require: REQUIRE }));
  const [code, signal] = await exited as readonly unknown[]; assert.equal(signal, null); assert.equal(code, 0, stderr);
  assert.ok(stdout.length < 4096 && stderr.length < 4096);
  const result: unknown = JSON.parse(stdout);
  assert.ok(result !== null && typeof result === "object");
  for (const key of ["before", "reproof", "after", "opaque", "unknown"]) { assert.equal(Reflect.get(result, key), true, key); }
  for (const key of ["getters", "dbConstructors", "sqlCalls"]) { assert.equal(Reflect.get(result, key), 0, key); }
  assert.equal(Reflect.get(result, "capture"), "Array(11)");
});

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ isProxy: types.isProxy });
  runInContext(`let getters=0;const fail=()=>{getters++;throw Error("getter");};class Z2{}class Yo{};const F5={types:{isProxy},format:()=>{},promisify:()=>{}};Object.defineProperty(F5,"parseArgs",{get:fail,configurable:true,enumerable:true});const capture=(${CAPTURE}).call([Z2,Yo,{Database:Map,Statement:Set},F5],"C:\\\\Synthetic\\\\fixture.eprj2");`, context);
  return context;
}
void test("v2 seals complete util and types identities, prototypes, ordered string/symbol rosters and every safe descriptor", () => {
  for (const mutation of [
    'F5.format=fail', 'Object.defineProperty(F5,"promisify",{get:fail})', 'Object.setPrototypeOf(F5,{})', 'F5.extra=1', 'F5[Symbol("extra")]=1',
    'const d=Object.getOwnPropertyDescriptor(F5,"format");delete F5.format;Object.defineProperty(F5,"format",d)',
    'F5.types={isProxy}', 'Object.setPrototypeOf(F5.types,{})', 'F5.types.extra=1', 'F5.types[Symbol("extra")]=1', 'F5.types.isProxy=fail',
    'capture[5][0]="private.selected-file-main-sql-capture.v1"',
  ]) {
    const context = fixture(); runInContext(mutation, context);
    assert.throws(() => runInContext(`(${REQUIRE}).call(capture)`, context), /SELECTED_FILE_MAIN_SQL_FENCE_BINDING/u, mutation);
    assert.equal(runInContext("getters", context), 0, mutation);
  }
  const context = fixture(); runInContext('Object.defineProperty(F5,"parseArgs",{get:()=>{getters++;throw Error("changed");},configurable:false,enumerable:false})', context);
  assert.equal(runInContext(`(${REQUIRE}).call(capture)`, context), true);
  assert.equal(runInContext("capture[5][7]", context), false); assert.equal(runInContext("getters", context), 0);
});

void test("the historical v1 all-descriptor program and join remain byte-identical", () => {
  assert.equal(createHash("sha256").update(V1).digest("hex"), "562bdf9e1a029d3b0bfed2d95b945ba648dcd222fab3fa542cf0ff697e56eed0");
  assert.equal(createHash("sha256").update(V1_JOINS).digest("hex"), "a989c2adf7a3e68886869c0329854b38608c59e96c9340ea9c6808e04ba4d8e0");
});
