import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_PROJECT_WORKER_URL, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES,
  CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE,
  CURRENT_PCB_209_WORKER_PRELOAD_URL, currentPcb209StartupScriptRole, isCurrentPcb209BootstrapTargetUrl,
  qualifyCurrentPcb209StartupScriptSource, qualifyCurrentPcb209WorkerBootstrapSources,
  requireCurrentPcb209WorkerBootstrapSourceQualification } from "../src/current-pcb-209-worker-bootstrap-source.ts";

const target = "https://client/editor?entry=mgr-project-worker.js&cll=warn&debugOpen=0";
const refusal = /PCB209_WORKER_BOOTSTRAP_SOURCE/u;

void test("209 Worker target is the exact client bootstrap URL, separate from imported scripts", () => {
  for (const level of ["trace", "debug", "info", "warn", "error", "off", ""]) {
    for (const debug of ["0", "1"]) {
      const url = `https://client/editor?entry=mgr-project-worker.js&cll=${level}&debugOpen=${debug}`;
      assert.equal(isCurrentPcb209BootstrapTargetUrl(url), true);
      assert.equal(currentPcb209StartupScriptRole(url), "bootstrap");
    }
  }
  assert.equal(isCurrentPcb209BootstrapTargetUrl(CURRENT_PCB_209_PROJECT_WORKER_URL), false);
  assert.equal(currentPcb209StartupScriptRole(CURRENT_PCB_209_PROJECT_WORKER_URL), "project");
  assert.equal(currentPcb209StartupScriptRole(CURRENT_PCB_209_WORKER_PRELOAD_URL), "preload");
  for (const bad of [`${target}\n`, `${target}#x`, `${target}&extra=1`, target.replace("https:", "http:"),
    target.replace("client/", "client:443/"), target.replace("client/", "client.invalid/"),
    target.replace("warn", "WARN"), target.replace("warn", "%77arn"), target.replace("warn", "unknown"),
    target.replace("debugOpen=0", "debugOpen=true"), target.replace("debugOpen=0", "debugOpen=00"),
    "https://client/editor?cll=warn&entry=mgr-project-worker.js&debugOpen=0",
    `${CURRENT_PCB_209_WORKER_PRELOAD_URL}?v=1`, CURRENT_PCB_209_PROJECT_WORKER_URL.replace("185", "184")]) {
    assert.equal(isCurrentPcb209BootstrapTargetUrl(bad), false);
    assert.equal(currentPcb209StartupScriptRole(bad), null);
  }
});

void test("209 bootstrap source admits only the three exact backend-generated mode variants", () => {
  assert.deepEqual(CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, ["bootstrap", "preload", "preload-copy-1", "preload-copy-2", "preload-copy-3", "preload-copy-4", "project"]);
  assert.equal(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES.length, 3);
  assert.ok(Object.isFrozen(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES));
  for (const [index, mode] of ["ONLINE", "HALF_OFFLINE", "OFFLINE"].entries()) {
    // Independent literal expected output, including import order and whitespace.
    const scriptSource = `self.PRO_EDITOR_VERSION = '3.2.209';self.PRO_COMPRESS_BUILDDATE = '10/21/2026';self.PRO_EDITOR_MODE = "CLIENT-${mode}-EASYEDA-PCB-SCH-PANEL-SIM";` +
      "importScripts('https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/preload.js');" +
      "importScripts('https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/project-worker.js');";
    assert.equal(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[index], scriptSource);
    assert.equal(qualifyCurrentPcb209StartupScriptSource("bootstrap", { scriptSource }), scriptSource);
    for (const bad of [`${scriptSource}\n`, `${scriptSource}self.extra=1;`, scriptSource.replace("209", "206"),
      scriptSource.replace("EASYEDA", "LCEDA"), scriptSource.replace(mode, "PRIVATE"),
      scriptSource.replace("10/21/2026", "10/20/2026"), scriptSource.replace("preload.js", "project-worker.js")]) {
      assert.throws(() => { qualifyCurrentPcb209StartupScriptSource("bootstrap", { scriptSource: bad }); }, refusal);
    }
    assert.throws(() => { qualifyCurrentPcb209StartupScriptSource("preload", { scriptSource }); }, refusal);
    assert.throws(() => { qualifyCurrentPcb209StartupScriptSource("project", { scriptSource }); }, refusal);
  }
});

void test("raw script results refuse getters, proxies, extra fields and wrong source roles before use", () => {
  let calls = 0;
  const scriptSource = CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0];
  assert.ok(scriptSource !== undefined);
  const accessor = Object.defineProperty({}, "scriptSource", { get(): string { calls += 1; return scriptSource; } });
  const inherited: unknown = Object.create({ scriptSource });
  const proxy = new Proxy({ scriptSource }, { ownKeys(): string[] { calls += 1; return ["scriptSource"]; } });
  for (const bad of [null, [], {}, inherited, accessor, proxy, { scriptSource, bytecode: "" },
    { scriptSource, [Symbol("extra")]: "" }, { scriptSource: 1 }, { scriptSource: "\uD800" }]) {
    assert.throws(() => { qualifyCurrentPcb209StartupScriptSource("bootstrap", bad); }, refusal);
  }
  assert.throws(() => Reflect.apply(qualifyCurrentPcb209StartupScriptSource, undefined, ["caller-role", { scriptSource }]), refusal);
  assert.equal(calls, 0);
});

void test("fixed installation closure includes actual root editor.ini and rejects copied qualification", () => {
  const profile = CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE;
  assert.equal(profile.editorConfig.relativePath, "../editor.ini");
  assert.equal(profile.version.relativePath, "../version.txt");
  assert.equal(profile.preload.bytes, 875_163);
  assert.equal(profile.project.sha256, "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046");
  assert.ok(Object.isFrozen(profile)); assert.ok(Object.isFrozen(profile.editorConfig));
  let calls = 0;
  const empty = { backend: "", editorConfig: "", version: "", manager: "", preload: "", project: "" };
  const accessor = { ...empty };
  Object.defineProperty(accessor, "backend", { get(): string { calls += 1; return ""; } });
  const proxy = new Proxy(empty, { ownKeys(): string[] { calls += 1; return []; } });
  for (const bad of [empty, accessor, proxy, null, [], { ...empty, extra: "" }, { backend: "" }]) {
    assert.throws(() => Reflect.apply(qualifyCurrentPcb209WorkerBootstrapSources, undefined, [bad]), refusal);
  }
  const copiedReport = { profile: "private.pcb209-worker-bootstrap-source.v1", sourceSha256: profile,
    suppliedSourceBytesOnly: true, nativeTargetIdentityVerified: false };
  assert.throws(() => Reflect.apply(requireCurrentPcb209WorkerBootstrapSourceQualification, undefined, [copiedReport]), refusal);
  assert.equal(calls, 0);
});
