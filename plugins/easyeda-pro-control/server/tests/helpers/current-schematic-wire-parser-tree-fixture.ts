/** Original selected serial wrapper and target replace only the tree peer. */
import assert from"node:assert/strict";
import{CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as ASYNC,qualifyCurrentSchematicWireAsyncSource as qualify}from"../../src/current-schematic-wire-async-source.ts";
import{wireParserRpcFixture}from"./current-schematic-wire-parser-rpc-fixture.ts";

export function wireParserTreeFixture(source:string,variant:0|1,uiKey:string,role:"objectContent"|"pageContent"="objectContent"):string{
 assert.equal(qualify({scriptSource:source}),variant);let text=wireParserRpcFixture(source,variant,uiKey);const rows=ASYNC[variant].rows;
 const stub=variant===0?",On=Ja":",bn=Ja";assert.equal(text.split(stub).length,2);text=text.replace(stub," ".repeat(stub.length));
 const insert=(start:number,end:number,value:string):void=>{assert.match(text.slice(start,end),/^[\s]*$/u);assert.equal(value.length,end-start);text=text.slice(0,start)+value+text.slice(end);};
 for(const name of["serial","astOn"]as const){const row=rows[name];insert(row.start,row.end,source.slice(row.start,row.end));insert(row.end,row.end+1,";");}
 const prefix="refs.treeTarget=(function(){return ",suffix="});",target=rows[role];insert(target.start-prefix.length,target.end+suffix.length,prefix+source.slice(target.start,target.end)+suffix);
 const helpers='let nee=0,kee=0;const ho={debug(){},info(){}},co=ho,B1=()=>({boards:[],blocks:[],exceptBoards:[]}),ev=B1,_e={PRJ:1,SCH:2,BOARD:3,SHEET:4};';insert(7000,7000+helpers.length,helpers);
 const event='event={async passContentData(){counts.tree++}}';assert.equal(text.split(event).length,2);
 const tree='event={ticket:0,renderTicket:0,isSearch:false,lastModify:0,tempContentData:[],tempContentDataIndex:{},_contentData:[],_contentDataIndex:{},_searchContentData:[],expandAllIndex:{},partLenCache:{s:{partLen:0,realPartLen:0}},divideSymbolCollect(){},generateContentData(){counts.tree++;return{status:false,margin:0}}}';
 text=text.replace(event,tree);
 const setup='shape.getModels=()=>[];';assert.equal(text.split(setup).length,2);
 const field=role==="objectContent"?"objectTreeManager":"pageTreeManager";const tab=role==="objectContent"?0:3;
 const attach=`for(const key of["objectTreeManager","pageTreeManager","netTreeManager","symbolTreeManager"]){Ue[key]={};}Ue[${JSON.stringify(field)}]=event;Ue.event=event;C.leftTreeActiveTab=${String(tab)};event.passContentData=${rows.serial.name}(refs.treeTarget.call(event));${setup}`;
 text=text.replace(setup,attach);
 const notify='const notify=new refs.Notify(shape);';assert.equal(text.split(notify).length,2);
 text=text.replace(notify,`Z.isBuild=true;Z.isPass=false;Z.lastModify=1;Z.prjName="inert";${notify}`);
 return text;
}
