/* oxlint-disable import/max-dependencies -- Independently pinned canonical inputs, two compiler codecs and the genuine runtime metadata exports must agree without importing ownership facades. */
/** Build/data tests only. Source closure and unchanged metadata prove no live
 * owner, application admission or positive connected lifecycle. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {basename,dirname,resolve} from "node:path";
import {test} from "node:test";
import {fileURLToPath} from "node:url";
import {parse} from "acorn";
import {CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES as BASELINES} from "../../scripts/inverse-native-canonical-baselines.ts";
import {composeCurrentInverseNativeCanonicalSource,readCurrentInverseNativeCanonicalInputs,requireCurrentInverseNativeCanonicalInputs} from "../../scripts/inverse-native-canonical-inputs.ts";
import {generateFootprintInverseNativeContinuationV4Source} from "../../scripts/footprint-inverse-native-continuation-v4-source.ts";
import {generateFootprintInverseNativeDeleteColdUiSource} from "../../scripts/generate-footprint-inverse-native-delete-cold-ui.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_ACTION_LIMITS as ACTIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE as V4} from "../src/current-footprint-inverse-native-continuation-v4-profile.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROFILE as COLD} from "../src/current-footprint-inverse-native-delete-cold-ui-profile.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_BOOKKEEPING as BEGIN_BOOKKEEPING,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_REBASE as BEGIN_REBASE,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_BOOKKEEPING as HISTORY_BOOKKEEPING,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_REBASE as HISTORY_REBASE,captureCurrentFootprintInverseNativeDeleteMainCommand as captureMain} from "../src/current-footprint-inverse-native-delete-main-captured.ts";

const hash=(source:string):string=>createHash("sha256").update(source).digest("hex");
for(const layout of ["inverse-native-continuation.v4","inverse-native-delete-cold-ui.v1"]as const){
 void test(`independent ${layout} canonical sources reproduce their exact reviewed compiler bytes`,async()=>{
  const input=await readCurrentInverseNativeCanonicalInputs(layout),pin=BASELINES[layout];assert.ok(Object.isFrozen(input)&&Object.isFrozen(pin)&&Object.isFrozen(pin.owner));
  let driverReads=0,ownerReads=0;const changing={get ownerSource():string{ownerReads+=1;return ownerReads===1?input.ownerSource:"changed-after-validation";},get driverSource():string{driverReads+=1;return driverReads===1?input.driverSource:"changed-after-validation";}};
  assert.equal(hash(composeCurrentInverseNativeCanonicalSource(layout,changing)),hash(composeCurrentInverseNativeCanonicalSource(layout,input)));assert.equal(ownerReads,1);assert.equal(driverReads,1);
  const data=layout==="inverse-native-continuation.v4"?generateFootprintInverseNativeContinuationV4Source(input):generateFootprintInverseNativeDeleteColdUiSource(input);
  assert.equal(hash(data.helper),pin.outputHelper.sha256);assert.equal(data.review,input.ownerSource);assert.equal(hash(data.compiler),layout==="inverse-native-continuation.v4"?"f51c3498a7fbe56f9011eccaf20bb1a49bfdac489da429cb83e15fb5d4e3c37e":"29fde472f265627539ab97fd5cb5266dc16e0070ffc41a65d0cfa0ae833a3f6f");
  for(const key of ["ownerSource","driverSource"]as const){assert.throws(()=>requireCurrentInverseNativeCanonicalInputs(layout,{...input,[key]:`${input[key]} `}),/INVERSE_NATIVE_CANONICAL_SOURCE/u);}
  const foreign=layout==="inverse-native-continuation.v4"?"inverse-native-delete-cold-ui.v1":"inverse-native-continuation.v4";assert.throws(()=>requireCurrentInverseNativeCanonicalInputs(foreign,input),/INVERSE_NATIVE_CANONICAL_SOURCE/u);
  assert.throws(()=>Reflect.apply(requireCurrentInverseNativeCanonicalInputs,undefined,[layout,{...input,targetPath:"not-a-build-input"}]),/INVERSE_NATIVE_CANONICAL_SOURCE/u);
 });
}
void test("new default V4/cold-UI metadata preserves every exact pre-isolation runtime value",()=>{
 for(const [data,expected]of [[V4,"ed1940964f7708a179d2d72b35b24bb29885f91aa11b3f4e979252347903560a"],[ACTIONS,"6ecc60663e0c063296bea5ae04ffca9801bc9266df773ab871a2a9dc63841510"],[COLD,"36bfca5a737824c88d9ed34222b2cca6c2954e93870412de9834d40e9555e1ae"]]as const){assert.equal(hash(JSON.stringify(data)),expected);assert.ok(Object.isFrozen(data));}
 assert.equal(Reflect.set(V4.main,"normal",0),false);assert.equal(Reflect.set(COLD.requests.sources,"sender",0),false);assert.equal(V4.compiler.compilerMaxBytes,2_490_368);assert.equal(V4.wholeInverseReserved,false);assert.equal(COLD.executionAuthorized,false);
});
/** Walk actual stripped module syntax, including literal dynamic imports. This
 * proves a source dependency boundary, not execution or owner construction. */
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function imports(value:unknown):string[]{
 if(Array.isArray(value)){return value.flatMap((entry:unknown)=>imports(entry));}if(!record(value)){return[];}
 const source=value["source"],type=value["type"];
 if((type==="ImportDeclaration"||type==="ExportNamedDeclaration"||type==="ExportAllDeclaration"||type==="ImportExpression")&&record(source)&&source["type"]==="Literal"&&typeof source["value"]==="string"){return[source["value"]];}
 return Object.values(value).flatMap(entry=>imports(entry));
}
void test("maintained generators and new default profile data have no legacy inverse implementation inputs",async()=>{
 const root=fileURLToPath(new URL("../../",import.meta.url));const queue=["scripts/generate-footprint-inverse-native-continuation-v4.ts","scripts/generate-footprint-inverse-native-delete-cold-ui.ts","server/src/current-footprint-inverse-native-continuation-v4-profile.ts","server/src/current-footprint-inverse-native-delete-cold-ui-profile.ts"].map(path=>resolve(root,path));const seen=new Set<string>();
 while(queue.length>0){const path=queue.shift();assert.ok(typeof path==="string"&&path.length>0);if(!seen.has(path)){assert.ok(seen.size<128,"new input closure unexpectedly imports an implementation registry");seen.add(path);const source=await readFile(path,"utf8");
  const dependencies=imports(parse(stripTypeScriptTypes(source,{mode:"transform"}),{ecmaVersion:"latest",sourceType:"module"}));for(const dependency of dependencies){if(dependency.startsWith(".")){queue.push(resolve(dirname(path),dependency));}}
 }}
 for(const forbidden of ["generate-worker-startup-protocol.ts","footprint-inverse-native-source.ts","current-footprint-inverse-native-profile.ts","current-footprint-inverse-native-lifecycle-profile.ts","current-footprint-inverse-native-continuation-profile.ts","current-footprint-inverse-native-continuation-v3-profile.ts","current-footprint-inverse-native-identity.ts","current-pcb-diagnostic-owner.ts","current-pcb-diagnostic-pipe.ts"]){assert.equal([...seen].some(path=>basename(path)===forbidden),false,forbidden);}
 assert.ok([...seen].some(path=>basename(path)==="inverse-native-canonical-inputs.ts"));
});

