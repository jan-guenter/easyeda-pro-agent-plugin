import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import type { MachineProfile } from "../../src/machine-profile.ts";

export function syntheticSqlRoot(): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined);
  assert.match(root, /easyeda-test-control-/u);
  return root;
}

let runtime: Promise<MachineProfile["runtime"]> | undefined;
export function syntheticSqlRuntime(): Promise<MachineProfile["runtime"]> {
  syntheticSqlRoot();
  runtime ??= (async (): Promise<MachineProfile["runtime"]> => {
    const nodeExecutable = await realpath(process.execPath);
    assert.equal(process.version, "v24.18.0");
    return { nodeExecutable, nodeVersion: "24.18.0",
      nodeSha256: createHash("sha256").update(await readFile(nodeExecutable)).digest("hex") };
  })();
  return runtime;
}
