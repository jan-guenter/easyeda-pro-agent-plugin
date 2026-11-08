/** Real descriptor-bound reader/publisher. Only the historical snapshot issuer
 * is replaced with a labelled inert test registry; no old owner is adopted. */
/* oxlint-disable import/max-dependencies -- Actual secure artifact storage/receipt reader and explicit isolated historical registry join with the TS compiler only in this source-only test. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";
import { controlDataDirectory, publishManagedAttachmentExclusive } from "../src/artifacts.ts";
import { GENERATED_READER_KNOWN_FACADE_SHA256, GENERATED_READER_KNOWN_ROSTER_SHA256, GENERATED_READER_RELINQUISHMENT_DIRECTORY } from "../src/current-generated-reader-relinquishment-contract.ts";

void test("a real failed publication's securely validated empty directory is absent and permits original receipt publication", async () => {
 await assertTestIsolation();const url=new URL("../src/current-generated-reader-relinquishment-journal.ts",import.meta.url);const source=await readFile(url,"utf8");
 const anchor="async function readOriginal(operationId: string): Promise<GeneratedReaderHistoricalOriginal> {";
 const injected=`${source.replace(anchor,`${anchor}\n if(syntheticHistorical!==null){need(operationId===syntheticHistorical.operationId);return syntheticHistorical;}`)}\nlet syntheticHistorical:GeneratedReaderHistoricalOriginal|null=null;export function seedHistoricalForStorage(original:GeneratedReaderHistoricalOriginal){need(syntheticHistorical===null);syntheticHistorical=original;const token=Object.freeze({profile:"private.generated-reader-closed-historical-snapshot.v1" as const});issued.set(token,original);return token;}`;
 assert.notEqual(injected,source);const compiled=await transform(injected,{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});const loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");Reflect.apply(evaluate,undefined,[createRequire(url),loaded,loaded.exports]);
 const publish=loaded.exports["publishGeneratedReaderRelinquishment"],read=loaded.exports["readGeneratedReaderRelinquishment"],seed=loaded.exports["seedHistoricalForStorage"];assert.ok(typeof seed==="function"&&typeof read==="function"&&typeof publish==="function");
 const digest="a".repeat(64),operationId=`pcb209-spatial-pads-storage-${randomUUID()}`;
 const original=Object.freeze({operationId,records:{},originalRosterSha256:GENERATED_READER_KNOWN_ROSTER_SHA256,originalIdentitySha256:digest,originalIntentSha256:digest,originalCaptureSha256:digest,originalProducerFacadeSha256:GENERATED_READER_KNOWN_FACADE_SHA256});const token:unknown=Reflect.apply(seed,undefined,[original]);
 const directory=join(controlDataDirectory(),GENERATED_READER_RELINQUISHMENT_DIRECTORY,operationId),path=join(directory,"intent.json");
 await assert.rejects(publishManagedAttachmentExclusive(path,"Synthetic original failed publication",Buffer.from("temporary\n"),"relinquishment-storage-test",():Promise<never>=>Promise.reject(new Error("synthetic original final-sync refusal"))),/final-sync refusal/u);
 assert.deepEqual(await readdir(directory),[]);assert.equal(await Reflect.apply(read,undefined,[token]),null);
 const intent={schema:"easyeda-pro-control.generated-reader-closed-relinquishment-intent.v1",operationId,originalRosterSha256:GENERATED_READER_KNOWN_ROSTER_SHA256,originalIdentitySha256:digest,originalIntentSha256:digest,originalCaptureSha256:digest,originalProducerFacadeSha256:GENERATED_READER_KNOWN_FACADE_SHA256,createdAt:"2026-11-08T00:00:00.000Z",facadeSha256:digest,installationSha256:digest,confirmRelinquishClosedReader:true,acceptMissingHelperReleaseAcknowledgment:true};
 await Reflect.apply(publish,undefined,[token,"intent.json",intent]);assert.deepEqual(await Reflect.apply(read,undefined,[token]),{intent,result:null});
 const other:{exports:Record<string,unknown>}={exports:{}};Reflect.apply(evaluate,undefined,[createRequire(url),other,other.exports]);
 const otherRead=other.exports["readGeneratedReaderRelinquishment"],otherSeed=other.exports["seedHistoricalForStorage"];assert.ok(typeof otherSeed==="function"&&typeof otherRead==="function");
 const nonemptyId=`${operationId}-nonempty`;const nonempty:unknown=Reflect.apply(otherSeed,undefined,[Object.freeze({...original,operationId:nonemptyId})]);
 await publishManagedAttachmentExclusive(join(controlDataDirectory(),GENERATED_READER_RELINQUISHMENT_DIRECTORY,nonemptyId,"relinquished.json"),"Synthetic nonempty slot without intent",Buffer.from("{}\n"),"relinquishment-storage-test");
 await assert.rejects(async():Promise<unknown>=>await Reflect.apply(otherRead,undefined,[nonempty]),/JOURNAL_REFUSED/u);
});
