/** Exact original Electron-main backend source. Qualification is static and
 * grants no runtime ownership, request context, clock result or SQL authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE = freezeDeep({
  relativePath: "app.js", bytes: 2_657_192,
  sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c",
  registration: {
    https: { start: 2_629_792, end: 2_629_820, bytes: 28, lineNumber: 8583, columnNumber: 3992, breakpointColumnNumber: 3994,
      sha256: "1012eeee68840071f917750e8ddf745f75e290ca0c248b5107ce015eb837f6de" },
    http: { start: 2_629_821, end: 2_629_848, bytes: 27, lineNumber: 8583, columnNumber: 4021, breakpointColumnNumber: 4023,
      sha256: "59126d16b6b7c6c045030480adeed53cd299567707a96e735a3c2cb3cf333975" },
  },
  functions: {
    projectSql: { start: 1_318_983, end: 1_319_062, bytes: 79, name: "y", arity: 2, async: true,
      lineNumber: 1025, columnNumber: 20_177,
      sha256: "26351dd282391b70094abe75b253acf2dd0a37d6b8197fbb027dce1f6d2c0a98" },
    driverCallback: { start: 1_375_968, end: 1_376_289, bytes: 321, name: "", arity: 2, async: true,
      lineNumber: 1164, columnNumber: 2434,
      sha256: "a3b4db4adc53d6d94632b1148fababfc314eba0095377211a06d79d8c6134974" },
    driverIntercept: { start: 1_424_579, end: 1_425_020, bytes: 441, name: "interceptHttpProtocol", arity: 3, async: true,
      lineNumber: 1164, columnNumber: 51_072,
      sha256: "006b255236cfee5d8c2bd9c775ae2af600551ac95dbec82bcc07a69d2d170e37" },
    actorClock: { start: 2_602_467, end: 2_602_820, bytes: 353, name: "L3", arity: 2, async: true,
      lineNumber: 8573, columnNumber: 31,
      sha256: "4f35768c1e8fd199dcbd67f44b3bb841215080e9f80e384b1712e01995bd7d2d" },
    protocolCallback: { start: 2_629_849, end: 2_630_576, bytes: 727, name: "u", arity: 1, async: true,
      lineNumber: 8583, columnNumber: 4065,
      sha256: "7bb63507bf8511656ddd905e8877d51d156305559a5fdbbb4a71d379f9ba68f7" },
    router: { start: 2_630_578, end: 2_631_059, bytes: 481, name: "xC", arity: 3, async: false,
      lineNumber: 8583, columnNumber: 4789,
      sha256: "be2033f3a7f2c917f06dac451da35bd2919661a745531a1a36540b3e845e3485" },
  },
} as const);

export type CurrentFootprintCopyMainBackendRole = keyof typeof CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.functions;
export interface CurrentFootprintCopyMainBackendSource {
  readonly profile: "private.current-footprint-copy-main-backend-source.v1";
  readonly sha256: string;
  readonly runtimeBound: false;
  readonly executionAuthorized: false;
}
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_MAIN_BACKEND_SOURCE"); } }
function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }

/** Preserve the one large source response before independently qualifying its
 * exact bytes. Accessors and proxy traps are refused without invoking them. */
export function captureCurrentFootprintCopyMainBackendSourceReply(input: unknown): Readonly<{ scriptSource: string }> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
    descriptor.enumerable === true && typeof descriptor.value === "string" && descriptor.value.isWellFormed() &&
    Buffer.byteLength(descriptor.value) <= CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.bytes);
  return Object.freeze({ scriptSource: descriptor.value });
}
export function assertCurrentFootprintCopyMainBackendFunction(role: CurrentFootprintCopyMainBackendRole, text: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.functions, role));
  const profile = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.functions[role];
  need(typeof text === "string" && text.isWellFormed() && Buffer.byteLength(text) === profile.bytes && hash(text) === profile.sha256);
}
export function qualifyCurrentFootprintCopyMainBackendSource(input: unknown): CurrentFootprintCopyMainBackendSource {
  const profile = CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE;
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256);
  for (const role of ["projectSql", "driverCallback", "driverIntercept", "actorClock", "protocolCallback", "router"] as const) {
    const fn = profile.functions[role]; assertCurrentFootprintCopyMainBackendFunction(role, input.slice(fn.start, fn.end));
  }
  for (const site of Object.values(profile.registration)) {
    const prefix = input.slice(0, site.start), text = input.slice(site.start, site.end);
    need(Buffer.byteLength(text) === site.bytes && hash(text) === site.sha256 && prefix.split("\n").length - 1 === site.lineNumber &&
      site.start - prefix.lastIndexOf("\n") - 1 === site.columnNumber);
  }
  const token = Object.freeze({ profile: "private.current-footprint-copy-main-backend-source.v1" as const,
    sha256: profile.sha256, runtimeBound: false as const, executionAuthorized: false as const });
  originals.add(token); return token;
}
export function requireCurrentFootprintCopyMainBackendSource(input: unknown): void {
  need(input !== null && typeof input === "object" && originals.has(input));
}
