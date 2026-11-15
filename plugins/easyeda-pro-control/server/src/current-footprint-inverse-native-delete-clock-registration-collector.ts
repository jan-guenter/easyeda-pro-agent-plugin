/** Exact readonly selected-service preparation, with four actual helper-source
 * receipts. This data is never an original clock or native execution token. */
import { z } from "zod";
import { decodeCurrentFootprintCopyClockRegistrationNative as native, decodeCurrentFootprintCopyClockRegistrationScope as scope } from "./current-footprint-copy-clock-registration-contract.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Array as array, decodeCurrentFootprintCopyClockRegistrationV2Function as metadata } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { assertCurrentFootprintCopyClockRegistrationV2Function as functionText, qualifyCurrentFootprintCopyClockRegistrationV2Source as qualifySource,
  captureCurrentFootprintCopyClockRegistrationV2SourceReply as sourceReply } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRegistrationV2Role as Role } from "./current-footprint-copy-clock-registration-v2-source.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture as objectId } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_ORDER as ORDER,
  currentFootprintInverseNativeDeleteClockRegistrationKey as key, currentFootprintInverseNativeDeleteClockRegistrationProgram as program,
  validateCurrentFootprintInverseNativeDeleteClockRegistrationCommand as validate } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteClockRegistrationCommand as Command } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";

interface Bindings {
  readonly root: string; readonly projectUuid: string; readonly branchUuid: string; readonly windowTabId: string;
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>; readonly qualifyHelper: (command: Command) => Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteClockRegistrationData {
  readonly initial: string; readonly wrapper: string; readonly callback: string; readonly bindings: string;
  readonly wrapperScriptId: string; readonly callbackScriptId: string; readonly lexicalOffset: number;
  readonly normal: 18; readonly helpers: 4; readonly clockInvoked: false; readonly runtimeOriginIssued: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_SEQUENCE"); } }

/** Complete pinned service files have their own immutable source bound;
 * descriptor packets keep the smaller existing callee limit. */
export function captureCurrentFootprintInverseNativeDeleteClockRegistrationReply(command: Command, raw: unknown): unknown {
  const checked = validate(command);
  return checked.phase === "inverse-native-delete-clock-registration-source" ? sourceReply(checked.role, raw) : capture(raw);
}

/** Keep the original object references and exact selected source copies. Each
 * supplied request is revalidated and each await is enclosed by owner reproof. */
export async function collectCurrentFootprintInverseNativeDeleteClockRegistration(b: Bindings): Promise<Readonly<CurrentFootprintInverseNativeDeleteClockRegistrationData>> {
  let helpers = 0, step = 0;
  const send = async (input: Command): Promise<unknown> => {
    b.current(); const command = validate(input); need(key(command) === ORDER[step]); step += 1;
    const raw = await b.request(command); b.current();
    if (program(command) !== null) { helpers += 1; await b.qualifyHelper(command); b.current(); }
    return captureCurrentFootprintInverseNativeDeleteClockRegistrationReply(command, raw);
  };
  const values = [{ value: b.projectUuid }, { value: b.branchUuid }, { value: b.windowTabId }] as const;
  const properties = (role: Extract<Command, { method: "Runtime.getProperties" }>["role"], id: string): Promise<unknown> => send({
    phase: "inverse-native-delete-clock-registration-properties", role, method: "Runtime.getProperties",
    params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false },
  });
  const initial = objectId(await send({ phase: "inverse-native-delete-clock-registration-initial", method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId: b.root, functionDeclaration: PROGRAMS.initial, arguments: [...values], returnByValue: false } }), 10);
  const first = array(await properties("initial", initial), "initial");
  const wrapper = first[4]; const getter = first[8]; need(wrapper !== undefined && getter !== undefined);
  const sources = new Map<Role, string>();
  const readScope = async (id: string, role: Role, sample: boolean): Promise<string> => {
    const functionRoles = { wrapper: ["wrapper-function", "sample-wrapper-function"], callback: ["callback-function", "sample-callback-function"] } as const;
    const scopeRoles = { wrapper: ["wrapper-scopes", "sample-wrapper-scopes"], callback: ["callback-scopes", "sample-callback-scopes"] } as const;
    const functionRole = functionRoles[role][sample ? 1 : 0], scopesRole = scopeRoles[role][sample ? 1 : 0];
    const selected = metadata(await properties(functionRole, id), role, sources.get(role));
    if (!sample) {
      need(!sources.has(role) && ![...sources.values()].includes(selected.scriptId));
      const raw = await send({ phase: "inverse-native-delete-clock-registration-source", role, method: "Debugger.getScriptSource", params: { scriptId: selected.scriptId } });
      const captured = sourceReply(role, raw); qualifySource(role, captured.scriptSource); sources.set(role, selected.scriptId);
    }
    return scope(await properties(scopesRole, selected.scopesId), role);
  };
  const wrapperScope = await readScope(wrapper, "wrapper", false);
  const callbackPacket = z.strictObject({ result: z.strictObject({ type: z.literal("function"), className: z.literal("Function"),
    description: z.string().max(8192), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) }).parse(await send({
    phase: "inverse-native-delete-clock-registration-callback", method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId: wrapperScope, functionDeclaration: PROGRAMS.callback, arguments: [], returnByValue: false },
  }));
  const callback = callbackPacket.result.objectId; need(callback !== wrapper); functionText("callback", callbackPacket.result.description);
  const callbackScope = await readScope(callback, "callback", false);
  const bindings = objectId(await send({ phase: "inverse-native-delete-clock-registration-bindings", method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId: callbackScope, functionDeclaration: PROGRAMS.bindings,
      arguments: [{ objectId: wrapperScope }, { objectId: initial }, { objectId: callback }, ...values], returnByValue: false } }), 4);
  const bound = array(await properties("bindings", bindings), "bindings"), now = bound[3]; need(now !== undefined && bound[0] === callback);
  native(await properties("now", now), "now"); native(await properties("name", getter), "name");
  const freshWrapper = await readScope(wrapper, "wrapper", true); const freshCallback = await readScope(callback, "callback", true);
  const offset = z.strictObject({ result: z.strictObject({ type: z.literal("number"), value: z.number().int().refine(value => !Object.is(value, -0)) }) }).parse(await send({
    phase: "inverse-native-delete-clock-registration-sample", method: "Runtime.callFunctionOn", params: {
      ...FLAGS, objectId: freshCallback, functionDeclaration: PROGRAMS.sample,
      arguments: [{ objectId: freshWrapper }, { objectId: initial }, { objectId: callback }, { objectId: bindings }, ...values], returnByValue: true,
    },
  })).result.value;
  b.current(); const wrapperScriptId = sources.get("wrapper"); const callbackScriptId = sources.get("callback");
  need(step === 18 && helpers === 4 && wrapperScriptId !== undefined && callbackScriptId !== undefined && wrapperScriptId !== callbackScriptId);
  return Object.freeze({ initial, wrapper, callback, bindings, wrapperScriptId, callbackScriptId, lexicalOffset: offset,
    normal: 18, helpers: 4, clockInvoked: false, runtimeOriginIssued: false });
}
