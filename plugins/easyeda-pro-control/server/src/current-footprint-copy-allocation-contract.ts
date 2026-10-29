/** Separate pre-await allocation grammar. Existing native purposes do not mount
 * these commands or reserve their extra IDs. No write or execution token. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS, CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "./current-footprint-copy-create-bindings.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP = "easyeda-footprint-copy-allocation-v1";
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE = Object.freeze({ lineNumber: 109, columnNumber: 36_810,
  functionLine: 109, functionColumn: 36_619, createLine: 109, createColumn: 37_597, createCallColumn: 37_778 });
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE = `(${CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program})`;
const callIndex = CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE.indexOf("selected[0].call(manager,argument)");
const prefix = CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SOURCE.slice(0, callIndex).split("\n");
if (callIndex === -1) { throw new Error("FOOTPRINT_ALLOCATION_WRAPPER_SOURCE"); }
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SITE = Object.freeze({ functionLine: 0, functionColumn: 15,
  callLine: prefix.length - 1, callColumn: (prefix.at(-1)?.length ?? 0) + 12 });
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES = Object.freeze({ build: "[this,s,r,i,n]", create: "[this,s]",
  wrapper: "[this,bus,manager,consistency,constructors,methods,argument,selected,createArgumentJson,expectedProjectUuid]" });
/** Seven normal commands: one arm, three synchronous frame captures, wrapper
 * source, descriptor join and result properties. Three cleanup commands remove
 * the point, resume that pause and release its distinct group. Add10 to a future
 * integrated create/clock reservation, never reuse the old68-ID allowance. */
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_REQUESTS = Object.freeze({ normal: 7, cleanup: 3, total: 10,
  combinedCreateClockNormal: 57, combinedCreateClockCleanup: 21, combinedCreateClockTotal: 78,
  wrapperSourceBytes: 16_384, commandBytes: 16_384, replyBytes: 65_536, mounted: false });
const recheck = CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS.recheck.program;
export const CURRENT_FOOTPRINT_COPY_ALLOCATION_RELATION = `function(bus,manager,consistency,constructors,methods,build,create,wrapper){"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_ALLOCATION_RELATION");},records=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();records.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const object=(o,keys)=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype||Reflect.ownKeys(o).length!==keys.length)bad();for(const key of keys)own(o,key);};
if((${recheck}).call(this,bus,manager,consistency,constructors,methods)!==true)bad();
array(build,5);array(create,2);array(wrapper,10);array(own(wrapper,"7"),8);
for(const[index,value]of[[0,this],[1,bus],[2,manager],[3,consistency],[4,constructors],[5,methods]])if(own(wrapper,String(index))!==value)bad();
if(own(build,"0")!==manager||own(create,"0")!==manager||own(build,"3")!==false)bad();
const input=own(build,"1"),argument=own(build,"2"),destination=own(build,"4"),original=own(wrapper,"6"),json=own(wrapper,"8"),project=own(wrapper,"9");
object(input,["data"]);if(own(input,"data")!==argument||own(create,"1")!==argument||original!==argument||own(this,"uuid")!==project)bad();
if(typeof destination!=="string"||/^[a-f0-9]{16}$/.exec(destination)?.[0]!==destination||typeof json!=="string"||json.length>65536)bad();
const fields=["uuid","path","isProject","docType","title","display_title","description","custom_tags","source","version"];
object(argument,fields);const parsed=JSON.parse(json);object(parsed,fields);for(const field of fields)if(!Object.is(own(argument,field),own(parsed,field)))bad();
if(own(argument,"uuid")===destination||own(argument,"path")!==project||own(argument,"isProject")!==true||own(argument,"docType")!==4)bad();
for(let i=0;i<8;i++)if(own(own(wrapper,"7"),String(i))!==own(methods,String(i)))bad();
for(const[o,k,d]of records){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(d.value,n.value)||d.writable!==n.writable||d.enumerable!==n.enumerable||d.configurable!==n.configurable)bad();}
return[destination,json];}`;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP), silent: z.literal(true),
  returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
