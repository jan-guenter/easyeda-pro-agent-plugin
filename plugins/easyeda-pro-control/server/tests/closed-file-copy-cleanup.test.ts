import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fsPromises, { mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join } from "node:path";
import { mock, test } from "node:test";
import { mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";
import { copyClosedProjectBytes } from "../src/closed-file-copy.ts";

async function fixture(): Promise<{ source: string; expectedSourceSha256: string; artifactDirectory: string }> {
  const isolated = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.match(isolated ?? "", /easyeda-test-control-/u);
  assert.equal(typeof isolated, "string");
  const directory = await mkdtemp(join(isolated ?? "unreachable", "independent-copy-"));
  const source = join(directory, "source.eprj2");
  const bytes = Buffer.alloc(8192, 42);
  await writeFile(source, bytes, { flag: "wx", mode: 0o600 });
  return { source, expectedSourceSha256: createHash("sha256").update(bytes).digest("hex"),
    artifactDirectory: join(directory, "artifacts") };
}

for (const kind of ["source uid", "artifact uid", "artifact gid"]) {
  void test(`copy rejects observed ${kind} drift without requiring chown privileges`, async () => {
    const input = await fixture();
    const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
    let helperChecks = 0;
    let changed = false;
    authority.behavior.onHelperCheck = (): Promise<void> => { helperChecks += 1; return Promise.resolve(); };
    const originalStat = fsPromises.lstat;
    const spy = mock.method(fsPromises, "lstat", async (...args: Parameters<typeof originalStat>) => {
      const result = await originalStat(...args);
      const name = basename(String(args[0]));
      if (helperChecks >= 3 && (kind === "source uid" ? name === "source.eprj2" : name.startsWith("closed-copy-"))) {
        assert.equal(typeof result.uid, "bigint");
        const field = kind === "artifact gid" ? "gid" : "uid";
        const previous = result[field];
        assert.ok(typeof previous === "bigint");
        Object.defineProperty(result, field, { value: previous + 1n });
        changed = true;
      }
      return result;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /retain incomplete private evidence/u);
      assert.equal(changed, true);
    } finally {
      spy.mock.restore();
      syncBuiltinESMExports();
    }
  });
}

for (const kind of ["source", "artifact", "artifact traversal"]) {
  void test(`injected ${kind} close failure refuses a receipt and attempts cleanup`, async () => {
    const input = await fixture();
    const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
    let helperChecks = 0;
    let injected = false;
    authority.behavior.onHelperCheck = (): Promise<void> => { helperChecks += 1; return Promise.resolve(); };
    const opened: { path: string; closed: boolean; attempts: number; close: () => Promise<void> }[] = [];
    const originalOpen = fsPromises.open;
    const spy = mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
      const handle = await originalOpen(...args);
      const path = String(args[0]);
      const originalClose = handle.close.bind(handle);
      const entry = { path, closed: false, attempts: 0, close: originalClose };
      opened.push(entry);
      handle.close = async (): Promise<void> => {
        entry.attempts += 1;
        let target = path === "/" && helperChecks === 2;
        if (kind === "source") { target = basename(path) === "source.eprj2"; }
        if (kind === "artifact") { target = basename(path).startsWith("closed-copy-"); }
        if (target && !injected) { injected = true; throw new Error("synthetic close failure before syscall"); }
        await originalClose();
        entry.closed = true;
      };
      return handle;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(copyClosedProjectBytes({ ...input, closureProof: proof }), /cleanup failed|synthetic close failure/u);
      assert.equal(injected, true);
      const leaked = opened.filter((entry) => !entry.closed && entry.attempts === 0);
      assert.deepEqual(leaked.map((entry) => entry.path), [], "Every acquired descriptor needs a cleanup attempt");
      if (kind !== "artifact traversal") {
        const source = opened.find((entry) => basename(entry.path) === "source.eprj2");
        const artifact = opened.find((entry) => basename(entry.path).startsWith("closed-copy-"));
        assert.equal(source?.attempts, 1);
        assert.equal(artifact?.attempts, 1);
      }
    } finally {
      spy.mock.restore();
      syncBuiltinESMExports();
      for (const entry of opened) { if (!entry.closed) { await entry.close(); } }
    }
  });
}
