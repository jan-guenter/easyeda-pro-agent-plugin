import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { parseFreshCliMetadataPlan, previewFreshCliMetadataProof, proveFreshCliMetadata } from "../../scripts/fresh-cli-metadata-proof.ts";
import { OwnedProofProcess, createProofEvidence } from "../../scripts/fresh-cli-metadata-proof-resources.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const PATHS = ["server/dist/server.mjs", "server/dist/upstream-supervisor.mjs", "server/bin/easyeda-fd-sanitizer", "server/dist/control-session-manager.mjs", "reviewed-compatibility.json", ".codex-plugin/plugin.json"];
function planData(root: string): Record<string, unknown> {
  return { schema: "easyeda-pro-control.fresh-cli-metadata-plan.v1", host: "linux", mergedCommit: "a".repeat(40), version: "0.3.0", cliExecutable: process.execPath,
    expectedHostNodeVersion: "v24.18.0", linuxPluginRoot: join(root, "package"), linuxNodeExecutable: process.execPath, linuxNodeSha256: "0".repeat(64),
    hostPluginRoot: join(root, "package"), evidenceDirectory: join(root, "evidence"), workspace: join(root, "workspace"), overrides: [], distribution: "Ubuntu-24.04",
    files: PATHS.map((relativePath, index) => ({ relativePath, bytes: 1, sha256: "0".repeat(64), mode: index === 2 ? 0o755 : 0o644 })) };
}
async function digest(bytes: Buffer): Promise<string> {
  const result = await globalThis.crypto.subtle.digest("SHA-256", new Uint8Array(bytes)); return Buffer.from(result).toString("hex");
}
void test("bounded plans reject unrecognized execution/RPC selectors, injected distro flags and object hooks; preview starts no owner", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-plan-"); const data = planData(root);
  const plan = parseFreshCliMetadataPlan(JSON.stringify(data)); assert.equal(plan.distribution, "Ubuntu-24.04");
  assert.equal(previewFreshCliMetadataProof(plan)["ownerStarted"], false);
  for (const extra of [{ ...data, method: "turn/start" }, { ...data, distribution: "--exec" }, { ...data, overrides: ["mcp_servers.any.command=arbitrary"] }, { ...data, expectedHostNodeVersion: "v24.19.0" }, { ...data, uid: 1 }]) {
    assert.throws(() => parseFreshCliMetadataPlan(JSON.stringify(extra)));
  }
  let hooks = 0; const object = new Proxy({}, { get(): never { hooks += 1; throw new Error("PROXY_HOOK"); } });
  assert.throws(() => { Reflect.apply(parseFreshCliMetadataPlan, undefined, [object]); }); assert.equal(hooks, 0);
  const marker = join(root, "must-not-start"); const executable = join(root, "must-not-execute");
  await writeFile(executable, `#!/bin/sh\ntouch '${marker}'\n`); data["cliExecutable"] = executable;
  const filename = join(root, "plan.json"); await writeFile(filename, JSON.stringify(data));
  const completion = Promise.withResolvers<string>();
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- execFile callback follows original child close, which is retained before the test resolves.
  childProcess.execFile(process.execPath, [new URL("../../scripts/fresh-cli-metadata-proof.ts", import.meta.url).pathname, filename], { encoding: "utf8" }, (error, stdout): void => {
    if (error === null) { completion.resolve(stdout); } else { completion.reject(error); }
  });
  const result: unknown = JSON.parse(await completion.promise); assert.ok(result !== null && typeof result === "object" && "ownerStarted" in result && result.ownerStarted === false);
  await assert.rejects(access(marker)); await assert.rejects(access(join(root, "evidence"))); await assert.rejects(access(join(root, "workspace")));
});

void test("local evidence initialization closes partial descriptors before any CLI allocation", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-preallocation-"); const data = planData(root);
  const packageRoot = join(root, "package"); const files: Record<string, unknown>[] = [];
  for (const [index, relativePath] of PATHS.entries()) {
    const filename = join(packageRoot, relativePath); await mkdir(dirname(filename), { recursive: true });
    const bytes = Buffer.from(relativePath === ".codex-plugin/plugin.json" ? '{"version":"0.3.0"}' : "inert fixture"); await writeFile(filename, bytes);
    files.push({ relativePath, bytes: bytes.length, sha256: await digest(bytes), mode: index === 2 ? 0o755 : 0o644 });
  }
  await writeFile(join(packageRoot, ".mcp.json"), '{"mcpServers":{"easyeda_pro_control":{}}}');
  data["files"] = files; data["linuxNodeSha256"] = await digest(await readFile(process.execPath));
  const plan = parseFreshCliMetadataPlan(JSON.stringify(data)); const beforeDescriptors = await readdir("/proc/self/fd"); const before = beforeDescriptors.length;
  const originalOpen = fs.openSync; const originalSpawn = childProcess.spawn; let allocations = 0;
  fs.openSync = (...args): ReturnType<typeof fs.openSync> => { if (String(args[0]).endsWith("app-server.stdout.jsonl")) { throw new Error("INERT_EVIDENCE_INIT_FAILURE"); } return originalOpen(...args); };
  childProcess.spawn = (): never => { allocations += 1; throw new Error("CLI_ALLOCATED_BEFORE_LOCAL_EVIDENCE"); }; syncBuiltinESMExports();
  try { await assert.rejects(proveFreshCliMetadata(plan), /LOCAL_EVIDENCE_INITIALIZATION_FAILED/u); }
  finally { fs.openSync = originalOpen; childProcess.spawn = originalSpawn; syncBuiltinESMExports(); }
  assert.equal(allocations, 0); const afterDescriptors = await readdir("/proc/self/fd"); assert.equal(afterDescriptors.length, before);
});

