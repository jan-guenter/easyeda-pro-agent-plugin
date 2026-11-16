import {validateCurrentSchematicWirePointEffectCommand} from "./current-schematic-wire-point-effects-protocol.ts";
import type {CurrentSchematicWirePointEffectCommand} from "./current-schematic-wire-point-effects-protocol.ts";
import {validateCurrentSchematicWireFirstChildAttrCommand} from "./current-schematic-wire-first-child-attrs-protocol.ts";
import type {CurrentSchematicWireFirstChildAttrCommand} from "./current-schematic-wire-first-child-attrs-protocol.ts";
import {validateCurrentSchematicWireFirstChildDependencyCommand} from "./current-schematic-wire-first-child-dependencies.ts";
import type {CurrentSchematicWireFirstChildDependencyCommand} from "./current-schematic-wire-first-child-dependencies.ts";
/* oxlint-disable import/max-dependencies -- The original driver composes only these closed finite source subgroups. */
/** Closed source-only callback-to-record lane. Native Modify admission and
 * the monitor's descendant/worker/Main continuations remain separate. */
import {validateCurrentSchematicWireGroupDataReturnCommand} from "./current-schematic-wire-group-data-return-protocol.ts";
import type {CurrentSchematicWireGroupDataReturnCommand} from "./current-schematic-wire-group-data-return-protocol.ts";
import {validateCurrentSchematicWireGroupChildCommand} from "./current-schematic-wire-group-child-protocol.ts";
import type {CurrentSchematicWireGroupChildCommand} from "./current-schematic-wire-group-child-protocol.ts";
import {z} from "zod";
import {validateCurrentSchematicWireGroupDataDependencyCommand} from "./current-schematic-wire-group-data-dependency-protocol.ts";
import type {CurrentSchematicWireGroupDataDependencyCommand} from "./current-schematic-wire-group-data-dependency-protocol.ts";
import {validateCurrentSchematicWireGroupDataHookCommand} from "./current-schematic-wire-group-data-hook-protocol.ts";
import type {CurrentSchematicWireGroupDataHookCommand} from "./current-schematic-wire-group-data-hook-protocol.ts";
import {validateCurrentSchematicWireGroupExecutionCommand} from "./current-schematic-wire-group-execution-protocol.ts";
import type {CurrentSchematicWireGroupExecutionCommand} from "./current-schematic-wire-group-execution-protocol.ts";
import {validateCurrentSchematicWireGroupPreparationCommand} from "./current-schematic-wire-group-preparation-protocol.ts";
import type {CurrentSchematicWireGroupPreparationCommand} from "./current-schematic-wire-group-preparation-protocol.ts";
import {validateCurrentSchematicWireGroupMethodCommand} from "./current-schematic-wire-group-method-protocol.ts";
import type {CurrentSchematicWireGroupMethodCommand} from "./current-schematic-wire-group-method-protocol.ts";
import {validateCurrentSchematicWireHistoryGroupCommand} from "./current-schematic-wire-history-group-protocol.ts";
import type {CurrentSchematicWireHistoryGroupCommand} from "./current-schematic-wire-history-group-protocol.ts";
import {validateCurrentSchematicWireAttrHistoryCommand} from "./current-schematic-wire-attr-history-protocol.ts";
import type {CurrentSchematicWireAttrHistoryCommand} from "./current-schematic-wire-attr-history-protocol.ts";
import {validateCurrentSchematicWireParentAttrCommand} from "./current-schematic-wire-parent-attr-protocol.ts";
import type {CurrentSchematicWireParentAttrCommand} from "./current-schematic-wire-parent-attr-protocol.ts";
import {validateCurrentSchematicWireInheritedParentCommand} from "./current-schematic-wire-inherited-parent-protocol.ts";
import type {CurrentSchematicWireInheritedParentCommand} from "./current-schematic-wire-inherited-parent-protocol.ts";
import {validateCurrentSchematicWireCommonParentCommand} from "./current-schematic-wire-common-parent-protocol.ts";
import type {CurrentSchematicWireCommonParentCommand} from "./current-schematic-wire-common-parent-protocol.ts";
import {validateCurrentSchematicWireAddCommonCommand} from "./current-schematic-wire-add-common-protocol.ts";
import type {CurrentSchematicWireAddCommonCommand} from "./current-schematic-wire-add-common-protocol.ts";
import {validateCurrentSchematicWireBboxAddCommand} from "./current-schematic-wire-bbox-add-protocol.ts";
import type {CurrentSchematicWireBboxAddCommand} from "./current-schematic-wire-bbox-add-protocol.ts";
import {validateCurrentSchematicWireViewBboxCommand} from "./current-schematic-wire-view-bbox-protocol.ts";
import type {CurrentSchematicWireViewBboxCommand} from "./current-schematic-wire-view-bbox-protocol.ts";
import {validateCurrentSchematicWireCallbackAstViewCommand} from "./current-schematic-wire-callback-ast-view-protocol.ts";
import type {CurrentSchematicWireCallbackAstViewCommand} from "./current-schematic-wire-callback-ast-view-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {validateCurrentSchematicWireCallbackCommand} from "./current-schematic-wire-callback-protocol.ts";
import type {CurrentSchematicWireCallbackCommand} from "./current-schematic-wire-callback-protocol.ts";
import {validateCurrentSchematicWireConstructCommand} from "./current-schematic-wire-construct-protocol.ts";
import type {CurrentSchematicWireConstructCommand} from "./current-schematic-wire-construct-protocol.ts";
import {validateCurrentSchematicWireTransitionCommand} from "./current-schematic-wire-transition-protocol.ts";
import type {CurrentSchematicWireTransitionCommand} from "./current-schematic-wire-transition-protocol.ts";

