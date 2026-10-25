/** Dormant ratline-only native syntax. A future separate original owner must
 * prove roles, source, session, command order and cumulative budgets. This
 * encoder preserves an issued positive Int32 ID and never allocates one. */
import { types } from "node:util";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "./current-pcb-209-ratline-native-cases.ts";
import type { CurrentPcb209RatlineNativeCommand, CurrentPcb209RatlineNativeRole } from "./current-pcb-209-ratline-native-cases.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function fail(): never { throw new Error("PCB209_RATLINE_NATIVE_WIRE"); }
function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function match(raw: unknown, template: unknown, fields: Record<string, string>): boolean {
  if (typeof template === "string") {
    const dynamic = /^__ratline209_(sessionId|scriptId|callFrameId|breakpointId|objectId|argument0|argument1|argument2|stackTraceId|debuggerId)__$/u.exec(template)?.[1];
    if (dynamic === undefined) { return raw === template; }
    const limit = dynamic === "sessionId" ? 128 : 256;
    if (typeof raw !== "string" || raw.length > limit || !/^[A-Za-z\d_.:-]+$/u.test(raw)) { return false; }
    if (fields[dynamic] !== undefined && fields[dynamic] !== raw) { return false; }
    fields[dynamic] = raw; return true;
  }
  if (template === null || typeof template !== "object") { return Object.is(raw, template); }
  if (raw === null || typeof raw !== "object" || types.isProxy(raw)) { return false; }
  const array = Array.isArray(template);
  if (array ? !Array.isArray(raw) || Object.getPrototypeOf(raw) !== Array.prototype : !plain(raw)) { return false; }
  const actual = Reflect.ownKeys(raw), names = Reflect.ownKeys(template);
  if (names.length !== actual.length || actual.some(key => !names.includes(key))) { return false; }
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(raw, name), expected = Object.getOwnPropertyDescriptor(template, name);
    if (descriptor === undefined || expected === undefined || !Object.hasOwn(descriptor, "value") ||
        descriptor.enumerable !== expected.enumerable || !match(descriptor.value, expected.value, fields)) { return false; }
  }
  return true;
}
function instantiate(template: unknown, fields: Readonly<Record<string, string>>): unknown {
  if (typeof template === "string") {
    const dynamic = /^__ratline209_(sessionId|scriptId|callFrameId|breakpointId|objectId|argument0|argument1|argument2|stackTraceId|debuggerId)__$/u.exec(template)?.[1];
    return dynamic === undefined ? template : fields[dynamic];
  }
  if (template === null || typeof template !== "object") { return template; }
  if (Array.isArray(template)) { return template.map((value: unknown) => instantiate(value, fields)); }
  return Object.fromEntries(Object.entries(template).map(([key, value]: [string, unknown]) => [key, instantiate(value, fields)]));
}
export interface CurrentPcb209RatlineNativeWire {
  readonly command: CurrentPcb209RatlineNativeCommand & Readonly<{ id: number }>;
  readonly request: Readonly<Record<string, string | number>>;
}
export function currentPcb209RatlineNativeWire(role: CurrentPcb209RatlineNativeRole, raw: unknown, id: number): CurrentPcb209RatlineNativeWire {
  if (role !== "pcb" && role !== "worker" || !Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647 || !plain(raw)) { return fail(); }
  for (const entry of CURRENT_PCB_209_RATLINE_NATIVE_CASES) {
    const fields: Record<string, string> = {};
    if (entry.role === role && match(raw, entry.command, fields)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact recursive own-data matching against the typed finite command precedes reconstruction using checked handles only.
      const command = instantiate(entry.command, fields) as CurrentPcb209RatlineNativeCommand;
      return freezeDeep({ command: { ...command, id }, request: { action: "worker-startup-ratline", role, phase: entry.phase,
        requestId: id, method: command.method, ...fields } });
    }
  }
  return fail();
}
