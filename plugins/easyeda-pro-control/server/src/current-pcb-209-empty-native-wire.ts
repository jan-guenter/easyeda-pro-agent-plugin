/** Exact own-data encoding for a separate launch-sealed209 purpose. Matching
 * literals grant no session/context/object authority; the original channel does. */
import { types } from "node:util";
import { CURRENT_PCB_209_EMPTY_NATIVE_CASES } from "./current-pcb-209-empty-native-cases.ts";
import type { CurrentPcb209EmptyBaselineNativeCommand } from "./current-pcb-209-empty-native-cases.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE } from "./current-pcb-209-empty-native-profile.ts";
import type { CurrentPcb209EmptyNativeCommand } from "./current-pcb-209-worker-startup-empty-session.ts";
import { currentPcb209WorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function fail(): never { throw new Error("PCB209_EMPTY_NATIVE_WIRE"); }
function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function match(raw: unknown, template: unknown, fields: Record<string, string>): boolean {
  if (typeof template === "string") {
    const dynamic = /^__empty209_(sessionId|uniqueContextId|objectId|argument0|argument1)__$/u.exec(template)?.[1];
    if (dynamic === undefined) { return raw === template; }
    const limit = dynamic === "sessionId" || dynamic === "uniqueContextId" ? 128 : 256;
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
    const dynamic = /^__empty209_(sessionId|uniqueContextId|objectId|argument0|argument1)__$/u.exec(template)?.[1];
    return dynamic === undefined ? template : fields[dynamic];
  }
  if (template === null || typeof template !== "object") { return template; }
  if (Array.isArray(template)) { return template.map((value: unknown) => instantiate(value, fields)); }
  return Object.fromEntries(Object.entries(template).map(([key, value]: [string, unknown]) => [key, instantiate(value, fields)]));
}
export interface CurrentPcb209EmptyNativeWire {
  readonly command: CurrentPcb209EmptyNativeCommand & Readonly<{ id: number }>;
  readonly request: Readonly<Record<string, string | number>>;
}
export function currentPcb209EmptyNativeWire(raw: unknown, id: number): CurrentPcb209EmptyNativeWire {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.requestLimit || !plain(raw)) { return fail(); }
  if (!Object.hasOwn(raw, "commonPhase") && !Object.hasOwn(raw, "rootPhase")) {
    // Canonical1 validates syntax only. No owner is allocated and no command is
    // Sent here. The channel supplies its never-reset, monotonically consumed ID.
    const startup = currentPcb209WorkerStartupWire(raw, 1);
    return freezeDeep({ command: { ...startup.command, id }, request: { ...startup.request, requestId: id } });
  }
  for (const template of CURRENT_PCB_209_EMPTY_NATIVE_CASES) {
    const fields: Record<string, string> = {};
    if (match(raw, template, fields)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact recursive own-data matching against this typed finite template precedes reconstruction using checked handles only.
      const command = instantiate(template, fields) as CurrentPcb209EmptyBaselineNativeCommand;
      const { sessionId, ...handles } = fields;
      if (sessionId === undefined) { return fail(); }
      const phase = "commonPhase" in command ? { action: "worker-startup-empty-common", commonPhase: command.commonPhase } :
        { action: "worker-startup-empty-root", rootPhase: command.rootPhase };
      return freezeDeep({ command: { ...command, id }, request: { ...phase, requestId: id, method: command.method, sessionId, ...handles } });
    }
  }
  return fail();
}
