import { createHash } from "node:crypto";
import { z } from "zod";

export const NETLIST_FILES_METHOD = "eda.sys_Tool.netlistComparison";
export const NETLIST_FILES_MAX_INPUT_BYTES = 65_536;
export const NETLIST_FILES_MAX_RESULT_BYTES = 196_608;
export const NETLIST_FILES_MAX_COMPONENTS = 256;
export const NETLIST_FILES_MAX_PINS = 2048;
export const NETLIST_FILES_MAX_NETS = 1024;
export const NETLIST_FILES_FORMAT = "allegro-ascii-subset";
const forbiddenKeys = new Set([...Object.getOwnPropertyNames(Object.prototype), "prototype"]);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/u);
const name = z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_. -]*\.tel$/u)
  .refine((value) => !value.includes(".."));
export const netlistManagedFileSchema = z.object({
  schema: z.literal("easyeda-pro-control.netlist-file.v1"), format: z.literal(NETLIST_FILES_FORMAT), name,
  path: z.string().min(1).max(4096), bytes: z.number().int().min(1).max(NETLIST_FILES_MAX_INPUT_BYTES), sha256,
}).strict();
export type NetlistManagedFile = z.infer<typeof netlistManagedFileSchema>;
export const netlistPrepareFileRequestSchema = z.object({ action: z.literal("prepare-file"), name,
  text: z.string().min(1).max(NETLIST_FILES_MAX_INPUT_BYTES), confirmLocalArtifact: z.literal(true) }).strict();
export const netlistCompareFilesRequestSchema = z.object({ action: z.literal("compare-files"),
  left: netlistManagedFileSchema, right: netlistManagedFileSchema }).strict();
export const netlistFilesRequestSchema = z.discriminatedUnion("action", [netlistPrepareFileRequestSchema, netlistCompareFilesRequestSchema]);
export type NetlistCompareFilesRequest = z.infer<typeof netlistCompareFilesRequestSchema>;
export interface NetlistFileModel {
  readonly componentCount: number;
  readonly pinCount: number;
  readonly netCount: number;
  readonly packages: ReadonlyMap<string, readonly string[]>;
  readonly nets: ReadonlyMap<string, readonly string[]>;
}
export interface NetlistDifference {
  readonly type: "NET" | "COMPONENT";
  readonly object: string;
  readonly net1: readonly string[];
  readonly net2: readonly string[];
}
function fail(reason: string): never { throw new Error(`Netlist input refused: ${reason}.`); }

function token(raw: string, maximum: number, allowEmpty = false): string {
  let value = raw.trim();
  if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) { value = value.slice(1, -1); }
  if (value.length > maximum || (!allowEmpty && value.length === 0) || !/^[A-Za-z0-9_./:+*()-]*$/u.test(value) || forbiddenKeys.has(value)) {
    fail("unsupported token or inherited object key");
  }
  return value;
}

function lineFields(line: string): readonly [string, string] {
  const fields = line.split(";");
  if (fields.length !== 2) { fail("each data row needs exactly one semicolon"); }
  const [before, after] = fields;
  if (before === undefined || after === undefined || before.trim() === "" || after.trim() === "") { fail("empty data row"); }
  return [before.trim(), after.trim()];
}

function members(value: string): string[] {
  return value.split(/ +/u).map((item) => token(item, 97));
}

/** Strictly recognize the complete accepted Allegro file before asking the
 * vendor parser to read it. Its H4.add silently drops duplicate components,
 * unknown pin references and malformed lines; none are admitted here.
 */
