/** One shared callback source location is selected by the actual resolver.
 * Its original Task is rechecked by the subsequent original reply reader. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicWireClassicRpcReplyBindings as bindings } from "./current-schematic-wire-classic-rpc-cursor.ts";
import type { CurrentSchematicWireClassicRpcData } from "./current-schematic-wire-classic-rpc-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_FLAGS as FLAGS,
 CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_REQUESTS as LIMIT,validateCurrentSchematicWireClassicRpcCommand as validate } from "./current-schematic-wire-classic-rpc-protocol.ts";
import type { CurrentSchematicWireClassicRpcCommand as Command } from "./current-schematic-wire-classic-rpc-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_FRAMES as FRAMES } from "./current-schematic-wire-classic-rpc-programs.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const ordinal=z.union([z.literal(0),z.literal(1),z.literal(2)]);
const selection=z.strictObject({type:z.literal("number"),value:ordinal,description:z.string().optional()});
const selected=z.strictObject({result:selection});
function need(value:boolean):asserts value{if(!value){throw new Error("SCHEMATIC_WIRE_CLASSIC_RPC_SELECTION");}}
export class CurrentSchematicWireClassicRpcReplySelector {
 readonly #plan:Generator<Command,"closing"|"language"|"titles",unknown>;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:"closing"|"language"|"titles"|null=null;readonly #raw:unknown[]=[];
 public constructor(frame:string,values:readonly(CurrentSchematicWireClassicRpcData|null)[]){handle.parse(frame);const original=bindings(values);this.#plan=CurrentSchematicWireClassicRpcReplySelector.collect(frame,original);Object.freeze(this);}
 private static *collect(frame:string,input:ReturnType<typeof bindings>):Generator<Command,"closing"|"language"|"titles",unknown>{
  const {first,requests}=input;
  const captured=tuple(yield validate({phase:"classic-rpc-frame",role:"reply",variant:first.variant,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frame,expression:FRAMES[first.variant].reply,returnByValue:false,includeCommandLineAPI:false}}),5);
  array(yield validate({phase:"classic-rpc-properties",kind:"fields",method:"Runtime.getProperties",params:{objectId:captured,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),5);
  const row=CALLS.selectReply;
  const result=selected.parse(yield validate({phase:"classic-rpc-call",role:"selectReply",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:captured,functionDeclaration:row.program,arguments:[first.native,first.holder,...requests].map(objectId=>({objectId})),returnByValue:true,awaitPromise:false,userGesture:false}})).result.value;
  return(["closing","language","titles"]as const)[result];
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const item=this.#plan.next();need(item.done!==true);this.#pending=item.value;return item.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&command===this.#pending&&this.#reads<LIMIT.selector);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&command===this.#pending);try{this.#raw.push(raw);const item=this.#plan.next(capture(raw).value);this.#pending=null;this.#reserved=false;if(item.done===true){this.#result=item.value;}else{this.#pending=item.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():"closing"|"language"|"titles"{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public fail():void{this.#failed=true;}
}
Object.freeze(CurrentSchematicWireClassicRpcReplySelector.prototype);Object.freeze(CurrentSchematicWireClassicRpcReplySelector);
