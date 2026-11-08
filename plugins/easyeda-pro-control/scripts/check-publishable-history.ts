#!/usr/bin/env node
/** Run before the first explicit branch push, against its reviewed public base. */
import { execFile } from "node:child_process";
import process from "node:process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { checkPublishableHistory, gitEnvironment } from "./publishable-history.ts";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--base" || args[1] === undefined) { throw new Error("PUBLISHABLE_HISTORY_USAGE"); }
  const repository = resolve(import.meta.dirname, "../../..");
  // oxlint-disable-next-line typescript/strict-void-return -- Node returns a child; promisify consumes its completion callback.
  const execute = promisify(execFile);
  let head: string;
  try {
    const actual = await execute("git", ["rev-parse", "--verify", "HEAD"], { cwd: repository, env: gitEnvironment, maxBuffer: 4096, timeout: 10_000 });
    head = actual.stdout.trim();
  } catch { throw new Error("PUBLISHABLE_HISTORY_HEAD"); }
  const result = await checkPublishableHistory(repository, args[1], head);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); if (!result.ok) { process.exitCode = 1; }
}
async function run(): Promise<void> {
  try { await main(); }
  catch (error) {
    const code = error instanceof Error && /^PUBLISHABLE_HISTORY_[A-Z_]+$/u.test(error.message) ? error.message : "PUBLISHABLE_HISTORY_CHECK_FAILED";
    process.stderr.write(`${code}\n`); process.exitCode = 1;
  }
}
// oxlint-disable-next-line unicorn/prefer-top-level-await -- Keep synchronous module loading and sanitize all command-line failures in run().
void run();
