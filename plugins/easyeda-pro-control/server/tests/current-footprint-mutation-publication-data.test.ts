/** Inert original-source parsing and finite publication branch checks. These
 * facts create no native callback, original model, clock or owner authority. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Script} from "node:vm";
import {prepareCurrentFootprintDeleteObservedPlan} from "../src/current-footprint-delete-observed-plan.ts";
import {CURRENT_FOOTPRINT_MUTATION_PUBLICATION_METHODS as METHODS,qualifyCurrentFootprintMutationPublicationSource as qualify,requireCurrentFootprintMutationPublicationSource as requireSource} from "../src/current-footprint-mutation-publication-source.ts";
import {deriveCurrentFootprintMutationPublicationData as derive,requireCurrentFootprintMutationPublicationData as requireData} from "../src/current-footprint-mutation-publication-data.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

function atom(type:string,id:string,ticket:number,data:string,rest:Readonly<Record<string,unknown>>={}):string{
return `${JSON.stringify({type,ticket,id,...rest})}||${data}`;
}

void test("qualified actual parseFull retains one-string DELETE_DOC and two-string duplicate META order",async context=>{
 const assets=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);
if(assets===null){
context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);
return;
}
const [worker]=assets;
assert.ok(worker!==undefined);
 const source=qualify(worker);
assert.throws(()=>{
requireSource({...source});
}
);
assert.throws(()=>qualify(`${worker} `));
 const target="c".repeat(16);
const client="d".repeat(16);
const plan=prepareCurrentFootprintDeleteObservedPlan({targetUuid:target,client,maximumTicketBeforeClock:21,maximumTicketAfterClock:21,documentClock:1_800_000_000_001,managerUserAbsent:true,workerEditorVersionPresent:false,workerEditorVersionUndefined:true,workerEditorVersion:null});
 const deleted=derive(source,[plan.workerUpload]);
requireData(deleted);
assert.throws(()=>{
requireData({...deleted});
}
);
 assert.equal(deleted.headCalls,1);
assert.equal(deleted.lineCalls,1);
assert.equal(deleted.readyCallbackHoldUpperBound,3);
assert.deepEqual(deleted.trace.map(row=>row.kind),["head","line"]);
const head=deleted.trace[0];
const line=deleted.trace[1];
assert.ok(head?.kind==="head"&&line?.kind==="line");
assert.equal(head.doc.ticket,22);
assert.equal(line.id,"DELETE_DOC");
assert.equal(line.data,'{"isDelete":true}');
assert.equal(line.docUuid,target);
assert.equal(line.client,client);
assert.equal(line.editHead,null);
assert.equal(line.firstTicketPresent,false);
assert.equal(line.pendPresent,false);
assert.equal(deleted.executionAuthorized,false);
assert.equal(deleted.actualPublicationCountVerified,false);
 const header=(ticket:number):string=>`${JSON.stringify({type:"DOCHEAD",ticket})}||${JSON.stringify({docType:"FOOTPRINT",uuid:target,client})}`;

 const first=[header(22),atom("META","META",22,'{"title":"new"}')].join("|\n");
 const second=[header(23),atom("META","META",7,'{"title":"old"}'),atom("LINE","line_1",8,"", {firstTicket:0,pend:false,num:0}),atom("LAYER","layer_1",9,"[]")].join("|\n");
 const copied=derive(source,[first,second]);
assert.equal(copied.headCalls,2);
assert.equal(copied.lineCalls,4);
assert.equal(copied.readyCallbackRunUpperBound,4);
assert.equal(copied.readyCallbackHoldUpperBound,12);
assert.deepEqual(copied.trace.map(row=>row.kind==="head"?row.doc.ticket:row.ticket),[22,22,23,7,8,9]);
const empty=copied.trace[4];
assert.ok(empty?.kind==="line");
assert.equal(empty.data,"");
assert.equal(empty.pend,false);
assert.equal(empty.firstTicket,0);
assert.equal(empty.num,0);
assert.equal(empty.pendPresent,true);
 const edited=derive(source,[`{"type":"EDIT_HEAD"}||{"uuid":"editor","username":"A"}|\n${plan.workerUpload}`]);
const editLine=edited.trace[1];
assert.ok(editLine?.kind==="line");
assert.deepEqual(editLine.editHead,{uuid:"editor",username:"A"});
 let traps=0;
const accessor:string[]=[];
Object.defineProperty(accessor,"0",{get(){
traps+=1;
return plan.workerUpload;
}
,enumerable:true});
assert.throws(()=>derive(source,accessor));
assert.throws(()=>derive(source,new Proxy([plan.workerUpload],{ownKeys():string[]{
traps+=1;
return["0","length"];
}
})));
assert.equal(traps,0);
 assert.throws(()=>derive(source,[plan.workerUpload,plan.workerUpload,plan.workerUpload]));
assert.throws(()=>derive(source,["bad"]));
assert.throws(()=>derive(source,[plan.workerUpload.replace('"FOOTPRINT"','"PCB"')]));
assert.throws(()=>derive(source,[`${plan.workerUpload}\0`]));
assert.throws(()=>derive(source,["x".repeat(2_097_153)]));
}
);

void test("actual remoteChange existing and new node branches publish at most once per onLine",()=>{
 const program=`(()=>{"use strict";const publications=[],At={
 getFirstTicket:I=>I.nodes?.[0]?.ticket??I.last?.ticket??null,find:(I,p)=>I.nodes?.find(p),insert(I,H){(I.nodes??=[]).push(H);I.nodes.sort((a,b)=>a.ticket-b.ticket||a.client.localeCompare(b.client));I.last=I.nodes.at(-1);},getPreLastNode:I=>I.nodes?.at(-2),preForEach(I,p){for(const n of I.nodes??[])if(!p(n))break;},getLength:I=>I.nodes?.length??0,remove(I,n){I.nodes=I.nodes.filter(v=>v!==n);I.last=I.nodes.at(-1);}
 };
 const manager={caseInsensitiveTypes:new Set,uniqueIds:{},wDocData:new Map,orderTree:{has(){return false;}},needDocIdDoctype:[],cacheType:["META","DELETE_DOC"],setMaxTicket(){},setDocMaxTicket(){},setDoctype(){},getDoctype(){return "FOOTPRINT";},getUnique(){return "u";},getIsLocalChange(){return true;},getIsPendChange(){return true;},safeString:s=>s,publishChange(...args){publications.push(args);},${METHODS["ja.remoteChange"].source}};
 const count=(ticket,client,id,type,data,pend)=>{const before=publications.length;manager.remoteChange(ticket,client,"doc",id,data,type,"FOOTPRINT",undefined,undefined,pend);return publications.length-before;};
 const counts=[count(22,"c","META","META","new"),count(7,"c","META","META","old"),count(23,"c","DELETE_DOC","DELETE_DOC",'{"isDelete":true}')];
 const pending={client:"c",ticket:24,dataType:"LINE",data:"[]",pend:true},slot={nodes:[pending],last:pending};manager.wDocData.get("doc").set("line",slot);counts.push(count(24,"c","line","LINE","[]",false));return JSON.stringify(counts);
 })()`;
 const raw:unknown=new Script(program).runInNewContext(Object.freeze({}),{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
assert.equal(raw,"[1,0,1,1]");
}
);
