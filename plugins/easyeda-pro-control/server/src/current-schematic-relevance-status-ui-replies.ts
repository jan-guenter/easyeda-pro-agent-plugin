/** Uninvoked UI callback metadata. Receiver, original UI context and continuation
 * must still be established by the original operation's private controller. */
import { createHash } from "node:crypto";
import {currentSchematicRelevancePrefixProperties as general,currentSchematicRelevancePrefixHandle as objectHandle} from "./current-schematic-relevance-run-prefix-replies.ts";
import type {CurrentSchematicRelevancePrefixRemote} from "./current-schematic-relevance-run-prefix-replies.ts";
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_UI_SOURCE as SOURCE } from "./current-schematic-relevance-status-ui-source.ts";
import type { CurrentSchematicRelevanceStatusUiRole } from "./current-schematic-relevance-status-ui-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["function", "object", "number", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).min(2).max(3), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_STATUS_UI_FUNCTION"); } }
export function requireCurrentSchematicRelevanceStatusUiDescription(value:string,role:CurrentSchematicRelevanceStatusUiRole):void{const profile=SOURCE.roles[role];need(value.isWellFormed()&&Buffer.byteLength(value)===profile.bytes&&createHash("sha256").update(value).digest("hex")===profile.sha256);}
export function decodeCurrentSchematicRelevanceStatusUiFunction(input:unknown,role:CurrentSchematicRelevanceStatusUiRole,scriptId:string):Readonly<{scopes:string;functionPrototype:string;originalSubscriberVerified:false;callbackDeliveryVerified:false;continuationAuthorized:false}>{
 handle.parse(scriptId);const profile=SOURCE.roles[role];const reply=properties.parse(captureCurrentPcbStringClockReply(input).value);const fields=new Map(reply.result.map(row=>[row.name,row]));need(fields.size===2&&fields.size===reply.result.length);
 for(const[name,value]of[["name",profile.name],["length",profile.arity]]as const){const row=fields.get(name);need(row!==undefined&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined&&row.value.subtype===undefined&&!row.writable&&!row.enumerable&&row.configurable);}
 const internals=new Map(reply.internalProperties.map(row=>[row.name,row.value]));need(internals.size===3);const location=internals.get("[[FunctionLocation]]");const parent=internals.get("[[Prototype]]");const scopes=internals.get("[[Scopes]]");const actual=point.parse(location?.value);need(location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined&&actual.scriptId===scriptId&&actual.lineNumber===profile.lineNumber&&actual.columnNumber===profile.columnNumber);need(parent?.type==="function"&&parent.subtype===undefined&&parent.objectId!==undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description??""));return Object.freeze({scopes:scopes.objectId,functionPrototype:parent.objectId,originalSubscriberVerified:false,callbackDeliveryVerified:false,continuationAuthorized:false});
}

/** Extract only the script selector from already correlated strict method metadata; its context and full bytes still require qualification. */
export function currentSchematicRelevanceStatusUiScript(input:unknown):string{const reply=properties.parse(captureCurrentPcbStringClockReply(input).value);const location=reply.internalProperties.find(row=>row.name==="[[FunctionLocation]]");need(location?.value.type==="object"&&location.value.subtype==="internal#location");return point.parse(location.value.value).scriptId;}

export function currentSchematicRelevanceStatusUiWrapperScope(input:unknown):string{const value=general(input);const rows=value.result;need(rows.length > 0&&rows.length<=16);for(let i=0;i<rows.length;i+=1){const row=rows[i];need(row?.name===String(i)&&row.value?.type==="object"&&row.value.subtype==="internal#scope"&&row.get===undefined&&row.set===undefined&&row.writable===true&&row.configurable&&row.enumerable);}const first=rows[0]?.value;need(first?.description==="Closure (N4e)");return objectHandle(first);}
export function currentSchematicRelevanceStatusUiWrapperTarget(input:unknown):CurrentSchematicRelevancePrefixRemote{const value=general(input);need(value.result.length===1);const row=value.result[0];need(row?.name==="t"&&row.value?.type==="function"&&row.value.subtype===undefined&&row.value.objectId!==undefined&&row.get===undefined&&row.set===undefined&&row.writable===true&&row.configurable&&row.enumerable);return row.value;}

/** A class is inspected only as its original readonly static-data container.
 * No constructor call or instance/continuation permission follows from it. */
export function decodeCurrentSchematicRelevanceStatusUiContainer(input:unknown,description:string,role:keyof typeof SOURCE.classes,scriptId:string):Readonly<{functionPrototype:string;constructorInvocationAuthorized:false;continuationAuthorized:false}>{
  const profile=SOURCE.classes[role];handle.parse(scriptId);need(description.isWellFormed()&&Buffer.byteLength(description)===profile.bytes&&createHash("sha256").update(description).digest("hex")===profile.sha256);
  const reply=general(input);const fields=new Map(reply.result.map(row=>[row.name,row]));
  for(const[name,value]of[["name",profile.name],["length",0]]as const){const row=fields.get(name);need(row?.value!==undefined&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.get===undefined&&row.set===undefined&&row.writable===false&&!row.enumerable&&row.configurable);}
  const prototype=fields.get("prototype");need(prototype?.value?.type==="object"&&prototype.value.subtype===undefined&&prototype.value.objectId!==undefined&&prototype.get===undefined&&prototype.set===undefined&&prototype.writable===false&&!prototype.enumerable&&!prototype.configurable);
  const internals=new Map(reply.internalProperties?.map(row=>[row.name,row.value]));need(internals.size===3);const location=internals.get("[[FunctionLocation]]");const parent=internals.get("[[Prototype]]");const scopes=internals.get("[[Scopes]]");const actual=point.parse(location?.value);need(location?.type==="object"&&location.subtype==="internal#location"&&location.objectId===undefined&&actual.scriptId===scriptId&&actual.lineNumber===profile.lineNumber&&actual.columnNumber===profile.columnNumber&&parent?.type==="function"&&parent.subtype===undefined&&parent.objectId!==undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description??""));return Object.freeze({functionPrototype:parent.objectId,constructorInvocationAuthorized:false,continuationAuthorized:false});
}
