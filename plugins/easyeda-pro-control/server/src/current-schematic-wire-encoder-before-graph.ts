/** Original before-graph binding for the private encoder peer reader.
 * The V5 dispatcher still needs a dedicated phase and helper-source owner. */
import { types } from "node:util";
import {
  decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture,
} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentSchematicRelevanceRawHandle } from "./current-schematic-relevance-action-raw-replies.ts";
import { requireOriginalCurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import type { CurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import { CurrentSchematicWireEncoderCheckpointReader } from "./current-schematic-wire-encoder-checkpoint.ts";
import type { CurrentSchematicWireEncoderPeerCheckpoint } from "./current-schematic-wire-encoder-checkpoint.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_BEFORE_GRAPH_PROGRAM as PROGRAM } from "./current-schematic-wire-encoder-programs.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET, currentSchematicWireEncoderSourceCommand,
} from "./current-schematic-wire-encoder-protocol.ts";
import type { CurrentSchematicWireEncoderCommand } from "./current-schematic-wire-encoder-protocol.ts";
import {
  currentSchematicWireEncoderScriptId as handle, qualifyCurrentSchematicWireEncoderSource, requireCurrentSchematicWireEncoderSourceCheckpoint,
} from "./current-schematic-wire-encoder-source.ts";
import type { CurrentSchematicWireEncoderSourceCheckpoint } from "./current-schematic-wire-encoder-source.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS } from "./current-schematic-wire-writer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const peers = CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET.peers;
const width = 1 + 3 * peers;

type CaptureCommand = Readonly<{
  phase: "wire-encoder-before-graph";
  method: "Runtime.callFunctionOn";
  params: typeof FLAGS & Readonly<{
    objectId: string;
    functionDeclaration: string;
    arguments: readonly [Readonly<{ objectId: string }>];
    returnByValue: false;
    awaitPromise: false;
    userGesture: false;
  }>;
}>;
type PropertiesCommand = Readonly<{
  phase: "wire-encoder-before-graph-properties";
  method: "Runtime.getProperties";
  params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }>;
}>;

function captureCommand(holder: string, native: string): CaptureCommand {
  return freezeDeep({
    phase: "wire-encoder-before-graph", method: "Runtime.callFunctionOn", params: {
      ...FLAGS, objectId: handle.parse(holder), functionDeclaration: PROGRAM,
      arguments: [{ objectId: handle.parse(native) }], returnByValue: false,
      awaitPromise: false, userGesture: false,
    },
  } as const);
}

function propertiesCommand(raw: unknown): PropertiesCommand {
  return freezeDeep({
    phase: "wire-encoder-before-graph-properties", method: "Runtime.getProperties", params: {
      objectId: decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, width),
      ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
    },
  } as const);
}

type SourceCommand = Extract<CurrentSchematicWireEncoderCommand, { phase: "wire-encoder-source" }>;
type PeerCommand = Extract<CurrentSchematicWireEncoderCommand, { phase: "wire-encoder-metadata" | "wire-encoder-compare" }>;
type HelperCommand = CaptureCommand | Extract<PeerCommand, { method: "Runtime.callFunctionOn" }>;

export interface CurrentSchematicWireEncoderBeforeGraphTransport {
  readonly pipe: object;
  readonly request: (command: CaptureCommand | PropertiesCommand | SourceCommand | PeerCommand) => Promise<unknown>;
  /** Join the generated script event and full exact helper source on this
   * original pending command before exposing its reply. */
  readonly qualifyHelper: (command: HelperCommand, reply: unknown) => Promise<void>;
}

interface OriginalBeforeGraph {
  readonly plan: CurrentSchematicWireEditPlan;
  readonly source: CurrentSchematicWireEncoderSourceCheckpoint;
  readonly holder: string;
  readonly native: string;
  readonly pipe: object;
  readonly assertCurrent: () => void;
  readonly assertOriginalExit: () => void;
}

function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_ENCODER_ORIGINAL_BEFORE_GRAPH"); }
}

