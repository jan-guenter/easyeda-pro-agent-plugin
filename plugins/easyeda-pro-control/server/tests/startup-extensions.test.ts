import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { STARTUP_EXTENSIONS_BRIDGE_UUID, buildStartupExtensionsProgram, parseStartupExtensionsRequest, queryStartupExtensions,
  validateStartupExtensionsArguments, validateStartupExtensionsResult } from "../src/startup-extensions.ts";

const request = { action: "list-startup-index" };
function row(uuid = STARTUP_EXTENSIONS_BRIDGE_UUID): Record<string, unknown> {
  return { uuid, config: { uuid, name: "authenticated-bridge", version: "0.3.0", entry: "./dist/index",
    activationEvents: { onStartupFinished: true, onLogged: false, onCommands: ["connect", "status"] },
    description: "PRIVATE_CONFIG_NOT_FOR_OUTPUT" }, isEnable: true, isAutoUpdate: false, isOnlineSync: false,
  fileIndex: ["PRIVATE_FILE_NOT_FOR_OUTPUT"], installationTime: "PRIVATE_DATE_NOT_FOR_OUTPUT" };
}

function environment(rows: unknown[] = [row()], options: { before?: string; afterRead?: string; fastDeadline?: boolean } = {}): {
  run: () => Promise<unknown>; evaluate: (source: string) => unknown;
} {
  const context = createContext({ TextEncoder, setTimeout: options.fastDeadline === true ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    assert.equal(delay, 10_000); return setTimeout(callback, 1);
  } : setTimeout, clearTimeout,
  checkTopic: (args: unknown): void => { assert.deepEqual(structuredClone(args), ["extensionApi.getExtensionsIndex"]); } });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.gVars={globalVariableCookieData:{userInfo:{uuid:'11111111111111111111111111111111'}},loginedUserInfo:{uuid:'11111111111111111111111111111111'}};
globalThis.UI={gVars:globalThis.gVars};globalThis.eda={extensionUuid:${JSON.stringify(STARTUP_EXTENSIONS_BRIDGE_UUID)}};
globalThis.rows=${JSON.stringify(rows)};globalThis.calls=0;
class Base {async rpcCall(...args){if(this!==globalThis._MSG_BUS2_EXTAPI_)throw new Error('PRIVATE_WRONG_RECEIVER');checkTopic(args);calls++;await Promise.resolve();${options.afterRead ?? ""}return rows;}}
class Bus extends Base{}globalThis._MSG_BUS2_EXTAPI_=new Bus();
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildStartupExtensionsProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

