/** Closed read-only three-version worker vocabulary. No controls or application calls. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FRAME as FRAME, CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_PROGRAMS as P } from "./current-schematic-wire-worker-pending-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-wire-worker-pending-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_REQUESTS = Object.freeze({ approvedSlots: 128, metadata: 128, before: 137, after: 135, helperSources: 13, cleanup: 1, total: 286 } as const);
export const CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_CALLS = freezeDeep({ approved: { program: P.approved, refs: 129, byValue: false }, map: { program: P.map, refs: 1, byValue: false }, tables: { program: P.tables, refs: 4, byValue: false }, before: { program: P.before, refs: 3, byValue: false }, values: { program: P.values, refs: 1, byValue: true }, after: { program: P.after, refs: 4, byValue: true } } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const ref = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_CALLS).map(([role,row]) => z.strictObject({ phase: z.literal("wire-worker-pending-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(ref).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frameParams=z.strictObject({...flags,callFrameId:handle,expression:z.literal(FRAME),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)});
const propertyParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const releaseParams=z.strictObject({objectGroup:flags.objectGroup});
const schema=z.union([...calls,
 z.strictObject({phase:z.literal("wire-worker-pending-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:frameParams}),
 z.strictObject({phase:z.literal("wire-worker-pending-properties"),method:z.literal("Runtime.getProperties"),params:propertyParams}),
 z.strictObject({phase:z.literal("wire-worker-pending-release"),method:z.literal("Runtime.releaseObjectGroup"),params:releaseParams}),
]);
export type CurrentSchematicWireWorkerPendingCommand = z.infer<typeof schema>;
export function validateCurrentSchematicWireWorkerPendingCommand(input: unknown): CurrentSchematicWireWorkerPendingCommand { return freezeDeep(schema.parse(capture(input).value)); }
export function currentSchematicWireWorkerPendingCases(): readonly CurrentSchematicWireWorkerPendingCommand[] { return freezeDeep([
 ...Object.entries(CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_CALLS).map(([role,row]) => ({ phase: "wire-worker-pending-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({length:row.refs},()=>({objectId:"original_ref"})), returnByValue:row.byValue, awaitPromise:false,userGesture:false } })),
 {phase:"wire-worker-pending-frame",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS,callFrameId:"original_frame",expression:FRAME,returnByValue:false,includeCommandLineAPI:false}},
 {phase:"wire-worker-pending-properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},
 {phase:"wire-worker-pending-release",method:"Runtime.releaseObjectGroup",params:{objectGroup:CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_FLAGS.objectGroup}},
 ].map(row=>validateCurrentSchematicWireWorkerPendingCommand(row))); }

/** Substitute only original opaque handles; all program bytes stay fixed. */
export function currentSchematicWireWorkerPendingTemplate(input:unknown):Readonly<{phase:string;method:string;fields:Readonly<Record<string,"handle">>;values:Readonly<Record<string,string>>;template:string}>{
 const command=validateCurrentSchematicWireWorkerPendingCommand(input);const fields:Record<string,"handle">={};const values:Record<string,string>={};
 const field=(name:string,value:string):string=>{fields[name]="handle";values[name]=value;return `__wireworkerpending_${name}__`;};
 const params:Record<string,unknown>={...command.params};let phase:string=command.phase;
 if(command.phase==="wire-worker-pending-call"){phase+=`-${command.role}`;params["objectId"]=field("objectId",command.params.objectId);params["arguments"]=command.params.arguments.map((arg,index)=>({objectId:field(`arg${String(index)}`,arg.objectId)}));}
 else if(command.phase==="wire-worker-pending-frame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.phase==="wire-worker-pending-properties"){params["objectId"]=field("objectId",command.params.objectId);}
 return freezeDeep({phase,method:command.method,fields,values,template:JSON.stringify({method:command.method,params})});
}
