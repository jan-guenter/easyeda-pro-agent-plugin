import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { queryPublicSdkReads, validatePublicSdkArguments } from "../src/public-sdk-catalog.ts";
import { publicSdkReadDescriptors } from "../src/public-sdk-read.ts";

void test("offline SDK-read pages cover the exact executable descriptor set", () => {
  const paths: string[] = [];
  const inputSchema = z.record(z.string(), z.unknown());
  const schemaHash = z.string().regex(/^[a-f0-9]{64}$/u);
  const entrySchema = z.object({ path: z.string(), inputSchema, inputSchemaSha256: schemaHash });
  let offset = 0;
  for (;;) {
    const page = queryPublicSdkReads({ offset, limit: 7, includeSchemas: true });
    assert.equal(page["offline"], true);
    assert.equal(page["executionAuthorized"], false);
    const entries = z.array(entrySchema).parse(page["entries"]);
    paths.push(...entries.map((entry) => entry.path));
    if (page["nextOffset"] === null) { break; }
    offset = z.number().int().parse(page["nextOffset"]);
  }
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(paths.toSorted(), publicSdkReadDescriptors().map((entry) => entry.path).toSorted());
});

void test("offline SDK validation uses execution arguments and rejects caller code and writes", () => {
  const request = { method: "eda.sys_Environment.getEditorCurrentVersion", arguments: {} };
  const result = validatePublicSdkArguments({ request });
  assert.equal(result["valid"], true);
  assert.equal(result["executionAuthorized"], false);
  for (const invalid of [{ ...request, code: "unrestricted()" },
    { method: "eda.pcb_Document.save", arguments: {} },
    { ...request, arguments: { unused: true } }]) {
    assert.equal(validatePublicSdkArguments({ request: invalid })["valid"], false);
  }
});

void test("SDK-read catalog selectors are literal, strictly bounded and optionally omit schemas", () => {
  const result = queryPublicSdkReads({ method: "eda.sys_Environment.getEditorCurrentVersion" });
  const entries = z.array(z.record(z.string(), z.unknown())).parse(result["entries"]);
  assert.equal(entries.length, 1);
  assert.equal(Object.hasOwn(entries[0] ?? {}, "inputSchema"), false);
  assert.equal(queryPublicSdkReads({ search: ".*" })["matched"], 0);
  for (const query of [{ limit: 101 }, { offset: -1 }, { limit: "1" }, { code: "x" }, { search: "x".repeat(101) }]) {
    assert.throws(() => queryPublicSdkReads(query));
  }
  const completePage = queryPublicSdkReads({ limit: 100, includeSchemas: true });
  assert.ok(Buffer.byteLength(JSON.stringify(completePage)) < 262_144);
});

void test("SDK catalog distinguishes native-only, public-only and mixed discovery without execution authority", () => {
  for (const method of ["eda.sch_PrimitiveText.getAllPrimitiveId", "eda.sch_PrimitiveWire.getAllPrimitiveId", "eda.sch_PrimitiveBus.getAllPrimitiveId"]) {
    const result = queryPublicSdkReads({ method });
    assert.equal(result["authority"], "native-id-observation-not-complete-source-connectivity-or-persistence-proof");
    assert.equal(result["executionAuthorized"], false);
  }
  assert.equal(queryPublicSdkReads({ method: "eda.sys_Environment.getEditorCurrentVersion" })["authority"], "public-sdk-observation-not-complete-design-proof");
  assert.equal(queryPublicSdkReads()["authority"], "mixed-sdk-observations-not-complete-source-connectivity-or-persistence-proof");
  assert.equal(queryPublicSdkReads({ limit: 1, offset: 0 })["authority"], "mixed-sdk-observations-not-complete-source-connectivity-or-persistence-proof");
});
