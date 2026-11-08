/** Fixed passive active-document vocabulary. No arm, resume or application call. */
/* oxlint-disable unicorn/max-nested-calls -- Each closed Inspector variant retains its complete fixed packet schema. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_CALLS as PRIOR} from "./current-schematic-relevance-render-delegate-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_BEFORE as BEFORE,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_CALLBACK as CALLBACK,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_CANDIDATES as CANDIDATES,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_FRAME_SAME as FRAME_SAME,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_FUNCTIONS as FUNCTIONS,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_LOOKUP as LOOKUP,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_MANAGER as MANAGER,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_MANAGER_DATA as MANAGER_DATA,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_NATIVE_METHODS as NATIVE_METHODS,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_NATIVE_ROOTS as NATIVE_ROOTS,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_TAB_BAR as TAB_BAR,CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_UI as UI} from "./current-schematic-relevance-active-doc-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-active-doc-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
const keep=["hooks","reflection-reprove","native-defaultInstance","native-hooks","novel","merge","prototypes","snapshot","same"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_CALLS=freezeDeep([...PRIOR.filter(row=>keep.some(role=>role===row[0])),["callback",CALLBACK,2,false],["candidates",CANDIDATES,3,false],["manager",MANAGER,2,false],["manager-data",MANAGER_DATA,4,false],["functions",FUNCTIONS,5,false],["ui",UI,1,false],["tab-bar",TAB_BAR,3,false],["native-roots",NATIVE_ROOTS,3,false],["native-methods",NATIVE_METHODS,5,false],["lookup",LOOKUP,11,false],["before",BEFORE,14,true],["frame-same",FRAME_SAME,2,true]]as const);
/** Each of ten bounded graph waves may expose twelve prototype levels and
 * 384 new unique objects total. Every call/frame also needs its own source
 * receipt at the genuine controller, outside this passive collector. */
export const CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_REQUESTS=Object.freeze({graphWaves:10,prototypeDepth:12,qualifiedLimit:384,fixedReads:128,normalMaximum:10*12*8+384+128,helperMaximum:10*12*6+96,sourceReads:2,arms:0,resumes:0});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("frame"),variant:z.union([z.literal(0),z.literal(1)]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(128),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.string().max(64),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(14),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
]);
export type CurrentSchematicRelevanceActiveDocCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceActiveDocCommand(input:unknown):CurrentSchematicRelevanceActiveDocCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==EXPRESSIONS[command.variant]){throw new Error("SCH_ACTIVE_DOC_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_DOC_CALLS.find(value=>value[0]===command.role);if(row===undefined||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_ACTIVE_DOC_FIXED_CALL");}}return freezeDeep(command);}
