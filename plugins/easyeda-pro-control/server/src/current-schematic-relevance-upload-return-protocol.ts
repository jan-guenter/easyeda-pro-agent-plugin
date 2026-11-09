/** Fixed empty uploader tail, ending before the original history status body. */
/* oxlint-disable unicorn/max-nested-calls -- Every source program and argument count has one closed literal shape. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_BRANCH as BRANCH,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_FUNCTIONS as FUNCTIONS,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_ROOTS as ROOTS,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_SCOPE as SCOPE,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_STATE as STATE,currentSchematicRelevanceUploadReturnFrame as frame} from "./current-schematic-relevance-upload-return-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PENDING_CACHE_CALLS as CACHE} from "./current-schematic-relevance-pending-cache-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UPDATE_CALLS as NORMAL} from "./current-schematic-relevance-normal-update-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_SERIALIZE_CALLS as SERIALIZE} from "./current-schematic-relevance-upload-serialize-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-upload-return-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_REQUESTS=Object.freeze({beforeFixedReads:27,graphWaves:3,prototypeDepth:12,qualifiedLimit:384,beforeReads:3*12*6+384+27,stageReads:16,arms:2,resumes:2,controls:4,total:3*12*6+384+27+2*16+2+2+4});
const cacheRoles=["hooks","snapshot","same","maps","record","intrinsics","iterator","command-attributes","parsed-same","delta"]as const;
const serializeRoles=["novel","merge","prototypes"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS=freezeDeep([...CACHE.filter(row=>cacheRoles.some(role=>role===row[0])),...SERIALIZE.filter(row=>serializeRoles.some(role=>role===row[0])),...NORMAL.filter(row=>row[0]==="document-proof"),["roots",ROOTS,1,false],["state",STATE,2,false],["scope",SCOPE,1,false],["functions",FUNCTIONS,3,false],["branch",BRANCH,13,true],["combinations",frame("combinations"),3,true],["status",frame("status"),3,true]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const arg=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("frame"),role:z.enum(["combinations","status"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(16),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS.map(row=>row[0])),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(13),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),role:z.enum(["combinations","status"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceUploadReturnCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceUploadReturnCommand(input:unknown):CurrentSchematicRelevanceUploadReturnCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==EXPRESSIONS[command.role]){throw new Error("SCH_UPLOAD_RETURN_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_UPLOAD_RETURN_FIXED_CALL");}}return freezeDeep(command);}