export function parseNetlistFileText(text: string): NetlistFileModel {
  if (typeof text !== "string" || text.length === 0 || text.length > NETLIST_FILES_MAX_INPUT_BYTES || /[^\u0020-\u007E\r\n]/u.test(text) || /\r(?!\n)/u.test(text)) {
    fail("only bounded printable ASCII with LF or CRLF is supported");
  }
  const lines = text.replaceAll(/,\r?\n {1,32}/gu, " ").split(/\r?\n/u);
  if (lines.length > 4096 || lines[0] !== "$PACKAGES") { fail("missing first package marker or too many lines"); }
  const components = new Set<string>();
  const nets = new Map<string, string[]>(), packages = new Map<string, string[]>();
  const pinOwners = new Set<string>(), propertyOwners = new Set<string>();
  let stage: "packages" | "properties" | "nets" | "schedule" | "end" = "packages";
  let sawNets = false;
  function parseDataRow(line: string): void {
    if (stage === "end" || stage === "schedule") { fail("data after the admitted net section"); }
    const [before, after] = lineFields(line);
    if (stage === "packages") {
      const fields = before.split("!");
      if (fields.length === 0 || fields.length > 3) { fail("only footprint, device and value package fields are supported"); }
      const footprint = token(fields[0] ?? "", 128);
      for (const value of fields.slice(1)) { token(value, 128, true); }
      for (const member of members(after)) {
        const designator = token(member, 48);
        if (designator.includes(".") || components.has(designator) || components.size >= NETLIST_FILES_MAX_COMPONENTS) { fail("duplicate, ambiguous or excessive components"); }
        components.add(designator);
        const group = packages.get(footprint) ?? []; group.push(designator); packages.set(footprint, group);
      }
    } else if (stage === "properties") {
      const fields = before.split(/ +/u);
      if (fields.length !== 2 || !["CODE", "COMPONENT_HIGH_MAX"].includes(fields[0] ?? "")) { fail("only non-routing CODE and COMPONENT_HIGH_MAX properties are supported"); }
      token(fields[1] ?? "", 128);
      for (const designator of members(after)) {
        const key = `${fields[0] ?? ""}:${designator}`;
        if (!components.has(designator) || propertyOwners.has(key)) { fail("property target missing or repeated"); }
        propertyOwners.add(key);
      }
    } else {
      const net = token(before, 128);
      if (nets.has(net) || nets.size >= NETLIST_FILES_MAX_NETS) { fail("duplicate or excessive nets"); }
      const pins = members(after);
      for (const pin of pins) {
        const fields = pin.split(".");
        if (fields.length !== 2) { fail("pin references require one designator and pin number"); }
        const designator = token(fields[0] ?? "", 48), number = token(fields[1] ?? "", 48);
        if (number.includes(":") || !components.has(designator) || pinOwners.has(pin) || pinOwners.size >= NETLIST_FILES_MAX_PINS) { fail("missing component, pin-function suffix, duplicate or excessive pin"); }
        pinOwners.add(pin);
      }
      nets.set(net, pins);
    }
  }
  for (const original of lines.slice(1).filter((line) => line.trim() !== "")) {
    if (original.length > 8192) { fail("data row exceeds its bound"); }
    const line = original.trim();
    if (line.startsWith("$")) {
      // The vendor compares section markers before trimming. Reject the
      // Visually identical indented form rather than silently losing rows.
      if (original !== line) { fail("section markers must occupy an exact line"); }
      if (line === "$A_PROPERTIES" && stage === "packages") { stage = "properties"; }
      else if (line === "$NETS" && (stage === "packages" || stage === "properties")) { stage = "nets"; sawNets = true; }
      else if (line === "$SCHEDULE" && stage === "nets") { stage = "schedule"; }
      else if (line === "$END" && (stage === "nets" || stage === "schedule")) { stage = "end"; }
      else { fail("unknown, repeated or out-of-order section marker"); }
    } else {
      parseDataRow(line);
    }
  }
  if (!sawNets || stage !== "end" || components.size === 0) { fail("complete package/net/end sections and at least one component are required"); }
  return { componentCount: components.size, pinCount: pinOwners.size, netCount: nets.size, packages, nets };
}

function lexical(left: string, right: string): number {
  if (left === right) { return 0; }
  return left < right ? -1 : 1;
}
function nativeNetName(value: string): string { return /^[A-Za-z0-9*]*$/u.test(value) ? value : `'${value}'`; }

/** The native method compares footprint membership and net membership only.
 * It never populates its propertiesMap; values/device/property differences
 * therefore do not appear. This independent model retains that narrow scope.
 */
export function expectedNetlistDifferences(left: NetlistFileModel, right: NetlistFileModel): NetlistDifference[] {
  const output: NetlistDifference[] = [];
  for (const [type, first, second] of [["NET", left.nets, right.nets], ["COMPONENT", left.packages, right.packages]] as const) {
    for (const key of new Set([...first.keys(), ...second.keys()])) {
      const leftValues = new Set(first.get(key)), rightValues = new Set(second.get(key));
      const net1 = [...leftValues].filter((value) => !rightValues.has(value)).toSorted(lexical);
      const net2 = [...rightValues].filter((value) => !leftValues.has(value)).toSorted(lexical);
      if (net1.length > 0 || net2.length > 0) { output.push({ type, object: type === "NET" ? nativeNetName(key) : key, net1, net2 }); }
    }
  }
  const normalized = normalizeNetlistDifferences(output);
  if (Buffer.byteLength(JSON.stringify(normalized), "utf8") > NETLIST_FILES_MAX_RESULT_BYTES / 2) { fail("complete difference result exceeds its bound"); }
  return normalized;
}

