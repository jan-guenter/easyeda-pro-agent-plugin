import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdtemp, open, readFile, rmdir } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";
import { SqlReaderFailureError, readExactSqlInventory, readerCompletion } from "../src/sqlite-inventory.ts";
import { record, sha256Json } from "../src/sqlite-inventory-json.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

type Spawn = typeof childProcess.spawn;
type SpawnWrapper = (original: Spawn, args: Parameters<Spawn>) => ChildProcess;
type OutputTransform = (output: string) => string;

async function fixture(): Promise<Parameters<typeof readExactSqlInventory>[0] & { directory: string }> {
  const directory = await mkdtemp(`${syntheticSqlRoot()}/synthetic-protocol-`);
  const checkpointPath = `${directory}/closed.eprj2`;
  const database = new DatabaseSync(checkpointPath);
  try { database.exec("CREATE TABLE t(id INTEGER PRIMARY KEY,value TEXT); INSERT INTO t VALUES(1,'synthetic')"); }
  finally { database.close(); }
  return { checkpointPath, expectedSha256: createHash("sha256").update(await readFile(checkpointPath)).digest("hex"),
    directory, runtime: await syntheticSqlRuntime() };
}

async function withSpawn(context: TestContext, wrap: SpawnWrapper, body: () => Promise<void>): Promise<void> {
  const original = childProcess.spawn;
  const interception = context.mock.method(childProcess, "spawn", (...args: Parameters<Spawn>): ChildProcess => wrap(original, args));
  syncBuiltinESMExports();
  try { await body(); }
  finally { interception.mock.restore(); syncBuiltinESMExports(); }
}

// Only this test process changes transport bytes. The child still runs the
// Actual descriptor-bound executable and maintained, fixed read-only program.
function outputTransform(context: TestContext, original: Spawn, args: Parameters<Spawn>, transform: OutputTransform): ChildProcess {
  const child = original(...args);
  const stream = child.stdout;
  assert.ok(stream !== null);
  const emit = stream.emit.bind(stream);
  const chunks: Buffer[] = [];
  context.mock.method(stream, "emit", (event: string | symbol, ...values: unknown[]): boolean => {
    if (event === "data") {
      assert.ok(Buffer.isBuffer(values[0]));
      chunks.push(values[0]);
      return true;
    }
    if (event === "end") {
      const output = Buffer.concat(chunks).toString("utf8");
      emit("data", Buffer.from(transform(output)));
    }
    return emit(event, ...values);
  });
  return child;
}

function changeResult(output: string, change: (inventory: Record<string, unknown>) => void): string {
  const lines = output.split("\n");
  assert.equal(lines.length, 3);
  const result: unknown = JSON.parse(lines[1] ?? "");
  assert.ok(record(result) && record(result["inventory"]));
  change(result["inventory"]);
  return `${lines[0]}\n${JSON.stringify(result)}\n`;
}

function firstTable(inventory: Record<string, unknown>): Record<string, unknown> {
  const tables = inventory["tables"];
  assert.ok(Array.isArray(tables) && record(tables[0]));
  return tables[0];
}

const transforms: readonly (readonly [string, OutputTransform])[] = [
  ["missing start phase", (output) => output.slice(output.indexOf("\n") + 1)],
  ["extra output line", (output) => `${output}{}\n`],
  ["wrong checkpoint hash", (output) => changeResult(output, (value) => { value["checkpointSha256"] = "0".repeat(64); })],
  ["wrong table digest despite a matching outer digest", (output) => changeResult(output, (value) => {
    firstTable(value)["sha256"] = "0".repeat(64);
    value["logicalSha256"] = sha256Json({ schema: value["schema"], properties: value["properties"], tables: value["tables"] });
  })],
  ["wrong logical digest", (output) => changeResult(output, (value) => { value["logicalSha256"] = "0".repeat(64); })],
  ["invalid cell encoding", (output) => changeResult(output, (value) => {
    const rows = firstTable(value)["rows"];
    assert.ok(Array.isArray(rows) && record(rows[0]) && Array.isArray(rows[0]["cells"]));
    rows[0]["cells"][0] = { kind: "integer", decimal: "NaN" };
  })],
];

void describe("isolated SQLite reader transport admission", { concurrency: false }, () => {
  for (const [label, transform] of transforms) {
    void test(`parent refuses child protocol ${label} only after actual close`, async (context) => {
      const input = await fixture();
      await withSpawn(context, (original, args) => outputTransform(context, original, args, transform), async () => {
        await assert.rejects(readExactSqlInventory(input), (error: unknown) => {
          assert.ok(error instanceof SqlReaderFailureError);
          assert.match(error.message, /protocol refused/u);
          assert.equal(error.completion.observedChildClose, true);
          assert.equal(error.completion.exitCode, 0);
          assert.equal(error.completion.exitSignal, null);
          return true;
        });
      });
    });
  }

  void test("original child protocol remains accepted through the same test interception", async (context) => {
    const input = await fixture();
    await withSpawn(context, (original, args) => outputTransform(context, original, args, (output) => output), async () => {
      const result = await readExactSqlInventory(input);
      assert.equal(readerCompletion(result).observedChildClose, true);
      assert.equal(readerCompletion(result).exitCode, 0);
      assert.equal(readerCompletion(result).exitSignal, null);
    });
  });

  void test("reader survives a removed package working directory without changing its parent cwd", async () => {
    const input = await fixture();
    const originalDirectory = process.cwd();
    const removedDirectory = await mkdtemp(`${input.directory}/retired-package-`);
    try {
      process.chdir(removedDirectory);
      // Remove only this empty synthetic directory, never a package or control root.
      await rmdir(removedDirectory);
      assert.throws(() => process.cwd(), { code: "ENOENT" });
      const result = await readExactSqlInventory(input);
      assert.equal(result.checkpointSha256, input.expectedSha256);
      assert.equal(readerCompletion(result).observedChildClose, true);
      assert.equal(readerCompletion(result).exitCode, 0);
      assert.equal(readerCompletion(result).exitSignal, null);
      assert.throws(() => process.cwd(), { code: "ENOENT" });
    } finally { process.chdir(originalDirectory); }
  });

  void test("child refuses substituted inherited database fd even for identical source bytes", async (context) => {
    const input = await fixture();
    const duplicatePath = `${input.directory}/duplicate.eprj2`;
    await copyFile(input.checkpointPath, duplicatePath);
    const duplicate = await open(duplicatePath, "r");
    try {
      await withSpawn(context, (original, [program, args, options]) => original(program, args,
        { ...options, stdio: ["pipe", "pipe", "pipe", duplicate.fd] }), async () => {
        await assert.rejects(readExactSqlInventory(input), (error: unknown) => {
          assert.ok(error instanceof SqlReaderFailureError);
          assert.match(error.message, /descriptor identity mismatch/u);
          assert.equal(error.completion.observedChildClose, true);
          assert.equal(error.completion.exitCode, 2);
          assert.equal(error.completion.exitSignal, null);
          return true;
        });
      });
    } finally { await duplicate.close(); }
  });

  void test("wrong runtime executable hash refuses before spawning the inventory child", async (context) => {
    const input = await fixture();
    let spawns = 0;
    await withSpawn(context, () => { spawns += 1; throw new Error("Unexpected inventory child."); }, async () => {
      await assert.rejects(readExactSqlInventory({ ...input, runtime: { ...input.runtime, nodeSha256: "0".repeat(64) } }), /hash/iu);
      assert.equal(spawns, 0);
    });
  });
});
