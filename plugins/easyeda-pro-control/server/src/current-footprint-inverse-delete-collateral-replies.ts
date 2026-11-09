/** Correlated static class metadata only; invoking a class or closing a tab
 * requires its separate original continuation. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_CLASSES as CLASSES } from "./current-footprint-inverse-delete-ui-source.ts";
import { currentFootprintInverseLookupProperties as properties } from "./current-footprint-inverse-lookup-preentry-replies.ts";

const internal=z.strictObject({name:z.string(),value:z.looseObject({type:z.string()})});
const internalReply=z.looseObject({internalProperties:z.array(internal).length(3)});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_DELETE_COLLATERAL_CLASS");}}
/** The tab class is a readonly data container with many original static fields.
 * Only its own constructor metadata and separately selected methods are used. */
export function qualifyCurrentFootprintInverseDeleteCollateralClass(input:unknown,scriptId:string):void{
 handle.parse(scriptId);const fields=properties(input),map=new Map(fields.map(row=>[row.name,row]));for(const[name,value]of[["name","tt"],["length",0]]as const){const row=map.get(name);need(row?.value?.type===(name==="name"?"string":"number")&&row.value.value===value&&row.get===undefined&&row.set===undefined&&row.writable===false&&!row.enumerable&&row.configurable);}
 const p=map.get("prototype");need(p?.value?.type==="object"&&p.value.subtype===undefined&&p.value.className==="Object"&&p.value.objectId!==undefined&&p.get===undefined&&p.set===undefined&&p.writable===false&&!p.enumerable&&!p.configurable);
 const internals=internalReply.parse(capture(input)).internalProperties;const at=internals.find(row=>row.name==="[[FunctionLocation]]")?.value;const point=z.looseObject({type:z.literal("object"),subtype:z.literal("internal#location"),value:z.strictObject({scriptId:handle,lineNumber:z.literal(CLASSES.tab.lineNumber),columnNumber:z.literal(CLASSES.tab.columnNumber)})}).parse(at);need(point.value.scriptId===scriptId);
 const parent=internals.find(row=>row.name==="[[Prototype]]")?.value,scopes=internals.find(row=>row.name==="[[Scopes]]")?.value;need(parent?.type==="function"&&parent["description"]==="function () { [native code] }"&&typeof parent["objectId"]==="string"&&scopes?.type==="object"&&scopes["subtype"]==="internal#scopeList"&&typeof scopes["objectId"]==="string");
}
/** String.prototype is the one boxed empty string, with an actual primitive
 * internal slot. This does not widen the general object metadata decoder. */
export function qualifyCurrentFootprintInverseDeleteCollateralStringPrototype(input:unknown):void{
 const primitive=z.strictObject({type:z.literal("string"),value:z.literal("")});
 const boxed=z.strictObject({name:z.literal("[[PrimitiveValue]]"),value:primitive});
 const parent=z.strictObject({name:z.literal("[[Prototype]]"),value:z.unknown()});
 const internals=z.tuple([parent,boxed]);
 const raw=z.strictObject({result:z.array(z.unknown()).max(512),internalProperties:internals}).parse(capture(input));
 properties({result:raw.result,internalProperties:[raw.internalProperties[0]]});
}
