/** Test-only delegation of the two fixed, read-only Linux SQLite programs. */
/* oxlint-disable node/no-sync -- spawn interception is synchronous; descriptor identity must be checked before delegating that exact test child. */
import assert from "node:assert/strict";
import type { ChildProcess, SpawnOptions, spawn } from "node:child_process";
import { fstatSync, realpathSync } from "node:fs";
import { sep } from "node:path";
import { SQLITE_INVENTORY_PROGRAM } from "../../src/sqlite-inventory-program.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";

function isBag(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function syntheticSqlSpawn(executable: unknown, args: unknown, options: unknown, originalSpawn: typeof spawn): ChildProcess | undefined {
  if (typeof executable !== "string") { return undefined; }
  const processAlias = /^\/proc\/(self|[1-9]\d*)\/fd\/[1-9]\d*$/u.exec(executable)?.[1];
  const nodeAlias = processAlias === "self" || processAlias === String(process.pid);
  if (!nodeAlias && executable !== "/usr/bin/sqlite3" && executable !== "/bin/sqlite3") { return undefined; }
  assert.ok(isBag(options)); assert.ok(Array.isArray(options["stdio"]));
  const descriptor: unknown = options["stdio"][3];
  assert.ok(typeof descriptor === "number" && Number.isInteger(descriptor) && descriptor >= 3);
  assert.ok(fstatSync(descriptor).isFile());
  const root = realpathSync(syntheticSqlRoot());
  assert.ok(realpathSync(`/proc/self/fd/${descriptor}`).startsWith(`${root}${sep}`));
  if (nodeAlias) {
    assert.equal(process.version, "v24.18.0"); assert.equal(realpathSync(executable), realpathSync(process.execPath));
    const fixedArgs = ["--max-old-space-size=192", "--input-type=module", "--eval", SQLITE_INVENTORY_PROGRAM];
    const fixed: SpawnOptions = { env: { NODE_NO_WARNINGS: "1" }, stdio: ["pipe", "pipe", "pipe", descriptor] };
    assert.deepEqual(args, fixedArgs); assert.deepEqual(options, fixed);
    return originalSpawn(executable, fixedArgs, fixed);
  }
  const fixedArgs = ["-init", "/dev/null", "-batch", "-readonly", "-safe", "--", "file:/proc/self/fd/3?mode=ro&immutable=1", ".dump"];
  const fixed: SpawnOptions = { cwd: "/", env: { HOME: "/nonexistent/easyeda-pro-control-sqlite", LANG: "C.UTF-8", LC_ALL: "C.UTF-8", TZ: "UTC" },
    stdio: ["ignore", "pipe", "pipe", descriptor] };
  assert.deepEqual(args, fixedArgs); assert.deepEqual(options, fixed);
  return originalSpawn(executable, fixedArgs, fixed);
}
