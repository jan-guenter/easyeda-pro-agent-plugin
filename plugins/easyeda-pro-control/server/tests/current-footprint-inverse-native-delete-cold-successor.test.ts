import {CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM} from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-delete-cold-profile.ts";
import { captureCurrentFootprintInverseNativeDeleteColdSuccessor } from "../src/current-footprint-inverse-native-delete-cold-successor-helper.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_SUCCESSOR_IDENTITY as IDENTITY } from "../src/current-footprint-inverse-native-delete-cold-successor-identity.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 } from "../src/current-pcb-diagnostic-helper-identity.ts";

void test("cold successor captures the dedicated helper under an exact launch switch", async () => {
  const distribution = "test-distro";
  const capture = await captureCurrentFootprintInverseNativeDeleteColdSuccessor(distribution);
  await capture.verify();
  assert.ok(capture.bootstrap.includes("footprint-inverse-native-delete-cold-successor.ps1"));
  assert.ok(capture.bootstrap.includes("[IO.FileShare]::Read"));
  assert.ok(capture.bootstrap.includes(IDENTITY.helper.sha256));
  assert.ok(capture.bootstrap.includes(`${PROFILE.nativeSwitch}}finally{$file.Dispose()}`));
});

void test("cold successor is single purpose and keeps historical shared pins", async () => {
  const helper = await readFile(new URL(`../../${IDENTITY.helper.relativePath}`, import.meta.url), "utf8");
  assert.equal(helper.split("\n")[0], "param([switch]$FootprintInverseNativeDeleteCold209,[switch]$CompileOnly)");
  assert.match(helper, /\$owner=\[EasyedaDiagnosticOwner\]::CreateFootprintInverseNativeDeleteCold209\(\)\n\$owner.RequireNativeDeleteColdBirth\(\)/u);
  const initialization=helper.indexOf("$owner.Initialize()"),smoke=helper.indexOf("[EasyedaDiagnosticOwner]::VerifyNativeDeleteColdBirthSmoke()");
  assert.ok(smoke!==-1&&initialization!==-1);assert.ok(smoke<initialization);
  assert.ok(helper.includes("$startupRequestLimit=[EasyedaDiagnosticOwner]::NativeDeleteColdRequests"));
  assert.deepEqual(IDENTITY.predecessor, { bytes: CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, sha256: CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 });
  assert.equal(PROFILE.normalRequestLimit + PROFILE.cleanupRequestLimit, PROFILE.requestLimit);
});




void test("actual path selector validates distribution only on deterministic UNC input",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-native-delete-cold-successor-helper.ts",import.meta.url),"utf8");
 const start=source.indexOf("export async function captureCurrentFootprintInverseNativeDeleteColdSuccessor(");assert.ok(start!==-1);
 const program=source.slice(start).replace("export async function","async function").replaceAll("import.meta.url",JSON.stringify("file:///fixed/helper.ts"));
 function fixture(path:string):vm.Context{
  const original=Object.freeze({});
  const context=vm.createContext({assert,Buffer,URL,IDENTITY,PROFILE,MAXIMUM,
   need:(ok:boolean):void=>{assert.ok(ok,"INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE");},
   fileURLToPath:():string=>path,powershellSingleQuotedBody:(value:string):string=>value,
   readPinnedSource:(value:string,previous?:object):Promise<object>=>{assert.equal(value,path);if(previous!==undefined){assert.equal(previous,original);}return Promise.resolve(original);},
  });
  vm.runInContext(stripTypeScriptTypes(program),context);return context;
 }
 const invalid=JSON.stringify("test-distro' unexpected");
 const unc=fixture("/fixed/passive/helper.ps1");
 await assert.rejects(async()=>{await vm.runInContext(["captureCurrentFootprintInverseNativeDeleteColdSuccessor(",invalid,")"].join(""),unc);},/INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE/u);
 const drive=fixture("/mnt/c/fixed/helper.ps1");
 const expected=JSON.stringify(["C:","fixed","helper.ps1"].join(String.fromCodePoint(92)));
 await vm.runInContext(["captureCurrentFootprintInverseNativeDeleteColdSuccessor(",invalid,").then(async value=>{await value.verify();assert.ok(value.bootstrap.includes(",expected,"));})"].join(""),drive);
});
