import { runInNewContext } from "node:vm";
import { buildMainClockReference, buildRendererClockControls, validateClockControls } from "../../src/symbol-clock-controls.ts";
import type { ClockControls } from "../../src/symbol-clock-controls.ts";

type Bag = Record<string, unknown>;
export const BASE = Date.UTC(2026, 9, 12, 12);
export const SCOPE = { createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: BASE };
export const ACTOR = { uuid: "a".repeat(32), username: "synthetic", nickname: "Synthetic" };
export interface Fixture {
  sandbox: Bag; host: Bag; startup: Bag; cached: Bag; env: Bag; methods: Bag; date: object; calls: string[];
  onCall?: (name: string, count: number) => void; run: () => ClockControls;
}
export function fixture(role: "renderer" | "main-reference" = "renderer"): Fixture {
  const cached = { ...ACTOR }, calls: string[] = [], env: Bag = {}, methods: Bag = {}, startup = { ...ACTOR };
  const host = { currentProject: {}, loginedUserInfo: startup, globalVariableCookieData: { userInfo: cached } };
  const sandbox: Bag = { Object, Reflect, Array, process: { env }, UI: { gVars: host }, gVars: host,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { URL: "https://client/editor?cll=warn#", nodeType: 9 },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM" };
  const state: Fixture = { sandbox, host, startup, cached, env, methods, date: {}, calls,
    run(): ClockControls {
      const program = role === "renderer" ? buildRendererClockControls(SCOPE, ACTOR) : buildMainClockReference(SCOPE);
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${program}`, sandbox, { timeout: 1000 });
      return validateClockControls(structuredClone(result), SCOPE, role);
    } };
  let nowCalls = 0;
  function called(name: string): void { calls.push(name); state.onCall?.(name, calls.length); }
  function observedDate(input: number | string): Date { called("constructor"); return new Date(input); }
  const names = ["getTime", "toISOString", "getTimezoneOffset", "getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getSeconds", "getMilliseconds"] as const;
  for (const name of names) {
    const native = Date.prototype[name];
    methods[name] = function method(this: Date): unknown { called(name); const value: unknown = Reflect.apply(native, this, []); return value; };
  }
  Object.defineProperty(observedDate, "prototype", { value: methods });
  Object.defineProperty(observedDate, "now", { configurable: true, writable: true, value(): number { called("now"); const result = BASE + 10 * nowCalls; nowCalls += 1; return result; } });
  sandbox["Date"] = observedDate;
  state.date = observedDate;
  return state;
}