void test("isolated inverse source fork admits only exact fixed Main catalogues above the shared scalar bound",()=>{
 let longPrograms=0;
 for(const[phase,catalogue]of[["inverse-native-delete-main-begin-rebase",BEGIN_REBASE],["inverse-native-delete-main-begin-bookkeeping",BEGIN_BOOKKEEPING],["inverse-native-delete-main-history-rebase",HISTORY_REBASE],["inverse-native-delete-main-history-bookkeeping",HISTORY_BOOKKEEPING]]as const){
  for(const row of Object.values(catalogue)){
   assert.ok(Object.isFrozen(row)&&Buffer.byteLength(row.program)<=60_000);const captured=captureMain({phase,params:{functionDeclaration:row.program}});assert.ok(record(captured));const params=captured["params"];assert.ok(record(params));assert.equal(params["functionDeclaration"],row.program);
   if(Buffer.byteLength(row.program)>16_384){longPrograms+=1;assert.throws(()=>captureMain({phase,params:{functionDeclaration:`${row.program} `}}));}
  }
 }
 assert.ok(longPrograms>0,"the exact fixed-source exception must be exercised");
});


void test("canonical transport failures retain consumed writes and original terminal cleanup",async()=>{
 for(const layout of ["inverse-native-continuation.v4","inverse-native-delete-cold-ui.v1"]as const){
  const {ownerSource:owner}=await readCurrentInverseNativeCanonicalInputs(layout);
  const write=owner.slice(owner.indexOf("void WriteAll("),owner.indexOf("void WriteFrame("));
  assert.match(write,/catch\{Fail\("socket-write"\);throw;\}/u);
  const send=owner.slice(owner.indexOf("  void SendMessage("),owner.indexOf("  public string Poll()"));
  assert.ok(send.indexOf("id!=nextRequest")<send.indexOf("if(consume!=null)consume();"));
  assert.ok(send.indexOf("Encoding.UTF8.GetBytes(message)")<send.indexOf("if(consume!=null)consume();"));
  assert.ok(send.indexOf("if(consume!=null)consume();")<send.indexOf("nextRequest++"));
  assert.match(send,/catch \{ protocolFailed=true; throw; \}/u);
  const tcp=owner.slice(owner.indexOf("static TcpRow[] TcpRows()"),owner.indexOf("internal static void CompareRows("));
  assert.match(tcp,/attempt<3/u);assert.match(tcp,/result==122/u);assert.match(tcp,/size>capacity&&size<=4\+65536U\*24&&attempt<2/u);assert.match(tcp,/finally\{System.Runtime.InteropServices.Marshal.FreeHGlobal\(memory\);\}/u);
  const release=owner.slice(owner.indexOf("  public void ReleaseClosed()"),owner.indexOf("  public void RetainUntilClosed()"));
  assert.match(release,/originalMainReleaseObserved&&launchAttempted&&creationPhase==CreationPhase.RootRetained/u);
  assert.match(owner,/if\(originalMainReleaseObserved&&launchAttempted&&creationPhase==CreationPhase.RootRetained\|\|Terminated\(\)\)/u);
  assert.match(release,/originalMain.Release\(\);originalMainReleaseObserved=true;/u);
  const cleanup=owner.slice(owner.indexOf("}finally{if(pending!=null)pending.CancelAtDeadline()"));
  assert.ok(cleanup.indexOf("smoke-unblock-read")<cleanup.indexOf("while(pending!=null&&!pending.TryDisposeExited())"));
  assert.ok(cleanup.indexOf("while(pending!=null&&!pending.TryDisposeExited())")<cleanup.indexOf("bool writeClosed=CloseHandle(write)"));
 }
});

