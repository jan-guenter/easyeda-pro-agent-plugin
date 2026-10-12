import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, readArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { ArtifactDescriptor } from "../src/artifacts.ts";
import { newOperationId } from "../src/core.ts";
import { readLibraryBeforeRecoveryArtifact, readLibraryRecoveryArtifact } from "../src/library-recovery-state.ts";

const PAGE_BYTES = 256 * 1024;
function artifact(value: unknown): Promise<ArtifactDescriptor> {
  assert.ok(basename(controlDataDirectory()).startsWith("easyeda-test-control-"),
    "Run with the mandatory test-isolation preload, never against live control data.");
  return writePhaseArtifact(newOperationId(), 1, "before", value);
}

for (const [name, read] of [["prepared", readLibraryRecoveryArtifact], ["before", readLibraryBeforeRecoveryArtifact]] as const) {
  for (const character of ["¢", "€", "😀", "\uFFFD"]) {
    for (let split = 1; split <= Buffer.byteLength(character); split += 1) {
      for (const predecessor of ["", "\uFFFD", "\uFFFD\uFFFD"]) {
        void test(`${name} recovery preserves U+${character.codePointAt(0)?.toString(16)} at byte ${String(split)} with ${String(predecessor.length)} preceding replacements`, async () => {
          const prefixBytes = Buffer.byteLength('{"padding":"');
          const value = { padding: `${"x".repeat(PAGE_BYTES - prefixBytes - Buffer.byteLength(predecessor) - split)}${predecessor}${character}${"y".repeat(2 * PAGE_BYTES)}` };
          const descriptor = await artifact(value);
          const first = await readArtifact(descriptor.path, 0, descriptor.bytes);
          assert.equal(first.bytesRead, PAGE_BYTES);
          assert.equal(first.eof, false);
          if (character === "😀" && split === 3) {
            assert.ok(first.text.endsWith("\uFFFD"));
            assert.equal(Buffer.byteLength(first.text), first.bytesRead,
              "The equal-byte replacement defeats the old byte-count-only retry condition.");
          }
          assert.deepEqual(await read(descriptor), value);
        });
      }
    }
  }

  void test(`${name} recovery still rejects same-size content tampering after a successful read`, async () => {
    const value = { padding: "x".repeat(PAGE_BYTES + 64) };
    const descriptor = await artifact(value);
    assert.deepEqual(await read(descriptor), value);
    const changed = `${JSON.stringify({ padding: `y${value.padding.slice(1)}` })}\n`;
    assert.equal(Buffer.byteLength(changed), descriptor.bytes);
    await writeFile(descriptor.path, changed);
    await assert.rejects(read(descriptor), /Library recovery artifact hash mismatch/u);
  });

  for (const malformed of [
    { name: "three-byte prefix of a four-byte character", bytes: [0xF0, 0x9F, 0x98], refusal: /Library recovery artifact hash mismatch/u },
    { name: "encoded surrogate", bytes: [0xED, 0xA0, 0x80], refusal: /Library recovery artifact UTF-8 is invalid/u },
  ]) {
    void test(`${name} recovery refuses malformed UTF-8 ${malformed.name} even with the raw-file digest`, async () => {
      const value = { padding: "x".repeat(PAGE_BYTES + 64) };
      const descriptor = await artifact(value);
      const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
      bytes.set(malformed.bytes, Buffer.byteLength('{"padding":"') + 8);
      assert.equal(bytes.length, descriptor.bytes);
      await writeFile(descriptor.path, bytes);
      const rawFileSha256 = createHash("sha256").update(bytes).digest("hex");
      await assert.rejects(read({ ...descriptor, sha256: rawFileSha256 }), malformed.refusal);
    });
  }

  void test(`${name} recovery retains exact descriptor-size checks`, async () => {
    const descriptor = await artifact({ padding: "x".repeat(PAGE_BYTES + 64) });
    for (const difference of [-1, 1]) {
      await assert.rejects(read({ ...descriptor, bytes: descriptor.bytes + difference }), /Library recovery artifact identity\/size changed/u);
    }
  });
}
