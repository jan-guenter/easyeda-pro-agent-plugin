/** Readonly comparison for the six persistent models of an original generated
 * Wire plan. The caller still has to hold and correlate the native transport,
 * graph handles and intrinsic tuple, plus the later natural encoding frames. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceRawHandle, currentSchematicRelevanceRawProperties } from "./current-schematic-relevance-action-raw-replies.ts";
import { requireOriginalCurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import type { CurrentSchematicWireEditPlan } from "./current-schematic-wire-edit-plan.ts";
import { compareCurrentSchematicWireEncoderFunction } from "./current-schematic-wire-encoder-metadata.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET, currentSchematicWireEncoderComparison, currentSchematicWireEncoderMetadataCommand,
} from "./current-schematic-wire-encoder-protocol.ts";
import type { CurrentSchematicWireEncoderCommand } from "./current-schematic-wire-encoder-protocol.ts";
import { currentSchematicWireEncoderScriptId as handle, requireCurrentSchematicWireEncoderSourceCheckpoint } from "./current-schematic-wire-encoder-source.ts";
import type { CurrentSchematicWireEncoderRole, CurrentSchematicWireEncoderSourceCheckpoint } from "./current-schematic-wire-encoder-source.ts";

const { peers: PEERS, normal: normalRequests } = CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET;
const peerSchema = z.strictObject({ row: handle, prototype: handle, functionRemote: z.unknown() });
const bindingsSchema = z.strictObject({
  holder: handle, native: handle, graph: handle,
  peers: z.array(peerSchema).length(PEERS),
});
const trueResult = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });

export interface CurrentSchematicWireEncoderCheckpointTransport {
  readonly request: (command: CurrentSchematicWireEncoderCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
}
export interface CurrentSchematicWireEncoderPeerCheckpoint {
  readonly schema: "private.schematic-wire-encoder-peer-checkpoint.v1";
  readonly operationId: string;
  readonly sourceMapMembershipCompared: true;
  readonly modelUploadDescriptorsCompared: 6;
  readonly normalRequests: 13;
  readonly originalNativeOwnerJoined: false;
  readonly naturalEncoderInvocationObserved: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_ENCODER_PEER_CHECKPOINT"); }
}
function plannedPeers(plan: CurrentSchematicWireEditPlan): ReadonlyMap<string, CurrentSchematicWireEncoderRole> {
  const { operation } = requireOriginalCurrentSchematicWireEditPlan(plan).argumentsValue;
  const roles = new Map<string, CurrentSchematicWireEncoderRole>([[operation.lineId, "lineUpload"]]);
  for (const peer of operation.peers) {
    if (peer.type !== "CANVAS") {
      need(!roles.has(peer.id));
      const role = ({
        TEXT: "textUpload", ATTR: "attributeUpload", WIRE: "groupUpload", BUS: "groupUpload", LINE: "lineUpload",
      } as const)[peer.type];
      roles.set(peer.id, role);
    }
  }
  need(roles.size === PEERS);
  return roles;
}

/** Retain only this comparison's original inputs and complete Promise. Timeout
 * or refusal consumes the reader; it cannot reissue even a readonly request. */
export class CurrentSchematicWireEncoderCheckpointReader {
  readonly #plan: CurrentSchematicWireEditPlan;
  readonly #source: CurrentSchematicWireEncoderSourceCheckpoint;
  readonly #transport: CurrentSchematicWireEncoderCheckpointTransport;
  readonly #assertCurrent: CurrentSchematicWireEncoderCheckpointTransport["assertCurrent"];
  readonly #request: CurrentSchematicWireEncoderCheckpointTransport["request"];
  readonly #bindings: z.infer<typeof bindingsSchema>;
  readonly #targets: ReadonlyMap<string, CurrentSchematicWireEncoderRole>;
  #pending: Promise<CurrentSchematicWireEncoderPeerCheckpoint> | null = null;
  #issued = 0;

  public constructor(plan: CurrentSchematicWireEditPlan, source: CurrentSchematicWireEncoderSourceCheckpoint,
    input: unknown, transport: CurrentSchematicWireEncoderCheckpointTransport) {
    this.#targets = plannedPeers(plan);
    requireCurrentSchematicWireEncoderSourceCheckpoint(source);
    this.#plan = plan; this.#source = source;
    this.#bindings = bindingsSchema.parse(capture(input).value);
    this.#transport = transport; this.#assertCurrent = transport.assertCurrent;
    this.#request = transport.request;
    Object.freeze(this);
  }

  #current(): void {
    requireOriginalCurrentSchematicWireEditPlan(this.#plan);
    requireCurrentSchematicWireEncoderSourceCheckpoint(this.#source);
    need(this.#transport.assertCurrent === this.#assertCurrent && this.#transport.request === this.#request);
    this.#assertCurrent.call(this.#transport);
  }

  async #read(command: CurrentSchematicWireEncoderCommand): Promise<unknown> {
    this.#current();
    need(this.#issued < normalRequests);
    this.#issued += 1;
    const reply = capture(await this.#request.call(this.#transport, command)).value;
    this.#current();
    return reply;
  }

  public observe(): Promise<CurrentSchematicWireEncoderPeerCheckpoint> {
    if (this.#pending !== null) { return this.#pending; }
    const gate = Promise.withResolvers<null>();
    this.#pending = (async (): Promise<CurrentSchematicWireEncoderPeerCheckpoint> => {
      await gate.promise;
      const { holder, native, graph, peers } = this.#bindings;
      const references = [native, graph];
      const seen = new Set<string>();
      for (const peer of peers) {
        const fields = currentSchematicRelevanceRawProperties(await this.#read(currentSchematicWireEncoderMetadataCommand(peer.row)));
        const id = fields.get("id")?.value;
        const model = currentSchematicRelevanceRawHandle(fields.get("model")?.value, "object");
        need(id?.type === "string" && typeof id.value === "string" && id.objectId === undefined && !seen.has(id.value));
        const role = this.#targets.get(id.value);
        need(role !== undefined);
        seen.add(id.value);
        // Compare identity in the same realm: a fresh Inspector descriptor
        // Can name the same object with a new ID.
        const remoteFunction = z.looseObject({ objectId: handle }).parse(peer.functionRemote);
        const method = compareCurrentSchematicWireEncoderFunction(this.#source, role,
          await this.#read(currentSchematicWireEncoderMetadataCommand(remoteFunction.objectId)), peer.functionRemote);
        references.push(peer.row, model, peer.prototype, method.objectId);
      }
      need(seen.size === this.#targets.size);
      const comparison = currentSchematicWireEncoderComparison("membership", holder, references);
      trueResult.parse(capture(await this.#read(comparison)).value);
      need(this.#issued === normalRequests);
      return Object.freeze({
        schema: "private.schematic-wire-encoder-peer-checkpoint.v1", operationId: this.#plan.operationId,
        sourceMapMembershipCompared: true, modelUploadDescriptorsCompared: PEERS, normalRequests,
        originalNativeOwnerJoined: false, naturalEncoderInvocationObserved: false, executionAuthorized: false, saveAuthorized: false,
      });
    })();
    gate.resolve(null);
    return this.#pending;
  }
}