void test("canonical request framing refuses an entire oversized frame inside the cleanup-capable catch",async()=>{
 for(const layout of ["inverse-native-continuation.v4","inverse-native-delete-cold-ui.v1"]as const){
  const {driverSource:driver}=await readCurrentInverseNativeCanonicalInputs(layout);
  assert.match(driver.slice(0,driver.indexOf("Add-Type")),/@\(\$args\).Count -ne 0/u);
  const loop=driver.slice(driver.indexOf("while (-not $release)"));
  assert.ok(loop.indexOf("$request=$null")<loop.indexOf("try {"));
  assert.ok(loop.indexOf("try {")<loop.indexOf("$line=New-Object Text.StringBuilder"));
  assert.match(loop,/if \(\$line.Length -ge 32768\) \{\$oversized=\$true\}/u);
  assert.ok(loop.indexOf("if ($oversized) {throw 'pcb-diagnostic-request-size'}")<loop.indexOf("ConvertFrom-Json"));
  assert.match(loop,/else \{\[void\]\$line.Append\(\[char\]\$character\)\}/u);
 }
 const {driverSource:driver,ownerSource:owner}=await readCurrentInverseNativeCanonicalInputs("inverse-native-delete-cold-ui.v1");
 for(const code of ["control","field","purpose","send"]){assert.ok(driver.includes(`'inverse-native-delete-cold-ui-${code}'`));}
 const book=owner.slice(owner.indexOf("static class NativeDeleteColdUiBook"),owner.indexOf("// END NATIVE DELETE COLD UI READONLY V1"));
 assert.match(book,/static NativeDeleteColdUiBook\(\)\{/u);
 const encode=book.slice(book.indexOf("internal static string Encode("));
 assert.equal(encode.includes("foreach(string[][] table in Programs)"),false);
 assert.ok(book.includes("9a20e52c51efc35dcbf8a0755a2690a31277a211673a655c05f18798fad43c61"));
});
