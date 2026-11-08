/** Pure own7 worker source/metadata validation. No inverse receipt or runtime
 * ownership follows from any supplied Inspector packet. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceUiPublicationProperties as properties } from "./current-schematic-relevance-ui-publication-replies.ts";
import type { CurrentSchematicRelevanceUiPublicationRemote as Remote } from "./current-schematic-relevance-ui-publication-replies.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE = freezeDeep({
  "bytes": 2_181_308,
  "sha256": "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
  "roles": {
    "projectConstructor": {
      "start": 2_103_271,
      "end": 2_146_929,
      "bytes": 43_658,
      "sha256": "11b7649703cac600e6cadf99f64c2f55c5099fa2f3ff84548be7e78dc89ddce0",
      "name": "Lg",
      "arity": 2,
      "kind": "class",
      "lineNumber": 110,
      "columnNumber": 89_089
    },
    "channelConstructor": {
      "start": 11_672,
      "end": 12_718,
      "bytes": 1046,
      "sha256": "7205fbe0dc77e5742396733391d21b158dac507da6ce7b57ed9808ed24cd0812",
      "name": "JP",
      "arity": 1,
      "kind": "class",
      "lineNumber": 0,
      "columnNumber": 11_700
    },
    "busConstructor": {
      "start": 9717,
      "end": 11_668,
      "bytes": 1951,
      "sha256": "5012c1ef383ce45df668a00f61fb48621b2e50112d9bd15b3e891893a80d18a3",
      "name": "KP",
      "arity": 0,
      "kind": "class",
      "lineNumber": 0,
      "columnNumber": 9745
    },
    "baseConstructor": {
      "start": 8169,
      "end": 8985,
      "bytes": 816,
      "sha256": "aa3a0f4b1e732bc498df082f496f4d926666a095c16da4af973fa790e8e83a09",
      "name": "Mb",
      "arity": 0,
      "kind": "class",
      "lineNumber": 0,
      "columnNumber": 8186
    },
    "onMessage": {
      "start": 11_813,
      "end": 12_230,
      "bytes": 417,
      "sha256": "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308",
      "name": "onMessage",
      "arity": 1,
      "kind": "method",
      "lineNumber": 0,
      "columnNumber": 11_822
    },
    "onReceivedPublish": {
      "start": 10_418,
      "end": 10_687,
      "bytes": 269,
      "sha256": "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa",
      "name": "onReceivedPublish",
      "arity": 3,
      "kind": "method",
      "lineNumber": 0,
      "columnNumber": 10_435
    },
    "handler": {
      "start": 11_785,
      "end": 11_812,
      "bytes": 27,
      "sha256": "d257238e1366dbd0132b6a8f3445117f2db2c2c2daa50815aaacf4de8506d4b7",
      "name": "",
      "arity": 1,
      "kind": "arrow",
      "lineNumber": 0,
      "columnNumber": 11_785
    },
    "batch": {
      "start": 2_112_964,
      "end": 2_113_127,
      "bytes": 163,
      "sha256": "5b5f03a9346121779b5b03167c78c63b1771ac840c0193ae08b4362f3f1669e2",
      "name": "",
      "arity": 1,
      "kind": "arrow",
      "lineNumber": 110,
      "columnNumber": 98_754
    },
    "taskConstructor": {
      "start": 7928,
      "end": 8165,
      "bytes": 237,
      "sha256": "b2cfc4d7b5ae6c0f08a2d5277ffd779403685308be265d6cca6bd9e89645cdc8",
      "name": "wu",
      "arity": 2,
      "kind": "class",
      "lineNumber": 0,
      "columnNumber": 7945
    },
    "running": {
      "start": 8045,
      "end": 8077,
      "bytes": 32,
      "sha256": "adb3cd3837fa32d458dc61d19a39f15d6e1daf9ddcd8dd698582dd13a4430b35",
      "name": "running",
      "arity": 0,
      "kind": "method",
      "lineNumber": 0,
      "columnNumber": 8052
    },
    "execute": {
      "start": 8077,
      "end": 8164,
      "bytes": 87,
      "sha256": "09ae1ae955dd319fee3e34c7819bb1f061e8c74ecb48c7851a3ba6f3b2091f27",
      "name": "execute",
      "arity": 1,
      "kind": "method",
      "lineNumber": 0,
      "columnNumber": 8090
    }
  }
} as const);
export type CurrentSchematicRelevanceModifyWorkerRole = keyof typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE.roles;
/** Reject inconsistent source/native metadata using the worker reader's
 * closed error code rather than inspecting or returning an application error. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_WORKER_METADATA"); } }
/** Select one own data descriptor from a proxy-checked metadata reply. An
 * accessor or Proxy-valued field cannot become the next traversed worker ref. */
