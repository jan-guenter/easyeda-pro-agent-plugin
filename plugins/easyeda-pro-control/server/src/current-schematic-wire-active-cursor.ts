/** Finite readonly collector at the actual held Wire callback entry. This
 * cursor returns data; only its original Core event owner may continue. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_REQUESTS as REQUESTS, validateCurrentSchematicWireWriterCommand } from "./current-schematic-wire-writer-protocol.ts";
import type { CurrentSchematicWireWriterCommand } from "./current-schematic-wire-writer-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES as ROLES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCE } from "./generated-schematic-display-action-source.ts";
import { decodeGeneratedSchematicDisplayActionActiveCallees, decodeGeneratedSchematicDisplayActionActiveOwners, decodeGeneratedSchematicDisplayActionFunction, requireGeneratedSchematicDisplayActionDescription } from "./generated-schematic-display-action-replies.ts";
import { decodeCurrentSchematicWireLexicalArray, decodeCurrentSchematicWireLexicalScopes } from "./current-schematic-wire-lexical-observer.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_ACTIVE_CURSOR"); } }
type Functions = ReturnType<typeof decodeGeneratedSchematicDisplayActionActiveCallees>;
type Owners = ReturnType<typeof decodeGeneratedSchematicDisplayActionActiveOwners>;
export interface CurrentSchematicWireActiveData {
  readonly profile: "private.current-schematic-wire-active-action-data.v1"; readonly originalArray: string;
  readonly functions: Functions; readonly owners: Owners; readonly requests: number;
  readonly recorderScopeRelationsMatched: true; readonly continuationAuthorized: false; readonly mutationAuthorized: false;
}
export class CurrentSchematicWireActiveCursor {
  readonly #holder: string; readonly #idle: string; readonly #target: string; readonly #operation: string; readonly #script: string; readonly #variant: 0 | 1;
  #phase = "active"; #index = 0; #scopeIndex = 0; #requests = 0; #reserved = false; #failed = false;
  #command: CurrentSchematicWireWriterCommand | null = null; #array: string | null = null; #functions: Functions | null = null; #owners: Owners | null = null;
  #scopes: string | null = null; #chain: readonly string[] = []; #scopeArray: string | null = null; #receiver: string | null = null; #result: CurrentSchematicWireActiveData | null = null;
  /** Retain source selectors only; construction grants no original ownership. */
  public constructor(holder: string, idle: string, targetJson: string, operationJson: string, scriptId: string, variant: 0 | 1) {
    this.#holder = handle.parse(holder); this.#idle = handle.parse(idle); this.#target = text.parse(targetJson); this.#operation = text.parse(operationJson); this.#script = handle.parse(scriptId); need(variant === 0 || variant === 1); this.#variant = variant; Object.freeze(this);
  }
  static #id(value: string | null | undefined): string { need(value !== null && value !== undefined); return value; }
  #call(phase: typeof CALLS[number][0], receiver: string, refs: readonly string[]): CurrentSchematicWireWriterCommand {
    const row = CALLS.find(item => item[0] === phase); need(row !== undefined && row[2] === refs.length);
    return validateCurrentSchematicWireWriterCommand({ phase, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row[1], arguments: [{ objectId: this.#holder }, { value: this.#target }, { value: this.#operation }, ...refs.map(objectId => ({ objectId }))], returnByValue: row[3], awaitPromise: false, userGesture: false } });
  }
  static #props(objectId: string): CurrentSchematicWireWriterCommand { return validateCurrentSchematicWireWriterCommand({ phase: "wire-raw-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  /** Return this same pending command until its original reply is accepted. */
  public next(): CurrentSchematicWireWriterCommand | null {
    need(!this.#failed && !this.#reserved); if (this.#command !== null) { return this.#command; } if (this.#result !== null) { return null; }
    let command: CurrentSchematicWireWriterCommand;
    switch (this.#phase) {
      case "active": { command = this.#call("wire-active-functions", this.#idle, []); break; }
      case "array": { command = CurrentSchematicWireActiveCursor.#props(CurrentSchematicWireActiveCursor.#id(this.#array)); break; }
      case "metadata": { need(this.#functions !== null); const role = ROLES[this.#index]; need(role !== undefined); command = CurrentSchematicWireActiveCursor.#props(this.#functions[role].objectId); break; }
      case "scopes": { command = CurrentSchematicWireActiveCursor.#props(CurrentSchematicWireActiveCursor.#id(this.#scopes)); break; }
      case "scope": { command = this.#call("wire-active-scope", CurrentSchematicWireActiveCursor.#id(this.#chain[this.#scopeIndex]), []); break; }
      case "scope-array": { command = CurrentSchematicWireActiveCursor.#props(CurrentSchematicWireActiveCursor.#id(this.#scopeArray)); break; }
      case "closure": { command = this.#call("wire-active-closure", CurrentSchematicWireActiveCursor.#id(this.#receiver), [this.#idle]); break; }
      case "same": { command = this.#call("wire-active-same", CurrentSchematicWireActiveCursor.#id(this.#array), [this.#idle]); break; }
      default: { throw new Error("SCHEMATIC_WIRE_ACTIVE_CURSOR_PHASE"); }
    }
    this.#command = command; return command;
  }
  #advance(): void { this.#index += 1; this.#scopes = null; this.#chain = []; this.#scopeIndex = 0; this.#scopeArray = null; this.#receiver = null; this.#phase = this.#index === ROLES.length ? "same" : "metadata"; }
  /** Consume the exact pending command object before native dispatch. */
  public reserve(command: CurrentSchematicWireWriterCommand): void { need(!this.#failed && !this.#reserved && this.#command !== null && command === this.#command && this.#requests < REQUESTS.normal); this.#reserved = true; this.#requests += 1; }
  /** Match the one reserved command; rejected evidence consumes the cursor. */
  public accept(command: CurrentSchematicWireWriterCommand, input: unknown): void {
    need(!this.#failed && this.#reserved && this.#command !== null && command === this.#command);
    try {
      const raw = captureCurrentPcbStringClockReply(input).value;
      switch (this.#phase) {
        case "active": { this.#array = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 11); this.#phase = "array"; break; }
        case "array": { this.#functions = decodeGeneratedSchematicDisplayActionActiveCallees(raw, this.#variant); this.#owners = decodeGeneratedSchematicDisplayActionActiveOwners(raw, this.#variant); this.#phase = "metadata"; break; }
        case "metadata": {
          const role = ROLES[this.#index]; need(role !== undefined && this.#functions !== null); requireGeneratedSchematicDisplayActionDescription(this.#functions[role].description, this.#variant, role);
          const result = decodeGeneratedSchematicDisplayActionFunction(raw, this.#variant, role, this.#script);
          if (SOURCE[this.#variant].methods[role].kind === "arrow") { this.#scopes = result.scopes; this.#phase = "scopes"; } else { this.#advance(); } break;
        }
        case "scopes": { this.#chain = decodeCurrentSchematicWireLexicalScopes(raw, false); this.#scopeIndex = 0; this.#phase = "scope"; break; }
        case "scope": { this.#scopeArray = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 2); this.#phase = "scope-array"; break; }
        case "scope-array": {
          const cells = decodeCurrentSchematicWireLexicalArray(raw, 2); const has = cells[0], value = cells[1];
          need(has?.type === "boolean" && typeof has.value === "boolean" && has.objectId === undefined && has.subtype === undefined && has.className === undefined && value !== undefined);
          if (has.value) { need(value.type === "object" && value.subtype === undefined && value.className === SOURCE[this.#variant].methods.historyConstructor.name && value.objectId !== undefined && value.value === undefined); this.#receiver = value.objectId; this.#phase = "closure"; }
          else { need(value.type === "undefined" && value.objectId === undefined && value.value === undefined); this.#scopeIndex += 1; need(this.#scopeIndex < this.#chain.length); this.#phase = "scope"; } break;
        }
        case "closure": { truth.parse(raw); this.#advance(); break; }
        case "same": { truth.parse(raw); need(this.#functions !== null && this.#owners !== null && this.#requests <= REQUESTS.normal);
          this.#result = Object.freeze({ profile: "private.current-schematic-wire-active-action-data.v1", originalArray: CurrentSchematicWireActiveCursor.#id(this.#array), functions: this.#functions, owners: this.#owners, requests: this.#requests, recorderScopeRelationsMatched: true, continuationAuthorized: false, mutationAuthorized: false }); break; }
        default: { throw new Error("SCHEMATIC_WIRE_ACTIVE_CURSOR_REPLY_PHASE"); }
      }
      this.#command = null; this.#reserved = false;
    } catch (error) { this.#failed = true; throw error; }
  }
  /** Return complete readonly data, without continuation or writer authority. */
  public requireCompleted(): CurrentSchematicWireActiveData { need(!this.#failed && !this.#reserved && this.#command === null && this.#result !== null); return this.#result; }
  /** Permanently reject further commands after the original owner fails. */
  public fail(): void { this.#failed = true; }
}
