import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { WindowsNativeUiController, nativeUiRequestSchema } from "../src/windows-native-ui.ts";
import type { NativeUiInvocation, WindowsNativeUiDependencies } from "../src/windows-native-ui.ts";
import type { WindowsControlRuntimeStatus } from "../src/windows-runtime.ts";

const PLUGIN_ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCHEMA = "easyeda-pro-control.windows-native-ui.v1";
const TICKS = "638932350871234567";
const JOB = "a".repeat(32);
const HASH = "b".repeat(64);
const BINDING = { rootPid: 101, rootStartTicks: TICKS, executable: String.raw`D:\Apps\EasyEDA\easyeda-pro.exe`, executableSha256: HASH };
const OBSERVED = { ...BINDING, authority: "observed-unowned" as const };
const OWNED: WindowsControlRuntimeStatus = { state: "owned", executableSha256: HASH, reviewedExecutionScopeSha256: "c".repeat(64),
  launch: { jobId: JOB, helperInstance: "d".repeat(32), root: { pid: BINDING.rootPid, role: "easyeda-main", startIdentity: `win32:${TICKS}:job:${JOB}` } } };

function fixture(dependencies: WindowsNativeUiDependencies = {}): {
  controller: WindowsNativeUiController; calls: NativeUiInvocation[];
  state: { runtime: WindowsControlRuntimeStatus; result: unknown; run: (() => Promise<unknown>) | undefined };
} {
  const state = { runtime: structuredClone(OWNED), result: undefined as unknown, run: undefined as (() => Promise<unknown>) | undefined };
  const calls: NativeUiInvocation[] = [];
  const controller = new WindowsNativeUiController({ runtime: { status: (): WindowsControlRuntimeStatus => structuredClone(state.runtime) }, pluginRoot: PLUGIN_ROOT,
    assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets", wslDistribution: "FixtureDistro" }, {
    hashExecutable: (): Promise<string> => Promise.resolve(HASH),
    invoke(input): Promise<unknown> {
      calls.push(input);
      if (state.run !== undefined) { return state.run(); }
      return Promise.resolve(state.result ?? { schema: SCHEMA, action: input.request["action"], binding: BINDING, result: { windows: [], mainWindowHandle: "65537" } });
    }, ...dependencies,
  });
  return { controller, calls, state };
}

void test("UI works on owned Start Page without bridge calls and keeps 64-bit StartTicks as a string", async () => {
  const { controller, calls } = fixture();
  const result = await controller.run({ action: "windows" });
  assert.equal(result["authority"], "retained-job");
  assert.equal(calls.length, 1);
  const invocation = calls[0];
  assert.ok(invocation);
  assert.equal(invocation.request["rootStartTicks"], TICKS);
  assert.equal(invocation.timeoutMs, 10_000);
  assert.match(invocation.helperWindowsPath, /\\scripts\\native-ui-controller\.ps1$/u);
  assert.equal(invocation.request["executableSha256"], HASH);
  assert.equal(Object.hasOwn(invocation.request, "code"), false);
  assert.match(String(invocation.request["legacyHelperSha256"]), /^[a-f0-9]{64}$/u);
});

void test("every UI mutation requires confirmation and caller script/path/process authority is rejected", async () => {
  const { controller, calls } = fixture();
  for (const action of ["focus", "invoke", "setvalue", "filename", "click", "doubleclick", "keys", "normal-close"]) {
    await assert.rejects(controller.run({ action, windowHandle: "123", name: "Save", text: "x", x: 1, y: 1 }));
  }
  for (const input of [{ action: "windows", code: "caller-code" }, { action: "capture", windowHandle: "123", outputPath: "D:\\outside.png" },
    { action: "windows", rootPid: 666 }, { action: "keys", windowHandle: "123", text: "x\0y", confirmUIWrite: true }]) {
    await assert.rejects(controller.run(input));
  }
  assert.equal(calls.length, 0);
  assert.doesNotThrow(() => z.toJSONSchema(nativeUiRequestSchema, { io: "input" }));
  await controller.run({ action: "keys", windowHandle: "123", text: "{ESC}", confirmUIWrite: true });
  assert.equal(calls[0]?.request["confirmUIWrite"], true);
});

