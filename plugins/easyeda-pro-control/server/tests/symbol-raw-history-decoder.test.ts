import { knownSyntheticSavedContent } from "./helpers/saved-symbol-known-content.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { HISTORY_TABLE, IDS, OPERATION, TIMES, WITNESS, applyEffect, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";
import { decodeRawHistoryForOriginalSymbolSqlPlan, prepareSymbolNewHeadSqlPlan } from "../src/symbol-sql-comparator.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../src/saved-symbol-projection.ts";

void test("original SQL plan decodes complete authenticated after-history and exact known synthetic output agrees",async()=>{
  const f=await fixture();const plan=await prepareSymbolNewHeadSqlPlan({before:f.before,operation:OPERATION,witness:WITNESS});
  applyEffect(f.path);const after=await inventory(f.path);
  const decoded=await decodeRawHistoryForOriginalSymbolSqlPlan(plan,after);
  assert.equal(decoded.maximumTicket,101);assert.equal(decoded.chunks.length,2);assert.equal(decoded.chunks[1],expectedRaw());
  assert.deepEqual(decoded.links.map(value=>[value.historyUuid,value.historyRowId,value.chunkUuid,value.chunkRowId,value.ordinal]),
    [[IDS.oldHead,"5",IDS.oldHead,"7",0],[IDS.newHead,"6",IDS.newHead,"12",0]]);
  assert.equal(decoded.links[1]?.plaintextSha256,sha256Text(expectedRaw()));
  assert.equal(decoded.chunks[0]?.includes('"ticket":100,"id":"deleted-shape"}||'),true);
  assert.equal(decoded.chunks[0]?.includes(IDS.peer),true);
  assert.ok(Object.isFrozen(decoded.chunks)&&Object.isFrozen(decoded.links)&&decoded.links.every(Object.isFrozen));
  const projection=await prepareSavedSymbolProjection({chunks:decoded.chunks,targetUuid:IDS.target,maximumTicket:101,currentEditVersion:"3.0"});
  assert.equal(expectedSavedSymbolContent(projection,"c".repeat(16)),knownSyntheticSavedContent(TIMES.document));
  await assert.rejects(decodeRawHistoryForOriginalSymbolSqlPlan(structuredClone(plan),after),/original prepared plan/u);
  await assert.rejects(decodeRawHistoryForOriginalSymbolSqlPlan(plan,structuredClone(after)),/issued|original|complete/iu);
});

for(const [name,sql]of[
  ["snapshot",`UPDATE "${HISTORY_TABLE}" SET snapshot='${IDS.oldHead}' WHERE uuid='${IDS.newHead}'`],
  ["missing chunk",`DELETE FROM history_data WHERE uuid='${IDS.newHead}'`],
  ["chunk parent",`UPDATE history_data SET history_uuid='${IDS.oldHead}' WHERE uuid='${IDS.newHead}'`],
  ["cycle",`UPDATE "${HISTORY_TABLE}" SET parent='${IDS.newHead}' WHERE uuid='${IDS.oldHead}'`],
  ["future row",`UPDATE branches SET history_uuid='${IDS.oldHead}' WHERE uuid='${IDS.branch}'`],
  ["missing chunk ordinal",`UPDATE "${HISTORY_TABLE}" SET num=1 WHERE uuid='${IDS.newHead}'`],
  ["authentication",`UPDATE history_data SET dataStr='AAAA' WHERE uuid='${IDS.newHead}'`],
  ["ancestor authentication",`UPDATE history_data SET dataStr='AAAA' WHERE uuid='${IDS.oldHead}'`],
]as const){
  void test(`raw SQL decoder refuses ${name}`,async()=>{
    const f=await fixture();const plan=await prepareSymbolNewHeadSqlPlan({before:f.before,operation:OPERATION,witness:WITNESS});
    applyEffect(f.path);mutate(f.path,sql);await assert.rejects(decodeRawHistoryForOriginalSymbolSqlPlan(plan,await inventory(f.path)));
  });
}