void test("disk-full journal failures preserve bytes and original EOF/close rather than stranding the child", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-evidence-full-"); const evidence = await createProofEvidence(join(root, "evidence"), join(root, "workspace"));
  const originalWrite = fs.writeSync; const ready = Promise.withResolvers<unknown>(); let peer: OwnedProofProcess | undefined;
  fs.writeSync = (): never => { throw Object.assign(new Error("INERT_DISK_FULL"), { code: "ENOSPC" }); }; syncBuiltinESMExports();
  try {
    assert.equal(evidence.state.put({ fixed: "original unknown outcome" }), false); assert.equal(await evidence.failure, null);
    peer = new OwnedProofProcess(process.execPath, ["--eval", "process.stdout.write(JSON.stringify({kind:'inert-ready'})+String.fromCharCode(10));process.stdin.resume();process.stdin.on('end',()=>process.exit(0))"], join(root, "workspace"), evidence.journal("app-server.stdout.jsonl"), evidence.journal("app-server.stderr.log"));
    peer.onRecord = (value): void => { ready.resolve(value); }; await ready.promise;
    peer.closeInput(); assert.deepEqual(await peer.closed.promise, { code: 0, signal: null });
  } finally {
    fs.writeSync = originalWrite; syncBuiltinESMExports();
    if (peer !== undefined && peer.closeResult === undefined) { peer.closeInput(); await peer.closed.promise; }
  }
  assert.equal(evidence.failed(), true); assert.equal(evidence.flush(), true); assert.equal(evidence.hasPending(), false);
  const stdout = await readFile(join(root, "evidence/app-server.stdout.jsonl"), "utf8"); assert.equal(stdout, '{"kind":"inert-ready"}\n');
  const manifest = await evidence.terminalWorkspaceManifest(true); assert.equal(manifest["eligibleForEmptyDirectoryRemovalAfterDriverExit"], true); assert.deepEqual(manifest["createdRuntimeCopies"], []); assert.deepEqual(manifest["createdClones"], []);
  evidence.cleanup.put(manifest); assert.equal(evidence.flush(), true); evidence.close();
});

void test("fatal UTF-8 streaming and EOF validation preserve physical close while refusing malformed proof", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-utf8-");
  const good = Buffer.from('{"kind":"inert-ready","ignored":"€"}\n');
  const malformed = Buffer.concat([Buffer.from('{"kind":"inert-ready","ignored":"'), Buffer.from([0xFF]), Buffer.from('"}\n')]);
  const trailing = Buffer.concat([good, Buffer.from([0xE2])]);
  for (const [index, bytes] of [good, malformed, trailing].entries()) {
    const evidence = await createProofEvidence(join(root, `evidence-${index}`), join(root, `workspace-${index}`));
    const program = `const b=Buffer.from(${JSON.stringify([...bytes])});process.stdout.write(b.subarray(0,33));process.stdout.write(b.subarray(33));process.stdin.resume();process.stdin.on('end',()=>process.exit(0))`;
    const peer = new OwnedProofProcess(process.execPath, ["--eval", program], join(root, `workspace-${index}`), evidence.journal("app-server.stdout.jsonl"), evidence.journal("app-server.stderr.log"));
    try {
      if (index === 1) { await assert.rejects(peer.next()); }
      else { assert.deepEqual(await peer.next(), { kind: "inert-ready", ignored: "€" }); }
      peer.closeInput(); assert.deepEqual(await peer.closed.promise, { code: 0, signal: null });
      assert.equal(peer.protocolHealthy(), index === 0);
      await assert.rejects(peer.notifyInitialized());
      assert.deepEqual(await readFile(join(root, `evidence-${index}`, "app-server.stdout.jsonl")), bytes);
    } finally { peer.closeInput(); await peer.closed.promise; evidence.close(); }
  }
});
