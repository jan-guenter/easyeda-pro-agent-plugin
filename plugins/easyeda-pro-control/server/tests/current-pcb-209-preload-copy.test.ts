import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, qualifyCurrentPcb209PreloadCopyCreator,
  qualifyCurrentPcb209PreloadCopyPause, qualifyCurrentPcb209StartupScriptSource } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { PRELOAD_COPY_FIXTURE_SOURCE } from "./helpers/current-pcb-209-preload-copy-fixture.ts";

// oxlint-disable-next-line typescript/strict-void-return -- promisify consumes the callback, not execFile's ChildProcess return.
const execFileAsync = promisify(execFile);
const fixture = new URL("helpers/current-pcb-209-preload-copy-fixture.ts", import.meta.url).href;
const rawObject = z.record(z.string(), z.unknown());
const stackSchema = z.object({ callFrames: z.array(rawObject) });
const parsedSchema = z.looseObject({ scriptId: z.string(), stackTrace: stackSchema });
const frameSchema = z.looseObject({ functionName: z.string(), location: rawObject });
const pauseSchema = z.looseObject({ callFrames: z.array(frameSchema) });
const sourceSchema = z.object({ scriptSource: z.string() }).strict();

void test("real V8 reports the four exact preload copies with distinct original caller frames", { timeout: 10_000 }, async () => {
  const result = await execFileAsync(process.execPath, ["--input-type=module", "-e",
    `import {capturePreloadCopyFixture} from ${JSON.stringify(fixture)};console.log(JSON.stringify(capturePreloadCopyFixture()));`],
  { timeout: 5000, maxBuffer: 1024 * 1024 });
  assert.equal(result.stderr, "");
  const observed = z.object({ parsed: z.array(parsedSchema).length(4), paused: z.array(pauseSchema).length(4),
    sources: z.array(sourceSchema).length(4), preloadScriptId: z.string().min(1) }).strict()
    .parse(JSON.parse(result.stdout));
  for (const [index, parsed] of observed.parsed.entries()) {
    const paused = observed.paused[index], role = CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[index + 2], source = observed.sources[index];
    assert.ok(role !== undefined && paused !== undefined && source !== undefined);
    assert.equal(source.scriptSource, PRELOAD_COPY_FIXTURE_SOURCE);
    qualifyCurrentPcb209PreloadCopyCreator(observed.preloadScriptId, parsed);
    qualifyCurrentPcb209PreloadCopyPause(role, parsed.scriptId, observed.preloadScriptId, paused);
    qualifyCurrentPcb209StartupScriptSource(role, source);
    const wrongCaller = structuredClone(paused);
    const callerFrame = wrongCaller.callFrames[2]; assert.ok(callerFrame !== undefined);
    callerFrame.location["columnNumber"] = 0;
    assert.throws(() => { qualifyCurrentPcb209PreloadCopyPause(role, parsed.scriptId, observed.preloadScriptId, wrongCaller); });
    assert.throws(() => { qualifyCurrentPcb209PreloadCopyPause(role, "foreign", observed.preloadScriptId, paused); });
    const wrongCreator = structuredClone(parsed);
    const creatorFrame = wrongCreator.stackTrace.callFrames[0]; assert.ok(creatorFrame !== undefined);
    creatorFrame["scriptId"] = "foreign";
    assert.throws(() => { qualifyCurrentPcb209PreloadCopyCreator(observed.preloadScriptId, wrongCreator); });
    assert.throws(() => { qualifyCurrentPcb209PreloadCopyCreator("foreign", parsed); });
    const otherRole = CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[(index + 1) % 4 + 2]; assert.ok(otherRole !== undefined);
    assert.throws(() => { qualifyCurrentPcb209PreloadCopyPause(otherRole, parsed.scriptId, observed.preloadScriptId, paused); });
    for (const bad of [`${source.scriptSource};`, source.scriptSource.replace("function Is", "function other"), "(function Is(){})"] ) {
      assert.throws(() => { qualifyCurrentPcb209StartupScriptSource(role, { scriptSource: bad }); });
    }
  }
});

void test("anonymous-copy source roles retain strict raw replies and permit no arbitrary anonymous program", () => {
  let calls = 0;
  const accessor = Object.defineProperty({}, "scriptSource", { get(): string { calls += 1; return PRELOAD_COPY_FIXTURE_SOURCE; } });
  for (const role of CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES.slice(2, 6)) {
    for (const bad of [accessor, new Proxy({ scriptSource: PRELOAD_COPY_FIXTURE_SOURCE }, {}),
      { scriptSource: PRELOAD_COPY_FIXTURE_SOURCE, extra: true }, { scriptSource: "" }]) {
      assert.throws(() => { qualifyCurrentPcb209StartupScriptSource(role, bad); });
    }
  }
  assert.equal(calls, 0);
});
