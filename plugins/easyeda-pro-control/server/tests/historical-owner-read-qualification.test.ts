import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { historicalRootNamespaceAvailable, runHistoricalReadOnlyNamespace } from "./helpers/historical-owner-namespace-fixture.ts";

void test("historical owner qualification grammar rejects unknown mappings, credentials and every nonzero capability set", async () => {
  const source = await readFile(new URL("../src/historical-owner-read-qualification.ts", import.meta.url), "utf8");
  const start = source.indexOf("function reviewedMap(");
  const end = source.indexOf("async function procText(", start);
  assert.ok(start > 0 && end > start);
  const scope = vm.createContext({});
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  const mapping = (value: string): unknown => vm.runInContext(`reviewedMap(${JSON.stringify(value)})`, scope);
  assert.equal(mapping("         1          0          1\n"), true);
  for (const text of ["0 0 4294967295\n", "1 1000 1\n", "1 0 2\n", "1 0 1\n2 2 1\n", "1 0 1", "1 0 1\n\n", "65534 0 1\n", "01 0 1\n"]) { assert.equal(mapping(text), false, text); }
  const capabilities = ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"].map(key => `${key}:\t0000000000000000\n`).join("");
  const credentials = `Uid:\t1\t1\t1\t1\nGid:\t1\t1\t1\t1\n${capabilities}`;
  const admitted = (value: string): unknown => vm.runInContext(`reviewedCredentials(${JSON.stringify(value)})`, scope);
  assert.equal(admitted(credentials), true);
  for (const key of ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]) {
    for (const changed of [credentials.replace(`${key}:\t0000000000000000`, `${key}:\t0000000000000001`), credentials.replace(`${key}:\t0000000000000000\n`, ""), `${credentials}${key}:\t0000000000000000\n`]) { assert.equal(admitted(changed), false, key); }
  }
  for (const key of ["Uid", "Gid"]) {
    for (let field = 0; field < 4; field += 1) {
      const values = ["1", "1", "1", "1"]; values[field] = "65534";
      const changed = credentials.replace(`${key}:\t1\t1\t1\t1`, `${key}:\t${values.join("\t")}`);
      assert.equal(admitted(changed), false);
    }
  }
});

void test("actual inert namespace qualification retains one original descriptor and refuses wrong mappings and copied state", async context => {
  if (!historicalRootNamespaceAvailable()) { context.skip("Requires the actual root-to-one parent UID/GID mapping."); return; }
  const module = new URL("../src/historical-owner-read-qualification.ts", import.meta.url).href;
  const program = `
    import assert from "node:assert/strict";
    import { HistoricalOwnerReadQualification } from ${JSON.stringify(module)};
    const qualification = await HistoricalOwnerReadQualification.open();
    await qualification.assertCurrent(); assert.equal(qualification.originalUid(1n), 0n); assert.equal(qualification.originalGid(1n), 0n);
    assert.throws(() => qualification.originalUid(65534n), /qualification refused/u);
    assert.equal(qualification.originalUidTuple("10:20:33152:1:1:100:200:300"), "10:20:33152:0:1:100:200:300");
    for (const value of ["10:20:33152:0:1:100:200:300", "10:20:33152:65534:1:100:200:300", "10:20:33152:1:1:100:200", "10:20:33152:1:1:100:200:bad"]) { assert.throws(() => qualification.originalUidTuple(value), /qualification refused/u); }
    const copied = Object.create(HistoricalOwnerReadQualification.prototype);
    await assert.rejects(copied.assertCurrent(), TypeError);
    await qualification.close(); await assert.rejects(qualification.assertCurrent(), /qualification refused/u);
    process.stdout.write("qualified-and-closed");
  `;
  assert.equal(await runHistoricalReadOnlyNamespace(program), "qualified-and-closed");
  await assert.rejects(runHistoricalReadOnlyNamespace(program, "2"), /qualification refused/u);
  await assert.rejects(runHistoricalReadOnlyNamespace(program, "1", "2"), /qualification refused/u);
});
