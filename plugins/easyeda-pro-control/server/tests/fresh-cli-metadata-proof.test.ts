import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs";
import { access, chmod, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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

void test("original pidfd precedes inspect failure and missing custody never becomes a facade-exit claim", async () => {
  for (const missingPidfd of [false, true]) {
    const root = await createTestTemporaryDirectory("fresh-cli-custody-failure-"); const data = planData(root); const packageRoot = join(root, "package"); const files = [];
    for (const [index, relativePath] of PATHS.entries()) {
      const filename = join(packageRoot, relativePath); await mkdir(dirname(filename), { recursive: true });
      const bytes = Buffer.from(relativePath === ".codex-plugin/plugin.json" ? '{"version":"0.3.0"}' : "inert fixture"); await writeFile(filename, bytes); await chmod(filename, index === 2 ? 0o755 : 0o644);
      files.push({ relativePath, bytes: bytes.length, sha256: await digest(bytes), mode: index === 2 ? 0o755 : 0o644 });
    }
    await writeFile(join(packageRoot, ".mcp.json"), '{"mcpServers":{"easyeda_pro_control":{}}}');
    const executable = join(root, "inert-cli"), marker = join(root, "inert-inspect-and-close.json");
    const program = `#!${process.execPath}
import {spawn} from 'node:child_process';import {readFileSync,writeFileSync} from 'node:fs';
if(process.argv[2]==='--version'){console.log('codex-cli 0.168.0')}else{
const facade=spawn(process.execPath,['--eval',"process.stdin.resume();process.stdin.on('end',()=>process.exit(0))"],{stdio:['pipe','ignore','inherit']});let observed={inspectReached:false};
const send=(id,result)=>process.stdout.write(JSON.stringify({id,result})+'\\n');let buffer='';
process.stdin.on('data',bytes=>{buffer+=bytes.toString();let at;while((at=buffer.indexOf('\\n'))>=0){const r=JSON.parse(buffer.slice(0,at));buffer=buffer.slice(at+1);if(!r.id)continue;
if(r.method==='initialize')send(r.id,{});else if(r.method==='thread/start')send(r.id,{thread:{id:'inert-thread'}});else if(r.method==='mcpServerStatus/list')send(r.id,{data:[{name:'easyeda_pro_control',pluginId:'easyeda-pro-control@easyeda-pro-agent',tools:{easyeda_control_api:{},easyeda_control_session:{}}}],nextCursor:null});
else if(r.params.arguments.request.action==='loaded-facade')send(r.id,{content:[],structuredContent:{result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:${missingPidfd ? "2147483647" : "facade.pid"},moduleUrl:${JSON.stringify(new URL(`file://${packageRoot}/server/dist/server.mjs`).href)},nodeVersion:'v24.18.0',admissionGranted:false}}});
else{observed={inspectReached:true,pidfdBeforeInspect:readFileSync(${JSON.stringify(join(root, "evidence/linux-watcher.jsonl"))},'utf8').includes('linux-custody')};process.stdout.write(JSON.stringify({id:r.id,error:{code:-32603,message:'INERT_INSPECT_FAILURE'}})+'\\n')}}});
process.stdin.on('end',()=>{facade.stdin.end();facade.once('close',code=>{writeFileSync(${JSON.stringify(marker)},JSON.stringify({...observed,originalInertFacadeCloseCode:code}));process.exit(0)})})}
`;
    await writeFile(executable, program, { mode: 0o755 }); await chmod(executable, 0o755);
    data["files"] = files; data["linuxNodeSha256"] = await digest(await readFile(process.execPath)); data["cliExecutable"] = executable;
    const plan = parseFreshCliMetadataPlan(JSON.stringify(data)); assert.equal(await proveFreshCliMetadata(plan), false);
    const manifest: unknown = JSON.parse(await readFile(join(root, "evidence/cleanup-manifest.json"), "utf8")); assert.ok(manifest !== null && typeof manifest === "object" && "originalTransportsClosed" in manifest && "loadedFacadeExitUnknown" in manifest && "originalsClosed" in manifest);
    assert.equal(manifest.originalTransportsClosed, true); assert.equal(manifest.loadedFacadeExitUnknown, missingPidfd); assert.equal(manifest.originalsClosed, !missingPidfd);
    const observation: unknown = JSON.parse(await readFile(marker, "utf8")); assert.ok(observation !== null && typeof observation === "object" && "inspectReached" in observation && "originalInertFacadeCloseCode" in observation);
    assert.equal(observation.inspectReached, !missingPidfd); assert.equal(observation.originalInertFacadeCloseCode, 0);
    if (!missingPidfd) { assert.ok("pidfdBeforeInspect" in observation); assert.equal(observation.pidfdBeforeInspect, true); }
  }
});

void test("original file/directory sync failures refuse before allocation or retain incomplete EOF settlement", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-sync-failure-"); const originalSync = fs.fsyncSync; const beforeDescriptors = await readdir("/proc/self/fd"); const before = beforeDescriptors.length;
  // oxlint-disable-next-line node/no-sync -- The injected synchronous syscall boundary distinguishes original directory FDs before any CLI allocation.
  fs.fsyncSync = (fd): void => { if (fs.fstatSync(fd).isDirectory()) { throw new Error("INERT_DIRECTORY_SYNC_FAILURE"); } originalSync(fd); }; syncBuiltinESMExports();
  try { await assert.rejects(createProofEvidence(join(root, "refused-evidence"), join(root, "refused-workspace")), /LOCAL_EVIDENCE_INITIALIZATION_FAILED/u); }
  finally { fs.fsyncSync = originalSync; syncBuiltinESMExports(); }
  const afterDescriptors = await readdir("/proc/self/fd"); assert.equal(afterDescriptors.length, before);
  const evidence = await createProofEvidence(join(root, "evidence"), join(root, "workspace"));
  const peer = new OwnedProofProcess(process.execPath, ["--eval", "console.log(JSON.stringify({kind:'inert-ready'}));process.stdin.resume();process.stdin.on('end',()=>process.exit(0))"], join(root, "workspace"), evidence.journal("app-server.stdout.jsonl"), evidence.journal("app-server.stderr.log"));
  await peer.next(); fs.fsyncSync = (): never => { throw new Error("INERT_ORIGINAL_FILE_SYNC_FAILURE"); }; syncBuiltinESMExports();
  try { assert.equal(evidence.state.put({ fixed: "unsynced original bytes" }), false); assert.equal(evidence.hasPending(), true); assert.equal(evidence.close(), false); peer.closeInput(); assert.deepEqual(await peer.closed.promise, { code: 0, signal: null }); }
  finally { fs.fsyncSync = originalSync; syncBuiltinESMExports(); peer.closeInput(); await peer.closed.promise; }
  assert.equal(evidence.failed(), true); assert.equal(evidence.flush(), true); assert.equal(evidence.hasPending(), false); assert.equal(evidence.close(), true);
  const data = { ...planData(root), host: "windows", cliExecutable: "C:\\trusted\\codex.exe", hostPluginRoot: "C:\\trusted\\plugin", evidenceDirectory: "C:\\new-evidence", workspace: "C:\\new-workspace", windowsNodeExecutable: "C:\\trusted\\node.exe", windowsNodeSha256: "0".repeat(64) };
  const windows = parseFreshCliMetadataPlan(JSON.stringify(data)); const preview = previewFreshCliMetadataProof(windows); assert.ok("durability" in preview);
  await assert.rejects(proveFreshCliMetadata(windows), /WINDOWS_DURABLE_DIRECTORY_SYNC_UNAVAILABLE/u);
});
