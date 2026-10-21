/** Dormant fixed wire boundary for the one String server-time request. No
 * helper branch calls this until native routing is separately integrated. */
import { types } from "node:util";
import { currentPcbStringActorClockIdentitySchema } from "./current-pcb-string-actor-clock.ts";
import { currentPcbStringServerClockCommand } from "./current-pcb-string-server-clock.ts";
import type { CurrentPcbStringServerClockCommand } from "./current-pcb-string-server-clock.ts";

type Wire = CurrentPcbStringServerClockCommand & Readonly<{ id: number; sessionId: string }>;
function fail(): never { throw new Error("PCB_STRING_SERVER_CLOCK_WIRE"); }
function own(value: unknown, names: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) { return fail(); }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== names.length || keys.some(key => typeof key !== "string" || !names.includes(key))) { return fail(); }
  return Object.fromEntries(names.map(name => {
    const d = Object.getOwnPropertyDescriptor(value, name);
    if (d === undefined || !Object.hasOwn(d, "value")) { return fail(); }
    return [name, d.value as unknown];
  }));
}
function handle(value: unknown, maximum: number): string {
  if (typeof value !== "string" || value.length > maximum || !/^[A-Za-z\d_.:-]+$/u.test(value)) { return fail(); }
  return value;
}
export function currentPcbStringServerClockWire(raw: Record<string, unknown>, id: number): Readonly<{
  command: Wire; request: Readonly<Record<string, unknown>>;
}> {
  const fields = own(raw, ["id", "saveClockPhase", "method", "params", "sessionId"]);
  if (!Number.isSafeInteger(id) || id < 1 || fields["id"] !== id || fields["saveClockPhase"] !== "server-time" ||
    fields["method"] !== "Runtime.callFunctionOn") { return fail(); }
  const params = own(fields["params"], ["functionDeclaration", "uniqueContextId", "arguments", "returnByValue", "throwOnSideEffect",
    "silent", "awaitPromise", "generatePreview", "userGesture"]);
  const args = params["arguments"];
  if (!Array.isArray(args) || types.isProxy(args) || Object.getPrototypeOf(args) !== Array.prototype ||
    args.length !== 2 || Reflect.ownKeys(args).join(",") !== "0,1,length") { return fail(); }
  const values = ["0", "1"].map(key => {
    const d = Object.getOwnPropertyDescriptor(args, key);
    if (d === undefined || !Object.hasOwn(d, "value")) { return fail(); } return own(d.value as unknown, ["value"])["value"];
  });
  const identity = currentPcbStringActorClockIdentitySchema.parse(own(values[0], ["projectUuid", "branchUuid", "documentUuid", "windowTabId"]));
  const workerUserText = values[1];
  if (typeof workerUserText !== "string") { return fail(); }
  const sessionId = handle(fields["sessionId"], 128), uniqueContextId = handle(params["uniqueContextId"], 256);
  const expected = currentPcbStringServerClockCommand(uniqueContextId, identity, workerUserText);
  if (params["functionDeclaration"] !== expected.params.functionDeclaration || params["returnByValue"] !== true ||
    params["throwOnSideEffect"] !== false || params["silent"] !== true || params["awaitPromise"] !== true ||
    params["generatePreview"] !== false || params["userGesture"] !== false) { return fail(); }
  // All scalars, arrays and targets have been copied and checked. Do not run
  // JSON.stringify on caller-owned params or argument objects.
  const command: Wire = { id, saveClockPhase: "server-time", method: expected.method, params: expected.params, sessionId };
  return { command, request: { action: "send", requestId: id, method: expected.method, sessionId, saveClockPhase: "server-time",
    uniqueContextId, saveClockProjectUuid: identity.projectUuid, saveClockBranchUuid: identity.branchUuid,
    saveClockDocumentUuid: identity.documentUuid, saveClockWindowTabId: identity.windowTabId, saveClockWorkerUserText: workerUserText } };
}
