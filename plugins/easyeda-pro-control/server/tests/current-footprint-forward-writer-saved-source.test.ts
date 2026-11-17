/** Real completed SQL projection with explicitly synthetic original native
 * packet custody; these issuers never enter the production owner registries. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {currentFootprintCopyV2Before} from "../src/current-footprint-copy-v2-plan.ts";
import {currentFootprintCopyV2SavedActor,currentFootprintCopyV2SavedSqlSource} from "../src/current-footprint-copy-v2-saved-source.ts";
import {decodeCurrentFootprintCopyV2NativeResult} from "../src/current-footprint-copy-v2-native-result.ts";
import {readerCompletion} from "../src/sqlite-inventory.ts";
import {savedFixture} from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

void test("full saved source joins actual created UUID, both clocks, Main actor/time/history and original closed projection",async()=>{
 const input=await savedFixture();const source=currentFootprintCopyV2SavedSqlSource(input.projection).source;const metadata=input.copy.destinationMetadata;
 const samples=source.documentClocks.map((time,index)=>({ordinal:index+1,documentUuid:input.projection.targetUuid,updateTime:time}));
 const branch=input.after.tables.find(table=>table.name==="branches");assert.ok(branch!==undefined);const index=branch.columns.findIndex(column=>column["name"]==="history_uuid");const uuidIndex=branch.columns.findIndex(column=>column["name"]==="uuid");const selected=branch.rows.find(row=>{const uuid=row.cells[uuidIndex];return uuid?.kind==="text"&&Buffer.from(uuid.hex,"hex").toString("utf8")===input.copy.source.branchUuid;});const cell=selected?.cells[index];assert.ok(cell?.kind==="text");const historyUuid=Buffer.from(cell.hex,"hex").toString("utf8");
 const writer=Object.freeze({});const target={before:currentFootprintCopyV2Before(input.copy)};const actor=currentFootprintCopyV2SavedActor(input.projection);
 const make=():Record<string,unknown>=>({serializedCreateResult:JSON.stringify({success:true,result:{uuid:input.projection.targetUuid,project_uuid:input.copy.source.projectUuid,title:metadata.title.toLowerCase(),display_title:metadata.title,docType:4,creator:{},createTime:source.documentClocks[0],modifier:{},description:metadata.description,updateTime:source.documentClocks[1],custom_tags:JSON.stringify(metadata.tags),owner:{uuid:input.copy.ownerUuid},source:"",version:String(source.documentClocks[1]),path:input.copy.source.projectUuid,ticket:input.copy.metadataTicket}}),
  clocks:{samples:structuredClone(samples)},main:{value:{backendActorUuid:actor["uuid"],observedProjectModifierUuid:actor["uuid"],observedProjectUpdatedAt:source.projectUpdatedAtLiteral,historyUuid}},timer:{naturalSelfReturnsJoined:true},originalTimerTailJoined:true});
 const text=stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-forward-writer-saved-source.ts",import.meta.url),"utf8")).replaceAll(/^import[\s\S]*?;\n/gmu,"").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu,"");
 let original:Record<string,unknown>=make();const context=createContext({Buffer,Error,Object,readerCompletion,currentFootprintCopyV2SavedActor,currentFootprintCopyV2SavedSqlSource,decodeCurrentFootprintCopyV2NativeResult,writer,
  assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner:(candidate:unknown):void=>{assert.equal(candidate,writer);},
  originalCurrentFootprintForwardWriterNativeTarget:(candidate:unknown):object=>{assert.equal(candidate,writer);return target;},
  originalCurrentFootprintForwardWriterColdCapacity:(candidate:unknown):object=>{assert.equal(candidate,writer);return{closedSuccessorRawRows:20,maximumSavedContentBytes:32_768};},
  requireCurrentFootprintForwardWriterClosedSnapshot:(candidate:unknown,after:unknown):object=>{assert.equal(candidate,writer);assert.equal(after,input.after);return{};},
  requireOriginalCurrentFootprintForwardWriterSavedContinuation:(candidate:unknown,owner:unknown):object=>{assert.equal(candidate,original);assert.equal(owner,writer);return{copyPlan:input.copy,paired:candidate};},
 });runInContext(text,context);
 const call=(packet:unknown,projection:unknown=input.projection,after:unknown=input.after):unknown=>{context["packet"]=packet;context["projection"]=projection;context["after"]=after;return runInContext("requireOriginalCurrentFootprintForwardWriterSavedProjection(writer,packet,projection,after)",context);};
 original=make();assert.doesNotThrow(()=>call(original));assert.throws(()=>call(original,{...input.projection}),/original saved projection/u);assert.throws(()=>call({...original}));
 for(const mutate of ["packet.clocks.samples[0].updateTime++","packet.main.value.historyUuid='0'.repeat(32)","packet.main.value.backendActorUuid='0'.repeat(32)","packet.main.value.observedProjectUpdatedAt='2000-01-01 00:00:00'","packet.timer.naturalSelfReturnsJoined=false"]){
  original=make();context["packet"]=original;runInContext(mutate,context);const packet=original;assert.throws(()=>call(packet),/ORIGINAL_PROJECTION/u);
 }
});