export function currentSchematicRelevanceModifyWorkerField(input: unknown, key: string): Remote {
  const row = properties(input).result.find(value => value.name === key); need(row?.value !== undefined && row.get === undefined && row.set === undefined && row.value.subtype !== "proxy"); return row.value;
}
/** Obtain the actual Inspector prototype handle while rejecting a Proxy
 * parent; this does not infer inheritance from a supplied object description. */
export function currentSchematicRelevanceModifyWorkerParent(input: unknown): Remote {
  const row = properties(input).internalProperties?.find(value => value.name === "[[Prototype]]"); need(row !== undefined && row.value.subtype !== "proxy"); return row.value;
}
export function currentSchematicRelevanceModifyWorkerScript(input: unknown): string {
  const location = properties(input).internalProperties?.find(row => row.name === "[[FunctionLocation]]");
  need(location?.value.subtype === "internal#location"); return z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(location.value.value).scriptId;
}
/** Require the complete pinned worker bytes and every selected callable span
 * before its source locations can be used by later metadata comparisons. */
export function qualifyCurrentSchematicRelevanceModifyWorkerSource(source: string): void {
  const expected = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE;
  need(source.isWellFormed() && Buffer.byteLength(source) === expected.bytes && createHash("sha256").update(source).digest("hex") === expected.sha256);
  for (const row of Object.values(expected.roles)) { const span = source.slice(row.start, row.end); need(Buffer.byteLength(span) === row.bytes && createHash("sha256").update(span).digest("hex") === row.sha256); }
}
/** Join one described class/method/arrow to its exact own fields, full source
 * digest and original script/location; matching text alone grants no receiver. */
export function qualifyCurrentSchematicRelevanceModifyWorkerFunction(input: unknown, actual: Remote | undefined, role: CurrentSchematicRelevanceModifyWorkerRole, scriptId: string): void {
  const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE.roles[role]; need(actual?.type === "function" && actual.className === "Function" && actual.objectId !== undefined && actual.subtype === undefined && typeof actual.description === "string");
  need(Buffer.byteLength(actual.description) === row.bytes && createHash("sha256").update(actual.description).digest("hex") === row.sha256);
  const packet = properties(input); const names = packet.result.map(value => value.name); const expected = row.kind === "class" ? ["name", "length", "prototype"] : ["name", "length"];
  need(names.length === expected.length && expected.every(name => names.includes(name)));
  for (const [name, value] of [["name", row.name], ["length", row.arity]] as const) { const field = packet.result.find(item => item.name === name); need(field?.value?.value === value && field.writable === false && field.configurable && !field.enumerable && field.get === undefined && field.set === undefined); }
  if (row.kind === "class") { const field = packet.result.find(item => item.name === "prototype"); need(field?.value?.type === "object" && field.value.objectId !== undefined && field.writable === false && !field.configurable && !field.enumerable); }
  const internal = packet.internalProperties ?? []; need(internal.length === 3 && currentSchematicRelevanceModifyWorkerScript(input) === scriptId);
  const at = internal.find(value => value.name === "[[FunctionLocation]]"); const location = z.strictObject({ scriptId: z.string(), lineNumber: z.number(), columnNumber: z.number() }).parse(at?.value.value);
  need(location.lineNumber === row.lineNumber && location.columnNumber === row.columnNumber && internal.some(value => value.name === "[[Scopes]]" && value.value.subtype === "internal#scopeList") && internal.some(value => value.name === "[[Prototype]]" && value.value.type === "function" && value.value.objectId !== undefined));
}
export function currentSchematicRelevanceModifyWorkerString(input: unknown): string {
  return z.strictObject({ result: z.strictObject({ type: z.literal("string"), value: z.string().min(1).max(2048) }) }).parse(captureCurrentPcbStringClockReply(input).value).result.value;
}
