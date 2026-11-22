/** Finite read-only vocabulary for the original held geometry callbacks. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PROGRAMS as PROGRAMS } from "./current-schematic-wire-net-geometry-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FLAGS = Object.freeze({
  objectGroup: "easyeda-pro-control-wire-net-geometry-v1", silent: true, generatePreview: false, throwOnSideEffect: true,
} as const);
const flags = CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FLAGS;
export const CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES = freezeDeep({
  refresh: { expression: "[this]", slots: 1 },
  listener: { expression: "[this,r]", slots: 2 },
  deliver: { expression: "[this,e,t]", slots: 3 },
  dispatch: { expression: "[this,e]", slots: 2 },
  bbox: { expression: "[this,t]", slots: 2 },
  ctor0: { expression: "[this,t,r,Reflect.construct,uc]", slots: 5 },
  ctor1: { expression: "[this,t,r,Reflect.construct,cc]", slots: 5 },
  reflect0: { expression: "[this,t,r,Reflect.construct,uc]", slots: 5 },
  reflect1: { expression: "[this,t,r,Reflect.construct,cc]", slots: 5 },
  create0: { expression: "[this,t,r,n,Reflect.construct,uc]", slots: 6 },
  create1: { expression: "[this,t,r,n,Reflect.construct,cc]", slots: 6 },
  factory0: { expression: "[this,t,aN]", slots: 3 },
  factory1: { expression: "[this,t,iN]", slots: 3 },
  point: { expression: "[this,a]", slots: 2 },
  birth: { expression: "[this,a,o]", slots: 3 },
} as const);
const arities = { entry: 9, constructor: 7, create: 7, birth: 5, returned: 12 } as const;
const roles = ["entry", "constructor", "create", "birth", "returned"] as const;
export const currentSchematicWireNetGeometryHandle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const handle = currentSchematicWireNetGeometryHandle;
const sealedFlags = {
  objectGroup: z.literal(flags.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
};
const reference = z.strictObject({ objectId: handle });
const calls = roles.map(role => z.strictObject({
  phase: z.literal("wire-net-geometry-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...sealedFlags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]),
    arguments: z.array(reference).length(arities[role]), returnByValue: z.literal(role === "create" || role === "birth"),
    awaitPromise: z.literal(false), userGesture: z.literal(false) }),
}));
const evaluations = Object.entries(CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES).map(([role, row]) => z.strictObject({
  phase: z.literal("wire-net-geometry-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"),
  params: z.strictObject({ ...sealedFlags, callFrameId: handle, expression: z.literal(row.expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }),
}));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const schema = z.union([...calls, ...evaluations,
  z.strictObject({ phase: z.literal("wire-net-geometry-properties"), method: z.literal("Runtime.getProperties"),
    params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-net-geometry-source"), method: z.literal("Debugger.getScriptSource"),
    params: z.strictObject({ scriptId: handle }) }),
]);
export type CurrentSchematicWireNetGeometryCommand = z.infer<typeof schema>;
export function validateCurrentSchematicWireNetGeometryCommand(input: unknown): CurrentSchematicWireNetGeometryCommand {
  return freezeDeep(schema.parse(capture(input).value));
}
export function currentSchematicWireNetGeometryCall(role: typeof roles[number], receiver: string, refs: readonly string[]): CurrentSchematicWireNetGeometryCommand {
  return validateCurrentSchematicWireNetGeometryCommand({
    phase: "wire-net-geometry-call", role, method: "Runtime.callFunctionOn",
    params: { ...flags, objectId: receiver, functionDeclaration: PROGRAMS[role], arguments: refs.map(objectId => ({ objectId })),
      returnByValue: role === "create" || role === "birth", awaitPromise: false, userGesture: false },
  });
}
export function currentSchematicWireNetGeometryFrame(role: keyof typeof CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES, frame: string): CurrentSchematicWireNetGeometryCommand {
  return validateCurrentSchematicWireNetGeometryCommand({
    phase: "wire-net-geometry-frame", role, method: "Debugger.evaluateOnCallFrame",
    params: { ...flags, callFrameId: frame, expression: CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES[role].expression, returnByValue: false, includeCommandLineAPI: false },
  });
}

/** These fixed recipes are the driver's entire read-only transport grammar. */
export function currentSchematicWireNetGeometryCases(): readonly CurrentSchematicWireNetGeometryCommand[] {
  const id = "original27";
  const controls = [
    { phase: "wire-net-geometry-properties", method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-net-geometry-source", method: "Debugger.getScriptSource", params: { scriptId: id } },
  ];
  return Object.freeze([
    ...roles.map(role => currentSchematicWireNetGeometryCall(role, id, Array.from({length:arities[role]},()=>id))),
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES).map(([role, row]) => validateCurrentSchematicWireNetGeometryCommand({
      phase: "wire-net-geometry-frame", role, method: "Debugger.evaluateOnCallFrame",
      params: { ...flags, callFrameId: id, expression: row.expression, returnByValue: false, includeCommandLineAPI: false },
    })),
    ...controls.map(row => validateCurrentSchematicWireNetGeometryCommand(row)),
  ]);
}
