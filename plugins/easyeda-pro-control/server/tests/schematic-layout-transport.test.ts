import assert from "node:assert/strict";
import { randomBytes, webcrypto } from "node:crypto";
import { test } from "node:test";
import { canonicalJson } from "../src/core.ts";
import { buildSchematicLayoutPayloadCode } from "../src/schematic-layout-transport.ts";

async function execute(code: string, current: string, calls: string[], decompression: unknown = DecompressionStream, crypto: unknown = webcrypto): Promise<unknown> {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Execute this maintained builder against a fake mutation boundary, never caller code or a live editor.
  const run = new Function("current", "calls", "DecompressionStream", "globalThis", `return(async()=>{${code}
if(baseline!==current)throw new Error('SCH_LAYOUT_BASELINE_CHANGED');calls.push('mutation');return{baseline,desired};})();`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Unknown generated output is checked against the exact original fixture.
  return await run(current, calls, decompression, { crypto });
}

void test("layout payloads beyond the old combined bound decode to exact canonical bytes before mutation", async () => {
  const baseline = canonicalJson({ data: "é".repeat(2_100_000) });
  const desired = [{ id: "record", type: "FUTURE", body: { data: "b".repeat(2_200_000), unknown: [false, 0, null] } }];
  const desiredJson = JSON.stringify(desired);
  assert.ok(Buffer.byteLength(baseline) + Buffer.byteLength(desiredJson) > 6 * 1024 * 1024);
  const code = buildSchematicLayoutPayloadCode(baseline, desiredJson);
  const calls: string[] = [];
  assert.ok(Buffer.byteLength(code) < 100_000);
  assert.deepEqual(await execute(code, baseline, calls), { baseline, desired });
  assert.deepEqual(calls, ["mutation"]);
});

void test("layout transport refuses missing browser capabilities, corrupt bytes and hashes before mutation", async () => {
  const baseline = canonicalJson({ value: "original" });
  const code = buildSchematicLayoutPayloadCode(baseline, "[]");
  const calls: string[] = [];
  await assert.rejects(execute(code, baseline, calls, null), /COMPRESSION_UNAVAILABLE/u);
  await assert.rejects(execute(code, baseline, calls, DecompressionStream, null), /CRYPTO_UNAVAILABLE/u);
  const wrongHash = code.replace(/"sha256":"[a-f0-9]{64}"/u, `"sha256":"${"0".repeat(64)}"`);
  await assert.rejects(execute(wrongHash, baseline, calls), /PAYLOAD_HASH/u);
  const wrongCount = code.replace(/"utf8Bytes":\d+/u, '"utf8Bytes":1');
  await assert.rejects(execute(wrongCount, baseline, calls), /PAYLOAD_INVALID/u);
  const corrupt = code.replace(/"base64":"[^"]+"/u, '"base64":"AAAA"');
  await assert.rejects(execute(corrupt, baseline, calls), /PAYLOAD_INVALID/u);
  await assert.rejects(execute(code, canonicalJson({ value: "changed" }), calls), /BASELINE_CHANGED/u);
  assert.deepEqual(calls, []);
});

void test("layout preparation retains finite individual, combined and compressed budgets", () => {
  const singleOversize = canonicalJson({ data: "a".repeat(8 * 1024 * 1024) });
  assert.throws(() => buildSchematicLayoutPayloadCode(singleOversize, "[]"), /decoded bound/u);
  const combinedBaseline = canonicalJson({ data: "a".repeat(7 * 1024 * 1024) });
  const combinedDesired = JSON.stringify(["b".repeat(6 * 1024 * 1024)]);
  assert.throws(() => buildSchematicLayoutPayloadCode(combinedBaseline, combinedDesired), /decoded bound/u);
  const incompressible = canonicalJson({ data: randomBytes(1_100_000).toString("base64") });
  assert.throws(() => buildSchematicLayoutPayloadCode(incompressible, "[]"), /compressed bound/u);
  assert.throws(() => buildSchematicLayoutPayloadCode('{ "value": 1 }', "[]"), /canonical baseline/u);
  assert.throws(() => buildSchematicLayoutPayloadCode('{"value":1}', "{}"), /record array/u);
  assert.throws(() => buildSchematicLayoutPayloadCode('{"value":"[MaxDepth]"}', "[]"), /placeholder/u);
});
