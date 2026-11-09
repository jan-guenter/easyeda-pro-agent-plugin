/** Exact selected receiver fragments and uninvoked source metadata. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceCanvasEchoSource } from "../src/current-schematic-relevance-canvas-echo-source.ts";
import { decodeCurrentSchematicRelevanceCanvasEchoFunction as decode, requireCurrentSchematicRelevanceCanvasEchoDescription as description } from "../src/current-schematic-relevance-canvas-echo-replies.ts";
import { requireCurrentSchematicRelevanceConsistencyCalleeDescription as consistencyDescription } from "../src/current-schematic-relevance-consistency-callee-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const fixture = [
  {
    "pushOnLine": "pushOnLine(i,e){if(this.consistencyManager)for(let t of i)this.publishLine(t[0],t[1],t[2],t[3],t[4],e,t[5],t[6],t[7],!1,t[8])}",
    "publishLine": "publishLine(i,e,t,r,n,s=this.uuid,a,o,l,c,u){if(this.channel.canPush())return this.consistencyManager.remoteChange(e,n,s,i,t,r,void 0,void 0,void 0,a,void 0,o,l,u),!1;this.cache[s]||(this.cache[s]=new Map);let h=i+r,d=this.cache[s].get(h);return(c||!d||d.ticket<e||d.ticket===e&&(d.client<n||d.client===n&&!!d.pend!=!!a))&&this.cache[s].set(h,{client:n,ticket:e,dataType:r,data:t,pend:a,unique:o,pChange:d?void 0:l,num:u,id:i}),!0}",
    "projectUpdateCallback": "l=>{this.onUpdate?this.onUpdate(l):this.pushOnLine(l,this.uuid)}",
    "channelCanPush": "canPush(){return!this._locker||this._locker===this._temporaryUnlock}",
    "remoteChange": "remoteChange(i,e,t,r,n,s,a,o,l,c,u,h,d,p){var m;this.setMaxTicket(i);let g=h===this.unique,y=o||g,b=(!y||y&&this.isLocalChange)&&(!d||d&&this.isPendChange),_=(m=this.tempLocalIds[t])==null?void 0:m[r];!o&&g?_?(b=!1,_[0]===e&&_[1]===i&&delete this.tempLocalIds[t][r]):b=!0:!o&&_&&(_[1]>i||_[1]===i&&_[0]>e?b=!1:delete this.tempLocalIds[t][r]),this.setDocMaxTicket(t,i,c),b&&this.publishChange(t,r,n,s,e,i,l,c,void 0,d,h,p)}",
    "setMaxTicket": "setMaxTicket(i,e){i&&(e||this.maxTicket<i)&&(this.maxTicket=i)}",
    "setDocMaxTicket": "setDocMaxTicket(i,e,t){t||(!this.docMaxTicket[i]||this.docMaxTicket[i]<e)&&(this.docMaxTicket[i]=e)}"
  },
  {
    "pushOnLine": "pushOnLine(i,e){if(this.consistencyManager)for(let t of i)this.publishLine(t[0],t[1],t[2],t[3],t[4],e,t[5],t[6],t[7],!1,t[8])}",
    "publishLine": "publishLine(i,e,t,r,n,s=this.uuid,a,o,l,c,u){if(this.channel.canPush())return this.consistencyManager.remoteChange(e,n,s,i,t,r,void 0,void 0,void 0,a,void 0,o,l,u),!1;this.cache[s]||(this.cache[s]=new Map);let h=i+r,d=this.cache[s].get(h);return(c||!d||d.ticket<e||d.ticket===e&&(d.client<n||d.client===n&&!!d.pend!=!!a))&&this.cache[s].set(h,{client:n,ticket:e,dataType:r,data:t,pend:a,unique:o,pChange:d?void 0:l,num:u,id:i}),!0}",
    "projectUpdateCallback": "l=>{this.onUpdate?this.onUpdate(l):this.pushOnLine(l,this.uuid)}",
    "channelCanPush": "canPush(){return!this._locker||this._locker===this._temporaryUnlock}",
    "remoteChange": "remoteChange(i,e,t,r,n,s,a,o,l,c,u,h,d,p){var g;this.setMaxTicket(i);let m=h===this.unique,y=o||m,b=(!y||y&&this.isLocalChange)&&(!d||d&&this.isPendChange),_=(g=this.tempLocalIds[t])==null?void 0:g[r];!o&&m?_?(b=!1,_[0]===e&&_[1]===i&&delete this.tempLocalIds[t][r]):b=!0:!o&&_&&(_[1]>i||_[1]===i&&_[0]>e?b=!1:delete this.tempLocalIds[t][r]),this.setDocMaxTicket(t,i,c),b&&this.publishChange(t,r,n,s,e,i,l,c,void 0,d,h,p)}",
    "setMaxTicket": "setMaxTicket(i,e){i&&(e||this.maxTicket<i)&&(this.maxTicket=i)}",
    "setDocMaxTicket": "setDocMaxTicket(i,e,t){t||(!this.docMaxTicket[i]||this.docMaxTicket[i]<e)&&(this.docMaxTicket[i]=e)}"
  }
] as const;

void test("same page matching pending echo deletes its exact pair without another publishChange", () => {
  for (const variant of [0, 1] as const) {
    const row = fixture[variant];
    for (const role of ["pushOnLine", "publishLine", "projectUpdateCallback", "channelCanPush"] as const) { description(row[role], variant, role); }
    for (const [key, role] of [["remoteChange", "consistencyRemoteChange"], ["setMaxTicket", "consistencySetMaxTicket"], ["setDocMaxTicket", "consistencySetDocMaxTicket"]] as const) { consistencyDescription(row[key], variant, role); }
    const context = createContext({});
    runInContext(`"use strict";let calls=0;
      class CM{${row.remoteChange}${row.setMaxTicket}${row.setDocMaxTicket}publishChange(){calls++}}
      class Publisher{${row.pushOnLine}${row.publishLine}}
      function receive(unique="original",present=true,pend=true,push=true,client="client",ticket=7){calls=0;
        const cm=Object.assign(new CM,{unique:"original",maxTicket:7,isLocalChange:true,isPendChange:true,tempLocalIds:{page:present?{text:["client",7]}:{}},docMaxTicket:{}});
        const channel={${row.channelCanPush},_locker:push?0:1,_temporaryUnlock:0};
        const publisher=Object.assign(new Publisher,{uuid:"page",path:"project",onUpdate:undefined,consistencyManager:cm,channel,cache:{}});
        const callback=(function(){return ${row.projectUpdateCallback}}).call(publisher),message=[["text",ticket,"{}","TEXT",client,pend,unique,false,undefined]];
        const result=callback(message);return {cm,publisher,message,result,calls};
      }
      const selected=receive();`, context);
    assert.equal(runInContext("selected.result", context), undefined);
    assert.equal(runInContext("selected.calls", context), 0); assert.equal(runInContext('Object.hasOwn(selected.cm.tempLocalIds.page,"text")', context), false);
    assert.equal(runInContext("selected.cm.maxTicket", context), 7); assert.equal(runInContext("Object.keys(selected.cm.docMaxTicket).length", context), 0);
    assert.equal(runInContext('selected.publisher.uuid==="page"&&selected.publisher.path==="project"&&Object.keys(selected.publisher.cache).length===0', context), true);
    assert.equal(runInContext('receive("foreign").calls', context), 1); assert.equal(runInContext('receive("original",false).calls', context), 1);
    assert.equal(runInContext('receive("original",true,false).cm.docMaxTicket.page', context), 7);
    assert.equal(runInContext('receive("original",true,true,true,"other").calls', context), 0);
    assert.equal(runInContext('Object.hasOwn(receive("original",true,true,true,"other").cm.tempLocalIds.page,"text")', context), true);
    assert.equal(runInContext('Object.hasOwn(receive("original",true,true,false).cm.tempLocalIds.page,"text")', context), true);
  }
});

void test("configured main and child bind all16 missing receiver functions with actual uninvoked V8 metadata", async context => {
  const sources = await Promise.all(SOURCE.map(row => readConfiguredEasyedaAsset(row.relativePath)));
  if (sources.every(source => source === null)) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const variant of [0, 1] as const) {
      const source = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualifyCurrentSchematicRelevanceCanvasEchoSource(source), variant);
      for (const role of ROLES) {
        const row = SOURCE[variant].roles[role];
        const text: string = source.slice(row.start, row.end);
        const prefix = row.kind === "method" ? "(()=>{class Inert{" : "(";
        const suffix = row.kind === "method" ? `};return Inert.prototype.${row.name};})()` : ")";
        const expression: string = "\n".repeat(row.sourceLine) + " ".repeat(row.sourceColumn - prefix.length) + prefix + text + suffix;
        const actual = await session.post("Runtime.evaluate", { expression, returnByValue: false }); assert.equal(actual.exceptionDetails, undefined); assert.ok(actual.result.objectId !== undefined && typeof actual.result.description === "string");
        description(actual.result.description, variant, role);
        const reply = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const location: unknown = reply.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value; assert.ok(location !== null && typeof location === "object");
        const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
        const value = decode(reply, variant, role, scriptId);
        assert.equal(value.originalPublisherVerified, false); assert.equal(value.originalConsistencyVerified, false); assert.equal(value.callbackReceiverVerified, false); assert.equal(value.echoSuppressionVerified, false); assert.equal(value.continuationAuthorized, false);
        assert.throws(() => { decode(reply, variant, role, "foreign"); });
        const rounded = structuredClone(reply);
        const point = rounded.internalProperties?.find(item => item.name === "[[FunctionLocation]]");
        assert.ok(point?.value?.value !== null && typeof point?.value?.value === "object"); Reflect.set(point.value.value, "columnNumber", row.columnNumber + 1);
        assert.throws(() => { decode(rounded, variant, role, scriptId); });
      }
    }
  } finally { session.disconnect(); }
});
