/** Independent decoding of this new book and its complete smoke transcript.
 * This allocates no native owner, compiler, process Job or application. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_CALLS as CALLS, currentFootprintInverseNativeGetTaskResultCases as cases, currentFootprintInverseNativeGetTaskResultNativeFrame as frame, currentFootprintInverseNativeGetTaskResultTemplate as template, currentFootprintInverseNativeGetTaskResultWire as wire } from "../src/current-footprint-inverse-native-get-task-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_LEGACY as LEGACY, currentFootprintInverseNativeGetTaskResultNativeSource as source } from "../src/current-footprint-inverse-native-get-task-result-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RESULT_CALLS as OLD } from "../src/current-footprint-inverse-get-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";

/** Hash only fully restored native bytes; JSON property order and the final
 * NUL are included, matching the actual static native encoder's wire format. */
function sha(value:Uint8Array):string { return createHash("sha256").update(value).digest("hex"); }
/** Interpret only the actual emitted smoke's closed fixture grammar. This
 * catches a smoke initializer that differs from the host's own-case goldens. */
function smokeFields(text:string):Readonly<{fields:ReadonlyMap<string,string>;fallback:string}> { const match=/fields\.Add\(name,([^;]+)\);transcript\.Append/u.exec(text);assert.ok(match?.[1]!==undefined);const expression=match[1];const pattern=/name=="([A-Za-z]+)"\?(?:new string\('([a-z])',(\d+)\)|"([A-Za-z_]+)"):/gu;const fields=new Map<string,string>();for(const row of expression.matchAll(pattern)){const name=row[1];assert.ok(name!==undefined&&!fields.has(name));let value=row[4];if(value===undefined){assert.ok(row[2]!==undefined&&row[3]!==undefined);value=row[2].repeat(Number(row[3]));}fields.set(name,value);}assert.equal(fields.size,4);const fallback=expression.replaceAll(pattern,"");assert.match(fallback,/^"[A-Za-z_]+"$/u);return{fields,fallback:fallback.slice(1,-1)}; }
void test("new native result book and ordered smoke restore every own packet with exact old-call parity",()=>{
 const text=source();const fixtures=smokeFields(text);const match=/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)/u.exec(text);assert.ok(match!==null);const packed=Buffer.from(match[1]??"","base64");assert.equal(sha(packed),match[4]);
 // oxlint-disable-next-line node/no-sync -- One fixed immutable dictionary is independently decoded within the unchanged 64KiB ceiling.
 const raw=gunzipSync(packed,{maxOutputLength:60_000});assert.equal(raw.length,Number(match[2]));assert.equal(sha(raw),match[3]);const rows=raw.toString("utf8").split("\0").map(row=>row.split("\t"));assert.equal(rows.length,Number(match[5]));const own:Buffer[]=[];
 for(const command of cases()){
  if(command.method==="Runtime.callFunctionOn"&&LEGACY.includes(command.role)){const previous=Object.entries(OLD).find(([name])=>name===command.role)?.[1];assert.ok(previous!==undefined);assert.deepEqual(CALLS[command.role],previous);}else{
  const selected=rows.find(row=>row[0]===template(command).key);assert.ok(selected?.[2]!==undefined&&selected[3]!==undefined);const bytes=Buffer.from(`${JSON.stringify(wire(command,79,"original_ui"))}\0`);const fields=frame(bytes,command,"original_ui");let restored=selected[3];for(const name of selected[2].split(",").filter(Boolean)){const fixture=fixtures.fields.get(name)??fixtures.fallback;assert.equal(fields[name],fixture);restored=restored.replaceAll(JSON.stringify(`__native_get_task_result_${name}__`),JSON.stringify(fixture));}for(const program of rows.filter(row=>row[0]==="program")){assert.ok(program[1]!==undefined&&program[3]!==undefined);restored=restored.replaceAll(JSON.stringify(`__native_get_task_result_program_${program[1]}__`),program[3]);}const packet=Buffer.from(`{"id":79,${restored.slice(1,-1)},"sessionId":"original_ui"}\0`);assert.deepEqual(packet,Buffer.from(`${JSON.stringify({id:79,method:command.method,params:command.params,sessionId:"original_ui"})}\0`));own.push(packet);
 }}
 assert.equal(LEGACY.length,21);assert.equal(own.length,rows.filter(row=>row[0]!=="program").length);assert.ok(text.includes(`if(index!=${String(own.length)})`));const transcript=Buffer.concat(own);const hash=sha(transcript);assert.ok(text.includes(`!=@"${hash}"`));const reversed=Buffer.concat(own.toReversed());assert.notEqual(sha(reversed),hash);assert.equal(PROFILE.renderer.total,27_705);assert.equal(PROFILE.controls,182_736);assert.equal(PROFILE.main.reproofs,103_376);assert.equal(PROFILE.executionAuthorized,false);
});

void test("fresh UI result source cannot enroll a Core issuer, native dispatch, pipe phase or factory smoke",async()=>{
 const names=["current-pcb-diagnostic-owner.ts","current-pcb-diagnostic-pipe.ts","current-footprint-inverse-native-fragment.ts","current-footprint-inverse-native-profile.ts"];
 const sources=await Promise.all(names.map(name=>readFile(new URL(`../src/${name}`,import.meta.url),"utf8")));for(const text of sources){assert.equal(text.includes("current-footprint-inverse-native-get-task-result"),false);assert.equal(text.includes("footprint-inverse-native-get-task-result"),false);assert.equal(text.includes("completeFootprintInverseNativeGetTaskResult"),false);}const factory=await readFile(new URL("../../scripts/footprint-inverse-native-source.ts",import.meta.url),"utf8");assert.equal(factory.includes("VerifyFootprintInverseNativeGetTaskResultSmoke"),false);
});
