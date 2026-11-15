/** Inert original vendor DOCHEAD transition plus the actual readonly proof.
 * No native owner, app, cache or parser publication is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_REPLAY_PROGRAM as PROGRAM, CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_SET_DOCTYPE_SOURCE as SET_DOCTYPE } from "../src/current-footprint-forward-writer-copy-replay-program.ts";
import { CURRENT_PCB_VIA_REPLAY_METHODS as METHODS } from "../src/current-pcb-via-replay-source.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";

function fixture(equalClocks = false): Readonly<{ prove: () => unknown; run: (program: string) => unknown }> {
  const context = vm.createContext({});
  vm.runInContext(`let hooks=0;${SOURCE.Gu.source};${SOURCE.Ro.source};
class OriginalModel {${SET_DOCTYPE}${METHODS.onDocHead.source}setMaxTicket(t){this.maxTicket=Math.max(this.maxTicket,t)}}
const r=new OriginalModel();Object.assign(r,{maxTicket:100,docHead:{},creators:{},headCbArr:[],wDocData:new Map()});
const uuid="a".repeat(16),client="b".repeat(16),t1=1700000000000,t2=t1+${equalClocks ? "0" : "1"};
const head=(ticket,time)=>JSON.stringify({type:"DOCHEAD",ticket})+"||"+JSON.stringify({docType:"FOOTPRINT",client,uuid,updateTime:time,version:String(time),editVersion:"3.2.209"});
const meta=JSON.stringify({type:"META",ticket:101,id:"META"})+"||"+JSON.stringify({title:"copy",description:"",tags:[],source:""});
const canvas=JSON.stringify({type:"CANVAS",ticket:10,id:"canvas"})+"||"+JSON.stringify({version:"1.0",unit:"mm"});
const oldMeta=JSON.stringify({type:"META",ticket:3,id:"META"})+"||"+JSON.stringify({title:"source",description:"",tags:[],source:""});\nconst pair=[head(101,t1)+"|\\n"+meta,head(102,t2)+"|\\n"+oldMeta+"|\\n"+canvas],body=pair.join("|\\n"),rows=new Map();r.wDocData.set(uuid,rows);r.setDoctype(uuid,"FOOTPRINT");
Ro(body,(header,text)=>{const h=JSON.parse(header);if(h.type==="DOCHEAD"){const d=JSON.parse(text);d.ticket=h.ticket;r.onDocHead(d,null)}else{const old=rows.get(h.id);if(!old||old.last.ticket<h.ticket)rows.set(h.id,{last:{dataType:h.type,ticket:h.ticket,data:text}})}});
const project={consistencyManager:r},original=[project,pair,r,pair[0],pair[1],body],merged=[project,null,null,null,null,null,null,null,null,null];globalThis.PROJECT=project;
const proof=(${PROGRAM});`, context);
  return { run: (program: string): unknown => vm.runInContext(program, context), prove: (): unknown => vm.runInContext("proof.call(original,merged)", context) };
}
void test("full copy replay proves both actual vendor DOCHEAD clock branches without invoking an app method", () => {
  for (const equal of [false, true]) {
    const f = fixture(equal); assert.equal(f.prove(), true);
    assert.equal(f.run("Object.hasOwn(r.docHead[uuid],\"ticket\")"), false);
    assert.equal(f.run("r.docHead[uuid].client"), "a".repeat(16));
    assert.equal(f.run("hooks"), 0);
  }
});
void test("wrong model body, pending atoms, foreign replay receiver and getters refuse without invocation", () => {
  for (const change of ['rows.get("canvas").last.data="foreign"', 'rows.get("canvas").last.pend=true',
    'r.docHead[uuid].ticket=17', 'r.maxTicket=103', 'merged[0]={}', 'original[1]=[pair[0],pair[1]+"foreign"]',
    'Object.defineProperty(rows.get("canvas").last,"data",{get(){hooks++;return canvas}})']) {
    const f = fixture(); f.run(change); assert.throws(f.prove); assert.equal(f.run("hooks"), 0);
  }
});
