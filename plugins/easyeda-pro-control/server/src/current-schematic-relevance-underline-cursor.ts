/** Five original readonly prearm replies. The actual owner retains this
 * cursor; command copies, replays and supplied summaries cannot complete it. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_EXPRESSIONS as EXPRESSIONS, CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_PROGRAM as PROGRAM } from "./current-schematic-relevance-underline-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const field = z.strictObject({ name: z.string().min(1).max(128), value: remote, writable: z.literal(true), configurable: z.literal(true), enumerable: z.literal(true), isOwn: z.literal(true) });
const parentProperty = z.strictObject({ name: z.literal("[[Prototype]]"), value: remote });
const parentProperties = z.tuple([parentProperty]);
const properties = z.strictObject({ result: z.array(field).max(128), internalProperties: parentProperties });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_UNDERLINE_ORIGINAL"); } }
function object(input: z.infer<typeof remote> | undefined): string { need(input?.type === "object" && input.subtype === undefined && input.className === "Object" && input.objectId !== undefined && input.value === undefined); return input.objectId; }
export class CurrentSchematicRelevanceUnderlineCursor {
  readonly #frame: string; readonly #native: string; readonly #variant: 0 | 1;
  #step = 0; #failed = false; #reserved: Command | null = null; #command: Command | null = null; #tuple: string | null = null; #namespace: string | null = null; #map: string | null = null;
  public constructor(frame: string, native: string, variant: 0 | 1) { this.#frame = handle.parse(frame); this.#native = handle.parse(native); this.#variant = variant; Object.freeze(this); }
  public next(): Command | null {
    need(!this.#failed && this.#reserved === null); if (this.#step === 5) { return null; } if (this.#command !== null) { return this.#command; }
    let command: Command;
    if (this.#step === 0) { command = validate({ phase: this.#variant === 0 ? "schematic-underline-frame-main" : "schematic-underline-frame-child", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, expression: EXPRESSIONS[this.#variant], callFrameId: this.#frame, returnByValue: false, includeCommandLineAPI: false } }); }
    else if (this.#step < 4) { let id = this.#map; if (this.#step === 1) { id = this.#tuple; } else if (this.#step === 2) { id = this.#namespace; } need(id !== null); command = validate({ phase: "schematic-underline-properties", method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
    else { need(this.#namespace !== null && this.#map !== null); command = validate({ phase: "schematic-underline-proof", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#namespace, functionDeclaration: PROGRAM, arguments: [{ objectId: this.#native }, { objectId: this.#map }], returnByValue: true, awaitPromise: false, userGesture: false } }); }
    this.#command = command; return command;
  }
  public reserve(command: Command): void { need(!this.#failed && this.#reserved === null && this.next() === command); this.#reserved = command; }
  public accept(command: Command, raw: unknown): void {
    need(!this.#failed && this.#reserved === command && this.#command === command);
    try {
      if (this.#step === 0) { this.#tuple = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 1); }
      else if (this.#step === 1) { const fields = decodeCurrentFootprintCopyClockRpcV2Array(raw, 1); const value = fields.get("0"); need(value?.type === "object" && value.subtype === undefined && value.className === "Object" && value.objectId !== undefined); this.#namespace = value.objectId; }
      else if (this.#step === 2) {
        const value = properties.parse(captureCurrentPcbStringClockReply(raw).value); object(value.internalProperties[0].value); const fields = new Map(value.result.map(item => [item.name, item.value]));
        need(fields.size === 3 && value.result.length === 3 && fields.get("isConstructFromShapeManager")?.type === "boolean" && fields.get("isConstructFromShapeManager")?.value === false); object(fields.get("isConstructFromDecompress")); this.#map = object(fields.get("bboxAttributes"));
      } else if (this.#step === 3) {
        const value = properties.parse(captureCurrentPcbStringClockReply(raw).value); object(value.internalProperties[0].value); const names = new Set(value.result.map(item => item.name)); need(names.size === value.result.length && !names.has("underline"));
        for (const item of value.result) { need(item.value.type === "boolean" && item.value.value === true && item.value.objectId === undefined); }
      } else { z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(captureCurrentPcbStringClockReply(raw).value); }
      this.#step += 1; this.#reserved = null; this.#command = null;
    } catch (error) { this.#failed = true; throw error; }
  }
  public requireCompleted(): void { need(!this.#failed && this.#step === 5 && this.#reserved === null && this.#command === null); }
  public fail(): void { this.#failed = true; }
}
