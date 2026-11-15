/** Original UI bus, Task, service wrappers and service bodies. Project
 * lookup and locale provider peers are explicit inert stand-ins. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SERVICE,qualifyCurrentSchematicWireServiceSource as qualifyService } from "../../src/current-schematic-wire-service-source.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_CONTAINERS as CONTAINERS, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE, qualifyCurrentSchematicWireClassicRpcSource as qualify } from "../../src/current-schematic-wire-classic-rpc-source.ts";

export function wireSharedUiFixture(source:string,mode:"complete"|"foreign-service"="complete"):string{
 assert.equal(qualify({scriptSource:source}),2);assert.equal(qualifyService({scriptSource:source}),2);const container=CONTAINERS[2],parts:{start:number;end:number;text:string}[]=[],rows=SOURCE[2].rows;
 const add=(start:number,end:number,text:string):void=>{assert.equal(text.length,end-start);parts.push({start,end,text});};
 const before=(start:number,text:string):void=>{add(start-text.length,start,text);};const after=(end:number,text:string):void=>{add(end,end+text.length,text);};
 const prefix='(function(){"use strict";const refs={},timers=[],z2t=300000,sdn="_MSG_BUS_RPC_",O2t=ArrayBuffer,edn=true,adn=WeakRef,setTimeout=(reject,delay)=>{timers.push({reject,delay})},w={currentProject:{projectId:"p"}},Et=false;let de;';
 add(0,prefix.length,prefix);
 for(const role of["helperClone","helperRef","helperDeref","helperListGet","helperListEnsure","helperListRemove","N4e"]as const){const row=rows[role];add(row.start,row.end,source.slice(row.start,row.end));}
 for(const role of["MessageBusTask","MessageBus"]as const){const row=container.classes[role];before(row.start,`${role==="MessageBusTask"?"var ":","}${container.aliases[role]}=`);add(row.start,row.end,source.slice(row.start,row.end));if(role==="MessageBus"){after(row.end,";");}}
 const owners=SERVICE[2];const base=owners.classes.registryBase,registry=owners.classes.registry;
 before(base.start,"var eEe=");add(base.start,registry.end,source.slice(base.start,registry.end));after(registry.end,";var f5=ace;");
 const lookup=owners.rows.registryLookup;add(lookup.start,lookup.end,source.slice(lookup.start,lookup.end));
 const curr=owners.rows.localeCurr;before(curr.start,"refs.curr={");add(curr.start,curr.end,source.slice(curr.start,curr.end));after(curr.end,"};");
 const getter=rows.uiClosingGetter;before(getter.start,"refs.Project=class{");add(getter.start,getter.end,source.slice(getter.start,getter.end));after(getter.end,"};");
 const value=rows.uiLocale__getValue;before(value.start,'refs.locale={"_getValue":');add(value.start,value.end,source.slice(value.start,value.end));
 const lang=rows.uiLocale_i18n;before(lang.start,',i18n:');add(lang.start,lang.end,source.slice(lang.start,lang.end));after(lang.end,"};");
 const closing=rows.uiClosing;before(closing.start,'refs.services={"-isClosing":');add(closing.start,closing.end,source.slice(closing.start,closing.end));after(closing.end,"};");
 const tail='refs.project=Object.assign(new refs.Project,{_isClosing:false});ace.tool=new ace;ace.tool.map.set("p",refs.project);de={...refs.locale,_curr:"en",_cache:{en:{_status:"loaded","or clear.":"or clear."}}};Object.defineProperty(de,"curr",Object.getOwnPropertyDescriptor(refs.curr,"curr"));const bus=new udn;w.messageBus=bus;bus.rpcService("isClosing",N4e(refs.services["-isClosing"]));bus.rpcService("i18n",N4e(de.i18n));return{bus,timers,ui:w,project:refs.project,locale:de}})()';
 before(source.length,mode==="complete"?tail:tail.replace('N4e(de.i18n)','N4e(()=>"or clear.")'));let cursor=0;const out:string[]=[];
 for(const part of parts.toSorted((a,b)=>a.start-b.start)){assert.ok(part.start>=cursor);out.push(source.slice(cursor,part.start).replaceAll(/[^\r\n]/gu,text=>" ".repeat(text.length)),part.text);cursor=part.end;}
 out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu,text=>" ".repeat(text.length)));return out.join("");
}
