/** Genuine local V8 Date/parser execution under a synthetic main owner. The
 * supplied process/env object models the main shape and grants no provenance. */
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS } from "../../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM, decodeCurrentFootprintHeadAgeMainObservation } from "../../src/current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeMainObservation } from "../../src/current-footprint-head-age-main.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE } from "../../src/current-footprint-head-age-context.ts";
import { mainBackendFragments } from "./footprint-main-backend-fragments.ts";

/** Exercise the exact fixed selectors and one parser/control program in a
 * separate realm. JSON models inspector's own data-value boundary only. */
export function footprintHeadAgeMainFixture(createdAtLiteral: string): CurrentFootprintHeadAgeMainObservation {
  const context = createContext({});
  runInContext(`const originalProcess={pid:123,versions:{node:"24.14.1"},env:{}},processDescriptor={${CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.getter.text},${CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.setter.text}};let _process=originalProcess;
Object.defineProperty(globalThis,"process",{get:processDescriptor.get,set:processDescriptor.set,enumerable:false,configurable:true});
const u=async function u(t){},xC=function xC(t,e,r){},L3=async function L3(t,e,r=false){},y=async function y(t,e){};
class Driver{async interceptHttpProtocol(e,r,i){}}const backend=new Driver(),session={};backend.cb=(()=>async(r,i)=>{})();
const rl=${mainBackendFragments.dateParser};const source=[u,backend,session,xC,L3,y,Date,Date.now,rl];
const original=(${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS.capture.program}).call(source);
const capturedContext=(${CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM}).call(source,original);
const inner={description:"Closure (setupProcessObject)",object:{_process:originalProcess}},outer={description:"Closure",object:{process:originalProcess,globalThis}};
const contextBinding=(${CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM}).call(inner,outer,inner,outer,capturedContext,123);
const held=(${CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM}).call(source,original,contextBinding);`, context);
  const wallEpochMs = Date.parse(`${createdAtLiteral.replace(" ", "T")}Z`);
  const text: unknown = runInContext(`JSON.stringify((${CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM}).call(held,${JSON.stringify(createdAtLiteral)},${String(wallEpochMs)}))`, context);
  if (typeof text !== "string") { throw new TypeError("HEAD_AGE_SYNTHETIC_FIXTURE_REPLY"); }
  const packet: unknown = JSON.parse(text); return decodeCurrentFootprintHeadAgeMainObservation(packet, createdAtLiteral);
}
