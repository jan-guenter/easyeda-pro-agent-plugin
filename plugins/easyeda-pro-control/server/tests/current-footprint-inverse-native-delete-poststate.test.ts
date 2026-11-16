import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-native-delete-collateral-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCE_KEYS as KEYS } from "../src/current-footprint-inverse-public-preferences-programs.ts";
import {
  currentFootprintInverseNativeDeletePoststateNativeFrame,
  currentFootprintInverseNativeDeletePoststateWire,
  validateCurrentFootprintInverseNativeDeletePoststateCommand,
} from "../src/current-footprint-inverse-native-delete-poststate-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_FLAGS as FLAGS } from "../src/current-footprint-inverse-native-delete-collateral-protocol.ts";

function fixture(): vm.Context {
  const context = vm.createContext({ PROGRAMS, KEYS });
  vm.runInContext(`
    const O=Object,A=Array,F=Function;
    class Storage {}
    const local=O.create(Storage.prototype);
    local[KEYS[0]]="original-first";local[KEYS[1]]="original-second";local.peer="unchanged";
    const read=function(){return globalThis.current;};
    const length=function(){return O.getOwnPropertyNames(this).length;};
    O.defineProperty(globalThis,"Storage",{value:Storage,writable:true,enumerable:true,configurable:true});
    O.defineProperty(globalThis,"localStorage",{get:read,enumerable:true,configurable:true});
    O.defineProperty(Storage.prototype,"length",{get:length,enumerable:true,configurable:true});
    globalThis.current=local;globalThis.original=local;
    globalThis.packet=[O.getOwnPropertyDescriptor,O.getPrototypeOf,O.hasOwn,O.getOwnPropertyNames,O.getOwnPropertySymbols,A.isArray,F.prototype.apply,O.prototype,A.prototype,F.prototype,globalThis];
    globalThis.proof=F("return ("+PROGRAMS.storagePrepare+")")().call(packet,[Storage,read],[Storage.prototype,length],[local]);
    globalThis.reprove=F("return ("+PROGRAMS.storageReprove+")")();
  `, context);
  return context;
}
void test("synthetic Storage fixture proves both selected keys and the original handle remain part of the actual snapshot guard", () => {
  // These are synthetic descriptor shapes. Native constructor/getter metadata
  // And the original caller/owner are independent runtime prerequisites.
  const context = fixture();
  assert.equal(vm.runInContext("reprove.call(packet,proof)", context), 3);
  vm.runInContext("original[KEYS[0]]='changed'", context);
  assert.throws(() => { vm.runInContext("reprove.call(packet,proof)", context); });
  vm.runInContext("original[KEYS[0]]='original-first';globalThis.current=Object.assign(Object.create(Storage.prototype),original)", context);
  assert.throws(() => { vm.runInContext("reprove.call(packet,proof)", context); });
  vm.runInContext("globalThis.current=original;original.peer='changed-peer'", context);
  assert.throws(() => { vm.runInContext("reprove.call(packet,proof)", context); });
});
void test("new poststate wire accepts only the fixed after-read syntax and preserves a distinct V4 marker", () => {
  const command = validateCurrentFootprintInverseNativeDeletePoststateCommand({
    round: "after", phase: "inverse-native-delete-collateral-call", role: "storageReprove",
    method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_reflection",
      functionDeclaration: PROGRAMS.storageReprove, arguments: [{ objectId: "original_proof" }], returnByValue: true },
  });
  assert.throws(() => validateCurrentFootprintInverseNativeDeletePoststateCommand({ ...command, round: "before" }));
  assert.throws(() => validateCurrentFootprintInverseNativeDeletePoststateCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }));
  const wire = currentFootprintInverseNativeDeletePoststateWire(command, 79, "original_session");
  const frame = Buffer.from(JSON.stringify(wire) + String.fromCodePoint(0));
  assert.equal(currentFootprintInverseNativeDeletePoststateNativeFrame(frame, command, "original_session")["action"], "footprint-inverse-native-delete-poststate");
  assert.throws(() => currentFootprintInverseNativeDeletePoststateNativeFrame(Buffer.from(JSON.stringify({ ...wire, inverseNativeDeletePoststate: false }) + String.fromCodePoint(0)), command, "original_session"));
  assert.throws(() => currentFootprintInverseNativeDeletePoststateWire(command, 2_147_483_648, "original_session"));
});
