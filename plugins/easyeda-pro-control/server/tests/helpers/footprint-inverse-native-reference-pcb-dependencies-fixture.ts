/** Qualified original PCB reference body inside inert registration surroundings. */
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE as SOURCE,qualifyCurrentFootprintInverseReferenceQuerySource}from"../../src/current-footprint-inverse-reference-query-source.ts";
import {footprintInverseNativeRegistrationManagerFixture}from"./footprint-inverse-native-registration-fixture.ts";

export {footprintInverseNativeGetTaskUiFixture as footprintInverseNativeReferencePcbUiFixture}from"./footprint-inverse-native-get-task-dependencies-fixture.ts";

/** Copy only the original first-reference callback after the full bundle qualifies. */
export function footprintInverseNativeReferencePcbManagerFixture(source:string):string{
 qualifyCurrentFootprintInverseReferenceQuerySource(source,"manager");const prepared=footprintInverseNativeRegistrationManagerFixture(source);const entry=SOURCE.managerPcbCallback;
 const prefix=';Ee={messageBus:globalThis._MSG_BUS_};V("/PrjDB/pcb/getAllArrDatas",';const suffix=");";
 if(prepared.slice(entry.start-prefix.length,entry.end+suffix.length).trim()!==""){throw new Error("INERT_NATIVE_REFERENCE_PCB_BODY_OVERLAP");}
 return prepared.slice(0,entry.start-prefix.length)+prefix+source.slice(entry.start,entry.end)+suffix+prepared.slice(entry.end+suffix.length);
}
