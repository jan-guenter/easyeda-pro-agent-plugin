import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// oxlint-disable-next-line typescript/strict-void-return -- Node promisify intentionally ignores execFile's immediate ChildProcess return and retains actual callback completion.
const execFileAsync = promisify(execFile);
async function makeFifo(path: string): Promise<void> {
  await execFileAsync("/usr/bin/mkfifo", ["-m", "600", path], { env: {}, timeout: 1000 });
}
async function attempt(mode: "old" | "fixed"): Promise<{ timedOut: boolean; code: number | null; signal: string | null; output: string }> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && /^\/tmp\/easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u.test(root));
  const directory = await mkdtemp(join(root, "fifo-race-")), path = join(directory, "journal.json");
  await writeFile(path, "{\"synthetic\":true}\n", { flag: "wx", mode: 0o600 });
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/closed-symbol-terminal-closure-fifo-child.ts", import.meta.url)), path, mode], { env: { EASYEDA_FIFO_TEST_ROOT: root }, stdio: ["pipe", "pipe", "pipe"] });
  let output = "";
  let stderr = "";
  let timedOut = false;
  const closing = Promise.withResolvers<{ code: number | null; signal: string | null }>();
  const readiness = Promise.withResolvers<true>();
  const closed = closing.promise, ready = readiness.promise;
  child.once("close", (code, signal) => { closing.resolve({ code, signal }); });
  child.stdout.on("data", (bytes: Buffer) => { output += bytes.toString("utf8"); if (output.includes("REGULAR\n")) { readiness.resolve(true); } });
  child.stderr.on("data", (bytes: Buffer) => { stderr += bytes.toString("utf8"); });
  let timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, 5000);
  try {
    const first = await Promise.race([ready.then(() => "ready"), closed.then(() => "closed")]);
    assert.equal(first, "ready", stderr);
    await rename(path, `${path}.original`);
    await makeFifo(path);
    clearTimeout(timer);
    timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, 1000);
    child.stdin.end("GO\n");
    const result = await closed;
    assert.equal(stderr, ""); return { ...result, timedOut, output };
  } finally {
    clearTimeout(timer);
    if (child.exitCode === null && child.signalCode === null) { child.kill("SIGKILL"); }
    await closed;
  }
}
void test("old read-only flags block on a FIFO replacement until the owned child deadline", async () => {
  const result = await attempt("old");
  assert.equal(result.timedOut, true); assert.equal(result.signal, "SIGKILL"); assert.equal(result.code, null); assert.equal(result.output, "REGULAR\n");
});
void test("O_NONBLOCK opens the replacement only long enough to reject its non-regular type", async () => {
  const result = await attempt("fixed");
  assert.equal(result.timedOut, false); assert.equal(result.signal, null); assert.equal(result.code, 0); assert.equal(result.output, "REGULAR\nFIFO-REFUSED\n");
});
