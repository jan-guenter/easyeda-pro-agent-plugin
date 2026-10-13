/** Pure fixed-program simulation. No Electron, Windows, profile or filesystem. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import { test } from "node:test";
import { Script, runInNewContext } from "node:vm";
import { canonicalJson } from "../src/core.ts";
import { buildMainReferenceProgram, validateMainReferenceRequest, validateMainReferenceResult } from "../src/closed-symbol-main-reference-program.ts";
import { compileMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";

const hash = "a".repeat(64), request = { profile: "private.exact-literal-main-reference.v1", nonce: hash, operationId: "easyeda-20261012t000000z-12345678",
  closedPlanSha256: hash, baselineCopyReceiptSha256: hash, baselineLogicalSha256: hash, baselineClosureClockSha256: hash,
  nativePinsSha256: hash, historyUuid: "b".repeat(32), createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: 1_791_806_400_000 };
const nativePath = path.win32, root = nativePath.join(String.raw`C:\Synthetic\Temp`, `easyeda-main-reference-${hash}`);
const appPath = nativePath.join(root, "runtime", "resources", "app");
async function simulate(change?: "version" | "tz" | "request" | "app-path"): Promise<{ exitCode: number; files: Map<string, string> }> {
  const files = new Map<string, string>(), paths = new Map<string, string>();
  const ended = Promise.withResolvers<number>();
  const requestText = canonicalJson(validateMainReferenceRequest(request));
  const requestSha256 = createHash("sha256").update(requestText).digest("hex");
  const values: Record<string, Buffer> = {
    [nativePath.join(appPath, "request.json")]: Buffer.from(change === "request" ? "{}" : requestText),
    [nativePath.join(root, "evidence", "reference-admission.json")]: Buffer.from(JSON.stringify({ profile: "private.main-reference-admission.v1", nonce: hash, pid: 123, requestSha256 })),
  };
  const fs = {
    constants: { O_RDONLY: 0 },
    lstatSync: (): { isDirectory: () => boolean; isSymbolicLink: () => boolean } => ({ isDirectory: (): boolean => true, isSymbolicLink: (): boolean => false }),
    writeFileSync: (file: string, bytes: string | Buffer, options: { flag: string }): void => { assert.equal(options.flag, "wx"); assert.equal(files.has(file), false); files.set(file, String(bytes)); },
    openSync: (file: string): string => { assert.ok(Object.hasOwn(values, file)); return file; },
    fstatSync: (file: string): { isFile: () => boolean; size: number | undefined } => ({ isFile: (): boolean => true, size: values[file]?.length }),
    readFileSync: (file: string): Buffer | undefined => values[file], closeSync: (): void => {
      // In-memory fixture has no retained OS handle.
    },
    existsSync: (file: string): boolean => file === nativePath.join(root, "evidence", "reference-admission.ready"),
  };
  const app = { getName: (): string => "EasyEDA Main Clock Reference", getVersion: (): string => "0.0.0", getAppPath: (): string => change === "app-path" ? String.raw`C:\Wrong` : appPath,
    setPath: (name: string, value: string): void => { paths.set(name, value); }, getPath: (name: string): string | undefined => paths.get(name),
    commandLine: { appendSwitch: (): void => {
      // No browser is launched by this fixture.
    } }, exit: (code: number): void => { ended.resolve(code); } };
  const process = { pid: 123, platform: "win32", versions: { electron: change === "version" ? "41.2.1" : "41.2.1-jlc-sa-win-x64.2", chrome: "146.0.7680.188", node: "24.14.1" },
    resourcesPath: nativePath.join(root, "runtime", "resources"), execPath: nativePath.join(root, "runtime", "easyeda-pro.exe"), env: change === "tz" ? { TZ: "synthetic" } : {},
    argv: ["ignored", `--user-data-dir=${nativePath.join(root, "user-data")}`, "--disable-background-networking", "--no-proxy-server", "--lang=en-US", "--easyeda-clock-reference=once"], on: (): void => {
      // Test failures use the returned run promise.
    } };
  const code = buildMainReferenceProgram(request); assert.ok(new Script(code) instanceof Script);
  runInNewContext(code, { __dirname: appPath, Buffer, Date, process, setTimeout,
    require: (name: string): unknown => {
      // Synthetic values cross the VM boundary; production values share one
      // Node realm. Normalize only this fixture's deep comparison accordingly.
      if (name === "node:assert/strict") { return { ...assert, deepEqual: (a: unknown, b: unknown): void => { assert.equal(canonicalJson(a), canonicalJson(b)); } }; } if (name === "node:fs") { return fs; }
      if (name === "node:path") { return nativePath; } if (name === "node:crypto") { return { createHash }; }
      if (name === "electron") { return { app }; } throw new Error("Unexpected fixed main import");
    } }, { timeout: 1000 });
  return { exitCode: await ended.promise, files };
}
void test("fixed main observes exact literal without renderer or dynamic evaluation", async () => {
  const result = await simulate(); assert.equal(result.exitCode, 0);
  const resultPath = nativePath.join(root, "evidence", "result.json");
  const raw: unknown = JSON.parse(String(result.files.get(resultPath)));
  const observed = validateMainReferenceResult(raw, request); assert.equal(observed.mainReference.sql[0]?.input, request.createdAtLiteral);
  assert.equal(observed.appClockDirectlyObserved, false); assert.equal(observed.executionAuthorized, false);
  const code = buildMainReferenceProgram(request); assert.doesNotMatch(code, /BrowserWindow|eval\(|runInNewContext|executeJavaScript|require\(['"]\.\//u);
});
for (const change of ["version", "tz", "request", "app-path"] as const) {
  void test(`fixed main retains bounded identity before ${change} refusal`, async () => {
    const result = await simulate(change); assert.equal(result.exitCode, 1);
    assert.ok(result.files.has(nativePath.join(root, "evidence", "identity.json"))); assert.ok(result.files.has(nativePath.join(root, "evidence", "failure.json")));
    assert.equal(result.files.has(nativePath.join(root, "evidence", "result.json")), false);
  });
}
for (const [field, value] of [["createdAtLiteral", "2026-02-30 12:00:00"], ["nonce", "../escape"], ["operationId", "arbitrary"], ["historyUuid", "a".repeat(31)],
  ["referenceUtcMs", Number.NaN], ["extra", true], ["createdAtLiteral", "2026-01-15 12:34:56';throw 1;'"]] as const) {
  void test(`fixed input refuses ${field} ${String(value)}`, () => { assert.throws(() => buildMainReferenceProgram({ ...request, [field]: value })); });
}
void test("fixed compiler bounds command/input and preserves unconditional launch refusal", async () => {
  const value = await compileMainReferenceTransport(request); assert.ok(value.command.length <= 30_000); assert.ok(value.stdin.length <= 180_000);
  assert.match(value.command, /throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'/u);
  assert.doesNotMatch(value.command, /ExecutionPolicy|EncodedCommand|Invoke-Expression|ScriptBlock/u);
  assert.equal(value.sourcePins["OwnedSyntheticJob.cs"], "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727");
});