void test("rightclick uses the confirmed bound pointer path with no caller-selected buttons or recovery authority", async () => {
  const { controller, calls, state } = fixture();
  const request = { action: "rightclick", windowHandle: "123", x: 140, y: 260, confirmUIWrite: true };
  for (const invalid of [{ ...request, confirmUIWrite: false }, { ...request, confirmUIWrite: undefined },
    { ...request, x: 32_768 }, { ...request, y: 0.5 }, { ...request, windowHandle: 123 },
    { ...request, button: "left" }, { ...request, count: 2 }, { ...request, code: "caller-code" },
    { ...request, rootPid: 666 }, { ...request, recoveryCloseConfirmation: {} }]) {
    await assert.rejects(controller.run(invalid));
  }
  assert.equal(calls.length, 0);
  const result = await controller.run(request);
  assert.equal(result["authority"], "retained-job");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.request["action"], "rightclick");
  assert.equal(calls[0]?.request["windowHandle"], "123");
  assert.equal(calls[0]?.request["rootPid"], BINDING.rootPid);
  assert.equal(calls[0]?.request["rootStartTicks"], TICKS);
  assert.equal(calls[0]?.request["executableSha256"], HASH);
  state.result = { schema: SCHEMA, error: "native-ui-refused", dispatched: false };
  await assert.rejects(controller.run(request), { message: "native-ui-refused", dispatched: false });
  const script = await readFile(path.join(PLUGIN_ROOT, "scripts/native-ui-controller.ps1"), "utf8");
  for (const fragment of [
    "$windowPid -eq $request.rootPid -and $action -notin @('focused','rightclick')",
    "$action -in @('focus','invoke','setvalue','filename','click','doubleclick','rightclick','keys','normal-close')",
    "$action -in @('focused','capture','click','doubleclick','rightclick','keys')",
    "$action -in @('click','doubleclick','rightclick','keys')",
    "$action -in @('click','doubleclick','rightclick')",
    "throw 'point-outside-owned-window'", "throw 'input-target-is-not-foreground'",
    "if ($action -eq 'rightclick') { $down = 8; $up = 16 }",
    "if ($action -eq 'doubleclick') { $count = 2 }",
    "mouse_event($down,0,0,0,[UIntPtr]::Zero)", "mouse_event($up,0,0,0,[UIntPtr]::Zero)",
    "if ($action -cne 'click' -or $proof.expectedCaptureSha256",
  ]) { assert.ok(script.includes(fragment), fragment); }
  // The application HWND must skip legacy delegation, which lacks rightclick.
  const delegation = /elseif \(\$windowPid -eq \$request\.rootPid -and \$action -notin @\(([^)]+)\)\)/u.exec(script);
  assert.ok(delegation !== null && delegation[1] !== undefined && delegation[1].length > 0);
  const excluded = delegation[1].split(",").map((entry) => entry.replaceAll("'", ""));
  assert.deepEqual(excluded, ["focused", "rightclick"]);
  assert.equal(excluded.includes(request.action), true);
  for (const action of ["click", "doubleclick", "keys"]) { assert.equal(excluded.includes(action), false); }
  assert.ok(script.indexOf(delegation[0]) < script.indexOf("} elseif ($action -in @('click','doubleclick','rightclick'))"));
});

void test("discovery and observed-unowned normal close never imply retained Job authority", async () => {
  const { controller, calls, state } = fixture();
  state.runtime = { state: "not-launched", launch: null, executableSha256: null, reviewedExecutionScopeSha256: "c".repeat(64) };
  state.result = { schema: SCHEMA, action: "discover", observations: [OBSERVED] };
  const discovery = await controller.run({ action: "discover" });
  assert.deepEqual(discovery["observations"], [OBSERVED]);
  assert.equal(Object.hasOwn(calls[0]?.request ?? {}, "rootPid"), false);
  await assert.rejects(controller.run({ action: "windows" }), /discover-and-bind/u);
  state.result = { schema: SCHEMA, action: "normal-close", binding: BINDING, result: { normalCloseRequested: true, terminated: false, promptChoiceMade: false } };
  const closed = await controller.run({ action: "normal-close", windowHandle: "65537", appBinding: OBSERVED, confirmUIWrite: true });
  assert.equal(closed["authority"], "observed-unowned");
  assert.equal(state.runtime.state, "not-launched");
  await assert.rejects(controller.run({ action: "windows", appBinding: { ...OBSERVED, executableSha256: "f".repeat(64) } }), /installation-mismatch/u);
  state.runtime = structuredClone(OWNED);
  await assert.rejects(controller.run({ action: "windows", appBinding: OBSERVED }), /conflicts-with-owned/u);
});

