import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { isRecord } from "../../src/core.ts";
import { fixture, marker, seed } from "./storage-marker-fixture.ts";
import type { Bag } from "./storage-marker-fixture.ts";
import { buildStartupProgram } from "../../src/closed-symbol-startup-program.ts";
import type { StartupInput, StartupPhase } from "../../src/closed-symbol-startup-program.ts";

export function startupFixture(phase: StartupPhase = "baseline-marker-create"): {
  state: ReturnType<typeof fixture>; input: StartupInput; registrations: { value: unknown; count: number };
  rpc: { value: unknown; count: number }; actor: Bag; run: (iframe?: boolean) => Promise<Record<string, unknown>>;
} {
  const actor = { uuid: "e".repeat(32), username: "Synthetic", nickname: "Synthetic" }, state = fixture();
  const registrations = { value: [] as unknown, count: 0 }, rpc = { value: { message: false } as unknown, count: 0 };
  const prototype: unknown = Object.getPrototypeOf(state.controller); assert.ok(isRecord(prototype));
  Object.defineProperty(prototype, "getRegistrations", { configurable: true, value(): Promise<unknown> {
    assert.equal(this, state.controller); registrations.count += 1; return Promise.resolve(registrations.value);
  } });
  state.host["loginedUserInfo"] = actor;
  state.host["globalVariableCookieData"] = { userInfo: { ...actor } };
  state.tabs["hasTabUnSaved"] = (): boolean => false;
  state.tabs["isTabUnSaved"] = (): boolean => false;
  state.host["messageBus"] = { rpcCall(route: unknown, args: unknown): Promise<unknown> {
    assert.equal(route, "/pro-mgr/hasProject"); assert.equal(JSON.stringify(args), JSON.stringify(["b".repeat(64)]));
    rpc.count += 1; return Promise.resolve(rpc.value);
  } };
  if (phase !== "baseline-marker-create") { seed(state); }
  const input: StartupInput = { phase, projectUuid: "b".repeat(64), branchUuid: "d".repeat(32), ownerUuid: actor.uuid,
    marker: { namespaceNonce: marker.namespaceNonce, keyNonce: marker.keyNonce, bodyNonce: marker.bodyNonce } };
  return { state, input, registrations, rpc, actor,
    async run(iframe = false): Promise<Record<string, unknown>> {
      const code = buildStartupProgram(input);
      const result: unknown = runInNewContext(`globalThis.top=${iframe ? "{}" : "globalThis"};globalThis.window=globalThis;globalThis.document.defaultView=globalThis;(async()=>{${code}})()`, state.sandbox, { timeout: 1000 });
      const returned: unknown = structuredClone(await result);
      assert.ok(isRecord(returned)); return returned;
    } };
}
