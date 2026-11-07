/** Via-only main structure slots reuse the original selected-file cursor.
 * Actual callback ownership and a held source frame are separate authorities. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_SELECT_SQL as SELECT, CURRENT_PROJECT_STRUCTURE_MAIN_UPDATE_SQL as UPDATE } from "./current-project-structure-main-programs.ts";

export const CURRENT_PCB_VIA_MAIN_STRUCTURE_FINAL_FUNCTION = Object.freeze({ start: 1_426_695, end: 1_426_811, bytes: 116,
  sha256: "21a0e30b9c71d80561c3cd19be7a0dfc7232c800554eb3729d338bcba1f40c8b", functionLine: 1164, functionColumn: 53_161, name: "final", length: 1,
  source: 'n=>{try{r.trace("write","final"),this.initResponseWhenNotReady(e,s,r),a&&a.push("",!0),i.close(),n()}catch(o){n(o)}}' });
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES = freezeDeep({
  context: { lineNumber: 1164, columnNumber: 2540, functionLine: 1164, functionColumn: 2434, name: "", expression: "[this,r,i,s]", length: 4 },
  controller: { lineNumber: 8573, columnNumber: 7096, functionLine: 8573, functionColumn: 6777, name: "update", expression: "[this,this.ctx,this.service,this.path]", length: 4 },
  query: { lineNumber: 1025, columnNumber: 2851, functionLine: 1025, functionColumn: 2771, name: "queryOne", expression: "[this,e,r,i]", length: 4 },
  selected: { lineNumber: 8573, columnNumber: 5530, functionLine: 8573, functionColumn: 5500, name: "updateStructure", expression: "[this,e,r,i,s]", length: 5 },
  update: { lineNumber: 8573, columnNumber: 6192, functionLine: 8573, functionColumn: 6035, name: "BB", expression: "[t,e,r,i,s,a]", length: 6 },
  exec: { lineNumber: 1025, columnNumber: 3166, functionLine: 1025, functionColumn: 2980, name: "exec", expression: "[this,e,r,i]", length: 4 },
  callback: { lineNumber: 1025, columnNumber: 895, functionLine: 1025, functionColumn: 891, name: "", expression: "[this,o,e,r,a,n,sc,F5]", length: 8 },
  updateReturned: { lineNumber: 8573, columnNumber: 6318, functionLine: 8573, functionColumn: 6035, name: "BB", expression: "[t,e,r,i,s,a]", length: 6 },
  serviceReturned: { lineNumber: 8573, columnNumber: 5582, functionLine: 8573, functionColumn: 5500, name: "updateStructure", expression: "[this,e,r,i,s]", length: 5 },
  controllerReturned: { lineNumber: 8573, columnNumber: 7163, functionLine: 8573, functionColumn: 6777, name: "update", expression: "[this,this.ctx,this.service,this.path]", length: 4 },
  response: { lineNumber: 1164, columnNumber: 2587, functionLine: 1164, functionColumn: 2434, name: "", expression: "[this,r,i,s]", length: 4 },
  finalEntry: { lineNumber: 1164, columnNumber: 53_169, functionLine: 1164, functionColumn: 53_161, name: "final", expression: "[this,e,r,i,s,a,n]", length: 7 },
  finalReturned: { lineNumber: 1164, columnNumber: 53_276, functionLine: 1164, functionColumn: 53_161, name: "final", expression: "[this,e,r,i,s,a,n]", length: 7 },
  finalFailed: { lineNumber: 1164, columnNumber: 53_271, functionLine: 1164, functionColumn: 53_161, name: "final", expression: "[this,e,r,i,s,a,n,o]", length: 8 },
});
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_CALLERS = freezeDeep({
  driver: { lineNumber: 1164, functionColumn: 2434, name: "", expression: "[this,r,i]", length: 3 },
  driverCaller: { lineNumber: 1164, functionColumn: 51_072, name: "interceptHttpProtocol", expression: "[this,s,a]", length: 3 },
  queryCaller: { lineNumber: 8573, functionColumn: 5651, name: "hC", expression: "[t,e,r,i]", length: 4 },
  run: { lineNumber: 1025, functionColumn: 859, name: "", expression: "[this,e,r,a,n,sc,F5]", length: 7 },
  runCaller: { lineNumber: 1025, functionColumn: 2980, name: "exec", expression: "[this,e,r,i]", length: 4 },
});
const routeCondition = String.raw`(function(){try{if(r===null||typeof r!=="object")return true;const d=Object.getOwnPropertyDescriptor(r,"pureUrl");if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="string")return true;return /^\/api\/v4\/projects\/[a-f0-9]{64}\/branches\/[a-f0-9]{32}\/structures$/.test(d.value);}catch{return true;}})()`;
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_CONDITIONS = Object.freeze({ context: routeCondition, response: routeCondition,
  query: `(function(){try{return typeof r!=="string"||r===${JSON.stringify(SELECT)};}catch{return true;}})()`,
  exec: `(function(){try{return typeof r!=="string"||r===${JSON.stringify(UPDATE)};}catch{return true;}})()` });
