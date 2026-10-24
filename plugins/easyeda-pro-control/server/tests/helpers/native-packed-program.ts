import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

/** Independent reader for generated C# constants, never production execution. */
export function readPackedNativeProgram(native: string, name: string): string {
  assert.match(name, /^[A-Z][A-Za-z0-9]{1,63}Function$/u);
  const encoded = new RegExp(`const string ${name}Gzip="([A-Za-z0-9+/=]+)";`, "u").exec(native)?.[1];
  const sourceSha = new RegExp(`const string ${name}Sha256="([a-f0-9]{64})";`, "u").exec(native)?.[1];
  const invocation = new RegExp(`static readonly string ${name}=UnpackFixedProgram\\(${name}Gzip,([0-9]+),${name}Sha256,"([a-f0-9]{64})"\\);`, "u").exec(native);
  assert.ok(encoded !== undefined && sourceSha !== undefined && invocation?.[1] !== undefined && invocation[2] !== undefined);
  const length = Number(invocation[1]);
  assert.ok(Number.isSafeInteger(length) && length > 0 && length <= 65_536 && encoded.length <= 87_384);
  const compressed = Buffer.from(encoded, "base64");
  assert.equal(compressed.toString("base64"), encoded);
  assert.ok(compressed.length >= 18 && compressed.length <= 65_536);
  assert.equal(createHash("sha256").update(compressed).digest("hex"), invocation[2]);
  // oxlint-disable-next-line node/no-sync -- This independent test decoder has an exact64KiB ceiling and no runtime request use.
  const bytes = gunzipSync(compressed, { maxOutputLength: length });
  assert.equal(bytes.length, length);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), sourceSha);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
