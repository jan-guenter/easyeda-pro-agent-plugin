/** Decode immutable storage and compare every original message. No owner,
 * source receipt, native Event or continuation is issued by this test. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {test} from "node:test";
import {gunzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_INVERSE_GET_RESULT_CALLS as OLD} from "../src/current-footprint-inverse-get-result-protocol.ts";
import {currentFootprintInverseReferenceResultNativeSource as generate} from "../src/current-footprint-inverse-reference-result-native.ts";
import {currentFootprintInverseReferenceResultCalls as calls,currentFootprintInverseReferenceResultCases as cases,currentFootprintInverseReferenceResultNativeFrame as frame,currentFootprintInverseReferenceResultTemplate as template,currentFootprintInverseReferenceResultWire as wire} from "../src/current-footprint-inverse-reference-result-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_UI_ORDER as ORDER} from "../src/current-footprint-inverse-reference-ui-programs.ts";

const sha=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
void test("joint reference result tables retain all 180 exact packets and golden hashes",()=>{
 const source=generate();assert.equal(generate(),source);
 const loads=[...source.matchAll(/static readonly string\[\]\[\] InverseReferenceResultRows\d+=EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),5\);/gu)];assert.ok(loads.length>0&&loads.length<=8);
 const rows:string[][]=[];
 for(const load of loads){const packed=Buffer.from(load[1]??"","base64");
 // oxlint-disable-next-line node/no-sync -- A bounded fixed build table is decoded without any native or app receiver.
 const raw=gunzipSync(packed);assert.ok(raw.length<=65_536);assert.equal(raw.length,Number(load[2]));assert.equal(sha(raw),load[3]);assert.equal(sha(packed),load[4]);assert.equal(packed.toString("base64"),load[1]);const data=raw.toString("utf8").split("\0").map(row=>row.split("\t"));assert.equal(data.length,Number(load[5]));for(const row of data){assert.equal(row.length,5);}rows.push(...data);}
 const fragment=rows.filter(row=>row[0]==="fragment");assert.equal(fragment.length,1);const checker=fragment[0]?.[3];assert.ok(typeof checker==="string");const programs=new Map<string,string>();let aliases=0;
 for(const row of rows.filter(value=>value[0]==="program"||value[0]==="external")){const key=row[1];assert.ok(typeof key==="string"&&!programs.has(key));let text:string;if(row[0]==="external"){const selected=Object.entries(OLD).find(([name])=>name===row[2]);assert.ok(selected!==undefined);text=JSON.stringify(selected[1].program);aliases+=1;}else{assert.ok(typeof row[3]==="string");text=row[3].replace("/*__INVERSE_REFERENCE_RESULT_I11__*/",checker);}assert.equal(typeof JSON.parse(text),"string");programs.set(key,text);}
 assert.ok(aliases>0);const totalPrograms=ORDER.reduce((total,kind)=>total+Object.keys(calls(kind)).length,0);assert.ok(programs.size<totalPrograms);
 const selected=rows.filter(row=>row[0]!=="program"&&row[0]!=="external"&&row[0]!=="fragment");const commands=cases();assert.equal(commands.length,180);assert.equal(selected.length,commands.length);
 for(const command of commands){const expected=template(command);const choices=selected.filter(row=>row[0]===expected.key);assert.equal(choices.length,1);const row=choices[0];assert.ok(row!==undefined);assert.equal(row[1],expected.method);assert.equal(row[2],expected.names.join(","));assert.ok(typeof row[3]==="string");const bytes=Buffer.from(`${JSON.stringify(wire(command,79,"original_ui"))}\0`);const fields=frame(bytes,command,"original_ui");const values=new Map<string,string>([...programs.entries()].map(([key,value])=>[`program_${key}`,value]));for(const name of expected.names){values.set(name,JSON.stringify(fields[name]));}const text=row[3].replaceAll(/"__reference_result_([A-Za-z\d_-]+)__"/gu,(_match,key:string)=>{const value=values.get(key);assert.ok(typeof value==="string");return value;});const packet:unknown=JSON.parse(text);assert.ok(packet!==null&&typeof packet==="object");assert.deepEqual(packet,{method:command.method,params:command.params});const canonical=Buffer.from(`${JSON.stringify({id:79,method:command.method,params:command.params,sessionId:"original_ui"})}\0`);assert.equal(row[4],sha(canonical));}
});