function bindings(raw: unknown, holder: string, native: string): Readonly<{
  holder: string;
  native: string;
  graph: string;
  peers: readonly Readonly<{ row: string; prototype: string; functionRemote: unknown }>[];
}> {
  const fields = decodeCurrentFootprintCopyClockRpcV2Array(raw, width);
  const tuple = fields.get("0");
  need(tuple?.subtype === "array" && tuple.description === "Array(10)");
  const graph = currentSchematicRelevanceRawHandle(tuple, "object");
  const rows = Array.from({ length: peers }, (_, index) => {
    const offset = 1 + 3 * index;
    const row = currentSchematicRelevanceRawHandle(fields.get(String(offset)), "object");
    const prototype = currentSchematicRelevanceRawHandle(fields.get(String(offset + 1)), "object");
    const functionRemote = fields.get(String(offset + 2));
    currentSchematicRelevanceRawHandle(functionRemote, "function");
    return { row, prototype, functionRemote };
  });
  need(new Set(rows.map(row => row.row)).size === peers);
  return freezeDeep({ holder, native, graph, peers: rows });
}

/** A single preflight attempt reserves the exact mounted transport instance.
 * No native owner or dispatcher can be constructed through this object. */
export class CurrentSchematicWireEncoderBeforeGraphCursor {
  readonly #original: OriginalBeforeGraph;
  readonly #capture: CaptureCommand;
  #transport: CurrentSchematicWireEncoderBeforeGraphTransport | null = null;
  #pending: Promise<CurrentSchematicWireEncoderPeerCheckpoint> | null = null;
  #retirement: Promise<void> | null = null;

  public constructor(original: OriginalBeforeGraph) {
    this.#original = Object.freeze({ ...original });
    this.#capture = captureCommand(original.holder, original.native);
    Object.freeze(this);
  }

  public observe(transport: CurrentSchematicWireEncoderBeforeGraphTransport): Promise<CurrentSchematicWireEncoderPeerCheckpoint> {
    need(this.#retirement === null && !types.isProxy(transport) && Object.isFrozen(transport));
    need(Reflect.ownKeys(transport).length === 3 && Object.getOwnPropertyDescriptor(transport, "pipe")?.value === this.#original.pipe &&
      typeof Object.getOwnPropertyDescriptor(transport, "request")?.value === "function" &&
      typeof Object.getOwnPropertyDescriptor(transport, "qualifyHelper")?.value === "function");
    this.#original.assertCurrent();
    if (this.#pending !== null) {
      need(transport === this.#transport);
      return this.#pending;
    }
    this.#transport = transport;
    const { request, qualifyHelper } = transport;
    const { plan, source, holder, native } = this.#original;
    const current = (): void => {
      need(this.#retirement === null && transport.pipe === this.#original.pipe && transport.request === request &&
        transport.qualifyHelper === qualifyHelper);
      this.#original.assertCurrent();
      requireOriginalCurrentSchematicWireEditPlan(plan);
      requireCurrentSchematicWireEncoderSourceCheckpoint(source);
    };
    const send = async (command: CaptureCommand | PropertiesCommand | SourceCommand | PeerCommand): Promise<unknown> => {
      current();
      const raw = await request.call(transport, command);
      current();
      if (command.method === "Runtime.callFunctionOn") {
        await qualifyHelper.call(transport, command, raw);
        current();
      }
      return raw;
    };
    const ready = Promise.withResolvers<null>();
    this.#pending = (async (): Promise<CurrentSchematicWireEncoderPeerCheckpoint> => {
      await ready.promise;
      const captured = await send(this.#capture);
      const raw = await send(propertiesCommand(captured));
      const bound = bindings(raw, holder, native);
      const sourceCommand = currentSchematicWireEncoderSourceCommand(source.scriptId);
      need(sourceCommand.phase === "wire-encoder-source");
      const fresh = qualifyCurrentSchematicWireEncoderSource(source.scriptId, await send(sourceCommand));
      current();
      need(fresh.variant === source.variant);
      const reader = new CurrentSchematicWireEncoderCheckpointReader(plan, fresh, bound, Object.freeze({
        assertCurrent: current,
        request: (command: CurrentSchematicWireEncoderCommand): Promise<unknown> => {
          need(command.phase === "wire-encoder-metadata" || command.phase === "wire-encoder-compare" && command.role === "membership");
          return send(command);
        },
      }));
      return reader.observe();
    })();
    ready.resolve(null);
    return this.#pending;
  }

  /** The holder uses the writer's group. Retirement never issues a group
   * release or a request after the original owner's observed exit. */
  public retireAfterOriginalExit(): Promise<void> {
    if (this.#retirement !== null) { return this.#retirement; }
    this.#original.assertOriginalExit();
    this.#retirement = (async (): Promise<void> => {
      try { await this.#pending; } catch {
        // Preserve the original failure in the retained observation Promise.
      }
      this.#original.assertOriginalExit();
    })();
    return this.#retirement;
  }
}
