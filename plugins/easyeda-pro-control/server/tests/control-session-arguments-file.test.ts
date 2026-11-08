import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, mkdir, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { MAXIMUM_REQUEST_BYTES, parseSessionInputRequest, parseSessionRequest, resolveSessionCallArguments, runSessionRequests } from "../../scripts/control-session.ts";
import { managerInputLines, parseSessionManagerRequest, sessionManagerCallBudgetAvailable } from "../../scripts/control-session-manager.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
/** Yield fragmented stdin bytes without a terminal or a facade allocation. */
async function* chunks(bytes: Buffer): AsyncGenerator<Buffer> { yield bytes.subarray(0, 17); yield* await Promise.resolve([bytes.subarray(17)]); }
/** Supply one complete line to the serial foreground client. */
async function* lines(line: string): AsyncGenerator<string> { yield* await Promise.resolve([line]); }
/** Retain one private fixture file and return its exact SHA-bound selector. */
async function file(directory: string, name: string, bytes: Buffer): Promise<Readonly<{ path: string; expectedSha256: string }>> {
  const path = join(directory, name); await writeFile(path, bytes, { mode: 0o600 });
  return Object.freeze({ path, expectedSha256: hash(bytes) });
}

void test("short file selector carries the complete long fingerprint through framed stdin exactly once", async () => {
  await assertTestIsolation(); const directory = await createTestTemporaryDirectory("session-argument-file-");
  const original = { request: { action: "fixture-read" }, expectedFingerprint: { exact: "x".repeat(6000), nested: ["🎹", 1, true] } };
  const selected = await file(directory, "args.json", Buffer.from(JSON.stringify(original)));
  const line = JSON.stringify({ id: "file", tool: "easyeda_control_api", argumentsFile: selected });
  assert.ok(Buffer.byteLength(line) < 4096); const inputChunks = chunks(Buffer.from(`${line}\n`));
  const framed = await Array.fromAsync(managerInputLines(inputChunks));
  assert.deepEqual(framed, [line]); let invocations = 0; const outputs: unknown[] = [];
  await runSessionRequests(lines(line), new Set(["easyeda_control_api"]), async request => {
    invocations += 1; assert.deepEqual(request.arguments, original); assert.equal(Object.hasOwn(request, "argumentsFile"), false);
    await writeFile(selected.path, '{"changed":true}'); assert.deepEqual(request.arguments, original);
    return { completeArgumentBytes: Buffer.byteLength(JSON.stringify(request.arguments)) };
  }, async value => { outputs.push(value); await Promise.resolve(); });
  assert.equal(invocations, 1); assert.deepEqual(outputs, [{ id: "file", result: { completeArgumentBytes: Buffer.byteLength(JSON.stringify(original)) } }]);
  const denied: unknown[] = []; const unavailable = JSON.stringify({ id: "unlisted", tool: "easyeda_control_unknown", argumentsFile: { ...selected, path: join(directory, "absent.json") } });
  await runSessionRequests(lines(unavailable), new Set(["easyeda_control_api"]), () => Promise.reject(new Error("unlisted tool dispatched")), async value => { denied.push(value); await Promise.resolve(); });
  assert.deepEqual(denied, [{ id: "unlisted", error: "tool-not-admitted", dispatched: false }]);
});

void test("file grammar is tool-only and exclusive while inline parsing remains unchanged", () => {
  const argumentsFile = { path: "/private/arguments.json", expectedSha256: "a".repeat(64) };
  const ordinary = { id: 1, tool: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } };
  assert.deepEqual(parseSessionInputRequest(JSON.stringify(ordinary)), parseSessionRequest(JSON.stringify(ordinary)));
  for (const candidate of [{ ...ordinary, argumentsFile }, { id: 1, shutdown: true, argumentsFile },
    { id: 1, action: "inspect", argumentsFile }, { id: 1, action: "cleanup-original", generation: 1, interruptedRequestId: "old", request: { action: "inspect" }, argumentsFile },
    { id: 1, action: "in-flight-original", generation: 1, originalRequestId: "old", request: { action: "inspect" }, argumentsFile },
    { id: 1, tool: "easyeda_control_api", argumentsFile: { ...argumentsFile, extra: true } }]) {
    assert.throws(() => parseSessionManagerRequest(JSON.stringify(candidate)));
  }
  assert.throws(() => parseSessionInputRequest(JSON.stringify({ id: 1, tool: "easyeda_control_api", argumentsFile: { ...argumentsFile, path: "relative" } })));
});