/* oxlint-disable unicorn/max-nested-calls -- Keep complete exact selector schemas at one closed protocol boundary. */
const grammar = z.union([
  z.object({ phase: z.literal("allocation-arm"), method: z.literal("Debugger.setBreakpoint"), sessionId: token, params: z.object({
    location: point, condition: z.literal("true") }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), sessionId: token, params: z.object({
    ...flags, callFrameId: token, expression: z.enum(Object.values(CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES)), includeCommandLineAPI: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-source"), method: z.literal("Debugger.getScriptSource"), sessionId: token,
    params: z.object({ scriptId: token }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-join"), method: z.literal("Runtime.callFunctionOn"), sessionId: token, params: z.object({
    ...flags, objectId: token, functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_ALLOCATION_RELATION),
    arguments: z.array(z.object({ objectId: token }).strict()).length(8), awaitPromise: z.literal(false), userGesture: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-properties"), method: z.literal("Runtime.getProperties"), sessionId: token, params: z.object({
    objectId: token, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-remove"), method: z.literal("Debugger.removeBreakpoint"), sessionId: token, params: z.object({ breakpointId: token }).strict() }).strict(),
  z.object({ phase: z.literal("allocation-resume"), method: z.literal("Debugger.resume"), sessionId: token, params: z.object({}).strict() }).strict(),
  z.object({ phase: z.literal("allocation-release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: token,
    params: z.object({ objectGroup: z.literal(CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP) }).strict() }).strict(),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintCopyAllocationCommand = Readonly<z.infer<typeof grammar>>;
export function validateCurrentFootprintCopyAllocationCommand(input: unknown): CurrentFootprintCopyAllocationCommand {
  const command = grammar.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.sessionId.length > 128 || Buffer.byteLength(JSON.stringify(command)) > CURRENT_FOOTPRINT_COPY_ALLOCATION_REQUESTS.commandBytes ||
    command.phase === "allocation-arm" && (command.params.location.lineNumber !== CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE.lineNumber ||
      command.params.location.columnNumber !== CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE.columnNumber)) { throw new Error("FOOTPRINT_ALLOCATION_PROTOCOL"); }
  return freezeDeep(command);
}
const frame = z.looseObject({ callFrameId: token, functionName: z.string().max(256), location: point, functionLocation: point });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([token]), callFrames: z.array(frame).min(3).max(32) });
export function decodeCurrentFootprintCopyAllocationPause(input: unknown, scriptId: string, breakpointId: string): Readonly<{
  buildFrameId: string; createFrameId: string; wrapperFrameId: string; wrapperScriptId: string;
}> {
  const value = pause.parse(captureCurrentPcbStringClockReply(input).value), [build, create, wrapper] = value.callFrames;
  const native = CURRENT_FOOTPRINT_COPY_ALLOCATION_WRAPPER_SITE, site = CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE;
  if (build === undefined || create === undefined || wrapper === undefined || value.hitBreakpoints[0] !== breakpointId ||
    build.functionName !== "buildString" || build.functionLocation.scriptId !== scriptId || build.functionLocation.lineNumber !== site.functionLine ||
    build.functionLocation.columnNumber !== site.functionColumn || build.location.scriptId !== scriptId || build.location.lineNumber !== site.lineNumber || build.location.columnNumber !== site.columnNumber ||
    create.functionName !== "create" || create.functionLocation.scriptId !== scriptId || create.functionLocation.lineNumber !== site.createLine || create.functionLocation.columnNumber !== site.createColumn ||
    create.location.scriptId !== scriptId || create.location.lineNumber !== site.createLine || create.location.columnNumber !== site.createCallColumn ||
    wrapper.functionName !== "" || wrapper.location.scriptId === scriptId || wrapper.functionLocation.scriptId !== wrapper.location.scriptId ||
    wrapper.functionLocation.lineNumber !== native.functionLine || wrapper.functionLocation.columnNumber !== native.functionColumn ||
    wrapper.location.lineNumber !== native.callLine || wrapper.location.columnNumber !== native.callColumn) { throw new Error("FOOTPRINT_ALLOCATION_PAUSE"); }
  return Object.freeze({ buildFrameId: build.callFrameId, createFrameId: create.callFrameId, wrapperFrameId: wrapper.callFrameId, wrapperScriptId: wrapper.location.scriptId });
}
