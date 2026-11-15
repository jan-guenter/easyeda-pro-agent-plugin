/** Fixed single-clock sequence. Original authority belongs only to the
 * same native Job/controller; this observer retains no issuer registry. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, currentFootprintCopyClockRpcV2ArrayObject as objectAt,
  decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result, currentFootprintCopyClockRpcV2ArrayValue as valueAt } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Function as metadata } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { decodeCurrentFootprintCopyClockRegistrationScope as scope } from "./current-footprint-copy-clock-registration-contract.ts";
import type { CurrentFootprintInverseNativeDeleteClockRegistrationData as Registration } from "./current-footprint-inverse-native-delete-clock-registration-collector.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ARM_ROLES as ARMS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_FLAGS as FLAGS,
  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_GROUPS as GROUPS, currentFootprintInverseNativeDeleteClockCondition as condition,
  currentFootprintInverseNativeDeleteClockExpectedSchema as expectedSchema, currentFootprintInverseNativeDeleteClockFrame as expression,
  currentFootprintInverseNativeDeleteClockProgram as program, validateCurrentFootprintInverseNativeDeleteClockCommand as validate } from "./current-footprint-inverse-native-delete-clock-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteClockCommand as Command } from "./current-footprint-inverse-native-delete-clock-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_SITES as SITES } from "./current-footprint-inverse-native-delete-clock-profile.ts";
import type { CurrentFootprintInverseNativeDeleteClockSite as Site } from "./current-footprint-inverse-native-delete-clock-profile.ts";
import { currentFootprintInverseNativeDeleteClockNative as native, currentFootprintInverseNativeDeleteClockPause as pause, currentFootprintInverseNativeDeleteClockPromise as promise } from "./current-footprint-inverse-native-delete-clock-replies.ts";

export interface CurrentFootprintInverseNativeDeleteClockObserverBindings {
  readonly registration: Readonly<Registration>; readonly originalClock: string; readonly accepted: string;
  readonly initialUi: DiagnosticEvent; readonly initialWorker: DiagnosticEvent; readonly entryPoint: string; readonly inheritedUiPoints: Readonly<{ onMessage: string; postReturned: string }>;
  readonly sessions: Readonly<{ worker: string; ui: string }>; readonly scripts: Readonly<{ worker: string; ui: string }>;
  readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>;
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>; readonly qualifyHelper: (command: Command) => Promise<void>;
  readonly retainPoint: (role: typeof ARMS[number], point: string) => void;
  readonly resume: (role: "initial-ui" | "initial-worker" | "push" | "qeReturned" | "dispatch" | "result" | "reply") => Promise<void>;
  readonly next: (role: Exclude<Site, "entry">) => Promise<DiagnosticEvent>;
  readonly control: (phase: "armed" | "complete") => Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteClockData {
  readonly updateTime: number; readonly lexicalOffset: number; readonly replyTopic: string;
  readonly expected: Readonly<z.infer<typeof expectedSchema>>; readonly producerEvent: DiagnosticEvent;
  readonly normal: 70; readonly conditionSources: 6; readonly helpers: 20; readonly resumes: 7; readonly producerHeld: true;
  readonly originalQePromiseFulfilled: true; readonly deleteBodyAuthorized: false; readonly saveAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_SEQUENCE"); } }
function number(value: string | number): number { need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0)); return value; }
function string(value: string | number): string { need(typeof value === "string"); return value; }
const uuid = z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u);
const empty = z.strictObject({});
type Fields = ReturnType<typeof array>;
interface Tuple { readonly id: string; readonly fields: Fields }
export async function observeCurrentFootprintInverseNativeDeleteClock(b: CurrentFootprintInverseNativeDeleteClockObserverBindings): Promise<Readonly<CurrentFootprintInverseNativeDeleteClockData>> {
  let helpers = 0, normal = 0; const points = new Map<typeof ARMS[number], string>();
  const awaitHeld = async (role: Exclude<Site, "entry">): Promise<DiagnosticEvent> => { b.current(); const event = await b.next(role); b.current(); normal += 1; return event; };
  const send = async (input: unknown): Promise<unknown> => { b.current(); const command = validate(input); need((normal += 1) <= 70); const raw = await b.request(command); b.current();
    if (program(command) !== null) { helpers += 1; need(helpers <= 20); await b.qualifyHelper(command); b.current(); } return raw; };
  const props = (role: Extract<Command, { method: "Runtime.getProperties" }>["role"], realm: "worker" | "ui", id: string): Promise<unknown> => send({
    phase: "inverse-native-delete-clock-properties", realm, role, method: "Runtime.getProperties",
    params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const call = (role: keyof typeof PROGRAMS, realm: "worker" | "ui", id: string, args: readonly unknown[]): Promise<unknown> => send({
    phase: "inverse-native-delete-clock-call", realm, role, method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectGroup: GROUPS[realm], objectId: id, functionDeclaration: PROGRAMS[role], arguments: args, returnByValue: role === "expected" || role === "returnReprove" } });
  const tupleRoles = { worker: "worker", expected: "worker", ui: "ui", entry: "entry", push: "push", retainReturn: "returned", returnJoin: "return-join", returnReprove: "worker", dispatch: "dispatch", result: "result", reply: "reply", producer: "producer" } as const;
  const tuple = async (role: keyof typeof PROGRAMS, realm: "worker" | "ui", id: string, args: readonly unknown[], count: number, propertyRole: Extract<Command, { method: "Runtime.getProperties" }>["role"] = tupleRoles[role]): Promise<Tuple> => {
    const captured = result(await call(role, realm, id, args), count); return Object.freeze({ id: captured, fields: array(await props(propertyRole, realm, captured), count) }); };
  const frame = async (role: Exclude<Site, "entry"> | "entry" | "caller", event: DiagnosticEvent, count: number): Promise<string> => {
    const selectedRole = role === "caller" ? "result" : role; const realm = SITES[selectedRole].realm;
    const held = pause(event, selectedRole, b.sessions[realm], b.scripts[realm], selectedRole === "entry" ? b.entryPoint : points.get(selectedRole) ?? "");
    const callFrameId = role === "caller" ? held.caller : held.frame; need(callFrameId !== null);
    return result(await send({ phase: "inverse-native-delete-clock-frame", role, realm, method: "Debugger.evaluateOnCallFrame",
      params: { callFrameId, expression: expression(role), objectGroup: GROUPS[realm], silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } }), count);
  };
  const worker = await tuple("worker", "worker", b.originalClock, [{ objectId: b.accepted }], 16);
  const bundle = array(await props("worker-bundle", "worker", objectAt(worker.fields, 4)), 2);
  const prelude = array(await props("promise-prelude", "worker", objectAt(bundle, 1)), 4);
  native(await props("promise-constructor-before", "worker", objectAt(prelude, 0)), "constructor");
  native(await props("promise-then", "worker", objectAt(prelude, 2)), "then");
  native(await props("promise-species", "worker", objectAt(prelude, 3)), "species");
  const expectedReply = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: expectedSchema }) });
  const expected = expectedReply.parse(await call("expected", "worker", worker.id, [])).result.value;
  need(expected.projectUuid === b.target.projectUuid && expected.branchUuid === b.target.branchUuid && expected.targetUuid === b.target.documentUuid);
  const ui = await tuple("ui", "ui", b.registration.initial, [{ objectId: b.registration.bindings }], 10);
  const workerUuid = uuid.parse(valueAt(worker.fields, 12)); const uiUuid = uuid.parse(valueAt(ui.fields, 8)); need(workerUuid !== uiUuid);
  const entryFrame = await frame("entry", b.initialWorker, 5);
  const entry = await tuple("entry", "worker", entryFrame, [{ objectId: worker.id }, { objectId: b.accepted }, { value: expected }], 4);
  for (const role of ARMS) { const site = SITES[role]; const realm = site.realm;
    const realmUuid = realm === "worker" ? workerUuid : uiUuid;
    const selectedUuid = role === "qeReturned" || role === "producer" ? undefined : realmUuid;
    const allocated = z.strictObject({ breakpointId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),
      actualLocation: z.strictObject({ scriptId: z.literal(b.scripts[realm]), lineNumber: z.literal(site.lineNumber), columnNumber: z.literal(site.columnNumber) }) }).parse(await send({
        phase: "inverse-native-delete-clock-arm", role, realm, method: "Debugger.setBreakpoint", params: { location: { scriptId: b.scripts[realm], lineNumber: site.lineNumber, columnNumber: site.columnNumber },
          condition: condition(role, selectedUuid) } }));
    need(![...points.values()].includes(allocated.breakpointId)); points.set(role, allocated.breakpointId); b.retainPoint(role, allocated.breakpointId);
  }
  need(normal === 19 && { helpers }.helpers === 5); await b.control("armed"); b.current();
  for (const role of ["onMessage", "postReturned"] as const) { empty.parse(await send({ phase: "inverse-native-delete-clock-remove", role, realm: "ui", method: "Debugger.removeBreakpoint", params: { breakpointId: b.inheritedUiPoints[role] } })); }
  await b.resume("initial-ui"); b.current(); normal += 1; await b.resume("initial-worker"); b.current(); normal += 1;
  const pushEvent = await awaitHeld("push"); const pushed = await tuple("push", "worker", await frame("push", pushEvent, 4), [{ objectId: worker.id }, { objectId: worker.id }, { value: 1 }], 9);
  const replyTopic = string(valueAt(pushed.fields, 7)), requestId = number(valueAt(pushed.fields, 8));
  const baselineTicket = number(valueAt(worker.fields, 14));
  need(replyTopic === `_MSG_BUS_RPC_-/pro-mgr/serverTime/now-${  workerUuid  }-${  String(baselineTicket)}`);
  await b.resume("push"); b.current(); normal += 1;
  const returnedEvent = await awaitHeld("qeReturned"); const returnedPause = pause(returnedEvent, "qeReturned", b.sessions.worker, b.scripts.worker, points.get("qeReturned") ?? "");
  need(returnedPause.returned !== null); const returnedFrame = await frame("qeReturned", returnedEvent, 1);
  const retained = await tuple("retainReturn", "worker", returnedPause.returned, [], 3); const actualPromise = objectAt(retained.fields, 0);
  native(await props("return-constructor", "worker", objectAt(retained.fields, 2)), "constructor");
  const returnJoin = await tuple("returnJoin", "worker", returnedFrame, [{ objectId: worker.id }, { objectId: retained.id }], 4);
  promise(await props("promise-pending", "worker", actualPromise), "pending");
  await b.resume("qeReturned"); b.current(); normal += 1;
  const dispatchEvent = await awaitHeld("dispatch");
  await tuple("dispatch", "worker", await frame("dispatch", dispatchEvent, 7), [{ objectId: pushed.id }, { value: uiUuid }], 4);
  await b.resume("dispatch"); b.current(); normal += 1;
  const resultEvent = await awaitHeld("result"); const resultFrame = await frame("result", resultEvent, 8); const caller = await frame("caller", resultEvent, 8);
  const callback = metadata(await props("callback-function", "ui", b.registration.callback), "callback", b.registration.callbackScriptId);
  const lexical = scope(await props("callback-scopes", "ui", callback.scopesId), "callback");
  const returned = await tuple("result", "ui", resultFrame, [{ objectId: ui.id }, { objectId: caller }, { objectId: lexical }, { objectId: ui.id },
    { value: { replyTopic, workerUuid, uiUuid, requestId, ordinal: 1 } }], 8);
  const updateTime = number(valueAt(returned.fields, 3)); const lexicalOffset = number(valueAt(returned.fields, 4));
  need(updateTime > 0 && updateTime <= 8_640_000_000_000_000 && lexicalOffset === b.registration.lexicalOffset &&
    valueAt(returned.fields, 5) === replyTopic && valueAt(returned.fields, 6) === workerUuid && valueAt(returned.fields, 7) === requestId);
  await b.resume("result"); b.current(); normal += 1;
  const replyEvent = await awaitHeld("reply"); const replied = await tuple("reply", "worker", await frame("reply", replyEvent, 6), [{ objectId: pushed.id }, { value: { uiUuid, value: updateTime } }], 4);
  need(valueAt(replied.fields, 3) === updateTime); await b.resume("reply"); b.current(); normal += 1;
  const producerEvent = await awaitHeld("producer");
  await tuple("producer", "worker", await frame("producer", producerEvent, 6), [{ objectId: entry.id }, { objectId: pushed.id }, { value: { value: updateTime } }], 4);
  z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(await call("returnReprove", "worker", returnJoin.id, [{ objectId: worker.id }, { objectId: actualPromise }]));
  promise(await props("promise-fulfilled", "worker", actualPromise), "fulfilled", updateTime);
  for (const role of ["entry", ...ARMS] as const) { const realm = SITES[role].realm; const point = role === "entry" ? b.entryPoint : points.get(role); need(point !== undefined);
    empty.parse(await send({ phase: "inverse-native-delete-clock-remove", role, realm, method: "Debugger.removeBreakpoint", params: { breakpointId: point } })); }
  for (const realm of ["worker", "ui"] as const) { empty.parse(await send({ phase: "inverse-native-delete-clock-release", realm, method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUPS[realm] } })); }
  b.current(); need(normal === 70 && helpers === 20); await b.control("complete"); b.current();
  return Object.freeze({ updateTime, lexicalOffset, replyTopic, expected, producerEvent, normal: 70, conditionSources: 6, helpers: 20, resumes: 7, producerHeld: true,
    originalQePromiseFulfilled: true, deleteBodyAuthorized: false, saveAuthorized: false });
}
