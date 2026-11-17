/** Execute the actual Core failure helper with inert pending Promise peers.
 * AST routing checks issue no Core owner, native origin or execution grant. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {test} from "node:test";
import {runInNewContext} from "node:vm";
import {parse} from "acorn";

interface Scope{failed:boolean;firstFailure:unknown;waiter:ReturnType<typeof Promise.withResolvers<unknown>>|null;resumeWaiter:ReturnType<typeof Promise.withResolvers<unknown>>|null;source:Readonly<{fail:()=>void}>}
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function visit(value:unknown,inspect:(row:Record<string,unknown>)=>void):void{
 if(Array.isArray(value)){for(const nested of value){visit(nested,inspect);}}
 else if(record(value)){inspect(value);for(const nested of Object.values(value)){visit(nested,inspect);}}
}
async function actual():Promise<Readonly<{invoke:(scope:Scope,cause:unknown)=>void;tree:unknown;start:number;end:number}>>{
 const source=stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8"),{mode:"transform"});const tree=parse(source,{ecmaVersion:"latest",sourceType:"module"});
 const matches=tree.body.filter(node=>node.type==="FunctionDeclaration"&&node.id?.name==="failForwardWriterProducerScope");assert.equal(matches.length,1);const node=matches[0];assert.ok(node?.type==="FunctionDeclaration");
 const helper:unknown=runInNewContext(`(${source.slice(node.start,node.end)})`,Object.freeze({}));assert.equal(typeof helper,"function");
 return Object.freeze({invoke:(scope:Scope,cause:unknown):void=>{assert.ok(typeof helper==="function");Reflect.apply(helper,undefined,[scope,cause]);},tree,start:node.start,end:node.end});
}
let cached:ReturnType<typeof actual>|null=null;
function loadActual():ReturnType<typeof actual>{cached??=actual();return cached;}

function rejected(outcomes:PromiseSettledResult<unknown>[],cause:unknown):void{
 for(const outcome of outcomes){assert.ok(outcome.status==="rejected");const reason:unknown=outcome.reason;assert.equal(reason,cause);}
}
for(const [name,cause]of [["object",new Error("first original cause")],["undefined",undefined],["null",null]]as const){
 void test(`actual Core wakes both original waiters and retains first raw ${name} failure`,async()=>{
  const {invoke}=await loadActual();let sourceFailures=0;const resumeWaiter=Promise.withResolvers<unknown>(),waiter=Promise.withResolvers<unknown>();const first=Promise.allSettled([waiter.promise,resumeWaiter.promise]);
  const scope:Scope={failed:false,firstFailure:null,waiter,resumeWaiter,source:Object.freeze({fail:():void=>{sourceFailures+=1;}})};invoke(scope,cause);rejected(await first,cause);assert.equal(scope.failed,true);assert.equal(scope.firstFailure,cause);assert.equal(sourceFailures,1);assert.equal(scope.waiter,null);assert.equal(scope.resumeWaiter,null);
  const late=Promise.withResolvers<unknown>(),lateResume=Promise.withResolvers<unknown>();scope.waiter=late;scope.resumeWaiter=lateResume;const after=Promise.allSettled([late.promise,lateResume.promise]);invoke(scope,new Error("later cause"));rejected(await after,cause);assert.equal(scope.firstFailure,cause);assert.equal(sourceFailures,1);assert.equal(scope.waiter,null);assert.equal(scope.resumeWaiter,null);
 });
}
void test("Core first-failure writes and producer Scope.failed latch remain inside the actual wakeup helper",async()=>{
 const {end,start,tree}=await loadActual();let firstWrites=0,helperCalls=0,latchWrites=0;
 visit(tree,row=>{
  if(row["type"]==="CallExpression"&&record(row["callee"])&&row["callee"]["type"]==="Identifier"&&row["callee"]["name"]==="failForwardWriterProducerScope"){helperCalls+=1;}
  if(row["type"]!=="AssignmentExpression"||!record(row["left"])||row["left"]["type"]!=="MemberExpression"){return;}
  const left=row["left"],object=left["object"],property=left["property"];if(!record(property)){return;}const key=property["type"]==="Identifier"?property["name"]:property["value"];
  if(key==="firstFailure"||key==="failed"&&record(object)&&object["type"]==="Identifier"&&object["name"]==="scope"){
   const from=row["start"],to=row["end"];assert.ok(typeof from==="number"&&typeof to==="number"&&from>=start&&to<=end,"producer failure latch bypasses original waiter wakeup");if(key==="firstFailure"){firstWrites+=1;}else{latchWrites+=1;}
  }
 });assert.equal(firstWrites,1);assert.equal(latchWrites,1);assert.ok(helperCalls>1);
});
