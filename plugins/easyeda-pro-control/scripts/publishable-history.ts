/** Read-only publication guard. Deleted files, older commit messages and tree
 * entries remain reachable when a branch is pushed, so current files alone
 * cannot establish that the outgoing history is free of private content. */
import { execFile, spawn } from "node:child_process";
import { lstat } from "node:fs/promises";
import { resolve } from "node:path";
import type { Readable } from "node:stream";
import { promisify } from "node:util";
import { privacyPatterns, secretPatterns } from "./repository-content-policy.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node returns a child; promisify consumes only its completion callback.
const execute = promisify(execFile);
const oid = /^(?:[a-f\d]{40}|[a-f\d]{64})$/u;
const limits = Object.freeze({ objects: 50_000, objectBytes: 33_554_432, totalBytes: 1_073_741_824, metadataBytes: 4_194_304, milliseconds: 300_000 });
const repositoryOverrides = new Set(["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_COMMON_DIR", "GIT_NAMESPACE", "GIT_PREFIX"]);
const inherited = Object.fromEntries(Object.entries(process.env).filter(([name]) => !repositoryOverrides.has(name)));
export const gitEnvironment = Object.freeze({ ...inherited, GIT_NO_REPLACE_OBJECTS: "1", GIT_NO_LAZY_FETCH: "1", GIT_OPTIONAL_LOCKS: "0" });
export interface PublishableHistoryResult {
  readonly ok: boolean; readonly base: string; readonly head: string; readonly scannedObjects: number; readonly scannedBytes: number;
  /** Object IDs and rule labels only. A finding never includes matched text. */
  readonly findings: readonly Readonly<{ objectId: string; rules: readonly string[] }>[];
}
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`PUBLISHABLE_HISTORY_${code}`); } }
async function git(repository: string, args: readonly string[]): Promise<string> {
  try {
    const result = await execute("git", [...args], { cwd: repository, env: gitEnvironment, maxBuffer: limits.metadataBytes, timeout: limits.milliseconds }); return result.stdout;
  } catch { throw new Error("PUBLISHABLE_HISTORY_GIT_COMMAND"); }
}
async function noGrafts(repository: string): Promise<void> {
  const result = await git(repository, ["rev-parse", "--git-path", "info/grafts"]);
  need(result.endsWith("\n"), "GRAFT_PATH");
  const path = result.slice(0, -1); need(path.length > 0 && !path.includes("\n") && !path.includes("\0"), "GRAFT_PATH");
  try { await lstat(resolve(repository, path)); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") { return; }
    // oxlint-disable-next-line preserve-caught-error -- Raw filesystem errors can contain private paths; return only the fixed code.
    throw new Error("PUBLISHABLE_HISTORY_GRAFT_INSPECTION");
  }
  throw new Error("PUBLISHABLE_HISTORY_GRAFTS_REFUSED");
}
interface ObjectPacket { readonly objectId: string; readonly bytes: Buffer }
async function* packets(output: Readable, objects: readonly string[]): AsyncGenerator<ObjectPacket> {
  let ordinal = 0;
  let headerBytes = 0;
  let remaining: number | null = null;
  let bodyBytes = 0;
  let total = 0;
  const header: Buffer[] = [];
  const body: Buffer[] = [];
  const chunks: AsyncIterable<unknown> = output;
  for await (const chunk of chunks) {
    need(Buffer.isBuffer(chunk), "BINARY_STREAM"); let offset = 0;
    while (offset < chunk.length) {
      if (remaining === null) {
        const end = chunk.indexOf(10, offset), stop = end === -1 ? chunk.length : end;
        header.push(chunk.subarray(offset, stop)); headerBytes += stop - offset; need(headerBytes <= 128, "HEADER_BOUND"); offset = stop;
        if (end !== -1) {
          const text = Buffer.concat(header, headerBytes).toString("latin1");
          const fields = /^([a-f\d]{40}|[a-f\d]{64}) (blob|commit|tree) (0|[1-9]\d*)$/u.exec(text);
          need(fields !== null && fields[1] === objects[ordinal], "ORIGINAL_OBJECT_ORDER");
          const size = Number(fields[3]); need(Number.isSafeInteger(size) && size <= limits.objectBytes && total + size <= limits.totalBytes, "CONTENT_BOUND");
          remaining = size; total += size; header.length = 0; headerBytes = 0; offset += 1;
        }
      } else if (remaining > 0) {
        const count = Math.min(remaining, chunk.length - offset); body.push(chunk.subarray(offset, offset + count)); bodyBytes += count; remaining -= count; offset += count;
      } else {
        need(chunk[offset] === 10 && objects[ordinal] !== undefined, "BODY_TERMINATOR"); const objectId = objects[ordinal];
        need(objectId !== undefined, "OBJECT_COUNT"); yield { objectId, bytes: Buffer.concat(body, bodyBytes) };
        ordinal += 1; remaining = null; body.length = 0; bodyBytes = 0; offset += 1;
      }
    }
  }
  need(ordinal === objects.length && remaining === null && headerBytes === 0 && bodyBytes === 0, "TRUNCATED_OBJECT_STREAM");
}
/** Exact immutable commit IDs only. Replacement refs and grafts cannot hide
 * an older object. Shallow history refuses instead of silently omitting it. */
