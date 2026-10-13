import { knownSyntheticSavedContent } from "./helpers/saved-symbol-known-content.ts";
/* oxlint-disable import/max-dependencies -- This integration test joins the actual journal/copy/SQL issuers and a fixed synthetic content expectation; forwarding these imports would hide the boundaries under test. */
import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { after, test } from "node:test";
import { EasyedaControlEngine } from "../src/engine.ts";
import { canonicalJson } from "../src/core.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";

import { decodeRawHistoryForOriginalSymbolSqlPlan } from "../src/symbol-sql-comparator.ts";



import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this worker-local prerequisite before loading stage consumers.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer graph loads after the exact synthetic profile hook.
const { originalClosedSymbolEditSource, revalidateOriginalClosedSymbolEditSource } = await import("../src/closed-symbol-sql-comparison.ts");
// oxlint-disable-next-line node/no-top-level-await -- Consumer graph loads after the exact synthetic profile hook.
const { sqlStageFixture } = await import("./helpers/closed-symbol-sql-fixture.ts");
// oxlint-disable-next-line node/no-top-level-await -- Consumer graph loads after the exact synthetic profile hook.
const { assertOriginalSavedSymbolSource, prepareOriginalSavedSymbolSource, revalidateOriginalSavedSymbolSource, verifyOriginalSavedSymbolContent } = await import("../src/closed-symbol-saved-source.ts");

void test("actual original edit SQL source produces original saved projection without native dispatch",async(context)=>{
  const f=await sqlStageFixture(context);const comparison=await f.sql.compareEdit(f.compareInput),operationId=f.journal.operationId;
  const journal=canonicalJson(f.journal),sql=originalClosedSymbolEditSource(comparison,f.engine,operationId);
  assert.strictEqual(sql.copy,f.edited.copy);assert.strictEqual(sql.inventory,f.edited.inventory);assert.strictEqual(sql.preparation,f.preparation);
  assert.ok(Object.isFrozen(sql));
  const source=await prepareOriginalSavedSymbolSource(comparison,f.engine,operationId);
  assert.strictEqual(assertOriginalSavedSymbolSource(source,f.engine,operationId),source);
  assert.strictEqual(await revalidateOriginalSavedSymbolSource(source,f.engine,operationId),source);
  assert.equal(source.headerEditVersion,f.preparation.metadataPlan.headerEditVersion);assert.equal(source.maximumTicket,f.preparation.sqlPlan.expectedTicket);
  assert.equal(source.projectedContentBytes>0,true);assert.equal(source.projectedContentBytes<=65_536,true);
  assert.equal(source.executionAuthorized,false);assert.equal(source.producerBindingVerified,false);assert.equal(source.completionProved,false);
  const loaded=await loadClosedSymbolJournal(operationId);
  assert.equal(canonicalJson(f.journal),journal);assert.equal(canonicalJson(loaded.journal),journal);
  const decoded=await decodeRawHistoryForOriginalSymbolSqlPlan(f.preparation.sqlPlan,sql.inventory);
  assert.equal(decoded.chunks.length,2);
  const observation={profile:"private.saved-symbol-content-observation.v1",targetUuid:source.targetUuid,maximumTicket:source.maximumTicket,workerClient:"c".repeat(16),content:knownSyntheticSavedContent(f.witness.witness.serverClockMinMs+2000)};
  const relation=verifyOriginalSavedSymbolContent(source,f.engine,operationId,observation);assert.equal(relation["exactContent"],true);
  assert.throws(()=>verifyOriginalSavedSymbolContent(source,f.engine,operationId,{...observation,content:"different"}),/differs/u);
  assert.throws(()=>assertOriginalSavedSymbolSource(structuredClone(source),f.engine,operationId),/Original successful/u);
  assert.throws(()=>assertOriginalSavedSymbolSource(source,f.engine,`${operationId}-foreign`),/Original successful/u);
  const other=new EasyedaControlEngine(f.engine.upstream);await other.controlFingerprintPromise;
  assert.throws(()=>assertOriginalSavedSymbolSource(source,other,operationId),/Original successful/u);
  for(const value of[structuredClone(comparison),{...comparison,phase:"verify-sql-compare"},{assertOriginalComparison:():typeof comparison=>comparison}]){
    await assert.rejects(prepareOriginalSavedSymbolSource(value,f.engine,operationId),/original successful comparison/u);
  }
  assert.equal(f.writeState.calls,1);
});

for(const failure of["copy-bytes","copy-mode","result-artifact"]as const){
  void test(`saved-source refuses changed ${failure} after original edit comparison`,async(context)=>{
    const f=await sqlStageFixture(context);const comparison=await f.sql.compareEdit(f.compareInput),operationId=f.journal.operationId;
    const source=await prepareOriginalSavedSymbolSource(comparison,f.engine,operationId);
    const artifact=f.journal.artifacts.at(-1);assert.ok(artifact!==undefined);
    const originalArtifact=failure==="result-artifact"?await fsPromises.readFile(artifact.path):undefined;
    try{
      if(failure==="copy-bytes"){await fsPromises.appendFile(f.edited.copy.artifact,"synthetic-corruption");}
      else if(failure==="copy-mode"){await fsPromises.chmod(f.edited.copy.artifact,0o644);}
      else{await fsPromises.writeFile(artifact.path,"{}");}
      await assert.rejects(revalidateOriginalSavedSymbolSource(source,f.engine,operationId));
      await assert.rejects(prepareOriginalSavedSymbolSource(comparison,f.engine,operationId));
      assert.equal(f.writeState.calls,1);
    }finally{
      // Restore only this test-owned corruption so the fixture can validate
      // And close its synthetic journal; no production recovery is implied.
      if(originalArtifact!==undefined){await fsPromises.writeFile(artifact.path,originalArtifact);}
    }
  });
}
void test("failed comparison publication cannot expose a source through the fixed issuer",async(context)=>{
  const f=await sqlStageFixture(context);const link=fsPromises.link;
  context.mock.method(fsPromises,"link",async(...args:Parameters<typeof link>):Promise<void>=>{
    if(basename(String(args[1]))==="28-edit-sql-compare-result.json"){throw new Error("synthetic publication refusal");}
    await link(...args);
  });syncBuiltinESMExports();context.after(()=>{context.mock.restoreAll();syncBuiltinESMExports();});
  await assert.rejects(f.sql.compareEdit(f.compareInput),/publication refusal/u);
  const unready=f.sql.originalComparison(f.journal.operationId,"edit-sql-compare");assert.ok(unready!==undefined);
  assert.throws(()=>originalClosedSymbolEditSource(unready,f.engine,f.journal.operationId),/original successful comparison/u);
  await assert.rejects(revalidateOriginalClosedSymbolEditSource(unready,f.engine,f.journal.operationId),/original successful comparison/u);
  assert.equal(f.writeState.calls,1);
});
