/** Independent native serialization for one fixed async request. This contains
 * no generic command encoder and accepts only identifiers plus strict data. */
import { currentFootprintCopySourceCommand } from "./current-footprint-copy-source-command.ts";
import type { CurrentFootprintCopySourceCommand } from "./current-footprint-copy-source-command.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const quoted = (expression: string): string => `${literal('"')}+${expression}+${literal('"')}`;
const fields = new Map([
  ["objectId", "objectId"], ["arguments.0.objectId", "argument0"], ["arguments.1.objectId", "argument1"],
  ["arguments.2.objectId", "argument2"], ["arguments.4.objectId", "argument4"], ["arguments.5.objectId", "argument5"],
]);
const atoms = new Map([
  ["arguments.3.value.identity.projectUuid", ["projectUuid", "(?:[a-f0-9]{32}|[a-f0-9]{64})"]],
  ["arguments.3.value.identity.branchUuid", ["branchUuid", "[a-f0-9]{32}"]],
  ["arguments.3.value.identity.windowTabId", ["windowTabId", "[A-Za-z0-9_-]{1,128}"]],
  ["arguments.3.value.footprintUuid", ["footprintUuid", "(?:[a-f0-9]{16}|[a-f0-9]{32})"]],
  ["arguments.3.value.client", ["client", "[a-f0-9]{16}"]],
]);

export function currentFootprintCopySourceNativeSample(): CurrentFootprintCopySourceCommand {
  return currentFootprintCopySourceCommand({ manager: "__startup_objectId__", project: "__startup_argument0__",
    bus: "__startup_argument1__", consistency: "__startup_argument2__", constructors: "__startup_argument4__", methods: "__startup_argument5__" },
  { identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "original-tab" },
    footprintUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 123 });
}

/** Serialize each known member structurally. A runtime identifier equal to a
 * placeholder cannot redirect another field or alter the fixed function. */
function encode(value: unknown, path: string): string {
  // The native class verifies and decodes this fixed JSON string once. Keeping
  // Its source compressed preserves the existing whole-helper byte ceiling.
  if (path === "functionDeclaration") { return "FootprintSourceFunctionJson"; }
  const field = fields.get(path);
  if (field !== undefined) { return quoted(`Handle(Field(fields,${literal(field)}),256)`); }
  const atom = atoms.get(path);
  if (atom !== undefined) {
    const [name, pattern] = atom;
    if (name === undefined || pattern === undefined) { throw new Error("FOOTPRINT_SOURCE_NATIVE_ATOM"); }
    return quoted(`FootprintAtom(fields,${literal(name)},${literal(pattern)})`);
  }
  if (path === "arguments.3.value.maximumTicket") { return "FootprintTicket(fields)"; }
  if (Array.isArray(value)) {
    return [literal("["), ...value.flatMap((item: unknown, index) => [
      ...(index === 0 ? [] : [literal(",")]), encode(item, `${path}.${String(index)}`),
    ]), literal("]")].join("+");
  }
  if (value !== null && typeof value === "object") {
    return [literal("{"), ...Object.entries(value).flatMap(([key, item], index) => [
      literal(`${index === 0 ? "" : ","}${JSON.stringify(key)}:`), encode(item, path === "" ? key : `${path}.${key}`),
    ]), literal("}")].join("+");
  }
  const json = JSON.stringify(value);
  if (json === undefined) { throw new Error("FOOTPRINT_SOURCE_NATIVE_VALUE"); }
  return literal(json);
}
export function currentFootprintCopySourceNativeParameters(): string {
  return encode(currentFootprintCopySourceNativeSample().params, "");
}

export const CURRENT_FOOTPRINT_COPY_SOURCE_NATIVE_GUARDS = `
  static string FootprintAtom(System.Collections.IDictionary fields,string key,string pattern) {
    string value=Field(fields,key);
    Need(value.Length<=128 && System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A"+pattern+@"\\z"),"footprint-atom");return value;
  }
  static string FootprintTicket(System.Collections.IDictionary fields) {
    string value=Field(fields,"maximumTicket");long ticket;
    Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A(?:0|[1-9][0-9]{0,15})\\z") &&
      System.Int64.TryParse(value,System.Globalization.NumberStyles.None,System.Globalization.CultureInfo.InvariantCulture,out ticket) &&
      ticket>=0 && ticket<=9007199254740988L,"footprint-ticket");return value;
  }`;
