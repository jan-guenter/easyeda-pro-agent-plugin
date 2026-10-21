/** Private fixed actor/clock wire grammar. Its phase selects only one reviewed
 * function; the native owner still routes the original realm/session. */
import { types } from "node:util";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS, CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES,
  currentPcbStringActorClockIdentitySchema } from "./current-pcb-string-actor-clock.ts";
import type { CurrentPcbStringActorClockCommand, CurrentPcbStringActorClockIdentity } from "./current-pcb-string-actor-clock.ts";

export type CurrentPcbStringActorClockWireCommand = CurrentPcbStringActorClockCommand & Readonly<{ id: number; sessionId: string }>;
function fail(): never { throw new Error("PCB_DIAGNOSTIC_OUTBOUND_FRAME"); }
function own(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return fail(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== names.length ||
      keys.some(key => typeof key !== "string" || !names.includes(key))) { return fail(); }
  return Object.fromEntries(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return fail(); }
    return [name, descriptor.value as unknown];
  }));
}
function handle(input: unknown, maximum: number): string {
  if (typeof input !== "string" || input.length > maximum || !/^[A-Za-z\d_.:-]+$/u.test(input)) { return fail(); }
  return input;
}
export function currentPcbStringActorClockWire(raw: Record<string, unknown>, id: number):
Readonly<{ command: CurrentPcbStringActorClockWireCommand; request: Readonly<Record<string, unknown>> }> {
  const fields = own(raw, ["id", "method", "params", "sessionId", "actorClockPhase"]);
  if (!Number.isSafeInteger(id) || id < 1 || fields["id"] !== id || fields["method"] !== "Runtime.callFunctionOn") { return fail(); }
  const phase = CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES.find(value => value === fields["actorClockPhase"]);
  if (phase === undefined) { return fail(); }
  const params = own(fields["params"], ["functionDeclaration", "uniqueContextId", "arguments", "returnByValue", "throwOnSideEffect",
    "silent", "awaitPromise", "generatePreview", "userGesture"]);
  const sessionId = handle(fields["sessionId"], 128), uniqueContextId = handle(params["uniqueContextId"], 256);
  const args = params["arguments"];
  if (!Array.isArray(args) || types.isProxy(args) || Reflect.ownKeys(args).length !== (phase === "pcb" ? 1 : 2) ||
      args.length !== (phase === "pcb" ? 0 : 1)) { return fail(); }
  let target: CurrentPcbStringActorClockIdentity | null = null;
  if (phase !== "pcb") {
    const descriptor = Object.getOwnPropertyDescriptor(args, "0");
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return fail(); }
    const argument = own(descriptor.value as unknown, ["value"]);
    const parsed = currentPcbStringActorClockIdentitySchema.safeParse(own(argument["value"],
      ["projectUuid", "branchUuid", "documentUuid", "windowTabId"]));
    if (!parsed.success) { return fail(); } target = parsed.data;
  }
  const command: CurrentPcbStringActorClockWireCommand = { id, actorClockPhase: phase, method: "Runtime.callFunctionOn",
    params: { functionDeclaration: CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS[phase], uniqueContextId,
      arguments: target === null ? [] : [{ value: target }], returnByValue: true, throwOnSideEffect: true,
      silent: true, awaitPromise: false, generatePreview: false, userGesture: false }, sessionId };
  if (JSON.stringify(params) !== JSON.stringify(command.params)) { return fail(); }
  return { command, request: { action: "send", requestId: id, method: command.method, sessionId, actorClockPhase: phase, uniqueContextId,
    ...(target === null ? {} : { actorProjectUuid: target.projectUuid, actorBranchUuid: target.branchUuid,
      actorDocumentUuid: target.documentUuid, actorWindowTabId: target.windowTabId }) } };
}
