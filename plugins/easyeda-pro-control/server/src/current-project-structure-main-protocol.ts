/** Fixed source-only main observer vocabulary. Parsing an inspector command
 * cannot enable a native purpose or add it to the Windows encoder. */
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_EXPRESSIONS as EXPRESSIONS, CURRENT_PROJECT_STRUCTURE_MAIN_GROUP as GROUP,
  CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as PROGRAMS } from "./current-project-structure-main-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_FUNCTIONS as FUNCTIONS, CURRENT_PROJECT_STRUCTURE_MAIN_ORDER as ORDER,
  CURRENT_PROJECT_STRUCTURE_MAIN_SITES as SITES } from "./current-project-structure-main-source.ts";
import type { CurrentProjectStructureMainStage as Stage } from "./current-project-structure-main-source.ts";

/** Eleven arms +thirteen frames +fourteen selectors +two properties; cleanup
 * separately consumes eleven resumes, eleven removals and one group release. */
export const CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS = Object.freeze({ normal: 40, cleanup: 23, total: 63 });
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const plan = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  ticket: z.number().int().positive(), structureText: z.string().min(1).max(1_048_576).refine(s => s.isWellFormed() && Buffer.byteLength(s) <= 1_048_576 && Buffer.byteLength(JSON.stringify(s)) <= 3_145_728) }).strict();
export type CurrentProjectStructureMainPlan = Readonly<z.infer<typeof plan>>;
const object = z.object({ objectId: handle }).strict();
export const CURRENT_PROJECT_STRUCTURE_MAIN_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false,
  throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
  awaitPromise: z.literal(false), userGesture: z.literal(false) };
const armParameters = z.object({ location: point }).strict();
const frameParameters = z.object({ callFrameId: handle, expression: z.string().max(256), objectGroup: z.literal(GROUP), silent: z.literal(true),
  returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) }).strict();
