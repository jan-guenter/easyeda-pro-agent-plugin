/** Fixed original-main Date/parser observations for one read-only native birth.
 * No supplied program, callback, parser or writer enters this grammar. */
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_REQUIRE_PROGRAM, specializeCurrentFootprintHeadAgeControls } from "./current-footprint-head-age-context.ts";
import { types } from "node:util";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { buildCurrentAgedSqlClockControls, validateCurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import type { CurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS } from "./current-footprint-copy-main-backend-programs.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";
import type { ClockControlScope } from "./symbol-clock-controls.ts";

export const CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS = Object.freeze(["getTime", "toISOString", "getTimezoneOffset", "getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getSeconds", "getMilliseconds"] as const);
export type CurrentFootprintHeadAgeDateMethod = typeof CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS[number];
const marker = { createdAtLiteral: "1987-09-23 01:02:03", referenceUtcMs: 1_721_111_111_123 };
const markerWall = Date.parse(`${marker.createdAtLiteral.replace(" ", "T")}Z`);
const originalControls = specializeCurrentFootprintHeadAgeControls(buildCurrentAgedSqlClockControls(marker, "main-reference"));
const controls = originalControls.replaceAll(JSON.stringify(marker.createdAtLiteral), "createdAtLiteral")
  .replaceAll(String(marker.referenceUtcMs), "referenceUtcMs").replace(`wallMs=${String(markerWall)}`, "wallMs=wallEpochMs");
if (controls === originalControls || controls.includes(JSON.stringify(marker.createdAtLiteral)) || controls.includes(String(marker.referenceUtcMs)) ||
  controls.includes(`wallMs=${String(markerWall)}`)) { throw new Error("FOOTPRINT_HEAD_AGE_FIXED_PROGRAM"); }
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_HEAD_AGE_MAIN");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const arr=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const requireOriginal=${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS.require.program};
const methodNames=${JSON.stringify(CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS)};
const original=o=>{arr(o,13);if(Reflect.apply(requireOriginal,own(o,"0"),[o])!==true)bad();};
const requireHeadContext=${CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_REQUIRE_PROGRAM};
const select=(o,context)=>{original(o);if(Reflect.apply(requireHeadContext,undefined,[context])!==true)bad();const date=own(o,"10"),now=own(o,"11"),parser=own(o,"12"),prototype=own(date,"prototype"),methods=methodNames.map(name=>own(prototype,name));
for(let i=0;i<methods.length;i++){const fn=methods[i],name=methodNames[i];if(typeof fn!=="function"||own(fn,"name")!==name||own(fn,"length")!==0||Function.prototype.toString.call(fn)!=="function "+name+"() { [native code] }")bad();}
return[o,date,now,parser,prototype,...methods,context];};
const same=a=>{arr(a,16);const fresh=select(own(a,"0"),own(a,"15"));for(let i=0;i<16;i++)if(own(a,String(i))!==fresh[i])bad();};`;

// The fixed helper's original() predicate cannot be shadowed by its argument.
export const CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM = `function(retained,context){${helpers}\nreturn select(retained,context);}`;
export const CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM = `function(createdAtLiteral,wallEpochMs){${helpers}
const retained=this;same(retained);const headAgeContext=own(retained,"15");
if(typeof createdAtLiteral!=="string"||createdAtLiteral.length!==19||!Number.isSafeInteger(wallEpochMs))bad();
const date=own(retained,"1"),now=own(retained,"2"),parser=own(retained,"3"),prototype=own(retained,"4"),getTime=own(retained,"5");
const referenceUtcMs=Reflect.apply(now,date,[]);same(retained);if(!Number.isSafeInteger(referenceUtcMs)||referenceUtcMs<0)bad();
const parse=()=>{same(retained);let value;try{value=Reflect.apply(parser,undefined,[createdAtLiteral]);}finally{same(retained);}
if(Object.getPrototypeOf(value)!==prototype)bad();let ms;try{ms=Reflect.apply(getTime,value,[]);}finally{same(retained);}if(!Number.isSafeInteger(ms)||Object.is(ms,-0))bad();return ms;};
const parsedBeforeMs=parse();same(retained);const controls=${controls};same(retained);const parsedAfterMs=parse();same(retained);
const selected=controls.controlsBefore.sql[0],offset=controls.controlsBefore.clockBefore.offsetMinutes;
if(!selected||parsedBeforeMs!==parsedAfterMs||parsedBeforeMs!==selected.epochMs-offset*60000)bad();
return{profile:"private.current-footprint-head-age-main.v1",scope:{createdAtLiteral,referenceUtcMs},controls,parsedBeforeMs,parsedAfterMs,executionAuthorized:false};}`;

/** Keep decoder refusals independent of foreign values and exception text. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_HEAD_AGE_MAIN_REPLY"); } }
/** Copy only bounded own primitive data. The exhaustive scan's 1681-entry
 * arrays have their own bound; the ordinary small clock decoder is unchanged. */
export function captureCurrentFootprintHeadAgeReply(input: unknown): Readonly<{ value: unknown; text: string; sha256: string }> {
  let nodes = 0; const seen = new Set<object>();
  /** Copy bounded own JSON data recursively, rejecting hooks, aliases and
   * non-finite values before any result is hashed or projected. */
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; need(nodes <= 10_000 && depth <= 16);
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") { need(value.length <= 16_384 && value.isWellFormed()); return value; }
    if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0)); return value; }
    need(typeof value === "object" && !types.isProxy(value) && !seen.has(value)); seen.add(value);
    /** Read one enumerable own data field without invoking an accessor. */
    const own = (key: string): unknown => { const field = Object.getOwnPropertyDescriptor(value, key); need(field !== undefined && Object.hasOwn(field, "value") && field.enumerable === true); return field.value as unknown; };
    if (Array.isArray(value)) {
      need(Object.getPrototypeOf(value) === Array.prototype && value.length <= 2048 && Reflect.ownKeys(value).length === value.length + 1);
      return Object.freeze(Array.from({ length: value.length }, (_, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    need((prototype === Object.prototype || prototype === null) && keys.length <= 48);
    const result: Record<string, unknown> = {};
    for (const key of keys) { need(typeof key === "string" && key.length <= 128 && key.isWellFormed()); Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true }); }
    return Object.freeze(result);
  };
  const value = copy(input, 0); const text = JSON.stringify(value); need(Buffer.byteLength(text) <= 131_072); return Object.freeze({ value, text, sha256: sha256Text(text) });
}
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
/** Return only the ten fixed method handles after their complete remote array
 * roster is checked. Later native metadata checks admit each original handle. */
export function decodeCurrentFootprintHeadAgeArray(input: unknown): readonly string[] {
  const reply = z.object({ result: z.array(property).length(17), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 17);
  const length = fields.get("length"), parent = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === 16 && length.writable && !length.enumerable && !length.configurable && length.value.objectId === undefined &&
    parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined && parent.value.value === undefined);
  const ids: string[] = [];
  for (let index = 0; index < 16; index += 1) {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable &&
      field.value.objectId !== undefined && field.value.value === undefined && field.value.subtype !== "proxy");
    if (index >= 5 && index < 15) { const name = CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS[index - 5]; need(field.value.type === "function" && field.value.className === "Function" && field.value.description === `function ${String(name)}() { [native code] }`); ids.push(field.value.objectId); }
  }
  need(new Set(ids).size === ids.length); return Object.freeze(ids);
}
/** Require each actual native method's zero-scope V8 metadata, refusing a
 * JavaScript wrapper even if it returns matching clock values. */
export function decodeCurrentFootprintHeadAgeNativeMethod(input: unknown, name: CurrentFootprintHeadAgeDateMethod): void {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(2) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === 2);
  for (const key of ["name", "length"] as const) { const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? name : 0) && field.value.objectId === undefined && !Object.is(field.value.value, -0)); }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
export interface CurrentFootprintHeadAgeMainObservation {
  readonly profile: "private.current-footprint-head-age-main.v1"; readonly scope: ClockControlScope;
  readonly controls: CurrentAgedSqlClockControls; readonly parsedBeforeMs: number; readonly parsedAfterMs: number; readonly executionAuthorized: false;
}
/** Validate the complete native scan and actual rl results without granting
 * provenance. Only the retained native factory can join the result to a head. */
export function decodeCurrentFootprintHeadAgeMainObservation(input: unknown, createdAtLiteral: string): CurrentFootprintHeadAgeMainObservation {
  const captured = captureCurrentFootprintHeadAgeReply(input).value;
  const value = z.object({ profile: z.literal("private.current-footprint-head-age-main.v1"), scope: z.unknown(), controls: z.unknown(),
    parsedBeforeMs: z.number().int(), parsedAfterMs: z.number().int(), executionAuthorized: z.literal(false) }).strict().parse(captured);
  const suppliedScope = validateClockControlScope(value.scope); need(suppliedScope.createdAtLiteral === createdAtLiteral);
  const decoded = validateCurrentAgedSqlClockControls(value.controls, suppliedScope, "main-reference"), selected = decoded.controlsBefore.sql[0]; need(selected !== undefined);
  need(value.parsedBeforeMs === value.parsedAfterMs && value.parsedBeforeMs === selected.epochMs - decoded.controlsBefore.clockBefore.offsetMinutes * 60_000);
  return Object.freeze({ ...value, scope: suppliedScope, controls: decoded });
}
