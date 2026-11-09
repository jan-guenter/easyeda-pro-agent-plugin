/** Source-path fixture only. Native delivery and live receiver custody are separate. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE as HANDLER } from "../src/current-schematic-relevance-modify-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as PAGE, qualifyCurrentSchematicRelevanceCanvasEchoSource as uiSource } from "../src/current-schematic-relevance-canvas-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE as CM } from "../src/current-schematic-relevance-consistency-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as BUS } from "../src/current-schematic-relevance-broadcast-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_PROGRAMS as P } from "../src/current-schematic-relevance-modify-echo-completion-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as SNAPSHOT } from "../src/current-schematic-relevance-publication-snapshot-programs.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

void test("unchanged handler, bus, unsafe task, page callback and CM source suppress one matching Echo without cloning or another model callback", async context => {
  const sources = await readConfiguredEasyedaAssets(PAGE.map(row => row.relativePath));
  if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const variant of [0, 1] as const) {
    const source: string | undefined = sources[variant]; assert.ok(typeof source === "string"); assert.equal(uiSource(source), variant);
    const method = (row: Readonly<{ start: number; end: number; name: string }>): string => `Object.getOwnPropertyDescriptor((class{${source.slice(row.start, row.end)}}).prototype,${JSON.stringify(row.name)}).value`;
    const page = PAGE[variant].roles; const consistency = CM[variant].roles;
    const callback = source.slice(page.projectUpdateCallback.start, page.projectUpdateCallback.end); const handler = source.slice(HANDLER[variant].start, HANDLER[variant].end);
    const realm = createContext({});
    runInContext(`let cloneCalls=0,unexpected=0,errors=0,logs=0;const console={debug(){logs++},warn(){unexpected++},error(){errors++}},b=()=>{cloneCalls++;throw Error("clone")},B=()=>{unexpected++};const peer=Symbol("peer"),entry=["client",17],bucket={text:entry},temp={page:bucket},docTickets={page:17},cm={unique:"unique",client:"client",maxTicket:17,isLocalChange:true,isPendChange:true,tempLocalIds:temp,docMaxTicket:docTickets,[peer]:-0,publishChange(){unexpected++}},channel={_locker:0},publisher={uuid:"page",consistencyManager:cm,channel,onUpdate:undefined};cm.remoteChange=${method(consistency.consistencyRemoteChange)};cm.setMaxTicket=${method(consistency.consistencySetMaxTicket)};cm.setDocMaxTicket=${method(consistency.consistencySetDocMaxTicket)};channel.canPush=${method(page.channelCanPush)};publisher.pushOnLine=${method(page.pushOnLine)};publisher.publishLine=${method(page.publishLine)};const callback=(function(){return(${callback})}).call(publisher),task={callback,unsafe:true,isRunning:true,running:${method(page.taskRunning)},execute:${method(page.taskExecute)}},topic="/pro-mgr/canvas/page/update",roster=[task],bus={uuid:"ui",subscribed:{[topic]:roster},onMessage:${method(BUS[variant].roles.onMessage)},onReceivedPublish:${method(BUS[variant].roles.onReceivedPublish)}},handler=(function(){return(${handler})}).call(bus),row=["text",17,"body","TEXT","client",true,"unique",false,undefined],rows=[row],event={data:{type:"PUBLISH",uuid:"worker",topic,message:rows}};`, realm);
    runInContext(`const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],raw=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Object.keys,Array.isArray,undefined,undefined,undefined,undefined,undefined,undefined,undefined,Object.prototype,Array.prototype,Function.prototype,undefined],bindings=[publisher,null,cm,null,bus,null,bus.subscribed,channel,null],seed=[cm,temp],selected=[bucket],pair=[entry],expected=["page","text",17,"body","client","unique"],original=[bucket,entry],methods=[cm.remoteChange,cm.setMaxTicket,cm.setDocMaxTicket,cm.publishChange],qualified=[publisher,cm,channel,temp,bucket,entry,Object.prototype,Array.prototype,Function.prototype,roster,task,bus,docTickets],before=(${SNAPSHOT}).call(qualified,raw);`,realm);
    const unchangedBefore=():unknown=>runInContext(`(${P.before}).call(I11,bindings,seed,selected,pair,expected,original,methods,qualified)`,realm); assert.equal(unchangedBefore(),true);
    runInContext('Object.defineProperty(cm,"client",{get(){unexpected++},enumerable:true,configurable:true})',realm); assert.throws(unchangedBefore); assert.equal(runInContext("unexpected",realm),0); runInContext('Object.defineProperty(cm,"client",{value:"client",writable:true,enumerable:true,configurable:true});handler(event)',realm);
    const deleted=():unknown=>runInContext(`(${P.deletion}).call(before,raw,qualified,selected,pair,expected,original)`,realm); assert.equal(deleted(),true);
    runInContext('cm[peer]=0',realm); assert.throws(deleted);runInContext('cm[peer]=-0',realm); assert.equal(deleted(),true);
    assert.equal(runInContext("Object.hasOwn(bucket,'text')", realm), false); assert.equal(runInContext("Object.is(cm[peer],-0)", realm), true);
    assert.equal(runInContext("cm.maxTicket===17&&cm.docMaxTicket===docTickets&&docTickets.page===17&&cm.tempLocalIds===temp&&temp.page===bucket", realm), true);
    assert.equal(runInContext("bus.subscribed[topic]===roster&&roster.length===1&&roster[0]===task&&task.callback===callback&&task.unsafe===true&&task.isRunning===true", realm), true);
    assert.equal(runInContext("cloneCalls+unexpected+errors", realm), 0); assert.equal(runInContext("logs", realm), 1);
  }
});
