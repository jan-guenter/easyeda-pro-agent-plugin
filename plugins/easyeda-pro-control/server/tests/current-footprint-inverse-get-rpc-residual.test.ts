/** Exact installed initialized factories with inert transport and timer stubs.
 * Native Promise behavior here issues no original-owner completion grant. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { currentFootprintInverseLookupIdentity } from "../src/current-footprint-inverse-lookup-identity.ts";
import { currentFootprintInverseGetRpcEntryCases, validateCurrentFootprintInverseGetRpcEntryCommand } from "../src/current-footprint-inverse-get-rpc-entry-protocol.ts";
import { currentFootprintInverseLookupPreentryCases, validateCurrentFootprintInverseLookupPreentryCommand } from "../src/current-footprint-inverse-lookup-preentry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE, qualifyCurrentFootprintInverseInitializedGetSource, requireCurrentFootprintInverseInitializedGetDescription } from "../src/current-footprint-inverse-initialized-get-source.ts";

void test("sealed factory target projects only its three CDP identity fields under the unchanged strict grammars", () => {
  const sealed = Object.freeze({ rawWindowsPath: "C:\\disposable\\fixture.eprj2", expectedSourceSha256: "d".repeat(64), projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) });
  const identity = currentFootprintInverseLookupIdentity(sealed); assert.deepEqual(identity, { projectUuid: sealed.projectUuid, branchUuid: sealed.branchUuid, documentUuid: sealed.documentUuid }); assert.equal(Object.isFrozen(identity), true);
  for (const [cases, validate] of [[currentFootprintInverseGetRpcEntryCases(), validateCurrentFootprintInverseGetRpcEntryCommand], [currentFootprintInverseLookupPreentryCases(), validateCurrentFootprintInverseLookupPreentryCommand]] as const) {
    const commands = cases.filter(command => command.method === "Runtime.callFunctionOn" && command.params.arguments.some(argument => "value" in argument && argument.value !== null && typeof argument.value === "object" && "documentUuid" in argument.value)); assert.ok(commands.length >= 2);
    for (const command of commands) { assert.equal(command.method, "Runtime.callFunctionOn"); if (command.method !== "Runtime.callFunctionOn") { throw new Error("call"); } const replace = (value: unknown): unknown => ({ ...command, params: { ...command.params, arguments: command.params.arguments.map(argument => "value" in argument ? { value } : argument) } }); assert.doesNotThrow(() => validate(replace(identity))); assert.throws(() => validate(replace(sealed))); }
  }
});

interface Timer { readonly callback: () => unknown; readonly delay: number }
interface Fixture {
  readonly bus: { readonly subscribed: Record<string, readonly unknown[]>; readonly pulled: Record<string, readonly unknown[]>; readonly pushed: Record<string, readonly unknown[]>; readonly rpcTicket: number; readonly rpcCall: (topic: string, args: readonly string[]) => Promise<unknown> };
  readonly resolveRow: (value: unknown) => void;
  readonly calls: () => number;
  readonly isNativeReject: (callback: () => unknown) => boolean;
}
function fixtureShape(value: unknown): value is Fixture {
  if (value === null || typeof value !== "object" || !("bus" in value) || value.bus === null || typeof value.bus !== "object" || !("resolveRow" in value) || typeof value.resolveRow !== "function" || !("calls" in value) || typeof value.calls !== "function" || !("isNativeReject" in value) || typeof value.isNativeReject !== "function") { return false; }
  const bus = value.bus;
  return "subscribed" in bus && bus.subscribed !== null && typeof bus.subscribed === "object" && "pulled" in bus && bus.pulled !== null && typeof bus.pulled === "object" && "pushed" in bus && bus.pushed !== null && typeof bus.pushed === "object" && "rpcTicket" in bus && typeof bus.rpcTicket === "number" && "rpcCall" in bus && typeof bus.rpcCall === "function";
}
function fixture(source: string, profile: "ui" | "manager", timers: Timer[], errors: unknown[]): Fixture {
  const scope = vm.createContext({ Blob, FormData, crypto: { randomUUID: (): string => "11111111-2222-3333-4444-555555555555" }, console: { error: (value: unknown): void => { errors.push(value); }, debug: (): void => { throw new Error("missing original GET subscription"); } }, setTimeout: (callback: () => unknown, delay: number): number => { timers.push({ callback, delay }); return timers.length; } });
  const alias = profile === "ui" ? "KU" : "Li"; const loader = profile === "ui" ? "xe" : "El"; const start = profile === "ui" ? 1_643_706 : 798; const end = profile === "ui" ? 1_661_621 : 18_561;
  const intro = `(()=>{let ${alias};const ${loader}=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};globalThis.self=globalThis;`;
  const program = `${intro + source.slice(0, start).replaceAll(/[^\r\n]/gu, " ").slice(intro.length) + source.slice(start, end)  };const bus=new(${alias}().MessageBus);let resolveRow,calls=0;const response=new Promise(resolve=>{resolveRow=resolve});bus.rpcService('/PrjDB/footprint/getData',()=>{calls++;return response});globalThis.result={bus,resolveRow,calls:()=>calls,isNativeReject:callback=>Object.getPrototypeOf(callback)===Function.prototype&&callback.name===''&&callback.length===1&&Function.prototype.toString.call(callback)==='function () { [native code] }'};})();`;
  new vm.Script(program, { filename: `inert-original-${profile}-rpc-timer.js` }).runInContext(scope);
  const result: unknown = Reflect.get(scope, "result"); assert.ok(fixtureShape(result)); return result;
}
void test("actual initialized RPC re-arms its selected reply before the dropped native race timeout fires", async context => {
  assert.equal(process.versions.node, "24.18.0");
  for (const profile of ["ui", "manager"] as const) {
    const path = profile === "ui" ? "pro-ui/3.2.198.2800f583/js/ui.js" : "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js";
    let source: string; try { source = await readFile(`/mnt/c/Program Files/easyeda-pro/resources/app/assets/${path}`, "utf8"); } catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return; } throw error; }
    qualifyCurrentFootprintInverseInitializedGetSource(source, profile);
    const role = profile === "ui" ? "uiBusRpcCall" : "managerBusRpcCall"; const row = SOURCE[role]; requireCurrentFootprintInverseInitializedGetDescription(source.slice(row.descriptionStart, row.end), role);
    const timers: Timer[] = []; const errors: unknown[] = []; const original = fixture(source, profile, timers, errors); const service = original.bus.subscribed["/PrjDB/footprint/getData"]; assert.ok(service !== undefined && service.length === 1); const serviceTask = service[0]; const serviceCallback: unknown = Object.getOwnPropertyDescriptor(serviceTask, "callback")?.value;
    const pending = original.bus.rpcCall("/PrjDB/footprint/getData", ["c".repeat(16), "a".repeat(64)]); assert.equal(original.calls(), 1); assert.equal(original.bus.rpcTicket, 1); assert.equal(timers.length, 1); const timer = timers[0]; assert.ok(timer !== undefined); assert.equal(timer.delay, 300_000); assert.equal(original.isNativeReject(timer.callback), true);
    const reply = Object.keys(original.bus.pulled); assert.equal(reply.length, 1); assert.equal(reply[0], "_MSG_BUS_RPC_-/PrjDB/footprint/getData-11111111222233334444555555555555-0"); assert.equal(original.bus.pulled[reply[0] ?? ""]?.length, 1); assert.deepEqual(Object.keys(original.bus.pushed), []);
    const raw = Object.freeze({ result: "inert row" }); original.resolveRow(raw); const result = await pending; assert.ok(result !== null && typeof result === "object" && "message" in result); assert.deepEqual(structuredClone(result.message), raw); assert.equal(Object.hasOwn(result, "bridge"), true); assert.equal(Object.hasOwn(result, "source"), true);
    assert.deepEqual(Object.keys(original.bus.pulled), []); assert.deepEqual(Object.keys(original.bus.pushed), []); assert.equal(original.bus.subscribed["/PrjDB/footprint/getData"], service); assert.equal(service[0], serviceTask); assert.equal(Object.getOwnPropertyDescriptor(serviceTask, "callback")?.value, serviceCallback);
    // The actual source drops this timer ID. The production residual is not
    // Called cancelled or drained merely because the selected RPC fulfilled.
    assert.equal(timer.callback(), undefined); await Promise.resolve(); await Promise.resolve(); assert.equal(await pending, result); assert.equal(original.calls(), 1); assert.equal(original.bus.rpcTicket, 1); assert.deepEqual(errors, []); assert.deepEqual(Object.keys(original.bus.pulled), []); assert.deepEqual(Object.keys(original.bus.pushed), []);
  }
});
