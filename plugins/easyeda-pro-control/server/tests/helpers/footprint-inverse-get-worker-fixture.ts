/** Exact original worker spans inside an inert readonly GET fixture. The
 * fixture creates no native/Core owner and never executes the GET handler. */
import assert from "node:assert/strict";
import { CURRENT_NATIVE_OWN_DATA_BIND as BIND } from "../../src/current-native-own-data-intrinsics.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES } from "../../src/current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_CALLEES as CLASSES } from "../../src/current-footprint-inverse-delete-binding-source.ts";

/** Preserve every original function/line coordinate and install only inert
 * project, bus, queue and original common prelude objects around those spans. */
export function footprintInverseGetWorkerFixture(full:string):string{
 let value=full.replaceAll(/[^\r\n]/gu,part=>" ".repeat(part.length));const intro="(()=>{let exports,Tg;const ar=class{};";value=intro+value.slice(intro.length);
 const begin=';exports=(()=>{"use strict";let wu,Mb,KP,JP;const VP="_MSG_BUS_RPC_";';value=value.slice(0,804)+begin+value.slice(804+begin.length);
 for(const row of CALLEES.filter(item=>item.kind!=="method")){const prefix=row.kind==="class"?`;${row.key}=`:"";value=value.slice(0,row.start-prefix.length)+prefix+full.slice(row.start,row.end)+value.slice(row.end);}
 const members=CALLEES.map(row=>row.kind==="method"?`${row.owner}.prototype.${row.name}`:row.key);const end=`;return{JP,Mb,wu,functions:[${members.join(",")}]};})();`;value=value.slice(0,18_560)+end+value.slice(18_560+end.length);
 const cls=CLASSES.find(row=>row.key==="Tg");assert.ok(cls!==undefined);value=`${value.slice(0,cls.start-3)}Tg=${full.slice(cls.start,cls.end)}${value.slice(cls.end)}`;
 const registration=full.slice(2_152_068,2_154_892),topics:Record<string,string>={};for(const match of registration.matchAll(/q\.footprint\.(\w+)/gu)){const name=match[1];assert.ok(name!==undefined);topics[name]=name;}
 const q=`;const q=${JSON.stringify({footprint:topics})};`;value=value.slice(0,100_000)+q+value.slice(100_000+q.length);value=value.slice(0,2_152_068)+registration+value.slice(2_154_892);
 return`${value};const project={},bus=Object.assign(Object.create(exports.JP.prototype),{pulled:{},pushed:{},subscribed:{},uuid:"01234567-0123-4567-89ab-0123456789ab",rpcTicket:0,pushCnt:0}),manager=Object.create(Tg.prototype);manager.projectManager=project;project.workerBus=bus;project.footprint=manager;let handler;Object.defineProperty(bus,"rpcService",{value:(topic,fn)=>{if(topic==='get')handler=fn;},configurable:true});Object.defineProperty(bus,"subscribe",{value:()=>{},configurable:true});cP(project);delete bus.rpcService;delete bus.subscribe;let callback;Object.defineProperty(bus,"pull",{value:(_topic,fn)=>{callback=fn;},configurable:true});exports.Mb.prototype.rpcService.call(bus,'/mgr/projectWorker/footprint/get',handler);delete bus.pull;const queue=[new exports.wu(callback,true)];bus.pulled['/mgr/projectWorker/footprint/get']=queue;const f=Array(28).fill(null);f[0]=Tg;const ready=[f,[project,bus,manager,null,null,null,null,'a'.repeat(16),null],()=>true,{}],clock=[ready,null,exports.functions,null,null,null,null,null,()=>true],prelude=[ready,clock,bus,null,null,null,()=>true];globalThis.PROJECT=project;globalThis.fixture={project,bus,manager,queue,handler,callback,prelude,I:(${BIND})(Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis)};})();`;
}
