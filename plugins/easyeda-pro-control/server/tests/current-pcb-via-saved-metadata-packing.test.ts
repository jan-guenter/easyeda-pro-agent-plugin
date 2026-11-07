import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import { test } from "node:test";
import { currentPcbViaSavedCacheMetadataNative } from "../src/current-pcb-via-saved-cache-metadata-native.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS as HELPERS } from "../src/current-pcb-via-saved-cache-metadata-programs.ts";

void test("every packed metadata helper retains exact original bytes, hashes, options and source-qualified script", async () => {
  const first = currentPcbViaSavedCacheMetadataNative(); assert.equal(currentPcbViaSavedCacheMetadataNative(), first);
  const table=/SavedViaMetadataPrograms=EasyedaDiagnosticFixedTable.Load\(@"(?<packed>[A-Za-z\d+/=]+)",(?<bytes>\d+),@"(?<plain>[a-f\d]{64})",@"(?<compressed>[a-f\d]{64})",9,2\);/u.exec(first)?.groups;assert.ok(table!==undefined);
  const compressed=Buffer.from(table["packed"]??"","base64"),plain=await promisify(gunzip)(compressed);assert.equal(compressed.toString("base64"),table["packed"]);assert.equal(plain.length,Number(table["bytes"]));assert.ok(plain.length<=60_000);
  assert.equal(createHash("sha256").update(compressed).digest("hex"),table["compressed"]);assert.equal(createHash("sha256").update(plain).digest("hex"),table["plain"]);
  const programs=plain.toString("utf8").split("\0").map(row=>row.split("\t"));assert.equal(programs.length,9);assert.ok(programs.every(row=>row.length===2));assert.deepEqual(programs.map(row=>row[0]),Object.keys(HELPERS));
  const rows=[...first.matchAll(/case @"(?<role>[a-z-]+)":program=SavedViaMetadataAt\((?<index>\d+),role\);byValue=(?<byValue>true|false);awaitPromise=(?<awaitPromise>true|false);sideEffect=(?<sideEffect>true|false);break;/gu)];
  assert.deepEqual(rows.map(row=>row.groups?.["role"]),Object.keys(HELPERS));
  for(const row of rows){const fields=row.groups;assert.ok(fields!==undefined);const role=fields["role"];assert.ok(role!==undefined&&Object.hasOwn(HELPERS,role));const helper=Object.entries(HELPERS).find(([name])=>name===role)?.[1];assert.ok(helper!==undefined);
    const program=programs[Number(fields["index"])];assert.ok(program!==undefined);assert.equal(program[0],role);assert.equal(program[1],helper.program);
    assert.equal(fields["byValue"],String(helper.returnByValue));assert.equal(fields["awaitPromise"],String(helper.awaitPromise));assert.equal(fields["sideEffect"],String(helper.throwOnSideEffect));
    assert.ok(first.includes(createHash("sha256").update(helper.program).digest("hex")));
  }
  assert.ok(first.includes('SavedViaMetadataPrograms[index][0]!=role'));assert.ok(first.includes('default:throw Error("saved-readback-metadata-helper")'));
  assert.ok(first.includes("VerifySavedViaMetadataSmoke(){VerifySavedViaMetadataProgramsSmoke();"));
});
