/** Join a completed original parser's already-consumed outer return.
 * No parser packet is recreated, spent again or converted into authority. */
import{types}from"node:util";
import{decodeCurrentSchematicWireParserPause as decodePause}from"./current-schematic-wire-parser-source.ts";
import{decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{z}from"zod";
import{CurrentSchematicWireParserDriver}from"./current-schematic-wire-parser-driver.ts";
import type{CurrentSchematicWireParserDriverData}from"./current-schematic-wire-parser-driver.ts";
import{validateCurrentSchematicWireParserCommand as validate}from"./current-schematic-wire-parser-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const promise=z.strictObject({result:z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle})});
const truth=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const used=new WeakSet<Promise<unknown>>();
export interface CurrentSchematicWireTreeParserReceipt{
 readonly frame:string;readonly context:string;readonly sheet:string;readonly promise:string;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;
}
const issued=new WeakMap<CurrentSchematicWireTreeParserReceipt,CurrentSchematicWireParserDriver>();
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TREE_PARSER_RECEIPT");}}
export function retainCurrentSchematicWireTreeParserReceipt(owner:CurrentSchematicWireParserDriver,data:CurrentSchematicWireParserDriverData):CurrentSchematicWireTreeParserReceipt{
 need(Object.getPrototypeOf(owner)===CurrentSchematicWireParserDriver.prototype);owner.requireLiveComparison(data);const rows=owner.retained().attempts;
 const returns=rows.filter(row=>row.command.phase==="wire-parser-call"&&row.command.role==="passContentReturned");need(returns.length===2);const returned=returns[1];need(returned!==undefined&&returned.pending!==undefined&&types.isPromise(returned.pending)&&!used.has(returned.pending)&&returned.cause===undefined&&returned.raw!==undefined);
 const command=validate(returned.command);need(command.phase==="wire-parser-call"&&command.role==="passContentReturned");truth.parse(capture(returned.raw).value);
 const context=command.params.arguments[2]?.objectId,sheet=command.params.arguments[3]?.objectId;need(context!==undefined&&sheet!==undefined&&context===data.parser.context&&sheet===data.parser.sheet);
 const index=rows.indexOf(returned),retained=rows.slice(0,index).findLast(row=>row.command.phase==="wire-parser-call"&&row.command.role==="retainPromise");need(retained!==undefined&&retained.pending!==undefined&&types.isPromise(retained.pending)&&retained.cause===undefined&&retained.raw!==undefined);
 const retainedCommand=validate(retained.command);need(retainedCommand.phase==="wire-parser-call"&&retainedCommand.role==="retainPromise");
 const arms=rows.filter(row=>row.command.phase==="wire-parser-driver-arm"&&row.command.role==="astPassContent"&&row.command.stage==="returned");need(arms.length===1);const arm=arms[0];need(arm!==undefined&&arm.raw!==undefined&&arm.cause===undefined&&arm.command.phase==="wire-parser-driver-arm");
 const point=z.object({breakpointId:handle}).parse(capture(arm.raw).value).breakpointId;
 const event=z.object({method:z.literal("Debugger.paused"),params:z.object({hitBreakpoints:z.array(handle).length(1)})});
 const pauses=owner.retained().events.filter(raw=>event.safeParse(raw).data?.params.hitBreakpoints[0]===point);need(pauses.length===1);
 const held=decodePause(z.object({params:z.unknown()}).parse(pauses[0]).params,arm.command.variant,"astPassContent","returned",arm.command.params.location.scriptId,point);
 need(held.promise!==null&&retainedCommand.params.objectId===held.promise);
 const frame=rows.slice(0,index).findLast(row=>row.command.phase==="wire-parser-frame"&&row.command.role==="passContentReturned");need(frame!==undefined&&frame.command.phase==="wire-parser-frame"&&frame.command.params.callFrameId===held.frame&&frame.cause===undefined&&frame.raw!==undefined&&tuple(capture(frame.raw).value,3)===command.params.objectId);
 const outer=promise.parse(capture(retained.raw).value).result.objectId;
 for(const original of[returned,retained]){
  const c=original.command;need(c.method==="Runtime.callFunctionOn");const next=rows.indexOf(original)+1;
  need(rows.slice(next).some(row=>row.command.method==="Debugger.getScriptSource"&&row.cause===undefined&&z.strictObject({scriptSource:z.literal(`(${c.params.functionDeclaration})`)}).safeParse(row.raw).success));
 }
 used.add(returned.pending);
 const result:CurrentSchematicWireTreeParserReceipt=Object.freeze({frame:command.params.objectId,context,sheet,promise:outer,suppliedTransportOnly:true,originalNativeOwnerJoined:false});issued.set(result,owner);return result;
}
export function requireCurrentSchematicWireTreeParserReceipt(data:CurrentSchematicWireTreeParserReceipt,owner:CurrentSchematicWireParserDriver,packet:CurrentSchematicWireParserDriverData):CurrentSchematicWireTreeParserReceipt{
 need(issued.get(data)===owner);owner.requireLiveComparison(packet);return data;
}
