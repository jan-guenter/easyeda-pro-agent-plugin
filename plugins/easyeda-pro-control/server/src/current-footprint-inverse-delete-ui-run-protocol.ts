/** Closed readonly run-proof vocabulary. It admits no resume, callback,
 * native send, preference removal or caller-selected JavaScript. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_PROGRAMS as P } from "./current-footprint-inverse-delete-ui-run-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-delete-ui-run-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_CALLS = freezeDeep({ module: { program: P.module, refs: 3, byValue: false }, proof: { program: P.proof, refs: 6, byValue: false }, reprove: { program: P.reprove, refs: 1, byValue: true }, ja: { program: P.ja, refs: 3, byValue: false }, p4: { program: P.p4, refs: 3, byValue: true }, yy: { program: P.yy, refs: 3, byValue: true } } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const ref = z.strictObject({ objectId: handle });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(ref).max(6), returnByValue: z.boolean() });
const frameParams = z.strictObject({ callFrameId: handle, expression: z.string(), objectGroup: flags.objectGroup, silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-delete-ui-run-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("inverse-delete-ui-run-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("inverse-delete-ui-run-call"), role: z.enum(["module", "proof", "reprove", "ja", "p4", "yy"]), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("inverse-delete-ui-run-frame"), role: z.enum(["ja", "p4", "yy"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
]);
export type CurrentFootprintInverseDeleteUiRunCommand = Readonly<z.infer<typeof schema>>;
export type CurrentFootprintInverseDeleteUiRunRole = keyof typeof EXPRESSIONS;
/** Fixed collectors reserve these bounds separately from correlated helper
 * source receipts. This module is not mounted on a native pipe. */
export const CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_REQUESTS = freezeDeep({ preparation: { calls: 3, propertiesMaximum: 18, normalMaximum: 21, helpers: 3 }, ja: { calls: 1, frames: 1, propertiesMaximum: 8, normalMaximum: 10, helpers: 2 }, p4: { calls: 1, frames: 1, propertiesMaximum: 2, normalMaximum: 4, helpers: 2 }, yy: { calls: 1, frames: 1, propertiesMaximum: 3, normalMaximum: 5, helpers: 2 } } as const);
/** Reject a failed inverse delete ui run command predicate with its fixed refusal code. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_UI_RUN_COMMAND"); } }
/** Reject any changed expression, program, argument count or side-effect flag
 * before handing a request to the original finite host. */
export function validateCurrentFootprintInverseDeleteUiRunCommand(input: unknown): CurrentFootprintInverseDeleteUiRunCommand {
  const command = schema.parse(capture(input));
  if (command.method === "Runtime.callFunctionOn") { const row = CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_CALLS[command.role]; need(command.params.functionDeclaration === row.program && command.params.arguments.length === row.refs && command.params.returnByValue === row.byValue); }
  else if (command.method === "Debugger.evaluateOnCallFrame") { need(command.params.expression === EXPRESSIONS[command.role]); }
  return freezeDeep(command);
}
/** Identify only an original fixed helper for its separate correlated source
 * receipt. Property and helper-source reads execute no helper themselves. */
export function currentFootprintInverseDeleteUiRunProgram(command: CurrentFootprintInverseDeleteUiRunCommand): string | null { if (command.method === "Runtime.callFunctionOn") { return command.params.functionDeclaration; } if (command.method === "Debugger.evaluateOnCallFrame") { return command.params.expression; } return null; }
/** Require the returned helper source byte-for-byte, including Inspector's
 * wrapper. A source match alone issues no original entry or owner receipt. */
export function qualifyCurrentFootprintInverseDeleteUiRunHelper(input: unknown, program: string): void {
  const raw = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(input)); const declaration = Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_CALLS).some(row => row.program === program); need(declaration || Object.values(EXPRESSIONS).some(value => value === program)); need(raw.scriptSource === (declaration ? `(${program})` : program));
}
