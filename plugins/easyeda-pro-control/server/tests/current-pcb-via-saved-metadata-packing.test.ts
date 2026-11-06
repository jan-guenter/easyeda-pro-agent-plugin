import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import { test } from "node:test";
import { currentPcbViaSavedCacheMetadataNative } from "../src/current-pcb-via-saved-cache-metadata-native.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS as HELPERS } from "../src/current-pcb-via-saved-cache-metadata-programs.ts";

void test("every packed metadata helper retains exact original bytes, hashes, options and source-qualified script", async () => {
  const first = currentPcbViaSavedCacheMetadataNative(); assert.equal(currentPcbViaSavedCacheMetadataNative(), first);
  const rows = [...first.matchAll(/case @"(?<role>[a-z-]+)":program=UnpackFixedProgram\(@"(?<packed>[A-Za-z\d+/=]+)",(?<bytes>\d+),@"(?<plain>[a-f\d]{64})",@"(?<compressed>[a-f\d]{64})"\);byValue=(?<byValue>true|false);awaitPromise=(?<awaitPromise>true|false);sideEffect=(?<sideEffect>true|false);break;/gu)];
  assert.deepEqual(rows.map(row => row.groups?.["role"]), Object.keys(HELPERS));
  for (const row of rows) {
    const fields = row.groups; assert.ok(fields !== undefined);
    const role = fields["role"]; assert.ok(role !== undefined && Object.hasOwn(HELPERS, role));
    const helper = Object.entries(HELPERS).find(([name]) => name === role)?.[1]; assert.ok(helper !== undefined);
    const bytes = fields["bytes"], packed = fields["packed"]; assert.ok(packed !== undefined && bytes !== undefined);
    const compressed = Buffer.from(packed, "base64"), plain = await promisify(gunzip)(compressed);
    assert.equal(compressed.toString("base64"), packed); assert.equal(plain.length, Number(bytes)); assert.equal(plain.toString("utf8"), helper.program);
    assert.equal(createHash("sha256").update(compressed).digest("hex"), fields["compressed"]);
    assert.equal(createHash("sha256").update(plain).digest("hex"), fields["plain"]);
    assert.equal(fields["byValue"], String(helper.returnByValue)); assert.equal(fields["awaitPromise"], String(helper.awaitPromise));
    assert.equal(fields["sideEffect"], String(helper.throwOnSideEffect));
  }
  assert.ok(first.includes("VerifySavedViaMetadataSmoke(){VerifySavedViaMetadataProgramsSmoke();"));
});
