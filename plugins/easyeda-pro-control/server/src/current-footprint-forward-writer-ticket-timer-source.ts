/** Exact immutable ticket-timer source. No source token owns a timer or bus. */
import {createHash} from "node:crypto";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {qualifyCurrentSchematicRelevanceModifyTicketSource} from "./current-schematic-relevance-modify-ticket-source.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SOURCE=freezeDeep({
  "KP.publish": {
    "start": 9842,
    "end": 9926,
    "bytes": 84,
    "sha256": "5f187de3262123ee1cdd5e9fd4cc789057e61148ce3ae18f5d44c475e17cd74b",
    "lineNumber": 0,
    "columnNumber": 9842,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 9849
    },
    "source": "publish(e,t){console.debug(\"BC\",this.uuid,\"PUBLISH\",e,t),this.broadcastPublish(e,t)}"
  },
  "KP.onReceivedPublish": {
    "start": 10_418,
    "end": 10_687,
    "bytes": 269,
    "sha256": "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa",
    "lineNumber": 0,
    "columnNumber": 10_418,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 10_435
    },
    "source": "onReceivedPublish(e,t,s){console.debug(\"BCMSG(\",this.uuid,\")\",\"from\",e,\"PUBLISH\",t,\"message\",s);let r=this.subscribed[t];if(r){let i;for(let n of r)n.running()?n.execute(s):(i=i||new Array,i.push(n));if(i)for(let n of i)Hg(r,n);r.length===0&&delete this.subscribed[t]}}"
  },
  "JP.onMessage": {
    "start": 11_813,
    "end": 12_230,
    "bytes": 417,
    "sha256": "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308",
    "lineNumber": 0,
    "columnNumber": 11_813,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 11_822
    },
    "source": "onMessage(e){let{type:t,uuid:s,topic:r}=e;switch(t){case\"PUBLISH\":{let{message:i}=e;this.onReceivedPublish(s,r,i);break}case\"WHOHAS\":{this.onReceivedWhoHas(s,r);break}case\"IHAVE\":{let{id:i}=e;this.onReceivedIHave(s,r,i);break}case\"INEED\":{let{source:i,id:n}=e;this.onReceivedINeed(s,r,i,n);break}case\"IGIVE\":{let{target:i,id:n,message:a}=e;this.onReceivedIGive(s,r,n,i,a);break}default:console.warn(\"unsupported\",e)}}"
  },
  "JP.broadcastPublish": {
    "start": 12_230,
    "end": 12_313,
    "bytes": 83,
    "sha256": "30cd880109ad82ba614691e6fc0de9b7a9469053af28ebafe94fa38af1d006a4",
    "lineNumber": 0,
    "columnNumber": 12_230,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 12_246
    },
    "source": "broadcastPublish(e,t){this.post({type:\"PUBLISH\",uuid:this.uuid,topic:e,message:t})}"
  },
  "JP.post": {
    "start": 12_638,
    "end": 12_717,
    "bytes": 79,
    "sha256": "9dc43a09fc1339c50618ee681fa45a2967e94215e2a85361e1a9cb41a8d4f3c2",
    "lineNumber": 0,
    "columnNumber": 12_638,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 12_642
    },
    "source": "post(e){this.bc.postMessage(e),Promise.resolve().then(()=>{this.onMessage(e)})}"
  },
  "JP.post.callback": {
    "start": 12_692,
    "end": 12_715,
    "bytes": 23,
    "sha256": "966efdb4584faac7f762d1c028df318cddaf74bdde0a648bc1c2af6c18cc941b",
    "lineNumber": 0,
    "columnNumber": 12_692,
    "functionLocation": {
      "lineNumber": 0,
      "columnNumber": 12_692
    },
    "source": "()=>{this.onMessage(e)}"
  },
  "Lg.localPublishTicket": {
    "start": 2_108_156,
    "end": 2_108_544,
    "bytes": 388,
    "sha256": "64330265b94b7b37d13e4c9acc7f77e91e886269a4fc9f44538e58bf0f9cc9aa",
    "lineNumber": 110,
    "columnNumber": 93_946,
    "functionLocation": {
      "lineNumber": 110,
      "columnNumber": 93_964
    },
    "source": "localPublishTicket(s){if(s){this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:s,force:!0}),this.publishTimer&&clearTimeout(this.publishTimer),this.publishTimer=null;return}this.publishTimer||(this.publishTimer=setTimeout(()=>{this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:this.consistencyManager.getMaxTicket()}),this.publishTimer=null},20))}"
  },
  "Lg.localPublishTicket.callback": {
    "start": 2_108_398,
    "end": 2_108_538,
    "bytes": 140,
    "sha256": "9ba895bd7c5df21fb0a4e062a17ccee510e596778cabd110d21772f47b1cc106",
    "lineNumber": 110,
    "columnNumber": 94_188,
    "functionLocation": {
      "lineNumber": 110,
      "columnNumber": 94_188
    },
    "source": "()=>{this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:this.consistencyManager.getMaxTicket()}),this.publishTimer=null}"
  }
} as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES=freezeDeep({
 entry:{lineNumber:110,columnNumber:94_193,functionLineNumber:110,functionColumnNumber:94_188,expression:"[this]"},
 returned:{lineNumber:110,columnNumber:94_327,functionLineNumber:110,functionColumnNumber:94_188,expression:"[this]"},
 selfEntry:{lineNumber:0,columnNumber:12_697,functionLineNumber:0,functionColumnNumber:12_692,expression:"[this,e]"},
 selfReturned:{lineNumber:0,columnNumber:12_714,functionLineNumber:0,functionColumnNumber:12_692,expression:"[this,e]"},
} as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FACTS=Object.freeze({
 delayMilliseconds:20,maximumCopyParserPasses:2,maximumMutationTimers:2,
 precreatePublishTimerMustBeNull:true,precreateLocalTicketSubscriberMustBeAbsent:true,
 timerReturnJoinsSelfMicrotask:false,workerBusIsBroadcastChannel:true,
 injectedTimerCalls:0,injectedCancellationCalls:0,injectedPublishCalls:0,
 originalTimerJoined:false,originalNativeOwnershipVerified:false,executionAuthorized:false,saveAuthorized:false,
} as const);
export interface CurrentFootprintForwardWriterTicketTimerSource{readonly profile:"private.current-footprint-forward-writer-ticket-timer-source.v1";readonly sourceQualified:true;readonly originalTimerJoined:false;readonly executionAuthorized:false}
const originals=new WeakSet<object>();
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_TICKET_TIMER_SOURCE");}}
export function qualifyCurrentFootprintForwardWriterTicketTimerSource(input:unknown):CurrentFootprintForwardWriterTicketTimerSource{
 need(typeof input==="string");qualifyCurrentSchematicRelevanceModifyTicketSource(input);
 for(const row of Object.values(CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SOURCE)){
  const source=input.slice(row.start,row.end);need(source===row.source&&Buffer.byteLength(source)===row.bytes&&createHash("sha256").update(source).digest("hex")===row.sha256);
 }
 const token=Object.freeze({profile:"private.current-footprint-forward-writer-ticket-timer-source.v1",sourceQualified:true,originalTimerJoined:false,executionAuthorized:false} as const);originals.add(token);return token;
}
export function requireCurrentFootprintForwardWriterTicketTimerSource(token:CurrentFootprintForwardWriterTicketTimerSource):void{need(originals.has(token));}
