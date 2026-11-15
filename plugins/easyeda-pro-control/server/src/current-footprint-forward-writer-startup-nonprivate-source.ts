/** Immutable source facts only. The original held startup frame must still
 * prove jr===false; this token grants no runtime value or websocket authority. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as TICKET,qualifyCurrentSchematicRelevanceModifyTicketSource} from "./current-schematic-relevance-modify-ticket-source.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_INITIALIZER=freezeDeep({
  "start": 1_654_631,
  "end": 1_654_831,
  "bytes": 200,
  "sha256": "4d3f23b9eead388b6ee3e39676ebad4abccab2e07aba7c9c220599642bc9fd7d",
  "source": "var{IS_EASYEDA:eX,IS_LCEDA:tX,IS_CLIENT:ln,IS_PRIVATE:jr,IS_ONLINE:nA,IS_OFFLINE:sX,IS_HALF_OFFLINE:rX,IS_DEV:iX,IS_ECAD:nX,PRO_EDITOR_MODES:V9}=L1,Fe=ln&&!nA,eu=ln&&nA,Gm=V9.indexOf(\"ENTERPRISE\")>=0;"
} as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_IDENTIFIERS=freezeDeep([
  {
    "start": 1_654_685,
    "end": 1_654_687,
    "lineNumber": 106,
    "columnNumber": 26_225,
    "parentType": "Property",
    "parentKey": "value",
    "contextStart": 1_654_605,
    "contextEnd": 1_654_767,
    "contextSha256": "912714ca11299b85aeb0d9b7c448d03f1e89b1fccb92dc67d2e1324453c42590"
  },
  {
    "start": 1_706_181,
    "end": 1_706_183,
    "lineNumber": 108,
    "columnNumber": 4685,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_706_101,
    "contextEnd": 1_706_263,
    "contextSha256": "6d67153aa3b1e60c4308def81de8b085cc68101eae47b31ca55ba6c018238583"
  },
  {
    "start": 1_706_237,
    "end": 1_706_239,
    "lineNumber": 108,
    "columnNumber": 4741,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_706_157,
    "contextEnd": 1_706_319,
    "contextSha256": "54bd6e32f2294b9ba751bd90c307c55c68f6b4a2526d343902a4a5aaa72fa60a"
  },
  {
    "start": 1_706_488,
    "end": 1_706_490,
    "lineNumber": 108,
    "columnNumber": 4992,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_706_408,
    "contextEnd": 1_706_570,
    "contextSha256": "627763a318dd6636028f339966c4804d20ca6bd2dbb16ec641306e4fceed5479"
  },
  {
    "start": 1_707_001,
    "end": 1_707_003,
    "lineNumber": 108,
    "columnNumber": 5505,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_706_921,
    "contextEnd": 1_707_083,
    "contextSha256": "36decdfc5a6d3ae09b5d874c10eaf73c5336b8a27a7353683e31e4fb0f9c7380"
  },
  {
    "start": 1_707_057,
    "end": 1_707_059,
    "lineNumber": 108,
    "columnNumber": 5561,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_706_977,
    "contextEnd": 1_707_139,
    "contextSha256": "67f40e9c8c1eb251cc7dbdd079b888dd57f3d68e2670d88575f14b0339d08c26"
  },
  {
    "start": 1_707_308,
    "end": 1_707_310,
    "lineNumber": 108,
    "columnNumber": 5812,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 1_707_228,
    "contextEnd": 1_707_390,
    "contextSha256": "9f9092e38f3a3a4385f2785b6e13244e3914eac979735485630f775d0ba1820d"
  },
  {
    "start": 1_842_561,
    "end": 1_842_563,
    "lineNumber": 108,
    "columnNumber": 141_065,
    "parentType": "ConditionalExpression",
    "parentKey": "test",
    "contextStart": 1_842_481,
    "contextEnd": 1_842_643,
    "contextSha256": "d1f7b6043b1d1cd919ea78f63a01177fe408354fc7a499c7e78553c792c2bb78"
  },
  {
    "start": 2_103_978,
    "end": 2_103_980,
    "lineNumber": 110,
    "columnNumber": 89_768,
    "parentType": "LogicalExpression",
    "parentKey": "right",
    "contextStart": 2_103_898,
    "contextEnd": 2_104_060,
    "contextSha256": "eb54509311d67bee00f06e3ebfe41ae1a2586099d2a9478f1871e85a522a5c0c"
  },
  {
    "start": 2_108_568,
    "end": 2_108_570,
    "lineNumber": 110,
    "columnNumber": 94_358,
    "parentType": "UnaryExpression",
    "parentKey": "argument",
    "contextStart": 2_108_488,
    "contextEnd": 2_108_650,
    "contextSha256": "073efbcbff8eae36d57f5efb84fd2cfc834ceee126aaf1df62e14a41c8155c3e"
  },
  {
    "start": 2_114_434,
    "end": 2_114_436,
    "lineNumber": 110,
    "columnNumber": 100_224,
    "parentType": "IfStatement",
    "parentKey": "test",
    "contextStart": 2_114_354,
    "contextEnd": 2_114_516,
    "contextSha256": "26cade0488ce3ae70a98b6d1ecc480280abb6de60ff65178835166ce654ff182"
  },
  {
    "start": 2_117_021,
    "end": 2_117_023,
    "lineNumber": 110,
    "columnNumber": 102_811,
    "parentType": "LogicalExpression",
    "parentKey": "left",
    "contextStart": 2_116_941,
    "contextEnd": 2_117_103,
    "contextSha256": "febeb685fa52a844cd6da255525da92aab892cbea14cf2934cabec277b5a6c77"
  },
  {
    "start": 2_117_998,
    "end": 2_118_000,
    "lineNumber": 110,
    "columnNumber": 103_788,
    "parentType": "LogicalExpression",
    "parentKey": "left",
    "contextStart": 2_117_918,
    "contextEnd": 2_118_080,
    "contextSha256": "cedf892eebced845a8eb85ae9ce18080744ce67df3a8af6e3bbfbb321f243532"
  }
] as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_POST_SOURCE=freezeDeep({
  "class": {
    "start": 11_672,
    "end": 12_718,
    "bytes": 1046,
    "sha256": "7205fbe0dc77e5742396733391d21b158dac507da6ce7b57ed9808ed24cd0812",
    "source": "class extends KP{constructor(e,t=crypto.randomUUID()){super(t),this.bc=new BroadcastChannel(e),this.bc.onmessage=s=>{this.onMessage(s.data)}}onMessage(e){let{type:t,uuid:s,topic:r}=e;switch(t){case\"PUBLISH\":{let{message:i}=e;this.onReceivedPublish(s,r,i);break}case\"WHOHAS\":{this.onReceivedWhoHas(s,r);break}case\"IHAVE\":{let{id:i}=e;this.onReceivedIHave(s,r,i);break}case\"INEED\":{let{source:i,id:n}=e;this.onReceivedINeed(s,r,i,n);break}case\"IGIVE\":{let{target:i,id:n,message:a}=e;this.onReceivedIGive(s,r,n,i,a);break}default:console.warn(\"unsupported\",e)}}broadcastPublish(e,t){this.post({type:\"PUBLISH\",uuid:this.uuid,topic:e,message:t})}broadcastWhoHas(e){this.post({type:\"WHOHAS\",uuid:this.uuid,topic:e})}broadcastIHave(e,t){this.post({type:\"IHAVE\",uuid:this.uuid,topic:e,id:t})}broadcastINeed(e,t,s){this.post({type:\"INEED\",uuid:this.uuid,topic:e,source:t,id:s})}broadcastIGive(e,t,s,r){this.post({type:\"IGIVE\",uuid:this.uuid,topic:e,id:t,target:s,message:r})}post(e){this.bc.postMessage(e),Promise.resolve().then(()=>{this.onMessage(e)})}}"
  },
  "calls": [
    {
      "start": 12_252,
      "end": 12_312,
      "bytes": 60,
      "sha256": "71f1a5dbbd82cc514a9957b286622c3642f4045d02f54746c3c47844b9c082c5",
      "source": "this.post({type:\"PUBLISH\",uuid:this.uuid,topic:e,message:t})",
      "method": "broadcastPublish",
      "keys": [
        "type",
        "uuid",
        "topic",
        "message"
      ],
      "type": "PUBLISH",
      "topicParameter": "e",
      "objectStart": 12_262,
      "objectEnd": 12_311
    },
    {
      "start": 12_332,
      "end": 12_381,
      "bytes": 49,
      "sha256": "c36e0b89fb98daf1ba1b0cd48bc645d79af8e49f038b9693ed2759ab35c7e9a5",
      "source": "this.post({type:\"WHOHAS\",uuid:this.uuid,topic:e})",
      "method": "broadcastWhoHas",
      "keys": [
        "type",
        "uuid",
        "topic"
      ],
      "type": "WHOHAS",
      "topicParameter": "e",
      "objectStart": 12_342,
      "objectEnd": 12_380
    },
    {
      "start": 12_402,
      "end": 12_455,
      "bytes": 53,
      "sha256": "70bdc1d199eb5c1de3ac41b620119c0aa376a071137378d14d6b6a0e4fe2f226",
      "source": "this.post({type:\"IHAVE\",uuid:this.uuid,topic:e,id:t})",
      "method": "broadcastIHave",
      "keys": [
        "type",
        "uuid",
        "topic",
        "id"
      ],
      "type": "IHAVE",
      "topicParameter": "e",
      "objectStart": 12_412,
      "objectEnd": 12_454
    },
    {
      "start": 12_478,
      "end": 12_540,
      "bytes": 62,
      "sha256": "541700bb2e8b0cccc501d8bad74d1e9f110f5c708e21b8f04bd2e7a6ae4c7bd3",
      "source": "this.post({type:\"INEED\",uuid:this.uuid,topic:e,source:t,id:s})",
      "method": "broadcastINeed",
      "keys": [
        "type",
        "uuid",
        "topic",
        "source",
        "id"
      ],
      "type": "INEED",
      "topicParameter": "e",
      "objectStart": 12_488,
      "objectEnd": 12_539
    },
    {
      "start": 12_565,
      "end": 12_637,
      "bytes": 72,
      "sha256": "8369b64308047302c8707f669bf982037438feda51706b783f812a8ecf2cd57d",
      "source": "this.post({type:\"IGIVE\",uuid:this.uuid,topic:e,id:t,target:s,message:r})",
      "method": "broadcastIGive",
      "keys": [
        "type",
        "uuid",
        "topic",
        "id",
        "target",
        "message"
      ],
      "type": "IGIVE",
      "topicParameter": "e",
      "objectStart": 12_575,
      "objectEnd": 12_636
    }
  ]
} as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_SOURCE=freezeDeep({
  "onHeadChange": {
    "start": 2_105_478,
    "end": 2_105_507,
    "bytes": 29,
    "sha256": "ae462acd2b2238e06c322d814d0155601ac22ada5951926e03aedb016a584dcf",
    "lineNumber": 110,
    "columnNumber": 91_268,
    "name": "",
    "arity": 2,
    "async": false,
    "source": "(n,a)=>this.onHeadChange(n,a)",
    "functionLocation": {
      "lineNumber": 110,
      "columnNumber": 91_268
    },
    "kind": "arrow"
  },
  "onChange": {
    "start": 2_105_542,
    "end": 2_107_140,
    "bytes": 1598,
    "sha256": "44bfca1afed5a3f24c30767ac3b7a0235fc8fd92808eb604564f98cee1424c9e",
    "lineNumber": 110,
    "columnNumber": 91_332,
    "name": "",
    "arity": 13,
    "async": false,
    "source": "(n,a,o,c,l,u,h,p,d,m,f,g,y)=>{var E,T,w;let b=this.consistencyManager.getDoctype(n);switch(b){case ve.BLOB:{this.blob.onDataChange(n,a,o,c,u,l,p,d,f,m);break}case ve.BOARD:{this.board.onDataChange(n,o,c,p,l,u,m);break}case ve.CONFIG:{this.config.onDataChange(n,a,o,c,l,u,m);break}case ve.DEVICE:{this.device.onDataChange(n,o,c,l,u,m);break}case ve.FONT:{this.font.onDataChange(n,a,o,c,u,l,p,d,f,m);break}case ve.FOOTPRINT:{this.footprint.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.INSTANCE:{this.instance.onDataChange(n,a,o,c,l,u,p,d);break}case ve.PANEL:{this.panel.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.PCB:{this.pcb.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SCH:{this.schematic.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SCH_PAGE:{if(this.sheet.onDataChange(n,a,o,c,l,u,p,d,f,m,y),c===De.META){let S=(E=this.sheet.data[n])==null?void 0:E.schematic,v=(T=this.sheet.data[n])==null?void 0:T.updateTime,_=(w=this.sheet.data[n])==null?void 0:w.version;S&&this.schematic.setEditData(S,void 0,v,_)}break}case ve.SIMULATION:{this.simulation.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SYMBOL:{this.symbol.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.VARIANT:{!m&&this.variant.onVariantChange(n,o,c);break}case ve.COMPONENT_GROUP:{!m&&this.variant.onGroupChange(n,a,o,c);break}case ve.COMPONENT_GROUP_DATA:{!m&&this.variant.onGroupDataChange(n,a,o,c);break}}if(this.uploadStructure(b,c,p),this.localPublishTicket(),this.canWsPublish()&&!d){if([ve.SYMBOL,ve.FOOTPRINT].includes(b)&&p&&c!==De.META)return;let S=[n,a,l,u,o,c,b,p];this.bufferedPendDataStream(S)}}",
    "functionLocation": {
      "lineNumber": 110,
      "columnNumber": 91_332
    },
    "kind": "arrow"
  }
} as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_FACTS=Object.freeze({identifierSites:13,bindingSites:1,readSites:12,laterWritesInPinnedSource:0,directEvalSites:0,withStatementSites:0,jpLiteralPostCallsites:5,registeredHeadArrows:1,registeredChangeArrows:1,falsePrivateFlagShortCircuitsWebsocket:true,runtimePrivateFlagObserved:false,runtimeSubscriberRosterObserved:false,executionAuthorized:false,saveAuthorized:false} as const);
export interface CurrentFootprintForwardWriterStartupNonprivateSource{readonly profile:"private.current-footprint-forward-writer-startup-nonprivate-source.v1";readonly sourceQualified:true;readonly runtimePrivateFlagObserved:false;readonly executionAuthorized:false}
const originals=new WeakSet<object>();
const hash=(text:string):string=>createHash("sha256").update(text).digest("hex");
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_STARTUP_NONPRIVATE_SOURCE");}}
function span(input:string,row:Readonly<{start:number;end:number;bytes:number;sha256:string;source:string}>):void{const source=input.slice(row.start,row.end);need(source===row.source&&Buffer.byteLength(source)===row.bytes&&hash(source)===row.sha256);}
/** Full original bytes bind the independently audited lexical/write/callsite
 * facts. No parser runs on each runtime reproof, and no app code is evaluated. */
export function qualifyCurrentFootprintForwardWriterStartupNonprivateSource(input:unknown):CurrentFootprintForwardWriterStartupNonprivateSource{
 need(typeof input==="string");qualifyCurrentSchematicRelevanceModifyTicketSource(input);
 span(input,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_INITIALIZER);span(input,TICKET.canWsPublish);
 for(const row of CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_NONPRIVATE_IDENTIFIERS){need(input.slice(row.start,row.end)==="jr"&&hash(input.slice(row.contextStart,row.contextEnd))===row.contextSha256);}
 span(input,CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_POST_SOURCE.class);
 for(const row of CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_POST_SOURCE.calls){span(input,row);}
 for(const row of Object.values(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_SOURCE)){span(input,row);}
 const token=Object.freeze({profile:"private.current-footprint-forward-writer-startup-nonprivate-source.v1",sourceQualified:true,runtimePrivateFlagObserved:false,executionAuthorized:false} as const);originals.add(token);return token;
}
export function requireCurrentFootprintForwardWriterStartupNonprivateSource(token:CurrentFootprintForwardWriterStartupNonprivateSource):void{need(originals.has(token));}
