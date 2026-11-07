/** Actual209 Save producer sites. Source qualification proves bytes and fixed
 * locations, never a suspended worker, invocation, clock or SQL authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_DISPLAY_SAVE_SOURCE = freezeDeep({ relativePath: "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
  bytes: 2_181_308, sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046",
  saveCanvas: { start: 2_144_996, end: 2_145_566, bytes: 570, sha256: "689bf1d38385331693dcfb9b28887ce2a46ada8b077495616f0e703d0a802178",
    functionName: "saveCanvas", functionLine: 110, functionColumn: 130_802, arity: 1 } } as const);
export const CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES = freezeDeep({
  noData: { lineNumber: 110, columnNumber: 131_018, expression: "[this,s,r]", length: 3 },
  entry: { lineNumber: 110, columnNumber: 131_055, expression: "[this,s,r]", length: 3 },
  clock: { lineNumber: 110, columnNumber: 131_079, expression: "[this,s,r,i]", length: 4 },
  compress: { lineNumber: 110, columnNumber: 131_150, expression: "[this,s,r,i,n]", length: 5 },
  body: { lineNumber: 110, columnNumber: 131_307, expression: "[this,s,r,i,n,a]", length: 6 },
  result: { lineNumber: 110, columnNumber: 131_355, expression: "[this,s,r,i,n,a,o]", length: 7 },
} as const);
export const CURRENT_SCHEMATIC_DISPLAY_SAVE_METHODS = freezeDeep({
  save: { index: 4, name: "saveCanvas", arity: 1, lineNumber: 110, columnNumber: 130_802, bytes: 570,
    sha256: "689bf1d38385331693dcfb9b28887ce2a46ada8b077495616f0e703d0a802178" },
  rpc: { index: 5, name: "rpcCall", arity: 2, lineNumber: 0, columnNumber: 8718, bytes: 273,
    sha256: "1721483546085355a236ebc6ac113012cfafca7ba4a0853af18f3d45848a3d9c" },
  compress: { index: 6, name: "asyncCompressFull", arity: 0, lineNumber: 14, columnNumber: 150, bytes: 126,
    sha256: "faa2b7b6ef22333b855caa8e7e5d18073b80fc86d98084881b62a4800b6ed0df" },
  getTicket: { index: 7, name: "getMaxTicket", arity: 0, lineNumber: 4, columnNumber: 3316, bytes: 37,
    sha256: "60c8a23917d7db26fd8f02dd4ebd730ac547a2f52221b0a42fb472a5d830a93c" },
  setTicket: { index: 8, name: "setMaxTicket", arity: 1, lineNumber: 4, columnNumber: 3353, bytes: 63,
    sha256: "476a9095e2662fef0b2d1eb4c6ff993f454bb982f9c5484a5662db7d8b60e4de" },
} as const);
export type CurrentSchematicDisplaySaveSite = keyof typeof CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES;
export const CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE = 'async saveCanvas(s){if(this.isV2Format)return{success:!1,message:"This project is in V2 format and is currently in read-only mode. Saving is not allowed."};let r=this.consistencyManager;if(!r.isHasData(s.uniqueId))return await this.uploadCloud();let i=await this.wsBus.rpcCall($s.getTime),n=r.getMaxTicket()+1;this.consistencyManager.setMaxTicket(n);let a=await r.asyncCompressFull({uniqueId:s.uniqueId,docIds:s.docIds,client:s.client,updateTime:i,versions:{[s.uuid]:String(i)},user:this.user,headTicket:n}),o=await this.uploadLocal([a],!1);return this.isApplyShot=!0,o}';
export interface CurrentSchematicDisplaySaveSource { readonly profile: "private.current-schematic-display-save-source.v1"; readonly invocationObserved: false }
const issued = new WeakSet<CurrentSchematicDisplaySaveSource>();
const hash = (text: string): string => createHash("sha256").update(text).digest("hex");
export function qualifyCurrentSchematicDisplaySaveSource(input: unknown): CurrentSchematicDisplaySaveSource {
  const source = CURRENT_SCHEMATIC_DISPLAY_SAVE_SOURCE;
  if (typeof input !== "string" || !input.isWellFormed() || Buffer.byteLength(input) !== source.bytes || hash(input) !== source.sha256) { throw new Error("SCHEMATIC_DISPLAY_SAVE_SOURCE"); }
  const method = input.slice(source.saveCanvas.start, source.saveCanvas.end);
  if (method !== CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE || Buffer.byteLength(method) !== source.saveCanvas.bytes || hash(method) !== source.saveCanvas.sha256) { throw new Error("SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE"); }
  const token = Object.freeze({ profile: "private.current-schematic-display-save-source.v1", invocationObserved: false } as const); issued.add(token); return token;
}
export function requireOriginalCurrentSchematicDisplaySaveSource(token: CurrentSchematicDisplaySaveSource): void {
  if (!issued.has(token)) { throw new Error("SCHEMATIC_DISPLAY_SAVE_ORIGINAL_SOURCE"); }
}

/** Exact own-data full-script envelope; no proxy/getter/prototype callback runs. */
export function captureCurrentSchematicDisplaySaveScriptReply(input: unknown): Readonly<{ scriptSource: string }> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { throw new Error("SCHEMATIC_DISPLAY_SAVE_SCRIPT_REPLY"); }
  const prototype: unknown = Object.getPrototypeOf(input); const keys = Reflect.ownKeys(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== 1 || keys[0] !== "scriptSource") { throw new Error("SCHEMATIC_DISPLAY_SAVE_SCRIPT_REPLY"); }
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SCHEMATIC_DISPLAY_SAVE_SCRIPT_REPLY"); }
  const source: unknown = descriptor.value;
  if (typeof source !== "string" || !source.isWellFormed() || source.length > CURRENT_SCHEMATIC_DISPLAY_SAVE_SOURCE.bytes || Buffer.byteLength(source) !== CURRENT_SCHEMATIC_DISPLAY_SAVE_SOURCE.bytes) { throw new Error("SCHEMATIC_DISPLAY_SAVE_SCRIPT_REPLY"); }
  return Object.freeze({ scriptSource: source });
}
export function qualifyCurrentSchematicDisplaySaveScriptReply(input: unknown): CurrentSchematicDisplaySaveSource {
  return qualifyCurrentSchematicDisplaySaveSource(captureCurrentSchematicDisplaySaveScriptReply(input).scriptSource);
}
