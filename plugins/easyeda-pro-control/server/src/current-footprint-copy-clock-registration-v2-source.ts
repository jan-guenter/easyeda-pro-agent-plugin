/** Fixed mixed-origin source inputs only. No asset is loaded or evaluated here,
 * and a source token grants no native ownership or clock invocation authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE = freezeDeep({
  wrapper: { relativePath: "pro-mgr/3.2.185.bf63a159/js/preload.js", bytes: 875_163,
    sha256: "4f802b0d345b7c54817627fc854e61541f70585e8fcb0ecb98789365a88f9935",
    function: { start: 135_404, end: 135_727, bytes: 323, name: "k", arity: 1, lineNumber: 1, columnNumber: 86_476,
      sha256: "56bd31d082818cd0dad9d96788a4414fdcffbc7e241b5e60f73b55e702cf0c53" },
    // Identical text is not the selected La module's runtime function location.
    unselectedCopy: { start: 14_516, end: 14_839, lineNumber: 0, columnNumber: 14_516 } },
  callback: { relativePath: "pro-mgr/3.2.185.bf63a159/js/ws-service.js", bytes: 855_142,
    sha256: "7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00",
    function: { start: 851_606, end: 851_623, bytes: 17, name: "", arity: 0, lineNumber: 28, columnNumber: 23_421,
      sha256: "2c7bd02ac5405909c1e86e8259159dfa5c5c32dd1b14937b18c048592f984e7b" } },
} as const);
export type CurrentFootprintCopyClockRegistrationV2Role = keyof typeof CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE;
export interface CurrentFootprintCopyClockRegistrationV2Source {
  readonly profile: "private.current-footprint-clock-registration-source.v2";
  readonly role: CurrentFootprintCopyClockRegistrationV2Role;
  readonly sha256: string;
  readonly runtimeBound: false;
}
const issued = new WeakMap<object, CurrentFootprintCopyClockRegistrationV2Role>();
const hash = (text: string): string => createHash("sha256").update(text).digest("hex");
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_CLOCK_REGISTRATION_V2_SOURCE"); } }
export function assertCurrentFootprintCopyClockRegistrationV2Function(role: CurrentFootprintCopyClockRegistrationV2Role, input: unknown): void {
  const expected = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE[role].function;
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === expected.bytes && hash(input) === expected.sha256);
}
/** Capture one bounded own-data source reply before a post-await owner check. */
export function captureCurrentFootprintCopyClockRegistrationV2SourceReply(role: CurrentFootprintCopyClockRegistrationV2Role,
  input: unknown): Readonly<{ scriptSource: string }> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null));
  const entry = Object.getOwnPropertyDescriptor(input, "scriptSource"), keys = Reflect.ownKeys(input);
  need(keys.length === 1 && keys[0] === "scriptSource" && entry !== undefined && Object.hasOwn(entry, "value") && entry.enumerable === true &&
    typeof entry.value === "string" && entry.value.isWellFormed() && Buffer.byteLength(entry.value) <= CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE[role].bytes);
  return Object.freeze({ scriptSource: entry.value });
}
export function qualifyCurrentFootprintCopyClockRegistrationV2Source(role: CurrentFootprintCopyClockRegistrationV2Role,
  input: unknown): CurrentFootprintCopyClockRegistrationV2Source {
  const expected = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE[role];
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === expected.bytes && hash(input) === expected.sha256);
  assertCurrentFootprintCopyClockRegistrationV2Function(role, input.slice(expected.function.start, expected.function.end));
  const token = Object.freeze({ profile: "private.current-footprint-clock-registration-source.v2" as const, role, sha256: expected.sha256, runtimeBound: false as const });
  issued.set(token, role); return token;
}
export function requireCurrentFootprintCopyClockRegistrationV2Source(token: CurrentFootprintCopyClockRegistrationV2Source,
  role: CurrentFootprintCopyClockRegistrationV2Role): void {
  need(issued.get(token) === role && token.role === role && token.sha256 === CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE[role].sha256);
}
