/** A service observer may retain the already-consumed original RPC request.
 * This derives no new cursor packet, request, native event or authority. */
import { types } from "node:util";
import { z } from "zod";
import type { CurrentSchematicWireClassicRpcDriver } from "./current-schematic-wire-classic-rpc-driver.ts";
import { validateCurrentSchematicWireClassicRpcSharedCommand as validate } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";

type Role="closing"|"language"|"titles";
export interface CurrentSchematicWireServiceRequestReceipt {
 readonly schema:"private.schematic-wire-service-request-receipt.v1";readonly role:Role;
 readonly entry:string;readonly request:string;readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;
}
interface Original {readonly owner:CurrentSchematicWireClassicRpcDriver;readonly request:Promise<unknown>;readonly resume:Promise<unknown>}
const issued=new WeakMap<CurrentSchematicWireServiceRequestReceipt,Original>();
const spent=new WeakSet<CurrentSchematicWireServiceRequestReceipt>();
const requests=new WeakSet<Promise<unknown>>();
const empty=z.strictObject({});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_SERVICE_REQUEST_RECEIPT");}}
/** The caller already holds the actual service entry; its complete owner must
 * authenticate that event. Await only the original issued resume ACK. */
export async function retainCurrentSchematicWireServiceRequest(owner:CurrentSchematicWireClassicRpcDriver):Promise<CurrentSchematicWireServiceRequestReceipt>{
 const before=owner.inspect();need(before.armed&&!before.settled&&!before.failed&&!before.objectGroupReleased);
 const attempts=owner.retained().attempts;
 const index=attempts.findLastIndex(row=>row.command.phase==="classic-rpc-call"&&row.command.role==="request");need(index!==-1);
 const original=attempts[index];need(original!==undefined&&original.pending!==undefined&&types.isPromise(original.pending)&&!requests.has(original.pending));
 const command=validate(original.command);need(command.phase==="classic-rpc-call"&&command.role==="request"&&original.cause===undefined&&original.raw!==undefined);
 const request=tuple(capture(original.raw).value,3);const entry=command.params.arguments[2]?.objectId;need(entry!==undefined);
 const remainder=attempts.slice(index+1);
 const fieldsIndex=remainder.findIndex(row=>row.command.phase==="classic-rpc-properties"&&row.command.params.objectId===request);const fields=remainder[fieldsIndex];
 const resume=remainder.findLast(row=>row.command.method==="Debugger.resume");
 need(fields!==undefined&&fields.raw!==undefined&&resume!==undefined&&resume.pending!==undefined&&types.isPromise(resume.pending));
 array(capture(fields.raw).value,3);
 const source=remainder.slice(0,fieldsIndex).find(row=>row.command.method==="Debugger.getScriptSource"&&row.raw!==undefined&&z.strictObject({scriptSource:z.string()}).safeParse(row.raw).data?.scriptSource===`(${command.params.functionDeclaration})`);
 need(source!==undefined);
 const origin=attempts.slice(0,index).findLast(row=>row.command.phase==="wire-rpc-driver-origin-call"&&row.command.role!=="join");need(origin!==undefined);
 const originCommand=origin.command;need(originCommand.phase==="wire-rpc-driver-origin-call"&&originCommand.role!=="join"&&originCommand.params.arguments[2]?.objectId===entry);
 const role=z.enum(["closing","language","titles"]).parse(originCommand.role);requests.add(original.pending);
 const ack=await resume.pending;empty.parse(capture(ack).value);
 const after=owner.inspect();need(after.armed&&!after.settled&&!after.failed&&!after.objectGroupReleased);
 const data:CurrentSchematicWireServiceRequestReceipt=Object.freeze({schema:"private.schematic-wire-service-request-receipt.v1",role,entry,request,suppliedTransportOnly:true,originalNativeOwnerJoined:false});
 issued.set(data,Object.freeze({owner,request:original.pending,resume:resume.pending}));return data;
}
export function consumeCurrentSchematicWireServiceRequestReceipt(data:CurrentSchematicWireServiceRequestReceipt,owner:CurrentSchematicWireClassicRpcDriver):CurrentSchematicWireServiceRequestReceipt{
 const original=issued.get(data);need(original!==undefined&&original.owner===owner&&!spent.has(data));spent.add(data);
 const current=owner.inspect();need(current.armed&&!current.failed&&!current.objectGroupReleased);return data;
}
