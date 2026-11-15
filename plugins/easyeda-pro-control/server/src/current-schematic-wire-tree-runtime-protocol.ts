/** Separate finite tree entry/returns/no-argument helper vocabulary. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_FRAMES as F,CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_PROGRAMS as P}from"./current-schematic-wire-tree-runtime-programs.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS as K,currentSchematicWireTreeRuntimePoints as points}from"./current-schematic-wire-tree-runtime-source.ts";
// Nine actual pauses, one of two target returns, ten allocated controls.
// Nine comparisons + four retain calls + one final join = fourteen sources.
// 307 reader requests include 64 passes of four original Promise metadata.
export const CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_REQUESTS=Object.freeze({ordinary:307,sources:14,normal:340,cleanup:10,pauseCount:9,pointCount:10,pollPasses:64}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const rows=Object.entries(P).map(([role,program])=>{let refs=12;if(role==="retain"){refs=0;}else if(role.startsWith("join")){refs=19;}return{role,program,refs,byValue:role!=="retain"};});
const calls=rows.map(row=>z.strictObject({phase:z.literal("wire-tree-runtime-call"),role:z.literal(row.role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=([0,1]as const).flatMap(variant=>Object.entries(F[variant]).map(([role,expression])=>z.strictObject({phase:z.literal("wire-tree-runtime-frame"),variant:z.literal(variant),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})})));
const arms=([0,1]as const).flatMap(variant=>(["objectContent","pageContent"]as const).flatMap(tree=>K.map(point=>{const p=points(variant,tree)[point];const location=z.strictObject({scriptId:handle,lineNumber:z.literal(p.lineNumber),columnNumber:z.literal(p.columnNumber)});const params=z.strictObject({location});return z.strictObject({phase:z.literal("wire-tree-runtime-arm"),variant:z.literal(variant),tree:z.literal(tree),point:z.literal(point),method:z.literal("Debugger.setBreakpoint"),params});})));
const properties=z.strictObject({phase:z.literal("wire-tree-runtime-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const source=z.strictObject({phase:z.literal("wire-tree-runtime-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
const resume=z.strictObject({phase:z.literal("wire-tree-runtime-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})});
const remove=z.strictObject({phase:z.literal("wire-tree-runtime-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})});
const schema=z.union([...calls,...frames,...arms,properties,source,resume,remove]);
export type CurrentSchematicWireTreeRuntimeCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireTreeRuntimeCommand(input:unknown):CurrentSchematicWireTreeRuntimeCommand{return freezeDeep(schema.parse(capture(input).value));}
