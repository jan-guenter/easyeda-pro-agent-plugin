import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { chmod, mkdtemp } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { MAIN_REFERENCE_PLUGIN_URL, snapshotMainReferenceSources } from "./helpers/closed-symbol-main-reference-fifo-fixture.ts";

assert.equal(process.version, "v24.18.0");
// oxlint-disable-next-line typescript/strict-void-return -- Node promisify intentionally ignores execFile's immediate ChildProcess return and retains callback completion.
const execFileAsync = promisify(execFile);
interface Outcome { code: number | null; signal: string | null; output: string; errors: string; timedOut: boolean; outputLimit: boolean; opened: boolean; childError: string | null }
async function attempt(kind: "live" | "recorded"): Promise<Outcome> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && isAbsolute(root) && /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u.test(basename(root)));
  const directory = await mkdtemp(join(root, "main-reference-fifo-")); await chmod(directory, 0o700);
  await execFileAsync("/usr/bin/mkfifo", ["-m", "600", join(directory, "owner-source.fifo")], { env: {}, timeout: 1000 });
  const child = spawn(process.execPath, ["--import", fileURLToPath(new URL("scripts/test-isolation.ts", MAIN_REFERENCE_PLUGIN_URL)),
    fileURLToPath(new URL("helpers/closed-symbol-main-reference-fifo-child.ts", import.meta.url)), kind, directory],
  { env: { EASYEDA_FIFO_TEST_ROOT: root }, stdio: ["ignore", "pipe", "pipe"] });
  const closing = Promise.withResolvers<{ code: number | null; signal: string | null }>();
  let errors = "", opened = false, output = "", outputLimit = false, timedOut = false;
  let childError: Error | undefined;
  const stop = (): void => { child.kill("SIGKILL"); };
  let timer = setTimeout(() => { timedOut = true; stop(); }, 10_000);
  child.once("error", error => { childError = error; });
  child.once("close", (code, signal) => { closing.resolve({ code, signal }); });
  child.stdout.on("data", (bytes: Buffer) => {
    if (Buffer.byteLength(output) + bytes.length > 4096) { outputLimit = true; stop(); return; }
    output += bytes.toString("utf8");
    if (!opened && output.includes("FIFO_OPEN\n")) {
      opened = true; clearTimeout(timer); timer = setTimeout(() => { timedOut = true; stop(); }, 2000);
    }
  });
  child.stderr.on("data", (bytes: Buffer) => {
    if (Buffer.byteLength(errors) + bytes.length > 16_384) { outputLimit = true; stop(); return; }
    errors += bytes.toString("utf8");
  });
  try {
    const result = await closing.promise;
    return { ...result, output, errors, timedOut, outputLimit, opened, childError: childError?.message ?? null };
  } finally {
    clearTimeout(timer);
    if (child.exitCode === null && child.signalCode === null) { stop(); }
    await closing.promise;
  }
}
for (const kind of ["live", "recorded"] as const) {
  void test(`${kind} compiler refuses a real FIFO without waiting for a writer`, async context => {
    const sources = await snapshotMainReferenceSources();
    try {
      const outcome = await attempt(kind);
      context.diagnostic(JSON.stringify({ kind, ...outcome, actualEasyedaAccess: false, packagedAssetsChanged: false }));
      assert.equal(outcome.opened, true, outcome.errors); assert.equal(outcome.outputLimit, false);
      assert.equal(outcome.childError, null); assert.equal(outcome.errors, "");
      assert.equal(outcome.timedOut, false); assert.equal(outcome.code, 0); assert.equal(outcome.signal, null);
      assert.equal(outcome.output, "FIFO_OPEN\nFIFO_REFUSED_AND_CLOSED\n");
    } finally { assert.deepEqual(await snapshotMainReferenceSources(), sources); }
  });
}
