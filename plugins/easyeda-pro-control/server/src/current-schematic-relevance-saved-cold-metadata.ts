/** Execute only fixed pinned parser/projection methods on inert saved data.
 * This establishes expected metadata, never a native worker or read receipt. */
import { Script } from "node:vm";
import { z } from "zod";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "./current-generated-initial-cache-source.ts";
import { captureCurrentPcbViaSavedLoadData } from "./current-pcb-via-saved-load-capture.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { GeneratedSchematicRelevanceSavedLoadData } from "./generated-schematic-relevance-saved-load-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const program = `(()=>{"use strict";const input=JSON.parse(payload),location={origin:"https://client"},console={error(){throw new Error("SCHEMATIC_SAVED_PARSE");}};
class Request{};class Response{constructor(body){this.body=body;}};
let ${SOURCE.groupTypes.source};${SOURCE.Gu.source};${SOURCE.Ro.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};
const rows=(${SOURCE.mB.source})({projectUuid:input.projectUuid},input.histories);
const manager={throwError:true,onEditHead(){},onDocHead(){},onLine(){},onEnd(){},${SOURCE.flowParseFull.source}};
const client={consistencyManager:manager,cachePromise:new Set(),cache:{put(){return Promise.resolve();}},${SOURCE.getFlowParse.source}};
for(const chunk of input.chunks){const row=rows.find(value=>value.uuid===chunk.historyUuid);if(!row)throw new Error("SCHEMATIC_SAVED_PARSE_HEAD");const parser=client.getFlowParse(row,chunk.ordinal,true,true);parser.start();parser.update(chunk.plaintext);parser.end();}
return JSON.stringify(rows);})()`;
const parser = new Script(program, { filename: "current-schematic-relevance-saved-cold-metadata.js" });
const resultSchema = z.array(z.record(z.string(), z.unknown())).min(1).max(2);
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_SAVED_COLD_METADATA"); } }
export function deriveCurrentSchematicRelevanceSavedColdMetadata(data: GeneratedSchematicRelevanceSavedLoadData): readonly Readonly<Record<string, unknown>>[] {
  need(data.chunks.length === 2 && data.schematicUuid !== data.documentUuid && /^[a-f\d]{32}$/u.test(data.schematicUuid));
  for (const chunk of data.chunks) {
    const rows = parseNativeRecords(chunk.plaintext); need(rows[0]?.header["type"] === "EDIT_HEAD");
    const ids = new Set<string>();
    for (const row of rows) { if (row.header["type"] === "DOCHEAD") { need(row.body !== null); const uuid = row.body["uuid"]; const type = row.body["docType"];
      need(typeof uuid === "string" && !ids.has(uuid) && (type === "SCH" && uuid === data.schematicUuid || type === "SCH_PAGE" && uuid === data.documentUuid)); ids.add(uuid);
    } } need(ids.has(data.documentUuid) && ids.size > 0 && ids.size <= 2);
  }
  const captured = captureCurrentPcbViaSavedLoadData({ projectUuid: data.projectUuid, histories: data.histories, chunks: data.chunks.map(chunk => ({ historyUuid: chunk.historyUuid, ordinal: chunk.ordinal, plaintext: chunk.plaintext })) });
  let result: unknown;
  try { result = parser.runInNewContext(Object.freeze({ payload: JSON.stringify(captured) }), { timeout: 1000, microtaskMode: "afterEvaluate", contextCodeGeneration: { strings: false, wasm: false } }) as unknown; }
  catch { throw new Error("SCHEMATIC_SAVED_COLD_METADATA_SOURCE"); }
  need(typeof result === "string"); const value: unknown = JSON.parse(result); return freezeDeep(resultSchema.parse(captureCurrentPcbViaSavedLoadData(value)));
}
