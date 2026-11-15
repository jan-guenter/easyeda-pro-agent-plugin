/** Fixed actual helper-scope Array receipt. Supplied Inspector observations alone
 * do not establish the native owner or continuous global qualification. */
import{z}from"zod";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_SOURCE as SOURCE,decodeCurrentSchematicWireServiceFunction as service}from"./current-schematic-wire-service-source.ts";
import{currentSchematicRelevanceRawHandle as object}from"./current-schematic-relevance-action-raw-replies.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_FT_REQUESTS as LIMIT,currentSchematicWireTitleFtCall as call,validateCurrentSchematicWireTitleFtCommand as validate}from"./current-schematic-wire-title-ft-protocol.ts";
import type{CurrentSchematicWireTitleFtCommand as Command}from"./current-schematic-wire-title-ft-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const scope=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.string().optional(),description:z.string().optional(),objectId:handle});
const scopeField=z.strictObject({name:z.string(),value:scope,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const scopes=z.strictObject({result:z.array(scopeField).min(1).max(LIMIT.scopeLimit),internalProperties:z.array(z.never()).length(0).optional()});
const selected=z.strictObject({result:z.object({type:z.enum(["undefined","object"]),objectId:handle.optional(),subtype:z.string().optional(),description:z.string().optional(),className:z.string().optional()})});
const remote=z.object({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const field=z.strictObject({name:z.string(),value:remote.optional(),get:remote.optional(),set:remote.optional(),symbol:remote.optional(),writable:z.boolean().optional(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});
const intern=z.strictObject({name:z.string(),value:remote});
const metadata=z.strictObject({result:z.array(field).min(2).max(9),internalProperties:z.array(intern).length(2)});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_TITLE_FT_PREFLIGHT");}}
function native(input:unknown,raw:unknown,constructor:boolean):void{
 const name=constructor?"Array":"isArray";
 z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal(`function ${name}() { [native code] }`),objectId:handle}).parse(raw);
 const data=metadata.parse(input),fields=new Map(data.result.map(row=>[row.name,row]));
 need(fields.size===data.result.length);const allowed=constructor?new Set(["length","name","prototype","isArray","from","of","fromAsync","Symbol(Symbol.species)"]):new Set(["length","name"]);
 for(const key of fields.keys()){need(allowed.has(key));}
 for(const[key,value]of[["length",1],["name",name]]as const){const row=fields.get(key);need(row!==undefined&&row.writable===false&&row.configurable&&!row.enumerable&&row.get===undefined&&row.set===undefined&&row.symbol===undefined&&row.value?.type===(key==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined);}
 if(constructor){const row=fields.get("prototype");need(row!==undefined&&row.writable===false&&!row.enumerable&&!row.configurable&&row.value?.objectId!==undefined&&row.value.type==="object"&&row.value.subtype==="array"&&row.value.className==="Array");need(fields.has("isArray"));}
 else{need(fields.size===2);}
 const parts=new Map(data.internalProperties.map(row=>[row.name,row.value]));need(parts.size===2);
 z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function () { [native code] }"),objectId:handle}).parse(parts.get("[[Prototype]]"));
 z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scopeList"),className:z.literal("Array"),description:z.literal("Scopes[0]"),objectId:handle}).parse(parts.get("[[Scopes]]"));
}
function props(objectId:string):Command{return validate({phase:"wire-title-ft-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
/** Every physical send and generated source read remains owned by the original
 * title driver. This generator has no caller registration or authority map. */
export function* currentSchematicWireTitleFtArrayPreflight(variant:0|1,scriptId:string,nativePacket:string,helpers:string):Generator<Command,string,unknown>{
 const bundle=array(yield props(helpers),12),raw=bundle.get("0");const fn=object(raw,"function");
 const actual=service(yield props(fn),raw,variant,"helper00",scriptId);need(SOURCE[variant].rows.helper00.binding==="ft");
 const list=scopes.parse(yield props(actual.scopes));let found:string|null=null;
 for(const[index,row]of list.result.entries()){
  need(row.name===String(index));const candidate=selected.parse(yield call("scopeArray",row.value.objectId,[nativePacket])).result;
  if(candidate.type==="undefined"){need(candidate.objectId===undefined);}else{
   need(found===null&&candidate.objectId!==undefined);found=tuple({result:candidate},5);
   const captured=array(yield props(found),5),ctor=captured.get("2"),predicate=captured.get("3");
   native(yield props(object(ctor,"function")),ctor,true);native(yield props(object(predicate,"function")),predicate,false);
  }
 }need(found!==null);return found;
}
