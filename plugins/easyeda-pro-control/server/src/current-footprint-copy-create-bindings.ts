/** Original create-path method capture only. No method in this bundle is
 * invoked, and lexical source routing, clocks and upload effects stay unbound. */
import { z } from "zod";
import { assertCurrentFootprintCopyCreateSourceSpan } from "./current-footprint-copy-create-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES = freezeDeep([
  { role: "create", name: "create", arity: 1, async: true, lineNumber: 109, columnNumber: 37_597 },
  { role: "buildString", name: "buildString", arity: 1, async: true, lineNumber: 109, columnNumber: 36_619 },
  { role: "canvasString", name: "canvasString", arity: 3, async: true, lineNumber: 109, columnNumber: 42_124 },
  { role: "getCanvasData", name: "getCanvasData", arity: 6, async: true, lineNumber: 109, columnNumber: 42_528 },
  { role: "get", name: "get", arity: 1, async: false, lineNumber: 109, columnNumber: 33_452 },
  { role: "uploadLocal", name: "uploadLocal", arity: 1, async: true, lineNumber: 110, columnNumber: 17_009 },
  { role: "setDoctype", name: "setDoctype", arity: 2, async: false, lineNumber: 9, columnNumber: 9082 },
  { role: "newTicket", name: "get newTicket", arity: 0, async: false, lineNumber: 109, columnNumber: 9210 },
] as const);
const helpers = `"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_CREATE_BINDING");};
const descriptors=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{object(o);const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const array=(o,count)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==count||Reflect.ownKeys(o).length!==count+1)bad();for(let i=0;i<count;i++)if(typeof own(o,String(i))!=="function")bad();return o;};
const chain=(o,names,original,offset)=>{const result=[];let p=proto(o);for(let i=0;i<names.length;i++){const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==names[i]||own(c,"prototype")!==p||original!==null&&own(original,String(offset+i))!==c)bad();result.push(p);p=proto(p);}if(p!==Object.prototype)bad();return result;};
const method=(o,parents,k,index)=>{absent(o,k);for(let i=0;i<index;i++)absent(parents[i],k);const d=descriptor(parents[index],k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();return d.value;};
const verify=()=>{for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.enumerable!==n.enumerable||d.configurable!==n.configurable||d.writable!==n.writable||d.get!==n.get||d.set!==n.set||!Object.is(d.value,n.value)||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==bus||own(this,"footprint")!==manager||own(this,"consistencyManager")!==consistency||own(manager,"projectManager")!==this||own(manager,"user")!==undefined)bad();
array(constructors,11);
const footprint=chain(manager,["Tg","ar","Pi"],constructors,0),common=chain(consistency,["ja","Vc","zy"],constructors,3),project=chain(this,["Lg","Gd"],constructors,6);
chain(bus,["JP","KP","Mb"],constructors,8);
const selected=["create","buildString","canvasString","getCanvasData","get"].map(name=>method(manager,footprint,name,0));
selected.push(method(this,project,"uploadLocal",1),method(consistency,common,"setDoctype",0));
absent(manager,"newTicket");absent(footprint[0],"newTicket");absent(footprint[1],"newTicket");
const ticket=descriptor(footprint[2],"newTicket");if(!ticket||typeof ticket.get!=="function"||ticket.set!==undefined||Object.hasOwn(ticket,"value")||ticket.enumerable!==false||ticket.configurable!==true)bad();
selected.push(ticket.get);`;

/** The enclosing native owner supplies the already retained original handles.
 * Neither a JSON clone nor decoded IDs alone can become that owner. */
export const CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS = freezeDeep({
  capture: { program: `function(bus,manager,consistency,constructors){${helpers}\nverify();return selected;}`, arguments: 4, returnByValue: false },
  recheck: { program: `function(bus,manager,consistency,constructors,methods){${helpers}\narray(methods,8);for(let i=0;i<8;i++)if(own(methods,String(i))!==selected[i])bad();verify();return true;}`, arguments: 5, returnByValue: true },
});
/** Dormant fixed writer only. The enclosing original owner must consume and
 * journal the sole dispatch after full destination/backend/clock qualification.
 * No existing preparation transport admits this side-effecting command. */
