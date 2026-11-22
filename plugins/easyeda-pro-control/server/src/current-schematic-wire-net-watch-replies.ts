/** Bounded metadata for only this original registration profile. */
 import {z} from "zod";
 import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
 import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";

 const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
 export const netWatchRemote=z.strictObject({type:z.enum(["object","function","undefined","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().max(16_384).optional(),objectId:handle.optional(),value:z.unknown().optional(),unserializableValue:z.string().optional()});
 const property=z.strictObject({name:z.string().max(256),value:netWatchRemote.optional(),get:netWatchRemote.optional(),set:netWatchRemote.optional(),writable:z.boolean().optional(),enumerable:z.boolean(),configurable:z.boolean(),isOwn:z.literal(true),symbol:netWatchRemote.optional()});
 const internal=z.strictObject({name:z.string().max(128),value:netWatchRemote});
 const metadata=z.strictObject({result:z.array(property).max(96),internalProperties:z.array(internal).max(3)});
 export type NetWatchRemote=z.infer<typeof netWatchRemote>;
 export function netWatchNeed(value:boolean):asserts value{if(!value){throw new Error("WIRE_NET_WATCH");}}
 export function netWatchResult(input:unknown):NetWatchRemote{return z.strictObject({result:netWatchRemote}).parse(capture(input).value).result;}
 export function netWatchObject(value:NetWatchRemote|undefined,type:"object"|"function"="object"):string{
  netWatchNeed(value?.type===type&&value.subtype!=="proxy"&&value.subtype!=="null"&&value.objectId!==undefined&&value.value===undefined);return value.objectId;
 }
 export function netWatchProperties(input:unknown):Readonly<{fields:ReadonlyMap<string,z.infer<typeof property>>;parent:NetWatchRemote}>{
  const data=metadata.parse(capture(input).value);netWatchNeed(data.internalProperties.length===1&&data.internalProperties[0]?.name==="[[Prototype]]");const fields=new Map(data.result.map(row=>[row.name,row]));netWatchNeed(fields.size===data.result.length);const parent=data.internalProperties[0].value;netWatchObject(parent);return Object.freeze({fields,parent});
 }
 export function netWatchArrayCapture(input:unknown,n:number):string{
  const value=netWatchResult(input);netWatchNeed(value.type==="object"&&value.subtype==="array"&&value.className==="Array"&&value.description===`Array(${String(n)})`);return netWatchObject(value);
 }
 export function netWatchArray(input:unknown,n:number):ReadonlyMap<string,NetWatchRemote>{
  const data=netWatchProperties(input);const length=data.fields.get("length");netWatchNeed(data.fields.size===n+1&&length?.value?.type==="number"&&length.value.value===n&&length.writable===true&&!length.configurable&&!length.enumerable);
  const values=new Map<string,NetWatchRemote>();for(let i=0;i<n;i+=1){const key=String(i);const row=data.fields.get(key);netWatchNeed(row?.value!==undefined&&row.writable===true&&row.configurable&&row.enumerable&&row.get===undefined&&row.set===undefined);values.set(key,row.value);}return values;
 }
 export function netWatchTrue(input:unknown):void{z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(capture(input).value);}
 export function netWatchNative(input:unknown,actual:NetWatchRemote,index:number):void{
  const rows=[["get",2],["defineProperty",3],["Set",0],["push",1],["add",1],["values",0],["Symbol",0]]as const;const expected=rows[index];netWatchNeed(expected!==undefined&&actual.type==="function"&&actual.subtype===undefined&&actual.className==="Function"&&actual.description===`function ${expected[0]}() { [native code] }`);
  if(index!==2&&index!==6){decodeCurrentNativeFunctionMetadata(input,{name:expected[0],arity:expected[1],constructor:false});return;}
  const data=metadata.parse(capture(input).value);const fields=new Map(data.result.map(row=>[row.name,row]));netWatchNeed(fields.size===data.result.length&&data.internalProperties.length===2);
  if(index===6){const name=fields.get("name");const length=fields.get("length");const iterator=fields.get("iterator");const parent=data.internalProperties.find(row=>row.name==="[[Prototype]]")?.value;const scopes=data.internalProperties.find(row=>row.name==="[[Scopes]]")?.value;netWatchNeed(name?.value?.value==="Symbol"&&length?.value?.value===0&&iterator?.value?.type==="symbol"&&iterator.value.description==="Symbol(Symbol.iterator)"&&iterator.writable===false&&!iterator.configurable&&!iterator.enumerable&&parent?.type==="function"&&parent.description==="function () { [native code] }"&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.description==="Scopes[0]");return;}
  netWatchNeed(fields.size===4);
  for(const[name,value]of[["name","Set"],["length",0]]as const){const row=fields.get(name);netWatchNeed(row?.value?.value===value&&row.value.type===(name==="name"?"string":"number")&&row.writable===false&&row.configurable&&!row.enumerable);}
  const prototype=fields.get("prototype");const species=fields.get("Symbol(Symbol.species)");netWatchNeed(prototype?.value?.type==="object"&&prototype.value.className==="Set"&&prototype.value.description==="Set"&&prototype.writable===false&&!prototype.configurable&&!prototype.enumerable&&species?.value?.type==="function"&&species.value.description==="function Set() { [native code] }"&&species.symbol?.type==="symbol"&&species.symbol.description==="Symbol(Symbol.species)"&&species.configurable&&!species.enumerable&&species.writable===false&&species.get===undefined&&species.set===undefined);
  const parts=new Map(data.internalProperties.map(row=>[row.name,row.value]));const parent=parts.get("[[Prototype]]");const scopes=parts.get("[[Scopes]]");netWatchNeed(parts.size===2&&parent?.type==="function"&&parent.description==="function () { [native code] }"&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.description==="Scopes[0]");
 }
