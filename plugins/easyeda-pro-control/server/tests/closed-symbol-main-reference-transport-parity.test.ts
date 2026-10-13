/** Fixed source and output contract; no historical implementation is packaged. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { canonicalJson } from "../src/core.ts";
import { buildMainReferenceProgram } from "../src/closed-symbol-main-reference-program.ts";
import { compileMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { request } from "./helpers/main-reference-settlement-fixture.ts";

const sourcePins = Object.freeze({
  "owner-command.ps1": "f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5",
  "stdin-decoder.ps1": "c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90",
  "OwnedSyntheticJob.cs": "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727",
  "EasyedaClockObservation.cs": "97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c",
});
function digest(value: string | Buffer): string { return createHash("sha256").update(value).digest("hex"); }
function section(text: string, start: string, end: string): string {
  const first = text.indexOf(start), last = text.indexOf(end, first);
  assert.ok(first !== -1 && last > first); assert.equal(text.indexOf(start, first + start.length), -1);
  return text.slice(first, last);
}
void test("fixed packaged source reader and command compiler retain reviewed bodies", async () => {
  const text = await readFile(new URL("../src/closed-symbol-main-reference-transport.ts", import.meta.url), "utf8");
  const reader = section(text, "async function source(", "export interface CompiledMainReferenceTransport");
  const compiler = section(text, "export async function compileMainReferenceTransport(", "\n/** Current binary-helper compiler.");
  assert.equal(digest(reader), "eb17f62e0e3ca2774f6dbf80aa2b7acecffe98bbf4cc86b2590addca9920f781");
  assert.equal(digest(compiler), "1af2b93ff56e8a4b31268b55aaf4cb37aa9531dba1965be5147297aaafe72ec5");
});
void test("native v2 result validator retains the exact current success relation", async () => {
  const text = await readFile(new URL("../src/closed-symbol-main-reference-transport.ts", import.meta.url), "utf8");
  const start = "export function validateMainReferenceTransportResult";
  const position = text.indexOf(start);
  assert.ok(position !== -1); assert.equal(text.indexOf(start, position + start.length), -1);
  assert.equal(digest(text.slice(position)), "d6ef052a4f243e92b08170f53a9618e900fd37d2d00dff5ea405b83d2d8de924");
});
for (const createdAtLiteral of ["2026-01-15 12:34:56", "2026-07-15 12:34:56", "2020-01-01 00:00:00"]) {
  void test(`fixed compiler output contract remains bounded for ${createdAtLiteral}`, async () => {
    const input = { ...request, createdAtLiteral };
    const compiled = await compileMainReferenceTransport(input);
    const main = buildMainReferenceProgram(input), requestText = canonicalJson(input);
    assert.deepEqual(compiled.request, input); assert.deepEqual(compiled.sourcePins, sourcePins);
    assert.equal(compiled.command.length, 21_383); assert.ok(compiled.stdin.length <= 180_000);
    assert.equal(compiled.commandSha256, digest(compiled.command)); assert.equal(compiled.mainSha256, digest(main));
    assert.equal(compiled.requestSha256, digest(requestText));
    const owner = await readFile(new URL("../../scripts/main-reference/OwnedSyntheticJob.cs", import.meta.url));
    const clock = await readFile(new URL("../../scripts/main-reference/EasyedaClockObservation.cs", import.meta.url));
    assert.equal(compiled.stdinProfile, "private.main-reference-stdin.v2"); assert.equal(compiled.stdinSha256, digest(compiled.stdin));
    assert.equal(compiled.stdin, JSON.stringify({ profile: "private.main-reference-stdin.v2", ownerBase64: owner.toString("base64"),
      clockBase64: clock.toString("base64"), mainBase64: Buffer.from(main).toString("base64"), requestBase64: Buffer.from(requestText).toString("base64") }));
    assert.match(compiled.command, /throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'/u);
    assert.doesNotMatch(compiled.command, /ExecutionPolicy|EncodedCommand|Invoke-Expression|ScriptBlock/u);
  });
}
void test("four native assets and fixed main-program source remain exact", async () => {
  for (const [name, expected] of Object.entries(sourcePins)) {
    const bytes = await readFile(new URL(`../../scripts/main-reference/${name}`, import.meta.url));
    assert.equal(digest(bytes), expected);
  }
  const program = await readFile(new URL("../src/closed-symbol-main-reference-program.ts", import.meta.url));
  assert.equal(digest(program), "b06d736a952d03901766709bd30760367713b4078a8ecbb9802a63da1544a467");
});
