/** Real writer journal and parent publisher, with explicit inert original
 * args/closed-plan registries only. No native or saved acceptance is issued. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { updateOperation } from "../src/artifacts.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "../src/generated-fixture-journal-publication.ts";
import type { CurrentSchematicRelevanceSavedReadbackParentBinding } from "../src/current-schematic-relevance-saved-readback-parent.ts";

async function fixture(lost=false):Promise<Readonly<{journal:object;prepared:object;parent:object;prepare:(journal:unknown,plan:unknown)=>unknown;consume:(token:unknown,plan:unknown,reader?:unknown)=>CurrentSchematicRelevanceSavedReadbackParentBinding;records:()=>readonly {kind:string}[]}>>{
 const operationId=`sch209-relevance-display-${randomUUID()}`,writer=Object.freeze({syntheticOriginalWriter:true});
 const args=Object.freeze({operation:Object.freeze({operationId})}),initial=Object.freeze({preparationCheckpoint:Object.freeze({path:"synthetic-managed-checkpoint",sha256:"a".repeat(64),bytes:512})}),prepared=Object.freeze({syntheticOriginalSavedPlan:true});
 const original=Object.freeze({closed:Object.freeze({owner:writer,args,checkpoint:Object.freeze({syntheticOriginalClosedCheckpoint:true})}),lifecycle:Object.freeze({syntheticOriginalLifecycle:true}),data:Object.freeze({syntheticOriginalSavedData:true})});
 const journalModule=await loadSyntheticRegistryModule(new URL("../src/generated-schematic-relevance-display-journal.ts",import.meta.url),(name,actual)=>name==="./generated-schematic-relevance-display-source.ts"?{...actual,requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments:(value:unknown,checkpoint:unknown):void=>{assert.equal(value,args);assert.equal(checkpoint,initial);}}:actual);
 const Constructor=journalModule["GeneratedSchematicRelevanceDisplayJournal"];assert.ok(typeof Constructor==="function");let failed=false;
 const dependencies:GeneratedFixtureJournalPublicationDependencies={updateJournal:async(operation):Promise<string>=>{const written=await updateOperation(operation);const rows:unknown=operation["records"];const last:unknown=Array.isArray(rows)?rows.at(-1):undefined;if(lost&&!failed&&last!==null&&typeof last==="object"&&"kind"in last&&last.kind==="reopened-effect-intent"){failed=true;throw new Error("original parent publication ACK lost");}return written;}};
 const journal:unknown=Reflect.construct(Constructor,[args,initial,dependencies]);assert.ok(journal!==null&&typeof journal==="object");
 const call=(name:string,...values:unknown[]):unknown=>{const method:unknown=Reflect.get(journal,name);assert.ok(typeof method==="function");return Reflect.apply(method,journal,values);};await call("reserve");call("bindWriter",writer);
 const stages=journalModule["GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_JOURNAL_STAGES"];assert.ok(Array.isArray(stages));
 for(const candidate of stages){const stage:unknown=candidate;assert.equal(typeof stage,"string");if(stage==="reopen"){break;}await call("append",`${String(stage)}-intent`,{});let evidence:object={};if(stage==="modify"||stage==="save"){evidence={schema:"easyeda-pro-control.generated-schematic-relevance-display-stage.v1",stage,ok:true,dispatchAttempted:true,originalPromiseSettled:true,modifyAttempted:true,modifyAcknowledged:true,saveAttempted:stage==="save",saveAcknowledged:stage==="save",savePromiseSettled:stage==="save",source:"synthetic",windowTabId:"window",originalContextIntact:true,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false};}await call("append",`${String(stage)}-result`,evidence);}
 const module=await loadSyntheticRegistryModule(new URL("../src/current-schematic-relevance-saved-readback-parent.ts",import.meta.url),(name,actual)=>{if(name==="./generated-schematic-relevance-display-journal.ts"){return journalModule;}if(name==="./generated-schematic-relevance-saved-readback-plan.ts"){return {...actual,requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan:(value:unknown):object=>{assert.equal(value,prepared);return original;}};}return actual;});
 const consume=module["consumeOriginalCurrentSchematicRelevanceSavedReadbackParent"],create=module["prepareOriginalCurrentSchematicRelevanceSavedReadbackParent"];assert.ok(typeof create==="function"&&typeof consume==="function");const parent:unknown=Reflect.apply(create,undefined,[journal,prepared]);assert.ok(parent!==null&&typeof parent==="object");assert.equal(Reflect.apply(create,undefined,[journal,prepared]),parent);
 return {journal,prepared,parent,prepare:(j,p):unknown=>Reflect.apply(create,undefined,[j,p]),consume:(token,plan,reader=Object.freeze({syntheticReader:true})):CurrentSchematicRelevanceSavedReadbackParentBinding=>{
  const binding:unknown=Reflect.apply(consume,undefined,[token,plan,reader]);assert.ok(binding!==null&&typeof binding==="object"&&"assertCurrent"in binding&&"ready"in binding&&"record"in binding&&typeof binding.assertCurrent==="function"&&typeof binding.ready==="function"&&typeof binding.record==="function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked actual private binding returned from the production parent module; only historical source issuance is a test seam.
  return binding as CurrentSchematicRelevanceSavedReadbackParentBinding;
 },records:()=>{const retained:unknown=call("retained");assert.ok(retained!==null&&typeof retained==="object"&&"records"in retained&&Array.isArray(retained.records));return retained.records.map((row:unknown)=>{assert.ok(row!==null&&typeof row==="object"&&"kind"in row&&typeof row.kind==="string");return {kind:row.kind};});}};
}
void test("only a genuine matching writer journal and closed plan derive the once original reader parent",async()=>{
 const f=await fixture();assert.throws(()=>f.prepare({...f.journal},f.prepared));let reads=0;
 assert.throws(()=>f.consume({get profile():never{reads+=1;throw new Error("foreign getter");}},f.prepared));assert.equal(reads,0);
 assert.throws(()=>f.consume(f.parent,f.prepared,null),/ORIGINAL_READER/u);assert.throws(()=>f.consume(f.parent,f.prepared,0),/ORIGINAL_READER/u);const binding=f.consume(f.parent,f.prepared);assert.throws(()=>f.consume(f.parent,f.prepared),/CONSUMED/u);binding.assertCurrent();
 for(const kind of ["allocation-intent","cold-result","scene-intent","scene-result","close-intent","close-result","exit-intent","release-result","closed-sql-intent","closed-sql-result"] as const){await binding.record(kind,{sourceOnlySyntheticReceipt:true});}
 assert.deepEqual(f.records().slice(-10).map(row=>row.kind),["reopen-intent","reopen-result","reopened-effect-intent","reopened-effect-result","reopen-close-intent","reopen-close-result","reopen-exit-intent","reopen-exit-result","reopened-sql-intent","reopened-sql-result"]);
 await assert.rejects(async():Promise<void>=>{await binding.record("allocation-intent",{});},/CONSUMED/u);
});
void test("lost parent ACK retains its original candidate and cannot replay the mapped phase",async()=>{
 const f=await fixture(true);const binding=f.consume(f.parent,f.prepared);await binding.record("allocation-intent",{});await binding.record("cold-result",{});
 await assert.rejects(binding.record("scene-intent",{}),/ACK lost/u);await binding.ready();assert.equal(f.records().filter(row=>row.kind==="reopened-effect-intent").length,1);
 await assert.rejects(async():Promise<void>=>{await binding.record("scene-intent",{});},/CONSUMED/u);binding.assertCurrent();
});
