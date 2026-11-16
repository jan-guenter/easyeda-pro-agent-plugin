/** Closed controls for one complete parser observation. This unmounted family
 * cannot invoke Modify, a parser, a callback, a Promise method or Save. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_POINTS as POINTS } from "./current-schematic-wire-parser-source.ts";
import type { CurrentSchematicWireParserRole } from "./current-schematic-wire-parser-source.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_REQUESTS as READER } from "./current-schematic-wire-parser-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_REQUESTS as HELPERS } from "./current-schematic-wire-parser-helper-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_ORDER = freezeDeep([
  ["docParse", "entry"], ["sheetParse", "entry"], ["sheetAst", "entry"],
  ["sheetAst", "returned"], ["astUpdate", "entry"],
  ["astPassSchematic", "entry"], ["astPassSchematic", "returned"],
  ["astPassContent", "entry"], ["astPassContent", "returned"],
  ["astUpdate", "returned"], ["sheetParse", "returned"], ["docParse", "returned"],
] as const satisfies readonly (readonly [CurrentSchematicWireParserRole, "entry" | "returned"])[]);

/** Only points with an actual context/publication/return reader are armed.
 * Twelve arms, twelve resumes, twelve removals, the bounded readers and twenty-two exact
 * generated source checks share one already-reserved object-group release. */
export const CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_REQUESTS = Object.freeze({
  normal: READER.normal + HELPERS.normal + 6 + 12 + 12 + READER.helpers + 2,
  cleanup: 12 + READER.cleanup,
  total: READER.total + 6 + 2 + 12 + 12 + 12,
  breakpointCount: 12, pauseCount: 12, resumeCount: 12,
});
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const role = z.enum(["shapeDidTransact", "docParse", "sheetAst", "sheetParse", "astUpdate", "astPassSchematic", "astPassContent"]);
const stage = z.enum(["entry", "returned"]);
const variantSchema = z.union([z.literal(0), z.literal(1)]);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("wire-parser-driver-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("wire-parser-driver-arm"), role, stage, variant: variantSchema,
    method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location }) }),
  z.strictObject({ phase: z.literal("wire-parser-driver-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("wire-parser-driver-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
]);
export type CurrentSchematicWireParserDriverControl = z.infer<typeof schema>;
export function validateCurrentSchematicWireParserDriverControl(input: unknown): CurrentSchematicWireParserDriverControl {
  const command = schema.parse(capture(input).value);
  if (command.phase === "wire-parser-driver-arm") {
    if (!CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_ORDER.some(([name, when]) => name === command.role && when === command.stage)) { throw new Error("WIRE_PARSER_DRIVER_ROSTER"); }
    const point = POINTS[command.variant].points[command.role][command.stage];
    if (Object.is(command.variant, -0) || command.params.location.lineNumber !== point.lineNumber ||
        command.params.location.columnNumber !== point.columnNumber) { throw new Error("WIRE_PARSER_DRIVER_SITE"); }
  }
  return freezeDeep(command);
}
export function currentSchematicWireParserDriverCases(): readonly CurrentSchematicWireParserDriverControl[] {
  return freezeDeep([
    ...([0, 1] as const).flatMap(variant => CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_ORDER.map(([name, when]) => ({
      phase: "wire-parser-driver-arm", role: name, stage: when, variant, method: "Debugger.setBreakpoint",
      params: { location: { scriptId: "123.1", ...POINTS[variant].points[name][when] } },
    }))),
    { phase: "wire-parser-driver-source", method: "Debugger.getScriptSource", params: { scriptId: "123.2" } },
    { phase: "wire-parser-driver-resume", method: "Debugger.resume", params: {} },
    { phase: "wire-parser-driver-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "123.3" } },
  ].map(command => validateCurrentSchematicWireParserDriverControl(command)));
}

/** The native successor may substitute only original opaque IDs. */
export function currentSchematicWireParserDriverTemplate(input: unknown): Readonly<{
  phase: string; method: string; fields: Readonly<Record<string, "handle">>;
  values: Readonly<Record<string, string>>; template: string;
}> {
  const command = validateCurrentSchematicWireParserDriverControl(input);
  const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => {
    fields[name] = "handle"; values[name] = value; return `__wireparserdriver_${name}__`;
  };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-parser-driver-arm") {
    phase += `-${command.role}-${command.stage}-v${String(command.variant)}`;
    params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) };
  } else if (command.phase === "wire-parser-driver-source") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else if (command.phase === "wire-parser-driver-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
