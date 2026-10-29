/** The default editor's preload creates its extension registry before UI loads.
 * Its sl receiver class is distinct from the later UI kgt class. These pins
 * qualify source bytes only, never an instance, context or execution owner. */
import { createHash } from "node:crypto";
import { captureCurrentFootprintCopyManagerRouteSourceReply } from "./current-footprint-copy-manager-route-source.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE = freezeDeep({
  ...CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.preload,
  // Target inspector contract, not this Node process's function roster. The
  // Admitted application reports V8 14.6; near-family Node26 diagnostics show
  // Its ordinary ws function omits Node24's legacy own caller/arguments fields.
  targetFunctionMetadata: { v8: "14.6.202.33", chromiumMajor: 146,
    contextProducerOwnProperties: ["length", "name", "prototype"],
    legacyOwnCallerArgumentsAdmitted: false, connectedFunctionRosterVerified: false },
  functions: {
    registryConstructor: { start: 682_378, end: 683_330, bytes: 952,
      sha256: "dac0694a6253a07e3fd974a214d9863e6b44f606d59260cff947efe2727889e5",
      name: "sl", arity: 0, async: false, lineNumber: 27, columnNumber: 4980 },
    registryHas: { start: 683_045, end: 683_079, bytes: 34,
      sha256: "d96655af724ba9ae71baeda72c9e81b42ce824ac693467553c3d4b86946de1bd",
      name: "hasLib", arity: 1, async: false, lineNumber: 27, columnNumber: 5633 },
    registryInstance: { start: 682_541, end: 682_646, bytes: 105,
      sha256: "843ef79dde984fddbcc38f8eb870d52cf0299df0b22afbbe82e156a764c9002b",
      name: "getInstance", arity: 0, async: false, lineNumber: 27, columnNumber: 5134 },
    registryContext: { start: 682_508, end: 682_534, bytes: 26,
      sha256: "6665d56fe226778a18c07531f5bddff5994d712894a39dbf1c3547a45f8c950e",
      name: "get context", arity: 0, async: false, lineNumber: 27, columnNumber: 5101 },
    contextProducer: { start: 48_208, end: 48_251, bytes: 43,
      sha256: "cbbfb3006c8b05513af186643e420ebd731d2c77fddd1d2fda7e1c5adfbf4c52",
      name: "ws", arity: 0, async: false, lineNumber: 0, columnNumber: 48_219 },
  },
  initialization: {
    classAlias: { start: 683_363, end: 683_383, bytes: 20,
      sha256: "3931a022fa0608cf3a48f613e62cdccb66920c9d4bc699e36796f7e369466e6b" },
    serviceConstructor: { start: 793_041, end: 793_173, bytes: 132,
      sha256: "e233a1a9be293dad8fb097af547716dd9235619b4242f5ae7bb7d64d9cfaf16a" },
    eagerService: { start: 801_306, end: 801_315, bytes: 9,
      sha256: "e40f5b7505f86f59ddc8c2fcc876faeafe4b7fcface6b5402d95d6b06c108550" },
  },
} as const);
export type CurrentFootprintCopyUiRegistryFunction = keyof typeof CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE.functions;
export const CURRENT_FOOTPRINT_COPY_UI_REGISTRY_FUNCTION_NAMES = Object.freeze([
  "registryConstructor", "registryHas", "registryInstance", "registryContext", "contextProducer",
] as const);
export const CURRENT_FOOTPRINT_COPY_UI_REGISTRY_CAPTURE_ORDER = Object.freeze([
  "registryConstructor", "registryHas", "registryInstance", "registryContext",
] as const);
export type CurrentFootprintCopyUiRegistrySourceQualification = Readonly<{
  sourceSha256: string; functionCount: 5; runtimeBound: false; executionAuthorized: false;
}>;
const issued = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_UI_REGISTRY_SOURCE"); } }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function assertSpan(source: unknown, profile: Readonly<{ bytes: number; sha256: string }>): asserts source is string {
  need(typeof source === "string" && source.length <= profile.bytes && source.isWellFormed() &&
    Buffer.byteLength(source) === profile.bytes && digest(source) === profile.sha256);
}

/** Reuse the maintained data-only script reply capture, then enforce this
 * preload's narrower fixed ceiling. Hash qualification remains separate. */
export function captureCurrentFootprintCopyUiRegistrySourceReply(input: unknown): Readonly<{ scriptSource: string }> {
  const reply = captureCurrentFootprintCopyManagerRouteSourceReply(input);
  need(reply.scriptSource.length <= CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE.bytes &&
    Buffer.byteLength(reply.scriptSource) <= CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE.bytes);
  return reply;
}

export function assertCurrentFootprintCopyUiRegistryFunction(role: CurrentFootprintCopyUiRegistryFunction, source: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE.functions, role));
  assertSpan(source, CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE.functions[role]);
}

/** Complete original preload source, including its eager registry allocation.
 * This module opens no files and evaluates no supplied source. */
export function qualifyCurrentFootprintCopyUiRegistrySource(source: unknown): CurrentFootprintCopyUiRegistrySourceQualification {
  const profile = CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE; assertSpan(source, profile);
  for (const role of CURRENT_FOOTPRINT_COPY_UI_REGISTRY_FUNCTION_NAMES) {
    const span = profile.functions[role]; assertCurrentFootprintCopyUiRegistryFunction(role, source.slice(span.start, span.end));
  }
  for (const span of Object.values(profile.initialization)) { assertSpan(source.slice(span.start, span.end), span); }
  const qualification = Object.freeze({ sourceSha256: profile.sha256, functionCount: 5 as const,
    runtimeBound: false as const, executionAuthorized: false as const });
  issued.add(qualification); return qualification;
}
/** Issuer identity only. A serialized report cannot qualify native handles. */
export function requireCurrentFootprintCopyUiRegistrySource(value: unknown): void {
  need(value !== null && typeof value === "object" && issued.has(value));
}