const valueArgument = z.object({ value: plan }).strict();
const argumentList = z.array(z.union([object, valueArgument])).max(3);
const joinParameters = z.object({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: argumentList, returnByValue: z.boolean() }).strict();
const propertiesParameters = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const removeParameters = z.object({ breakpointId: handle }).strict();
const emptyParameters = z.object({}).strict();
const releaseParameters = z.object({ objectGroup: z.literal(GROUP) }).strict();
const frameStages = [...ORDER, "driverCaller", "selectCaller"] as const;
const joinStages = [...ORDER, "context-join", "connection", "value"] as const;
const command = z.discriminatedUnion("phase", [
  z.object({ phase: z.literal("structure-main-arm"), stage: z.enum(ORDER), method: z.literal("Debugger.setBreakpoint"), params: armParameters }).strict(),
  z.object({ phase: z.literal("structure-main-frame"), stage: z.enum(frameStages), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParameters }).strict(),
  z.object({ phase: z.literal("structure-main-join"), stage: z.enum(joinStages), method: z.literal("Runtime.callFunctionOn"), params: joinParameters }).strict(),
  z.object({ phase: z.literal("structure-main-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParameters }).strict(),
  z.object({ phase: z.literal("structure-main-remove"), method: z.literal("Debugger.removeBreakpoint"), params: removeParameters }).strict(),
  z.object({ phase: z.literal("structure-main-resume"), method: z.literal("Debugger.resume"), params: emptyParameters }).strict(),
  z.object({ phase: z.literal("structure-main-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParameters }).strict(),
]);
export type CurrentProjectStructureMainCommand = Readonly<z.infer<typeof command>>;
/** Copy finite own data without invoking foreign accessors, proxies or aliases. */
export function captureCurrentProjectStructureMainData(input: unknown): unknown {
  const seen = new Set<object>(); let bytes = 0, nodes = 0;
  /** Bound all nested own data before Zod sees it, preserving no caller
   * accessors, aliases or mutable object identities in the parsed command. */
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 40_000 || depth > 16) { throw new Error("PROJECT_STRUCTURE_MAIN_DATA_BOUND"); }
    if (typeof value === "string") { bytes += Buffer.byteLength(value); if (!value.isWellFormed() || bytes > 4_194_304) { throw new Error("PROJECT_STRUCTURE_MAIN_DATA_BOUND"); } return value; }
    if (value === null || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0)) { return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { throw new Error("PROJECT_STRUCTURE_MAIN_DATA"); } seen.add(value);
    const array = Array.isArray(value), keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (array ? prototype !== Array.prototype || value.length > 4096 || keys.length !== value.length + 1 : prototype !== Object.prototype && prototype !== null || keys.length > 32) { throw new Error("PROJECT_STRUCTURE_MAIN_DATA"); }
    const result: unknown[] | Record<string, unknown> = array ? [] : {};
    for (const key of keys) {
      if (!(array && key === "length")) {
        const d = Object.getOwnPropertyDescriptor(value, key);
        if (typeof key !== "string" || d === undefined || !Object.hasOwn(d, "value") || d.enumerable !== true) { throw new Error("PROJECT_STRUCTURE_MAIN_DATA"); }
        Object.defineProperty(result, key, { value: copy(d.value, depth + 1), enumerable: true });
      }
    }
    return Object.freeze(result);
  };
  return copy(input, 0);
}
/** Treat supplied scope/text only as comparison data, never an original packet. */
export function validateCurrentProjectStructureMainPlan(input: unknown): CurrentProjectStructureMainPlan { return freezeDeep(plan.parse(captureCurrentProjectStructureMainData(input))); }
/** Require the exact fixed expression/program/argument arity for its stage. */
export function validateCurrentProjectStructureMainCommand(input: unknown): CurrentProjectStructureMainCommand {
  const parsed = command.parse(captureCurrentProjectStructureMainData(input));
  if (parsed.phase === "structure-main-arm") {
    const site = SITES[parsed.stage]; if (parsed.params.location.lineNumber !== site.lineNumber || parsed.params.location.columnNumber !== site.columnNumber) { throw new Error("PROJECT_STRUCTURE_MAIN_SITE"); }
  } else if (parsed.phase === "structure-main-frame") {
    if (parsed.params.expression !== EXPRESSIONS[parsed.stage]) { throw new Error("PROJECT_STRUCTURE_MAIN_EXPRESSION"); }
  } else if (parsed.phase === "structure-main-join") {
    const stage = parsed.stage;
    let expectedCount = 1;
    if (stage === "controller") { expectedCount = 3; }
    else if (stage === "driver" || stage === "query-one") { expectedCount = 2; }
    else if (stage === "value") { expectedCount = 0; }
    if (parsed.params.functionDeclaration !== PROGRAMS[stage] || parsed.params.arguments.length !== expectedCount ||
      parsed.params.returnByValue !== ["context-join", "connection", "value"].includes(stage) ||
      parsed.params.arguments.some((arg, index) => Object.hasOwn(arg, "value") !== (stage === "controller" && index === 2))) { throw new Error("PROJECT_STRUCTURE_MAIN_PROGRAM"); }
  }
  return freezeDeep(parsed);
}
/** Decode only the expected source-qualified frame and its pinned direct caller. */
export function decodeCurrentProjectStructureMainPause(input: unknown, stage: Stage, scriptId: string, breakpointId: string): Readonly<{ frameId: string; callerId: string | null }> {
  const frame = z.looseObject({ callFrameId: handle, functionName: z.string().max(128), location: point, functionLocation: point });
  const raw = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(64) }).parse(captureCurrentProjectStructureMainData(input));
  const top = raw.callFrames[0]; const site = SITES[stage]; const fn = FUNCTIONS[site.role];
  if (top === undefined || raw.hitBreakpoints[0] !== breakpointId || top.functionName !== fn.functionName || top.location.scriptId !== scriptId ||
    top.location.lineNumber !== site.lineNumber || top.location.columnNumber !== site.columnNumber || top.functionLocation.scriptId !== scriptId ||
    top.functionLocation.lineNumber !== fn.functionLine || top.functionLocation.columnNumber !== fn.functionColumn) { throw new Error("PROJECT_STRUCTURE_MAIN_PAUSE"); }
  const caller = raw.callFrames[1];
  if (stage === "driver" || stage === "context" || stage === "query-one") {
    const expected = stage === "query-one" ? FUNCTIONS.select : { functionName: "interceptHttpProtocol", functionLine: 1164, functionColumn: 51_072 };
    if (caller === undefined || caller.functionName !== expected.functionName || caller.functionLocation.scriptId !== scriptId ||
      caller.functionLocation.lineNumber !== expected.functionLine || caller.functionLocation.columnNumber !== expected.functionColumn || caller.location.scriptId !== scriptId ||
      caller.location.lineNumber !== (stage === "query-one" ? 8573 : 1164) || caller.location.columnNumber !== (stage === "query-one" ? 5706 : 51_414)) { throw new Error("PROJECT_STRUCTURE_MAIN_CALLER"); }
    return Object.freeze({ frameId: top.callFrameId, callerId: caller.callFrameId });
  }
  return Object.freeze({ frameId: top.callFrameId, callerId: null });
}
