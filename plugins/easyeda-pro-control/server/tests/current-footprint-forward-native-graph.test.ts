/** Source generation and real descriptor reads only. No C#/PowerShell compiler,
 * application, native helper or Windows owner runs in these focused cases. */
/* oxlint-disable import/max-dependencies -- Verify the fixed graph against its legacy predecessor, independent codebooks and actual descriptor reader in one bounded source-only fixture. */
import assert from "node:assert/strict";
import { constants } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { currentFootprintForwardNativeOutputs, currentFootprintForwardNativePins, currentFootprintForwardNativeSmoke } from "../src/current-footprint-forward-native-graph-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH as GRAPH } from "../src/current-footprint-forward-native-graph-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH_LIMITS as LIMITS } from "../src/current-footprint-forward-native-limits.ts";
import { FORWARD_NATIVE_LEGACY, FORWARD_NATIVE_PREDECESSOR, migrateForwardNativePredecessor } from "../src/current-footprint-forward-native-migration.ts";
import { captureCurrentFootprintForwardNativeGraph } from "../src/current-footprint-forward-native-graph.ts";
import { currentFootprintCopyClockRegistrationV2NativeCases } from "../src/current-footprint-copy-clock-registration-v2-native.ts";
import { currentFootprintCopyClockRegistrationV2Wire } from "../src/current-footprint-copy-clock-registration-v2-wire.ts";
import { currentFootprintCopyClockRpcV2NativeCases } from "../src/current-footprint-copy-clock-rpc-v2-native.ts";

void test("three exact generated roles preserve the 73-line native birth predecessor and unchanged legacy artifact", async () => {
  const legacy = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.equal(Buffer.byteLength(legacy), FORWARD_NATIVE_LEGACY.bytes); assert.equal(sha256Text(legacy), FORWARD_NATIVE_LEGACY.sha256);
  const predecessor = migrateForwardNativePredecessor(legacy); assert.equal(sha256Text(predecessor), FORWARD_NATIVE_PREDECESSOR.sha256);
  assert.throws(() => migrateForwardNativePredecessor(`${legacy.slice(0, -1)}!`));
  const outputs = currentFootprintForwardNativeOutputs(legacy); assert.deepEqual(outputs.map(output => output.role), ["driver", "core", "phase"]);
  for (const [index, output] of outputs.entries()) {
    assert.equal(await readFile(new URL(`../../${output.relativePath}`, import.meta.url), "utf8"), output.source);
    const { source: _source, ...pin } = output; assert.deepEqual(pin, GRAPH.files[index]); assert.ok(output.bytes <= LIMITS.file);
  }
  assert.equal(await readFile(new URL("../src/current-footprint-forward-native-graph-pins.ts", import.meta.url), "utf8"), currentFootprintForwardNativePins(outputs));
  assert.equal(await readFile(new URL("../../scripts/footprint-forward-execution-smoke.ps1", import.meta.url), "utf8"), currentFootprintForwardNativeSmoke(outputs));
  const core = outputs[1]?.source, driver = outputs[0]?.source, phase = outputs[2]?.source; assert.ok(core !== undefined && driver !== undefined && phase !== undefined);
  assert.ok(core.includes("public sealed partial class EasyedaDiagnosticOwner")); assert.ok(!core.includes("bool forward,bool execution):this("));
  assert.ok(phase.indexOf("forwardExecution=true;footprintCreateClockPurpose=true;") < phase.indexOf("footprintElapsed=Stopwatch.StartNew();"));
  assert.ok(core.indexOf("if(forwardExecution)RequireForwardExecutionUnallocated();") < core.indexOf("job=CreateJobObject(IntPtr.Zero,null)"));
  assert.ok(driver.startsWith("param([switch]$CompileOnly,[switch]$WorkerStartupFootprintForwardExecution209,[string]$CombinedReadyChallenge)\n"));
  assert.ok(!driver.includes("Add-Type @'")); assert.ok(!driver.includes("Add-Type -Path"));
  const compileOnly = driver.slice(driver.indexOf("  if ($CompileOnly) {"), driver.indexOf("  $launched=$false"));
  assert.ok(compileOnly.includes("$owner.ReleaseUnlaunched()\n")); assert.ok(compileOnly.endsWith("    return\n  }\n")); assert.ok(!/\bexit\b/u.test(compileOnly));
  const smoke = currentFootprintForwardNativeSmoke(outputs);
  assert.ok(smoke.indexOf("$output=& ([ScriptBlock]::Create(") < smoke.indexOf("if (@($output).Count -ne 1"));

  assert.ok(core.includes("ForwardBirth(int first){return new EasyedaFootprintCopyAllocatedCreateClockLedger(first,1002);}"));
  assert.ok(core.includes("ForwardExecutionBirth(int first){return new EasyedaFootprintCopyAllocatedCreateClockLedger(first,EasyedaFootprintForwardExecutionLimits.Requests);}"));
  assert.ok(phase.includes("case \"footprint-clock-rpc-v2-send\"")); assert.ok(phase.includes("default:throw Error(\"forward-execution-provider-unmounted\")"));
  assert.ok(core.includes("internal sealed partial class EasyedaOriginalMainTransport"));
  assert.ok(phase.includes("EasyedaOriginalMainTransport.ForwardExecutionMainBirth.V2,footprintElapsed"));
  assert.ok(phase.includes("MainNormal=87,MainCleanup=41,MainRequests=128"));
  assert.ok(core.includes("id>(forwardExecution?EasyedaFootprintForwardExecutionLimits.MainRequests:EasyedaFootprintCombinedLimits.MainRequests)"));
  assert.ok(driver.includes("$largeMainRequest=$WorkerStartupFootprintForwardExecution209 -and"));
  assert.ok(phase.includes('case "main-completion-begin":case "main-completion-send":case "main-completion-retire"'));

});

