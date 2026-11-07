/** Exact209 cold-load sites. Positions were checked with an inert Node24
 * Inspector compilation of the original method definitions, never invoked. */
import { qualifyCurrentGeneratedProjectReopenCacheSource } from "./current-generated-project-reopen-cache-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVED_LOAD_SITES = freezeDeep({
  branch: { lineNumber: 110, columnNumber: 95_442, expression: "[this,u,h]", length: 3, functionName: "open", functionLine: 110, functionColumn: 94_422, count: 1 },
  cold: { lineNumber: 110, columnNumber: 96_527, expression: "[this,this.historyIndex]", length: 2, functionName: "open", functionLine: 110, functionColumn: 94_422, count: 1 },
  histories: { lineNumber: 110, columnNumber: 115_026, expression: "[this,s,r]", length: 3, functionName: "openInCloud", functionLine: 110, functionColumn: 114_881, count: 1 },
  fetchEntry: { lineNumber: 109, columnNumber: 3072, expression: "[e,t,s,r,i,fetch]", length: 6, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 2 },
  response: { lineNumber: 109, columnNumber: 3186, expression: "[e,t,s,r,i,a,fetch]", length: 7, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 2 },
  bytes: { lineNumber: 109, columnNumber: 3342, expression: "[e,t,s,r,i,a,o,fetch]", length: 8, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 2 },
  plaintext: { lineNumber: 109, columnNumber: 3573, expression: "[e,t,s,r,i,a,o,g,fetch]", length: 9, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 2 },
  parsed: { lineNumber: 110, columnNumber: 115_562, expression: "[this,s,r]", length: 3, functionName: "openInCloud", functionLine: 110, functionColumn: 114_881, count: 1 },
  ready: { lineNumber: 110, columnNumber: 97_262, expression: "[this]", length: 1, functionName: "open", functionLine: 110, functionColumn: 94_422, count: 1 },
  warm: { lineNumber: 110, columnNumber: 114_127, expression: "[this]", length: 1, functionName: "openInLocal", functionLine: 110, functionColumn: 114_106, count: 0 },
  pending: { lineNumber: 110, columnNumber: 7585, expression: "[this]", length: 1, functionName: "getUploadedData", functionLine: 110, functionColumn: 7568, count: 0 },
  fallback: { lineNumber: 109, columnNumber: 3622, expression: "[e,t,s,r,i]", length: 5, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 0 },
  failed: { lineNumber: 109, columnNumber: 3860, expression: "[e,t,s,r,i]", length: 5, functionName: "mg", functionLine: 109, functionColumn: 3038, count: 0 },
});
export type CurrentPcbViaSavedLoadRole = keyof typeof CURRENT_PCB_VIA_SAVED_LOAD_SITES;
export const CURRENT_PCB_VIA_SAVED_LOAD_ROLES = Object.freeze(["branch", "cold", "histories", "fetchEntry", "response", "bytes", "plaintext", "parsed", "ready", "warm", "pending", "fallback", "failed"] as const);
export const CURRENT_PCB_VIA_SAVED_LOAD_READ_ROLES = Object.freeze(["branch", "cold", "histories", "fetchEntry", "response", "bytes", "plaintext", "parsed", "ready"] as const);
export function qualifyCurrentPcbViaSavedLoadSource(source: unknown): void { qualifyCurrentGeneratedProjectReopenCacheSource(source); }

export const CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS = freezeDeep({
  update: { name: "d", arity: 1, lineNumber: 110, columnNumber: 6589 },
  end: { name: "", arity: 0, lineNumber: 110, columnNumber: 115_394 },
});
