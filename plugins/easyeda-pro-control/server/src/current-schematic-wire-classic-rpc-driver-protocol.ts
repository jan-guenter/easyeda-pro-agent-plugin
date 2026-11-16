/** Fixed controls for the complete three-request C-side RPC observer.
 * The separately owned UI/local service routes remain required. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicWireClassicRpcSourceRow as sourceRow } from "./current-schematic-wire-classic-rpc-source.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_REQUESTS as READER } from "./current-schematic-wire-classic-rpc-shared-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_ORIGIN_PROGRAMS as PROGRAMS } from "./current-schematic-wire-classic-rpc-origin.ts";

export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS = freezeDeep([
 ["entry","MessageBus_rpcCall","entry"],["request","MessageBus_rpcCall_child0","publishing"],
 ["timer","MessageBus_rpcCall_child2","returned"],["returned","MessageBus_rpcCall","returned"],
 ["reply","MessageBus_rpcCall_child1","entry"],["replyReturned","MessageBus_rpcCall_child1","returned"],
] as const);
export type CurrentSchematicWireClassicRpcDriverPoint = typeof CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS[number][0];
export function currentSchematicWireClassicRpcDriverLocation(kind:CurrentSchematicWireClassicRpcDriverPoint):Readonly<{lineNumber:number;columnNumber:number}>{
 const descriptor=CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS.find(row=>row[0]===kind);
 if(descriptor===undefined){throw new Error("WIRE_RPC_DRIVER_POINT");}
 const point=sourceRow(2,descriptor[1]).points[descriptor[2]];
 if(point===undefined){throw new Error("WIRE_RPC_DRIVER_POINT");}
 return Object.freeze({lineNumber:point.lineNumber,columnNumber:point.columnNumber});
}
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_REQUESTS = Object.freeze({
 normal: READER.normal + 6 + 18 + 3 * (4 + 1) + 2, cleanup: 6 + READER.cleanup,
 total: READER.total + 6 + 18 + 3 * (4 + 1) + 2 + 6,
 breakpointCount:6,pauseCount:18,resumeCount:18,originPerRole:4,originSources:3,join:2,
} as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const object=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const variants=z.literal(2);
const point=z.enum(["entry","request","timer","returned","reply","replyReturned"]);
const originFrames=Object.entries(FRAMES).map(([role,expression])=>z.strictObject({
 phase:z.literal("wire-rpc-driver-origin-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),
 params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)}),
}));
const originCalls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({
 phase:z.literal("wire-rpc-driver-origin-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),
 params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(object).length(role==="join"?6:3),
 returnByValue:z.literal(role==="join"),awaitPromise:z.literal(false),userGesture:z.literal(false)}),
}));
const schema=z.union([...originFrames,...originCalls,
 z.strictObject({phase:z.literal("wire-rpc-driver-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("wire-rpc-driver-arm"),point,variant:variants,method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location})}),
 z.strictObject({phase:z.literal("wire-rpc-driver-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("wire-rpc-driver-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
]);
export type CurrentSchematicWireClassicRpcDriverControl=z.infer<typeof schema>;
export function validateCurrentSchematicWireClassicRpcDriverControl(input:unknown):CurrentSchematicWireClassicRpcDriverControl{
 const command=schema.parse(capture(input).value);
 if(command.phase==="wire-rpc-driver-arm"){
  const row=CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_DRIVER_POINTS.find(item=>item[0]===command.point);if(row===undefined||Object.is(command.variant,-0)){throw new Error("WIRE_RPC_DRIVER_POINT");}
  const expected=currentSchematicWireClassicRpcDriverLocation(command.point);
  if(command.params.location.lineNumber!==expected.lineNumber||command.params.location.columnNumber!==expected.columnNumber){throw new Error("WIRE_RPC_DRIVER_LOCATION");}
 }
 return freezeDeep(command);
}
