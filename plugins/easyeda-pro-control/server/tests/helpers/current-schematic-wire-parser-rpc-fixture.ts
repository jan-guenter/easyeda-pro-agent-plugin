/** Compose original parser callers with the original UI-created shared bus.
 * The annotation trigger, model and locale-data peers are inert. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SERVICE,qualifyCurrentSchematicWireServiceSource as qualifyService } from "../../src/current-schematic-wire-service-source.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as RPC } from "../../src/current-schematic-wire-classic-rpc-source.ts";
import { wireParserFixture } from "./current-schematic-wire-parser-fixture.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE } from "../../src/current-schematic-wire-completion-source.ts";

export function wireParserRpcFixture(source:string,variant:0|1,uiKey:string):string{
 let text=wireParserFixture(source,variant,"complete");assert.equal(qualifyService({scriptSource:source}),variant);const row=SOURCE[variant].rows.annotationNotify;
 const startPeers=text.indexOf(",V=");const endPeers=text.indexOf(",C=",startPeers);assert.ok(startPeers>0&&endPeers>startPeers);text=text.slice(0,startPeers)+text.slice(startPeers,endPeers).replaceAll(/[^\r\n]/gu,value=>" ".repeat(value.length))+text.slice(endPeers);
 const insert=(start:number,end:number,value:string):void=>{assert.match(text.slice(start,end),/^[\s]*$/u);assert.equal(value.length,end-start);text=text.slice(0,start)+value+text.slice(end);};
 const assignments:string[]=[],support=SERVICE[variant];
 const helperRows:Readonly<Record<string,Readonly<{start:number;end:number;sourceKind:string;binding?:string}>>>=support.rows;
 const literals:Readonly<Record<string,Readonly<{start:number;end:number}>>>=support.literals;
 for(const helper of Object.values(helperRows)){if(helper.sourceKind==="FunctionDeclaration"){insert(helper.start,helper.end,source.slice(helper.start,helper.end));}else{assert.equal(typeof helper.binding,"string");assert.ok(helper.binding!==undefined);const prefix=`${helper.binding}=`;insert(helper.start-prefix.length,helper.end+1,`${prefix+source.slice(helper.start,helper.end)};`);assignments.push(helper.binding);}}
 for(const[name,literal]of Object.entries(literals)){const prefix=`${name}=`;insert(literal.start-prefix.length,literal.end+1,`${prefix+source.slice(literal.start,literal.end)};`);assignments.push(name);}
 const declared=`const Ie={SCH:"sch",PCB:"pcb"};let ${assignments.join(",")};`;insert(5000,5000+declared.length,declared);
 const query=RPC[variant].rows.titleQuery;insert(query.start,query.end,source.slice(query.start,query.end));
 const prefix='refs.titleService={"-getSheetAllTitle":',service=RPC[variant].rows.titleService;insert(service.start-prefix.length,service.end+2,`${prefix+source.slice(service.start,service.end)}};`);

 const before='refs.Notify=class{constructor(shape){this.shapeManager=shape;this._needNotifyUIUpdateObjects=new Set;this.annotationMgr={annotationPanel:{updateDisplayObject(page,data){counts.annotation=(counts.annotation||0)+1;counts.titleData=JSON.stringify(data)}}};this.notify=';
 const after='}};';const end=row.end+after.length,start=row.start-before.length;
 assert.match(text.slice(start,end),/^[\s]*$/u);
 text=text.slice(0,start)+before+source.slice(row.start,row.end)+after+text.slice(end);
 const marker='return{holder,native,doc,shape,ast:Ue,info:Oi,counts,drive(){';assert.equal(text.split(marker).length,2);
 const setup=`let Z;C.messageBus=globalThis.${uiKey}.bus;const pure={displayTitle:"schematic",sheets:{page:{displayTitle:"sheet",symbols:{}}}};Z={pcbs:{},pureSheets:{page:pure.sheets.page},pureSchematics:{s:pure},schematics:{s:pure},index:{page:{}}};C.messageBus.rpcService("getSheetAllTitle",refs.titleService["-getSheetAllTitle"]);const notify=new refs.Notify(shape);state.modifyAttempted=false;return{holder,native,doc,shape,ast:Ue,info:Oi,counts,drive(){state.modifyAttempted=true;notify.notify();`;
 return text.replace(marker,setup);
}
