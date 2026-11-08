/** Explicit test-only source seam. The sparse images retain pinned function
 * bytes/locations and are deliberately NOT complete installed source. No live
 * source qualifier, owner registry or production module is modified. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";

const hash=(text:string):string=>createHash("sha256").update(text).digest("hex");
const checksum=z.string().regex(/^[a-f0-9]{64}$/u);
const segmentSchema=z.strictObject({start:z.number().int().nonnegative(),end:z.number().int().positive(),text:z.string(),sha256:checksum});
const lengths=z.array(z.number().int().nonnegative()).max(5000),segments=z.array(segmentSchema).max(100);
const schema=z.strictObject({schema:z.literal("test-only.current209-source-excerpts.v1"),kind:z.enum(["worker","sch"]),completeSourceSha256:checksum,completeSourceBytes:z.number().int().positive(),utf16Length:z.number().int().positive(),syntheticSha256:checksum,lineLengths:lengths,segments});
function load(kind:"worker"|"sch"):string {
 // oxlint-disable-next-line node/no-sync -- Test-only immutable excerpts must also load synchronously in the synthetic child require graph.
 const input:unknown=JSON.parse(readFileSync(new URL(`../fixtures/current209-${kind}-source-excerpts.json`,import.meta.url),"utf8"));const data=schema.parse(input);assert.equal(data.kind,kind);
 let source=data.lineLengths.map(length=>" ".repeat(length)).join("\n");assert.equal(source.length,data.utf16Length);
 for(const row of data.segments){assert.equal(row.end-row.start,row.text.length);assert.ok(row.end<=source.length);assert.equal(hash(row.text),row.sha256);source=source.slice(0,row.start)+row.text+source.slice(row.end);}
 assert.equal(hash(source),data.syntheticSha256);assert.notEqual(hash(source),data.completeSourceSha256);return source;
}
export const CURRENT209_SYNTHETIC_WORKER_SOURCE=load("worker");
export const CURRENT209_SYNTHETIC_SCH_SOURCE=load("sch");
/** Retained source-table checks remain executable without an installation.
 * This never treats an excerpt or a sparse fixture as full source identity. */
export function assertCurrent209PinnedSourceRows(input:object):void {
 let checked=0;
 const visit=(value:unknown):void=>{if(value===null||typeof value!=="object"){return;}const bytes:unknown=Reflect.get(value,"bytes"),sha:unknown=Reflect.get(value,"sha256"),text:unknown=Reflect.get(value,"source");if(typeof text==="string"&&typeof sha==="string"&&typeof bytes==="number"){assert.equal(Buffer.byteLength(text),bytes);assert.equal(hash(text),sha);checked+=1;}for(const child of Object.values(value)){visit(child);}};
 visit(input);assert.ok(checked>0);
}
const tokens=new WeakSet<object>();
const worker=(source:unknown):void=>{assert.equal(source,CURRENT209_SYNTHETIC_WORKER_SOURCE);};
const sourceQualifiers:Readonly<Record<string,string>>=Object.freeze({
 "./current-project-sync-quiesce-source.ts":"qualifyCurrentProjectSyncQuiesceSource",
 "./current-project-save-producer-source.ts":"qualifyCurrentProjectSaveProducerSource",
 "./current-project-save-producer-guard-source.ts":"qualifyCurrentProjectSaveProducerGuardSource",
 "./current-project-save-producer-cache-source.ts":"qualifyCurrentProjectSaveProducerCacheSource",
 "./current-project-save-structure-protocol.ts":"qualifyCurrentProjectSaveStructureSource",
 "./current-project-structure-transport-source.ts":"qualifyCurrentProjectStructureTransportSource",
 "./current-generated-initial-sync-source.ts":"qualifyCurrentGeneratedInitialSyncSource",
 "./current-generated-periodic-sync-source.ts":"qualifyCurrentGeneratedPeriodicSyncSource",
});
/** Used only in explicit VM require seams. Ordinary exports and all function
 * metadata/descriptor decoders stay genuine; only full-file admission differs. */
export function current209SyntheticSourceModule(name:string,actual:unknown):unknown {
 if(actual===null||typeof actual!=="object"){return actual;}
 const qualifier=sourceQualifiers[name];if(qualifier!==undefined){return{...actual,[qualifier]:worker};}
 if(name==="./current-schematic-display-save-source.ts"){
  const qualify=(source:unknown):object=>{worker(source);const token=Object.freeze({profile:"private.current-schematic-display-save-source.v1",invocationObserved:false});tokens.add(token);return token;};
  const capture=(raw:unknown):Readonly<{scriptSource:string}>=>{assert.ok(raw!==null&&typeof raw==="object");assert.deepEqual(Reflect.ownKeys(raw),["scriptSource"]);const descriptor=Object.getOwnPropertyDescriptor(raw,"scriptSource");assert.ok(descriptor!==undefined&&Object.hasOwn(descriptor,"value"));worker(descriptor.value);return Object.freeze({scriptSource:CURRENT209_SYNTHETIC_WORKER_SOURCE});};
  return{...actual,qualifyCurrentSchematicDisplaySaveSource:qualify,requireOriginalCurrentSchematicDisplaySaveSource:(token:object):void=>{assert.ok(tokens.has(token));},captureCurrentSchematicDisplaySaveScriptReply:capture,qualifyCurrentSchematicDisplaySaveScriptReply:(raw:unknown):object=>qualify(capture(raw).scriptSource)};
 }
 if(name==="./generated-schematic-display-accessor-replies.ts"){return{...actual,qualifyGeneratedSchematicDisplayAccessorSource:(raw:unknown):0=>{assert.ok(raw!==null&&typeof raw==="object");assert.equal(Reflect.get(raw,"scriptSource"),CURRENT209_SYNTHETIC_SCH_SOURCE);return 0;}};}
 return actual;
}