void test("runtime changes, malformed root generation, number-rounded ticks and foreign output are rejected", async () => {
  const { controller, calls, state } = fixture();
  assert.ok(OWNED.launch);
  state.runtime = { ...OWNED, launch: { ...OWNED.launch, root: { pid: 101, role: "easyeda-main", startIdentity: `win32:${TICKS}:job:${"e".repeat(32)}` } } };
  await assert.rejects(controller.run({ action: "windows" }), /root-generation/u);
  assert.equal(calls.length, 0);
  state.runtime = structuredClone(OWNED);
  state.result = { schema: SCHEMA, action: "windows", binding: { ...BINDING, rootStartTicks: Number(TICKS) }, result: {} };
  await assert.rejects(controller.run({ action: "windows" }));
  state.result = { schema: SCHEMA, action: "windows", binding: { ...BINDING, rootPid: 102 }, result: {} };
  await assert.rejects(controller.run({ action: "windows" }), /binding-mismatch/u);
  state.run = (): Promise<unknown> => { state.runtime = { ...state.runtime, state: "released" }; return Promise.resolve({ schema: SCHEMA, action: "windows", binding: BINDING, result: {} }); };
  await assert.rejects(controller.run({ action: "windows" }), /changed-after-dispatch/u);
});

void test("fixed helper refusal preserves dispatched evidence and concurrent calls are not queued", async () => {
  const { controller, state, calls } = fixture();
  state.result = { schema: SCHEMA, error: "native-ui-action-failed", dispatched: true };
  await assert.rejects(controller.run({ action: "invoke", windowHandle: "123", name: "Example", confirmUIWrite: true }), { message: "native-ui-action-failed", dispatched: true });
  const deferred = Promise.withResolvers<unknown>();
  state.run = (): Promise<unknown> => deferred.promise;
  const pending = controller.run({ action: "windows" });
  await assert.rejects(controller.run({ action: "windows" }), /already-running/u);
  deferred.resolve({ schema: SCHEMA, action: "windows", binding: BINDING, result: {} });
  await pending;
  assert.equal(calls.length, 2);
});

void test("capture strips image bytes from tool output and publishes only through managed evidence", async () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jxioAAAAASUVORK5CYII=", "base64");
  let archived = 0;
  const { controller, state } = fixture({ archiveCapture(request, payload, bytes) {
    assert.equal(request.action, "capture"); assert.deepEqual(bytes, png); assert.equal(JSON.stringify(payload).includes("pngBase64"), false);
    archived += 1; return Promise.resolve({ images: [{ path: "/managed/native-ui/fresh.png" }] });
  } });
  state.result = { schema: SCHEMA, action: "capture", binding: BINDING, result: { pngBase64: png.toString("base64"), bounds: [0, 0, 1, 1] } };
  const result = await controller.run({ action: "capture", windowHandle: "123" });
  assert.equal(JSON.stringify(result).includes("pngBase64"), false);
  assert.equal(archived, 1);
  state.result = { schema: SCHEMA, action: "capture", binding: BINDING, result: { pngBase64: "not-png" } };
  await assert.rejects(controller.run({ action: "capture", windowHandle: "123" }), /capture-invalid/u);
  assert.equal(archived, 1);
});

void test("fixed shim rediscovery, owned-window guard, normal-close and legacy reuse remain explicit", async () => {
  const script = await readFile(path.join(PLUGIN_ROOT, "scripts/native-ui-controller.ps1"), "utf8");
  for (const fragment of ["EnumWindows", "Get-FileHash -LiteralPath $target.Path", "rootStartTicks -isnot [string]", "Ticks.ToString([Globalization.CultureInfo]::InvariantCulture)",
    "Owned-Window", "input-target-is-not-foreground", "PostMessage($windowHandle,0x0010", "$output = & $legacy @arguments", "promptChoiceMade=$false", "MemoryStream"]) {
    assert.ok(script.includes(fragment), fragment);
  }
  assert.equal(/Stop-Process|TerminateProcess|Invoke-Expression|\.Save\(\$request\./u.test(script), false);
  assert.equal(script.includes("$target.CloseMainWindow()"), false);
  assert.equal(script.includes("$target.MainWindowHandle -ne $windowHandle"), false);
  for (const guard of ["GetAncestor($windowHandle,2)", "GetAncestor($windowHandle,3)", "GetWindow($windowHandle,4)",
    "GetWindowLong($windowHandle,-20) -band 0x80", "IsWindowEnabled($windowHandle)", "ClassName -cne 'Chrome_WidgetWin_1'",
    "$title.Trim().Length -eq 0", "$rect.Height -lt 200", "normal-close-window-changed"]) {
    assert.ok(script.includes(guard), guard);
  }
});