void test("hash, encoding, JSON, file identity and permission refusals never dispatch or expose their contents", async () => {
  await assertTestIsolation(); const directory = await createTestTemporaryDirectory("session-argument-hostile-");
  const sentinel = "private-argument-canary"; const good = await file(directory, "good.json", Buffer.from(JSON.stringify({ sentinel })));
  const variants = [
    { ...good, expectedSha256: "0".repeat(64) },
    await file(directory, "malformed.json", Buffer.from(`{"${sentinel}":`)),
    await file(directory, "invalid-utf8.json", Buffer.from([0xC3, 0x28])),
    await file(directory, "bom.json", Buffer.from("\uFEFF{}")),
    await file(directory, "array.json", Buffer.from("[]")),
    await file(directory, "null.json", Buffer.from("null")),
    await file(directory, "oversized.json", Buffer.alloc(MAXIMUM_REQUEST_BYTES + 1, 32)),
  ];
  const symbolic = join(directory, "symbolic.json"); await symlink(good.path, symbolic);
  const linked = await file(directory, "linked.json", Buffer.from("{}")); await link(linked.path, join(directory, "second-link.json"));
  const publicFile = await file(directory, "public.json", Buffer.from("{}")); await chmod(publicFile.path, 0o644);
  const nested = join(directory, "nested"); await mkdir(nested, { mode: 0o700 }); const inside = await file(nested, "inside.json", Buffer.from("{}"));
  const alias = join(directory, "alias"); await symlink(nested, alias);
  variants.push({ ...good, path: symbolic }, linked, publicFile, { ...inside, path: join(alias, "inside.json") }, { ...good, path: nested });
  let invoked = 0;
  const invoke = (): Promise<unknown> => { invoked += 1; return Promise.resolve({}); };
  for (const argumentsFile of variants) {
    const line = JSON.stringify({ id: 1, tool: "easyeda_control_api", argumentsFile }), output: unknown[] = [];
    await runSessionRequests(lines(line), new Set(["easyeda_control_api"]), invoke, async value => { output.push(value); await Promise.resolve(); });
    assert.deepEqual(output, [{ id: 1, error: "invalid-request", dispatched: false }]);
    assert.equal(JSON.stringify(output).includes(sentinel), false); assert.equal(JSON.stringify(output).includes(argumentsFile.path), false);
  }
  assert.equal(invoked, 0);
});

void test("file bytes share the original request limit and manager evidence reserve", async () => {
  await assertTestIsolation(); const directory = await createTestTemporaryDirectory("session-argument-bound-");
  const selected = await file(directory, "exact.json", Buffer.from("{}"));
  let line = JSON.stringify({ id: 1, tool: "easyeda_control_api", argumentsFile: selected });
  const maximum = MAXIMUM_REQUEST_BYTES - Buffer.byteLength(line); const exact = Buffer.from(`{}${" ".repeat(maximum - 2)}`);
  await writeFile(selected.path, exact); line = JSON.stringify({ id: 1, tool: "easyeda_control_api", argumentsFile: { ...selected, expectedSha256: hash(exact) } });
  const parsed = parseSessionInputRequest(line); assert.ok("tool" in parsed);
  const resolved = await resolveSessionCallArguments(parsed, Buffer.byteLength(line)); assert.equal(resolved.inputBytes, MAXIMUM_REQUEST_BYTES); assert.deepEqual(resolved.request.arguments, {});
  const over = Buffer.concat([exact, Buffer.from(" ")]); await writeFile(selected.path, over);
  const overLine = JSON.stringify({ id: 1, tool: "easyeda_control_api", argumentsFile: { ...selected, expectedSha256: hash(over) } });
  const overParsed = parseSessionInputRequest(overLine); assert.ok("tool" in overParsed);
  await assert.rejects(resolveSessionCallArguments(overParsed, Buffer.byteLength(overLine)), /arguments-file-rejected/u);
  const remaining = 1_073_741_824 - 67_108_864 - 65_536 - 100;
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, remaining, 100), true);
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, remaining, 101), false);
});