void test("startup index uses one fixed topic twice, retains order/false/raw entry and excludes unrelated private fields", async () => {
  const second = { ...row("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), isEnable: false };
  const fixture = environment([second, row()]);
  const result = validateStartupExtensionsResult(request, decodeExactReadEnvelope(await fixture.run()));
  assert.equal(fixture.evaluate("calls"), 2);
  assert.equal(result["databaseActorBound"], false);
  assert.equal(result["startupQualified"], false);
  assert.equal(result["startupAuthorized"], false);
  assert.equal(result["builtinInventoryIncluded"], false);
  assert.equal(result["codeContentVerified"], false);
  const output = JSON.stringify(result);
  assert.match(output, /"entry":"\.\/dist\/index"/u);
  assert.match(output, /"onLogged":false/u);
  assert.match(output, /"isEnable":false,"isAutoUpdate":false,"isOnlineSync":false/u);
  assert.ok(output.indexOf("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") < output.indexOf(STARTUP_EXTENSIONS_BRIDGE_UUID));
  assert.equal(output.includes("PRIVATE_"), false);
  assert.equal(output.includes("11111111111111111111111111111111"), false);
  assert.match(output, /Account switching initializes that database asynchronously/u);
  const absent = environment([row()], { before: "delete rows[0].config.activationEvents;" });
  const absentResult = validateStartupExtensionsResult(request, decodeExactReadEnvelope(await absent.run()));
  assert.equal(JSON.stringify(absentResult["extensions"]).includes("activationEvents"), false);
});

void test("startup discovery and parsing admit only the literal action, never execution or builtin completeness", () => {
  assert.equal(validateStartupExtensionsArguments(request)["valid"], true);
  for (const input of [{ action: "list-startup-index", code: "private()" }, { action: "set-status" }, { action: "list-startup-index", uuid: STARTUP_EXTENSIONS_BRIDGE_UUID }]) {
    assert.throws(() => parseStartupExtensionsRequest(input));
    assert.throws(() => buildStartupExtensionsProgram(input));
    assert.equal(validateStartupExtensionsArguments(input)["valid"], false);
  }
  const catalog = queryStartupExtensions({ includeSchemas: true });
  assert.equal(catalog["invocationEnabledByDiscovery"], false);
  assert.equal(catalog["total"], 1);
  assert.match(JSON.stringify(catalog), /inputSchema/u);
  assert.throws(() => queryStartupExtensions({ topic: "other" }));
});

void test("startup index refuses actor/receiver/method drift and unstable samples without replay", async () => {
  for (const afterRead of [
    "gVars.globalVariableCookieData.userInfo={uuid:'11111111111111111111111111111111'};",
    "gVars.loginedUserInfo.uuid='22222222222222222222222222222222';",
    "globalThis._MSG_BUS2_EXTAPI_={};",
    "Base.prototype.rpcCall=async()=>rows;",
    "if(calls===2)rows[0].isAutoUpdate=true;",
  ]) {
    const fixture = environment([row()], { afterRead });
    await assert.rejects(fixture.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
    assert.equal(fixture.evaluate("calls"), afterRead.startsWith("if(calls===2)") ? 2 : 1);
  }
  const wrongBridge = environment([row()], { before: "eda.extensionUuid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';" });
  await assert.rejects(wrongBridge.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
  assert.equal(wrongBridge.evaluate("calls"), 0);
});

void test("startup index bounds projections, refuses malformed/empty data and fixes outward errors and deadline", async () => {
  for (const rows of [[], [row("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")], [row(), row()], Array.from({ length: 129 }, () => row()),
    [{ ...row(), isEnable: "true" }], [{ ...row(), config: { uuid: STARTUP_EXTENSIONS_BRIDGE_UUID, name: "x", version: "0.3.0", entry: "x".repeat(513) } }]]) {
    const fixture = environment(rows);
    await assert.rejects(fixture.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
    assert.equal(fixture.evaluate("calls"), 1);
  }
  const getter = environment([row()], { before: "Object.defineProperty(rows[0],'isEnable',{get(){throw new Error('PRIVATE_GETTER');}});" });
  await assert.rejects(getter.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
  const vendorError = environment([row()], { afterRead: "throw new Error('PRIVATE_VENDOR_ERROR');" });
  await assert.rejects(vendorError.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
  const hung = environment([row()], { afterRead: "return await new Promise(()=>{});", fastDeadline: true });
  await assert.rejects(hung.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
  assert.equal(hung.evaluate("calls"), 1);
  const oversized = environment([row()], { before: "rows[0].config.activationEvents=Object.fromEntries(Array.from({length:32},(_,i)=>['event'+i,Array(32).fill('x'.repeat(128))]));" });
  await assert.rejects(oversized.run(), { message: "STARTUP_EXTENSIONS_READ_FAILED" });
  assert.equal(oversized.evaluate("calls"), 1);
});

void test("startup result validation rejects unknown data, false authority upgrades and inconsistent identities", async () => {
  const raw: unknown = decodeExactReadEnvelope(await environment().run());
  assert.ok(raw !== null && typeof raw === "object");
  const payload = { ...raw };
  for (const invalid of [{ ...payload, databaseActorBound: true }, { ...payload, startupQualified: true }, { ...payload, databaseActorBound: undefined },
    { ...payload, action: "other" }, { ...payload, private: "SECRET" }, { ...payload, extensions: [] }]) {
    assert.throws(() => validateStartupExtensionsResult(request, invalid));
  }
  assert.throws(() => validateStartupExtensionsResult({ action: "set-status" }, payload));
});
