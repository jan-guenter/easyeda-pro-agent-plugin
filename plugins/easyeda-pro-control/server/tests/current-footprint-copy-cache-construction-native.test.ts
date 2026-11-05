/** Pure codec regressions. Windows CompileOnly executes the generated C# smoke;
 * these checks execute no helper, owner, renderer or native application. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { currentFootprintCacheConstructionNativeCases, currentFootprintCacheConstructionNativeSource } from "../src/current-footprint-copy-cache-construction-native.ts";
import { currentFootprintCacheConstructionWire } from "../src/current-footprint-copy-cache-construction-wire.ts";

function table(source: string): readonly (readonly string[])[] {
  const matched = /EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",14,4\)/u.exec(source);
  assert.ok(matched !== null && matched[1] !== undefined && matched[2] !== undefined && matched[3] !== undefined && matched[4] !== undefined);
  const packed = Buffer.from(matched[1], "base64"); assert.equal(createHash("sha256").update(packed).digest("hex"), matched[4]);
  // oxlint-disable-next-line node/no-sync -- Decode one bounded generated build constant in memory, with no file or native runtime work.
  const decoded = gunzipSync(packed); assert.equal(decoded.length, Number(matched[2]));
  assert.equal(createHash("sha256").update(decoded).digest("hex"), matched[3]); assert.ok(decoded.length <= 65_536);
  return decoded.toString("utf8").split("\0").map(row => row.split("\t"));
}

void test("all fourteen cache C# templates satisfy the unchanged forward renderer envelope at request137", () => {
  const source = currentFootprintCacheConstructionNativeSource();
  const rows = table(source), samples = currentFootprintCacheConstructionNativeCases();
  assert.equal(rows.length, 14); assert.equal(samples.length, 14);
  for (const [index, sample] of samples.entries()) {
    const row = rows[index]; assert.ok(row !== undefined && row[0] !== undefined && row[2] !== undefined && row[3] !== undefined);
    const wire = currentFootprintCacheConstructionWire(sample, 137);
    assert.equal(row[0], wire.request["cachePhase"]); assert.equal(row[1], sample.method);
    const payload = z.record(z.string(), z.unknown()).parse(JSON.parse(row[3]));
    assert.deepEqual(Object.keys(payload), ["method", "params", "sessionId"]);
    const fields = row[2].length === 0 ? [] : row[2].split(",");
    assert.deepEqual(fields, Object.keys(wire.request).filter(key => !["action", "requestId", "method", "cachePhase"].includes(key)));
    let rendered = row[3];
    for (const name of ["sessionId", ...fields]) {
      const value = name === "sessionId" ? sample.sessionId : wire.request[name];
      rendered = rendered.replaceAll(JSON.stringify(`__cacheconstruction_${name}__`), JSON.stringify(value));
    }
    const encoded = `{"id":137,${rendered.slice(1)}\0`;
    assert.ok(encoded.startsWith(`{"id":137,"method":"${sample.method}"`));
    assert.deepEqual(JSON.parse(encoded.slice(0, -1)), { id: 137, method: sample.method, params: sample.params, sessionId: sample.sessionId });
    const old = JSON.stringify({ id: 137, sessionId: sample.sessionId, method: sample.method, params: sample.params });
    assert.equal(old.startsWith('{"id":137,"method":"'), false);
  }
  // The real generated C# encoder is also checked against the forward prefix,
  // Rather than only comparing smoke hashes to the same serializer's output.
  assert.ok(source.includes('string forwarded=Encode(137,row[0],row[1],session,fields);'));
  assert.ok(source.includes(String.raw`forwarded.StartsWith("{\"id\":137,\"method\":\""+row[1]+"\"",System.StringComparison.Ordinal)`));
});

void test("canonical cache encoding retains the fixed method/session/namespace and readonly grammar", () => {
  for (const sample of currentFootprintCacheConstructionNativeCases()) {
    assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, method: "Runtime.evaluate" }, 137));
    assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, sessionId: `${sample.sessionId}\n` }, 137));
    assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, purpose: "forward" }, 137));
    assert.throws(() => currentFootprintCacheConstructionWire(sample, 0));
    if (sample.method === "Runtime.callFunctionOn") {
      assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, params: { ...sample.params, awaitPromise: true } }, 137));
      assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, params: { ...sample.params, functionDeclaration: "function(){return true;}" } }, 137));
    }
  }
});