export async function checkPublishableHistory(repository: string, base: string, head: string): Promise<PublishableHistoryResult> {
  need(oid.test(base) && oid.test(head), "COMMIT_IDS");
  await noGrafts(repository);
  const shallow = await git(repository, ["rev-parse", "--is-shallow-repository"]); need(shallow.trim() === "false", "SHALLOW_REFUSED");
  for (const commit of [base, head]) { const type = await git(repository, ["cat-file", "-t", commit]); need(type.trim() === "commit", "COMMIT_TYPE"); }
  await git(repository, ["merge-base", "--is-ancestor", base, head]);
  const text = await git(repository, ["rev-list", "--objects", "--no-object-names", `${base}..${head}`]);
  const objects = text.trim() === "" ? [] : text.trimEnd().split("\n");
  need(objects.length <= limits.objects && objects.every(value => oid.test(value)) && new Set(objects).size === objects.length, "OBJECT_ROSTER");
  const findings: { objectId: string; rules: readonly string[] }[] = [];
  let scannedObjects = 0;
  let scannedBytes = 0;
  if (objects.length > 0) {
    const child = spawn("git", ["cat-file", "--batch"], { cwd: repository, env: gitEnvironment, stdio: ["pipe", "pipe", "pipe"], timeout: limits.milliseconds });
    // Retain a nonrejecting close observation even when stdin fails or parsing
    // Refuses first. Closing our own pipes cannot become an unhandled EPIPE.
    const closed = Promise.withResolvers<Readonly<{ code: number | null; signal: NodeJS.Signals | null }>>();
    let processFailed = false;
    let inputFailed = false;
    child.once("error", () => { processFailed = true; });
    child.once("close", (code, signal) => { closed.resolve({ code, signal }); });
    child.stdin.on("error", () => { inputFailed = true; });
    child.stdout.on("error", () => { processFailed = true; });
    child.stderr.on("error", () => { processFailed = true; });
    let stderrBytes = 0;
    child.stderr.on("data", (value: unknown) => { if (Buffer.isBuffer(value)) { stderrBytes += value.length; } });
    try {
      child.stdin.end(`${objects.join("\n")}\n`);
      for await (const packet of packets(child.stdout, objects)) {
        const value = packet.bytes.toString("latin1");
        const rules = [...secretPatterns, ...privacyPatterns].filter(([, pattern]) => pattern.test(value)).map(([label]) => label);
        scannedObjects += 1; scannedBytes += packet.bytes.length; if (rules.length > 0) { findings.push({ objectId: packet.objectId, rules: Object.freeze(rules) }); }
      }
      const completion = await closed.promise;
      need(!processFailed && !inputFailed && completion.code === 0 && completion.signal === null, "GIT_EXIT");
      need(stderrBytes === 0, "GIT_DIAGNOSTIC");
    } finally {
      // Closing only our Git pipes lets an unfinished reader exit naturally.
      // Never signal a host, remove a ref or modify repository configuration.
      child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy(); await closed.promise;
    }
  }
  return Object.freeze({ ok: findings.length === 0, base, head, scannedObjects, scannedBytes, findings: Object.freeze(findings.map(value => Object.freeze(value))) });
}
