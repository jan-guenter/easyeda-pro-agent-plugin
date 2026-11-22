/** Closed source-observation vocabulary for a later original Wire owner.
 * No expression, source code, context, or application entry can be supplied
 * by a public caller. The separate checkpoint codec encodes a subset without
 * mounting these commands on a live native transport. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_MEMBERSHIP_PROGRAM, CURRENT_SCHEMATIC_WIRE_ENCODER_RETURN_PROGRAM } from "./current-schematic-wire-encoder-programs.ts";
import { currentSchematicWireEncoderScriptId as handle, requireCurrentSchematicWireEncoderSourceCheckpoint, currentSchematicWireEncoderSourceRow as row } from "./current-schematic-wire-encoder-source.ts";
import type { CurrentSchematicWireEncoderSourceCheckpoint } from "./current-schematic-wire-encoder-source.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "./current-schematic-wire-writer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET = Object.freeze({
  peers: 6, metadata: 12, membership: 1, normal: 13,
} as const);

const readFlags = {
  objectGroup: z.literal(FLAGS.objectGroup), silent: z.literal(true),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
};
const source = z.strictObject({
  phase: z.literal("wire-encoder-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }),
});
const metadata = z.strictObject({
  phase: z.literal("wire-encoder-metadata"), method: z.literal("Runtime.getProperties"),
  params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }),
});
const frameExpressions = Object.freeze([
  { delegation: "[this]", handler: "[this,Rb]", factory: "[this,n]", factoryReturn: "[s,a]",
    lineUpload: "[this,e]", peerUpload: "[this,t]", lineChecked: "[this,e]", lineChecker: "[this,e]",
    handlerReturn: "[t,n]", writerReturn: "[raw]" },
  { delegation: "[this]", handler: "[this,Ub]", factory: "[this,n]", factoryReturn: "[s,a]",
    lineUpload: "[this,e]", peerUpload: "[this,t]", lineChecked: "[this,e]", lineChecker: "[this,e]",
    handlerReturn: "[t,n]", writerReturn: "[raw]" },
] as const);
type FrameRole = keyof typeof frameExpressions[0];
const variant = z.union([z.literal(0), z.literal(1)]).refine(value => !Object.is(value, -0));
const frame = z.strictObject({
  phase: z.literal("wire-encoder-frame"), role: z.enum(["delegation", "handler", "factory", "factoryReturn", "lineUpload", "peerUpload", "lineChecked", "lineChecker", "handlerReturn", "writerReturn"]), variant,
  method: z.literal("Debugger.evaluateOnCallFrame"),
  params: z.strictObject({ ...readFlags, callFrameId: handle, expression: z.string().max(16),
    returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }),
}).refine(value => value.params.expression === frameExpressions[value.variant][value.role]);

const sourceRole = z.enum(["factory", "handler"]);
type ReturnRole = z.infer<typeof sourceRole>;
const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const sites = z.strictObject({
  phase: z.literal("wire-encoder-return-sites"), role: sourceRole, variant,
  method: z.literal("Debugger.getPossibleBreakpoints"),
  params: z.strictObject({ start: site, end: site, restrictToFunction: z.literal(true) }),
}).refine(command => {
  const expected = row(command.variant, command.role);
  const { start, end } = command.params;
  return start.scriptId === end.scriptId && start.lineNumber === expected.location.lineNumber &&
    start.columnNumber === expected.location.columnNumber && end.lineNumber === expected.endLocation.lineNumber &&
    end.columnNumber === expected.endLocation.columnNumber;
});
const references = z.strictObject({ objectId: handle });
const callPrograms = Object.freeze({
  membership: { body: CURRENT_SCHEMATIC_WIRE_ENCODER_MEMBERSHIP_PROGRAM, length: 26 },
  returnEquality: { body: CURRENT_SCHEMATIC_WIRE_ENCODER_RETURN_PROGRAM, length: 4 },
});
type CallRole = keyof typeof callPrograms;
const call = z.strictObject({
  phase: z.literal("wire-encoder-compare"), role: z.enum(["membership", "returnEquality"]), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...readFlags, objectId: handle, functionDeclaration: z.string().max(4096),
    arguments: z.array(references).min(4).max(26), returnByValue: z.literal(true),
    awaitPromise: z.literal(false), userGesture: z.literal(false) }),
}).refine(({ params, role }) => params.functionDeclaration === callPrograms[role].body && params.arguments.length === callPrograms[role].length);

const schema = z.union([source, metadata, frame, sites, call]);
export type CurrentSchematicWireEncoderCommand = Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireEncoderCommand(input: unknown): CurrentSchematicWireEncoderCommand {
  return freezeDeep(schema.parse(capture(input).value));
}

export function currentSchematicWireEncoderSourceCommand(scriptId: string): CurrentSchematicWireEncoderCommand {
  return validateCurrentSchematicWireEncoderCommand({ phase: "wire-encoder-source", method: "Debugger.getScriptSource", params: { scriptId } });
}
export function currentSchematicWireEncoderMetadataCommand(objectId: string): CurrentSchematicWireEncoderCommand {
  return validateCurrentSchematicWireEncoderCommand({ phase: "wire-encoder-metadata", method: "Runtime.getProperties",
    params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
}
export function currentSchematicWireEncoderFrame(
  checkpoint: CurrentSchematicWireEncoderSourceCheckpoint, role: FrameRole, callFrameId: string,
): CurrentSchematicWireEncoderCommand {
  requireCurrentSchematicWireEncoderSourceCheckpoint(checkpoint);
  return validateCurrentSchematicWireEncoderCommand({ phase: "wire-encoder-frame", role, variant: checkpoint.variant,
    method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: frameExpressions[checkpoint.variant][role],
      returnByValue: false, includeCommandLineAPI: false } });
}
export function currentSchematicWireEncoderReturnSites(
  checkpoint: CurrentSchematicWireEncoderSourceCheckpoint, role: ReturnRole,
): CurrentSchematicWireEncoderCommand {
  requireCurrentSchematicWireEncoderSourceCheckpoint(checkpoint);
  const expected = row(checkpoint.variant, role);
  return validateCurrentSchematicWireEncoderCommand({ phase: "wire-encoder-return-sites", role, variant: checkpoint.variant,
    method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId: checkpoint.scriptId, ...expected.location },
      end: { scriptId: checkpoint.scriptId, ...expected.endLocation }, restrictToFunction: true } });
}

export function currentSchematicWireEncoderComparison(
  role: CallRole, objectId: string, refs: readonly string[],
): CurrentSchematicWireEncoderCommand {
  return validateCurrentSchematicWireEncoderCommand({ phase: "wire-encoder-compare", role, method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId, functionDeclaration: callPrograms[role].body, arguments: refs.map(id => ({ objectId: id })),
      returnByValue: true, awaitPromise: false, userGesture: false } });
}

/** A whole function may have additional implicit/conditional return sites.
 * Never arm by guessing a column or by selecting an arbitrary first result. */
