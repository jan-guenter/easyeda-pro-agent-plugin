/** Original source spans in inert factories. The selected worker transport is
 * a throwing fixture; no EasyEDA, Core owner, native process or Job exists. */
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE } from "../../src/current-footprint-inverse-initialized-get-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as DELETE } from "../../src/current-footprint-inverse-delete-manager-source.ts";

interface Piece { readonly start: number; readonly end: number; readonly prefix: string; readonly suffix: string }
/** Keep UTF16 offsets and newline coordinates while installing only the
 * exact selected factory/function spans and explicitly inert fixture setup. */
function overlay(source: string, pieces: readonly Piece[], intro: string, tail: string): string { let out = intro + source.split("").map(value => value === "\r" || value === "\n" ? value : " ").join("").slice(intro.length); for (const p of pieces.toSorted((a, b) => a.start - b.start)) { out = out.slice(0, p.start - p.prefix.length) + p.prefix + source.slice(p.start, p.end) + p.suffix + out.slice(p.end + p.suffix.length); } return out + tail; }
/** The real initialized UI MessageBus factory keeps its original locations. */
export function footprintInverseNativeRegistrationUiFixture(source: string): string { return overlay(source, [{ start: 1_643_706, end: 1_661_621, prefix: "", suffix: ";" }], "(()=>{let KU;const xe=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};", ";globalThis.inertNativeRegCtor=KU().MessageBus;})()"); }
/** Actual V/DEL/getData/deleteData/K/pw and registry definitions are retained;
 * only the surrounding application and worker are inert fixture values. */
export function footprintInverseNativeRegistrationManagerFixture(source: string): string {
  const factory = { start: 798, end: 18_561, prefix: "", suffix: ";" };
  const pieces: Piece[] = [factory, { start: 1_701_619, end: 1_702_368, prefix: ";", suffix: ";" }, { start: SOURCE.managerProjectGetData.start, end: SOURCE.managerProjectGetData.end, prefix: ";var V0=class{constructor(t){this.project=t}", suffix: "" }, { start: DELETE.method.start, end: DELETE.method.end, prefix: "", suffix: "};" }, ...(["managerApplyArguments", "managerProjectLookup", "managerRegisterService"] as const).map(role => ({ start: SOURCE[role].start, end: SOURCE[role].end, prefix: ";", suffix: ";" })), { start: DELETE.handler.start, end: DELETE.handler.end, prefix: ';Ee={messageBus:globalThis._MSG_BUS_};V("/PrjDB/footprint/delete",', suffix: ");" }];
  let out = overlay(source, pieces, "(()=>{let Li,Ee;const J={footprint:{delete:'/mgr/projectWorker/footprint/delete'}},El=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};", ';let transports=0;const project={uuid:"a".repeat(64),isReady:true,workerBus:{rpcCall(){transports++;throw Error("inert transport must not run")}}};project.footprint=new V0(project);el.tool=new el;el.tool.map.set(project.uuid,project);Object.assign(globalThis.inertNativeReg,{project,registry:el.tool,transports:()=>transports});})();');
  const setup = ';globalThis._MSG_BUS_=new globalThis.inertNativeRegCtor;globalThis.gVars={currentProject:{projectId:"a".repeat(64),branchUuid:"b".repeat(32),isV2Format:false},isHistoryMode:false};globalThis.inertNativeReg={receipt:[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis]};'; const at = factory.end + 1; out = out.slice(0, at) + setup + out.slice(at + setup.length); return out;
}
