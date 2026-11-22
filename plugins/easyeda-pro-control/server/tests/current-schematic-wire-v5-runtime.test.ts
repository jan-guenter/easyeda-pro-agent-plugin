/** Exact fixed observer codebook only; this allocates no native Job or app. */
import assert from "node:assert/strict";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V5_CSHARP_COMPILER_MAX_BYTES as COMPILER_MAXIMUM,currentSchematicWireWriterV5CSharpCompilerInput,packCurrentSchematicWireWriterV5CSharpStorage} from "../src/current-schematic-wire-writer-v5-csharp-storage.ts";
import {packCurrentPcbDiagnosticCSharpReviewStorageV3} from "../src/current-pcb-diagnostic-csharp-review-storage-v3.ts";
import {currentPcbDiagnosticCSharpRuntimeCompilerInput} from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import {test} from "node:test";
import {gunzipSync} from "node:zlib";
import {currentSchematicWireV5TitleCases,currentSchematicWireV5TitleWire,validateCurrentSchematicWireV5TitleCommand} from "../src/current-schematic-wire-v5-title-protocol.ts";
import {currentSchematicWireV5TitleNativeSource} from "../src/current-schematic-wire-v5-title-native.ts";
import {currentSchematicWireWriterV5NativeRequest} from "../src/current-schematic-wire-writer-v5-protocol.ts";
import {currentSchematicWireWriterV4NativeRequest} from "../src/current-schematic-wire-writer-v4-protocol.ts";
// oxlint-disable-next-line import/max-dependencies -- Compare the fixed V5 stage against its original V4 encoder profile.
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4 } from "../src/current-schematic-wire-writer-v4-native-profile.ts";
import { currentSchematicWireWriterV5NativeCommand } from "../src/current-schematic-wire-writer-v5-native-command.ts";

async function hash(bytes: Uint8Array): Promise<string> {
 const digest=await globalThis.crypto.subtle.digest("SHA-256",new Uint8Array(bytes));
 return Buffer.from(digest).toString("hex");
}
function envelopeLiteral(length:number):string{return `Add-Type @'\ninternal static class V5Envelope{internal const string Fixed="${"q".repeat(length)}";}\n'@\n`;}

void test("all468 exact observer selectors enter V5 and refuse historical V4 or caller programs",()=>{
 const cases=currentSchematicWireV5TitleCases();assert.equal(cases.length,468);
 for(const command of cases){const fixed=currentSchematicWireV5TitleWire(command,79,"session29");const bytes=Buffer.from(`${JSON.stringify(fixed.wire)}\0`);assert.deepEqual(currentSchematicWireWriterV5NativeRequest(bytes),fixed.request);assert.throws(()=>currentSchematicWireWriterV4NativeRequest(bytes));assert.throws(()=>validateCurrentSchematicWireV5TitleCommand({...command,callerCode:"arbitrary"}));if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentSchematicWireV5TitleCommand({...command,params:{...command.params,functionDeclaration:"function(){return true;}"}}));}if(command.method==="Debugger.setBreakpoint"&&"condition"in command.params){assert.throws(()=>validateCurrentSchematicWireV5TitleCommand({...command,params:{...command.params,condition:"Array.isArray(i)"}}));}}
});
void test("native title data keeps each exact table within unchanged64KiB/256-row decoder limits",async()=>{
 const source=currentSchematicWireV5TitleNativeSource();const tables=[...source.matchAll(/EasyedaDiagnosticFixedTable\.Load\("([A-Za-z\d+/=]+)",(\d+),"([a-f\d]{64})","([a-f\d]{64})",(\d+),3\)/gu)];assert.ok(tables.length>1&&tables.length<=32);let rows=0;
 for(const table of tables){const encoded=table[1];const length=table[2];const expected=table[3];const packedHash=table[4];const count=table[5];assert.ok(encoded!==undefined&&length!==undefined&&expected!==undefined&&packedHash!==undefined&&count!==undefined);assert.ok(Number(length)<=65_536&&Number(count)<=256);const packed=Buffer.from(encoded,"base64");assert.equal(await hash(packed),packedHash);
 // oxlint-disable-next-line node/no-sync -- This inert check decodes one bounded immutable native table at a time.
 const bytes=gunzipSync(packed,{maxOutputLength:65_536});assert.equal(bytes.length,Number(length));assert.equal(await hash(bytes),expected);assert.equal(bytes.toString().split("\0").length,Number(count));rows+=Number(count);}
 assert.equal(rows,468);assert.ok(source.includes("wireV5ContinuityChecks!=wireV5TitleReads*2+1"));assert.ok(source.includes("internal static void VerifySmoke()"));
});

void test("new V5 compiler envelope cannot enlarge historical storage or accept a V5 compiler above its own ceiling",()=>{
 const original=envelopeLiteral(2_100_000);assert.throws(()=>packCurrentPcbDiagnosticCSharpReviewStorageV3(original),/CAPACITY_COMPILER/u);const packed=packCurrentSchematicWireWriterV5CSharpStorage(original);const compiler=currentSchematicWireWriterV5CSharpCompilerInput(packed);assert.ok(Buffer.byteLength(compiler)>2_097_152&&Buffer.byteLength(compiler)<=COMPILER_MAXIMUM);assert.equal(currentPcbDiagnosticCSharpRuntimeCompilerInput(packed),compiler);assert.throws(()=>packCurrentSchematicWireWriterV5CSharpStorage(envelopeLiteral(COMPILER_MAXIMUM)),/CAPACITY_COMPILER/u);
});

void test("the current V5 native path refuses the historical ambient conditional ft arm",()=>{
 assert.throws(()=>currentSchematicWireV5TitleWire({phase:"wire-title-ft-arm",variant:0,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original27",lineNumber:6,columnNumber:4891},condition:"!Array.isArray(i)"}},79,"session29"),/CONDITIONAL_FT_NOT_ADMITTED/u);
});

function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }

void test("V5 copied stages stop at the V4 encoder bound while title and shared reads retain V5 IDs", () => {
  const sessionId = "session29";
  const uniqueContextId = "context27";
  const { total: stageLimit } = V4.renderer;
  const command = currentSchematicWireWriterV5NativeCommand("start", uniqueContextId);
  assert.deepEqual(currentSchematicWireWriterV5NativeRequest(wire({ id: stageLimit, ...command, sessionId })),
    { action: "schematic-wire-writer-v5-native", requestId: stageLimit, sessionId, phase: "start", uniqueContextId });
  const aboveStage = stageLimit + 1;
  assert.throws(() => currentSchematicWireWriterV5NativeRequest(wire({ id: aboveStage, ...command, sessionId })),
    /WIRE_V5_STAGE_REQUEST_LIMIT/u);

  const [title] = currentSchematicWireV5TitleCases();
  assert.ok(title !== undefined);
  const fixed = currentSchematicWireV5TitleWire(title, aboveStage, sessionId);
  assert.deepEqual(currentSchematicWireWriterV5NativeRequest(wire(fixed.wire)), fixed.request);
  assert.deepEqual(currentSchematicWireWriterV5NativeRequest(wire({ id: aboveStage, method: "Browser.getVersion" })),
    { action: "send", requestId: aboveStage, method: "Browser.getVersion" });
});
