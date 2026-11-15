/** Actual isolated Node/descriptor/byte handoff, never an EasyEDA owner. */
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { captureWindowsWslRuntime, parseWindowsWslConfigurationArguments, parseWindowsWslLaunchProfile, windowsWslLaunchArguments } from "../src/windows-wsl-launch.ts";
import { serializeWindowsWslRuntimePacket, windowsWslRuntimeFiles, windowsWslRuntimeProgram } from "../src/windows-wsl-runtime.ts";
import type { WindowsWslRuntimePacket } from "../src/windows-wsl-runtime.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

function runNode(args: readonly string[]): Promise<string> {
  const outcome = Promise.withResolvers<string>();
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Node execFile reports original process closure through this completion callback before the harness resolves.
  execFile(process.execPath, args, { encoding: "utf8", maxBuffer: 65_536 }, (error, stdout) => {
    if (error === null) { outcome.resolve(stdout); } else { outcome.reject(error); }
  });
  return outcome.promise;
}
async function packetFixture(): Promise<Readonly<{ root: string; packet: WindowsWslRuntimePacket }>> {
  const root = await createTestTemporaryDirectory("windows-wsl-byte-fixture-");
  for (const spec of windowsWslRuntimeFiles()) {
    const filename = join(root, spec.relativePath);
    await mkdir(dirname(filename), { recursive: true });
    let content: string | Buffer = "fixed fixture\n";
    if (spec.relativePath === "reviewed-compatibility.json") { content = await readFile(new URL("../../reviewed-compatibility.json", import.meta.url)); }
    else if (spec.relativePath === "server/dist/server.mjs") { content = "process.stdout.write('fixed-fixture');\n"; }
    await writeFile(filename, content);
    await chmod(filename, spec.mode);
  }
  await mkdir(join(root, "configuration"));
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: root, machineProfilePath: join(root, "configuration", "machine-profile.json") });
  return { root, packet: await captureWindowsWslRuntime(root, profile) };
}
void test("WSL profile and packet selectors reject accessors, noncanonical paths and injected flags", () => {
  const profile = { schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: "/canonical/node", pluginRoot: "/canonical/plugin", machineProfilePath: "/canonical/profile.json" };
  assert.equal(parseWindowsWslLaunchProfile(profile).distribution, "synthetic");
  for (const value of [{ ...profile, distribution: "--exec" }, { ...profile, pluginRoot: "/a/../other" },
    { ...profile, pluginRoot: "/a//other" }, { ...profile, pluginRoot: "/a\nother" }, { ...profile, command: "arbitrary" }]) {
    assert.throws(() => parseWindowsWslLaunchProfile(value));
  }
  let calls = 0; const getter = { ...profile };
  Object.defineProperty(getter, "pluginRoot", { get(): string { calls += 1; return profile.pluginRoot; } });
  assert.throws(() => parseWindowsWslLaunchProfile(getter));
  assert.throws(() => serializeWindowsWslRuntimePacket(getter)); assert.equal(calls, 0);
  const args = ["--distribution", "synthetic", "--node", profile.nodeExecutable, "--plugin-root", profile.pluginRoot, "--machine-profile", profile.machineProfilePath];
  assert.equal(parseWindowsWslConfigurationArguments(args).replace, false);
  assert.equal(parseWindowsWslConfigurationArguments([...args, "--replace"]).replace, true);
  assert.throws(() => parseWindowsWslConfigurationArguments([...args, "--replace", "--replace"]));
  assert.throws(() => parseWindowsWslConfigurationArguments([]),/windows-wsl-profile-invalid/u);
});
void test("actual readonly WSL program verifies fixed bytes and refuses a changed package", async () => {
  const fixture = await packetFixture(), program = windowsWslRuntimeProgram();
  const argv = ["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)];
  const stdout = await runNode(argv);
  assert.deepEqual(JSON.parse(stdout), { schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
    platform: "linux-x64", nodeVersion: "v24.18.0", fileCount: 6, nativeOwnerAllocated: false });
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
  const args = windowsWslLaunchArguments(profile, fixture.packet, "verify");
  assert.equal(args[0], "--distribution"); assert.equal(args[3], "/"); assert.equal(args.at(-2), "verify");
  await writeFile(join(fixture.root, "server/dist/server.mjs"), "changed fixture\n");
  await assert.rejects(runNode(argv));
});
void test("the minified packaged bootstrap retains every lexical helper and validates before execution", async () => {
  const fixture = await packetFixture();
  const filename = join(fixture.root, "serialized-program.mjs");
  const sourcePath = fileURLToPath(new URL("../src/windows-wsl-runtime.ts", import.meta.url));
  const result = await build({ stdin: { contents: `import {windowsWslRuntimeProgram} from ${  JSON.stringify(sourcePath)
    };process.stdout.write(windowsWslRuntimeProgram());`, resolveDir: import.meta.dirname, loader: "ts" },
    bundle: true, platform: "node", format: "esm", target: "node24", keepNames: true,
    minifyIdentifiers: true, minifySyntax: false, minifyWhitespace: true, write: false, logLevel: "silent" });
  assert.ok(result.outputFiles[0]); await writeFile(filename, result.outputFiles[0].contents);
  const program = await runNode([filename]);
  const stdout = await runNode(["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)]);
  const observed: unknown = JSON.parse(stdout);
  assert.deepEqual(observed, { schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
    platform: "linux-x64", nodeVersion: "v24.18.0", fileCount: 6, nativeOwnerAllocated: false });
  await chmod(join(fixture.root, "server/bin/easyeda-fd-sanitizer"), 0o644);
  await assert.rejects(runNode(["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)]));
});

void test("the original Linux handoff receives fixed argv and binary stdin and closes on EOF", async () => {
  const fixture = await packetFixture();
  const server = `import assert from "node:assert/strict";
assert.deepEqual(process.argv.slice(2), ["--machine-launch", "--profile", ${JSON.stringify(fixture.packet.machineProfilePath)}]);
process.stdin.pipe(process.stdout); process.stdin.once("end", () => { process.exitCode = 23; });\n`;
  await writeFile(join(fixture.root, "server/dist/server.mjs"), server);
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
  const packet = await captureWindowsWslRuntime(fixture.root, profile);
  const child = spawn(process.execPath, ["--input-type=module", "--eval", windowsWslRuntimeProgram(), "--", "launch", serializeWindowsWslRuntimePacket(packet)],
    { stdio: ["pipe", "pipe", "pipe"] });
  const completion = Promise.withResolvers<Readonly<{ code: number | null; signal: NodeJS.Signals | null }>>();
  const stderr: Buffer[] = [], stdout: Buffer[] = [];
  child.once("error", (error: Error) => { completion.reject(error); });
  child.stdin.once("error", (error: Error) => { completion.reject(error); });
  child.stdout.on("data", (chunk: Buffer) => { stdout.push(chunk); });
  child.stderr.on("data", (chunk: Buffer) => { stderr.push(chunk); });
  child.once("close", (code, signal) => { completion.resolve({ code, signal }); });
  const bytes = Buffer.concat([Buffer.from(Array.from({ length: 256 }, (_, index) => index)), Buffer.from("piano 🎹\r\n\0")]);
  child.stdin.end(bytes);
  assert.deepEqual(await completion.promise, { code: 23, signal: null });
  assert.deepEqual(Buffer.concat(stdout), bytes); assert.equal(Buffer.concat(stderr).length, 0);
});

void test("standalone configuration refuses before importing Linux profile or SQLite modules",async()=>{
 const entry=new URL("../src/main.ts",import.meta.url).href;
 const script=`import {registerHooks} from 'node:module';let forbidden=0;registerHooks({resolve(specifier,context,next){if(specifier.endsWith('/machine-profile.ts')||specifier==='node:sqlite'){forbidden+=1;throw Error('Linux state imported before platform selection');}return next(specifier,context);}});process.argv=[process.execPath,${JSON.stringify(entry)},'--configure-wsl-launch','--distribution','synthetic','--node','/canonical/node','--plugin-root','/canonical/plugin','--machine-profile','/canonical/profile.json'];await import(${JSON.stringify(entry)});if(forbidden!==0)throw Error('Forbidden Linux import was attempted');if(process.exitCode!==1)throw Error('Unsupported platform was not refused');process.exitCode=0;process.stdout.write('standalone-refusal');`;
 assert.equal(await runNode(["--input-type=module","--eval",script]),"standalone-refusal");
});

interface FixtureNodeResult { readonly stdout: string; readonly stderr: string; readonly code: number | null; readonly signal: NodeJS.Signals | null }
function runFixtureNode(script: string): Promise<FixtureNodeResult> {
  const child = spawn(process.execPath, ["--input-type=module", "--eval", script], { stdio: ["pipe", "pipe", "pipe"] });
  const result = Promise.withResolvers<FixtureNodeResult>(), stderr: Buffer[] = [], stdout: Buffer[] = [];
  child.once("error", (error: Error) => { result.reject(error); });
  child.stdin.on("error", (error: Error) => { result.reject(error); });
  child.stdout.on("data", (chunk: Buffer) => { stdout.push(chunk); }); child.stderr.on("data", (chunk: Buffer) => { stderr.push(chunk); });
  child.once("close", (code, signal) => { result.resolve({ stdout: Buffer.concat(stdout).toString("utf8"), stderr: Buffer.concat(stderr).toString("utf8"), code, signal }); });
  child.stdin.end(); return result.promise;
}
async function configurationFixture(): Promise<Readonly<{ root: string; profilePath: string; prelude: string }>> {
  const fixture = await packetFixture(), profilePath = join(fixture.root, "configuration", "windows-wsl-profile.json"), system = join(fixture.root, "SystemRoot");
  await mkdir(join(system, "System32"), { recursive: true });
  const verification = { schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
    platform: "linux-x64", nodeVersion: "v24.18.0", fileCount: 6, nativeOwnerAllocated: false };
  const executable = join(system, "System32", "wsl.exe");
  await writeFile(executable, `#!/bin/sh\nprintf '%s\\n' '${JSON.stringify(verification)}'\n`); await chmod(executable, 0o755);
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "original",
    nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
  await writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`);
  const module = new URL("../src/windows-wsl-launch.ts", import.meta.url).href;
  const prelude = `import fs from 'node:fs/promises';import {syncBuiltinESMExports} from 'node:module';
Object.defineProperty(process,'platform',{value:'win32'});process.env.SystemRoot=${JSON.stringify(system)};process.env.EASYEDA_WINDOWS_WSL_PROFILE=${JSON.stringify(profilePath)};
const profile=${JSON.stringify(profile)},profilePath=${JSON.stringify(profilePath)},root=${JSON.stringify(fixture.root)};
const {configureWindowsWslLaunch}=await import(${JSON.stringify(module)});`;
  return { root: fixture.root, profilePath, prelude };
}
void test("concurrent configuration publishers serialize final read/publication and retain the first winner", async () => {
  const fixture = await configurationFixture();
  const scripts = ["A", "B"].map((name, index) => `${fixture.prelude}
const mine=${JSON.stringify(name)},other=${JSON.stringify(index === 0 ? "B" : "A")};const originalOpen=fs.open;let profileReads=0;
async function waitFor(names){for(let count=0;count<1000;count++){for(const name of names){try{await fs.access(root+'/'+name);return;}catch{}}await new Promise(resolve=>setTimeout(resolve,5));}throw Error('bounded fixture rendezvous failed');}
fs.open=async function(filename,...args){const handle=await originalOpen(filename,...args);
 if(String(filename).includes('.windows-wsl-profile-')&&String(filename).endsWith('.pending')){await fs.writeFile(root+'/'+mine+'-pending','ready');await waitFor([other+'-pending']);}
 if(filename===profilePath){profileReads++;if(profileReads===2){const close=handle.close.bind(handle);handle.close=async()=>{await fs.writeFile(root+'/'+mine+'-reread','ready');await waitFor([other+'-reread',other+'-done']);return close();};}}
 return handle;};syncBuiltinESMExports();
try{const result=await configureWindowsWslLaunch(root,{...profile,distribution:mine},true);process.stdout.write(JSON.stringify({ok:true,result}));}
catch(error){process.stdout.write(JSON.stringify({ok:false,code:error?.code}));}finally{await fs.writeFile(root+'/'+mine+'-done','done');}`);
  const results = await Promise.all(scripts.map(script => runFixtureNode(script)));
  for (const result of results) { assert.equal(result.code, 0, result.stderr); assert.equal(result.signal, null); }
  const replies = results.map((result): unknown => JSON.parse(result.stdout));
  assert.equal(replies.filter(reply => reply !== null && typeof reply === "object" && "ok" in reply && reply.ok === true).length, 1);
  assert.equal(replies.filter(reply => reply !== null && typeof reply === "object" && "code" in reply && reply.code === "windows-wsl-profile-changed").length, 1);
  const winner = replies.findIndex(reply => reply !== null && typeof reply === "object" && "ok" in reply && reply.ok === true);
  const installed = parseWindowsWslLaunchProfile(JSON.parse(await readFile(fixture.profilePath, "utf8")));
  assert.equal(installed.distribution, winner === 0 ? "A" : "B");
});
void test("configuration OS lock survives initialization/publication crashes without stale-lock recovery", async () => {
  for (const crashAt of ["lock-published", "transaction-held"]) {
    const fixture = await configurationFixture();
    const script = `${fixture.prelude}
const originalOpen=fs.open,originalLink=fs.link;let reads=0;
fs.link=async function(from,to){await originalLink(from,to);if(${JSON.stringify(crashAt)}==='lock-published'&&String(to).endsWith('.lock.sqlite'))process.exit(37);};
fs.open=async function(filename,...args){const handle=await originalOpen(filename,...args);if(filename===profilePath&&++reads===2&&${JSON.stringify(crashAt)}==='transaction-held')process.exit(37);return handle;};syncBuiltinESMExports();
await configureWindowsWslLaunch(root,{...profile,distribution:'crashed'},true);throw Error('crash point was not reached');`;
    const crashed = await runFixtureNode(script); assert.equal(crashed.code, 37, crashed.stderr); assert.equal(crashed.signal, null);
    const completed = await runFixtureNode(`${fixture.prelude}const result=await configureWindowsWslLaunch(root,{...profile,distribution:'after-crash'},true);process.stdout.write(JSON.stringify(result));`);
    assert.equal(completed.code, 0, completed.stderr); assert.equal(completed.signal, null);
    assert.deepEqual(JSON.parse(completed.stdout), { schema: "easyeda-pro-control.windows-wsl-configuration.v1", configured: true, changed: true });
    const installedText = await readFile(fixture.profilePath, "utf8"); const installed = parseWindowsWslLaunchProfile(JSON.parse(installedText));
    assert.equal(installed.distribution, "after-crash");
  }
});
void test("unknown schemas and rebound configuration locks refuse without changing either file", async () => {
  for (const invalid of ["unknown-file", "wrong-path", "extra-table"]) {
    const fixture = await configurationFixture();
    const script = `${fixture.prelude}
import {createHash} from 'node:crypto';import {DatabaseSync} from 'node:sqlite';const lock=root+'/configuration/.windows-wsl-'+createHash('sha256').update(profilePath.toUpperCase()).digest('hex')+'.lock.sqlite';
if(${JSON.stringify(invalid)}==='unknown-file'){await fs.writeFile(lock,'not an owned configuration database');}else{const db=new DatabaseSync(lock);db.exec('PRAGMA application_id=1163350860;PRAGMA user_version=1;CREATE TABLE configuration_lock (profile_path TEXT NOT NULL, schema TEXT NOT NULL) STRICT');db.prepare('INSERT INTO configuration_lock VALUES (?,?)').run(${JSON.stringify(invalid)}==='wrong-path'?'different profile':profilePath.toUpperCase(),'easyeda-pro-control.windows-wsl-configuration-lock.v1');if(${JSON.stringify(invalid)}==='extra-table')db.exec('CREATE TABLE unexpected(value TEXT)');db.close();}
const original=await fs.readFile(profilePath),originalLock=await fs.readFile(lock);
try{await configureWindowsWslLaunch(root,{...profile,distribution:'refused'},true);throw Error('unknown lock was accepted');}catch(error){if(error?.code!=='windows-wsl-profile-changed')throw error;}
if(!original.equals(await fs.readFile(profilePath))||!originalLock.equals(await fs.readFile(lock)))throw Error('file changed');process.stdout.write('refused');`;
    const result = await runFixtureNode(script); assert.equal(result.code, 0, result.stderr); assert.equal(result.stdout, "refused");
  }
});

void test("all six captured namespace files survive in-place, atomic-file and containing-directory replacement", async () => {
  for (const mutation of ["in-place", "atomic-files", "server-directory", "package-directory"]) {
    const fixture = await packetFixture();
    const server = `import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
assert.deepEqual(process.argv.slice(2),['--machine-launch','--profile',${JSON.stringify(fixture.packet.machineProfilePath)}]);
const paths=${JSON.stringify(windowsWslRuntimeFiles().map(spec => ({ path: join(fixture.root, spec.relativePath), mode: spec.mode })))};
const observations=paths.map(({path,mode})=>{const stat=fs.statSync(path);assert.equal(stat.mode%4096,mode);assert.equal(stat.nlink,1);const bytes=fs.readFileSync(path);assert.throws(()=>fs.writeFileSync(path,'refused'),{code:'EROFS'});return {sha256:createHash('sha256').update(bytes).digest('hex'),mode:stat.mode%4096,nlink:stat.nlink};});
let setupSockets=0;for(const fd of fs.readdirSync('/proc/self/fd')){try{if(Number(fd)>2&&fs.readlinkSync('/proc/self/fd/'+fd).startsWith('socket:'))setupSockets++;}catch(error){if(error.code!=='ENOENT')throw error;}}
assert.equal(setupSockets,0,'setup descriptors leaked into Node');process.stdout.write(JSON.stringify({observations,setupSockets}));`;
    await writeFile(join(fixture.root, "server/dist/server.mjs"), server);
    const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
      nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
    const packet = await captureWindowsWslRuntime(fixture.root, profile);
    const script = `import cp from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {syncBuiltinESMExports} from 'node:module';
const original=cp.spawn;let mutated=false;const root=${JSON.stringify(fixture.root)},paths=${JSON.stringify(windowsWslRuntimeFiles().map(spec => spec.relativePath))};
cp.spawn=function(...args){if(mutated)throw Error('second launch refused');mutated=true;
if(${JSON.stringify(mutation)}==='package-directory'){fs.renameSync(root,root+'-original');fs.mkdirSync(root);}
if(${JSON.stringify(mutation)}==='server-directory'){fs.renameSync(root+'/server',root+'/server-original');fs.mkdirSync(root+'/server');}
for(const relative of paths){const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});if(${JSON.stringify(mutation)}==='atomic-files'){fs.writeFileSync(file+'.replacement','untrusted replacement');fs.renameSync(file+'.replacement',file);}else{fs.writeFileSync(file,'untrusted replacement');}}
return original.apply(this,args);};syncBuiltinESMExports();process.argv=[process.execPath,'launch',${JSON.stringify(serializeWindowsWslRuntimePacket(packet))}];
${windowsWslRuntimeProgram()}`;
    const result = await runFixtureNode(script); assert.equal(result.code, 0, `${mutation}: ${result.stderr}`); assert.equal(result.signal, null);
    const expected = { observations: packet.files.map((file, index) => ({ sha256: file.sha256, mode: windowsWslRuntimeFiles()[index]?.mode, nlink: 1 })), setupSockets: 0 };
    assert.deepEqual(JSON.parse(result.stdout), expected, mutation);
  }
});