export function requireCurrentSchematicWireEncoderReturnSite(
  checkpoint: CurrentSchematicWireEncoderSourceCheckpoint, role: ReturnRole, reply: unknown,
): Readonly<z.infer<typeof site>> {
  requireCurrentSchematicWireEncoderSourceCheckpoint(checkpoint);
  const expected = row(checkpoint.variant, role);
  const breakpointType = z.enum(["call", "return", "debuggerStatement"]).optional();
  const breakpoint = site.extend({ type: breakpointType });
  const roster = z.array(breakpoint).min(1).max(16);
  const points = z.strictObject({ locations: roster }).parse(capture(reply).value).locations;
  const relative = (left: z.infer<typeof site>, right: Pick<z.infer<typeof site>, "lineNumber" | "columnNumber">): number =>
    left.lineNumber - right.lineNumber || left.columnNumber - right.columnNumber;
  const returns = points.filter(point => point.type === "return");
  const result = returns[0];
  // Both complete installed function bodies end at their single normal return PC.
  if (points.some(point => point.scriptId !== checkpoint.scriptId ||
      relative(point, expected.location) < 0 || relative(point, expected.endLocation) >= 0) ||
      returns.length !== 1 || result === undefined || result.lineNumber !== expected.endLocation.lineNumber ||
      result.columnNumber !== expected.endLocation.columnNumber - 1) {
    throw new Error("WIRE_ENCODER_RETURN_SITE");
  }
  return Object.freeze({ scriptId: result.scriptId, lineNumber: result.lineNumber, columnNumber: result.columnNumber });
}
