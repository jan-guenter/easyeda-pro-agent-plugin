/** Inert read-only user-namespace fixtures. No application, facade or owner is started. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { build } from "esbuild";
import { createTestTemporaryDirectory } from "./temporary-directory.ts";

/** The reviewed case requires a root parent; ordinary CI users cannot produce
 * an actual parent-UID-zero mapping without additional privileges. */
export function historicalRootNamespaceAvailable(): boolean { return process.platform === "linux" && process.getuid?.() === 0 && process.getgid?.() === 0; }

/** Exactly one inert Node child; all host paths are read-only and all caps drop. */
export async function runHistoricalReadOnlyNamespace(program: string, uid = "1", gid = uid): Promise<string> {
  // oxlint-disable-next-line typescript/strict-void-return -- Node documents execFile promisification; its ChildProcess return is ignored while the completion callback settles.
  const result = await promisify(execFile)("/usr/sbin/bwrap", ["--unshare-user", "--uid", uid, "--gid", gid,
    "--ro-bind", "/", "/", "--cap-drop", "ALL", "--", process.execPath, "--input-type=module", "-e", program],
  { encoding: "utf8", env: process.env, timeout: 30_000, maxBuffer: 1_048_576 });
  return result.stdout;
}

/** The existing synthetic Source fixture seals substitute hashes privately.
 * Bundle its actual reader graph with precisely that same test-only profile. */
export async function compileSyntheticHistoricalSourceReader(program: string, profile: Readonly<Record<string, unknown>>): Promise<string> {
  const directory = await createTestTemporaryDirectory("easyeda-historical-source-reader-");
  const result = await build({ stdin: { contents: program, resolveDir: resolve("server/tests"), sourcefile: "synthetic-historical-owner-reader.ts" },
    bundle: true, platform: "node", target: "node24", format: "esm", write: false,
    banner: { js: 'import { createRequire as syntheticCreateRequire } from "node:module"; const require = syntheticCreateRequire(import.meta.url);' },
    plugins: [{ name: "synthetic-fixed-source-profile", setup(builder): void {
      // oxlint-disable-next-line require-unicode-regexp -- Esbuild serializes flags to Go RE2, which rejects the JavaScript Unicode flag.
      builder.onLoad({ filter: /current-footprint-forward-source-relinquishment-contract\.ts$/ }, async args => {
        const source = await readFile(args.path, "utf8");
        const start = source.indexOf("export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE =");
        const end = source.indexOf("export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_KINDS", start);
        assert.ok(start > 0 && end > start);
        return { contents: `${source.slice(0, start)}export const CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE = Object.freeze(${JSON.stringify(profile)});\n${source.slice(end)}`, loader: "ts" };
      });
    } }] });
  const output = result.outputFiles[0]; assert.ok(output !== undefined && result.outputFiles.length === 1);
  const path = resolve(directory, "synthetic-historical-reader.mjs"); await writeFile(path, output.contents, { flag: "wx", mode: 0o600 }); return path;
}