export function normalizeNetlistDifferences(rows: readonly NetlistDifference[]): NetlistDifference[] {
  return rows.map((row) => ({ type: row.type, object: row.object, net1: row.net1.toSorted(lexical), net2: row.net2.toSorted(lexical) }))
    .toSorted((left, right) => lexical(left.type, right.type) || lexical(left.object, right.object));
}

export function validateNetlistFileContents(fileInput: unknown, text: string): NetlistFileModel {
  const file = netlistManagedFileSchema.parse(fileInput);
  const bytes = Buffer.from(text, "utf8");
  if (bytes.length !== file.bytes || createHash("sha256").update(bytes).digest("hex") !== file.sha256) { fail("file bytes differ from the exact managed descriptor"); }
  return parseNetlistFileText(text);
}

const resultToken = z.string().min(1).max(130);
export const netlistDifferenceSchema = z.object({ type: z.enum(["NET", "COMPONENT"]), object: resultToken,
  net1: z.array(resultToken).max(NETLIST_FILES_MAX_PINS), net2: z.array(resultToken).max(NETLIST_FILES_MAX_PINS) }).strict();
export const netlistFilesCatalogQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();

export function queryNetlistFiles(input: unknown = {}): Record<string, unknown> {
  const query = netlistFilesCatalogQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, executionAuthorized: false, method: NETLIST_FILES_METHOD,
    implementationKind: "public-method-bounded-subset", liveValidation: "not-recorded",
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(netlistFilesRequestSchema) } : {}),
    limits: { inputBytesPerFile: NETLIST_FILES_MAX_INPUT_BYTES, componentsPerFile: NETLIST_FILES_MAX_COMPONENTS,
      pinsPerFile: NETLIST_FILES_MAX_PINS, netsPerFile: NETLIST_FILES_MAX_NETS, responseBytes: NETLIST_FILES_MAX_RESULT_BYTES },
    limitations: [
      "prepare-file writes an exclusive managed local artifact from supplied ASCII text; it contacts no app, project, network or external path. compare-files requires the actual authenticated 3.2.209 fingerprint and exact managed bytes.",
      "Only names with a lowercase .tel extension and a fully recognized Allegro subset: package rows, optional CODE/COMPONENT_HIGH_MAX properties, nets, optional empty schedule and final END. No arbitrary parser selection, .enet, archive, project/document UUID or document-object overload.",
      "At least one component; no duplicate designators/pins/nets, unknown components, function suffixes, inherited object keys, quoted whitespace, embedded quotes, or non-ASCII. Device/value fields are retained as input but not compared by the vendor method.",
      "Only footprint-to-designator and net-to-pin membership differences are checked. An empty result proves equality in that scope, not full circuit identity, electrical correctness, component values or manufacturing suitability.",
      "Two complete SDK samples must agree and match an independent complete membership model. Actual runtime NET/COMPONENT and net1/net2 fields are retained; SDK declaration names differ. No false/undefined parse result is treated as equality.",
      "The observation checks a ten-second monotonic deadline around every await, with a cooperative timer. It does not interrupt synchronous vendor work or cancel an outstanding RPC/FileReader. The 60-second execution and 70-second transport limits are separate waiting bounds. Timeout or owner drift refuses without automatic retry.",
      ".enet parsing can fetch current-project footprint/device metadata. Other parsers and document overloads are excluded. No navigation, editor mutation, explicit Save, export or private data upload is dispatched.",
    ] };
}

export function validateNetlistFilesArguments(input: unknown): Record<string, unknown> {
  const result = netlistFilesRequestSchema.safeParse(input);
  if (!result.success) { return { valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) }; }
  try {
    if (result.data.action === "prepare-file") { parseNetlistFileText(result.data.text); }
    return { valid: true, request: result.data, executionAuthorized: false };
  } catch { return { valid: false, executionAuthorized: false, issues: [{ path: ["text"], message: "The complete Allegro subset was not recognized." }] }; }
}
