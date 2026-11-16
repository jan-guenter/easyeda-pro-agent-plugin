/** Finite source-only title component vocabulary and joint reservation. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_SCHEMATIC_WIRE_TITLE_BINDINGS as B,CURRENT_SCHEMATIC_WIRE_TITLE_FRAMES as F,CURRENT_SCHEMATIC_WIRE_TITLE_PROGRAMS as P}from"./current-schematic-wire-title-programs.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as RPC}from"./current-schematic-wire-classic-rpc-source.ts";

export const CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS=Object.freeze({scopeLimit:8,preflight:342,preflightSources:312,runtime:42,runtimeSources:8,cleanup:5,pauseCount:5,aggregateNormal:2677,aggregateCleanup:66}as const);
export const CURRENT_SCHEMATIC_WIRE_TITLE_KINDS=Object.freeze(["entry","normalized","schematic","flat","returned"]as const);
export type CurrentSchematicWireTitleKind=typeof CURRENT_SCHEMATIC_WIRE_TITLE_KINDS[number];
export function currentSchematicWireTitlePoints(variant:0|1):Readonly<Record<CurrentSchematicWireTitleKind,number>>{const base=variant===0?41_923:238_441;return Object.freeze({entry:base,normalized:base+47,schematic:base+246,flat:base+393,returned:base+1059});}
export const CURRENT_SCHEMATIC_WIRE_TITLE_CALLS=freezeDeep({
 ...Object.fromEntries(Object.entries(B).map(([role,program])=>[role,{program,refs:1,byValue:false}])),
 seed:{program:P.seed,refs:6,byValue:false},bundle:{program:P.bundle,refs:13,byValue:false},before:{program:P.before,refs:10,byValue:false},
 query:{program:P.query,refs:7,byValue:true},entry:{program:P.entry,refs:8,byValue:false},
 step:{program:P.step,refs:8,byValue:true},branch:{program:P.branch,refs:8,byValue:true},returned:{program:P.returned,refs:8,byValue:true},join:{program:P.join,refs:11,byValue:true},
 same:{program:P.same,refs:2,byValue:true},retain:{program:P.retain,refs:0,byValue:false},
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const reference=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_TITLE_CALLS).map(([role,row])=>z.strictObject({phase:z.literal("wire-title-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const properties=z.strictObject({phase:z.literal("wire-title-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const frames=Object.entries(F).map(([role,expression])=>z.strictObject({phase:z.literal("wire-title-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const arms=([0,1]as const).flatMap(variant=>CURRENT_SCHEMATIC_WIRE_TITLE_KINDS.map(point=>{
 const lineNumber=z.literal(RPC[variant].rows.titleQuery.lineNumber);const columnNumber=z.literal(currentSchematicWireTitlePoints(variant)[point]);
 const location=z.strictObject({scriptId:handle,lineNumber,columnNumber});
 return z.strictObject({phase:z.literal("wire-title-arm"),variant:z.literal(variant),point:z.literal(point),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location})});
}));
const source=z.strictObject({phase:z.literal("wire-title-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
const resume=z.strictObject({phase:z.literal("wire-title-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})});
const remove=z.strictObject({phase:z.literal("wire-title-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})});
const schema=z.union([...calls,properties,...frames,...arms,source,resume,remove]);
export type CurrentSchematicWireTitleCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireTitleCommand(input:unknown):CurrentSchematicWireTitleCommand{return freezeDeep(schema.parse(capture(input).value));}
