/** A distinct finite Modify lane. The startup eight-record grammar and its
 * native resumes remain unchanged; no Save or general worker control is added. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SHARED } from "./current-project-save-structure-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_PROGRAMS as P } from "./current-schematic-relevance-modify-structure-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-structure-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES = freezeDeep({ entry: { ...SHARED.startupEntry, expression: "[this,s,r,i,ve,De]", length: 6 }, returned: { ...SHARED.startupReturn, expression: "[this,s,r,i,ve,De]", length: 6 }, finalizer: SHARED.initialFinally,
  serialCaller: { expression: "[e,t,s,r]", length: 4 }, onChange: { expression: "[this,n,a,o,c,l,u,h,p,d,m,f,g,y,b]", length: 15 } } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_CALLS = freezeDeep([
  ["parts", P.parts, 2, false], ["readonly-proof", P.readonlyProof, 3, true], ["entry", P.entry, 7, true], ["caller", P.caller, 3, true], ["returned", P.returned, 5, true], ["idle", P.idle, 6, true],
  ["retain", P.retain, 0, false], ["reference-same", P.referenceSame, 1, true], ["finalizer", P.finalizer, 3, true],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true], ["reprove", P.reprove, 0, true],
] as const);
const flags = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_FLAGS, handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const position = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const callFlags = { objectGroup: z.literal(flags.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const removeParams = z.strictObject({ breakpointId: handle });
const armParams = z.strictObject({ location: position });
const frameParams = z.strictObject({ ...callFlags, callFrameId: handle, expression: z.string().max(128), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const callParams = z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string().max(8192), arguments: z.array(ref).max(7), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const resumeParams = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-structure-remove"), role: z.enum(["startupEntry", "startupReturn", "entry", "returned"]), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("modify-structure-arm"), role: z.enum(["entry", "returned"]), method: z.literal("Debugger.setBreakpoint"), params: armParams }),
  z.strictObject({ phase: z.literal("modify-structure-frame"), role: z.enum(["entry", "returned", "finalizer", "serialCaller", "onChange"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("modify-structure-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("modify-structure-call"), role: z.string().min(1).max(32), method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("modify-structure-resume"), role: z.enum(["entry", "returned", "finalizer"]), method: z.literal("Debugger.resume"), params: resumeParams }),
]);
export type CurrentSchematicRelevanceModifyStructureCommand = z.infer<typeof schema>;
/** Validate exact source programs, arities and locations before the original
 * Core binding may spend a separate native Modify request/resume allowance. */
export function validateCurrentSchematicRelevanceModifyStructureCommand(input: unknown): CurrentSchematicRelevanceModifyStructureCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-structure-call") {
    const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_CALLS.find(value => value[0] === command.role);
    if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_STRUCTURE_FIXED_CALL"); }
  } else if (command.phase === "modify-structure-frame" && command.params.expression !== CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES[command.role].expression) { throw new Error("SCH_MODIFY_STRUCTURE_FIXED_FRAME"); }
  else if (command.phase === "modify-structure-arm") {
    const point = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SITES[command.role];
    if (command.params.location.lineNumber !== point.lineNumber || command.params.location.columnNumber !== point.columnNumber) { throw new Error("SCH_MODIFY_STRUCTURE_FIXED_SITE"); }
  }
  return freezeDeep(command);
}
const reads = 4 * (12 * 12 + 2) + 128 + 96;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, events: 6, arms: 2, removals: 4, resumes: 3, stages: 4, prototypeWaves: 12, objects: 128 } as const);
