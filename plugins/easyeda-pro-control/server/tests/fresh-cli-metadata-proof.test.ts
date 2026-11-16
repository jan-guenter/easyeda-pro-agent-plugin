import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs";
import { access, chmod, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { classifyMetadataProofRefusal, parseFreshCliMetadataPlan, previewFreshCliMetadataProof, proveFreshCliMetadata } from "../../scripts/fresh-cli-metadata-proof.ts";
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
    const splitAt = index === 1 ? 32 : 34;
    const program = `const b=Buffer.from(${JSON.stringify([...bytes])});process.stdin.once('data',()=>process.stdout.write(b.subarray(${splitAt})));process.stdin.resume();process.stdin.on('end',()=>process.exit(0));process.stdout.write(b.subarray(0,${splitAt}))`;
    const peer = new OwnedProofProcess(process.execPath, ["--eval", program], join(root, `workspace-${index}`), evidence.journal("app-server.stdout.jsonl"), evidence.journal("app-server.stderr.log"));
    const firstChunk = Promise.withResolvers<Buffer>(); const chunks: Buffer[] = []; let count = 0;
    const observeChunk = (chunk: Buffer): void => { chunks.push(Buffer.from(chunk)); count += chunk.length; if (count >= splitAt) { firstChunk.resolve(Buffer.concat(chunks)); } }; peer.child.stdout.on("data", observeChunk);
    try {
      assert.deepEqual(await firstChunk.promise, bytes.subarray(0, splitAt)); peer.child.stdout.off("data", observeChunk);
      const continued = peer.sendWatcherPacket({ kind: "continue-original-utf8-fixture" }); await continued;
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


void test("inert successful metadata lifecycle joins original facade, watcher and CLI before durable completion", async () => {
  for (const failIntent of [false, true]) {
  const root = await createTestTemporaryDirectory("fresh-cli-complete-"); const data = planData(root); const packageRoot = join(root, "package"); const files = [];
  for (const [index, relativePath] of PATHS.entries()) {
    const filename = join(packageRoot, relativePath); await mkdir(dirname(filename), { recursive: true });
    const bytes = Buffer.from(relativePath === ".codex-plugin/plugin.json" ? '{"version":"0.3.0"}' : "inert successful fixture"); await writeFile(filename, bytes); await chmod(filename, index === 2 ? 0o755 : 0o644);
    files.push({ relativePath, bytes: bytes.length, sha256: await digest(bytes), mode: index === 2 ? 0o755 : 0o644 });
  }
  await writeFile(join(packageRoot, ".mcp.json"), '{"mcpServers":{"easyeda_pro_control":{}}}');
  const executable = join(root, "inert-success-cli"), marker = join(root, "original-inert-lifecycle.json");
  const program = `#!${process.execPath}
import {spawn} from 'node:child_process';import {readFileSync,writeFileSync} from 'node:fs';
if(process.argv[2]==='--version'){console.log('codex-cli 0.168.0')}else{
const facade=spawn(process.execPath,['--eval',"process.stdin.resume();process.stdin.on('end',()=>process.exit(0))"],{stdio:['pipe','ignore','inherit']});const observed={actions:[],intentsBeforeDispatch:[],unsubscribe:false,ackedBeforeRetire:false};
const exited=new Promise(resolve=>facade.once('close',code=>{observed.originalFacadeCloseCode=code;resolve()}));let ended=false;const endFacade=()=>{if(!ended){ended=true;facade.stdin.end()}return exited};
const send=(id,result)=>process.stdout.write(JSON.stringify({id,result})+'\\n');const tool=(id,result)=>send(id,{content:[],structuredContent:{result}});let buffer='';
process.stdin.on('data',bytes=>{buffer+=bytes.toString();let at;while((at=buffer.indexOf('\\n'))>=0){const r=JSON.parse(buffer.slice(0,at));buffer=buffer.slice(at+1);if(!r.id)continue;
if(r.method==='initialize')send(r.id,{});else if(r.method==='thread/start')send(r.id,{thread:{id:'inert-success-thread'}});else if(r.method==='mcpServerStatus/list')send(r.id,{data:[{name:'easyeda_pro_control',pluginId:'easyeda-pro-control@easyeda-pro-agent',tools:{easyeda_control_api:{},easyeda_control_session:{}}}],nextCursor:null});
else if(r.method==='thread/unsubscribe'){observed.unsubscribe=true;send(r.id,{status:'unsubscribed'})}else{const q=r.params.arguments.request;const state=readFileSync(${JSON.stringify(join(root, 'evidence/state.jsonl'))},'utf8').trim().split('\\n').map(line=>JSON.parse(line));const intent=state.filter(row=>row.stage==='metadata-action-intent').at(-1);observed.intentsBeforeDispatch.push(intent?.action===q.action&&intent.ordinal===observed.actions.length+1);observed.actions.push(q.action);
if(q.action==='loaded-facade')tool(r.id,{schema:'easyeda-pro-control.loaded-facade.v1',pid:facade.pid,moduleUrl:${JSON.stringify(new URL(`file://${packageRoot}/server/dist/server.mjs`).href)},nodeVersion:'v24.18.0',admissionGranted:false});
else if(q.action==='inspect')tool(r.id,{schema:'easyeda-pro-control.session-retirement.v1',state:'active',activeCalls:0,liveAdmissionOpen:true,leaseReleaseAcknowledged:false,replacementConnectionRequired:false});
else if(q.action==='retire'){if(q.confirmRetire!==true)throw Error('INERT_CONFIRMATION');observed.ackedBeforeRetire=readFileSync(${JSON.stringify(join(root, "evidence/linux-watcher.jsonl"))},'utf8').includes('linux-acked');tool(r.id,{schema:'easyeda-pro-control.session-retirement.v1',state:'retired',activeCalls:0,liveAdmissionOpen:false,leaseReleaseAcknowledged:true,replacementConnectionRequired:true})}
else if(q.action==='close-retired'){if(q.confirmCloseRetired!==true)throw Error('INERT_CONFIRMATION');void endFacade();tool(r.id,{schema:'easyeda-pro-control.session-close-scheduled.v1',retirementState:'retired',leaseReleaseAcknowledged:true,closeScheduled:true,processExitProved:false,deliveryAcknowledged:false,retryAllowed:false})}else throw Error('INERT_UNEXPECTED_ACTION')}}});
process.stdin.on('end',()=>{void endFacade().then(()=>{writeFileSync(${JSON.stringify(marker)},JSON.stringify(observed));process.exit(0)})})}
`;
  await writeFile(executable, program, { mode: 0o755 }); await chmod(executable, 0o755);
  data["files"] = files; data["linuxNodeSha256"] = await digest(await readFile(process.execPath)); data["cliExecutable"] = executable;
  const originalSync = fs.fsyncSync;
  if (failIntent) {
    // oxlint-disable-next-line node/no-sync -- Inject failure at the real original file-sync boundary, after its fixed retire intent exists and before dispatch.
    fs.fsyncSync = (fd): void => { if (fs.existsSync(join(root, "evidence/state.jsonl")) && fs.readFileSync(join(root, "evidence/state.jsonl"), "utf8").includes('"action":"retire","ordinal":3')) { fs.fsyncSync = originalSync; syncBuiltinESMExports(); throw new Error("INERT_RETIRE_INTENT_SYNC_FAILURE"); } originalSync(fd); }; syncBuiltinESMExports();
  }
  const plan = parseFreshCliMetadataPlan(JSON.stringify(data));
  try { assert.equal(await proveFreshCliMetadata(plan), !failIntent); }
  finally { fs.fsyncSync = originalSync; syncBuiltinESMExports(); }
  const observed: unknown = JSON.parse(await readFile(marker, "utf8")); assert.ok(observed !== null && typeof observed === "object" && "actions" in observed && "unsubscribe" in observed && "ackedBeforeRetire" in observed && "originalFacadeCloseCode" in observed && "intentsBeforeDispatch" in observed);
  assert.deepEqual(observed.actions, failIntent ? ["loaded-facade", "inspect"] : ["loaded-facade", "inspect", "retire", "close-retired"]); assert.deepEqual(observed.intentsBeforeDispatch, failIntent ? [true, true] : [true, true, true, true]); assert.equal(observed.unsubscribe, !failIntent); assert.equal(observed.ackedBeforeRetire, !failIntent); assert.equal(observed.originalFacadeCloseCode, 0);
  for (const name of (failIntent ? ["loaded-facade", "inspect"] : ["loaded-facade", "inspect", "retire", "close-retired"])) { const reply: unknown = JSON.parse(await readFile(join(root, `evidence/${name}-full-reply.json`), "utf8")); assert.ok(reply !== null && typeof reply === "object" && "structuredContent" in reply); }
  const state = await readFile(join(root, "evidence/state.jsonl"), "utf8"); const records: unknown[] = state.trim().split("\n").map((line: string): unknown => JSON.parse(line));
  const complete = records.find(record => record !== null && typeof record === "object" && "stage" in record && record.stage === "complete");
  if (failIntent) { const failure = records.find(record => record !== null && typeof record === "object" && "stage" in record && record.stage === "PROOF_INCOMPLETE"); assert.ok(failure !== null && typeof failure === "object" && "localRefusalCode" in failure); assert.equal(failure.localRefusalCode, "METADATA_ACTION_INTENT_NOT_DURABLE"); }
  else {
    assert.ok(complete !== null && typeof complete === "object" && "originalPidfdExitObserved" in complete && "originals" in complete && Array.isArray(complete.originals)); assert.equal(complete.originalPidfdExitObserved, true); assert.equal(complete.originals.length, 3);
    const originals: unknown[] = complete.originals;
    for (const original of originals) { assert.ok(original !== null && typeof original === "object" && "close" in original && original.close !== null && typeof original.close === "object" && "code" in original.close && "signal" in original.close); assert.equal(original.close.code, 0); assert.equal(original.close.signal, null); }
  }
  const manifest: unknown = JSON.parse(await readFile(join(root, "evidence/cleanup-manifest.json"), "utf8")); assert.ok(manifest !== null && typeof manifest === "object" && "originalsClosed" in manifest && "loadedFacadeExitUnknown" in manifest && "eligibleForEmptyDirectoryRemovalAfterDriverExit" in manifest && "sameDirectoryIdentity" in manifest);
  assert.equal(manifest.originalsClosed, true); assert.equal(manifest.loadedFacadeExitUnknown, false); assert.equal(manifest.sameDirectoryIdentity, true); assert.equal(manifest.eligibleForEmptyDirectoryRemovalAfterDriverExit, true);
  }
});

void test("incomplete diagnostics expose fixed own-data Error codes without invoking hooks or leaking arbitrary text", () => {
  assert.equal(classifyMetadataProofRefusal(new Error("SERVING_ROOT_DIFFERS")), "SERVING_ROOT_DIFFERS"); assert.equal(classifyMetadataProofRefusal(new Error("RETIREMENT_ACK_REQUIRED")), "RETIREMENT_ACK_REQUIRED");
  let hooks = 0; const accessor = new Error("FIXTURE_OWN_ACCESSOR"); Object.defineProperty(accessor, "message", { get(): never { hooks += 1; throw new Error("MUST_NOT_READ_MESSAGE"); } });
  const proxy = new Proxy(new Error("SERVING_ROOT_DIFFERS"), { get(): never { hooks += 1; throw new Error("MUST_NOT_READ_PROXY"); }, getOwnPropertyDescriptor(): never { hooks += 1; throw new Error("MUST_NOT_REFLECT_PROXY"); } });
  for (const unknown of [new Error("arbitrary vendor text / sensitive path"), { message: "SERVING_ROOT_DIFFERS" }, accessor, proxy]) { assert.equal(classifyMetadataProofRefusal(unknown), null); }
  const allowed = new Error("RETIREMENT_ACK_REQUIRED"); Object.defineProperty(allowed, "cause", { get(): never { hooks += 1; throw new Error("MUST_NOT_READ_CAUSE"); } });
  assert.equal(classifyMetadataProofRefusal(allowed), "RETIREMENT_ACK_REQUIRED"); assert.equal(hooks, 0);
});


void test("malformed manifest or MCP UTF-8 refuses before any CLI allocation despite matching expected hashes", async () => {
  for (const target of [".codex-plugin/plugin.json", ".mcp.json"]) {
    const root = await createTestTemporaryDirectory("fresh-cli-manifest-utf8-"); const data = planData(root); const packageRoot = join(root, "package"); const files = [];
    for (const [index, relativePath] of PATHS.entries()) {
      const filename = join(packageRoot, relativePath); await mkdir(dirname(filename), { recursive: true });
      const normal = Buffer.from(relativePath === ".codex-plugin/plugin.json" ? '{"version":"0.3.0"}' : "inert fixture");
      const bytes = relativePath === target ? Buffer.concat([Buffer.from('{"version":"0.3.0","ignored":"'), Buffer.from([0xFF]), Buffer.from('"}')]) : normal; await writeFile(filename, bytes); await chmod(filename, index === 2 ? 0o755 : 0o644);
      files.push({ relativePath, bytes: bytes.length, sha256: await digest(bytes), mode: index === 2 ? 0o755 : 0o644 });
    }
    const mcp = target === ".mcp.json" ? Buffer.concat([Buffer.from('{"mcpServers":{"easyeda_pro_control":{}},"ignored":"'), Buffer.from([0xFF]), Buffer.from('"}')]) : Buffer.from('{"mcpServers":{"easyeda_pro_control":{}}}'); await writeFile(join(packageRoot, ".mcp.json"), mcp);
    data["files"] = files; data["linuxNodeSha256"] = await digest(await readFile(process.execPath)); const plan = parseFreshCliMetadataPlan(JSON.stringify(data)); const originalSpawn = childProcess.spawn; let allocations = 0;
    childProcess.spawn = (): never => { allocations += 1; throw new Error("CLI_ALLOCATED_AFTER_BAD_MANIFEST_UTF8"); }; syncBuiltinESMExports();
    try { await assert.rejects(proveFreshCliMetadata(plan), TypeError); }
    finally { childProcess.spawn = originalSpawn; syncBuiltinESMExports(); }
    assert.equal(allocations, 0); await assert.rejects(access(join(root, "evidence"))); await assert.rejects(access(join(root, "workspace")));
  }
});
