/** Refusal-only original runner/setter points. There is no resume command. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export const CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_ROLES = ["run", "x", "y"] as const;
export type CurrentSchematicDisplayActionGuardRole = typeof CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_ROLES[number];
/** Inert Node24 Inspector compiled only the exact pinned method definitions.
 * These are the resolved first statements, before any application call/write. */
export const CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_SITES = freezeDeep([
  { run: { lineNumber: 30, columnNumber: 68_474 }, x: { lineNumber: 3597, columnNumber: 9920 }, y: { lineNumber: 3597, columnNumber: 10_086 } },
  { run: { lineNumber: 556, columnNumber: 68_474 }, x: { lineNumber: 4096, columnNumber: 6856 }, y: { lineNumber: 4096, columnNumber: 7022 } },
] as const);
export const CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_REQUESTS = Object.freeze({ cdpRequests: 3, bindingControls: 1, resumeRequests: 0, mutationAuthorized: false });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const schema = z.strictObject({ role: z.enum(CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_ROLES), variant: z.union([z.literal(0), z.literal(1)]), method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location: point }) });
export type CurrentSchematicDisplayActionGuardCommand = z.infer<typeof schema>;
export function validateCurrentSchematicDisplayActionGuardCommand(input: unknown): CurrentSchematicDisplayActionGuardCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value), site = CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_SITES[command.variant][command.role];
  if (command.params.location.lineNumber !== site.lineNumber || command.params.location.columnNumber !== site.columnNumber) { throw new Error("SCHEMATIC_ACTION_GUARD_SITE"); } return freezeDeep(command);
}
export function currentSchematicDisplayActionGuardCommand(role: CurrentSchematicDisplayActionGuardRole, variant: 0 | 1, scriptId: string): CurrentSchematicDisplayActionGuardCommand {
  return validateCurrentSchematicDisplayActionGuardCommand({ role, variant, method: "Debugger.setBreakpoint", params: { location: { scriptId, ...CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_SITES[variant][role] } } });
}
export function currentSchematicDisplayActionGuardWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicDisplayActionGuardCommand; request: Readonly<{ action: "schematic-display-action-guard"; requestId: number; role: CurrentSchematicDisplayActionGuardRole }> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_ACTION_GUARD_ID"); }
  const command = validateCurrentSchematicDisplayActionGuardCommand(input); return freezeDeep({ command, request: { action: "schematic-display-action-guard", requestId: id, role: command.role } });
}
export interface CurrentSchematicDisplayActionGuardObservation {
  readonly profile: "private.current-schematic-display-action-guard-observation.v1";
  readonly originalRunnerEntryPointArmed: true; readonly originalSetterPointsArmed: true;
  readonly actualInvocationObserved: false; readonly continuationAuthorized: false; readonly modifyAuthorized: false; readonly saveAuthorized: false;
}
export interface CurrentSchematicDisplayActionGuardSite { readonly role: CurrentSchematicDisplayActionGuardRole; readonly scriptId: string; readonly lineNumber: number; readonly columnNumber: number }
/** Data-only matching of already decoded events. Only the original Core owns
 * session/points/arming. An in-flight match can refuse, never issue an ACK. */
export function matchCurrentSchematicDisplayActionGuardEvent(event: DiagnosticEvent, sessionId: string | null,
  points: ReadonlyMap<string, CurrentSchematicDisplayActionGuardSite>, arming: CurrentSchematicDisplayActionGuardSite | null): "held" | "resolved" | null {
  if (sessionId === null || event.sessionId !== sessionId || event.params === null || typeof event.params !== "object" || Array.isArray(event.params)) { return null; }
  const params = event.params;
  let id: unknown, location: unknown;
  if (event.method === "Debugger.breakpointResolved") { id = params["breakpointId"]; location = params["location"]; }
  else if (event.method === "Debugger.paused") {
    const frames = params["callFrames"], ids = params["hitBreakpoints"];
    if (!Array.isArray(ids) || ids.length !== 1 || !Array.isArray(frames) || frames[0] === null || typeof frames[0] !== "object" || Array.isArray(frames[0])) { return null; }
    id = ids[0]; location = Reflect.get(frames[0], "location");
  } else { return null; }
  const site = typeof id === "string" ? points.get(id) ?? arming : null;
  if (site === null || site === undefined || location === null || typeof location !== "object" || Array.isArray(location) || Reflect.get(location, "scriptId") !== site.scriptId || Reflect.get(location, "lineNumber") !== site.lineNumber || Reflect.get(location, "columnNumber") !== site.columnNumber) { return null; }
  return event.method === "Debugger.paused" ? "held" : "resolved";
}
