/** Descriptor-only transitive capture. No lazy bus getter, serializer, parser,
 * cache writer, buffered upload callback or notification producer is invoked. */
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_BINDING, CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES } from "./current-footprint-copy-backend-cache.ts";
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as PROFILES } from "./current-footprint-copy-dependency-profiles.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helper = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_DEPENDENCY_BINDING");},seen=[],parents=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const bindings=own(this,"object");
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{const p=Object.getPrototypeOf(object(o));parents.push([o,p]);return p;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const fun=(o,k)=>{const f=own(o,k);if(typeof f!=="function")bad();return f;};
const method=(c,k)=>{const p=own(c,"prototype"),d=descriptor(p,k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();return d.value;};
const classes=Object.create(null);
const bind=(name,c)=>{if(typeof c!=="function"||Object.hasOwn(classes,name))bad();const d=descriptor(bindings,name);if(d!==undefined&&(!Object.hasOwn(d,"value")||d.value!==c))bad();classes[name]=c;};
const classRef=name=>Object.hasOwn(classes,name)?classes[name]:fun(bindings,name);
const chain=(o,names)=>{const out=[];let p=proto(o);for(const name of names){const c=classRef(name);if(own(c,"prototype")!==p||own(p,"constructor")!==c)bad();out.push(p);p=proto(p);}if(p!==Object.prototype)bad();return out;};
const resolved=(o,levels,k,owner)=>{absent(o,k);for(let i=0;i<owner;i++)absent(levels[i],k);return own(levels[owner],k);};
array(constructors,11);array(lexicals,10);
for(const [index,name]of ["Tg","ar","Pi","ja","Vc","zy","Lg","Gd","JP","KP","Mb"].entries())bind(name,own(constructors,String(index)));
bind("of",proto(fun(bindings,"rl")));bind("th",proto(fun(bindings,"JR")));bind("Fo",proto(fun(bindings,"rN")));
const projectLevels=chain(project,["Lg","Gd"]),managerLevels=chain(manager,["Tg","ar","Pi"]),commonLevels=chain(consistency,["ja","Vc","zy"]);
chain(bus,["JP","KP","Mb"]);
if(own(globalThis,"PROJECT")!==project||own(project,"workerBus")!==bus||own(project,"footprint")!==manager||own(project,"consistencyManager")!==consistency||own(manager,"projectManager")!==project||own(manager,"user")!==undefined)bad();
for(let i=0;i<3;i++)if(own(constructors,String(i))!==own(managerLevels[i],"constructor")||own(constructors,String(i+3))!==own(commonLevels[i],"constructor"))bad();
for(const [key,index]of [["qe",2],["Qe",3],["Ke",4],["Ni",5],["cg",6]])if(own(bindings,key)!==own(lexicals,String(index)))bad();
const selected=[];`;
const selection = PROFILES.map(profile => {
  if (profile.kind === "method") {
    const [owner, name] = profile.key.split(".");
    return `selected.push(method(classRef(${JSON.stringify(owner)}),${JSON.stringify(name)}));`;
  }
  if (profile.kind === "class") { return `selected.push(classRef(${JSON.stringify(profile.key)}));`; }
  return `selected.push(fun(bindings,${JSON.stringify(profile.key)}));`;
}).join("\n");
const inheritance = PROFILES.filter(profile => profile.kind === "class").map(profile => {
  const parent = profile.parent === null ? "Function.prototype" : `classRef(${JSON.stringify(profile.parent)})`;
  const parentPrototype = profile.parent === null ? "Object.prototype" : `own(${parent},"prototype")`;
  return `if(proto(classRef(${JSON.stringify(profile.key)}))!==${parent}||proto(own(classRef(${JSON.stringify(profile.key)}),"prototype"))!==${parentPrototype})bad();`;
}).join("\n");
const runtimeMethods = PROFILES.filter(profile => profile.kind === "method" && /^(?:Gd|Lg|ja|zy|Vc)\./u.test(profile.key)).map(profile => {
  const [owner, name] = profile.key.split(".");
  const project = owner === "Gd" || owner === "Lg";
  const levels: Readonly<Record<string, number>> = { Lg: 0, Gd: 1, ja: 0, Vc: 1, zy: 2 };
  const level = levels[owner ?? ""];
  if (level === undefined) { throw new Error("FOOTPRINT_DEPENDENCY_PROFILE"); }
  return `if(resolved(${project ? "project,projectLevels" : "consistency,commonLevels"},${JSON.stringify(name)},${String(level)})!==method(classRef(${JSON.stringify(owner)}),${JSON.stringify(name)}))bad();`;
}).join("\n");
const notification = String.raw`
const top=descriptor(globalThis,"EDITOR_TOP");if(top!==undefined&&(!Object.hasOwn(top,"value")||top.value!==undefined&&top.value!==globalThis))bad();
absent(bindings,"self");
const tab=own(globalThis,"_TAB_ID_");if(typeof tab!=="string"||!/^[A-Za-z\d_-]{1,128}$/.test(tab))bad();
const notification=own(globalThis,"/"+tab+"/notify");if(own(project,"wsBus")!==notification)bad();
const notifyLevels=chain(notification,["JP","KP","Mb"]);
for(const [name,level]of [["rpcCall",2],["subscribeOnce",2],["push",1],["subscribe",1]])if(resolved(notification,notifyLevels,name,level)!==method(classRef(level===2?"Mb":"KP"),name))bad();
const uuid=own(notification,"uuid"),ticket=own(notification,"rpcTicket");
if(typeof uuid!=="string"||!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/.test(uuid)||!Number.isSafeInteger(ticket)||Object.is(ticket,-0)||ticket<0||ticket>=Number.MAX_SAFE_INTEGER)bad();
selected.push(notification,object(own(project,"cache")),object(own(project,"localCache")));
const verify=()=>{for(const [o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.writable!==n.writable||d.enumerable!==n.enumerable||d.configurable!==n.configurable||!Object.is(d.value,n.value)||d.get!==n.get||d.set!==n.set||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};`;
const body = `${helper}\n${selection}\n${inheritance}\n${runtimeMethods}\n${notification}\n${CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_BINDING}`;
/** Capture uses the original direct lexical bundle. Recheck keeps all seven original object associations explicit. */
export const CURRENT_FOOTPRINT_COPY_DEPENDENCY_CALLS = freezeDeep({
  capture: { program: `function(project,bus,manager,consistency,constructors,lexicals){${body}\nverify();return selected;}`, arguments: 6, returnByValue: false },
  recheck: { program: `function(project,bus,manager,consistency,constructors,lexicals,original){${body}\narray(original,${String(PROFILES.length + 9)});for(let i=0;i<selected.length;i++)if(own(original,String(i))!==selected[i])bad();verify();return true;}`, arguments: 7, returnByValue: true },
});
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().max(16_384).refine(value => value.isWellFormed());
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_DEPENDENCY_METADATA"); } }
export function decodeCurrentFootprintCopyDependencies(input: unknown): readonly string[] {
  const count = PROFILES.length + 9;
  const reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count + 1);
  const length = fields.get("length"); need(length?.value.type === "number" && length.value.value === count &&
    length.writable && !length.enumerable && !length.configurable && length.value.objectId === undefined);
  const ids = PROFILES.map((profile, index) => {
    const item = fields.get(String(index)), value = item?.value;
    need(item !== undefined && item.writable && item.configurable && item.enumerable && value?.type === "function" &&
      value.className === (profile.async ? "AsyncFunction" : "Function") && value.objectId !== undefined && value.value === undefined &&
      value.subtype === undefined && value.description !== undefined && Buffer.byteLength(value.description) === profile.bytes &&
      createHash("sha256").update(value.description).digest("hex") === profile.sha256); return value.objectId;
  });
  for (const index of [PROFILES.length, PROFILES.length + 1, PROFILES.length + 2]) {
    const item = fields.get(String(index)), value = item?.value;
    need(item !== undefined && item.writable && item.configurable && item.enumerable && value?.type === "object" &&
      value.objectId !== undefined && value.value === undefined && value.subtype === undefined &&
      value.className === (index === PROFILES.length ? "JP" : "bb"));
  }
  for (const index of [PROFILES.length + 3, PROFILES.length + 4]) {
    const item = fields.get(String(index)), value = item?.value;
    need(item !== undefined && item.writable && item.configurable && item.enumerable && value?.type === "object" &&
      value.className === "Cache" && value.objectId !== undefined && value.value === undefined && value.subtype === undefined);
  }
  for (const [offset, expected] of CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES.entries()) {
    const item = fields.get(String(PROFILES.length + 5 + offset)), value = item?.value;
    need(item !== undefined && item.writable && item.configurable && item.enumerable && value?.type === "function" &&
      value.className === "Function" && value.objectId !== undefined && value.value === undefined && value.subtype === undefined &&
      value.description === `function ${expected.name}() { [native code] }`);
  }
  const handles = [...fields.values()].filter(item => item.name !== "length").map(item => item.value.objectId);
  need(new Set(handles).size === count && !handles.includes(undefined));
  const parent = reply.internalProperties[0];
  need(new Set(ids).size === ids.length && parent?.name === "[[Prototype]]" && parent.value.type === "object" &&
    parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.description === "Array(0)" && parent.value.objectId !== undefined);
  return Object.freeze(ids);
}
export function decodeCurrentFootprintCopyDependencyFunction(input: unknown, scriptId: string, index: number): string {
  token.parse(scriptId); const expected = Number.isInteger(index) ? PROFILES[index] : undefined; need(expected !== undefined);
  const reply = z.object({ result: z.array(property).min(2).max(3), internalProperties: z.array(internal).length(3) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])), hasPrototype = expected.kind !== "method" && !expected.async;
  need(fields.size === (hasPrototype ? 3 : 2));
  for (const [name, expectedValue] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && item.configurable && !item.enumerable &&
      item.value.type === (name === "name" ? "string" : "number") && item.value.value === expectedValue && !Object.is(item.value.value, -0) &&
      item.value.objectId === undefined && item.value.subtype === undefined && item.value.className === undefined);
  }
  if (hasPrototype) {
    const item = fields.get("prototype"); need(item !== undefined && item.writable === (expected.kind !== "class") && !item.enumerable && !item.configurable &&
      item.value.type === "object" && item.value.objectId !== undefined && item.value.value === undefined);
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]");
  const point = location?.value, scopes = internals.get("[[Scopes]]");
  need(internals.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    point !== null && typeof point === "object" && point.scriptId === scriptId && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber &&
    parent?.type === (expected.async ? "object" : "function") && parent.objectId !== undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined &&
    /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")); return scopes.objectId;
}

export function decodeCurrentFootprintCopyDependencyNativeFunctions(input: unknown): readonly string[] {
  decodeCurrentFootprintCopyDependencies(input);
  const reply = z.object({ result: z.array(property), internalProperties: z.array(internal) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  return Object.freeze(CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES.map((_, index) => {
    const id = reply.result.find(item => item.name === String(PROFILES.length + 5 + index))?.value.objectId;
    need(id !== undefined); return id;
  }));
}
