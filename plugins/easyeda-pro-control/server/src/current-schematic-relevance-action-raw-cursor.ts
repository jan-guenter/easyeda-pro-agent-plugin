/** Finite readonly request/reply state. The original owner keeps this cursor
 * private and supplies only its actual correlated Inspector replies. A copied
 * command cannot advance it. No action/setter/resume command exists. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_COUNT as COUNT, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_FIELDS as FIELDS } from "./current-schematic-relevance-action-raw-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SCRIPT, CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SOURCE, currentSchematicRelevanceRawArray, currentSchematicRelevanceRawArrayLength, currentSchematicRelevanceRawGuard, currentSchematicRelevanceRawHandle, currentSchematicRelevanceRawNativeConstructor, currentSchematicRelevanceRawProperties } from "./current-schematic-relevance-action-raw-replies.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_RAW_ORIGINAL_CURSOR"); } }
export interface CurrentSchematicRelevanceRawCapture {
  readonly nativeObjectId: string; readonly referencesObjectId: string; readonly objectsObjectId: string; readonly snapshotObjectId: string; readonly guardObjectId: string;
  readonly originalReferenceSlots: number; readonly prototypeDepth: 12; readonly originalRequests: 63; readonly encoderInvoked: false; readonly continuationAuthorized: false;
}
export class CurrentSchematicRelevanceRawCursor {
  readonly #frame: string; readonly #holder: string; #command: CurrentSchematicRelevanceDisplayModifyEntryCommand | null = null;
  #phase = "native-frame"; #index = 0; #requests = 0; #failed = false; #reserved = false; #roots: string | null = null; #rootIds: readonly (string | null)[] = [];
  readonly #prototypes: (string | null)[] = [null, null, null, null]; readonly #functions: (string | null)[] = Array.from({ length: FIELDS.length }, () => null);
  #native: string | null = null; #references: string | null = null; #related: string | null = null; #details: string | null = null; #objects: string | null = null;
  #relatedCount = 0; #detailsCount = 0; #objectCount = 0; readonly #layers: string[] = []; #snapshot: string | null = null; #guard: string | null = null; #script: string | null = null; #result: CurrentSchematicRelevanceRawCapture | null = null;
  public constructor(frame: string, holder: string) { this.#frame = handle.parse(frame); this.#holder = handle.parse(holder); Object.freeze(this); }
  static #id(value: string | null | undefined): string { need(value !== null && value !== undefined); return value; }
  static #call(phase: typeof CALLS[number][0], receiver: string, argumentsValue: readonly string[]): CurrentSchematicRelevanceDisplayModifyEntryCommand {
    const row = CALLS.find(item => item[0] === phase); need(row !== undefined); return validateCurrentSchematicRelevanceDisplayModifyEntryCommand({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row[1], arguments: argumentsValue.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } });
  }
  static #props(objectId: string): CurrentSchematicRelevanceDisplayModifyEntryCommand { return validateCurrentSchematicRelevanceDisplayModifyEntryCommand({ phase: "schematic-raw-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  public next(): CurrentSchematicRelevanceDisplayModifyEntryCommand | null {
    need(!this.#failed && !this.#reserved); if (this.#command !== null) { return this.#command; } if (this.#result !== null) { return null; }
    let command: CurrentSchematicRelevanceDisplayModifyEntryCommand;
    switch (this.#phase) {
      case "native-frame": { command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand({ phase: "schematic-raw-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: this.#frame, expression: CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } }); break; }
      case "root-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#roots)); break; }
      case "constructors": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#rootIds[this.#index])); break; }
      case "native-prototypes": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#prototypes[this.#index + 2])); break; }
      case "functions": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#functions[this.#index])); break; }
      case "native-bind": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-native", CurrentSchematicRelevanceRawCursor.#id(this.#roots), [...this.#prototypes.map(value => CurrentSchematicRelevanceRawCursor.#id(value)), ...this.#functions.map(value => CurrentSchematicRelevanceRawCursor.#id(value))]); break; }
      case "native-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#native)); break; }
      case "references": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-references", this.#holder, [CurrentSchematicRelevanceRawCursor.#id(this.#native)]); break; }
      case "references-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#references)); break; }
      case "related": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-related", CurrentSchematicRelevanceRawCursor.#id(this.#references), [CurrentSchematicRelevanceRawCursor.#id(this.#native)]); break; }
      case "related-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#related)); break; }
      case "details": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-detail", CurrentSchematicRelevanceRawCursor.#id(this.#related), [CurrentSchematicRelevanceRawCursor.#id(this.#native)]); break; }
      case "details-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#details)); break; }
      case "combine": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-combine", CurrentSchematicRelevanceRawCursor.#id(this.#references), [CurrentSchematicRelevanceRawCursor.#id(this.#native), CurrentSchematicRelevanceRawCursor.#id(this.#related), CurrentSchematicRelevanceRawCursor.#id(this.#details)]); break; }
      case "objects-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#objects)); break; }
      case "prototype": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-prototypes", this.#index === 0 ? CurrentSchematicRelevanceRawCursor.#id(this.#objects) : CurrentSchematicRelevanceRawCursor.#id(this.#layers[this.#index - 1]), [CurrentSchematicRelevanceRawCursor.#id(this.#native)]); break; }
      case "prototype-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#layers[this.#index])); break; }
      case "snapshot": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-snapshot", CurrentSchematicRelevanceRawCursor.#id(this.#objects), [CurrentSchematicRelevanceRawCursor.#id(this.#native), ...this.#layers]); break; }
      case "snapshot-array": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#snapshot)); break; }
      case "guard": { command = CurrentSchematicRelevanceRawCursor.#props(CurrentSchematicRelevanceRawCursor.#id(this.#guard)); break; }
      case "source": { command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand({ phase: "schematic-raw-source", method: "Debugger.getScriptSource", params: { scriptId: CurrentSchematicRelevanceRawCursor.#id(this.#script) } }); break; }
      case "same": { command = CurrentSchematicRelevanceRawCursor.#call("schematic-raw-same", CurrentSchematicRelevanceRawCursor.#id(this.#snapshot), [CurrentSchematicRelevanceRawCursor.#id(this.#native)]); break; }
      default: { throw new Error("SCHEMATIC_RELEVANCE_RAW_PHASE"); }
    }
    this.#command = command; return command;
  }
  static #capture(raw: unknown): string { const value = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string().regex(/^Array\((?:[1-9]|[1-8]\d|9[0-6])\)$/u), objectId: handle }) }).parse(captureCurrentPcbStringClockReply(raw).value); return value.result.objectId; }
  #functionsFrom(raw: unknown, root: number): void {
    const fields = currentSchematicRelevanceRawProperties(raw);
    for (const [index, row] of FIELDS.entries()) { if (row[0] === root) { const field = fields.get(row[1]); need(field !== undefined);
      if (row[2] === "value") { need(field.writable === true && !field.enumerable && field.configurable && field.get === undefined && field.set === undefined); }
      else { need(field.value === undefined && field.writable === undefined && !field.enumerable && field.configurable && field.set?.type === "undefined"); }
      this.#functions[index] = currentSchematicRelevanceRawHandle(row[2] === "value" ? field.value : field.get, "function");
    } }
  }
  public accept(command: CurrentSchematicRelevanceDisplayModifyEntryCommand, raw: unknown): void {
    need(!this.#failed && this.#reserved && command === this.#command);
    try {
      switch (this.#phase) {
        case "native-frame": { this.#roots = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 5); this.#phase = "root-array"; break; }
        case "root-array": { this.#rootIds = currentSchematicRelevanceRawArray(raw, 5, false, true); const fields = decodeCurrentFootprintCopyClockRpcV2Array(raw, 5); for (let i = 0; i < 5; i += 1) { need(fields.get(String(i))?.type === (i === 1 ? "object" : "function")); } this.#phase = "constructors"; this.#index = 0; break; }
        case "constructors": {
          const names = ["Object", null, "Array", "Map", "Set"] as const; const name = names[this.#index]; need(name !== undefined);
          if (name !== null) { const target = this.#index === 0 ? 0 : this.#index - 1; this.#prototypes[target] = currentSchematicRelevanceRawNativeConstructor(raw, name); }
          if (this.#index <= 2) { this.#functionsFrom(raw, this.#index); }
          this.#index += 1; if (this.#index === 5) { this.#phase = "native-prototypes"; this.#index = 0; } break;
        }
        case "native-prototypes": { this.#functionsFrom(raw, this.#index + 3); this.#index += 1; if (this.#index === 2) { this.#phase = "functions"; this.#index = 0; } break; }
        case "functions": { const row = FIELDS[this.#index]; need(row !== undefined); decodeCurrentNativeFunctionMetadata(raw, { name: row[2] === "get" ? `get ${row[1]}` : row[1], arity: row[3], constructor: false }); this.#index += 1; if (this.#index === FIELDS.length) { this.#phase = "native-bind"; } break; }
        case "native-bind": { this.#native = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 19); this.#phase = "native-array"; break; }
        case "native-array": { currentSchematicRelevanceRawArray(raw, 19, false, true); const fields = decodeCurrentFootprintCopyClockRpcV2Array(raw, 19); for (let i = 0; i < 19; i += 1) { need(fields.get(String(i))?.type === (i < 15 ? "function" : "object")); } this.#phase = "references"; break; }
        case "references": { this.#references = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, COUNT); this.#phase = "references-array"; break; }
        case "references-array": { currentSchematicRelevanceRawArray(raw, COUNT); this.#phase = "related"; break; }
        case "related": { this.#related = CurrentSchematicRelevanceRawCursor.#capture(raw); this.#phase = "related-array"; break; }
        case "related-array": { this.#relatedCount = currentSchematicRelevanceRawArrayLength(raw, 12, 32); currentSchematicRelevanceRawArray(raw, this.#relatedCount); this.#phase = "details"; break; }
        case "details": { this.#details = CurrentSchematicRelevanceRawCursor.#capture(raw); this.#phase = "details-array"; break; }
        case "details-array": { this.#detailsCount = currentSchematicRelevanceRawArrayLength(raw, 8, 32); currentSchematicRelevanceRawArray(raw, this.#detailsCount); this.#phase = "combine"; break; }
        case "combine": { this.#objects = CurrentSchematicRelevanceRawCursor.#capture(raw); this.#phase = "objects-array"; break; }
        case "objects-array": { this.#objectCount = COUNT + this.#relatedCount + this.#detailsCount; currentSchematicRelevanceRawArray(raw, this.#objectCount); this.#phase = "prototype"; this.#index = 0; break; }
        case "prototype": { this.#layers.push(decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, this.#objectCount)); this.#phase = "prototype-array"; break; }
        case "prototype-array": { const values = currentSchematicRelevanceRawArray(raw, this.#objectCount, true); this.#index += 1; if (this.#index === 12) { need(values.every(value => value === null)); this.#phase = "snapshot"; } else { this.#phase = "prototype"; } break; }
        case "snapshot": { this.#snapshot = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 2); this.#phase = "snapshot-array"; break; }
        case "snapshot-array": { const fields = decodeCurrentFootprintCopyClockRpcV2Array(raw, 2); currentSchematicRelevanceRawHandle(fields.get("0"), "object"); const guard = fields.get("1"); need(guard?.description === CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SOURCE); this.#guard = currentSchematicRelevanceRawHandle(guard, "function"); this.#phase = "guard"; break; }
        case "guard": { this.#script = currentSchematicRelevanceRawGuard(raw); this.#phase = "source"; break; }
        case "source": { need(captureCurrentSchematicDisplayAccessorSource(raw).scriptSource === CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SCRIPT); this.#phase = "same"; break; }
        case "same": { z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(captureCurrentPcbStringClockReply(raw).value); need(this.#requests === REQUESTS.rawObservation);
          this.#result = Object.freeze({ nativeObjectId: CurrentSchematicRelevanceRawCursor.#id(this.#native), referencesObjectId: CurrentSchematicRelevanceRawCursor.#id(this.#references), objectsObjectId: CurrentSchematicRelevanceRawCursor.#id(this.#objects), snapshotObjectId: CurrentSchematicRelevanceRawCursor.#id(this.#snapshot), guardObjectId: CurrentSchematicRelevanceRawCursor.#id(this.#guard), originalReferenceSlots: this.#objectCount, prototypeDepth: 12, originalRequests: 63, encoderInvoked: false, continuationAuthorized: false }); break; }
        default: { throw new Error("SCHEMATIC_RELEVANCE_RAW_REPLY_PHASE"); }
      }
      this.#command = null; this.#reserved = false;
    } catch (error) { this.#failed = true; throw error; }
  }
  public reserve(command: CurrentSchematicRelevanceDisplayModifyEntryCommand): void { need(!this.#failed && !this.#reserved && command === this.#command && this.#requests < REQUESTS.rawObservation); this.#reserved = true; this.#requests += 1; }
  public fail(): void { this.#failed = true; }
  public requireCompleted(): CurrentSchematicRelevanceRawCapture { need(!this.#failed && this.#result !== null && this.#command === null); return this.#result; }
}
