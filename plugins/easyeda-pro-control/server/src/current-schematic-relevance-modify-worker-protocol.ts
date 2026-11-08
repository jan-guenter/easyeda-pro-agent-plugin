/* oxlint-disable unicorn/max-nested-calls -- Closed metadata variants preserve exact fields and side-effect flags. */
/** Pure own7 worker request vocabulary. No event read, arm or resume exists. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as P } from "./current-schematic-relevance-modify-worker-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-worker-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS = freezeDeep([
  ["empty", P.empty, 0, false], ["bind", P.bind, 11, false], ["identities", P.identities, 7, true], ["reprove", P.reprove, 0, true], ["seed", P.seed, 1, false],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true],
  ["project", P.project, 2, false], ["bus", P.bus, 2, false], ["subscription", P.subscription, 2, false], ["task", P.task, 2, false], ["functions", P.functions, 4, false], ["bindings", P.bindings, 5, true],
  ["constructors", P.constructors, 1, false], ["prototypes", P.prototypes, 2, false], ["members", P.members, 2, false], ["native", P.native, 4, true], ["channel", P.channel, 3, true], ["handler", P.handler, 2, false], ["handler-same", P.handlerSame, 3, true], ["dependencies", P.dependencies, 4, false],
] as const);
/** Twelve bounded graphs, twelve prototype waves, 256 correlated new object
 * replies and 160 fixed bootstrap/source/function/native/final reads. Every
 * request also reserves one helper reply in the enclosing original owner. */
const reads = 12 * (12 * 12 + 2) + 256 + 160;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, stages: 12, prototypeWaves: 12, objects: 256, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const argument = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-worker-literal"), method: z.literal("Runtime.evaluate"), params: z.strictObject({ ...flags, expression: z.literal(`(${P.literal})()`), uniqueContextId: handle, returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("modify-worker-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("modify-worker-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("modify-worker-call"), role: z.string().max(64), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(11), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
]);
export type CurrentSchematicRelevanceModifyWorkerCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceModifyWorkerCommand(input: unknown): CurrentSchematicRelevanceModifyWorkerCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-worker-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_WORKER_FIXED_CALL"); } }
  return freezeDeep(command);
}
