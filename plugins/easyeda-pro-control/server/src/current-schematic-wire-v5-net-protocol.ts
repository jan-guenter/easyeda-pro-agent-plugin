/** Standalone V5 Wire observer request book. Encoding supplies data only. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FLAGS as GEOMETRY, currentSchematicWireNetGeometryCases, validateCurrentSchematicWireNetGeometryCommand } from "./current-schematic-wire-net-geometry-protocol.ts";
import type { CurrentSchematicWireNetGeometryCommand } from "./current-schematic-wire-net-geometry-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_ORDER as GEOMETRY_ORDER, CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS as PINS, currentSchematicWireNetGeometryFrames } from "./current-schematic-wire-net-geometry-source.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_WATCH_FLAGS as WATCH, currentSchematicWireNetWatchCases, validateCurrentSchematicWireNetWatchCommand } from "./current-schematic-wire-net-watch-protocol.ts";
import type { CurrentSchematicWireNetWatchCommand } from "./current-schematic-wire-net-watch-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE as V5 } from "./current-schematic-wire-writer-v5-native-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Lane = "watch" | "geometry";
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const example = "original27";
const phases = z.object({ phase: z.string() });
const variants = [0, 1] as const;
const geometrySteps = [...new Set(GEOMETRY_ORDER)];
const arms = variants.flatMap(variant => geometrySteps.map(step => {
  const top = currentSchematicWireNetGeometryFrames(variant, step)[0];
  if (top === undefined) { throw new Error("WIRE_V5_NET_GEOMETRY_FRAME"); }
  const [role, columnNumber] = top;
  return Object.freeze({ variant, step, lineNumber: PINS[variant][role].lineNumber, columnNumber });
}));
const releases = [
  { phase: "wire-v5-net-watch-release", objectGroup: WATCH.objectGroup },
  { phase: "wire-v5-net-geometry-release", objectGroup: GEOMETRY.objectGroup },
] as const;
const geometryArmSchema = arms.map(point => {
  const location = z.strictObject({ scriptId: handle, lineNumber: z.literal(point.lineNumber), columnNumber: z.literal(point.columnNumber) });
  const params = z.strictObject({ location, condition: z.literal("") });
  return z.strictObject({
    phase: z.literal("wire-v5-net-geometry-arm"), variant: z.literal(point.variant), role: z.literal(point.step),
    method: z.literal("Debugger.setBreakpoint"), params,
  });
});
const releaseSchema = releases.map(row => {
  const params = z.strictObject({ objectGroup: z.literal(row.objectGroup) });
  return z.strictObject({ phase: z.literal(row.phase), method: z.literal("Runtime.releaseObjectGroup"), params });
});
const controlSchema = z.union([
  ...geometryArmSchema, ...releaseSchema,
  z.strictObject({ phase: z.literal("wire-v5-net-geometry-resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("wire-v5-net-geometry-remove"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
]);
type ControlCommand = z.infer<typeof controlSchema>;
export type CurrentSchematicWireV5NetCommand = CurrentSchematicWireNetWatchCommand | CurrentSchematicWireNetGeometryCommand | ControlCommand;

const kinds = {
  "Runtime.getProperties": "properties", "Runtime.callFunctionOn": "call", "Debugger.evaluateOnCallFrame": "frame",
  "Debugger.getScriptSource": "source", "Debugger.setBreakpoint": "arm", "Debugger.resume": "resume",
  "Debugger.removeBreakpoint": "remove", "Runtime.releaseObjectGroup": "release",
} as const;
type Kind = typeof kinds[keyof typeof kinds];
type Counts = Readonly<Record<Kind, number>>;

// The watch driver consumes 91 normal reads/controls and five removals.
// The geometry reader consumes 46 reads. Its owner also needs five distinct
// The additional controls are distinct arms, resumes and removals.
const requests = freezeDeep({
  watch: { properties: 45, call: 13, frame: 9, source: 13, arm: 5, resume: 6, remove: 5, release: 1 },
  geometry: { properties: 4, call: 8, frame: 26, source: 8, arm: 5, resume: 8, remove: 5, release: 1 },
});
function sum(count: Counts): number { return Object.values(count).reduce((total, row) => total + row, 0); }
const wire = sum(requests.watch) + sum(requests.geometry);
const reproof = wire * 2;
const renderer = wire + reproof * 2;
export const CURRENT_SCHEMATIC_WIRE_V5_NET_REQUESTS = freezeDeep({
  watch: requests.watch, geometry: requests.geometry, laneCommands: { watch: sum(requests.watch), geometry: sum(requests.geometry) }, wire,
  addedContinuityChecks: reproof, addedRendererRequests: renderer,
  directObservedEvents: { watch: 25, geometry: 24 }, qualifiedHelperAndPauseEventReservation: 25 + 24 + reproof,
  addedNativeSendAndPollControls: renderer * (V5.globals.pollsPerRead + 1),
  prospectiveRendererIdLimit: V5.renderer.total + renderer,
  observationOnly: true, nativeOwnerJoined: false, executionAuthorized: false, saveAuthorized: false,
});
const limits = CURRENT_SCHEMATIC_WIRE_V5_NET_REQUESTS;

function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_V5_NET_REQUEST"); }
}
export function validateCurrentSchematicWireV5NetCommand(input: unknown): CurrentSchematicWireV5NetCommand {
  const raw = capture(input).value;
  const { phase } = phases.parse(raw);
  if (phase.startsWith("net-watch-")) { return validateCurrentSchematicWireNetWatchCommand(raw); }
  if (phase.startsWith("wire-net-geometry-")) { return validateCurrentSchematicWireNetGeometryCommand(raw); }
  return freezeDeep(controlSchema.parse(raw));
}
function lane(command: CurrentSchematicWireV5NetCommand): Lane {
  return command.phase.startsWith("net-watch-") || command.phase === "wire-v5-net-watch-release" ? "watch" : "geometry";
}

const controls = [
  ...arms.map(point => ({
    phase: "wire-v5-net-geometry-arm", variant: point.variant, role: point.step, method: "Debugger.setBreakpoint",
    params: { location: { scriptId: example, lineNumber: point.lineNumber, columnNumber: point.columnNumber }, condition: "" },
  })),
  ...releases.map(row => ({ phase: row.phase, method: "Runtime.releaseObjectGroup", params: { objectGroup: row.objectGroup } })),
  { phase: "wire-v5-net-geometry-resume", method: "Debugger.resume", params: {} },
  { phase: "wire-v5-net-geometry-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: example } },
].map(input => freezeDeep(controlSchema.parse(input)));
const cases = Object.freeze([...currentSchematicWireNetWatchCases(), ...currentSchematicWireNetGeometryCases(), ...controls]);
export function currentSchematicWireV5NetCases(): readonly CurrentSchematicWireV5NetCommand[] { return cases; }

interface Fields {
  readonly names: readonly string[];
  readonly values: Readonly<Record<string, string>>;
  readonly params: Readonly<Record<string, unknown>>;
}
function fields(command: CurrentSchematicWireV5NetCommand): Fields {
  const params = { ...command.params } as Record<string, unknown>;
  const names: string[] = [];
  const values: Record<string, string> = {};
  const field = (name: string, value: string): string => {
    names.push(name);
    values[name] = value;
    return `@wire_v5_net_${name}@`;
  };
  switch (command.method) {
    case "Runtime.callFunctionOn": {
      params["objectId"] = field("objectId", command.params.objectId);
      params["arguments"] = command.params.arguments.map((ref, index) => ({ objectId: field(`reference${index}`, ref.objectId) }));
      break;
    }
    case "Runtime.getProperties": { params["objectId"] = field("objectId", command.params.objectId); break; }
    case "Debugger.evaluateOnCallFrame": { params["callFrameId"] = field("callFrameId", command.params.callFrameId); break; }
    case "Debugger.getScriptSource": { params["scriptId"] = field("scriptId", command.params.scriptId); break; }
    case "Debugger.setBreakpoint": { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; break; }
    case "Debugger.removeBreakpoint": { params["breakpointId"] = field("breakpointId", command.params.breakpointId); break; }
    case "Debugger.resume":
    case "Runtime.releaseObjectGroup": { break; }
    default: { throw new Error("WIRE_V5_NET_METHOD"); }
  }
  return freezeDeep({ names, values, params });
}
function key(command: CurrentSchematicWireV5NetCommand, parsed: Fields): string {
  return JSON.stringify({ ...command, params: parsed.params });
}
interface Selector {
  readonly selector: number;
  readonly lane: Lane;
  readonly kind: Kind;
  readonly method: CurrentSchematicWireV5NetCommand["method"];
  readonly names: readonly string[];
  readonly template: string;
}
const table = new Map(cases.map((command, selector) => {
  const parsed = fields(command);
  const template = JSON.stringify({ method: command.method, params: parsed.params });
  for (const name of parsed.names) {
    const marker = `"@wire_v5_net_${name}@"`;
    need(template.split(marker).length === 2);
  }
  need(template.split("@wire_v5_net_").length === parsed.names.length + 1);
  const row: Selector = freezeDeep({
    selector, lane: lane(command), kind: kinds[command.method], method: command.method, names: parsed.names, template,
  });
  return [key(command, parsed), row] as const;
}));
need(table.size === cases.length);
export function currentSchematicWireV5NetSelectors(): readonly Selector[] { return Object.freeze([...table.values()]); }

const requestId = z.number().int().positive().max(limits.prospectiveRendererIdLimit);
const envelope = z.looseObject({ id: requestId, schematicWireV5Net: z.literal(true), sessionId: handle });
interface Bound { readonly id: number; readonly sessionId: string }
export interface CurrentSchematicWireV5NetWire {
  readonly command: CurrentSchematicWireV5NetCommand;
  readonly lane: Lane;
  readonly kind: Kind;
  readonly wire: Readonly<CurrentSchematicWireV5NetCommand & Bound & { schematicWireV5Net: true }>;
  readonly native: Readonly<Record<string, string | number>>;
}
export function currentSchematicWireV5NetWire(input: unknown, original: Bound): CurrentSchematicWireV5NetWire {
  const id = requestId.parse(original.id);
  const sessionId = handle.parse(original.sessionId);
  const command = validateCurrentSchematicWireV5NetCommand(input);
  const parsed = fields(command);
  const row = table.get(key(command, parsed));
  need(row !== undefined);
  return freezeDeep({
    command, lane: row.lane, kind: row.kind,
    wire: { id, ...command, schematicWireV5Net: true as const, sessionId },
    native: { action: "schematic-wire-v5-net", requestId: id, lane: row.lane, kind: row.kind, selector: row.selector, method: row.method, ...parsed.values },
  });
}
/** Decode only the canonical original request frame. The owner supplies its
 * present request identity and still controls if any native send is admissible. */
export function decodeCurrentSchematicWireV5NetWire(input: Buffer, original: Bound): CurrentSchematicWireV5NetWire {
  need(input.length > 1 && input.length <= 65_536);
  const raw = Buffer.from(input);
  need(raw.at(-1) === 0);
  const decoded: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(raw.subarray(0, -1)));
  const { id, schematicWireV5Net: _, sessionId, ...command } = envelope.parse(capture(decoded).value);
  need(id === original.id && sessionId === original.sessionId);
  const result = currentSchematicWireV5NetWire(command, original);
  const canonical = Buffer.from(`${JSON.stringify(result.wire)}\0`);
  need(raw.equals(canonical));
  return result;
}
