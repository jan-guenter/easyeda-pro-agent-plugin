/** Actual Core settlement and exit methods with explicitly synthetic original
 * owner/component issuers. No native process, SDK action or producer runs. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {parse} from "acorn";
import {test} from "node:test";
import {setImmediate as nextTurn} from "node:timers/promises";
import {runInNewContext} from "node:vm";
import {transform} from "esbuild";

interface Core{settleFootprintForwardWriterCopyDrain:()=>Promise<void>;retire:()=>Promise<void>}
async function fixture():Promise<Readonly<{
 owner:Core;work:PromiseWithResolvers<undefined>;retainedFailure:()=>unknown;
 state:{calls:number;retired:boolean;failed:boolean;failure:unknown;publicationCompleted:boolean;signals:number};
}>>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const plain=stripTypeScriptTypes(source,{mode:"transform"});const tree=parse(plain,{ecmaVersion:"latest",sourceType:"module"});
 const matches=tree.body.filter(node=>node.type==="FunctionDeclaration"&&node.id?.name==="failForwardWriterProducerScope");assert.equal(matches.length,1);const helper=matches[0];assert.ok(helper?.type==="FunctionDeclaration");const failureHelper=plain.slice(helper.start,helper.end);
 const begin=source.indexOf("  public settleFootprintForwardWriterCopyDrain():");
 const end=source.indexOf("  public footprintForwardWriterCopyDrainProgress()",begin);
 const retireBegin=source.indexOf("  async #retireForwardWriterProducer():");
 const retireEnd=source.indexOf("  static async #captureProducerIntrinsics(",retireBegin);
 assert.ok(begin>0&&end>begin&&retireBegin>0&&retireEnd>retireBegin);
 const state={calls:0,retired:false,failed:false,failure:null as unknown,publicationCompleted:false,signals:0};
 const work=Promise.withResolvers<undefined>();const scope={origin:{},continuation:null,read:null,retired:false,failed:false,firstFailure:null as unknown,
  source:{fail:():void=>{state.failed=true;},observeExited:():Promise<void>=>Promise.resolve()},
  observer:{retireAfterOriginalExit:():Promise<void>=>{state.retired=true;return Promise.resolve();}}};
 const main={failFootprintForwardWriterBranchRead:():void=>{state.signals+=1;},failFootprintForwardWriterPostBranchRead:():void=>{state.signals+=1;},failFootprintForwardWriterLiveHistory:():void=>{state.signals+=1;},failFootprintForwardWriterInitialHistory:():void=>{state.signals+=1;}};
 const drain={scope,main,pending:Promise.resolve(),settlements:[] as Promise<void>[],settling:null as Promise<void>|null,failed:false,failure:new Error("unfailed-original") as unknown,
  get publicationCompleted():boolean{return state.publicationCompleted;},
  settle:():Promise<void>=>{state.calls+=1;return work.promise;}};
 const loaded:{exports:Record<string,unknown>}={exports:{}};let owner:Core|null=null;
 const producerOwners=new WeakMap<object,unknown>();const drains=new WeakMap<object,unknown>();
 const body=[failureHelper,
  "export class SyntheticOriginalCore{",
  "#terminationObserved=true;#terminationObservation={terminated:true};#mainRunner=main;",
  "#forwardWriterBranchQueryPending=null;#forwardWriterProducerIntervalPending=null;#forwardWriterCopyLocalPending=null;#forwardWriterCopyUploadPending=null;",
  source.slice(begin,end),source.slice(retireBegin,retireEnd),
  "public retire():Promise<void>{return this.#retireForwardWriterProducer();}}",
 ].join("\n");
 const compiled=await transform(body,{loader:"ts",format:"cjs",target:"node24"});
 runInNewContext(compiled.code,{module:loaded,exports:loaded.exports,main,Promise,
  forwardWriterCreateDispatches:new WeakMap(),forwardWriterOwnDataOriginals:new WeakMap(),forwardWriterProducerOwners:producerOwners,forwardWriterCopyDrains:drains,forwardWriterCopyTailObservations:new WeakMap(),
  assertOriginalCurrentFootprintForwardWriterNativeOwner:(actual:unknown):void=>{assert.equal(actual,owner);},
  assertOriginalCurrentProjectSaveProducerObserverClass:():void=>{
   // No replaceable producer class exists in this explicitly synthetic extracted Core.
  },
  error:(code:string):Error=>new Error(code),
 });
 const Constructor=loaded.exports["SyntheticOriginalCore"];assert.ok(typeof Constructor==="function");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact extracted Core methods; only labelled inert original issuers/exit/component are substituted.
 owner=Reflect.construct(Constructor,[]) as Core;producerOwners.set(owner,scope);drains.set(scope.origin,drain);
 return{owner,work,state,retainedFailure:():unknown=>drain.failure};
}
void test("overlapping settlement returns one retained Promise and original exit joins it before observer release",async()=>{
 const f=await fixture();const first=f.owner.settleFootprintForwardWriterCopyDrain(),overlap=f.owner.settleFootprintForwardWriterCopyDrain();assert.equal(first,overlap);assert.equal(f.state.calls,1);
 const retired=f.owner.retire();await nextTurn();assert.equal(f.state.retired,false);assert.ok(f.state.signals>=3);
 f.state.publicationCompleted=true;
 // oxlint-disable-next-line unicorn/no-useless-undefined -- Settle the exact retained synthetic undefined response.
 f.work.resolve(undefined);
 await first;await retired;assert.equal(f.state.retired,true);
 assert.equal(f.owner.settleFootprintForwardWriterCopyDrain(),first);assert.equal(f.state.calls,1);
});
void test("null original settlement failure stays sticky, cannot replay and is joined on original exit",async()=>{
 const f=await fixture();const pending=f.owner.settleFootprintForwardWriterCopyDrain();f.work.reject(null);await assert.rejects(pending,error=>error===null);
 assert.equal(f.state.failed,true);assert.equal(f.retainedFailure(),null);assert.equal(f.state.calls,1);await assert.rejects(f.owner.settleFootprintForwardWriterCopyDrain());assert.equal(f.state.calls,1);
 await f.owner.retire();assert.equal(f.state.retired,true);
});

void test("only two source-derived metadata settlement attempts can run",async()=>{
 const f=await fixture();
 // oxlint-disable-next-line unicorn/no-useless-undefined -- Settle the exact retained synthetic undefined response.
 f.work.resolve(undefined);
 await f.owner.settleFootprintForwardWriterCopyDrain();await f.owner.settleFootprintForwardWriterCopyDrain();
 assert.equal(f.state.calls,2);await assert.rejects(f.owner.settleFootprintForwardWriterCopyDrain(),/EXHAUSTED/u);assert.equal(f.state.calls,2);await f.owner.retire();
});