export const CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL = freezeDeep({
  program: `async function(bus,manager,consistency,constructors,methods,expectedProjectUuid,argument){${helpers}
array(methods,8);for(let i=0;i<8;i++)if(own(methods,String(i))!==selected[i])bad();
const identifier=(value,re)=>{const match=typeof value==="string"?re.exec(value):null;if(match===null||match[0]!==value)bad();return value;};
identifier(expectedProjectUuid,/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/);if(own(this,"uuid")!==expectedProjectUuid)bad();
if(argument===null||typeof argument!=="object"||proto(argument)!==Object.prototype)bad();
const fields=["uuid","path","isProject","docType","title","display_title","description","custom_tags","source","version"];
if(Reflect.ownKeys(argument).length!==fields.length)bad();for(const key of fields)own(argument,key);
identifier(argument.uuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);if(argument.path!==expectedProjectUuid||argument.isProject!==true||argument.docType!==4||argument.source!==""||argument.version!=="")bad();
if(typeof argument.title!=="string"||argument.title.length<1||argument.title.length>512||argument.display_title!==argument.title||typeof argument.description!=="string"||argument.description.length>65536||typeof argument.custom_tags!=="string"||argument.custom_tags.length>65536)bad();
const tags=JSON.parse(argument.custom_tags);if(!Array.isArray(tags)||tags.length>256||tags.some(tag=>typeof tag!=="string"||tag.length>512)||JSON.stringify(tags)!==argument.custom_tags)bad();
const bytes=text=>{let count=0;for(let i=0;i<text.length;i++){const code=text.charCodeAt(i);if(code>=55296&&code<=56319){const low=text.charCodeAt(++i);if(!(low>=56320&&low<=57343))bad();count+=4;}else if(code>=56320&&code<=57343)bad();else count+=code<128?1:code<2048?2:3;}return count;};
bytes(argument.title);bytes(argument.description);for(const tag of tags)bytes(tag);if(bytes(JSON.stringify(argument))>65536)bad();verify();
const result=await selected[0].call(manager,argument);verify();
let nodes=0;const seen=new Set();
const data=(value,depth)=>{if(++nodes>4096||depth>8)bad();if(value===undefined||value===null||typeof value==="boolean")return value;if(typeof value==="string"){if(value.length>2097152)bad();bytes(value);return value;}if(typeof value==="number"){if(!Number.isFinite(value)||Object.is(value,-0))bad();return value;}if(typeof value!=="object"||seen.has(value))bad();seen.add(value);const isArray=Array.isArray(value),parent=Object.getPrototypeOf(value);if(isArray?parent!==Array.prototype:parent!==Object.prototype&&parent!==null)bad();const keys=Reflect.ownKeys(value);if(keys.length>(isArray?513:512))bad();const output=isArray?[]:Object.create(null);if(isArray){const length=Object.getOwnPropertyDescriptor(value,"length");if(!length||!Object.hasOwn(length,"value")||length.value>512||keys.length!==length.value+1)bad();for(let i=0;i<length.value;i++){const field=Object.getOwnPropertyDescriptor(value,String(i));if(!field||!Object.hasOwn(field,"value")||!field.enumerable)bad();output.push(data(field.value,depth+1));}}else for(const key of keys){if(typeof key!=="string")bad();bytes(key);const field=Object.getOwnPropertyDescriptor(value,key);if(!field||!Object.hasOwn(field,"value")||!field.enumerable)bad();output[key]=data(field.value,depth+1);}seen.delete(value);return output;};
const serialized=JSON.stringify(data(result,0));if(typeof serialized!=="string"||bytes(serialized)>2097152)bad();verify();return serialized;}`,
  arguments: 7, returnByValue: true, throwOnSideEffect: false, awaitPromise: true,
});
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function fail(): never { throw new Error("FOOTPRINT_COPY_CREATE_METHOD_METADATA"); }

export function decodeCurrentFootprintCopyCreateMethodArray(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(9), internalProperties: z.array(internal).length(1) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 9) { return fail(); }
    const length = values.get("length");
    if (length?.value.type !== "number" || length.value.value !== 8 || length.value.objectId !== undefined ||
        length.value.subtype !== undefined || length.value.className !== undefined || !length.writable || length.configurable || length.enumerable ||
        length.value.description !== undefined && length.value.description !== "8") { return fail(); }
    const ids = CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES.map((expected, index) => {
      const item = values.get(String(index)), value = item?.value;
      if (item === undefined || !item.writable || !item.configurable || !item.enumerable || value?.type !== "function" ||
          value.className !== (expected.async ? "AsyncFunction" : "Function") || value.objectId === undefined ||
          value.value !== undefined || value.subtype !== undefined || value.description === undefined) { return fail(); }
      assertCurrentFootprintCopyCreateSourceSpan("worker", expected.role, value.description); return value.objectId;
    });
    const parent = reply.internalProperties[0];
    if (new Set(ids).size !== 8 || parent?.name !== "[[Prototype]]" || parent.value.type !== "object" ||
        parent.value.subtype !== "array" || parent.value.className !== "Array" || parent.value.objectId === undefined ||
        parent.value.value !== undefined || parent.value.description !== "Array(0)") { return fail(); }
    return Object.freeze(ids);
  } catch { return fail(); }
}

/** The original pinned script ID and complete source admission are owner
 * duties. Scope IDs are returned for later lexical inspection, not accepted
 * as proof of ai, qe, Qe, cache factories or UI responder identity. */
export function decodeCurrentFootprintCopyCreateMethodProperties(input: unknown, scriptId: string, index: number): Readonly<{
  scopesId: string; sourceLocationVerified: true; lexicalDependenciesVerified: false; executionAuthorized: false;
}> {
  try {
    token.parse(scriptId);
    const expected = Number.isInteger(index) && !Object.is(index, -0) ? CURRENT_FOOTPRINT_COPY_CREATE_METHOD_PROFILES[index] : undefined;
    if (expected === undefined) { return fail(); }
    const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 2) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = values.get(name), value = name === "name" ? expected.name : expected.arity;
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "name" ? "string" : "number") || item.value.value !== value || Object.is(item.value.value, -0) ||
          item.value.objectId !== undefined || item.value.className !== undefined || item.value.subtype !== undefined ||
          item.value.description !== undefined && item.value.description !== String(value)) { return fail(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" ||
        location.objectId !== undefined || point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        parent?.type !== (expected.async ? "object" : "function") || parent.className !== (expected.async ? "AsyncFunction" : "Function") ||
        parent.objectId === undefined || parent.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return fail(); }
    return Object.freeze({ scopesId: scopes.objectId, sourceLocationVerified: true, lexicalDependenciesVerified: false, executionAuthorized: false });
  } catch { return fail(); }
}
