import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node promisify consumes execFile's completion callback; the returned ChildProcess is not the callback result.
const run = promisify(execFile);
/** An isolated synthetic package contains no CAD source, original journals,
 * real helper, native process or application. The fixed checker accepts no
 * caller path; its exact relative-file readers run unchanged in this package. */
async function fixture(bytes: number): Promise<Readonly<{ helper: string; checker: string }>> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-helper-source-limit-"));
  await Promise.all([mkdir(join(root, "scripts")), mkdir(join(root, "server/src"), { recursive: true })]);
  const checker = join(root, "scripts/check-diagnostic-helper-identity.ts"), helper = join(root, "scripts/pcb-diagnostic-owner.ps1");
  await Promise.all([
    copyFile(new URL("../../scripts/check-diagnostic-helper-identity.ts", import.meta.url), checker),
    copyFile(new URL("../src/current-pcb-diagnostic-helper-source-profile.ts", import.meta.url), join(root, "server/src/current-pcb-diagnostic-helper-source-profile.ts")),
  ]);
  const content = Buffer.alloc(bytes, 0x41), digest = createHash("sha256").update(content).digest("hex");
  const owner = `export const CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES = ${bytes};\nexport const CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 = "${digest}";\n`;
  const smoke = `$bytes = Read-BoundedFile $helper ${MAXIMUM}\nif ($bytes.Length -ne ${bytes}) {throw 'synthetic-launch-helper-size'}\nif ($helperHash -cne '${digest}') {\n`;
  await Promise.all([writeFile(helper, content), writeFile(join(root, "server/src/current-pcb-diagnostic-helper-identity.ts"), owner),
    writeFile(join(root, "scripts/pcb-diagnostic-launch-smoke.ps1"), smoke), writeFile(join(root, "package.json"), '{"type":"module"}\n')]);
  return { checker, helper };
}

void test("the pinned helper source ceiling accepts growth past1MiB while retaining a fixed2MiB maximum", async () => {
  assert.equal(MAXIMUM, 2 * 1024 * 1024);
  const value = await fixture(1024 * 1024 + 1);
  const result = await run(process.execPath, [value.checker]);
  const decoded: unknown = JSON.parse(result.stdout);
  assert.deepEqual(decoded, { ok: true, bytes: 1024 * 1024 + 1,
    sha256: createHash("sha256").update(Buffer.alloc(1024 * 1024 + 1, 0x41)).digest("hex"), maximumBytes: MAXIMUM, ascii: true });
});

void test("helper source over2MiB refuses even when its synthetic exact byte/hash pins match", async () => {
  const value = await fixture(MAXIMUM + 1);
  await assert.rejects(run(process.execPath, [value.checker]), /regular bounded source required/u);
});

void test("same-size helper code substitution and truncation refuse before any native construction", async () => {
  for (const replacement of ["BAAA", "AAA"]) {
    const value = await fixture(4);
    await writeFile(value.helper, replacement);
    await assert.rejects(run(process.execPath, [value.checker]), /actual helper, owner pins or independent Windows smoke pins\/cap differ/u);
  }
});
