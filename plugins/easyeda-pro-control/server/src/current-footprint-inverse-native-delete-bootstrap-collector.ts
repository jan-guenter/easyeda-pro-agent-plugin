/** Independent UI I11 capture for a fresh native-equivalent inverse. It reads
 * no old public Call/backup and grants no sender invocation or worker Job. */
import { CURRENT_FOOTPRINT_INVERSE_UI_OWN_DATA_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_UI_OWN_DATA_PROGRAMS as P } from "./current-footprint-inverse-ui-own-data-protocol.ts";
import { currentFootprintInverseNativeDeleteBootstrapCases as cases, validateCurrentFootprintInverseNativeDeleteBootstrapCommand as validate } from "./current-footprint-inverse-native-delete-bootstrap-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteBootstrapCommand as Command } from "./current-footprint-inverse-native-delete-bootstrap-protocol.ts";
import { currentFootprintInverseDeleteRpcTrue as truth, currentFootprintInverseDeleteRpcObject as tupleId } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as bound, currentFootprintCopyClockRpcV2ArrayObject as object } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseOwnDataParent as parent, currentFootprintInverseOwnDataProperty as property } from "./current-footprint-inverse-own-data-replies.ts";
import { currentNativeOwnDataCallable as callable, qualifyCurrentNativeOwnDataFunction as native } from "./current-native-own-data-intrinsics.ts";

interface Bindings { readonly uniqueContextId: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown> }
export interface CurrentFootprintInverseNativeDeleteBootstrapReceipt { readonly tuple: string; readonly root: string; readonly packets: readonly unknown[]; readonly senderInvoked: false; readonly runtimeJobIssued: false }
/** Reject a failed inverse native delete bootstrap sequence predicate with its fixed refusal code. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_BOOTSTRAP_SEQUENCE"); } }

/** Execute the exact nineteen readonly primitive requests. Native function
 * metadata and literal-derived prototype identity precede the final binding;
 * Core independently correlates and checks all four helper source receipts. */
export async function collectCurrentFootprintInverseNativeDeleteBootstrap(b: Bindings): Promise<Readonly<CurrentFootprintInverseNativeDeleteBootstrapReceipt>> {
  let step = 0; const packets: unknown[] = []; const order = cases().slice(0, 19).map(c => c.phase);
  const send = async (input: Command): Promise<unknown> => { b.current(); const c = validate(input); need(c.phase === order[step]); step += 1; const raw = await b.request(c); b.current(); packets.push(raw); return raw; };
  const props = (role: string, objectId: string): Promise<unknown> => send(validate({ phase: `inverse-native-delete-bootstrap-properties-${role}`, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  const call = (role: "identities" | "bind" | "reprove", objectId: string, refs: readonly string[]): Promise<unknown> => send(validate({ phase: `inverse-native-delete-bootstrap-${role}`, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: P[role], arguments: refs.map(id => ({ objectId: id })), returnByValue: role !== "bind" } }));
  const literal = tupleId(await send({ phase: "inverse-native-delete-bootstrap-literal", method: "Runtime.callFunctionOn", params: { ...FLAGS, uniqueContextId: b.uniqueContextId, functionDeclaration: P.literal, arguments: [], returnByValue: false } }), 4); const raw = await props("literal", literal); const values = array(raw, 4); const root = object(values, 0); const objectLiteral = object(values, 1); const functionLiteral = object(values, 3);
  need(values.get("0")?.type === "object" && values.get("0")?.subtype === undefined && values.get("1")?.type === "object" && values.get("1")?.className === "Object" && values.get("1")?.subtype === undefined && values.get("2")?.subtype === "array" && values.get("3")?.type === "function");
  const objectProto = parent(await props("object-literal", objectLiteral), "object", true); const arrayProto = parent(raw, "array"); const functionProto = parent(await props("function-literal", functionLiteral), "function");
  const objectMembers = await props("object-prototype", objectProto); const arrayMembers = await props("array-prototype", arrayProto); const functionMembers = await props("function-prototype", functionProto); const objectCtor = property(objectMembers, "constructor", "constructor"); const arrayCtor = property(arrayMembers, "constructor", "constructor");
  need(objectCtor.description === "function Object() { [native code] }" && arrayCtor.description === "function Array() { [native code] }" && objectCtor.objectId !== undefined && arrayCtor.objectId !== undefined);
  const objectMethods = await props("object-constructor", objectCtor.objectId); const arrayMethods = await props("array-constructor", arrayCtor.objectId); const functions = ["getOwnPropertyDescriptor", "getPrototypeOf", "hasOwn", "getOwnPropertyNames", "getOwnPropertySymbols"].map(name => property(objectMethods, name, "method")); const selected = [...functions, property(arrayMethods, "isArray", "method"), property(functionMembers, "apply", "method")]; const refs: string[] = [];
  for (const [index, fn] of selected.entries()) { const id = callable({ result: fn }, index); refs.push(id); const command = validate({ phase: `inverse-native-delete-bootstrap-native-${String(index)}`, method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); const nativePacket = await send(command); native(nativePacket, index); }
  const actualObject = property(objectMethods, "prototype", "prototype"); const actualArray = property(arrayMethods, "prototype", "prototype"); need(actualObject.objectId !== undefined && actualArray.objectId !== undefined);
  truth(await call("identities", root, [objectProto, arrayProto, functionProto, actualObject.objectId, actualArray.objectId, parent(objectMethods, "function"), parent(arrayMethods, "function")])); const tuple = bound(await call("bind", root, [...refs, objectProto, arrayProto, functionProto, root]), 11); truth(await call("reprove", tuple, [])); need(step === 19 && packets.length === 19); b.current();
  return Object.freeze({ tuple, root, packets: Object.freeze([...packets]), senderInvoked: false, runtimeJobIssued: false });
}
