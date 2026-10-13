import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, ensureOperationStorage, operationPath } from "../src/artifacts.ts";
import { newOperationId, sha256Text } from "../src/core.ts";
import { readWitnessClockArtifact } from "../src/closed-sql-bindings.ts";

async function fixture(extra = ""): Promise<Readonly<{ operationId: string; descriptor: { path: string; bytes: number; sha256: string }; text: string }>> {
  assert.match(controlDataDirectory(), /easyeda-test-control-/u);
  await ensureOperationStorage();
  const operationId = newOperationId();
  const directory = operationPath(operationId).slice(0, -5);
  await mkdir(directory, { mode: 0o700 });
  const path = join(directory, "20-edit-witness-clock-qualification.json");
  const text = JSON.stringify({ profile: "private.closed-symbol-witness-clock-qualification.v1", operationId, synthetic: extra });
  await writeFile(path, text, { mode: 0o600, flag: "wx" });
  return { operationId, text, descriptor: { path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) } };
}
void test("SQL auxiliary consumer preserves exact operation-bound UTF8 artifact", async () => {
  const value = await fixture("Synthetic Ω\uFFFD");
  assert.deepEqual(await readWitnessClockArtifact(value.operationId, value.descriptor, value.descriptor.sha256), JSON.parse(value.text));
});
void test("SQL auxiliary consumer rejects same-size same-decoded malformed bytes", async () => {
  const value = await fixture("\uFFFD");
  const bytes = await readFile(value.descriptor.path);
  const offset = bytes.indexOf(Buffer.from("\uFFFD")); assert.notEqual(offset, -1);
  bytes.set([0xF0, 0x9F, 0x92], offset);
  assert.equal(bytes.toString("utf8"), value.text);
  await writeFile(value.descriptor.path, bytes);
  await assert.rejects(readWitnessClockArtifact(value.operationId, value.descriptor, value.descriptor.sha256), /raw bytes/u);
});
for (const change of ["path", "digest", "size", "operation", "profile", "over-bound"] as const) {
  void test(`SQL auxiliary exact reader retains ${change} refusal`, async () => {
    const value = await fixture(change === "over-bound" ? "x".repeat(60_000) : "");
    const descriptor = { ...value.descriptor };
    if (change === "path") { descriptor.path += ".other"; }
    if (change === "digest") { descriptor.sha256 = "0".repeat(64); }
    if (change === "size") { descriptor.bytes += 1; }
    if (change === "operation" || change === "profile") {
      const text = JSON.stringify({ profile: change === "profile" ? "wrong" : "private.closed-symbol-witness-clock-qualification.v1", operationId: newOperationId() });
      await writeFile(descriptor.path, text);
      descriptor.bytes = Buffer.byteLength(text); descriptor.sha256 = sha256Text(text);
    }
    const expected = change === "digest" ? value.descriptor.sha256 : descriptor.sha256;
    await assert.rejects(readWitnessClockArtifact(value.operationId, descriptor, expected));
  });
}
