/** Full original callback metadata only. The enclosing factory must retain
 * the actual task/handler/scope replies and the same original worker. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS as FUNCTIONS, qualifyCurrentFootprintInverseDeleteRpcSource } from "./current-footprint-inverse-delete-rpc-source.ts";
import type { CurrentFootprintInverseDeleteRpcRole } from "./current-footprint-inverse-delete-rpc-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),text=z.string().max(8192);const remote=z.strictObject({type:z.enum(["function","object","number","string"]),subtype:text.optional(),className:text.optional(),description:text.optional(),objectId:handle.optional(),value:z.unknown().optional()});const property=z.strictObject({name:text,value:remote,writable:z.boolean(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});const internal=z.strictObject({name:text,value:remote});
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_DELETE_RPC_METADATA");}}
export function currentFootprintInverseDeleteRpcCallable(input:unknown,role:CurrentFootprintInverseDeleteRpcRole):string{const row=FUNCTIONS[role];const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:text,objectId:handle})}).parse(capture(input)).result;need(Buffer.byteLength(value.description)===row.bytes&&createHash("sha256").update(value.description).digest("hex")===row.sha256);return value.objectId;}
export function qualifyCurrentFootprintInverseDeleteRpcFunction(input:unknown,role:CurrentFootprintInverseDeleteRpcRole,scriptId:string,source:string):string{qualifyCurrentFootprintInverseDeleteRpcSource(source);handle.parse(scriptId);const row=FUNCTIONS[role];const value=z.strictObject({result:z.array(property).length(2),internalProperties:z.array(internal).length(3)}).parse(capture(input));const fields=new Map(value.result.map(field=>[field.name,field]));need(fields.size===2);for(const[name,expected]of[["name",row.name],["length",row.arity]]as const){const field=fields.get(name);need(field!==undefined&&!field.writable&&!field.enumerable&&field.configurable&&field.value.type===(name==="name"?"string":"number")&&field.value.value===expected&&field.value.objectId===undefined&&field.value.subtype===undefined&&field.value.className===undefined&&!Object.is(field.value.value,-0));}const internals=new Map(value.internalProperties.map(field=>[field.name,field.value]));need(internals.size===3);const at=internals.get("[[FunctionLocation]]"),parent=internals.get("[[Prototype]]"),scopes=internals.get("[[Scopes]]");const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.columnNumber)}).parse(at?.value);need(at?.type==="object"&&at.subtype==="internal#location"&&at.objectId===undefined&&location.scriptId===scriptId&&parent?.type==="function"&&parent.className==="Function"&&parent.description==="function () { [native code] }"&&parent.objectId!==undefined&&parent.value===undefined&&parent.subtype===undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&scopes.value===undefined&&(role==="service"?/^Scopes\[[45]\]$/u:/^Scopes\[[34]\]$/u).test(scopes.description??""));return scopes.objectId;}

/** Select only the callback's own lexical closure. The CJS factory and outer
 * classic-IIFE scopes are checked by label only; Script/Global are never read. */
export function currentFootprintInverseDeleteRpcScope(input: unknown, role: CurrentFootprintInverseDeleteRpcRole): string {
 const expected = role === "service" ? ["Closure (rpcService)", "Closure", "Closure"] : ["Closure (EP)", "Closure"];
 const value = z.strictObject({ result: z.array(property).min(expected.length + 1).max(expected.length + 2) }).parse(capture(input));
 const tail = value.result.length === expected.length + 2 ? [...expected, "Script", "Global"] : [...expected, "Global"];
 const ids = new Set<string>();
 for (const [index, field] of value.result.entries()) {
  const item = field.value;
  need(field.name === String(index) && field.writable && field.configurable && field.enumerable && item.type === "object" && item.subtype === "internal#scope" && item.className === "Object" && item.description === tail[index] && item.objectId !== undefined && item.value === undefined && !ids.has(item.objectId));
  ids.add(item.objectId);
 }
 return value.result[0]?.value.objectId ?? (() => { throw new Error("FOOTPRINT_INVERSE_DELETE_RPC_METADATA"); })();
}
