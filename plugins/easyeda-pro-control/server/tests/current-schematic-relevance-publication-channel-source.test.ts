/** The real constructor keeps a compiler object separate from the bus name.
 * Its initProject prefix is stopped before any subscription or RPC. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevancePublicationCalleeSource as qualify } from "../src/current-schematic-relevance-publication-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_PROGRAMS as P } from "../src/current-schematic-relevance-publication-native-programs.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

void test("both installed publisher constructors retain the compiler object and their actual factory derives the independently checked BC name", async context => {
 const sources=await readConfiguredEasyedaAssets(SOURCE.map(row=>row.relativePath));if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 for(const[variant,row]of SOURCE.entries()){
  const source:string|undefined=sources[variant];assert.ok(typeof source==="string");assert.equal(qualify(source),variant);const at=row.roles.publisherConstructor;const actual=source.slice(at.start,at.end);
  const value:unknown=runInNewContext(`(async()=>{const routes=[],bus={bc:{},subscribed:{},pushed:{},pulled:{}},topics={pushPend:"/pro-mgr/worker/batchPendData"};let compilerCalls=0;const compiler={addCompiler(){compilerCalls++}},factory=name=>{routes.push(name);if(name==="/window/project/project")throw"source-prefix-stop";return bus;},xC=factory,e2=factory,C=(${actual}),p=new C("page","project",true,"window",compiler,{},"SCH_PAGE",topics);let stopped=false;try{await p.initProject(false,false,true,undefined,false,false)}catch(error){if(error!=="source-prefix-stop")throw error;stopped=true;}if(!stopped||p.channel!==compiler)throw"source-prefix";p.dataBus=bus;const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray],qualified=[p,bus,topics,compiler],links=[{},{},p,{}],state=[{},{},{},[],bus,compiler,topics],roots=Reflect.apply((${P.roots}),[p],[native,qualified,links,state]);return{routes,compilerCalls,stopped,channelIsCompiler:p.channel===compiler,busName:roots[7],stateStillCompiler:state[5]===compiler};})()`,{});
  const result:unknown=await value;assert.deepEqual(structuredClone(result),{routes:["/window/notify","/window/project/project"],compilerCalls:1,stopped:true,channelIsCompiler:true,busName:"/window/project/project",stateStillCompiler:true});
 }
});