void test("actual fixed reader rechecks all complete descriptor-bound roles and emits only a bounded captured-byte loader", async () => {
  const captured = await captureCurrentFootprintForwardNativeGraph("Synthetic", "a".repeat(32)); await captured.verify();
  assert.equal(captured.bootstrap.split("[IO.File]::Open(").length - 1, 3); assert.equal(captured.bootstrap.split("[IO.FileShare]::Read").length - 1, 3);
  assert.equal(captured.bootstrap.split("[ScriptBlock]::Create(").length - 1, 1); assert.ok(captured.bootstrap.includes("$forwardExecutionCoreBytes=$b1;$forwardExecutionPhaseBytes=$b2"));
  assert.ok(Buffer.from(captured.bootstrap, "utf16le").toString("base64").length <= LIMITS.bootstrapEncoded);
  for (const file of GRAPH.files) { assert.ok(captured.bootstrap.includes(file.sha256)); }
  await assert.rejects(captureCurrentFootprintForwardNativeGraph("bad/distribution", "a".repeat(32)));
  await assert.rejects(captureCurrentFootprintForwardNativeGraph("Synthetic", "copied"));
});

async function readerWithFs(fs: Record<string, unknown>): Promise<typeof captureCurrentFootprintForwardNativeGraph> {
  const url = new URL("../src/current-footprint-forward-native-graph.ts", import.meta.url);
  const actualRequire = createRequire(url), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const input = await readFile(url, "utf8");
  const source = input.replaceAll("import.meta.url", JSON.stringify(url.href));
  const output = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "node:fs/promises" ? fs : actualRequire(name) as unknown, loaded, loaded.exports]);
  const candidate = loaded.exports["captureCurrentFootprintForwardNativeGraph"]; assert.equal(typeof candidate, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only filesystem substitution exercises the real reader with fixed production paths/pins; no production input profile changes.
  return candidate as typeof captureCurrentFootprintForwardNativeGraph;
}
void test("named FIFO refuses before open and an lstat/open replacement uses nonblocking descriptor admission", async () => {
  const pin = GRAPH.files[0]; assert.ok(pin !== undefined); let closes = 0, opens = 0, reads = 0;
  const stat = { dev: 1, ino: 2, size: pin.bytes, mtimeMs: 3, ctimeMs: 4, mode: 0o10_0644, nlink: 1, isSymbolicLink: (): boolean => false };
  const fifo = await readerWithFs({ lstat: (): Promise<object> => Promise.resolve({ ...stat, isFile: (): boolean => false }),
    open: (): never => { opens += 1; throw new Error("unsafe open reached"); } });
  await assert.rejects(fifo("Synthetic", "a".repeat(32)), /GRAPH_SOURCE/u); assert.equal(opens, 0);
  const raced = await readerWithFs({ lstat: (): Promise<object> => Promise.resolve({ ...stat, isFile: (): boolean => true }),
    open: (_path: unknown, flags: unknown): Promise<object> => {
      opens += 1; assert.equal(typeof flags, "number");
      // oxlint-disable-next-line eslint/no-bitwise -- Verify the actual syscall includes nonblocking/no-follow protections rather than allowing a FIFO race to hang the test.
      assert.equal(Number(flags) & constants.O_NONBLOCK, constants.O_NONBLOCK);
      return Promise.resolve({ stat: (): Promise<object> => Promise.resolve({ ...stat, isFile: (): boolean => false }),
        read: (): never => { reads += 1; throw new Error("nonregular descriptor read"); }, close: (): Promise<void> => { closes += 1; return Promise.resolve(); } });
    } });
  await assert.rejects(raced("Synthetic", "a".repeat(32)), /GRAPH_SOURCE/u); assert.equal(opens, 1); assert.equal(reads, 0); assert.equal(closes, 1);
});

void test("new codebooks have exactly 8 registration and 24 RPC cases with no caller code/session forwarding", () => {
  const registration = currentFootprintCopyClockRegistrationV2NativeCases(); assert.equal(registration.length, 8); assert.equal(currentFootprintCopyClockRpcV2NativeCases().length, 24);
  assert.deepEqual(registration.filter(command => command.method === "Debugger.getScriptSource").map(command => command.phase), ["wrapper-source", "callback-source"]);
  for (const [index, command] of registration.entries()) {
    const wire = currentFootprintCopyClockRegistrationV2Wire(command, index + 1, "__copyregistrationv2_sessionId__");
    assert.equal(wire.request["action"], "footprint-copy-clock-registration-v2");
    assert.equal(Object.keys(wire.request).some(name => ["functionDeclaration", "expression", "sessionId", "source"].includes(name)), false);
    assert.throws(() => currentFootprintCopyClockRegistrationV2Wire(command, index + 1, "foreign"));
  }
});
