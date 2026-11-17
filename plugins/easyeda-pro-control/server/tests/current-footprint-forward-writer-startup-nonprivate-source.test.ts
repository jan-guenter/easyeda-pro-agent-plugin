/** Static lexical/callsite evidence, separate from the actual held jr value. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Script} from "node:vm";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_SOURCE as CALLBACKS,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_IDENTIFIERS as IDS,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_POST_SOURCE as POST,qualifyCurrentFootprintForwardWriterStartupNonprivateSource as qualify,requireCurrentFootprintForwardWriterStartupNonprivateSource as requireSource} from "../src/current-footprint-forward-writer-startup-nonprivate-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as TICKET} from "../src/current-schematic-relevance-modify-ticket-source.ts";
import {auditStartupNonprivateSource} from "./helpers/footprint-startup-nonprivate-audit.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

void test("the complete pinned worker has one jr binding, twelve reads and five fresh JP envelopes",async context=>{
 const assets=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);
 if(assets===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const source=assets[0];assert.ok(source!==undefined);const proof=qualify(source);requireSource(proof);
 const audit=auditStartupNonprivateSource(source);
 assert.deepEqual(audit.identifiers,IDS.map(row=>row.start));assert.deepEqual(audit.initializers,[{start:1_654_634,end:1_654_778,kind:"var",initializer:"L1"}]);
 assert.equal(audit.shadowBindings,0);assert.equal(audit.writes,0);assert.equal(audit.directEval,0);assert.equal(audit.withStatements,0);
 assert.deepEqual(audit.postCalls,POST.calls.map(row=>({start:row.start,end:row.end,method:row.method,keys:row.keys,type:row.type,topicParameter:row.topicParameter})));
 assert.deepEqual(audit.callbacks,Object.entries(CALLBACKS).map(([registration,row])=>({start:row.start,end:row.end,arity:row.arity,async:row.async,registration})));
 assert.equal(proof.runtimePrivateFlagObserved,false);assert.equal(proof.executionAuthorized,false);
 assert.throws(()=>{requireSource({...proof});});assert.throws(()=>{requireSource(new Proxy(proof,{}));});
 assert.throws(()=>qualify(`${source};jr=true;`));
 assert.throws(()=>auditStartupNonprivateSource(source.replace('this.post({type:"PUBLISH",uuid:this.uuid,topic:e,message:t})','this.post({get type(){return "PUBLISH"},uuid:this.uuid,topic:e,message:t})')));
});
void test("the actual canWsPublish body short-circuits every app property and method when jr is false",()=>{
 const code=`(()=>{const jr=false;let reads=0;const project={${TICKET.canWsPublish.source}};Object.defineProperties(project,{isReady:{get(){reads++;throw Error("APP_READ");}},isReadOnly:{get(){reads++;throw Error("APP_READ");}},isSyncing:{get(){reads++;throw Error("APP_READ");}}});return JSON.stringify({result:project.canWsPublish(),reads});})()`;
 const raw:unknown=new Script(code).runInNewContext(Object.freeze({}),{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
 assert.equal(raw,JSON.stringify({result:false,reads:0}));
});
