import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { captureGeneratedReaderClosedSnapshot, decodeGeneratedReaderRawHistory } from "../src/managed-fixture-reader-closed-snapshot.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

void test("closed reader diagnostics decode every genuine initial encrypted history row while preserving unticked headers and Arc source", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via"), result = await decodeGeneratedReaderRawHistory(input.inventory);
  assert.equal(result["completeHistoryDataRowsDecoded"], true); assert.equal(result["chunkCount"], 1);
  assert.equal(result["semanticChainAccepted"], false); assert.equal(result["writerAuthority"], false);
  assert.match(JSON.stringify(result), /EDIT_HEAD/u); assert.match(JSON.stringify(result), /ARC/u);
  await assert.rejects(decodeGeneratedReaderRawHistory(structuredClone(input.inventory)), /completion|reader|issued/iu);
});
void test("original owner and native closure must reprove before any generated source filesystem lookup", async () => {
  const input = await managedFixtureInitialSqlFixture(), result = await qualifyGeneratedFixtureInitialSql(input); let observed = 0;
  await assert.rejects(captureGeneratedReaderClosedSnapshot({ source: { qualification: result.qualification, archive: input.archive },
    assertOriginalOwner: () => { throw new Error("ORIGINAL_OWNER_REFUSED"); }, observeOriginalTermination: () => { observed += 1; return Promise.resolve(); } }), /ORIGINAL_OWNER_REFUSED/u);
  assert.equal(observed, 0);
  await assert.rejects(captureGeneratedReaderClosedSnapshot({ source: { qualification: result.qualification, archive: input.archive },
    assertOriginalOwner: () => { assert.equal(result.qualification.completeInitialSqlRowsQualified, true); }, observeOriginalTermination: () => Promise.reject(new Error("ORIGINAL_JOB_STILL_LIVE")) }), /ORIGINAL_JOB_STILL_LIVE/u);
});
void test("closed capture rejects proxies/accessors and pins its original callbacks across asynchronous closure observation", async () => {
  const input = await managedFixtureInitialSqlFixture(), result = await qualifyGeneratedFixtureInitialSql(input); const pending = Promise.withResolvers<null>();
  const options = { source: { qualification: result.qualification, archive: input.archive }, assertOriginalOwner: (): void => { assert.equal(result.qualification.writerClockAuthority, false); },
    observeOriginalTermination: async (): Promise<void> => { await pending.promise; } };
  await assert.rejects(captureGeneratedReaderClosedSnapshot(new Proxy(options, {})), /plain original capture inputs/u);
  const capture = captureGeneratedReaderClosedSnapshot(options);
  options.observeOriginalTermination = (): Promise<void> => Promise.resolve(); pending.resolve(null);
  await assert.rejects(capture, /callback\/source identities/u);
  let getterCalls = 0;
  Object.defineProperty(options, "assertOriginalOwner", { get: () => { getterCalls += 1; return (): void => { throw new Error("unowned callback"); }; } });
  await assert.rejects(captureGeneratedReaderClosedSnapshot(options), /capture data property/u); assert.equal(getterCalls, 0);
});
