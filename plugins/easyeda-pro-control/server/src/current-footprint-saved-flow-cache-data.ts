/** Isolated execution of fixed source parser/projection functions on bounded
 * inert plaintext. These values grant no native client, cache or continuation. */
import { Script } from "node:vm";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "./current-generated-initial-cache-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const hash = z.string().regex(/^[a-f\d]{64}$/u), uuid = z.string().regex(/^[a-f\d]{32}$/u);
const scalar = z.union([z.string().max(1024), z.number().int(), z.null()]);
const headSchema = z.strictObject({ id: z.number().int().positive(), uuid, parent: uuid.nullable(), key: uuid,
  is_lock: z.union([z.literal(0), z.literal(1)]), num: z.number().int().min(0).max(7), snapshot_num: z.literal(0), created_at: scalar, updated_at: scalar, lock_time: scalar });
const chunkSchema = z.strictObject({ historyUuid: uuid, ordinal: z.number().int().min(0).max(7), plaintext: z.string().min(1).max(16_384), plaintextSha256: hash });
const inputSchema = z.strictObject({ projectUuid: hash, branchUuid: uuid, headHistoryUuid: uuid, heads: z.array(headSchema).min(1).max(8),
  chunks: z.array(chunkSchema).min(1).max(8) });
export type CurrentFootprintSavedFlowCacheInput = Readonly<z.infer<typeof inputSchema>>;
const bodySchema = z.strictObject({ historyUuid: uuid, ordinal: z.number().int().min(0).max(7), url: z.string().max(1024), body: z.string().max(16_384) });
const outputSchema = z.strictObject({ bodies: z.array(bodySchema).max(8), headIndexBody: z.string().max(16_384) });
const PROGRAM = `(()=>{'use strict';
const input=JSON.parse(payload),location={origin:'https://client'},console={error(){throw new Error('FOOTPRINT_FLOW_PARSE')}};
class Request{};class Response{constructor(body){this.body=body;}}
let ${SOURCE.groupTypes.source};
${SOURCE.Gu.source};${SOURCE.Ro.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};
const project={projectUuid:input.projectUuid},projectRows=(${SOURCE.mB.source})(project,input.heads.map(row=>({...row,iv:row.uuid})));
const bodies=[];let active=null;
const manager={throwError:true,onEditHead(){},onDocHead(doc){if(!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(doc.uuid)||typeof doc.docType!=='string'||!doc.docType)throw new Error('FOOTPRINT_FLOW_DOC');},onLine(){},onEnd(){},${SOURCE.flowParseFull.source}};
const client={consistencyManager:manager,cachePromise:new Set(),cache:{put(url,response){if(!active||typeof url!=='string'||!(response instanceof Response)||typeof response.body!=='string')throw new Error('FOOTPRINT_FLOW_CACHE');bodies.push({historyUuid:active.historyUuid,ordinal:active.ordinal,url,body:response.body});return Promise.resolve();}},${SOURCE.getFlowParse.source}};
for(const chunk of input.chunks){active=chunk;const row=projectRows.find(value=>value.uuid===chunk.historyUuid);if(!row)throw new Error('FOOTPRINT_FLOW_HEAD');const parser=client.getFlowParse(row,chunk.ordinal,true,true);parser.start();parser.update(chunk.plaintext);parser.end();active=null;}
return JSON.stringify({bodies,headIndexBody:JSON.stringify(projectRows)});
})()`;
const parser = new Script(PROGRAM, { filename: "current-footprint-saved-flow-cache-data.js" });
export const CURRENT_FOOTPRINT_SAVED_FLOW_CACHE_PROJECTION_SHA256 = sha256Text(PROGRAM);
export interface CurrentFootprintSavedFlowCacheData {
  readonly schema: "private.current-footprint-saved-flow-cache-data.v1"; readonly projectUuid: string; readonly branchUuid: string; readonly headHistoryUuid: string;
  readonly projectionSourceSha256: string; readonly namespace: string;
  readonly bodies: readonly Readonly<{ historyUuid: string; ordinal: number; url: string; body: string; sha256: string }>[];
  /** Private native key material is retained here. Never print or journal the
   * raw index body as an operation result or error. */
  readonly headIndex: Readonly<{ url: string; body: string; sha256: string }>;
  readonly suppliedObservationsOnly: true; readonly nativeWorkerOwnershipVerified: false; readonly cacheContinuationAuthorized: false; readonly completeUploadFrontierVerified: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_SAVED_FLOW_CACHE_DATA"); } }
/** Immutable inert input, not a saved checkpoint or native authority. */
export function captureCurrentFootprintSavedFlowCacheInput(input:unknown):CurrentFootprintSavedFlowCacheInput {
  return freezeDeep(inputSchema.parse(captureCurrentPcbStringClockReply(input).value));
}
/** A strict subset: eight chunks,16KiB per plaintext chunk,32KiB combined and
 * the existing cache profile's eight bodies/8KiB per body/32KiB total. */
export function deriveCurrentFootprintSavedFlowCacheData(input: unknown): CurrentFootprintSavedFlowCacheData {
  const seen = new Set<string>(), value = captureCurrentFootprintSavedFlowCacheInput(input);
  need(value.heads[0]?.uuid === value.headHistoryUuid && new Set(value.heads.map(head => head.uuid)).size === value.heads.length);
  let bytes = 0;
  for (const [index, head] of value.heads.entries()) { need(head.parent === (value.heads[index + 1]?.uuid ?? null) && (index === 0 || head.id < (value.heads[index - 1]?.id ?? 0))); }
  for (const chunk of value.chunks) {
    const head = value.heads.find(row => row.uuid === chunk.historyUuid), slot = `${chunk.historyUuid}/${String(chunk.ordinal)}`;
    need(head !== undefined && chunk.ordinal <= head.num && !seen.has(slot) && sha256Text(chunk.plaintext) === chunk.plaintextSha256); seen.add(slot); bytes += Buffer.byteLength(chunk.plaintext);
  }
  need(bytes <= 32_768 && value.heads.every(head => Array.from({ length: head.num + 1 }, (_, ordinal) => seen.has(`${head.uuid}/${String(ordinal)}`)).every(Boolean)));
  let raw: unknown;
  try { raw = parser.runInNewContext(Object.freeze({ payload: JSON.stringify(value) }), { timeout: 1000, microtaskMode: "afterEvaluate", contextCodeGeneration: { strings: false, wasm: false } }) as unknown; }
  catch { throw new Error("FOOTPRINT_SAVED_FLOW_CACHE_PROJECTION"); }
  need(typeof raw === "string"); const parsed: unknown = JSON.parse(raw); const output = outputSchema.parse(captureCurrentPcbStringClockReply(parsed).value);
  const urls = new Set<string>(); let cacheBytes = Buffer.byteLength(output.headIndexBody);
  need(cacheBytes <= 8192 && output.bodies.length + 1 <= 8);
  const bodies = output.bodies.map(body => {
    need(!urls.has(body.url) && body.body.length > 0 && Buffer.byteLength(body.body) <= 8192); urls.add(body.url); cacheBytes += Buffer.byteLength(body.body);
    const prefix = `https://client/dataStr/${body.historyUuid}${body.ordinal === 0 ? "" : `-${String(body.ordinal)}`}-`;
    need(body.url.startsWith(prefix) && /^(?:[a-f\d]{16}|[a-f\d]{32}|SYMBOL|FOOTPRINT|BLOB|FONT|PANEL_LIB|DEVICE|BOARD|INSTANCE|CONFIG|VARIANT|COMPONENT_GROUP|COMPONENT_GROUP_DATA)$/u.test(body.url.slice(prefix.length)));
    return freezeDeep({ ...body, sha256: sha256Text(body.body) });
  });
  need(cacheBytes <= 32_768 && bodies.some(body => body.url.endsWith("-FOOTPRINT")));
  const data: CurrentFootprintSavedFlowCacheData = freezeDeep({ schema: "private.current-footprint-saved-flow-cache-data.v1", projectUuid: value.projectUuid, branchUuid: value.branchUuid,
    headHistoryUuid: value.headHistoryUuid, projectionSourceSha256: CURRENT_FOOTPRINT_SAVED_FLOW_CACHE_PROJECTION_SHA256, namespace: `project_${value.projectUuid}_v6`, bodies,
    headIndex: { url: `https://client/index/v1/${value.branchUuid}`, body: output.headIndexBody, sha256: sha256Text(output.headIndexBody) },
    suppliedObservationsOnly: true, nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false });
  need(canonicalJson(data).length <= 131_072); return data;
}
