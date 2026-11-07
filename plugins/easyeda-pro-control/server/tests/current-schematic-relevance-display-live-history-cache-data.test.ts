/** Actual pinned parser/merge methods on inert data, with no native owner,
 * cache write, project, SQL reader or continuation authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "../src/current-generated-initial-sync-source.ts";
import { compareCurrentSchematicRelevanceDisplayLiveHistoryCacheData as compare } from "../src/current-schematic-relevance-display-live-history-cache-data.ts";
import { viaLiveHistoryCacheInput } from "./helpers/via-live-history-cache-data.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

function fixture(mode: "mutable" | "append"): Parameters<typeof compare>[0] {
  const base = viaLiveHistoryCacheInput(mode), { args, history } = data();
  const schematicUuid = args.target.schematicUuid, textId = args.operation.textId;
  const documents = history.documents.map(document => { const documentUuid = document.docType === "SCH" ? schematicUuid : base.documentUuid;
    const body = [`{"type":"DOCHEAD"}||${JSON.stringify({ docType: document.docType, uuid: documentUuid })}`, ...document.records.map(row => `${JSON.stringify({ type: row.type, ticket: row.ticket, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
    return { documentUuid, url: `https://client/dataStr/${base.initial.historyUuid}-${documentUuid}`, body, sha256: sha256Text(body) };
  });
  const index: unknown = JSON.parse(base.initial.headIndex.body); assert.ok(Array.isArray(index)); const first: unknown = index[0]; assert.ok(first !== null && typeof first === "object");
  Reflect.set(first, "docs", [Object.fromEntries(documents.map(row => [row.documentUuid, 0]))]); Reflect.set(first, "docIds", [documents.map(row => row.documentUuid)]); const indexBody = JSON.stringify(index);
  const body = `{"type":"DOCHEAD","ticket":20}||${JSON.stringify({ docType: "SCH_PAGE", client: "fixed", uuid: base.documentUuid, updateTime: base.clock, version: String(base.clock) })}|\n${JSON.stringify({ type: "TEXT", ticket: 13, id: textId })}||${JSON.stringify({ ...args.operation.afterBody, zIndex: 1 })}`;
  const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify(base.effects.actor)}|\n${body}`;
  return { projectUuid: base.projectUuid, branchUuid: base.branchUuid, schematicUuid, clock: base.clock, plaintext,
    delta: { schema: "private.generated-schematic-relevance-display-save-delta.v1", documentUuid: base.documentUuid, textId, textTicket: 13, headTicket: 20, maximumTicketBeforeSave: 19, body, bodySha256: sha256Text(body), workerEditVersion: null, normalizedTextZIndex: 1, actualPendingDataMatched: true, originalPendingNodeProvenanceVerified: false, originalClockProvenanceVerified: false, originalEffectProvenanceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false },
    initial: { ...base.initial, documents, headIndex: { ...base.initial.headIndex, body: indexBody, sha256: sha256Text(indexBody) } }, initialBranch: base.initialBranch,
    effects: { ...base.effects, plaintextSha256: sha256Text(plaintext), bodySha256: sha256Text(body) }, native: base.native };
}
function actual(input: Parameters<typeof compare>[0]): unknown {
  const hd = CALLEES.find(value => value.name === "hd"); const ag = CALLEES.find(value => value.name === "ag"); assert.ok(hd !== undefined && ag !== undefined);
  return runInNewContext(`(()=>{const input=${JSON.stringify(input)},location={origin:"https://client"};class Request{}class Response{constructor(body){this.body=body;}}const puts=[],pending=[];
${SOURCE.Gu.source};${SOURCE.Ro.source};let ${SOURCE.groupTypes.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};${SOURCE.mB.source};${ag.source};${hd.source};
class Parser{${SOURCE.flowParseFull.source};onDocHead(){}onLine(){}onEnd(){}}
const initial=JSON.parse(input.initial.headIndex.body),api=mB({projectUuid:input.projectUuid},input.native.rows),index=hd(api,initial),head=index[0];
const worker={consistencyManager:new Parser,cachePromise:new Set,cache:{put(url,response){puts.push({url,body:response.body});const promise=new Promise(()=>{});pending.push(promise);return promise;}},${SOURCE.getFlowParse.source}};
const flow=worker.getFlowParse(head,input.effects.historyNum,true,true);flow.start();flow.update(input.plaintext);flow.end();return{indexBody:JSON.stringify(index),puts,pending:pending.length};})()`);
}
void test("both changed-head modes preserve the full parent/page index and exact vendor TEXT cache bytes", () => {
  for (const mode of ["mutable", "append"] as const) { const input = fixture(mode); const result = compare(input); const observed: unknown = structuredClone(actual(input)); assert.ok(observed !== null && typeof observed === "object");
    assert.equal(result.headIndex.body, Reflect.get(observed, "indexBody")); assert.deepEqual(Reflect.get(observed, "puts"), result.documents.map(({ url, body }) => ({ url, body }))); assert.equal(Reflect.get(observed, "pending"), 1);
    assert.equal(result.documents.length, 1); assert.equal(result.documents[0]?.documentUuid, input.delta.documentUuid); assert.equal(result.cacheContinuationAuthorized, false); assert.equal(result.completeUploadFrontierVerified, false);
    assert.throws(() => compare({ ...input, initial: { ...input.initial, documents: input.initial.documents.slice(1) } }));
    assert.throws(() => compare({ ...input, delta: { ...input.delta, textId: "foreign-text" } }));
    const firstDocument = input.initial.documents[0]; assert.ok(firstDocument !== undefined); const otherParent = { ...firstDocument, documentUuid: "9".repeat(32) };
    assert.throws(() => compare({ ...input, initial: { ...input.initial, documents: [otherParent, ...input.initial.documents.slice(1)] } }));
  }
});