/** 40 callback +7 sources;8 construct +2 sources;one full stage source read;
 * one methods call/source/tuple/two metadata reads;2 arms;7 resumes;
 * one originalPoints selector;6+1 setter;one AST selector/metadata;6+1 record. */
export const CURRENT_SCHEMATIC_WIRE_CALLBACK_DRIVER_REQUESTS=Object.freeze({normal:89,cleanup:2,helperSources:12,fullSources:1,pauses:8,resumes:7,events:28} as const);
export const CURRENT_SCHEMATIC_WIRE_CALLBACK_DRIVER_METHODS=String.raw`function(native){"use strict";const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "WIRE_CALLBACK_DRIVER_METHODS";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};if(!isArray(this)||proto(this)!==native[16]||own(this,"length")!==2||keys(this).length!==3)bad();const b=own(this,0),state=own(this,1),line=own(b,"line"),group=own(b,"group"),shapes=own(b,"shapes"),binding=own(b,"pointBinding");if(own(state,"owner")!==this||own(state,"failed")!==false||own(state,"modifyAttempted")!==false||own(state,"modifyAcknowledged")!==false||own(state,"saveAttempted")!==false||own(line,"shapeManager")!==shapes||own(group,"shapeManager")!==shapes||own(binding,"object")!==line)bad();const point=get(own(binding,"owner"),"points"),setter=own(binding,"set"),record=own(own(shapes,"modifyMonitor"),"record");if(!point||has(point,"value")||point.set!==setter||point.get!==own(binding,"get")||typeof setter!=="function"||typeof record!=="function")bad();return[setter,record];}`;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const reference=z.strictObject({objectId:handle});
const sourceParams=z.strictObject({scriptId:handle});
const propertiesParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const methodParams=z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(CURRENT_SCHEMATIC_WIRE_CALLBACK_DRIVER_METHODS),arguments:z.tuple([reference]),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)});
const armParams=z.strictObject({objectId:handle,condition:z.literal("")});
const selector={...flags,callFrameId:handle,returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)};
const pointsParams=z.strictObject({...selector,expression:z.literal("originalPoints")});
const astParams=z.strictObject({...selector,expression:z.literal("t")});
const resumeParams=z.strictObject({});
const removeParams=z.strictObject({breakpointId:handle});
const ownSchema=z.union([
 z.strictObject({phase:z.literal("wire-callback-driver-source"),method:z.literal("Debugger.getScriptSource"),params:sourceParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-properties"),method:z.literal("Runtime.getProperties"),params:propertiesParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-methods"),method:z.literal("Runtime.callFunctionOn"),params:methodParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-arm"),role:z.enum(["setter","record"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:armParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-selector"),role:z.literal("points"),method:z.literal("Debugger.evaluateOnCallFrame"),params:pointsParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-selector"),role:z.literal("ast"),method:z.literal("Debugger.evaluateOnCallFrame"),params:astParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-resume"),method:z.literal("Debugger.resume"),params:resumeParams}),
 z.strictObject({phase:z.literal("wire-callback-driver-remove"),method:z.literal("Debugger.removeBreakpoint"),params:removeParams}),
]);
export type CurrentSchematicWireCallbackDriverOwnCommand=Readonly<z.infer<typeof ownSchema>>;
export type CurrentSchematicWireCallbackDriverCommand=CurrentSchematicWirePointEffectCommand|CurrentSchematicWireFirstChildAttrCommand|CurrentSchematicWireFirstChildDependencyCommand|CurrentSchematicWireGroupChildCommand|CurrentSchematicWireGroupDataReturnCommand|CurrentSchematicWireGroupDataDependencyCommand|CurrentSchematicWireGroupDataHookCommand|CurrentSchematicWireGroupExecutionCommand|CurrentSchematicWireGroupPreparationCommand|CurrentSchematicWireGroupMethodCommand|CurrentSchematicWireHistoryGroupCommand|CurrentSchematicWireAttrHistoryCommand|CurrentSchematicWireParentAttrCommand|CurrentSchematicWireInheritedParentCommand|CurrentSchematicWireCommonParentCommand|CurrentSchematicWireAddCommonCommand|CurrentSchematicWireBboxAddCommand|CurrentSchematicWireViewBboxCommand|CurrentSchematicWireCallbackAstViewCommand|CurrentSchematicWireCallbackDriverOwnCommand|CurrentSchematicWireCallbackCommand|CurrentSchematicWireConstructCommand|CurrentSchematicWireTransitionCommand;
export function validateCurrentSchematicWireCallbackDriverCommand(input:unknown):CurrentSchematicWireCallbackDriverCommand{
 const raw=capture(input).value;
 if(raw===null||typeof raw!=="object"||!("phase"in raw)||typeof raw.phase!=="string"){throw new Error("WIRE_CALLBACK_DRIVER_PHASE");}
 if(raw.phase.startsWith("wire-point-effect-")){return validateCurrentSchematicWirePointEffectCommand(raw);}
 if(raw.phase.startsWith("wire-first-child-attrs-")){return validateCurrentSchematicWireFirstChildAttrCommand(raw);}
 if(raw.phase==="wire-first-child-dependency-call"){return validateCurrentSchematicWireFirstChildDependencyCommand(raw);}
 if(raw.phase.startsWith("wire-group-child-")){return validateCurrentSchematicWireGroupChildCommand(raw);}
 if(raw.phase.startsWith("wire-group-data-return-")){return validateCurrentSchematicWireGroupDataReturnCommand(raw);}
 if(raw.phase.startsWith("wire-group-data-dependency-")){return validateCurrentSchematicWireGroupDataDependencyCommand(raw);}
 if(raw.phase.startsWith("wire-group-data-hook-")){return validateCurrentSchematicWireGroupDataHookCommand(raw);}
 if(raw.phase.startsWith("wire-group-execution-")){return validateCurrentSchematicWireGroupExecutionCommand(raw);}
 if(raw.phase.startsWith("wire-group-preparation-")){return validateCurrentSchematicWireGroupPreparationCommand(raw);}
 if(raw.phase.startsWith("wire-group-method-")){return validateCurrentSchematicWireGroupMethodCommand(raw);}
 if(raw.phase.startsWith("wire-history-group-")){return validateCurrentSchematicWireHistoryGroupCommand(raw);}
 if(raw.phase.startsWith("wire-attr-history-")){return validateCurrentSchematicWireAttrHistoryCommand(raw);}
 if(raw.phase.startsWith("wire-parent-attr-")){return validateCurrentSchematicWireParentAttrCommand(raw);}
 if(raw.phase.startsWith("wire-inherited-parent-")){return validateCurrentSchematicWireInheritedParentCommand(raw);}
 if(raw.phase.startsWith("wire-common-parent-")){return validateCurrentSchematicWireCommonParentCommand(raw);}
 if(raw.phase.startsWith("wire-add-common-")){return validateCurrentSchematicWireAddCommonCommand(raw);}
 if(raw.phase.startsWith("wire-bbox-add-")){return validateCurrentSchematicWireBboxAddCommand(raw);}
 if(raw.phase.startsWith("wire-view-bbox-")){return validateCurrentSchematicWireViewBboxCommand(raw);}
 if(raw.phase.startsWith("wire-callback-ast-view-")){return validateCurrentSchematicWireCallbackAstViewCommand(raw);}
 if(raw.phase.startsWith("wire-callback-driver-")){return freezeDeep(ownSchema.parse(raw));}
 if(raw.phase.startsWith("wire-callback-")&&raw.phase!=="wire-callback-release"){return validateCurrentSchematicWireCallbackCommand(raw);}
 if(raw.phase.startsWith("wire-construct-")){return validateCurrentSchematicWireConstructCommand(raw);}
 if(raw.phase.startsWith("wire-transition-")){const command=validateCurrentSchematicWireTransitionCommand(raw);if(command.phase==="wire-transition-properties"||("role"in command&&(command.role==="setter"||command.role==="record"))){return command;}}
 throw new Error("WIRE_CALLBACK_DRIVER_PHASE");
}
