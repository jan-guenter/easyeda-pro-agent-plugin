/** Fixed pre-run reads and three original history callback guards. Parsing
 * gives no owner, held frame, caller expression or continuation permission. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_PROGRAM as BASE, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_SAME_PROGRAM as BASE_SAME, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_GROUP_EXPRESSIONS as GROUPS, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUALIFIED_PROGRAM as MERGE, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_EXPRESSIONS as RUN, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_PROOF as RUN_PROOF } from "./current-schematic-relevance-action-prefix-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_INTRINSIC_EXPRESSION as INTRINSICS, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_PROGRAMS as QUEUE } from "./current-schematic-relevance-action-prefix-queue-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_MODULE_EXPRESSIONS as MODULES } from "./current-schematic-relevance-action-prefix-queue-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM as RAW_SAME } from "./current-schematic-relevance-action-raw-programs.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_CONSTRUCTOR as BUS_CONSTRUCTOR, CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_EXTENSIBILITY as BUS_EXTENSIBILITY, CURRENT_SCHEMATIC_RELEVANCE_BUS_GROUP_PREFIX_IDLE as BUS_IDLE } from "./current-schematic-relevance-bus-group-prefix-programs.ts";

const prototypes = String.raw`function(native){"use strict";const get=native[0],has=native[4],keys=native[5],bad=()=>{throw "PREFIX_PROTOTYPES";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};if(!native[7](this)||native[2](this)!==native[16])bad();const length=own(this,"length");if(length>512||keys(this).length!==length+1)bad();const result=[];for(let i=0;i<length;i++){const value=own(this,""+i);if(value!==null&&typeof value!=="object"&&typeof value!=="function")bad();result[i]=value===null?null:native[2](value);}return result;}`;
const triple = "function(a,b,c){\"use strict\";return[a,b,c];}";
const novel = String.raw`function(native,qualified){"use strict";const get=native[0],has=native[4],keys=native[5],bad=()=>{throw "PREFIX_NOVEL";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=o=>{if(!native[7](o)||native[2](o)!==native[16])bad();const n=own(o,"length");if(n>384||keys(o).length!==n+1)bad();return n;};const count=dense(this),known=dense(qualified),result=[];for(let i=0;i<count;i++){const value=own(this,""+i);if(value===null||typeof value!=="object"&&typeof value!=="function")continue;let found=false;for(let j=0;j<known;j++)if(own(qualified,""+j)===value){found=true;break;}for(let j=0;j<result.length;j++)if(result[j]===value){found=true;break;}if(!found)result[result.length]=value;}return result;}`;
/** Native Map.entries creates a separate private iterator. It does not advance
 * the application's iterator or invoke the application generator. */
const mapIterator = String.raw`function(native,intrinsic){"use strict";if(native[2](this)!==native[17])throw "PREFIX_MAP_ITERATOR";const it=native[6](intrinsic[20],this,[]),parent=native[2](it);return[it,parent,native[2](parent)];}`;
const iteratorMembers = String.raw`function(native,qualified,generatorPrototype,iteratorKey){"use strict";const get=native[0],has=native[4],proto=native[2],bad=()=>{throw "PREFIX_ITERATORS";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},known=o=>{for(let i=0;i<qualified.length;i++)if(qualified[i]===o)return;bad();};if(!native[7](this)||this.length!==3||typeof iteratorKey!=="symbol")bad();const map=own(this,1),shared=own(this,2),generator=proto(generatorPrototype),genShared=proto(generator);for(const value of [map,shared,generatorPrototype,generator,genShared])known(value);if(proto(own(this,0))!==map||proto(map)!==shared||genShared!==shared)bad();const mapNext=own(map,"next"),generatorNext=own(generator,"next"),mapIterator=own(shared,iteratorKey),generatorIterator=own(genShared,iteratorKey);if(mapIterator!==generatorIterator)bad();for(const value of [mapNext,generatorNext,mapIterator,generatorIterator])if(typeof value!=="function")bad();return[mapNext,generatorNext,mapIterator,generatorIterator];}`;

