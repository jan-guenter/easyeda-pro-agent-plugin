import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, readArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { ArtifactDescriptor } from "../src/artifacts.ts";
import { newOperationId } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";

const PAGE_BYTES = 256 * 1024;

function retainedPhase(descriptor: ArtifactDescriptor): Promise<unknown> {
  // Reach the actual private parser without constructing an engine or exposing a new API.
  const method: unknown = Reflect.get(DesignExecutor, "phase");
  assert.ok(typeof method === "function");
  const journal = new Proxy({ artifacts: [descriptor] }, {
    get(target, key, receiver): unknown {
      assert.equal(key, "artifacts", "The parser must not access lifecycle or dispatch authority.");
      return Reflect.get(target, key, receiver);
    },
  });
  const pending: unknown = Reflect.apply(method, DesignExecutor, [journal, "before"]);
  assert.ok(pending instanceof Promise);
  return pending;
}

function assertIsolated(): void {
  assert.ok(basename(controlDataDirectory()).startsWith("easyeda-test-control-"),
    "Run with the mandatory test-isolation preload, never against live control data.");
}

for (const character of ["¢", "€", "😀", "\uFFFD"]) {
  for (let split = 1; split <= Buffer.byteLength(character); split += 1) {
    for (const predecessor of ["", "\uFFFD", "\uFFFD\uFFFD"]) {
      void test(`retained phase preserves U+${character.codePointAt(0)?.toString(16)} at byte ${String(split)} with ${String(predecessor.length)} preceding replacements`, async () => {
        assertIsolated();
        const prefixBytes = Buffer.byteLength('{"padding":"');
        const value = { padding: `${"x".repeat(PAGE_BYTES - prefixBytes - Buffer.byteLength(predecessor) - split)}${predecessor}${character}${"y".repeat(2 * PAGE_BYTES)}` };
        const descriptor = await writePhaseArtifact(newOperationId(), 1, "before", value);
        const first = await readArtifact(descriptor.path, 0, descriptor.bytes);
        assert.equal(first.bytesRead, PAGE_BYTES);
        assert.equal(first.eof, false);
        if (character === "😀" && split === 3) {
          assert.ok(first.text.endsWith("\uFFFD"));
          assert.equal(Buffer.byteLength(first.text), first.bytesRead,
            "The equal-byte replacement defeats the old byte-count-only retry condition.");
        }
        assert.deepEqual(await retainedPhase(descriptor), value);
      });
    }
  }
}

void test("retained phase still rejects same-size content tampering after a successful read", async () => {
  assertIsolated();
  const value = { padding: "x".repeat(PAGE_BYTES + 64) };
  const descriptor = await writePhaseArtifact(newOperationId(), 1, "before", value);
  assert.deepEqual(await retainedPhase(descriptor), value);
  const changed = `${JSON.stringify({ padding: `y${value.padding.slice(1)}` })}\n`;
  assert.equal(Buffer.byteLength(changed), descriptor.bytes);
  await writeFile(descriptor.path, changed);
  await assert.rejects(retainedPhase(descriptor), /Retained design phase hash changed/u);
});

for (const malformed of [
  { name: "three-byte prefix of a four-byte character", bytes: [0xF0, 0x9F, 0x98], refusal: /Retained design phase hash changed/u },
  { name: "encoded surrogate", bytes: [0xED, 0xA0, 0x80], refusal: /UTF-8 chunk boundary is unsupported/u },
]) {
  void test(`retained phase refuses malformed UTF-8 ${malformed.name} even with the raw-file digest`, async () => {
    assertIsolated();
    const value = { padding: "x".repeat(PAGE_BYTES + 64) };
    const descriptor = await writePhaseArtifact(newOperationId(), 1, "before", value);
    const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
    bytes.set(malformed.bytes, Buffer.byteLength('{"padding":"') + 8);
    assert.equal(bytes.length, descriptor.bytes);
    await writeFile(descriptor.path, bytes);
    const rawFileSha256 = createHash("sha256").update(bytes).digest("hex");
    await assert.rejects(retainedPhase({ ...descriptor, sha256: rawFileSha256 }), malformed.refusal);
  });
}

void test("retained phase retains exact descriptor-size checks", async () => {
  assertIsolated();
  const descriptor = await writePhaseArtifact(newOperationId(), 1, "before", { padding: "x".repeat(PAGE_BYTES + 64) });
  for (const difference of [-1, 1]) {
    await assert.rejects(retainedPhase({ ...descriptor, bytes: descriptor.bytes + difference }), /Retained design phase changed/u);
  }
});
