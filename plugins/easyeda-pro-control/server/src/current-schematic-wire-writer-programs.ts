/** A separate fixed Wire writer candidate with held source-owned callback
 * markers. The immutable v1/v2 stages are unchanged. This program has no
 * transport mount until all original continuations and persistence joins exist. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_WIRE_LIFECYCLE_FUNCTION as BASE, generatedSchematicWireLifecycleStageResultSchema } from "./generated-schematic-wire-lifecycle-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function once(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_WIRE_WRITER_SOURCE_ANCHOR"); } return source.replace(before, after);
}
const originalCallback = 'async()=>{ownedAction=b.runner.currentAction;check();same(before,capture(operation.beforeBody));const points=[[operation.afterBody.startX,operation.afterBody.startY],[operation.afterBody.endX,operation.afterBody.endY]].map(([x,y])=>{check();const point=Reflect.construct(b.vectorCtor.fn,[x,y]);if(Object.getPrototypeOf(point)!==b.pointPrototype||own(point,"x")!==x||own(point,"y")!==y||Reflect.ownKeys(point).length!==3||typeof own(point,"hashed")!=="number")bad("NEW_POINT");return point;});check();reproveSetter(b.pointBinding);reprove(b.setLines);apply(b.setLines.fn,b.group,[[{id:operation.lineId,points}]]);check();}';
/** The original callback pauses before both constructor calls and before its
 * one existing-ID setLines call. No caller callback or target enters it. */
export const CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK = `async()=>{const originalContext=[tuple,b,state,before,target,operation];debugger;try{ownedAction=b.runner._currentAction;if(ownedAction===null||typeof ownedAction!=="object")throw "SCH209_WIRE_CALLBACK_ACTIVE_ACTION";const originalPoints=[];for(let originalIndex=0;originalIndex<2;originalIndex++){const originalCoordinates=originalIndex===0?[operation.afterBody.startX,operation.afterBody.startY]:[operation.afterBody.endX,operation.afterBody.endY];debugger;const originalPoint=Reflect.construct(b.vectorCtor.fn,originalCoordinates);debugger;if(Object.getPrototypeOf(originalPoint)!==b.pointPrototype||own(originalPoint,"x")!==originalCoordinates[0]||own(originalPoint,"y")!==originalCoordinates[1]||Reflect.ownKeys(originalPoint).length!==3||typeof own(originalPoint,"hashed")!=="number")throw "SCH209_WIRE_CALLBACK_POINT";originalPoints.push(originalPoint);}debugger;apply(b.setLines.fn,b.group,[[{id:operation.lineId,points:originalPoints}]]);debugger;}catch(originalError){debugger;throw originalError;}}`;
function build(): string {
  let source = once(BASE, 'schema:"easyeda-pro-control.generated-schematic-wire-lifecycle-stage.v2"', 'schema:"easyeda-pro-control.generated-schematic-wire-writer-stage.v3"');
  source = once(source, 'const before=capture(operation.beforeBody);same(state.before,before);', 'const before=state.before;same(before,capture(operation.beforeBody));');
  source = once(source, 'b={ui,host,sch,tabs,', 'b={root,ui,host,sch,tabs,');
  source = once(source, originalCallback, CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK);
  source = once(source, 'debugger;throw originalError;}}]);', 'debugger;throw originalError;}},{history:true,name:"Codex disposable LINE geometry",timeout:0,dependencies:[]}]);');
  return source;
}
export const CURRENT_SCHEMATIC_WIRE_WRITER_FUNCTION = build();
export const currentSchematicWireWriterStageResultSchema = z.strictObject({ ...generatedSchematicWireLifecycleStageResultSchema.shape, schema: z.literal("easyeda-pro-control.generated-schematic-wire-writer-stage.v3") }).refine(value => generatedSchematicWireLifecycleStageResultSchema.safeParse({ ...value, schema: "easyeda-pro-control.generated-schematic-wire-lifecycle-stage.v2" }).success);
export type CurrentSchematicWireWriterStageResult = z.infer<typeof currentSchematicWireWriterStageResultSchema>;
const roles = ["entry", "point-before", "point-after", "setter-before", "finish", "failure"] as const;
const script = `(${CURRENT_SCHEMATIC_WIRE_WRITER_FUNCTION})`; const callbackStart = script.indexOf(CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK);
if (callbackStart === -1 || script.split(CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK).length !== 2) { throw new Error("SCH209_WIRE_WRITER_CALLBACK_SOURCE"); }
const offsets = [...CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK.matchAll(/debugger;/gu)].map(match => callbackStart + match.index);
if (offsets.length !== roles.length) { throw new Error("SCH209_WIRE_WRITER_MARKER_COUNT"); }
export const CURRENT_SCHEMATIC_WIRE_WRITER_MARKERS = freezeDeep(roles.map((role, index) => {
  const offset = offsets[index]; if (offset === undefined) { throw new Error("SCH209_WIRE_WRITER_MARKER_INDEX"); }
  const prefix = script.slice(0, offset); return { role, lineNumber: prefix.split("\n").length - 1, columnNumber: prefix.length - prefix.lastIndexOf("\n") - 1 };
}));
export type CurrentSchematicWireWriterMarkerRole = typeof roles[number];
/** Evaluating only lexical variables at their corresponding original marker
 * cannot create a new callback or continue a held application invocation. */
export const CURRENT_SCHEMATIC_WIRE_WRITER_FRAME_EXPRESSIONS = Object.freeze({
  entry: "[originalContext,apply]", "point-before": "[originalContext,originalIndex,originalCoordinates,originalPoints]",
  "point-after": "[originalContext,originalIndex,originalCoordinates,originalPoints,originalPoint]",
  "setter-before": "[originalContext,originalPoints]", finish: "[originalContext,originalPoints]", failure: "[originalContext,originalError]",
} as const);