export const CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS = freezeDeep([
  ["run", RUN_PROOF, 3, true], ["base", BASE, 12, false], ["base-same", BASE_SAME, 12, true], ["merge", MERGE, 5, false],
  ["raw-same", RAW_SAME, 1, true], ["prototypes", prototypes, 1, false], ["triple", triple, 3, false], ["novel", novel, 2, false], ["map-iterator", mapIterator, 2, false], ["iterator-members", iteratorMembers, 4, false],
  ["queue-roots", QUEUE.roots, 4, false], ["queue-events", QUEUE.events, 3, false], ["queue-details", QUEUE.details, 2, false], ["queue-subscriptions", QUEUE.subscriptions, 1, false],
  ["queue-functions", QUEUE.functions, 9, false], ["queue-same", QUEUE.same, 1, true], ["queue-scopes", QUEUE.scopes, 3, true],
  ["manager", QUEUE.manager, 2, false], ["manager-base", QUEUE.managerBase, 2, true], ["pause-channel", QUEUE.pauseChannel, 2, false],
  ["intrinsic-prototypes", QUEUE.intrinsicPrototypes, 1, false], ["intrinsic-members", QUEUE.intrinsicMembers, 5, false],
  ["container", QUEUE.container, 2, false], ["container-members", QUEUE.containerMembers, 2, false], ["weak-target", QUEUE.weakTarget, 2, true], ["weak-map", QUEUE.weakMap, 6, true],
  ["will-end-root", QUEUE.willEndRoot, 2, false], ["will-end-details", QUEUE.willEndDetails, 2, false], ["will-end-subscription", QUEUE.willEndSubscription, 1, false], ["will-end-functions", QUEUE.willEndFunctions, 6, false],
  ["callback-receiver", QUEUE.callbackReceiver, 2, true],
  ["bus-group-constructor", BUS_CONSTRUCTOR, 1, false], ["bus-group-extensibility", BUS_EXTENSIBILITY, 1, false], ["bus-group-idle", BUS_IDLE, 5, true],
] as const);
export type CurrentSchematicRelevanceRunPrefixCallRole = typeof CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS[number][0];
export const CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND = 4096;
export const CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GUARDS = Object.freeze(["first-start", "will-end", "first-end"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GROUP = "easyeda-pro-control-schematic-relevance-run-prefix-v1";
export const CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const guard = z.enum(CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GUARDS);
const variant = z.union([z.literal(0), z.literal(1)]);
const reference = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frameRole = z.enum(["run", "group", "module", "intrinsics", "empty", "receiver"]);
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(256), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const callRoles = CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS.map(row => row[0]);
const callRole = z.enum(callRoles);
const argumentsSchema = z.array(reference).max(12);
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(32_768), arguments: argumentsSchema, returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const armParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const removeParams = z.strictObject({ breakpointId: handle });
const resumeRole = z.enum(["run", ...CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GUARDS]);
const resumeParams = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("prefix-frame"), role: frameRole, variant, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("prefix-call"), role: callRole, method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("prefix-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("prefix-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("prefix-arm"), role: guard, method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: armParams }),
  z.strictObject({ phase: z.literal("prefix-remove"), role: guard, method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("prefix-resume"), role: resumeRole, method: z.literal("Debugger.resume"), params: resumeParams }),
]);
export type CurrentSchematicRelevanceRunPrefixCommand = z.infer<typeof schema>;
export function currentSchematicRelevanceRunPrefixExpression(role: Extract<CurrentSchematicRelevanceRunPrefixCommand, { phase: "prefix-frame" }>["role"], selected: 0 | 1): string {
  switch (role) {
    case "run": { return RUN[selected]; }
    case "group": { return GROUPS[selected]; }
    case "module": { return MODULES[selected]; }
    case "intrinsics": { return INTRINSICS; }
    case "empty": { return "[]"; }
    case "receiver": { return "[this]"; }
    default: { throw new Error("SCHEMATIC_RUN_PREFIX_FRAME_ROLE"); }
  }
}
export function validateCurrentSchematicRelevanceRunPrefixCommand(input: unknown): CurrentSchematicRelevanceRunPrefixCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "prefix-frame" && command.params.expression !== currentSchematicRelevanceRunPrefixExpression(command.role, command.variant)) { throw new Error("SCHEMATIC_RUN_PREFIX_FIXED_FRAME"); }
  if (command.phase === "prefix-call") {
    const row = CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS.find(value => value[0] === command.role);
    if (row === undefined || command.params.functionDeclaration !== row[1] || command.params.arguments.length !== row[2] || command.params.returnByValue !== row[3]) { throw new Error("SCHEMATIC_RUN_PREFIX_FIXED_CALL"); }
  }
  return freezeDeep(command);
}
